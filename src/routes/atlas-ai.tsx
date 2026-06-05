import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/PageShell";
import {
  communitiesQuery,
  evidenceQuery,
  projectsQuery,
  trustQuery,
} from "@/lib/atlas-queries";
import type {
  CommunityRow,
  EvidenceRow,
  ProjectRow,
  TrustBreakdownRow,
} from "@/lib/atlas-types";
import { trustScore } from "@/lib/atlas-types";

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
  | { kind: "project"; slug: string; label: string }
  | { kind: "community"; slug: string; label: string }
  | { kind: "evidence"; id: string; label: string; snippet: string };

type Msg = { role: "user" | "ai"; text: string; snippet?: string; citations?: Citation[] };

const suggestions = [
  "Where did my money go this quarter?",
  "Which projects have the highest trust score?",
  "How many beneficiaries have been reached?",
  "Show the evidence backing solar water.",
  "Which community needs water next?",
];

function snippetFor(e: EvidenceRow): string {
  if (e.report_text) return e.report_text.slice(0, 180);
  if (e.iot_payload) return `IoT: ${JSON.stringify(e.iot_payload).slice(0, 120)}`;
  if (e.lat != null && e.lng != null) return `GPS ${e.lat.toFixed(4)}°, ${e.lng.toFixed(4)}° — ${e.meta ?? ""}`;
  return e.meta ?? e.title;
}

function answer(
  q: string,
  data: {
    projects: ProjectRow[];
    communities: CommunityRow[];
    evidence: EvidenceRow[];
    trust: TrustBreakdownRow[];
  },
): { text: string; snippet?: string; citations: Citation[] } {
  const { projects, communities, evidence, trust } = data;
  const lq = q.toLowerCase();
  const cites: Citation[] = [];
  const projCite = (p: ProjectRow): Citation => ({ kind: "project", slug: p.slug, label: p.title });
  const commCite = (c: CommunityRow): Citation => ({ kind: "community", slug: c.slug, label: c.name });
  const evCite = (e: EvidenceRow): Citation => ({ kind: "evidence", id: e.id, label: e.title, snippet: snippetFor(e) });

  if (lq.includes("money") || lq.includes("funded") || lq.includes("donor") || lq.includes("quarter")) {
    const totalRaised = projects.reduce((s, p) => s + p.raised_cents, 0) / 100;
    const totalDonors = projects.reduce((s, p) => s + p.donors, 0);
    const top = [...projects].sort((a, b) => b.raised_cents - a.raised_cents).slice(0, 3);
    top.forEach((p) => cites.push(projCite(p)));
    const latestAudit = evidence.find((e) => e.kind === "REPORT");
    if (latestAudit) cites.push(evCite(latestAudit));
    return {
      text: `$${Math.round(totalRaised).toLocaleString()} routed across ${projects.length} projects from ${totalDonors.toLocaleString()} donors. Top allocations: ${top.map((p) => `${p.title} ($${(p.raised_cents/100).toLocaleString()})`).join(", ")}.`,
      snippet: latestAudit ? snippetFor(latestAudit) : undefined,
      citations: cites,
    };
  }

  if (lq.includes("trust") || lq.includes("verif")) {
    const ranked = trust
      .map((t) => ({ t, p: projects.find((p) => p.id === t.project_id) }))
      .filter((x) => x.p)
      .sort((a, b) => trustScore(b.t) - trustScore(a.t))
      .slice(0, 3);
    ranked.forEach((r) => r.p && cites.push(projCite(r.p)));
    const lines = ranked.map((r) => `${r.p!.title} (${trustScore(r.t)}%)`).join(", ");
    return {
      text: `Strongest trust scores: ${lines || "no breakdown data yet"}. Weighting: GPS 28% · Beneficiaries 26% · Audits 24% · Media/IoT 22%.`,
      citations: cites,
    };
  }

  if (lq.includes("beneficiar") || lq.includes("reach")) {
    const total = projects.reduce((s, p) => s + p.beneficiaries, 0);
    const top = [...projects].sort((a, b) => b.beneficiaries - a.beneficiaries).slice(0, 2);
    top.forEach((p) => cites.push(projCite(p)));
    const ack = evidence.find((e) => e.kind === "BENEFICIARY");
    if (ack) cites.push(evCite(ack));
    return {
      text: `${total.toLocaleString()} beneficiaries reached. Largest cohorts: ${top.map((p) => `${p.title} (${p.beneficiaries.toLocaleString()})`).join(" and ")}.`,
      snippet: ack ? snippetFor(ack) : undefined,
      citations: cites,
    };
  }

  if (lq.includes("solar") || lq.includes("water") || lq.includes("drought")) {
    const water = projects.find((p) => /water|solar/i.test(p.title));
    const lodwar = communities.find((c) => /lodwar|turkana/i.test(c.name + c.region));
    if (water) cites.push(projCite(water));
    if (lodwar) cites.push(commCite(lodwar));
    const ev = evidence.filter((e) => water && e.project_id === water.id).slice(0, 3);
    ev.forEach((e) => cites.push(evCite(e)));
    const first = ev[0];
    return {
      text: water
        ? `${water.title} reaches ${water.beneficiaries.toLocaleString()} people at ${water.verified_score}% verification. Backed by ${ev.length} live evidence entries — GPS, IoT throughput and install photos.`
        : `No active water project found.`,
      snippet: first ? snippetFor(first) : undefined,
      citations: cites,
    };
  }

  // Find a project by name match
  const named = projects.find((p) => lq.includes(p.title.toLowerCase().split(" ")[0]));
  if (named) {
    cites.push(projCite(named));
    const ev = evidence.filter((e) => e.project_id === named.id).slice(0, 3);
    ev.forEach((e) => cites.push(evCite(e)));
    const first = ev[0];
    return {
      text: `${named.title} — $${(named.raised_cents/100).toLocaleString()} raised of $${(named.goal_cents/100).toLocaleString()}, ${named.beneficiaries.toLocaleString()} reached, ${named.verified_score}% trust.`,
      snippet: first ? snippetFor(first) : undefined,
      citations: cites,
    };
  }

  cites.push(...projects.slice(0, 2).map(projCite));
  const recent = evidence[0];
  if (recent) cites.push(evCite(recent));
  return {
    text: `Reading from ${projects.length} projects, ${communities.length} communities and ${evidence.length} evidence entries. Ask about funding, trust scores, beneficiaries or a specific project.`,
    snippet: recent ? snippetFor(recent) : undefined,
    citations: cites,
  };
}

function AtlasAI() {
  const { data: projects = [] } = useQuery(projectsQuery);
  const { data: communities = [] } = useQuery(communitiesQuery);
  const { data: evidence = [] } = useQuery(evidenceQuery);
  const { data: trust = [] } = useQuery(trustQuery);

  const seed: Msg[] = [
    {
      role: "ai",
      text: `Ready. I'm grounded in ${projects.length} projects and ${evidence.length} live evidence entries — every answer carries citations you can click.`,
    },
  ];
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    const a = answer(text, { projects, communities, evidence, trust });
    // Guarantee every answer carries an evidence snippet — fall back to first cited evidence.
    let snippet = a.snippet;
    if (!snippet) {
      const evCite = a.citations.find((c) => c.kind === "evidence");
      if (evCite && evCite.kind === "evidence") snippet = evCite.snippet;
      else if (evidence[0]) snippet = snippetFor(evidence[0]);
    }
    setMsgs((m) => [
      ...m,
      { role: "user", text },
      { role: "ai", text: a.text, snippet, citations: a.citations },
    ]);
    setInput("");
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Atlas AI"
        title="Ask the ledger anything."
        description="Every answer is grounded in live impact data and carries citations you can click through to verify."
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
                <span className="size-1.5 rounded-full bg-moss" /> Reading from ledger
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
                    {m.snippet && (
                      <blockquote className="border-l-2 border-moss bg-moss-soft/40 px-4 py-2 font-mono text-xs italic text-ink/70">
                        “{m.snippet}”
                      </blockquote>
                    )}
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
                  placeholder="Ask about funding, projects, evidence, communities…"
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
  const base =
    "inline-flex items-center gap-1.5 rounded-full bg-moss-soft px-2.5 py-1 font-mono text-[10px] text-moss hover:bg-moss hover:text-sand transition-colors";
  const label = (
    <>
      <span className="font-semibold">[{n}]</span> {c.label}
    </>
  );
  if (c.kind === "project")
    return (
      <Link to="/projects/$id" params={{ id: c.slug }} className={base}>
        {label}
      </Link>
    );
  if (c.kind === "community")
    return (
      <Link to="/communities/$id" params={{ id: c.slug }} className={base}>
        {label}
      </Link>
    );
  return (
    <Link to="/impact/evidence/$id" params={{ id: c.id }} className={base} title={c.snippet}>
      {label}
    </Link>
  );
}
