(function () {
  "use strict";

  /* ---------- Business hours / open-closed status ---------- */
  // dayOfWeek (0=Sun) -> { open: minutes, close: minutes } or null when closed
  var SCHEDULE = {
    0: null,                 // Sun
    1: { open: 420, close: 1020 }, // Mon 7:00–17:00
    2: { open: 420, close: 1020 },
    3: { open: 420, close: 1020 },
    4: { open: 420, close: 1020 },
    5: { open: 420, close: 960 },  // Fri 7:00–16:00
    6: { open: 480, close: 720 }   // Sat 8:00–12:00
  };

  function updateStatus() {
    var statusEl = document.getElementById("status");
    var textEl = document.getElementById("statusText");
    if (!statusEl || !textEl) return;

    var now = new Date();
    var day = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var today = SCHEDULE[day];
    var isOpen = !!today && mins >= today.open && mins < today.close;

    statusEl.classList.remove("is-open", "is-closed");
    statusEl.classList.add(isOpen ? "is-open" : "is-closed");
    textEl.textContent = isOpen ? "Open now" : "Closed";

    // Highlight today's row
    var rows = document.querySelectorAll("#hoursTable tr");
    rows.forEach(function (r) {
      r.classList.toggle("today", Number(r.getAttribute("data-day")) === day);
    });
  }

  /* ---------- Phone formatting ---------- */
  function formatPhone(value) {
    var d = value.replace(/\D/g, "").slice(0, 10);
    if (d.length === 0) return "";
    if (d.length < 4) return "(" + d;
    if (d.length < 7) return "(" + d.slice(0, 3) + ") " + d.slice(3);
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }

  /* ---------- Validation ---------- */
  function setError(field, msg) {
    var wrap = field.closest(".field");
    var errEl = wrap ? wrap.querySelector(".error") : null;
    if (msg) {
      wrap.classList.add("invalid");
      if (errEl) errEl.textContent = msg;
      field.setAttribute("aria-invalid", "true");
    } else {
      wrap.classList.remove("invalid");
      if (errEl) errEl.textContent = "";
      field.removeAttribute("aria-invalid");
    }
  }

  function validateField(field) {
    var v = field.value.trim();
    switch (field.id) {
      case "name":
        if (!v) return setError(field, "Please enter your name."), false;
        if (v.length < 2) return setError(field, "That name looks too short."), false;
        break;
      case "phone":
        var digits = v.replace(/\D/g, "");
        if (!digits) return setError(field, "Please enter a phone number."), false;
        if (digits.length !== 10) return setError(field, "Enter a 10-digit phone number."), false;
        break;
      case "project":
        if (!v) return setError(field, "Pick a project type."), false;
        break;
      case "address":
        if (!v) return setError(field, "Where's the job site?"), false;
        if (v.length < 5) return setError(field, "Add a bit more detail."), false;
        break;
    }
    setError(field, "");
    return true;
  }

  /* ---------- Wire up ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    updateStatus();
    setInterval(updateStatus, 60000);

    var form = document.getElementById("quoteForm");
    if (!form) return;

    var phone = document.getElementById("phone");
    if (phone) {
      phone.addEventListener("input", function () {
        var pos = phone.selectionStart;
        var before = phone.value.length;
        phone.value = formatPhone(phone.value);
        // keep caret roughly in place when appending at end
        if (pos === before) phone.selectionStart = phone.selectionEnd = phone.value.length;
        if (phone.closest(".field").classList.contains("invalid")) validateField(phone);
      });
    }

    var required = ["name", "phone", "project", "address"];
    required.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("blur", function () { validateField(el); });
      el.addEventListener("change", function () {
        if (el.closest(".field").classList.contains("invalid")) validateField(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var firstBad = null;
      required.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !validateField(el)) {
          ok = false;
          if (!firstBad) firstBad = el;
        }
      });

      if (!ok) {
        if (firstBad) firstBad.focus();
        return;
      }

      var name = document.getElementById("name").value.trim().split(" ")[0];
      var success = document.getElementById("success");
      var msg = document.getElementById("successMsg");
      if (msg) {
        msg.textContent = "Thanks" + (name ? ", " + name : "") +
          " — a project manager will call you back within one business day.";
      }
      if (success) success.hidden = false;
      form.reset();
      if (success) success.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
})();
