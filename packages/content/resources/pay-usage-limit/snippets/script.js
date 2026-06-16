(function () {
  "use strict";

  /* ---------- Config / state ---------- */
  var QUOTA = 1000;          // monthly credit allowance
  var PACK_SIZE = 500;       // credits per add-on pack
  var PACK_PRICE = 9;        // dollars per pack
  var MAX_PACKS = 20;
  var MIN_PACKS = 1;

  var state = {
    used: QUOTA,             // credits consumed this period (starts at the cap)
    addon: 0,                // purchased add-on credits available
    qty: 1,                  // packs selected in the stepper
    cycle: "monthly"
  };

  var PRICES = {
    monthly: { starter: "$0", pro: "$29", scale: "$99" },
    annual: { starter: "$0", pro: "$23", scale: "$79" }
  };

  /* ---------- Helpers ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return n.toLocaleString("en-US"); };
  var money = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  var toastWrap = $("toastWrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="toast-dot" aria-hidden="true"></span>' +
      "<span></span>";
    el.lastChild.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      el.addEventListener("animationend", function () { el.remove(); });
    }, 2600);
  }

  /* ---------- Usage meter rendering ---------- */
  var barFill = $("barFill");
  var usageBar = $("usageBar");
  var usedNum = $("usedNum");
  var totalNum = $("totalNum");
  var balanceWrap = $("balanceWrap");
  var balanceNum = $("balanceNum");
  var limitFlag = $("limitFlag");
  var limitFlagText = $("limitFlagText");
  var limitCard = $("limitCard");
  var limitTitle = $("limitTitle");
  var limitSub = $("limitSub");

  function renderMeter() {
    var total = QUOTA + state.addon;
    var pct = total > 0 ? Math.min(100, (state.used / total) * 100) : 100;
    var atLimit = state.used >= total;

    barFill.style.width = pct + "%";
    barFill.classList.toggle("is-full", atLimit);

    usedNum.textContent = fmt(state.used);
    totalNum.textContent = fmt(total);

    usageBar.setAttribute("aria-valuemax", String(total));
    usageBar.setAttribute("aria-valuenow", String(state.used));

    // Add-on balance line
    if (state.addon > 0) {
      balanceNum.textContent = fmt(state.addon);
      balanceWrap.hidden = false;
    } else {
      balanceWrap.hidden = true;
    }

    // Flag + headline shift once the user is no longer blocked
    if (atLimit) {
      limitFlag.classList.remove("is-ok");
      limitFlagText.textContent = "Limit reached";
      limitCard.classList.remove("is-resolved");
      limitTitle.textContent = "You've used all " + fmt(total) + " of your monthly credits";
    } else {
      limitFlag.classList.add("is-ok");
      limitFlagText.textContent = fmt(total - state.used) + " credits available";
      limitCard.classList.add("is-resolved");
      limitTitle.textContent = "You're back under your limit";
      limitSub.innerHTML =
        "Your add-on credits are live. Generation is enabled again — upgrade any time for a higher monthly allowance.";
    }
  }

  /* ---------- Stepper / purchase summary ---------- */
  var qtyInput = $("qtyInput");
  var incBtn = $("incBtn");
  var decBtn = $("decBtn");
  var packCredits = $("packCredits");
  var sumCredits = $("sumCredits");
  var sumQty = $("sumQty");
  var sumSubtotal = $("sumSubtotal");
  var sumTotal = $("sumTotal");
  var purchasePrice = $("purchasePrice");

  packCredits.textContent = fmt(PACK_SIZE);

  function clampQty(n) {
    if (isNaN(n) || n < MIN_PACKS) n = MIN_PACKS;
    if (n > MAX_PACKS) n = MAX_PACKS;
    return Math.floor(n);
  }

  function renderSummary() {
    var credits = state.qty * PACK_SIZE;
    var total = state.qty * PACK_PRICE;

    qtyInput.value = String(state.qty);
    sumCredits.textContent = fmt(credits);
    sumQty.textContent = String(state.qty);
    sumSubtotal.textContent = money(total);
    sumTotal.textContent = money(total);
    purchasePrice.textContent = money(total);

    decBtn.disabled = state.qty <= MIN_PACKS;
    incBtn.disabled = state.qty >= MAX_PACKS;
  }

  function setQty(n) {
    state.qty = clampQty(n);
    renderSummary();
  }

  incBtn.addEventListener("click", function () { setQty(state.qty + 1); });
  decBtn.addEventListener("click", function () { setQty(state.qty - 1); });
  qtyInput.addEventListener("input", function () {
    var v = parseInt(qtyInput.value.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(v)) { state.qty = clampQty(v); renderSummary(); }
  });
  qtyInput.addEventListener("blur", function () { setQty(state.qty); });
  qtyInput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") { e.preventDefault(); setQty(state.qty + 1); }
    if (e.key === "ArrowDown") { e.preventDefault(); setQty(state.qty - 1); }
  });

  /* ---------- Add-on panel toggle ---------- */
  var addonBtn = $("addonBtn");
  var addonPanel = $("addonPanel");

  addonBtn.addEventListener("click", function () {
    var open = !addonPanel.hidden;
    if (open) {
      addonPanel.hidden = true;
      addonBtn.setAttribute("aria-expanded", "false");
    } else {
      addonPanel.hidden = false;
      addonBtn.setAttribute("aria-expanded", "true");
      addonPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      qtyInput.focus();
    }
  });

  /* ---------- Purchase → success state ---------- */
  var purchaseBtn = $("purchaseBtn");
  var successBox = $("successBox");
  var successHead = $("successHead");
  var successSub = $("successSub");
  var resumeBtn = $("resumeBtn");

  purchaseBtn.addEventListener("click", function () {
    var addedCredits = state.qty * PACK_SIZE;
    var addedQty = state.qty;

    // Grant the credits to the balance and free up headroom in the meter.
    state.addon += addedCredits;
    // "Add credits back" — the consumed count stays, but total grows, so the
    // bar shrinks away from 100%.
    renderMeter();

    // Collapse the purchase panel, surface a success card.
    addonPanel.hidden = true;
    addonBtn.setAttribute("aria-expanded", "false");

    successHead.textContent = fmt(addedCredits) + " credits added";
    successSub.textContent =
      addedQty + " pack" + (addedQty === 1 ? "" : "s") + " purchased · new balance " +
      fmt(state.addon) + " add-on credits.";
    successBox.hidden = false;
    successBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Briefly pulse the bar to draw the eye to the change.
    barFill.classList.add("is-pulse");
    setTimeout(function () { barFill.classList.remove("is-pulse"); }, 1400);

    toast("Purchase complete — " + fmt(addedCredits) + " credits added");

    // Reset the stepper for any subsequent top-up.
    setQty(1);
  });

  resumeBtn.addEventListener("click", function () {
    toast("Picking up where you left off…");
    successBox.hidden = true;
  });

  /* ---------- Plans modal ---------- */
  var overlay = $("overlay");
  var modal = $("modal");
  var modalClose = $("modalClose");
  var upgradeBtn = $("upgradeBtn");
  var contactBtn = $("contactBtn");
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modalClose.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    overlay.hidden = true;
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      var f = modal.querySelectorAll(
        'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  upgradeBtn.addEventListener("click", openModal);
  contactBtn.addEventListener("click", function () {
    toast("Sales request sent — we'll be in touch shortly");
  });
  modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  /* ---------- Billing cycle toggle ---------- */
  var cycleOpts = modal.querySelectorAll(".cycle-opt");
  var cycleNote = $("cycleNote");

  function applyCycle(cycle) {
    state.cycle = cycle;
    var map = PRICES[cycle];
    var amounts = modal.querySelectorAll(".amount[data-price]");
    amounts.forEach(function (el) {
      var key = el.getAttribute("data-price");
      if (map[key]) el.textContent = map[key];
    });
    modal.querySelectorAll(".per[data-per]").forEach(function (el) {
      el.textContent = cycle === "annual" ? "/mo, billed yearly" : "/mo";
    });
    cycleNote.textContent = cycle === "annual" ? "annually" : "monthly";

    cycleOpts.forEach(function (b) {
      var active = b.getAttribute("data-cycle") === cycle;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  cycleOpts.forEach(function (b) {
    b.addEventListener("click", function () {
      applyCycle(b.getAttribute("data-cycle"));
    });
  });

  /* ---------- Plan selection ---------- */
  modal.querySelectorAll(".plan-cta[data-plan]").forEach(function (b) {
    b.addEventListener("click", function () {
      var plan = b.getAttribute("data-plan");
      closeModal();
      toast("Upgraded to " + plan + " — your new allowance is active");
    });
  });

  /* ---------- Init ---------- */
  renderMeter();
  renderSummary();
})();
