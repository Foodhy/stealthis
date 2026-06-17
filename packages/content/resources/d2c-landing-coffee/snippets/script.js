/* ===========================================================
   Driftwood Roasters — landing interactions (vanilla JS)
   =========================================================== */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2400);
  }

  /* ---------- sticky nav shadow ---------- */
  var nav = $(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = $("#navToggle");
  var menu = $("#mobileMenu");
  function closeMenu() {
    if (!menu) return;
    menu.hidden = true;
    if (toggle) { toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Open menu"); }
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      menu.hidden = open;
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* ---------- smooth scroll (with nav offset) ---------- */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ---------- scroll reveal ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- roast selector ---------- */
  var ROASTS = [
    { level: "Light", price: 19,
      desc: "Stopped just after first crack. Tea-like body, vivid acidity, and a wash of citrus blossom on the finish.",
      hex: "#7c5230", body: 28, acid: 92, sweet: 55 },
    { level: "Medium", price: 19,
      desc: "Balanced and rounded. Caramelized sugars meet a soft stone-fruit acidity — the everyday crowd-pleaser.",
      hex: "#5e3a1f", body: 58, acid: 64, sweet: 80 },
    { level: "Med-Dark", price: 20,
      desc: "Developed deeper into second crack. Cocoa, toasted hazelnut and a syrupy weight built for milk drinks.",
      hex: "#43271459", body: 80, acid: 38, sweet: 70 },
    { level: "Dark", price: 20,
      desc: "Bold and molten. Dark chocolate, smoke and a bittersweet finish — espresso that stands its ground.",
      hex: "#2c1810", body: 95, acid: 20, sweet: 48 }
  ];

  var slider = $("#roastSlider");
  var bean = $("#roastBean");
  var levelEl = $("#roastLevel");
  var descEl = $("#roastDesc");
  var addBtn = $("#roastAdd");
  var mBody = $("#meterBody"), mAcid = $("#meterAcid"), mSweet = $("#meterSweet");

  function renderRoast(i) {
    var r = ROASTS[i];
    if (!r) return;
    if (bean) bean.style.background = r.hex;
    if (levelEl) levelEl.textContent = r.level;
    if (descEl) descEl.textContent = r.desc;
    if (mBody) mBody.style.width = r.body + "%";
    if (mAcid) mAcid.style.width = r.acid + "%";
    if (mSweet) mSweet.style.width = r.sweet + "%";
    if (addBtn) {
      addBtn.textContent = "Add this roast — $" + r.price;
      addBtn.setAttribute("data-cart-add", "Yirgacheffe — " + r.level);
      addBtn.setAttribute("data-price", r.price);
    }
  }
  if (slider) {
    slider.addEventListener("input", function () { renderRoast(parseInt(slider.value, 10)); });
    renderRoast(0);
  }

  /* ---------- pricing toggle ---------- */
  var optOnce = $("#optOnce");
  var optSub = $("#optSub");
  var amounts = $$(".plan__amt");
  function setMode(sub) {
    amounts.forEach(function (el) {
      var v = sub ? el.getAttribute("data-sub") : el.getAttribute("data-once");
      if (v) el.textContent = "$" + v;
    });
    if (optOnce) { optOnce.classList.toggle("is-active", !sub); optOnce.setAttribute("aria-pressed", String(!sub)); }
    if (optSub)  { optSub.classList.toggle("is-active", sub);   optSub.setAttribute("aria-pressed", String(sub)); }
  }
  if (optOnce) optOnce.addEventListener("click", function () { setMode(false); });
  if (optSub)  optSub.addEventListener("click", function () { setMode(true); toast("Subscribers save 20% — nice."); });

  /* ---------- FAQ accordion ---------- */
  $$(".acc").forEach(function (acc) {
    var q = $(".acc__q", acc);
    var a = $(".acc__a", acc);
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = acc.classList.contains("is-open");
      $$(".acc").forEach(function (other) {
        if (other !== acc) {
          other.classList.remove("is-open");
          var oa = $(".acc__a", other), oq = $(".acc__q", other);
          if (oa) oa.style.maxHeight = null;
          if (oq) oq.setAttribute("aria-expanded", "false");
        }
      });
      acc.classList.toggle("is-open", !open);
      q.setAttribute("aria-expanded", String(!open));
      a.style.maxHeight = open ? null : a.scrollHeight + "px";
    });
  });

  /* ---------- cart ---------- */
  var cart = [];
  var navCount = $("#navCartCount");
  var navCountWrap = $(".cart-count");
  var stickyCart = $("#stickyCart");
  var stickyCount = $("#stickyCount");
  var stickyLast = $("#stickyLast");
  var stickyTotal = $("#stickyTotal");

  function priceFor(btn, name) {
    var p = btn && btn.getAttribute("data-price");
    if (p) return parseInt(p, 10);
    // infer from copy/known products
    var map = { "The Daily": 19, "Explorer": 36, "Roastery": 64, "Sampler": 24, "Yirgacheffe": 19 };
    for (var key in map) { if (name.indexOf(key) > -1) return map[key]; }
    return 19;
  }

  function renderCart() {
    var count = cart.length;
    var total = cart.reduce(function (s, it) { return s + it.price; }, 0);
    if (navCount) navCount.textContent = String(count);
    if (navCountWrap) navCountWrap.classList.toggle("is-on", count > 0);
    if (stickyCount) stickyCount.textContent = count + (count === 1 ? " item" : " items");
    if (stickyTotal) stickyTotal.textContent = "$" + total;
    if (stickyLast && cart.length) stickyLast.textContent = cart[cart.length - 1].name;
    if (stickyCart) {
      stickyCart.hidden = count === 0;
      requestAnimationFrame(function () { stickyCart.classList.toggle("is-on", count > 0); });
    }
  }

  function addToCart(name, btn) {
    var price = priceFor(btn, name);
    cart.push({ name: name, price: price });
    renderCart();
    toast("Added “" + name + "” to cart");
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cart-add]");
    if (!btn) return;
    addToCart(btn.getAttribute("data-cart-add"), btn);
  });

  var cartBtn = $("#cartBtn");
  if (cartBtn) cartBtn.addEventListener("click", function () {
    if (!cart.length) { toast("Your cart is empty — pick a roast above."); return; }
    toast(cart.length + " bag" + (cart.length > 1 ? "s" : "") + " ready · $" + cart.reduce(function (s, i) { return s + i.price; }, 0));
  });

  var checkoutBtn = $("#checkoutBtn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", function () {
    toast("Demo only — no real checkout. Thanks for browsing!");
  });

  /* ---------- year (if any) ---------- */
  // keep footer static; nothing else needed.
})();
