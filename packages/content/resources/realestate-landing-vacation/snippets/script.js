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
    }, 2600);
  }
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (el.getAttribute("href") === "#") e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Listing data ---------- */
  var stays = [
    { cat: "beach", loc: "Tulum, Mexico", title: "Casa Marea — beachfront palapa", rate: "4.97", reviews: 184, guests: 6, beds: 3, baths: 2, price: 268, art: "linear-gradient(135deg,#ffd28a 0%,#f0a36b 38%,#2a9d9b 130%)" },
    { cat: "mountain", loc: "Lake Tahoe, USA", title: "Pinecrest A-frame with hot tub", rate: "4.92", reviews: 211, guests: 8, beds: 4, baths: 3, price: 342, art: "linear-gradient(150deg,#9fd6c9 0%,#5b9aa0 45%,#2e4f4b 130%)" },
    { cat: "city", loc: "Lisbon, Portugal", title: "Alfama tiled loft with terrace", rate: "4.89", reviews: 156, guests: 4, beds: 2, baths: 1, price: 174, art: "linear-gradient(135deg,#f7d9b0 0%,#e79b7c 50%,#9c5e6a 130%)" },
    { cat: "beach", loc: "Amalfi Coast, Italy", title: "Limone cliff villa, sea view", rate: "4.99", reviews: 98, guests: 5, beds: 3, baths: 2, price: 410, art: "linear-gradient(135deg,#bfe9ff 0%,#5ec0d8 45%,#1f7c7b 130%)" },
    { cat: "countryside", loc: "Provence, France", title: "Lavender farmhouse & pool", rate: "4.94", reviews: 142, guests: 7, beds: 4, baths: 3, price: 298, art: "linear-gradient(135deg,#e3d4f0 0%,#b39ad1 40%,#6f7f9c 130%)" },
    { cat: "mountain", loc: "Banff, Canada", title: "Glasswall cabin under the peaks", rate: "4.96", reviews: 173, guests: 6, beds: 3, baths: 2, price: 315, art: "linear-gradient(160deg,#cfe6e1 0%,#7aa6a2 45%,#2f4a4f 130%)" },
    { cat: "city", loc: "Mexico City, MX", title: "Roma Norte mid-century flat", rate: "4.91", reviews: 207, guests: 3, beds: 1, baths: 1, price: 132, art: "linear-gradient(135deg,#ffe1a8 0%,#f0926e 50%,#b85c5c 130%)" },
    { cat: "beach", loc: "Bali, Indonesia", title: "Uluwatu jungle bungalow", rate: "4.95", reviews: 264, guests: 4, beds: 2, baths: 2, price: 156, art: "linear-gradient(135deg,#d5f0c0 0%,#5cb39b 45%,#1f6a64 130%)" },
    { cat: "countryside", loc: "Tuscany, Italy", title: "Vineyard stone villa & olive grove", rate: "4.98", reviews: 121, guests: 9, beds: 5, baths: 4, price: 388, art: "linear-gradient(150deg,#f3e2a8 0%,#cda154 45%,#6a5a32 130%)" }
  ];

  var grid = document.getElementById("getawaysGrid");
  var emptyEl = document.getElementById("getawaysEmpty");

  function fmt(n) { return "$" + n.toLocaleString("en-US"); }

  function cardHTML(s) {
    return (
      '<article class="card" data-cat="' + s.cat + '">' +
        '<div class="card-photo" style="background:' + s.art + '">' +
          '<span class="badge">★ Guest favourite</span>' +
          '<button class="like" type="button" aria-label="Save ' + s.title + '" aria-pressed="false">♥</button>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-top">' +
            '<span class="card-loc">' + s.loc + '</span>' +
            '<span class="card-rate"><span class="star">★</span> ' + s.rate + ' <span style="color:var(--muted);font-weight:500">(' + s.reviews + ')</span></span>' +
          '</div>' +
          '<h3 class="card-title">' + s.title + '</h3>' +
          '<div class="card-meta">' +
            '<span class="sleeps">Sleeps ' + s.guests + '</span>' +
            '<span>' + s.beds + ' beds · ' + s.baths + ' baths</span>' +
          '</div>' +
          '<div class="card-foot">' +
            '<span class="card-price">' + fmt(s.price) + '</span>' +
            '<span class="card-per">/ night</span>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function render(filter) {
    var list = filter === "all" ? stays : stays.filter(function (s) { return s.cat === filter; });
    grid.innerHTML = list.map(cardHTML).join("");
    emptyEl.hidden = list.length !== 0;

    grid.querySelectorAll(".like").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var on = btn.classList.toggle("on");
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        toast(on ? "Saved to your wishlist" : "Removed from wishlist");
      });
    });
  }

  render("all");

  /* ---------- Filter chips ---------- */
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      render(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- Guests stepper ---------- */
  var guestsToggle = document.getElementById("guestsToggle");
  var guestsPop = document.getElementById("guestsPop");
  var guestsValue = document.getElementById("guestsValue");
  var counts = { adults: 2, children: 0, pets: 0 };
  var limits = { adults: [1, 16], children: [0, 10], pets: [0, 5] };

  function updateGuestsLabel() {
    var people = counts.adults + counts.children;
    var parts = [people + (people === 1 ? " guest" : " guests")];
    if (counts.pets) parts.push(counts.pets + (counts.pets === 1 ? " pet" : " pets"));
    guestsValue.textContent = parts.join(", ");
  }
  function syncSteppers() {
    document.querySelectorAll(".step-count").forEach(function (el) {
      el.textContent = counts[el.getAttribute("data-count")];
    });
    document.querySelectorAll(".step").forEach(function (btn) {
      var key = btn.getAttribute("data-step");
      var dir = parseInt(btn.getAttribute("data-dir"), 10);
      var v = counts[key];
      btn.disabled = dir < 0 ? v <= limits[key][0] : v >= limits[key][1];
    });
    updateGuestsLabel();
  }
  document.querySelectorAll(".step").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-step");
      var dir = parseInt(btn.getAttribute("data-dir"), 10);
      var next = counts[key] + dir;
      if (next < limits[key][0] || next > limits[key][1]) return;
      counts[key] = next;
      syncSteppers();
    });
  });
  function openGuests(open) {
    guestsPop.hidden = !open;
    guestsToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  guestsToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    openGuests(guestsPop.hidden);
  });
  document.addEventListener("click", function (e) {
    if (!guestsPop.hidden && !guestsPop.contains(e.target) && e.target !== guestsToggle) openGuests(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !guestsPop.hidden) { openGuests(false); guestsToggle.focus(); }
  });
  syncSteppers();

  /* ---------- Search submit ---------- */
  var searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var where = document.getElementById("where").value.trim() || "Anywhere";
    var people = counts.adults + counts.children;
    toast("Searching " + where + " for " + people + (people === 1 ? " guest" : " guests") + "…");
    openGuests(false);
  });

  /* ---------- Destinations carousel ---------- */
  var destinations = [
    { name: "Tulum", meta: "1,240 stays", art: "linear-gradient(180deg,#ffd28a 0%,#2a9d9b 130%)" },
    { name: "Amalfi", meta: "612 stays", art: "linear-gradient(180deg,#bfe9ff 0%,#1f7c7b 130%)" },
    { name: "Lake Tahoe", meta: "884 stays", art: "linear-gradient(180deg,#9fd6c9 0%,#2e4f4b 130%)" },
    { name: "Lisbon", meta: "1,506 stays", art: "linear-gradient(180deg,#f7d9b0 0%,#9c5e6a 130%)" },
    { name: "Bali", meta: "2,031 stays", art: "linear-gradient(180deg,#d5f0c0 0%,#1f6a64 130%)" },
    { name: "Provence", meta: "498 stays", art: "linear-gradient(180deg,#e3d4f0 0%,#6f7f9c 130%)" },
    { name: "Banff", meta: "327 stays", art: "linear-gradient(180deg,#cfe6e1 0%,#2f4a4f 130%)" },
    { name: "Tuscany", meta: "742 stays", art: "linear-gradient(180deg,#f3e2a8 0%,#6a5a32 130%)" }
  ];
  var carousel = document.getElementById("carousel");
  carousel.innerHTML = destinations.map(function (d) {
    return (
      '<button class="slide" type="button" style="background:' + d.art + '" aria-label="Explore ' + d.name + '">' +
        '<span class="slide-text"><h3>' + d.name + '</h3><span>' + d.meta + '</span></span>' +
      '</button>'
    );
  }).join("");
  carousel.querySelectorAll(".slide").forEach(function (slide, i) {
    slide.addEventListener("click", function () { toast("Exploring " + destinations[i].name + " — demo only"); });
  });

  var prevBtn = document.getElementById("carPrev");
  var nextBtn = document.getElementById("carNext");
  function scrollAmount() {
    var first = carousel.querySelector(".slide");
    var step = first ? first.getBoundingClientRect().width + 18 : 300;
    return step * Math.max(1, Math.floor(carousel.clientWidth / step));
  }
  function updateCarBtns() {
    prevBtn.disabled = carousel.scrollLeft <= 4;
    nextBtn.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 4;
  }
  prevBtn.addEventListener("click", function () { carousel.scrollBy({ left: -scrollAmount(), behavior: "smooth" }); });
  nextBtn.addEventListener("click", function () { carousel.scrollBy({ left: scrollAmount(), behavior: "smooth" }); });
  carousel.addEventListener("scroll", updateCarBtns, { passive: true });
  window.addEventListener("resize", updateCarBtns);
  updateCarBtns();

  /* ---------- Host earnings slider ---------- */
  var nights = document.getElementById("nights");
  var nightsOut = document.getElementById("nightsOut");
  var estValue = document.getElementById("estValue");
  var NIGHTLY = 142; // assumed avg nightly net for the demo estimate
  function updateEst() {
    var n = parseInt(nights.value, 10);
    nightsOut.textContent = n;
    estValue.textContent = "$" + (n * NIGHTLY).toLocaleString("en-US");
  }
  nights.addEventListener("input", updateEst);
  updateEst();

  /* ---------- Host email form ---------- */
  var hostForm = document.getElementById("hostForm");
  hostForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("hostEmail");
    if (!email.checkValidity()) { email.reportValidity(); return; }
    toast("Estimate sent to " + email.value + " — happy hosting!");
    email.value = "";
  });
})();
