import { memo, useCallback, useMemo, useRef, useState } from "react";
import { useFileSystem } from "contexts/fileSystem";
import { queryFolder, type RagResult } from "utils/rag";
import Button from "styles/common/Button";

type AskPanelProps = {
  folderPath: string;
};

const AskPanel: FC<AskPanelProps> = ({ folderPath }) => {
  const { readdir, readFile } = useFileSystem();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RagResult[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const disabled = useMemo(() => !folderPath || loading, [folderPath, loading]);

  const runQuery = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await queryFolder(folderPath, query.trim(), readdir, readFile);
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [folderPath, query, readdir, readFile]);

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: 8 }}>
      <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
        <Button onClick={() => {
          setOpen((v) => !v);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}>{open ? "Hide Ask" : "Ask this folder"}</Button>
        {open && (
          <>
            <input
              ref={inputRef}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runQuery();
              }}
              placeholder="Ask a question about files here"
              style={{ flex: 1, minWidth: 120 }}
              value={query}
            />
            <Button disabled={disabled} onClick={runQuery}>
              {loading ? "Searching…" : "Ask"}
            </Button>
          </>
        )}
      </div>
      {open && results.length > 0 && (
        <ol style={{ display: "grid", gap: 6, marginTop: 8 }}>
          {results.map(({ path, title, snippet, score }) => (
            <li key={path} style={{ opacity: 0.95 }} title={path}>
              <div style={{ fontWeight: 600 }}>{title}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{snippet}</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>Score: {score.toFixed(3)}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default memo(AskPanel);


