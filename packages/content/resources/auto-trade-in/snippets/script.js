(function () {
  "use strict";

  var form = document.getElementById("appraise-form");
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll(".step"));
  var pips = Array.prototype.slice.call(document.querySelectorAll(".steps__item"));
  var current = 1;
  var applied = false;

  /* ---- Toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg, ok) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.toggle("toast--ok", !!ok);
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---- Populate year dropdown ---- */
  var yearSel = document.getElementById("year");
  var thisYear = 2026;
  for (var y = thisYear; y >= thisYear - 22; y--) {
    var o = document.createElement("option");
    o.value = String(y);
    o.textContent = String(y);
    yearSel.appendChild(o);
  }

  /* ---- Formatters ---- */
  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  function commas(n) {
    return Number(n || 0).toLocaleString("en-US");
  }

  /* ---- Live odometer grouping (display via title only, keep number input clean) ---- */

  /* ---- Step navigation ---- */
  function goTo(step) {
    current = step;
    steps.forEach(function (s) {
      s.hidden = Number(s.getAttribute("data-step")) !== step;
    });
    pips.forEach(function (p) {
      var n = Number(p.getAttribute("data-step-pip"));
      p.classList.toggle("is-active", n === step);
      p.classList.toggle("is-done", n < step);
    });
    var panel = steps[step - 1];
    if (panel) {
      var focusable = panel.querySelector("input, select, button");
      if (focusable) focusable.focus({ preventScroll: true });
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /* ---- Validate step 1 ---- */
  function validateStep1() {
    var make = document.getElementById("make").value;
    var model = document.getElementById("model").value.trim();
    var year = document.getElementById("year").value;
    var miles = document.getElementById("mileage").value;
    var err = document.getElementById("step1-error");
    var ok = make && model && year && miles !== "" && Number(miles) >= 0;
    err.hidden = ok;
    if (!ok) toast("Complete the vehicle details to continue.");
    return ok;
  }

  /* ---- Core valuation model ---- */
  function compute() {
    var makeOpt = document.getElementById("make").selectedOptions[0];
    var makeTier = makeOpt ? Number(makeOpt.getAttribute("data-tier")) || 1 : 1;
    var year = Number(document.getElementById("year").value) || thisYear;
    var miles = Number(document.getElementById("mileage").value) || 0;
    var trim = Number(document.getElementById("trim").value) || 1;

    // Base MSRP-ish anchor by make tier.
    var base = 34000 * makeTier;

    // Age depreciation: ~14%/yr compounding, floored.
    var age = Math.max(0, thisYear - year);
    var ageFactor = Math.max(0.18, Math.pow(0.86, age));

    // Mileage penalty: 12k/yr baseline expected; deviation costs/credits ~$0.11/mi.
    var expectedMiles = age * 12000;
    var mileageDelta = (expectedMiles - miles) * 0.11; // positive if low miles
    mileageDelta = Math.max(-9000, Math.min(6000, mileageDelta));

    var subtotal = base * ageFactor * trim + mileageDelta;

    // Condition multiplier.
    var condInput = form.querySelector('input[name="condition"]:checked');
    var condFactor = condInput ? Number(condInput.value) : 1;
    var condGrade = condInput ? condInput.getAttribute("data-grade") : "Good";

    // Disclosure flags (multipliers, compounded).
    var flagFactor = 1;
    var flagInputs = form.querySelectorAll('input[name="flag"]:checked');
    flagInputs.forEach(function (f) {
      flagFactor *= Number(f.value);
    });

    var afterCond = subtotal * condFactor * flagFactor;

    // Option add-ons (flat $).
    var optTotal = 0;
    var optInputs = form.querySelectorAll('input[name="opt"]:checked');
    optInputs.forEach(function (f) {
      optTotal += Number(f.value);
    });

    var mid = Math.max(900, afterCond + optTotal);

    // Confidence range widens with age & condition uncertainty.
    var spread = 0.06 + age * 0.005 + (condFactor < 1 ? 0.03 : 0.01);
    spread = Math.min(0.17, spread);
    var low = mid * (1 - spread);
    var high = mid * (1 + spread);

    return {
      base: base * ageFactor * trim,
      mileageDelta: mileageDelta,
      condGrade: condGrade,
      condFactor: condFactor,
      condDelta: subtotal * (condFactor - 1),
      flagFactor: flagFactor,
      flagDelta: subtotal * condFactor * (flagFactor - 1),
      optTotal: optTotal,
      miles: miles,
      mid: mid,
      low: low,
      high: high,
      year: year,
      make: makeOpt ? makeOpt.value : "",
      model: document.getElementById("model").value.trim()
    };
  }

  /* ---- Gauge animation ---- */
  // Scale gauge needle/fill from a fixed display window so the value reads meaningfully.
  var GAUGE_MIN = 0;
  var GAUGE_MAX = 60000;
  var ARC_LEN = 251.3; // path length of the semicircle

  function setGauge(value) {
    var t = Math.max(0, Math.min(1, (value - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)));
    var fill = document.getElementById("gauge-fill");
    var needle = document.getElementById("gauge-needle");
    // Force reflow so transition replays each time.
    fill.style.strokeDashoffset = ARC_LEN;
    needle.style.transform = "rotate(-90deg)";
    void fill.getBoundingClientRect();
    requestAnimationFrame(function () {
      fill.style.strokeDashoffset = String(ARC_LEN * (1 - t));
      needle.style.transform = "rotate(" + (-90 + t * 180) + "deg)";
    });
    // Count-up the headline figure.
    countUp(document.getElementById("gauge-value"), value);
  }

  function countUp(el, target) {
    var start = 0;
    var dur = 950;
    var startT = null;
    function frame(ts) {
      if (startT === null) startT = ts;
      var p = Math.min(1, (ts - startT) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = money(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = money(target);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = money(target);
    } else {
      requestAnimationFrame(frame);
    }
  }

  /* ---- Render result ---- */
  function renderResult() {
    var r = compute();

    document.getElementById("result-vehicle").textContent =
      r.year + " " + r.make + " " + (r.model || "") + " · appraised today";
    document.getElementById("vc-miles").textContent = commas(r.miles) + " mi";
    document.getElementById("vc-cond").textContent = r.condGrade;

    document.getElementById("range-low").textContent = money(r.low);
    document.getElementById("range-high").textContent = money(r.high);

    // Pip position along the range bar = midpoint sits at 50% by definition.
    document.getElementById("range-pip").style.left = "50%";

    setGauge(r.mid);

    // Breakdown rows.
    var rows = [];
    rows.push({ label: "Market base (age + trim)", amt: r.base, tone: "#5b6470" });
    if (Math.abs(r.mileageDelta) > 5)
      rows.push({ label: r.mileageDelta >= 0 ? "Low-mileage credit" : "High-mileage adjustment", amt: r.mileageDelta, tone: r.mileageDelta >= 0 ? "#2f9e6f" : "#d4493e", signed: true });
    if (Math.abs(r.condDelta) > 5)
      rows.push({ label: "Condition: " + r.condGrade, amt: r.condDelta, tone: r.condDelta >= 0 ? "#2f9e6f" : "#e0962a", signed: true });
    if (Math.abs(r.flagDelta) > 5)
      rows.push({ label: "Disclosures", amt: r.flagDelta, tone: "#d4493e", signed: true });
    if (r.optTotal > 0)
      rows.push({ label: "Optional equipment", amt: r.optTotal, tone: "#2f9e6f", signed: true });

    var list = document.getElementById("breakdown");
    list.innerHTML = "";
    rows.forEach(function (row) {
      var li = document.createElement("li");
      var signed = row.signed ? (row.amt >= 0 ? "+" : "−") + money(Math.abs(row.amt)).slice(1) : money(row.amt);
      var cls = row.signed ? (row.amt >= 0 ? "is-pos" : "is-neg") : "";
      li.innerHTML =
        '<span class="bd-label"><span class="bd-dot" style="background:' + row.tone + '"></span>' +
        row.label + "</span>" +
        '<span class="bd-amt ' + cls + '">' + (row.signed && row.amt >= 0 ? "+" : "") +
        (row.signed ? signed : money(row.amt)) + "</span>";
      list.appendChild(li);
    });
    var total = document.createElement("li");
    total.className = "is-total";
    total.innerHTML =
      '<span class="bd-label">Estimated trade-in value</span>' +
      '<span class="bd-amt mono">' + money(r.mid) + "</span>";
    list.appendChild(total);

    // Reset apply state.
    applied = false;
    var applyWrap = document.querySelector(".apply");
    var applyBtn = document.getElementById("apply-btn");
    var applyNote = document.getElementById("apply-note");
    applyWrap.classList.remove("is-applied");
    applyBtn.disabled = false;
    applyBtn.textContent = "Apply to purchase";
    applyNote.textContent = "Roll this credit straight into your next vehicle.";

    return r;
  }

  /* ---- Events ---- */
  form.addEventListener("click", function (e) {
    var nav = e.target.closest("[data-go]");
    if (nav) {
      e.preventDefault();
      var dest = Number(nav.getAttribute("data-go"));
      if (dest === 2 && current === 1 && !validateStep1()) return;
      goTo(dest);
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep1()) {
      goTo(1);
      return;
    }
    renderResult();
    goTo(3);
    toast("Estimate ready — fictional appraisal.", true);
  });

  // Live re-compute if user tweaks condition/options while on the result step.
  form.addEventListener("change", function (e) {
    if (current !== 3) return;
    if (e.target.name === "condition" || e.target.name === "opt" || e.target.name === "flag") {
      renderResult();
    }
  });

  // Apply to purchase.
  document.getElementById("apply-btn").addEventListener("click", function () {
    if (applied) return;
    applied = true;
    var r = compute();
    var applyWrap = document.querySelector(".apply");
    var applyNote = document.getElementById("apply-note");
    applyWrap.classList.add("is-applied");
    this.disabled = true;
    this.textContent = "Credit applied ✓";
    applyNote.textContent = money(r.mid) + " credit reserved on quote #TI-4827.";
    toast("Trade-in credit applied to your purchase.", true);
  });

  // Restart.
  document.getElementById("restart-btn").addEventListener("click", function () {
    form.reset();
    // Re-check the default "Good" condition radio after reset.
    var good = form.querySelector('input[name="condition"][data-grade="Good"]');
    if (good) good.checked = true;
    document.getElementById("step1-error").hidden = true;
    goTo(1);
    toast("Cleared. Start a fresh appraisal.");
  });

  // Keep step1 error hidden as user types valid input.
  ["make", "model", "year", "mileage"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      var err = document.getElementById("step1-error");
      if (!err.hidden) err.hidden = true;
    });
  });

  goTo(1);
})();
