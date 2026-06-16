/* Travel Story / Photo Essay — vanilla JS interactions
   - reading progress bar
   - scroll-reveal of panels
   - parallax on cover + mid band
   - sticky masthead show/hide
   - save/bookmark toggle
   - interactive map pins
   - back-to-top
*/
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ---------- reading progress ---------- */
  var bar = document.getElementById("progressBar");
  var progressEl = bar ? bar.parentElement : null;

  function updateProgress() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    var pct = scrollable > 0 ? (doc.scrollTop || window.pageYOffset) / scrollable : 0;
    pct = Math.max(0, Math.min(1, pct));
    if (bar) bar.style.width = (pct * 100).toFixed(2) + "%";
    if (progressEl) progressEl.setAttribute("aria-valuenow", Math.round(pct * 100));
  }

  /* ---------- sticky masthead (appear after cover) ---------- */
  var mast = document.querySelector(".mast");
  var cover = document.querySelector(".cover");

  function updateMast() {
    if (!mast || !cover) return;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var threshold = cover.offsetHeight * 0.6;
    mast.classList.toggle("is-visible", y > threshold);
  }

  /* ---------- parallax ---------- */
  var coverLayers = [
    { el: document.querySelector(".cover__sun"), rate: 0.22 },
    { el: document.querySelector(".cover__ridge--far"), rate: 0.12 },
    { el: document.querySelector(".cover__ridge--mid"), rate: 0.07 },
    { el: document.querySelector(".cover__mist"), rate: -0.06 }
  ];
  var plate = document.querySelector(".cover__plate");

  var pSea = document.querySelector(".parallax__sea");
  var pCliffs = document.querySelector(".parallax__cliffs");
  var pLight = document.querySelector(".parallax__light");
  var pBand = document.querySelector(".parallax");

  function updateParallax() {
    if (reduceMotion) return;
    var y = window.pageYOffset || document.documentElement.scrollTop;

    // cover layers (only while cover is roughly in view)
    if (cover && y < cover.offsetHeight) {
      for (var i = 0; i < coverLayers.length; i++) {
        var L = coverLayers[i];
        if (L.el) L.el.style.transform = "translate3d(0," + (y * L.rate) + "px,0)";
      }
      if (plate) plate.style.transform = "translate3d(0," + (y * 0.18) + "px,0)";
    }

    // mid band — translate relative to its own viewport position
    if (pBand) {
      var rect = pBand.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var rel = (window.innerHeight - rect.top) * 0.08;
        if (pSea) pSea.style.transform = "translate3d(0," + (-rel * 0.5) + "px,0)";
        if (pCliffs) pCliffs.style.transform = "translate3d(0," + (-rel * 0.9) + "px,0)";
        if (pLight) pLight.style.transform = "translate3d(0," + (-rel * 1.3) + "px,0)";
      }
    }
  }

  /* ---------- combined scroll handler (rAF throttled) ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateProgress();
      updateMast();
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------- scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- save / bookmark ---------- */
  var saveBtn = document.getElementById("saveBtn");
  var saveLabel = document.getElementById("saveLabel");
  var saved = false;
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      saved = !saved;
      saveBtn.setAttribute("aria-pressed", String(saved));
      if (saveLabel) saveLabel.textContent = saved ? "Saved" : "Save";
      toast(saved ? "Added to your reading list" : "Removed from reading list");
    });
  }

  /* ---------- map pins ---------- */
  var pins = Array.prototype.slice.call(document.querySelectorAll(".pin"));
  var readout = document.getElementById("mapReadout");
  function selectPin(pin) {
    pins.forEach(function (p) { p.classList.toggle("is-active", p === pin); });
    if (readout) {
      var place = pin.getAttribute("data-place") || "";
      var detail = pin.getAttribute("data-detail") || "";
      readout.innerHTML = "<strong>" + place + "</strong> &mdash; " + detail;
    }
  }
  pins.forEach(function (pin) {
    pin.addEventListener("click", function () { selectPin(pin); });
  });

  /* ---------- back to top ---------- */
  var topBtn = document.getElementById("topBtn");
  if (topBtn) {
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      toast("Back to the beginning");
    });
  }

  /* ---------- smooth-scroll for in-page nav (respects reduced motion) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (typeof target.focus === "function") {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });
})();
