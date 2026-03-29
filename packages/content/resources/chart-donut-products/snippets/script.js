const DATA = [
  { label: "Electronics", value: 3400, color: "#1e3a5f" },
  { label: "Clothing", value: 2600, color: "#2563eb" },
  { label: "Home & Garden", value: 1800, color: "#60a5fa" },
  { label: "Books & Media", value: 1200, color: "#93c5fd" },
  { label: "Sports", value: 900, color: "#bfdbfe" },
];
const total = DATA.reduce((a, d) => a + d.value, 0);

const donutSvg = document.getElementById("donutSvg");
const legend = document.getElementById("legend");
const centerVal = document.getElementById("donutCenterVal");
const tooltip = document.getElementById("chartTooltip");
const headerIcon = document.getElementById("headerIcon");

const SIZE = 240,
  CX = SIZE / 2,
  CY = SIZE / 2,
  R = 100,
  INNER_R = 62;
const GAP = 0.02; // small gap between slices in radians

/* Header icon — inline SVG package/box icon */
headerIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16.5 9.4l-9-5.19"/>
  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
  <line x1="12" y1="22.08" x2="12" y2="12"/>
</svg>`;

/* Center total */
centerVal.textContent = total.toLocaleString();

function polarToXY(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function arcPath(cx, cy, r, innerR, startAngle, endAngle) {
  const [sx, sy] = polarToXY(cx, cy, r, startAngle);
  const [ex, ey] = polarToXY(cx, cy, r, endAngle);
  const [ix, iy] = polarToXY(cx, cy, innerR, endAngle);
  const [ox, oy] = polarToXY(cx, cy, innerR, startAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M${sx},${sy} A${r},${r} 0 ${large},1 ${ex},${ey} L${ix},${iy} A${innerR},${innerR} 0 ${large},0 ${ox},${oy} Z`;
}

function draw() {
  donutSvg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  donutSvg.setAttribute("width", SIZE);
  donutSvg.setAttribute("height", SIZE);
  donutSvg.innerHTML = "";

  let angle = -Math.PI / 2;

  DATA.forEach((d, i) => {
    const share = (d.value / total) * 2 * Math.PI;
    const startAngle = angle + GAP / 2;
    const endAngle = angle + share - GAP / 2;
    angle += share;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", arcPath(CX, CY, R, INNER_R, startAngle, endAngle));
    path.setAttribute("fill", d.color);
    path.setAttribute("class", "donut-slice");
    path.style.animation = `sliceReveal .5s ${i * 0.08}s ease both`;

    path.addEventListener("mouseenter", (e) => showTooltip(e, d));
    path.addEventListener("mousemove", (e) => posTooltip(e));
    path.addEventListener("mouseleave", () => {
      tooltip.hidden = true;
    });

    donutSvg.appendChild(path);
  });

  /* Build legend */
  legend.innerHTML = "";
  DATA.forEach((d) => {
    const pct = ((d.value / total) * 100).toFixed(1);
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <span class="legend-swatch" style="background:${d.color}"></span>
      <span class="legend-label">${d.label}</span>
      <span class="legend-pct">${pct}%</span>`;
    legend.appendChild(item);
  });
}

function showTooltip(e, d) {
  const pct = ((d.value / total) * 100).toFixed(1);
  tooltip.innerHTML = `<strong>${d.label}</strong><br/>${d.value.toLocaleString()} items &middot; ${pct}%`;
  tooltip.hidden = false;
  posTooltip(e);
}

function posTooltip(e) {
  tooltip.style.left = e.clientX + 14 + "px";
  tooltip.style.top = e.clientY - 42 + "px";
}

/* Inject animation keyframes */
const style = document.createElement("style");
style.textContent = `
@keyframes sliceReveal {
  from { opacity: 0; transform: scale(.85); }
  to   { opacity: 1; transform: none; }
}`;
document.head.appendChild(style);

draw();
