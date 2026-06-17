(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast helper ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- Driver marker along the SVG route ---------- */
  var routePath = $("#route");
  var driver = $("#driver");
  var mapSvg = $(".map-route");
  var mapBox = $(".map");
  var routeLen = routePath ? routePath.getTotalLength() : 0;
  var vb = { w: 360, h: 320 }; // matches viewBox

  // progress 0 -> at store (origin), 1 -> at home (destination)
  function placeDriver(progress) {
    if (!routePath || !driver || !mapBox) return;
    progress = Math.max(0, Math.min(1, progress));
    var pt = routePath.getPointAtLength(progress * routeLen);
    // route is drawn store->home, so getPointAtLength(0) is store end
    var leftPct = (pt.x / vb.w) * 100;
    var topPct = (pt.y / vb.h) * 100;
    driver.style.left = leftPct + "%";
    driver.style.top = topPct + "%";
  }

  /* ---------- State machine ---------- */
  var STEPS = ["placed", "preparing", "out", "delivered"];
  var stepEls = $$("#steps .step");
  // start state: out for delivery (index 2 active, 0/1 done)
  var current = 2;          // index of active step
  var driverProgress = 0.32; // along route while out for delivery
  var etaSeconds = 14 * 60; // 14 minutes
  var delivered = false;

  function renderSteps() {
    stepEls.forEach(function (el, i) {
      el.classList.remove("done", "active");
      if (i < current) el.classList.add("done");
      else if (i === current && !delivered) el.classList.add("active");
      else if (delivered && i <= current) el.classList.add("done");
    });
  }

  function nowClock(offsetSec) {
    var d = new Date(Date.now() + (offsetSec || 0) * 1000);
    var h = d.getHours();
    var m = d.getMinutes();
    var ap = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return h + ":" + (m < 10 ? "0" + m : m) + " " + ap;
  }

  /* ---------- ETA countdown ---------- */
  var etaMinEl = $("#etaMin");
  var etaClockEl = $("#etaClock");
  var statusBox = $("#etaStatus");

  function renderEta() {
    var mins = Math.max(0, Math.ceil(etaSeconds / 60));
    if (delivered) {
      if (etaMinEl) etaMinEl.parentNode.innerHTML = "Delivered";
      if (etaClockEl) {
        var by = etaClockEl.parentNode;
        if (by) by.textContent = "Handed off at " + nowClock(0);
      }
      if (statusBox) statusBox.innerHTML = '<span class="pill pill-ok">Delivered</span>';
      return;
    }
    if (etaMinEl) etaMinEl.textContent = String(mins);
    if (etaClockEl) etaClockEl.textContent = nowClock(etaSeconds);
    if (statusBox) {
      if (mins <= 2) {
        statusBox.innerHTML = '<span class="pill pill-warn">Almost there</span>';
      } else {
        statusBox.innerHTML = '<span class="pill pill-track">On the way</span>';
      }
    }
  }

  /* ---------- "Updated ago" chip ---------- */
  var updatedAgoEl = $("#updatedAgo");
  var lastUpdate = Date.now();
  function bumpUpdate() { lastUpdate = Date.now(); if (updatedAgoEl) updatedAgoEl.textContent = "just now"; }
  function renderAgo() {
    if (!updatedAgoEl) return;
    var s = Math.round((Date.now() - lastUpdate) / 1000);
    if (s < 5) updatedAgoEl.textContent = "just now";
    else if (s < 60) updatedAgoEl.textContent = s + "s ago";
    else updatedAgoEl.textContent = Math.round(s / 60) + "m ago";
  }

  /* ---------- Ticking loop ---------- */
  var tickTimer = setInterval(function () {
    if (!delivered) {
      etaSeconds = Math.max(0, etaSeconds - 1);
      // creep driver toward home as eta shrinks while out for delivery
      if (current === 2) {
        var target = 1 - (etaSeconds / (14 * 60)) * (1 - 0.32);
        driverProgress += (target - driverProgress) * 0.08;
        if (!reduceMotion) placeDriver(driverProgress);
      }
      if (etaSeconds === 0 && current === 2) markDelivered();
      renderEta();
    }
    renderAgo();
  }, 1000);

  function markDelivered() {
    delivered = true;
    current = 3;
    driverProgress = 1;
    placeDriver(1);
    var step3time = $('.step[data-step="3"] .step-time');
    if (step3time) step3time.textContent = nowClock(0);
    renderSteps();
    renderEta();
    bumpUpdate();
    toast("Order delivered — enjoy your meal!");
    var adv = $("#advanceBtn");
    if (adv) { adv.disabled = true; adv.textContent = "Delivered"; }
    clearInterval(tickTimer);
  }

  /* ---------- Buttons ---------- */
  $$(".circle-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var act = btn.getAttribute("data-act");
      if (act === "call") toast("Calling Marcus Hale…");
      else toast("Chat opened with Marcus");
    });
  });

  var shareBtn = $("#shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var url = "https://track.pronto.app/PD-4827";
      if (navigator.share) {
        navigator.share({ title: "Track my Pronto order", url: url })
          .then(function () { toast("Tracking link shared"); })
          .catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(function () { toast("Tracking link copied"); })
          .catch(function () { toast("Tracking: " + url); });
      } else {
        toast("Tracking: " + url);
      }
    });
  }

  var advanceBtn = $("#advanceBtn");
  if (advanceBtn) {
    advanceBtn.addEventListener("click", function () {
      if (delivered) return;
      if (current < 2) {
        current += 1;
        renderSteps();
        bumpUpdate();
        toast(current === 2 ? "Marcus is heading your way" : "Status updated");
      } else {
        // out -> push delivery quickly
        etaSeconds = Math.max(0, etaSeconds - 90);
        if (etaSeconds <= 0) { markDelivered(); return; }
        driverProgress = Math.min(0.97, driverProgress + 0.22);
        placeDriver(driverProgress);
        bumpUpdate();
        renderEta();
        toast(Math.ceil(etaSeconds / 60) + " min away — getting closer");
      }
    });
  }

  /* ---------- Init ---------- */
  renderSteps();
  renderEta();
  placeDriver(driverProgress);
})();
