(function () {
  "use strict";

  /* ---------- data (fictional) ---------- */
  var DEALS = [
    { id: "p1", brand: "Aurora", name: "Pulse ANC Headphones", emoji: "🎧", now: 119, was: 199, rating: 4.7, reviews: 2143, stock: "in", t1: "#eef1ff", t2: "#e3e9ff" },
    { id: "p2", brand: "Nimbus", name: "Track Air Earbuds", emoji: "🎵", now: 59, was: 129, rating: 4.5, reviews: 980, stock: "low", t1: "#fdeef5", t2: "#ffe5d6" },
    { id: "p3", brand: "Volt", name: "Glide Pro Smartwatch", emoji: "⌚", now: 149, was: 299, rating: 4.8, reviews: 4012, stock: "in", t1: "#e6fbf2", t2: "#defaf0" },
    { id: "p4", brand: "Hex", name: "Quantum Gaming Mouse", emoji: "🖱️", now: 39, was: 69, rating: 4.6, reviews: 1567, stock: "in", t1: "#f3e9ff", t2: "#fbe6ff" },
    { id: "p5", brand: "Cobalt", name: "Vista 4K Webcam", emoji: "📷", now: 79, was: 119, rating: 4.4, reviews: 612, stock: "in", t1: "#e6f4ff", t2: "#dbeeff" },
    { id: "p6", brand: "Lumen", name: "Beam Smart Bulb 4-pack", emoji: "💡", now: 29, was: 75, rating: 4.3, reviews: 3389, stock: "low", t1: "#fff4e0", t2: "#ffe9c7" },
    { id: "p7", brand: "Forge", name: "Stratus Mechanical Keyboard", emoji: "⌨️", now: 89, was: 149, rating: 4.9, reviews: 2870, stock: "in", t1: "#eef1ff", t2: "#efe6ff" },
    { id: "p8", brand: "Drift", name: "Carry Power Bank 20K", emoji: "🔋", now: 34, was: 59, rating: 4.5, reviews: 1102, stock: "in", t1: "#e9fbf4", t2: "#e3f7ff" }
  ];

  var DOORBUSTERS = [
    { id: "d1", brand: "Aurora", name: "Studio Over-Ear", emoji: "🎧", now: 99, was: 249, rating: 4.8, reviews: 5210, stock: "low", t1: "#0c0d12", t2: "#1b1340" },
    { id: "d2", brand: "Volt", name: "Edge Tablet 11\"", emoji: "📱", now: 199, was: 449, rating: 4.7, reviews: 1880, stock: "low", t1: "#2a0f23", t2: "#421030" },
    { id: "d3", brand: "Hex", name: "Apex Console Bundle", emoji: "🎮", now: 279, was: 499, rating: 4.9, reviews: 9120, stock: "low", t1: "#0e1f33", t2: "#10283f" },
    { id: "d4", brand: "Lumen", name: "Halo Mesh Wi-Fi 3-pack", emoji: "📡", now: 129, was: 279, rating: 4.6, reviews: 740, stock: "low", t1: "#1a1228", t2: "#2a1b3d" },
    { id: "d5", brand: "Forge", name: "Bolt Ultrawide Monitor", emoji: "🖥️", now: 349, was: 699, rating: 4.8, reviews: 1320, stock: "low", t1: "#10182e", t2: "#101a33" }
  ];

  var FEATURED_ORDER = DEALS.map(function (d) { return d.id; });

  /* ---------- helpers ---------- */
  function money(n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function pctOff(now, was) {
    return Math.round((1 - now / was) * 100);
  }
  function stars(rating) {
    var full = Math.round(rating);
    var s = "";
    for (var i = 0; i < 5; i++) s += i < full ? "★" : "☆";
    return s;
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---------- toast ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var t = el("div", "toast");
    t.appendChild(el("span", "toast__dot"));
    t.appendChild(el("span", null, msg));
    toastWrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("is-show"); });
    setTimeout(function () {
      t.classList.remove("is-show");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, 2300);
  }

  /* ---------- cart ---------- */
  var cartCount = 0;
  var cartCountEl = document.getElementById("cartCount");
  var cartBtn = document.getElementById("cartBtn");
  function addToCart(name) {
    cartCount += 1;
    cartCountEl.textContent = String(cartCount);
    cartCountEl.classList.add("is-on");
    cartBtn.setAttribute("aria-label", "Open cart, " + cartCount + (cartCount === 1 ? " item" : " items"));
    // little bounce
    cartCountEl.style.transform = "scale(1.3)";
    setTimeout(function () { cartCountEl.style.transform = ""; }, 160);
    toast("Added “" + name + "” to cart");
  }
  cartBtn.addEventListener("click", function () {
    if (cartCount === 0) toast("Your cart is empty — grab a deal!");
    else toast(cartCount + (cartCount === 1 ? " item" : " items") + " in your cart");
  });

  /* ---------- card factory ---------- */
  function buildCard(p, isList) {
    var off = pctOff(p.now, p.was);
    var card = el("article", "card");
    card.setAttribute("role", "listitem");

    var thumb = el("div", "thumb");
    thumb.style.setProperty("--t1", p.t1);
    thumb.style.setProperty("--t2", p.t2);
    thumb.appendChild(el("span", "thumb__emoji", p.emoji));
    thumb.appendChild(el("span", "badge-off", "-" + off + "%"));
    var stockChip = el("span", "badge-stock" + (p.stock === "low" ? " is-low" : ""),
      p.stock === "low" ? "Low stock" : "In stock");
    thumb.appendChild(stockChip);
    card.appendChild(thumb);

    var body = el("div", "card__body");
    body.appendChild(el("span", "card__brand", p.brand));
    body.appendChild(el("h3", "card__name", p.name));

    var rating = el("div", "rating");
    rating.setAttribute("aria-label", p.rating + " out of 5 stars, " + p.reviews + " reviews");
    rating.appendChild(el("span", "rating__stars", stars(p.rating)));
    rating.appendChild(el("span", "rating__count", p.rating.toFixed(1) + " (" + p.reviews.toLocaleString("en-US") + ")"));
    body.appendChild(rating);

    var priceRow = el("div", "price-row");
    priceRow.appendChild(el("span", "price-now", money(p.now)));
    priceRow.appendChild(el("span", "price-was", money(p.was)));
    body.appendChild(priceRow);
    body.appendChild(el("span", "price-save", "You save " + money(p.was - p.now)));

    var cta = el("button", "card__cta", "Add to cart");
    cta.type = "button";
    cta.addEventListener("click", function () {
      addToCart(p.name);
      cta.classList.add("is-added");
      cta.textContent = "Added ✓";
      setTimeout(function () {
        cta.classList.remove("is-added");
        cta.textContent = "Add to cart";
      }, 1400);
    });
    body.appendChild(cta);

    card.appendChild(body);
    return card;
  }

  /* ---------- render grid ---------- */
  var grid = document.getElementById("productGrid");
  var resultCount = document.getElementById("resultCount");
  var currentSort = "featured";

  function sortedDeals() {
    var arr = DEALS.slice();
    if (currentSort === "discount") {
      arr.sort(function (a, b) { return pctOff(b.now, b.was) - pctOff(a.now, a.was); });
    } else if (currentSort === "price") {
      arr.sort(function (a, b) { return a.now - b.now; });
    } else {
      arr.sort(function (a, b) { return FEATURED_ORDER.indexOf(a.id) - FEATURED_ORDER.indexOf(b.id); });
    }
    return arr;
  }

  function renderGrid() {
    grid.innerHTML = "";
    var arr = sortedDeals();
    arr.forEach(function (p) { grid.appendChild(buildCard(p)); });
    resultCount.textContent = "Showing " + arr.length + " deals";
  }

  /* ---------- render doorbusters ---------- */
  var rail = document.getElementById("doorbusterRail");
  function renderRail() {
    DOORBUSTERS.forEach(function (p) {
      var card = buildCard(p);
      card.classList.add("db-card");
      rail.appendChild(card);
    });
  }

  /* ---------- sort toggle ---------- */
  var sortBtns = Array.prototype.slice.call(document.querySelectorAll(".sort__btn"));
  sortBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.dataset.sort === currentSort) return;
      currentSort = btn.dataset.sort;
      sortBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      renderGrid();
      var labels = { featured: "Featured", discount: "biggest discount", price: "lowest price" };
      toast("Sorted by " + labels[currentSort]);
    });
  });

  /* ---------- copy coupon ---------- */
  var copyBtn = document.getElementById("copyCoupon");
  var couponHint = document.getElementById("couponHint");
  var COUPON = "VOLT15";
  copyBtn.addEventListener("click", function () {
    function done() {
      copyBtn.classList.add("is-copied");
      couponHint.textContent = "Copied!";
      toast("Coupon " + COUPON + " copied to clipboard");
      setTimeout(function () {
        copyBtn.classList.remove("is-copied");
        couponHint.textContent = "Copy";
      }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(COUPON).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = COUPON;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* noop */ }
      document.body.removeChild(ta);
      done();
    }
  });

  /* ---------- countdown ---------- */
  // Ends at the next upcoming midnight (local). Falls back to +1 day if already passed.
  var deadline = new Date();
  deadline.setHours(24, 0, 0, 0); // next midnight
  var dEls = {
    d: document.getElementById("cdDays"),
    h: document.getElementById("cdHours"),
    m: document.getElementById("cdMins"),
    s: document.getElementById("cdSecs")
  };
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var diff = deadline.getTime() - Date.now();
    if (diff <= 0) {
      // roll the sale forward 24h so the demo never flatlines
      deadline.setTime(deadline.getTime() + 24 * 3600 * 1000);
      diff = deadline.getTime() - Date.now();
    }
    var secs = Math.floor(diff / 1000);
    var days = Math.floor(secs / 86400); secs -= days * 86400;
    var hrs = Math.floor(secs / 3600); secs -= hrs * 3600;
    var mins = Math.floor(secs / 60); secs -= mins * 60;
    dEls.d.textContent = pad(days);
    dEls.h.textContent = pad(hrs);
    dEls.m.textContent = pad(mins);
    dEls.s.textContent = pad(secs);
  }

  /* ---------- init ---------- */
  renderRail();
  renderGrid();
  tick();
  setInterval(tick, 1000);
})();
