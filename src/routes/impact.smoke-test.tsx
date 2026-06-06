import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { useAuth } from "@/hooks/use-auth";
import { evidenceQuery } from "@/lib/atlas-queries";

export const Route = createFileRoute("/impact/smoke-test")({
  head: () => ({
    meta: [
      { title: "Smoke Test — Atlas Sanctum" },
      { name: "description", content: "Guided pass/fail checklist for the impact upload + evidence detail flows." },
    ],
  }),
  component: SmokeTest,
});

type Status = "todo" | "pass" | "fail";
type Step = {
  id: string;
  title: string;
  hint: string;
  to?: string;
  toParams?: Record<string, string>;
  requiresAuth?: boolean;
};

const STORAGE_KEY = "atlas.smokeTest.v1";

const steps: Step[] = [
  {
    id: "auth",
    title: "Sign in as field worker / donor",
    hint: "You must be signed in for the upload form and persistence to work.",
    to: "/auth",
    requiresAuth: true,
  },
  {
    id: "upload-gps",
    title: "Submit a GPS evidence entry",
    hint: "Pick a project, capture location, submit. Expect to land on /impact/evidence/$id.",
    to: "/impact/upload",
    requiresAuth: true,
  },
  {
    id: "upload-report",
    title: "Submit a field report",
    hint: "Switch the kind to Report, fill the narrative, submit.",
    to: "/impact/upload",
    requiresAuth: true,
  },
  {
    id: "feed-refresh",
    title: "Refresh /impact and verify both entries appear",
    hint: "Hard-refresh and confirm your entries survive — that proves backend persistence.",
    to: "/impact",
  },
  {
    id: "detail-open",
    title: "Open one evidence detail page",
    hint: "Confirm meta, GPS, media or report content render and the URL contains the row id.",
    to: "/impact",
  },
  {
    id: "atlas-citation",
    title: "Click an Atlas AI citation chip",
    hint: "Ask 'which projects have the highest trust score?' then click an evidence chip — it must open that exact entry.",
    to: "/atlas-ai",
  },
  {
    id: "trust",
    title: "Verify the trust score breakdown updates",
    hint: "After submitting evidence, the project's trust breakdown panel should reflect the new points.",
    to: "/impact",
  },
];

function SmokeTest() {
  const { user } = useAuth();
  const { data: evidence = [] } = useQuery(evidenceQuery);
  const [state, setState] = useState<Record<string, Status>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  function set(id: string, s: Status) {
    setState((prev) => {
      const next = { ...prev, [id]: s };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function reset() {
    setState({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  const total = steps.length;
  const passed = steps.filter((s) => state[s.id] === "pass").length;
  const failed = steps.filter((s) => state[s.id] === "fail").length;
  const mineCount = user ? evidence.filter((e) => e.uploader_id === user.id).length : 0;

  return (
    <PageShell>
      <PageHeader
        eyebrow="QA"
        title="Smoke-test the verification flow."
        description="Walk the upload form, the evidence detail page, persistence after refresh, and Atlas AI citation click-through. Track pass/fail as you go."
      />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Steps" value={`${passed + failed}/${total}`} />
            <Stat label="Passed" value={String(passed)} tone="moss" />
            <Stat label="Failed" value={String(failed)} tone="earth" />
            <Stat
              label="My evidence rows"
              value={String(mineCount)}
              hint={user ? "in backend" : "sign in first"}
            />
          </div>

          <ol className="space-y-3">
            {steps.map((s, i) => {
              const status = state[s.id] ?? "todo";
              const blocked = s.requiresAuth && !user;
              return (
                <li
                  key={s.id}
                  className={`rounded-2xl bg-card p-5 ring-1 transition-colors ${
                    status === "pass"
                      ? "ring-moss/40"
                      : status === "fail"
                        ? "ring-earth/50"
                        : "ring-ink/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sand-deep font-mono text-[11px] text-ink/55">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium text-ink">{s.title}</h3>
                        <StatusBadge s={status} />
                        {blocked && (
                          <span className="rounded-full bg-earth-soft px-2 py-0.5 font-mono text-[10px] text-earth">
                            sign-in required
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-ink/60">{s.hint}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {s.to && (
                          <Link
                            to={s.to}
                            className="rounded-full border border-ink/10 bg-sand px-3 py-1.5 font-mono text-[11px] text-ink/70 hover:bg-sand-deep"
                          >
                            Open route →
                          </Link>
                        )}
                        <button
                          onClick={() => set(s.id, "pass")}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-mono text-[11px] ring-1 ${
                            status === "pass"
                              ? "bg-moss text-sand ring-moss"
                              : "bg-card text-moss ring-moss/30 hover:bg-moss-soft"
                          }`}
                        >
                          <CheckCircle2 className="size-3" /> Pass
                        </button>
                        <button
                          onClick={() => set(s.id, "fail")}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-mono text-[11px] ring-1 ${
                            status === "fail"
                              ? "bg-earth text-sand ring-earth"
                              : "bg-card text-earth ring-earth/30 hover:bg-earth-soft"
                          }`}
                        >
                          <XCircle className="size-3" /> Fail
                        </button>
                        {status !== "todo" && (
                          <button
                            onClick={() => set(s.id, "todo")}
                            className="font-mono text-[11px] text-ink/40 hover:text-ink"
                          >
                            clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="flex items-center justify-between rounded-2xl bg-sand-deep/50 px-5 py-3">
            <p className="font-mono text-[11px] text-ink/55">
              State persists in your browser via localStorage. Use this between dev sessions.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-card px-3 py-1.5 font-mono text-[11px] text-ink/70 hover:bg-sand"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "moss" | "earth";
  hint?: string;
}) {
  const color = tone === "moss" ? "text-moss" : tone === "earth" ? "text-earth" : "text-ink";
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-ink/5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/45">{label}</p>
      <p className={`mt-1 font-serif text-2xl ${color}`}>{value}</p>
      {hint && <p className="mt-0.5 font-mono text-[10px] text-ink/40">{hint}</p>}
    </div>
  );
}

function StatusBadge({ s }: { s: Status }) {
  if (s === "pass")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-moss-soft px-2 py-0.5 font-mono text-[10px] text-moss">
        <CheckCircle2 className="size-3" /> pass
      </span>
    );
  if (s === "fail")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-earth-soft px-2 py-0.5 font-mono text-[10px] text-earth">
        <XCircle className="size-3" /> fail
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sand-deep px-2 py-0.5 font-mono text-[10px] text-ink/55">
      <Circle className="size-3" /> todo
    </span>
  );
}
