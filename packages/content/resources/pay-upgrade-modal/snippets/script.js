(function () {
  "use strict";

  // Monthly base prices; annual is the equivalent /mo rate when billed yearly (~20% off).
  var PRICES = {
    starter: { monthly: 19, annual: 15 },
    pro: { monthly: 49, annual: 39 },
  };
  var cycle = "monthly";
  var upgraded = false;

  // ---- element refs ----
  var trigger = document.getElementById("upgradeTrigger");
  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");
  var modalClose = document.getElementById("modalClose");
  var laterBtn = document.getElementById("laterBtn");
  var confirmBtn = document.getElementById("confirmBtn");
  var confirmLabel = confirmBtn.querySelector(".confirm-label");
  var deltaAmount = document.getElementById("deltaAmount");
  var deltaPer = document.getElementById("deltaPer");
  var deltaSub = document.getElementById("deltaSub");
  var totalAmount = document.getElementById("totalAmount");
  var totalPer = document.getElementById("totalPer");
  var planTag = document.getElementById("planTag");
  var curPlanLabels = document.querySelectorAll(".cur-plan");
  var toastWrap = document.getElementById("toastWrap");

  var lastFocus = null;
  var confirmTimer = null;

  // ---- toast helper ----
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = '<span class="dot"></span><span></span>';
    el.lastElementChild.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      el.addEventListener("animationend", function () {
        el.remove();
      });
    }, 2800);
  }

  // ---- price / delta rendering ----
  function renderPrices() {
    document.querySelectorAll("[data-price]").forEach(function (el) {
      var key = el.getAttribute("data-price");
      el.textContent = "$" + PRICES[key][cycle];
    });

    var perLabel = cycle === "annual" ? "/mo, billed yearly" : "/mo";
    document.querySelectorAll("[data-per]").forEach(function (el) {
      el.textContent = perLabel;
    });

    var diff = PRICES.pro[cycle] - PRICES.starter[cycle];
    deltaAmount.textContent = "$" + diff;
    totalAmount.textContent = "$" + PRICES.pro[cycle];

    var shortPer = cycle === "annual" ? "/mo" : "/mo";
    deltaPer.textContent = shortPer;
    totalPer.textContent = shortPer;

    deltaSub.textContent =
      cycle === "annual"
        ? "Billed yearly today, prorated for the rest of this cycle."
        : "Charged today, prorated for the rest of this cycle.";
  }

  // ---- billing cycle toggle ----
  function setCycle(next) {
    cycle = next;
    document.querySelectorAll(".cycle-opt").forEach(function (b) {
      var on = b.getAttribute("data-cycle") === next;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    renderPrices();
  }

  // ---- modal open / close ----
  function openModal() {
    if (upgraded) {
      toast("You're already on Pro — enjoy the extra headroom.");
      return;
    }
    lastFocus = document.activeElement;
    overlay.hidden = false;
    overlay.classList.remove("is-closing");
    modal.hidden = false;
    modal.classList.remove("is-closing");
    // move focus into the dialog
    requestAnimationFrame(function () {
      modalClose.focus();
    });
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    overlay.classList.add("is-closing");
    modal.classList.add("is-closing");
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      overlay.hidden = true;
      modal.hidden = true;
      overlay.classList.remove("is-closing");
      modal.classList.remove("is-closing");
    }
    modal.addEventListener("animationend", finish, { once: true });
    // fallback if animations are disabled (reduced motion)
    setTimeout(finish, 220);

    document.removeEventListener("keydown", onKeydown);
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      trapFocus(e);
    }
  }

  function trapFocus(e) {
    var focusables = modal.querySelectorAll(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    var visible = [];
    focusables.forEach(function (el) {
      if (el.offsetParent !== null || el === document.activeElement) visible.push(el);
    });
    if (!visible.length) return;
    var first = visible[0];
    var last = visible[visible.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ---- confirm / processing / success flow ----
  function confirmUpgrade() {
    if (confirmBtn.classList.contains("is-processing") || upgraded) return;

    confirmBtn.classList.add("is-processing");
    confirmBtn.setAttribute("aria-busy", "true");
    confirmLabel.textContent = "Processing…";

    confirmTimer = setTimeout(function () {
      confirmBtn.classList.remove("is-processing");
      confirmBtn.classList.add("is-done");
      confirmBtn.removeAttribute("aria-busy");
      confirmLabel.textContent = "Upgraded to Pro ✓";
      upgraded = true;

      // reflect new state in the underlying settings card
      planTag.textContent = "Pro";
      curPlanLabels.forEach(function (el) {
        el.textContent = "Pro";
      });
      trigger.textContent = "Manage plan";

      toast("You're on Pro — 20 seats and higher limits unlocked.");

      setTimeout(closeModal, 1100);
    }, 1500);
  }

  // ---- wiring ----
  trigger.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  laterBtn.addEventListener("click", function () {
    closeModal();
    toast("No rush — your Starter plan stays active.");
  });
  overlay.addEventListener("click", closeModal);
  confirmBtn.addEventListener("click", confirmUpgrade);

  document.querySelectorAll(".cycle-opt").forEach(function (b) {
    b.addEventListener("click", function () {
      setCycle(b.getAttribute("data-cycle"));
    });
  });

  // ---- init ----
  setCycle("monthly");
})();
