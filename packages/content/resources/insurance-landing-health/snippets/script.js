(function () {
  "use strict";

  /* ---------- Plan finder teaser ---------- */
  var finder = document.getElementById("finder");
  var household = document.getElementById("household");
  var zip = document.getElementById("zip");
  var amountEl = document.getElementById("finderAmount");

  // Rough base monthly per household size, with a ZIP-driven regional nudge.
  var baseByHousehold = { "1": 189, "2": 312, "3": 468, "5": 612 };

  function regionFactor(z) {
    var n = parseInt((z || "").slice(0, 2), 10);
    if (isNaN(n)) return 1;
    // Spread between ~0.9 and ~1.15 based on first two ZIP digits.
    return 0.9 + ((n % 26) / 25) * 0.25;
  }

  function fmt(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function updateFinder() {
    var base = baseByHousehold[household.value] || 312;
    var factor = regionFactor(zip.value);
    var low = base * factor * 0.92;
    var high = base * factor * 1.12;
    amountEl.innerHTML = fmt(low) + " – " + fmt(high) + "<small>/mo</small>";
  }

  if (household && zip && amountEl) {
    household.addEventListener("change", updateFinder);
    zip.addEventListener("input", function () {
      zip.value = zip.value.replace(/\D/g, "").slice(0, 5);
      updateFinder();
    });
    updateFinder();
  }

  if (finder) {
    finder.addEventListener("submit", function (e) {
      e.preventDefault();
      var plans = document.getElementById("plans");
      if (plans) plans.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- Billing toggle (recalculate prices live) ---------- */
  var btMonthly = document.getElementById("btMonthly");
  var btAnnual = document.getElementById("btAnnual");
  var amtNodes = document.querySelectorAll(".plan .amt");
  var noteNodes = document.querySelectorAll(".plan .annual-note");
  var perNodes = document.querySelectorAll(".plan .per");

  function setBilling(annual) {
    btMonthly.classList.toggle("is-active", !annual);
    btAnnual.classList.toggle("is-active", annual);
    btMonthly.setAttribute("aria-pressed", String(!annual));
    btAnnual.setAttribute("aria-pressed", String(annual));

    amtNodes.forEach(function (node, i) {
      var monthly = parseInt(node.getAttribute("data-monthly"), 10);
      if (annual) {
        // Show effective monthly when billed annually (16% off).
        var perMonth = Math.round((monthly * 12 * 0.84) / 12);
        node.textContent = perMonth.toLocaleString("en-US");
      } else {
        node.textContent = monthly.toLocaleString("en-US");
      }
      if (perNodes[i]) perNodes[i].textContent = annual ? "/mo*" : "/mo";
    });

    noteNodes.forEach(function (node) {
      var yearly = parseInt(node.getAttribute("data-annual"), 10);
      if (annual) {
        var discounted = Math.round(yearly * 0.84);
        var saving = yearly - discounted;
        node.textContent = "$" + discounted.toLocaleString("en-US") +
          "/yr · save $" + saving.toLocaleString("en-US");
      } else {
        node.textContent = "$" + yearly.toLocaleString("en-US") + " billed yearly";
      }
    });
  }

  if (btMonthly && btAnnual) {
    btMonthly.addEventListener("click", function () { setBilling(false); });
    btAnnual.addEventListener("click", function () { setBilling(true); });
  }

  /* ---------- Enrollment countdown ---------- */
  var cdDays = document.getElementById("cdDays");
  var cdHrs = document.getElementById("cdHrs");
  var cdMin = document.getElementById("cdMin");
  var cdSec = document.getElementById("cdSec");

  // Target: Dec 15 23:59 of the current (or next) year.
  function nextDeadline() {
    var now = new Date();
    var target = new Date(now.getFullYear(), 11, 15, 23, 59, 59);
    if (target < now) target = new Date(now.getFullYear() + 1, 11, 15, 23, 59, 59);
    return target;
  }
  var deadline = nextDeadline();

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    var diff = deadline - new Date();
    if (diff < 0) diff = 0;
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (cdDays) cdDays.textContent = pad(d);
    if (cdHrs) cdHrs.textContent = pad(h);
    if (cdMin) cdMin.textContent = pad(m);
    if (cdSec) cdSec.textContent = pad(sec);
  }
  if (cdDays) { tick(); setInterval(tick, 1000); }

  /* ---------- FAQ accordion ---------- */
  var accordion = document.getElementById("accordion");
  if (accordion) {
    accordion.addEventListener("click", function (e) {
      var btn = e.target.closest(".acc-q");
      if (!btn) return;
      var item = btn.parentElement;
      var panel = item.querySelector(".acc-a");
      var isOpen = item.classList.contains("open");

      // Close others (single-open accordion).
      accordion.querySelectorAll(".acc-item.open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".acc-q").setAttribute("aria-expanded", "false");
          other.querySelector(".acc-a").style.maxHeight = null;
        }
      });

      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
    });
  }

  /* ---------- Quote form ---------- */
  var quoteForm = document.getElementById("quoteForm");
  var quoteMsg = document.getElementById("quoteMsg");
  if (quoteForm) {
    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("qname").value.trim() || "there";
      var first = name.split(" ")[0];
      quoteMsg.hidden = false;
      quoteMsg.textContent =
        "Thanks, " + first + " — a personalized quote is on its way to your inbox. (Demo only.)";
      quoteForm.querySelector("button[type=submit]").textContent = "Quote sent ✓";
    });
  }
})();
