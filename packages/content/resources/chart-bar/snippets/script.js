const DATA = [
  { label: 'Electronics', value: 340, color: '#818cf8' },
  { label: 'Clothing',    value: 220, color: '#34d399' },
  { label: 'Books',       value: 185, color: '#f59e0b' },
  { label: 'Sports',      value: 260, color: '#f87171' },
  { label: 'Home',        value: 310, color: '#a78bfa' },
  { label: 'Beauty',      value: 145, color: '#38bdf8' },
];

const PAD = { top: 24, right: 20, bottom: 40, left: 52 };
let orient = 'vertical';
const svg = document.getElementById('chartSvg');
const tooltip = document.getElementById('chartTooltip');
const wrap  = document.getElementById('chartWrap');

document.querySelectorAll('.ctrl-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ctrl-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    orient = btn.dataset.orient;
    draw();
  });
});

function draw() {
  const W = wrap.clientWidth - 32;
  const H = orient === 'vertical' ? Math.round(W * 0.5) : Math.round(DATA.length * 52 + PAD.top + PAD.bottom);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  const maxVal = Math.ceil(Math.max(...DATA.map(d => d.value)) * 1.15);
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  if (orient === 'vertical') drawVertical(W, H, cW, cH, maxVal);
  else drawHorizontal(W, H, cW, cH, maxVal);
}

function el(tag, attrs = {}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

function drawVertical(W, H, cW, cH, maxVal) {
  const n = DATA.length;
  const gap = 8;
  const barW = (cW - gap * (n - 1)) / n;

  // Grid
  for (let t = 0; t <= 5; t++) {
    const v = Math.round((maxVal / 5) * t);
    const y = PAD.top + cH - (v / maxVal) * cH;
    svg.appendChild(el('line', { class: 'grid-line', x1: PAD.left, x2: PAD.left + cW, y1: y, y2: y }));
    const lbl = el('text', { class: 'grid-label', x: PAD.left - 6, y: y + 3.5, 'text-anchor': 'end' });
    lbl.textContent = v;
    svg.appendChild(lbl);
  }

  // Bars
  DATA.forEach((d, i) => {
    const x = PAD.left + i * (barW + gap);
    const barH = (d.value / maxVal) * cH;
    const y = PAD.top + cH - barH;
    const rect = el('rect', { class: 'bar-rect', x, y, width: barW, height: barH, fill: d.color, rx: 4 });
    addBarEvents(rect, d, x + barW / 2, y);
    svg.appendChild(rect);
    // Animate
    rect.style.transformOrigin = `0 ${PAD.top + cH}px`;
    rect.style.transform = 'scaleY(0)';
    rect.style.transition = `transform .5s cubic-bezier(.4,0,.2,1) ${i * 0.06}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => rect.style.transform = 'scaleY(1)'));

    // X label
    const lbl = el('text', { class: 'x-label', x: x + barW / 2, y: H - 6 });
    lbl.textContent = d.label;
    svg.appendChild(lbl);

    // Value label
    const vlbl = el('text', { class: 'bar-label', x: x + barW / 2, y: y - 4 });
    vlbl.textContent = d.value;
    svg.appendChild(vlbl);
  });
}

function drawHorizontal(W, H, cW, cH, maxVal) {
  const n = DATA.length;
  const barH = 30;
  const gap  = 12;
  const totalH = n * (barH + gap);

  for (let t = 0; t <= 5; t++) {
    const v = Math.round((maxVal / 5) * t);
    const x = PAD.left + (v / maxVal) * cW;
    svg.appendChild(el('line', { class: 'grid-line', x1: x, x2: x, y1: PAD.top, y2: PAD.top + totalH }));
    const lbl = el('text', { class: 'grid-label', x, y: PAD.top + totalH + 14, 'text-anchor': 'middle' });
    lbl.textContent = v;
    svg.appendChild(lbl);
  }

  DATA.forEach((d, i) => {
    const y = PAD.top + i * (barH + gap);
    const bW = (d.value / maxVal) * cW;
    const rect = el('rect', { class: 'bar-rect', x: PAD.left, y, width: bW, height: barH, fill: d.color, rx: 4 });
    addBarEvents(rect, d, PAD.left + bW, y + barH / 2);
    svg.appendChild(rect);
    rect.style.transformOrigin = `${PAD.left}px 0`;
    rect.style.transform = 'scaleX(0)';
    rect.style.transition = `transform .5s cubic-bezier(.4,0,.2,1) ${i * 0.06}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => rect.style.transform = 'scaleX(1)'));

    const lbl = el('text', { class: 'grid-label', x: PAD.left - 6, y: y + barH / 2 + 4, 'text-anchor': 'end' });
    lbl.textContent = d.label;
    svg.appendChild(lbl);

    const vlbl = el('text', { class: 'bar-label', x: PAD.left + bW + 4, y: y + barH / 2 + 4, 'text-anchor': 'start' });
    vlbl.textContent = d.value;
    svg.appendChild(vlbl);
  });
}

function addBarEvents(rect, d, tx, ty) {
  rect.addEventListener('mouseenter', (e) => {
    tooltip.innerHTML = `<div class="tooltip-label">${d.label}</div><div style="color:${d.color};font-weight:700">${d.value} units</div>`;
    tooltip.hidden = false;
    posTooltip(e);
  });
  rect.addEventListener('mousemove', posTooltip);
  rect.addEventListener('mouseleave', () => { tooltip.hidden = true; });
}

function posTooltip(e) {
  const r = wrap.getBoundingClientRect();
  tooltip.style.left = (e.clientX - r.left + 10) + 'px';
  tooltip.style.top  = (e.clientY - r.top  - 40) + 'px';
}

const ro = new ResizeObserver(draw);
ro.observe(wrap);
draw();
