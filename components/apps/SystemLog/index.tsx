import { memo, useCallback, useEffect, useRef, useState, type FC } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";

type LogEntry = {
  details?: string;
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
};

const SystemLog: FC<ComponentProcessProps> = ({ id }) => {
  const { title } = useProcesses();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    title(id, "System Log");
  }, [id, title]);

  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [autoScroll]);

  const addLog = useCallback((level: LogEntry["level"], message: string, details?: string): void => {
    const entry: LogEntry = {
      details,
      level,
      message,
      timestamp: typeof window === 'undefined' ? '' : new Date().toLocaleTimeString(),
    };
    setLogs(prev => [...prev, entry].slice(-100)); // Keep last 100 entries
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const exportLogs = useCallback((): void => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.details ? `\n  ${log.details}` : ""}`
    ).join("\n");
    
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `system-log-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  // Expose addLog globally for Copilot to use
  useEffect(() => {
    const windowWithSystemLog = window as typeof window & {
      addSystemLog?: (level: string, message: string, details?: string) => void;
    };
    windowWithSystemLog.addSystemLog = (level: string, message: string, details?: string) => {
      if (level === "info" || level === "warn" || level === "error") {
        addLog(level, message, details);
      }
    };
    return () => {
      delete windowWithSystemLog.addSystemLog;
    };
  }, [addLog]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 8 }}>
      <div style={{ alignItems: "center", display: "flex", gap: 8, marginBottom: 8 }}>
        <Button onClick={clearLogs}>Clear</Button>
        <Button disabled={logs.length === 0} onClick={exportLogs}>Export</Button>
        <label style={{ alignItems: "center", display: "flex", gap: 4 }}>
          <input
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            type="checkbox"
          />
          Auto-scroll
        </label>
        <span style={{ fontSize: 12, marginLeft: "auto", opacity: 0.7 }}>
          {logs.length} entries
        </span>
      </div>
      <div
        ref={logRef}
        style={{
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRadius: 4,
          flex: 1,
          fontFamily: "monospace",
          fontSize: 12,
          overflow: "auto",
          padding: 8,
        }}
      >
        {logs.length === 0 ? (
          <div style={{ marginTop: 20, opacity: 0.5, textAlign: "center" }}>
            No log entries yet. Copilot actions will appear here.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={`log-${log.timestamp}-${log.message.slice(0, 10)}-${log.level}`}
              style={{
                backgroundColor: log.level === "error" ? "rgba(255,0,0,0.1)" : 
                               log.level === "warn" ? "rgba(255,255,0,0.1)" : 
                               "rgba(0,255,0,0.05)",
                borderRadius: 2,
                marginBottom: 4,
                padding: 4,
              }}
            >
              <div style={{ alignItems: "baseline", display: "flex", gap: 8 }}>
                <span style={{ fontSize: 10, opacity: 0.6 }}>{log.timestamp}</span>
                <span style={{ 
                  color: log.level === "error" ? "#ff6b6b" : 
                         log.level === "warn" ? "#ffd93d" : "#6bcf7f", 
                  fontWeight: "bold"
                }}>
                  {log.level.toUpperCase()}
                </span>
                <span>{log.message}</span>
              </div>
              {log.details && (
                <div style={{ fontSize: 11, marginLeft: 20, opacity: 0.8 }}>
                  {log.details}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default memo(SystemLog);
