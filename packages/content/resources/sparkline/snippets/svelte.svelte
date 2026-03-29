<script>
const W = 120,
  H = 36;

const ROWS = [
  {
    label: "Revenue",
    values: [3200, 2900, 3800, 4100, 3700, 4500, 4900, 4200, 5100, 4700, 5300, 5800],
    color: "#818cf8",
    suffix: "k",
  },
  {
    label: "Active Users",
    values: [810, 770, 840, 920, 880, 960, 1010, 980, 1050, 990, 1080, 1120],
    color: "#34d399",
    suffix: "",
  },
  {
    label: "Conversion",
    values: [2.1, 2.4, 2.2, 2.8, 2.6, 3.1, 2.9, 3.3, 3.0, 3.5, 3.2, 3.8],
    color: "#f59e0b",
    suffix: "%",
  },
  {
    label: "Bounce Rate",
    values: [54, 58, 52, 49, 55, 47, 50, 46, 48, 45, 43, 41],
    color: "#f87171",
    suffix: "%",
  },
  {
    label: "Avg. Session",
    values: [2.1, 2.3, 2.0, 2.4, 2.2, 2.6, 2.5, 2.8, 2.7, 3.0, 2.9, 3.2],
    color: "#a78bfa",
    suffix: "m",
  },
];

function sparklineData(values, color) {
  const min = Math.min(...values),
    max = Math.max(...values);
  const xOf = (i) => (i / (values.length - 1)) * W;
  const yOf = (v) => H - 2 - ((v - min) / (max - min || 1)) * (H - 6);
  const pts = values.map((v, i) => [xOf(i), yOf(v)]);
  const ptsStr = pts.map((p) => p.join(",")).join(" ");
  const areaD = `M${pts[0][0]},${H} ${ptsStr} L${pts[pts.length - 1][0]},${H} Z`;
  const id = `sg${color.replace("#", "")}`;
  const last = pts[pts.length - 1];
  return { ptsStr, areaD, id, last };
}

function fmt(v, suffix) {
  return (v % 1 === 0 ? v : v.toFixed(1)) + suffix;
}

function rowData(row) {
  const cur = row.values[row.values.length - 1];
  const prev = row.values[row.values.length - 2];
  const delta = (((cur - prev) / prev) * 100).toFixed(1);
  const isUp = +delta > 0;
  return { cur, delta, isUp };
}
</script>

<div class="wrapper">
  <div class="table">
    <div class="header">
      <span>Metric</span>
      <span class="right pr6">Trend</span>
      <span class="right pr4">Current</span>
      <span class="right">Change</span>
    </div>
    {#each ROWS as row}
      {@const sl = sparklineData(row.values, row.color)}
      {@const rd = rowData(row)}
      <div class="row">
        <div class="metric">
          <span class="dot" style="background: {row.color};"></span>
          <span class="label">{row.label}</span>
        </div>
        <div class="pr6">
          <svg width={W} height={H} viewBox="0 0 {W} {H}">
            <defs>
              <linearGradient id={sl.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color={row.color} stop-opacity="0.35" />
                <stop offset="100%" stop-color={row.color} stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d={sl.areaD} fill="url(#{sl.id})" />
            <polyline points={sl.ptsStr} fill="none" stroke={row.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx={sl.last[0]} cy={sl.last[1]} r="3" fill={row.color} stroke="#0f1117" stroke-width="1.5" />
          </svg>
        </div>
        <div class="current">{fmt(rd.cur, row.suffix)}</div>
        <div class="change" class:up={rd.isUp} class:down={!rd.isUp}>
          {rd.isUp ? '▲' : '▼'}{Math.abs(+rd.delta)}%
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .wrapper {
    min-height: 100vh;
    background: #0d1117;
    padding: 1.5rem;
    display: flex;
    justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .table {
    width: 100%;
    max-width: 600px;
    background: #0d1117;
    border-radius: 0.75rem;
    border: 1px solid #21262d;
    overflow: hidden;
  }
  .header {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #21262d;
    font-size: 11px;
    color: #484f58;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .right { text-align: right; }
  .pr6 { padding-right: 1.5rem; }
  .pr4 { padding-right: 1rem; }
  .row {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #21262d;
  }
  .row:last-child { border-bottom: 0; }
  .row:hover { background: #161b22; }
  .metric { display: flex; align-items: center; gap: 0.5rem; }
  .dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .label { color: #8b949e; font-size: 13px; }
  .current { color: #e6edf3; font-weight: 600; font-size: 14px; padding-right: 1rem; }
  .change { font-size: 12px; font-weight: 600; text-align: right; }
  .up { color: #34d399; }
  .down { color: #f87171; }
</style>
