import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, FileText, MapPin, Radio, Upload, Users, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageShell, PageHeader } from "@/components/PageShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { projectsQuery, qk } from "@/lib/atlas-queries";
import { createEvidence } from "@/lib/atlas.functions";
import type { EvidenceKind } from "@/lib/atlas-types";

export const Route = createFileRoute("/_authenticated/impact/upload")({
  head: () => ({
    meta: [
      { title: "Upload Evidence — Atlas Sanctum" },
      { name: "description", content: "Submit GPS coordinates, photos, videos, IoT readings or field reports to the impact verification ledger." },
    ],
  }),
  component: UploadEvidence,
});

const kinds: { id: EvidenceKind; label: string; icon: typeof MapPin; desc: string }[] = [
  { id: "GPS", label: "GPS check-in", icon: MapPin, desc: "Field-team coordinates" },
  { id: "PHOTO", label: "Photo", icon: Camera, desc: "Project image (≤20MB)" },
  { id: "VIDEO", label: "Video", icon: Video, desc: "Testimony or site clip (≤50MB)" },
  { id: "IoT", label: "IoT reading", icon: Radio, desc: "Sensor JSON payload" },
  { id: "REPORT", label: "Field report", icon: FileText, desc: "Written narrative or audit" },
  { id: "BENEFICIARY", label: "Beneficiary ack.", icon: Users, desc: "Recipient acknowledgement" },
];

type Template = {
  id: string;
  label: string;
  kind: EvidenceKind;
  title: string;
  meta?: string;
  reportText?: string;
  iotJson?: string;
  gps?: { lat: string; lng: string };
  hint: string;
};

const templates: Template[] = [
  {
    id: "tpl-gps",
    label: "GPS site check-in",
    kind: "GPS",
    title: "Field-team check-in at project site",
    meta: "Coordinates captured at install point",
    gps: { lat: "3.119000", lng: "35.597000" },
    hint: "Prefills a GPS check-in. Tap “Use my location” to overwrite.",
  },
  {
    id: "tpl-photo",
    label: "Install photo",
    kind: "PHOTO",
    title: "Solar pump install photo · Well #4",
    meta: "Single JPG, taken on completion day",
    hint: "Prefills a photo entry — attach a JPG/PNG up to 20MB.",
  },
  {
    id: "tpl-video",
    label: "Beneficiary video testimony",
    kind: "VIDEO",
    title: "Beneficiary testimony · 30s clip",
    meta: "MP4 testimonial captured on phone",
    hint: "Prefills a video entry — attach a clip up to 50MB.",
  },
  {
    id: "tpl-iot",
    label: "IoT pump reading",
    kind: "IoT",
    title: "Daily pump throughput · litres/day",
    meta: "Sensor pings every 6h, aggregated daily",
    iotJson: JSON.stringify(
      { sensor: "pump-04", value: 4210, unit: "L/day", battery: 0.82 },
      null,
      2,
    ),
    hint: "Prefills a valid IoT JSON payload — edit numbers to match your reading.",
  },
  {
    id: "tpl-report",
    label: "Field report (audit)",
    kind: "REPORT",
    title: "Weekly field report · install verified",
    meta: "Authored by field lead",
    reportText:
      "Site visited on the install date. Team confirmed the pump is operational, beneficiaries acknowledged delivery, and no follow-up issues were observed. Photographs and GPS coordinates were logged separately.",
    hint: "Prefills a narrative field report — edit the body before submitting.",
  },
  {
    id: "tpl-beneficiary",
    label: "Beneficiary ack.",
    kind: "BENEFICIARY",
    title: "Beneficiary acknowledgement · cohort",
    meta: "Group of 12 households",
    reportText:
      "Cohort of households acknowledged receipt of clean water access. Names, signatures and photos are filed locally with the field team.",
    hint: "Prefills a beneficiary acknowledgement — edit the cohort details before submitting.",
  },
];

type Errors = Partial<
  Record<"projectId" | "title" | "file" | "iot" | "report" | "gps", string>
>;

function UploadEvidence() {
  const { user } = useAuth();
  const { data: projects } = useQuery(projectsQuery);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createEvidence);

  const [kind, setKind] = useState<EvidenceKind>("GPS");
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [iotJson, setIotJson] = useState('{"sensor":"pump","value":4210,"unit":"L/day"}');
  const [reportText, setReportText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const needsFile = kind === "PHOTO" || kind === "VIDEO";
  const needsGps = kind === "GPS";
  const needsIot = kind === "IoT";
  const needsReport = kind === "REPORT" || kind === "BENEFICIARY";

  const iotPreview = useMemo(() => {
    if (!needsIot) return { ok: true as const };
    try {
      JSON.parse(iotJson);
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, msg: e instanceof Error ? e.message : "invalid JSON" };
    }
  }, [iotJson, needsIot]);

  function useMyLocation() {
    if (!navigator.geolocation) return toast.error("Geolocation unavailable");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setErrors((e) => ({ ...e, gps: undefined }));
        toast.success("Captured current location");
      },
      (err) => toast.error(err.message),
    );
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!projectId) e.projectId = "Pick a project to link this evidence to.";
    if (!title.trim()) e.title = "Add a short title (≤160 chars).";
    if (needsFile && !file) e.file = `Attach a ${kind === "PHOTO" ? "photo" : "video"} file.`;
    if (needsFile && file) {
      const max = kind === "PHOTO" ? 20 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > max) e.file = `File too large — max ${max / 1024 / 1024}MB.`;
    }
    if (needsGps && (!lat || !lng)) e.gps = "Capture or enter both latitude and longitude.";
    if (needsIot && !iotPreview.ok) e.iot = `Invalid JSON: ${iotPreview.msg}`;
    if (needsReport && !reportText.trim()) e.report = "Write the field report narrative.";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user) return;
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) {
      toast.error("Fix the highlighted fields and resubmit.");
      return;
    }

    setBusy(true);
    try {
      let media_url: string | null = null;
      if (file) {
        setProgress(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)…`);
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("evidence-media")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        media_url = path;
      }
      setProgress("Signing entry & recording on ledger…");
      const { id } = await create({
        data: {
          project_id: projectId,
          kind,
          title: title.trim(),
          meta: meta.trim() || null,
          lat: lat ? Number(lat) : null,
          lng: lng ? Number(lng) : null,
          media_url,
          iot_payload: needsIot ? JSON.parse(iotJson) : null,
          report_text: needsReport ? reportText.trim() : null,
          captured_at: new Date().toISOString(),
        },
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: qk.evidence }),
        qc.invalidateQueries({ queryKey: qk.trust }),
      ]);
      toast.success("Evidence recorded on ledger");
      navigate({ to: "/impact/evidence/$id", params: { id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Field workers"
        title="Submit evidence to the ledger."
        description="GPS, photos, videos, IoT telemetry and field reports — all linked to a specific project and signed by you."
      />
      <section className="px-6 py-12">
        <form
          onSubmit={submit}
          noValidate
          className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[260px_1fr]"
        >
          <aside>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/50">
              Evidence kind
            </p>
            <div className="flex flex-col gap-1.5">
              {kinds.map((k) => {
                const active = kind === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => {
                      setKind(k.id);
                      setErrors({});
                    }}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left ring-1 transition-colors ${
                      active
                        ? "bg-ink text-sand ring-ink"
                        : "bg-card text-ink/75 ring-ink/5 hover:bg-sand-deep"
                    }`}
                  >
                    <k.icon className="size-4" />
                    <div>
                      <p className="text-sm font-medium">{k.label}</p>
                      <p className={`font-mono text-[10px] ${active ? "text-sand/60" : "text-ink/45"}`}>
                        {k.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 rounded-xl bg-sand-deep/60 p-3 font-mono text-[10px] leading-relaxed text-ink/55">
              Each entry is signed by your account, time-stamped, and pinned to a project. Trust score
              recomputes immediately after submit.
            </p>

            <p className="mt-6 mb-2 font-mono text-[10px] uppercase tracking-widest text-ink/50">
              One-click templates
            </p>
            <div className="flex flex-col gap-1.5">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setKind(t.kind);
                    setTitle(t.title);
                    setMeta(t.meta ?? "");
                    if (t.gps) {
                      setLat(t.gps.lat);
                      setLng(t.gps.lng);
                    }
                    if (t.iotJson) setIotJson(t.iotJson);
                    if (t.reportText) setReportText(t.reportText);
                    setErrors({});
                  }}
                  title={t.hint}
                  className="rounded-lg border border-ink/5 bg-sand px-3 py-2 text-left text-xs text-ink/75 hover:bg-sand-deep"
                >
                  <span className="font-medium text-ink">{t.label}</span>
                  <span className="ml-1 font-mono text-[10px] text-ink/45">{t.kind}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-5 rounded-2xl bg-card p-8 ring-1 ring-ink/5">
            <Field label="Project link" required error={errors.projectId}>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setErrors((x) => ({ ...x, projectId: undefined }));
                }}
                aria-invalid={!!errors.projectId}
                className={`w-full rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 focus:outline-none focus:ring-moss ${
                  errors.projectId ? "ring-earth" : "ring-ink/5"
                }`}
              >
                <option value="">Choose a project…</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} · {p.location}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Title" required error={errors.title} hint={`${title.length}/160`}>
              <input
                maxLength={160}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((x) => ({ ...x, title: undefined }));
                }}
                aria-invalid={!!errors.title}
                placeholder="Solar pump install verified at Well #4"
                className={`w-full rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 focus:outline-none focus:ring-moss ${
                  errors.title ? "ring-earth" : "ring-ink/5"
                }`}
              />
            </Field>

            <Field label="Short context (optional)" hint={`${meta.length}/280`}>
              <input
                maxLength={280}
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                placeholder="12 images · Turkana field team"
                className="w-full rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
              />
            </Field>

            {(needsGps || needsFile) && (
              <Field
                label="Coordinates"
                required={needsGps}
                error={errors.gps}
                hint="Decimal degrees, WGS84."
              >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitude (-90 to 90)"
                    value={lat}
                    onChange={(e) => {
                      setLat(e.target.value);
                      setErrors((x) => ({ ...x, gps: undefined }));
                    }}
                    className="w-48 rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitude (-180 to 180)"
                    value={lng}
                    onChange={(e) => {
                      setLng(e.target.value);
                      setErrors((x) => ({ ...x, gps: undefined }));
                    }}
                    className="w-48 rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
                  />
                  <button
                    type="button"
                    onClick={useMyLocation}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs hover:bg-sand-deep"
                  >
                    <MapPin className="size-3.5" /> Use my location
                  </button>
                </div>
              </Field>
            )}

            {needsFile && (
              <Field
                label={kind === "PHOTO" ? "Photo file" : "Video file"}
                required
                error={errors.file}
                hint={
                  file
                    ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)}MB`
                    : kind === "PHOTO"
                      ? "JPG/PNG/WebP up to 20MB."
                      : "MP4/MOV up to 50MB."
                }
              >
                <input
                  type="file"
                  accept={kind === "PHOTO" ? "image/*" : "video/*"}
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setErrors((x) => ({ ...x, file: undefined }));
                  }}
                  className="block w-full text-sm text-ink/75 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sand hover:file:bg-moss"
                />
              </Field>
            )}

            {needsIot && (
              <Field
                label="Sensor JSON payload"
                required
                error={errors.iot}
                hint={iotPreview.ok ? "Valid JSON ✓" : "Use double-quoted keys & values."}
              >
                <textarea
                  rows={6}
                  value={iotJson}
                  onChange={(e) => {
                    setIotJson(e.target.value);
                    setErrors((x) => ({ ...x, iot: undefined }));
                  }}
                  aria-invalid={!iotPreview.ok}
                  className={`w-full rounded-xl bg-sand-deep px-4 py-3 font-mono text-xs ring-1 focus:outline-none focus:ring-moss ${
                    iotPreview.ok ? "ring-ink/5" : "ring-earth"
                  }`}
                />
              </Field>
            )}

            {needsReport && (
              <Field
                label="Field report"
                required
                error={errors.report}
                hint={`${reportText.length}/8000`}
              >
                <textarea
                  rows={8}
                  maxLength={8000}
                  value={reportText}
                  onChange={(e) => {
                    setReportText(e.target.value);
                    setErrors((x) => ({ ...x, report: undefined }));
                  }}
                  aria-invalid={!!errors.report}
                  placeholder="Observations, beneficiary count, conditions, follow-ups…"
                  className={`w-full rounded-xl bg-sand-deep px-4 py-3 text-sm ring-1 focus:outline-none focus:ring-moss ${
                    errors.report ? "ring-earth" : "ring-ink/5"
                  }`}
                />
              </Field>
            )}

            {progress && (
              <div className="rounded-xl bg-moss-soft/60 px-4 py-3">
                <p className="flex items-center gap-2 font-mono text-[11px] text-moss">
                  <span className="size-1.5 animate-pulse rounded-full bg-moss" />
                  {progress}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Link to="/impact" className="text-xs text-ink/55 hover:text-ink">
                ← Back to verification feed
              </Link>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-sand hover:bg-moss disabled:opacity-60"
              >
                <Upload className="size-4" />
                {busy ? "Submitting…" : "Submit to ledger"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/50">
        <span>
          {label}
          {required && <span className="ml-1 text-earth">*</span>}
        </span>
        {hint && !error && <span className="normal-case tracking-normal text-ink/40">{hint}</span>}
      </span>
      {children}
      {error && <p className="mt-1.5 font-mono text-[11px] text-earth">{error}</p>}
    </label>
  );
}
