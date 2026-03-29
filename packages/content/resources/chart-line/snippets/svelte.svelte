<script>
import { onMount, onDestroy } from "svelte";

const SERIES = [
  {
    label: "Revenue",
    color: "#818cf8",
    data: [42, 58, 51, 67, 73, 89, 95, 88, 102, 115, 108, 127],
  },
  { label: "Expenses", color: "#f87171", data: [30, 34, 29, 35, 40, 44, 48, 42, 50, 55, 52, 58] },
  { label: "Profit", color: "#34d399", data: [12, 24, 22, 32, 33, 45, 47, 46, 52, 60, 56, 69] },
];
const LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAD = { top: 20, right: 20, bottom: 36, left: 48 };

let wrapEl;
let W = 600;
let H = 270;
let smooth = false;
let hidden = new Set();
let tooltip = null;
let ro;

onMount(() => {
  ro = new ResizeObserver(() => {
    if (!wrapEl) return;
    W = wrapEl.clientWidth - 32;
    H = Math.round(W * 0.45);
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

$: n = LABELS.length;
$: cW = W - PAD.left - PAD.right;
$: cH = H - PAD.top - PAD.bottom;
$: maxVal = (() => {
  const visible = SERIES.filter((_, i) => !hidden.has(i));
  const vals = visible.flatMap((s) => s.data);
  return vals.length ? Math.ceil(Math.max(...vals) * 1.15) : 100;
})();

function xOf(i) {
  return PAD.left + (i / (n - 1)) * cW;
}
function yOf(v) {
  return PAD.top + cH - (v / maxVal) * cH;
}

function linePath(pts) {
  return pts
    .map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
}
function bezierPath(pts) {
  if (pts.length < 2) return linePath(pts);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp1x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * 0.4;
    const cp2x = pts[i + 1][0] - (pts[i + 1][0] - pts[i][0]) * 0.4;
    d += ` C${cp1x.toFixed(1)} ${pts[i][1].toFixed(1)} ${cp2x.toFixed(1)} ${pts[i + 1][1].toFixed(1)} ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`;
  }
  return d;
}

function handleMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const idx = Math.round(((mx - PAD.left) / cW) * (n - 1));
  if (idx < 0 || idx >= n) {
    tooltip = null;
    return;
  }
  tooltip = { idx, x: xOf(idx), y: PAD.top };
}

$: ticks = Array.from({ length: 6 }, (_, t) => {
  const v = (maxVal / 5) * t;
  return { v, y: yOf(v), label: Math.round(v) + "k" };
});

$: seriesData = SERIES.map((s, si) => {
  const pts = s.data.map((v, i) => [xOf(i), yOf(v)]);
  const pathD = smooth ? bezierPath(pts) : linePath(pts);
  return { ...s, si, pts, pathD };
});
</script>

<style>
  .page { min-height: 100vh; background: #0d1117; padding: 1.5rem; font-family: system-ui, -apple-system, sans-serif; }
  .wrap { width: 100%; max-width: 800px; margin: 0 auto; }
  .controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
  .legend { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .legend-btn { display: flex; align-items: center; gap: 0.375rem; font-size: 11px; padding: 4px 8px; border-radius: 4px; border: 1px solid #30363d; background: none; cursor: pointer; transition: opacity 0.2s; }
  .legend-btn:hover { border-color: #8b949e; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
  .legend-label { color: #8b949e; }
  .mode-btns { display: flex; gap: 4px; }
  .mode-btn { font-size: 11px; padding: 4px 12px; border-radius: 4px; border: 1px solid #30363d; background: none; color: #8b949e; cursor: pointer; transition: all 0.2s; }
  .mode-btn:hover { border-color: #8b949e; }
  .mode-btn.active { background: rgba(129,140,248,0.2); border-color: #818cf8; color: #818cf8; }
  .chart-wrap { position: relative; }
  .chart-svg { width: 100%; }
  .tooltip-box { position: absolute; pointer-events: none; background: #161b22; border: 1px solid #30363d; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); min-width: 140px; }
  .tooltip-date { color: #8b949e; font-weight: 600; margin-bottom: 0.375rem; }
  .tooltip-row { display: flex; align-items: center; gap: 0.5rem; padding: 2px 0; }
  .tooltip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .tooltip-label { color: #8b949e; flex: 1; }
  .tooltip-val { color: #e6edf3; font-weight: 700; }
</style>

<div class="page">
  <div class="wrap" bind:this={wrapEl}>
    <div class="controls">
      <div class="legend">
        {#each SERIES as s, i}
          <button class="legend-btn" style="opacity:{hidden.has(i) ? 0.3 : 1}" on:click={() => toggleHidden(i)}>
            <span class="legend-dot" style="background:{s.color}"></span>
            <span class="legend-label">{s.label}</span>
          </button>
        {/each}
      </div>
      <div class="mode-btns">
        <button class="mode-btn" class:active={!smooth} on:click={() => smooth = false}>Linear</button>
        <button class="mode-btn" class:active={smooth} on:click={() => smooth = true}>Smooth</button>
      </div>
    </div>

    <div class="chart-wrap">
      <svg width={W} height={H} viewBox="0 0 {W} {H}" class="chart-svg"
        on:mousemove={handleMove} on:mouseleave={() => tooltip = null}>

        {#each ticks as tick}
          <line x1={PAD.left} x2={PAD.left + cW} y1={tick.y} y2={tick.y} stroke="#21262d" stroke-width="1"/>
          <text x={PAD.left - 6} y={tick.y + 3.5} text-anchor="end" fill="#484f58" font-size="10">{tick.label}</text>
        {/each}

        {#each LABELS as lbl, i}
          <text x={xOf(i)} y={H - 6} text-anchor="middle" fill="#484f58" font-size="10">{lbl}</text>
        {/each}

        {#if tooltip}
          <line x1={tooltip.x} x2={tooltip.x} y1={PAD.top} y2={PAD.top + cH}
            stroke="#8b949e" stroke-width="1" stroke-dasharray="4 2"/>
        {/if}

        {#each seriesData as s}
          {#if !hidden.has(s.si)}
            <path d={s.pathD} fill="none" stroke={s.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            {#each s.pts as pt, i}
              <circle cx={pt[0]} cy={pt[1]}
                r={tooltip && tooltip.idx === i ? 4 : 2.5}
                fill={s.color} opacity={tooltip && tooltip.idx === i ? 1 : 0.7}/>
            {/each}
          {/if}
        {/each}
      </svg>

      {#if tooltip}
        <div class="tooltip-box" style="left:{Math.min(tooltip.x + 12, W - 160)}px; top:{tooltip.y}px;">
          <div class="tooltip-date">{LABELS[tooltip.idx]}</div>
          {#each SERIES as s, si}
            {#if !hidden.has(si)}
              <div class="tooltip-row">
                <span class="tooltip-dot" style="background:{s.color}"></span>
                <span class="tooltip-label">{s.label}</span>
                <span class="tooltip-val">${s.data[tooltip.idx]}k</span>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
