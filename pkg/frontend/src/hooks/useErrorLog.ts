import { useState, useEffect, useCallback } from "react";

export interface ErrorLogEntry {
  id: number;
  timestamp: string;
  message: string;
  stack?: string;
  type: "error" | "unhandledrejection";
}

let nextId = 0;

/** ウィンドウの error / unhandledrejection をキャプチャしてログを保持 */
export function useErrorLog(maxLines: number = 20) {
  const [logs, setLogs] = useState<ErrorLogEntry[]>([]);

  const addLog = useCallback(
    (entry: Omit<ErrorLogEntry, "id" | "timestamp">) => {
      const timestamp = new Date().toISOString();
      setLogs((prev) => {
        const next = [...prev, { ...entry, id: nextId++, timestamp }];
        return next.slice(-maxLines);
      });
    },
    [maxLines]
  );

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      addLog({
        message: e.message ?? String(e),
        stack: e.error?.stack,
        type: "error",
      });
    };

    const handleRejection = (e: PromiseRejectionEvent) => {
      const msg = e.reason instanceof Error ? e.reason.message : String(e.reason);
      const stack = e.reason instanceof Error ? e.reason.stack : undefined;
      addLog({ message: msg, stack, type: "unhandledrejection" });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [addLog]);

  const clearLogs = useCallback(() => setLogs([]), []);

  return { logs, clearLogs };
}
