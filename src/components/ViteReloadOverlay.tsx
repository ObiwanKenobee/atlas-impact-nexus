import { useEffect, useState } from "react";

// Shows a thin progress bar at the top of the screen during Vite dependency
// re-optimization (when virtual chunks may temporarily 404 and produce a
// blank screen on navigation). Auto-hides on full reload.
export function ViteReloadOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV || !import.meta.hot) return;
    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    import.meta.hot.on("vite:beforeUpdate", show);
    import.meta.hot.on("vite:beforeFullReload", show);
    import.meta.hot.on("vite:afterUpdate", hide);
    import.meta.hot.on("vite:error", show);

    return () => {
      import.meta.hot?.off("vite:beforeUpdate", show);
      import.meta.hot?.off("vite:beforeFullReload", show);
      import.meta.hot?.off("vite:afterUpdate", hide);
      import.meta.hot?.off("vite:error", show);
    };
  }, []);

  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 99998,
        background:
          "linear-gradient(90deg,transparent,#4f46e5 30%,#a78bfa 60%,transparent)",
        backgroundSize: "200% 100%",
        animation: "vite-reload-shimmer 1s linear infinite",
      }}
    >
      <style>{`@keyframes vite-reload-shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }`}</style>
    </div>
  );
}
