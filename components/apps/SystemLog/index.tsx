import { memo, useCallback, useEffect, useRef, useState } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";

type LogEntry = {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  details?: string;
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
  }, [logs, autoScroll]);

  const addLog = useCallback((level: LogEntry["level"], message: string, details?: string) => {
    const entry: LogEntry = {
      timestamp: typeof window !== 'undefined' ? new Date().toLocaleTimeString() : '',
      level,
      message,
      details,
    };
    setLogs(prev => [...prev, entry].slice(-100)); // Keep last 100 entries
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const exportLogs = useCallback(async () => {
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
    (window as any).addSystemLog = addLog;
    return () => {
      delete (window as any).addSystemLog;
    };
  }, [addLog]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 8 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
        <Button onClick={clearLogs}>Clear</Button>
        <Button onClick={exportLogs} disabled={logs.length === 0}>Export</Button>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          Auto-scroll
        </label>
        <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
          {logs.length} entries
        </span>
      </div>
      <div
        ref={logRef}
        style={{
          flex: 1,
          overflow: "auto",
          fontFamily: "monospace",
          fontSize: 12,
          backgroundColor: "rgba(0,0,0,0.1)",
          padding: 8,
          borderRadius: 4,
        }}
      >
        {logs.length === 0 ? (
          <div style={{ opacity: 0.5, textAlign: "center", marginTop: 20 }}>
            No log entries yet. Copilot actions will appear here.
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                marginBottom: 4,
                padding: 4,
                borderRadius: 2,
                backgroundColor: log.level === "error" ? "rgba(255,0,0,0.1)" : 
                               log.level === "warn" ? "rgba(255,255,0,0.1)" : 
                               "rgba(0,255,0,0.05)",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ opacity: 0.6, fontSize: 10 }}>{log.timestamp}</span>
                <span style={{ 
                  fontWeight: "bold", 
                  color: log.level === "error" ? "#ff6b6b" : 
                         log.level === "warn" ? "#ffd93d" : "#6bcf7f"
                }}>
                  {log.level.toUpperCase()}
                </span>
                <span>{log.message}</span>
              </div>
              {log.details && (
                <div style={{ marginLeft: 20, opacity: 0.8, fontSize: 11 }}>
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
