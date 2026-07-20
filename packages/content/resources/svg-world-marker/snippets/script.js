const SVG_NS = "http://www.w3.org/2000/svg";

const svg = document.getElementById("marker-map");
const layer = document.getElementById("markers");
const list = document.getElementById("list");
const hint = document.getElementById("hint");
const labelInput = document.getElementById("label-input");
const clearBtn = document.getElementById("clear");

/** @type {{id:number,x:number,y:number,label:string}[]} */
let markers = [];
let selectedId = null;
let seq = 0;

/* ---------- geometry ---------- */

/** Convert a pointer event to viewBox (user-space) coordinates. */
function toUserSpace(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

/** Fake equirectangular projection over the 1000x500 viewBox. */
function toLatLon(x, y) {
  return {
    lon: (x / 1000) * 360 - 180,
    lat: 90 - (y / 500) * 180,
  };
}

function formatCoords(x, y) {
  const { lat, lon } = toLatLon(x, y);
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(1)}°${ns} ${Math.abs(lon).toFixed(1)}°${ew}`;
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/* ---------- state ---------- */

function addMarker(x, y, label) {
  const marker = {
    id: ++seq,
    x: clamp(x, 8, 992),
    y: clamp(y, 8, 492),
    label: label || `Marker ${seq}`,
  };
  markers.push(marker);
  selectedId = marker.id;
  render();
  layer.querySelector(`[data-id="${marker.id}"]`)?.focus();
}

function removeMarker(id) {
  const index = markers.findIndex((m) => m.id === id);
  if (index === -1) return;
  markers.splice(index, 1);
  if (selectedId === id) selectedId = markers[index]?.id ?? markers.at(-1)?.id ?? null;
  render();
  const next = selectedId && layer.querySelector(`[data-id="${selectedId}"]`);
  (next || svg).focus();
}

function moveMarker(id, dx, dy) {
  const marker = markers.find((m) => m.id === id);
  if (!marker) return;
  marker.x = clamp(marker.x + dx, 8, 992);
  marker.y = clamp(marker.y + dy, 8, 492);
  render();
  layer.querySelector(`[data-id="${id}"]`)?.focus();
}

/* ---------- rendering ---------- */

function makeMarkerNode(marker) {
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", `marker${marker.id === selectedId ? " is-selected" : ""}`);
  g.setAttribute("tabindex", "0");
  g.setAttribute("role", "button");
  g.dataset.id = String(marker.id);
  g.setAttribute(
    "aria-label",
    `${marker.label} at ${formatCoords(marker.x, marker.y)}. Arrow keys to move, Delete to remove.`,
  );

  const halo = document.createElementNS(SVG_NS, "circle");
  halo.setAttribute("class", "halo");
  halo.setAttribute("cx", marker.x);
  halo.setAttribute("cy", marker.y);
  halo.setAttribute("r", marker.id === selectedId ? 20 : 15);

  // Teardrop pin whose tip sits exactly on (x, y).
  const pin = document.createElementNS(SVG_NS, "path");
  pin.setAttribute("class", "pin");
  pin.setAttribute(
    "d",
    `M${marker.x} ${marker.y} l-8 -13 a9 9 0 1 1 16 0 Z`,
  );

  const tag = document.createElementNS(SVG_NS, "text");
  tag.setAttribute("class", "tag");
  tag.setAttribute("x", marker.x + 14);
  tag.setAttribute("y", marker.y - 14);
  tag.textContent = marker.label;

  g.append(halo, pin, tag);
  return g;
}

function makeListItem(marker) {
  const li = document.createElement("li");
  if (marker.id === selectedId) li.className = "is-selected";

  const dot = document.createElement("span");
  dot.className = "dot";

  const name = document.createElement("span");
  name.textContent = marker.label;

  const coords = document.createElement("span");
  coords.className = "coords";
  coords.textContent = formatCoords(marker.x, marker.y);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove";
  remove.textContent = "✕";
  remove.setAttribute("aria-label", `Remove ${marker.label}`);
  remove.addEventListener("click", () => removeMarker(marker.id));

  li.append(dot, name, coords, remove);
  li.addEventListener("click", (event) => {
    if (event.target === remove) return;
    selectedId = marker.id;
    render();
    layer.querySelector(`[data-id="${marker.id}"]`)?.focus();
  });
  return li;
}

function render() {
  layer.replaceChildren(...markers.map(makeMarkerNode));
  list.replaceChildren(...markers.map(makeListItem));

  const selected = markers.find((m) => m.id === selectedId);
  hint.textContent = !markers.length
    ? "No markers yet"
    : selected
      ? `${markers.length} marker${markers.length > 1 ? "s" : ""} · selected ${selected.label} (${formatCoords(selected.x, selected.y)})`
      : `${markers.length} marker${markers.length > 1 ? "s" : ""}`;
}

/* ---------- interaction ---------- */

svg.addEventListener("pointerdown", (event) => {
  const existing = event.target.closest(".marker");
  if (existing) {
    selectedId = Number(existing.dataset.id);
    render();
    layer.querySelector(`[data-id="${selectedId}"]`)?.focus();
    return;
  }
  const { x, y } = toUserSpace(event);
  addMarker(x, y, labelInput.value.trim());
});

svg.addEventListener("keydown", (event) => {
  const node = event.target.closest?.(".marker");

  if (node) {
    const id = Number(node.dataset.id);
    const step = event.shiftKey ? 20 : 5;
    const deltas = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
    };
    if (deltas[event.key]) {
      event.preventDefault();
      selectedId = id;
      moveMarker(id, ...deltas[event.key]);
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removeMarker(id);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectedId = id;
      render();
      layer.querySelector(`[data-id="${id}"]`)?.focus();
    }
    return;
  }

  // Focus is on the map itself: drop a marker at the centre (keyboard fallback).
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const offset = markers.length * 24;
    addMarker(500 + (offset % 200) - 100, 250 + (offset % 120) - 60, labelInput.value.trim());
  }
});

clearBtn.addEventListener("click", () => {
  markers = [];
  selectedId = null;
  render();
  svg.focus();
});

// Seed a couple of markers so the demo is not empty on load.
addMarker(230, 160, "Harbor");
addMarker(700, 170, "Depot");
selectedId = null;
render();
