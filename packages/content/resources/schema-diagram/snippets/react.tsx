import { useState, useRef, useEffect, useCallback } from "react";

interface Column {
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
  nullable?: boolean;
}

interface Table {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  columns: Column[];
}

interface Relation {
  from: string;      // tableId.columnName
  to: string;
  label?: string;
}

const TABLES: Table[] = [
  {
    id: "users",
    name: "users",
    color: "#58a6ff",
    x: 60,
    y: 80,
    columns: [
      { name: "id",         type: "uuid",      pk: true },
      { name: "email",      type: "text",      nullable: false },
      { name: "name",       type: "text",      nullable: true },
      { name: "role",       type: "enum",      nullable: false },
      { name: "created_at", type: "timestamp" },
    ],
  },
  {
    id: "posts",
    name: "posts",
    color: "#7ee787",
    x: 400,
    y: 60,
    columns: [
      { name: "id",         type: "uuid",  pk: true },
      { name: "user_id",    type: "uuid",  fk: true },
      { name: "title",      type: "text" },
      { name: "body",       type: "text",  nullable: true },
      { name: "published",  type: "bool" },
      { name: "created_at", type: "timestamp" },
    ],
  },
  {
    id: "comments",
    name: "comments",
    color: "#e3b341",
    x: 400,
    y: 330,
    columns: [
      { name: "id",         type: "uuid", pk: true },
      { name: "post_id",    type: "uuid", fk: true },
      { name: "user_id",    type: "uuid", fk: true },
      { name: "body",       type: "text" },
      { name: "created_at", type: "timestamp" },
    ],
  },
  {
    id: "tags",
    name: "tags",
    color: "#bc8cff",
    x: 720,
    y: 60,
    columns: [
      { name: "id",   type: "uuid", pk: true },
      { name: "name", type: "text" },
      { name: "slug", type: "text" },
    ],
  },
  {
    id: "post_tags",
    name: "post_tags",
    color: "#ff7b72",
    x: 720,
    y: 280,
    columns: [
      { name: "post_id", type: "uuid", pk: true, fk: true },
      { name: "tag_id",  type: "uuid", pk: true, fk: true },
    ],
  },
];

const RELATIONS: Relation[] = [
  { from: "posts.user_id",       to: "users.id",        label: "N:1" },
  { from: "comments.post_id",    to: "posts.id",        label: "N:1" },
  { from: "comments.user_id",    to: "users.id",        label: "N:1" },
  { from: "post_tags.post_id",   to: "posts.id",        label: "N:1" },
  { from: "post_tags.tag_id",    to: "tags.id",         label: "N:1" },
];

const TABLE_W = 200;
const ROW_H = 28;
const HEADER_H = 36;

function tableHeight(t: Table) {
  return HEADER_H + t.columns.length * ROW_H;
}

function colY(t: Table, colName: string) {
  const idx = t.columns.findIndex((c) => c.name === colName);
  return t.y + HEADER_H + idx * ROW_H + ROW_H / 2;
}

type Point = { x: number; y: number };

function bezierPath(a: Point, b: Point) {
  const cx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
}

function RelationLine({
  fromTable,
  toTable,
  fromCol,
  toCol,
  label,
  active,
  animated,
}: {
  fromTable: Table;
  toTable: Table;
  fromCol: string;
  toCol: string;
  label?: string;
  active: boolean;
  animated: boolean;
}) {
  const fx = fromTable.x + TABLE_W;
  const fy = colY(fromTable, fromCol);
  const tx = toTable.x;
  const ty = colY(toTable, toCol);
  const path = bezierPath({ x: fx, y: fy }, { x: tx, y: ty });
  const mid = { x: (fx + tx) / 2, y: (fy + ty) / 2 };

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={active ? "#58a6ff" : "#30363d"}
        strokeWidth={active ? 2 : 1.5}
        strokeDasharray={animated ? "6 3" : undefined}
        className={animated ? "animate-dash" : undefined}
        opacity={active ? 1 : 0.6}
      />
      {label && (
        <text
          x={mid.x}
          y={mid.y - 6}
          fill={active ? "#58a6ff" : "#484f58"}
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

function TableNode({
  table,
  onDrag,
  selected,
  onClick,
}: {
  table: Table;
  onDrag: (id: string, dx: number, dy: number) => void;
  selected: boolean;
  onClick: (id: string) => void;
}) {
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragRef.current = { startX: e.clientX, startY: e.clientY };
    const onMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      onDrag(table.id, me.clientX - dragRef.current.startX, me.clientY - dragRef.current.startY);
      dragRef.current = { startX: me.clientX, startY: me.clientY };
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    onClick(table.id);
  };

  const h = tableHeight(table);

  return (
    <g
      transform={`translate(${table.x}, ${table.y})`}
      onMouseDown={handleMouseDown}
      style={{ cursor: "grab" }}
    >
      {/* Shadow */}
      <rect x={3} y={3} width={TABLE_W} height={h} rx={8} fill="rgba(0,0,0,0.4)" />
      {/* Body */}
      <rect
        width={TABLE_W}
        height={h}
        rx={8}
        fill="#161b22"
        stroke={selected ? table.color : "#30363d"}
        strokeWidth={selected ? 2 : 1}
      />
      {/* Header */}
      <rect width={TABLE_W} height={HEADER_H} rx={8} fill={table.color + "22"} />
      <rect y={HEADER_H - 8} width={TABLE_W} height={8} fill={table.color + "22"} />
      <rect
        y={HEADER_H - 1}
        width={TABLE_W}
        height={1}
        fill={selected ? table.color : "#30363d"}
        opacity={0.6}
      />

      {/* Table name */}
      <text
        x={TABLE_W / 2}
        y={HEADER_H / 2 + 5}
        textAnchor="middle"
        fill={table.color}
        fontSize={13}
        fontWeight="bold"
        fontFamily="monospace"
      >
        {table.name}
      </text>

      {/* Columns */}
      {table.columns.map((col, i) => {
        const cy = HEADER_H + i * ROW_H;
        return (
          <g key={col.name}>
            {i % 2 === 1 && (
              <rect y={cy} width={TABLE_W} height={ROW_H} fill="rgba(255,255,255,0.02)" />
            )}
            {/* PK/FK indicator */}
            {(col.pk || col.fk) && (
              <text x={10} y={cy + ROW_H / 2 + 4} fill={col.pk ? "#e3b341" : "#bc8cff"} fontSize={9} fontFamily="monospace">
                {col.pk ? "PK" : "FK"}
              </text>
            )}
            <text
              x={col.pk || col.fk ? 34 : 10}
              y={cy + ROW_H / 2 + 4}
              fill={col.nullable ? "#8b949e" : "#e6edf3"}
              fontSize={11}
              fontFamily="monospace"
            >
              {col.name}
            </text>
            <text
              x={TABLE_W - 8}
              y={cy + ROW_H / 2 + 4}
              textAnchor="end"
              fill="#484f58"
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

export default function SchemaDiagramRC() {
  const [tables, setTables] = useState(TABLES);
  const [selected, setSelected] = useState<string | null>(null);
  const [animated, setAnimated] = useState(true);

  const handleDrag = useCallback((id: string, dx: number, dy: number) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, x: t.x + dx, y: t.y + dy } : t))
    );
  }, []);

  const canvasH = Math.max(...tables.map((t) => t.y + tableHeight(t))) + 80;
  const canvasW = Math.max(...tables.map((t) => t.x + TABLE_W)) + 80;

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex flex-col items-center">
      <style>{`
        @keyframes dash { to { stroke-dashoffset: -18; } }
        .animate-dash { animation: dash 0.8s linear infinite; }
      `}</style>

      <div className="w-full max-w-[1000px] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#e6edf3]">Schema Diagram</h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#484f58]">Drag tables to reposition</span>
            <button
              onClick={() => setAnimated((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                animated
                  ? "bg-[#58a6ff]/10 border-[#58a6ff]/30 text-[#58a6ff]"
                  : "border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]"
              }`}
            >
              {animated ? "Animated" : "Static"}
            </button>
            <button
              onClick={() => setTables(TABLES)}
              className="px-2.5 py-1 rounded-lg text-[11px] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-auto">
          <svg
            width={canvasW}
            height={canvasH}
            className="block"
            onClick={() => setSelected(null)}
          >
            {/* Grid */}
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#21262d" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Relations (behind tables) */}
            {RELATIONS.map((rel) => {
              const [fid, fcol] = rel.from.split(".");
              const [tid, tcol] = rel.to.split(".");
              const ft = tables.find((t) => t.id === fid);
              const tt = tables.find((t) => t.id === tid);
              if (!ft || !tt) return null;
              const active = selected === fid || selected === tid;
              return (
                <RelationLine
                  key={rel.from}
                  fromTable={ft}
                  toTable={tt}
                  fromCol={fcol}
                  toCol={tcol}
                  label={rel.label}
                  active={active}
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
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-[11px] text-[#8b949e]">
          <span className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-[#e3b341]">PK</span> Primary key
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-[#bc8cff]">FK</span> Foreign key
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-px border-t-2 border-dashed border-[#30363d] inline-block" /> Relation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-px border-t-2 border-[#58a6ff] inline-block" /> Selected relation
          </span>
        </div>
      </div>
    </div>
  );
}
