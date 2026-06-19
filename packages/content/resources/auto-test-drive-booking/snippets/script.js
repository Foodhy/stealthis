(function () {
  "use strict";

  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var ALL_SLOTS = ["9:00", "9:45", "10:30", "11:15", "1:00", "1:45", "2:30", "3:15", "4:00", "4:45", "5:30"];

  // Deterministic "booked" pattern per date so it feels real but stable.
  function bookedFor(date) {
    var seed = date.getDate() + date.getMonth() * 3;
    var taken = {};
    ALL_SLOTS.forEach(function (s, i) {
      if ((seed + i * 5) % 7 === 0 || (seed + i * 3) % 11 === 0) taken[s] = true;
    });
    return taken;
  }

  var state = { date: null, slot: null };

  var dateRow = document.getElementById("dateRow");
  var slotGrid = document.getElementById("slotGrid");
  var slotErr = document.getElementById("slotErr");
  var sumDate = document.getElementById("sumDate");
  var sumTime = document.getElementById("sumTime");
  var statusPanel = document.getElementById("statusPanel");
  var statusLabel = document.getElementById("statusLabel");
  var statusSub = document.getElementById("statusSub");
  var form = document.getElementById("bookingForm");

  function toast(msg) {
    var host = document.getElementById("toastHost");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 320);
    }, 2400);
  }

  function fmtLong(d) {
    return DOW[d.getDay()] + ", " + MON[d.getMonth()] + " " + d.getDate();
  }
  function meridiem(slot) {
    var h = parseInt(slot.split(":")[0], 10);
    return h >= 9 && h <= 11 ? slot + " AM" : slot + " PM";
  }

  // Build 7 upcoming dates (skip same-day, dealership demos start tomorrow)
  var dates = [];
  (function buildDates() {
    var base = new Date();
    base.setHours(0, 0, 0, 0);
    var added = 0, i = 1;
    while (added < 7) {
      var d = new Date(base);
      d.setDate(base.getDate() + i);
      if (d.getDay() !== 0) { dates.push(d); added++; } // closed Sundays
      i++;
    }
  })();

  dates.forEach(function (d, idx) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "date-chip";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.innerHTML =
      '<span class="dow">' + DOW[d.getDay()] + "</span>" +
      '<span class="day">' + d.getDate() + "</span>" +
      '<span class="mon">' + MON[d.getMonth()] + "</span>";
    btn.addEventListener("click", function () { selectDate(idx, btn); });
    dateRow.appendChild(btn);
  });

  function selectDate(idx, btn) {
    state.date = dates[idx];
    state.slot = null;
    Array.prototype.forEach.call(dateRow.children, function (c) {
      c.setAttribute("aria-checked", "false");
    });
    btn.setAttribute("aria-checked", "true");
    renderSlots();
    sumDate.textContent = fmtLong(state.date);
    sumTime.textContent = "—";
    updateStatus();
  }

  function renderSlots() {
    slotGrid.innerHTML = "";
    var taken = bookedFor(state.date);
    ALL_SLOTS.forEach(function (slot) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "slot";
      b.setAttribute("role", "radio");
      b.textContent = meridiem(slot);
      if (taken[slot]) {
        b.disabled = true;
        b.setAttribute("aria-disabled", "true");
        b.title = "Already booked";
      } else {
        b.setAttribute("aria-checked", "false");
        b.addEventListener("click", function () { selectSlot(slot, b); });
      }
      slotGrid.appendChild(b);
    });
  }

  function selectSlot(slot, btn) {
    state.slot = slot;
    slotErr.hidden = true;
    Array.prototype.forEach.call(slotGrid.children, function (c) {
      if (!c.disabled) c.setAttribute("aria-checked", "false");
    });
    btn.setAttribute("aria-checked", "true");
    sumTime.textContent = meridiem(slot);
    updateStatus();
  }

  function updateStatus() {
    if (state.date && state.slot) {
      statusPanel.dataset.state = "ready";
      statusLabel.textContent = "Ready to confirm";
      statusSub.textContent = fmtLong(state.date) + " · " + meridiem(state.slot);
    } else {
      statusPanel.dataset.state = "waiting";
      statusLabel.textContent = "Awaiting confirmation";
      statusSub.textContent = state.date
        ? "Pick an available time slot."
        : "Select a date and slot to continue.";
    }
  }

  // Field validation
  function validateField(input) {
    var v = (input.value || "").trim();
    var ok = true;
    if (input.id === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    else if (input.id === "phone") ok = v.replace(/\D/g, "").length >= 7;
    else if (input.id === "license") ok = v.length >= 5;
    else ok = v.length >= 2;
    setFieldError(input, ok);
    return ok;
  }
  function setFieldError(input, ok) {
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    var err = document.querySelector('.field-err[data-for="' + input.id + '"]');
    if (err) err.hidden = ok;
  }

  ["name", "phone", "email", "license"].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener("blur", function () { validateField(el); });
    el.addEventListener("input", function () {
      if (el.getAttribute("aria-invalid") === "true") validateField(el);
    });
  });

  document.getElementById("changeVehicle").addEventListener("click", function () {
    toast("Only the demo Aurora GT-Line is available today");
  });

  var lastBooking = null;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;

    if (!state.date || !state.slot) {
      slotErr.hidden = false;
      valid = false;
    }

    ["name", "phone", "email", "license"].forEach(function (id) {
      if (!validateField(document.getElementById(id))) valid = false;
    });

    var confirm = document.getElementById("licenseConfirm");
    var confirmErr = document.querySelector('.field-err[data-for="licenseConfirm"]');
    if (!confirm.checked) {
      confirmErr.hidden = false;
      valid = false;
    } else {
      confirmErr.hidden = true;
    }

    if (!valid) {
      toast("Please fix the highlighted fields");
      var firstBad = form.querySelector('[aria-invalid="true"]') || (!confirm.checked ? confirm : null);
      if (firstBad) firstBad.focus();
      return;
    }

    var code = "TD-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    lastBooking = {
      code: code,
      date: state.date,
      slot: state.slot,
      driver: document.getElementById("name").value.trim()
    };

    document.getElementById("confCode").textContent = code;
    document.getElementById("confWhen").textContent = fmtLong(state.date) + " · " + meridiem(state.slot);
    document.getElementById("confDriver").textContent = lastBooking.driver;

    statusPanel.dataset.state = "done";
    statusLabel.textContent = "Test drive confirmed";
    statusSub.textContent = "Confirmation " + code;

    openModal();
  });

  // Modal
  var modal = document.getElementById("successModal");
  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("closeModal").focus();
    document.addEventListener("keydown", onKey);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) { if (e.key === "Escape") closeModal(); }

  document.getElementById("closeModal").addEventListener("click", function () {
    closeModal();
    toast("Booking saved — see you at Bay 7");
  });
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });

  // Add to calendar -> generate .ics download
  document.getElementById("addCalendar").addEventListener("click", function () {
    if (!lastBooking) return;
    var d = lastBooking.date;
    var hm = lastBooking.slot.split(":");
    var hour = parseInt(hm[0], 10);
    if (hour < 9) hour += 12;       // PM afternoon slots
    else if (hour <= 5) hour += 12; // 1:00–5:30 are PM
    var min = parseInt(hm[1], 10);

    var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, min);
    var end = new Date(start.getTime() + 30 * 60000);

    function z(n) { return (n < 10 ? "0" : "") + n; }
    function ics(dt) {
      return dt.getFullYear() + z(dt.getMonth() + 1) + z(dt.getDate()) +
        "T" + z(dt.getHours()) + z(dt.getMinutes()) + "00";
    }

    var body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Velocity Motors//Test Drive//EN",
      "BEGIN:VEVENT",
      "UID:" + lastBooking.code + "@velocitymotors.demo",
      "DTSTART:" + ics(start),
      "DTEND:" + ics(end),
      "SUMMARY:Test Drive — Aurora GT-Line (" + lastBooking.code + ")",
      "LOCATION:Velocity Motors Lakeside, Bay 7",
      "DESCRIPTION:Bring a valid driver's license. Arrive 5 minutes early.",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    var blob = new Blob([body], { type: "text/calendar" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "test-drive-" + lastBooking.code + ".ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Calendar invite downloaded");
  });

  // Preselect first date for a friendly start
  selectDate(0, dateRow.children[0]);
})();
