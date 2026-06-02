import * as Dialog from "@radix-ui/react-dialog";
import { X, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { atlasStore, type Project } from "@/lib/atlas-store";

export function SupportDialog({
  project,
  trigger,
}: {
  project: Project;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(100);

  const presets = [50, 100, 250, 500, 1000];

  function submit() {
    if (!amount || amount <= 0) return;
    atlasStore.fundProject(project.id, amount);
    toast.success(`Thank you. $${amount.toLocaleString()} routed to ${project.title}.`, {
      description: "A ledger entry was added and impact metrics updated.",
    });
    setOpen(false);
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
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl bg-sand-deep px-4 py-3 font-serif text-2xl tabular-nums ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
              />
            </label>
          </div>

          <button
            onClick={submit}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-medium text-sand transition-colors hover:bg-moss"
          >
            <Heart className="size-4" />
            Route ${amount.toLocaleString()} to project
          </button>
          <p className="mt-3 text-center font-mono text-[10px] text-ink/40">
            Demo flow · no real payment is processed
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
