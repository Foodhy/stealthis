/* ============================================================
   MÉRIDIAN — Fashion store landing. Vanilla JS, no libs.
   Working cart, qty steppers, wishlist, filters, signup, reveal.
   ============================================================ */
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

  var money = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  /* ---------- Product data (fictional) ---------- */
  var products = [
    {
      id: "coat-eclipse",
      name: "Eclipse Wool Coat",
      meta: "Slate / Tailored",
      price: 890,
      was: null,
      rating: 4.9,
      reviews: 128,
      tag: null,
      grad: "linear-gradient(160deg,#5a564d 0%,#33302a 60%,#1b1916 100%)"
    },
    {
      id: "knit-solace",
      name: "Solace Merino Knit",
      meta: "Ecru / Relaxed",
      price: 245,
      was: 320,
      rating: 4.7,
      reviews: 86,
      tag: "sale",
      grad: "linear-gradient(160deg,#e8e1d4 0%,#c9bda7 55%,#9a8d72 100%)"
    },
    {
      id: "trouser-meridian",
      name: "Méridian Trouser",
      meta: "Charcoal / Pleated",
      price: 320,
      was: null,
      rating: 4.8,
      reviews: 64,
      tag: "low",
      grad: "linear-gradient(160deg,#3a4150 0%,#23272f 60%,#14161b 100%)"
    },
    {
      id: "silk-vesper",
      name: "Vesper Silk Shirt",
      meta: "Vermilion / Fluid",
      price: 290,
      was: null,
      rating: 5.0,
      reviews: 41,
      tag: "new",
      grad: "linear-gradient(160deg,#c4452e 0%,#8a3022 55%,#4a1b14 100%)"
    }
  ];

  /* ---------- Render product cards ---------- */
  function stars(rating) {
    var full = Math.round(rating);
    var s = "";
    for (var i = 0; i < 5; i++) s += i < full ? "★" : "<span>☆</span>";
    return s;
  }

  function tagMarkup(tag) {
    if (!tag) return "";
    if (tag === "sale") return '<span class="card__tag card__tag--sale">Sale</span>';
    if (tag === "low") return '<span class="card__tag card__tag--low">Low stock</span>';
    if (tag === "new") return '<span class="card__tag">Just in</span>';
    return "";
  }

  var grid = document.getElementById("productGrid");
  products.forEach(function (p) {
    var card = document.createElement("article");
    card.className = "card reveal";
    card.dataset.id = p.id;

    var priceHtml = p.was
      ? '<span class="now now--sale">' + money(p.price) + '</span><span class="was">' + money(p.was) + "</span>"
      : '<span class="now">' + money(p.price) + "</span>";

    card.innerHTML =
      '<div class="card__media">' +
        tagMarkup(p.tag) +
        '<button class="card__fav" aria-pressed="false" aria-label="Save ' + p.name + ' to wishlist">♡</button>' +
        '<div class="card__silhouette" style="background:' + p.grad + '"></div>' +
        '<button class="card__add" data-add>Add to bag</button>' +
      "</div>" +
      '<div class="card__body">' +
        '<h3 class="card__name">' + p.name + "</h3>" +
        '<p class="card__meta">' + p.meta + "</p>" +
        '<p class="card__stars" aria-label="Rated ' + p.rating + ' of 5 from ' + p.reviews + ' reviews">' +
          stars(p.rating) + ' <span style="color:var(--muted)">(' + p.reviews + ")</span></p>" +
        '<div class="card__price">' + priceHtml + "</div>" +
      "</div>";

    grid.appendChild(card);

    card.querySelector("[data-add]").addEventListener("click", function () {
      addToCart(p.id);
    });

    var fav = card.querySelector(".card__fav");
    fav.addEventListener("click", function () {
      var on = fav.getAttribute("aria-pressed") === "true";
      fav.setAttribute("aria-pressed", String(!on));
      fav.innerHTML = on ? "♡" : "♥";
      toast(on ? "Removed from wishlist." : "Saved " + p.name + " to wishlist.");
    });
  });

  /* ---------- Instagram grid ---------- */
  var instaGrid = document.getElementById("instaGrid");
  var instaGrads = [
    "radial-gradient(80% 80% at 30% 20%,#6d6357,#2a2620)",
    "radial-gradient(80% 80% at 70% 30%,#c4452e,#5a1d14)",
    "radial-gradient(80% 80% at 40% 40%,#e8e1d4,#9a8d72)",
    "radial-gradient(80% 80% at 60% 20%,#3c4654,#16191f)",
    "radial-gradient(80% 80% at 30% 60%,#8a5347,#3a2019)",
    "radial-gradient(80% 80% at 50% 30%,#d9d1c4,#5a564d)"
  ];
  var likes = [2341, 1980, 3402, 1124, 2765, 4021];
  instaGrads.forEach(function (g, i) {
    var b = document.createElement("button");
    b.className = "insta__tile";
    b.setAttribute("role", "listitem");
    b.setAttribute("aria-label", "Journal post " + (i + 1) + ", " + likes[i] + " likes");
    b.innerHTML =
      '<span class="bg" style="background:' + g + '"></span>' +
      '<span class="over reveal"><span class="heart">♥ ' + likes[i].toLocaleString("en-US") + "</span></span>";
    b.addEventListener("click", function () {
      toast("@meridian.maison post — illustrative only.");
    });
    instaGrid.appendChild(b);
  });

  /* ---------- Cart state ---------- */
  var cart = {}; // id -> qty
  var cartEl = document.getElementById("cart");
  var scrim = document.getElementById("scrim");
  var itemsEl = document.getElementById("cartItems");
  var emptyEl = document.getElementById("cartEmpty");
  var totalEl = document.getElementById("cartTotal");
  var bagCount = document.getElementById("bagCount");

  function product(id) {
    for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i];
    return null;
  }

  function totalItems() {
    var n = 0;
    for (var k in cart) n += cart[k];
    return n;
  }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    bumpBadge();
    toast(product(id).name + " added to bag.");
    openCart();
  }

  function bumpBadge() {
    bagCount.classList.remove("pop");
    void bagCount.offsetWidth; // reflow to restart anim
    bagCount.classList.add("pop");
  }

  function renderCart() {
    itemsEl.innerHTML = "";
    var keys = Object.keys(cart);
    var subtotal = 0;

    keys.forEach(function (id) {
      var p = product(id);
      var qty = cart[id];
      subtotal += p.price * qty;

      var li = document.createElement("li");
      li.className = "cart__item";
      li.innerHTML =
        '<span class="cart__thumb" style="background:' + p.grad + '"></span>' +
        '<div class="cart__info">' +
          "<b>" + p.name + "</b>" +
          "<small>" + p.meta + "</small>" +
          '<div class="qty" role="group" aria-label="Quantity for ' + p.name + '">' +
            '<button data-dec aria-label="Decrease quantity">−</button>' +
            "<span>" + qty + "</span>" +
            '<button data-inc aria-label="Increase quantity">+</button>' +
          "</div>" +
        "</div>" +
        '<div class="cart__price-col">' +
          '<span class="p">' + money(p.price * qty) + "</span>" +
          '<button class="cart__remove" data-remove>Remove</button>' +
        "</div>";

      li.querySelector("[data-inc]").addEventListener("click", function () {
        cart[id]++; renderCart(); bumpBadge();
      });
      li.querySelector("[data-dec]").addEventListener("click", function () {
        cart[id]--; if (cart[id] <= 0) delete cart[id];
        renderCart(); bumpBadge();
      });
      li.querySelector("[data-remove]").addEventListener("click", function () {
        delete cart[id]; renderCart(); bumpBadge();
        toast("Removed from bag.");
      });

      itemsEl.appendChild(li);
    });

    var count = totalItems();
    bagCount.textContent = count;
    document.querySelectorAll("[data-bag-mirror]").forEach(function (el) {
      el.textContent = count;
    });
    totalEl.textContent = money(subtotal);
    emptyEl.style.display = keys.length ? "none" : "block";
  }

  function openCart() {
    cartEl.classList.add("open");
    cartEl.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add("show"); });
  }
  function closeCart() {
    cartEl.classList.remove("open");
    cartEl.setAttribute("aria-hidden", "true");
    scrim.classList.remove("show");
    setTimeout(function () { scrim.hidden = true; }, 300);
  }

  document.getElementById("bagBtn").addEventListener("click", openCart);
  var bagMobile = document.getElementById("bagBtnMobile");
  if (bagMobile) bagMobile.addEventListener("click", function () { closeDrawer(); openCart(); });
  document.getElementById("cartClose").addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && cartEl.classList.contains("open")) closeCart();
  });

  document.getElementById("checkoutBtn").addEventListener("click", function () {
    if (totalItems() === 0) { toast("Your bag is empty."); return; }
    toast("Checkout is illustrative — no real payment.");
  });

  /* ---------- Mobile drawer ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var drawer = document.getElementById("drawer");
  function openDrawer() {
    drawer.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    drawer.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", function () {
    if (drawer.hidden) openDrawer(); else closeDrawer();
  });
  drawer.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeDrawer);
  });

  /* ---------- Generic data-toast links ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (el.tagName === "A") e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Newsletter signup ---------- */
  var form = document.getElementById("signupForm");
  var note = document.getElementById("formNote");
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = form.email.value.trim();
    note.classList.remove("ok", "err");
    if (!emailRe.test(val)) {
      note.textContent = "Please enter a valid email address.";
      note.classList.add("err");
      form.email.focus();
      return;
    }
    note.textContent = "Welcome to the list — watch your inbox.";
    note.classList.add("ok");
    form.reset();
    toast("You're on the list.");
  });

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Init ---------- */
  renderCart();
})();
