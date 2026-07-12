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
    }, 3400);
  }

  /* ---------- Countdown ---------- */
  var target = new Date("2026-09-19T15:30:00").getTime();
  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMins = document.getElementById("cd-mins");
  var elSecs = document.getElementById("cd-secs");

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      elDays.textContent = elHours.textContent = elMins.textContent = elSecs.textContent = "00";
      var cd = document.getElementById("countdown");
      if (cd && !cd.dataset.done) {
        cd.dataset.done = "1";
        cd.setAttribute("aria-label", "The celebration has begun");
      }
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    elDays.textContent = pad(d);
    elHours.textContent = pad(h);
    elMins.textContent = pad(m);
    elSecs.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Generic single-select chip group ---------- */
  function bindRadioGroup(container, onChange) {
    if (!container) return;
    var items = container.querySelectorAll("[role='radio']");
    items.forEach(function (btn) {
      btn.addEventListener("click", function () {
        items.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-checked", "true");
        if (onChange) onChange(btn);
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          var list = Array.prototype.slice.call(items);
          var i = list.indexOf(btn);
          var next = (e.key === "ArrowRight" || e.key === "ArrowDown")
            ? list[(i + 1) % list.length]
            : list[(i - 1 + list.length) % list.length];
          next.focus();
          next.click();
        }
      });
    });
  }

  /* ---------- Form state ---------- */
  var state = { attend: "yes", guests: "1", meal: "Harvest chicken" };

  var attendGroup = document.querySelector(".segmented");
  var attendOnly = document.querySelector(".attend-only");
  bindRadioGroup(attendGroup, function (btn) {
    state.attend = btn.getAttribute("data-attend");
    var declining = state.attend === "no";
    attendOnly.classList.toggle("hidden", declining);
    toast(declining ? "We'll miss you dearly." : "Yay! Fill in your details below.");
  });

  bindRadioGroup(document.getElementById("guestChips"), function (btn) {
    state.guests = btn.getAttribute("data-guests");
  });
  bindRadioGroup(document.getElementById("mealChips"), function (btn) {
    state.meal = btn.getAttribute("data-meal");
  });

  /* ---------- Validation + submit ---------- */
  var form = document.getElementById("rsvpForm");
  var successEl = document.getElementById("success");
  var successMsg = document.getElementById("successMsg");
  var successTitle = document.getElementById("successTitle");

  function setError(name, msg) {
    var input = form.elements[name];
    var slot = form.querySelector("[data-err='" + name + "']");
    if (input) input.classList.toggle("invalid", !!msg);
    if (slot) slot.textContent = msg || "";
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.fullName.value.trim();
    var email = form.elements.email.value.trim();
    var ok = true;

    if (name.length < 2) { setError("fullName", "Please tell us your name."); ok = false; }
    else setError("fullName", "");

    if (!validEmail(email)) { setError("email", "Enter a valid email so we can confirm."); ok = false; }
    else setError("email", "");

    if (!ok) {
      toast("Please check the highlighted fields.");
      var firstBad = form.querySelector(".invalid");
      if (firstBad) firstBad.focus();
      return;
    }

    var firstName = name.split(" ")[0];
    if (state.attend === "yes") {
      var guestWord = state.guests === "1" ? "1 seat" : state.guests + " seats";
      successTitle.textContent = "See you at the barn, " + firstName + "!";
      successMsg.textContent = "We've reserved " + guestWord + " for you, with " +
        state.meal.toLowerCase() + " on the menu. A confirmation is on its way to " + email + ".";
      toast("RSVP received — " + guestWord + " reserved.");
    } else {
      successTitle.textContent = "Thank you, " + firstName;
      successMsg.textContent = "We're sorry you can't make it, but we're grateful you let us know. We'll raise a glass to you.";
      toast("Thanks for letting us know.");
    }

    form.hidden = true;
    successEl.hidden = false;
    successEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* live-clear errors while typing */
  ["fullName", "email"].forEach(function (n) {
    form.elements[n].addEventListener("input", function () { setError(n, ""); });
  });

  /* ---------- Edit response ---------- */
  document.getElementById("editRsvp").addEventListener("click", function () {
    successEl.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    form.elements.fullName.focus();
  });
})();
