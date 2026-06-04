import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Download, FileText, MapPin, Radio, Upload, Users, Video } from "lucide-react";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { TrustBreakdown } from "@/components/TrustBreakdown";
import {
  evidenceQuery,
  projectsQuery,
  transactionsQuery,
  trustQuery,
} from "@/lib/atlas-queries";
import type { EvidenceKind } from "@/lib/atlas-types";
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

const filters: { id: "ALL" | EvidenceKind; label: string }[] = [
  { id: "ALL", label: "All sources" },
  { id: "GPS", label: "GPS" },
  { id: "PHOTO", label: "Photos" },
  { id: "VIDEO", label: "Video" },
  { id: "IoT", label: "IoT" },
  { id: "REPORT", label: "Field reports" },
  { id: "BENEFICIARY", label: "Beneficiary acks" },
];

function Impact() {
  const { data: evidence = [] } = useQuery(evidenceQuery);
  const { data: projects = [] } = useQuery(projectsQuery);
  const { data: txs = [] } = useQuery(transactionsQuery);
  const { data: trust = [] } = useQuery(trustQuery);
  const [filter, setFilter] = useState<"ALL" | EvidenceKind>("ALL");

  const visible = filter === "ALL" ? evidence : evidence.filter((e) => e.kind === filter);

  // Aggregate breakdown across all projects for a network-wide panel
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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 transition-colors ${
                    filter === f.id ? "bg-ink text-sand ring-ink" : "bg-card text-ink/70 ring-ink/10 hover:bg-sand-deep"
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
                onClick={() => exportEvidenceCsv(evidence)}
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
                  <li className="px-6 py-12 text-center text-sm text-ink/50">No evidence yet.</li>
                )}
                {visible.map((e) => {
                  const Icon = iconFor[e.kind];
                  const project = projects.find((p) => p.id === e.project_id);
                  const isAudit = e.kind === "REPORT";
                  return (
                    <li key={e.id} className="flex items-center gap-4 px-6 py-5">
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
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-ink/45">
                          {e.meta}
                          {project && <> · <Link to="/projects/$id" params={{ id: project.slug }} className="text-ink/60 hover:text-moss">{project.title}</Link></>}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] text-ink/40">{relativeTime(e.captured_at)}</span>
                    </li>
                  );
                })}
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
