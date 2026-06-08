(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 3200);
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.hidden = true;
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) {
        closeMenu();
      } else {
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close menu");
        menu.hidden = false;
      }
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Smooth-scroll to trial form ---------- */
  document.querySelectorAll("[data-trial]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var target = document.getElementById("trial");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      var name = document.getElementById("tName");
      if (name) setTimeout(function () { name.focus({ preventScroll: true }); }, 500);
    });
  });

  /* ---------- Discipline filter (tabs) ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filter]"));
  var dCards = Array.prototype.slice.call(document.querySelectorAll(".d-card[data-tags]"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", active ? "true" : "false");
      });
      var shown = 0;
      dCards.forEach(function (card) {
        var tags = card.getAttribute("data-tags") || "";
        var match = filter === "all" || tags.indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      toast(
        filter === "all"
          ? "Showing all disciplines"
          : shown + " " + filter + " discipline" + (shown === 1 ? "" : "s")
      );
    });
  });

  /* ---------- Discipline "view program" CTAs ---------- */
  document.querySelectorAll(".d-card__cta[data-discipline]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-discipline");
      toast(name + " program details sent to your inbox — check soon.");
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated stat counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var start = performance.now();
    var dur = 1100;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + "+";
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute("data-count") + "+";
    });
  }

  /* ---------- Trial form validation ---------- */
  var form = document.getElementById("trialForm");
  if (form) {
    var nameInput = document.getElementById("tName");
    var emailInput = document.getElementById("tEmail");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    [nameInput, emailInput].forEach(function (inp) {
      if (!inp) return;
      inp.addEventListener("input", function () {
        inp.classList.remove("is-invalid");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      if (!nameInput.value.trim()) {
        nameInput.classList.add("is-invalid");
        ok = false;
      }
      if (!emailRe.test(emailInput.value.trim())) {
        emailInput.classList.add("is-invalid");
        ok = false;
      }
      if (!ok) {
        toast("Please add your name and a valid email.");
        (nameInput.classList.contains("is-invalid") ? nameInput : emailInput).focus();
        return;
      }
      var discipline = document.getElementById("tDiscipline").value;
      toast("Trial booked! We'll email " + nameInput.value.trim() + " about " + discipline + ".");
      form.reset();
    });
  }
})();
