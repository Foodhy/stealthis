(function () {
  "use strict";

  // ---------- State ----------
  var state = {
    step: 1,
    session: null,      // { id, name, dur, price }
    slot: null,         // { date: Date, time: "07:00", label: "07:00 AM" }
    weekOffset: 0,
    details: {}
  };

  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ---------- Helpers ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  function startOfWeek(offset) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + offset * 7); // Sunday start
    return d;
  }

  function fmtTime(h, m) {
    var ampm = h >= 12 ? "PM" : "AM";
    var hh = h % 12; if (hh === 0) hh = 12;
    return (hh < 10 ? "0" + hh : hh) + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
  }

  function money(n) { return "$" + n; }

  // Deterministic pseudo-availability so the calendar feels real & stable
  function slotsForDay(date) {
    var day = date.getDay();
    if (day === 0) return []; // Sunday off
    var seed = date.getDate() + date.getMonth() * 31;
    var base = [7, 9, 12, 17, 19]; // hours
    var out = [];
    for (var i = 0; i < base.length; i++) {
      var h = base[i];
      // saturdays: only mornings
      if (day === 6 && h > 12) continue;
      var booked = (seed + h) % 3 === 0; // some already taken
      var past = date < new Date(new Date().setHours(0, 0, 0, 0)); // whole past days
      out.push({ h: h, m: 0, booked: booked || past });
    }
    return out;
  }

  // ---------- Steps ----------
  var nextBtn = $("#nextBtn");
  var backBtn = $("#backBtn");
  var progressFill = $("#progressFill");

  function setStep(n) {
    state.step = n;
    $$(".pane").forEach(function (p) {
      p.classList.toggle("is-active", +p.dataset.pane === n);
    });
    $$(".step").forEach(function (s) {
      var i = +s.dataset.step;
      s.classList.toggle("is-active", i === n);
      s.classList.toggle("is-done", i < n);
    });
    progressFill.style.width = (n * 25) + "%";
    backBtn.hidden = n === 1 || n === 4;

    if (n === 4) {
      nextBtn.hidden = true;
      backBtn.hidden = true;
    } else {
      nextBtn.hidden = false;
      nextBtn.textContent = n === 3 ? "Confirm booking" : "Continue";
    }
    refreshGate();
    if (n === 2) renderCalendar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function refreshGate() {
    var ok = false;
    if (state.step === 1) ok = !!state.session;
    else if (state.step === 2) ok = !!state.slot;
    else if (state.step === 3) ok = true; // validated on submit
    nextBtn.disabled = !ok && state.step !== 3;
  }

  // ---------- Step 1: session cards ----------
  $$(".scard").forEach(function (card) {
    card.addEventListener("click", function () {
      $$(".scard").forEach(function (c) { c.setAttribute("aria-checked", "false"); });
      card.setAttribute("aria-checked", "true");
      state.session = {
        id: card.dataset.id,
        name: card.dataset.name,
        dur: +card.dataset.dur,
        price: +card.dataset.price
      };
      updateSummary();
      refreshGate();
      toast(state.session.name + " selected");
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); }
    });
  });

  // ---------- Step 2: calendar ----------
  var calGrid = $("#calGrid");
  var weekLabel = $("#weekLabel");
  var prevWeek = $("#prevWeek");
  var nextWeek = $("#nextWeek");

  try {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) $("#tzName").textContent = tz.replace(/_/g, " ");
  } catch (e) { /* keep default */ }

  function renderCalendar() {
    var start = startOfWeek(state.weekOffset);
    var end = new Date(start); end.setDate(end.getDate() + 6);
    weekLabel.textContent = MON[start.getMonth()] + " " + start.getDate() + " – " +
      (start.getMonth() === end.getMonth() ? "" : MON[end.getMonth()] + " ") + end.getDate();
    prevWeek.disabled = state.weekOffset <= 0;

    calGrid.innerHTML = "";
    for (var i = 0; i < 7; i++) {
      var date = new Date(start); date.setDate(date.getDate() + i);
      var col = document.createElement("div");
      col.className = "day";
      var slots = slotsForDay(date);
      var anyOpen = slots.some(function (s) { return !s.booked; });
      if (!anyOpen) col.classList.add("is-off");

      var head = document.createElement("div");
      head.className = "day__head";
      head.innerHTML = '<span class="day__dow">' + DOW[date.getDay()] + '</span>' +
        '<span class="day__num">' + date.getDate() + '</span>';
      col.appendChild(head);

      if (slots.length === 0) {
        var empty = document.createElement("div");
        empty.className = "day__empty";
        empty.textContent = "Rest day";
        col.appendChild(empty);
      } else {
        slots.forEach(function (s) {
          var btn = document.createElement("button");
          btn.className = "slot";
          btn.type = "button";
          btn.textContent = fmtTime(s.h, s.m).replace(" ", "");
          btn.disabled = s.booked;
          var slotDate = new Date(date);
          if (!s.booked) {
            var isPicked = state.slot &&
              state.slot.date.getTime() === slotDate.getTime() &&
              state.slot.h === s.h;
            if (isPicked) btn.classList.add("is-picked");
            btn.setAttribute("aria-pressed", isPicked ? "true" : "false");
            (function (sd, sl) {
              btn.addEventListener("click", function () {
                state.slot = { date: sd, h: sl.h, m: sl.m, label: fmtTime(sl.h, sl.m) };
                renderCalendar();
                updateSummary();
                refreshGate();
                toast("Slot held: " + DOW[sd.getDay()] + " " + fmtTime(sl.h, sl.m));
              });
            })(slotDate, s);
          } else {
            btn.title = "Unavailable";
          }
          col.appendChild(btn);
        });
      }
      calGrid.appendChild(col);
    }
  }

  prevWeek.addEventListener("click", function () {
    if (state.weekOffset > 0) { state.weekOffset--; renderCalendar(); }
  });
  nextWeek.addEventListener("click", function () {
    if (state.weekOffset < 6) { state.weekOffset++; renderCalendar(); }
    else toast("Bookings open 6 weeks ahead");
  });

  // ---------- Step 3: form validation ----------
  var form = $("#detForm");
  function setErr(name, msg) {
    var small = $('.err[data-for="' + name + '"]');
    var field = small ? small.closest(".field") : null;
    if (small) small.textContent = msg || "";
    if (field) field.classList.toggle("has-err", !!msg);
  }
  function validate() {
    var d = {
      name: $("#fName").value.trim(),
      email: $("#fEmail").value.trim(),
      level: $("#fLevel").value,
      goal: $("#fGoal").value.trim()
    };
    var ok = true;
    if (d.name.length < 2) { setErr("name", "Please enter your name."); ok = false; } else setErr("name", "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { setErr("email", "Enter a valid email."); ok = false; } else setErr("email", "");
    if (!d.level) { setErr("level", "Pick your level."); ok = false; } else setErr("level", "");
    if (ok) state.details = d;
    return ok;
  }
  ["fName", "fEmail", "fLevel"].forEach(function (id) {
    $("#" + id).addEventListener("input", function () {
      var map = { fName: "name", fEmail: "email", fLevel: "level" };
      setErr(map[id], "");
    });
  });

  // ---------- Summary ----------
  function updateSummary() {
    $("#sumSession").textContent = state.session ? state.session.name : "—";
    $("#sumDur").textContent = state.session ? state.session.dur + " min" : "—";
    $("#sumPrice").textContent = state.session ? money(state.session.price) : "$0";
    if (state.slot) {
      $("#sumDate").textContent = DOW[state.slot.date.getDay()] + ", " +
        MON[state.slot.date.getMonth()] + " " + state.slot.date.getDate();
      $("#sumTime").textContent = state.slot.label;
    } else {
      $("#sumDate").textContent = "—";
      $("#sumTime").textContent = "—";
    }
  }

  // ---------- Confirmation ----------
  function makeRef() {
    var s = "APX-";
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (var i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }
  function fillConfirmation() {
    $("#bookingRef").textContent = makeRef();
    $("#doneEmail").textContent = state.details.email || "your inbox";
    var rows = [
      ["Session", state.session.name],
      ["Coach", "Rae Mercer"],
      ["Date", DOW[state.slot.date.getDay()] + ", " + MON[state.slot.date.getMonth()] + " " + state.slot.date.getDate()],
      ["Time", state.slot.label + " · " + state.session.dur + " min"],
      ["Athlete", state.details.name],
      ["Total", money(state.session.price)]
    ];
    var wrap = $("#doneSummary");
    wrap.innerHTML = "";
    rows.forEach(function (r) {
      var div = document.createElement("div");
      div.innerHTML = "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>";
      wrap.appendChild(div);
    });
  }

  // ---------- Navigation buttons ----------
  nextBtn.addEventListener("click", function () {
    if (state.step === 1) {
      if (!state.session) { toast("Choose a session first"); return; }
      setStep(2);
    } else if (state.step === 2) {
      if (!state.slot) { toast("Pick an open slot"); return; }
      setStep(3);
    } else if (state.step === 3) {
      if (!validate()) { toast("Check the highlighted fields"); return; }
      fillConfirmation();
      setStep(4);
      toast("Booking confirmed! 💪");
    }
  });

  backBtn.addEventListener("click", function () {
    if (state.step > 1) setStep(state.step - 1);
  });

  $("#againBtn").addEventListener("click", function () {
    state.session = null; state.slot = null; state.weekOffset = 0; state.details = {};
    $$(".scard").forEach(function (c) { c.setAttribute("aria-checked", "false"); });
    form.reset();
    ["name", "email", "level"].forEach(function (n) { setErr(n, ""); });
    updateSummary();
    setStep(1);
  });

  // ---------- Init ----------
  updateSummary();
  setStep(1);
})();
