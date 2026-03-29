const AXES = ["Design", "Frontend", "Backend", "DevOps", "Testing", "Communication"];
const SERIES = [
  { label: "Alice", color: "#818cf8", data: [85, 90, 65, 70, 80, 92] },
  { label: "Bob", color: "#34d399", data: [70, 75, 88, 82, 60, 75] },
];
const SIZE = 360,
  CX = SIZE / 2,
  CY = SIZE / 2 + 10,
  R = 130,
  RINGS = 5;
const svg = document.getElementById("radarSvg");
const legend = document.getElementById("legend");
const tooltip = document.getElementById("chartTooltip");
const wrap = document.getElementById("chartWrap");

SERIES.forEach((s) => {
  const item = document.createElement("div");
  item.className = "legend-item";
  item.innerHTML = `<span class="legend-swatch" style="background:${s.color}"></span><span>${s.label}</span>`;
  legend.appendChild(item);
});

function polarXY(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function draw() {
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute("width", Math.min(wrap.clientWidth - 32, SIZE));
  svg.setAttribute("height", Math.min(wrap.clientWidth - 32, SIZE));
  svg.innerHTML = "";

  const n = AXES.length;
  const step = 360 / n;

  // Rings
  for (let r = 1; r <= RINGS; r++) {
    const pts = AXES.map((_, i) => polarXY(CX, CY, (R / RINGS) * r, i * step).join(",")).join(" ");
    svg.appendChild(elSvg("polygon", { points: pts, class: "radar-ring" }));
    // tick label
    const [lx, ly] = polarXY(CX, CY, (R / RINGS) * r, 0);
    const lbl = elSvg("text", { x: lx + 3, y: ly, class: "radar-label", "font-size": "9" });
    lbl.textContent = Math.round((100 / RINGS) * r);
    svg.appendChild(lbl);
  }

  // Axes + labels
  AXES.forEach((axis, i) => {
    const [ex, ey] = polarXY(CX, CY, R, i * step);
    svg.appendChild(elSvg("line", { class: "radar-axis", x1: CX, y1: CY, x2: ex, y2: ey }));
    const [lx, ly] = polarXY(CX, CY, R + 22, i * step);
    const anchor = lx < CX - 5 ? "end" : lx > CX + 5 ? "start" : "middle";
    const lbl = elSvg("text", { x: lx, y: ly + 4, class: "radar-label", "text-anchor": anchor });
    lbl.textContent = axis;
    svg.appendChild(lbl);
  });

  // Series
  SERIES.forEach((s, si) => {
    const pts = s.data.map((v, i) => polarXY(CX, CY, (v / 100) * R, i * step).join(",")).join(" ");
    const poly = elSvg("polygon", {
      points: pts,
      class: "radar-polygon",
      fill: s.color,
      stroke: s.color,
      style: `animation:fadeIn .5s ${si * 0.15}s ease both`,
    });
    svg.appendChild(poly);
    s.data.forEach((v, i) => {
      const [dx, dy] = polarXY(CX, CY, (v / 100) * R, i * step);
      const dot = elSvg("circle", {
        class: "radar-dot",
        cx: dx,
        cy: dy,
        fill: s.color,
        stroke: "var(--surface)",
        "stroke-width": 2,
        "data-si": si,
        "data-i": i,
      });
      dot.addEventListener("mouseenter", (e) => {
        tooltip.innerHTML = `<strong>${AXES[i]}</strong><br/>${s.label}: <strong>${v}</strong>`;
        tooltip.hidden = false;
        tooltip.style.left = e.clientX + 12 + "px";
        tooltip.style.top = e.clientY - 40 + "px";
      });
      dot.addEventListener("mouseleave", () => {
        tooltip.hidden = true;
      });
      svg.appendChild(dot);
    });
  });
}

function elSvg(tag, attrs = {}) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

const style = document.createElement("style");
style.textContent = `@keyframes fadeIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:none}}`;
document.head.appendChild(style);

const ro = new ResizeObserver(draw);
ro.observe(wrap);
draw();
