(function () {
  "use strict";

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Countdown to opening night ---------- */
  var openingNight = new Date("2026-09-14T19:30:00");
  var countEl = document.getElementById("count");
  function pad(n) { return String(n).padStart(2, "0"); }
  function renderCountdown() {
    if (!countEl) return;
    var diff = openingNight - new Date();
    if (diff <= 0) {
      countEl.innerHTML = '<div class="count__cell"><span class="count__num">Now</span><span class="count__lab">Playing</span></div>';
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var cells = [[d, "Days"], [pad(h), "Hrs"], [pad(m), "Min"], [pad(s), "Sec"]];
    countEl.innerHTML = cells.map(function (c) {
      return '<div class="count__cell"><span class="count__num">' + c[0] + '</span><span class="count__lab">' + c[1] + "</span></div>";
    }).join("");
  }
  renderCountdown();
  setInterval(renderCountdown, 1000);

  /* ---------- Performance calendar ---------- */
  // Performances run Sep–Dec 2026. Status keyed by ISO date.
  // status: ok | low | out  (absence = no performance)
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var TIMES = ["19:30 Evening", "14:30 Matinée"];
  // Build a schedule: Tue–Sun evenings, Sat/Sun also matinées, across the run.
  var schedule = {};
  function isoOf(y, m, d) { return y + "-" + pad(m + 1) + "-" + pad(d); }
  (function buildSchedule() {
    var start = new Date(2026, 8, 14); // 14 Sep
    var end = new Date(2026, 11, 22);  // 22 Dec
    var seed = 7;
    function rng() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      var dow = dt.getDay(); // 0 Sun .. 6 Sat
      if (dow === 1) continue; // dark on Mondays
      var iso = isoOf(dt.getFullYear(), dt.getMonth(), dt.getDate());
      var times = (dow === 6 || dow === 0) ? TIMES.slice() : [TIMES[0]];
      var r = rng();
      var status = r < 0.16 ? "out" : (r < 0.42 ? "low" : "ok");
      schedule[iso] = { status: status, times: times };
    }
  })();

  var viewYear = 2026, viewMonth = 9; // October 2026
  var minMonth = { y: 2026, m: 8 };   // September
  var maxMonth = { y: 2026, m: 11 };  // December
  var selectedIso = null;

  var calGrid = document.getElementById("calGrid");
  var calMonthEl = document.getElementById("calMonth");
  var calPrev = document.getElementById("calPrev");
  var calNext = document.getElementById("calNext");
  var calSelection = document.getElementById("calSelection");
  var bDate = document.getElementById("bDate");

  function monthIndex(y, m) { return y * 12 + m; }
  function clampNav() {
    var cur = monthIndex(viewYear, viewMonth);
    calPrev.disabled = cur <= monthIndex(minMonth.y, minMonth.m);
    calNext.disabled = cur >= monthIndex(maxMonth.y, maxMonth.m);
  }

  function statusDot(status) {
    var cls = status === "out" ? "dot--out" : status === "low" ? "dot--low" : "dot--ok";
    return '<i class="dot ' + cls + '"></i>';
  }

  function renderCalendar() {
    if (!calGrid) return;
    calMonthEl.textContent = MONTHS[viewMonth] + " " + viewYear;
    calGrid.innerHTML = "";
    var first = new Date(viewYear, viewMonth, 1);
    var lead = (first.getDay() + 6) % 7; // Monday-first offset
    var days = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (var i = 0; i < lead; i++) {
      var blank = document.createElement("div");
      blank.className = "cal__cell empty";
      calGrid.appendChild(blank);
    }
    for (var d = 1; d <= days; d++) {
      var iso = isoOf(viewYear, viewMonth, d);
      var perf = schedule[iso];
      var cell = document.createElement("button");
      cell.type = "button";
      cell.setAttribute("role", "gridcell");
      cell.dataset.iso = iso;
      if (!perf) {
        cell.className = "cal__cell none";
        cell.disabled = true;
        cell.innerHTML = "<span>" + d + "</span>";
        cell.setAttribute("aria-label", iso + ", no performance");
      } else {
        cell.className = "cal__cell has " + (perf.status === "out" ? "out" : "");
        if (iso === selectedIso) cell.classList.add("selected");
        cell.innerHTML = "<span>" + d + "</span>" + statusDot(perf.status);
        var label = perf.status === "out" ? "sold out" : perf.status === "low" ? "few seats" : "available";
        cell.setAttribute("aria-label", iso + ", " + label);
      }
      calGrid.appendChild(cell);
    }
    clampNav();
  }

  function formatHuman(iso) {
    var p = iso.split("-");
    var dt = new Date(+p[0], +p[1] - 1, +p[2]);
    var dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()];
    return dow + " " + (+p[2]) + " " + MONTHS[+p[1] - 1].slice(0, 3) + " " + p[0];
  }

  function selectDate(iso) {
    var perf = schedule[iso];
    if (!perf) return;
    if (perf.status === "out") { toast("That performance is sold out — try another date."); return; }
    selectedIso = iso;
    renderCalendar();
    var human = formatHuman(iso);
    var timesHtml = perf.times.map(function (t) {
      return '<button type="button" class="cal__time" data-time="' + t + '">' + t + "</button>";
    }).join("");
    calSelection.innerHTML =
      "<h4>" + human + "</h4>" +
      '<p style="margin-bottom:12px">Choose a performance time:</p>' +
      '<div class="cal__times">' + timesHtml + "</div>";
    calSelection.querySelectorAll(".cal__time").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var picked = human + " · " + btn.dataset.time;
        if (bDate) bDate.value = picked;
        updateTotal();
        toast("Performance selected: " + btn.dataset.time);
        var book = document.getElementById("book");
        if (book) book.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  if (calGrid) {
    calGrid.addEventListener("click", function (e) {
      var cell = e.target.closest(".cal__cell.has");
      if (cell && cell.dataset.iso) selectDate(cell.dataset.iso);
    });
    calPrev.addEventListener("click", function () {
      var idx = monthIndex(viewYear, viewMonth) - 1;
      viewYear = Math.floor(idx / 12); viewMonth = idx % 12; renderCalendar();
    });
    calNext.addEventListener("click", function () {
      var idx = monthIndex(viewYear, viewMonth) + 1;
      viewYear = Math.floor(idx / 12); viewMonth = idx % 12; renderCalendar();
    });
    renderCalendar();
  }

  /* ---------- Pricing select buttons ---------- */
  var bTier = document.getElementById("bTier");
  document.querySelectorAll(".tier button[data-tier]").forEach(function (btn) {
    if (btn.disabled) return;
    btn.addEventListener("click", function () {
      var val = btn.dataset.tier + "|" + btn.dataset.price;
      if (bTier) {
        bTier.value = val;
        updateTotal();
      }
      toast(btn.dataset.tier + " selected — £" + btn.dataset.price + " per seat");
      var book = document.getElementById("book");
      if (book) book.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Booking total ---------- */
  var bQty = document.getElementById("bQty");
  var bTotal = document.getElementById("bTotal");
  function updateTotal() {
    if (!bTotal) return;
    var price = 0;
    if (bTier && bTier.value) price = parseInt(bTier.value.split("|")[1], 10) || 0;
    var qty = bQty ? Math.max(1, parseInt(bQty.value, 10) || 0) : 0;
    bTotal.textContent = "£" + (price * qty).toLocaleString();
  }
  if (bTier) bTier.addEventListener("change", updateTotal);
  if (bQty) bQty.addEventListener("input", updateTotal);
  updateTotal();

  /* ---------- Booking form ---------- */
  var bookForm = document.getElementById("bookForm");
  if (bookForm) {
    bookForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!bDate || !bDate.value) { toast("Pick a performance from the calendar first."); return; }
      if (!bTier || !bTier.value) { toast("Choose a seating tier."); bTier && bTier.focus(); return; }
      var qty = parseInt(bQty.value, 10) || 0;
      if (qty < 1) { toast("Select at least one seat."); return; }
      var tierName = bTier.value.split("|")[0];
      toast("Booked " + qty + " × " + tierName + " — held for 15 minutes. Check your email!");
    });
  }
})();
