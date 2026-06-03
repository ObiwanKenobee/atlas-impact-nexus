
-- Fix security definer view warning
ALTER VIEW public.project_trust_breakdown SET (security_invoker = on);

-- Restrict security-definer functions to intended audiences
REVOKE EXECUTE ON FUNCTION public.fund_project(text,bigint,text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies for evidence-media bucket
CREATE POLICY "evidence media public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'evidence-media');

CREATE POLICY "evidence media authed insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'evidence-media' AND owner = auth.uid());

CREATE POLICY "evidence media owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'evidence-media' AND owner = auth.uid());

CREATE POLICY "evidence media owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'evidence-media' AND owner = auth.uid());
