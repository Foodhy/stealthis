(function () {
  function pct(val, min, max) { return ((val - min) / (max - min)) * 100; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function pointerX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  /* ── Single slider ── */
  function initSingle(wrap) {
    var track = wrap.querySelector(".rs-track");
    var fill = wrap.querySelector(".rs-fill");
    var thumb = wrap.querySelector(".rs-thumb");
    var valEl = wrap.querySelector(".rs-value");
    var min = parseInt(thumb.getAttribute("aria-valuemin"));
    var max = parseInt(thumb.getAttribute("aria-valuemax"));
    var val = parseInt(thumb.getAttribute("aria-valuenow"));

    function update(v) {
      val = clamp(v, min, max);
      var p = pct(val, min, max);
      fill.style.left = "0%";
      fill.style.width = p + "%";
      thumb.style.left = p + "%";
      thumb.setAttribute("aria-valuenow", val);
      if (valEl) valEl.textContent = val;
    }

    function drag(e) {
      e.preventDefault();
      var rect = track.getBoundingClientRect();
      var ratio = (pointerX(e) - rect.left) / rect.width;
      update(Math.round(min + ratio * (max - min)));
    }

    thumb.addEventListener("mousedown", function (e) {
      e.preventDefault();
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", function up() {
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", up);
      });
    });
    thumb.addEventListener("touchstart", function (e) {
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("touchend", function up() {
        document.removeEventListener("touchmove", drag);
        document.removeEventListener("touchend", up);
      });
    });
    thumb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); update(val + 1); }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); update(val - 1); }
      if (e.key === "Home") update(min);
      if (e.key === "End") update(max);
    });

    update(val);
  }

  /* ── Dual slider ── */
  function initDual(wrap) {
    var track = wrap.querySelector(".rs-track");
    var fill = wrap.querySelector(".rs-fill");
    var thumbLo = wrap.querySelector(".rs-thumb--lo");
    var thumbHi = wrap.querySelector(".rs-thumb--hi");
    var loEl = wrap.querySelector(".rs-value-lo");
    var hiEl = wrap.querySelector(".rs-value-hi");
    var min = parseInt(thumbLo.getAttribute("aria-valuemin"));
    var max = parseInt(thumbLo.getAttribute("aria-valuemax"));
    var lo = parseInt(thumbLo.getAttribute("aria-valuenow"));
    var hi = parseInt(thumbHi.getAttribute("aria-valuenow"));

    function update() {
      var pLo = pct(lo, min, max);
      var pHi = pct(hi, min, max);
      fill.style.left = pLo + "%";
      fill.style.width = (pHi - pLo) + "%";
      thumbLo.style.left = pLo + "%";
      thumbHi.style.left = pHi + "%";
      thumbLo.setAttribute("aria-valuenow", lo);
      thumbHi.setAttribute("aria-valuenow", hi);
      if (loEl) loEl.textContent = "$" + lo;
      if (hiEl) hiEl.textContent = "$" + hi;
    }

    function makeDrag(isLo) {
      return function (e) {
        e.preventDefault();
        var rect = track.getBoundingClientRect();
        var ratio = (pointerX(e) - rect.left) / rect.width;
        var v = Math.round(min + ratio * (max - min));
        if (isLo) lo = clamp(v, min, hi - 1);
        else hi = clamp(v, lo + 1, max);
        update();
      };
    }

    function attachDrag(thumb, isLo) {
      var drag = makeDrag(isLo);
      thumb.addEventListener("mousedown", function (e) {
        e.preventDefault();
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", function up() {
          document.removeEventListener("mousemove", drag);
          document.removeEventListener("mouseup", up);
        });
      });
      thumb.addEventListener("touchstart", function () {
        document.addEventListener("touchmove", drag, { passive: false });
        document.addEventListener("touchend", function up() {
          document.removeEventListener("touchmove", drag);
          document.removeEventListener("touchend", up);
        });
      });
      thumb.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          if (isLo) lo = clamp(lo + 10, min, hi - 10);
          else hi = clamp(hi + 10, lo + 10, max);
          update();
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          if (isLo) lo = clamp(lo - 10, min, hi - 10);
          else hi = clamp(hi - 10, lo + 10, max);
          update();
        }
      });
    }

    attachDrag(thumbLo, true);
    attachDrag(thumbHi, false);
    update();
  }

  /* ── Stepped slider ── */
  function initStepped(wrap) {
    var track = wrap.querySelector(".rs-track");
    var fill = wrap.querySelector(".rs-fill");
    var thumb = wrap.querySelector(".rs-thumb");
    var ticks = Array.from(wrap.querySelectorAll(".rs-ticks span"));
    var labels = Array.from(wrap.querySelectorAll(".rs-step-labels span"));
    var steps = parseInt(thumb.getAttribute("aria-valuemax")); // 0..N
    var val = parseInt(thumb.getAttribute("aria-valuenow"));

    function update(v) {
      val = clamp(v, 0, steps);
      var p = pct(val, 0, steps);
      fill.style.left = "0%";
      fill.style.width = p + "%";
      thumb.style.left = p + "%";
      thumb.setAttribute("aria-valuenow", val);
      ticks.forEach(function (t, i) { t.style.background = i < val ? "#38bdf8" : ""; });
      labels.forEach(function (l, i) { l.style.color = i === val ? "#38bdf8" : ""; l.style.fontWeight = i === val ? "700" : ""; });
    }

    function drag(e) {
      e.preventDefault();
      var rect = track.getBoundingClientRect();
      var ratio = (pointerX(e) - rect.left) / rect.width;
      update(Math.round(ratio * steps));
    }

    thumb.addEventListener("mousedown", function (e) {
      e.preventDefault();
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", function up() {
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", up);
      });
    });
    thumb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); update(val + 1); }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); update(val - 1); }
    });

    update(val);
  }

  /* ── Init ── */
  var single = document.getElementById("rs-single");
  var dual = document.getElementById("rs-dual");
  var stepped = document.getElementById("rs-stepped");
  var colors = ["rs-green", "rs-purple", "rs-orange"];

  if (single) initSingle(single);
  if (dual) initDual(dual);
  if (stepped) initStepped(stepped);
  colors.forEach(function (id) { var el = document.getElementById(id); if (el) initSingle(el); });
}());
