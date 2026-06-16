/* Helios Data Commons — Dataset Explorer (vanilla JS, no deps) */
(function () {
  "use strict";

  /* ---------- Seeded dataset catalog (fictional) ---------- */
  var DATASETS = [
    {
      id: "hdc-0417", title: "Coastal Sea-Surface Temperature Anomalies, North Atlantic 1998–2023",
      author: "Okonkwo, A.; Reyes-Vidal, M. — Maris Oceanographic Institute",
      domain: "Earth Science", format: "NetCDF", license: "cc-by", year: 2024,
      sizeMB: 8420, files: 312, citations: 187, downloads: 24130,
      doi: "10.55821/hdc.0417",
      abstract: "Gridded daily sea-surface temperature anomalies derived from a blended satellite–buoy product across the North Atlantic shelf, with quality flags and uncertainty estimates at 0.05° resolution.",
      vars: [
        ["sst_anom", "float32", "°C", "SST anomaly vs 1991–2020 climatology"],
        ["lat", "float64", "deg N", "Cell-centre latitude"],
        ["lon", "float64", "deg E", "Cell-centre longitude"],
        ["qc_flag", "uint8", "—", "Quality control flag (0–4)"],
        ["sst_unc", "float32", "°C", "1σ uncertainty estimate"]
      ],
      preview: 'time,lat,lon,sst_anom,sst_unc,qc_flag\n2023-08-01,44.25,-63.55,+1.82,0.21,0\n2023-08-01,44.30,-63.55,+1.79,0.20,0\n2023-08-01,44.35,-63.55,+1.91,0.23,1',
      versions: [
        ["v3.1", "2024-03-18", "Extended through 2023; revised uncertainty model", true],
        ["v2.0", "2022-11-04", "Switched to blended OSTIA-style product"],
        ["v1.0", "2021-06-29", "Initial release 1998–2020"]
      ]
    },
    {
      id: "hdc-0288", title: "Single-Cell RNA Atlas of Murine Hippocampal Neurogenesis",
      author: "Lindqvist, H.; Banerjee, P.; Costa, F. — Helix Center for Genomics",
      domain: "Life Science", format: "HDF5", license: "cc0", year: 2025,
      sizeMB: 14760, files: 48, citations: 96, downloads: 9870,
      doi: "10.55821/hdc.0288",
      abstract: "A single-cell transcriptomic atlas of 211,400 cells sampled along the murine dentate gyrus neurogenic trajectory, with annotated cell types and pseudotime ordering.",
      vars: [
        ["cell_id", "string", "—", "Unique cell barcode"],
        ["gene_id", "string", "—", "Ensembl gene identifier"],
        ["counts", "int32", "UMI", "Raw molecular count"],
        ["cell_type", "category", "—", "Annotated cell type label"],
        ["pseudotime", "float32", "—", "Inferred differentiation pseudotime [0–1]"]
      ],
      preview: 'cell_id        cell_type      pseudotime  n_genes\nAAACCTGAGT-1   Radial glia    0.041       3120\nAAACCTGCAT-2   Neuroblast     0.387       2740\nAAACGGGTCA-3   Immature gran  0.612       2988',
      versions: [
        ["v1.2", "2025-02-09", "Re-annotated rare interneuron clusters", true],
        ["v1.0", "2024-10-22", "Initial atlas release"]
      ]
    },
    {
      id: "hdc-0931", title: "Photometric Light Curves of 4,210 Eclipsing Binary Candidates",
      author: "Tanaka, R.; Whitfield, J. — Aurora Sky Survey Consortium",
      domain: "Astronomy", format: "FITS", license: "cc-by", year: 2023,
      sizeMB: 3240, files: 4210, citations: 312, downloads: 41200,
      doi: "10.55821/hdc.0931",
      abstract: "Calibrated time-series photometry for eclipsing binary star candidates from the Aurora wide-field survey, including period estimates and folded light curves.",
      vars: [
        ["bjd", "float64", "day", "Barycentric Julian Date"],
        ["flux", "float32", "e-/s", "Calibrated flux"],
        ["flux_err", "float32", "e-/s", "Flux uncertainty"],
        ["period", "float32", "day", "Best-fit orbital period"]
      ],
      preview: 'bjd            flux       flux_err  flag\n2459832.41023  0.99812    0.00041   0\n2459832.42105  0.81204    0.00052   0\n2459832.43187  0.78930    0.00049   1',
      versions: [
        ["v2.1", "2023-09-30", "Added 612 new candidates from DR2", true],
        ["v1.0", "2022-07-15", "Initial DR1 catalog"]
      ]
    },
    {
      id: "hdc-0602", title: "Urban Air Quality Sensor Network, Greater Marrowfield 2019–2024",
      author: "Adeyemi, B.; Novak, L. — Civic Environmental Lab",
      domain: "Earth Science", format: "CSV", license: "odbl", year: 2024,
      sizeMB: 92, files: 18, citations: 54, downloads: 13540,
      doi: "10.55821/hdc.0602",
      abstract: "Hourly readings from 64 low-cost particulate and gas sensors deployed across an urban region, co-located with reference-grade monitors for calibration.",
      vars: [
        ["sensor_id", "string", "—", "Sensor unit identifier"],
        ["pm25", "float32", "µg/m³", "PM2.5 concentration"],
        ["no2", "float32", "ppb", "Nitrogen dioxide"],
        ["temp", "float32", "°C", "Ambient temperature"],
        ["rh", "float32", "%", "Relative humidity"]
      ],
      preview: 'timestamp,sensor_id,pm25,no2,temp,rh\n2024-01-12T08:00,S-014,18.4,22.1,4.2,78\n2024-01-12T09:00,S-014,21.7,25.6,5.0,74\n2024-01-12T10:00,S-014,19.2,23.0,6.8,69',
      versions: [
        ["v4.0", "2024-05-02", "Recalibration against 2024 reference data", true],
        ["v3.0", "2023-01-10", "Added 22 sensors"],
        ["v1.0", "2020-02-28", "Pilot deployment data"]
      ]
    },
    {
      id: "hdc-0775", title: "Benchmark Corpus for Low-Resource Machine Translation (8 Languages)",
      author: "Sørensen, K.; Mwangi, D.; Petrova, I. — Lingua Open Lab",
      domain: "Computer Science", format: "Parquet", license: "mit", year: 2025,
      sizeMB: 1180, files: 96, citations: 73, downloads: 28760,
      doi: "10.55821/hdc.0775",
      abstract: "Aligned bilingual sentence pairs across eight under-resourced languages with held-out evaluation splits and document-level metadata for reproducible benchmarking.",
      vars: [
        ["src_text", "string", "—", "Source-language sentence"],
        ["tgt_text", "string", "—", "Target-language sentence"],
        ["lang_pair", "category", "—", "Language pair code"],
        ["split", "category", "—", "train / dev / test"]
      ],
      preview: 'lang_pair  split  src_len  tgt_len\nsw-en      train  14       16\nam-en      dev    9        11\nqu-en      test   21       19',
      versions: [
        ["v2.0", "2025-01-20", "Added Quechua–English pair; dedup pass", true],
        ["v1.0", "2024-09-03", "Seven-language initial release"]
      ]
    },
    {
      id: "hdc-0150", title: "High-Entropy Alloy Mechanical Properties Database",
      author: "Volkov, S.; Hartmann, G. — Institute for Materials Discovery",
      domain: "Materials Science", format: "CSV", license: "cc-by", year: 2022,
      sizeMB: 36, files: 6, citations: 241, downloads: 18900,
      doi: "10.55821/hdc.0150",
      abstract: "Curated composition–processing–property records for 3,940 high-entropy alloy samples, including yield strength, hardness and phase information.",
      vars: [
        ["composition", "string", "at.%", "Elemental composition"],
        ["yield_strength", "float32", "MPa", "0.2% offset yield strength"],
        ["hardness", "float32", "HV", "Vickers hardness"],
        ["phase", "category", "—", "Dominant crystal phase"]
      ],
      preview: 'composition          yield_MPa  hardness_HV  phase\nCoCrFeMnNi           410        152          FCC\nAlCoCrFeNi           1080       520          BCC\nHfNbTaTiZr           980        389          BCC',
      versions: [
        ["v1.3", "2022-12-11", "Corrected 14 hardness entries", true],
        ["v1.0", "2021-08-30", "Initial release"]
      ]
    },
    {
      id: "hdc-0843", title: "Global Glacier Surface Velocity Mosaics 2016–2024",
      author: "Bergström, E.; Quan, Y. — Cryosphere Remote Sensing Group",
      domain: "Earth Science", format: "GeoTIFF", license: "cc-by", year: 2024,
      sizeMB: 21800, files: 1024, citations: 129, downloads: 7640,
      doi: "10.55821/hdc.0843",
      abstract: "Annual ice-surface velocity mosaics derived from feature tracking of optical and SAR imagery over 38 major glacier systems, with per-pixel error fields.",
      vars: [
        ["vx", "float32", "m/yr", "Eastward velocity component"],
        ["vy", "float32", "m/yr", "Northward velocity component"],
        ["v_mag", "float32", "m/yr", "Velocity magnitude"],
        ["v_err", "float32", "m/yr", "Velocity uncertainty"]
      ],
      preview: 'glacier   year  v_mag_m_yr  v_err\nKangia    2023  148.2       6.1\nJakob     2023  213.7       9.4\nPetermann 2023  1102.5      31.0',
      versions: [
        ["v2.0", "2024-04-12", "Reprocessed with updated SAR coherence mask", true],
        ["v1.0", "2023-03-19", "Initial 2016–2022 mosaics"]
      ]
    },
    {
      id: "hdc-0319", title: "Synthetic Patient Vital-Sign Streams for ICU Model Validation",
      author: "Haddad, N.; Pearson, T. — Clinical Informatics Collaborative",
      domain: "Life Science", format: "Parquet", license: "restricted", year: 2025,
      sizeMB: 640, files: 12, citations: 31, downloads: 4120,
      doi: "10.55821/hdc.0319",
      abstract: "Fully synthetic, generative-model-derived intensive-care vital-sign time series with embedded deterioration events, for safe algorithm benchmarking. No real patient data.",
      vars: [
        ["patient_id", "string", "—", "Synthetic subject id"],
        ["hr", "int16", "bpm", "Heart rate"],
        ["spo2", "int16", "%", "Oxygen saturation"],
        ["map", "int16", "mmHg", "Mean arterial pressure"],
        ["event", "category", "—", "Annotated deterioration event"]
      ],
      preview: 'patient_id  t_min  hr   spo2  map  event\nSYN-00012   0      88   97    82   none\nSYN-00012   45     119  91    61   sepsis_onset\nSYN-00012   60     132  88    54   sepsis_onset',
      versions: [
        ["v1.1", "2025-03-05", "Rebalanced event prevalence", true],
        ["v1.0", "2025-01-14", "Initial synthetic cohort"]
      ]
    },
    {
      id: "hdc-0507", title: "Proteomic Mass Spectra of Thermophilic Archaea",
      author: "Imai, S.; Delacroix, R. — Extremophile Biochemistry Unit",
      domain: "Life Science", format: "HDF5", license: "cc-by", year: 2023,
      sizeMB: 5120, files: 220, citations: 58, downloads: 6210,
      doi: "10.55821/hdc.0507",
      abstract: "Tandem mass spectrometry spectra and identified peptides for thermophilic archaeal proteomes cultured across a temperature gradient.",
      vars: [
        ["mz", "float64", "Th", "Mass-to-charge ratio"],
        ["intensity", "float32", "a.u.", "Peak intensity"],
        ["peptide", "string", "—", "Identified peptide sequence"],
        ["temp_c", "float32", "°C", "Culture temperature"]
      ],
      preview: 'scan   mz        intensity  charge  peptide\n1042   612.3041  84210      2       GVLDIAR\n1043   745.8920  39112      2       FTPEQISK\n1044   501.2718  120033     1       AAGER',
      versions: [
        ["v1.0", "2023-05-26", "Initial release", true]
      ]
    },
    {
      id: "hdc-0688", title: "Reanalysis Wind Fields for Offshore Energy Siting",
      author: "Karlsen, M.; Owusu, F. — Renewable Resource Atlas",
      domain: "Earth Science", format: "NetCDF", license: "cc0", year: 2026,
      sizeMB: 47200, files: 540, citations: 12, downloads: 2980,
      doi: "10.55821/hdc.0688",
      abstract: "Hourly 10 m and 100 m wind fields at 3 km resolution over continental shelf regions, derived from a downscaled atmospheric reanalysis for wind-resource assessment.",
      vars: [
        ["ws100", "float32", "m/s", "100 m wind speed"],
        ["wd100", "float32", "deg", "100 m wind direction"],
        ["ws10", "float32", "m/s", "10 m wind speed"],
        ["air_density", "float32", "kg/m³", "Surface air density"]
      ],
      preview: 'time              ws100  wd100  air_density\n2025-12-01T00:00  11.4   248    1.241\n2025-12-01T01:00  12.1   251    1.239\n2025-12-01T02:00  10.8   244    1.242',
      versions: [
        ["v1.0", "2026-01-30", "Initial 2010–2025 reanalysis", true]
      ]
    },
    {
      id: "hdc-0224", title: "Crowd-Sourced Seismic Waveforms from Citizen Sensors",
      author: "Russo, A.; Yamamoto, K. — Open Seismology Network",
      domain: "Earth Science", format: "CSV", license: "odbl", year: 2021,
      sizeMB: 12, files: 4, citations: 89, downloads: 15600,
      doi: "10.55821/hdc.0224",
      abstract: "Low-cost accelerometer waveforms from a volunteer sensor network, event-windowed around 1,820 regional earthquakes with manual quality review.",
      vars: [
        ["accel_z", "float32", "m/s²", "Vertical ground acceleration"],
        ["station", "string", "—", "Volunteer station id"],
        ["event_mag", "float32", "Mw", "Event magnitude"],
        ["dist_km", "float32", "km", "Epicentral distance"]
      ],
      preview: 'station  event_mag  dist_km  pga_m_s2\nCS-201   4.6        38.2     0.071\nCS-204   4.6        51.9     0.044\nCS-209   3.2        12.0     0.118',
      versions: [
        ["v2.0", "2021-11-08", "Reprocessed event windows", true],
        ["v1.0", "2020-04-01", "Initial volunteer dataset"]
      ]
    },
    {
      id: "hdc-0960", title: "Labelled Sketch Corpus for Geometric Shape Recognition",
      author: "Fontaine, J.; Iqbal, R. — Visual Cognition Lab",
      domain: "Computer Science", format: "Parquet", license: "mit", year: 2022,
      sizeMB: 740, files: 30, citations: 64, downloads: 33400,
      doi: "10.55821/hdc.0960",
      abstract: "1.2 million hand-drawn geometric sketches with stroke vectors and shape labels, collected through a gamified web tool for benchmarking sketch recognition.",
      vars: [
        ["sketch_id", "string", "—", "Unique sketch id"],
        ["strokes", "array", "—", "List of stroke point arrays"],
        ["label", "category", "—", "Ground-truth shape label"],
        ["n_points", "int32", "—", "Total stroke points"]
      ],
      preview: 'sketch_id  label      n_points  n_strokes\nSK-008812  triangle   46        3\nSK-008813  circle     61        1\nSK-008814  hexagon    88        6',
      versions: [
        ["v1.1", "2022-06-18", "Removed near-duplicate sketches", true],
        ["v1.0", "2022-02-02", "Initial corpus"]
      ]
    }
  ];

  /* ---------- DOM refs ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var grid = $("#grid");
  var emptyEl = $("#empty");
  var searchEl = $("#search");
  var clearSearchBtn = $("#clearSearch");
  var sortEl = $("#sort");
  var resultCountEl = $("#resultCount");
  var activeFiltersEl = $("#activeFilters");
  var yearMin = $("#yearMin");
  var yearMax = $("#yearMax");
  var yearOut = $("#yearOut");
  var overlay = $("#overlay");
  var drawer = $("#drawer");
  var toastEl = $("#toast");

  /* ---------- License display ---------- */
  var LICENSES = {
    "cc0": { label: "CC0", cls: "lic-cc0", full: "Creative Commons Zero (Public Domain)" },
    "cc-by": { label: "CC BY 4.0", cls: "lic-ccby", full: "Creative Commons Attribution 4.0" },
    "mit": { label: "MIT", cls: "lic-mit", full: "MIT License" },
    "odbl": { label: "ODbL", cls: "lic-odbl", full: "Open Database License" },
    "restricted": { label: "Restricted", cls: "lic-restricted", full: "Restricted — registration required" }
  };

  /* ---------- State ---------- */
  var state = {
    q: "",
    domain: new Set(),
    format: new Set(),
    license: new Set(),
    size: "any",
    yMin: 2015, yMax: 2026,
    sort: "relevance",
    view: "grid"
  };

  /* ---------- Helpers ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  function fmtSize(mb) {
    if (mb >= 1024) return (mb / 1024).toFixed(mb >= 10240 ? 0 : 1) + " GB";
    return mb + " MB";
  }
  function fmtNum(n) { return n.toLocaleString("en-US"); }

  function sizeBucket(mb) {
    if (mb < 100) return "s";
    if (mb <= 5120) return "m";
    return "l";
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function citation(d) {
    var names = d.author.split("—")[0].trim();
    return names + " (" + d.year + "). " + d.title + " [Data set]. Helios Data Commons. https://doi.org/" + d.doi;
  }

  /* ---------- Build facet checkboxes ---------- */
  function uniqueValues(key) {
    var counts = {};
    DATASETS.forEach(function (d) { counts[d[key]] = (counts[d[key]] || 0) + 1; });
    return Object.keys(counts).sort().map(function (v) { return { value: v, count: counts[v] }; });
  }

  function buildFacet(facetKey, items, labelFn) {
    var container = $('.facet-list[data-facet="' + facetKey + '"]');
    container.innerHTML = items.map(function (it) {
      var lab = labelFn ? labelFn(it.value) : it.value;
      return '<label class="check">' +
        '<input type="checkbox" value="' + escapeHTML(it.value) + '" data-facet="' + facetKey + '" />' +
        '<span>' + escapeHTML(lab) + '</span>' +
        '<span class="facet-count">' + it.count + '</span>' +
        '</label>';
    }).join("");
  }

  buildFacet("domain", uniqueValues("domain"));
  buildFacet("format", uniqueValues("format"));
  buildFacet("license", uniqueValues("license"), function (v) { return LICENSES[v].label; });

  /* ---------- Filtering ---------- */
  function matchSearch(d, q) {
    if (!q) return true;
    var hay = (d.title + " " + d.author + " " + d.domain + " " + d.abstract + " " + d.doi).toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (t) { return hay.indexOf(t) !== -1; });
  }

  function filtered() {
    return DATASETS.filter(function (d) {
      if (!matchSearch(d, state.q)) return false;
      if (state.domain.size && !state.domain.has(d.domain)) return false;
      if (state.format.size && !state.format.has(d.format)) return false;
      if (state.license.size && !state.license.has(d.license)) return false;
      if (state.size !== "any" && sizeBucket(d.sizeMB) !== state.size) return false;
      if (d.year < state.yMin || d.year > state.yMax) return false;
      return true;
    });
  }

  function sortList(list) {
    var s = state.sort;
    var arr = list.slice();
    arr.sort(function (a, b) {
      switch (s) {
        case "newest": return b.year - a.year || b.citations - a.citations;
        case "oldest": return a.year - b.year;
        case "citations": return b.citations - a.citations;
        case "size-desc": return b.sizeMB - a.sizeMB;
        case "size-asc": return a.sizeMB - b.sizeMB;
        case "title": return a.title.localeCompare(b.title);
        default: // relevance: cited + downloads weighting, search-aware
          return (b.citations * 2 + b.downloads / 100) - (a.citations * 2 + a.downloads / 100);
      }
    });
    return arr;
  }

  /* ---------- Render cards ---------- */
  function cardHTML(d) {
    var lic = LICENSES[d.license];
    return '<article class="card" tabindex="0" role="button" data-id="' + d.id + '" aria-label="' + escapeHTML(d.title) + '">' +
      '<div class="card-main">' +
        '<div class="card-top"><span class="card-domain">' + escapeHTML(d.domain) + '</span></div>' +
        '<h3>' + escapeHTML(d.title) + '</h3>' +
        '<p class="author">' + escapeHTML(d.author) + '</p>' +
        '<p class="desc">' + escapeHTML(d.abstract) + '</p>' +
        '<div class="card-meta">' +
          '<span class="m"><strong>' + d.format + '</strong></span>' +
          '<span class="m">' + fmtSize(d.sizeMB) + '</span>' +
          '<span class="m">' + fmtNum(d.files) + ' files</span>' +
          '<span class="m">' + fmtNum(d.citations) + ' citations</span>' +
        '</div>' +
      '</div>' +
      '<div class="card-foot">' +
        '<span class="lic ' + lic.cls + '" title="' + lic.full + '">' + lic.label + '</span>' +
        '<button class="btn sm" type="button" data-dl="' + d.id + '">' +
          '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 1v8m0 0L5 6m3 3l3-3M2 13h12" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          'Download</button>' +
      '</div>' +
    '</article>';
  }

  function render() {
    var list = sortList(filtered());

    grid.className = "grid" + (state.view === "list" ? " list" : "");
    if (!list.length) {
      grid.innerHTML = "";
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      grid.innerHTML = list.map(cardHTML).join("");
    }

    var total = DATASETS.length;
    resultCountEl.innerHTML = list.length === total
      ? fmtNum(total) + ' datasets'
      : fmtNum(list.length) + ' <span class="muted">of ' + fmtNum(total) + ' datasets</span>';

    renderActiveChips();
  }

  function renderActiveChips() {
    var chips = [];
    function add(label, onRemove) { chips.push({ label: label, fn: onRemove }); }

    state.domain.forEach(function (v) { add(v, function () { state.domain.delete(v); syncFacetCheckbox("domain", v, false); }); });
    state.format.forEach(function (v) { add(v, function () { state.format.delete(v); syncFacetCheckbox("format", v, false); }); });
    state.license.forEach(function (v) { add(LICENSES[v].label, function () { state.license.delete(v); syncFacetCheckbox("license", v, false); }); });
    if (state.size !== "any") {
      var sl = { s: "< 100 MB", m: "100 MB–5 GB", l: "> 5 GB" }[state.size];
      add(sl, function () { state.size = "any"; ($('input[name="size"][value="any"]') || {}).checked = true; });
    }
    if (state.yMin !== 2015 || state.yMax !== 2026) {
      add(state.yMin + "–" + state.yMax, function () {
        state.yMin = 2015; state.yMax = 2026;
        yearMin.value = 2015; yearMax.value = 2026; updateYearOut();
      });
    }

    activeFiltersEl.innerHTML = chips.map(function (c, i) {
      return '<span class="chip" data-chip="' + i + '">' + escapeHTML(c.label) +
        ' <button type="button" aria-label="Remove ' + escapeHTML(c.label) + ' filter">&times;</button></span>';
    }).join("");

    $$(".chip", activeFiltersEl).forEach(function (el, i) {
      el.querySelector("button").addEventListener("click", function () { chips[i].fn(); render(); });
    });
  }

  function syncFacetCheckbox(facet, value, checked) {
    var box = $('input[data-facet="' + facet + '"][value="' + cssEsc(value) + '"]');
    if (box) box.checked = checked;
  }
  function cssEsc(v) { return String(v).replace(/"/g, '\\"'); }

  /* ---------- Drawer ---------- */
  var lastFocused = null;

  function openDrawer(id) {
    var d = DATASETS.find(function (x) { return x.id === id; });
    if (!d) return;
    var lic = LICENSES[d.license];

    var varsRows = d.vars.map(function (v) {
      return '<tr><td class="name">' + escapeHTML(v[0]) + '</td><td class="type">' + escapeHTML(v[1]) +
        '</td><td class="unit">' + escapeHTML(v[2]) + '</td><td>' + escapeHTML(v[3]) + '</td></tr>';
    }).join("");

    var verRows = d.versions.map(function (v) {
      return '<div class="ver"><span class="tag' + (v[3] ? " current" : "") + '">' + escapeHTML(v[0]) +
        '</span><span class="date">' + escapeHTML(v[1]) + '</span><span class="note">' + escapeHTML(v[2]) + '</span></div>';
    }).join("");

    var prev = escapeHTML(d.preview).replace(/^([^\n,]+)/gm, '<span class="hl">$1</span>');

    drawer.innerHTML =
      '<div class="drawer-head">' +
        '<button class="drawer-close" type="button" aria-label="Close">&times;</button>' +
        '<span class="card-domain">' + escapeHTML(d.domain) + '</span>' +
        '<h2 id="drawerTitle">' + escapeHTML(d.title) + '</h2>' +
        '<p class="author">' + escapeHTML(d.author) + '</p>' +
        '<p class="doi">https://doi.org/' + escapeHTML(d.doi) + '</p>' +
      '</div>' +
      '<div class="drawer-body">' +
        '<section><h3>Abstract</h3><p class="abstract">' + escapeHTML(d.abstract) + '</p></section>' +
        '<section><h3>At a glance</h3><div class="statgrid">' +
          stat(fmtSize(d.sizeMB), "Total size") +
          stat(fmtNum(d.files), "Files") +
          stat(fmtNum(d.citations), "Citations") +
          stat(fmtNum(d.downloads), "Downloads") +
          stat('<span class="lic ' + lic.cls + '" style="font-size:12px">' + lic.label + '</span>', "License") +
          stat(d.format, "Format") +
        '</div></section>' +
        '<section><h3>Variables (' + d.vars.length + ')</h3>' +
          '<div class="table-scroll"><table class="vars"><thead><tr><th>Name</th><th>Type</th><th>Unit</th><th>Description</th></tr></thead>' +
          '<tbody>' + varsRows + '</tbody></table></div></section>' +
        '<section><h3>Sample preview</h3><pre class="preview">' + prev + '</pre></section>' +
        '<section><h3>Versions</h3><div class="versions">' + verRows + '</div></section>' +
        '<section><h3>Cite this dataset</h3>' +
          '<div class="cite-box" id="citeText">' + escapeHTML(citation(d)) + '</div>' +
          '<div class="drawer-actions">' +
            '<button class="btn" type="button" data-dl="' + d.id + '">' +
              '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 1v8m0 0L5 6m3 3l3-3M2 13h12" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              'Download (' + fmtSize(d.sizeMB) + ')</button>' +
            '<button class="btn ghost" type="button" id="citeBtn">Copy citation</button>' +
            '<button class="btn ghost" type="button" id="doiBtn">Copy DOI</button>' +
          '</div></section>' +
      '</div>';

    lastFocused = document.activeElement;
    overlay.hidden = false;
    drawer.hidden = false;
    drawer.focus();
    document.body.style.overflow = "hidden";

    drawer.querySelector(".drawer-close").addEventListener("click", closeDrawer);
    $("#citeBtn").addEventListener("click", function () { copy(citation(d), "Citation copied to clipboard"); });
    $("#doiBtn").addEventListener("click", function () { copy("https://doi.org/" + d.doi, "DOI copied to clipboard"); });
  }

  function stat(v, k) { return '<div class="stat"><div class="v">' + v + '</div><div class="k">' + k + '</div></div>'; }

  function closeDrawer() {
    drawer.hidden = true;
    overlay.hidden = true;
    document.body.style.overflow = "";
    drawer.innerHTML = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function copy(text, msg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(msg); }, function () { fallbackCopy(text, msg); });
    } else { fallbackCopy(text, msg); }
  }
  function fallbackCopy(text, msg) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast(msg); } catch (e) { toast("Copy failed"); }
    document.body.removeChild(ta);
  }

  /* ---------- Events ---------- */
  // search (debounced)
  var debTimer;
  searchEl.addEventListener("input", function () {
    clearTimeout(debTimer);
    clearSearchBtn.hidden = !searchEl.value;
    debTimer = setTimeout(function () { state.q = searchEl.value.trim(); render(); }, 140);
  });
  clearSearchBtn.addEventListener("click", function () {
    searchEl.value = ""; state.q = ""; clearSearchBtn.hidden = true; searchEl.focus(); render();
  });

  // facet checkboxes
  $$(".facet-list input[type=checkbox]").forEach(function (box) {
    box.addEventListener("change", function () {
      var set = state[box.dataset.facet];
      if (box.checked) set.add(box.value); else set.delete(box.value);
      render();
    });
  });

  // size radios
  $$('input[name="size"]').forEach(function (r) {
    r.addEventListener("change", function () { if (r.checked) { state.size = r.value; render(); } });
  });

  // year dual range
  function updateYearOut() { yearOut.textContent = state.yMin + " – " + state.yMax; }
  function onYear() {
    var a = +yearMin.value, b = +yearMax.value;
    if (a > b) { var t = a; a = b; b = t; }
    state.yMin = a; state.yMax = b;
    updateYearOut();
    render();
  }
  yearMin.addEventListener("input", onYear);
  yearMax.addEventListener("input", onYear);

  // sort
  sortEl.addEventListener("change", function () { state.sort = sortEl.value; render(); });

  // view toggle
  $("#viewGrid").addEventListener("click", function () { setView("grid"); });
  $("#viewList").addEventListener("click", function () { setView("list"); });
  function setView(v) {
    state.view = v;
    var g = $("#viewGrid"), l = $("#viewList");
    g.classList.toggle("is-active", v === "grid");
    l.classList.toggle("is-active", v === "list");
    g.setAttribute("aria-pressed", v === "grid");
    l.setAttribute("aria-pressed", v === "list");
    render();
  }

  // reset
  function resetAll() {
    state.q = ""; searchEl.value = ""; clearSearchBtn.hidden = true;
    state.domain.clear(); state.format.clear(); state.license.clear();
    state.size = "any"; state.yMin = 2015; state.yMax = 2026;
    $$(".facet-list input[type=checkbox]").forEach(function (b) { b.checked = false; });
    var anyR = $('input[name="size"][value="any"]'); if (anyR) anyR.checked = true;
    yearMin.value = 2015; yearMax.value = 2026; updateYearOut();
    render();
    toast("Filters reset");
  }
  $("#resetFilters").addEventListener("click", resetAll);
  $("#emptyReset").addEventListener("click", resetAll);

  // card / download click delegation
  grid.addEventListener("click", function (e) {
    var dl = e.target.closest("[data-dl]");
    if (dl) {
      e.stopPropagation();
      var d = DATASETS.find(function (x) { return x.id === dl.dataset.dl; });
      toast("Preparing download — " + d.title.slice(0, 40) + "… (" + fmtSize(d.sizeMB) + ")");
      return;
    }
    var card = e.target.closest(".card");
    if (card) openDrawer(card.dataset.id);
  });
  grid.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("card")) {
      e.preventDefault(); openDrawer(e.target.dataset.id);
    }
  });

  // drawer download delegation
  drawer.addEventListener("click", function (e) {
    var dl = e.target.closest("[data-dl]");
    if (dl) {
      var d = DATASETS.find(function (x) { return x.id === dl.dataset.dl; });
      toast("Preparing download — " + d.title.slice(0, 40) + "… (" + fmtSize(d.sizeMB) + ")");
    }
  });

  // overlay + escape
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !drawer.hidden) closeDrawer();
  });

  /* ---------- Init ---------- */
  $("#totalCount").textContent = fmtNum(DATASETS.length);
  updateYearOut();
  render();
})();
