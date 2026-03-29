const METRICS = [
  { label: "Website Visits", before: 45200, after: 52100, format: "num" },
  { label: "Bounce Rate", before: 54.2, after: 48.6, format: "pct", reverse: true }, // lower is better
  { label: "Conversion", before: 2.8, after: 3.4, format: "pct" },
  { label: "Avg Order", before: 65, after: 72, format: "currency" },
];

const grid = document.getElementById("mcGrid");

METRICS.forEach((m) => {
  const card = document.createElement("div");
  card.className = "mc-card";

  const delta = (((m.after - m.before) / m.before) * 100).toFixed(1);
  const isBetter = m.reverse ? delta < 0 : delta > 0;
  const isSame = delta == 0;

  let deltaCls = isSame ? "" : isBetter ? "up" : "down";
  let deltaSym = isSame ? "" : delta > 0 ? "▲" : "▼";

  const maxVal = Math.max(m.before, m.after) * 1.1;

  function fmt(v) {
    if (m.format === "pct") return v + "%";
    if (m.format === "currency") return "$" + v;
    return v.toLocaleString();
  }

  card.innerHTML = `
    <div class="mc-card-header">
      <div class="mc-label">${m.label}</div>
      <div class="mc-delta ${deltaCls}">${deltaSym} ${Math.abs(delta)}%</div>
    </div>
    <div class="mc-bars">
      <div class="mc-bar-row">
        <div class="mc-bar-label">Last Month</div>
        <div class="mc-bar-track">
          <div class="mc-bar-fill" style="width: 0%; background: var(--text-muted);" data-w="${(m.before / maxVal) * 100}%"></div>
        </div>
        <div class="mc-bar-val">${fmt(m.before)}</div>
      </div>
      <div class="mc-bar-row">
        <div class="mc-bar-label" style="color:var(--text);font-weight:600;">This Month</div>
        <div class="mc-bar-track">
          <div class="mc-bar-fill" style="width: 0%; background: #818cf8;" data-w="${(m.after / maxVal) * 100}%"></div>
        </div>
        <div class="mc-bar-val" style="color:var(--text);">${fmt(m.after)}</div>
      </div>
    </div>
  `;

  grid.appendChild(card);

  // Trigger animation after slight delay
  setTimeout(() => {
    card.querySelectorAll(".mc-bar-fill").forEach((fill) => {
      fill.style.width = fill.dataset.w;
    });
  }, 100);
});
