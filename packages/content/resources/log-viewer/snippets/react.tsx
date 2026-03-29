import { useState, useEffect, useRef, useCallback } from "react";

type Level = "info" | "warn" | "error" | "debug";

interface LogEntry {
  id: number;
  level: Level;
  time: string;
  message: string;
}

const LEVEL_COLORS: Record<Level, string> = {
  info:  "text-[#58a6ff]",
  warn:  "text-[#e3b341]",
  error: "text-[#f85149]",
  debug: "text-[#8b949e]",
};

const LEVEL_BG: Record<Level, string> = {
  info:  "bg-[#58a6ff]/10",
  warn:  "bg-[#e3b341]/10",
  error: "bg-[#f85149]/10",
  debug: "",
};

const LEVEL_BADGE: Record<Level, string> = {
  info:  "border-[#58a6ff]/40 text-[#58a6ff]",
  warn:  "border-[#e3b341]/40 text-[#e3b341]",
  error: "border-[#f85149]/40 text-[#f85149]",
  debug: "border-[#484f58] text-[#8b949e]",
};

const DEMO_MESSAGES: { level: Level; message: string }[] = [
  { level: "info",  message: "Server started on port 3000" },
  { level: "debug", message: "DB connection pool initialized (max: 10)" },
  { level: "info",  message: "GET /api/users 200 12ms" },
  { level: "debug", message: "Cache hit: user:42" },
  { level: "warn",  message: "Rate limit approaching: 85/100 req/min" },
  { level: "info",  message: "POST /api/auth/login 200 48ms" },
  { level: "error", message: "Failed to connect to Redis: ECONNREFUSED" },
  { level: "warn",  message: "Retrying Redis in 5s (attempt 1/3)" },
  { level: "info",  message: "GET /api/products 200 23ms" },
  { level: "debug", message: "Query executed in 4ms: SELECT * FROM users" },
  { level: "error", message: "Unhandled rejection: Cannot read property 'id' of null" },
  { level: "info",  message: "Redis reconnected successfully" },
  { level: "warn",  message: "Slow query detected: 1.2s — SELECT * FROM logs" },
  { level: "info",  message: "DELETE /api/sessions/77 204 8ms" },
  { level: "debug", message: "Middleware: auth token validated (exp: 3600s)" },
];

let counter = 0;
function makeEntry(level: Level, message: string): LogEntry {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${String(now.getMilliseconds()).padStart(3, "0")}`;
  return { id: ++counter, level, time, message };
}

const LEVELS: Level[] = ["info", "warn", "error", "debug"];

export default function LogViewerRC() {
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    DEMO_MESSAGES.slice(0, 8).map((m) => makeEntry(m.level, m.message))
  );
  const [activeFilters, setActiveFilters] = useState<Set<Level>>(new Set(LEVELS));
  const [search, setSearch] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [streaming, setStreaming] = useState(true);

  const bodyRef = useRef<HTMLDivElement>(null);
  const msgIdx = useRef(8);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (autoScroll) scrollToBottom();
  }, [logs, autoScroll, scrollToBottom]);

  useEffect(() => {
    if (!streaming) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const next = DEMO_MESSAGES[msgIdx.current % DEMO_MESSAGES.length];
      msgIdx.current++;
      setLogs((prev) => [...prev.slice(-199), makeEntry(next.level, next.message)]);
    }, 1200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [streaming]);

  const toggleFilter = (level: Level) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const filtered = logs.filter(
    (l) => activeFilters.has(l.level) &&
      (!search || l.message.toLowerCase().includes(search.toLowerCase()) || l.level.includes(search.toLowerCase()))
  );

  const highlight = (text: string) => {
    if (!search) return text;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) +
      `<mark class="bg-yellow-400/30 text-yellow-200 rounded">${text.slice(idx, idx + search.length)}</mark>` +
      text.slice(idx + search.length);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[860px] space-y-3">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level filters */}
          <div className="flex gap-1">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => toggleFilter(lvl)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border transition-all ${
                  activeFilters.has(lvl)
                    ? LEVEL_BADGE[lvl]
                    : "border-transparent text-[#484f58]"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Filter logs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[160px] bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-1.5 text-[12px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors"
          />

          {/* Auto-scroll */}
          <button
            onClick={() => setAutoScroll((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
              autoScroll
                ? "bg-[#58a6ff]/10 border-[#58a6ff]/40 text-[#58a6ff]"
                : "border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]"
            }`}
          >
            Auto-scroll
          </button>

          {/* Stream toggle */}
          <button
            onClick={() => setStreaming((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
              streaming
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]"
            }`}
          >
            {streaming ? "● Live" : "Paused"}
          </button>

          {/* Clear */}
          <button
            onClick={() => setLogs([])}
            className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border border-[#30363d] text-[#8b949e] hover:text-[#f85149] hover:border-[#f85149]/40 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Log body */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
            <span className="text-[11px] font-mono font-bold text-[#8b949e] uppercase tracking-wider">
              application.log
            </span>
            <span className="text-[11px] text-[#484f58]">{filtered.length} lines</span>
          </div>

          {/* Lines */}
          <div
            ref={bodyRef}
            className="h-[420px] overflow-y-auto font-mono text-[12px] leading-[1.7] p-2 space-y-0.5"
          >
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[#484f58]">
                No matching logs
              </div>
            ) : (
              filtered.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-start gap-2 px-2 py-0.5 rounded ${LEVEL_BG[entry.level]}`}
                >
                  <span className="text-[#484f58] flex-shrink-0 select-none">{entry.time}</span>
                  <span
                    className={`font-bold uppercase text-[10px] leading-[1.9] flex-shrink-0 w-10 ${LEVEL_COLORS[entry.level]}`}
                  >
                    {entry.level}
                  </span>
                  <span
                    className="text-[#e6edf3] break-all"
                    dangerouslySetInnerHTML={{ __html: highlight(entry.message) }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
