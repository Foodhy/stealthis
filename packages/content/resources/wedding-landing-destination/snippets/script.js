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
  var target = new Date("2026-09-12T16:30:00+02:00").getTime();
  var cd = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    mins: document.querySelector('[data-cd="mins"]'),
    secs: document.querySelector('[data-cd="secs"]')
  };
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      cd.days.textContent = cd.hours.textContent = cd.mins.textContent = cd.secs.textContent = "00";
      return;
    }
    var s = Math.floor(diff / 1000);
    cd.days.textContent = Math.floor(s / 86400);
    cd.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    cd.mins.textContent = pad(Math.floor((s % 3600) / 60));
    cd.secs.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Venue map ---------- */
  var pinData = {
    ceremony: {
      badge: "Stop 1",
      title: "Chiesa di Santa Croce",
      time: "Ceremony · 4:30 PM",
      text: "A candle-lit clifftop chapel with sweeping views over the Tyrrhenian Sea. Guests are seated by 4:15 PM.",
      walk: "🚶 4 min walk from the main piazza"
    },
    reception: {
      badge: "Stop 2",
      title: "Villa Tre Ville",
      time: "Reception · 7:00 PM",
      text: "Dinner and dancing on a terraced garden overlooking the coast, once the retreat of composer Franco Zeffirelli.",
      walk: "🚶 8 min walk · shuttle available at 6:45 PM"
    },
    welcome: {
      badge: "Stop 3",
      title: "Ristorante Il Fornillo",
      time: "Welcome dinner · Fri 7:30 PM",
      text: "A relaxed seafront trattoria for our Friday evening welcome feast. Family-style seafood and local wines.",
      walk: "🚶 5 min walk from Hotel Marincanto"
    },
    view: {
      badge: "Stop 4",
      title: "Belvedere di Positano",
      time: "Golden hour · anytime",
      text: "The best panorama in town for photos before the ceremony. A short climb, but worth every step.",
      walk: "🚶 10 min uphill walk from the beach"
    }
  };
  var pins = Array.prototype.slice.call(document.querySelectorAll(".pin"));
  var md = {
    badge: document.getElementById("mdBadge"),
    title: document.getElementById("mdTitle"),
    time: document.getElementById("mdTime"),
    text: document.getElementById("mdText"),
    walk: document.getElementById("mdWalk")
  };
  function selectPin(pin) {
    var key = pin.getAttribute("data-pin");
    var d = pinData[key];
    if (!d) return;
    pins.forEach(function (p) { p.classList.remove("is-active"); });
    pin.classList.add("is-active");
    md.badge.textContent = d.badge;
    md.title.textContent = d.title;
    md.time.textContent = d.time;
    md.text.textContent = d.text;
    md.walk.textContent = d.walk;
  }
  pins.forEach(function (pin) {
    pin.addEventListener("click", function () { selectPin(pin); });
  });
  if (pins[0]) pins[0].classList.add("is-active");

  /* ---------- Itinerary tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".itin-tab"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var day = tab.getAttribute("data-day");
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      ["fri", "sat"].forEach(function (d) {
        var panel = document.getElementById("tl-" + d);
        if (!panel) return;
        var show = d === day;
        panel.classList.toggle("is-hidden", !show);
        if (show) { panel.removeAttribute("hidden"); } else { panel.setAttribute("hidden", ""); }
      });
    });
  });

  /* ---------- Copy booking codes ---------- */
  Array.prototype.slice.call(document.querySelectorAll(".copy-code")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var code = btn.getAttribute("data-code");
      function done() {
        btn.classList.add("copied");
        toast("Copied booking code " + code);
        setTimeout(function () { btn.classList.remove("copied"); }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, done);
      } else {
        done();
      }
    });
  });

  /* ---------- RSVP form ---------- */
  var form = document.getElementById("rsvpForm");
  var attendRadios = Array.prototype.slice.call(form.querySelectorAll('input[name="attend"]'));

  function syncAttend() {
    var declined = form.querySelector('input[name="attend"]:checked').value === "no";
    form.classList.toggle("declined", declined);
  }
  attendRadios.forEach(function (r) { r.addEventListener("change", syncAttend); });
  syncAttend();

  function setError(name, msg) {
    var input = form.querySelector('[name="' + name + '"]');
    var errEl = form.querySelector('[data-err="' + name + '"]');
    if (input) input.classList.toggle("invalid", !!msg);
    if (errEl) errEl.textContent = msg || "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.fullName.value.trim();
    var email = form.email.value.trim();
    var attending = form.querySelector('input[name="attend"]:checked').value === "yes";
    var ok = true;

    if (!name) { setError("fullName", "Please tell us your name."); ok = false; }
    else { setError("fullName", ""); }

    if (!email) { setError("email", "An email helps us reach you."); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "That email looks off."); ok = false; }
    else { setError("email", ""); }

    if (!ok) {
      toast("Please check the highlighted fields.");
      var firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var first = name.split(" ")[0];
    if (!attending) {
      toast("Thank you, " + first + ". We will miss you dearly.");
    } else {
      var guests = form.guests.value;
      var shuttle = form.shuttle.value;
      var shuttleMsg = shuttle === "none" ? "no shuttle" : shuttle === "both" ? "round-trip shuttle" : "arrival shuttle";
      toast("See you in Positano, " + first + "! Party of " + guests + " · " + shuttleMsg + ".");
    }

    form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
  });
})();
