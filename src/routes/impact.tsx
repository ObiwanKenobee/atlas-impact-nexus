import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownUp, Camera, Download, FileText, MapPin, Radio, Upload, Users, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { TrustBreakdown } from "@/components/TrustBreakdown";
import {
  evidenceQuery,
  projectsQuery,
  transactionsQuery,
  trustQuery,
} from "@/lib/atlas-queries";
import type { EvidenceKind, EvidenceRow } from "@/lib/atlas-types";
import { TRUST_WEIGHTS } from "@/lib/atlas-types";
import { exportEvidenceCsv, exportTransactionsCsv, relativeTime } from "@/lib/exports";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact Verification — Atlas Sanctum" },
      { name: "description", content: "GPS, IoT, photo, video and field-report evidence powering every verification score." },
      { property: "og:title", content: "Atlas Sanctum · Impact Verification" },
      { property: "og:description", content: "Live ledger of field evidence with weighted trust scoring." },
    ],
  }),
  component: Impact,
});

const iconFor: Record<EvidenceKind, typeof MapPin> = {
  GPS: MapPin,
  IoT: Radio,
  PHOTO: Camera,
  VIDEO: Video,
  REPORT: FileText,
  BENEFICIARY: Users,
};

const kindFilters: { id: "ALL" | EvidenceKind; label: string }[] = [
  { id: "ALL", label: "All sources" },
  { id: "GPS", label: "GPS" },
  { id: "PHOTO", label: "Photos" },
  { id: "VIDEO", label: "Video" },
  { id: "IoT", label: "IoT" },
  { id: "REPORT", label: "Reports" },
  { id: "BENEFICIARY", label: "Beneficiary" },
];

type SortKey = "recent" | "oldest" | "trust" | "kind";

// Trust-impact weight per entry kind — mirrors TRUST_WEIGHTS / max evidence per pillar.
function trustImpact(kind: EvidenceKind): number {
  switch (kind) {
    case "GPS":
      return TRUST_WEIGHTS.gps / 8;
    case "PHOTO":
    case "VIDEO":
    case "IoT":
      return TRUST_WEIGHTS.media / 12;
    case "BENEFICIARY":
      return TRUST_WEIGHTS.beneficiary / 10;
    case "REPORT":
      return TRUST_WEIGHTS.report / 6;
  }
}

function Impact() {
  const { data: evidence = [] } = useQuery(evidenceQuery);
  const { data: projects = [] } = useQuery(projectsQuery);
  const { data: txs = [] } = useQuery(transactionsQuery);
  const { data: trust = [] } = useQuery(trustQuery);

  const [kindFilter, setKindFilter] = useState<"ALL" | EvidenceKind>("ALL");
  const [projectFilter, setProjectFilter] = useState<string>("ALL");
  const [days, setDays] = useState<string>("ALL");
  const [sort, setSort] = useState<SortKey>("recent");

  const visible = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const maxAge = days === "ALL" ? Infinity : Number(days) * dayMs;
    const filtered = evidence.filter((e) => {
      if (kindFilter !== "ALL" && e.kind !== kindFilter) return false;
      if (projectFilter !== "ALL" && e.project_id !== projectFilter) return false;
      if (now - new Date(e.captured_at).getTime() > maxAge) return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "recent")
        return new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime();
      if (sort === "oldest")
        return new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime();
      if (sort === "trust") return trustImpact(b.kind) - trustImpact(a.kind);
      return a.kind.localeCompare(b.kind);
    });
    return sorted;
  }, [evidence, kindFilter, projectFilter, days, sort]);

  const aggregate = trust.reduce(
    (acc, t) => ({
      project_id: "network",
      gps_count: acc.gps_count + t.gps_count,
      media_count: acc.media_count + t.media_count,
      beneficiary_count: acc.beneficiary_count + t.beneficiary_count,
      report_count: acc.report_count + t.report_count,
      gps_points: Math.min(28, acc.gps_points + t.gps_points / Math.max(1, trust.length)),
      media_points: Math.min(22, acc.media_points + t.media_points / Math.max(1, trust.length)),
      beneficiary_points: Math.min(26, acc.beneficiary_points + t.beneficiary_points / Math.max(1, trust.length)),
      report_points: Math.min(24, acc.report_points + t.report_points / Math.max(1, trust.length)),
    }),
    { project_id: "network", gps_count: 0, media_count: 0, beneficiary_count: 0, report_count: 0, gps_points: 0, media_points: 0, beneficiary_points: 0, report_points: 0 },
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Verification Dashboard"
        title="Proof, not promises."
        description="A continuous feed of evidence from the field, weighted into a single project trust score."
      />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {kindFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setKindFilter(f.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 transition-colors ${
                    kindFilter === f.id ? "bg-ink text-sand ring-ink" : "bg-card text-ink/70 ring-ink/10 hover:bg-sand-deep"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/impact/upload"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-sand hover:bg-moss"
              >
                <Upload className="size-3.5" /> Upload evidence
              </Link>
              <button
                onClick={() => exportEvidenceCsv(visible)}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-card px-3.5 py-1.5 text-xs font-medium hover:bg-sand-deep"
              >
                <Download className="size-3.5" /> Ledger CSV
              </button>
              <button
                onClick={() => exportTransactionsCsv(txs)}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-card px-3.5 py-1.5 text-xs font-medium hover:bg-sand-deep"
              >
                <Download className="size-3.5" /> Transactions CSV
              </button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-ink/5">
            <Picker label="Project" value={projectFilter} onChange={setProjectFilter}>
              <option value="ALL">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Picker>
            <Picker label="Window" value={days} onChange={setDays}>
              <option value="ALL">All time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Picker>
            <Picker label="Sort" value={sort} onChange={(v) => setSort(v as SortKey)}>
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="trust">Trust-score impact</option>
              <option value="kind">Evidence type</option>
            </Picker>
            <span className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-ink/45">
              <ArrowDownUp className="size-3" /> {visible.length} of {evidence.length} entries
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl bg-card ring-1 ring-ink/5">
              <div className="flex items-center justify-between border-b border-ink/5 px-6 py-4">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Evidence Stream · Live</p>
                <span className="flex items-center gap-2 font-mono text-[11px] text-moss">
                  <span className="size-1.5 rounded-full bg-moss" />
                  {visible.length} entries
                </span>
              </div>
              <ul className="divide-y divide-ink/5">
                {visible.length === 0 && (
                  <li className="px-6 py-12 text-center text-sm text-ink/50">
                    No evidence matches these filters yet.
                  </li>
                )}
                {visible.map((e) => (
                  <EvidenceItem key={e.id} e={e} project={projects.find((p) => p.id === e.project_id)} />
                ))}
              </ul>
            </div>

            <aside className="space-y-6">
              <TrustBreakdown breakdown={aggregate} />
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function EvidenceItem({
  e,
  project,
}: {
  e: EvidenceRow;
  project: { slug: string; title: string } | undefined;
}) {
  const Icon = iconFor[e.kind];
  const isAudit = e.kind === "REPORT";
  return (
    <li className="flex items-center gap-4 px-6 py-5">
      <div
        className={`grid size-10 place-items-center rounded-xl ${
          isAudit ? "bg-earth-soft text-earth" : "bg-moss-soft text-moss"
        }`}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-mono text-[10px] font-semibold tracking-widest ${isAudit ? "text-earth" : "text-moss"}`}>
            {e.kind}
          </span>
          <Link
            to="/impact/evidence/$id"
            params={{ id: e.id }}
            className="text-sm font-medium hover:text-moss"
          >
            {e.title}
          </Link>
          <span
            className="rounded-full bg-sand-deep px-2 py-0.5 font-mono text-[10px] text-ink/55"
            title="Estimated contribution to project trust score"
          >
            +{trustImpact(e.kind).toFixed(1)} pts
          </span>
        </div>
        <p className="mt-1 font-mono text-[11px] text-ink/45">
          {e.meta}
          {project && (
            <>
              {" "}
              ·{" "}
              <Link to="/projects/$id" params={{ id: project.slug }} className="text-ink/60 hover:text-moss">
                {project.title}
              </Link>
            </>
          )}
        </p>
      </div>
      <span className="font-mono text-[11px] text-ink/40">{relativeTime(e.captured_at)}</span>
    </li>
  );
}

function Picker({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg bg-sand-deep px-3 py-1.5 text-xs ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
      >
        {children}
      </select>
    </label>
  );
}
