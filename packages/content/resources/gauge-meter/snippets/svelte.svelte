<script>
import { onMount, onDestroy } from "svelte";

const SIZE = 200,
  CX = SIZE / 2,
  CY = SIZE * 0.6,
  R = 80,
  STROKE = 16;
const START_ANG = -210 * (Math.PI / 180),
  END_ANG = 30 * (Math.PI / 180);

const GAUGES = [
  {
    label: "CPU Load",
    value: 68,
    min: 0,
    max: 100,
    zones: [
      { from: 0, to: 50, color: "#34d399" },
      { from: 50, to: 75, color: "#f59e0b" },
      { from: 75, to: 100, color: "#f87171" },
    ],
  },
  {
    label: "Memory",
    value: 42,
    min: 0,
    max: 100,
    zones: [
      { from: 0, to: 50, color: "#34d399" },
      { from: 50, to: 80, color: "#f59e0b" },
      { from: 80, to: 100, color: "#f87171" },
    ],
  },
  {
    label: "Disk Health",
    value: 87,
    min: 0,
    max: 100,
    zones: [
      { from: 0, to: 40, color: "#f87171" },
      { from: 40, to: 70, color: "#f59e0b" },
      { from: 70, to: 100, color: "#34d399" },
    ],
  },
];

function ptOnArc(r, ang) {
  return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
}
function arcD(r, a1, a2) {
  const [sx, sy] = ptOnArc(r, a1),
    [ex, ey] = ptOnArc(r, a2);
  const large = a2 - a1 > Math.PI ? 1 : 0;
  return `M${sx.toFixed(2)},${sy.toFixed(2)} A${r},${r} 0 ${large},1 ${ex.toFixed(2)},${ey.toFixed(2)}`;
}
function valToAng(v, min, max) {
  return START_ANG + ((v - min) / (max - min)) * (END_ANG - START_ANG);
}

let values = GAUGES.map((g) => g.value);
let currents = GAUGES.map((g) => g.min);
let rafIds = [];

function animateGauge(idx, targetVal) {
  const cfg = GAUGES[idx];
  const from = currents[idx];
  let start = null;
  const duration = 1000;

  if (rafIds[idx]) cancelAnimationFrame(rafIds[idx]);

  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    currents[idx] = from + (targetVal - from) * eased;
    currents = currents;
    if (p < 1) rafIds[idx] = requestAnimationFrame(step);
  }
  rafIds[idx] = requestAnimationFrame(step);
}

function randomize() {
  values = GAUGES.map(() => Math.floor(Math.random() * 91) + 5);
  values.forEach((v, i) => animateGauge(i, v));
}

onMount(() => {
  values.forEach((v, i) => animateGauge(i, v));
});

onDestroy(() => {
  rafIds.forEach((id) => cancelAnimationFrame(id));
});

function needleXY(idx) {
  const ang = valToAng(currents[idx], GAUGES[idx].min, GAUGES[idx].max);
  return ptOnArc(R - STROKE / 2 - 2, ang);
}
function minLabelXY() {
  return ptOnArc(R + 18, START_ANG);
}
function maxLabelXY() {
  return ptOnArc(R + 18, END_ANG);
}
</script>

<div class="gauge-wrapper">
  <div class="gauge-grid">
    {#each GAUGES as cfg, i}
      <div class="gauge-item">
        <svg width={SIZE} height={SIZE * 0.7} viewBox="0 0 {SIZE} {SIZE * 0.7}">
          <path d={arcD(R, START_ANG, END_ANG)} fill="none" stroke="#1e2130" stroke-width={STROKE} stroke-linecap="round"/>
          {#each cfg.zones as z}
            <path d={arcD(R, valToAng(z.from, cfg.min, cfg.max), valToAng(z.to, cfg.min, cfg.max))}
              fill="none" stroke={z.color} stroke-width={STROKE * 0.55} stroke-linecap="round"/>
          {/each}
          <text x={minLabelXY()[0]} y={minLabelXY()[1]} text-anchor="middle" fill="#64748b" font-size="10">{cfg.min}</text>
          <text x={maxLabelXY()[0]} y={maxLabelXY()[1]} text-anchor="middle" fill="#64748b" font-size="10">{cfg.max}</text>
          <line x1={CX} y1={CY} x2={needleXY(i)[0].toFixed(2)} y2={needleXY(i)[1].toFixed(2)} stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx={CX} cy={CY} r="6" fill="#e2e8f0"/>
          <text x={CX} y={CY - 16} text-anchor="middle" fill="#e2e8f0" font-size="22" font-weight="800">{Math.round(currents[i])}</text>
        </svg>
        <div class="gauge-label">{cfg.label}</div>
      </div>
    {/each}
  </div>
  <button class="randomize-btn" on:click={randomize}>Randomize</button>
</div>

<style>
  .gauge-wrapper {
    min-height: 100vh;
    background: #0d1117;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
  .gauge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }
  .gauge-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .gauge-label {
    color: #8b949e;
    font-size: 13px;
    margin-top: -4px;
  }
  .randomize-btn {
    padding: 0.5rem 1rem;
    background: rgba(129, 140, 248, 0.2);
    border: 1px solid rgba(129, 140, 248, 0.4);
    color: #818cf8;
    border-radius: 0.5rem;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .randomize-btn:hover { background: rgba(129, 140, 248, 0.3); }
</style>
