import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, MapPin, Users, Calendar, Camera, Radio, FileText, Video } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SupportDialog } from "@/components/SupportDialog";
import { useAtlas } from "@/lib/atlas-store";
import type { EvidenceKind } from "@/lib/atlas-store";

export const Route = createFileRoute("/projects/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Project · ${params.id} — Atlas Sanctum` },
      { name: "description", content: "Funding progress, beneficiaries and a live trust score for this Atlas Sanctum project." },
    ],
  }),
  component: ProjectDetail,
  errorComponent: ({ error }) => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase text-earth">Error</p>
        <h1 className="mt-3 font-serif text-3xl">Couldn't load project</h1>
        <p className="mt-2 text-sm text-ink/60">{error.message}</p>
      </div>
    </PageShell>
  ),
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
  const project = useAtlas((s) => s.projects.find((p) => p.slug === id));
  const community = useAtlas((s) => (project ? s.communities.find((c) => c.id === project.communityId) : undefined));
  const evidence = useAtlas((s) => (project ? s.evidence.filter((e) => e.projectId === project.id) : []));
  const beneficiaries = useAtlas((s) => (project ? s.beneficiaries.filter((b) => b.projectId === project.id) : []));

  if (!project) throw notFound();

  const pct = Math.round((project.raised / project.goal) * 100);
  const trustChannels = [
    { label: "GPS", value: evidence.filter((e) => e.kind === "GPS").length, weight: 28 },
    { label: "Beneficiaries", value: evidence.filter((e) => e.kind === "BENEFICIARY").length + beneficiaries.length, weight: 26 },
    { label: "IoT Sensors", value: evidence.filter((e) => e.kind === "IoT").length, weight: 22 },
    { label: "Audits", value: evidence.filter((e) => e.kind === "REPORT").length, weight: 24 },
  ];

  return (
    <PageShell>
      <section className="border-b border-ink/5 bg-sand-deep/50">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link to="/projects" className="inline-flex items-center gap-1.5 font-mono text-xs text-ink/55 hover:text-moss">
            <ArrowLeft className="size-3.5" /> All projects
          </Link>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_400px]">
          <div>
            <div className="overflow-hidden rounded-2xl bg-sand-deep">
              <img src={project.image} alt={project.title} className="aspect-[16/9] w-full object-cover" />
            </div>

            <div className="mt-8">
              <p className="font-mono text-[11px] uppercase tracking-widest text-moss">{project.category}</p>
              <h1 className="mt-2 font-serif text-4xl font-medium leading-tight md:text-5xl">{project.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-xs text-ink/55">
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> {project.location}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" /> Started {project.startedAt}</span>
                {community && (
                  <Link to="/communities/$id" params={{ id: community.slug }} className="text-moss hover:underline">
                    Community: {community.name} →
                  </Link>
                )}
              </div>
              <p className="mt-6 max-w-[60ch] text-pretty text-base leading-relaxed text-ink/75">{project.longDesc}</p>
            </div>

            {/* Beneficiaries */}
            <div className="mt-12 rounded-2xl bg-card ring-1 ring-ink/5">
              <div className="flex items-center justify-between border-b border-ink/5 px-6 py-4">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Registered Beneficiaries</p>
                <span className="font-mono text-[11px] text-ink/40">
                  Showing {beneficiaries.length} of {project.beneficiaries.toLocaleString()}
                </span>
              </div>
              <ul className="divide-y divide-ink/5">
                {beneficiaries.length === 0 && (
                  <li className="px-6 py-8 text-center text-sm text-ink/50">No registered beneficiaries on file yet.</li>
                )}
                {beneficiaries.map((b) => (
                  <li key={b.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="grid size-9 place-items-center rounded-full bg-moss-soft font-serif text-sm text-moss">
                      {b.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{b.name}</p>
                      <p className="font-mono text-[11px] text-ink/45">
                        Age {b.age} · Household of {b.household} · Registered {b.registered}
                      </p>
                    </div>
                    {b.acknowledged ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-moss">
                        <CheckCircle2 className="size-3" /> ACK
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-earth">PENDING</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence */}
            <div className="mt-8 rounded-2xl bg-card ring-1 ring-ink/5">
              <div className="border-b border-ink/5 px-6 py-4">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Project Evidence Stream</p>
              </div>
              <ul className="divide-y divide-ink/5">
                {evidence.map((e) => {
                  const Icon = iconFor[e.kind];
                  return (
                    <li key={e.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="grid size-9 place-items-center rounded-xl bg-moss-soft text-moss">
                        <Icon className="size-4" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{e.title}</p>
                        <p className="font-mono text-[11px] text-ink/45">{e.kind} · {e.meta}</p>
                      </div>
                      <span className="font-mono text-[11px] text-ink/40">{e.time}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Sidebar: funding + trust */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-card p-6 ring-1 ring-ink/5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Funding progress</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-serif text-4xl font-medium tabular-nums">${project.raised.toLocaleString()}</span>
                <span className="mb-1.5 font-mono text-xs text-ink/45">of ${project.goal.toLocaleString()}</span>
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

            <div className="rounded-2xl bg-ink p-6 text-sand">
              <p className="font-mono text-[10px] uppercase tracking-widest text-sand/50">Project Trust Score</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-serif text-6xl font-medium tabular-nums">{project.verified}</span>
                <span className="mb-3 font-mono text-sm text-moss">%</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-sand/70">
                <CheckCircle2 className="size-3.5 text-moss" />
                Verified across {evidence.length} live evidence channels
              </div>
              <div className="my-5 h-px bg-sand/10" />
              <ul className="space-y-3">
                {trustChannels.map((c) => (
                  <li key={c.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-sand/70">{c.label}</span>
                      <span className="font-mono text-[10px] text-sand/50">weight {c.weight}% · {c.value} pts</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-sand/10">
                      <div className="h-full rounded-full bg-moss" style={{ width: `${Math.min(100, c.weight * 3 + c.value * 4)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
