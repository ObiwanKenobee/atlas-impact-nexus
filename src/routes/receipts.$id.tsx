import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Download } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { projectsQuery, receiptQuery, trustQuery } from "@/lib/atlas-queries";
import { exportReceiptPdf } from "@/lib/exports";

export const Route = createFileRoute("/receipts/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Receipt ${params.id} — Atlas Sanctum` },
      { name: "description", content: "Atlas Sanctum donor receipt with verification snapshot." },
    ],
  }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { id } = Route.useParams();
  const { data: tx, isLoading } = useQuery(receiptQuery(id));
  const { data: projects } = useQuery(projectsQuery);
  const { data: trust } = useQuery(trustQuery);

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center text-sm text-ink/55">Loading…</div>
      </PageShell>
    );
  }

  if (!tx) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="font-mono text-xs uppercase text-earth">Not found</p>
          <h1 className="mt-3 font-serif text-3xl">Receipt missing</h1>
        </div>
      </PageShell>
    );
  }

  const project = projects?.find((p) => p.id === tx.project_id);
  const breakdown = trust?.find((b) => b.project_id === tx.project_id);

  return (
    <PageShell>
      <section className="border-b border-ink/5 bg-sand-deep/50">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 font-mono text-xs text-ink/55 hover:text-moss">
            <ArrowLeft className="size-3.5" /> Dashboard
          </Link>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl bg-card p-10 ring-1 ring-ink/5">
          <div className="flex items-center gap-2 text-moss">
            <CheckCircle2 className="size-4" />
            <p className="font-mono text-[10px] uppercase tracking-widest">
              Donation confirmed · ledger entry recorded
            </p>
          </div>
          <h1 className="mt-4 font-serif text-4xl">Donor Receipt</h1>
          <p className="mt-1 font-mono text-xs text-ink/55">
            #{tx.receipt_number} · {new Date(tx.created_at).toLocaleString()}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/45">Donor</p>
              <p className="mt-1 font-serif text-xl">{tx.donor_name ?? "Anonymous donor"}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/45">Amount</p>
              <p className="mt-1 font-serif text-3xl text-moss tabular-nums">
                ${(tx.amount_cents / 100).toLocaleString()}
              </p>
            </div>
          </div>

          {project && (
            <div className="mt-8 rounded-xl bg-sand-deep p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/45">Project</p>
              <Link
                to="/projects/$id"
                params={{ id: project.slug }}
                className="mt-1 block font-serif text-xl font-medium hover:text-moss"
              >
                {project.title}
              </Link>
              <p className="mt-1 text-xs text-ink/55">{project.category} · {project.location}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <Stat label="Raised" value={`$${(project.raised_cents / 100).toLocaleString()}`} />
                <Stat label="Reach" value={project.beneficiaries.toLocaleString()} />
                <Stat label="Trust" value={`${project.verified_score}%`} />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => project && exportReceiptPdf({ tx, project, breakdown })}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-sand hover:bg-moss"
            >
              <Download className="size-4" /> Download PDF receipt
            </button>
            <Link
              to="/impact"
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-5 py-2.5 text-sm font-medium hover:bg-sand-deep"
            >
              See verification feed
            </Link>
          </div>

          <p className="mt-8 font-mono text-[10px] text-ink/40">
            Demo transaction — not a tax document. Atlas Sanctum verification ledger.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-widest text-ink/45">{label}</p>
      <p className="mt-1 font-serif text-base tabular-nums">{value}</p>
    </div>
  );
}
