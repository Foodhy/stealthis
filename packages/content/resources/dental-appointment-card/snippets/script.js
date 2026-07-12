(function () {
  "use strict";

  var ICONS = {
    ok: '<path d="M20 6 9 17l-5-5"/>',
    warn: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>',
    danger: '<path d="M18 6 6 18M6 6l12 12"/>'
  };

  var BADGE = {
    confirmed: { cls: "badge--confirmed", label: "Confirmed", icon: '<path d="M20 6 9 17l-5-5"/>' },
    pending:   { cls: "badge--pending",  label: "Pending",   icon: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>' },
    cancelled: { cls: "badge--cancelled", label: "Cancelled", icon: '<path d="M18 6 6 18M6 6l12 12"/>' }
  };

  /* Suggested reschedule slots, cycled per card */
  var SLOTS = ["10:45 AM", "1:15 PM", "3:30 PM", "8:15 AM", "4:00 PM"];
  var slotIx = {};

  var toastWrap = document.querySelector("[data-toast-wrap]");

  function toast(msg, kind) {
    kind = kind || "ok";
    var el = document.createElement("div");
    el.className = "toast toast--" + kind;
    el.setAttribute("role", kind === "danger" ? "alert" : "status");
    el.innerHTML =
      '<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2.2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + (ICONS[kind] || ICONS.ok) + "</svg>" +
      "<span></span>";
    el.lastChild.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("--out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  function setStatus(card, status) {
    card.dataset.status = status;
    var badge = card.querySelector("[data-badge]");
    var conf = BADGE[status];
    badge.className = "badge " + conf.cls;
    badge.querySelector("svg").innerHTML = conf.icon;
    badge.querySelector("[data-badge-text]").textContent = conf.label;
    syncPendingSlot(card, status);
  }

  /* Show/hide the quick-confirm strip depending on status */
  function syncPendingSlot(card, status) {
    var slot = card.querySelector("[data-act='accept']");
    if (!slot) return;
    slot.style.display = status === "pending" ? "" : "none";
  }

  function treatmentName(card) {
    return card.querySelector(".card__treatment").textContent.trim();
  }

  function closeConfirm(card) {
    var box = card.querySelector("[data-confirm]");
    box.hidden = true;
    box.removeAttribute("data-danger");
    card.querySelectorAll(".card__actions .btn").forEach(function (b) { b.disabled = false; });
  }

  function openConfirm(card, act) {
    var box = card.querySelector("[data-confirm]");
    var msg = box.querySelector("[data-confirm-msg]");
    box.dataset.pendingAct = act;

    if (act === "cancel") {
      box.setAttribute("data-danger", "1");
      msg.textContent = "Cancel your " + treatmentName(card) + " appointment? This can’t be undone.";
    } else {
      box.removeAttribute("data-danger");
      var next = nextSlot(card.dataset.appt);
      box.dataset.newTime = next;
      msg.textContent = "Move this visit to the next open slot at " + next + "?";
    }

    box.hidden = false;
    card.querySelectorAll(".card__actions .btn").forEach(function (b) { b.disabled = true; });
    var focusBtn = box.querySelector("[data-confirm-yes]");
    if (focusBtn) focusBtn.focus();
  }

  function nextSlot(id) {
    if (slotIx[id] === undefined) slotIx[id] = Math.floor(Math.random() * SLOTS.length);
    var s = SLOTS[slotIx[id] % SLOTS.length];
    slotIx[id]++;
    return s;
  }

  function applyReschedule(card, newTime) {
    var timeEl = card.querySelector("[data-field='time']");
    if (timeEl) timeEl.textContent = newTime;
    setStatus(card, "pending");
    toast(treatmentName(card) + " moved to " + newTime + " — awaiting confirmation.", "warn");
  }

  function applyCancel(card) {
    setStatus(card, "cancelled");
    closeConfirm(card);
    toast(treatmentName(card) + " appointment cancelled.", "danger");
  }

  /* Event delegation */
  document.querySelector(".cards").addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    var card = btn.closest(".card");
    if (!card) return;

    var act = btn.dataset.act;

    if (act === "reschedule" || act === "cancel") {
      openConfirm(card, act);
      return;
    }

    if (act === "accept") {
      setStatus(card, "confirmed");
      toast(treatmentName(card) + " is now confirmed. See you soon!", "ok");
      return;
    }

    if (btn.hasAttribute("data-confirm-no")) {
      closeConfirm(card);
      return;
    }

    if (btn.hasAttribute("data-confirm-yes")) {
      var box = card.querySelector("[data-confirm]");
      var pending = box.dataset.pendingAct;
      if (pending === "cancel") {
        applyCancel(card);
      } else {
        var newTime = box.dataset.newTime;
        closeConfirm(card);
        applyReschedule(card, newTime);
      }
    }
  });

  /* Esc closes any open confirm strip */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll("[data-confirm]:not([hidden])").forEach(function (box) {
      closeConfirm(box.closest(".card"));
    });
  });
})();
