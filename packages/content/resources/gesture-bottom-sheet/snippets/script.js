/**
 * Bottom-sheet drag with Pointer Events.
 * - The sheet is a full-height layer; `--y` (px from the top of the frame) drives translate3d.
 * - Snap points are fractions of the frame height, expressed as "openness" (0 = closed).
 * - Release picks a snap point from position, or from velocity when the gesture is a flick.
 */
const frame = document.getElementById("sheet").parentElement;
const sheet = document.getElementById("sheet");
const handle = document.getElementById("handle");
const scrim = document.getElementById("scrim");
const openBtn = document.getElementById("openBtn");
const readout = document.getElementById("readout");

const SNAPS = [0, 0.45, 0.92]; // openness values
const LABELS = ["closed", "half", "full"];
const FLICK = 0.5; // px per ms
const RUBBER = 0.35; // resistance past the top snap

let height = frame.clientHeight;
let openness = 0; // 0..1 — fraction of the frame the sheet covers
let dragging = false;
let pointerId = null;
let startY = 0;
let startOpenness = 0;
let lastY = 0;
let lastT = 0;
let velocity = 0; // px/ms, positive = moving down

const yFor = (o) => height * (1 - o);

function render() {
  sheet.style.setProperty("--y", `${yFor(openness)}px`);
  scrim.style.opacity = String(Math.min(openness / 0.92, 1) * 0.55);
  scrim.classList.toggle("interactive", openness > 0.02);
  sheet.setAttribute("aria-hidden", openness <= 0.02 ? "true" : "false");

  const pct = Math.round(openness * 100);
  const nearest = LABELS[nearestIndex(openness)];
  handle.setAttribute("aria-valuenow", String(pct));
  handle.setAttribute("aria-valuetext", `${nearest}, ${pct} percent`);
  readout.textContent = `${nearest} · ${pct}%`;
}

function nearestIndex(o) {
  let best = 0;
  for (let i = 1; i < SNAPS.length; i++) {
    if (Math.abs(SNAPS[i] - o) < Math.abs(SNAPS[best] - o)) best = i;
  }
  return best;
}

function animateTo(target) {
  openness = target;
  sheet.classList.add("animating");
  render();
}

sheet.addEventListener("transitionend", (e) => {
  if (e.propertyName === "transform") sheet.classList.remove("animating");
});

/* ---- drag ---- */
handle.addEventListener("pointerdown", (e) => {
  if (pointerId !== null) return;
  pointerId = e.pointerId;
  dragging = true;
  height = frame.clientHeight;
  startY = lastY = e.clientY;
  lastT = e.timeStamp;
  velocity = 0;
  startOpenness = openness;
  handle.setPointerCapture(pointerId);
  sheet.classList.remove("animating");
  sheet.classList.add("dragging");
  e.preventDefault();
});

handle.addEventListener("pointermove", (e) => {
  if (!dragging || e.pointerId !== pointerId) return;
  const dt = e.timeStamp - lastT;
  if (dt > 0) velocity = (e.clientY - lastY) / dt;
  lastY = e.clientY;
  lastT = e.timeStamp;

  let next = startOpenness + (startY - e.clientY) / height;
  const max = SNAPS[SNAPS.length - 1];
  if (next > max) next = max + (next - max) * RUBBER; // rubber-band over the top
  openness = Math.max(0, Math.min(1, next));
  render();
});

function endDrag(e) {
  if (!dragging || e.pointerId !== pointerId) return;
  dragging = false;
  sheet.classList.remove("dragging");
  if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
  pointerId = null;

  let index = nearestIndex(openness);
  if (Math.abs(velocity) > FLICK) {
    // Momentum: step one snap point in the direction of travel.
    const dir = velocity > 0 ? -1 : 1; // moving down = closing
    const from = nearestIndex(startOpenness);
    index = Math.max(0, Math.min(SNAPS.length - 1, from + dir));
  }
  animateTo(SNAPS[index]);
}

handle.addEventListener("pointerup", endDrag);
handle.addEventListener("pointercancel", endDrag);

/* ---- keyboard + buttons ---- */
handle.addEventListener("keydown", (e) => {
  const i = nearestIndex(openness);
  let target = null;
  if (e.key === "ArrowUp" || e.key === "PageUp") target = SNAPS[Math.min(SNAPS.length - 1, i + 1)];
  else if (e.key === "ArrowDown" || e.key === "PageDown") target = SNAPS[Math.max(0, i - 1)];
  else if (e.key === "Home") target = SNAPS[0];
  else if (e.key === "End") target = SNAPS[SNAPS.length - 1];
  else if (e.key === "Escape") target = 0;
  if (target === null) return;
  e.preventDefault();
  animateTo(target);
});

openBtn.addEventListener("click", () => {
  height = frame.clientHeight;
  animateTo(SNAPS[1]);
  handle.focus();
});

scrim.addEventListener("click", () => animateTo(0));

window.addEventListener("resize", () => {
  height = frame.clientHeight;
  render();
});

render();
