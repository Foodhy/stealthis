(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 3200);
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var navMenu = document.getElementById("navMenu");
  if (burger && navMenu) {
    burger.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    navMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navMenu.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Language toggle ---------- */
  var langBtn = document.getElementById("langBtn");
  var langs = ["EN · GBP ▾", "FR · EUR ▾", "JP · JPY ▾", "AE · USD ▾"];
  var langI = 0;
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      langI = (langI + 1) % langs.length;
      langBtn.textContent = langs[langI];
      toast("Region set to " + langs[langI].replace(" ▾", ""));
    });
  }

  /* ---------- Trip type tabs ---------- */
  var trips = document.querySelectorAll(".trip");
  var returnField = document.getElementById("returnField");
  trips.forEach(function (t) {
    t.addEventListener("click", function () {
      trips.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      t.classList.add("is-active");
      t.setAttribute("aria-selected", "true");
      if (returnField) {
        returnField.style.visibility = t.dataset.trip === "oneway" ? "hidden" : "visible";
      }
    });
  });

  /* ---------- Default dates ---------- */
  function fmt(d) {
    return d.toISOString().slice(0, 10);
  }
  var depart = document.getElementById("departInput");
  var ret = document.getElementById("returnInput");
  var now = new Date();
  var d1 = new Date(now.getTime() + 14 * 864e5);
  var d2 = new Date(now.getTime() + 21 * 864e5);
  if (depart) depart.value = fmt(d1);
  if (ret) ret.value = fmt(d2);

  /* ---------- Swap origin/destination ---------- */
  var swapBtn = document.getElementById("swapBtn");
  var fromI = document.getElementById("fromInput");
  var toI = document.getElementById("toInput");
  if (swapBtn && fromI && toI) {
    swapBtn.addEventListener("click", function () {
      var tmp = fromI.value;
      fromI.value = toI.value;
      toI.value = tmp;
      swapBtn.classList.toggle("is-spun");
      toast("Route reversed");
    });
  }

  /* ---------- Search submit ---------- */
  var form = document.getElementById("searchForm");
  var cabin = document.getElementById("cabinSelect");
  var hint = document.getElementById("searchHint");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var c = cabin ? cabin.value : "Economy";
      var price = { Economy: "£210", Premium: "£980", "Crown Business": "£2,140", First: "£6,490" }[c] || "£210";
      if (hint) {
        hint.innerHTML =
          "Searching <strong>" + (fromI ? fromI.value : "") + "</strong> → <strong>" +
          (toI ? toI.value : "") + "</strong> · " + c + " from <strong>" + price + "</strong>.";
      }
      toast("Found 6 fares · " + c + " from " + price);
    });
  }

  /* ---------- Route network ---------- */
  var ROUTES = [
    { c: "JFK", city: "New York", flag: "🇺🇸", region: "americas", price: "2,140", flight: "MA 0107", status: "direct" },
    { c: "DXB", city: "Dubai", flag: "🇦🇪", region: "africa", price: "1,690", flight: "MA 0421", status: "direct" },
    { c: "HND", city: "Tokyo", flag: "🇯🇵", region: "asia", price: "2,980", flight: "MA 0915", status: "direct" },
    { c: "CDG", city: "Paris", flag: "🇫🇷", region: "europe", price: "180", flight: "MA 0233", status: "ok" },
    { c: "SIN", city: "Singapore", flag: "🇸🇬", region: "asia", price: "3,210", flight: "MA 0807", status: "direct" },
    { c: "JNB", city: "Johannesburg", flag: "🇿🇦", region: "africa", price: "1,420", flight: "MA 0552", status: "ok" },
    { c: "GRU", city: "São Paulo", flag: "🇧🇷", region: "americas", price: "2,760", flight: "MA 0188", status: "ok" },
    { c: "FCO", city: "Rome", flag: "🇮🇹", region: "europe", price: "210", flight: "MA 0349", status: "direct" },
    { c: "SYD", city: "Sydney", flag: "🇦🇺", region: "asia", price: "3,640", flight: "MA 0011", status: "ok" }
  ];
  var grid = document.getElementById("routeGrid");
  function statusPill(s) {
    if (s === "direct") return '<span class="pill pill--direct">Direct daily</span>';
    if (s === "warn") return '<span class="pill pill--warn">Seasonal</span>';
    return '<span class="pill pill--ok">Available</span>';
  }
  function renderRoutes(region) {
    if (!grid) return;
    var list = ROUTES.filter(function (r) { return region === "all" || r.region === region; });
    grid.innerHTML = list.map(function (r) {
      return (
        '<article class="route">' +
          '<div class="route__top">' +
            '<div>' +
              '<div class="route__codes">LHR <span class="arr">✈</span> ' + r.c + '</div>' +
              '<div class="route__city">London → ' + r.city + '</div>' +
            '</div>' +
            '<span class="route__flag">' + r.flag + '</span>' +
          '</div>' +
          '<div class="route__row">' +
            '<div class="route__price">£' + r.price + ' <small>return · ' + r.flight + '</small></div>' +
            statusPill(r.status) +
          '</div>' +
        '</article>'
      );
    }).join("");
    if (!list.length) grid.innerHTML = '<p style="color:var(--muted)">No destinations in this region.</p>';
  }
  renderRoutes("all");

  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      renderRoutes(chip.dataset.region);
    });
  });

  /* ---------- Loyalty tiers ---------- */
  var TIERS = {
    blue: { label: "BLUE", miles: "14,280", perks: ["Earn 1 Crown Mile per £1 spent", "Member-only seasonal fares", "Standard reward seat access"] },
    silver: { label: "SILVER", miles: "38,900", perks: ["25% bonus miles on every flight", "Priority check-in & boarding", "One complimentary upgrade voucher"] },
    gold: { label: "GOLD", miles: "76,540", perks: ["50% bonus miles & Crown Lounge access", "Guaranteed economy reward seats", "Extra baggage allowance worldwide"] },
    crown: { label: "CROWN", miles: "152,300", perks: ["Double miles & dedicated concierge", "First-class lounge for two", "Suite upgrades & private check-in"] }
  };
  var tierBtns = document.querySelectorAll(".tier");
  var tierPerks = document.getElementById("tierPerks");
  var cardTier = document.getElementById("cardTier");
  var cardMiles = document.getElementById("cardMiles");
  var loyaltyCard = document.getElementById("loyaltyCard");
  function setTier(key) {
    var t = TIERS[key];
    if (!t) return;
    if (tierPerks) tierPerks.innerHTML = t.perks.map(function (p) { return "<li>" + p + "</li>"; }).join("");
    if (cardTier) cardTier.textContent = t.label;
    if (cardMiles) cardMiles.textContent = t.miles;
    if (loyaltyCard) {
      loyaltyCard.className = "card-loyalty__inner tier-" + key;
      loyaltyCard.animate(
        [{ transform: "rotateY(-8deg) scale(.98)" }, { transform: "rotateY(0) scale(1)" }],
        { duration: 500, easing: "ease" }
      );
    }
  }
  tierBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      tierBtns.forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      setTier(b.dataset.tier);
    });
  });
  setTier("blue");

  /* ---------- App store badges ---------- */
  document.querySelectorAll(".storebtn").forEach(function (b) {
    b.addEventListener("click", function () { toast("Opening the " + b.dataset.store + "…"); });
  });

  /* ---------- Newsletter ---------- */
  var newsForm = document.getElementById("newsForm");
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("newsEmail");
      toast("Welcome aboard — fare alerts on their way to " + (email ? email.value : "you") + ".");
      newsForm.reset();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
