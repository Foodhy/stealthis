/**
 * ═══════════════════════════════════════════════════════════════
 *  Geographic Distribution Chart — Real Colombia SVG Map
 * ═══════════════════════════════════════════════════════════════
 *
 *  Uses a real Colombia departments SVG map (from MapSVG.com,
 *  Creative Commons). Departments are grouped into macro-regions
 *  and colored by value. Horizontal bars match each region.
 *
 *  HOW TO CHANGE COUNTRY:
 *  1. Replace COLOMBIA_SVG_URL with your country SVG path
 *  2. Update REGIONS and the department-to-region mapping
 *  3. Adjust viewBox if needed
 *
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Path to the SVG map. The SVG must have <path> elements with
 * `id` attributes matching department codes (e.g. CO-ANT).
 */
var COLOMBIA_SVG_URL = '/colombia.svg';

/**
 * Regions with display name and value.
 * Each region maps to one or more department IDs in the SVG.
 */
var REGIONS = [
  {
    region: 'East',
    value: 95,
    depts: ['CO-SAN', 'CO-NSA', 'CO-ARA']
  },
  {
    region: 'Central',
    value: 88,
    depts: ['CO-CUN', 'CO-DC', 'CO-TOL', 'CO-HUI']
  },
  {
    region: 'West',
    value: 76,
    depts: ['CO-CHO', 'CO-VAC']
  },
  {
    region: 'Coffee Axis',
    value: 68,
    depts: ['CO-CAL', 'CO-RIS', 'CO-QUI']
  },
  {
    region: 'North',
    value: 60,
    depts: ['CO-ATL', 'CO-BOL', 'CO-CES', 'CO-COR', 'CO-GUJ', 'CO-MAG', 'CO-SUC', 'CO-SAP']
  },
  {
    region: 'Antioquia',
    value: 52,
    depts: ['CO-ANT']
  },
  {
    region: 'Boyaca',
    value: 40,
    depts: ['CO-BOY', 'CO-CAS']
  },
  {
    region: 'Bogota',
    value: 34,
    depts: ['CO-DC']
  },
  {
    region: 'South',
    value: 25,
    depts: ['CO-NAR', 'CO-CAU', 'CO-PUT', 'CO-CAQ', 'CO-AMA', 'CO-GUV', 'CO-GUA', 'CO-VAU']
  },
  {
    region: 'Plains',
    value: 18,
    depts: ['CO-MET', 'CO-VIC']
  }
];

/* ── Color scale (dark → light blue) ──────────────── */

var BLUES = [
  '#1e3a5f', '#1e40af', '#1d4ed8', '#2563eb',
  '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'
];

function pickColor(value, max) {
  var ratio = 1 - (value / max);
  var idx = Math.min(Math.floor(ratio * (BLUES.length - 1)), BLUES.length - 1);
  return BLUES[idx];
}

/* ── Build dept→color lookup ──────────────────────── */

var maxVal = Math.max.apply(null, REGIONS.map(function (r) { return r.value; }));
var deptColorMap = {};

REGIONS.forEach(function (r) {
  var color = pickColor(r.value, maxVal);
  r.depts.forEach(function (id) {
    deptColorMap[id] = { color: color, region: r.region };
  });
});

/* ── Load and render SVG map ──────────────────────── */

var mapContainer = document.getElementById('geoMap');
var barsContainer = document.getElementById('geoBars');

var xhr = new XMLHttpRequest();
xhr.open('GET', COLOMBIA_SVG_URL, true);
xhr.onload = function () {
  if (xhr.status !== 200) return;

  // Parse SVG
  var parser = new DOMParser();
  var doc = parser.parseFromString(xhr.responseText, 'image/svg+xml');
  var svg = doc.querySelector('svg');

  // Set viewBox from the original width/height so the SVG scales
  var origW = svg.getAttribute('width') || 612;
  var origH = svg.getAttribute('height') || 693;
  svg.setAttribute('viewBox', '0 0 ' + origW + ' ' + origH);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.width = '100%';
  svg.style.height = 'auto';

  // Hide San Andrés island — it's far off-screen and breaks the layout
  var sanAndres = svg.querySelector('#CO-SAP');
  if (sanAndres) sanAndres.style.display = 'none';

  // Color each department path
  var paths = svg.querySelectorAll('path');
  paths.forEach(function (p) {
    if (p.style.display === 'none') return;
    var id = p.getAttribute('id');
    var info = deptColorMap[id];
    if (info) {
      p.setAttribute('fill', info.color);
      p.dataset.region = info.region;
    } else {
      // Departments not in any region get a neutral light blue
      p.setAttribute('fill', '#dbeafe');
      p.dataset.region = '';
    }
    p.setAttribute('stroke', '#ffffff');
    p.setAttribute('stroke-width', '1');
    p.style.cursor = 'pointer';
    p.style.transition = 'opacity .2s, filter .2s';
  });

  mapContainer.appendChild(svg);

  // After map is in DOM, set up interactions
  setupTooltip(svg);
  setupHighlightSync(svg);
};
xhr.send();

/* ── Render bars ──────────────────────────────────── */

REGIONS.forEach(function (item, i) {
  var row = document.createElement('div');
  row.className = 'bar-row';
  row.dataset.region = item.region;

  var name = document.createElement('div');
  name.className = 'bar-name';
  name.textContent = item.region;

  var fill = document.createElement('div');
  fill.className = 'bar-fill';
  fill.style.width = ((item.value / maxVal) * 100) + '%';
  fill.style.background = pickColor(item.value, maxVal);

  row.appendChild(name);
  row.appendChild(fill);
  barsContainer.appendChild(row);

  setTimeout(function () { fill.classList.add('show'); }, 80 * i);
});

/* ── Tooltip ──────────────────────────────────────── */

function setupTooltip(svg) {
  var tip = document.createElement('div');
  tip.className = 'geo-tip';
  document.body.appendChild(tip);

  var paths = svg.querySelectorAll('path');
  paths.forEach(function (p) {
    p.addEventListener('mouseenter', function () {
      var title = p.getAttribute('title') || '';
      var region = p.dataset.region || '';
      tip.textContent = title + (region ? ' — ' + region : '');
      tip.classList.add('on');
    });
    p.addEventListener('mousemove', function (e) {
      tip.style.left = (e.clientX + 14) + 'px';
      tip.style.top = (e.clientY - 30) + 'px';
    });
    p.addEventListener('mouseleave', function () {
      tip.classList.remove('on');
    });
    p.addEventListener('mouseenter', function () {
      p.style.opacity = '0.8';
      p.style.filter = 'brightness(1.15)';
    });
    p.addEventListener('mouseleave', function () {
      p.style.opacity = '';
      p.style.filter = '';
    });
  });
}

/* ── Highlight sync: bar ↔ map ────────────────────── */

function setupHighlightSync(svg) {
  var barRows = barsContainer.querySelectorAll('.bar-row');

  barRows.forEach(function (row) {
    var regionName = row.dataset.region;

    row.addEventListener('mouseenter', function () {
      // Highlight matching departments on map
      svg.querySelectorAll('path').forEach(function (p) {
        if (p.dataset.region === regionName) {
          p.style.filter = 'brightness(1.3)';
          p.style.stroke = '#1a1a2e';
          p.style.strokeWidth = '2';
        }
      });
    });

    row.addEventListener('mouseleave', function () {
      svg.querySelectorAll('path').forEach(function (p) {
        if (p.dataset.region === regionName) {
          p.style.filter = '';
          p.style.stroke = '#ffffff';
          p.style.strokeWidth = '1';
        }
      });
    });
  });
}
