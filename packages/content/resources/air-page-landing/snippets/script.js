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
    el.addEventListener("click", function () {
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Search widget ---------- */
  var searchCard = document.querySelector(".search-card");
  document.querySelectorAll(".trip-opt").forEach(function (opt) {
    opt.addEventListener("click", function () {
      document.querySelectorAll(".trip-opt").forEach(function (o) {
        o.classList.remove("active");
        o.setAttribute("aria-selected", "false");
      });
      opt.classList.add("active");
      opt.setAttribute("aria-selected", "true");
      searchCard.classList.toggle("oneway", opt.getAttribute("data-trip") === "oneway");
    });
  });

  // Default dates: depart +14d, return +21d
  function iso(d) { return d.toISOString().slice(0, 10); }
  var dep = document.getElementById("depart");
  var ret = document.getElementById("return");
  var now = new Date();
  if (dep) dep.value = iso(new Date(now.getTime() + 14 * 864e5));
  if (ret) ret.value = iso(new Date(now.getTime() + 21 * 864e5));

  var swap = document.getElementById("swap");
  var fromI = document.getElementById("from");
  var toI = document.getElementById("to");
  if (swap && fromI && toI) {
    swap.addEventListener("click", function () {
      var t = fromI.value; fromI.value = toI.value; toI.value = t;
    });
  }

  var form = document.getElementById("searchForm");
  var note = document.getElementById("searchNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var from = (fromI.value || "").trim();
      var to = (toI.value || "").trim();
      if (!from || !to) {
        if (note) note.textContent = "Please enter both an origin and a destination.";
        return;
      }
      var fromCode = from.split(" ")[0];
      var toCode = to.split(" ")[0];
      if (note) note.textContent = "Searching " + fromCode + " → " + toCode + " · 312 flights found (demo).";
      toast("Found 312 flights " + fromCode + " → " + toCode + " — booking is illustrative only.");
    });
  }

  /* ---------- Deals carousel ---------- */
  var deals = [
    { tag: "Save 30%", from: "JFK", to: "CDG", city: "Paris", price: 389, hue: 18 },
    { tag: "Limited", from: "LAX", to: "NRT", city: "Tokyo", price: 642, hue: 205 },
    { tag: "Flash sale", from: "ORD", to: "BCN", city: "Barcelona", price: 415, hue: 34 },
    { tag: "Save 25%", from: "MIA", to: "GRU", city: "São Paulo", price: 498, hue: 145 },
    { tag: "New route", from: "SFO", to: "DXB", city: "Dubai", price: 711, hue: 42 },
    { tag: "Save 40%", from: "BOS", to: "KEF", city: "Reykjavík", price: 269, hue: 190 },
    { tag: "Weekend", from: "SEA", to: "YVR", city: "Vancouver", price: 158, hue: 160 },
    { tag: "Last seats", from: "ATL", to: "FCO", city: "Rome", price: 452, hue: 28 }
  ];

  function gradient(hue) {
    return "linear-gradient(135deg, hsl(" + hue + ",62%,52%), hsl(" + ((hue + 38) % 360) + ",58%,40%))";
  }

  var track = document.getElementById("dealTrack");
  if (track) {
    deals.forEach(function (d) {
      var card = document.createElement("article");
      card.className = "deal";
      card.setAttribute("role", "listitem");
      card.innerHTML =
        '<div class="deal-img" style="background:' + gradient(d.hue) + '">' +
          '<span class="deal-tag">' + d.tag + '</span>' +
        '</div>' +
        '<div class="deal-body">' +
          '<div class="deal-route tnum"><span>' + d.from + '</span><span class="arr">✈</span><span>' + d.to + '</span></div>' +
          '<div class="deal-city">' + d.city + '</div>' +
          '<div class="deal-foot">' +
            '<div class="deal-price"><small>round trip from</small><strong class="tnum">$' + d.price + '</strong></div>' +
            '<button class="deal-btn" type="button">View</button>' +
          '</div>' +
        '</div>';
      card.querySelector(".deal-btn").addEventListener("click", function () {
        toast(d.from + " → " + d.to + " from $" + d.price + " — fictional fare.");
      });
      track.appendChild(card);
    });
  }

  var dealIndex = 0;
  var prevBtn = document.getElementById("dealPrev");
  var nextBtn = document.getElementById("dealNext");

  function perView() {
    var w = window.innerWidth;
    if (w <= 520) return 1;
    if (w <= 900) return 2;
    return 3;
  }
  function maxIndex() { return Math.max(0, deals.length - perView()); }

  function updateCarousel() {
    if (!track) return;
    if (dealIndex > maxIndex()) dealIndex = maxIndex();
    var first = track.querySelector(".deal");
    var step = first ? first.getBoundingClientRect().width + 16 : 0;
    track.style.transform = "translateX(" + (-dealIndex * step) + "px)";
    if (prevBtn) prevBtn.disabled = dealIndex <= 0;
    if (nextBtn) nextBtn.disabled = dealIndex >= maxIndex();
  }
  if (prevBtn) prevBtn.addEventListener("click", function () { dealIndex = Math.max(0, dealIndex - 1); updateCarousel(); });
  if (nextBtn) nextBtn.addEventListener("click", function () { dealIndex = Math.min(maxIndex(), dealIndex + 1); updateCarousel(); });

  var resizeT;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(updateCarousel, 120);
  });
  updateCarousel();

  /* ---------- Destinations grid ---------- */
  var destinations = [
    { code: "LIS", name: "Lisbon", from: 312, hue: 32, big: true },
    { code: "SIN", name: "Singapore", from: 689, hue: 200 },
    { code: "MEX", name: "Mexico City", from: 224, hue: 145 },
    { code: "AKL", name: "Auckland", from: 798, hue: 175 },
    { code: "IST", name: "Istanbul", from: 437, hue: 14 },
    { code: "CPT", name: "Cape Town", from: 612, hue: 38 },
    { code: "BKK", name: "Bangkok", from: 555, hue: 50 }
  ];
  var destGrid = document.getElementById("destGrid");
  if (destGrid) {
    destinations.forEach(function (d) {
      var el = document.createElement("button");
      el.className = "dest" + (d.big ? " big" : "");
      el.type = "button";
      el.setAttribute("aria-label", "Explore flights to " + d.name + " from $" + d.from);
      el.style.background = gradient(d.hue);
      el.innerHTML =
        '<div class="dest-info">' +
          '<div class="code tnum">' + d.code + '</div>' +
          '<h3>' + d.name + '</h3>' +
          '<div class="from">from <b class="tnum">$' + d.from + '</b></div>' +
        '</div>';
      el.addEventListener("click", function () {
        toast("Exploring " + d.name + " (" + d.code + ") — from $" + d.from + ", demo only.");
      });
      destGrid.appendChild(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }
})();
