const SERIES = [
  { key: '2024', label: 'Year 2024', color: '#1e3a5f' },
  { key: '2025', label: 'Year 2025', color: '#60a5fa' },
];

const DATA = [
  { month: 'Jan', values: [125000, 82000] },
  { month: 'Feb', values: [108000, 91000] },
  { month: 'Mar', values: [142000, 76000] },
  { month: 'Apr', values: [110000, 105000] },
  { month: 'May', values: [97000, 118000] },
  { month: 'Jun', values: [135000, 99000] },
  { month: 'Jul', values: [151000, 88000] },
  { month: 'Aug', values: [120000, 102000] },
  { month: 'Sep', values: [113000, 124000] },
  { month: 'Oct', values: [148000, 111000] },
  { month: 'Nov', values: [162000, 106000] },
  { month: 'Dec', values: [180000, 128000] },
];

const PAD = { top: 20, right: 20, bottom: 36, left: 80 };
const svg = document.getElementById('chartSvg');
const tooltip = document.getElementById('chartTooltip');
const wrap = document.getElementById('chartWrap');
const legend = document.getElementById('chartLegend');

// Build legend
SERIES.forEach(s => {
  const item = document.createElement('div');
  item.className = 'legend-item';
  item.innerHTML = '<span class="legend-swatch" style="background:' + s.color + '"></span>' + s.label;
  legend.appendChild(item);
});

function formatMoney(v) {
  return '$' + v.toLocaleString('en-US');
}

function el(tag, attrs) {
  var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
  return e;
}

function niceMax(val) {
  var mag = Math.pow(10, Math.floor(Math.log10(val)));
  return Math.ceil(val / mag) * mag;
}

function draw() {
  var W = wrap.clientWidth;
  var H = Math.max(320, Math.round(W * 0.48));
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.innerHTML = '';

  var maxTotal = 0;
  DATA.forEach(function (d) {
    var sum = d.values.reduce(function (a, b) { return a + b; }, 0);
    if (sum > maxTotal) maxTotal = sum;
  });
  maxTotal = niceMax(maxTotal);

  var cW = W - PAD.left - PAD.right;
  var cH = H - PAD.top - PAD.bottom;
  var n = DATA.length;
  var gap = Math.max(4, Math.round(cW * 0.02));
  var barW = (cW - gap * (n - 1)) / n;

  // Grid lines and Y labels
  var ticks = 5;
  for (var t = 0; t <= ticks; t++) {
    var v = Math.round((maxTotal / ticks) * t);
    var y = PAD.top + cH - (v / maxTotal) * cH;
    svg.appendChild(el('line', {
      class: 'grid-line',
      x1: PAD.left,
      x2: PAD.left + cW,
      y1: y,
      y2: y
    }));
    var lbl = el('text', {
      class: 'grid-label',
      x: PAD.left - 8,
      y: y + 3.5,
      'text-anchor': 'end'
    });
    lbl.textContent = formatMoney(v);
    svg.appendChild(lbl);
  }

  // Bars
  DATA.forEach(function (d, i) {
    var x = PAD.left + i * (barW + gap);
    var cumY = 0;

    // Draw series bottom-to-top (series 0 at bottom, series 1 on top)
    d.values.forEach(function (val, si) {
      var barH = (val / maxTotal) * cH;
      var yPos = PAD.top + cH - cumY - barH;

      var rx = 0;
      // Round top corners only for the topmost segment
      if (si === d.values.length - 1) rx = 3;

      var rect = el('rect', {
        class: 'bar-rect',
        x: x,
        y: yPos,
        width: barW,
        height: barH,
        fill: SERIES[si].color,
        rx: rx
      });

      // Animation
      rect.style.transformOrigin = '0 ' + (PAD.top + cH) + 'px';
      rect.style.transform = 'scaleY(0)';
      rect.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1) ' + (i * 0.04 + si * 0.02) + 's';

      (function (r) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            r.style.transform = 'scaleY(1)';
          });
        });
      })(rect);

      // Tooltip events
      (function (month, series, value) {
        rect.addEventListener('mouseenter', function (e) {
          tooltip.innerHTML =
            '<div class="tooltip-label">' + month + '</div>' +
            '<div class="tooltip-row">' +
            '<span class="tooltip-dot" style="background:' + series.color + '"></span>' +
            '<span>' + series.label + ': <strong>' + formatMoney(value) + '</strong></span>' +
            '</div>';
          tooltip.hidden = false;
          posTooltip(e);
        });
        rect.addEventListener('mousemove', posTooltip);
        rect.addEventListener('mouseleave', function () { tooltip.hidden = true; });
      })(d.month, SERIES[si], val);

      svg.appendChild(rect);
      cumY += barH;
    });

    // X label
    var xlbl = el('text', {
      class: 'x-label',
      x: x + barW / 2,
      y: H - 8
    });
    xlbl.textContent = d.month;
    svg.appendChild(xlbl);
  });
}

function posTooltip(e) {
  var r = wrap.getBoundingClientRect();
  var x = e.clientX - r.left + 12;
  var y = e.clientY - r.top - 44;
  // Keep tooltip within bounds
  if (x + 160 > r.width) x = e.clientX - r.left - 170;
  if (y < 0) y = 4;
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

var ro = new ResizeObserver(draw);
ro.observe(wrap);
draw();
