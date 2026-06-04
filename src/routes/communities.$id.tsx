import * as Tabs from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Briefcase, FileText, Leaf, MapPin, Sprout, Users } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { communitiesQuery, evidenceQuery, projectsQuery } from "@/lib/atlas-queries";

export const Route = createFileRoute("/communities/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Community · ${params.id} — Atlas Sanctum` },
      { name: "description", content: "An Atlas Sanctum community profile: projects, beneficiaries, economy, environment and reports." },
    ],
  }),
  component: CommunityDetail,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase text-earth">404</p>
        <h1 className="mt-3 font-serif text-3xl">Community not found</h1>
        <Link to="/communities" className="mt-6 inline-block text-sm text-moss underline">
          Back to communities
        </Link>
      </div>
    </PageShell>
  ),
});

const tabList = [
  { id: "overview", label: "Overview", icon: MapPin },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "beneficiaries", label: "Beneficiaries", icon: Users },
  { id: "economy", label: "Economy", icon: Sprout },
  { id: "environment", label: "Environment", icon: Leaf },
  { id: "reports", label: "Reports", icon: FileText },
];

function CommunityDetail() {
  const { id } = Route.useParams();
  const { data: communities = [] } = useQuery(communitiesQuery);
  const { data: projects = [] } = useQuery(projectsQuery);
  const { data: evidence = [] } = useQuery(evidenceQuery);

  const community = communities.find((c) => c.slug === id);
  if (communities.length && !community) throw notFound();
  if (!community) {
    return <PageShell><div className="px-6 py-24 text-center text-sm text-ink/55">Loading…</div></PageShell>;
  }

  const localProjects = projects.filter((p) => p.community_id === community.id);
  const beneficiaryAcks = evidence.filter(
    (e) => e.kind === "BENEFICIARY" && localProjects.some((p) => p.id === e.project_id),
  );
  const totalReach = localProjects.reduce((s, p) => s + p.beneficiaries, 0);

  return (
    <PageShell>
      <section className="border-b border-ink/5 bg-sand-deep/50">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link to="/communities" className="inline-flex items-center gap-1.5 font-mono text-xs text-ink/55 hover:text-moss">
            <ArrowLeft className="size-3.5" /> All communities
          </Link>
        </div>
      </section>

      <section className="border-b border-ink/5 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss">Community Profile</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl font-medium md:text-5xl">{community.name}</h1>
              <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-ink/55">
                <MapPin className="size-3.5" /> {community.region}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-right">
              <Stat label="Population" value={community.population.toLocaleString()} />
              <Stat label="Projects" value={String(localProjects.length)} />
              <Stat label="Impact" value={`${community.score}`} accent />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <Tabs.Root defaultValue="overview">
            <Tabs.List className="flex flex-wrap gap-1 border-b border-ink/10">
              {tabList.map((t) => (
                <Tabs.Trigger
                  key={t.id}
                  value={t.id}
                  className="group inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-ink/55 transition-colors data-[state=active]:border-moss data-[state=active]:text-ink hover:text-ink"
                >
                  <t.icon className="size-3.5" />
                  {t.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value="overview" className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl bg-card p-6 ring-1 ring-ink/5 lg:col-span-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/45">About</p>
                <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-ink/75">{community.overview}</p>
                {community.needs && (
                  <>
                    <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-ink/45">Priority needs</p>
                    <p className="mt-1 text-sm">{community.needs}</p>
                  </>
                )}
              </div>
              <div className="rounded-2xl bg-ink p-6 text-sand">
                <p className="font-mono text-[10px] uppercase tracking-widest text-sand/50">Community impact score</p>
                <p className="mt-3 font-serif text-6xl tabular-nums">{community.score}</p>
                <p className="mt-2 text-xs text-sand/60">Composite of verification, beneficiary acks and audits.</p>
              </div>
            </Tabs.Content>

            <Tabs.Content value="projects" className="mt-8 grid gap-6 md:grid-cols-2">
              {localProjects.length === 0 && <p className="text-sm text-ink/55">No active projects.</p>}
              {localProjects.map((p) => {
                const pct = Math.round((p.raised_cents / Math.max(1, p.goal_cents)) * 100);
                return (
                  <Link
                    key={p.id}
                    to="/projects/$id"
                    params={{ id: p.slug }}
                    className="group rounded-2xl bg-card p-6 ring-1 ring-ink/5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest text-moss">{p.category}</p>
                    <h3 className="mt-2 font-serif text-xl">{p.title}</h3>
                    <p className="mt-1 text-sm text-ink/65">{p.description}</p>
                    <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-sand-deep">
                      <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between font-mono text-[11px] text-ink/55">
                      <span>${(p.raised_cents / 100).toLocaleString()} / ${(p.goal_cents / 100).toLocaleString()}</span>
                      <span>{p.verified_score}% verified</span>
                    </div>
                  </Link>
                );
              })}
            </Tabs.Content>

            <Tabs.Content value="beneficiaries" className="mt-8">
              <div className="rounded-2xl bg-card ring-1 ring-ink/5">
                <div className="border-b border-ink/5 px-6 py-4">
                  <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    Beneficiary acknowledgements · {beneficiaryAcks.length} on ledger · {totalReach.toLocaleString()} total reach
                  </p>
                </div>
                <ul className="divide-y divide-ink/5">
                  {beneficiaryAcks.length === 0 && (
                    <li className="px-6 py-8 text-center text-sm text-ink/50">No acknowledgements yet.</li>
                  )}
                  {beneficiaryAcks.map((b) => (
                    <li key={b.id} className="flex items-center gap-4 px-6 py-4">
                      <Users className="size-4 text-moss" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{b.title}</p>
                        <p className="font-mono text-[11px] text-ink/45">{b.meta}</p>
                      </div>
                      <Link
                        to="/impact/evidence/$id"
                        params={{ id: b.id }}
                        className="font-mono text-[11px] text-moss hover:underline"
                      >
                        Open →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Tabs.Content>

            <Tabs.Content value="economy" className="mt-8 grid gap-6 md:grid-cols-3">
              <Card label="Livelihoods" value={community.economy?.livelihoods ?? "—"} />
              <Card
                label="Median income (USD/yr)"
                value={`$${(community.economy?.medianIncome ?? 0).toLocaleString()}`}
              />
              <Card label="Active cooperatives" value={String(community.economy?.cooperatives ?? 0)} />
            </Tabs.Content>

            <Tabs.Content value="environment" className="mt-8 grid gap-6 md:grid-cols-3">
              <Card label="Climate" value={community.environment?.climate ?? "—"} />
              <Card label="Risks" value={(community.environment?.risks ?? []).join(" · ") || "—"} />
              <Card label="Mitigation" value={community.environment?.mitigation ?? "—"} />
            </Tabs.Content>

            <Tabs.Content value="reports" className="mt-8">
              <ul className="divide-y divide-ink/5 rounded-2xl bg-card ring-1 ring-ink/5">
                {(community.reports ?? []).length === 0 && (
                  <li className="px-6 py-8 text-center text-sm text-ink/55">No reports filed.</li>
                )}
                {(community.reports ?? []).map((r) => (
                  <li key={r.id} className="flex items-center gap-4 px-6 py-5">
                    <FileText className="size-4 text-moss" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="font-mono text-[11px] text-ink/45">{r.author} · {r.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/45">{label}</p>
      <p className={`mt-1 font-serif text-2xl tabular-nums ${accent ? "text-moss" : ""}`}>{value}</p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-6 ring-1 ring-ink/5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/45">{label}</p>
      <p className="mt-2 font-serif text-xl">{value}</p>
    </div>
  );
}
