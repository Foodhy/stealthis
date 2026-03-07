import { useState, useMemo } from "react";

const SAMPLE: unknown = {
  user: {
    id: 42,
    name: "Ada Lovelace",
    email: "ada@example.com",
    active: true,
    score: 9.8,
    tags: ["engineer", "pioneer", "mathematician"],
    address: {
      street: "123 Babbage Lane",
      city: "London",
      country: "UK",
      geo: { lat: 51.5074, lng: -0.1278 },
    },
  },
  meta: {
    version: "1.0.0",
    generated: "2026-01-01T00:00:00Z",
    flags: [true, false, null],
  },
};

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

function typeColor(v: JsonValue): string {
  if (v === null) return "text-[#ff7b72]";
  if (typeof v === "boolean") return "text-[#79c0ff]";
  if (typeof v === "number") return "text-[#79c0ff]";
  if (typeof v === "string") return "text-[#a5d6ff]";
  return "text-[#e6edf3]";
}

function typeLabel(v: JsonValue): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return String(v);
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return `"${v}"`;
  if (Array.isArray(v)) return `Array(${v.length})`;
  return `{${Object.keys(v as object).length}}`;
}

function isComplex(v: JsonValue): boolean {
  return typeof v === "object" && v !== null;
}

function JsonNode({
  keyName,
  value,
  depth,
  search,
  path,
}: {
  keyName: string | null;
  value: JsonValue;
  depth: number;
  search: string;
  path: string;
}) {
  const [open, setOpen] = useState(depth < 2);
  const [copied, setCopied] = useState(false);

  const complex = isComplex(value);
  const entries: [string, JsonValue][] = complex
    ? Array.isArray(value)
      ? (value as JsonValue[]).map((v, i) => [String(i), v])
      : Object.entries(value as Record<string, JsonValue>)
    : [];

  const highlight = (text: string) => {
    if (!search || !text.toLowerCase().includes(search.toLowerCase())) return text;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-400/30 text-yellow-200 rounded px-0.5">
          {text.slice(idx, idx + search.length)}
        </mark>
        {text.slice(idx + search.length)}
      </>
    );
  };

  const isMatch =
    search &&
    (keyName?.toLowerCase().includes(search.toLowerCase()) ||
      (!complex && String(typeLabel(value)).toLowerCase().includes(search.toLowerCase())));

  const handleCopy = () => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`text-[12.5px] font-mono leading-[1.8] ${isMatch ? "bg-yellow-400/[0.06] rounded" : ""}`}
    >
      <div className="flex items-start gap-1 group">
        {/* Indent */}
        <span style={{ width: depth * 16 }} className="flex-shrink-0" />

        {/* Toggle */}
        {complex ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-4 flex-shrink-0 text-[#8b949e] hover:text-[#e6edf3] transition-colors select-none leading-[1.8]"
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Key */}
        {keyName !== null && (
          <span className="text-[#7ee787] mr-0.5">{highlight(keyName)}</span>
        )}
        {keyName !== null && <span className="text-[#8b949e]">: </span>}

        {/* Value or bracket */}
        {!complex ? (
          <span className={typeColor(value)}>{highlight(typeLabel(value))}</span>
        ) : (
          <span className="text-[#8b949e]">
            {Array.isArray(value) ? "[" : "{"}
            {!open && (
              <span className="text-[#484f58] italic ml-1">
                {Array.isArray(value)
                  ? `${(value as JsonValue[]).length} items`
                  : `${Object.keys(value as object).length} keys`}
              </span>
            )}
            {!open && <span className="ml-1">{Array.isArray(value) ? "]" : "}"}</span>}
          </span>
        )}

        {/* Copy path */}
        <button
          onClick={handleCopy}
          className="ml-1 opacity-0 group-hover:opacity-100 text-[10px] text-[#484f58] hover:text-[#8b949e] transition-all"
          title={path}
        >
          {copied ? "✓" : "⊙"}
        </button>
      </div>

      {/* Children */}
      {complex && open && (
        <div>
          {entries.map(([k, v]) => (
            <JsonNode
              key={k}
              keyName={Array.isArray(value) ? null : k}
              value={v}
              depth={depth + 1}
              search={search}
              path={path ? `${path}.${k}` : k}
            />
          ))}
          <div className="flex items-center">
            <span style={{ width: depth * 16 }} className="flex-shrink-0" />
            <span className="w-4 flex-shrink-0" />
            <span className="text-[#8b949e]">{Array.isArray(value) ? "]" : "}"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JsonViewerRC() {
  const [search, setSearch] = useState("");
  const [raw, setRaw] = useState(JSON.stringify(SAMPLE, null, 2));
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    try {
      const v = JSON.parse(raw);
      setError(null);
      return v as JsonValue;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [raw]);

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[720px] space-y-4">
        {/* Toolbar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search keys / values…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors"
          />
          <button
            onClick={() => setRaw(JSON.stringify(SAMPLE, null, 2))}
            className="px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[12px] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Tree */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 overflow-x-auto">
          {error ? (
            <p className="text-red-400 text-[13px] font-mono">{error}</p>
          ) : parsed !== null ? (
            <JsonNode
              keyName={null}
              value={parsed}
              depth={0}
              search={search}
              path=""
            />
          ) : null}
        </div>

        {/* Raw editor */}
        <details className="group">
          <summary className="text-[12px] text-[#8b949e] cursor-pointer select-none hover:text-[#e6edf3] transition-colors list-none flex items-center gap-1">
            <span className="group-open:rotate-90 inline-block transition-transform">▸</span>
            Edit raw JSON
          </summary>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="mt-2 w-full h-48 bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] text-[#e6edf3] font-mono resize-y focus:outline-none focus:border-[#58a6ff] transition-colors"
            spellCheck={false}
          />
        </details>
      </div>
    </div>
  );
}
