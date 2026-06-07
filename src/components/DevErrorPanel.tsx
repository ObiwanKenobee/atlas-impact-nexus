import { useEffect, useState } from "react";
import { AlertTriangle, X, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  clearErrorLog,
  installClientErrorListeners,
  subscribeErrorLog,
  type ErrorLogEntry,
} from "@/lib/error-log";

export function DevErrorPanel() {
  const [entries, setEntries] = useState<ErrorLogEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    installClientErrorListeners();
    return subscribeErrorLog(setEntries);
  }, []);

  if (!import.meta.env.DEV) return null;
  if (dismissed || entries.length === 0) {
    if (entries.length === 0) return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 99999,
        width: open ? 420 : 260,
        maxHeight: open ? "60vh" : 56,
        fontFamily: "ui-monospace, SFMono-Regular, monospace",
        fontSize: 12,
        background: "#0b0b14",
        color: "#fafafa",
        border: "1px solid #4f46e5",
        borderRadius: 10,
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          background: "#1a1a2e",
          cursor: "pointer",
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <AlertTriangle size={14} color="#fbbf24" />
        <strong style={{ flex: 1 }}>
          Runtime errors ({entries.length})
        </strong>
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearErrorLog();
          }}
          title="Clear log"
          style={iconBtn}
        >
          <Trash2 size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          title="Hide"
          style={iconBtn}
        >
          <X size={12} />
        </button>
      </div>
      {open && (
        <div style={{ overflow: "auto", padding: 8 }}>
          {entries.map((e) => (
            <div
              key={e.id}
              style={{
                padding: 8,
                marginBottom: 6,
                background: "#141432",
                borderRadius: 6,
                borderLeft: "3px solid #ef4444",
              }}
            >
              <div style={{ color: "#a5b4fc", fontSize: 10 }}>
                {new Date(e.at).toLocaleTimeString()} · {e.source} · {e.route}
                {e.userId && ` · user:${e.userId.slice(0, 8)}`}
              </div>
              <div style={{ marginTop: 4, color: "#fecaca" }}>{e.message}</div>
              {e.stack && (
                <pre
                  style={{
                    marginTop: 4,
                    maxHeight: 120,
                    overflow: "auto",
                    fontSize: 10,
                    color: "#cbd5e1",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {e.stack}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: "transparent",
  color: "#fafafa",
  border: "1px solid #4f46e5",
  borderRadius: 4,
  padding: "2px 4px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
};
