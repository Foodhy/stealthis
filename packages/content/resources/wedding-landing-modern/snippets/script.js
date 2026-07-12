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

  /* ---------- Countdown ---------- */
  var target = new Date("2026-09-20T16:30:00+02:00").getTime();
  var els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs")
  };
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      els.days.textContent = els.hours.textContent = els.mins.textContent = els.secs.textContent = "00";
      clearInterval(cdTimer);
      return;
    }
    var s = Math.floor(diff / 1000);
    els.days.textContent = pad(Math.floor(s / 86400));
    els.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    els.mins.textContent = pad(Math.floor((s % 3600) / 60));
    els.secs.textContent = pad(s % 60);
  }
  tick();
  var cdTimer = setInterval(tick, 1000);

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Active nav link on scroll ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a[href^='#']"));
  var sections = links
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);
  function syncNav() {
    var pos = window.scrollY + 120;
    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec;
    });
    links.forEach(function (l) {
      l.classList.toggle("is-active", current && l.getAttribute("href") === "#" + current.id);
    });
  }
  window.addEventListener("scroll", syncNav, { passive: true });
  syncNav();

  /* ---------- Attendance toggle ---------- */
  var attending = "yes";
  var toggleBtns = document.querySelectorAll(".toggle__btn");
  var mealField = document.getElementById("meal-field");
  var guestsField = document.getElementById("guests-field");
  toggleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      attending = btn.getAttribute("data-attend");
      toggleBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      var hide = attending === "no";
      mealField.classList.toggle("is-hidden", hide);
      guestsField.classList.toggle("is-hidden", hide);
    });
  });

  /* ---------- Form validation ---------- */
  var form = document.getElementById("rsvp-form");
  function setError(id, msg) {
    var input = document.getElementById(id);
    var err = document.getElementById(id + "-error");
    if (err) err.textContent = msg || "";
    if (input) input.classList.toggle("invalid", !!msg);
    return !msg;
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;

    var name = document.getElementById("name").value.trim();
    ok = setError("name", name ? "" : "Please tell us your name.") && ok;

    var email = document.getElementById("email").value.trim();
    if (!email) ok = setError("email", "We need an email to confirm.") && ok;
    else ok = setError("email", emailRe.test(email) ? "" : "That email looks incomplete.") && ok;

    if (attending === "yes") {
      var meal = document.getElementById("meal").value;
      ok = setError("meal", meal ? "" : "Choose a meal so the kitchen can plan.") && ok;
    } else {
      setError("meal", "");
      setError("guests", "");
    }

    if (!ok) {
      toast("Please check the highlighted fields.");
      var firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var first = name.split(" ")[0];
    if (attending === "no") {
      toast("We'll miss you, " + first + " — thank you for letting us know.");
    } else {
      toast("Thank you, " + first + "! Your seat is saved. 🥂");
    }
    form.reset();
    // Reset toggle back to default "yes"
    toggleBtns.forEach(function (b, i) {
      var active = i === 0;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
    attending = "yes";
    mealField.classList.remove("is-hidden");
    guestsField.classList.remove("is-hidden");
  });

  // Clear an individual error as the guest corrects it
  ["name", "email", "meal"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function () { setError(id, ""); });
  });
})();
