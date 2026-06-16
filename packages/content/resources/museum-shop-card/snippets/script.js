(function () {
  "use strict";

  /* ---------- demo catalogue (fictional) ---------- */
  var PRODUCTS = [
    {
      id: "PR-0418",
      tag: "Limited print",
      title: "Harbour at Dusk",
      byline: "after E. Vandermeer, 1871 · Giclée, 50×70cm",
      price: 68,
      member: 58,
      rating: 4.8,
      reviews: 124,
      art: ["#2c3e57", "#7d96ad", "#e6c98a"],
      variants: [
        { name: "Slate", c: "#2c3e57" },
        { name: "Linen", c: "#e7e1d4" },
        { name: "Sienna", c: "#9a5a36" }
      ]
    },
    {
      id: "BK-2207",
      tag: "Monograph",
      title: "Goryeo Celadon",
      byline: "ed. M. Reyes · 248pp, clothbound",
      price: 45,
      member: 38,
      rating: 4.9,
      reviews: 86,
      art: ["#3f6f5e", "#8fae9c", "#d7e3d6"],
      variants: [
        { name: "Jade", c: "#3f6f5e" },
        { name: "Bone", c: "#ece7da" }
      ]
    },
    {
      id: "TT-1190",
      tag: "Canvas tote",
      title: "Salviati Map Tote",
      byline: "Heavyweight cotton · 38×42cm",
      price: 24,
      member: 20,
      rating: 4.6,
      reviews: 203,
      art: ["#caa15a", "#efe2c2", "#5e4a2a"],
      variants: [
        { name: "Ochre", c: "#caa15a" },
        { name: "Charcoal", c: "#34322e" },
        { name: "Natural", c: "#e9e2cf" }
      ]
    },
    {
      id: "PR-0533",
      tag: "Limited print",
      title: "Réquard, Light Study II",
      byline: "after C. Réquard, 1908 · Giclée, 40×40cm",
      price: 54,
      member: 46,
      rating: 4.7,
      reviews: 67,
      art: ["#b4493a", "#e7b38a", "#f3ecdd"],
      variants: [
        { name: "Vermilion", c: "#b4493a" },
        { name: "Cream", c: "#f3ecdd" }
      ]
    },
    {
      id: "BK-2318",
      tag: "Exhibition catalogue",
      title: "Aubin: Bronze & Air",
      byline: "Arden Museum Press · 176pp",
      price: 39,
      member: 33,
      rating: 4.5,
      reviews: 41,
      art: ["#5a534a", "#9a8f7e", "#c9bfa8"],
      variants: [
        { name: "Patina", c: "#6b7a64" },
        { name: "Bronze", c: "#8a6a38" }
      ]
    },
    {
      id: "OB-0902",
      tag: "Enamel pin",
      title: "Cole Garden Pin",
      byline: "Hard enamel · 28mm, gold finish",
      price: 14,
      member: 12,
      rating: 4.9,
      reviews: 318,
      art: ["#3f7d56", "#a98140", "#f3ecdd"],
      variants: [
        { name: "Garden", c: "#3f7d56" },
        { name: "Gold", c: "#a98140" }
      ]
    }
  ];

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function artGradient(p) {
    var a = p.art;
    return (
      "background:" +
      "radial-gradient(120% 90% at 22% 18%, " +
      a[2] +
      " 0%, transparent 46%)," +
      "linear-gradient(150deg, " +
      a[0] +
      " 0%, " +
      a[1] +
      " 100%);"
    );
  }

  function starRow(r) {
    var full = Math.round(r);
    var s = "";
    for (var i = 0; i < 5; i++) s += i < full ? "★" : "☆";
    return s;
  }

  /* ---------- toast ---------- */
  var host = document.getElementById("toastHost");
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = msg;
    host.appendChild(t);
    requestAnimationFrame(function () {
      t.classList.add("in");
    });
    setTimeout(function () {
      t.classList.remove("in");
      setTimeout(function () {
        t.remove();
      }, 280);
    }, 2200);
  }

  /* ---------- render ---------- */
  var grid = document.getElementById("grid");

  PRODUCTS.forEach(function (p) {
    var li = document.createElement("li");
    li.className = "card";
    li.dataset.id = p.id;

    var swatches = p.variants
      .map(function (v, i) {
        return (
          '<button class="swatch" type="button" data-c="' +
          v.c +
          '" data-name="' +
          esc(v.name) +
          '" aria-pressed="' +
          (i === 0 ? "true" : "false") +
          '" aria-label="Colour ' +
          esc(v.name) +
          '" style="background:' +
          v.c +
          '"></button>'
        );
      })
      .join("");

    li.innerHTML =
      '<div class="thumb">' +
      '<span class="tag">' +
      esc(p.tag) +
      "</span>" +
      '<div class="mat"><div class="art" style="' +
      artGradient(p) +
      '"></div></div>' +
      '<div class="quick"><button class="quick-btn" type="button" data-quick>Quick view</button></div>' +
      "</div>" +
      '<div class="body">' +
      '<div class="meta">' +
      '<span class="cat-no">' +
      esc(p.id) +
      "</span>" +
      '<span class="rating"><span class="stars" aria-hidden="true">' +
      starRow(p.rating) +
      '</span><span>' +
      p.rating.toFixed(1) +
      " (" +
      p.reviews +
      ")</span></span>" +
      "</div>" +
      '<h3 class="title">' +
      esc(p.title) +
      "</h3>" +
      '<p class="byline">' +
      esc(p.byline) +
      "</p>" +
      '<div class="prices">' +
      '<span class="price">$' +
      p.price +
      "</span>" +
      '<span class="member">◆ Member $' +
      p.member +
      "</span>" +
      "</div>" +
      '<div class="swatches">' +
      swatches +
      '<span class="swatch-name">' +
      esc(p.variants[0].name) +
      "</span></div>" +
      '<div class="controls">' +
      '<div class="stepper" role="group" aria-label="Quantity">' +
      '<button class="step" type="button" data-step="-1" aria-label="Decrease quantity" disabled>−</button>' +
      '<span class="qty" aria-live="polite">1</span>' +
      '<button class="step" type="button" data-step="1" aria-label="Increase quantity">+</button>' +
      "</div>" +
      '<button class="add" type="button" data-add>Add to bag</button>' +
      "</div>" +
      "</div>";

    grid.appendChild(li);
  });

  /* ---------- cart count ---------- */
  var count = 0;
  var countEl = document.getElementById("cartCount");
  function addToCart(n) {
    count += n;
    countEl.textContent = count;
    countEl.classList.remove("bump");
    void countEl.offsetWidth;
    countEl.classList.add("bump");
  }

  /* ---------- delegated interactions ---------- */
  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".card");
    if (!card) return;
    var id = card.dataset.id;
    var product = PRODUCTS.find(function (p) {
      return p.id === id;
    });

    // swatch
    var sw = e.target.closest(".swatch");
    if (sw) {
      card.querySelectorAll(".swatch").forEach(function (s) {
        s.setAttribute("aria-pressed", "false");
      });
      sw.setAttribute("aria-pressed", "true");
      card.querySelector(".swatch-name").textContent = sw.dataset.name;
      card.querySelector(".art").style.background = sw.dataset.c;
      return;
    }

    // stepper
    var step = e.target.closest(".step");
    if (step) {
      var qtyEl = card.querySelector(".qty");
      var q = parseInt(qtyEl.textContent, 10) + parseInt(step.dataset.step, 10);
      q = Math.max(1, Math.min(99, q));
      qtyEl.textContent = q;
      card.querySelector('[data-step="-1"]').disabled = q <= 1;
      return;
    }

    // quick view
    if (e.target.closest("[data-quick]")) {
      toast(
        "<b>" +
          esc(product.title) +
          "</b> · " +
          esc(product.byline) +
          " — $" +
          product.price
      );
      return;
    }

    // add to bag
    if (e.target.closest("[data-add]")) {
      var qty = parseInt(card.querySelector(".qty").textContent, 10);
      var variant = card.querySelector('.swatch[aria-pressed="true"]').dataset
        .name;
      addToCart(qty);
      toast(
        "Added <b>" +
          qty +
          "× " +
          esc(product.title) +
          "</b> (" +
          esc(variant) +
          ") to bag"
      );
    }
  });

  /* ---------- masthead bag ---------- */
  document.getElementById("cartBtn").addEventListener("click", function () {
    if (count === 0) {
      toast("Your bag is empty — add an edition to begin.");
    } else {
      toast("Bag: <b>" + count + "</b> item" + (count === 1 ? "" : "s") + " ready for checkout.");
    }
  });
})();
