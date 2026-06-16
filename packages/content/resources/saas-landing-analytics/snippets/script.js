(function () {
  "use strict";
  var prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- theme toggle ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeBtn");
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    themeBtn.setAttribute("aria-pressed", String(t === "light"));
    var lbl = themeBtn.querySelector(".theme-lbl");
    if (lbl) lbl.textContent = t === "light" ? "Dark" : "Light";
  }
  var stored = null;
  try { stored = localStorage.getItem("lumen-theme"); } catch (e) {}
  if (!stored) stored = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  applyTheme(stored);
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem("lumen-theme", next); } catch (e) {}
  });

  /* ---------- mobile nav ---------- */
  var hamb = document.getElementById("hamb");
  var mobnav = document.getElementById("mobnav");
  hamb.addEventListener("click", function () {
    var open = hamb.getAttribute("aria-expanded") === "true";
    hamb.setAttribute("aria-expanded", String(!open));
    if (open) { mobnav.hidden = true; } else { mobnav.hidden = false; }
  });
  mobnav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      mobnav.hidden = true;
      hamb.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- count-up KPIs ---------- */
  function fmt(n) { return n.toLocaleString("en-US"); }
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var div = parseFloat(el.getAttribute("data-div")) || 1;
    if (prefersReduce) { el.textContent = prefix + fmt(target / div) + suffix; return; }
    var start = performance.now(), dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased) / div;
      el.textContent = prefix + fmt(div === 1 ? Math.round(val) : Math.round(val * 10) / 10) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var kpiSeen = false;
  var heroApp = document.querySelector(".hero-app");
  if ("IntersectionObserver" in window && heroApp) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !kpiSeen) {
          kpiSeen = true;
          document.querySelectorAll(".kpi-v[data-count]").forEach(countUp);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(heroApp);
  } else {
    document.querySelectorAll(".kpi-v[data-count]").forEach(countUp);
  }

  /* ---------- hero view tabs (revenue / usage / funnel) ---------- */
  var vtabs = Array.prototype.slice.call(document.querySelectorAll(".vtab"));
  var barsDrawn = false;
  function drawBars() {
    if (barsDrawn) return; barsDrawn = true;
    var svg = document.querySelector(".chart.bars");
    if (!svg) return;
    var vals = [62, 48, 70, 55, 83, 74, 91, 68, 96, 80, 88, 72, 99, 84];
    var w = 520, gap = 6, n = vals.length, bw = (w - gap * (n - 1)) / n;
    var ns = "http://www.w3.org/2000/svg";
    vals.forEach(function (v, i) {
      var h = (v / 100) * 150;
      var r = document.createElementNS(ns, "rect");
      r.setAttribute("x", (i * (bw + gap)).toFixed(1));
      r.setAttribute("width", bw.toFixed(1));
      r.setAttribute("y", 200);
      r.setAttribute("height", 0);
      r.setAttribute("rx", 3);
      r.setAttribute("fill", i % 2 ? "#5eead4" : "#818cf8");
      svg.appendChild(r);
      if (prefersReduce) {
        r.setAttribute("y", (200 - h).toFixed(1)); r.setAttribute("height", h.toFixed(1));
      } else {
        setTimeout(function () {
          r.style.transition = "y .5s ease, height .5s ease";
          r.setAttribute("y", (200 - h).toFixed(1)); r.setAttribute("height", h.toFixed(1));
        }, 40 + i * 35);
      }
    });
  }
  function setView(view) {
    vtabs.forEach(function (t) {
      var on = t.getAttribute("data-view") === view;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
    });
    document.querySelectorAll(".panel[data-panel]").forEach(function (p) {
      p.hidden = p.getAttribute("data-panel") !== view;
    });
    if (view === "usage") drawBars();
  }
  vtabs.forEach(function (t, i) {
    t.addEventListener("click", function () { setView(t.getAttribute("data-view")); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var dir = e.key === "ArrowRight" ? 1 : -1;
      var next = vtabs[(i + dir + vtabs.length) % vtabs.length];
      next.focus(); next.click();
    });
  });

  /* ---------- live metric ticker ---------- */
  var tickerEl = document.getElementById("ticker");
  var metrics = [
    { l: "Queries / min", v: 18420, fluct: 600 },
    { l: "p95 latency", v: 240, suf: " ms", fluct: 30, warn: true },
    { l: "Rows scanned", v: 1240, suf: "M", fluct: 80 },
    { l: "Active pipelines", v: 312, fluct: 4 },
    { l: "Cache hit", v: 94, suf: "%", fluct: 2 },
    { l: "Events ingested", v: 7860, suf: "K", fluct: 200 },
    { l: "Dashboards live", v: 1480, fluct: 6 },
    { l: "Alerts open", v: 3, fluct: 2, warn: true }
  ];
  var tickState = metrics.map(function (m) { return m.v; });
  function renderTicker() {
    var html = "";
    function block() {
      metrics.forEach(function (m, i) {
        var val = tickState[i];
        var str = (m.suf === "M" || m.suf === "K") ? (val / 1).toLocaleString("en-US") : val.toLocaleString("en-US");
        html += '<span class="tick' + (m.warn ? " warn" : "") + '"><span class="tdot"></span>' +
          m.l + ' <b>' + str + (m.suf || "") + '</b></span>';
      });
    }
    block(); block(); // duplicate for seamless scroll
    tickerEl.innerHTML = html;
  }
  renderTicker();
  if (!prefersReduce) {
    setInterval(function () {
      tickState = metrics.map(function (m, i) {
        var delta = Math.round((Math.random() - 0.45) * m.fluct);
        var nv = Math.max(m.suf === "%" ? 80 : 1, tickState[i] + delta);
        if (m.suf === "%") nv = Math.min(nv, 100);
        return nv;
      });
      renderTicker();
    }, 2400);
  }

  /* ---------- big dashboard stage (finance / growth / ops) ---------- */
  var stage = document.getElementById("dashStage");
  var dtabs = Array.prototype.slice.call(document.querySelectorAll(".dtab"));
  var dashData = {
    finance: {
      big: { h: "Net revenue", tag: "QTD", v: "$4.82M", sub: "+14.2% vs last quarter" },
      spark: [40, 44, 41, 50, 48, 58, 55, 66, 63, 74, 80, 92],
      bars: [55, 62, 48, 70, 66, 84, 90],
      rows: [
        { nm: "Enterprise", vl: "$2.10M", pill: "ok", pt: "+9%" },
        { nm: "Mid-market", vl: "$1.46M", pill: "ok", pt: "+22%" },
        { nm: "Self-serve", vl: "$0.71M", pill: "warn", pt: "-3%" },
        { nm: "Expansion", vl: "$0.55M", pill: "ok", pt: "+18%" }
      ]
    },
    growth: {
      big: { h: "Activated users", tag: "30d", v: "38,420", sub: "+6.1% week over week" },
      spark: [30, 38, 35, 44, 52, 49, 60, 58, 70, 68, 82, 88],
      bars: [40, 52, 60, 58, 72, 80, 95],
      rows: [
        { nm: "Signups", vl: "24,800", pill: "ok", pt: "+12%" },
        { nm: "Connected source", vl: "17,608", pill: "ok", pt: "+8%" },
        { nm: "First query", vl: "12,896", pill: "ok", pt: "+5%" },
        { nm: "Shared board", vl: "8,432", pill: "warn", pt: "+1%" }
      ]
    },
    ops: {
      big: { h: "Pipeline health", tag: "now", v: "99.97%", sub: "312 of 312 pipelines green" },
      spark: [90, 92, 88, 95, 96, 94, 98, 97, 99, 98, 99, 100],
      bars: [88, 92, 95, 90, 97, 99, 96],
      rows: [
        { nm: "Warehouse sync", vl: "120 ms", pill: "ok", pt: "healthy" },
        { nm: "Kafka stream", vl: "38 ms", pill: "ok", pt: "healthy" },
        { nm: "S3 backfill", vl: "running", pill: "warn", pt: "62%" },
        { nm: "Alerting", vl: "0 open", pill: "ok", pt: "clear" }
      ]
    }
  };
  function sparkPath(vals) {
    var w = 320, h = 64, max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
    var span = max - min || 1;
    var pts = vals.map(function (v, i) {
      var x = (i / (vals.length - 1)) * w;
      var y = h - 6 - ((v - min) / span) * (h - 12);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    return "M" + pts.join(" L");
  }
  function renderDash(key) {
    var d = dashData[key];
    var line = sparkPath(d.spark);
    var fillD = line + " L320,64 L0,64 Z";
    var bars = d.bars.map(function (b) { return '<span class="b" style="height:' + b + '%"></span>'; }).join("");
    var rows = d.rows.map(function (r) {
      return '<div class="rowi"><span class="nm">' + r.nm + '</span>' +
        '<span style="display:flex;gap:10px;align-items:center"><span class="vl">' + r.vl + '</span>' +
        '<span class="pill ' + r.pill + '">' + r.pt + '</span></span></div>';
    }).join("");
    stage.innerHTML =
      '<div class="stage-grid">' +
        '<div class="card big">' +
          '<h4>' + d.big.h + ' <span class="tag">' + d.big.tag + '</span></h4>' +
          '<div class="metric-big">' + d.big.v + '</div>' +
          '<div class="metric-sub">' + d.big.sub + '</div>' +
          '<svg class="spark" viewBox="0 0 320 64" preserveAspectRatio="none" aria-hidden="true">' +
            '<defs><linearGradient id="sf" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#5eead4" stop-opacity=".35"/><stop offset="1" stop-color="#5eead4" stop-opacity="0"/>' +
            '</linearGradient></defs>' +
            '<path d="' + fillD + '" fill="url(#sf)" stroke="none"/>' +
            '<path d="' + line + '"/>' +
          '</svg>' +
        '</div>' +
        '<div class="card"><h4>Weekly trend</h4><div class="barcol">' + bars + '</div></div>' +
        '<div class="card"><h4>Breakdown</h4><div class="rows">' + rows + '</div></div>' +
      '</div>';
  }
  function setDash(key) {
    dtabs.forEach(function (t) {
      var on = t.getAttribute("data-dash") === key;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
    });
    renderDash(key);
  }
  dtabs.forEach(function (t, i) {
    t.addEventListener("click", function () { setDash(t.getAttribute("data-dash")); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var dir = e.key === "ArrowRight" ? 1 : -1;
      var next = dtabs[(i + dir + dtabs.length) % dtabs.length];
      next.focus(); next.click();
    });
  });
  setDash("finance");

  /* ---------- CTA form ---------- */
  var form = document.getElementById("ctaForm");
  var email = document.getElementById("email");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!ok) {
      email.classList.add("bad");
      email.focus();
      toast("Enter a valid work email");
      return;
    }
    email.classList.remove("bad");
    toast("Thanks — we'll reach out to schedule your demo");
    form.reset();
  });
  email.addEventListener("input", function () { email.classList.remove("bad"); });
})();
