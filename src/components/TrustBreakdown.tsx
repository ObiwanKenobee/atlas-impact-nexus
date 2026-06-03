import { CheckCircle2 } from "lucide-react";
import { TRUST_WEIGHTS, trustScore, type TrustBreakdownRow } from "@/lib/atlas-types";

const rows = [
  { key: "gps", label: "GPS Confirmations", desc: "Field-team check-ins with verified coordinates" },
  { key: "media", label: "Media & IoT Completeness", desc: "Photos, video and live sensor telemetry" },
  { key: "beneficiary", label: "Beneficiary Acknowledgements", desc: "Confirmed reach via beneficiary acks" },
  { key: "report", label: "Independent Audits", desc: "Third-party reviews + chain-of-custody reports" },
] as const;

export function TrustBreakdown({
  breakdown,
  className,
  compact,
}: {
  breakdown: TrustBreakdownRow | undefined;
  className?: string;
  compact?: boolean;
}) {
  const safe: TrustBreakdownRow = breakdown ?? {
    project_id: "",
    gps_count: 0,
    media_count: 0,
    beneficiary_count: 0,
    report_count: 0,
    gps_points: 0,
    media_points: 0,
    beneficiary_points: 0,
    report_points: 0,
  };
  const score = trustScore(safe);

  return (
    <div className={`rounded-2xl bg-ink p-7 text-sand ring-1 ring-ink/5 ${className ?? ""}`}>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-sand/50">
            Trust Score Breakdown
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-serif text-6xl font-medium tabular-nums">{score}</span>
            <span className="mb-3 font-mono text-sm text-moss">%</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-moss">
          <CheckCircle2 className="size-3.5" /> Live composition
        </span>
      </div>

      <div className="my-6 h-px bg-sand/10" />

      <ul className={compact ? "space-y-3" : "space-y-5"}>
        {rows.map((r) => {
          const count = safe[`${r.key}_count` as const];
          const points = safe[`${r.key}_points` as const];
          const weight = TRUST_WEIGHTS[r.key];
          const pct = Math.round((points / weight) * 100);
          return (
            <li key={r.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-sm text-sand/85">{r.label}</span>
                <span className="font-mono text-[11px] text-sand/55 tabular-nums">
                  {points}/{weight} pts
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand/10">
                <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${pct}%` }} />
              </div>
              {!compact && (
                <p className="mt-1.5 font-mono text-[10px] text-sand/45">
                  {count} entries · {r.desc}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
