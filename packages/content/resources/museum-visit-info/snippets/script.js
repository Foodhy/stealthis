(function () {
  "use strict";

  // Weekly schedule. open/close in 24h decimal hours; null = closed.
  // Order matches getDay() (0 = Sunday).
  var SCHEDULE = [
    { day: "Sunday",    open: 10, close: 17 },
    { day: "Monday",    open: null, close: null },
    { day: "Tuesday",   open: 10, close: 17 },
    { day: "Wednesday", open: 10, close: 17 },
    { day: "Thursday",  open: 10, close: 20 },
    { day: "Friday",    open: 10, close: 17 },
    { day: "Saturday",  open: 10, close: 18 }
  ];

  function fmt(h) {
    var hour = Math.floor(h);
    var min = Math.round((h - hour) * 60);
    var ampm = hour >= 12 ? "pm" : "am";
    var h12 = hour % 12; if (h12 === 0) h12 = 12;
    var mm = min === 0 ? "" : ":" + (min < 10 ? "0" + min : min);
    return h12 + mm + " " + ampm;
  }

  function rangeText(entry) {
    if (entry.open === null) return "Closed";
    return fmt(entry.open) + " – " + fmt(entry.close);
  }

  // ----- compute current status -----
  function getStatus(now) {
    var d = now.getDay();
    var nowH = now.getHours() + now.getMinutes() / 60;
    var today = SCHEDULE[d];

    if (today.open !== null && nowH >= today.open && nowH < today.close) {
      return { open: true, today: today, msg: "Open now", sub: "Today " + rangeText(today) + " · closes " + fmt(today.close) };
    }

    // Opening later today?
    if (today.open !== null && nowH < today.open) {
      return { open: false, today: today, msg: "Closed now", sub: "Opens today at " + fmt(today.open) };
    }

    // Find next open day (search up to 7 days ahead)
    for (var i = 1; i <= 7; i++) {
      var next = SCHEDULE[(d + i) % 7];
      if (next.open !== null) {
        var label = i === 1 ? "tomorrow" : next.day;
        return { open: false, today: today, msg: "Closed now", sub: "Opens " + label + " at " + fmt(next.open) };
      }
    }
    return { open: false, today: today, msg: "Closed", sub: "" };
  }

  // ----- render hours table -----
  function renderHours(now) {
    var body = document.getElementById("hoursBody");
    if (!body) return;
    var todayIdx = now.getDay();
    var status = getStatus(now);
    body.innerHTML = "";

    SCHEDULE.forEach(function (entry, idx) {
      var tr = document.createElement("tr");
      if (idx === todayIdx) tr.className = "today";

      var th = document.createElement("th");
      th.scope = "row";
      th.textContent = entry.day + (idx === todayIdx ? " (today)" : "");
      tr.appendChild(th);

      var td = document.createElement("td");
      td.textContent = rangeText(entry);
      tr.appendChild(td);

      var tdStatus = document.createElement("td");
      tdStatus.className = "num";
      var span = document.createElement("span");
      var isClosed = entry.open === null;
      // for today, reflect live open/closed; otherwise just "Open"/"Closed" schedule
      var openLabel = "Open";
      var closedLabel = "Closed";
      if (idx === todayIdx && !isClosed) {
        span.textContent = status.open ? "Open now" : "Closed now";
        span.className = "day-status" + (status.open ? "" : " closed");
      } else {
        span.textContent = isClosed ? closedLabel : openLabel;
        span.className = "day-status" + (isClosed ? " closed" : "");
      }
      tdStatus.appendChild(span);
      tr.appendChild(tdStatus);

      body.appendChild(tr);
    });
  }

  // ----- banner + badge -----
  function renderBanner(now) {
    var banner = document.getElementById("statusBanner");
    var text = document.getElementById("statusText");
    var sub = document.getElementById("statusSub");
    var badge = document.getElementById("hoursBadge");
    if (!banner) return;
    var status = getStatus(now);

    banner.classList.remove("open", "closed");
    banner.classList.add(status.open ? "open" : "closed");
    text.textContent = status.msg;
    sub.textContent = status.sub;
    if (badge) badge.textContent = SCHEDULE[now.getDay()].day;
  }

  // ----- checklist -----
  function setupChecklist() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-check]"));
    var badge = document.getElementById("checkBadge");
    var reset = document.getElementById("resetCheck");
    if (!boxes.length) return;

    function update() {
      var done = boxes.filter(function (b) { return b.checked; }).length;
      if (badge) badge.textContent = done + " / " + boxes.length;
      if (badge) badge.classList.toggle("ok", done === boxes.length);
      if (done === boxes.length) toast("All set — enjoy your visit!");
    }

    boxes.forEach(function (b) { b.addEventListener("change", update); });
    if (reset) {
      reset.addEventListener("click", function () {
        boxes.forEach(function (b) { b.checked = false; });
        update();
        toast("Checklist reset");
      });
    }
    update();
  }

  // ----- toast helper -----
  var toastTimer = null;
  function toast(msg) {
    var host = document.getElementById("toastHost");
    if (!host) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 280);
    }, 2600);
  }

  // ----- access button -----
  function setupAccess() {
    var btn = document.getElementById("accessBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        toast("Visit assistant requested — our team will confirm by email.");
      });
    }
  }

  // ----- smooth scroll for in-page nav -----
  function setupNav() {
    document.querySelectorAll('.site-nav a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = document.querySelector(a.getAttribute("href"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function init() {
    var now = new Date();
    renderHours(now);
    renderBanner(now);
    setupChecklist();
    setupAccess();
    setupNav();
    // Refresh status every minute so it stays accurate during a long session.
    setInterval(function () {
      var n = new Date();
      renderHours(n);
      renderBanner(n);
    }, 60000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
