(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileMenu.hidden = open;
    });
    mobileMenu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        mobileMenu.hidden = true;
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Portfolio chart ---------- */
  var W = 560, H = 220, PAD = 14;
  var linePath = document.getElementById("linePath");
  var areaPath = document.getElementById("areaPath");
  var dot = document.getElementById("dot");
  var grid = document.getElementById("gridLines");
  var tip = document.getElementById("chartTip");
  var svg = document.getElementById("heroChart");

  // Seeded pseudo-random walk -> deterministic, realistic monthly values
  function buildSeries(months, start, drift, vol, seed) {
    var v = start, out = [], s = seed;
    for (var i = 0; i < months; i++) {
      s = (s * 9301 + 49297) % 233280;
      var rnd = s / 233280 - 0.5;
      v = v * (1 + drift + rnd * vol);
      out.push(v);
    }
    return out;
  }

  var series = buildSeries(12, 1050000, 0.018, 0.05, 7);
  // force the last point to be the displayed value
  series[series.length - 1] = 1284930.42;

  var labels = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];

  function buildGrid() {
    if (!grid) return;
    grid.innerHTML = "";
    for (var i = 1; i <= 3; i++) {
      var y = (H / 4) * i;
      var ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("x1", "0"); ln.setAttribute("x2", String(W));
      ln.setAttribute("y1", String(y)); ln.setAttribute("y2", String(y));
      grid.appendChild(ln);
    }
  }

  var points = [];
  function computePoints(data) {
    var min = Math.min.apply(null, data);
    var max = Math.max.apply(null, data);
    var range = max - min || 1;
    points = data.map(function (val, i) {
      var x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
      var y = PAD + (1 - (val - min) / range) * (H - PAD * 2);
      return { x: x, y: y, val: val, label: labels[i] };
    });
  }

  function lineD(pts) {
    return pts.map(function (p, i) {
      return (i === 0 ? "M" : "L") + p.x.toFixed(1) + " " + p.y.toFixed(1);
    }).join(" ");
  }

  function drawChart(animate) {
    buildGrid();
    computePoints(series);
    var d = lineD(points);
    linePath.setAttribute("d", d);
    areaPath.setAttribute("d", d + " L" + points[points.length - 1].x.toFixed(1) + " " + H + " L" + points[0].x.toFixed(1) + " " + H + " Z");
    var last = points[points.length - 1];
    dot.setAttribute("cx", last.x); dot.setAttribute("cy", last.y);

    if (animate) {
      var len = linePath.getTotalLength();
      linePath.style.transition = "none";
      linePath.style.strokeDasharray = len;
      linePath.style.strokeDashoffset = len;
      areaPath.style.opacity = "0";
      // force reflow
      linePath.getBoundingClientRect();
      linePath.style.transition = "stroke-dashoffset 1.5s ease";
      areaPath.style.transition = "opacity 1.1s ease 0.4s";
      linePath.style.strokeDashoffset = "0";
      areaPath.style.opacity = "1";
    }
  }

  // Tooltip / hover on chart
  if (svg && tip) {
    svg.addEventListener("mousemove", function (e) {
      var rect = svg.getBoundingClientRect();
      var px = ((e.clientX - rect.left) / rect.width) * W;
      var nearest = points[0], best = Infinity;
      points.forEach(function (p) {
        var dx = Math.abs(p.x - px);
        if (dx < best) { best = dx; nearest = p; }
      });
      dot.setAttribute("cx", nearest.x);
      dot.setAttribute("cy", nearest.y);
      tip.hidden = false;
      tip.style.left = (nearest.x / W) * rect.width + "px";
      tip.style.top = (nearest.y / H) * rect.height + "px";
      tip.textContent = nearest.label + " · $" + Math.round(nearest.val).toLocaleString("en-US");
    });
    svg.addEventListener("mouseleave", function () {
      tip.hidden = true;
      drawChart(false);
    });
  }

  drawChart(true);

  /* ---------- Hero value count-up ---------- */
  var heroValue = document.getElementById("heroValue");
  function animateValue() {
    if (!heroValue) return;
    var target = 1284930.42;
    var start = performance.now();
    var dur = 1400;
    function frame(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var cur = target * eased;
      var whole = Math.floor(cur);
      var cents = Math.round((cur - whole) * 100);
      heroValue.innerHTML = "$" + whole.toLocaleString("en-US") +
        '<span class="cents">.' + String(cents).padStart(2, "0") + "</span>";
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // leave static markup
  } else {
    animateValue();
  }

  /* ---------- Performance range toggle ---------- */
  var rangeData = {
    "1Y": { ret: "+11.2%", growth: "$111,200" },
    "5Y": { ret: "+9.4%", growth: "$156,720" },
    "10Y": { ret: "+8.7%", growth: "$230,180" }
  };
  var statReturn = document.getElementById("statReturn");
  var statGrowth = document.getElementById("statGrowth");
  var rangeBtns = document.querySelectorAll(".range-btn");
  rangeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      rangeBtns.forEach(function (b) { b.classList.remove("active"); b.removeAttribute("aria-selected"); });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      var d = rangeData[btn.dataset.range];
      if (d && statReturn && statGrowth) {
        statReturn.textContent = d.ret;
        statGrowth.textContent = d.growth;
      }
    });
  });

  /* ---------- CTA form ---------- */
  var form = document.getElementById("ctaForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("ctaEmail");
      var val = (input.value || "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!valid) {
        input.classList.add("invalid");
        input.focus();
        toast("Please enter a valid email address.");
        return;
      }
      input.classList.remove("invalid");
      input.value = "";
      toast("Thanks — your invite to Meridian is on its way.");
    });
    document.getElementById("ctaEmail").addEventListener("input", function () {
      this.classList.remove("invalid");
    });
  }

  /* ---------- CTA on solid/ghost demo buttons ---------- */
  document.querySelectorAll('a[href="#cta"]').forEach(function (a) {
    if (a.closest(".cta-form") || a.closest(".mobile-menu")) return;
    a.addEventListener("click", function () {
      var label = a.textContent.trim();
      if (/open account|get started|sign in/i.test(label)) {
        setTimeout(function () { toast("Demo only — account opening is not available."); }, 350);
      }
    });
  });

  document.querySelectorAll(".plan .btn").forEach(function (b) {
    b.addEventListener("click", function (e) {
      var plan = b.closest(".plan").querySelector(".plan-name").textContent;
      toast("Selected the " + plan + " plan (demo).");
    });
  });
})();
