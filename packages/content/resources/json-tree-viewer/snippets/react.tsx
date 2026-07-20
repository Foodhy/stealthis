"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const INDENT = 18;

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/* Self-contained styles so the component renders standalone (lab demo).
   In a real app, move this to a stylesheet. */
const JV_CSS = `
.jv-shell { --jv-canvas:#0a0e16; --jv-surface:#121a27; --jv-surface-2:#18222f; --jv-surface-3:#1e2937; --jv-line:#28323f; --jv-ink:#e7edf5; --jv-ink-soft:#c2cdda; --jv-muted:#93a1b5; --jv-accent:#5b9bff; --jv-amber:#f4b34a; --jv-green:#34d399; --jv-red:#f87171; --jv-violet:#c77dff; --jv-font-ui:"Hanken Grotesk",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; --jv-font-mono:"JetBrains Mono",ui-monospace,Menlo,monospace;
  display:flex; flex-direction:column; min-height:0; min-width:0; width:100%; max-width:1180px; margin:28px auto; font-family:var(--jv-font-ui); color:var(--jv-ink); }
.jv-shell *, .jv-shell *::before, .jv-shell *::after { box-sizing:border-box; }
.jv-toolbar { display:flex; align-items:center; gap:8px; padding:8px 10px; background:var(--jv-surface-2); border:1px solid var(--jv-line); border-bottom:none; border-radius:8px 8px 0 0; flex-wrap:nowrap; min-width:0; }
.jv-title { font-size:12px; font-weight:700; color:var(--jv-ink); letter-spacing:.02em; white-space:nowrap; flex:0 0 auto; }
.jv-search { background:var(--jv-surface); border:1px solid var(--jv-line); border-radius:6px; color:var(--jv-ink); font-family:var(--jv-font-ui); font-size:12px; padding:5px 10px; outline:none; flex:1 1 90px; min-width:70px; }
.jv-search:focus { border-color:var(--jv-accent); }
.jv-search:disabled { opacity:.4; cursor:not-allowed; }
.jv-actions { display:flex; gap:6px; flex:0 0 auto; align-items:center; }
.jv-btn { background:var(--jv-surface-3); border:1px solid var(--jv-line); color:var(--jv-ink-soft); font-family:var(--jv-font-ui); font-size:12px; padding:5px 11px; border-radius:6px; cursor:pointer; transition:color .15s,background .15s,border-color .15s; }
.jv-btn:hover { background:var(--jv-line); color:var(--jv-ink); }
.jv-btn-icon { display:inline-flex; align-items:center; justify-content:center; width:28px; height:26px; padding:0; flex:0 0 auto; }
.jv-btn-icon svg { display:block; }
.jv-btn.jv-copied { color:var(--jv-green); border-color:var(--jv-green); background:rgba(52,211,153,.12); }
.jv-mode { display:inline-flex; border:1px solid var(--jv-line); border-radius:6px; overflow:hidden; }
.jv-mode-btn { background:var(--jv-surface); border:none; color:var(--jv-muted); font-family:var(--jv-font-ui); font-size:12px; padding:5px 12px; cursor:pointer; }
.jv-mode-btn.active { background:var(--jv-accent); color:#06101f; font-weight:600; }
.jv-wrap { background:var(--jv-canvas); border:1px solid var(--jv-line); border-radius:0 0 8px 8px; padding:12px; overflow:auto; min-height:200px; max-height:70vh; }
.jv-tree[hidden], .jv-raw[hidden] { display:none !important; }
.jv-tree { font-family:var(--jv-font-mono); font-size:12.5px; line-height:1.7; color:var(--jv-ink-soft); font-variant-numeric:tabular-nums; }
.jv-raw { width:100%; min-height:320px; resize:vertical; background:transparent; color:var(--jv-ink); border:none; outline:none; padding:0; font-family:var(--jv-font-mono); font-size:12.5px; line-height:1.55; white-space:pre; tab-size:2; }
.jv-node { display:block; }
.jv-row { display:flex; align-items:flex-start; padding:1px 0; border-radius:4px; min-width:0; }
.jv-row:hover { background:rgba(255,255,255,.035); }
.jv-row.jv-highlight { background:rgba(91,155,255,.12); }
.jv-indent { flex:0 0 auto; }
.jv-toggle { flex:0 0 auto; width:14px; color:var(--jv-muted); font-size:9px; cursor:pointer; user-select:none; display:inline-block; transform:rotate(0deg); transition:transform .12s; }
.jv-toggle.open { transform:rotate(90deg); }
.jv-toggle-space { flex:0 0 auto; width:14px; }
.jv-key { color:var(--jv-accent); }
.jv-colon, .jv-comma { color:var(--jv-muted); }
.jv-bracket { color:var(--jv-ink-soft); }
.jv-collapsed { color:var(--jv-muted); font-style:italic; }
.jv-val-str { color:var(--jv-green); }
.jv-val-num { color:var(--jv-amber); }
.jv-val-bool { color:var(--jv-violet); }
.jv-val-null { color:var(--jv-red); }
.jv-val-str, .jv-val-num, .jv-val-bool, .jv-val-null { min-width:0; overflow-wrap:anywhere; word-break:break-word; white-space:pre-wrap; }
.jv-mark { background:var(--jv-amber); color:#06101f; border-radius:2px; padding:0 1px; }
.jv-mark.jv-mark-active { background:#ff8c42; outline:2px solid rgba(255,140,66,.55); }
.jv-search-nav { display:inline-flex; align-items:center; gap:4px; }
.jv-search-counter { font-size:11.5px; color:var(--jv-muted); font-variant-numeric:tabular-nums; min-width:34px; text-align:right; }
.jv-nav-btn { font-size:10px; line-height:1; padding:4px 7px; background:var(--jv-surface-3); border:1px solid var(--jv-line); color:var(--jv-ink-soft); border-radius:4px; cursor:pointer; }
.jv-nav-btn:hover:not(:disabled) { background:var(--jv-surface-2); color:var(--jv-ink); }
.jv-nav-btn:disabled { opacity:.35; cursor:default; }
.jv-empty { color:var(--jv-muted); font-family:var(--jv-font-ui); font-size:13px; padding:10px 4px; }
.jv-empty.jv-error { color:var(--jv-amber); }
@media (prefers-reduced-motion: reduce) { .jv-toggle, .jv-btn { transition:none; } }
`;

/* Demo payload used when no data/text prop is given. */
const DEMO_DATA: Json = {
  profileId: "prof_8842himlox",
  locale: "en-US",
  plan: { tier: "PREMIUM", maxStreams: 4, resolution: "4K_HDR", adSupported: false },
  device: { type: "SMART_TV", os: "Tizen 7.0", drm: "widevine_l1", hdrCapable: true },
  homeRows: [
    {
      rowId: "row_continue_watching",
      title: "Continue Watching",
      rankingModel: "cw-recency-v3",
      items: [
        {
          id: 81234561,
          title: "Ashes of the Empire",
          type: "SERIES",
          genres: ["sci-fi", "drama"],
          maturityRating: "TV-MA",
          progress: { season: 2, episode: 5, positionSec: 1834, durationSec: 3120, percent: 58.8 },
          badges: ["NEW_EPISODES", "TOP_10"],
          artwork: {
            boxart: "https://img.example.cdn/boxart/81234561.jpg",
            titleLogo: "https://img.example.cdn/logo/81234561.png",
            billboard: null,
          },
        },
        {
          id: 70298731,
          title: "Midnight Recipe",
          type: "MOVIE",
          genres: ["thriller"],
          maturityRating: "R",
          progress: { positionSec: 421, durationSec: 6980, percent: 6.0 },
          badges: [],
          artwork: { boxart: "https://img.example.cdn/boxart/70298731.jpg", titleLogo: null, billboard: null },
        },
      ],
    },
    {
      rowId: "row_top_picks",
      title: "Top Picks for You",
      rankingModel: "personalized-rank-v12",
      items: [
        {
          id: 81990045,
          title: "The Last Cartographer",
          type: "SERIES",
          genres: ["adventure", "mystery"],
          maturityRating: "TV-14",
          matchScore: 0.97,
          isOriginal: true,
          badges: ["ORIGINAL", "AWARD_WINNER"],
          seasons: 3,
          audioLocales: ["en", "es", "fr", "ja"],
          subtitleLocales: ["en", "es", "pt-BR", "de"],
        },
      ],
    },
  ],
  playbackSession: {
    sessionId: "pbs_02fb7d1e",
    titleId: 81234561,
    cdn: { provider: "open-connect", pop: "bog01", throughputKbps: 42311 },
    stream: {
      videoCodec: "hevc",
      audioCodec: "eac3-atmos",
      bitrateLadder: [
        { resolution: "3840x2160", kbps: 15000 },
        { resolution: "1920x1080", kbps: 5800 },
        { resolution: "1280x720", kbps: 3000 },
      ],
      currentBitrateKbps: 15000,
      bufferSec: 26.4,
      droppedFrames: 2,
    },
    abTests: { skipIntroV2: "treatment", nextEpCountdown: "control" },
  },
  billing: {
    country: "US",
    currency: "USD",
    monthlyPrice: 22.99,
    nextBillingDate: "2026-08-05",
    paymentMethod: { type: "CARD", last4: "4821", expiring: false },
  },
};

/* ---------------------------------------------------------------
   Match indexing: the tree is walked once per (data, term) pair to
   assign every highlighted occurrence a stable global index, so the
   prev/next navigation can address one specific <mark>.
--------------------------------------------------------------- */

type Counter = { n: number };

function splitTerm(raw: string, term: string) {
  if (!term) return [{ text: raw, hit: false }];
  const q = term.toLowerCase();
  const lower = raw.toLowerCase();
  const parts: { text: string; hit: boolean }[] = [];
  let from = 0;
  let idx = lower.indexOf(q);
  while (idx !== -1) {
    if (idx > from) parts.push({ text: raw.slice(from, idx), hit: false });
    parts.push({ text: raw.slice(idx, idx + term.length), hit: true });
    from = idx + term.length;
    idx = lower.indexOf(q, from);
  }
  if (from < raw.length) parts.push({ text: raw.slice(from), hit: false });
  return parts;
}

function Highlight({
  text,
  term,
  counter,
  active,
}: {
  text: string;
  term: string;
  counter: Counter;
  active: number;
}) {
  const parts = splitTerm(text, term);
  return (
    <>
      {parts.map((p, i) => {
        if (!p.hit) return <span key={i}>{p.text}</span>;
        const mi = counter.n++;
        return (
          <mark
            key={i}
            className={"jv-mark" + (mi === active ? " jv-mark-active" : "")}
            data-mi={mi}
          >
            {p.text}
          </mark>
        );
      })}
    </>
  );
}

function isContainer(v: Json): v is Json[] | { [k: string]: Json } {
  return v !== null && typeof v === "object";
}

function entriesOf(v: Json[] | { [k: string]: Json }): [string | number, Json][] {
  return Array.isArray(v) ? v.map((x, i) => [i, x] as [number, Json]) : Object.entries(v);
}

/* Paths of every container that holds a match — used to auto-open branches. */
function pathsWithMatches(value: Json, term: string): Set<string> {
  const open = new Set<string>();
  if (!term) return open;
  const q = term.toLowerCase();
  const walk = (v: Json, key: string | number | null, path: string): boolean => {
    let hit = key !== null && String(key).toLowerCase().includes(q);
    if (isContainer(v)) {
      for (const [k, child] of entriesOf(v)) {
        if (walk(child, k, path + "/" + k)) hit = true;
      }
      if (hit) open.add(path);
    } else if (String(v).toLowerCase().includes(q)) {
      hit = true;
    }
    return hit;
  };
  walk(value, null, "");
  return open;
}

function valueClass(v: Json) {
  if (v === null) return "jv-val-null";
  if (typeof v === "string") return "jv-val-str";
  if (typeof v === "number") return "jv-val-num";
  return "jv-val-bool";
}

function Node({
  nodeKey,
  value,
  depth,
  isLast,
  path,
  open,
  toggle,
  term,
  counter,
  active,
}: {
  nodeKey: string | number | null;
  value: Json;
  depth: number;
  isLast: boolean;
  path: string;
  open: Set<string>;
  toggle: (path: string) => void;
  term: string;
  counter: Counter;
  active: number;
}) {
  const q = term.toLowerCase();
  const container = isContainer(value);
  const entries = container ? entriesOf(value) : [];
  const empty = container && entries.length === 0;
  const comma = isLast ? null : <span className="jv-comma">,</span>;
  const isArr = Array.isArray(value);

  const matched =
    !!term &&
    ((nodeKey !== null && String(nodeKey).toLowerCase().includes(q)) ||
      (!container && String(value).toLowerCase().includes(q)));

  const keyLabel: ReactNode =
    nodeKey === null ? null : (
      <>
        <span className="jv-key">
          "<Highlight text={String(nodeKey)} term={term} counter={counter} active={active} />"
        </span>
        <span className="jv-colon">:</span>{" "}
      </>
    );

  if (container && !empty) {
    const isOpen = open.has(path);
    return (
      <div className="jv-node">
        <div
          className={"jv-row" + (matched ? " jv-highlight" : "")}
          style={{ cursor: "pointer" }}
          onClick={() => toggle(path)}
        >
          <span className="jv-indent" style={{ width: depth * INDENT }} />
          <span className={"jv-toggle" + (isOpen ? " open" : "")}>▶</span>{" "}
          {keyLabel}
          <span className="jv-bracket">{isArr ? "[" : "{"}</span>
          {!isOpen && (
            <span className="jv-collapsed">
              {" … "}
              {entries.length} {isArr ? "items ]" : "keys }"}
            </span>
          )}
        </div>
        {isOpen && (
          <>
            <div className="jv-children">
              {entries.map(([k, child], i) => (
                <Node
                  key={k}
                  nodeKey={k}
                  value={child}
                  depth={depth + 1}
                  isLast={i === entries.length - 1}
                  path={path + "/" + k}
                  open={open}
                  toggle={toggle}
                  term={term}
                  counter={counter}
                  active={active}
                />
              ))}
            </div>
            <div className="jv-row">
              <span className="jv-indent" style={{ width: depth * INDENT }} />
              <span className="jv-toggle-space" />{" "}
              <span className="jv-bracket">{isArr ? "]" : "}"}</span>
              {comma}
            </div>
          </>
        )}
      </div>
    );
  }

  let valueNode: ReactNode;
  if (empty) {
    valueNode = <span className="jv-bracket">{isArr ? "[]" : "{}"}</span>;
  } else if (typeof value === "string") {
    valueNode = (
      <span className="jv-val-str">
        "<Highlight text={value} term={term} counter={counter} active={active} />"
      </span>
    );
  } else if (typeof value === "number") {
    valueNode = (
      <span className="jv-val-num">
        <Highlight text={String(value)} term={term} counter={counter} active={active} />
      </span>
    );
  } else {
    valueNode = <span className={valueClass(value)}>{String(value)}</span>;
  }

  return (
    <div className="jv-node">
      <div className={"jv-row" + (matched ? " jv-highlight" : "")}>
        <span className="jv-indent" style={{ width: depth * INDENT }} />
        <span className="jv-toggle-space" /> {keyLabel}
        {valueNode}
        {comma}
      </div>
    </div>
  );
}

export type JsonTreeViewerProps = {
  data?: Json;
  /** Raw JSON text; when provided it wins over `data` and enables the Raw tab round-trip. */
  text?: string;
  title?: string;
  /** Depth kept open on first render. */
  defaultOpenDepth?: number;
};

export default function JsonTreeViewer({
  data = DEMO_DATA,
  text,
  title = "Payload",
  defaultOpenDepth = 1,
}: JsonTreeViewerProps) {
  const [mode, setMode] = useState<"tree" | "raw">("tree");
  const [term, setTerm] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const treeRef = useRef<HTMLDivElement>(null);

  const rawText = useMemo(
    () => text ?? (data === undefined ? "" : JSON.stringify(data, null, 2)),
    [text, data],
  );

  const parsed = useMemo<{ value?: Json; error?: boolean }>(() => {
    if (text === undefined) return { value: data };
    if (!text.trim()) return {};
    try {
      return { value: JSON.parse(text) as Json };
    } catch {
      return { error: true };
    }
  }, [text, data]);

  const value = parsed.value;

  const allPaths = useMemo(() => {
    const acc: { path: string; depth: number }[] = [];
    const walk = (v: Json, path: string, depth: number) => {
      if (!isContainer(v)) return;
      const es = entriesOf(v);
      if (es.length) acc.push({ path, depth });
      for (const [k, child] of es) walk(child, path + "/" + k, depth + 1);
    };
    if (value !== undefined) walk(value, "", 0);
    return acc;
  }, [value]);

  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOpen(new Set(allPaths.filter((p) => p.depth < defaultOpenDepth).map((p) => p.path)));
  }, [allPaths, defaultOpenDepth]);

  // A hit can sit inside a collapsed branch — open every ancestor that holds one.
  useEffect(() => {
    if (!term || value === undefined) return;
    const needed = pathsWithMatches(value, term);
    setOpen((prev) => {
      const next = new Set(prev);
      let changed = false;
      needed.forEach((p) => {
        if (!next.has(p)) {
          next.add(p);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    setActive(0);
  }, [term, value]);

  const toggle = useCallback((path: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(path)) next.add(path);
      return next;
    });
  }, []);

  const counter: Counter = { n: 0 };
  const [matchCount, setMatchCount] = useState(0);

  // Marks only exist after paint, so count and scroll in a layout effect.
  useLayoutEffect(() => {
    const marks = treeRef.current?.querySelectorAll("mark.jv-mark") ?? [];
    setMatchCount(marks.length);
    const el = marks[active] as HTMLElement | undefined;
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [term, open, active, value]);

  const goto = (delta: number) => {
    if (!matchCount) return;
    setActive((a) => (a + delta + matchCount) % matchCount);
  };

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="jv-shell">
      <style>{JV_CSS}</style>
      <div className="jv-toolbar">
        <span className="jv-title">{title}</span>
        <input
          className="jv-search"
          type="text"
          placeholder="Search…"
          aria-label={`Search in ${title}`}
          value={term}
          disabled={mode === "raw"}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              goto(e.shiftKey ? -1 : 1);
            }
          }}
        />
        <span className="jv-search-nav">
          <span className="jv-search-counter">
            {matchCount ? `${active + 1}/${matchCount}` : term.trim() ? "0/0" : ""}
          </span>
          <button
            type="button"
            className="jv-nav-btn"
            disabled={!matchCount}
            title="Previous (Shift+Enter)"
            onClick={() => goto(-1)}
          >
            ▲
          </button>
          <button
            type="button"
            className="jv-nav-btn"
            disabled={!matchCount}
            title="Next (Enter)"
            onClick={() => goto(1)}
          >
            ▼
          </button>
        </span>
        <div className="jv-actions">
          <button
            type="button"
            className="jv-btn jv-btn-icon"
            title="Expand all"
            aria-label="Expand all"
            onClick={() => setOpen(new Set(allPaths.map((p) => p.path)))}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 9 12 4 17 9" />
              <polyline points="7 15 12 20 17 15" />
            </svg>
          </button>
          <button
            type="button"
            className="jv-btn jv-btn-icon"
            title="Collapse all"
            aria-label="Collapse all"
            onClick={() => setOpen(new Set([""]))}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 4 12 9 17 4" />
              <polyline points="7 20 12 15 17 20" />
            </svg>
          </button>
          <button
            type="button"
            className={"jv-btn jv-btn-icon" + (copied ? " jv-copied" : "")}
            title="Copy JSON"
            aria-label="Copy JSON"
            onClick={copy}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
          </button>
          <div className="jv-mode">
            <button
              type="button"
              className={"jv-mode-btn" + (mode === "tree" ? " active" : "")}
              onClick={() => setMode("tree")}
            >
              Tree
            </button>
            <button
              type="button"
              className={"jv-mode-btn" + (mode === "raw" ? " active" : "")}
              onClick={() => setMode("raw")}
            >
              Raw
            </button>
          </div>
        </div>
      </div>

      <div className="jv-wrap">
        <div className="jv-tree" ref={treeRef} hidden={mode !== "tree"}>
          {parsed.error ? (
            <div className="jv-empty jv-error">Invalid JSON — switch to Raw to fix it.</div>
          ) : value === undefined ? (
            <div className="jv-empty">Nothing to display.</div>
          ) : (
            <Node
              nodeKey={null}
              value={value}
              depth={0}
              isLast
              path=""
              open={open}
              toggle={toggle}
              term={term.trim()}
              counter={counter}
              active={active}
            />
          )}
        </div>
        <textarea className="jv-raw" hidden={mode !== "raw"} readOnly spellCheck={false} value={rawText} />
      </div>
    </div>
  );
}
