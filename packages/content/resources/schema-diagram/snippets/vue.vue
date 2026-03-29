<script setup>
import { ref, computed } from "vue";

const TABLES_INIT = [
  {
    id: "users",
    name: "users",
    color: "#58a6ff",
    x: 60,
    y: 80,
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "email", type: "text", nullable: false },
      { name: "name", type: "text", nullable: true },
      { name: "role", type: "enum", nullable: false },
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
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: true },
      { name: "title", type: "text" },
      { name: "body", type: "text", nullable: true },
      { name: "published", type: "bool" },
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
      { name: "id", type: "uuid", pk: true },
      { name: "post_id", type: "uuid", fk: true },
      { name: "user_id", type: "uuid", fk: true },
      { name: "body", type: "text" },
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
      { name: "id", type: "uuid", pk: true },
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
      { name: "tag_id", type: "uuid", pk: true, fk: true },
    ],
  },
];

const RELATIONS = [
  { from: "posts.user_id", to: "users.id", label: "N:1" },
  { from: "comments.post_id", to: "posts.id", label: "N:1" },
  { from: "comments.user_id", to: "users.id", label: "N:1" },
  { from: "post_tags.post_id", to: "posts.id", label: "N:1" },
  { from: "post_tags.tag_id", to: "tags.id", label: "N:1" },
];

const TABLE_W = 200;
const ROW_H = 28;
const HEADER_H = 36;

const tables = ref(TABLES_INIT.map((t) => ({ ...t })));
const selected = ref(null);
const animated = ref(true);

function tableHeight(t) {
  return HEADER_H + t.columns.length * ROW_H;
}

function colY(t, colName) {
  const idx = t.columns.findIndex((c) => c.name === colName);
  return t.y + HEADER_H + idx * ROW_H + ROW_H / 2;
}

function bezierPath(a, b) {
  const cx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
}

const canvasH = computed(() => Math.max(...tables.value.map((t) => t.y + tableHeight(t))) + 80);
const canvasW = computed(() => Math.max(...tables.value.map((t) => t.x + TABLE_W)) + 80);

function getRelationData(rel) {
  const [fid, fcol] = rel.from.split(".");
  const [tid, tcol] = rel.to.split(".");
  const ft = tables.value.find((t) => t.id === fid);
  const tt = tables.value.find((t) => t.id === tid);
  if (!ft || !tt) return null;
  const fx = ft.x + TABLE_W;
  const fy = colY(ft, fcol);
  const tx = tt.x;
  const ty = colY(tt, tcol);
  const path = bezierPath({ x: fx, y: fy }, { x: tx, y: ty });
  const mid = { x: (fx + tx) / 2, y: (fy + ty) / 2 };
  const active = selected.value === fid || selected.value === tid;
  return { path, mid, label: rel.label, active };
}

function handleTableMouseDown(e, tableId) {
  e.stopPropagation();
  selected.value = tableId;
  let lastX = e.clientX;
  let lastY = e.clientY;

  const onMove = (me) => {
    const dx = me.clientX - lastX;
    const dy = me.clientY - lastY;
    lastX = me.clientX;
    lastY = me.clientY;
    tables.value = tables.value.map((t) =>
      t.id === tableId ? { ...t, x: t.x + dx, y: t.y + dy } : t
    );
  };

  const onUp = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

function resetTables() {
  tables.value = TABLES_INIT.map((t) => ({ ...t }));
}
</script>

<template>
  <div style="min-height: 100vh; background: #0d1117; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; font-family: system-ui, -apple-system, sans-serif;">
    <div style="width: 100%; max-width: 1000px; display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h2 style="font-size: 15px; font-weight: 700; color: #e6edf3;">Schema Diagram</h2>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 11px; color: #484f58;">Drag tables to reposition</span>
          <button
            @click="animated = !animated"
            :style="{
              padding: '0.25rem 0.625rem',
              borderRadius: '0.5rem',
              fontSize: '11px',
              fontWeight: 600,
              border: `1px solid ${animated ? 'rgba(88,166,255,0.3)' : '#30363d'}`,
              background: animated ? 'rgba(88,166,255,0.1)' : 'transparent',
              color: animated ? '#58a6ff' : '#8b949e',
              cursor: 'pointer',
            }"
          >
            {{ animated ? "Animated" : "Static" }}
          </button>
          <button
            @click="resetTables"
            style="padding: 0.25rem 0.625rem; border-radius: 0.5rem; font-size: 11px; border: 1px solid #30363d; color: #8b949e; background: transparent; cursor: pointer;"
          >
            Reset
          </button>
        </div>
      </div>

      <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 0.75rem; overflow: auto;">
        <svg
          :width="canvasW"
          :height="canvasH"
          style="display: block;"
          @click="selected = null"
        >
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#21262d" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <template v-for="rel in RELATIONS" :key="rel.from">
            <g v-if="getRelationData(rel)">
              <path
                :d="getRelationData(rel).path"
                fill="none"
                :stroke="getRelationData(rel).active ? '#58a6ff' : '#30363d'"
                :stroke-width="getRelationData(rel).active ? 2 : 1.5"
                :stroke-dasharray="animated ? '6 3' : undefined"
                :class="animated ? 'animate-dash' : ''"
                :opacity="getRelationData(rel).active ? 1 : 0.6"
              />
              <text
                v-if="getRelationData(rel).label"
                :x="getRelationData(rel).mid.x"
                :y="getRelationData(rel).mid.y - 6"
                :fill="getRelationData(rel).active ? '#58a6ff' : '#484f58'"
                font-size="10"
                text-anchor="middle"
                font-family="monospace"
              >{{ getRelationData(rel).label }}</text>
            </g>
          </template>

          <g
            v-for="table in tables"
            :key="table.id"
            :transform="`translate(${table.x}, ${table.y})`"
            @mousedown="(e) => handleTableMouseDown(e, table.id)"
            style="cursor: grab;"
          >
            <rect x="3" y="3" :width="TABLE_W" :height="tableHeight(table)" rx="8" fill="rgba(0,0,0,0.4)" />
            <rect :width="TABLE_W" :height="tableHeight(table)" rx="8" fill="#161b22" :stroke="selected === table.id ? table.color : '#30363d'" :stroke-width="selected === table.id ? 2 : 1" />
            <rect :width="TABLE_W" :height="HEADER_H" rx="8" :fill="table.color + '22'" />
            <rect :y="HEADER_H - 8" :width="TABLE_W" height="8" :fill="table.color + '22'" />
            <rect :y="HEADER_H - 1" :width="TABLE_W" height="1" :fill="selected === table.id ? table.color : '#30363d'" opacity="0.6" />
            <text :x="TABLE_W / 2" :y="HEADER_H / 2 + 5" text-anchor="middle" :fill="table.color" font-size="13" font-weight="bold" font-family="monospace">{{ table.name }}</text>

            <g v-for="(col, i) in table.columns" :key="col.name">
              <rect v-if="i % 2 === 1" :y="HEADER_H + i * ROW_H" :width="TABLE_W" :height="ROW_H" fill="rgba(255,255,255,0.02)" />
              <text v-if="col.pk || col.fk" x="10" :y="HEADER_H + i * ROW_H + ROW_H / 2 + 4" :fill="col.pk ? '#e3b341' : '#bc8cff'" font-size="9" font-family="monospace">{{ col.pk ? "PK" : "FK" }}</text>
              <text :x="col.pk || col.fk ? 34 : 10" :y="HEADER_H + i * ROW_H + ROW_H / 2 + 4" :fill="col.nullable ? '#8b949e' : '#e6edf3'" font-size="11" font-family="monospace">{{ col.name }}</text>
              <text :x="TABLE_W - 8" :y="HEADER_H + i * ROW_H + ROW_H / 2 + 4" text-anchor="end" fill="#484f58" font-size="10" font-family="monospace">{{ col.type }}</text>
            </g>
          </g>
        </svg>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 11px; color: #8b949e;">
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="font-family: monospace; font-weight: 700; color: #e3b341;">PK</span> Primary key
        </span>
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="font-family: monospace; font-weight: 700; color: #bc8cff;">FK</span> Foreign key
        </span>
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 24px; height: 1px; border-top: 2px dashed #30363d; display: inline-block;" /> Relation
        </span>
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 24px; height: 1px; border-top: 2px solid #58a6ff; display: inline-block;" /> Selected
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes dash { to { stroke-dashoffset: -18; } }
.animate-dash { animation: dash 0.8s linear infinite; }
</style>
