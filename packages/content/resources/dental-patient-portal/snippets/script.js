(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, opts) {
    opts = opts || {};
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    if (opts.tick !== false) {
      var t = document.createElement("span");
      t.className = "tick";
      t.textContent = "✓";
      el.appendChild(t);
    }
    var span = document.createElement("span");
    span.textContent = msg;
    el.appendChild(span);
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }, opts.duration || 2600);
  }

  /* ---------- Focus trap utility ---------- */
  function trapFocus(container) {
    var focusables = container.querySelectorAll(
      'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return function () {};
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    function onKey(e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    container.addEventListener("keydown", onKey);
    return function () {
      container.removeEventListener("keydown", onKey);
    };
  }

  /* ---------- Reschedule modal ---------- */
  var modal = document.getElementById("modal");
  var slots = document.getElementById("slots");
  var confirmBtn = document.getElementById("modalConfirm");
  var selectedSlot = null;
  var lastFocused = null;
  var releaseTrap = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    selectedSlot = null;
    confirmBtn.disabled = true;
    Array.prototype.forEach.call(slots.children, function (s) {
      s.setAttribute("aria-selected", "false");
    });
    releaseTrap = trapFocus(modal);
    document.getElementById("modalClose").focus();
    document.addEventListener("keydown", escClose);
  }
  function closeModal() {
    modal.hidden = true;
    if (releaseTrap) releaseTrap();
    document.removeEventListener("keydown", escClose);
    if (lastFocused) lastFocused.focus();
  }
  function escClose(e) {
    if (e.key === "Escape") closeModal();
  }

  Array.prototype.forEach.call(slots.children, function (slot) {
    slot.addEventListener("click", function () {
      Array.prototype.forEach.call(slots.children, function (s) {
        s.setAttribute("aria-selected", "false");
      });
      slot.setAttribute("aria-selected", "true");
      selectedSlot = slot;
      confirmBtn.disabled = false;
    });
  });

  confirmBtn.addEventListener("click", function () {
    if (!selectedSlot) return;
    var day = selectedSlot.getAttribute("data-day");
    var label = selectedSlot.getAttribute("data-label");
    var parts = label.split(" · ");
    document.getElementById("apptDay").textContent = day;
    document.getElementById("apptTime").textContent = parts[1] + " · 45 min";
    var status = document.getElementById("apptStatus");
    status.textContent = "Rescheduled";
    status.className = "badge badge-warn";
    closeModal();
    toast("Appointment moved to " + label);
  });

  document.getElementById("rescheduleBtn").addEventListener("click", openModal);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalCancel").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  /* ---------- Message modal ---------- */
  var msgModal = document.getElementById("msgModal");
  var msgText = document.getElementById("msgText");
  var releaseMsgTrap = null;
  var msgLastFocused = null;

  function openMsg() {
    msgLastFocused = document.activeElement;
    msgModal.hidden = false;
    releaseMsgTrap = trapFocus(msgModal);
    msgText.focus();
    document.addEventListener("keydown", escMsg);
  }
  function closeMsg() {
    msgModal.hidden = true;
    if (releaseMsgTrap) releaseMsgTrap();
    document.removeEventListener("keydown", escMsg);
    if (msgLastFocused) msgLastFocused.focus();
  }
  function escMsg(e) {
    if (e.key === "Escape") closeMsg();
  }

  document.getElementById("messageBtn").addEventListener("click", openMsg);
  document.getElementById("msgClose").addEventListener("click", closeMsg);
  document.getElementById("msgCancel").addEventListener("click", closeMsg);
  msgModal.addEventListener("click", function (e) {
    if (e.target === msgModal) closeMsg();
  });
  document.getElementById("msgSend").addEventListener("click", function () {
    var val = msgText.value.trim();
    if (!val) {
      toast("Please write a message first", { tick: false });
      msgText.focus();
      return;
    }
    msgText.value = "";
    closeMsg();
    toast("Message sent to the care team");
  });

  /* ---------- Pay balance ---------- */
  var payBtn = document.getElementById("payBtn");
  var balAmount = document.getElementById("balAmount");
  var balBadge = document.getElementById("balBadge");
  var balFill = document.getElementById("balFill");
  var balNote = document.getElementById("balNote");
  var paid = false;

  payBtn.addEventListener("click", function () {
    if (paid) return;
    paid = true;
    payBtn.disabled = true;
    var start = 184;
    var current = start;
    var step = start / 28;
    var timer = setInterval(function () {
      current -= step;
      if (current <= 0) {
        current = 0;
        clearInterval(timer);
        balBadge.textContent = "Paid";
        balBadge.className = "badge badge-paid";
        balNote.textContent = "Paid in full on " + formatToday() + " · Thank you!";
        payBtn.textContent = "Balance cleared";
        toast("Payment of $184.00 received");
      }
      balAmount.textContent = "$" + current.toFixed(2);
    }, 22);
    balFill.style.width = "0%";
    balFill.style.background = "linear-gradient(90deg, #22b07d, #34d399)";
  });

  function formatToday() {
    var d = new Date();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  /* ---------- Timeline expand ---------- */
  var expandBtn = document.getElementById("expandHistory");
  var expanded = false;
  expandBtn.addEventListener("click", function () {
    expanded = !expanded;
    var hidden = document.querySelectorAll("#timeline .tl-item");
    Array.prototype.forEach.call(hidden, function (item) {
      if (item.classList.contains("is-hidden") || item.dataset.wasHidden) {
        item.style.display = expanded ? "" : "none";
        if (expanded) {
          item.classList.remove("is-hidden");
          item.dataset.wasHidden = "1";
        } else {
          item.classList.add("is-hidden");
        }
      }
    });
    expandBtn.textContent = expanded ? "Show less" : "Show all";
  });

  /* ---------- Documents view ---------- */
  var docCount = document.getElementById("docCount");
  var newDocs = 2;
  Array.prototype.forEach.call(document.querySelectorAll(".doc-btn"), function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-viewed")) return;
      var doc = btn.closest(".doc");
      btn.textContent = "Viewed";
      btn.classList.add("is-viewed");
      if (doc.classList.contains("is-new")) {
        doc.classList.remove("is-new");
        newDocs = Math.max(0, newDocs - 1);
        if (newDocs === 0) {
          docCount.textContent = "All read";
          docCount.className = "badge badge-ok";
        } else {
          docCount.textContent = newDocs + " new";
        }
      }
      var name = doc.querySelector("strong").textContent;
      toast("Opened “" + name + "”");
    });
  });

  /* ---------- Quick actions ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".quick"), function (q) {
    q.addEventListener("click", function () {
      var action = q.getAttribute("data-action");
      if (action === "reschedule") return openModal();
      if (action === "message") return openMsg();
      if (action === "records") return toast("Opening your dental records");
      if (action === "refill") return toast("Refill request sent to Dr. Nadeem");
    });
  });

  /* ---------- Misc top-bar ---------- */
  document.getElementById("calendarBtn").addEventListener("click", function () {
    toast("Added to your calendar");
    this.querySelector ? null : null;
  });
  document.getElementById("bellBtn").addEventListener("click", function () {
    this.querySelector(".dot").style.display = "none";
    toast("You're all caught up", { tick: false });
  });
})();
