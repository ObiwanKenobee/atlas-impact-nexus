import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/PageShell";
import solarWater from "@/assets/project-solar-water.jpg";
import coffee from "@/assets/project-coffee.jpg";
import education from "@/assets/project-education.jpg";

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

const projects = [
  { image: solarWater, category: "Water & Energy", title: "Solar Water Extraction", location: "Turkana, Kenya", desc: "12 solar wells for 2,500 beneficiaries.", raised: 31000, goal: 50000, verified: 98, beneficiaries: 2500 },
  { image: coffee, category: "Economic", title: "Amani Highland Coffee", location: "Chiapas, Mexico", desc: "Direct-trade infrastructure for 180 families.", raised: 45000, goal: 60000, verified: 96, beneficiaries: 720 },
  { image: education, category: "Education", title: "Lumina Learning Initiative", location: "Omo Valley, Ethiopia", desc: "12 community-led classrooms with solar lighting.", raised: 22500, goal: 40000, verified: 94, beneficiaries: 2451 },
  { image: solarWater, category: "Climate", title: "Mangrove Restoration", location: "Sundarbans, India", desc: "Re-plant 40 hectares of coastal mangrove buffer.", raised: 18900, goal: 35000, verified: 91, beneficiaries: 5400 },
  { image: coffee, category: "Food Security", title: "Cooperative Seed Bank", location: "Cabo Delgado, MZ", desc: "Drought-resilient seed distribution network.", raised: 12200, goal: 25000, verified: 89, beneficiaries: 1840 },
  { image: education, category: "Healthcare", title: "Maternal Care Outpost", location: "Tindouf, W. Sahara", desc: "Two staffed health outposts serving 6 camps.", raised: 38400, goal: 55000, verified: 95, beneficiaries: 3120 },
];

const categories = ["All", "Water & Energy", "Economic", "Education", "Climate", "Food Security", "Healthcare"];

function Projects() {
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
            {categories.map((c, i) => (
              <button
                key={c}
                className={`rounded-full px-4 py-1.5 text-xs font-medium ring-1 transition-colors ${
                  i === 0
                    ? "bg-ink text-sand ring-ink"
                    : "bg-card text-ink/70 ring-ink/10 hover:bg-sand-deep"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => {
              const pct = Math.round((p.raised / p.goal) * 100);
              return (
                <article
                  key={p.title}
                  className="group overflow-hidden rounded-2xl bg-card ring-1 ring-ink/5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-sand-deep">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-moss">
                        {p.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-moss" />
                        <span className="text-[11px] font-semibold text-moss">
                          {p.verified}% Verified
                        </span>
                      </div>
                    </div>
                    <h3 className="font-serif text-xl font-medium leading-snug">{p.title}</h3>
                    <p className="mt-1 font-mono text-[11px] text-ink/45">{p.location}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink/65">{p.desc}</p>

                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-xs font-medium tabular-nums">
                        <span>${p.raised.toLocaleString()}</span>
                        <span className="text-ink/45">of ${p.goal.toLocaleString()}</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-sand-deep">
                        <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px] text-ink/55">
                        <span>{p.beneficiaries.toLocaleString()} beneficiaries</span>
                        <span>{pct}% funded</span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-2">
                      <button className="rounded-full border border-ink/10 py-2.5 text-sm font-medium hover:bg-sand-deep">
                        View
                      </button>
                      <button className="rounded-full bg-ink py-2.5 text-sm font-medium text-sand hover:bg-ink/90">
                        Support
                      </button>
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
