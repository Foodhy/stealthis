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
    }, 2600);
  }

  var money = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };

  /* ---------- inventory data ---------- */
  var INVENTORY = [
    { year: 2021, make: "Toyota", model: "RAV4 XLE", body: "SUV", price: 24990, old: 26990, miles: 34210, mpg: "27/34", deal: "$2,000 OFF", cert: true, tone: "red" },
    { year: 2019, make: "Honda", model: "Civic EX", body: "Sedan", price: 17490, old: 18990, miles: 41880, mpg: "32/42", deal: "Hot deal", cert: true, tone: "steel" },
    { year: 2020, make: "Ford", model: "F-150 XLT", body: "Truck", price: 32990, old: 34500, miles: 52100, mpg: "20/24", deal: "$1,500 OFF", cert: true, tone: "dark" },
    { year: 2018, make: "Chevrolet", model: "Equinox LT", body: "SUV", price: 14990, old: 16490, miles: 68340, mpg: "26/32", deal: "Under $15k", cert: false, tone: "ember" },
    { year: 2022, make: "Hyundai", model: "Elantra SEL", body: "Sedan", price: 19990, old: null, miles: 21450, mpg: "33/43", deal: "Low miles", cert: true, tone: "slate" },
    { year: 2017, make: "Jeep", model: "Wrangler Sport", body: "SUV", price: 23490, old: 25000, miles: 74900, mpg: "17/23", deal: "$1,510 OFF", cert: false, tone: "dark" },
    { year: 2019, make: "Toyota", model: "Corolla LE", body: "Sedan", price: 16490, old: null, miles: 38020, mpg: "30/38", deal: "Certified", cert: true, tone: "red" },
    { year: 2020, make: "Ford", model: "Escape SE", body: "SUV", price: 21990, old: 23490, miles: 44760, mpg: "28/34", deal: "$1,500 OFF", cert: true, tone: "ember" },
    { year: 2016, make: "Honda", model: "Fit LX", body: "Hatchback", price: 12490, old: 13990, miles: 81200, mpg: "33/40", deal: "Under $15k", cert: false, tone: "steel" }
  ];

  var grid = document.getElementById("grid");
  var gridEmpty = document.getElementById("gridEmpty");

  function payPerMo(price) {
    // rough 60mo @ 7.9% with ~$2k down
    var p = Math.max(0, price - 2000);
    var r = 0.079 / 12;
    var n = 60;
    return (p * r) / (1 - Math.pow(1 + r, -n));
  }

  function carCard(c) {
    var el = document.createElement("article");
    el.className = "card reveal";
    el.dataset.make = c.make;
    el.dataset.body = c.body;
    el.dataset.price = c.price;

    var oldPrice = c.old ? "<small>" + money(c.old) + "</small>" : "";
    var certBadge = c.cert
      ? '<span class="card__cert">✓ Certified</span>'
      : '<span class="card__cert" style="color:var(--muted)">As-is</span>';

    el.innerHTML =
      '<div class="photo" data-tone="' + c.tone + '">' +
        '<span class="photo__deal">' + c.deal + '</span>' +
        '<span class="photo__icon" aria-hidden="true">🚗</span>' +
      '</div>' +
      '<div class="card__body">' +
        '<div class="card__top">' +
          '<div>' +
            '<h3 class="card__title">' + c.year + " " + c.make + " " + c.model + '</h3>' +
            '<p class="card__meta">' + c.body + " · " + c.miles.toLocaleString("en-US") + ' mi</p>' +
          '</div>' +
          '<div class="card__price">' + money(c.price) + oldPrice + '</div>' +
        '</div>' +
        '<div class="card__specs">' +
          '<span>' + c.mpg + ' MPG</span>' +
          '<span>' + c.miles.toLocaleString("en-US") + ' mi</span>' +
          '<span>' + c.body + '</span>' +
        '</div>' +
        '<div class="card__foot">' +
          '<span class="card__mo">Est. <b>' + money(payPerMo(c.price)) + '/mo</b></span>' +
          certBadge +
        '</div>' +
        '<button class="btn btn--dark btn--block view-btn">View details</button>' +
      '</div>';

    el.querySelector(".view-btn").addEventListener("click", function () {
      toast("Reserved a test drive for the " + c.year + " " + c.make + " " + c.model + " 🚘");
    });
    return el;
  }

  var currentFilter = { make: "", body: "", budget: "" };

  function render() {
    if (!grid) return;
    grid.innerHTML = "";
    var matches = INVENTORY.filter(function (c) {
      if (currentFilter.make && c.make !== currentFilter.make) return false;
      if (currentFilter.body && c.body !== currentFilter.body) return false;
      if (currentFilter.budget && c.price > Number(currentFilter.budget)) return false;
      return true;
    });

    matches.forEach(function (c) { grid.appendChild(carCard(c)); });
    if (gridEmpty) gridEmpty.hidden = matches.length !== 0;

    // observe the freshly-added reveal cards
    grid.querySelectorAll(".reveal").forEach(function (n) {
      n.classList.add("is-in");
    });

    // update hero search count
    var countEl = document.getElementById("resultCount");
    if (countEl) {
      var total = matches.length === INVENTORY.length ? 412 : matches.length;
      countEl.textContent = total;
    }
    return matches.length;
  }

  /* ---------- search form ---------- */
  var searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      currentFilter.make = document.getElementById("make").value;
      currentFilter.budget = document.getElementById("budget").value;
      currentFilter.body = document.getElementById("body").value;
      var n = render();
      document.getElementById("deals").scrollIntoView({ behavior: "smooth" });
      toast(n ? "Showing " + n + " matching vehicle" + (n === 1 ? "" : "s") : "No matches — try widening your search");
    });
  }

  /* ---------- quick chips ---------- */
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      currentFilter.make = chip.dataset.make || "";
      currentFilter.budget = chip.dataset.budget || "";
      currentFilter.body = chip.dataset.body || "";
      // sync selects
      var m = document.getElementById("make"), b = document.getElementById("budget"), bo = document.getElementById("body");
      if (m) m.value = currentFilter.make;
      if (b) b.value = currentFilter.budget;
      if (bo) bo.value = currentFilter.body;
      render();
      document.getElementById("deals").scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- clear filters ---------- */
  var clearBtn = document.getElementById("clearFilters");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      currentFilter = { make: "", body: "", budget: "" };
      ["make", "budget", "body"].forEach(function (id) {
        var s = document.getElementById(id);
        if (s) s.value = "";
      });
      render();
      toast("Filters cleared — showing all inventory");
    });
  }

  render();

  /* ---------- payment calculator ---------- */
  var vprice = document.getElementById("vprice");
  var down = document.getElementById("down");
  var term = document.getElementById("term");

  function calc() {
    if (!vprice || !down || !term) return;
    var price = Number(vprice.value);
    var dp = Math.min(Number(down.value), price);
    var months = Number(term.value);
    var principal = Math.max(0, price - dp);
    var r = 0.079 / 12;
    var pmt = principal === 0 ? 0 : (principal * r) / (1 - Math.pow(1 + r, -months));

    document.getElementById("vpriceOut").textContent = money(price);
    document.getElementById("downOut").textContent = money(dp);
    document.getElementById("termOut").textContent = months + " months";
    document.getElementById("payment").innerHTML = money(pmt) + "<small>/mo</small>";
  }
  [vprice, down, term].forEach(function (el) {
    if (el) el.addEventListener("input", calc);
  });
  calc();

  var prequalBtn = document.getElementById("prequalBtn");
  if (prequalBtn) {
    prequalBtn.addEventListener("click", function () {
      toast("Pre-qualification started — no impact to your credit ✓");
    });
  }

  /* ---------- trade-in estimator ---------- */
  var tradeForm = document.getElementById("tradeForm");
  if (tradeForm) {
    tradeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var plate = (document.getElementById("tplate").value || "").trim();
      var milesRaw = (document.getElementById("tmiles").value || "").replace(/[^0-9]/g, "");
      if (!plate) { toast("Enter your plate to get an offer"); return; }
      var miles = Number(milesRaw) || 60000;

      // deterministic-ish estimate from plate + miles
      var seed = 0;
      for (var i = 0; i < plate.length; i++) seed += plate.charCodeAt(i);
      var base = 9000 + (seed % 11) * 850;
      var depreciation = Math.min(base * 0.7, miles * 0.06);
      var value = Math.max(900, Math.round((base - depreciation) / 50) * 50);

      var offer = document.getElementById("tradeOffer");
      document.getElementById("tradeValue").textContent = money(value);
      offer.hidden = false;
      offer.style.animation = "none";
      void offer.offsetWidth;
      offer.style.animation = "";
      toast("Instant offer ready: " + money(value));
    });
  }

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.hidden = true;
    burger.setAttribute("aria-expanded", "false");
  }
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      mobileMenu.hidden = open;
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 12);
  }, { passive: true });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-in"); });
  }
})();
