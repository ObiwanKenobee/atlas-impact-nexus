import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft, Users, MapPin, Sprout, Leaf, FileText, Briefcase } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAtlas } from "@/lib/atlas-store";

export const Route = createFileRoute("/communities/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Community · ${params.id} — Atlas Sanctum` },
      { name: "description", content: "A complete profile of an Atlas Sanctum community: projects, beneficiaries, economy, environment and reports." },
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
  errorComponent: ({ error }) => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase text-earth">Error</p>
        <h1 className="mt-3 font-serif text-3xl">Couldn't load community</h1>
        <p className="mt-2 text-sm text-ink/60">{error.message}</p>
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
  const community = useAtlas((s) => s.communities.find((c) => c.slug === id));
  const projects = useAtlas((s) => (community ? s.projects.filter((p) => p.communityId === community.id) : []));
  const beneficiaries = useAtlas((s) =>
    community ? s.beneficiaries.filter((b) => s.projects.find((p) => p.id === b.projectId)?.communityId === community.id) : [],
  );

  if (!community) throw notFound();

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
              <Stat label="Projects" value={String(projects.length)} />
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
                <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-ink/45">Priority needs</p>
                <p className="mt-1 text-sm">{community.needs}</p>
              </div>
              <div className="rounded-2xl bg-ink p-6 text-sand">
                <p className="font-mono text-[10px] uppercase tracking-widest text-sand/50">Community impact score</p>
                <p className="mt-3 font-serif text-6xl tabular-nums">{community.score}</p>
                <p className="mt-2 text-xs text-sand/60">Composite of project verification, beneficiary acknowledgements and audits.</p>
              </div>
            </Tabs.Content>

            <Tabs.Content value="projects" className="mt-8 grid gap-6 md:grid-cols-2">
              {projects.length === 0 && <p className="text-sm text-ink/55">No active projects.</p>}
              {projects.map((p) => {
                const pct = Math.round((p.raised / p.goal) * 100);
                return (
                  <Link
                    key={p.id}
                    to="/projects/$id"
                    params={{ id: p.slug }}
                    className="group rounded-2xl bg-card p-6 ring-1 ring-ink/5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest text-moss">{p.category}</p>
                    <h3 className="mt-2 font-serif text-xl">{p.title}</h3>
                    <p className="mt-1 text-sm text-ink/65">{p.desc}</p>
                    <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-sand-deep">
                      <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between font-mono text-[11px] text-ink/55">
                      <span>${p.raised.toLocaleString()} / ${p.goal.toLocaleString()}</span>
                      <span>{p.verified}% verified</span>
                    </div>
                  </Link>
                );
              })}
            </Tabs.Content>

            <Tabs.Content value="beneficiaries" className="mt-8">
              <div className="rounded-2xl bg-card ring-1 ring-ink/5">
                <div className="border-b border-ink/5 px-6 py-4">
                  <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    Registered beneficiaries · {beneficiaries.length} on file
                  </p>
                </div>
                <ul className="divide-y divide-ink/5">
                  {beneficiaries.length === 0 && <li className="px-6 py-8 text-center text-sm text-ink/50">None registered.</li>}
                  {beneficiaries.map((b) => (
                    <li key={b.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="grid size-9 place-items-center rounded-full bg-moss-soft font-serif text-sm text-moss">{b.name.charAt(0)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{b.name}</p>
                        <p className="font-mono text-[11px] text-ink/45">Age {b.age} · Household {b.household}</p>
                      </div>
                      <span className={`font-mono text-[10px] ${b.acknowledged ? "text-moss" : "text-earth"}`}>
                        {b.acknowledged ? "ACK" : "PENDING"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Tabs.Content>

            <Tabs.Content value="economy" className="mt-8 grid gap-6 md:grid-cols-3">
              <Card label="Livelihoods" value={community.economy.livelihoods} />
              <Card label="Median income (USD/yr)" value={`$${community.economy.medianIncome.toLocaleString()}`} />
              <Card label="Active cooperatives" value={String(community.economy.cooperatives)} />
            </Tabs.Content>

            <Tabs.Content value="environment" className="mt-8 grid gap-6 md:grid-cols-3">
              <Card label="Climate" value={community.environment.climate} />
              <Card label="Risks" value={community.environment.risks.join(" · ")} />
              <Card label="Mitigation" value={community.environment.mitigation} />
            </Tabs.Content>

            <Tabs.Content value="reports" className="mt-8">
              <ul className="divide-y divide-ink/5 rounded-2xl bg-card ring-1 ring-ink/5">
                {community.reports.map((r) => (
                  <li key={r.id} className="flex items-center gap-4 px-6 py-5">
                    <FileText className="size-4 text-moss" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="font-mono text-[11px] text-ink/45">{r.author} · {r.date}</p>
                    </div>
                    <button className="rounded-full border border-ink/10 px-3 py-1 text-xs hover:bg-sand-deep">Open</button>
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
