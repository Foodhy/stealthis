(function () {
  "use strict";

  var PRO_MONTHLY = 12;
  var PRO_ANNUAL = 10; // 20% off, billed annually

  var popover = document.getElementById("popover");
  var popTitle = document.getElementById("popTitle");
  var popBody = document.getElementById("popBody");
  var popUpgrade = document.getElementById("popUpgrade");
  var lockedCountEl = document.getElementById("lockedCount");
  var planBadge = document.getElementById("planBadge");
  var planLabel = document.getElementById("planLabel");
  var toastEl = document.getElementById("toast");

  var activeTrigger = null;
  var toastTimer = null;

  /* ---------- Toast ---------- */
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML =
      '<span class="toast__check" aria-hidden="true">✓</span>' + escapeHtml(msg);
    toastEl.hidden = false;
    // force reflow so the transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 280);
    }, 2600);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- Popover positioning ---------- */
  function openPopover(trigger) {
    if (trigger.getAttribute("data-locked") !== "true") return;

    var feature =
      trigger.getAttribute("data-feature") || "this feature";
    popBody.textContent =
      "Upgrade to Northwind Pro to unlock “" + feature + ".”";

    activeTrigger = trigger;
    popover.hidden = false;
    popover.classList.remove("is-below");

    position(trigger);
    trigger.setAttribute("aria-expanded", "true");

    // focus first action for keyboard users
    requestAnimationFrame(function () {
      popUpgrade.focus();
    });

    document.addEventListener("keydown", onKeydown, true);
    document.addEventListener("mousedown", onOutside, true);
    window.addEventListener("resize", reposition, true);
    window.addEventListener("scroll", reposition, true);
  }

  function position(trigger) {
    var r = trigger.getBoundingClientRect();
    var pw = popover.offsetWidth;
    var ph = popover.offsetHeight;
    var pad = 10;
    var sx = window.scrollX;
    var sy = window.scrollY;

    // horizontal: align left edge with trigger, clamp to viewport
    var left = r.left + sx;
    var maxLeft = sx + document.documentElement.clientWidth - pw - pad;
    if (left > maxLeft) left = maxLeft;
    if (left < sx + pad) left = sx + pad;

    // vertical: prefer below, flip above if it would overflow
    var below = r.bottom + sy + pad;
    var spaceBelow = window.innerHeight - r.bottom;
    var top;
    if (spaceBelow < ph + pad + 8 && r.top > ph + pad) {
      top = r.top + sy - ph - pad;
      popover.classList.add("is-below");
    } else {
      top = below;
      popover.classList.remove("is-below");
    }

    popover.style.left = Math.round(left) + "px";
    popover.style.top = Math.round(top) + "px";

    // point the arrow at the trigger
    var arrow = popover.querySelector(".popover__arrow");
    if (arrow) {
      var ax = r.left + sx - left + Math.min(r.width / 2, 28) - 6;
      arrow.style.left = Math.max(12, Math.min(pw - 24, ax)) + "px";
    }
  }

  function reposition() {
    if (!popover.hidden && activeTrigger) position(activeTrigger);
  }

  function closePopover(returnFocus) {
    if (popover.hidden) return;
    popover.hidden = true;
    document.removeEventListener("keydown", onKeydown, true);
    document.removeEventListener("mousedown", onOutside, true);
    window.removeEventListener("resize", reposition, true);
    window.removeEventListener("scroll", reposition, true);
    if (activeTrigger) {
      activeTrigger.removeAttribute("aria-expanded");
      if (returnFocus) activeTrigger.focus();
    }
    activeTrigger = null;
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closePopover(true);
    }
  }

  function onOutside(e) {
    if (popover.contains(e.target)) return;
    if (activeTrigger && activeTrigger.contains(e.target)) return;
    closePopover(false);
  }

  /* ---------- Wire up gated triggers ---------- */
  function bindTriggers() {
    var triggers = document.querySelectorAll('[data-locked="true"]');
    triggers.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        if (t === activeTrigger && !popover.hidden) {
          closePopover(true);
        } else {
          openPopover(t);
        }
      });
    });
  }

  /* ---------- Upgrade flow ---------- */
  function upgrade() {
    closePopover(false);

    // 1. flip plan badge
    planBadge.setAttribute("data-plan", "pro");
    planLabel.textContent = "Pro plan";

    // 2. unlock each gated ROW
    var lockedRows = document.querySelectorAll(".row--locked");
    lockedRows.forEach(function (row, i) {
      setTimeout(function () {
        unlockRow(row);
      }, 90 * i);
    });

    // 3. unlock toolbar tools
    document.querySelectorAll(".tool--locked").forEach(function (tool) {
      tool.classList.remove("tool--locked");
      tool.removeAttribute("data-locked");
      tool.removeAttribute("aria-disabled");
      var lock = tool.querySelector(".tool__lock");
      if (lock) lock.remove();
    });

    // 4. update the locked-count chip
    if (lockedCountEl) {
      lockedCountEl.textContent = "All features unlocked";
      lockedCountEl.style.color = "var(--ok)";
      lockedCountEl.style.background = "rgba(47,158,111,0.12)";
      lockedCountEl.style.borderColor = "rgba(47,158,111,0.3)";
    }

    // 5. swap the main upgrade button
    var mainBtn = document.getElementById("upgradeMain");
    if (mainBtn) {
      mainBtn.textContent = "✓ You’re on Pro";
      mainBtn.disabled = true;
      mainBtn.classList.remove("btn--primary");
      mainBtn.classList.add("btn--ghost");
      mainBtn.style.cursor = "default";
    }

    toast("Welcome to Northwind Pro — everything’s unlocked.");
  }

  function unlockRow(row) {
    row.classList.remove("row--locked");
    row.classList.add("row--unlocked");
    row.removeAttribute("data-locked");

    // remove PRO pill
    var pill = row.querySelector(".pro-pill");
    if (pill) pill.remove();

    // replace the "Locked" CTA with a live toggle (default on)
    var cta = row.querySelector(".row__cta");
    if (cta) {
      var label = document.createElement("label");
      label.className = "switch";
      label.innerHTML =
        '<input type="checkbox" checked>' +
        '<span class="switch__track" aria-hidden="true"></span>' +
        '<span class="sr-only">Toggle feature</span>';
      cta.replaceWith(label);
    }
  }

  /* ---------- Annual billing toggle ---------- */
  function bindBilling() {
    var annual = document.getElementById("annualToggle");
    var price = document.getElementById("proPrice");
    var per = document.getElementById("proPer");
    if (!annual || !price) return;

    annual.addEventListener("change", function () {
      var amount = annual.checked ? PRO_ANNUAL : PRO_MONTHLY;
      price.textContent = "$" + amount;
      per.textContent = annual.checked ? "/seat · mo*" : "/seat · mo";
      popUpgrade.textContent = "Upgrade — $" + amount + "/mo";
      toast(
        annual.checked
          ? "Annual billing — $" + amount + "/seat, saving 20%."
          : "Switched to monthly billing."
      );
    });
  }

  /* ---------- Misc actions ---------- */
  function bindMisc() {
    if (popUpgrade) popUpgrade.addEventListener("click", upgrade);

    var mainBtn = document.getElementById("upgradeMain");
    if (mainBtn) mainBtn.addEventListener("click", upgrade);

    document.querySelectorAll("[data-pop-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        closePopover(true);
      });
    });

    ["seePlans", "seePlans2"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el)
        el.addEventListener("click", function () {
          toast("Opening the full plan comparison…");
          var pro = document.querySelector(".plan-card--pro");
          if (pro) pro.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });

    // safe interactive tools just acknowledge
    document.querySelectorAll(".tool:not(.tool--locked)").forEach(function (t) {
      t.addEventListener("click", function () {
        var tip = t.getAttribute("data-tip");
        if (tip) toast(tip + " applied.");
      });
    });
  }

  /* ---------- Init ---------- */
  bindTriggers();
  bindBilling();
  bindMisc();
})();
