/**
 * SVG marker clustering.
 *
 * Markers live in map coordinates (0..600 x 0..360). On every view change we
 * project them to screen space (scale + translate), bucket them into a grid
 * whose cell size is a fixed pixel radius, then merge each bucket into one
 * cluster node placed at the centroid of its members. Because the grid is
 * defined in SCREEN pixels, zooming in shrinks the map-space footprint of a
 * cell, so clusters progressively split into their individual markers.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 600;
const HEIGHT = 360;
const CELL_PX = 46; // clustering radius in screen pixels
const MIN_SCALE = 1;
const MAX_SCALE = 10;

const svg = document.getElementById("map");
const scene = document.getElementById("scene");
const landLayer = document.getElementById("land");
const markerLayer = document.getElementById("markers");
const zoomInput = document.getElementById("zoom");
const zoomOut = document.getElementById("zoomOut");
const resetBtn = document.getElementById("reset");
const status = document.getElementById("status");

const view = { scale: 1, x: 0, y: 0 };

/* ---------- abstract "land" shapes (no external assets) ---------- */
const LANDMASSES = [
  [[60, 90], [170, 55], [250, 95], [235, 175], [140, 210], [55, 165]],
  [[280, 40], [400, 30], [455, 90], [395, 135], [300, 120]],
  [[330, 165], [470, 150], [545, 205], [500, 300], [370, 305], [315, 235]],
  [[80, 250], [200, 245], [230, 315], [110, 330]],
];

for (const points of LANDMASSES) {
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", `M${points.map((p) => p.join(" ")).join("L")}Z`);
  landLayer.append(path);
}

/* ---------- deterministic marker set clustered around the landmasses ---------- */
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildMarkers(count) {
  const rng = makeRng(20260718);
  const hubs = LANDMASSES.map((poly) => {
    const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length;
    const cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
    return [cx, cy];
  });
  const out = [];
  for (let i = 0; i < count; i++) {
    const [hx, hy] = hubs[Math.floor(rng() * hubs.length)];
    const angle = rng() * Math.PI * 2;
    // sqrt gives an even areal spread instead of a dense bullseye
    const radius = Math.sqrt(rng()) * 62;
    const x = Math.min(WIDTH - 8, Math.max(8, hx + Math.cos(angle) * radius));
    const y = Math.min(HEIGHT - 8, Math.max(8, hy + Math.sin(angle) * radius));
    out.push({ id: i, x, y, label: `Site ${String(i + 1).padStart(3, "0")}` });
  }
  return out;
}

const MARKERS = buildMarkers(200);

/* ---------- clustering ---------- */
function cluster(markers, scale) {
  const cell = CELL_PX / scale; // cell size expressed in map units
  const buckets = new Map();

  for (const m of markers) {
    const key = `${Math.floor(m.x / cell)}:${Math.floor(m.y / cell)}`;
    let bucket = buckets.get(key);
    if (!bucket) buckets.set(key, (bucket = []));
    bucket.push(m);
  }

  const clusters = [];
  for (const members of buckets.values()) {
    if (members.length === 1) {
      const m = members[0];
      clusters.push({ x: m.x, y: m.y, count: 1, label: m.label });
    } else {
      let sx = 0;
      let sy = 0;
      for (const m of members) {
        sx += m.x;
        sy += m.y;
      }
      clusters.push({
        x: sx / members.length,
        y: sy / members.length,
        count: members.length,
        label: `${members.length} sites`,
      });
    }
  }
  return clusters;
}

/* ---------- rendering ---------- */
function radiusFor(count) {
  if (count === 1) return 4.5;
  return 8 + Math.min(12, Math.log2(count) * 3.4);
}

function render() {
  const { scale } = view;
  const clusters = cluster(MARKERS, scale);
  const inv = 1 / scale; // keep marker size constant on screen

  const frag = document.createDocumentFragment();
  let clustered = 0;

  for (const c of clusters) {
    if (c.count > 1) clustered++;
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", `marker ${c.count > 1 ? "marker--cluster" : "marker--single"}`);
    g.setAttribute("transform", `translate(${c.x.toFixed(2)} ${c.y.toFixed(2)}) scale(${inv})`);
    g.setAttribute("tabindex", "-1");

    const title = document.createElementNS(SVG_NS, "title");
    title.textContent = c.label;
    g.append(title);

    const r = radiusFor(c.count);

    if (c.count > 1) {
      const halo = document.createElementNS(SVG_NS, "circle");
      halo.setAttribute("class", "halo");
      halo.setAttribute("r", (r + 7).toFixed(1));
      g.append(halo);
    }

    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("class", "dot");
    dot.setAttribute("r", r.toFixed(1));
    g.append(dot);

    if (c.count > 1) {
      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("font-size", Math.max(9, Math.min(13, r * 0.95)).toFixed(1));
      text.textContent = c.count;
      g.append(text);
    }

    // Clicking a cluster zooms toward it until it breaks apart.
    g.addEventListener("click", () => {
      if (c.count > 1) zoomAt(c.x, c.y, Math.min(MAX_SCALE, scale * 1.9));
      else announce(`${c.label} selected.`);
    });

    frag.append(g);
  }

  markerLayer.replaceChildren(frag);
  scene.setAttribute("transform", `translate(${view.x} ${view.y}) scale(${scale})`);
  zoomOut.textContent = `${scale.toFixed(1)}×`;
  if (zoomInput.value !== String(scale)) zoomInput.value = scale.toFixed(1);

  announce(
    `${MARKERS.length} markers · ${clusters.length} nodes on screen · ` +
      `${clustered} cluster${clustered === 1 ? "" : "s"} at ${scale.toFixed(1)}× zoom.`
  );
}

let announceTimer;
function announce(msg) {
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    status.textContent = msg;
  }, 60);
}

/* ---------- view maths ---------- */
function clampPan() {
  const min = (s) => Math.min(0, WIDTH - WIDTH * s);
  view.x = Math.max(min(view.scale), Math.min(0, view.x));
  view.y = Math.max(Math.min(0, HEIGHT - HEIGHT * view.scale), Math.min(0, view.y));
}

/** Zoom so that the map point (mx, my) stays put on screen. */
function zoomAt(mx, my, nextScale) {
  const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
  const screenX = view.x + mx * view.scale;
  const screenY = view.y + my * view.scale;
  view.scale = s;
  view.x = screenX - mx * s;
  view.y = screenY - my * s;
  clampPan();
  render();
}

/** Convert a pointer event to map coordinates (pre-transform). */
function toMap(evt) {
  const rect = svg.getBoundingClientRect();
  const px = ((evt.clientX - rect.left) / rect.width) * WIDTH;
  const py = ((evt.clientY - rect.top) / rect.height) * HEIGHT;
  return { x: (px - view.x) / view.scale, y: (py - view.y) / view.scale };
}

/* ---------- interaction: drag to pan ---------- */
let drag = null;

svg.addEventListener("pointerdown", (e) => {
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: view.x, oy: view.y };
  svg.setPointerCapture(e.pointerId);
  svg.classList.add("is-panning");
});

svg.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const rect = svg.getBoundingClientRect();
  view.x = drag.ox + (e.clientX - drag.x) * (WIDTH / rect.width);
  view.y = drag.oy + (e.clientY - drag.y) * (HEIGHT / rect.height);
  clampPan();
  render();
});

function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return;
  drag = null;
  svg.classList.remove("is-panning");
}
svg.addEventListener("pointerup", endDrag);
svg.addEventListener("pointercancel", endDrag);

/* wheel zoom, anchored at the cursor */
svg.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const p = toMap(e);
    zoomAt(p.x, p.y, view.scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
  },
  { passive: false }
);

/* keyboard fallback */
svg.addEventListener("keydown", (e) => {
  const step = 28;
  const keys = {
    ArrowLeft: [step, 0],
    ArrowRight: [-step, 0],
    ArrowUp: [0, step],
    ArrowDown: [0, -step],
  };
  if (keys[e.key]) {
    e.preventDefault();
    view.x += keys[e.key][0];
    view.y += keys[e.key][1];
    clampPan();
    render();
  } else if (e.key === "+" || e.key === "=") {
    e.preventDefault();
    zoomAt(WIDTH / 2, HEIGHT / 2, view.scale * 1.25);
  } else if (e.key === "-" || e.key === "_") {
    e.preventDefault();
    zoomAt(WIDTH / 2, HEIGHT / 2, view.scale / 1.25);
  }
});

zoomInput.addEventListener("input", () => {
  const centerX = (WIDTH / 2 - view.x) / view.scale;
  const centerY = (HEIGHT / 2 - view.y) / view.scale;
  zoomAt(centerX, centerY, parseFloat(zoomInput.value));
});

resetBtn.addEventListener("click", () => {
  view.scale = 1;
  view.x = 0;
  view.y = 0;
  render();
  svg.focus();
});

render();
