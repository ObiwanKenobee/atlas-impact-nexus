import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { atlasStore, useAtlas, type Project, type Community } from "@/lib/atlas-store";

export const Route = createFileRoute("/atlas-ai")({
  head: () => ({
    meta: [
      { title: "Atlas AI — Atlas Sanctum" },
      { name: "description", content: "Natural-language analytics with citations to the live impact ledger." },
      { property: "og:title", content: "Atlas Sanctum · Atlas AI" },
      { property: "og:description", content: "Natural-language analytics with citations to the live impact ledger." },
    ],
  }),
  component: AtlasAI,
});

type Citation =
  | { kind: "project"; id: string; slug: string; label: string }
  | { kind: "community"; id: string; slug: string; label: string }
  | { kind: "evidence"; id: string; label: string };

type Msg = { role: "user" | "ai"; text: string; citations?: Citation[] };

const suggestions = [
  "Where did my money go this quarter?",
  "Which projects have the highest verification score?",
  "How many beneficiaries have been reached overall?",
  "What evidence backs the Solar Water project?",
  "Which community needs water intervention next?",
];

function answer(q: string): { text: string; citations: Citation[] } {
  const s = atlasStore.get();
  const lq = q.toLowerCase();
  const cites: Citation[] = [];

  const projCite = (p: Project): Citation => ({ kind: "project", id: p.id, slug: p.slug, label: p.title });
  const commCite = (c: Community): Citation => ({ kind: "community", id: c.id, slug: c.slug, label: c.name });

  if (lq.includes("money") || lq.includes("funded") || lq.includes("donor") || lq.includes("quarter")) {
    const totalRaised = s.projects.reduce((sum, p) => sum + p.raised, 0);
    const totalDonors = s.projects.reduce((sum, p) => sum + p.donors, 0);
    const top = [...s.projects].sort((a, b) => b.raised - a.raised).slice(0, 3);
    top.forEach((p) => cites.push(projCite(p)));
    return {
      text: `Across the active portfolio, $${totalRaised.toLocaleString()} has been routed from ${totalDonors.toLocaleString()} donors. The three largest allocations were: ${top
        .map((p) => `${p.title} ($${p.raised.toLocaleString()})`)
        .join(", ")}. Every dollar is reconciled against GPS, IoT and audit evidence on the ledger.`,
      citations: cites,
    };
  }

  if (lq.includes("verification") || lq.includes("trust") || lq.includes("verified")) {
    const ranked = [...s.projects].sort((a, b) => b.verified - a.verified).slice(0, 3);
    ranked.forEach((p) => cites.push(projCite(p)));
    return {
      text: `The strongest verification scores in the network: ${ranked
        .map((p) => `${p.title} (${p.verified}%)`)
        .join(", ")}. Scores are weighted from GPS confirmations (28%), beneficiary acknowledgements (26%), independent audits (24%) and IoT sensors (22%).`,
      citations: cites,
    };
  }

  if (lq.includes("beneficiar")) {
    const total = s.projects.reduce((sum, p) => sum + p.beneficiaries, 0);
    const top = [...s.projects].sort((a, b) => b.beneficiaries - a.beneficiaries).slice(0, 2);
    top.forEach((p) => cites.push(projCite(p)));
    return {
      text: `${total.toLocaleString()} people have been reached across all active projects. The largest cohorts are ${top
        .map((p) => `${p.title} (${p.beneficiaries.toLocaleString()})`)
        .join(" and ")}.`,
      citations: cites,
    };
  }

  if (lq.includes("water") || lq.includes("drought")) {
    const water = s.projects.find((p) => p.id === "p-solar-water");
    const lodwar = s.communities.find((c) => c.id === "c-lodwar");
    if (water) cites.push(projCite(water));
    if (lodwar) cites.push(commCite(lodwar));
    s.evidence.filter((e) => e.projectId === water?.id).forEach((e) => cites.push({ kind: "evidence", id: e.id, label: e.title }));
    return {
      text: `Water intervention is most urgent in Lodwar Basin (impact score 92). The Solar Water Extraction project has reached ${water?.beneficiaries.toLocaleString()} beneficiaries with ${water?.verified}% verification. Soil sensors across the wider network indicate Cabo Delgado and Sundarbans as next-priority hydration zones.`,
      citations: cites,
    };
  }

  if (lq.includes("solar")) {
    const water = s.projects.find((p) => p.id === "p-solar-water");
    if (water) {
      cites.push(projCite(water));
      s.evidence.filter((e) => e.projectId === water.id).forEach((e) => cites.push({ kind: "evidence", id: e.id, label: e.title }));
    }
    return {
      text: `Solar Water Extraction is backed by ${cites.filter((c) => c.kind === "evidence").length} live evidence entries — GPS pings at well sites, IoT throughput logs averaging 4,210 L/day, and installation photos. Verification score: ${water?.verified}%.`,
      citations: cites,
    };
  }

  // Default summary
  const totalEvidence = s.evidence.length;
  cites.push(...s.projects.slice(0, 2).map(projCite));
  return {
    text: `I'm reading from ${s.projects.length} active projects, ${s.communities.length} communities and ${totalEvidence} live evidence entries. Ask about funding, verification scores, beneficiaries, or a specific project or community.`,
    citations: cites,
  };
}

function AtlasAI() {
  const s = useAtlas((x) => x);
  const seed: Msg[] = [
    { role: "user", text: "How many children received education support this quarter?" },
    (() => {
      const lumina = s.projects.find((p) => p.id === "p-lumina")!;
      const omo = s.communities.find((c) => c.id === "c-omo")!;
      return {
        role: "ai" as const,
        text: `${lumina.beneficiaries.toLocaleString()} learners reached through the Lumina Learning Initiative across ${omo.name}. Attendance is up 34% since the solar-lit classrooms opened, with ${lumina.verified}% of impact independently verified.`,
        citations: [
          { kind: "project" as const, id: lumina.id, slug: lumina.slug, label: lumina.title },
          { kind: "community" as const, id: omo.id, slug: omo.slug, label: omo.name },
        ],
      };
    })(),
  ];
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    const a = answer(text);
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", text: a.text, citations: a.citations }]);
    setInput("");
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Atlas AI"
        title="Ask the ledger anything."
        description="Every answer is grounded in the live impact data and carries citations you can click through to verify."
      />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-card ring-1 ring-ink/5">
            <div className="flex items-center justify-between border-b border-ink/5 px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-earth" />
                <p className="font-mono text-xs uppercase tracking-widest text-ink/55">Atlas AI · Grounded conversation</p>
              </div>
              <span className="flex items-center gap-2 font-mono text-[11px] text-moss">
                <span className="size-1.5 rounded-full bg-moss" />
                Reading from ledger
              </span>
            </div>
            <ul className="space-y-6 px-6 py-8">
              {msgs.map((m, i) => (
                <li key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-5 py-3.5 text-sm text-sand"
                        : "max-w-[90%] space-y-3"
                    }
                  >
                    {m.role === "ai" && (
                      <p className="font-mono text-[10px] uppercase tracking-widest text-earth">Atlas AI</p>
                    )}
                    <p className={m.role === "ai" ? "font-serif text-lg leading-relaxed text-ink" : "leading-relaxed"}>
                      {m.text}
                    </p>
                    {m.citations && m.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.citations.map((c, idx) => (
                          <CitationChip key={idx} c={c} n={idx + 1} />
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink/5 px-6 py-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 rounded-xl bg-sand-deep px-4 py-2 ring-1 ring-ink/5 focus-within:ring-moss"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about funding, communities, projects, outcomes…"
                  className="flex-1 bg-transparent py-2 text-sm placeholder:text-ink/40 focus:outline-none"
                />
                <button type="submit" className="grid size-9 place-items-center rounded-lg bg-ink text-sand transition-colors hover:bg-moss">
                  <ArrowUp className="size-4" />
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => send(sug)}
                    className="rounded-full border border-ink/10 bg-sand px-3 py-1.5 text-xs text-ink/70 transition-colors hover:bg-sand-deep hover:text-ink"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function CitationChip({ c, n }: { c: Citation; n: number }) {
  const base = "inline-flex items-center gap-1.5 rounded-full bg-moss-soft px-2.5 py-1 font-mono text-[10px] text-moss hover:bg-moss hover:text-sand transition-colors";
  const label = (
    <>
      <span className="font-semibold">[{n}]</span> {c.label}
    </>
  );
  if (c.kind === "project") return <Link to="/projects/$id" params={{ id: c.slug }} className={base}>{label}</Link>;
  if (c.kind === "community") return <Link to="/communities/$id" params={{ id: c.slug }} className={base}>{label}</Link>;
  return <Link to="/impact" className={base}>{label}</Link>;
}
