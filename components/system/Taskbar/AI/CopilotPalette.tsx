import { memo, useCallback, useEffect, useRef, useState } from "react";
import StyledAIChat from "components/system/Taskbar/AI/StyledAIChat";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import Button from "styles/common/Button";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useFileSystem } from "contexts/fileSystem";
import { toggleShowDesktop } from "utils/functions";

type CopilotPaletteProps = {
  toggle: () => void;
};

const CopilotPalette: FC<CopilotPaletteProps> = ({ toggle }) => {
  const [query, setQuery] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { open, minimize, processes, stackOrder } = useProcesses();
  const session = useSession();
  const fs = useFileSystem();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const run = useCallback(() => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    const add = (s: string) => {
      setLog((l) => [s, ...l].slice(0, 50));
      // Also log to SystemLog if available
      if ((window as any).addSystemLog) {
        (window as any).addSystemLog("info", `Copilot: ${s}`);
      }
    };

    if (q.startsWith("open ")) {
      const name = q.replace("open ", "");
      try {
        // Add a small delay to ensure libraries load
        setTimeout(() => {
          open(name);
        }, 100);
        add(`Opening ${name}...`);
      } catch (error) {
        add(`Failed to open ${name}: ${error}`);
      }
      return;
    }

    if (q.startsWith("folder ") || q.startsWith("open folder ")) {
      const path = q.replace("open folder ", "").replace("folder ", "");
      open("FileExplorer", { url: path });
      add(`Opened folder ${path}`);
      return;
    }

    if (q.includes("minimize all") || q.includes("show desktop")) {
      toggleShowDesktop(processes, session.stackOrder, minimize);
      add("Minimized all windows");
      return;
    }

    if (q.startsWith("set wallpaper ") || q.startsWith("wallpaper ")) {
      const path = q.replace("set wallpaper ", "").replace("wallpaper ", "");
      try {
        // Set wallpaper by updating session
        session.setWallpaper(path);
        add(`Set wallpaper to: ${path}`);
      } catch {
        add("Failed to set wallpaper");
      }
      return;
    }

    add("Unknown command. Try: open Terminal, open folder /Users/Public, minimize all, set wallpaper /Users/Public/Videos/im-vengeance-the-batman-moewalls-com");
  }, [query, open, minimize, processes, session.stackOrder]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") run();
    if (e.key === "Escape") toggle();
  }, [run, toggle]);

  return (
    <StyledAIChat style={{ height: 240, width: 520 }}>
      <div className="titleBar">
        <div className="title">Copilot</div>
        <button className="close" onClick={toggle}>
          <CloseIcon />
        </button>
      </div>
      <div style={{ padding: 8, display: "grid", gap: 8 }}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Try: open Terminal | open folder /Users/Public | minimize all"
        />
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={run}>Run</Button>
          <Button onClick={toggle}>Close</Button>
        </div>
        <ol style={{ margin: 0, padding: 0, display: "grid", gap: 6 }}>
          {log.map((l, i) => (
            <li key={`${l}-${i}`} style={{ opacity: 0.9 }}>{l}</li>
          ))}
        </ol>
      </div>
    </StyledAIChat>
  );
};

export default memo(CopilotPalette);


