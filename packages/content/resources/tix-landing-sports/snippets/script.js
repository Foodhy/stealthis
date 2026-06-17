/* TixGate Sports — Harbor Derby landing
   Vanilla JS: toast, mobile nav, scroll reveal, countdown,
   section ticket cards + cart, fixtures list, seating teaser. */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  var gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  function closeMobile() {
    mobileNav.classList.remove("is-open");
    mobileNav.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = mobileNav.classList.toggle("is-open");
    mobileNav.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMobile);
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- countdown ---------- */
  var KICKOFF = new Date("2026-06-27T19:45:00");
  var cdMap = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    mins: document.querySelector('[data-cd="mins"]'),
    secs: document.querySelector('[data-cd="secs"]')
  };
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var diff = KICKOFF - new Date();
    if (diff < 0) diff = 0;
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    if (cdMap.days) cdMap.days.textContent = pad(d);
    if (cdMap.hours) cdMap.hours.textContent = pad(h);
    if (cdMap.mins) cdMap.mins.textContent = pad(m);
    if (cdMap.secs) cdMap.secs.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- ticket sections ---------- */
  var sections = [
    { id: "north", tier: "North Stand", loc: "Premium · halfway line", price: 64, color: "var(--gold)",
      feats: ["Padded seats", "Best sightlines", "Covered roof"], stock: "low" },
    { id: "west", tier: "West Stand", loc: "Standard · home end", price: 42, color: "var(--brand-l)",
      feats: ["Vocal atmosphere", "Lower & upper tier"], stock: "good" },
    { id: "east", tier: "East Stand", loc: "Standard · home end", price: 42, color: "var(--brand-l)",
      feats: ["Singing section", "Closest to tunnel"], stock: "low" },
    { id: "south", tier: "South Family", loc: "Family · alcohol-free", price: 24, color: "var(--accent)",
      feats: ["Under-16 from £8", "Mascot zone"], stock: "good" },
    { id: "corner", tier: "Corner Box", loc: "Premium · NE corner", price: 88, color: "var(--gold)",
      feats: ["Padded VIP seat", "Lounge access"], stock: "out" },
    { id: "away", tier: "Away Lower", loc: "Allocated · away fans", price: 38, color: "#8a93a6",
      feats: ["Riverside FC supporters", "ID required"], stock: "good" }
  ];

  var grid = document.getElementById("ticketGrid");
  var cart = {}; // id -> {qty, price, tier}

  function badgeFor(stock) {
    if (stock === "out") return '<span class="badge badge--out">Sold out</span>';
    if (stock === "low") return '<span class="badge badge--low">Low stock</span>';
    return '<span class="badge badge--good">Available</span>';
  }

  function renderTickets() {
    grid.innerHTML = "";
    sections.forEach(function (sec) {
      var sold = sec.stock === "out";
      var card = document.createElement("article");
      card.className = "tcard" + (sold ? " is-sold" : "");
      card.style.setProperty("--tier", sec.color);
      card.innerHTML =
        '<div class="tcard__top">' +
          '<div><div class="tcard__tier">' + sec.tier + '</div>' +
          '<div class="tcard__loc">' + sec.loc + '</div></div>' +
          badgeFor(sec.stock) +
        '</div>' +
        '<div class="tcard__price">' + gbp.format(sec.price) + ' <small>/ adult</small></div>' +
        '<div class="tcard__perf"></div>' +
        '<ul class="tcard__feat">' + sec.feats.map(function (f) { return "<li>" + f + "</li>"; }).join("") + '</ul>' +
        '<button class="btn btn--primary tcard__btn" type="button"' + (sold ? " disabled" : "") + '>' +
          (sold ? "Sold out" : "Add seat") + '</button>';
      var btn = card.querySelector(".tcard__btn");
      btn.addEventListener("click", function () {
        if (sold) return;
        addToCart(sec, card);
      });
      grid.appendChild(card);
    });
  }

  /* ---------- cart ---------- */
  var cartBar = document.getElementById("cartBar");
  var cartCount = document.getElementById("cartCount");
  var cartTotal = document.getElementById("cartTotal");
  var checkoutBtn = document.getElementById("checkoutBtn");

  function addToCart(sec, card) {
    if (!cart[sec.id]) cart[sec.id] = { qty: 0, price: sec.price, tier: sec.tier };
    cart[sec.id].qty += 1;
    card.classList.add("is-selected");
    toast("Added " + sec.tier + " · " + gbp.format(sec.price));
    updateCart();
  }

  function updateCart() {
    var seats = 0, total = 0;
    Object.keys(cart).forEach(function (k) {
      seats += cart[k].qty;
      total += cart[k].qty * cart[k].price;
    });
    if (seats === 0) {
      cartBar.hidden = true;
      return;
    }
    cartBar.hidden = false;
    cartCount.textContent = seats + (seats === 1 ? " seat" : " seats");
    cartTotal.textContent = gbp.format(total);
  }

  checkoutBtn.addEventListener("click", function () {
    var seats = Object.keys(cart).reduce(function (a, k) { return a + cart[k].qty; }, 0);
    toast("Reserved " + seats + " seat" + (seats === 1 ? "" : "s") + " — opening seat selector (demo)");
    cart = {};
    document.querySelectorAll(".tcard.is-selected").forEach(function (c) { c.classList.remove("is-selected"); });
    updateCart();
  });

  renderTickets();

  /* ---------- fixtures ---------- */
  var fixtures = [
    { day: "27", mon: "Jun", match: "Northgate United vs Riverside FC", sub: "Sat · 19:45 · Harbor Stadium", comp: "League", soon: true },
    { day: "04", mon: "Jul", match: "Eastfield Town vs Northgate United", sub: "Sat · 15:00 · The Mill (Away)", comp: "League" },
    { day: "11", mon: "Jul", match: "Northgate United vs Port Albion", sub: "Sat · 17:30 · Harbor Stadium", comp: "Cup" },
    { day: "18", mon: "Jul", match: "Northgate United vs Westbay Rangers", sub: "Sat · 15:00 · Harbor Stadium", comp: "League" },
    { day: "26", mon: "Jul", match: "Highcross City vs Northgate United", sub: "Sun · 14:00 · Crown Park (Away)", comp: "League" }
  ];
  var fixturesList = document.getElementById("fixturesList");
  fixtures.forEach(function (f) {
    var row = document.createElement("div");
    row.className = "frow reveal";
    row.innerHTML =
      '<div class="frow__date"><span class="frow__day">' + f.day + '</span><span class="frow__mon">' + f.mon + '</span></div>' +
      '<div><div class="frow__match">' + f.match + '</div><div class="frow__sub">' + f.sub + '</div></div>' +
      '<span class="frow__comp">' + f.comp + '</span>' +
      '<button class="btn ' + (f.soon ? "btn--primary" : "btn--ghost") + ' frow__btn" type="button">' +
        (f.soon ? "Buy now" : "Notify me") + '</button>';
    row.querySelector(".frow__btn").addEventListener("click", function () {
      if (f.soon) {
        document.getElementById("tickets").scrollIntoView({ behavior: "smooth" });
        toast("Pick your section for the Harbor Derby");
      } else {
        toast("We'll alert you when " + f.match.split(" vs ")[0] + " tickets go live");
      }
    });
    fixturesList.appendChild(row);
    if (io) io.observe(row);
  });

  /* ---------- seating teaser ---------- */
  var seatHint = document.getElementById("seatHint");
  var stands = document.querySelectorAll(".stand");
  function showStand(el) {
    stands.forEach(function (s) { s.classList.remove("is-active"); });
    el.classList.add("is-active");
    seatHint.innerHTML = "<strong>" + el.dataset.stand + "</strong> — from " +
      el.dataset.price + " · <span style=\"color:var(--accent)\">" + el.dataset.avail + "</span>";
  }
  stands.forEach(function (el) {
    el.addEventListener("mouseenter", function () { showStand(el); });
    el.addEventListener("focus", function () { showStand(el); });
    el.addEventListener("click", function () {
      showStand(el);
      document.getElementById("tickets").scrollIntoView({ behavior: "smooth" });
      toast(el.dataset.stand + " tickets from " + el.dataset.price);
    });
  });

  /* ---------- generic CTA hooks ---------- */
  document.querySelectorAll('.hosp__foot a').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      var name = a.closest(".hosp__card").querySelector("h3").textContent;
      toast("Hospitality enquiry started — " + name);
    });
  });
})();
