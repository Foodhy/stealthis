(function () {
  "use strict";

  /* ---- Toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Animated count-up stats ---- */
  function formatNum(n, suffix) {
    var rounded = Math.round(n);
    var out;
    if (rounded >= 1000) {
      out = rounded.toLocaleString("en-US");
    } else {
      out = String(rounded);
    }
    return out + (suffix || "");
  }

  function animateStat(el) {
    var numEl = el.querySelector(".stat-num");
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      numEl.textContent = formatNum(target, suffix);
      return;
    }
    var dur = 1500;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      numEl.textContent = formatNum(target * eased, suffix);
      if (p < 1) requestAnimationFrame(tick);
      else numEl.textContent = formatNum(target, suffix);
    }
    requestAnimationFrame(tick);
  }

  var statsRun = false;
  var statGrid = document.getElementById("statGrid");
  if (statGrid && "IntersectionObserver" in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !statsRun) {
          statsRun = true;
          statGrid.querySelectorAll(".stat").forEach(animateStat);
          statObs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statObs.observe(statGrid);
  } else if (statGrid) {
    statGrid.querySelectorAll(".stat").forEach(animateStat);
  }

  /* ---- Section reveal for program blocks ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 });
    reveals.forEach(function (r) { revObs.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* ---- Thermometer fill when in view ---- */
  var thermos = document.querySelectorAll(".thermo");
  function fillThermo(t) {
    var pct = Math.max(0, Math.min(100, parseFloat(t.getAttribute("data-pct")) || 0));
    var fill = t.querySelector(".thermo-fill");
    if (fill) fill.style.width = pct + "%";
  }
  if ("IntersectionObserver" in window) {
    var tObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          fillThermo(e.target);
          tObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    thermos.forEach(function (t) { tObs.observe(t); });
  } else {
    thermos.forEach(fillThermo);
  }

  /* ---- Donut + legend hover linkage ---- */
  var donut = document.getElementById("donut");
  var donutPct = document.getElementById("donutPct");
  var donutCap = document.getElementById("donutCap");
  var legend = document.getElementById("legend");

  // [color, startDeg, endDeg, pct, label]
  var slices = [
    ["var(--brand)", 0, 136.8, "38%", "Clean water programs"],
    ["var(--accent)", 136.8, 234, "27%", "Food & nutrition"],
    ["#5ba6c4", 234, 309.6, "21%", "Education & schools"],
    ["#c79a3b", 309.6, 334.8, "7%", "Healthcare outreach"],
    ["#9b8f7e", 334.8, 349.2, "4%", "Administration"],
    ["#cdbfa9", 349.2, 360, "3%", "Fundraising"]
  ];

  var baseGradient = donut ? getComputedStyle(donut).background : "";

  function highlightSlice(i) {
    if (!donut) return;
    var stops = slices.map(function (s, idx) {
      var col = s[0];
      // dim non-selected slices
      if (i !== null && idx !== i) {
        col = "color-mix(in srgb, " + s[0] + " 32%, var(--bg))";
      }
      return col + " " + s[1] + "deg " + s[2] + "deg";
    });
    donut.style.background = "conic-gradient(" + stops.join(", ") + ")";
    if (i === null) {
      donutPct.textContent = "100%";
      donutCap.textContent = "Total raised";
      donutPct.style.color = "";
    } else {
      donutPct.textContent = slices[i][3];
      donutCap.textContent = slices[i][4];
      donutPct.style.color = slices[i][0];
      donut.style.filter = "saturate(1.05)";
    }
  }

  function clearHighlight() {
    if (!donut) return;
    donut.style.background = "";
    donut.style.filter = "";
    highlightSlice(null);
    legend.querySelectorAll("li").forEach(function (li) { li.classList.remove("active"); });
  }

  if (legend && donut) {
    legend.querySelectorAll("li").forEach(function (li) {
      var idx = parseInt(li.getAttribute("data-slice"), 10);
      function activate() {
        legend.querySelectorAll("li").forEach(function (x) { x.classList.remove("active"); });
        li.classList.add("active");
        highlightSlice(idx);
      }
      li.addEventListener("mouseenter", activate);
      li.addEventListener("mouseleave", clearHighlight);
      li.addEventListener("focus", activate);
      li.addEventListener("blur", clearHighlight);
      // keyboard / tap toggle
      li.setAttribute("tabindex", "0");
      li.setAttribute("role", "button");
      li.addEventListener("click", function () {
        if (li.classList.contains("active")) clearHighlight();
        else activate();
      });
      li.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          li.click();
        }
      });
    });
  }

  /* ---- Buttons ---- */
  function bind(id, msg) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", function () { toast(msg); });
  }
  bind("donateTop", "💛 Demo only — no real donation processed. Thank you!");
  bind("donateHero", "💛 Demo only — no real donation processed. Thank you!");
  bind("donateCta", "💛 Monthly giving is a demo here — but the gratitude is real!");
  bind("downloadBtn", "📄 Generating 2025 Impact Report PDF… (demo)");

  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var data = {
        title: "Brightwell Foundation — 2025 Impact Report",
        text: "See the impact: 318,420 meals served, 74 wells built, 9,260 children in school.",
        url: location.href
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () {
          toast("🔗 Link copied to clipboard");
        }).catch(function () { toast("Share this report with a friend!"); });
      } else {
        toast("Share this report with a friend!");
      }
    });
  }
})();
