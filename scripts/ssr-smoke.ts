/**
 * SSR smoke test — renders critical routes through the TanStack Start
 * server entry and fails (exit code 1) if any returns a 5xx or the
 * recovery-page fallback. Run with:  bun scripts/ssr-smoke.ts
 */
import handler from "../src/server";

const ROUTES = [
  "/",
  "/impact",
  "/impact/upload",
  // Seeded evidence id from the migration — adjust if seeds change.
  "/impact/evidence/00000000-0000-0000-0000-000000000001",
];

const BASE = "http://localhost";

let failed = 0;
for (const path of ROUTES) {
  const url = BASE + path;
  try {
    const res = await handler.fetch(new Request(url), {}, {});
    const body = await res.text();
    const isRecovery = body.includes("This page didn't load");
    const ok = res.status < 500 && !isRecovery;
    console.log(`${ok ? "✓" : "✗"} ${res.status} ${path}${isRecovery ? " (recovery page)" : ""}`);
    if (!ok) {
      failed++;
      console.log(body.slice(0, 400));
    }
  } catch (err) {
    failed++;
    console.log(`✗ THREW ${path}`, err);
  }
}

if (failed > 0) {
  console.error(`\nSSR smoke: ${failed} route(s) failed`);
  process.exit(1);
}
console.log("\nSSR smoke: all routes rendered");
