(function () {
  "use strict";

  /* ---------- data ---------- */
  var SERVICES = {
    discovery: { name: "Discovery Call", desc: "A relaxed chat to map your goals and budget.", price: 0, minutes: 30 },
    styling: { name: "In-Home Styling", desc: "One room walked with you, styling plan left behind.", price: 180, minutes: 60 },
    full: { name: "Full Room Design", desc: "Mood direction, sourcing strategy and a scoped path.", price: 420, minutes: 90 }
  };

  // Weekday availability pattern + slot templates (deterministic, fictional).
  var SLOT_TEMPLATES = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  /* ---------- state ---------- */
  var state = {
    type: null,
    format: "inperson",
    date: null,      // Date object
    time: null,      // string "HH:MM"
    viewYear: 0,
    viewMonth: 0
  };

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  state.viewYear = today.getFullYear();
  state.viewMonth = today.getMonth();

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function toast(msg) {
    var wrap = $("#toast-wrap");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 2400);
  }

  // A day is "available" if it's in the future (or today) and not a Sunday,
  // with a couple of scattered closures for realism.
  function isAvailable(d) {
    if (d < today) return false;
    var dow = d.getDay();
    if (dow === 0) return false; // Sundays closed
    var dom = d.getDate();
    if (dom === 4 || dom === 18 || dom === 25) return false; // studio closures
    return true;
  }

  // Deterministic pseudo-capacity per day so slots feel real but stable.
  function slotsForDate(d) {
    var seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
    var out = [];
    for (var i = 0; i < SLOT_TEMPLATES.length; i++) {
      var v = (seed * (i + 7)) % 11;
      if (v < 3) continue; // some slots already booked
      out.push({ time: SLOT_TEMPLATES[i], left: (v % 4) + 1 });
    }
    return out;
  }

  function fmtDate(d) {
    var wk = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    return wk + " " + d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3);
  }

  function fmtTime(t) {
    var parts = t.split(":");
    var h = parseInt(parts[0], 10);
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ":" + parts[1] + " " + ampm;
  }

  /* ---------- step indicator ---------- */
  function updateSteps() {
    var s1 = !!state.type;
    var s2 = !!(state.date && state.time);
    var f = $("#details-form");
    var s3 = f && f.name.value.trim() && /.+@.+\..+/.test(f.email.value) && f.scope.value.trim();

    setStep(1, s1, false);
    setStep(2, s2, s1 && !s2);
    setStep(3, !!s3, s2 && !s3);
    if (!s1) setStep(1, false, true);
    else if (!s2) setStep(2, false, true);
    else if (!s3) setStep(3, false, true);
  }
  function setStep(n, done, active) {
    var el = $('.step[data-step="' + n + '"]');
    if (!el) return;
    el.classList.toggle("is-done", done);
    el.classList.toggle("is-active", active);
  }

  /* ---------- calendar ---------- */
  function renderCalendar() {
    var grid = $("#cal-grid");
    grid.innerHTML = "";
    $("#cal-title").textContent = MONTHS[state.viewMonth] + " " + state.viewYear;

    var first = new Date(state.viewYear, state.viewMonth, 1);
    var startDow = first.getDay();
    var daysInMonth = new Date(state.viewYear, state.viewMonth + 1, 0).getDate();

    for (var b = 0; b < startDow; b++) {
      var blank = document.createElement("div");
      blank.className = "cal-day empty";
      grid.appendChild(blank);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var d = new Date(state.viewYear, state.viewMonth, day);
      d.setHours(0, 0, 0, 0);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.textContent = day;
      btn.setAttribute("role", "gridcell");

      var avail = isAvailable(d);
      if (avail) {
        btn.classList.add("avail");
        btn.setAttribute("aria-label", fmtDate(d) + ", available");
        (function (dateObj) {
          btn.addEventListener("click", function () { selectDate(dateObj, btn); });
        })(d);
      } else {
        btn.classList.add("disabled");
        btn.disabled = true;
        btn.setAttribute("aria-label", fmtDate(d) + ", unavailable");
      }

      if (state.date && d.getTime() === state.date.getTime()) {
        btn.classList.add("is-selected");
      }
      grid.appendChild(btn);
    }
  }

  function selectDate(d, btn) {
    state.date = d;
    state.time = null;
    $all(".cal-day.is-selected").forEach(function (el) { el.classList.remove("is-selected"); });
    if (btn) btn.classList.add("is-selected");
    renderSlots();
    updateSummary();
    updateSteps();
    toast("Date set — " + fmtDate(d));
  }

  /* ---------- slots ---------- */
  function renderSlots() {
    var list = $("#slot-list");
    var title = $("#slots-title");
    list.innerHTML = "";

    if (!state.date) {
      title.textContent = "Select a date to see times";
      list.innerHTML = '<p class="slots-empty">No date selected yet.</p>';
      return;
    }

    title.textContent = "Times for " + fmtDate(state.date);
    var slots = slotsForDate(state.date);
    if (!slots.length) {
      list.innerHTML = '<p class="slots-empty">Fully booked — try another day.</p>';
      return;
    }

    var mins = state.type ? SERVICES[state.type].minutes : 60;
    slots.forEach(function (s) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      if (state.time === s.time) btn.classList.add("is-selected");
      var capClass = s.left <= 1 ? "slot-cap few" : "slot-cap";
      var capText = s.left <= 1 ? "1 left" : s.left + " open";
      btn.innerHTML =
        '<span>' + fmtTime(s.time) + ' <span style="font-weight:400;opacity:.7">· ' + mins + ' min</span></span>' +
        '<span class="' + capClass + '">' + capText + '</span>';
      btn.setAttribute("aria-label", fmtTime(s.time) + ", " + capText);
      btn.addEventListener("click", function () { selectTime(s.time, btn); });
      list.appendChild(btn);
    });
  }

  function selectTime(t, btn) {
    state.time = t;
    $all(".slot.is-selected").forEach(function (el) { el.classList.remove("is-selected"); });
    btn.classList.add("is-selected");
    updateSummary();
    updateSteps();
    toast("Time held — " + fmtTime(t));
  }

  /* ---------- type + format ---------- */
  function bindTypes() {
    $all(".type-card").forEach(function (card) {
      var input = card.querySelector("input");
      card.addEventListener("click", function () { input.checked = true; onTypeChange(); });
      input.addEventListener("change", onTypeChange);
    });
  }
  function onTypeChange() {
    var checked = document.querySelector('input[name="ctype"]:checked');
    state.type = checked ? checked.value : null;
    $all(".type-card").forEach(function (card) {
      card.classList.toggle("is-selected", card.querySelector("input").checked);
    });
    renderSlots(); // duration label depends on type
    updateSummary();
    updateSteps();
    if (state.type) toast(SERVICES[state.type].name + " selected");
  }

  function bindFormat() {
    $all(".seg").forEach(function (seg) {
      seg.addEventListener("click", function () {
        state.format = seg.getAttribute("data-format");
        $all(".seg").forEach(function (s) {
          var on = s === seg;
          s.classList.toggle("is-on", on);
          s.setAttribute("aria-pressed", on ? "true" : "false");
        });
        updateLocationField();
        updateSummary();
        toast(state.format === "virtual" ? "Switched to virtual" : "Switched to in-person");
      });
    });
  }

  function updateLocationField() {
    var label = $("#location-label");
    var input = $("#f-location");
    var hint = $("#location-hint");
    if (state.format === "virtual") {
      label.textContent = "Video link preference";
      input.placeholder = "Zoom, Google Meet, or leave blank";
      hint.textContent = "We'll email a video link before the call.";
    } else {
      label.textContent = "Project address";
      input.placeholder = "Street, suburb, postcode";
      hint.textContent = "Where should the designer visit?";
    }
  }

  /* ---------- summary ---------- */
  function updateSummary() {
    var svc = state.type ? SERVICES[state.type] : null;
    $("#s-service").textContent = svc ? svc.name : "No service selected";
    $("#s-desc").textContent = svc ? svc.desc : "Pick a consultation type to begin.";
    $("#s-format").textContent = state.format === "virtual" ? "Virtual call" : "In-person visit";
    $("#s-date").textContent = state.date ? fmtDate(state.date) : "—";
    $("#s-time").textContent = state.time ? fmtTime(state.time) : "—";
    $("#s-duration").textContent = svc ? svc.minutes + " minutes" : "—";
    $("#s-price").textContent = svc ? (svc.price === 0 ? "Free" : "$" + svc.price) : "$0";

    var ready = !!(state.type && state.date && state.time);
    $("#confirm-btn").disabled = !ready;
  }

  /* ---------- validation ---------- */
  function validateForm(report) {
    var f = $("#details-form");
    var ok = true;
    var checks = [
      { key: "name", el: f.name, test: function (v) { return v.trim().length >= 2; }, msg: "Please enter your name." },
      { key: "email", el: f.email, test: function (v) { return /.+@.+\..+/.test(v.trim()); }, msg: "Enter a valid email." },
      { key: "scope", el: f.scope, test: function (v) { return v.trim().length >= 8; }, msg: "Tell us a little about the space." }
    ];
    checks.forEach(function (c) {
      var field = c.el.closest(".field");
      var errEl = document.querySelector('.err[data-for="' + c.key + '"]');
      var pass = c.test(c.el.value);
      if (!pass) ok = false;
      if (report) {
        field.classList.toggle("invalid", !pass);
        if (errEl) errEl.textContent = pass ? "" : c.msg;
      }
    });
    return ok;
  }

  function bindForm() {
    var f = $("#details-form");
    $all("input, textarea", f).forEach(function (el) {
      el.addEventListener("input", function () {
        var field = el.closest(".field");
        if (field && field.classList.contains("invalid")) validateForm(true);
        updateSteps();
      });
    });
  }

  /* ---------- confirm / reset ---------- */
  function confirmBooking() {
    if (state.type == null || !state.date || !state.time) {
      toast("Pick a service, date and time first");
      return;
    }
    if (!validateForm(true)) {
      toast("Please complete your details");
      var firstBad = document.querySelector(".field.invalid input, .field.invalid textarea");
      if (firstBad) firstBad.focus();
      return;
    }

    var ref = "ML-" + state.date.getFullYear().toString().slice(2) +
      String(state.date.getMonth() + 1).padStart(2, "0") +
      String(state.date.getDate()).padStart(2, "0") + "-" +
      Math.floor(1000 + Math.random() * 9000);

    var svc = SERVICES[state.type];
    var fmt = state.format === "virtual" ? "a virtual call" : "an in-home visit";
    $("#conf-line").textContent = svc.name + " · " + fmtDate(state.date) + " at " + fmtTime(state.time) + " — " + fmt + ".";
    $("#conf-ref").textContent = ref;

    $("#summary").hidden = true;
    $("#confirmed").hidden = false;
    setStep(3, true, false);
    toast("Booked! Reference " + ref);
  }

  function resetAll() {
    state.type = null; state.format = "inperson"; state.date = null; state.time = null;
    var checked = document.querySelector('input[name="ctype"]:checked');
    if (checked) checked.checked = false;
    $all(".type-card").forEach(function (c) { c.classList.remove("is-selected"); });
    $all(".seg").forEach(function (s, i) {
      var on = i === 0;
      s.classList.toggle("is-on", on);
      s.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var f = $("#details-form"); f.reset();
    $all(".field").forEach(function (fl) { fl.classList.remove("invalid"); });
    $all(".err").forEach(function (e) { e.textContent = ""; });
    updateLocationField();
    renderSlots();
    renderCalendar();
    updateSummary();
    updateSteps();
    $("#confirmed").hidden = true;
    $("#summary").hidden = false;
    toast("Started a new booking");
  }

  /* ---------- init ---------- */
  bindTypes();
  bindFormat();
  bindForm();
  renderCalendar();
  updateLocationField();
  updateSummary();
  updateSteps();

  $("#prev-month").addEventListener("click", function () {
    var view = new Date(state.viewYear, state.viewMonth, 1);
    var min = new Date(today.getFullYear(), today.getMonth(), 1);
    if (view <= min) { toast("That's as far back as we go"); return; }
    state.viewMonth--; if (state.viewMonth < 0) { state.viewMonth = 11; state.viewYear--; }
    renderCalendar();
  });
  $("#next-month").addEventListener("click", function () {
    state.viewMonth++; if (state.viewMonth > 11) { state.viewMonth = 0; state.viewYear++; }
    renderCalendar();
  });

  $("#confirm-btn").addEventListener("click", confirmBooking);
  $("#reset-btn").addEventListener("click", resetAll);
})();
