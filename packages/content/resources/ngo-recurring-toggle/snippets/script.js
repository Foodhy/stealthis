(function () {
  "use strict";

  // ---- State ----
  var state = {
    freq: "monthly", // "monthly" | "once"
    amount: 25,
  };

  // ---- Elements ----
  var seg = document.querySelector(".seg");
  var freqOpts = Array.prototype.slice.call(document.querySelectorAll(".seg__opt"));
  var freqCopyEl = document.querySelector("[data-freqcopy]");
  var amountBtns = Array.prototype.slice.call(document.querySelectorAll(".amt"));
  var subEls = Array.prototype.slice.call(document.querySelectorAll("[data-sub]"));
  var customInput = document.querySelector("[data-custom]");
  var impactEl = document.querySelector("[data-impact]");
  var previewEach = document.querySelector("[data-preview-each]");
  var previewAnnual = document.querySelector("[data-preview-annual]");
  var previewLabel = document.querySelector("[data-preview-label]");
  var previewNote = document.querySelector("[data-preview-note]");
  var donateAmtEl = document.querySelector("[data-donate-amt]");
  var donateBtn = document.querySelector("[data-donate]");
  var toastEl = document.querySelector("[data-toast]");

  // $25/mo funds clean water for ~1 family/year. Annual gift / 25 ≈ families reached.
  var FAMILY_PER_YEAR = 300; // $ per family per year

  var copy = {
    monthly:
      "Monthly gifts keep wells maintained year-round — you can pause or cancel anytime.",
    once:
      "A one-time gift makes an immediate splash. Consider monthly to fund the upkeep that keeps water flowing.",
  };

  // ---- Helpers ----
  function fmt(n) {
    return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function getAmount() {
    var n = parseFloat(state.amount);
    return isNaN(n) || n <= 0 ? 0 : n;
  }

  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 3200);
  }

  // ---- Render ----
  function render() {
    var monthly = state.freq === "monthly";
    var amt = getAmount();

    // segmented control visual + a11y
    seg.classList.toggle("is-once", !monthly);
    freqOpts.forEach(function (b) {
      var active = b.getAttribute("data-freq") === state.freq;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-checked", active ? "true" : "false");
    });

    // frequency copy
    freqCopyEl.textContent = copy[state.freq];

    // preset sub-labels ("per month" vs "one-time")
    subEls.forEach(function (el) {
      el.textContent = monthly ? "per month" : "one-time";
    });

    // impact line
    if (amt <= 0) {
      impactEl.innerHTML = "Enter an amount to see your impact.";
    } else if (monthly) {
      var litres = Math.round((amt / 25) * 9000);
      impactEl.innerHTML =
        "Provides <strong>" +
        litres.toLocaleString("en-US") +
        " litres</strong> of clean water every month.";
    } else {
      impactEl.innerHTML =
        "Funds <strong>" +
        Math.max(1, Math.round((amt / 25) * 380)).toLocaleString("en-US") +
        " litres</strong> toward the next community well.";
    }

    // annual projection
    var annual = monthly ? amt * 12 : amt;
    previewLabel.textContent = monthly ? "Your monthly gift" : "Your one-time gift";
    previewEach.textContent = monthly ? fmt(amt) + " / month" : fmt(amt) + " once";

    var totalRow = previewAnnual.closest(".preview__row");
    if (totalRow) {
      totalRow.querySelector("span").textContent = monthly
        ? "Projected over 12 months"
        : "Total gift";
    }
    previewAnnual.textContent = fmt(annual);

    var families = annual / FAMILY_PER_YEAR;
    if (amt <= 0) {
      previewNote.textContent = "Choose an amount to see your yearly reach.";
    } else if (monthly) {
      previewNote.textContent =
        "That's clean water for ~" +
        (families < 1 ? "<1" : Math.round(families)) +
        " famil" +
        (Math.round(families) === 1 ? "y" : "ies") +
        " for a full year.";
    } else {
      previewNote.textContent =
        "Roughly " +
        Math.max(1, Math.round(annual / 65)) +
        " people gain safe water access today.";
    }

    // donate button
    donateAmtEl.textContent = monthly ? fmt(amt) + "/mo" : fmt(amt);
    donateBtn.disabled = amt <= 0;
    donateBtn.style.opacity = amt <= 0 ? "0.55" : "";
    donateBtn.style.cursor = amt <= 0 ? "not-allowed" : "";
  }

  // ---- Events: frequency ----
  function setFreq(freq) {
    if (state.freq === freq) return;
    state.freq = freq;
    render();
  }
  freqOpts.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setFreq(btn.getAttribute("data-freq"));
    });
    // arrow-key navigation for the radiogroup
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        var other = freqOpts.find(function (b) { return b !== btn; });
        if (other) { other.focus(); setFreq(other.getAttribute("data-freq")); }
      }
    });
  });

  // ---- Events: presets ----
  function selectPreset(btn) {
    amountBtns.forEach(function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    state.amount = parseFloat(btn.getAttribute("data-amount"));
    if (customInput) customInput.value = "";
    render();
  }
  amountBtns.forEach(function (btn) {
    btn.addEventListener("click", function () { selectPreset(btn); });
  });

  // ---- Events: custom amount ----
  if (customInput) {
    customInput.addEventListener("input", function () {
      var v = parseFloat(customInput.value);
      if (customInput.value === "") {
        // fall back to last active preset, or default
        var active = amountBtns.find(function (b) { return b.classList.contains("is-active"); });
        state.amount = active ? parseFloat(active.getAttribute("data-amount")) : 25;
        render();
        return;
      }
      amountBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      state.amount = isNaN(v) ? 0 : v;
      render();
    });
  }

  // ---- Events: donate ----
  donateBtn.addEventListener("click", function () {
    var amt = getAmount();
    if (amt <= 0) { toast("Please enter an amount to continue."); return; }
    var msg =
      state.freq === "monthly"
        ? "Thank you! Your " + fmt(amt) + "/month gift is ready to confirm 💧"
        : "Thank you! Your one-time " + fmt(amt) + " gift is ready to confirm 💧";
    toast(msg);
  });

  // ---- Init ----
  render();
})();
