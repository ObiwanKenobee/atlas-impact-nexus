import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { logError } from "./lib/error-log";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  if (typeof window !== "undefined") {
    logError({
      message: error.message,
      stack: error.stack,
      userId: null,
      source: "react_boundary",
    });
  }
  return (
    <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 18, marginBottom: 8 }}>This page didn't load</h1>
      <p style={{ color: "#6b7280", marginBottom: 16, fontSize: 14 }}>{error.message}</p>
      <button
        onClick={() => reset()}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: 6,
          background: "#111",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });

  // Capture router-level navigation/loader errors into the dev incident log.
  if (typeof window !== "undefined") {
    router.subscribe("onResolved", (event) => {
      const matches = (event as { matches?: Array<{ error?: unknown }> }).matches;
      if (!matches) return;
      for (const m of matches) {
        if (m.error) {
          const err = m.error as Error;
          logError({
            message: err?.message ?? String(m.error),
            stack: err?.stack,
            userId: null,
            source: "react_boundary",
          });
        }
      }
    });
  }

  return router;
};
