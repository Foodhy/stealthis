import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations, type Locale } from "../i18n";

// ─── Types ──────────────────────────────────────────────────────────────────

interface SchemaColumn {
  name: string;
  type: string;
  pk: boolean;
  fk: boolean;
  nullable: boolean;
  references?: { table: string; column: string };
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
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  nullable: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABLE_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red/coral
  "#eab308", // yellow
  "#22c55e", // green
  "#a855f7", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

const TABLE_W = 240;
const ROW_H = 26;
const HEADER_H = 36;
const INITIAL_PADDING = 60;
const COL_GAP = 100;
const ROW_GAP = 60;

// ─── SQL DDL Parser ─────────────────────────────────────────────────────────

function parseSqlDDL(sql: string): {
  tables: Omit<SchemaTable, "x" | "y" | "color">[];
  relations: SchemaRelation[];
} {
  const tables: Omit<SchemaTable, "x" | "y" | "color">[] = [];
  const relations: SchemaRelation[] = [];

  // Normalize: remove comments, collapse whitespace
  const cleaned = sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\r\n/g, "\n");

  // Match CREATE TABLE statements
  const tableRegex =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:"[^"]+"|[\w.]+)\.)?(?:"([^"]+)"|(\w+))\s*\(([\s\S]*?)\)\s*;/gi;

  let tableMatch: RegExpExecArray | null;
  while ((tableMatch = tableRegex.exec(cleaned)) !== null) {
    const tableName = (tableMatch[1] || tableMatch[2] || "").replace(/^(?:public|dbo)\./, "");
    const body = tableMatch[3] || "";

    const columns: SchemaColumn[] = [];
    const tableLevelFKs: {
      columns: string[];
      refTable: string;
      refColumns: string[];
    }[] = [];
    const tableLevelPKs: string[] = [];

    // Split body by commas, but respect parentheses nesting
    const parts = splitTopLevel(body);

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      // Table-level PRIMARY KEY
      const pkConstraint = trimmed.match(
        /^(?:CONSTRAINT\s+(?:"[^"]+"|[\w]+)\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i
      );
      if (pkConstraint) {
        const pkCols = pkConstraint[1]
          .split(",")
          .map((c) => c.trim().replace(/"/g, ""));
        tableLevelPKs.push(...pkCols);
        continue;
      }

      // Table-level FOREIGN KEY
      const fkConstraint = trimmed.match(
        /^(?:CONSTRAINT\s+(?:"[^"]+"|[\w]+)\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+(?:(?:"[^"]+"|[\w.]+)\.)?(?:"([^"]+)"|(\w+))\s*\(([^)]+)\)/i
      );
      if (fkConstraint) {
        const fkCols = fkConstraint[1]
          .split(",")
          .map((c) => c.trim().replace(/"/g, ""));
        const refTable = (fkConstraint[2] || fkConstraint[3] || "").replace(
          /^(?:public|dbo)\./,
          ""
        );
        const refCols = fkConstraint[4]
          .split(",")
          .map((c) => c.trim().replace(/"/g, ""));
        tableLevelFKs.push({ columns: fkCols, refTable, refColumns: refCols });
        continue;
      }

      // Table-level UNIQUE, CHECK, EXCLUDE — skip
      if (/^(?:CONSTRAINT\s+(?:"[^"]+"|[\w]+)\s+)?(?:UNIQUE|CHECK|EXCLUDE)\b/i.test(trimmed)) {
        continue;
      }

      // Column definition
      const colMatch = trimmed.match(
        /^(?:"([^"]+)"|(\w+))\s+([\w]+(?:\s*\([^)]*\))?(?:\s*\[\])?)\s*(.*?)$/is
      );
      if (colMatch) {
        const colName = colMatch[1] || colMatch[2] || "";
        let colType = (colMatch[3] || "").trim();
        const rest = (colMatch[4] || "").trim();
        const upperRest = rest.toUpperCase();

        // Normalize type display
        colType = normalizeType(colType);

        const isPk =
          upperRest.includes("PRIMARY KEY") ||
          /\bSERIAL\b/i.test(colType) && upperRest.includes("PRIMARY KEY");
        const isNotNull =
          upperRest.includes("NOT NULL") || isPk;
        const isNullable = !isNotNull;

        // Inline REFERENCES
        let references: { table: string; column: string } | undefined;
        const inlineRef = rest.match(
          /REFERENCES\s+(?:(?:"[^"]+"|[\w.]+)\.)?(?:"([^"]+)"|(\w+))\s*\((?:"([^"]+)"|(\w+))\)/i
        );
        if (inlineRef) {
          references = {
            table: (inlineRef[1] || inlineRef[2] || "").replace(
              /^(?:public|dbo)\./,
              ""
            ),
            column: inlineRef[3] || inlineRef[4] || "",
          };
        }

        columns.push({
          name: colName,
          type: colType,
          pk: isPk,
          fk: !!references,
          nullable: isNullable,
          references,
        });
      }
    }

    // Apply table-level PKs
    for (const pkCol of tableLevelPKs) {
      const col = columns.find((c) => c.name === pkCol);
      if (col) {
        col.pk = true;
        col.nullable = false;
      }
    }

    // Apply table-level FKs
    for (const fk of tableLevelFKs) {
      for (let i = 0; i < fk.columns.length; i++) {
        const col = columns.find((c) => c.name === fk.columns[i]);
        if (col) {
          col.fk = true;
          col.references = {
            table: fk.refTable,
            column: fk.refColumns[i] || fk.refColumns[0] || "id",
          };
        }
      }
    }

    tables.push({ id: tableName, name: tableName, columns });
  }

  // Build relations from FK references
  for (const table of tables) {
    for (const col of table.columns) {
      if (col.fk && col.references) {
        relations.push({
          fromTable: table.id,
          fromColumn: col.name,
          toTable: col.references.table,
          toColumn: col.references.column,
          nullable: col.nullable,
        });
      }
    }
  }

  return { tables, relations };
}

/** Split a string by top-level commas (not inside parentheses) */
function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const ch of s) {
    if (ch === "(") {
      depth++;
      current += ch;
    } else if (ch === ")") {
      depth--;
      current += ch;
    } else if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/** Normalize SQL type for display */
function normalizeType(t: string): string {
  const lower = t.toLowerCase().trim();
  if (lower === "character varying") return "varchar";
  if (lower.startsWith("character varying")) return t.replace(/character varying/i, "varchar");
  if (lower === "integer") return "int";
  if (lower === "boolean") return "bool";
  if (lower === "timestamp without time zone") return "timestamp";
  if (lower === "timestamp with time zone") return "timestamptz";
  return t;
}

// ─── Layout Engine ──────────────────────────────────────────────────────────

function assignInitialPositions(
  tables: Omit<SchemaTable, "x" | "y" | "color">[]
): SchemaTable[] {
  const cols = Math.max(1, Math.ceil(Math.sqrt(tables.length)));

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

// ─── Geometry helpers ───────────────────────────────────────────────────────

function tableHeight(t: SchemaTable) {
  return HEADER_H + t.columns.length * ROW_H;
}

function colCenterY(t: SchemaTable, colName: string): number {
  const idx = t.columns.findIndex((c) => c.name === colName);
  if (idx < 0) return t.y + HEADER_H / 2;
  return t.y + HEADER_H + idx * ROW_H + ROW_H / 2;
}

/** Build an orthogonal (right-angle) path between two connection points */
function orthogonalPath(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  fromRight: boolean,
  toRight: boolean
): string {
  const stub = 30;
  const mx1 = fromRight ? ax + stub : ax - stub;
  const mx2 = toRight ? bx + stub : bx - stub;

  // Horizontal stub from source, then vertical, then horizontal stub to target
  const midX = (mx1 + mx2) / 2;

  return [
    `M ${ax} ${ay}`,
    `L ${mx1} ${ay}`,
    `L ${midX} ${ay}`,
    `L ${midX} ${by}`,
    `L ${mx2} ${by}`,
    `L ${bx} ${by}`,
  ].join(" ");
}

// ─── Crow's Foot Markers ────────────────────────────────────────────────────

/**
 * Render the "One" side marker: two short vertical bars (||)
 * If nullable, prepend a circle (○).
 */
function OneMarker({
  x,
  y,
  dir,
  color,
}: {
  x: number;
  y: number;
  dir: number; // 1 = pointing right (marker goes right of x), -1 = left
  color: string;
}) {
  const spread = 8;
  return (
    <g>
      <line
        x1={x + dir * 4}
        y1={y - spread}
        x2={x + dir * 4}
        y2={y + spread}
        stroke={color}
        strokeWidth={1.5}
      />
      <line
        x1={x + dir * 8}
        y1={y - spread}
        x2={x + dir * 8}
        y2={y + spread}
        stroke={color}
        strokeWidth={1.5}
      />
    </g>
  );
}

/**
 * Render the "Many" side marker: crow's foot (three prongs converging)
 * with a single bar behind. If nullable, prepend a circle (○).
 */
function ManyMarker({
  x,
  y,
  dir,
  nullable,
  color,
}: {
  x: number;
  y: number;
  dir: number;
  nullable: boolean;
  color: string;
}) {
  const spread = 9;
  const forkLen = 12;
  const circleR = 4.5;
  const offset = nullable ? circleR * 2 + 3 : 0;

  return (
    <g>
      {/* Optional zero circle */}
      {nullable && (
        <circle
          cx={x + dir * (circleR + 1)}
          cy={y}
          r={circleR}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        />
      )}
      {/* Single bar behind the fork */}
      <line
        x1={x + dir * (offset + forkLen + 3)}
        y1={y - spread}
        x2={x + dir * (offset + forkLen + 3)}
        y2={y + spread}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Three prongs */}
      <line
        x1={x + dir * (offset + forkLen)}
        y1={y}
        x2={x + dir * (offset + 2)}
        y2={y - spread}
        stroke={color}
        strokeWidth={1.5}
      />
      <line
        x1={x + dir * (offset + forkLen)}
        y1={y}
        x2={x + dir * (offset + 2)}
        y2={y}
        stroke={color}
        strokeWidth={1.5}
      />
      <line
        x1={x + dir * (offset + forkLen)}
        y1={y}
        x2={x + dir * (offset + 2)}
        y2={y + spread}
        stroke={color}
        strokeWidth={1.5}
      />
    </g>
  );
}

// ─── RelationLine component ─────────────────────────────────────────────────

function RelationLine({
  fromTable,
  toTable,
  relation,
  active,
}: {
  fromTable: SchemaTable;
  toTable: SchemaTable;
  relation: SchemaRelation;
  active: boolean;
}) {
  const fromCenterX = fromTable.x + TABLE_W / 2;
  const toCenterX = toTable.x + TABLE_W / 2;

  // Determine which edge to connect from
  const fromRight = fromCenterX < toCenterX;
  const toRight = fromCenterX >= toCenterX;

  const ax = fromRight ? fromTable.x + TABLE_W : fromTable.x;
  const ay = colCenterY(fromTable, relation.fromColumn);
  const bx = toRight ? toTable.x + TABLE_W : toTable.x;
  const by = colCenterY(toTable, relation.toColumn);

  const path = orthogonalPath(ax, ay, bx, by, fromRight, toRight);
  const color = active ? "#58a6ff" : "#475569";

  // Direction for markers: pointing away from the table edge
  const fromDir = fromRight ? 1 : -1;
  const toDir = toRight ? 1 : -1;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={active ? "#58a6ff" : "#334155"}
        strokeWidth={active ? 2 : 1.5}
        opacity={active ? 1 : 0.7}
      />
      {/* Many side (FK) — crow's foot at the source (FK table) */}
      <ManyMarker
        x={ax}
        y={ay}
        dir={fromDir}
        nullable={relation.nullable}
        color={color}
      />
      {/* One side (PK) — double bar at the target (PK table) */}
      <OneMarker x={bx} y={by} dir={toDir} color={color} />
    </g>
  );
}

// ─── TableNode component ────────────────────────────────────────────────────

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
      {/* Header fill */}
      <rect width={TABLE_W} height={HEADER_H} rx={10} fill={table.color + "4D"} />
      <rect y={HEADER_H - 10} width={TABLE_W} height={10} fill={table.color + "4D"} />
      {/* Header underline */}
      <rect
        y={HEADER_H - 1}
        width={TABLE_W}
        height={1}
        fill={selected ? table.color : table.color + "66"}
      />
      {/* Left accent stripe */}
      <rect
        width={3}
        height={h}
        rx={10}
        fill={table.color}
        opacity={selected ? 1 : 0.6}
      />
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
        y={HEADER_H / 2 + 5}
        textAnchor="middle"
        fill="#ffffff"
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
              <rect
                y={cy}
                width={TABLE_W}
                height={ROW_H}
                fill="rgba(255,255,255,0.025)"
              />
            )}
            {/* PK / FK badge */}
            {(col.pk || col.fk) && (
              <text
                x={12}
                y={cy + ROW_H / 2 + 4}
                fill={col.pk ? "#eab308" : "#a855f7"}
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
              fill={col.pk ? "#e2e8f0" : col.fk ? "#c4b5fd" : "#94a3b8"}
              fontSize={11}
              fontWeight={col.pk ? "bold" : "normal"}
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

// ─── Main Component ─────────────────────────────────────────────────────────

interface CrowsFootDiagramProps {
  schemaSql: string;
  locale: Locale;
}

export default function CrowsFootDiagram({ schemaSql, locale }: CrowsFootDiagramProps) {
  const t = useTranslations(locale);
  const [tables, setTables] = useState<SchemaTable[]>([]);
  const [relations, setRelations] = useState<SchemaRelation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan state
  const panRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null);

  // Rebuild diagram whenever schemaSql changes
  useEffect(() => {
    const src = schemaSql.trim();
    if (!src) {
      setTables([]);
      setRelations([]);
      setParseError(t("erd.noSqlContent"));
      return;
    }

    try {
      const { tables: rawTables, relations: rawRelations } = parseSqlDDL(src);
      if (rawTables.length === 0) {
        setParseError(t("erd.noTablesDetected"));
        setTables([]);
        setRelations([]);
        return;
      }
      setTables(assignInitialPositions(rawTables));
      setRelations(rawRelations);
      setParseError(null);
      setSelected(null);
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : t("erd.parseError")
      );
    }
  }, [schemaSql]);

  const handleDrag = useCallback((id: string, dx: number, dy: number) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, x: t.x + dx, y: t.y + dy } : t))
    );
  }, []);

  const handleReset = useCallback(() => {
    setTables((prev) => {
      const rawTables = prev.map(({ id, name, columns }) => ({
        id,
        name,
        columns,
      }));
      return assignInitialPositions(rawTables).map((t, i) => ({
        ...t,
        color: prev[i]?.color ?? TABLE_COLORS[i % TABLE_COLORS.length],
      }));
    });
    setSelected(null);
  }, []);

  // Pan handler for empty canvas area
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };

    const onMove = (me: MouseEvent) => {
      if (!panRef.current || !container) return;
      const dx = me.clientX - panRef.current.startX;
      const dy = me.clientY - panRef.current.startY;
      container.scrollLeft = panRef.current.scrollLeft - dx;
      container.scrollTop = panRef.current.scrollTop - dy;
    };

    const onUp = () => {
      panRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Compute SVG canvas size
  const canvasW = Math.max(
    800,
    ...tables.map((t) => t.x + TABLE_W + INITIAL_PADDING + 60)
  );
  const canvasH = Math.max(
    500,
    ...tables.map((t) => t.y + tableHeight(t) + INITIAL_PADDING + 60)
  );

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
          <span className="text-[11px] text-slate-500">
            {t("erd.dragHint")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-600">
            {tables.length} {tables.length !== 1 ? t("erd.tablesPlural") : t("erd.tables")} ·{" "}
            {relations.length} {relations.length !== 1 ? t("erd.relationshipsPlural") : t("erd.relationship")}
          </span>
          <button
            onClick={handleReset}
            className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
          >
            {t("erd.resetLayout")}
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="overflow-auto rounded-xl border border-white/10 bg-slate-950"
        style={{ minHeight: 380, cursor: "default" }}
        onMouseDown={(e) => {
          // Only pan if clicking the canvas background (not a table)
          if (e.target === e.currentTarget || (e.target as Element).tagName === "svg" || (e.target as Element).tagName === "rect") {
            setSelected(null);
            handleCanvasMouseDown(e);
          }
        }}
      >
        <svg
          width={canvasW}
          height={canvasH}
          className="block"
          style={{ display: "block" }}
        >
          {/* Grid pattern */}
          <defs>
            <pattern
              id="crowsfoot-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crowsfoot-grid)" />

          {/* Relations — rendered behind tables */}
          {relations.map((rel, i) => {
            const ft = tables.find((t) => t.id === rel.fromTable);
            const tt = tables.find((t) => t.id === rel.toTable);
            if (!ft || !tt) return null;
            const isActive =
              selected === rel.fromTable || selected === rel.toTable;
            return (
              <RelationLine
                key={`${rel.fromTable}-${rel.fromColumn}-${rel.toTable}-${i}`}
                fromTable={ft}
                toTable={tt}
                relation={rel}
                active={isActive}
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
        </svg>
      </div>

      {/* Legend — Crow's foot notation */}
      <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[#eab308]">PK</span>{" "}
          {t("erd.primaryKey")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[#a855f7]">FK</span>{" "}
          {t("erd.foreignKey")}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="28" height="16" viewBox="0 0 28 16">
            <line
              x1="2"
              y1="8"
              x2="8"
              y2="8"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="8"
              y1="3"
              x2="8"
              y2="13"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="11"
              y1="3"
              x2="11"
              y2="13"
              stroke="#64748b"
              strokeWidth="1.5"
            />
          </svg>
          {t("erd.exactlyOne")}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="32" height="16" viewBox="0 0 32 16">
            <line
              x1="18"
              y1="8"
              x2="22"
              y2="8"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="22"
              y1="3"
              x2="22"
              y2="13"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="18"
              y1="8"
              x2="8"
              y2="2"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="18"
              y1="8"
              x2="8"
              y2="8"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="18"
              y1="8"
              x2="8"
              y2="14"
              stroke="#64748b"
              strokeWidth="1.5"
            />
          </svg>
          {t("erd.oneToMany")}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="38" height="16" viewBox="0 0 38 16">
            <circle
              cx="8"
              cy="8"
              r="4.5"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="24"
              y1="8"
              x2="28"
              y2="8"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="28"
              y1="3"
              x2="28"
              y2="13"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="24"
              y1="8"
              x2="14"
              y2="2"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="24"
              y1="8"
              x2="14"
              y2="8"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="24"
              y1="8"
              x2="14"
              y2="14"
              stroke="#64748b"
              strokeWidth="1.5"
            />
          </svg>
          {t("erd.zeroOrMany")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-px w-6 border-t-2 border-blue-500" />{" "}
          {t("erd.active")}
        </span>
      </div>
    </div>
  );
}
