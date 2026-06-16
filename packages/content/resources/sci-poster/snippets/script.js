(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---------- build results chart ---------- */
  // depth bands × tidal phases (particles kg^-1, of max 60)
  var phases = [
    { key: "Flood", color: "#1a4f8a" },
    { key: "Slack", color: "#0f7d78" },
    { key: "Ebb", color: "#c9821f" }
  ];
  var bands = [
    { label: "0–4 cm", vals: [22.1, 18.4, 14.0], se: [2.1, 1.8, 1.6] },
    { label: "4–8 cm", vals: [38.6, 27.0, 17.5], se: [3.0, 2.2, 1.9] },
    { label: "8–12 cm", vals: [52.7, 33.1, 19.8], se: [3.8, 2.6, 2.0] }
  ];
  var MAX = 60;

  var plot = document.getElementById("chart-plot");
  var legend = document.getElementById("chart-legend");

  if (plot) {
    bands.forEach(function (band) {
      var cluster = document.createElement("div");
      cluster.className = "cluster";

      band.vals.forEach(function (v, i) {
        var bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = (v / MAX * 100) + "%";
        bar.style.background = phases[i].color;
        bar.setAttribute("tabindex", "0");
        bar.setAttribute("role", "img");
        bar.setAttribute(
          "aria-label",
          phases[i].key + " tide, " + band.label + ": " +
          v.toFixed(1) + " particles per kilogram, plus or minus " +
          band.se[i].toFixed(1)
        );

        var tip = document.createElement("span");
        tip.className = "bar__tip";
        tip.textContent = phases[i].key + " · " + v.toFixed(1) + " ±" + band.se[i].toFixed(1);
        bar.appendChild(tip);

        bar.addEventListener("click", function () {
          toast(phases[i].key + " / " + band.label + " — " + v.toFixed(1) + " part·kg⁻¹");
        });
        cluster.appendChild(bar);
      });

      var lbl = document.createElement("span");
      lbl.className = "cluster__lbl";
      lbl.textContent = band.label;
      cluster.appendChild(lbl);

      plot.appendChild(cluster);
    });
  }

  if (legend) {
    phases.forEach(function (p) {
      var span = document.createElement("span");
      var sw = document.createElement("span");
      sw.className = "swatch";
      sw.style.background = p.color;
      span.appendChild(sw);
      span.appendChild(document.createTextNode(p.key + " tide"));
      legend.appendChild(span);
    });
  }

  /* ---------- CSS-drawn QR code (deterministic pseudo-pattern) ---------- */
  var qr = document.getElementById("qr");
  if (qr) {
    var N = 11;
    // deterministic seed pattern
    var seed = 0x9e3779b9;
    function rnd() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }
    function isFinder(r, c) {
      var inBox = function (r0, c0) {
        return r >= r0 && r <= r0 + 2 && c >= c0 && c <= c0 + 2;
      };
      return inBox(0, 0) || inBox(0, N - 3) || inBox(N - 3, 0);
    }
    var frag = document.createDocumentFragment();
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        var cell = document.createElement("i");
        var on;
        if (isFinder(r, c)) {
          // finder ring pattern
          var rr = r < 3 ? r : r - (N - 3);
          var cc = c < 3 ? c : c - (N - 3);
          on = !(rr === 1 && cc === 1) ? (rr === 0 || rr === 2 || cc === 0 || cc === 2) : false;
          on = on || (rr === 1 && cc === 1);
        } else {
          on = rnd() > 0.52;
        }
        if (!on) cell.style.background = "transparent";
        frag.appendChild(cell);
      }
    }
    qr.appendChild(frag);
  }

  /* ---------- copy DOI ---------- */
  var copyBtn = document.getElementById("copy-doi");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var doi = "10.5281/zenodo.9920441";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(doi).then(
          function () { toast("DOI copied to clipboard"); },
          function () { toast("DOI: " + doi); }
        );
      } else {
        toast("DOI: " + doi);
      }
    });
  }

  /* ---------- zoom / fit controls ---------- */
  var poster = document.getElementById("poster");
  var stage = document.getElementById("stage");
  var readout = document.getElementById("zoom-readout");
  var btnFit = document.getElementById("btn-fit");
  var btnActual = document.getElementById("btn-actual");
  var zoomIn = document.getElementById("zoom-in");
  var zoomOut = document.getElementById("zoom-out");

  var BASE_W = 880; // poster intrinsic width
  var scale = 1;
  var mode = "fit"; // 'fit' | 'actual' | 'manual'

  function isMobile() {
    return window.matchMedia("(max-width: 640px)").matches;
  }

  function apply() {
    if (isMobile()) {
      poster.style.transform = "";
      readout.textContent = "100%";
      return;
    }
    poster.style.transform = "scale(" + scale + ")";
    readout.textContent = Math.round(scale * 100) + "%";
  }

  function fitScale() {
    var avail = stage.clientWidth - 36;
    return Math.min(1, avail / BASE_W);
  }

  function setMode(m) {
    mode = m;
    if (m === "fit") scale = fitScale();
    else if (m === "actual") scale = 1;
    btnFit.classList.toggle("is-active", m === "fit");
    btnFit.setAttribute("aria-pressed", String(m === "fit"));
    btnActual.classList.toggle("is-active", m === "actual");
    btnActual.setAttribute("aria-pressed", String(m === "actual"));
    apply();
  }

  function clampZoom(s) {
    return Math.max(0.4, Math.min(1.6, s));
  }

  if (poster && stage) {
    btnFit.addEventListener("click", function () { setMode("fit"); });
    btnActual.addEventListener("click", function () { setMode("actual"); });

    zoomIn.addEventListener("click", function () {
      mode = "manual";
      btnFit.classList.remove("is-active");
      btnActual.classList.remove("is-active");
      btnFit.setAttribute("aria-pressed", "false");
      btnActual.setAttribute("aria-pressed", "false");
      scale = clampZoom(scale + 0.1);
      apply();
    });
    zoomOut.addEventListener("click", function () {
      mode = "manual";
      btnFit.classList.remove("is-active");
      btnActual.classList.remove("is-active");
      btnFit.setAttribute("aria-pressed", "false");
      btnActual.setAttribute("aria-pressed", "false");
      scale = clampZoom(scale - 0.1);
      apply();
    });

    window.addEventListener("resize", function () {
      if (mode === "fit") { scale = fitScale(); apply(); }
      else apply();
    });

    // start fitted
    setMode("fit");
  }

  /* ---------- print ---------- */
  var btnPrint = document.getElementById("btn-print");
  if (btnPrint) {
    btnPrint.addEventListener("click", function () {
      toast("Opening print dialog…");
      setTimeout(function () { window.print(); }, 300);
    });
  }
})();
