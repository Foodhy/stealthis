const W = 120,
  H = 36;

document.querySelectorAll(".sl-row[data-values]").forEach((row) => {
  const values = row.dataset.values.split(",").map(Number);
  const color = row.dataset.color;

  // Build SVG sparkline
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  const min = Math.min(...values),
    max = Math.max(...values);
  const xOf = (i) => (i / (values.length - 1)) * W;
  const yOf = (v) => H - 2 - ((v - min) / (max - min || 1)) * (H - 6);

  // Gradient area
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `<linearGradient id="sg_${color.replace("#", "")}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </linearGradient>`;
  svg.appendChild(defs);

  const pts = values.map((v, i) => [xOf(i), yOf(v)]);
  const areaD = `M${pts[0][0]},${H} ${pts.map((p) => p.join(",")).join(" ")} L${pts[pts.length - 1][0]},${H} Z`;
  const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
  area.setAttribute("d", areaD);
  area.setAttribute("fill", `url(#sg_${color.replace("#", "")})`);
  svg.appendChild(area);

  const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  line.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", "2");
  line.setAttribute("stroke-linecap", "round");
  svg.appendChild(line);

  // Last dot
  const last = pts[pts.length - 1];
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", last[0]);
  dot.setAttribute("cy", last[1]);
  dot.setAttribute("r", "3");
  dot.setAttribute("fill", color);
  dot.setAttribute("stroke", "#0f1117");
  dot.setAttribute("stroke-width", "1.5");
  svg.appendChild(dot);

  row.querySelector(".sl-cell").appendChild(svg);

  // Current value
  const cur = values[values.length - 1];
  row.querySelector(".sl-current").textContent = cur % 1 === 0 ? cur : cur.toFixed(1);

  // Trend
  const prev = values[values.length - 2];
  const delta = (((cur - prev) / prev) * 100).toFixed(1);
  const tEl = row.querySelector(".sl-trend");
  tEl.textContent = (delta > 0 ? "▲" : delta < 0 ? "▼" : "—") + Math.abs(delta) + "%";
  tEl.classList.add(delta > 0 ? "up" : "down");
});
