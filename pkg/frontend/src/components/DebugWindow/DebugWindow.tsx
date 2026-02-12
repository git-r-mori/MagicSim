import { useCallback, useState } from "react";
import { DEBUG_WINDOW } from "@/config/constants";
import { useDebugKeys } from "@/hooks/useDebugKeys";
import { useDebugMouse } from "@/hooks/useDebugMouse";
import { useErrorLog } from "@/hooks/useErrorLog";
import { dispatchMapReset, usePlayerMovement } from "@/hooks/usePlayerMovement";

/** エラーログをクリップボードにコピーしてトースト表示 */
function copyErrorLogsToClipboard(logs: { timestamp: string; message: string; stack?: string }[]) {
  const text = logs
    .map((l) => `[${l.timestamp}] ${l.message}${l.stack ? `\n${l.stack}` : ""}`)
    .join("\n\n");
  return navigator.clipboard.writeText(text || "(ログなし)");
}

export function DebugWindow() {
  const keys = useDebugKeys();
  const mouseButtons = useDebugMouse();
  const { position, facing } = usePlayerMovement();
  const { logs, clearLogs } = useErrorLog(DEBUG_WINDOW.maxErrorLines);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopyClick = useCallback(async () => {
    try {
      await copyErrorLogsToClipboard(logs);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 800);
    } catch {
      setCopyFeedback(false);
    }
  }, [logs]);

  return (
    <div
      style={{
        position: "fixed",
        right: DEBUG_WINDOW.right,
        top: DEBUG_WINDOW.top,
        minWidth: DEBUG_WINDOW.minWidth,
        maxWidth: DEBUG_WINDOW.maxWidth,
        padding: DEBUG_WINDOW.padding,
        fontSize: DEBUG_WINDOW.fontSize,
        fontFamily: DEBUG_WINDOW.fontFamily,
        background: DEBUG_WINDOW.background,
        color: DEBUG_WINDOW.color,
        border: DEBUG_WINDOW.border,
        borderRadius: DEBUG_WINDOW.borderRadius,
        zIndex: DEBUG_WINDOW.zIndex,
        lineHeight: DEBUG_WINDOW.lineHeight,
        userSelect: "none",
        cursor: "default",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: DEBUG_WINDOW.sectionGap }}>Debug</div>

      <div style={{ marginBottom: DEBUG_WINDOW.sectionGap }}>
        <div style={{ opacity: 0.8 }}>Input</div>
        <div>keys: {keys.length > 0 ? keys.join(", ") : "(なし)"}</div>
        <div>mouse: {mouseButtons.length > 0 ? mouseButtons.join(", ") : "(なし)"}</div>
      </div>

      <div style={{ marginBottom: DEBUG_WINDOW.sectionGap }}>
        <div style={{ opacity: 0.8 }}>Player</div>
        <div>
          col={position.col}, row={position.row}, facing={facing}
        </div>
        <button
          type="button"
          onClick={() => dispatchMapReset()}
          style={{
            marginTop: 6,
            padding: "2px 8px",
            fontSize: 10,
            cursor: "pointer",
            background: "rgba(80,80,100,0.5)",
            border: "1px solid rgba(120,120,150,0.6)",
            borderRadius: 4,
            color: "#c0c0e0",
          }}
        >
          マップリセット
        </button>
      </div>

      <div>
        <div style={{ opacity: 0.8, marginBottom: 4 }}>Error log</div>
        <div
          role="button"
          tabIndex={0}
          onClick={handleCopyClick}
          onKeyDown={(e) => e.key === "Enter" && handleCopyClick()}
          style={{
            background: "rgba(0,0,0,0.3)",
            borderRadius: 4,
            padding: "8px 10px",
            maxHeight: 120,
            overflowY: "auto",
            cursor: "pointer",
            border: copyFeedback ? "1px solid #4ade80" : "1px solid transparent",
          }}
          title="クリックでコピー"
        >
          {logs.length === 0 ? (
            <span style={{ opacity: 0.6 }}>(なし)</span>
          ) : (
            logs.map((l) => (
              <div key={l.id} style={{ marginBottom: 4, wordBreak: "break-all" }}>
                <span style={{ fontSize: 10, opacity: 0.7 }}>[{l.timestamp.slice(11, 19)}]</span>{" "}
                {l.message}
              </div>
            ))
          )}
        </div>
        {copyFeedback && (
          <div style={{ color: "#4ade80", fontSize: 10, marginTop: 4 }}>コピーしました</div>
        )}
        {logs.length > 0 && (
          <button
            type="button"
            onClick={clearLogs}
            style={{
              marginTop: 6,
              padding: "2px 8px",
              fontSize: 10,
              cursor: "pointer",
              background: "rgba(100,80,80,0.5)",
              border: "1px solid rgba(150,80,80,0.6)",
              borderRadius: 4,
              color: "#e0a0a0",
            }}
          >
            クリア
          </button>
        )}
      </div>
    </div>
  );
}
