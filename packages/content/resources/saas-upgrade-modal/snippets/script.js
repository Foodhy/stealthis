(function () {
  "use strict";

  // ---- State ----
  var state = {
    plan: "pro",      // pro | business
    period: "monthly", // monthly | annual
    seats: 8,
  };
  var MIN_SEATS = 1;
  var MAX_SEATS = 200;
  var prices = {
    pro: { monthly: 29, annual: 23, label: "Pro" },
    business: { monthly: 49, annual: 39, label: "Business" },
  };
  // Fraction of the current cycle already elapsed (fictional) → proration credit on unused Starter time is $0,
  // but we model a small credit from a previously paid add-on to make the note meaningful.
  var REMAINING_CYCLE_FRACTION = 0.62; // ~19 days left of 30
  var RENEW_DATE = "Jul 1";

  // ---- Elements ----
  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("upgradeModal");
  var panel = document.getElementById("modalPanel");
  var viewCompare = document.getElementById("viewCompare");
  var viewSuccess = document.getElementById("viewSuccess");

  var openBtn = document.getElementById("openUpgrade");
  var closeBtn = document.getElementById("closeBtn");
  var cancelBtn = document.getElementById("cancelBtn");
  var confirmBtn = document.getElementById("confirmBtn");
  var doneBtn = document.getElementById("doneBtn");

  var billMonthly = document.getElementById("billMonthly");
  var billAnnual = document.getElementById("billAnnual");

  var seatInput = document.getElementById("seatInput");
  var seatMinus = document.getElementById("seatMinus");
  var seatPlus = document.getElementById("seatPlus");

  var planCards = Array.prototype.slice.call(document.querySelectorAll(".plan[data-plan]"));
  var selectBtns = Array.prototype.slice.call(document.querySelectorAll(".select-plan"));

  var sumPlan = document.getElementById("sumPlan");
  var sumSeats = document.getElementById("sumSeats");
  var sumPeriod = document.getElementById("sumPeriod");
  var sumBase = document.getElementById("sumBase");
  var sumProration = document.getElementById("sumProration");
  var sumTotal = document.getElementById("sumTotal");
  var prorationRow = document.getElementById("prorationRow");

  var lastFocused = null;

  // ---- Helpers ----
  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function toast(msg) {
    var wrap = document.getElementById("toastWrap");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  // ---- Pricing render ----
  function unit() {
    return prices[state.plan][state.period];
  }

  function monthlyTotal() {
    // unit is per-seat-per-month (annual already discounted per month)
    return unit() * state.seats;
  }

  function renderPrices() {
    // update per-card amounts to reflect the billing period
    Object.keys(prices).forEach(function (key) {
      var amt = document.querySelector('.amount[data-price="' + key + '"]');
      if (amt) amt.textContent = "$" + prices[key][state.period];
    });
  }

  function renderSummary() {
    var base = monthlyTotal();
    // Annual is billed up front for 12 months; monthly billed per month.
    var billedNow = state.period === "annual" ? base * 12 : base;
    // Proration credit: a small unused credit applied to the first invoice.
    var credit = state.period === "annual" ? 0 : Math.min(base * (1 - REMAINING_CYCLE_FRACTION), base) * 0.25;
    credit = Math.round(credit * 100) / 100;
    var dueToday = Math.max(0, billedNow - credit);

    sumPlan.textContent = prices[state.plan].label;
    sumSeats.textContent = state.seats + (state.seats === 1 ? " seat" : " seats");
    sumPeriod.textContent = state.period === "annual" ? "billed annually" : "monthly";
    sumBase.textContent = money(billedNow);

    if (credit > 0) {
      prorationRow.style.display = "";
      sumProration.textContent = "−" + money(credit);
    } else {
      prorationRow.style.display = "none";
    }
    sumTotal.textContent = money(dueToday);

    var note = document.getElementById("prorationNote");
    if (state.period === "annual") {
      note.innerHTML =
        'Billed annually today, then <span id="renewAmount">' +
        money(base * 12) + "/yr</span> on " + RENEW_DATE + ".";
    } else {
      note.innerHTML =
        "You'll be charged a prorated amount now, then " +
        '<span id="renewAmount">' + money(base) + "/mo</span> on " + RENEW_DATE + ".";
    }
  }

  function renderPlanSelection() {
    planCards.forEach(function (card) {
      var on = card.getAttribute("data-plan") === state.plan;
      card.setAttribute("aria-pressed", on ? "true" : "false");
    });
    selectBtns.forEach(function (b) {
      var on = b.getAttribute("data-plan") === state.plan;
      b.textContent = on ? "✓ Selected" : "Select " + prices[b.getAttribute("data-plan")].label;
    });
  }

  function renderAll() {
    renderPrices();
    renderPlanSelection();
    renderSummary();
  }

  // ---- Billing toggle ----
  function setPeriod(p) {
    state.period = p;
    var monthlyOn = p === "monthly";
    billMonthly.classList.toggle("active", monthlyOn);
    billAnnual.classList.toggle("active", !monthlyOn);
    billMonthly.setAttribute("aria-pressed", String(monthlyOn));
    billAnnual.setAttribute("aria-pressed", String(!monthlyOn));
    renderAll();
  }
  billMonthly.addEventListener("click", function () { setPeriod("monthly"); });
  billAnnual.addEventListener("click", function () {
    setPeriod("annual");
    toast("Annual billing — you save 20%.");
  });

  // ---- Seats ----
  function setSeats(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) n = MIN_SEATS;
    n = Math.max(MIN_SEATS, Math.min(MAX_SEATS, n));
    state.seats = n;
    seatInput.value = n;
    seatMinus.disabled = n <= MIN_SEATS;
    seatPlus.disabled = n >= MAX_SEATS;
    renderSummary();
  }
  seatMinus.addEventListener("click", function () { setSeats(state.seats - 1); });
  seatPlus.addEventListener("click", function () { setSeats(state.seats + 1); });
  seatInput.addEventListener("input", function () {
    var cleaned = seatInput.value.replace(/[^0-9]/g, "");
    seatInput.value = cleaned;
  });
  seatInput.addEventListener("change", function () { setSeats(seatInput.value); });
  seatInput.addEventListener("blur", function () { setSeats(seatInput.value); });

  // ---- Plan selection ----
  function selectPlan(plan) {
    if (!prices[plan]) return;
    state.plan = plan;
    renderAll();
  }
  planCards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("button")) return; // button handles itself
      selectPlan(card.getAttribute("data-plan"));
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectPlan(card.getAttribute("data-plan"));
      }
    });
  });
  selectBtns.forEach(function (b) {
    b.addEventListener("click", function () { selectPlan(b.getAttribute("data-plan")); });
  });

  // ---- Focus trap ----
  function focusable() {
    return Array.prototype.slice.call(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  function trap(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key !== "Tab") return;
    var nodes = focusable();
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ---- Open / close ----
  function openModal() {
    lastFocused = document.activeElement;
    // reset to compare view
    viewSuccess.hidden = true;
    viewCompare.hidden = false;
    overlay.hidden = false;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    renderAll();
    setSeats(state.seats);
    document.addEventListener("keydown", trap);
    setTimeout(function () { closeBtn.focus(); }, 30);
  }

  function closeModal() {
    overlay.hidden = true;
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", trap);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  doneBtn.addEventListener("click", function () {
    closeModal();
    toast("Welcome to " + prices[state.plan].label + " — enjoy the new limits!");
  });

  // ---- Confirm → success ----
  var GAINS = {
    pro: [
      "Unlimited seats — invite the whole team",
      "Unlimited projects",
      "Advanced analytics dashboards",
      "Priority support & faster response SLAs",
    ],
    business: [
      "Everything in Pro, plus more",
      "Dedicated customer success manager",
      "SSO & SCIM provisioning",
      "Audit log & advanced security controls",
    ],
  };

  confirmBtn.addEventListener("click", function () {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Processing…";
    setTimeout(function () {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Confirm upgrade";

      // populate success view
      document.getElementById("successPlan").textContent = prices[state.plan].label;
      document.getElementById("successSeats").textContent =
        state.seats + (state.seats === 1 ? " seat" : " seats");
      var list = document.getElementById("gainList");
      list.innerHTML = "";
      GAINS[state.plan].forEach(function (g) {
        var li = document.createElement("li");
        li.textContent = g;
        list.appendChild(li);
      });

      // reflect on the page shell
      document.getElementById("planPill").textContent = prices[state.plan].label + " plan";
      document.getElementById("seatUsage").textContent = "5 / " + state.seats;

      viewCompare.hidden = true;
      viewSuccess.hidden = false;
      panel.scrollTop = 0;
      setTimeout(function () { document.getElementById("successTitle").focus(); }, 40);
    }, 850);
  });

  // ---- Init ----
  renderAll();
  setSeats(state.seats);
})();
