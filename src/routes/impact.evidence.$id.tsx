import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, ExternalLink, FileText, MapPin, Radio, Users, Video } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { evidenceOneQuery, projectsQuery } from "@/lib/atlas-queries";
import type { EvidenceKind } from "@/lib/atlas-types";
import { relativeTime } from "@/lib/exports";

export const Route = createFileRoute("/impact/evidence/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Evidence ${params.id.slice(0, 8)} — Atlas Sanctum` },
      { name: "description", content: "A single verification entry on the Atlas Sanctum ledger." },
    ],
  }),
  component: EvidenceDetail,
});

const iconFor: Record<EvidenceKind, typeof MapPin> = {
  GPS: MapPin,
  IoT: Radio,
  PHOTO: Camera,
  VIDEO: Video,
  REPORT: FileText,
  BENEFICIARY: Users,
};

function EvidenceDetail() {
  const { id } = Route.useParams();
  const { data: evidence, isLoading } = useQuery(evidenceOneQuery(id));
  const { data: projects } = useQuery(projectsQuery);

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-ink/55">Loading…</div>
      </PageShell>
    );
  }

  if (!evidence) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-mono text-xs uppercase text-earth">Not found</p>
          <h1 className="mt-3 font-serif text-3xl">Evidence entry missing</h1>
          <Link to="/impact" className="mt-6 inline-block text-sm text-moss underline">
            Back to verification feed
          </Link>
        </div>
      </PageShell>
    );
  }

  const Icon = iconFor[evidence.kind];
  const project = projects?.find((p) => p.id === evidence.project_id);

  return (
    <PageShell>
      <section className="border-b border-ink/5 bg-sand-deep/50">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link to="/impact" className="inline-flex items-center gap-1.5 font-mono text-xs text-ink/55 hover:text-moss">
            <ArrowLeft className="size-3.5" /> Verification feed
          </Link>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-moss-soft text-moss">
                <Icon className="size-4" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-moss">
                  {evidence.kind}
                </p>
                <p className="font-mono text-[11px] text-ink/45">
                  {relativeTime(evidence.captured_at)} · captured {new Date(evidence.captured_at).toLocaleString()}
                </p>
              </div>
            </div>
            <h1 className="mt-5 font-serif text-3xl md:text-4xl">{evidence.title}</h1>
            {evidence.meta && (
              <p className="mt-3 text-sm text-ink/70">{evidence.meta}</p>
            )}

            <div className="mt-8 space-y-6">
              {evidence.lat != null && evidence.lng != null && (
                <Panel label="Coordinates">
                  <p className="font-mono text-sm tabular-nums">
                    {evidence.lat.toFixed(6)}°, {evidence.lng.toFixed(6)}°
                  </p>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${evidence.lat}&mlon=${evidence.lng}#map=14/${evidence.lat}/${evidence.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-moss hover:underline"
                  >
                    Open on map <ExternalLink className="size-3" />
                  </a>
                </Panel>
              )}

              {evidence.media_signed_url && (
                <Panel label={evidence.kind === "VIDEO" ? "Video" : "Media"}>
                  {evidence.kind === "VIDEO" ? (
                    <video
                      src={evidence.media_signed_url}
                      controls
                      className="aspect-video w-full rounded-lg bg-ink"
                    />
                  ) : (
                    <img
                      src={evidence.media_signed_url}
                      alt={evidence.title}
                      className="w-full rounded-lg"
                    />
                  )}
                </Panel>
              )}

              {evidence.iot_payload && (
                <Panel label="IoT payload">
                  <pre className="overflow-x-auto rounded-lg bg-ink p-4 font-mono text-xs text-sand">
                    {JSON.stringify(evidence.iot_payload, null, 2)}
                  </pre>
                </Panel>
              )}

              {evidence.report_text && (
                <Panel label="Field report">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                    {evidence.report_text}
                  </p>
                </Panel>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            {project && (
              <div className="rounded-2xl bg-card p-5 ring-1 ring-ink/5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                  Linked project
                </p>
                <Link
                  to="/projects/$id"
                  params={{ id: project.slug }}
                  className="mt-2 block font-serif text-lg font-medium hover:text-moss"
                >
                  {project.title}
                </Link>
                <p className="mt-1 font-mono text-[11px] text-ink/45">{project.location}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-mono text-ink/55">Verified</span>
                  <span className="font-mono font-semibold text-moss">{project.verified_score}%</span>
                </div>
              </div>
            )}
            <div className="rounded-2xl bg-ink p-5 text-sand">
              <p className="font-mono text-[10px] uppercase tracking-widest text-sand/50">Ledger entry</p>
              <p className="mt-2 break-all font-mono text-[11px] text-sand/70">{evidence.id}</p>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-6 ring-1 ring-ink/5">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/50">{label}</p>
      {children}
    </div>
  );
}
