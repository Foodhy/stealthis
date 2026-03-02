(function () {
  "use strict";

  function pct(val, min, max) {
    return ((val - min) / (max - min)) * 100;
  }

  // ── Single with tooltip ──────────────────────────────────────────────────────

  (function () {
    const input   = document.getElementById("rs-single");
    const tooltip = document.getElementById("tt-single");
    if (!input || !tooltip) return;

    function update() {
      const p = pct(input.value, input.min, input.max);
      input.style.setProperty("--fill", p + "%");
      tooltip.style.setProperty("--fill", p + "%");
      tooltip.textContent = input.value;
    }

    input.addEventListener("input", update);
    update();
  })();

  // ── Stepped ─────────────────────────────────────────────────────────────────

  (function () {
    const input   = document.getElementById("rs-stepped");
    const tooltip = document.getElementById("tt-stepped");
    if (!input || !tooltip) return;

    function update() {
      const p = pct(input.value, input.min, input.max);
      input.style.setProperty("--fill", p + "%");
      tooltip.style.setProperty("--fill", p + "%");
      tooltip.textContent = input.value;
    }

    input.addEventListener("input", update);
    update();
  })();

  // ── Dual handle ─────────────────────────────────────────────────────────────

  (function () {
    const minInput = document.getElementById("rs-min");
    const maxInput = document.getElementById("rs-max");
    const fill     = document.getElementById("rs-dual-fill");
    const lblMin   = document.getElementById("lbl-min");
    const lblMax   = document.getElementById("lbl-max");
    if (!minInput || !maxInput || !fill) return;

    function update() {
      let lo = parseFloat(minInput.value);
      let hi = parseFloat(maxInput.value);

      if (lo > hi) {
        [lo, hi] = [hi, lo];
        minInput.value = lo;
        maxInput.value = hi;
      }

      const min   = parseFloat(minInput.min);
      const max   = parseFloat(minInput.max);
      const left  = pct(lo, min, max);
      const right = pct(hi, min, max);

      fill.style.left  = left + "%";
      fill.style.width = (right - left) + "%";

      // Dual inputs use transparent bg — reset CSS fill var so no gradient shows
      minInput.style.setProperty("--fill", "0%");
      maxInput.style.setProperty("--fill", "0%");

      if (lblMin) lblMin.textContent = "$" + lo;
      if (lblMax) lblMax.textContent = "$" + hi;
    }

    minInput.addEventListener("input", update);
    maxInput.addEventListener("input", update);
    update();
  })();

  // ── Color variants ───────────────────────────────────────────────────────────

  document.querySelectorAll(".rs-blue, .rs-green, .rs-red").forEach(function (input) {
    function update() {
      input.style.setProperty("--fill", pct(input.value, input.min, input.max) + "%");
    }
    input.addEventListener("input", update);
    update();
  });

})();
