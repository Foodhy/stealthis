// Aperture Nine — video packages
(function () {
  "use strict";

  var PACKAGES = [
    {
      id: "reel",
      tier: "Reel",
      reel: "TIER 01",
      blurb: "A single social-first edit — perfect for launches and event recaps.",
      project: 1600,
      retainer: 1360,
      runtime: "Up to 0:60",
      revisions: "2 rounds",
      turnaround: "5 days",
      crew: "Solo shooter",
      features: [
        "1 half-day shoot",
        "Vertical + horizontal masters",
        "Licensed music + basic colour",
        "Captions & thumbnail"
      ],
      popular: false
    },
    {
      id: "feature",
      tier: "Feature",
      reel: "TIER 02",
      blurb: "A polished brand film with a small crew, grade and sound design.",
      project: 3900,
      retainer: 3315,
      runtime: "Up to 2:30",
      revisions: "3 rounds",
      turnaround: "10 days",
      crew: "2-person crew",
      features: [
        "Full-day shoot + lighting",
        "Cinematic colour grade",
        "Original sound design",
        "3 cutdowns for socials",
        "Storyboard & shot list"
      ],
      popular: true
    },
    {
      id: "studio",
      tier: "Signature",
      reel: "TIER 03",
      blurb: "Multi-day production with a full crew for flagship campaigns.",
      project: 8200,
      retainer: 6970,
      runtime: "Up to 5:00",
      revisions: "Unlimited",
      turnaround: "3 weeks",
      crew: "Full crew + director",
      features: [
        "Up to 3 shoot days",
        "Director, DP & gaffer",
        "Cinema-grade colour + mix",
        "6 platform cutdowns",
        "Behind-the-scenes reel",
        "Priority scheduling"
      ],
      popular: false
    }
  ];

  var state = { mode: "project" };

  function fmt(n) {
    return "$" + n.toLocaleString("en-US");
  }

  var grid = document.getElementById("grid");

  function priceFor(pkg) {
    return state.mode === "project" ? pkg.project : pkg.retainer;
  }

  function buildCard(pkg) {
    var li = document.createElement("li");
    var card = document.createElement("article");
    card.className = "card" + (pkg.popular ? " is-popular" : "");
    card.tabIndex = 0;
    card.setAttribute("aria-label", pkg.tier + " package, " + fmt(priceFor(pkg)));

    var badge = pkg.popular
      ? '<span class="badge">★ MOST BOOKED</span>'
      : "";

    var meta =
      metaRow("Runtime", pkg.runtime) +
      metaRow("Revisions", pkg.revisions) +
      metaRow("Turnaround", pkg.turnaround) +
      metaRow("Crew", pkg.crew);

    var feats = pkg.features
      .map(function (f) {
        return '<li><span class="check" aria-hidden="true">✓</span>' + f + "</li>";
      })
      .join("");

    card.innerHTML =
      badge +
      '<div class="card-top">' +
      '<h3 class="tier">' + pkg.tier + "</h3>" +
      '<span class="reel">' + pkg.reel + "</span>" +
      "</div>" +
      '<p class="blurb">' + pkg.blurb + "</p>" +
      '<div class="price" data-price>' +
      '<span class="amount" data-amount>' + fmt(priceFor(pkg)) + "</span>" +
      '<span class="per" data-per>' + perLabel() + "</span>" +
      "</div>" +
      '<dl class="meta">' + meta + "</dl>" +
      '<ul class="features">' + feats + "</ul>" +
      '<button class="btn ' + (pkg.popular ? "btn-primary" : "") + '" data-enquire>Enquire · ' + pkg.tier + "</button>";

    card.querySelector("[data-enquire]").addEventListener("click", function () {
      openPanel(pkg);
    });

    li.appendChild(card);
    return li;
  }

  function metaRow(dt, dd) {
    return "<div><dt>" + dt + "</dt><dd>" + dd + "</dd></div>";
  }

  function perLabel() {
    return state.mode === "project" ? "/ project" : "/ month";
  }

  function render() {
    grid.innerHTML = "";
    PACKAGES.forEach(function (pkg) {
      grid.appendChild(buildCard(pkg));
    });
  }

  // Billing toggle with number flip animation
  var toggleBtns = document.querySelectorAll(".toggle-btn");
  toggleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      state.mode = btn.getAttribute("data-mode");
      toggleBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      flipPrices();
    });
  });

  function flipPrices() {
    var prices = grid.querySelectorAll("[data-price]");
    prices.forEach(function (el) {
      el.classList.add("flip");
    });
    window.setTimeout(function () {
      PACKAGES.forEach(function (pkg, i) {
        var card = grid.children[i].querySelector(".card");
        card.querySelector("[data-amount]").textContent = fmt(priceFor(pkg));
        card.querySelector("[data-per]").textContent = perLabel();
        card.setAttribute("aria-label", pkg.tier + " package, " + fmt(priceFor(pkg)));
      });
      prices.forEach(function (el) {
        el.classList.remove("flip");
      });
    }, 180);
  }

  // Panel
  var panel = document.getElementById("panel");
  var scrim = document.getElementById("scrim");
  var closeBtn = document.getElementById("closePanel");
  var form = document.getElementById("enquireForm");
  var lastFocus = null;

  function openPanel(pkg) {
    lastFocus = document.activeElement;
    document.getElementById("panelTitle").textContent = "Book the " + pkg.tier + " package";
    document.getElementById("chosenName").textContent = pkg.tier + " · " + pkg.runtime;
    document.getElementById("chosenPrice").textContent = fmt(priceFor(pkg)) + " " + perLabel();
    scrim.hidden = false;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    window.setTimeout(function () {
      document.getElementById("nameField").focus();
    }, 320);
    document.addEventListener("keydown", onKey);
  }

  function closePanel() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    document.removeEventListener("keydown", onKey);
    if (lastFocus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") closePanel();
  }

  scrim.addEventListener("click", closePanel);
  closeBtn.addEventListener("click", closePanel);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("nameField");
    var email = document.getElementById("emailField");
    var date = document.getElementById("dateField");
    if (!name.value.trim() || !email.checkValidity() || !date.value) {
      toast("Please add your name, a valid email and a shoot date.");
      (!name.value.trim() ? name : !email.checkValidity() ? email : date).focus();
      return;
    }
    var chosen = document.getElementById("chosenName").textContent.split(" · ")[0];
    closePanel();
    form.reset();
    toast("Enquiry sent for the " + chosen + " package — we'll reply within a day.");
  });

  // Toast
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3400);
  }

  render();
})();
