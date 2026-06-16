(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Billing toggle ---------- */
  var billToggle = document.getElementById("billToggle");
  var saveBadge = document.getElementById("saveBadge");
  var labMonthly = document.getElementById("billMonthly");
  var labAnnual = document.getElementById("billAnnual");
  var isAnnual = false;

  function applyBilling() {
    billToggle.setAttribute("aria-checked", String(isAnnual));
    labMonthly.classList.toggle("active", !isAnnual);
    labAnnual.classList.toggle("active", isAnnual);
    saveBadge.classList.toggle("show", isAnnual);

    // Fixed-price plans (Starter, Business)
    document.querySelectorAll(".amount[data-monthly]").forEach(function (el) {
      el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly;
    });

    renderTeam();
  }

  billToggle.addEventListener("click", function () {
    isAnnual = !isAnnual;
    applyBilling();
    toast(isAnnual ? "Annual billing — you save 20%" : "Switched to monthly billing");
  });

  /* ---------- Team seat slider ---------- */
  var seatRange = document.getElementById("seatRange");
  var seatCount = document.getElementById("seatCount");
  var teamPrice = document.getElementById("teamPrice");
  var teamNote = document.getElementById("teamSeatNote");

  function renderTeam() {
    var seats = parseInt(seatRange.value, 10);
    var perSeat = isAnnual
      ? parseInt(teamPrice.dataset.baseAnnual, 10)
      : parseInt(teamPrice.dataset.baseMonthly, 10);
    var total = seats * perSeat;
    seatCount.textContent = seats;
    teamPrice.textContent = total;
    teamNote.textContent = seats + " seats × $" + perSeat + "/seat" + (isAnnual ? " (annual)" : "");
  }

  seatRange.addEventListener("input", renderTeam);

  /* ---------- Plan CTAs ---------- */
  document.querySelectorAll(".cta[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var plan = btn.dataset.plan;
      if (btn.dataset.sales) {
        toast("Opening contact form for " + plan + " — our team will reach out.");
        document.getElementById("faq").scrollIntoView({ block: "start" });
      } else if (plan === "Starter") {
        toast("Welcome aboard! Creating your free Starter workspace…");
      } else {
        var detail = plan === "Team" ? " (" + seatRange.value + " seats)" : "";
        toast("Starting your 14-day " + plan + " trial" + detail + " — no card required.");
      }
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".accordion .q").forEach(function (q) {
    q.addEventListener("click", function () {
      var panel = document.getElementById(q.getAttribute("aria-controls"));
      var open = q.getAttribute("aria-expanded") === "true";
      // close all others
      document.querySelectorAll(".accordion .q").forEach(function (other) {
        if (other !== q) {
          other.setAttribute("aria-expanded", "false");
          document.getElementById(other.getAttribute("aria-controls")).hidden = true;
        }
      });
      q.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });

  /* ---------- Theme toggle ---------- */
  var themeToggle = document.getElementById("themeToggle");
  function setTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.querySelector(".theme-ico").textContent = dark ? "☀" : "◐";
  }
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark);
  themeToggle.addEventListener("click", function () {
    setTheme(document.documentElement.getAttribute("data-theme") !== "dark");
  });

  /* ---------- Init ---------- */
  applyBilling();
})();
