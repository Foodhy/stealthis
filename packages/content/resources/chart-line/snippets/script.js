const SERIES = [
  {
    label: "Revenue",
    color: "#818cf8",
    data: [42, 58, 51, 67, 73, 89, 95, 88, 102, 115, 108, 127],
  },
  {
    label: "Expenses",
    color: "#f87171",
    data: [30, 34, 29, 35, 40, 44, 48, 42, 50, 55, 52, 58],
  },
  {
    label: "Profit",
    color: "#34d399",
    data: [12, 24, 22, 32, 33, 45, 47, 46, 52, 60, 56, 69],
  },
];
const LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PAD = { top: 20, right: 20, bottom: 36, left: 48 };
let smoothMode = false;
let hidden = new Set();

const svg = document.getElementById("chartSvg");
const tooltip = document.getElementById("chartTooltip");
const wrap = document.getElementById("chartWrap");
const legend = document.getElementById("legend");

// Build legend
SERIES.forEach((s, i) => {
  const item = document.createElement("div");
  item.className = "legend-item";
  item.dataset.idx = i;
  item.innerHTML = `<span class="legend-swatch" style="background:${s.color}"></span><span>${s.label}</span>`;
  item.addEventListener("click", () => {
    hidden.has(i) ? hidden.delete(i) : hidden.add(i);
    item.classList.toggle("muted", hidden.has(i));
    draw();
  });
  legend.appendChild(item);
});

document.querySelectorAll(".ctrl-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ctrl-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    smoothMode = btn.dataset.mode === "smooth";
    draw();
  });
});

function draw() {
  const W = wrap.clientWidth - 32;
  const H = Math.round(W * 0.45);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = "";

  const visibleSeries = SERIES.filter((_, i) => !hidden.has(i));
  const allVals = visibleSeries.flatMap((s) => s.data);
  if (!allVals.length) return;

  const maxVal = Math.ceil(Math.max(...allVals) * 1.15);
  const minVal = 0;
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const n = LABELS.length;

  const xOf = (i) => PAD.left + (i / (n - 1)) * cW;
  const yOf = (v) => PAD.top + cH - ((v - minVal) / (maxVal - minVal)) * cH;

  // Grid
  const ticks = 5;
  for (let t = 0; t <= ticks; t++) {
    const v = minVal + (maxVal - minVal) * (t / ticks);
    const y = yOf(v);
    const line = el("line", { class: "grid-line", x1: PAD.left, x2: PAD.left + cW, y1: y, y2: y });
    svg.appendChild(line);
    const lbl = el("text", {
      class: "grid-label",
      x: PAD.left - 6,
      y: y + 3.5,
      "text-anchor": "end",
    });
    lbl.textContent = Math.round(v) + "k";
    svg.appendChild(lbl);
  }

  // X labels
  LABELS.forEach((lbl, i) => {
    const t = el("text", { class: "x-label", x: xOf(i), y: H - 6 });
    t.textContent = lbl;
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

  // Series
  SERIES.forEach((s, si) => {
    if (hidden.has(si)) return;
    const points = s.data.map((v, i) => [xOf(i), yOf(v)]);
    const path = el("path", {
      class: "series-line series-line-animated",
      stroke: s.color,
      d: smoothMode ? bezierPath(points) : linePath(points),
      style: `animation-delay:${si * 0.12}s`,
    });
    svg.appendChild(path);
    points.forEach(([px, py], i) => {
      const dot = el("circle", {
        class: "series-dot",
        cx: px,
        cy: py,
        fill: s.color,
        "data-si": si,
        "data-i": i,
      });
      svg.appendChild(dot);
    });
  });

  // Hover interaction
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

    let html = `<div class="tooltip-date">${LABELS[idx]}</div>`;
    SERIES.forEach((s, si) => {
      if (hidden.has(si)) return;
      html += `<div class="tooltip-row">
        <span class="tooltip-dot" style="background:${s.color}"></span>
        <span>${s.label}</span>
        <span class="tooltip-val">$${s.data[idx]}k</span>
      </div>`;
    });
    tooltip.innerHTML = html;
    tooltip.hidden = false;

    const tx = Math.min(x + 12, W - 160);
    const ty = PAD.top;
    tooltip.style.left = tx + "px";
    tooltip.style.top = ty + "px";
  });

  svg.addEventListener("mouseleave", () => {
    tooltip.hidden = true;
    const ch = svg.querySelector("#crosshair");
    if (ch) ch.classList.remove("visible");
  });
}

function el(tag, attrs = {}) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

function linePath(pts) {
  return pts
    .map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
}

function bezierPath(pts) {
  if (pts.length < 2) return linePath(pts);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp1x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * 0.4;
    const cp1y = pts[i][1];
    const cp2x = pts[i + 1][0] - (pts[i + 1][0] - pts[i][0]) * 0.4;
    const cp2y = pts[i + 1][1];
    d += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`;
  }
  return d;
}

const ro = new ResizeObserver(draw);
ro.observe(wrap);
draw();
