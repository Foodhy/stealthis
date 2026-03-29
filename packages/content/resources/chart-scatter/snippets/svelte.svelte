<script>
import { onMount, onDestroy } from "svelte";

const GROUPS = [
  {
    label: "Team A",
    color: "#818cf8",
    points: [
      { name: "Auth", x: 12, y: 3 },
      { name: "Dashboard", x: 18, y: 7 },
      { name: "Profile", x: 8, y: 2 },
      { name: "Settings", x: 22, y: 11 },
      { name: "Reports", x: 15, y: 5 },
    ],
  },
  {
    label: "Team B",
    color: "#34d399",
    points: [
      { name: "API", x: 25, y: 9 },
      { name: "Search", x: 30, y: 14 },
      { name: "Payments", x: 20, y: 6 },
      { name: "Mobile", x: 35, y: 18 },
      { name: "Export", x: 14, y: 4 },
    ],
  },
  {
    label: "Team C",
    color: "#f59e0b",
    points: [
      { name: "Admin", x: 40, y: 20 },
      { name: "CMS", x: 28, y: 12 },
      { name: "Email", x: 10, y: 1 },
      { name: "CDN", x: 45, y: 22 },
    ],
  },
];
const PAD = { top: 24, right: 24, bottom: 48, left: 52 };

let wrapEl;
let W = 600;
let hidden = new Set();
let tooltip = null;
let ro;

onMount(() => {
  ro = new ResizeObserver(() => {
    if (!wrapEl) return;
    W = wrapEl.clientWidth - 32;
  });
  if (wrapEl) ro.observe(wrapEl);
});
onDestroy(() => {
  if (ro) ro.disconnect();
});

function toggleHidden(i) {
  const n = new Set(hidden);
  n.has(i) ? n.delete(i) : n.add(i);
  hidden = n;
}

$: H = Math.round(W * 0.5);
$: cW = W - PAD.left - PAD.right;
$: cH = H - PAD.top - PAD.bottom;

const allPts = GROUPS.flatMap((g) => g.points);
const maxX = Math.ceil(Math.max(...allPts.map((p) => p.x)) * 1.1);
const maxY = Math.ceil(Math.max(...allPts.map((p) => p.y)) * 1.15);

function xOf(v) {
  return PAD.left + (v / maxX) * cW;
}
function yOf(v) {
  return PAD.top + cH - (v / maxY) * cH;
}

function linReg(pts) {
  const n = pts.length;
  const sumX = pts.reduce((a, p) => a + p.x, 0);
  const sumY = pts.reduce((a, p) => a + p.y, 0);
  const sumXY = pts.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = pts.reduce((a, p) => a + p.x * p.x, 0);
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return { m, b: (sumY - m * sumX) / n };
}

const reg = linReg(allPts);
const ry1 = reg.m * 0 + reg.b;
const ry2 = reg.m * maxX + reg.b;

$: xTicks = Array.from({ length: 6 }, (_, t) => {
  const v = Math.round((maxX / 5) * t);
  return { v, x: xOf(v) };
});

$: yTicks = Array.from({ length: 6 }, (_, t) => {
  const v = Math.round((maxY / 5) * t);
  return { v, y: yOf(v) };
});

function dotEnter(e, p) {
  tooltip = { name: p.name, px: p.x, py: p.y, x: e.clientX, y: e.clientY };
}
function dotMove(e) {
  if (tooltip) tooltip = { ...tooltip, x: e.clientX, y: e.clientY };
}
</script>

<style>
  .page { min-height: 100vh; background: #0d1117; padding: 1.5rem; font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: flex-start; }
  .wrap { width: 100%; max-width: 800px; }
  .title { color: #e6edf3; font-size: 16px; font-weight: 700; margin-bottom: 0.75rem; }
  .legend { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .legend-btn { display: flex; align-items: center; gap: 0.375rem; font-size: 11px; padding: 4px 8px; border-radius: 4px; border: 1px solid #30363d; background: none; cursor: pointer; transition: opacity 0.2s; }
  .legend-btn:hover { border-color: #8b949e; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
  .legend-label { color: #8b949e; }
  .chart-wrap { position: relative; background: #161b22; border: 1px solid #30363d; border-radius: 0.75rem; padding: 1rem; }
  .chart-svg { width: 100%; display: block; }
  .tooltip-fixed { position: fixed; pointer-events: none; background: #161b22; border: 1px solid #30363d; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 50; }
  .tooltip-title { font-weight: 600; color: #e6edf3; }
</style>

<div class="page">
  <div class="wrap" bind:this={wrapEl}>
    <h2 class="title">Scatter Plot</h2>
    <div class="legend">
      {#each GROUPS as g, i}
        <button class="legend-btn" style="opacity:{hidden.has(i) ? 0.3 : 1}" on:click={() => toggleHidden(i)}>
          <span class="legend-dot" style="background:{g.color}"></span>
          <span class="legend-label">{g.label}</span>
        </button>
      {/each}
    </div>

    <div class="chart-wrap">
      <svg width={W} height={H} viewBox="0 0 {W} {H}" class="chart-svg">
        <!-- X grid -->
        {#each xTicks as tick}
          <line x1={tick.x} x2={tick.x} y1={PAD.top} y2={PAD.top + cH} stroke="#21262d" stroke-width="1"/>
          <text x={tick.x} y={H - 8} text-anchor="middle" fill="#484f58" font-size="10">{tick.v} features</text>
        {/each}

        <!-- Y grid -->
        {#each yTicks as tick}
          <line x1={PAD.left} x2={PAD.left + cW} y1={tick.y} y2={tick.y} stroke="#21262d" stroke-width="1"/>
          <text x={PAD.left - 6} y={tick.y + 3.5} text-anchor="end" fill="#484f58" font-size="10">{tick.v}</text>
        {/each}

        <!-- Chart background -->
        <rect x={PAD.left} y={PAD.top} width={cW} height={cH} fill="#0d1117" rx="4"/>

        <!-- Axis labels -->
        <text x={PAD.left + cW / 2} y={H - 0} text-anchor="middle" fill="#8b949e" font-size="11" font-weight="500">Feature Count</text>
        <text x={14} y={PAD.top + cH / 2} text-anchor="middle" fill="#8b949e" font-size="11" font-weight="500" transform="rotate(-90 14 {PAD.top + cH / 2})">Value ($k)</text>

        <!-- Regression line -->
        <line x1={xOf(0)} y1={yOf(ry1)} x2={xOf(maxX)} y2={yOf(ry2)}
          stroke="#484f58" stroke-width="1.5" stroke-dasharray="6 3"/>

        <!-- Dots -->
        {#each GROUPS as g, gi}
          {#if !hidden.has(gi)}
            {#each g.points as p, pi}
              <circle cx={xOf(p.x)} cy={yOf(p.y)} r="7" fill={g.color} fill-opacity="0.85"
                style="cursor: pointer; transition: r 0.15s;"
                on:mouseenter={(e) => dotEnter(e, p)}
                on:mousemove={dotMove}
                on:mouseleave={() => tooltip = null}/>
            {/each}
          {/if}
        {/each}
      </svg>

      {#if tooltip}
        <div class="tooltip-fixed" style="left:{tooltip.x + 12}px; top:{tooltip.y - 50}px;">
          <div class="tooltip-title">{tooltip.name}</div>
          <div style="color:#8b949e;font-size:11px;margin-top:2px;">{tooltip.px} features · ${tooltip.py}k</div>
        </div>
      {/if}
    </div>
  </div>
</div>
