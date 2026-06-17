(function () {
  "use strict";

  var STEPS = [
    { key: "placed",    label: "Order placed",       state: "placed",    pill: "Order placed" },
    { key: "confirmed", label: "Confirmed & packed", state: "confirmed", pill: "Preparing" },
    { key: "out",       label: "Out for delivery",   state: "out",       pill: "In transit" },
    { key: "delivered", label: "Delivered",          state: "delivered", pill: "Delivered" }
  ];

  // Base timeline anchored to "now" so timestamps feel live.
  var BASE = new Date();
  BASE.setHours(BASE.getHours() - 3, 14, 0, 0);
  var OFFSETS_MIN = [0, 41, 128, 174]; // minutes after BASE for each step

  var current = 2; // start: out for delivery

  var stepperH = document.getElementById("stepperH");
  var stepperV = document.getElementById("stepperV");
  var btnNext = document.getElementById("btnNext");
  var btnBack = document.getElementById("btnBack");
  var btnReset = document.getElementById("btnReset");
  var statusEl = document.querySelector(".eta-status");
  var pill = document.getElementById("state-pill");
  var etaMin = document.getElementById("eta-min");
  var etaClock = document.getElementById("eta-clock");
  var courier = document.getElementById("courier");
  var toastEl = document.getElementById("toast");

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function fmtTime(date) {
    var h = date.getHours();
    var m = date.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
  }

  function timeForStep(i) {
    var d = new Date(BASE.getTime());
    d.setMinutes(d.getMinutes() + OFFSETS_MIN[i]);
    return d;
  }

  // Paint timestamps once (only past/current steps show a real time).
  function paintTimes(stepper) {
    var lis = stepper.querySelectorAll(".step");
    lis.forEach(function (li, i) {
      var t = li.querySelector("[data-time]");
      if (!t) return;
      t.textContent = i <= current ? fmtTime(timeForStep(i)) : "Pending";
    });
  }

  function applyClasses(stepper) {
    var lis = stepper.querySelectorAll(".step");
    lis.forEach(function (li, i) {
      li.classList.toggle("is-done", i < current || (i === current && current === STEPS.length - 1));
      li.classList.toggle("is-active", i === current && current < STEPS.length - 1);
    });
  }

  function render(announce) {
    [stepperH, stepperV].forEach(function (s) {
      applyClasses(s);
      paintTimes(s);
    });

    var step = STEPS[current];
    statusEl.textContent = step.label;
    pill.textContent = step.pill;
    pill.setAttribute("data-state", step.state);

    // ETA logic
    if (current >= STEPS.length - 1) {
      var d = timeForStep(current);
      etaMin.parentElement.innerHTML = "Delivered at <strong>" + fmtTime(d) + "</strong>";
      courier.classList.add("is-hidden");
    } else {
      var remaining = OFFSETS_MIN[STEPS.length - 1] - OFFSETS_MIN[current];
      var arrive = new Date(Date.now() + remaining * 60000);
      etaMin.textContent = remaining;
      etaClock.textContent = "by " + fmtTime(arrive);
      courier.classList.toggle("is-hidden", current < 2);
    }

    btnNext.disabled = current >= STEPS.length - 1;
    btnBack.disabled = current <= 0;
    btnNext.textContent = current >= STEPS.length - 2 ? "Mark delivered" : "Advance state";

    if (announce) toast(step.label);
  }

  btnNext.addEventListener("click", function () {
    if (current < STEPS.length - 1) {
      current++;
      render(true);
    }
  });

  btnBack.addEventListener("click", function () {
    if (current > 0) {
      current--;
      render(true);
    }
  });

  btnReset.addEventListener("click", function () {
    current = 0;
    // re-anchor base so reset feels fresh
    BASE = new Date();
    BASE.setMinutes(BASE.getMinutes() - 1, 0, 0);
    etaMin.parentElement.innerHTML =
      'Arriving in <strong id="eta-min">' + OFFSETS_MIN[STEPS.length - 1] +
      '</strong> min · <span id="eta-clock">—</span>';
    etaMin = document.getElementById("eta-min");
    etaClock = document.getElementById("eta-clock");
    render(false);
    toast("Tracker reset to Order placed");
  });

  render(false);
})();
