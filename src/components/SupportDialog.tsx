import * as Dialog from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Heart, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { fundProject } from "@/lib/atlas.functions";
import { qk } from "@/lib/atlas-queries";
import type { ProjectRow } from "@/lib/atlas-types";

export function SupportDialog({
  project,
  trigger,
}: {
  project: ProjectRow;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(100);
  const [donorName, setDonorName] = useState("");
  const [busy, setBusy] = useState(false);
  const presets = [50, 100, 250, 500, 1000];
  const { user } = useAuth();
  const fund = useServerFn(fundProject);
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function submit() {
    if (!amount || amount <= 0) return;
    if (!user) {
      toast.error("Please sign in to fund a project.");
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      const tx = await fund({
        data: {
          project_id: project.id,
          amount_cents: Math.round(amount * 100),
          donor_name: donorName.trim() || null,
        },
      });
      toast.success(`Routed $${amount.toLocaleString()} to ${project.title}`, {
        description: `Receipt ${tx.receipt_number} · ledger updated.`,
        action: {
          label: "View receipt",
          onClick: () => navigate({ to: "/receipts/$id", params: { id: tx.receipt_number } }),
        },
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: qk.projects }),
        qc.invalidateQueries({ queryKey: qk.transactions }),
        qc.invalidateQueries({ queryKey: qk.evidence }),
        qc.invalidateQueries({ queryKey: qk.trust }),
      ]);
      setOpen(false);
      navigate({ to: "/receipts/$id", params: { id: tx.receipt_number } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Funding failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-7 ring-1 ring-ink/10 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <Dialog.Close className="absolute right-4 top-4 rounded-full p-1 text-ink/45 hover:bg-sand-deep">
            <X className="size-4" />
          </Dialog.Close>
          <p className="font-mono text-[10px] uppercase tracking-widest text-moss">
            Support · {project.category}
          </p>
          <Dialog.Title className="mt-2 font-serif text-2xl leading-snug">
            Fund {project.title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-ink/65">
            Every dollar is recorded on the verification ledger. Estimated reach: ~1
            beneficiary per $20 of funding.
          </Dialog.Description>

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              {presets.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 transition-colors ${
                    amount === v
                      ? "bg-ink text-sand ring-ink"
                      : "bg-sand text-ink/70 ring-ink/10 hover:bg-sand-deep"
                  }`}
                >
                  ${v}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                Custom amount (USD)
              </span>
              <input
                type="number"
                min={1}
                max={100000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl bg-sand-deep px-4 py-3 font-serif text-2xl tabular-nums ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                Donor name (optional, shows on receipt)
              </span>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value.slice(0, 120))}
                placeholder="Anonymous donor"
                className="mt-1 w-full rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-medium text-sand transition-colors hover:bg-moss disabled:opacity-60"
          >
            <Heart className="size-4" />
            {busy ? "Routing…" : `Route $${amount.toLocaleString()} to project`}
          </button>
          {!user && (
            <p className="mt-3 text-center font-mono text-[10px] text-earth">
              Sign in required · you'll be redirected
            </p>
          )}
          <p className="mt-2 text-center font-mono text-[10px] text-ink/40">
            Demo flow · no real payment is processed
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
