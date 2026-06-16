(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");

  function toast(msg) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");

    var dot = document.createElement("span");
    dot.className = "toast-dot";
    el.appendChild(dot);

    var text = document.createElement("span");
    text.textContent = msg;
    el.appendChild(text);

    toastWrap.appendChild(el);
    // Force reflow so the entrance transition runs.
    void el.offsetWidth;
    el.classList.add("is-in");

    window.setTimeout(function () {
      el.classList.remove("is-in");
      window.setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 280);
    }, 2600);
  }

  /* ---------- Element refs ---------- */
  var premium = document.querySelector(".premium");
  var premiumGrid = document.getElementById("premiumGrid");
  var kpis = document.querySelector(".kpis");
  var lockOverlay = document.getElementById("lockOverlay");
  var unlockBtn = document.getElementById("unlockBtn");
  var plansBtn = document.getElementById("plansBtn");
  var planPill = document.getElementById("planPill");
  var planPillText = document.getElementById("planPillText");

  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");
  var modalClose = document.getElementById("modalClose");

  var unlocked = false;
  var lastFocus = null;

  /* ---------- Unlock (reveal premium content) ---------- */
  function revealRealNumbers() {
    var els = document.querySelectorAll("[data-real]");
    Array.prototype.forEach.call(els, function (el) {
      el.textContent = el.getAttribute("data-real");
    });
  }

  function unlock(planName) {
    if (unlocked) {
      toast("Already on Northwind Pro");
      return;
    }
    unlocked = true;

    revealRealNumbers();

    if (premium) premium.classList.add("is-unlocked");
    if (kpis) kpis.classList.add("is-unlocked");
    if (premiumGrid) premiumGrid.setAttribute("aria-hidden", "false");

    if (planPill) planPill.classList.add("is-pro");
    if (planPillText) planPillText.textContent = (planName || "Pro") + " plan";

    if (unlockBtn) {
      unlockBtn.disabled = true;
      unlockBtn.textContent = "Unlocked";
    }

    toast("Unlocked — full report revealed (demo)");
  }

  if (unlockBtn) {
    unlockBtn.addEventListener("click", function () {
      unlock("Pro");
    });
  }

  /* ---------- Plans modal ---------- */
  function openModal() {
    if (!modal || !overlay) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    modal.hidden = false;
    if (modalClose) {
      window.requestAnimationFrame(function () {
        try {
          modalClose.focus();
        } catch (e) {}
      });
    }
  }

  function closeModal() {
    if (!modal || !overlay) return;
    modal.hidden = true;
    overlay.hidden = true;
    if (lastFocus && typeof lastFocus.focus === "function") {
      try {
        lastFocus.focus();
      } catch (e) {}
    }
  }

  if (plansBtn) plansBtn.addEventListener("click", openModal);
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);

  // Focus trap within the modal.
  if (modal) {
    modal.addEventListener("keydown", function (ev) {
      if (ev.key !== "Tab") return;
      var focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Billing cycle toggle ---------- */
  var cycleOpts = Array.prototype.slice.call(
    document.querySelectorAll(".cycle-opt")
  );
  var amounts = Array.prototype.slice.call(
    document.querySelectorAll(".plan-price .amount")
  );
  var pers = Array.prototype.slice.call(document.querySelectorAll(".per"));
  var cycleNote = document.getElementById("cycleNote");

  function setCycle(cycle) {
    cycleOpts.forEach(function (opt) {
      var on = opt.getAttribute("data-cycle") === cycle;
      opt.classList.toggle("is-active", on);
      opt.setAttribute("aria-pressed", String(on));
    });
    amounts.forEach(function (a) {
      var val = a.getAttribute(cycle === "annual" ? "data-annual" : "data-monthly");
      if (val) a.textContent = val;
    });
    pers.forEach(function (p) {
      p.textContent = cycle === "annual" ? "/mo, billed yearly" : "/mo";
    });
    if (cycleNote) cycleNote.textContent = cycle === "annual" ? "annually" : "monthly";
  }

  cycleOpts.forEach(function (opt) {
    opt.addEventListener("click", function () {
      setCycle(opt.getAttribute("data-cycle"));
    });
  });

  /* ---------- Plan CTAs ---------- */
  var planCtas = Array.prototype.slice.call(
    document.querySelectorAll(".plan-cta")
  );
  planCtas.forEach(function (cta) {
    cta.addEventListener("click", function () {
      var plan = cta.getAttribute("data-plan");
      if (cta.hasAttribute("data-unlock")) {
        closeModal();
        unlock(plan);
      } else {
        toast("You're already on the " + plan + " plan");
      }
    });
  });

  /* ---------- Esc closes the modal ---------- */
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && modal && !modal.hidden) {
      closeModal();
    }
  });
})();
