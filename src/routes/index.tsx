import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, MapPin, Minus, Plus, Sparkles } from "lucide-react";
import worldMap from "@/assets/world-map.jpg";
import solarWater from "@/assets/project-solar-water.jpg";
import coffeeProject from "@/assets/project-coffee.jpg";
import educationProject from "@/assets/project-education.jpg";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas Sanctum — Transforming Relief Into Prosperity" },
      {
        name: "description",
        content:
          "Track humanitarian impact in real time. Fund communities, verify outcomes, build resilience.",
      },
      { property: "og:title", content: "Atlas Sanctum — Covenant Nexus" },
      {
        property: "og:description",
        content:
          "A living ledger of community transformation. Verified impact for donors, NGOs and field workers.",
      },
    ],
  }),
  component: Landing,
});

const featuredProjects = [
  {
    image: solarWater,
    category: "Water & Energy",
    title: "Solar Water Extraction Project",
    location: "Turkana Basin, Kenya",
    desc: "Twelve solar-powered wells delivering clean water to 2,500 beneficiaries across seven villages.",
    raised: 31000,
    goal: 50000,
    verified: 98,
  },
  {
    image: coffeeProject,
    category: "Economic Restoration",
    title: "Amani Highland Cooperative",
    location: "Chiapas Highlands, Mexico",
    desc: "Direct-trade coffee infrastructure restoring economic agency for 180 smallholder farming families.",
    raised: 45000,
    goal: 60000,
    verified: 96,
  },
  {
    image: educationProject,
    category: "Education",
    title: "Lumina Learning Initiative",
    location: "Lower Omo Valley, Ethiopia",
    desc: "Twelve community-led classrooms with solar lighting and certified instructors. 2,451 children enrolled.",
    raised: 22500,
    goal: 40000,
    verified: 94,
  },
];

const pins = [
  { top: "38%", left: "55%", label: "Lodwar" },
  { top: "52%", left: "29%", label: "Chiapas" },
  { top: "44%", left: "60%", label: "Omo Valley" },
  { top: "58%", left: "70%", label: "Sundarbans" },
  { top: "30%", left: "48%", label: "Tindouf" },
];

function Landing() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="px-6 pt-24 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-end">
            <div className="flex flex-col justify-center animate-fade-up">
              <div className="mb-6 inline-flex items-center gap-2 text-moss">
                <span className="size-1.5 rounded-full bg-moss" />
                <span className="font-mono text-xs font-medium uppercase tracking-[0.2em]">
                  Verification Ledger Active
                </span>
              </div>
              <h1 className="font-serif text-5xl font-medium leading-[1.05] text-balance md:text-7xl max-w-[18ch]">
                Transforming Relief Into Prosperity
              </h1>
              <p className="mt-8 max-w-[52ch] text-pretty text-lg leading-relaxed text-ink/65">
                The bridge between intent and outcome. Atlas Sanctum gives donors,
                NGOs and communities a shared ledger — tracking every dollar from
                capital to lasting transformation.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 rounded-full bg-moss py-3 pl-5 pr-6 text-sm font-medium text-sand ring-1 ring-moss transition-transform active:scale-95"
                >
                  Fund a Project
                  <ArrowUpRight className="size-4" />
                </Link>
                <Link
                  to="/impact"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-sand py-3 pl-5 pr-6 text-sm font-medium text-ink transition-colors hover:bg-sand-deep"
                >
                  Explore Impact
                </Link>
                <Link
                  to="/communities"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-sand py-3 pl-5 pr-6 text-sm font-medium text-ink transition-colors hover:bg-sand-deep"
                >
                  Join Community
                </Link>
              </div>
            </div>

            {/* Live counter */}
            <div className="relative flex flex-col gap-6 rounded-2xl bg-sand-deep p-8 ring-1 ring-ink/5 animate-fade-up [animation-delay:120ms]">
              <div className="space-y-1.5">
                <p className="font-mono text-xs font-medium uppercase tracking-wider text-ink/45">
                  Capital Distributed
                </p>
                <p className="font-serif text-4xl font-medium tabular-nums">
                  $1,248,930
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 border-t border-ink/5 pt-6">
                <Stat label="Communities" value="120" />
                <Stat label="Lives Reached" value="34,000" />
              </div>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-moss-soft p-4 ring-1 ring-moss/15">
                <div className="flex items-center gap-3">
                  <VerificationRing value={95} />
                  <div>
                    <p className="text-sm font-medium leading-tight">Verification Score</p>
                    <p className="text-[11px] text-ink/50">GPS + IoT + Field Audits</p>
                  </div>
                </div>
                <CheckCircle2 className="size-5 text-moss" strokeWidth={1.75} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORLD MAP */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-sand-deep ring-1 ring-ink/5">
            <img
              src={worldMap}
              alt="Cartographic map of active Atlas Sanctum projects worldwide"
              loading="lazy"
              width={1920}
              height={800}
              className="h-[520px] w-full object-cover opacity-70 mix-blend-multiply"
            />
            {/* Pins */}
            <div className="absolute inset-0">
              {pins.map((p) => (
                <div
                  key={p.label}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ top: p.top, left: p.left }}
                >
                  <div className="pin-pulse relative size-3 rounded-full bg-moss ring-4 ring-moss/15" />
                </div>
              ))}
            </div>
            {/* Overlays */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-8">
              <div className="flex items-start justify-between">
                <div className="pointer-events-auto max-w-xs space-y-1 rounded-xl bg-sand/90 px-4 py-3 ring-1 ring-ink/5 backdrop-blur">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-moss">
                    Active Project Focus
                  </p>
                  <p className="text-sm font-medium leading-snug">
                    East Africa Resilience Initiative
                  </p>
                </div>
                <div className="pointer-events-auto flex flex-col gap-1.5">
                  <button className="grid size-8 place-items-center rounded-lg border border-ink/10 bg-sand transition-colors hover:bg-sand-deep">
                    <Plus className="size-3.5" />
                  </button>
                  <button className="grid size-8 place-items-center rounded-lg border border-ink/10 bg-sand transition-colors hover:bg-sand-deep">
                    <Minus className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-sand p-4 pr-6 shadow-xl ring-1 ring-ink/5 animate-fade-up">
                  <div className="grid size-12 place-items-center rounded-xl bg-moss-soft">
                    <MapPin className="size-5 text-moss" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink/45">
                      Lodwar, Kenya
                    </p>
                    <p className="text-sm font-semibold">Solar Water Extraction</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 w-28 overflow-hidden rounded-full bg-ink/10">
                        <div className="h-full w-3/4 rounded-full bg-moss" />
                      </div>
                      <span className="font-mono text-[10px] text-ink/60">
                        75% Funded
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW (DARK) */}
      <section className="bg-ink py-24 text-sand">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss">
                Impact Transparency Engine
              </p>
              <h2 className="mt-3 max-w-[20ch] text-balance font-serif text-3xl font-medium md:text-5xl">
                Every dollar, traced to its outcome.
              </h2>
              <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-sand/60">
                We aggregate satellite imagery, IoT sensors, beneficiary
                confirmations and independent audits into a single ledger of truth.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 self-start rounded-full bg-sand/10 py-2.5 pl-5 pr-6 text-sm font-medium text-sand ring-1 ring-sand/15 transition-colors hover:bg-sand/15"
            >
              Open dashboard
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Food security chart */}
            <div className="rounded-2xl bg-sand/[0.04] p-8 ring-1 ring-sand/10 lg:col-span-2">
              <div className="mb-8 flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-widest text-sand/50">
                  Food Security Index · 6 Mo
                </p>
                <span className="font-mono text-xs text-moss">+12% MoM</span>
              </div>
              <div className="flex h-52 items-end gap-3">
                {[30, 45, 40, 65, 55, 85].map((h, i) => (
                  <div key={i} className="flex w-full flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-moss/70 transition-all hover:bg-moss"
                      style={{ height: `${h}%` }}
                    />
                    <span className="font-mono text-[10px] text-sand/40">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="flex flex-col rounded-2xl bg-earth/15 p-8 ring-1 ring-earth/25">
              <div className="flex items-center gap-2 text-earth">
                <Sparkles className="size-4" strokeWidth={2} />
                <p className="font-mono text-xs font-medium uppercase tracking-wider">
                  Atlas AI Insight
                </p>
              </div>
              <p className="mt-6 font-serif text-xl italic leading-snug text-sand">
                "Community X is at risk of drought within 45 days. Predicted crop
                decline: 18%."
              </p>
              <p className="mt-3 text-sm text-sand/60">
                Recommended intervention: water harvesting infrastructure.
              </p>
              <Link
                to="/atlas-ai"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-earth/25 py-2 pl-3 pr-4 text-xs font-medium text-sand ring-1 ring-earth/30 transition-colors hover:bg-earth/35"
              >
                <Plus className="size-3.5" strokeWidth={2.5} />
                Plan Intervention
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss">
                Marketplace
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium md:text-4xl">
                Featured Projects
              </h2>
            </div>
            <Link
              to="/projects"
              className="hidden text-sm font-medium text-ink/70 hover:text-moss md:inline-flex items-center gap-1.5"
            >
              All projects
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {featuredProjects.map((p) => (
              <ProjectCard key={p.title} {...p} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-ink/45">
        {label}
      </p>
      <p className="font-serif text-2xl tabular-nums">{value}</p>
    </div>
  );
}

function VerificationRing({ value }: { value: number }) {
  return (
    <div className="relative size-11">
      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="fill-none stroke-moss/15"
          strokeWidth="3"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="fill-none stroke-moss"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${value}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-mono text-[10px] font-semibold text-moss">
        {value}%
      </span>
    </div>
  );
}

function ProjectCard({
  image,
  category,
  title,
  location,
  desc,
  raised,
  goal,
  verified,
}: {
  image: string;
  category: string;
  title: string;
  location: string;
  desc: string;
  raised: number;
  goal: number;
  verified: number;
}) {
  const pct = Math.round((raised / goal) * 100);
  return (
    <article className="group overflow-hidden rounded-2xl bg-card ring-1 ring-ink/5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5">
      <div className="aspect-[4/3] w-full overflow-hidden bg-sand-deep">
        <img
          src={image}
          alt={title}
          loading="lazy"
          width={1024}
          height={768}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-moss">
            {category}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-moss" />
            <span className="text-[11px] font-semibold text-moss">
              {verified}% Verified
            </span>
          </div>
        </div>
        <h3 className="font-serif text-xl font-medium leading-snug">{title}</h3>
        <p className="mt-1 font-mono text-[11px] text-ink/45">{location}</p>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-ink/65">
          {desc}
        </p>
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-xs font-medium tabular-nums">
            <span>${raised.toLocaleString()} raised</span>
            <span className="text-ink/45">of ${goal.toLocaleString()}</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-sand-deep">
            <div
              className="h-full rounded-full bg-moss"
              style={{ width: `${pct}%` }}
            />
          </div>
          <button className="mt-2 w-full rounded-full bg-ink py-2.5 text-sm font-medium text-sand transition-colors hover:bg-ink/90">
            Support Project
          </button>
        </div>
      </div>
    </article>
  );
}
