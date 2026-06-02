import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-sand font-sans text-ink">
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="border-b border-ink/5 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium md:text-5xl text-balance max-w-[20ch]">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-[56ch] text-pretty text-base leading-relaxed text-ink/65">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
