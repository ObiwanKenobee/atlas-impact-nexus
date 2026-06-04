import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, FileText, MapPin, Radio, Upload, Users, Video } from "lucide-react";
import { useState } from "react";
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

  function useMyLocation() {
    if (!navigator.geolocation) return toast.error("Geolocation unavailable");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        toast.success("Captured current location");
      },
      (err) => toast.error(err.message),
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!projectId) return toast.error("Pick a project to link this evidence to");
    if (!title.trim()) return toast.error("Add a title");

    let media_url: string | null = null;
    let iot_payload: Record<string, unknown> | null = null;

    if (kind === "PHOTO" || kind === "VIDEO") {
      if (!file) return toast.error("Choose a file to upload");
      const max = kind === "PHOTO" ? 20 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > max) return toast.error(`File too large (max ${max / 1024 / 1024}MB)`);
    }
    if (kind === "IoT") {
      try {
        iot_payload = JSON.parse(iotJson);
      } catch {
        return toast.error("IoT payload must be valid JSON");
      }
    }
    if (kind === "REPORT" && !reportText.trim()) return toast.error("Write a field report");
    if (kind === "GPS" && (!lat || !lng)) return toast.error("Capture or enter coordinates");

    setBusy(true);
    try {
      if (file) {
        setProgress("Uploading media…");
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("evidence-media")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        media_url = path;
      }
      setProgress("Recording on ledger…");
      const { id } = await create({
        data: {
          project_id: projectId,
          kind,
          title: title.trim(),
          meta: meta.trim() || null,
          lat: lat ? Number(lat) : null,
          lng: lng ? Number(lng) : null,
          media_url,
          iot_payload,
          report_text: kind === "REPORT" ? reportText.trim() : null,
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
                    onClick={() => setKind(k.id)}
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
          </aside>

          <div className="space-y-5 rounded-2xl bg-card p-8 ring-1 ring-ink/5">
            <Field label="Project link (required)">
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
              >
                <option value="">Choose a project…</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} · {p.location}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Title">
              <input
                required
                maxLength={160}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Solar pump install verified at Well #4"
                className="w-full rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
              />
            </Field>

            <Field label="Short context (optional)">
              <input
                maxLength={280}
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                placeholder="12 images · Turkana field team"
                className="w-full rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
              />
            </Field>

            {(kind === "GPS" || kind === "PHOTO" || kind === "VIDEO") && (
              <Field label="Coordinates">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitude"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-40 rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitude"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-40 rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
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

            {(kind === "PHOTO" || kind === "VIDEO") && (
              <Field label={kind === "PHOTO" ? "Photo file" : "Video file"}>
                <input
                  type="file"
                  accept={kind === "PHOTO" ? "image/*" : "video/*"}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-ink/75 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sand hover:file:bg-moss"
                />
              </Field>
            )}

            {kind === "IoT" && (
              <Field label="Sensor JSON payload">
                <textarea
                  rows={6}
                  value={iotJson}
                  onChange={(e) => setIotJson(e.target.value)}
                  className="w-full rounded-xl bg-sand-deep px-4 py-3 font-mono text-xs ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
                />
              </Field>
            )}

            {kind === "REPORT" && (
              <Field label="Field report">
                <textarea
                  rows={8}
                  maxLength={8000}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Observations, beneficiary count, conditions, follow-ups…"
                  className="w-full rounded-xl bg-sand-deep px-4 py-3 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
                />
              </Field>
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
                {busy ? progress || "Submitting…" : "Submit to ledger"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink/50">
        {label}
      </span>
      {children}
    </label>
  );
}
