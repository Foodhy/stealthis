(function () {
  "use strict";

  var checks = Array.prototype.slice.call(document.querySelectorAll(".tx"));
  var coverage = document.getElementById("coverage");
  var coverageOut = document.getElementById("coverageOut");
  var coverageHint = document.getElementById("coverageHint");
  var subtotalEl = document.getElementById("subtotal");
  var coveredEl = document.getElementById("covered");
  var oopEl = document.getElementById("oop");
  var countLabel = document.getElementById("countLabel");
  var saveBadge = document.getElementById("saveBadge");
  var barFill = document.getElementById("barFill");
  var barCap = document.getElementById("barCap");
  var copyBtn = document.getElementById("copyBtn");
  var resetBtn = document.getElementById("resetBtn");
  var toastEl = document.getElementById("toast");

  var fmt = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };

  var hintFor = function (pct) {
    if (pct === 0) return "Paying fully out of pocket";
    if (pct < 40) return "Paying most out of pocket";
    if (pct < 70) return "Shared cost with your plan";
    if (pct < 100) return "Your plan covers the majority";
    return "Fully covered by insurance";
  };

  // Animated count-up for a currency element.
  var anims = new WeakMap();
  function animateTo(el, target, prefixMinus) {
    var start = anims.get(el);
    if (typeof start !== "number") start = 0;
    var from = start;
    var t0 = performance.now();
    var dur = 420;
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = from + (target - from) * eased;
      el.textContent = (prefixMinus && target > 0 ? "–" : "") + fmt(val);
      if (p < 1) requestAnimationFrame(step);
      else {
        el.textContent = (prefixMinus && target > 0 ? "–" : "") + fmt(target);
        anims.set(el, target);
      }
    }
    anims.set(el, target);
    requestAnimationFrame(step);
    anims.set(el, target);
    // store the animated running value separately
    anims.set(el, from);
    (function run(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = from + (target - from) * eased;
      el.textContent = (prefixMinus && target > 0 ? "–" : "") + fmt(val);
      anims.set(el, val);
      if (p < 1) requestAnimationFrame(run);
      else { anims.set(el, target); }
    })(performance.now());
  }

  function selected() {
    return checks.filter(function (c) { return c.checked; });
  }

  function update() {
    var chosen = selected();
    var subtotal = chosen.reduce(function (sum, c) {
      return sum + Number(c.getAttribute("data-price"));
    }, 0);

    var pct = Number(coverage.value);
    var covered = subtotal * (pct / 100);
    var oop = subtotal - covered;

    // slider fill
    coverage.style.background =
      "linear-gradient(90deg, var(--blue) 0 " + pct + "%, var(--line) " + pct + "% 100%)";
    coverageOut.textContent = pct + "%";
    coverageHint.textContent = hintFor(pct);

    // count label
    var n = chosen.length;
    countLabel.textContent = n === 0
      ? "No treatments selected yet"
      : n + (n === 1 ? " treatment" : " treatments") + " selected";

    // numbers
    animateTo(subtotalEl, subtotal, false);
    animateTo(coveredEl, covered, true);
    animateTo(oopEl, oop, false);

    // savings badge
    if (covered >= 1) {
      saveBadge.hidden = false;
      saveBadge.textContent = "–" + fmt(covered);
    } else {
      saveBadge.hidden = true;
    }

    // split bar: portion covered by insurance
    var coverShare = subtotal > 0 ? (covered / subtotal) * 100 : 0;
    barFill.style.width = coverShare + "%";
    if (subtotal === 0) {
      barCap.textContent = "Select treatments to see your split";
    } else if (covered < 1) {
      barCap.textContent = "You pay the full " + fmt(subtotal);
    } else {
      barCap.textContent = "Insurance " + fmt(covered) + " · You pay " + fmt(oop);
    }
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  // Toggle row highlight class
  checks.forEach(function (c) {
    c.addEventListener("change", function () {
      var row = c.closest(".row");
      if (row) row.classList.toggle("is-on", c.checked);
      update();
    });
  });

  coverage.addEventListener("input", update);

  resetBtn.addEventListener("click", function () {
    checks.forEach(function (c) {
      c.checked = false;
      var row = c.closest(".row");
      if (row) row.classList.remove("is-on");
    });
    coverage.value = 60;
    update();
    toast("Estimate reset");
  });

  copyBtn.addEventListener("click", function () {
    var chosen = selected();
    if (chosen.length === 0) {
      toast("Select a treatment first");
      return;
    }
    var subtotal = chosen.reduce(function (s, c) { return s + Number(c.getAttribute("data-price")); }, 0);
    var pct = Number(coverage.value);
    var covered = subtotal * (pct / 100);
    var oop = subtotal - covered;

    var lines = ["Brightleaf Dental — estimate", ""];
    chosen.forEach(function (c) {
      lines.push("• " + c.getAttribute("data-name") + " — " + fmt(Number(c.getAttribute("data-price"))));
    });
    lines.push("");
    lines.push("Subtotal: " + fmt(subtotal));
    lines.push("Insurance (" + pct + "%): –" + fmt(covered));
    lines.push("Out of pocket: " + fmt(oop));
    lines.push("");
    lines.push("Illustrative estimate — not a quote.");
    var text = lines.join("\n");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast("Summary copied to clipboard"); },
        function () { toast("Copy the summary manually"); }
      );
    } else {
      toast("Clipboard not available");
    }
  });

  // init
  update();
})();
