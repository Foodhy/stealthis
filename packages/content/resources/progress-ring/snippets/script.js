const SIZE = 120,
  STROKE = 10,
  R = SIZE / 2 - STROKE;
const C = 2 * Math.PI * R;

function buildRing(wrap) {
  const val = +wrap.dataset.value;
  const color = wrap.dataset.color;
  const label = wrap.dataset.label;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", SIZE);
  svg.setAttribute("height", SIZE);
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  svg.classList.add("ring-svg");

  const cx = SIZE / 2,
    cy = SIZE / 2;

  // Track
  const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  track.setAttribute("cx", cx);
  track.setAttribute("cy", cy);
  track.setAttribute("r", R);
  track.setAttribute("stroke-width", STROKE);
  track.classList.add("ring-track");
  svg.appendChild(track);

  // Fill
  const fill = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  fill.setAttribute("cx", cx);
  fill.setAttribute("cy", cy);
  fill.setAttribute("r", R);
  fill.setAttribute("stroke-width", STROKE);
  fill.setAttribute("stroke", color);
  fill.setAttribute("stroke-dasharray", C);
  fill.setAttribute("stroke-dashoffset", C);
  fill.setAttribute("transform", `rotate(-90 ${cx} ${cy})`);
  fill.classList.add("ring-fill");
  svg.appendChild(fill);
  wrap._fill = fill;

  // Pct text
  const pct = document.createElementNS("http://www.w3.org/2000/svg", "text");
  pct.setAttribute("x", cx);
  pct.setAttribute("y", cy + 4);
  pct.setAttribute("text-anchor", "middle");
  pct.setAttribute("font-size", "20");
  pct.classList.add("ring-pct");
  svg.appendChild(pct);
  wrap._pct = pct;

  // Sub label
  const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
  lbl.setAttribute("x", cx);
  lbl.setAttribute("y", cy + 18);
  lbl.setAttribute("text-anchor", "middle");
  lbl.classList.add("ring-lbl");
  lbl.textContent = label + "%";
  svg.appendChild(lbl);

  wrap.appendChild(svg);
  animate(wrap, val);
}

function animate(wrap, target) {
  wrap._fill.setAttribute("stroke-dashoffset", C);
  let start = null;
  const duration = 1200;
  let counter = 0;
  const pct = wrap._pct;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const offset = C - C * (target / 100) * eased;
    wrap._fill.setAttribute("stroke-dashoffset", offset);
    counter = Math.round(target * eased);
    pct.textContent = counter + "%";
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll(".ring-wrap").forEach(buildRing);

document.getElementById("animateBtn")?.addEventListener("click", () => {
  document.querySelectorAll(".ring-wrap").forEach((wrap) => {
    const newVal = Math.floor(Math.random() * 95) + 5;
    animate(wrap, newVal);
  });
});
