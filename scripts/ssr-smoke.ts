/**
 * SSR smoke test — renders critical routes through the TanStack Start
 * server entry and fails (exit code 1) if any returns a 5xx or the
 * recovery-page fallback. Run with:  bun run ssr-smoke
 *
 * Resolves real seeded evidence IDs from the database when reachable, so
 * the authenticated detail route is tested against actual data. Falls back
 * to a deterministic placeholder id when no DB is configured (e.g. in CI
 * without secrets) — the route must still SSR without throwing.
 */
import handler from "../src/server";

const BASE = "http://localhost";

async function resolveSeededEvidenceIds(): Promise<string[]> {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/evidence?select=id&limit=3`, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as { id: string }[];
    return rows.map((r) => r.id);
  } catch {
    return [];
  }
}

async function check(label: string, req: Request): Promise<boolean> {
  try {
    const res = await handler.fetch(req, {}, {});
    const body = await res.text();
    const isRecovery = body.includes("This page didn't load");
    const ok = res.status < 500 && !isRecovery;
    console.log(
      `${ok ? "✓" : "✗"} ${res.status} ${label}${isRecovery ? " (recovery page)" : ""}`,
    );
    if (!ok) console.log(body.slice(0, 400));
    return ok;
  } catch (err) {
    console.log(`✗ THREW ${label}`, err);
    return false;
  }
}

const seeded = await resolveSeededEvidenceIds();
const evidenceIds = seeded.length
  ? seeded
  : ["00000000-0000-0000-0000-000000000001"];

const checks: Array<[string, Request]> = [
  ["/", new Request(BASE + "/")],
  ["/impact", new Request(BASE + "/impact")],
  ["/auth", new Request(BASE + "/auth")],
  // _authenticated layout uses ssr:false but the shell must still render.
  ["GET /impact/upload", new Request(BASE + "/impact/upload")],
  [
    "POST /impact/upload",
    new Request(BASE + "/impact/upload", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "noop=1",
    }),
  ],
  ...evidenceIds.map(
    (id) =>
      [
        `/impact/evidence/${id.slice(0, 8)}…`,
        new Request(`${BASE}/impact/evidence/${id}`),
      ] as [string, Request],
  ),
];

let failed = 0;
for (const [label, req] of checks) {
  const ok = await check(label, req);
  if (!ok) failed++;
}

if (failed > 0) {
  console.error(`\nSSR smoke: ${failed} route(s) failed`);
  process.exit(1);
}
console.log(`\nSSR smoke: all ${checks.length} routes rendered`);
