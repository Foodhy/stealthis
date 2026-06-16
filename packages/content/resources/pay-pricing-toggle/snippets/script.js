(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition replays
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 260);
    }, 2400);
  }

  /* ---------- Elements ---------- */
  var seg = document.getElementById("billing-seg");
  var pill = document.getElementById("seg-pill");
  var btnMonthly = document.getElementById("btn-monthly");
  var btnAnnual = document.getElementById("btn-annual");
  var billingNote = document.getElementById("billing-note");
  var periodSummary = document.getElementById("period-summary");
  var buttons = [btnMonthly, btnAnnual];

  var amounts = Array.prototype.slice.call(
    document.querySelectorAll(".plan__amount")
  );
  var perLabels = Array.prototype.slice.call(
    document.querySelectorAll("[data-period-label]")
  );
  var billedNotes = Array.prototype.slice.call(
    document.querySelectorAll("[data-billed-note]")
  );

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var current = "monthly";

  /* ---------- Move the sliding pill under the active button ---------- */
  function movePill(btn) {
    if (!pill || !btn) return;
    // btn.offsetLeft is measured from the seg's padding box (4px inset),
    // which is also where the pill's left:4px origin sits.
    pill.style.width = btn.offsetWidth + "px";
    pill.style.transform = "translateX(" + (btn.offsetLeft - 4) + "px)";
  }

  /* ---------- Animated number count-up between values ---------- */
  function countTo(el, from, to) {
    if (from === to) {
      el.textContent = String(to);
      return;
    }
    if (prefersReduced) {
      el.textContent = String(to);
      return;
    }
    el.classList.remove("is-swapping");
    void el.offsetWidth;
    el.classList.add("is-swapping");

    var duration = 420;
    var start = null;
    function ease(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var val = Math.round(from + (to - from) * ease(p));
      el.textContent = String(val);
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(to);
      }
    }
    requestAnimationFrame(step);
  }

  /* ---------- Apply a billing period ---------- */
  function setPeriod(period, opts) {
    opts = opts || {};
    var isAnnual = period === "annual";
    current = period;

    // Toggle button state + aria-pressed (persists the choice)
    buttons.forEach(function (b) {
      var active = b.dataset.period === period;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var activeBtn = isAnnual ? btnAnnual : btnMonthly;
    movePill(activeBtn);

    // Prices
    amounts.forEach(function (el) {
      var from = parseInt(el.textContent, 10) || 0;
      var to = parseInt(
        isAnnual ? el.dataset.annual : el.dataset.monthly,
        10
      );
      if (opts.instant) {
        el.textContent = String(to);
      } else {
        countTo(el, from, to);
      }
    });

    // Per-period labels
    perLabels.forEach(function (el) {
      el.textContent = isAnnual ? "/mo" : "/mo";
    });
    billedNotes.forEach(function (el) {
      el.textContent = isAnnual
        ? "per seat, billed annually"
        : "per seat, billed monthly";
    });

    // Notes / summary
    billingNote.textContent = isAnnual
      ? "Billed once a year — that's 2 months free. Cancel anytime."
      : "Billed monthly. Cancel anytime.";
    periodSummary.textContent = isAnnual
      ? "You're viewing annual pricing (20% off)."
      : "You're viewing monthly pricing.";

    // Persist
    try {
      localStorage.setItem("nw-billing", period);
    } catch (e) {
      /* storage may be blocked in sandboxed iframes */
    }
  }

  /* ---------- Events ---------- */
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      if (current === b.dataset.period) return;
      setPeriod(b.dataset.period);
      if (b.dataset.period === "annual") {
        toast("Annual billing applied — you save 20%.");
      } else {
        toast("Switched to monthly billing.");
      }
    });
  });

  // Keyboard: arrow keys move between the two segments
  seg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      btnAnnual.focus();
      btnAnnual.click();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      btnMonthly.focus();
      btnMonthly.click();
    } else if (e.key === "Home") {
      e.preventDefault();
      btnMonthly.focus();
      btnMonthly.click();
    } else if (e.key === "End") {
      e.preventDefault();
      btnAnnual.focus();
      btnAnnual.click();
    }
  });

  // Plan CTAs
  document.querySelectorAll("[data-plan-cta]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var plan = btn.getAttribute("data-plan-cta");
      var period = current === "annual" ? "annual" : "monthly";
      if (plan === "Scale") {
        toast("Opening sales chat for the Scale plan…");
      } else {
        toast("Starting your " + plan + " trial (" + period + " billing).");
      }
    });
  });

  /* ---------- Init: restore saved choice, position pill ---------- */
  var saved = "monthly";
  try {
    var s = localStorage.getItem("nw-billing");
    if (s === "annual" || s === "monthly") saved = s;
  } catch (e) {
    /* ignore */
  }

  // Position pill instantly first, then apply period without animating the
  // count-up on initial paint.
  requestAnimationFrame(function () {
    setPeriod(saved, { instant: true });
  });

  // Keep the pill aligned on resize.
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      movePill(current === "annual" ? btnAnnual : btnMonthly);
    }, 80);
  });
})();
