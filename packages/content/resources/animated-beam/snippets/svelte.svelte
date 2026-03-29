<script>
import { onMount, onDestroy } from "svelte";

let containerEl;
let fromEl;
let midEl;
let toEl;

let pathD1 = "";
let pathD2 = "";
let gradientId1 = "beam-grad-" + Math.random().toString(36).slice(2, 9);
let gradientId2 = "beam-grad-" + Math.random().toString(36).slice(2, 9);

function updatePaths() {
  if (!containerEl || !fromEl || !midEl || !toEl) return;

  const cr = containerEl.getBoundingClientRect();
  const fr = fromEl.getBoundingClientRect();
  const mr = midEl.getBoundingClientRect();
  const tr = toEl.getBoundingClientRect();

  const fromCenter = {
    x: fr.left + fr.width / 2 - cr.left,
    y: fr.top + fr.height / 2 - cr.top,
  };
  const midCenter = {
    x: mr.left + mr.width / 2 - cr.left,
    y: mr.top + mr.height / 2 - cr.top,
  };
  const toCenter = {
    x: tr.left + tr.width / 2 - cr.left,
    y: tr.top + tr.height / 2 - cr.top,
  };

  const midX1 = (fromCenter.x + midCenter.x) / 2;
  pathD1 = `M ${fromCenter.x} ${fromCenter.y} C ${midX1} ${fromCenter.y + -40}, ${midX1} ${midCenter.y + -40}, ${midCenter.x} ${midCenter.y}`;

  const midX2 = (midCenter.x + toCenter.x) / 2;
  pathD2 = `M ${midCenter.x} ${midCenter.y} C ${midX2} ${midCenter.y + 40}, ${midX2} ${toCenter.y + 40}, ${toCenter.x} ${toCenter.y}`;
}

onMount(() => {
  updatePaths();
  window.addEventListener("resize", updatePaths);
});

onDestroy(() => {
  window.removeEventListener("resize", updatePaths);
});

function iconBoxStyle(color) {
  return `width: 56px; height: 56px; display: grid; place-items: center; font-size: 1.25rem; border-radius: 1rem; background: rgba(255,255,255,0.05); border: 1px solid ${color}44; color: ${color}; box-shadow: 0 0 20px ${color}26;`;
}
</script>

<div
  style="min-height: 100vh; display: grid; place-items: center; background: #0a0a0a; font-family: system-ui, -apple-system, sans-serif;"
>
  <div
    bind:this={containerEl}
    style="position: relative; width: min(700px, calc(100vw - 2rem)); height: 300px; display: flex; align-items: center; justify-content: space-between; padding: 2rem 3rem;"
  >
    <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible;">
      <defs>
        <linearGradient id={gradientId1} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.1" />
          <stop offset="50%" stop-color="#22d3ee" stop-opacity="1" />
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0.1" />
        </linearGradient>
        <linearGradient id={gradientId2} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#a855f7" stop-opacity="0.1" />
          <stop offset="50%" stop-color="#a855f7" stop-opacity="1" />
          <stop offset="100%" stop-color="#34d399" stop-opacity="0.1" />
        </linearGradient>
      </defs>
      <!-- Beam 1 -->
      <path d={pathD1} fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2" stroke-linecap="round" />
      <path d={pathD1} class="beam-dash" style="stroke: url(#{gradientId1}); filter: blur(4px); opacity: 0.5;" />
      <path d={pathD1} class="beam-dash" style="stroke: url(#{gradientId1});" />
      <!-- Beam 2 -->
      <path d={pathD2} fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2" stroke-linecap="round" />
      <path d={pathD2} class="beam-dash beam-dash-slow" style="stroke: url(#{gradientId2}); filter: blur(4px); opacity: 0.5;" />
      <path d={pathD2} class="beam-dash beam-dash-slow" style="stroke: url(#{gradientId2});" />
    </svg>

    <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
      <div bind:this={fromEl} style={iconBoxStyle('#22d3ee')}>&#9670;</div>
      <span style="font-size: 0.8125rem; font-weight: 500; color: #94a3b8;">Source</span>
    </div>

    <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
      <div bind:this={midEl} style={iconBoxStyle('#a855f7')}>&#9733;</div>
      <span style="font-size: 0.8125rem; font-weight: 500; color: #94a3b8;">Process</span>
    </div>

    <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
      <div bind:this={toEl} style={iconBoxStyle('#34d399')}>&#9679;</div>
      <span style="font-size: 0.8125rem; font-weight: 500; color: #94a3b8;">Output</span>
    </div>
  </div>
</div>

<style>
  @keyframes animated-beam-dash {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: -40; }
  }
  .beam-dash {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 16 24;
    animation: animated-beam-dash 2s linear infinite;
  }
  .beam-dash-slow {
    animation-duration: 2.5s;
  }
</style>
