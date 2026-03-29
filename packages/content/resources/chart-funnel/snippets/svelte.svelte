<script>
let tooltip = null;

const STAGES = [
  { label: "Visitors", value: 10000, color: "#818cf8" },
  { label: "Sign Ups", value: 4200, color: "#6366f1" },
  { label: "Onboarded", value: 2800, color: "#a78bfa" },
  { label: "Active Users", value: 1600, color: "#8b5cf6" },
  { label: "Paid Customers", value: 640, color: "#7c3aed" },
];

const maxW = 520;
const minW = 80;

function getWidth(stage) {
  return minW + (maxW - minW) * (stage.value / STAGES[0].value);
}

function getDrop(i) {
  if (i >= STAGES.length - 1) return null;
  const drop = STAGES[i].value - STAGES[i + 1].value;
  const pct = ((drop / STAGES[i].value) * 100).toFixed(1);
  return { drop, pct };
}

function showTip(stage, e) {
  tooltip = { stage, x: e.clientX, y: e.clientY };
}
function moveTip(e) {
  if (tooltip) tooltip = { ...tooltip, x: e.clientX, y: e.clientY };
}
function hideTip() {
  tooltip = null;
}
</script>

<style>
  .page { min-height: 100vh; background: #0d1117; padding: 1.5rem; display: flex; justify-content: center; }
  .container { width: 100%; max-width: 640px; }
  .funnel { display: flex; flex-direction: column; gap: 0; }
  .stage-wrap {
    display: flex; flex-direction: column; align-items: center;
    animation: funnelIn 0.4s ease both;
    animation-delay: var(--delay, 0s);
  }
  .stage-bar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem; border-radius: 0.5rem; cursor: pointer;
    transition: opacity 0.15s; max-width: 100%;
  }
  .stage-bar:hover { opacity: 0.9; }
  .stage-label { color: white; font-weight: 600; font-size: 13px; }
  .stage-val { color: rgba(255,255,255,0.8); font-size: 13px; }
  .drop-info { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0; font-size: 11px; color: #484f58; }
  .drop-arrow { color: #f87171; }
  .drop-pct { color: #f87171; font-weight: 600; }
  .summary { display: flex; justify-content: center; gap: 1.5rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #21262d; }
  .summary-item { text-align: center; }
  .summary-pct { font-size: 18px; font-weight: 700; }
  .summary-label { font-size: 10px; color: #484f58; margin-top: 2px; }
  .tip {
    position: fixed; pointer-events: none; background: #161b22; border: 1px solid #30363d;
    border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 50;
  }
  .tip-label { font-weight: 600; }
  .tip-detail { color: #8b949e; }

  @keyframes funnelIn {
    from { opacity: 0; transform: scaleX(0.8); }
    to { opacity: 1; transform: none; }
  }
</style>

<div class="page">
  <div class="container">
    <div class="funnel">
      {#each STAGES as stage, i}
        <div class="stage-wrap" style="--delay: {i * 0.1}s;">
          <div class="stage-bar" style="width:{getWidth(stage)}px; background:{stage.color};"
            on:mouseenter={e => showTip(stage, e)} on:mousemove={moveTip} on:mouseleave={hideTip}>
            <span class="stage-label">{stage.label}</span>
            <span class="stage-val">{stage.value.toLocaleString()}</span>
          </div>
          {#if getDrop(i)}
            {@const d = getDrop(i)}
            <div class="drop-info">
              <span class="drop-arrow">&#x25BC;</span>
              <span class="drop-pct">-{d.pct}%</span>
              <span>dropped ({d.drop.toLocaleString()})</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="summary">
      {#each STAGES as s}
        <div class="summary-item">
          <div class="summary-pct" style="color:{s.color}">{(s.value / STAGES[0].value * 100).toFixed(0)}%</div>
          <div class="summary-label">{s.label}</div>
        </div>
      {/each}
    </div>
  </div>

  {#if tooltip}
    <div class="tip" style="left:{tooltip.x+12}px; top:{tooltip.y-40}px;">
      <div class="tip-label" style="color:{tooltip.stage.color}">{tooltip.stage.label}</div>
      <div class="tip-detail">{tooltip.stage.value.toLocaleString()} users</div>
      <div class="tip-detail">Overall: {(tooltip.stage.value / STAGES[0].value * 100).toFixed(1)}%</div>
    </div>
  {/if}
</div>
