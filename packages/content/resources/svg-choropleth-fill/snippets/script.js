/* SVG Choropleth Fill — data-driven fills, keyboard-operable regions, live legend. */
(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Ordinal scale: index 0 = "no data", 1..5 = binned values.
  const SCALE = [
    { label: "No data", color: "#16202c", range: "—" },
    { label: "Very low", color: "#1d3f5c", range: "0–19" },
    { label: "Low", color: "#20618a", range: "20–39" },
    { label: "Moderate", color: "#2f8fa0", range: "40–59" },
    { label: "High", color: "#43ad82", range: "60–79" },
    { label: "Very high", color: "#9fd356", range: "80–100" },
  ];

  // Abstract regions (no geographic claims). points = polygon in viewBox units.
  const REGIONS = [
    { id: "nw", name: "Northwest", points: "16,20 108,20 96,86 16,78", bin: 2 },
    { id: "nc", name: "North Central", points: "112,20 210,20 204,90 100,88", bin: 4 },
    { id: "ne", name: "Northeast", points: "214,20 304,26 300,96 208,92", bin: 1 },
    { id: "cw", name: "Central West", points: "16,82 94,90 88,152 18,146", bin: 3 },
    { id: "cc", name: "Midlands", points: "98,92 202,94 198,158 90,154", bin: 5 },
    { id: "ce", name: "Central East", points: "206,98 300,100 296,162 200,160", bin: 0 },
    { id: "sw", name: "Southwest", points: "20,150 86,156 78,220 24,214", bin: 1 },
    { id: "sc", name: "South Central", points: "92,158 196,162 190,222 82,218", bin: 3 },
    { id: "se", name: "Southeast", points: "202,164 296,166 292,224 194,222", bin: 4 },
  ];

  const gRegions = document.getElementById("regions");
  const legendEl = document.getElementById("legend");
  const selName = document.getElementById("selName");
  const selValue = document.getElementById("selValue");
  const resetBtn = document.getElementById("reset");
  if (!gRegions || !legendEl) return;

  const state = new Map(REGIONS.map((r) => [r.id, r.bin]));
  const nodes = new Map();
  let selected = null;

  const centroid = (points) => {
    const pts = points.trim().split(/\s+/).map((p) => p.split(",").map(Number));
    const sx = pts.reduce((a, p) => a + p[0], 0);
    const sy = pts.reduce((a, p) => a + p[1], 0);
    return [sx / pts.length, sy / pts.length];
  };

  const describe = (r) => {
    const s = SCALE[state.get(r.id)];
    return `${r.name}: ${s.label}${s.range === "—" ? "" : ` (${s.range})`}`;
  };

  function paint(id) {
    const r = REGIONS.find((x) => x.id === id);
    const node = nodes.get(id);
    const bin = state.get(id);
    node.setAttribute("fill", SCALE[bin].color);
    node.setAttribute("aria-label", describe(r));
    node.setAttribute("aria-valuenow", String(bin));
    node.setAttribute("data-bin", String(bin));
  }

  function select(id) {
    selected = id;
    for (const [rid, node] of nodes) node.dataset.selected = String(rid === id);
    const r = REGIONS.find((x) => x.id === id);
    const s = SCALE[state.get(id)];
    selName.textContent = r.name;
    selValue.textContent = `${s.label}${s.range === "—" ? "" : ` · ${s.range}`}`;
    renderLegend();
  }

  function step(id, delta) {
    const next = (state.get(id) + delta + SCALE.length) % SCALE.length;
    state.set(id, next);
    paint(id);
    select(id);
  }

  function renderLegend() {
    const counts = SCALE.map(() => 0);
    for (const bin of state.values()) counts[bin] += 1;
    const activeBin = selected ? state.get(selected) : -1;

    legendEl.textContent = "";
    SCALE.forEach((s, i) => {
      const row = document.createElement("div");
      row.className = "legend-item";
      row.setAttribute("role", "listitem");
      row.dataset.active = String(i === activeBin);

      const sw = document.createElement("span");
      sw.className = "swatch";
      sw.style.background = s.color;

      const label = document.createElement("span");
      label.textContent = s.range === "—" ? s.label : `${s.label} · ${s.range}`;

      const count = document.createElement("span");
      count.className = "legend-count";
      count.textContent = `${counts[i]}`;

      row.append(sw, label, count);
      legendEl.append(row);
    });
  }

  REGIONS.forEach((r, i) => {
    const poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", r.points);
    poly.setAttribute("class", "region");
    poly.setAttribute("tabindex", "0");
    poly.setAttribute("role", "slider");
    poly.setAttribute("aria-valuemin", "0");
    poly.setAttribute("aria-valuemax", String(SCALE.length - 1));
    poly.dataset.id = r.id;

    poly.addEventListener("click", () => step(r.id, 1));
    poly.addEventListener("focus", () => select(r.id));
    poly.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp" || e.key === "ArrowRight") {
        e.preventDefault();
        step(r.id, 1);
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        step(r.id, -1);
      } else if (e.key === "Home") {
        e.preventDefault();
        state.set(r.id, 0);
        paint(r.id);
        select(r.id);
      }
    });

    gRegions.append(poly);
    nodes.set(r.id, poly);

    const [cx, cy] = centroid(r.points);
    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("class", "region-label");
    text.setAttribute("x", String(cx));
    text.setAttribute("y", String(cy + 3));
    text.textContent = r.name.length > 13 ? r.name.split(" ").pop() : r.name;
    gRegions.append(text);

    void i;
  });

  resetBtn?.addEventListener("click", () => {
    for (const r of REGIONS) {
      state.set(r.id, 0);
      paint(r.id);
    }
    selected = null;
    for (const node of nodes.values()) node.dataset.selected = "false";
    selName.textContent = "None";
    selValue.textContent = "All regions cleared";
    renderLegend();
  });

  REGIONS.forEach((r) => paint(r.id));
  renderLegend();
})();
