import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import { PageShell, PageHeader } from "@/components/PageShell";

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

const overview = [
  { label: "Total Funding", value: "$1,248,930", delta: "+8.4% MoM", tone: "moss" },
  { label: "Active Projects", value: "47", delta: "+3 this month", tone: "moss" },
  { label: "Beneficiaries", value: "34,021", delta: "+1,204 reached", tone: "moss" },
  { label: "Verified Outcomes", value: "412", delta: "95% trust score", tone: "earth" },
] as const;

const trends = [
  { name: "Food Security", value: 86, delta: "+12%" },
  { name: "Healthcare Access", value: 71, delta: "+6%" },
  { name: "Education Continuity", value: 79, delta: "+9%" },
  { name: "Economic Growth", value: 62, delta: "+4%" },
  { name: "Environmental Restoration", value: 68, delta: "+11%" },
];

function Dashboard() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Global Oversight"
        title="A ledger of mercy, in real time."
        description="Aggregate impact across all communities. Track funding flow, beneficiary reach, and verified outcomes by program type."
      />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Overview cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overview.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl bg-card p-6 ring-1 ring-ink/5"
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink/45">
                  {c.label}
                </p>
                <p className="mt-3 font-serif text-3xl tabular-nums">{c.value}</p>
                <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${c.tone === "moss" ? "text-moss" : "text-earth"}`}>
                  <TrendingUp className="size-3.5" />
                  {c.delta}
                </div>
              </div>
            ))}
          </div>

          {/* Trends + AI */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-card p-8 ring-1 ring-ink/5 lg:col-span-2">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-ink/45">
                    Impact Trends · This Quarter
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-medium">
                    Outcome velocity by program
                  </h2>
                </div>
                <span className="font-mono text-xs text-moss">All trending up</span>
              </div>
              <ul className="space-y-5">
                {trends.map((t) => (
                  <li key={t.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{t.name}</span>
                      <span className="font-mono text-xs text-moss">{t.delta}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand-deep">
                      <div
                        className="h-full rounded-full bg-moss"
                        style={{ width: `${t.value}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col rounded-2xl bg-ink p-8 text-sand ring-1 ring-ink/5">
              <div className="flex items-center gap-2 text-earth">
                <Sparkles className="size-4" />
                <p className="font-mono text-xs font-medium uppercase tracking-wider">
                  Atlas AI
                </p>
              </div>
              <p className="mt-6 font-serif text-xl italic leading-snug">
                "Community Lodwar is at risk of drought within 45 days. Predicted
                crop decline: 18%."
              </p>
              <p className="mt-4 text-sm text-sand/60">
                Recommended: deploy 6 water-harvesting kits to surrounding villages.
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
