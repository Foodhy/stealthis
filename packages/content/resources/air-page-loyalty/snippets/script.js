(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var host = document.getElementById("toastHost");
  function toast(msg) {
    if (!host) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  var fmt = function (n) { return Math.round(n).toLocaleString("en-US"); };

  /* ---------- tier compare highlight ---------- */
  var table = document.getElementById("tierTable");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tier-tab"));

  function highlight(tier) {
    if (!table) return;
    table.querySelectorAll("[data-col]").forEach(function (cell) {
      cell.classList.toggle("is-hi", cell.getAttribute("data-col") === tier);
    });
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-tier") === tier;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      highlight(tab.getAttribute("data-tier"));
    });
    tab.addEventListener("mouseenter", function () {
      highlight(tab.getAttribute("data-tier"));
    });
  });
  highlight("blue");

  /* ---------- miles calculator ---------- */
  var flights = document.getElementById("flights");
  var distance = document.getElementById("distance");
  var tierSel = document.getElementById("tierSel");
  var flightsOut = document.getElementById("flightsOut");
  var distanceOut = document.getElementById("distanceOut");
  var calcTotal = document.getElementById("calcTotal");
  var calcNote = document.getElementById("calcNote");
  var calcBar = document.getElementById("calcBar");
  var calcNext = document.getElementById("calcNext");

  var TIERS = [
    { name: "Silver", req: 25000 },
    { name: "Gold", req: 60000 },
    { name: "Platinum", req: 120000 }
  ];

  function setRangeFill(input) {
    var min = +input.min, max = +input.max, val = +input.value;
    var pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty("--pct", pct + "%");
  }

  function recalc() {
    if (!flights) return;
    setRangeFill(flights);
    setRangeFill(distance);

    var trips = +flights.value;
    var dist = +distance.value;
    var rate = parseFloat(tierSel.value);

    var total = trips * dist * rate;
    var awardSeats = Math.floor(total / 7500);

    flightsOut.textContent = trips + (trips === 1 ? " trip" : " trips");
    distanceOut.textContent = fmt(dist) + " mi";
    calcTotal.textContent = fmt(total);
    calcNote.innerHTML = "≈ <span class=\"num\">" + awardSeats + "</span> short-haul award seat" + (awardSeats === 1 ? "" : "s");

    var next = TIERS.find(function (t) { return total < t.req; });
    if (next) {
      var gap = next.req - total;
      calcNext.innerHTML = fmt(gap) + " miles to <strong>" + next.name + "</strong>";
      calcBar.style.width = Math.max(4, Math.min(100, (total / next.req) * 100)) + "%";
    } else {
      calcNext.innerHTML = "Platinum status earned — top tier reached.";
      calcBar.style.width = "100%";
    }
  }

  [flights, distance, tierSel].forEach(function (el) {
    if (el) el.addEventListener("input", recalc);
  });
  recalc();

  /* ---------- join form + reveal ---------- */
  var form = document.getElementById("joinForm");
  var card = document.getElementById("memberCard");
  var emailInput = document.getElementById("email");
  var emailErr = document.getElementById("emailErr");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function genMemberNo() {
    var n = Math.floor(100000 + Math.random() * 899999);
    return "SM-" + n;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var first = document.getElementById("first").value.trim();
      var last = document.getElementById("last").value.trim();
      var email = emailInput.value.trim();
      var terms = document.getElementById("terms").checked;
      var ok = true;

      if (!first || !last) {
        toast("Please enter your full name.");
        ok = false;
      }
      if (!EMAIL_RE.test(email)) {
        emailInput.classList.add("is-invalid");
        emailErr.textContent = "Enter a valid email address.";
        ok = false;
      } else {
        emailInput.classList.remove("is-invalid");
        emailErr.textContent = "";
      }
      if (!terms) {
        toast("Please accept the program terms.");
        ok = false;
      }
      if (!ok) return;

      document.getElementById("cardName").textContent = first + " " + last;
      document.getElementById("cardNo").textContent = genMemberNo();
      document.getElementById("cardDate").textContent = new Date().toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
      });

      form.hidden = true;
      card.hidden = false;
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      toast("Welcome aboard — 5,000 miles credited!");
    });

    emailInput.addEventListener("input", function () {
      if (emailInput.classList.contains("is-invalid") && EMAIL_RE.test(emailInput.value.trim())) {
        emailInput.classList.remove("is-invalid");
        emailErr.textContent = "";
      }
    });
  }

  var reset = document.getElementById("cardReset");
  if (reset) {
    reset.addEventListener("click", function () {
      card.hidden = true;
      form.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
})();
