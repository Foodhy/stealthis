(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- per-figure citation metadata ---------- */
  var FIG_META = {
    "fig-1": {
      n: "1",
      title: "Rarefied taxonomic richness vs. excavation depth",
      cite:
        "Marwick, B. & Okonkwo, A. (2026). Figure 1: Rarefied taxonomic richness vs. excavation depth. " +
        "Deepening-time signals in two Late Holocene assemblages. arXiv:2606.04417v2. DOI:10.5281/zenodo.10492.",
    },
    "fig-2": {
      n: "2",
      title: "Mean δ¹³C by stratigraphic unit",
      cite:
        "Marwick, B. & Okonkwo, A. (2026). Figure 2: Mean δ¹³C by stratigraphic unit. " +
        "arXiv:2606.04417v2. DOI:10.5281/zenodo.10492.",
    },
    "fig-3": {
      n: "3",
      title: "Proxy correlation matrix (core QD-07)",
      cite:
        "Marwick, B. & Okonkwo, A. (2026). Figure 3: Pairwise Pearson correlation matrix, core QD-07. " +
        "arXiv:2606.04417v2. DOI:10.5281/zenodo.10492.",
    },
    "fig-4": {
      n: "4",
      title: "QD-07 multiproxy summary (a–c)",
      cite:
        "Marwick, B. & Okonkwo, A. (2026). Figure 4: Multiproxy summary of the QD-07 record (a–c). " +
        "arXiv:2606.04417v2. DOI:10.5281/zenodo.10492.",
    },
  };

  /* ---------- build Figure 3 heatmap ---------- */
  (function buildHeatmap() {
    var g = document.getElementById("heatCells");
    if (!g) return;
    var labels = ["Pol", "Chr", "MS", "GS", "LOI", "δ¹⁸O"];
    var n = labels.length;
    var cell = 36;
    var svgNS = "http://www.w3.org/2000/svg";
    // deterministic pseudo-correlation matrix (symmetric, diag = 1)
    var seed = function (i, j) {
      var v = Math.sin((i + 1) * 12.9898 + (j + 1) * 78.233) * 43758.5453;
      return v - Math.floor(v); // 0..1
    };
    function colorFor(r) {
      // r in [-1,1] -> diverging blue (neg) to red (pos)
      var t = (r + 1) / 2;
      if (t < 0.5) {
        var k = t / 0.5;
        return mix([18, 58, 102], [233, 240, 249], k);
      }
      var k2 = (t - 0.5) / 0.5;
      return mix([233, 240, 249], [207, 69, 56], k2);
    }
    function mix(a, b, t) {
      return (
        "rgb(" +
        Math.round(a[0] + (b[0] - a[0]) * t) +
        "," +
        Math.round(a[1] + (b[1] - a[1]) * t) +
        "," +
        Math.round(a[2] + (b[2] - a[2]) * t) +
        ")"
      );
    }
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
        var r = i === j ? 1 : (seed(Math.min(i, j), Math.max(i, j)) * 2 - 1) * 0.9;
        r = Math.round(r * 100) / 100;
        var rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", j * cell);
        rect.setAttribute("y", i * cell);
        rect.setAttribute("width", cell);
        rect.setAttribute("height", cell);
        rect.setAttribute("class", "heat-cell");
        rect.setAttribute("fill", colorFor(r));
        var tt = document.createElementNS(svgNS, "title");
        tt.textContent = labels[i] + " × " + labels[j] + ": r = " + r.toFixed(2);
        rect.appendChild(tt);
        g.appendChild(rect);
      }
    }
    // axis labels
    for (var a = 0; a < n; a++) {
      var tx = document.createElementNS(svgNS, "text");
      tx.setAttribute("x", a * cell + cell / 2);
      tx.setAttribute("y", n * cell + 14);
      tx.setAttribute("class", "tick xtick");
      tx.setAttribute("text-anchor", "middle");
      tx.setAttribute("font-size", "10");
      tx.setAttribute("fill", "#697892");
      tx.setAttribute("font-family", "JetBrains Mono, monospace");
      tx.textContent = labels[a];
      g.appendChild(tx);

      var ty = document.createElementNS(svgNS, "text");
      ty.setAttribute("x", -8);
      ty.setAttribute("y", a * cell + cell / 2 + 3);
      ty.setAttribute("text-anchor", "end");
      ty.setAttribute("font-size", "10");
      ty.setAttribute("fill", "#697892");
      ty.setAttribute("font-family", "JetBrains Mono, monospace");
      ty.textContent = labels[a];
      g.appendChild(ty);
    }
  })();

  /* ---------- lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbStage = document.getElementById("lbStage");
  var lbCap = document.getElementById("lbCap");
  var lbTitle = document.getElementById("lbTitle");
  var lbClose = document.getElementById("lbClose");
  var lastFocused = null;

  function openLightbox(fig) {
    var id = fig.getAttribute("data-fig-id");
    var meta = FIG_META[id] || { n: "?", title: "Figure" };
    var canvas = fig.querySelector(".fig-canvas");
    var caption = fig.querySelector("figcaption");
    lbStage.innerHTML = "";
    if (canvas) lbStage.appendChild(canvas.cloneNode(true));
    lbCap.innerHTML = caption ? caption.innerHTML : "";
    lbTitle.textContent = "Figure " + meta.n + " — " + meta.title;
    lastFocused = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
    lbStage.innerHTML = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lb.hidden) closeLightbox();
  });

  /* ---------- download figure as standalone SVG ---------- */
  function downloadFigure(fig) {
    var svg = fig.querySelector("svg.chart");
    var id = fig.getAttribute("data-fig-id");
    var meta = FIG_META[id] || { n: "x" };
    if (!svg) {
      // multi-panel: grab the first svg as a representative export
      svg = fig.querySelector("svg");
    }
    if (!svg) {
      toast("No vector graphic to export");
      return;
    }
    var clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var src =
      '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
    var blob = new Blob([src], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "figure-" + meta.n + ".svg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
    toast("Downloaded figure-" + meta.n + ".svg");
  }

  /* ---------- copy citation ---------- */
  function copyCitation(fig) {
    var id = fig.getAttribute("data-fig-id");
    var meta = FIG_META[id];
    if (!meta) return;
    var text = meta.cite;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          toast("Citation copied to clipboard");
        },
        function () {
          fallbackCopy(text);
        }
      );
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      toast("Citation copied to clipboard");
    } catch (e) {
      toast("Copy failed — select manually");
    }
    ta.remove();
  }

  /* ---------- delegate toolbar clicks ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".tb-btn") : null;
    if (!btn) return;
    var fig = btn.closest(".fig");
    if (!fig) return;
    var act = btn.getAttribute("data-act");
    if (act === "expand") openLightbox(fig);
    else if (act === "cite") copyCitation(fig);
    else if (act === "download") downloadFigure(fig);
  });
})();
