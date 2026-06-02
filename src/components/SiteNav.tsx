import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/communities", label: "Communities" },
  { to: "/projects", label: "Projects" },
  { to: "/impact", label: "Impact" },
  { to: "/atlas-ai", label: "Atlas AI" },
] as const;

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-ink/5 bg-sand/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-6 bg-moss flex items-center justify-center rounded-sm">
            <div className="size-2 bg-sand rotate-45" />
          </div>
          <span className="font-serif text-lg font-semibold tracking-tight text-ink">
            Atlas Sanctum
          </span>
        </Link>
        <div className="hidden gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-moss"
              activeProps={{ className: "text-moss" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-full bg-ink py-2 pr-4 pl-3 text-sm font-medium text-sand ring-1 ring-ink/10 transition-transform active:scale-95"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Fund Project
        </Link>
      </div>
    </nav>
  );
}
