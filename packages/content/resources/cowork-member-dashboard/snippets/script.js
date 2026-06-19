(function () {
  "use strict";

  /* ---------- State ---------- */
  var TOTAL_HOURS = 40;
  var usedHours = 16;
  var checkedIn = true;

  var bookings = [
    { id: "b1", from: "09:30", to: "11:00", title: "Standing Desk 14", where: "North Loft · Floor 2", type: "desk" },
    { id: "b2", from: "13:00", to: "14:00", title: "Spindle Meeting Room", where: "Glass wing · seats 6", type: "room" },
    { id: "b3", from: "16:30", to: "17:00", title: "Focus Booth B", where: "Quiet corridor", type: "booth" }
  ];

  var quickSpaces = [
    { name: "Hot Desk 02", area: "Open floor", cost: "1 hr", free: true },
    { name: "Phone Booth A", area: "Calls · 30 min", cost: "0.5 hr", free: true },
    { name: "Spindle Room", area: "Seats 6", cost: "2 hr", free: false },
    { name: "Maker Bench", area: "Workshop", cost: "1 hr", free: true }
  ];

  var events = [
    { d: "19", m: "Jun", title: "Lunch & Learn: Type design", meta: "12:30 · The Commons", going: false },
    { d: "22", m: "Jun", title: "Members' rooftop social", meta: "18:00 · Sky Terrace", going: true },
    { d: "25", m: "Jun", title: "Founders coffee circle", meta: "08:30 · Café bar", going: false }
  ];

  var shouts = [
    { who: "Priya Anand", init: "PA", hue: "var(--amber)", text: "Huge thanks to Dev for jump-starting my laptop in the lobby — lifesaver before a client call!", time: "2h ago", cheers: 14 },
    { who: "Theo Marsh", init: "TM", hue: "var(--plant)", text: "Maker Bench is freshly stocked with cutting mats and spare blades. Go build something.", time: "5h ago", cheers: 9 },
    { who: "Nina Okafor", init: "NO", hue: "#8a6f4a", text: "Found a navy water bottle in Spindle Room — it's at the front desk. Come claim it!", time: "Yesterday", cheers: 6 }
  ];

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  var toastWrap = $("#toastWrap");

  function toast(msg, icon) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="t-ico">' + (icon || "✓") + "</span>" + msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 320);
    }, 2600);
  }

  /* ---------- Credits ring ---------- */
  var ring = $("#ringFg");
  var creditsNum = $("#creditsNum");
  var CIRC = 2 * Math.PI * 52; // ~326.7

  function renderCredits(animate) {
    var left = Math.max(0, TOTAL_HOURS - usedHours);
    var frac = usedHours / TOTAL_HOURS;
    ring.style.strokeDashoffset = String(CIRC * (1 - frac));

    if (animate === false) {
      creditsNum.textContent = left;
      return;
    }
    // count-up animation on the "hours left" figure
    var start = parseInt(creditsNum.textContent, 10) || 0;
    var dur = 900, t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      creditsNum.textContent = Math.round(start + (left - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Bookings ---------- */
  var bookingList = $("#bookingList");
  var bookingEmpty = $("#bookingEmpty");
  var todayCount = $("#todayCount");

  var TYPE_LABEL = { desk: "Desk", room: "Meeting room", booth: "Focus booth" };

  function renderBookings() {
    bookingList.innerHTML = "";
    bookings.forEach(function (b) {
      var li = document.createElement("li");
      li.className = "booking";
      li.dataset.id = b.id;
      li.innerHTML =
        '<div class="bk-time"><b>' + b.from + "</b><small>" + b.to + "</small></div>" +
        '<div class="bk-info"><b>' + b.title + "</b><span>" + b.where + "</span>" +
        '<span class="bk-tag tag-' + b.type + '">' + TYPE_LABEL[b.type] + "</span></div>" +
        '<button class="cancel-btn" type="button">Cancel</button>';
      li.querySelector(".cancel-btn").addEventListener("click", function () { cancelBooking(b.id); });
      bookingList.appendChild(li);
    });
    var n = bookings.length;
    todayCount.textContent = n + " booked";
    bookingEmpty.hidden = n !== 0;
  }

  function cancelBooking(id) {
    var li = bookingList.querySelector('[data-id="' + id + '"]');
    if (li) li.classList.add("removing");
    var idx = bookings.findIndex(function (b) { return b.id === id; });
    var title = idx > -1 ? bookings[idx].title : "Booking";
    setTimeout(function () {
      if (idx > -1) {
        // refund 1 credit hour on cancel
        usedHours = Math.max(0, usedHours - 1);
        bookings.splice(idx, 1);
      }
      renderBookings();
      renderCredits(true);
    }, 300);
    toast(title + " cancelled · 1 hr refunded", "↺");
  }

  /* ---------- Quick book ---------- */
  var quickGrid = $("#quickGrid");
  var bookSeq = 4;

  function renderQuick() {
    quickGrid.innerHTML = "";
    quickSpaces.forEach(function (s, i) {
      var btn = document.createElement("button");
      btn.className = "quick-tile";
      btn.type = "button";
      btn.disabled = !s.free;
      btn.innerHTML =
        '<div class="qt-top"><span class="qt-name">' + s.name + "</span>" +
        '<span class="qt-status ' + (s.free ? "free" : "busy") + '">' + (s.free ? "Free now" : "Occupied") + "</span></div>" +
        '<span class="qt-meta">' + s.area + "</span>" +
        '<span class="qt-cost">' + s.cost + " · book to 4:30pm</span>";
      if (s.free) {
        btn.addEventListener("click", function () { quickBook(s, i); });
      }
      quickGrid.appendChild(btn);
    });
  }

  function quickBook(space, i) {
    bookSeq += 1;
    var cost = space.cost.indexOf("0.5") === 0 ? 0.5 : (parseFloat(space.cost) || 1);
    var typ = space.name.toLowerCase().indexOf("room") > -1 ? "room"
            : space.name.toLowerCase().indexOf("booth") > -1 ? "booth" : "desk";
    bookings.push({
      id: "q" + bookSeq, from: "Now", to: "+1h",
      title: space.name, where: space.area, type: typ
    });
    usedHours = Math.min(TOTAL_HOURS, usedHours + cost);
    // mark occupied for the session
    space.free = false;
    renderBookings();
    renderQuick();
    renderCredits(true);
    toast(space.name + " booked · added to today", "✓");
  }

  /* ---------- Tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var which = tab.dataset.panel;
      ["events", "shouts"].forEach(function (p) {
        var panel = $("#panel-" + p);
        var on = p === which;
        panel.classList.toggle("is-active", on);
        panel.hidden = !on;
      });
    });
  });

  /* ---------- Events ---------- */
  var eventList = $("#eventList");
  function renderEvents() {
    eventList.innerHTML = "";
    events.forEach(function (e, i) {
      var li = document.createElement("li");
      li.className = "event";
      li.innerHTML =
        '<div class="ev-date"><b>' + e.d + "</b><small>" + e.m + "</small></div>" +
        '<div class="ev-info"><b>' + e.title + "</b><span>" + e.meta + "</span></div>" +
        '<button class="rsvp-btn' + (e.going ? " is-going" : "") + '" type="button">' +
        (e.going ? "Going" : "RSVP") + "</button>";
      var btn = li.querySelector(".rsvp-btn");
      btn.addEventListener("click", function () {
        e.going = !e.going;
        btn.classList.toggle("is-going", e.going);
        btn.textContent = e.going ? "Going" : "RSVP";
        toast(e.going ? "You're going to " + e.title : "RSVP removed", e.going ? "✓" : "✕");
      });
      eventList.appendChild(li);
    });
  }

  /* ---------- Shoutouts ---------- */
  var shoutList = $("#shoutList");
  function renderShouts() {
    shoutList.innerHTML = "";
    shouts.forEach(function (s) {
      var li = document.createElement("li");
      li.className = "shout";
      li.innerHTML =
        '<div class="sh-av" style="background:' + s.hue + '">' + s.init + "</div>" +
        '<div class="sh-body"><b>' + s.who + "</b><p>" + s.text + "</p>" +
        '<div class="sh-foot"><span>' + s.time + "</span>" +
        '<button class="cheer-btn" type="button">▲ <span class="cheer-n">' + s.cheers + "</span></button></div></div>";
      var btn = li.querySelector(".cheer-btn");
      var nSpan = li.querySelector(".cheer-n");
      var cheered = false;
      btn.addEventListener("click", function () {
        cheered = !cheered;
        s.cheers += cheered ? 1 : -1;
        nSpan.textContent = s.cheers;
        btn.classList.toggle("cheered", cheered);
      });
      shoutList.appendChild(li);
    });
  }

  /* ---------- Access / check-in ---------- */
  var accessCard = $("#accessCard");
  var accessLabel = $("#accessLabel");
  var accessSub = $("#accessSub");
  var accessToggle = $("#accessToggle");

  function renderAccess() {
    accessCard.classList.toggle("is-out", !checkedIn);
    accessLabel.textContent = checkedIn ? "Checked in" : "Checked out";
    accessSub.textContent = checkedIn ? "North Loft · Floor 2" : "Tap to scan at the door";
    accessToggle.textContent = checkedIn ? "Check out" : "Check in";
  }
  accessToggle.addEventListener("click", function () {
    checkedIn = !checkedIn;
    renderAccess();
    toast(checkedIn ? "Welcome back — checked in" : "Checked out. See you soon!", checkedIn ? "◍" : "◌");
  });

  /* ---------- QR (decorative) ---------- */
  function renderQR() {
    var grid = $("#qrGrid");
    // deterministic pseudo-pattern so it looks like a real code
    var seed = 7;
    for (var i = 0; i < 49; i++) {
      var cell = document.createElement("i");
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var on = (seed >> 7) % 100 > 48;
      // force finder-pattern-ish corners
      var r = Math.floor(i / 7), c = i % 7;
      var corner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
      if (corner) on = (r === 0 || r === 6 || c === 0 || c === 6 || (r === 1 && c === 1));
      if (!on) cell.className = "off";
      grid.appendChild(cell);
    }
  }

  /* ---------- Top up ---------- */
  $("#topUpBtn").addEventListener("click", function () {
    usedHours = Math.max(0, usedHours - 8);
    renderCredits(true);
    toast("+8 hrs added to your balance", "＋");
  });

  /* ---------- Quick book top button → first free space ---------- */
  $("#quickBookBtn").addEventListener("click", function () {
    var idx = quickSpaces.findIndex(function (s) { return s.free; });
    if (idx === -1) { toast("No instant spaces free right now", "✕"); return; }
    quickBook(quickSpaces[idx], idx);
  });

  /* ---------- Init ---------- */
  renderQR();
  renderAccess();
  renderBookings();
  renderQuick();
  renderEvents();
  renderShouts();
  renderCredits(false);
  // trigger ring + count animation shortly after paint
  requestAnimationFrame(function () {
    setTimeout(function () { renderCredits(true); }, 220);
  });
})();
