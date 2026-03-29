<script>
import { onMount, onDestroy } from "svelte";

const DATA = [
  { label: "Electronics", value: 340, color: "#818cf8" },
  { label: "Clothing", value: 220, color: "#34d399" },
  { label: "Books", value: 185, color: "#f59e0b" },
  { label: "Sports", value: 260, color: "#f87171" },
  { label: "Home", value: 310, color: "#a78bfa" },
  { label: "Beauty", value: 145, color: "#38bdf8" },
];
const PAD = { top: 24, right: 20, bottom: 40, left: 52 };

let wrapEl;
let W = 600;
let orient = "vertical";
let tooltip = null;
let animated = false;
let ro;

$: maxVal = Math.ceil(Math.max(...DATA.map((d) => d.value)) * 1.15);

onMount(() => {
  ro = new ResizeObserver(() => {
    if (wrapEl) W = wrapEl.clientWidth - 32;
  });
  if (wrapEl) ro.observe(wrapEl);
  requestAnimationFrame(() => (animated = true));
});

onDestroy(() => {
  if (ro) ro.disconnect();
});

function toggleOrient(o) {
  orient = o;
  animated = false;
  requestAnimationFrame(() => (animated = true));
}

function showTooltip(d, e) {
  tooltip = { ...d, x: e.clientX, y: e.clientY };
}
function moveTooltip(e) {
  if (tooltip) tooltip = { ...tooltip, x: e.clientX, y: e.clientY };
}
function hideTooltip() {
  tooltip = null;
}

// Vertical helpers
$: vH = Math.round(W * 0.5);
$: vCW = W - PAD.left - PAD.right;
$: vCH = vH - PAD.top - PAD.bottom;
$: vGap = 8;
$: vBarW = (vCW - vGap * (DATA.length - 1)) / DATA.length;
function vYOf(v) {
  return PAD.top + vCH - (v / maxVal) * vCH;
}

$: vTicks = Array.from({ length: 6 }, (_, t) => {
  const v = Math.round((maxVal / 5) * t);
  return { v, y: vYOf(v) };
});

// Horizontal helpers
$: hBarH = 30;
$: hGap = 12;
$: hTotalH = DATA.length * (hBarH + hGap);
$: hH = hTotalH + PAD.top + PAD.bottom;
$: hCW = W - PAD.left - PAD.right;
function hXOf(v) {
  return PAD.left + (v / maxVal) * hCW;
}

$: hTicks = Array.from({ length: 6 }, (_, t) => {
  const v = Math.round((maxVal / 5) * t);
  return { v, x: hXOf(v) };
});
</script>

<style>
  .page { min-height: 100vh; background: #0d1117; padding: 1.5rem; }
  .wrap { width: 100%; max-width: 800px; margin: 0 auto; }
  .controls { display: flex; gap: 4px; margin-bottom: 1rem; justify-content: flex-end; }
  .ctrl-btn {
    font-size: 11px; padding: 4px 12px; border-radius: 4px; border: 1px solid #30363d;
    background: transparent; color: #8b949e; cursor: pointer; text-transform: capitalize;
    transition: color 0.15s, border-color 0.15s, background 0.15s; font-family: inherit;
  }
  .ctrl-btn.active { background: rgba(129,140,248,0.2); border-color: #818cf8; color: #818cf8; }
  .ctrl-btn:hover:not(.active) { border-color: #8b949e; }
  .chart-wrap { position: relative; }
  svg { width: 100%; overflow: visible; }
  .tip {
    position: fixed; pointer-events: none; background: #161b22; border: 1px solid #30363d;
    border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 50;
  }
  .tip-label { font-weight: 600; }
  .tip-val { color: #8b949e; }
</style>

<div class="page">
  <div class="wrap" bind:this={wrapEl}>
    <div class="controls">
      {#each ['vertical','horizontal'] as o}
        <button class="ctrl-btn {orient === o ? 'active' : ''}" on:click={() => toggleOrient(o)}>{o}</button>
      {/each}
    </div>

    <div class="chart-wrap">
      {#if orient === 'vertical'}
        <svg width={W} height={vH} viewBox="0 0 {W} {vH}">
          {#each vTicks as tick}
            <line x1={PAD.left} x2={PAD.left+vCW} y1={tick.y} y2={tick.y} stroke="#21262d" stroke-width="1"/>
            <text x={PAD.left-6} y={tick.y+3.5} text-anchor="end" fill="#484f58" font-size="10">{tick.v}</text>
          {/each}
          {#each DATA as d, i}
            {@const x = PAD.left + i * (vBarW + vGap)}
            {@const barH = (d.value / maxVal) * vCH}
            {@const y = PAD.top + vCH - barH}
            <rect {x} y={animated ? y : PAD.top + vCH} width={vBarW} height={animated ? barH : 0} rx="4" fill={d.color}
              style="transition: y 0.5s cubic-bezier(.4,0,.2,1) {i*0.06}s, height 0.5s cubic-bezier(.4,0,.2,1) {i*0.06}s; cursor: pointer;"
              on:mouseenter={e => showTooltip(d, e)} on:mousemove={moveTooltip} on:mouseleave={hideTooltip}/>
            <text x={x+vBarW/2} y={y-4} text-anchor="middle" fill="#8b949e" font-size="10">{d.value}</text>
            <text x={x+vBarW/2} y={vH-6} text-anchor="middle" fill="#484f58" font-size="10">{d.label}</text>
          {/each}
        </svg>
      {:else}
        <svg width={W} height={hH} viewBox="0 0 {W} {hH}">
          {#each hTicks as tick}
            <line x1={tick.x} x2={tick.x} y1={PAD.top} y2={PAD.top+hTotalH} stroke="#21262d" stroke-width="1"/>
            <text x={tick.x} y={PAD.top+hTotalH+14} text-anchor="middle" fill="#484f58" font-size="10">{tick.v}</text>
          {/each}
          {#each DATA as d, i}
            {@const y = PAD.top + i * (hBarH + hGap)}
            {@const bW = animated ? (d.value / maxVal) * hCW : 0}
            <rect x={PAD.left} {y} width={bW} height={hBarH} rx="4" fill={d.color}
              style="transition: width 0.5s cubic-bezier(.4,0,.2,1) {i*0.06}s; cursor: pointer;"
              on:mouseenter={e => showTooltip(d, e)} on:mousemove={moveTooltip} on:mouseleave={hideTooltip}/>
            <text x={PAD.left-6} y={y+hBarH/2+4} text-anchor="end" fill="#484f58" font-size="10">{d.label}</text>
            <text x={PAD.left+bW+4} y={y+hBarH/2+4} text-anchor="start" fill="#8b949e" font-size="10">{d.value}</text>
          {/each}
        </svg>
      {/if}

      {#if tooltip}
        <div class="tip" style="left:{tooltip.x+12}px; top:{tooltip.y-40}px;">
          <div class="tip-label" style="color:{tooltip.color}">{tooltip.label}</div>
          <div class="tip-val">{tooltip.value} units</div>
        </div>
      {/if}
    </div>
  </div>
</div>
