export function SiteFooter() {
  return (
    <footer className="border-t border-ink/5 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex items-center gap-2 opacity-60">
          <div className="size-5 bg-ink flex items-center justify-center rounded-sm">
            <div className="size-1.5 bg-sand rotate-45" />
          </div>
          <span className="font-serif text-sm font-semibold tracking-tight">
            Atlas Sanctum
          </span>
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-xs text-ink/50 hover:text-ink">Terms of Stewardship</a>
          <a href="#" className="text-xs text-ink/50 hover:text-ink">Privacy Policy</a>
          <a href="#" className="text-xs text-ink/50 hover:text-ink">Protocol Specs</a>
        </div>
        <p className="text-xs text-ink/40 font-mono">© 2026 · Ledger of mercy</p>
      </div>
    </footer>
  );
}
