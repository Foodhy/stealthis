import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations, type Locale } from "../i18n";

// ─── Types ──────────────────────────────────────────────────────────────────

interface SchemaColumn {
  name: string;
  type: string;
  pk: boolean;
  fk: boolean;
  nullable: boolean;
}

interface SchemaTable {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  columns: SchemaColumn[];
}

interface SchemaRelation {
  from: string;
  to: string;
  label: string;
  fromCard: string;
  toCard: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABLE_COLORS = [
  "#58a6ff", // blue
  "#7ee787", // green
  "#e3b341", // yellow
  "#bc8cff", // purple
  "#ff7b72", // red
  "#39d353", // bright green
  "#f78166", // salmon
  "#a5d6ff", // light blue
  "#d2a8ff", // light purple
  "#ffa657", // orange
];

const TABLE_W = 220;
const ROW_H = 28;
const HEADER_H = 38;
const INITIAL_PADDING = 60;
const COL_GAP = 80;
const ROW_GAP = 60;

// ─── Mermaid ER Parser ────────────────────────────────────────────────────────

function parseMermaidER(source: string): {
  tables: Omit<SchemaTable, "x" | "y" | "color">[];
  relations: SchemaRelation[];
} {
  const tables: Omit<SchemaTable, "x" | "y" | "color">[] = [];
  const relations: SchemaRelation[] = [];

  const lines = source
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let inTable: string | null = null;
  let currentColumns: SchemaColumn[] = [];

  for (const line of lines) {
    if (line.toLowerCase().startsWith("erdiagram")) continue;

    // Start of table block: "TableName {"
    const tableStart = line.match(/^(\w+)\s*\{/);
    if (tableStart) {
      inTable = tableStart[1];
      currentColumns = [];
      continue;
    }

    // End of table block
    if (line === "}") {
      if (inTable) {
        tables.push({ id: inTable, name: inTable, columns: currentColumns });
        inTable = null;
        currentColumns = [];
      }
      continue;
    }

    // Column inside table block: "type name [PK|FK|UK|NOT NULL]..."
    if (inTable) {
      const colMatch = line.match(/^(\S+)\s+(\S+)(.*)$/);
      if (colMatch) {
        const [, type, name, rest] = colMatch;
        const upper = rest.toUpperCase();
        currentColumns.push({
          name,
          type,
          pk: upper.includes("PK"),
          fk: upper.includes("FK"),
          nullable: !upper.includes("NOT NULL") && !upper.includes("PK"),
        });
      }
      continue;
    }

    // Relation line: "A ||--o{ B : label" or "A }o--|| B : label"
    // Mermaid cardinality tokens: ||, |o, o|, }|, |{, }o, o{, o|, |o
    const relMatch = line.match(/^(\w+)\s+([|o}{]{2,3}--[|o}{]{2,3})\s+(\w+)\s*(?::\s*(.*))?$/);
    if (relMatch) {
      const [, fromTable, cardinality, toTable, rawLabel] = relMatch;
      const label = rawLabel ? rawLabel.replace(/["']/g, "").trim() : "";
      const [fromCard, toCard] = cardinality.split("--");
      relations.push({
        from: fromTable,
        to: toTable,
        label,
        fromCard: fromCard ?? "",
        toCard: toCard ?? "",
      });
    }
  }

  return { tables, relations };
}

// ─── Layout Engine: auto-place tables in a grid if no position known ─────────

function assignInitialPositions(tables: Omit<SchemaTable, "x" | "y" | "color">[]): SchemaTable[] {
  const cols = Math.ceil(Math.sqrt(tables.length));

  return tables.map((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tableH = HEADER_H + t.columns.length * ROW_H;
    const x = INITIAL_PADDING + col * (TABLE_W + COL_GAP);
    const y = INITIAL_PADDING + row * (tableH + ROW_GAP + 40);
    return {
      ...t,
      color: TABLE_COLORS[i % TABLE_COLORS.length],
      x,
      y,
    };
  });
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function tableHeight(t: SchemaTable) {
  return HEADER_H + t.columns.length * ROW_H;
}

type Point = { x: number; y: number };

function colCenterY(t: SchemaTable, colName: string): number {
  const idx = t.columns.findIndex((c) => c.name === colName);
  if (idx < 0) return t.y + HEADER_H / 2;
  return t.y + HEADER_H + idx * ROW_H + ROW_H / 2;
}

function getEdgePoints(fromTable: SchemaTable, toTable: SchemaTable): { a: Point; b: Point } {
  // Pick left or right edge based on relative horizontal position
  const fromCenterX = fromTable.x + TABLE_W / 2;
  const toCenterX = toTable.x + TABLE_W / 2;

  const ax = fromCenterX < toCenterX ? fromTable.x + TABLE_W : fromTable.x;
  const ay = fromTable.y + tableHeight(fromTable) / 2;
  const bx = fromCenterX < toCenterX ? toTable.x : toTable.x + TABLE_W;
  const by = toTable.y + tableHeight(toTable) / 2;

  return { a: { x: ax, y: ay }, b: { x: bx, y: by } };
}

function bezierPath(a: Point, b: Point): string {
  const dx = Math.abs(b.x - a.x);
  const cx = Math.min(60, dx * 0.5);
  const ax2 = a.x < b.x ? a.x + cx : a.x - cx;
  const bx2 = a.x < b.x ? b.x - cx : b.x + cx;
  return `M ${a.x} ${a.y} C ${ax2} ${a.y}, ${bx2} ${b.y}, ${b.x} ${b.y}`;
}

// ─── RelationLine component ──────────────────────────────────────────────────

function RelationLine({
  fromTable,
  toTable,
  label,
  active,
  animated,
}: {
  fromTable: SchemaTable;
  toTable: SchemaTable;
  label: string;
  active: boolean;
  animated: boolean;
}) {
  const { a, b } = getEdgePoints(fromTable, toTable);
  const path = bezierPath(a, b);
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={active ? "#58a6ff" : "#334155"}
        strokeWidth={active ? 2 : 1.5}
        strokeDasharray={animated ? "6 3" : undefined}
        className={animated ? "animate-dash" : undefined}
        opacity={active ? 1 : 0.7}
      />
      {/* Dot at endpoints */}
      <circle cx={a.x} cy={a.y} r={3} fill={active ? "#58a6ff" : "#475569"} />
      <circle cx={b.x} cy={b.y} r={3} fill={active ? "#58a6ff" : "#475569"} />

      {label && (
        <text
          x={midX}
          y={midY - 7}
          fill={active ? "#93c5fd" : "#64748b"}
          fontSize={10}
          textAnchor="middle"
          fontFamily="monospace"
        >
          {label}
        </text>
      )}
    </g>
  );
}

// ─── TableNode component ──────────────────────────────────────────────────────

function TableNode({
  table,
  onDrag,
  selected,
  onClick,
}: {
  table: SchemaTable;
  onDrag: (id: string, dx: number, dy: number) => void;
  selected: boolean;
  onClick: (id: string) => void;
}) {
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDragging.current = false;
    dragRef.current = { startX: e.clientX, startY: e.clientY };

    const onMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = me.clientX - dragRef.current.startX;
      const dy = me.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDragging.current = true;
      onDrag(table.id, dx, dy);
      dragRef.current = { startX: me.clientX, startY: me.clientY };
    };

    const onUp = () => {
      if (!isDragging.current) {
        onClick(table.id);
      }
      dragRef.current = null;
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;
    isDragging.current = false;
    dragRef.current = { startX: touch.clientX, startY: touch.clientY };

    const onMove = (te: TouchEvent) => {
      const t2 = te.touches[0];
      if (!t2 || !dragRef.current) return;
      const dx = t2.clientX - dragRef.current.startX;
      const dy = t2.clientY - dragRef.current.startY;
      isDragging.current = true;
      onDrag(table.id, dx, dy);
      dragRef.current = { startX: t2.clientX, startY: t2.clientY };
    };

    const onEnd = () => {
      if (!isDragging.current) onClick(table.id);
      dragRef.current = null;
      isDragging.current = false;
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };

    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
  };

  const h = tableHeight(table);

  return (
    <g
      transform={`translate(${table.x}, ${table.y})`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ cursor: "grab", userSelect: "none" }}
    >
      {/* Drop shadow */}
      <rect
        x={4}
        y={4}
        width={TABLE_W}
        height={h}
        rx={10}
        fill="rgba(0,0,0,0.55)"
        style={{ filter: "blur(3px)" }}
      />
      {/* Body */}
      <rect
        width={TABLE_W}
        height={h}
        rx={10}
        fill="#0f172a"
        stroke={selected ? table.color : "#1e293b"}
        strokeWidth={selected ? 2 : 1}
      />
      {/* Header gradient fill */}
      <rect width={TABLE_W} height={HEADER_H} rx={10} fill={table.color + "22"} />
      <rect y={HEADER_H - 10} width={TABLE_W} height={10} fill={table.color + "22"} />
      {/* Header underline */}
      <rect
        y={HEADER_H - 1}
        width={TABLE_W}
        height={1}
        fill={selected ? table.color : table.color + "44"}
      />
      {/* Colored left accent stripe */}
      <rect width={3} height={h} rx={10} fill={table.color} opacity={selected ? 1 : 0.6} />
      <rect
        width={3}
        y={HEADER_H}
        height={h - HEADER_H}
        fill={table.color}
        opacity={selected ? 0.8 : 0.3}
      />

      {/* Table name */}
      <text
        x={TABLE_W / 2}
        y={HEADER_H / 2 + 6}
        textAnchor="middle"
        fill={table.color}
        fontSize={13}
        fontWeight="bold"
        fontFamily="monospace"
        style={{ letterSpacing: "0.02em" }}
      >
        {table.name}
      </text>

      {/* Columns */}
      {table.columns.map((col, i) => {
        const cy = HEADER_H + i * ROW_H;
        return (
          <g key={col.name}>
            {i % 2 === 1 && (
              <rect y={cy} width={TABLE_W} height={ROW_H} fill="rgba(255,255,255,0.025)" />
            )}
            {/* PK / FK badge */}
            {(col.pk || col.fk) && (
              <text
                x={12}
                y={cy + ROW_H / 2 + 4}
                fill={col.pk ? "#e3b341" : "#bc8cff"}
                fontSize={9}
                fontWeight="bold"
                fontFamily="monospace"
              >
                {col.pk ? "PK" : "FK"}
              </text>
            )}
            {/* Column name */}
            <text
              x={col.pk || col.fk ? 36 : 12}
              y={cy + ROW_H / 2 + 4}
              fill={col.nullable && !col.pk ? "#94a3b8" : "#e2e8f0"}
              fontSize={11}
              fontFamily="monospace"
            >
              {col.name}
            </text>
            {/* Column type */}
            <text
              x={TABLE_W - 10}
              y={cy + ROW_H / 2 + 4}
              textAnchor="end"
              fill="#475569"
              fontSize={10}
              fontFamily="monospace"
            >
              {col.type}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface SchemaDiagramCanvasProps {
  diagramMmd: string;
  locale: Locale;
}

export default function SchemaDiagramCanvas({ diagramMmd, locale }: SchemaDiagramCanvasProps) {
  const t = useTranslations(locale);
  const [tables, setTables] = useState<SchemaTable[]>([]);
  const [relations, setRelations] = useState<SchemaRelation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [animated, setAnimated] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rebuild diagram whenever diagramMmd changes
  useEffect(() => {
    const src = diagramMmd.trim();
    if (!src) {
      setTables([]);
      setRelations([]);
      setParseError(t("canvas.noDiagramContent"));
      return;
    }

    try {
      const { tables: rawTables, relations: rawRelations } = parseMermaidER(src);
      if (rawTables.length === 0) {
        setParseError(t("canvas.noTablesDetected"));
        setTables([]);
        setRelations([]);
        return;
      }
      setTables(assignInitialPositions(rawTables));
      setRelations(rawRelations);
      setParseError(null);
      setSelected(null);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : t("canvas.parseError"));
    }
  }, [diagramMmd]);

  const handleDrag = useCallback((id: string, dx: number, dy: number) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, x: t.x + dx, y: t.y + dy } : t)));
  }, []);

  const handleReset = useCallback(() => {
    setTables((prev) => {
      const rawTables = prev.map(({ id, name, columns }) => ({ id, name, columns }));
      return assignInitialPositions(rawTables).map((t, i) => ({
        ...t,
        color: prev[i]?.color ?? TABLE_COLORS[i % TABLE_COLORS.length],
      }));
    });
    setSelected(null);
  }, []);

  // Compute SVG canvas size
  const canvasW = Math.max(800, ...tables.map((t) => t.x + TABLE_W + INITIAL_PADDING));
  const canvasH = Math.max(500, ...tables.map((t) => t.y + tableHeight(t) + INITIAL_PADDING));

  if (parseError && tables.length === 0) {
    return (
      <div className="flex min-h-[340px] items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/5 p-6 text-center">
        <div>
          <svg
            viewBox="0 0 24 24"
            className="mx-auto mb-3 h-8 w-8 text-amber-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-xs text-amber-200">{parseError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 text-slate-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
          <span className="text-[11px] text-slate-500">{t("canvas.dragHint")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnimated((v) => !v)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-all duration-200 ${
              animated
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.15)]"
                : "border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            {animated ? "✦ " + t("canvas.animated") : t("canvas.static")}
          </button>
          <div className="flex items-center gap-0.5 rounded-lg border border-white/10 px-0.5 py-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
              disabled={zoom <= 0.25}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-30"
              title="Zoom out"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M6 10a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 10Z" />
              </svg>
            </button>
            <button
              onClick={() => setZoom(1)}
              className="min-w-[34px] rounded px-1 py-0.5 text-center text-[10px] text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              disabled={zoom >= 3}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-30"
              title="Zoom in"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M10.75 6.75a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => {
              handleReset();
              setZoom(1);
            }}
            className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
          >
            {t("canvas.reset")}
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="overflow-auto rounded-xl border border-white/10 bg-slate-950"
        style={{ minHeight: 380 }}
        onClick={() => setSelected(null)}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom((z) => Math.min(3, Math.max(0.25, z + (e.deltaY < 0 ? 0.1 : -0.1))));
          }
        }}
      >
        <style>{`
          @keyframes dash { to { stroke-dashoffset: -18; } }
          .animate-dash { animation: dash 0.8s linear infinite; }
        `}</style>
        <svg
          width={canvasW * zoom}
          height={canvasH * zoom}
          className="block"
          style={{ display: "block" }}
        >
          <g transform={`scale(${zoom})`}>
            {/* Grid pattern */}
            <defs>
              <pattern id="schema-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#schema-grid)" />

            {/* Relations — rendered behind tables */}
            {relations.map((rel, i) => {
              const ft = tables.find((t) => t.id === rel.from);
              const tt = tables.find((t) => t.id === rel.to);
              if (!ft || !tt) return null;
              const isActive = selected === rel.from || selected === rel.to;
              return (
                <RelationLine
                  key={`${rel.from}-${rel.to}-${i}`}
                  fromTable={ft}
                  toTable={tt}
                  label={rel.label}
                  active={isActive}
                  animated={animated}
                />
              );
            })}

            {/* Tables */}
            {tables.map((t) => (
              <TableNode
                key={t.id}
                table={t}
                onDrag={handleDrag}
                selected={selected === t.id}
                onClick={setSelected}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[#e3b341]">PK</span> {t("canvas.primaryKey")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[#bc8cff]">FK</span> {t("canvas.foreignKey")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-px w-6 border-t-2 border-dashed border-slate-600" />{" "}
          {t("canvas.relation")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-px w-6 border-t-2 border-blue-500" />{" "}
          {t("canvas.activeRelation")}
        </span>
        {tables.length > 0 && (
          <span className="ml-auto text-slate-600">
            {tables.length} {tables.length !== 1 ? t("canvas.tablesPlural") : t("canvas.tables")} ·{" "}
            {relations.length}{" "}
            {relations.length !== 1 ? t("canvas.relationsPlural") : t("canvas.relationSingular")}
          </span>
        )}
      </div>
    </div>
  );
}
