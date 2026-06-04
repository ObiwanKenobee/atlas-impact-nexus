import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { evidenceQuery, projectsQuery, transactionsQuery } from "@/lib/atlas-queries";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Atlas Sanctum" },
      { name: "description", content: "Global oversight of funding, beneficiaries, and verified outcomes." },
      { property: "og:title", content: "Atlas Sanctum · Dashboard" },
      { property: "og:description", content: "Global oversight of funding, beneficiaries, and verified outcomes." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: projects = [] } = useQuery(projectsQuery);
  const { data: txs = [] } = useQuery(transactionsQuery);
  const { data: evidence = [] } = useQuery(evidenceQuery);

  const totalFunding = projects.reduce((s, p) => s + p.raised_cents, 0) / 100;
  const beneficiaries = projects.reduce((s, p) => s + p.beneficiaries, 0);
  const verifiedOutcomes = evidence.length;
  const avgTrust = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.verified_score, 0) / projects.length)
    : 0;

  const overview = [
    { label: "Total Funding", value: `$${Math.round(totalFunding).toLocaleString()}`, delta: `${txs.length} transactions`, tone: "moss" },
    { label: "Active Projects", value: String(projects.length), delta: "Live on ledger", tone: "moss" },
    { label: "Beneficiaries", value: beneficiaries.toLocaleString(), delta: "Verified reach", tone: "moss" },
    { label: "Verified Outcomes", value: String(verifiedOutcomes), delta: `${avgTrust}% avg trust`, tone: "earth" },
  ];

  const trends = projects.slice(0, 5).map((p) => ({
    name: p.title,
    value: p.verified_score,
    delta: `${Math.round((p.raised_cents / Math.max(1, p.goal_cents)) * 100)}% funded`,
  }));

  return (
    <PageShell>
      <PageHeader
        eyebrow="Global Oversight"
        title="A ledger of mercy, in real time."
        description="Aggregate impact across all communities. Track funding flow, beneficiary reach, and verified outcomes."
      />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overview.map((c) => (
              <div key={c.label} className="rounded-2xl bg-card p-6 ring-1 ring-ink/5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink/45">{c.label}</p>
                <p className="mt-3 font-serif text-3xl tabular-nums">{c.value}</p>
                <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${c.tone === "moss" ? "text-moss" : "text-earth"}`}>
                  <TrendingUp className="size-3.5" />
                  {c.delta}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-card p-8 ring-1 ring-ink/5 lg:col-span-2">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-ink/45">Verification velocity</p>
                  <h2 className="mt-2 font-serif text-2xl font-medium">Trust scores by project</h2>
                </div>
                <span className="font-mono text-xs text-moss">Live ledger</span>
              </div>
              <ul className="space-y-5">
                {trends.map((t) => (
                  <li key={t.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{t.name}</span>
                      <span className="font-mono text-xs text-moss">{t.delta}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand-deep">
                      <div className="h-full rounded-full bg-moss" style={{ width: `${t.value}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col rounded-2xl bg-ink p-8 text-sand ring-1 ring-ink/5">
              <div className="flex items-center gap-2 text-earth">
                <Sparkles className="size-4" />
                <p className="font-mono text-xs font-medium uppercase tracking-wider">Atlas AI</p>
              </div>
              <p className="mt-6 font-serif text-xl italic leading-snug">
                "Network trust score sits at {avgTrust}% across {projects.length} active projects, anchored by {evidence.length} live evidence entries."
              </p>
              <Link
                to="/atlas-ai"
                className="mt-auto inline-flex w-fit items-center gap-2 pt-8 text-sm font-medium text-sand hover:text-moss"
              >
                Ask Atlas AI
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
