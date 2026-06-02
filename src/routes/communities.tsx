import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, MapPin } from "lucide-react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { useAtlas } from "@/lib/atlas-store";

export const Route = createFileRoute("/communities")({
  head: () => ({
    meta: [
      { title: "Communities — Atlas Sanctum" },
      { name: "description", content: "Registered communities, populations, projects and impact scores." },
      { property: "og:title", content: "Atlas Sanctum · Communities" },
      { property: "og:description", content: "Registered communities, populations, projects and impact scores." },
    ],
  }),
  component: Communities,
});

function Communities() {
  const communities = useAtlas((s) => s.communities);
  return (
    <PageShell>
      <PageHeader
        eyebrow="Registered Communities"
        title="120 communities. One shared ledger."
        description="Each profile captures population, active projects, needs assessment and a verified impact score."
      />
      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => (
            <article
              key={c.id}
              className="group rounded-2xl bg-card p-6 ring-1 ring-ink/5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-xl font-medium">{c.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-ink/50">
                    <MapPin className="size-3" />
                    {c.region}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink/45">Impact</p>
                  <p className="font-serif text-2xl text-moss tabular-nums">{c.score}</p>
                </div>
              </div>

              <div className="my-6 h-px bg-ink/5" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink/45">Population</p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium tabular-nums">
                    <Users className="size-3.5 text-ink/40" />
                    {c.population.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink/45">Active Projects</p>
                  <p className="mt-1 font-medium tabular-nums">{c.projects}</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink/45">Priority Needs</p>
                <p className="mt-1 text-sm text-ink/70">{c.needs}</p>
              </div>

              <Link
                to="/communities/$id"
                params={{ id: c.slug }}
                className="mt-6 block w-full rounded-full border border-ink/10 py-2.5 text-center text-sm font-medium transition-colors hover:bg-ink hover:text-sand"
              >
                Open Profile
              </Link>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
