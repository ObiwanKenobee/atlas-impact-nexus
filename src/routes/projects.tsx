import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { SupportDialog } from "@/components/SupportDialog";
import { useAtlas } from "@/lib/atlas-store";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Project Marketplace — Atlas Sanctum" },
      { name: "description", content: "Fund verified humanitarian projects with transparent outcomes." },
      { property: "og:title", content: "Atlas Sanctum · Project Marketplace" },
      { property: "og:description", content: "Fund verified humanitarian projects with transparent outcomes." },
    ],
  }),
  component: Projects,
});

const categories = ["All", "Water & Energy", "Economic", "Education", "Climate", "Food Security", "Healthcare"];

function Projects() {
  const projects = useAtlas((s) => s.projects);
  const [filter, setFilter] = useState("All");
  const visible = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Marketplace"
        title="Fund what you can verify."
        description="Every project carries a live verification score built from GPS confirmations, beneficiary acknowledgements, sensor data, and independent audits."
      />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium ring-1 transition-colors ${
                  filter === c
                    ? "bg-ink text-sand ring-ink"
                    : "bg-card text-ink/70 ring-ink/10 hover:bg-sand-deep"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => {
              const pct = Math.round((p.raised / p.goal) * 100);
              return (
                <article
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-ink/5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5"
                >
                  <Link to="/projects/$id" params={{ id: p.slug }} className="aspect-[4/3] overflow-hidden bg-sand-deep">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-moss">{p.category}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-moss" />
                        <span className="text-[11px] font-semibold text-moss">{p.verified}% Verified</span>
                      </div>
                    </div>
                    <Link to="/projects/$id" params={{ id: p.slug }} className="font-serif text-xl font-medium leading-snug hover:text-moss">
                      {p.title}
                    </Link>
                    <p className="mt-1 font-mono text-[11px] text-ink/45">{p.location}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink/65">{p.desc}</p>

                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-xs font-medium tabular-nums">
                        <span>${p.raised.toLocaleString()}</span>
                        <span className="text-ink/45">of ${p.goal.toLocaleString()}</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-sand-deep">
                        <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px] text-ink/55">
                        <span>{p.beneficiaries.toLocaleString()} beneficiaries</span>
                        <span>{pct}% funded</span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-2">
                      <Link
                        to="/projects/$id"
                        params={{ id: p.slug }}
                        className="rounded-full border border-ink/10 py-2.5 text-center text-sm font-medium hover:bg-sand-deep"
                      >
                        View
                      </Link>
                      <SupportDialog
                        project={p}
                        trigger={
                          <button className="rounded-full bg-ink py-2.5 text-sm font-medium text-sand hover:bg-moss">
                            Support
                          </button>
                        }
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
