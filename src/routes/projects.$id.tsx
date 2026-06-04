import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Camera, Download, FileText, MapPin, Radio, Users, Video } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SupportDialog } from "@/components/SupportDialog";
import { TrustBreakdown } from "@/components/TrustBreakdown";
import { communitiesQuery, evidenceQuery, projectsQuery, trustQuery } from "@/lib/atlas-queries";
import type { EvidenceKind } from "@/lib/atlas-types";
import { exportProjectSummaryPdf, relativeTime } from "@/lib/exports";
import { projectImage } from "@/lib/project-images";

export const Route = createFileRoute("/projects/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Project · ${params.id} — Atlas Sanctum` },
      { name: "description", content: "Funding progress, beneficiaries and a live trust score for this Atlas Sanctum project." },
    ],
  }),
  component: ProjectDetail,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase text-earth">404</p>
        <h1 className="mt-3 font-serif text-3xl">Project not found</h1>
        <Link to="/projects" className="mt-6 inline-block text-sm text-moss underline">
          Back to marketplace
        </Link>
      </div>
    </PageShell>
  ),
});

const iconFor: Record<EvidenceKind, typeof Camera> = {
  GPS: MapPin,
  IoT: Radio,
  PHOTO: Camera,
  VIDEO: Video,
  REPORT: FileText,
  BENEFICIARY: Users,
};

function ProjectDetail() {
  const { id } = Route.useParams();
  const { data: projects = [], isLoading } = useQuery(projectsQuery);
  const { data: communities = [] } = useQuery(communitiesQuery);
  const { data: evidence = [] } = useQuery(evidenceQuery);
  const { data: trust = [] } = useQuery(trustQuery);

  const project = projects.find((p) => p.slug === id);
  if (!isLoading && !project) throw notFound();
  if (!project) {
    return <PageShell><div className="px-6 py-24 text-center text-sm text-ink/55">Loading…</div></PageShell>;
  }

  const community = communities.find((c) => c.id === project.community_id);
  const projectEvidence = evidence.filter((e) => e.project_id === project.id);
  const breakdown = trust.find((b) => b.project_id === project.id);
  const beneficiaryAcks = projectEvidence.filter((e) => e.kind === "BENEFICIARY");
  const pct = Math.round((project.raised_cents / Math.max(1, project.goal_cents)) * 100);

  return (
    <PageShell>
      <section className="border-b border-ink/5 bg-sand-deep/50">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
          <Link to="/projects" className="inline-flex items-center gap-1.5 font-mono text-xs text-ink/55 hover:text-moss">
            <ArrowLeft className="size-3.5" /> All projects
          </Link>
          <button
            onClick={() => exportProjectSummaryPdf({ project, breakdown, evidence: projectEvidence })}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-card px-3 py-1.5 text-xs font-medium hover:bg-sand-deep"
          >
            <Download className="size-3.5" /> Impact summary PDF
          </button>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_400px]">
          <div>
            <div className="overflow-hidden rounded-2xl bg-sand-deep">
              <img
                src={projectImage(project.image_key)}
                alt={project.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>

            <div className="mt-8">
              <p className="font-mono text-[11px] uppercase tracking-widest text-moss">{project.category}</p>
              <h1 className="mt-2 font-serif text-4xl font-medium leading-tight md:text-5xl">{project.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-xs text-ink/55">
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> {project.location}</span>
                {project.started_at && (
                  <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" /> Started {project.started_at}</span>
                )}
                {community && (
                  <Link to="/communities/$id" params={{ id: community.slug }} className="text-moss hover:underline">
                    Community: {community.name} →
                  </Link>
                )}
              </div>
              <p className="mt-6 max-w-[60ch] text-pretty text-base leading-relaxed text-ink/75">
                {project.long_description ?? project.description}
              </p>
            </div>

            <div className="mt-12 rounded-2xl bg-card ring-1 ring-ink/5">
              <div className="flex items-center justify-between border-b border-ink/5 px-6 py-4">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Beneficiary acknowledgements</p>
                <span className="font-mono text-[11px] text-ink/40">
                  {beneficiaryAcks.length} acks · {project.beneficiaries.toLocaleString()} total reach
                </span>
              </div>
              <ul className="divide-y divide-ink/5">
                {beneficiaryAcks.length === 0 && (
                  <li className="px-6 py-8 text-center text-sm text-ink/50">No acknowledgements logged yet.</li>
                )}
                {beneficiaryAcks.map((b) => (
                  <li key={b.id} className="flex items-center gap-4 px-6 py-4">
                    <Users className="size-4 text-moss" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{b.title}</p>
                      <p className="font-mono text-[11px] text-ink/45">{b.meta}</p>
                    </div>
                    <Link to="/impact/evidence/$id" params={{ id: b.id }} className="font-mono text-[11px] text-moss hover:underline">
                      Open →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 rounded-2xl bg-card ring-1 ring-ink/5">
              <div className="border-b border-ink/5 px-6 py-4">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Project evidence stream</p>
              </div>
              <ul className="divide-y divide-ink/5">
                {projectEvidence.length === 0 && (
                  <li className="px-6 py-8 text-center text-sm text-ink/50">No evidence yet.</li>
                )}
                {projectEvidence.map((e) => {
                  const Icon = iconFor[e.kind];
                  return (
                    <li key={e.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="grid size-9 place-items-center rounded-xl bg-moss-soft text-moss">
                        <Icon className="size-4" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1">
                        <Link to="/impact/evidence/$id" params={{ id: e.id }} className="text-sm font-medium hover:text-moss">
                          {e.title}
                        </Link>
                        <p className="font-mono text-[11px] text-ink/45">{e.kind} · {e.meta}</p>
                      </div>
                      <span className="font-mono text-[11px] text-ink/40">{relativeTime(e.captured_at)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-card p-6 ring-1 ring-ink/5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Funding progress</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-serif text-4xl font-medium tabular-nums">
                  ${(project.raised_cents / 100).toLocaleString()}
                </span>
                <span className="mb-1.5 font-mono text-xs text-ink/45">
                  of ${(project.goal_cents / 100).toLocaleString()}
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-sand-deep">
                <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-serif text-xl tabular-nums">{pct}%</p>
                  <p className="font-mono text-[10px] uppercase text-ink/45">Funded</p>
                </div>
                <div>
                  <p className="font-serif text-xl tabular-nums">{project.donors}</p>
                  <p className="font-mono text-[10px] uppercase text-ink/45">Donors</p>
                </div>
                <div>
                  <p className="font-serif text-xl tabular-nums">{project.beneficiaries.toLocaleString()}</p>
                  <p className="font-mono text-[10px] uppercase text-ink/45">Reached</p>
                </div>
              </div>
              <SupportDialog
                project={project}
                trigger={
                  <button className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-medium text-sand transition-colors hover:bg-moss">
                    Support this project
                  </button>
                }
              />
            </div>

            <TrustBreakdown breakdown={breakdown} />
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
