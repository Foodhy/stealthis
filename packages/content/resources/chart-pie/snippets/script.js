const DATA = [
  { label: 'Organic Search', value: 4200, color: '#818cf8' },
  { label: 'Direct',         value: 2800, color: '#34d399' },
  { label: 'Social Media',   value: 1900, color: '#f59e0b' },
  { label: 'Referral',       value: 1300, color: '#f87171' },
  { label: 'Email',          value:  800, color: '#a78bfa' },
];
const total = DATA.reduce((a, d) => a + d.value, 0);

let mode = 'donut';
const pieSvg    = document.getElementById('pieSvg');
const legend    = document.getElementById('pieLegend');
const center    = document.getElementById('pieCenter');
const centerVal = document.getElementById('pieCenterVal');
const tooltip   = document.getElementById('chartTooltip');
const SIZE = 260, CX = SIZE / 2, CY = SIZE / 2, R = 110, INNER_R = 65;

document.querySelectorAll('.ctrl-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ctrl-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    draw();
  });
});

function polarToXY(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function arcPath(cx, cy, r, innerR, startAngle, endAngle, isDonut) {
  const [sx, sy] = polarToXY(cx, cy, r, startAngle);
  const [ex, ey] = polarToXY(cx, cy, r, endAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;

  if (isDonut) {
    const [ix, iy] = polarToXY(cx, cy, innerR, endAngle);
    const [ox, oy] = polarToXY(cx, cy, innerR, startAngle);
    return `M${sx},${sy} A${r},${r} 0 ${large},1 ${ex},${ey} L${ix},${iy} A${innerR},${innerR} 0 ${large},0 ${ox},${oy} Z`;
  }
  return `M${cx},${cy} L${sx},${sy} A${r},${r} 0 ${large},1 ${ex},${ey} Z`;
}

function draw() {
  pieSvg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  pieSvg.setAttribute('width', SIZE);
  pieSvg.setAttribute('height', SIZE);
  pieSvg.innerHTML = '';

  center.hidden = mode !== 'donut';
  if (mode === 'donut') {
    centerVal.textContent = (total / 1000).toFixed(1) + 'k';
  }

  let angle = -Math.PI / 2;
  DATA.forEach((d, i) => {
    const share = (d.value / total) * 2 * Math.PI;
    const startAngle = angle;
    const endAngle   = angle + share;
    angle = endAngle;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', arcPath(CX, CY, R, INNER_R, startAngle, endAngle, mode === 'donut'));
    path.setAttribute('fill', d.color);
    path.setAttribute('class', 'pie-slice');
    path.style.animation = `fadeIn .4s ${i * 0.07}s ease both`;
    path.addEventListener('mouseenter', (e) => showTooltip(e, d));
    path.addEventListener('mousemove', (e) => posTooltip(e));
    path.addEventListener('mouseleave', () => { tooltip.hidden = true; });
    pieSvg.appendChild(path);
  });

  legend.innerHTML = '';
  DATA.forEach(d => {
    const pct = ((d.value / total) * 100).toFixed(1);
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-swatch" style="background:${d.color}"></span><span>${d.label}</span><span class="legend-pct">${pct}%</span>`;
    legend.appendChild(item);
  });
}

function showTooltip(e, d) {
  const pct = ((d.value / total) * 100).toFixed(1);
  tooltip.innerHTML = `<strong>${d.label}</strong><br/>${d.value.toLocaleString()} visits · ${pct}%`;
  tooltip.hidden = false;
  posTooltip(e);
}
function posTooltip(e) {
  tooltip.style.left = (e.clientX + 12) + 'px';
  tooltip.style.top  = (e.clientY - 40) + 'px';
}

const style = document.createElement('style');
style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: none; } }`;
document.head.appendChild(style);

draw();
