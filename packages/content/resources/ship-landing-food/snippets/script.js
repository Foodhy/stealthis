(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastWrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 300);
    }, 2600);
  }

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  function closeNav() {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    mobileNav.hidden = true;
  }
  navToggle.addEventListener("click", function () {
    var open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    mobileNav.hidden = open;
  });
  mobileNav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") closeNav();
  });

  /* ---------- restaurant data ---------- */
  var RESTAURANTS = [
    { name: "Pizza Forno", emoji: "🍕", cat: "pizza", rating: 4.8, reviews: 1240, time: 25, fee: "Free", tag: "Popular", cuisine: "Wood-fired pizza", deal: true },
    { name: "Smash House", emoji: "🍔", cat: "burgers", rating: 4.7, reviews: 980, time: 22, fee: "$1.99", tag: "Trending", cuisine: "Smash burgers", deal: false },
    { name: "Sakura Sushi", emoji: "🍣", cat: "sushi", rating: 4.9, reviews: 760, time: 31, fee: "Free", tag: "Top rated", cuisine: "Sushi & rolls", deal: true },
    { name: "Ramen Bar 88", emoji: "🍜", cat: "ramen", rating: 4.6, reviews: 540, time: 28, fee: "$0.99", tag: "New", cuisine: "Tonkotsu ramen", deal: false },
    { name: "Green Bowl Co.", emoji: "🥗", cat: "healthy", rating: 4.7, reviews: 612, time: 19, fee: "Free", tag: "Healthy", cuisine: "Salads & grain bowls", deal: true },
    { name: "Sugar Cloud", emoji: "🍰", cat: "dessert", rating: 4.8, reviews: 430, time: 24, fee: "$2.49", tag: "Sweet", cuisine: "Cakes & pastries", deal: false },
    { name: "El Taco Loco", emoji: "🌮", cat: "tacos", rating: 4.5, reviews: 870, time: 21, fee: "Free", tag: "Local fave", cuisine: "Street tacos", deal: true },
    { name: "Noodle Lane", emoji: "🍝", cat: "ramen", rating: 4.4, reviews: 388, time: 27, fee: "$1.49", tag: "Comfort", cuisine: "Asian noodles", deal: false },
    { name: "Bella Slice", emoji: "🍕", cat: "pizza", rating: 4.6, reviews: 705, time: 23, fee: "Free", tag: "Family", cuisine: "Neapolitan pizza", deal: true },
    { name: "Patty & Bun", emoji: "🍔", cat: "burgers", rating: 4.5, reviews: 521, time: 26, fee: "$0.99", tag: "Juicy", cuisine: "Gourmet burgers", deal: false },
    { name: "Fresh Press", emoji: "🥗", cat: "healthy", rating: 4.8, reviews: 299, time: 18, fee: "Free", tag: "Vegan", cuisine: "Cold-press & bowls", deal: true },
    { name: "Roll & Go", emoji: "🍣", cat: "sushi", rating: 4.6, reviews: 466, time: 29, fee: "$1.99", tag: "Quick", cuisine: "Sushi to-go", deal: false }
  ];

  var grid = document.getElementById("restGrid");
  var emptyEl = document.getElementById("restEmpty");
  var countEl = document.getElementById("restCount");
  var activeCat = "all";

  function cardHTML(r, i) {
    var feeClass = r.fee === "Free" ? "pill-free" : "pill-ok";
    var feeLabel = r.fee === "Free" ? "Free delivery" : r.fee + " delivery";
    return (
      '<article class="rest-card" tabindex="0" role="button" data-name="' + r.name + '" style="transition-delay:' + (i * 30) + 'ms">' +
        '<div class="rest-thumb" style="background:linear-gradient(135deg,#fff2e9,#ffe1cf)">' +
          '<span class="tag">' + r.tag + "</span>" +
          '<button class="fav" type="button" aria-label="Save ' + r.name + '" title="Save">♡</button>' +
          "<span>" + r.emoji + "</span>" +
        "</div>" +
        '<div class="rest-body">' +
          "<h3>" + r.name + "</h3>" +
          '<div class="rest-meta">' +
            '<span class="rating"><span class="star">★</span> ' + r.rating.toFixed(1) + "</span>" +
            '<span class="dot"></span><span>' + r.reviews + "+ ratings</span>" +
          "</div>" +
          '<div class="rest-meta"><span>' + r.cuisine + '</span><span class="dot"></span><span>' + r.time + " min</span></div>" +
          '<div class="rest-foot">' +
            '<span class="pill ' + feeClass + '">' + feeLabel + "</span>" +
            (r.deal ? '<span class="pill pill-free">🔥 Deal</span>' : "") +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    var list = activeCat === "all" ? RESTAURANTS : RESTAURANTS.filter(function (r) { return r.cat === activeCat; });
    grid.innerHTML = list.map(cardHTML).join("");
    emptyEl.hidden = list.length > 0;
    countEl.textContent = "Showing " + list.length + " kitchen" + (list.length === 1 ? "" : "s");
  }
  render();

  /* card + fav interactions (event delegation) */
  grid.addEventListener("click", function (e) {
    var fav = e.target.closest(".fav");
    if (fav) {
      e.stopPropagation();
      var on = fav.classList.toggle("on");
      fav.textContent = on ? "♥" : "♡";
      toast(on ? "Saved to favorites" : "Removed from favorites");
      return;
    }
    var card = e.target.closest(".rest-card");
    if (card) toast("Opening " + card.dataset.name + " menu…");
  });
  grid.addEventListener("keydown", function (e) {
    var card = e.target.closest(".rest-card");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      toast("Opening " + card.dataset.name + " menu…");
    }
  });

  /* ---------- category tabs ---------- */
  var catRow = document.getElementById("catRow");
  catRow.addEventListener("click", function (e) {
    var btn = e.target.closest(".cat");
    if (!btn) return;
    catRow.querySelectorAll(".cat").forEach(function (b) {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    activeCat = btn.dataset.cat;
    render();
    revealNew();
    var label = btn.textContent.trim();
    toast(activeCat === "all" ? "Showing all kitchens" : "Filtered to " + label);
  });

  /* ---------- address form ---------- */
  var addressForm = document.getElementById("addressForm");
  var addressInput = document.getElementById("hero-address");
  var addressHint = document.getElementById("addressHint");
  addressForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = addressInput.value.trim();
    if (val.length < 4) {
      addressInput.focus();
      addressHint.textContent = "Please enter a fuller address to find kitchens.";
      addressHint.style.color = "var(--danger)";
      toast("Add a delivery address first");
      return;
    }
    addressHint.style.color = "";
    addressHint.textContent = "Delivering to: " + val;
    toast("Found 24 kitchens near " + val.split(",")[0]);
    document.getElementById("restaurants").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- app SMS form ---------- */
  var appForm = document.getElementById("appForm");
  appForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var phone = e.target.querySelector("input").value.trim();
    var digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      toast("Enter a valid phone number");
      return;
    }
    toast("Link sent! Check your messages 📲");
    e.target.reset();
  });

  /* store + partner buttons */
  document.querySelectorAll(".store").forEach(function (b) {
    b.addEventListener("click", function () { toast("Redirecting to " + b.dataset.store + "…"); });
  });
  document.querySelectorAll("[data-partner]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      toast(b.dataset.partner === "driver" ? "Starting rider sign-up…" : "Opening partner application…");
    });
  });

  /* ---------- scroll reveal ---------- */
  var io;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }
  function revealNew() {
    document.querySelectorAll(".rest-card.reveal:not(.in)").forEach(function (el) {
      if (io) io.observe(el); else el.classList.add("in");
    });
  }

  /* ---------- shrink-nav shadow on scroll ---------- */
  var nav = document.querySelector(".nav");
  var lastShadow = false;
  window.addEventListener("scroll", function () {
    var on = window.scrollY > 8;
    if (on !== lastShadow) {
      nav.style.boxShadow = on ? "var(--sh-sm)" : "none";
      lastShadow = on;
    }
  }, { passive: true });
})();
