import { KEYVAL_STORE_NAME, getKeyValStore } from "contexts/fileSystem/core";

type LunrIndex = any;

export type RagDoc = {
  id: string;
  path: string;
  title: string;
  content: string;
};

export type RagResult = {
  path: string;
  title: string;
  score: number;
  snippet: string;
};

const RAG_PREFIX = "rag:index:";

async function ensureLunr(): Promise<any> {
  if ((globalThis as any).lunr) return (globalThis as any).lunr;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/System/lunr/lunr.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load lunr"));
    document.head.appendChild(script);
  });

  return (globalThis as any).lunr;
}

export async function loadFolderIndex(folderPath: string): Promise<{ indexJson: any; docs: RagDoc[] } | undefined> {
  const db = await getKeyValStore();
  const key = `${RAG_PREFIX}${folderPath}`;
  const stored = (await db.get(KEYVAL_STORE_NAME, key)) as { indexJson: any; docs: RagDoc[] } | undefined;
  return stored;
}

export async function saveFolderIndex(folderPath: string, indexJson: any, docs: RagDoc[]): Promise<void> {
  const db = await getKeyValStore();
  const key = `${RAG_PREFIX}${folderPath}`;
  await db.put(KEYVAL_STORE_NAME, { indexJson, docs }, key);
}

export async function buildFolderIndex(
  folderPath: string,
  list: (path: string) => Promise<string[]>,
  readFile: (path: string) => Promise<Buffer>
): Promise<{ indexJson: any; docs: RagDoc[] }> {
  const lunr = await ensureLunr();

  const entries = await list(folderPath);
  const textFiles = entries.filter((name) => /\.(md|txt)$/i.test(name));

  const docs: RagDoc[] = [];
  for (const name of textFiles) {
    const fullPath = `${folderPath}${folderPath.endsWith("/") ? "" : "/"}${name}`;
    try {
      const buf = await readFile(fullPath);
      const content = buf.toString();
      const title = name.replace(/\.(md|txt)$/i, "");
      docs.push({ id: fullPath, path: fullPath, title, content });
    } catch {
      // ignore unreadable files
    }
  }

  const idx: LunrIndex = lunr(function (this: any) {
    this.ref("id");
    this.field("title");
    this.field("content");
    docs.forEach((d) => this.add(d));
  });

  const indexJson = idx.toJSON();

  await saveFolderIndex(folderPath, indexJson, docs);

  return { indexJson, docs };
}

export async function queryFolder(
  folderPath: string,
  query: string,
  list: (path: string) => Promise<string[]>,
  readFile: (path: string) => Promise<Buffer>
): Promise<RagResult[]> {
  const lunr = await ensureLunr();

  let stored = await loadFolderIndex(folderPath);
  if (!stored) {
    stored = await buildFolderIndex(folderPath, list, readFile);
  }

  const idx = lunr.Index.load(stored.indexJson);
  const results = idx.search(query) as Array<{ ref: string; score: number }>;

  const docMap = new Map(stored.docs.map((d) => [d.id, d] as const));
  return results.slice(0, 5).map(({ ref, score }) => {
    const d = docMap.get(ref)!;
    const snippet = makeSnippet(d.content, query);
    return { path: d.path, title: d.title, score, snippet };
  });
}

function makeSnippet(text: string, query: string): string {
  const q = query.split(/\s+/)[0] || "";
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i === -1) return text.slice(0, 180).replace(/\s+/g, " ").trim();
  const start = Math.max(0, i - 60);
  const end = Math.min(text.length, i + 120);
  return (start > 0 ? "…" : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "…" : "");
}


