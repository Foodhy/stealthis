(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, icon) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="t-ico" aria-hidden="true">' + (icon || "✅") + "</span><span></span>";
    el.querySelector("span:last-child").textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("leave");
      el.addEventListener("animationend", function () { el.remove(); }, { once: true });
    }, 2600);
  }

  /* ---------- Money formatter ---------- */
  function money(n) {
    return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* ---------- Cart state ---------- */
  var cart = 0;
  var cartCount = document.getElementById("cartCount");
  var cartBtn = document.getElementById("cartBtn");
  function addToCart(qty, label) {
    cart += qty;
    cartCount.textContent = String(cart);
    cartBtn.setAttribute("aria-label", "Cart, " + cart + " item" + (cart === 1 ? "" : "s"));
    cartBtn.classList.remove("bump");
    void cartBtn.offsetWidth; // reflow to restart animation
    cartBtn.classList.add("bump");
    if (label) toast(label + " added to basket", "🛒");
  }
  cartBtn.addEventListener("click", function () {
    if (cart === 0) toast("Your basket is empty — add some deals!", "🧺");
    else toast(cart + " item" + (cart === 1 ? "" : "s") + " in your basket · " + money(cart * 3.2) + " est.", "🧾");
  });

  /* ---------- ZIP / postcode delivery check ---------- */
  // Fictional serviceable ZIPs mapped to a neighbourhood + ETA.
  var ZONES = {
    "10001": { area: "Chelsea, NY", eta: 25 },
    "10003": { area: "East Village, NY", eta: 28 },
    "11201": { area: "Brooklyn Heights, NY", eta: 30 },
    "94103": { area: "SoMa, San Francisco", eta: 22 },
    "90012": { area: "Downtown LA", eta: 35 },
    "60601": { area: "The Loop, Chicago", eta: 30 },
    "02108": { area: "Beacon Hill, Boston", eta: 27 },
    "98101": { area: "Downtown Seattle", eta: 32 }
  };

  var zipForm = document.getElementById("zipForm");
  var zipInput = document.getElementById("zip");
  var zipMsg = document.getElementById("zipMsg");
  var headerChip = document.getElementById("headerDeliverChip");
  var headerText = document.getElementById("headerDeliverText");

  zipInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "").slice(0, 5);
    zipMsg.className = "zip-msg";
    zipMsg.textContent = "";
  });

  zipForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = zipInput.value.trim();

    if (val.length !== 5) {
      zipMsg.className = "zip-msg err";
      zipMsg.textContent = "⚠ Please enter a 5-digit ZIP code.";
      zipInput.focus();
      return;
    }

    var zone = ZONES[val];
    if (zone) {
      zipMsg.className = "zip-msg ok";
      zipMsg.innerHTML = "🎉 Great news — we deliver to <strong>" + zone.area +
        "</strong>! Next slot in <span class=\"eta\">~" + zone.eta + " min</span>.";
      headerChip.hidden = false;
      headerText.textContent = "Deliver to " + zone.area;
      toast("We deliver to " + zone.area + "!", "🚲");
    } else {
      // Deterministic "coming soon" fallback so unknown ZIPs still get a friendly answer.
      var days = (parseInt(val.slice(-2), 10) % 6) + 2;
      zipMsg.className = "zip-msg err";
      zipMsg.innerHTML = "😔 Not in your area just yet — but we're expanding fast. " +
        "We expect to reach <strong>" + val + "</strong> in about <strong>" + days + " weeks</strong>.";
      headerChip.hidden = true;
      toast("We'll email you when we reach " + val, "📬");
    }
  });

  /* ---------- Category tiles ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".cat-tile"), function (tile) {
    tile.addEventListener("click", function () {
      var name = tile.getAttribute("data-cat").replace(/&amp;/g, "&");
      toast("Browsing " + name + " — opening aisle…", "🔎");
    });
  });

  /* ---------- Deals: data + render ---------- */
  var DEALS = [
    { name: "Organic Hass Avocados", unit: "Pack of 4", emoji: "🥑", tint: "#eafbe7", price: 4.49, was: 6.99, rating: 4.8, reviews: 1240, stock: "In stock", low: false, badge: "-36%" },
    { name: "Free-Range Eggs", unit: "Dozen, large", emoji: "🥚", tint: "#fff6e0", price: 3.29, was: 4.50, rating: 4.9, reviews: 980, stock: "In stock", low: false, badge: "-27%" },
    { name: "Sourdough Loaf", unit: "Freshly baked, 800g", emoji: "🍞", tint: "#fbeede", price: 3.10, was: 4.20, rating: 4.7, reviews: 612, stock: "Low stock", low: true, badge: "-26%" },
    { name: "Cherry Tomatoes", unit: "Vine-ripened, 500g", emoji: "🍅", tint: "#fde9ec", price: 2.20, was: 3.00, rating: 4.6, reviews: 430, stock: "In stock", low: false, badge: "-27%" },
    { name: "Greek Yogurt", unit: "Natural, 1kg tub", emoji: "🥛", tint: "#eef1ff", price: 2.80, was: 3.80, rating: 4.8, reviews: 720, stock: "In stock", low: false, badge: "-26%" },
    { name: "Honeycrisp Apples", unit: "Bag of 6", emoji: "🍎", tint: "#fdeede", price: 3.95, was: 5.10, rating: 4.7, reviews: 540, stock: "In stock", low: false, badge: "-23%" },
    { name: "Cold-Pressed Orange Juice", unit: "1L bottle", emoji: "🧃", tint: "#e6f7fb", price: 4.10, was: 5.50, rating: 4.9, reviews: 305, stock: "Low stock", low: true, badge: "-25%" },
    { name: "Aged Cheddar", unit: "Block, 250g", emoji: "🧀", tint: "#fff3d6", price: 4.75, was: 6.20, rating: 4.8, reviews: 388, stock: "In stock", low: false, badge: "-23%" }
  ];

  var grid = document.getElementById("dealGrid");
  DEALS.forEach(function (d, i) {
    var stars = "★★★★★".slice(0, Math.round(d.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(d.rating));
    var li = document.createElement("li");
    li.className = "deal-card";
    li.innerHTML =
      '<div class="deal-photo" style="--tint:' + d.tint + '">' +
        '<span class="deal-badge">' + d.badge + '</span>' +
        '<span aria-hidden="true">' + d.emoji + '</span>' +
      "</div>" +
      '<div class="deal-body">' +
        '<h3 class="deal-name">' + d.name + "</h3>" +
        '<p class="deal-unit">' + d.unit + "</p>" +
        '<p class="deal-rating"><span class="stars" aria-hidden="true">' + stars + "</span>" +
          '<span class="sr-only">' + d.rating + " out of 5</span> " + d.rating +
          " (" + d.reviews.toLocaleString("en-US") + ")</p>" +
        '<div class="deal-price-row">' +
          '<span class="deal-price">' + money(d.price) + "</span>" +
          '<span class="deal-was">' + money(d.was) + "</span>" +
        "</div>" +
        '<span class="deal-stock' + (d.low ? " low" : "") + '">' +
          (d.low ? "⚡ " : "✓ ") + d.stock + "</span>" +
        '<button class="deal-add" type="button">＋ Add to basket</button>' +
      "</div>";

    var btn = li.querySelector(".deal-add");
    btn.addEventListener("click", function () {
      addToCart(1, d.name);
      btn.classList.add("added");
      btn.innerHTML = "✓ Added";
      setTimeout(function () {
        btn.classList.remove("added");
        btn.innerHTML = "＋ Add to basket";
      }, 1400);
    });

    grid.appendChild(li);
  });

  /* ---------- App signup ---------- */
  var appForm = document.getElementById("appForm");
  var phone = document.getElementById("phone");
  var appMsg = document.getElementById("appMsg");
  appForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var digits = phone.value.replace(/[^0-9]/g, "");
    if (digits.length < 7) {
      appMsg.textContent = "⚠ Please enter a valid mobile number.";
      phone.focus();
      return;
    }
    appMsg.textContent = "📲 Done! We've texted a download link to your phone.";
    toast("Download link sent — check your messages", "📲");
    appForm.reset();
  });

  /* ---------- Smooth-scroll for in-page nav (respects reduced motion via CSS) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });
})();
