(function () {
  "use strict";

  // ---------- state ----------
  var state = {
    lifetimeHours: 109,   // hours before this month
    monthHours: 18,
    mealsPerHour: 12,
    monthGoal: 32
  };

  var upcoming = [
    { id: "u1", d: 21, m: "Jun", title: "Riverside Pantry — distribution", role: "Floor lead", time: "Sat 9:00 AM – 12:00 PM", loc: "Riverside Pantry", hours: 3, status: "confirmed" },
    { id: "u2", d: 24, m: "Jun", title: "Mobile Pantry route", role: "Driver assistant", time: "Tue 1:00 PM – 4:00 PM", loc: "Eastside route", hours: 3, status: "confirmed" },
    { id: "u3", d: 28, m: "Jun", title: "Warehouse sorting", role: "Sorter", time: "Sat 8:00 AM – 11:00 AM", loc: "Central Warehouse", hours: 3, status: "confirmed" }
  ];

  var available = [
    { id: "a1", d: 22, m: "Jun", title: "Community garden harvest", role: "Picker", time: "Sun 7:30 AM – 10:30 AM", loc: "Loma Verde Garden", hours: 3, spots: 4 },
    { id: "a2", d: 25, m: "Jun", title: "Riverside Pantry — meal prep", role: "Kitchen crew", time: "Wed 4:00 PM – 7:00 PM", loc: "Riverside Pantry", hours: 3, spots: 2 },
    { id: "a3", d: 27, m: "Jun", title: "Senior meal delivery", role: "Delivery", time: "Fri 11:00 AM – 1:00 PM", loc: "Hillcrest area", hours: 2, spots: 1 },
    { id: "a4", d: 29, m: "Jun", title: "Donation drive — intake", role: "Greeter", time: "Sun 10:00 AM – 2:00 PM", loc: "Civic Plaza", hours: 4, spots: 0 }
  ];

  var past = [
    { id: "p1", d: 14, m: "Jun", title: "Riverside Pantry — distribution", role: "Floor lead", time: "Sat 9:00 AM – 12:00 PM", loc: "Riverside Pantry", hours: 3 },
    { id: "p2", d: 10, m: "Jun", title: "Warehouse sorting", role: "Sorter", time: "Tue 1:00 PM – 4:00 PM", loc: "Central Warehouse", hours: 3 },
    { id: "p3", d: 7, m: "Jun", title: "Mobile Pantry route", role: "Driver assistant", time: "Sat 8:00 AM – 12:00 PM", loc: "Westend route", hours: 4 }
  ];

  // booked calendar days (this month)
  var bookedDays = {};
  function syncBookedDays() {
    bookedDays = {};
    upcoming.forEach(function (s) { if (s.m === "Jun") bookedDays[s.d] = true; });
  }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- toast ----------
  var toastWrap = $("#toastWrap");
  function toast(msg, kind) {
    var t = document.createElement("div");
    t.className = "toast" + (kind === "warn" ? " warn" : "");
    var ic = document.createElement("span");
    ic.className = "ic";
    ic.textContent = kind === "warn" ? "!" : "✓";
    t.appendChild(ic);
    t.appendChild(document.createTextNode(msg));
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.style.transition = "opacity .3s, transform .3s";
      t.style.opacity = "0";
      t.style.transform = "translateY(8px)";
      setTimeout(function () { t.remove(); }, 320);
    }, 2600);
  }

  // ---------- animated counters ----------
  function animateCount(el, to, opts) {
    opts = opts || {};
    var from = parseFloat((el.textContent || "0").replace(/[^0-9.]/g, "")) || 0;
    var dur = 700, start = null, dec = opts.decimals || 0;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = from + (to - from) * eased;
      el.textContent = dec ? val.toFixed(dec) : Math.round(val).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = dec ? to.toFixed(dec) : Math.round(to).toLocaleString("en-US");
    }
    requestAnimationFrame(step);
  }

  function refreshStats(animate) {
    var lifetime = state.lifetimeHours + state.monthHours;
    var meals = Math.round(lifetime * state.mealsPerHour);
    var setters = [
      ["#hoursTotal", lifetime],
      ["#hoursMonth", state.monthHours],
      ["#mealsCount", meals]
    ];
    setters.forEach(function (pair) {
      var el = $(pair[0]);
      if (!el) return;
      if (animate) animateCount(el, pair[1]);
      else el.textContent = pair[1].toLocaleString("en-US");
    });
    $("#shiftCount").textContent = upcoming.length;
    $("#leaderMe").textContent = lifetime + " hrs";

    // thermometer
    var pct = Math.min((state.monthHours / state.monthGoal) * 100, 100);
    $("#thermoFill").style.width = pct + "%";
    var thermo = $("#thermo");
    thermo.setAttribute("aria-valuenow", String(state.monthHours));
    if (animate) animateCount($("#goalNow"), state.monthHours);
    else $("#goalNow").textContent = state.monthHours;

    updateBadges();
  }

  // ---------- shift rendering ----------
  function shiftDateEl(s) {
    return '<div class="shift-date"><span class="d">' + s.d + '</span><span class="m">' + s.m + '</span></div>';
  }
  function shiftBody(s) {
    return '<div class="shift-body"><p class="shift-title">' + s.title + '</p>' +
      '<p class="shift-meta"><span class="role">' + s.role + '</span><span>' + s.time + '</span><span>• ' + s.loc + '</span></p></div>';
  }

  function renderUpcoming() {
    var p = $("#panel-upcoming");
    if (!upcoming.length) { p.innerHTML = '<p class="empty">No upcoming shifts. Claim one from the Available tab!</p>'; return; }
    p.innerHTML = upcoming.map(function (s) {
      return '<div class="shift" data-id="' + s.id + '">' + shiftDateEl(s) + shiftBody(s) +
        '<div class="shift-cta"><span class="tag confirmed">Confirmed</span>' +
        '<button class="btn btn-cancel" data-cancel="' + s.id + '">Cancel</button></div></div>';
    }).join("");
  }

  function renderAvailable() {
    var p = $("#panel-available");
    p.innerHTML = available.map(function (s) {
      var full = s.spots <= 0;
      var spotCls = full ? "full" : (s.spots <= 2 ? "low" : "");
      var spotTxt = full ? "Full" : s.spots + " spot" + (s.spots === 1 ? "" : "s") + " left";
      var cta = full
        ? '<button class="btn btn-ghost" disabled>Full</button>'
        : '<button class="btn btn-claim" data-claim="' + s.id + '">Claim shift</button>';
      return '<div class="shift' + (full ? " full" : "") + '" data-id="' + s.id + '">' + shiftDateEl(s) + shiftBody(s) +
        '<div class="shift-cta"><span class="spots ' + spotCls + '">' + spotTxt + '</span>' + cta + '</div></div>';
    }).join("");
  }

  function renderPast() {
    var p = $("#panel-past");
    p.innerHTML = past.map(function (s) {
      return '<div class="shift" data-id="' + s.id + '">' + shiftDateEl(s) + shiftBody(s) +
        '<div class="shift-cta"><span class="tag done">' + s.hours + ' hrs ✓</span></div></div>';
    }).join("");
  }

  function refreshPills() {
    $("#pill-upcoming").textContent = upcoming.length;
    $("#pill-available").textContent = available.filter(function (s) { return s.spots > 0; }).length;
  }

  // ---------- claim / cancel ----------
  function claimShift(id) {
    var idx = available.findIndex(function (s) { return s.id === id; });
    if (idx < 0) return;
    var s = available[idx];
    if (s.spots <= 0) return;
    s.spots -= 1;
    upcoming.push({ id: s.id, d: s.d, m: s.m, title: s.title, role: s.role, time: s.time, loc: s.loc, hours: s.hours, status: "confirmed" });
    upcoming.sort(function (a, b) { return a.d - b.d; });
    syncBookedDays();
    renderUpcoming(); renderAvailable(); renderPast();
    refreshPills(); renderCalendar(); refreshStats(true);
    toast('Claimed "' + s.title + '" — see you there!');
  }

  function cancelShift(id) {
    var idx = upcoming.findIndex(function (s) { return s.id === id; });
    if (idx < 0) return;
    var s = upcoming[idx];
    upcoming.splice(idx, 1);
    // restore a spot if it came from available pool
    var av = available.find(function (a) { return a.id === id; });
    if (av) av.spots += 1;
    syncBookedDays();
    renderUpcoming(); renderAvailable();
    refreshPills(); renderCalendar(); refreshStats(true);
    toast('Cancelled "' + s.title + '". A spot reopened.', "warn");
  }

  // event delegation
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-claim]");
    if (c) { claimShift(c.getAttribute("data-claim")); return; }
    var x = e.target.closest("[data-cancel]");
    if (x) { cancelShift(x.getAttribute("data-cancel")); return; }
  });

  // ---------- tabs ----------
  var tabs = $$(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { activate(tab); });
    tab.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(tab);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var n = e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
        tabs[n].focus(); activate(tabs[n]);
      }
    });
  });
  function activate(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      var panel = $("#panel-" + t.getAttribute("data-tab"));
      if (panel) panel.hidden = !on;
    });
  }

  // ---------- calendar ----------
  function renderCalendar() {
    var grid = $("#calGrid");
    var days = ["S", "M", "T", "W", "T", "F", "S"];
    var html = days.map(function (d) { return '<div class="cal-head">' + d + '</div>'; }).join("");
    // June 2026 starts on Monday (1st = Mon). offset blanks for Sunday-start grid = 1
    var firstWeekday = 1;
    var total = 30, today = 17;
    for (var b = 0; b < firstWeekday; b++) html += '<div class="cal-cell blank"></div>';
    for (var day = 1; day <= total; day++) {
      var cls = "cal-cell";
      if (bookedDays[day]) cls += " booked";
      if (day === today) cls += " today";
      html += '<div class="' + cls + '" ' + (bookedDays[day] ? 'title="You have a shift"' : "") + '>' + day + '</div>';
    }
    grid.innerHTML = html;
  }

  // ---------- badges ----------
  var badges = [
    { ic: "🌱", bg: "rgba(47,158,111,.16)", name: "First Shift", sub: "Completed", need: 1 },
    { ic: "🔥", bg: "rgba(232,116,59,.16)", name: "50 Hours", sub: "Milestone", need: 50 },
    { ic: "🍽️", bg: "rgba(31,122,109,.14)", name: "1,000 Meals", sub: "Impact", need: 84 },
    { ic: "🏆", bg: "rgba(217,138,43,.16)", name: "Century Club", sub: "100 hours", need: 100 }
  ];
  function updateBadges() {
    var lifetime = state.lifetimeHours + state.monthHours;
    var list = $("#badgeList");
    list.innerHTML = badges.map(function (b) {
      var earned = lifetime >= b.need;
      return '<li class="badge' + (earned ? "" : " locked") + '">' +
        '<span class="badge-ic" style="background:' + b.bg + '">' + b.ic + '</span>' +
        '<span class="name">' + b.name + '<small>' + (earned ? b.sub : ((b.need - lifetime) + " hrs to go") ) + '</small></span></li>';
    }).join("");
  }

  // ---------- modal ----------
  var modal = $("#modal"), lastFocus = null;
  function openModal() {
    lastFocus = document.activeElement;
    var dateEl = $("#logDate");
    if (!dateEl.value) dateEl.value = "2026-06-17";
    modal.hidden = false;
    $("#logActivity").focus();
    document.addEventListener("keydown", escClose);
  }
  function closeModal() {
    modal.hidden = true;
    document.removeEventListener("keydown", escClose);
    if (lastFocus) lastFocus.focus();
  }
  function escClose(e) { if (e.key === "Escape") closeModal(); }

  $("#logHoursBtn").addEventListener("click", openModal);
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalCancel").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });

  $("#logForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var hrs = parseFloat($("#logHours").value) || 0;
    if (hrs <= 0) { toast("Enter a valid number of hours.", "warn"); return; }
    var activity = $("#logActivity").value;
    state.monthHours += hrs;
    refreshStats(true);
    closeModal();
    toast("Logged " + (hrs % 1 ? hrs.toFixed(1) : hrs) + " hrs — " + activity.split("—")[0].trim() + ". Thank you!");
    $("#logForm").reset();
  });

  // ---------- init ----------
  syncBookedDays();
  renderUpcoming(); renderAvailable(); renderPast();
  refreshPills(); renderCalendar();
  refreshStats(true);
})();
