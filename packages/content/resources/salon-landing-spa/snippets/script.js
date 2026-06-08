/* ============================================================
   Verdé Day Spa — Landing interactions (vanilla JS)
   ============================================================ */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Toast ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
      setTimeout(function () { toastEl.hidden = true; }, 320);
    }, 3200);
  }

  /* ---------- Year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Sticky nav state ---------- */
  var nav = $(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = $("#navToggle");
  var mobileNav = $("#mobileNav");
  function setMenu(open) {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    $$("a", mobileNav).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ---------- Active link on scroll ---------- */
  var sections = ["services", "flow", "gallery", "gift", "hours"];
  var linkFor = {};
  $$(".nav__links a").forEach(function (a) {
    var id = (a.getAttribute("href") || "").replace("#", "");
    if (id) linkFor[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = linkFor[e.target.id];
        if (!link) return;
        if (e.isIntersecting) {
          $$(".nav__links a").forEach(function (l) { l.classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var group = e.target.parentElement ? $$(".reveal", e.target.parentElement) : [e.target];
          // stagger siblings that share a parent grid/list
          var idx = group.indexOf(e.target);
          e.target.style.transitionDelay = (idx > 0 ? Math.min(idx, 5) * 70 : 0) + "ms";
          e.target.classList.add("is-in");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated stat counters ---------- */
  function animateStat(el) {
    var target = parseFloat(el.getAttribute("data-count") || "0");
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var start = performance.now();
    var dur = 1400;
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }
  var stats = $$(".stat");
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateStat(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    stats.forEach(function (s) { so.observe(s); });
  } else {
    stats.forEach(animateStat);
  }

  /* ---------- Gift card form ---------- */
  var giftForm = $("#giftForm");
  var amountRow = $("#amountRow");
  var customAmount = $("#customAmount");
  var totalEl = $("#giftTotal");
  var noteEl = $("#giftNote");
  var noteCount = $("#noteCount");
  var selectedAmount = 150;

  function fmt(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function renderTotal() {
    if (totalEl) totalEl.textContent = fmt(selectedAmount);
  }
  function clearActiveChips() {
    $$(".chip[data-amount]", amountRow).forEach(function (c) {
      c.classList.remove("is-active");
      c.setAttribute("aria-pressed", "false");
    });
  }
  if (amountRow) {
    $$(".chip[data-amount]", amountRow).forEach(function (chip) {
      chip.addEventListener("click", function () {
        clearActiveChips();
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        if (customAmount) customAmount.value = "";
        selectedAmount = parseFloat(chip.getAttribute("data-amount"));
        renderTotal();
      });
    });
  }
  if (customAmount) {
    customAmount.addEventListener("input", function () {
      var v = parseFloat(customAmount.value);
      if (!isNaN(v) && v > 0) {
        clearActiveChips();
        selectedAmount = v;
        renderTotal();
      }
    });
  }
  if (noteEl && noteCount) {
    noteEl.addEventListener("input", function () {
      noteCount.textContent = String(noteEl.value.length);
    });
  }
  renderTotal();

  function markInvalid(el, invalid) {
    if (el) el.classList.toggle("is-invalid", invalid);
  }
  if (giftForm) {
    giftForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = $("#giftTo");
      var email = $("#giftEmail");
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      var ok = true;

      if (!to.value.trim()) { markInvalid(to, true); ok = false; } else markInvalid(to, false);
      if (!emailRe.test(email.value.trim())) { markInvalid(email, true); ok = false; } else markInvalid(email, false);
      if (selectedAmount < 25) {
        markInvalid(customAmount, true); ok = false;
        toast("Gift cards start at $25.");
        return;
      } else markInvalid(customAmount, false);

      if (!ok) {
        toast("Please check the highlighted fields.");
        var firstBad = $(".is-invalid");
        if (firstBad) firstBad.focus();
        return;
      }

      toast(fmt(selectedAmount) + " gift card on its way to " + to.value.trim() + " ✦");
      giftForm.reset();
      clearActiveChips();
      selectedAmount = 150;
      var def = $('.chip[data-amount="150"]', amountRow);
      if (def) { def.classList.add("is-active"); def.setAttribute("aria-pressed", "true"); }
      if (noteCount) noteCount.textContent = "0";
      renderTotal();
    });
  }

  /* ---------- Hours + live open/closed ---------- */
  // hours[dayIndex] = [openMinutes, closeMinutes] or null if closed. JS: 0 = Sunday.
  var schedule = [
    { day: "Sunday", open: 9 * 60 + 30, close: 17 * 60 },
    { day: "Monday", open: null, close: null },
    { day: "Tuesday", open: 9 * 60, close: 19 * 60 },
    { day: "Wednesday", open: 9 * 60, close: 19 * 60 },
    { day: "Thursday", open: 9 * 60, close: 20 * 60 },
    { day: "Friday", open: 9 * 60, close: 20 * 60 },
    { day: "Saturday", open: 8 * 60 + 30, close: 18 * 60 }
  ];
  function toClock(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ":" + String(m).padStart(2, "0") : "") + " " + ampm;
  }
  var hoursList = $("#hoursList");
  var now = new Date();
  var todayIdx = now.getDay();
  var nowMins = now.getHours() * 60 + now.getMinutes();

  if (hoursList) {
    schedule.forEach(function (s, i) {
      var li = document.createElement("li");
      if (i === todayIdx) li.classList.add("is-today");
      var label = s.open === null ? "Closed" : toClock(s.open) + " – " + toClock(s.close);
      var badge = i === todayIdx ? '<span class="hours__badge">Today</span>' : "";
      li.innerHTML = '<span class="day">' + s.day + badge + '</span><span class="time">' + label + "</span>";
      hoursList.appendChild(li);
    });
  }

  var statusWrap = $("#status");
  var statusText = $("#statusText");
  var today = schedule[todayIdx];
  if (statusWrap && statusText) {
    var isOpen = today.open !== null && nowMins >= today.open && nowMins < today.close;
    if (isOpen) {
      statusWrap.classList.add("is-open");
      var leftMin = today.close - 30;
      statusText.textContent = nowMins >= leftMin
        ? "Open now · closing soon at " + toClock(today.close)
        : "Open now · until " + toClock(today.close) + " today";
    } else {
      statusWrap.classList.add("is-closed");
      // find next opening day
      var nextOpen = null;
      for (var step = 0; step < 7; step++) {
        var idx = (todayIdx + step) % 7;
        var s = schedule[idx];
        if (s.open === null) continue;
        if (step === 0 && nowMins < s.open) { nextOpen = "today at " + toClock(s.open); break; }
        if (step > 0) { nextOpen = (step === 1 ? "tomorrow" : s.day) + " at " + toClock(s.open); break; }
      }
      statusText.textContent = nextOpen ? "Closed · opens " + nextOpen : "Closed today";
    }
  }
})();
