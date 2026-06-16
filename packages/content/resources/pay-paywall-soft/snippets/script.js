(function () {
  "use strict";

  var FREE_LIMIT = 5;
  var remaining = 4; // reader has already opened this article (1 of 5 used)

  // Pricing model: monthly base prices + per-cycle display.
  var PRICES = {
    starter: { monthly: 6, annual: 5 },
    pro: { monthly: 12, annual: 10 },
    scale: { monthly: 29, annual: 23 },
  };
  var cycle = "monthly";
  var subscribed = false;

  // ---- element refs ----
  var reader = document.querySelector(".reader");
  var ringFill = document.getElementById("ringFill");
  var ringNum = document.getElementById("ringNum");
  var meterRing = document.getElementById("meterRing");
  var meterCount = document.getElementById("meterCount");
  var paybar = document.getElementById("paybar");
  var paybarEyebrow = document.getElementById("paybarEyebrow");
  var simBtn = document.getElementById("simBtn");
  var resetBtn = document.getElementById("resetBtn");
  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");
  var modalClose = document.getElementById("modalClose");
  var cycleNote = document.getElementById("cycleNote");
  var toastWrap = document.getElementById("toastWrap");

  var RING_CIRCUM = 2 * Math.PI * 18; // r=18 → ~113.1

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
    }, 2600);
  }

  // ---- meter rendering ----
  function renderMeter() {
    var used = FREE_LIMIT - remaining;
    var pct = remaining / FREE_LIMIT;

    // ring shrinks as reads are used up
    ringFill.style.strokeDasharray = RING_CIRCUM.toFixed(2);
    ringFill.style.strokeDashoffset = (RING_CIRCUM * (1 - pct)).toFixed(2);
    ringNum.textContent = String(remaining);

    meterRing.classList.toggle("is-low", remaining > 0 && remaining <= 2);
    meterRing.classList.toggle("is-out", remaining === 0);

    if (subscribed) {
      meterCount.textContent = "Unlimited";
    } else {
      meterCount.textContent = remaining + " of " + FREE_LIMIT;
    }

    // paybar copy
    paybar.classList.toggle("is-low", remaining > 0 && remaining <= 2);
    if (remaining === 1) {
      paybarEyebrow.textContent = "You have 1 free read left";
    } else if (remaining > 0) {
      paybarEyebrow.textContent = "You have " + remaining + " free reads left";
    } else {
      paybarEyebrow.textContent = "You're out of free reads";
    }

    // hard block at zero
    reader.classList.toggle("is-blocked", remaining === 0 && !subscribed);
    void used;
  }

  // ---- simulate reading another article ----
  function readAnother() {
    if (subscribed) {
      toast("You have unlimited reads.");
      return;
    }
    if (remaining <= 0) {
      openModal();
      return;
    }
    remaining -= 1;
    renderMeter();
    if (remaining === 0) {
      toast("That was your last free read.");
    } else if (remaining <= 2) {
      toast(remaining + " free read" + (remaining === 1 ? "" : "s") + " left this month.");
    } else {
      toast("Article opened — " + remaining + " free reads left.");
    }
  }

  // ---- modal ----
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    modal.hidden = false;
    modalClose.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    overlay.hidden = true;
    modal.hidden = true;
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
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ---- billing cycle toggle ----
  function setCycle(next) {
    cycle = next;
    document.querySelectorAll(".cycle-opt").forEach(function (b) {
      var on = b.getAttribute("data-cycle") === next;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-price]").forEach(function (el) {
      var key = el.getAttribute("data-price");
      el.textContent = "$" + PRICES[key][cycle];
    });
    document.querySelectorAll("[data-per]").forEach(function (el) {
      el.textContent = cycle === "annual" ? "/mo, billed yearly" : "/mo";
    });
    cycleNote.textContent = cycle === "annual" ? "annually" : "monthly";
  }

  // ---- subscribe flow ----
  function subscribe(planName) {
    subscribed = true;
    remaining = FREE_LIMIT;
    reader.classList.remove("is-blocked");
    reader.classList.add("is-unlimited");
    renderMeter();
    closeModal();
    var suffix = planName ? " — " + planName + " (" + cycle + ")" : "";
    toast("You're subscribed" + suffix + ". Enjoy unlimited reading!");
  }

  // ---- wiring ----
  simBtn.addEventListener("click", readAnother);

  resetBtn.addEventListener("click", function () {
    subscribed = false;
    remaining = FREE_LIMIT - 1;
    reader.classList.remove("is-unlimited", "is-blocked");
    renderMeter();
    toast("Meter reset to " + remaining + " of " + FREE_LIMIT + ".");
  });

  document.querySelectorAll("[data-subscribe]").forEach(function (b) {
    b.addEventListener("click", openModal);
  });

  modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  document.querySelectorAll(".cycle-opt").forEach(function (b) {
    b.addEventListener("click", function () {
      setCycle(b.getAttribute("data-cycle"));
    });
  });

  document.querySelectorAll(".plan-cta").forEach(function (b) {
    b.addEventListener("click", function () {
      subscribe(b.getAttribute("data-plan"));
    });
  });

  // ---- init ----
  setCycle("monthly");
  renderMeter();
})();
