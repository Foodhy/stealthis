(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 3200);
  }

  /* ---------- sticky nav shadow ---------- */
  var nav = document.querySelector("[data-nav]");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav toggle ---------- */
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  function closeMenu() {
    if (!toggle || !navLinks) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    navLinks.classList.remove("is-open");
  }
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      navLinks.classList.toggle("is-open", !open);
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- active link on scroll (scroll spy) ---------- */
  var sections = ["services", "why", "stylists", "gallery", "visit"]
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);
  var linkFor = {};
  document.querySelectorAll(".nav__link").forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    linkFor[id] = a;
  });
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            Object.keys(linkFor).forEach(function (k) {
              linkFor[k].classList.remove("is-active");
            });
            var id = en.target.id;
            if (linkFor[id]) linkFor[id].classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ---------- reveal-on-scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            obs.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 6) * 60 + "ms";
      ro.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- animated hero stat counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var start = performance.now();
    var dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent =
        decimals > 0
          ? val.toFixed(decimals)
          : Math.round(val).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
      else
        el.textContent =
          decimals > 0
            ? target.toFixed(decimals)
            : target.toLocaleString("en-US");
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            animateCount(en.target);
            obs.unobserve(en.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (c) {
      co.observe(c);
    });
  } else {
    counters.forEach(function (c) {
      c.textContent = c.getAttribute("data-count");
    });
  }

  /* ---------- stylist quick-book ---------- */
  var stylistSelect = document.getElementById("bk-stylist");
  document.querySelectorAll(".stylist").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-stylist");
      if (stylistSelect) {
        var match = Array.prototype.find.call(
          stylistSelect.options,
          function (o) {
            return o.value === name;
          }
        );
        if (match) stylistSelect.value = name;
      }
      toast("Booking with " + name + " — finish the form below.");
      var visit = document.getElementById("visit");
      if (visit) visit.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- "Book now" CTAs ---------- */
  document.querySelectorAll("[data-book]").forEach(function (el) {
    el.addEventListener("click", function () {
      closeMenu();
      setTimeout(function () {
        var nameField = document.getElementById("bk-name");
        if (nameField) nameField.focus({ preventScroll: true });
      }, 600);
    });
  });

  /* ---------- open / closed state ---------- */
  // Tue–Fri 9–19, Sat 9–17, Sun 10–15, Mon closed. getDay(): 0=Sun..6=Sat
  var schedule = {
    0: [10, 15],
    1: null,
    2: [9, 19],
    3: [9, 19],
    4: [9, 19],
    5: [9, 19],
    6: [9, 17],
  };
  var openState = document.getElementById("openState");
  function updateOpen() {
    if (!openState) return;
    var now = new Date();
    var hours = schedule[now.getDay()];
    var hourFloat = now.getHours() + now.getMinutes() / 60;
    if (hours && hourFloat >= hours[0] && hourFloat < hours[1]) {
      openState.textContent = "Open now · closes at " + hours[1] + ":00";
      openState.className = "visit__note is-open";
    } else {
      openState.textContent = "Closed now · book online anytime";
      openState.className = "visit__note is-closed";
    }
  }
  updateOpen();
  setInterval(updateOpen, 60000);

  /* ---------- date min = today ---------- */
  var dateField = document.getElementById("bk-date");
  if (dateField) {
    var t = new Date();
    var iso = new Date(t.getTime() - t.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    dateField.min = iso;
  }

  /* ---------- booking form ---------- */
  var form = document.getElementById("bookForm");
  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = [
        { el: form.elements["name"], ok: function (v) { return v.trim().length >= 2; } },
        { el: form.elements["email"], ok: function (v) { return emailRe.test(v.trim()); } },
        { el: form.elements["service"], ok: function (v) { return !!v; } },
        { el: form.elements["date"], ok: function (v) { return !!v; } },
      ];
      var firstBad = null;
      fields.forEach(function (f) {
        var valid = f.ok(f.el.value);
        f.el.setAttribute("aria-invalid", valid ? "false" : "true");
        if (!valid && !firstBad) firstBad = f.el;
      });
      if (firstBad) {
        firstBad.focus();
        toast("Please complete the highlighted fields.");
        return;
      }
      var name = form.elements["name"].value.trim().split(" ")[0];
      var service = form.elements["service"].value;
      var stylist = form.elements["stylist"].value || "the next available stylist";
      var date = new Date(form.elements["date"].value + "T00:00:00");
      var pretty = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      toast(
        "Thank you, " + name + " — " + service + " with " + stylist +
          " requested for " + pretty + "."
      );
      form.reset();
      fields.forEach(function (f) {
        f.el.setAttribute("aria-invalid", "false");
      });
      if (dateField) dateField.min = iso;
    });
  }
})();
