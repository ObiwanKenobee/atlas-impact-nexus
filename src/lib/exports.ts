import { jsPDF } from "jspdf";
import type { EvidenceRow, ProjectRow, TransactionRow, TrustBreakdownRow } from "./atlas-types";
import { trustScore } from "./atlas-types";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export function exportEvidenceCsv(rows: EvidenceRow[], trustImpact?: (r: EvidenceRow) => number) {
  const out = rows.map((r) => ({
    id: r.id,
    project_id: r.project_id,
    kind: r.kind,
    title: r.title,
    meta: r.meta ?? "",
    lat: r.lat ?? "",
    lng: r.lng ?? "",
    media_url: r.media_url ?? "",
    iot_payload: r.iot_payload ?? "",
    report_text: r.report_text ?? "",
    captured_at: r.captured_at,
    trust_impact_points: trustImpact ? Number(trustImpact(r).toFixed(2)) : "",
  }));
  download("atlas-evidence-ledger.csv", toCsv(out as unknown as Record<string, unknown>[]), "text/csv");
}

export function exportEvidencePdf(args: {
  rows: EvidenceRow[];
  filterSummary: string;
  trustImpact: (r: EvidenceRow) => number;
  projectTitle?: (id: string) => string;
}) {
  const { rows, filterSummary, trustImpact, projectTitle } = args;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.setFont("times", "normal");

  doc.setFontSize(10);
  doc.text("ATLAS SANCTUM · EVIDENCE EXPORT", 56, 64);
  doc.setLineWidth(0.5);
  doc.line(56, 72, 540, 72);

  doc.setFontSize(18);
  doc.text("Filtered evidence ledger", 56, 100);
  doc.setFontSize(10);
  doc.text(filterSummary, 56, 118, { maxWidth: 484 });
  doc.text(`Generated ${new Date().toLocaleString()} · ${rows.length} entries`, 56, 134);

  const totalImpact = rows.reduce((s, r) => s + trustImpact(r), 0);
  doc.setFontSize(11);
  doc.text(`Total trust-score impact: ${totalImpact.toFixed(1)} pts`, 56, 158);

  doc.setFontSize(9);
  let y = 188;
  doc.text("DATE        KIND        TITLE", 56, y);
  doc.text("PROJECT", 360, y);
  doc.text("IMPACT", 500, y);
  y += 6;
  doc.line(56, y, 540, y);
  y += 12;

  rows.forEach((r) => {
    if (y > 740) {
      doc.addPage();
      y = 64;
    }
    const date = new Date(r.captured_at).toISOString().slice(0, 10);
    const title = r.title.length > 38 ? `${r.title.slice(0, 35)}…` : r.title;
    const pTitle = projectTitle?.(r.project_id) ?? r.project_id;
    const pShort = pTitle.length > 22 ? `${pTitle.slice(0, 20)}…` : pTitle;
    doc.text(`${date}  ${r.kind.padEnd(10)} ${title}`, 56, y);
    doc.text(pShort, 360, y);
    doc.text(`+${trustImpact(r).toFixed(1)}`, 500, y);
    y += 14;
  });

  doc.save(`atlas-evidence-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportTransactionsCsv(rows: TransactionRow[]) {
  download(
    "atlas-transactions.csv",
    toCsv(
      rows.map((r) => ({
        receipt: r.receipt_number,
        project_id: r.project_id,
        donor: r.donor_name ?? "—",
        amount_usd: (r.amount_cents / 100).toFixed(2),
        created_at: r.created_at,
      })),
    ),
    "text/csv",
  );
}

export function exportReceiptPdf(args: {
  tx: TransactionRow;
  project: ProjectRow;
  breakdown?: TrustBreakdownRow | null;
}) {
  const { tx, project, breakdown } = args;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.setFont("times", "normal");

  doc.setFontSize(10);
  doc.text("ATLAS SANCTUM · COVENANT NEXUS", 56, 64);
  doc.setLineWidth(0.5);
  doc.line(56, 72, 540, 72);

  doc.setFontSize(22);
  doc.text("Donor Receipt", 56, 110);
  doc.setFontSize(10);
  doc.text(`Receipt #${tx.receipt_number}`, 56, 128);
  doc.text(new Date(tx.created_at).toLocaleString(), 56, 142);

  doc.setFontSize(11);
  doc.text("Project", 56, 184);
  doc.setFontSize(14);
  doc.text(project.title, 56, 204);
  doc.setFontSize(10);
  doc.text(`${project.category} · ${project.location}`, 56, 220);

  doc.setFontSize(11);
  doc.text("Donor", 56, 256);
  doc.setFontSize(13);
  doc.text(tx.donor_name ?? "Anonymous donor", 56, 274);

  doc.setFontSize(11);
  doc.text("Amount", 360, 184);
  doc.setFontSize(28);
  doc.text(`$${(tx.amount_cents / 100).toLocaleString()}`, 360, 218);

  doc.setLineWidth(0.5);
  doc.line(56, 304, 540, 304);
  doc.setFontSize(11);
  doc.text("Verification snapshot", 56, 328);
  doc.setFontSize(10);
  const lines = [
    `Project verification score: ${project.verified_score}%`,
    `Total raised: $${(project.raised_cents / 100).toLocaleString()} of $${(project.goal_cents / 100).toLocaleString()}`,
    `Beneficiaries reached: ${project.beneficiaries.toLocaleString()}`,
    `Active donors: ${project.donors.toLocaleString()}`,
  ];
  if (breakdown) {
    lines.push(
      `Trust composition — GPS ${breakdown.gps_points}pt · Media/IoT ${breakdown.media_points}pt · Beneficiaries ${breakdown.beneficiary_points}pt · Audits ${breakdown.report_points}pt (total ${trustScore(breakdown)}%)`,
    );
  }
  lines.forEach((l, i) => doc.text(l, 56, 350 + i * 16, { maxWidth: 484 }));

  doc.setFontSize(8);
  doc.text(
    "This receipt is recorded on the Atlas Sanctum verification ledger. Demo transaction — not a tax document.",
    56,
    720,
    { maxWidth: 484 },
  );
  doc.save(`atlas-receipt-${tx.receipt_number}.pdf`);
}

export function exportProjectSummaryPdf(args: {
  project: ProjectRow;
  breakdown?: TrustBreakdownRow | null;
  evidence: EvidenceRow[];
}) {
  const { project, breakdown, evidence } = args;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.setFont("times", "normal");

  doc.setFontSize(10);
  doc.text("ATLAS SANCTUM · IMPACT SUMMARY", 56, 64);
  doc.line(56, 72, 540, 72);

  doc.setFontSize(20);
  doc.text(project.title, 56, 104);
  doc.setFontSize(10);
  doc.text(`${project.category} · ${project.location}`, 56, 120);

  doc.setFontSize(11);
  doc.text(`Raised  $${(project.raised_cents / 100).toLocaleString()}`, 56, 156);
  doc.text(`Goal    $${(project.goal_cents / 100).toLocaleString()}`, 56, 174);
  doc.text(`Donors  ${project.donors}`, 56, 192);
  doc.text(`Reach   ${project.beneficiaries.toLocaleString()}`, 56, 210);
  doc.text(`Trust   ${project.verified_score}%`, 56, 228);

  if (project.long_description) {
    doc.setFontSize(10);
    doc.text(project.long_description, 56, 260, { maxWidth: 484 });
  }

  if (breakdown) {
    doc.setFontSize(11);
    doc.text("Trust score breakdown", 56, 360);
    doc.setFontSize(10);
    const lines = [
      `GPS confirmations:        ${breakdown.gps_count} entries · ${breakdown.gps_points}/28 pts`,
      `Media & IoT completeness: ${breakdown.media_count} entries · ${breakdown.media_points}/22 pts`,
      `Beneficiary acks:         ${breakdown.beneficiary_count} entries · ${breakdown.beneficiary_points}/26 pts`,
      `Independent audits:       ${breakdown.report_count} entries · ${breakdown.report_points}/24 pts`,
    ];
    lines.forEach((l, i) => doc.text(l, 56, 382 + i * 16));
  }

  doc.setFontSize(11);
  doc.text("Recent evidence", 56, 480);
  doc.setFontSize(9);
  evidence.slice(0, 12).forEach((e, i) => {
    const y = 500 + i * 16;
    const date = new Date(e.captured_at).toISOString().slice(0, 10);
    doc.text(`${date} · ${e.kind.padEnd(11)} · ${e.title}`, 56, y, { maxWidth: 484 });
  });

  doc.save(`atlas-summary-${project.slug}.pdf`);
}

export function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""}`;
  return new Date(iso).toLocaleDateString();
}
