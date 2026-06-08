(function () {
  "use strict";

  /* ---------- Data ---------- */
  var TYPE_LABEL = {
    strength: "Strength",
    hiit: "HIIT",
    cycle: "Cycle",
    yoga: "Yoga & Mobility",
    boxing: "Boxing",
  };

  // Each class: day index (0 = Mon ... 6 = Sun), start time (minutes), duration,
  // name, trainer, room, type, intensity, capacity, booked.
  var CLASSES = {
    downtown: [
      { d: 0, t: 360, dur: 60, name: "Sunrise Strength", trainer: "Mara Devlin", room: "Iron Floor", type: "strength", intensity: "mid", cap: 16, booked: 11 },
      { d: 0, t: 540, dur: 45, name: "Metcon Blitz", trainer: "Theo Vance", room: "Turf Zone", type: "hiit", intensity: "high", cap: 20, booked: 20 },
      { d: 0, t: 1080, dur: 50, name: "Power Cycle 45", trainer: "Lena Brooks", room: "Spin Studio", type: "cycle", intensity: "mid", cap: 24, booked: 17 },
      { d: 0, t: 1140, dur: 60, name: "Deep Mobility Flow", trainer: "Priya Nair", room: "Studio B", type: "yoga", intensity: "low", cap: 18, booked: 6 },
      { d: 1, t: 375, dur: 45, name: "Dawn HIIT 45", trainer: "Theo Vance", room: "Turf Zone", type: "hiit", intensity: "high", cap: 20, booked: 14 },
      { d: 1, t: 720, dur: 60, name: "Barbell Club", trainer: "Mara Devlin", room: "Iron Floor", type: "strength", intensity: "high", cap: 14, booked: 9 },
      { d: 1, t: 1110, dur: 45, name: "Boxing Fundamentals", trainer: "Caleb Ortiz", room: "Ring Room", type: "boxing", intensity: "mid", cap: 16, booked: 13 },
      { d: 2, t: 360, dur: 60, name: "Sunrise Strength", trainer: "Mara Devlin", room: "Iron Floor", type: "strength", intensity: "mid", cap: 16, booked: 8 },
      { d: 2, t: 1050, dur: 50, name: "Climb Cycle", trainer: "Lena Brooks", room: "Spin Studio", type: "cycle", intensity: "high", cap: 24, booked: 22 },
      { d: 2, t: 1140, dur: 60, name: "Restore Yoga", trainer: "Priya Nair", room: "Studio B", type: "yoga", intensity: "low", cap: 18, booked: 10 },
      { d: 3, t: 390, dur: 45, name: "Metcon Blitz", trainer: "Theo Vance", room: "Turf Zone", type: "hiit", intensity: "high", cap: 20, booked: 16 },
      { d: 3, t: 720, dur: 60, name: "Powerlift Lab", trainer: "Mara Devlin", room: "Iron Floor", type: "strength", intensity: "high", cap: 12, booked: 7 },
      { d: 3, t: 1080, dur: 45, name: "Sparring Skills", trainer: "Caleb Ortiz", room: "Ring Room", type: "boxing", intensity: "high", cap: 16, booked: 16 },
      { d: 4, t: 360, dur: 60, name: "Friday Forge", trainer: "Mara Devlin", room: "Iron Floor", type: "strength", intensity: "mid", cap: 16, booked: 12 },
      { d: 4, t: 540, dur: 45, name: "Power Cycle 45", trainer: "Lena Brooks", room: "Spin Studio", type: "cycle", intensity: "mid", cap: 24, booked: 19 },
      { d: 4, t: 1110, dur: 50, name: "Flow & Release", trainer: "Priya Nair", room: "Studio B", type: "yoga", intensity: "low", cap: 18, booked: 5 },
      { d: 5, t: 480, dur: 50, name: "Weekend Warrior HIIT", trainer: "Theo Vance", room: "Turf Zone", type: "hiit", intensity: "high", cap: 22, booked: 18 },
      { d: 5, t: 600, dur: 45, name: "Boxing Burn", trainer: "Caleb Ortiz", room: "Ring Room", type: "boxing", intensity: "high", cap: 16, booked: 11 },
      { d: 5, t: 660, dur: 60, name: "Mobility Reset", trainer: "Priya Nair", room: "Studio B", type: "yoga", intensity: "low", cap: 18, booked: 7 },
      { d: 6, t: 540, dur: 60, name: "Sunday Strength", trainer: "Mara Devlin", room: "Iron Floor", type: "strength", intensity: "mid", cap: 16, booked: 10 },
      { d: 6, t: 600, dur: 50, name: "Endurance Cycle", trainer: "Lena Brooks", room: "Spin Studio", type: "cycle", intensity: "high", cap: 24, booked: 14 },
    ],
    riverside: [
      { d: 0, t: 375, dur: 45, name: "Harbor HIIT", trainer: "Jonas Pike", room: "Bay Floor", type: "hiit", intensity: "high", cap: 18, booked: 12 },
      { d: 0, t: 1080, dur: 60, name: "Strong Foundations", trainer: "Ines Calderon", room: "Lift Hall", type: "strength", intensity: "mid", cap: 16, booked: 9 },
      { d: 0, t: 1140, dur: 50, name: "Sunset Cycle", trainer: "Ravi Shah", room: "Spin Loft", type: "cycle", intensity: "mid", cap: 20, booked: 16 },
      { d: 1, t: 360, dur: 60, name: "Riverside Yoga", trainer: "Tess Moreau", room: "Glass Studio", type: "yoga", intensity: "low", cap: 20, booked: 8 },
      { d: 1, t: 720, dur: 45, name: "Lunch Lift", trainer: "Ines Calderon", room: "Lift Hall", type: "strength", intensity: "mid", cap: 16, booked: 13 },
      { d: 1, t: 1110, dur: 45, name: "Boxing Basics", trainer: "Marcus Bell", room: "Dock Ring", type: "boxing", intensity: "mid", cap: 14, booked: 10 },
      { d: 2, t: 390, dur: 45, name: "Harbor HIIT", trainer: "Jonas Pike", room: "Bay Floor", type: "hiit", intensity: "high", cap: 18, booked: 18 },
      { d: 2, t: 1050, dur: 50, name: "Power Climb", trainer: "Ravi Shah", room: "Spin Loft", type: "cycle", intensity: "high", cap: 20, booked: 15 },
      { d: 3, t: 360, dur: 60, name: "Strong Foundations", trainer: "Ines Calderon", room: "Lift Hall", type: "strength", intensity: "mid", cap: 16, booked: 11 },
      { d: 3, t: 1080, dur: 45, name: "Combat Conditioning", trainer: "Marcus Bell", room: "Dock Ring", type: "boxing", intensity: "high", cap: 14, booked: 14 },
      { d: 3, t: 1140, dur: 60, name: "Evening Flow", trainer: "Tess Moreau", room: "Glass Studio", type: "yoga", intensity: "low", cap: 20, booked: 6 },
      { d: 4, t: 375, dur: 45, name: "Friday Fire HIIT", trainer: "Jonas Pike", room: "Bay Floor", type: "hiit", intensity: "high", cap: 18, booked: 13 },
      { d: 4, t: 1080, dur: 60, name: "Heavy Friday", trainer: "Ines Calderon", room: "Lift Hall", type: "strength", intensity: "high", cap: 12, booked: 8 },
      { d: 5, t: 540, dur: 50, name: "Weekend Cycle", trainer: "Ravi Shah", room: "Spin Loft", type: "cycle", intensity: "mid", cap: 20, booked: 17 },
      { d: 5, t: 600, dur: 60, name: "Saturday Sweat", trainer: "Jonas Pike", room: "Bay Floor", type: "hiit", intensity: "high", cap: 18, booked: 9 },
      { d: 6, t: 600, dur: 60, name: "Slow Sunday Yoga", trainer: "Tess Moreau", room: "Glass Studio", type: "yoga", intensity: "low", cap: 20, booked: 12 },
      { d: 6, t: 660, dur: 45, name: "Boxing Burn", trainer: "Marcus Bell", room: "Dock Ring", type: "boxing", intensity: "high", cap: 14, booked: 7 },
    ],
  };

  var LOCATION_LABEL = {
    downtown: { short: "Downtown", full: "Downtown — 12 Forge St" },
    riverside: { short: "Riverside", full: "Riverside — 88 Harbor Ave" },
  };

  var DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  /* ---------- State ---------- */
  var state = {
    location: "downtown",
    type: "all",
    trainer: "all",
    day: 0,
  };

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function fmtTime(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var ampm = h >= 12 ? "PM" : "AM";
    var hr = h % 12; if (hr === 0) hr = 12;
    return hr + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
  }
  function jsDayToIndex(js) { return js === 0 ? 6 : js - 1; } // JS Sun=0 -> our Sun=6

  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  var TODAY_IDX = jsDayToIndex(new Date().getDay());

  /* ---------- Build day tabs ---------- */
  function buildDayTabs() {
    var tabs = $("#dayTabs");
    tabs.innerHTML = "";
    var base = new Date();
    var todayJs = base.getDay();
    // Find Monday of current week.
    var monday = new Date(base);
    monday.setDate(base.getDate() - ((todayJs + 6) % 7));

    DAY_NAMES.forEach(function (name, i) {
      var dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      var btn = document.createElement("button");
      btn.className = "day-tab";
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.dataset.day = i;
      if (i === state.day) btn.classList.add("is-active");
      if (i === TODAY_IDX) btn.classList.add("is-today");
      btn.setAttribute("aria-selected", i === state.day ? "true" : "false");
      btn.innerHTML =
        '<span class="dt-day">' + name + "</span>" +
        '<span class="dt-date">' + dayDate.getDate() + "</span>";
      btn.addEventListener("click", function () {
        state.day = i;
        syncTabs();
        renderSchedule();
      });
      tabs.appendChild(btn);
    });
  }

  function syncTabs() {
    var tabs = $("#dayTabs").children;
    for (var i = 0; i < tabs.length; i++) {
      var active = Number(tabs[i].dataset.day) === state.day;
      tabs[i].classList.toggle("is-active", active);
      tabs[i].setAttribute("aria-selected", active ? "true" : "false");
    }
  }

  /* ---------- Trainer dropdown ---------- */
  function buildTrainerOptions() {
    var sel = $("#trainerSelect");
    var trainers = [];
    CLASSES[state.location].forEach(function (c) {
      if (trainers.indexOf(c.trainer) === -1) trainers.push(c.trainer);
    });
    trainers.sort();
    sel.innerHTML = '<option value="all">All trainers</option>';
    trainers.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t;
      o.textContent = t;
      sel.appendChild(o);
    });
    // Reset trainer filter if no longer present.
    if (state.trainer !== "all" && trainers.indexOf(state.trainer) === -1) {
      state.trainer = "all";
    }
    sel.value = state.trainer;
  }

  /* ---------- Render schedule ---------- */
  function intensityLabel(i) {
    return i === "low" ? "Low" : i === "mid" ? "Moderate" : "High";
  }

  function renderSchedule() {
    var container = $("#schedule");
    container.innerHTML = "";
    var list = CLASSES[state.location]
      .filter(function (c) { return c.d === state.day; })
      .filter(function (c) { return state.type === "all" || c.type === state.type; })
      .filter(function (c) { return state.trainer === "all" || c.trainer === state.trainer; })
      .sort(function (a, b) { return a.t - b.t; });

    var nowMins = new Date().getHours() * 60 + new Date().getMinutes();

    if (!list.length) {
      $("#emptyState").hidden = false;
      return;
    }
    $("#emptyState").hidden = true;

    list.forEach(function (c, idx) {
      var spotsLeft = c.cap - c.booked;
      var full = spotsLeft <= 0;
      var isNow = state.day === TODAY_IDX && nowMins >= c.t && nowMins < c.t + c.dur;

      var row = document.createElement("article");
      row.className = "class-row" + (isNow ? " is-now" : "");
      row.style.animationDelay = (idx * 0.04) + "s";

      var spotsClass = full ? "" : spotsLeft <= 3 ? "spots few" : "spots";
      var spotsText = full ? "Class full" : spotsLeft + " spots left";

      row.innerHTML =
        '<div class="cr-time">' +
          "<b>" + fmtTime(c.t) + "</b>" +
          "<span>" + c.dur + " min</span>" +
        "</div>" +
        '<div class="cr-main">' +
          '<h3 class="cr-name">' + c.name + (isNow ? ' <span class="badge high">In session</span>' : "") + "</h3>" +
          '<div class="cr-meta">' +
            '<span class="m-item cr-trainer">' + icon("user") + c.trainer + "</span>" +
            '<span class="m-item">' + icon("pin") + c.room + "</span>" +
            '<span class="m-item">' + icon("tag") + TYPE_LABEL[c.type] + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="cr-side">' +
          '<span class="badge ' + c.intensity + '">' + intensityLabel(c.intensity) + " intensity</span>" +
          (full
            ? '<button class="reserve-btn full" type="button" disabled>Waitlist</button>'
            : '<button class="reserve-btn" type="button">Reserve</button>') +
          '<span class="' + spotsClass + '">' + spotsText + "</span>" +
        "</div>";

      if (!full) {
        row.querySelector(".reserve-btn").addEventListener("click", function () {
          openModal(c);
        });
      } else {
        row.querySelector(".reserve-btn").addEventListener("click", function () {
          toast("Waitlist requested for " + c.name);
        });
        row.querySelector(".reserve-btn").disabled = false;
        row.querySelector(".reserve-btn").style.cursor = "pointer";
      }

      container.appendChild(row);
    });
  }

  function icon(kind) {
    var paths = {
      user: '<path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M2.5 14a5.5 5.5 0 0 1 11 0"/>',
      pin: '<path d="M8 1.5c-2.5 0-4.5 2-4.5 4.5C3.5 9.5 8 14.5 8 14.5s4.5-5 4.5-8.5C12.5 3.5 10.5 1.5 8 1.5Z"/><circle cx="8" cy="6" r="1.6"/>',
      tag: '<path d="M2 2h5l7 7-5 5-7-7V2Z"/><circle cx="5" cy="5" r="1"/>',
    };
    return '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + paths[kind] + "</svg>";
  }

  /* ---------- Modal ---------- */
  var activeClass = null;
  function openModal(c) {
    activeClass = c;
    $("#modalClassInfo").innerHTML =
      "<strong>" + c.name + "</strong> · " + fmtTime(c.t) + " with " + c.trainer +
      "<br>" + c.room + " · " + TYPE_LABEL[c.type];
    $("#modal").hidden = false;
    setTimeout(function () { $("#rName").focus(); }, 30);
    document.addEventListener("keydown", onEsc);
  }
  function closeModal() {
    $("#modal").hidden = true;
    $("#reserveForm").reset();
    document.removeEventListener("keydown", onEsc);
  }
  function onEsc(e) { if (e.key === "Escape") closeModal(); }

  /* ---------- Location change ---------- */
  function setLocation(loc) {
    state.location = loc;
    state.trainer = "all";
    var lbl = LOCATION_LABEL[loc];
    $("#heroLocation").textContent = lbl.short;
    $("#footLocation").textContent = lbl.full;
    buildTrainerOptions();
    renderSchedule();
    toast("Showing " + lbl.short + " schedule");
  }

  /* ---------- Wire up ---------- */
  function init() {
    buildDayTabs();
    buildTrainerOptions();
    renderSchedule();

    $("#locationSelect").addEventListener("change", function (e) {
      setLocation(e.target.value);
    });

    $("#typeChips").addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      state.type = chip.dataset.type;
      var chips = $("#typeChips").children;
      for (var i = 0; i < chips.length; i++) chips[i].classList.toggle("is-active", chips[i] === chip);
      renderSchedule();
    });

    $("#trainerSelect").addEventListener("change", function (e) {
      state.trainer = e.target.value;
      renderSchedule();
    });

    $("#trialBtn").addEventListener("click", function () {
      toast("Pick any class below and hit Reserve to start your free trial");
    });
    $("#printBtn").addEventListener("click", function () { window.print(); });

    $("#modalClose").addEventListener("click", closeModal);
    $("#modal").addEventListener("click", function (e) {
      if (e.target === $("#modal")) closeModal();
    });

    $("#reserveForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#rName").value.trim();
      var email = $("#rEmail").value.trim();
      if (!name) { toast("Please enter your name"); $("#rName").focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast("Enter a valid email"); $("#rEmail").focus(); return; }
      closeModal();
      toast("Reserved! " + (activeClass ? activeClass.name : "") + " — trial pass sent to " + email);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
