(function () {
  "use strict";

  // ---- Data ------------------------------------------------------------
  // Timeline runs 08:00 -> 18:00, in 30-min slots (20 slots).
  var START_HOUR = 8;
  var SLOTS = 20; // 10 hours * 2

  var GRADS = {
    atrium: "linear-gradient(135deg,#e8902b,#cc7918)",
    foundry: "linear-gradient(135deg,#5f7a52,#41553a)",
    press: "linear-gradient(135deg,#4a463e,#1c1b19)",
    clay: "linear-gradient(135deg,#d98a2b,#b06a1f)",
    loft: "linear-gradient(135deg,#7b766c,#4a463e)"
  };

  var ROOMS = [
    { id: "atrium", name: "The Atrium", seats: 8, price: 18, tag: "Bright · top floor",
      meta: ["Seats 8", "4K display", "Whiteboard"], booked: { 0: [4,5,6,7, 14,15], 1: [0,1,2], 2: [8,9,10,11] } },
    { id: "foundry", name: "Foundry Room", seats: 4, price: 12, tag: "Quiet · plant wall",
      meta: ["Seats 4", "TV + cam", "Soundproof"], booked: { 0: [0,1, 10,11,12], 1: [6,7,8,9,10,11], 2: [2,3] } },
    { id: "press", name: "The Press", seats: 14, price: 32, tag: "Boardroom",
      meta: ["Seats 14", "Dual screen", "Catering"], booked: { 0: [2,3,4,5,6,7,8], 1: [14,15,16,17], 2: [] } },
    { id: "clay", name: "Clay Studio", seats: 6, price: 15, tag: "Workshop · L-shape",
      meta: ["Seats 6", "Projector", "Movable desks"], booked: { 0: [16,17,18,19], 1: [0,1,2,3,4], 2: [12,13,14,15] } },
    { id: "loft", name: "Loft Nook", seats: 2, price: 8, tag: "Focus pod",
      meta: ["Seats 2", "Mic + cam", "Standing"], booked: { 0: [], 1: [10,11], 2: [4,5,6,7,8,9] } }
  ];

  var DAYS = (function () {
    var base = new Date();
    var out = [];
    var names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (var i = 0; i < 3; i++) {
      var d = new Date(base.getTime() + i * 86400000);
      out.push({ key: i, label: i === 0 ? "Today" : names[d.getDay()], num: d.getDate() });
    }
    return out;
  })();

  // ---- State -----------------------------------------------------------
  var state = {
    roomId: "atrium",
    day: 0,
    durH: 0.5,        // duration in hours
    selStart: null,   // slot index
    attendees: ["Mara Velez", "Theo Park"]
  };

  // ---- Helpers ---------------------------------------------------------
  function $(sel) { return document.querySelector(sel); }
  function room() { return ROOMS.filter(function (r) { return r.id === state.roomId; })[0]; }
  function durSlots() { return Math.round(state.durH * 2); }

  function slotTime(i) {
    var h = START_HOUR + Math.floor(i / 2);
    var m = i % 2 === 0 ? "00" : "30";
    return (h < 10 ? "0" + h : h) + ":" + m;
  }
  function rangeLabel(start, len) {
    var endIdx = start + len;
    return slotTime(start) + "–" + slotTime(endIdx);
  }
  function initials(name) {
    var p = name.trim().split(/\s+/);
    return ((p[0] || "")[0] + (p[1] ? p[1][0] : "")).toUpperCase();
  }
  function bookedSet() {
    var r = room();
    var arr = (r.booked && r.booked[state.day]) || [];
    var s = {};
    arr.forEach(function (i) { s[i] = true; });
    return s;
  }

  var toastEl = $("#toast");
  var toastT;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (kind ? " toast--" + kind : "");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.className = "toast"; }, 2600);
  }

  // ---- Render: rooms ---------------------------------------------------
  function freeCount(r, day) {
    var arr = (r.booked && r.booked[day]) || [];
    return SLOTS - arr.length;
  }

  function renderRooms() {
    var grid = $("#roomGrid");
    grid.innerHTML = "";
    ROOMS.forEach(function (r) {
      var free = freeCount(r, state.day);
      var busy = free < SLOTS * 0.4;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "room" + (r.id === state.roomId ? " is-sel" : "");
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", r.id === state.roomId ? "true" : "false");
      btn.innerHTML =
        '<div class="room__photo" style="background:' + GRADS[r.id] + '">' +
          '<span class="room__tag">' + r.tag + '</span>' +
          '<span class="room__sel-mark" aria-hidden="true">✓</span>' +
        '</div>' +
        '<div class="room__body">' +
          '<p class="room__name">' + r.name + '</p>' +
          '<div class="room__meta">' + r.meta.map(function (m) { return '<span class="chip">' + m + '</span>'; }).join("") + '</div>' +
          '<div class="room__foot">' +
            '<span class="room__price"><b>$' + r.price + '</b> <span>/ hr</span></span>' +
            '<span class="room__avail ' + (busy ? "busy" : "open") + '">' + (busy ? "Limited" : "Open") + '</span>' +
          '</div>' +
        '</div>';
      btn.addEventListener("click", function () { selectRoom(r.id); });
      grid.appendChild(btn);
    });
  }

  function selectRoom(id) {
    state.roomId = id;
    state.selStart = null;
    var r = room();
    $("#roomTitle").textContent = r.name;
    $("#roomMeta").textContent = r.meta.join(" · ");
    renderRooms();
    renderTimeline();
    renderAttendees();
    updateSummary();
  }

  // ---- Render: days ----------------------------------------------------
  function renderDays() {
    var wrap = $("#dayPills");
    wrap.innerHTML = "";
    DAYS.forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "day-pill" + (d.key === state.day ? " is-on" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", d.key === state.day ? "true" : "false");
      b.innerHTML = d.label + "<small>" + d.num + "</small>";
      b.addEventListener("click", function () {
        state.day = d.key;
        state.selStart = null;
        renderDays();
        renderRooms();
        renderTimeline();
        updateSummary();
      });
      wrap.appendChild(b);
    });
  }

  // ---- Render: timeline ------------------------------------------------
  function conflict(start, len) {
    if (start == null) return true;
    if (start + len > SLOTS) return true;
    var bk = bookedSet();
    for (var i = start; i < start + len; i++) {
      if (bk[i]) return true;
    }
    return false;
  }

  function renderTimeline() {
    var tl = $("#timeline");
    tl.innerHTML = "";
    var bk = bookedSet();
    var len = durSlots();
    for (var i = 0; i < SLOTS; i++) {
      var s = document.createElement("div");
      s.className = "slot" + (bk[i] ? " booked" : "");
      s.setAttribute("data-i", i);
      s.setAttribute("data-time", slotTime(i));
      s.setAttribute("role", "gridcell");
      if (bk[i]) s.setAttribute("aria-label", slotTime(i) + " booked");
      else s.setAttribute("aria-label", slotTime(i) + " available");
      tl.appendChild(s);
    }
    paintSelection();
    bindTimeline();
  }

  function paintSelection() {
    var slots = $("#timeline").querySelectorAll(".slot");
    var len = durSlots();
    slots.forEach(function (el) { el.classList.remove("sel"); });
    if (state.selStart == null) return;
    if (conflict(state.selStart, len)) return;
    for (var i = state.selStart; i < state.selStart + len; i++) {
      if (slots[i]) slots[i].classList.add("sel");
    }
  }

  function trySelect(start) {
    var len = durSlots();
    var bk = bookedSet();
    if (bk[start]) { toast("That slot is already booked.", "warn"); return; }
    if (start + len > SLOTS) {
      // shift back so the range fits within the day
      start = SLOTS - len;
    }
    if (conflict(start, len)) {
      toast("Not enough free time there — pick another slot.", "warn");
      return;
    }
    state.selStart = start;
    paintSelection();
    updateSummary();
  }

  var dragging = false;
  function bindTimeline() {
    var tl = $("#timeline");
    var slots = tl.querySelectorAll(".slot");

    slots.forEach(function (el) {
      el.addEventListener("mousedown", function () {
        dragging = true;
        trySelect(parseInt(el.getAttribute("data-i"), 10));
      });
      el.addEventListener("mouseenter", function () {
        if (dragging) trySelect(parseInt(el.getAttribute("data-i"), 10));
      });
      // touch
      el.addEventListener("touchstart", function (e) {
        e.preventDefault();
        trySelect(parseInt(el.getAttribute("data-i"), 10));
      }, { passive: false });
    });

    tl.addEventListener("touchmove", function (e) {
      var t = e.touches[0];
      var target = document.elementFromPoint(t.clientX, t.clientY);
      if (target && target.classList.contains("slot")) {
        trySelect(parseInt(target.getAttribute("data-i"), 10));
      }
    }, { passive: true });
  }

  document.addEventListener("mouseup", function () { dragging = false; });

  // keyboard on timeline
  $("#timeline").addEventListener("keydown", function (e) {
    var len = durSlots();
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      var cur = state.selStart == null ? 0 : state.selStart;
      var next = e.key === "ArrowRight" ? cur + 1 : cur - 1;
      next = Math.max(0, Math.min(SLOTS - len, next));
      // walk to next non-conflicting start
      var guard = 0;
      while (conflict(next, len) && guard < SLOTS) {
        next += e.key === "ArrowRight" ? 1 : -1;
        next = Math.max(0, Math.min(SLOTS - len, next));
        guard++;
      }
      if (!conflict(next, len)) { state.selStart = next; paintSelection(); updateSummary(); }
    }
  });

  // ---- Duration --------------------------------------------------------
  function bindDuration() {
    var btns = document.querySelectorAll(".dur__btn");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
        state.durH = parseFloat(b.getAttribute("data-h"));
        $("#durSel").value = b.getAttribute("data-h");
        // re-validate current selection
        if (state.selStart != null && conflict(state.selStart, durSlots())) {
          state.selStart = null;
          toast("Selection no longer fits — choose a new slot.", "warn");
        }
        paintSelection();
        updateSummary();
      });
    });
  }

  // ---- Attendees -------------------------------------------------------
  function renderAttendees() {
    var list = $("#attList");
    list.innerHTML = "";
    state.attendees.forEach(function (name, idx) {
      var pill = document.createElement("span");
      pill.className = "att-pill";
      pill.innerHTML =
        '<span class="att-pill__av">' + initials(name) + '</span>' +
        '<span>' + name + '</span>' +
        '<button type="button" class="att-pill__x" aria-label="Remove ' + name + '">×</button>';
      pill.querySelector(".att-pill__x").addEventListener("click", function () {
        state.attendees.splice(idx, 1);
        renderAttendees();
        updateSummary();
      });
      list.appendChild(pill);
    });
    var r = room();
    var c = $("#attCount");
    c.textContent = state.attendees.length + " attendee" + (state.attendees.length === 1 ? "" : "s") + " · room seats " + r.seats;
    c.classList.toggle("over", state.attendees.length > r.seats);
  }

  function addAttendee() {
    var input = $("#attInput");
    var v = input.value.trim();
    if (!v) return;
    if (state.attendees.length >= room().seats) {
      toast("Room only seats " + room().seats + ".", "warn");
      return;
    }
    state.attendees.push(v);
    input.value = "";
    renderAttendees();
    updateSummary();
  }

  function bindAttendees() {
    $("#attAdd").addEventListener("click", addAttendee);
    $("#attInput").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); addAttendee(); }
    });
  }

  // ---- Summary + confirm ----------------------------------------------
  function durLabel() {
    return state.durH < 1 ? (state.durH * 60) + "m"
      : (state.durH % 1 === 0 ? state.durH + "h" : state.durH + "h");
  }

  function updateSummary() {
    var r = room();
    $("#sumRoom").textContent = r.name;
    var len = durSlots();
    var ok = state.selStart != null && !conflict(state.selStart, len);
    $("#sumWhen").textContent = ok
      ? DAYS[state.day].label + " · " + rangeLabel(state.selStart, len)
      : "Select a time";
    $("#sumDur").textContent = durLabel();
    var price = ok ? Math.round(r.price * state.durH) : 0;
    $("#sumPrice").textContent = "$" + price;

    var btn = $("#confirmBtn");
    if (!ok) {
      btn.disabled = true;
      btn.textContent = "Select a time to continue";
    } else if (state.attendees.length > r.seats) {
      btn.disabled = true;
      btn.textContent = "Too many attendees for this room";
    } else {
      btn.disabled = false;
      btn.textContent = "Confirm booking · $" + price;
    }
  }

  function confirm() {
    var len = durSlots();
    if (state.selStart == null || conflict(state.selStart, len)) {
      toast("Pick an available time first.", "warn");
      return;
    }
    var r = room();
    // mark slots booked locally so they show as taken
    var arr = (r.booked[state.day] = r.booked[state.day] || []);
    for (var i = state.selStart; i < state.selStart + len; i++) arr.push(i);

    // deduct credits
    var left = parseFloat($("#creditsLeft").textContent) - state.durH;
    if (left < 0) left = 0;
    $("#creditsLeft").textContent = (left % 1 === 0 ? left : left.toFixed(1));

    toast(r.name + " booked · " + DAYS[state.day].label + " " + rangeLabel(state.selStart, len), "ok");
    state.selStart = null;
    renderRooms();
    renderTimeline();
    updateSummary();
  }

  // ---- Init ------------------------------------------------------------
  function init() {
    renderDays();
    renderRooms();
    var r = room();
    $("#roomTitle").textContent = r.name;
    $("#roomMeta").textContent = r.meta.join(" · ");
    renderTimeline();
    renderAttendees();
    bindDuration();
    bindAttendees();
    updateSummary();
    $("#confirmBtn").addEventListener("click", confirm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
