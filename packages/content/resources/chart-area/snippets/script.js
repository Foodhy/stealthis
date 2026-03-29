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
const svg = document.getElementById("chartSvg");
const tooltip = document.getElementById("chartTooltip");
const wrap = document.getElementById("chartWrap");
const legend = document.getElementById("legend");

SERIES.forEach((s) => {
  const item = document.createElement("div");
  item.className = "legend-item";
  item.innerHTML = `<span class="legend-swatch" style="background:${s.color}"></span><span>${s.label}</span>`;
  legend.appendChild(item);
});

function el(tag, attrs = {}) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

function draw() {
  const W = wrap.clientWidth - 32;
  const H = Math.round(W * 0.45);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = "";

  const n = DAYS.length;
  const allVals = SERIES.flatMap((s) => s.data);
  const maxVal = Math.ceil(Math.max(...allVals) * 1.15);
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const xOf = (i) => PAD.left + (i / (n - 1)) * cW;
  const yOf = (v) => PAD.top + cH - (v / maxVal) * cH;

  // Defs (gradients)
  const defs = el("defs");
  SERIES.forEach((s, si) => {
    const grad = el("linearGradient", { id: `grad${si}`, x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.innerHTML = `<stop offset="0%" stop-color="${s.color}" stop-opacity="0.6"/>
                      <stop offset="100%" stop-color="${s.color}" stop-opacity="0"/>`;
    defs.appendChild(grad);
  });
  svg.appendChild(defs);

  // Grid
  for (let t = 0; t <= 5; t++) {
    const v = Math.round((maxVal / 5) * t);
    const y = yOf(v);
    svg.appendChild(
      el("line", { class: "grid-line", x1: PAD.left, x2: PAD.left + cW, y1: y, y2: y })
    );
    const lbl = el("text", {
      class: "grid-label",
      x: PAD.left - 6,
      y: y + 3.5,
      "text-anchor": "end",
    });
    lbl.textContent = v >= 1000 ? (v / 1000).toFixed(1) + "k" : v;
    svg.appendChild(lbl);
  }
  DAYS.forEach((d, i) => {
    if (i % 2 !== 0) return;
    const t = el("text", { class: "x-label", x: xOf(i), y: H - 6 });
    t.textContent = d;
    svg.appendChild(t);
  });

  // Crosshair
  const ch = el("line", {
    class: "crosshair",
    id: "crosshair",
    x1: 0,
    x2: 0,
    y1: PAD.top,
    y2: PAD.top + cH,
  });
  svg.appendChild(ch);

  // Area + line
  SERIES.forEach((s, si) => {
    const pts = s.data.map((v, i) => [xOf(i), yOf(v)]);
    const linePts = pts.map((p) => p.join(",")).join(" ");
    const areaD = `M${xOf(0)},${PAD.top + cH} L${pts.map((p) => p.join(",")).join(" L")} L${xOf(n - 1)},${PAD.top + cH} Z`;
    svg.appendChild(el("path", { class: "area-path", d: areaD, fill: `url(#grad${si})` }));
    const line = el("polyline", {
      class: `line-path line-path-animated`,
      points: linePts,
      stroke: s.color,
      style: `animation-delay:${si * 0.15}s`,
    });
    svg.appendChild(line);
    pts.forEach(([px, py], i) => {
      const dot = el("circle", {
        cx: px,
        cy: py,
        r: 4,
        fill: s.color,
        stroke: "var(--surface)",
        "stroke-width": 2,
        style: "opacity:0;transition:opacity .15s;cursor:pointer",
        "data-si": si,
        "data-i": i,
      });
      svg.appendChild(dot);
    });
  });

  svg.addEventListener("mousemove", (e) => {
    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const idx = Math.round(((mx - PAD.left) / cW) * (n - 1));
    if (idx < 0 || idx >= n) {
      tooltip.hidden = true;
      return;
    }
    const x = xOf(idx);
    const ch = svg.querySelector("#crosshair");
    if (ch) {
      ch.setAttribute("x1", x);
      ch.setAttribute("x2", x);
      ch.classList.add("visible");
    }
    let html = `<div class="tooltip-date">${DAYS[idx]}</div>`;
    SERIES.forEach((s) => {
      html += `<div class="tooltip-row"><span class="tooltip-dot" style="background:${s.color}"></span><span>${s.label}</span><span class="tooltip-val">${s.data[idx].toLocaleString()}</span></div>`;
    });
    tooltip.innerHTML = html;
    tooltip.hidden = false;
    tooltip.style.left = Math.min(x + 12, W - 160) + "px";
    tooltip.style.top = PAD.top + "px";
  });
  svg.addEventListener("mouseleave", () => {
    tooltip.hidden = true;
    svg.querySelector("#crosshair")?.classList.remove("visible");
  });
}

const ro = new ResizeObserver(draw);
ro.observe(wrap);
draw();
