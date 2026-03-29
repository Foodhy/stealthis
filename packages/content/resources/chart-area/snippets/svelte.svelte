<script>
import { onMount, onDestroy } from "svelte";

const SERIES = [
  {
    label: "Pageviews",
    color: "#818cf8",
    data: [3200, 2900, 3800, 4100, 3700, 4500, 4900, 4200, 5100, 4700, 5300, 5800, 5500, 6200],
  },
  {
    label: "Sessions",
    color: "#34d399",
    data: [1800, 1600, 2100, 2300, 2000, 2600, 2900, 2500, 3100, 2800, 3200, 3500, 3300, 3800],
  },
];
const DAYS = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 13 + i);
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
});
const PAD = { top: 20, right: 20, bottom: 36, left: 52 };

let wrapEl;
let W = 600;
let H = 270;
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

$: n = DAYS.length;
$: allVals = SERIES.flatMap((s) => s.data);
$: maxVal = Math.ceil(Math.max(...allVals) * 1.15);
$: cW = W - PAD.left - PAD.right;
$: cH = H - PAD.top - PAD.bottom;

function xOf(i) {
  return PAD.left + (i / (n - 1)) * cW;
}
function yOf(v) {
  return PAD.top + cH - (v / maxVal) * cH;
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
  const v = Math.round((maxVal / 5) * t);
  return { v, y: yOf(v), label: v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v) };
});

$: seriesData = SERIES.map((s, si) => {
  const pts = s.data.map((v, i) => [xOf(i), yOf(v)]);
  const ptsStr = pts.map((p) => p.join(",")).join(" ");
  const areaD = `M${xOf(0)},${PAD.top + cH} L${ptsStr} L${xOf(n - 1)},${PAD.top + cH} Z`;
  return { ...s, si, pts, ptsStr, areaD };
});
</script>

<style>
  .page { min-height: 100vh; background: #0d1117; padding: 1.5rem; }
  .wrap { width: 100%; max-width: 800px; margin: 0 auto; }
  .legend { display: flex; gap: 1rem; margin-bottom: 1rem; }
  .legend-item { display: flex; align-items: center; gap: 0.375rem; font-size: 12px; }
  .legend-dot { width: 12px; height: 2px; border-radius: 999px; }
  .legend-label { color: #8b949e; }
  .chart-wrap { position: relative; }
  svg { width: 100%; }
  .tooltip-box {
    position: absolute;
    pointer-events: none;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 12px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
    min-width: 150px;
  }
  .tooltip-date { color: #8b949e; font-weight: 600; margin-bottom: 0.375rem; }
  .tooltip-row { display: flex; align-items: center; gap: 0.5rem; padding: 2px 0; }
  .tooltip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .tooltip-label { color: #8b949e; flex: 1; }
  .tooltip-val { color: #e6edf3; font-weight: 700; }
</style>

<div class="page">
  <div class="wrap" bind:this={wrapEl}>
    <div class="legend">
      {#each SERIES as s}
        <div class="legend-item">
          <span class="legend-dot" style="background:{s.color}"></span>
          <span class="legend-label">{s.label}</span>
        </div>
      {/each}
    </div>

    <div class="chart-wrap">
      <svg width={W} height={H} viewBox="0 0 {W} {H}"
        on:mousemove={handleMove} on:mouseleave={() => tooltip = null}>
        <defs>
          {#each SERIES as s, si}
            <linearGradient id="agrad{si}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color={s.color} stop-opacity="0.5"/>
              <stop offset="100%" stop-color={s.color} stop-opacity="0"/>
            </linearGradient>
          {/each}
        </defs>

        {#each ticks as tick}
          <line x1={PAD.left} x2={PAD.left+cW} y1={tick.y} y2={tick.y} stroke="#21262d" stroke-width="1"/>
          <text x={PAD.left-6} y={tick.y+3.5} text-anchor="end" fill="#484f58" font-size="10">{tick.label}</text>
        {/each}

        {#each DAYS as d, i}
          {#if i % 2 === 0}
            <text x={xOf(i)} y={H-6} text-anchor="middle" fill="#484f58" font-size="10">{d}</text>
          {/if}
        {/each}

        {#if tooltip}
          <line x1={tooltip.x} x2={tooltip.x} y1={PAD.top} y2={PAD.top+cH} stroke="#8b949e" stroke-width="1" stroke-dasharray="4 2"/>
        {/if}

        {#each seriesData as s}
          <path d={s.areaD} fill="url(#agrad{s.si})"/>
          <polyline points={s.ptsStr} fill="none" stroke={s.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          {#if tooltip}
            <circle cx={s.pts[tooltip.idx][0]} cy={s.pts[tooltip.idx][1]} r="4" fill={s.color} stroke="#0d1117" stroke-width="2"/>
          {/if}
        {/each}
      </svg>

      {#if tooltip}
        <div class="tooltip-box" style="left:{Math.min(tooltip.x+12, W-170)}px; top:{tooltip.y}px;">
          <div class="tooltip-date">{DAYS[tooltip.idx]}</div>
          {#each SERIES as s}
            <div class="tooltip-row">
              <span class="tooltip-dot" style="background:{s.color}"></span>
              <span class="tooltip-label">{s.label}</span>
              <span class="tooltip-val">{s.data[tooltip.idx].toLocaleString()}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
