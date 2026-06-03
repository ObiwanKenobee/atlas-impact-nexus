
-- Enums
CREATE TYPE public.evidence_kind AS ENUM ('GPS','IoT','PHOTO','VIDEO','REPORT','BENEFICIARY');
CREATE TYPE public.app_role AS ENUM ('donor','field_worker','community_leader','admin');

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  role public.app_role NOT NULL DEFAULT 'donor',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Communities
CREATE TABLE public.communities (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  region text NOT NULL,
  population int NOT NULL DEFAULT 0,
  score int NOT NULL DEFAULT 0,
  needs text,
  overview text,
  economy jsonb NOT NULL DEFAULT '{}',
  environment jsonb NOT NULL DEFAULT '{}',
  reports jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.communities TO anon, authenticated;
GRANT ALL ON public.communities TO service_role;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "communities readable" ON public.communities FOR SELECT USING (true);

-- Projects
CREATE TABLE public.projects (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  community_id text NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  location text NOT NULL,
  description text NOT NULL,
  long_description text,
  image_key text,
  goal_cents bigint NOT NULL DEFAULT 0,
  raised_cents bigint NOT NULL DEFAULT 0,
  donors int NOT NULL DEFAULT 0,
  beneficiaries int NOT NULL DEFAULT 0,
  verified_score int NOT NULL DEFAULT 0,
  started_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects readable" ON public.projects FOR SELECT USING (true);

-- Evidence
CREATE TABLE public.evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  uploader_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind public.evidence_kind NOT NULL,
  title text NOT NULL,
  meta text,
  lat double precision,
  lng double precision,
  media_url text,
  iot_payload jsonb,
  report_text text,
  captured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX evidence_project_idx ON public.evidence(project_id);
CREATE INDEX evidence_kind_idx ON public.evidence(kind);
CREATE INDEX evidence_created_idx ON public.evidence(created_at DESC);
GRANT SELECT ON public.evidence TO anon, authenticated;
GRANT INSERT, UPDATE ON public.evidence TO authenticated;
GRANT ALL ON public.evidence TO service_role;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evidence readable" ON public.evidence FOR SELECT USING (true);
CREATE POLICY "evidence insert by auth" ON public.evidence FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "evidence update own" ON public.evidence FOR UPDATE TO authenticated USING (auth.uid() = uploader_id);

-- Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  donor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name text,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  receipt_number text NOT NULL UNIQUE DEFAULT ('ATL-' || to_char(now(),'YYYYMMDD') || '-' || substr(md5(random()::text),1,6)),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX transactions_project_idx ON public.transactions(project_id);
CREATE INDEX transactions_donor_idx ON public.transactions(donor_id);
GRANT SELECT ON public.transactions TO anon, authenticated;
GRANT INSERT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions readable" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "transactions own insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);

-- Funding RPC: atomic insert transaction + bump project totals + add ledger evidence
CREATE OR REPLACE FUNCTION public.fund_project(_project_id text, _amount_cents bigint, _donor_name text DEFAULT NULL)
RETURNS public.transactions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tx public.transactions;
  _uid uuid := auth.uid();
  _project public.projects;
  _added_beneficiaries int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _amount_cents <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  SELECT * INTO _project FROM public.projects WHERE id = _project_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'project_not_found'; END IF;

  INSERT INTO public.transactions(project_id, donor_id, donor_name, amount_cents)
  VALUES (_project_id, _uid, _donor_name, _amount_cents)
  RETURNING * INTO _tx;

  _added_beneficiaries := GREATEST(1, (_amount_cents / 2000)::int);

  UPDATE public.projects
  SET raised_cents = LEAST(goal_cents, raised_cents + _amount_cents),
      donors = donors + 1,
      beneficiaries = beneficiaries + _added_beneficiaries
  WHERE id = _project_id;

  INSERT INTO public.evidence(project_id, uploader_id, kind, title, meta, report_text)
  VALUES (
    _project_id, _uid, 'REPORT',
    'Donation of $' || (_amount_cents/100)::text || ' received',
    'Ledger entry · receipt ' || _tx.receipt_number,
    'Donor ' || COALESCE(_donor_name, 'anonymous') || ' contributed $' || (_amount_cents/100)::text || ' toward ' || _project.title || '. Reach increased by ' || _added_beneficiaries || ' beneficiaries.'
  );

  RETURN _tx;
END;
$$;
GRANT EXECUTE ON FUNCTION public.fund_project(text,bigint,text) TO authenticated;

-- Trust breakdown view
CREATE OR REPLACE VIEW public.project_trust_breakdown AS
SELECT
  p.id AS project_id,
  COUNT(*) FILTER (WHERE e.kind = 'GPS') AS gps_count,
  COUNT(*) FILTER (WHERE e.kind IN ('PHOTO','VIDEO','IoT')) AS media_count,
  COUNT(*) FILTER (WHERE e.kind = 'BENEFICIARY') AS beneficiary_count,
  COUNT(*) FILTER (WHERE e.kind = 'REPORT') AS report_count,
  LEAST(28, COUNT(*) FILTER (WHERE e.kind = 'GPS') * 4) AS gps_points,
  LEAST(22, COUNT(*) FILTER (WHERE e.kind IN ('PHOTO','VIDEO','IoT')) * 3) AS media_points,
  LEAST(26, COUNT(*) FILTER (WHERE e.kind = 'BENEFICIARY') * 5) AS beneficiary_points,
  LEAST(24, COUNT(*) FILTER (WHERE e.kind = 'REPORT') * 6) AS report_points
FROM public.projects p
LEFT JOIN public.evidence e ON e.project_id = p.id
GROUP BY p.id;
GRANT SELECT ON public.project_trust_breakdown TO anon, authenticated, service_role;
