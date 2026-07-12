(function () {
  "use strict";

  // Look definitions — realistic but fictional grading presets.
  var LOOKS = [
    {
      id: "kodak2383",
      name: "Kodak 2383",
      lut: "Kodak_2383_D65.cube",
      swatch: "linear-gradient(120deg,#3a2f1e,#c98b3a 55%,#f4d9a0)",
      filter: "contrast(1.14) saturate(1.28) brightness(1.03) sepia(.08)",
      tint: "linear-gradient(180deg,rgba(255,176,32,.30),rgba(20,40,70,.42))",
      exp: "+0.3", con: "+18", sat: "+22", temp: "+320K"
    },
    {
      id: "tealnoir",
      name: "Teal Noir",
      lut: "Teal_Noir_Cross.cube",
      swatch: "linear-gradient(120deg,#04191f,#0d5b63 55%,#e08a3c)",
      filter: "contrast(1.22) saturate(1.1) brightness(.96) hue-rotate(-8deg)",
      tint: "linear-gradient(180deg,rgba(12,90,110,.5),rgba(255,140,60,.22))",
      exp: "-0.2", con: "+30", sat: "+8", temp: "-260K"
    },
    {
      id: "golden",
      name: "Golden Hour",
      lut: "Golden_Hour_Warm.cube",
      swatch: "linear-gradient(120deg,#5a2e0a,#f0a437 55%,#ffe6b0)",
      filter: "contrast(1.08) saturate(1.35) brightness(1.08) sepia(.14)",
      tint: "linear-gradient(180deg,rgba(255,176,32,.42),rgba(255,90,40,.28))",
      exp: "+0.7", con: "+10", sat: "+30", temp: "+540K"
    },
    {
      id: "bleach",
      name: "Bleach Bypass",
      lut: "Bleach_Bypass_HiCon.cube",
      swatch: "linear-gradient(120deg,#3d3d40,#9a9aa0 55%,#ececef)",
      filter: "contrast(1.34) saturate(.7) brightness(1.05)",
      tint: "linear-gradient(180deg,rgba(210,210,215,.35),rgba(40,40,48,.4))",
      exp: "+0.1", con: "+42", sat: "-30", temp: "-40K"
    },
    {
      id: "d4n",
      name: "Day-for-Night",
      lut: "Day_For_Night_Blue.cube",
      swatch: "linear-gradient(120deg,#050b1a,#16385f 55%,#4a6ea0)",
      filter: "contrast(1.2) saturate(.9) brightness(.7) hue-rotate(-18deg)",
      tint: "linear-gradient(180deg,rgba(20,50,110,.6),rgba(6,12,30,.55))",
      exp: "-1.4", con: "+26", sat: "-12", temp: "-820K"
    }
  ];

  var viewer = document.getElementById("viewer");
  var frameAfter = document.getElementById("frameAfter");
  var handle = document.getElementById("handle");
  var tint = document.getElementById("tint");
  var tagAfter = document.getElementById("tagAfter");
  var splitLabel = document.getElementById("splitLabel");
  var tc = document.getElementById("tc");
  var rack = document.getElementById("rack");
  var copyBtn = document.getElementById("copyBtn");
  var toastEl = document.getElementById("toast");

  var rExp = document.getElementById("rExp");
  var rCon = document.getElementById("rCon");
  var rSat = document.getElementById("rSat");
  var rTemp = document.getElementById("rTemp");
  var rLut = document.getElementById("rLut");

  var split = 50; // percent
  var active = LOOKS[0];
  var toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  // Update wipe position (0-100)
  function setSplit(pct) {
    split = clamp(pct, 0, 100);
    frameAfter.style.clipPath = "inset(0 0 0 " + split + "%)";
    handle.style.left = split + "%";
    splitLabel.textContent = Math.round(split) + "%";
    viewer.setAttribute("aria-valuenow", String(Math.round(split)));
    viewer.setAttribute("aria-valuetext", Math.round(split) + " percent graded");
  }

  // Apply a look to the graded half
  function applyLook(look, animate) {
    active = look;
    if (animate) {
      frameAfter.classList.add("is-wiping");
      setTimeout(function () { frameAfter.classList.remove("is-wiping"); }, 400);
    }
    frameAfter.style.filter = look.filter;
    tint.style.background = look.tint;
    tagAfter.textContent = "AFTER · " + look.name.toUpperCase();

    rExp.textContent = look.exp;
    rCon.textContent = look.con;
    rSat.textContent = look.sat;
    rTemp.textContent = look.temp;
    rLut.textContent = look.lut;

    var cards = rack.querySelectorAll(".look");
    cards.forEach(function (c) {
      var on = c.dataset.id === look.id;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  // Build the look rack
  LOOKS.forEach(function (look) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "look";
    btn.dataset.id = look.id;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.setAttribute("aria-label", look.name + " look, " + look.lut);
    btn.innerHTML =
      '<span class="look__check" aria-hidden="true">✓</span>' +
      '<span class="look__swatch" style="background:' + look.swatch + '"></span>' +
      '<span class="look__body">' +
        '<span class="look__name">' + look.name + '</span>' +
        '<span class="look__lut">' + look.lut + '</span>' +
      '</span>';
    btn.addEventListener("click", function () {
      applyLook(look, true);
      toast("Look applied · " + look.name);
    });
    rack.appendChild(btn);
  });

  // Pointer drag on viewer
  function pctFromEvent(clientX) {
    var rect = viewer.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  var dragging = false;

  function onDown(e) {
    dragging = true;
    viewer.focus();
    setSplit(pctFromEvent(e.clientX));
    if (viewer.setPointerCapture && e.pointerId != null) {
      try { viewer.setPointerCapture(e.pointerId); } catch (_) {}
    }
    e.preventDefault();
  }
  function onMove(e) {
    if (!dragging) return;
    setSplit(pctFromEvent(e.clientX));
  }
  function onUp() {
    dragging = false;
  }

  viewer.addEventListener("pointerdown", onDown);
  viewer.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  viewer.addEventListener("pointercancel", onUp);

  // Keyboard control
  viewer.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 10 : 3;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      setSplit(split - step);
      e.preventDefault();
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      setSplit(split + step);
      e.preventDefault();
    } else if (e.key === "Home") {
      setSplit(0);
      e.preventDefault();
    } else if (e.key === "End") {
      setSplit(100);
      e.preventDefault();
    } else if (e.key >= "1" && e.key <= String(LOOKS.length)) {
      var idx = parseInt(e.key, 10) - 1;
      applyLook(LOOKS[idx], true);
      toast("Look applied · " + LOOKS[idx].name);
      e.preventDefault();
    }
  });

  // Copy LUT name
  copyBtn.addEventListener("click", function () {
    var name = active.lut;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(name).then(
        function () { toast("Copied · " + name); },
        function () { toast(name); }
      );
    } else {
      toast(name);
    }
  });

  // Live-ish timecode ticker (25 fps, playing feel)
  var frames = 4 * 25 + 12; // start 00:00:04:12
  function fmt(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    frames = (frames + 1) % (60 * 60 * 25);
    var f = frames % 25;
    var totalSec = Math.floor(frames / 25);
    var s = totalSec % 60;
    var m = Math.floor(totalSec / 60) % 60;
    var h = Math.floor(totalSec / 3600);
    tc.textContent = fmt(h) + ":" + fmt(m) + ":" + fmt(s) + ":" + fmt(f);
  }
  setInterval(tick, 1000 / 25);

  // Init
  setSplit(50);
  applyLook(LOOKS[0], false);
})();
