import { createFileRoute } from "@tanstack/react-router";
import { Camera, CheckCircle2, FileText, MapPin, Radio, Video, Users } from "lucide-react";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { useAtlas, type EvidenceKind } from "@/lib/atlas-store";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact Verification — Atlas Sanctum" },
      { name: "description", content: "GPS, IoT, photo, video and field-report evidence powering every verification score." },
      { property: "og:title", content: "Atlas Sanctum · Impact Verification" },
      { property: "og:description", content: "GPS, IoT, photo, video and field-report evidence powering every verification score." },
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
  const evidence = useAtlas((s) => s.evidence);
  const projects = useAtlas((s) => s.projects);
  const [filter, setFilter] = useState<"ALL" | EvidenceKind>("ALL");

  const visible = filter === "ALL" ? evidence : evidence.filter((e) => e.kind === filter);

  const sources = [
    { label: "GPS Confirmations", value: evidence.filter((e) => e.kind === "GPS").length * 137, weight: 28 },
    { label: "Beneficiary Acknowledgements", value: evidence.filter((e) => e.kind === "BENEFICIARY").length * 350 + 2754, weight: 26 },
    { label: "IoT Sensor Readings", value: evidence.filter((e) => e.kind === "IoT").length * 4730 + 9460, weight: 22 },
    { label: "Independent Audits", value: evidence.filter((e) => e.kind === "REPORT").length * 11, weight: 24 },
  ];

  const score = Math.round(projects.reduce((s, p) => s + p.verified, 0) / projects.length);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Verification Dashboard"
        title="Proof, not promises."
        description="A continuous feed of evidence from the field, weighted into a single project trust score."
      />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap gap-2">
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
                {visible.map((e) => {
                  const Icon = iconFor[e.kind];
                  const project = projects.find((p) => p.id === e.projectId);
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
                          <span className="text-sm font-medium">{e.title}</span>
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-ink/45">
                          {e.meta}
                          {project && <> · <span className="text-ink/60">{project.title}</span></>}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] text-ink/40">{e.time}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl bg-ink p-8 text-sand ring-1 ring-ink/5">
                <p className="font-mono text-xs uppercase tracking-widest text-sand/50">Network Trust Score</p>
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-serif text-7xl font-medium tabular-nums">{score}</span>
                  <span className="mb-3 font-mono text-sm text-moss">%</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-sand/70">
                  <CheckCircle2 className="size-4 text-moss" />
                  Verified across all evidence channels
                </div>
                <div className="my-6 h-px bg-sand/10" />
                <ul className="space-y-4">
                  {sources.map((s) => (
                    <li key={s.label}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs text-sand/70">{s.label}</span>
                        <span className="font-mono text-[11px] text-sand/50">weight {s.weight}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-sand/10">
                        <div className="h-full rounded-full bg-moss" style={{ width: `${s.weight * 3.5}%` }} />
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-sand/40">{s.value.toLocaleString()} datapoints</p>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
