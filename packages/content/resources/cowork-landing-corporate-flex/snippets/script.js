/* Meridian Flex — Corporate-flex coworking landing
   Vanilla JS only. Interactions: mobile nav, sticky nav shadow, scroll reveal,
   live desk-occupancy grid, location region filter, cost estimator, pricing
   billing toggle, quote/newsletter forms, and a toast helper. */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* Any element with data-toast fires a toast on click */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) toast(t.getAttribute("data-toast"));
  });

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      }
    });
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Live desk occupancy grid ---------- */
  var grid = document.getElementById("gridMini");
  var occFoot = document.getElementById("occFoot");
  var TOTAL = 32;
  function paintGrid() {
    if (!grid) return;
    grid.innerHTML = "";
    var free = 0;
    for (var i = 0; i < TOTAL; i++) {
      var cell = document.createElement("i");
      var r = Math.random();
      if (r < 0.4) { cell.className = "free"; free++; }
      else if (r < 0.55) { cell.className = "res"; }
      cell.setAttribute("aria-hidden", "true");
      grid.appendChild(cell);
    }
    if (occFoot) occFoot.textContent = free + " of " + TOTAL + " desks free now";
  }
  paintGrid();
  /* Gently re-roll occupancy so it feels live */
  if (grid) setInterval(paintGrid, 4200);

  /* ---------- Location region filter ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".loc-filter .chip"));
  var locCards = Array.prototype.slice.call(document.querySelectorAll("#locGrid .loccard"));
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var region = btn.getAttribute("data-region");
      filterBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      var shown = 0;
      locCards.forEach(function (card) {
        var match = region === "all" || card.getAttribute("data-region") === region;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      if (region !== "all") {
        toast(shown + " location" + (shown === 1 ? "" : "s") + " in " + btn.textContent.trim() + ".");
      }
    });
  });

  /* ---------- Cost estimator ---------- */
  var seatRange = document.getElementById("seatRange");
  var seatOut = document.getElementById("seatOut");
  var calcTotal = document.getElementById("calcTotal");
  var calcFine = document.getElementById("calcFine");
  var calcBillBtns = Array.prototype.slice.call(document.querySelectorAll(".calc__toggle .seg"));
  var calcBill = "monthly";
  var RATE = { monthly: 540, annual: 445 };

  function fmt(n) { return "$" + n.toLocaleString("en-US"); }

  function updateCalc() {
    if (!seatRange) return;
    var seats = parseInt(seatRange.value, 10);
    var rate = RATE[calcBill];
    var total = seats * rate;
    if (seatOut) seatOut.textContent = seats;
    if (calcTotal) calcTotal.innerHTML = fmt(total) + "<small>/mo</small>";
    if (calcFine) {
      calcFine.textContent =
        seats + " seats × " + fmt(rate) + " · Dedicated Suite " + calcBill + " rate";
    }
  }
  if (seatRange) {
    seatRange.addEventListener("input", updateCalc);
    calcBillBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        calcBill = btn.getAttribute("data-bill");
        calcBillBtns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        updateCalc();
      });
    });
    updateCalc();
  }

  /* ---------- Pricing billing toggle ---------- */
  var priceBtns = Array.prototype.slice.call(document.querySelectorAll(".bill-toggle .seg"));
  var amtEls = Array.prototype.slice.call(document.querySelectorAll(".plan .amt[data-monthly]"));
  priceBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-pricebill");
      priceBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      amtEls.forEach(function (el) {
        var v = el.getAttribute("data-" + mode);
        if (v) el.textContent = "$" + v;
      });
    });
  });

  /* ---------- Forms ---------- */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  var quoteForm = document.getElementById("quoteForm");
  var quoteNote = document.getElementById("quoteNote");
  if (quoteForm) {
    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("quoteEmail");
      var size = document.getElementById("teamSize");
      if (!email || !isEmail(email.value.trim())) {
        if (quoteNote) {
          quoteNote.textContent = "Please enter a valid work email.";
          quoteNote.className = "hero__note is-err";
        }
        if (email) email.focus();
        return;
      }
      if (quoteNote) {
        var seats = size && size.value ? size.value + "-seat" : "team";
        quoteNote.textContent = "Thanks! Your " + seats + " quote is on the way to " + email.value.trim() + ".";
        quoteNote.className = "hero__note is-ok";
      }
      toast("Quote requested — an advisor will reply within one business hour.");
      quoteForm.reset();
    });
  }

  var newsForm = document.getElementById("newsForm");
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("newsEmail");
      if (!email || !isEmail(email.value.trim())) {
        toast("Please enter a valid work email.");
        if (email) email.focus();
        return;
      }
      toast("Subscribed — workspace updates coming your way.");
      newsForm.reset();
    });
  }
})();
