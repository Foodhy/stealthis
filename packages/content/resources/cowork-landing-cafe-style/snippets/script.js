(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navLinks.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- Count-up stats ---------- */
  var counted = false;
  function runCounts() {
    if (counted) return;
    counted = true;
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var start = performance.now();
      var dur = 1300;
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  var hero = document.getElementById("top");
  if (hero && "IntersectionObserver" in window) {
    var heroIo = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          runCounts();
          heroIo.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    heroIo.observe(hero);
  } else {
    runCounts();
  }

  /* ---------- Live seat availability ---------- */
  var seatsFree = document.getElementById("seatsFree");
  var seatMeter = document.getElementById("seatMeter");
  var TOTAL = 42;
  function refreshSeats(notify) {
    var free = 8 + Math.floor(Math.random() * 22); // 8..29
    var occupied = TOTAL - free;
    if (seatsFree) seatsFree.textContent = free + " / " + TOTAL;
    if (seatMeter) seatMeter.style.width = Math.round((occupied / TOTAL) * 100) + "%";
    if (notify) toast("Updated · " + free + " of " + TOTAL + " seats free right now");
  }
  // gentle drift every 12s
  setInterval(function () {
    refreshSeats(false);
  }, 12000);

  /* ---------- Plans billing toggle ---------- */
  var toggleBtns = document.querySelectorAll(".toggle__btn");
  function applyPeriod(period) {
    toggleBtns.forEach(function (b) {
      var active = b.getAttribute("data-period") === period;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll(".plan__price .amt").forEach(function (amt) {
      var val = amt.getAttribute("data-" + period);
      if (val) amt.textContent = "$" + val;
    });
    document.querySelectorAll(".plan__price .per").forEach(function (per) {
      var val = per.getAttribute("data-" + period);
      if (val) per.textContent = val;
    });
  }
  toggleBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      applyPeriod(b.getAttribute("data-period"));
    });
  });

  /* ---------- Plan CTA ---------- */
  document.querySelectorAll(".plan__cta").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var plan = btn.getAttribute("data-plan") || "this plan";
      toast("Nice choice — " + plan + " added. We'll hold your seat.");
    });
  });

  /* ---------- Reserve a seat (nav) ---------- */
  var reserve = document.querySelector('.btn--ghost[href="#plans"]');
  if (reserve) {
    reserve.addEventListener("click", function () {
      refreshSeats(true);
    });
  }

  /* ---------- Email pass form ---------- */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var passForm = document.getElementById("passForm");
  if (passForm) {
    var input = passForm.querySelector("input[type=email]");
    var note = document.getElementById("formNote");
    passForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim();
      if (!emailRe.test(val)) {
        input.classList.add("is-error");
        input.focus();
        if (note) {
          note.textContent = "Hmm, that email doesn't look right — try again.";
          note.classList.remove("is-ok");
        }
        return;
      }
      input.classList.remove("is-error");
      if (note) {
        note.textContent = "Pass link sent — check your inbox ☕";
        note.classList.add("is-ok");
      }
      toast("Day-pass link on its way to " + val);
      input.value = "";
    });
    input.addEventListener("input", function () {
      input.classList.remove("is-error");
    });
  }
})();
