import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/PageShell";

export const Route = createFileRoute("/atlas-ai")({
  head: () => ({
    meta: [
      { title: "Atlas AI — Atlas Sanctum" },
      { name: "description", content: "Natural-language analytics, donor insights, community intelligence, predictive alerts." },
      { property: "og:title", content: "Atlas Sanctum · Atlas AI" },
      { property: "og:description", content: "Natural-language analytics, donor insights, community intelligence, predictive alerts." },
    ],
  }),
  component: AtlasAI,
});

type Msg = { role: "user" | "ai"; text: string };

const seed: Msg[] = [
  { role: "user", text: "How many children received education support this quarter?" },
  {
    role: "ai",
    text:
      "2,451 children served across 12 communities. The strongest gains were in Omo Valley (+34%) and Sundarbans (+22%). Three classrooms in Cabo Delgado are at risk due to monsoon delays — recommended action: extend rainy-season grant window by 21 days.",
  },
];

const suggestions = [
  "Which communities need water intervention next quarter?",
  "Summarize donor impact for Q2 2026",
  "Predict drought risk across active regions",
  "Compare healthcare spend vs outcomes",
];

function AtlasAI() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    setMsgs((m) => [
      ...m,
      { role: "user", text },
      {
        role: "ai",
        text:
          "Analyzing across 412 verified data sources… (this is a UI preview — Atlas AI will be wired to live data in Phase 2.)",
      },
    ]);
    setInput("");
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Atlas AI"
        title="Ask the ledger anything."
        description="Natural-language analytics over every project, sensor and audit. Built for donors, field workers, and oversight teams."
      />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-card ring-1 ring-ink/5">
            <div className="flex items-center justify-between border-b border-ink/5 px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-earth" />
                <p className="font-mono text-xs uppercase tracking-widest text-ink/55">
                  Atlas AI · Conversation
                </p>
              </div>
              <span className="flex items-center gap-2 font-mono text-[11px] text-moss">
                <span className="size-1.5 rounded-full bg-moss" />
                Online
              </span>
            </div>
            <ul className="space-y-6 px-6 py-8">
              {msgs.map((m, i) => (
                <li key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-5 py-3.5 text-sm text-sand"
                        : "max-w-[85%] space-y-2"
                    }
                  >
                    {m.role === "ai" && (
                      <p className="font-mono text-[10px] uppercase tracking-widest text-earth">
                        Atlas AI
                      </p>
                    )}
                    <p
                      className={
                        m.role === "ai"
                          ? "font-serif text-lg leading-relaxed text-ink"
                          : "leading-relaxed"
                      }
                    >
                      {m.text}
                    </p>
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
                <button
                  type="submit"
                  className="grid size-9 place-items-center rounded-lg bg-ink text-sand transition-colors hover:bg-moss"
                >
                  <ArrowUp className="size-4" />
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-ink/10 bg-sand px-3 py-1.5 text-xs text-ink/70 transition-colors hover:bg-sand-deep hover:text-ink"
                  >
                    {s}
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
