(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- seeded deterministic data ---------- */
  // tiny mulberry32 PRNG so the figure renders identically every load
  function rng(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Modified Eppley curve: P = P0 * exp(k * (T - T0)), with noise + CI
  function buildSeries(label, color, p0, k, seed) {
    var rand = rng(seed);
    var T0 = 4;
    var pts = [];
    for (var T = 0; T <= 18; T += 2) {
      var mean = p0 * Math.exp(k * (T - T0));
      // multiplicative noise so means stay positive
      var noise = 1 + (rand() - 0.5) * 0.22;
      var y = mean * noise;
      var ci = y * (0.08 + rand() * 0.12); // half-width of 95% CI
      pts.push({ x: T, y: Math.max(1, y), ci: ci });
    }
    return { label: label, color: color, points: pts, visible: true };
  }

  var series = [
    buildSeries("S-12 Drake Passage", "var(--s1)", 95, 0.135, 1337),
    buildSeries("S-07 Weddell Gyre", "var(--s2)", 60, 0.165, 8042),
    buildSeries("S-21 Kerguelen Plateau", "var(--s3)", 140, 0.092, 5519)
  ];

  /* ---------- plot geometry ---------- */
  var W = 720,
    H = 440;
  var M = { top: 24, right: 22, bottom: 56, left: 64 };
  var iw = W - M.left - M.right;
  var ih = H - M.top - M.bottom;

  var xDomain = [0, 18]; // temperature °C

  var state = {
    scale: "linear",
    errorBars: true,
    markers: true
  };

  var svg = document.getElementById("plot");
  var legendEl = document.getElementById("legend");
  var tooltip = document.getElementById("tooltip");
  var stage = svg.parentNode;

  function el(name, attrs) {
    var e = document.createElementNS(SVGNS, name);
    if (attrs) {
      for (var k in attrs) e.setAttribute(k, attrs[k]);
    }
    return e;
  }

  /* ---------- scales ---------- */
  function yExtent() {
    var max = 0,
      min = Infinity;
    series.forEach(function (s) {
      if (!s.visible) return;
      s.points.forEach(function (p) {
        max = Math.max(max, p.y + p.ci);
        min = Math.min(min, Math.max(1, p.y - p.ci));
      });
    });
    if (max === 0) {
      max = 100;
      min = 1;
    }
    return [min, max];
  }

  function xScale(v) {
    return M.left + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * iw;
  }

  function makeYScale() {
    var ext = yExtent();
    if (state.scale === "log") {
      var lo = Math.log10(Math.max(1, ext[0]));
      var hi = Math.log10(ext[1] * 1.05);
      lo = Math.floor(lo);
      hi = Math.ceil(hi);
      return {
        fn: function (v) {
          var lv = Math.log10(Math.max(1, v));
          return M.top + ih - ((lv - lo) / (hi - lo)) * ih;
        },
        ticks: (function () {
          var t = [];
          for (var e = lo; e <= hi; e++) t.push(Math.pow(10, e));
          return t;
        })(),
        fmt: function (v) {
          return v >= 1000 ? v / 1000 + "k" : "" + v;
        }
      };
    }
    var top = Math.ceil((ext[1] * 1.08) / 50) * 50;
    var bottom = 0;
    var ticks = [];
    var step = top / 5;
    for (var i = 0; i <= 5; i++) ticks.push(bottom + step * i);
    return {
      fn: function (v) {
        return M.top + ih - ((v - bottom) / (top - bottom)) * ih;
      },
      ticks: ticks,
      fmt: function (v) {
        return v >= 1000 ? (v / 1000).toFixed(1) + "k" : Math.round(v);
      }
    };
  }

  /* ---------- render ---------- */
  function render() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var y = makeYScale();

    // gridlines + y ticks
    y.ticks.forEach(function (tv) {
      var yy = y.fn(tv);
      svg.appendChild(
        el("line", {
          class: "grid-line",
          x1: M.left,
          x2: M.left + iw,
          y1: yy,
          y2: yy
        })
      );
      var lbl = el("text", {
        class: "tick-label",
        x: M.left - 10,
        y: yy + 3.5,
        "text-anchor": "end"
      });
      lbl.textContent = y.fmt(tv);
      svg.appendChild(lbl);
    });

    // x ticks (every 2 °C)
    for (var xv = xDomain[0]; xv <= xDomain[1]; xv += 2) {
      var xx = xScale(xv);
      svg.appendChild(
        el("line", {
          class: "grid-line minor",
          x1: xx,
          x2: xx,
          y1: M.top,
          y2: M.top + ih
        })
      );
      var xl = el("text", {
        class: "tick-label",
        x: xx,
        y: M.top + ih + 20,
        "text-anchor": "middle"
      });
      xl.textContent = xv;
      svg.appendChild(xl);
    }

    // axes
    svg.appendChild(
      el("line", { class: "axis-line", x1: M.left, x2: M.left, y1: M.top, y2: M.top + ih })
    );
    svg.appendChild(
      el("line", {
        class: "axis-line",
        x1: M.left,
        x2: M.left + iw,
        y1: M.top + ih,
        y2: M.top + ih
      })
    );

    // axis titles
    var xt = el("text", {
      class: "axis-title",
      x: M.left + iw / 2,
      y: H - 12,
      "text-anchor": "middle"
    });
    xt.textContent = "Sea-surface temperature  (°C)";
    svg.appendChild(xt);

    var yt = el("text", {
      class: "axis-title",
      x: 16,
      y: M.top + ih / 2,
      "text-anchor": "middle",
      transform: "rotate(-90 16 " + (M.top + ih / 2) + ")"
    });
    yt.textContent =
      "NPP  (mg C m⁻² d⁻¹" + (state.scale === "log" ? ", log₁₀" : "") + ")";
    svg.appendChild(yt);

    // series
    series.forEach(function (s, si) {
      var g = el("g", { class: "fade-soft" });
      g.setAttribute("data-series", si);
      if (!s.visible) g.classList.add("series-hidden");

      // line path
      var d = "";
      s.points.forEach(function (p, i) {
        d += (i === 0 ? "M" : "L") + xScale(p.x) + " " + y.fn(p.y) + " ";
      });
      var path = el("path", { class: "series-line", d: d, stroke: s.color });
      g.appendChild(path);

      // error bars
      s.points.forEach(function (p) {
        var px = xScale(p.x);
        var yTop = y.fn(p.y + p.ci);
        var yBot = y.fn(Math.max(1, p.y - p.ci));
        var bar = el("g", { class: "err-bar-group" });
        bar.style.display = state.errorBars ? "" : "none";
        bar.classList.add("err-bar-wrap");
        bar.appendChild(
          el("line", { class: "err-bar", x1: px, x2: px, y1: yTop, y2: yBot, stroke: s.color })
        );
        bar.appendChild(
          el("line", { class: "err-bar", x1: px - 4, x2: px + 4, y1: yTop, y2: yTop, stroke: s.color })
        );
        bar.appendChild(
          el("line", { class: "err-bar", x1: px - 4, x2: px + 4, y1: yBot, y2: yBot, stroke: s.color })
        );
        g.appendChild(bar);
      });

      // markers
      s.points.forEach(function (p) {
        var dot = el("circle", {
          class: "series-dot",
          cx: xScale(p.x),
          cy: y.fn(p.y),
          r: 4,
          fill: "#fff",
          stroke: s.color,
          "stroke-width": 2
        });
        dot.style.display = state.markers ? "" : "none";
        dot.setAttribute("tabindex", "0");
        dot.setAttribute(
          "aria-label",
          s.label + ": " + p.x + " °C, NPP " + p.y.toFixed(1) + " ± " + p.ci.toFixed(1)
        );
        dot.addEventListener("mouseenter", function (ev) {
          showTip(ev, s, p);
        });
        dot.addEventListener("focus", function (ev) {
          showTip(ev, s, p);
        });
        dot.addEventListener("mouseleave", hideTip);
        dot.addEventListener("blur", hideTip);
        g.appendChild(dot);
      });

      svg.appendChild(g);
    });
  }

  /* ---------- tooltip ---------- */
  function resolveColor(c) {
    if (c.indexOf("var(") !== 0) return c;
    var name = c.slice(4, -1).trim();
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#1a4f8a";
  }

  function showTip(ev, s, p) {
    var rect = stage.getBoundingClientRect();
    var dot = ev.target;
    var dr = dot.getBoundingClientRect();
    var col = resolveColor(s.color);
    tooltip.innerHTML =
      '<div class="tt-head"><span class="tt-dot" style="background:' +
      col +
      '"></span>' +
      s.label +
      "</div>" +
      '<div class="tt-row"><span>T =</span> ' +
      p.x.toFixed(1) +
      " °C</div>" +
      '<div class="tt-row"><span>NPP =</span> ' +
      p.y.toFixed(1) +
      " mg C m⁻² d⁻¹</div>" +
      '<div class="tt-row"><span>95% CI</span> ±' +
      p.ci.toFixed(1) +
      "</div>";
    tooltip.hidden = false;
    var cx = dr.left - rect.left + dr.width / 2;
    var cy = dr.top - rect.top + dr.height / 2;
    tooltip.style.left = cx + "px";
    tooltip.style.top = cy + "px";
  }

  function hideTip() {
    tooltip.hidden = true;
  }

  /* ---------- legend ---------- */
  function buildLegend() {
    legendEl.innerHTML = "";
    series.forEach(function (s, si) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "legend-btn";
      btn.setAttribute("aria-pressed", s.visible ? "true" : "false");
      btn.innerHTML =
        '<span class="legend-swatch" style="background:' +
        resolveColor(s.color) +
        '"></span>' +
        s.label;
      btn.addEventListener("click", function () {
        s.visible = !s.visible;
        btn.setAttribute("aria-pressed", s.visible ? "true" : "false");
        var visCount = series.filter(function (x) {
          return x.visible;
        }).length;
        if (visCount === 0) {
          // never allow an empty plot
          s.visible = true;
          btn.setAttribute("aria-pressed", "true");
          toast("At least one station must stay visible");
          return;
        }
        hideTip();
        render();
        toast((s.visible ? "Showing " : "Hidden ") + s.label);
      });
      li.appendChild(btn);
      legendEl.appendChild(li);
    });
  }

  /* ---------- controls ---------- */
  var scaleBtns = document.querySelectorAll(".seg-btn");
  scaleBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.classList.contains("is-active")) return;
      scaleBtns.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-pressed", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-pressed", "true");
      state.scale = b.getAttribute("data-scale");
      hideTip();
      render();
      toast("Y-axis: " + (state.scale === "log" ? "log₁₀ scale" : "linear scale"));
    });
  });

  var errToggle = document.getElementById("errToggle");
  errToggle.addEventListener("change", function () {
    state.errorBars = errToggle.checked;
    render();
  });

  var ptToggle = document.getElementById("ptToggle");
  ptToggle.addEventListener("change", function () {
    state.markers = ptToggle.checked;
    render();
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    state.scale = "linear";
    state.errorBars = true;
    state.markers = true;
    series.forEach(function (s) {
      s.visible = true;
    });
    errToggle.checked = true;
    ptToggle.checked = true;
    scaleBtns.forEach(function (x) {
      var on = x.getAttribute("data-scale") === "linear";
      x.classList.toggle("is-active", on);
      x.setAttribute("aria-pressed", on ? "true" : "false");
    });
    buildLegend();
    hideTip();
    render();
    toast("View reset");
  });

  /* ---------- init ---------- */
  buildLegend();
  render();
})();
