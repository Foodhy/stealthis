(function () {
  "use strict";

  /* ---------- Fictional profile dataset ---------- */
  var INTERESTS = ["coffee", "hiking", "music", "cooking", "gaming", "art", "travel", "yoga", "dogs", "film"];
  var GENDERS = ["women", "men", "everyone"];

  function pick(arr, n) {
    var copy = arr.slice(), out = [];
    for (var i = 0; i < n && copy.length; i++) {
      out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out;
  }

  // Deterministic-ish pseudo population of 420 fictional profiles.
  var PROFILES = [];
  var seed = 7;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  for (var i = 0; i < 420; i++) {
    var g = rnd() < 0.5 ? "women" : (rnd() < 0.7 ? "men" : "everyone");
    PROFILES.push({
      age: 19 + Math.floor(rnd() * 45),
      distance: 1 + Math.floor(rnd() * 148),
      gender: g,
      verified: rnd() < 0.42,
      interests: (function () {
        var s = {};
        var k = 1 + Math.floor(rnd() * 4);
        for (var j = 0; j < k; j++) { s[INTERESTS[Math.floor(rnd() * INTERESTS.length)]] = true; }
        return Object.keys(s);
      })()
    });
  }

  /* ---------- DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var ageLow = $("ageLow"), ageHigh = $("ageHigh"), ageOut = $("ageOut");
  var dist = $("dist"), distOut = $("distOut"), distFill = $("distFill");
  var intOut = $("intOut");
  var verified = $("verified");
  var matchCount = $("matchCount"), matchWrap = matchCount.closest(".match");
  var toastEl = $("toast");

  var ageRange = document.querySelector('[data-range="age"]');
  var ageFill = ageRange.querySelector("[data-fill]");
  var AGE_MIN = 18, AGE_MAX = 70, GAP = 1;

  /* ---------- Toast ---------- */
  var toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- Dual age slider ---------- */
  function pct(v, min, max) { return ((v - min) / (max - min)) * 100; }

  function updateAge() {
    var lo = parseInt(ageLow.value, 10);
    var hi = parseInt(ageHigh.value, 10);
    if (hi - lo < GAP) {
      if (document.activeElement === ageHigh) { lo = hi - GAP; ageLow.value = lo; }
      else { hi = lo + GAP; ageHigh.value = hi; }
    }
    var pl = pct(lo, AGE_MIN, AGE_MAX), ph = pct(hi, AGE_MIN, AGE_MAX);
    ageFill.style.left = pl + "%";
    ageFill.style.width = (ph - pl) + "%";
    var label = hi >= AGE_MAX ? lo + " – " + hi + "+" : lo + " – " + hi;
    ageOut.textContent = label;
    ageLow.setAttribute("aria-valuetext", "Minimum age " + lo);
    ageHigh.setAttribute("aria-valuetext", "Maximum age " + hi);
  }

  /* ---------- Distance slider ---------- */
  function updateDist() {
    var v = parseInt(dist.value, 10);
    distFill.style.width = pct(v, 1, 150) + "%";
    distOut.textContent = v + " km";
    dist.setAttribute("aria-valuetext", v + " kilometres");
  }

  /* ---------- Selection readers ---------- */
  function selectedSeek() {
    return Array.prototype.filter.call(
      document.querySelectorAll('[data-group="seek"] .pill'),
      function (b) { return b.getAttribute("aria-pressed") === "true"; }
    ).map(function (b) { return b.dataset.value; });
  }
  function selectedInterests() {
    return Array.prototype.filter.call(
      document.querySelectorAll("#interests .chip"),
      function (b) { return b.getAttribute("aria-pressed") === "true"; }
    ).map(function (b) { return b.dataset.value; });
  }

  /* ---------- Match count ---------- */
  var animRaf;
  function animateCount(to) {
    var from = parseInt(matchCount.textContent.replace(/\D/g, ""), 10) || 0;
    if (from === to) { matchCount.textContent = to; return; }
    cancelAnimationFrame(animRaf);
    var start = performance.now(), dur = 340;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      matchCount.textContent = Math.round(from + (to - from) * eased);
      if (t < 1) { animRaf = requestAnimationFrame(step); }
    }
    animRaf = requestAnimationFrame(step);
    matchWrap.classList.add("bump");
    setTimeout(function () { matchWrap.classList.remove("bump"); }, 400);
  }

  function recompute() {
    var lo = parseInt(ageLow.value, 10), hi = parseInt(ageHigh.value, 10);
    var maxDist = parseInt(dist.value, 10);
    var seek = selectedSeek();
    var ints = selectedInterests();
    var vOnly = verified.getAttribute("aria-checked") === "true";
    var everyone = seek.indexOf("everyone") !== -1;

    var count = PROFILES.filter(function (p) {
      if (p.age < lo || p.age > hi) return false;
      if (p.distance > maxDist) return false;
      if (vOnly && !p.verified) return false;
      if (!everyone && seek.length && seek.indexOf(p.gender) === -1 && p.gender !== "everyone") return false;
      if (ints.length) {
        var hit = ints.some(function (x) { return p.interests.indexOf(x) !== -1; });
        if (!hit) return false;
      }
      return true;
    }).length;

    animateCount(count);
  }

  /* ---------- Wiring ---------- */
  [ageLow, ageHigh].forEach(function (el) {
    el.addEventListener("input", function () { updateAge(); recompute(); });
  });
  dist.addEventListener("input", function () { updateDist(); recompute(); });

  // Gender radiogroup (single select)
  document.querySelectorAll('[data-group="gender"] .pill').forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll('[data-group="gender"] .pill').forEach(function (b) {
        b.setAttribute("aria-checked", b === btn ? "true" : "false");
      });
    });
  });

  // Looking-for group (multi toggle, keep at least one)
  document.querySelectorAll('[data-group="seek"] .pill').forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") === "true";
      if (on && selectedSeek().length === 1) {
        toast("Pick at least one preference");
        return;
      }
      btn.setAttribute("aria-pressed", on ? "false" : "true");
      recompute();
    });
  });

  // Interests
  document.querySelectorAll("#interests .chip").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", on ? "false" : "true");
      intOut.textContent = selectedInterests().length + " selected";
      recompute();
    });
  });

  // Verified switch
  function toggleSwitch() {
    var on = verified.getAttribute("aria-checked") === "true";
    verified.setAttribute("aria-checked", on ? "false" : "true");
    recompute();
  }
  verified.addEventListener("click", toggleSwitch);
  verified.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleSwitch(); }
  });

  // Apply
  $("apply").addEventListener("click", function () {
    toast("Filters applied · " + matchCount.textContent + " matches");
  });

  // Reset to defaults
  var DEFAULTS = {
    ageLow: 24, ageHigh: 38, dist: 25,
    gender: "woman",
    seek: ["women", "men"],
    interests: ["coffee", "hiking", "cooking"],
    verified: false
  };
  $("reset").addEventListener("click", function () {
    ageLow.value = DEFAULTS.ageLow;
    ageHigh.value = DEFAULTS.ageHigh;
    dist.value = DEFAULTS.dist;
    document.querySelectorAll('[data-group="gender"] .pill').forEach(function (b) {
      b.setAttribute("aria-checked", b.dataset.value === DEFAULTS.gender ? "true" : "false");
    });
    document.querySelectorAll('[data-group="seek"] .pill').forEach(function (b) {
      b.setAttribute("aria-pressed", DEFAULTS.seek.indexOf(b.dataset.value) !== -1 ? "true" : "false");
    });
    document.querySelectorAll("#interests .chip").forEach(function (b) {
      b.setAttribute("aria-pressed", DEFAULTS.interests.indexOf(b.dataset.value) !== -1 ? "true" : "false");
    });
    verified.setAttribute("aria-checked", DEFAULTS.verified ? "true" : "false");
    intOut.textContent = DEFAULTS.interests.length + " selected";
    updateAge();
    updateDist();
    recompute();
    toast("Filters reset to defaults");
  });

  /* ---------- Init ---------- */
  updateAge();
  updateDist();
  recompute();
})();
