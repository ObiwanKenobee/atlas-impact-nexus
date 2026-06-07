// Client-side runtime error log. Captures SSR/blank-screen incidents and
// in-render React errors, then exposes a tiny pub/sub for the dev panel.

export type ErrorLogEntry = {
  id: string;
  at: number;
  route: string;
  userId: string | null;
  message: string;
  stack?: string;
  source: "window.onerror" | "unhandledrejection" | "react_boundary" | "ssr";
};

const MAX_ENTRIES = 50;
let entries: ErrorLogEntry[] = [];
const listeners = new Set<(entries: ErrorLogEntry[]) => void>();

function notify() {
  for (const l of listeners) l([...entries]);
}

export function logError(entry: Omit<ErrorLogEntry, "id" | "at" | "route">) {
  const route =
    typeof window !== "undefined" ? window.location.pathname + window.location.search : "ssr";
  const full: ErrorLogEntry = {
    ...entry,
    id: Math.random().toString(36).slice(2, 10),
    at: Date.now(),
    route,
  };
  entries = [full, ...entries].slice(0, MAX_ENTRIES);
  notify();
  // eslint-disable-next-line no-console
  console.error("[error-log]", full.source, full.message, full.stack ?? "");
}

export function getErrorLog() {
  return entries;
}

export function clearErrorLog() {
  entries = [];
  notify();
}

export function subscribeErrorLog(cb: (entries: ErrorLogEntry[]) => void) {
  listeners.add(cb);
  cb([...entries]);
  return () => listeners.delete(cb);
}

let installed = false;
export function installClientErrorListeners() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (event) => {
    logError({
      message: event.message || String(event.error ?? "Unknown error"),
      stack: (event.error as Error | undefined)?.stack,
      userId: readUserId(),
      source: "window.onerror",
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as Error | unknown;
    logError({
      message:
        reason instanceof Error ? reason.message : String((reason as { message?: string })?.message ?? reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      userId: readUserId(),
      source: "unhandledrejection",
    });
  });
  // Detect post-hydration blank screen from SSR 500 fallback HTML
  if (document.title === "This page didn't load") {
    logError({
      message: "SSR returned recovery page (status 500)",
      userId: readUserId(),
      source: "ssr",
    });
  }
}

function readUserId(): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        return parsed?.user?.id ?? parsed?.currentSession?.user?.id ?? null;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}
