/* ===== Maison Écru — D2C Fashion Landing ===== */
(function () {
  "use strict";

  /* ---- Toast helper ---- */
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

  /* ---- Mobile menu ---- */
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Nav shadow on scroll ---- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---- Product configurator (color + size + price) ---- */
  var colors = [
    { id: "ecru", name: "Écru", hex: "#d8cbb3", price: 420 },
    { id: "charcoal", name: "Charcoal", hex: "#36332e", price: 420 },
    { id: "rust", name: "Rust", hex: "#b3411f", price: 440 },
    { id: "sage", name: "Sage", hex: "#97a07f", price: 420 }
  ];
  var sizes = ["XS", "S", "M", "L", "XL"];
  var soldOut = { rust: ["XS"], sage: ["XL"] };

  var state = { color: colors[0], size: "M" };

  var photo = document.getElementById("productPhoto");
  var thumbs = document.getElementById("productThumbs");
  var colorSwatches = document.getElementById("colorSwatches");
  var sizeOptions = document.getElementById("sizeOptions");
  var colorNameEl = document.getElementById("colorName");
  var sizeNameEl = document.getElementById("sizeName");
  var priceValEl = document.getElementById("productPriceVal");
  var addPriceEl = document.getElementById("addPrice");
  var stickyMeta = document.getElementById("stickyMeta");

  function fmt(n) {
    return "€" + n;
  }

  function renderSwatches() {
    if (!colorSwatches) return;
    colorSwatches.innerHTML = "";
    thumbs.innerHTML = "";
    colors.forEach(function (c) {
      var sw = document.createElement("button");
      sw.className = "swatch";
      sw.style.background = c.hex;
      sw.setAttribute("role", "radio");
      sw.setAttribute("aria-label", c.name);
      sw.setAttribute("aria-checked", String(c.id === state.color.id));
      sw.addEventListener("click", function () {
        setColor(c);
      });
      colorSwatches.appendChild(sw);

      var th = document.createElement("button");
      th.className = "product-thumb";
      th.style.background = "linear-gradient(150deg," + c.hex + ", rgba(0,0,0,0.25))";
      th.setAttribute("aria-label", "View " + c.name);
      th.setAttribute("aria-current", String(c.id === state.color.id));
      th.addEventListener("click", function () {
        setColor(c);
      });
      thumbs.appendChild(th);
    });
  }

  function renderSizes() {
    if (!sizeOptions) return;
    sizeOptions.innerHTML = "";
    var out = soldOut[state.color.id] || [];
    sizes.forEach(function (s) {
      var btn = document.createElement("button");
      btn.className = "size";
      btn.textContent = s;
      btn.setAttribute("role", "radio");
      var isOut = out.indexOf(s) !== -1;
      if (isOut) {
        btn.disabled = true;
        btn.setAttribute("aria-disabled", "true");
        btn.title = "Sold out in " + state.color.name;
      }
      btn.setAttribute("aria-checked", String(s === state.size && !isOut));
      btn.addEventListener("click", function () {
        if (isOut) return;
        state.size = s;
        syncUI();
      });
      sizeOptions.appendChild(btn);
    });
  }

  function setColor(c) {
    state.color = c;
    // If current size is sold out in new color, bump to first available
    var out = soldOut[c.id] || [];
    if (out.indexOf(state.size) !== -1) {
      var avail = sizes.filter(function (s) {
        return out.indexOf(s) === -1;
      });
      state.size = avail[0] || state.size;
    }
    if (photo) photo.setAttribute("data-color", c.id);
    syncUI();
  }

  function syncUI() {
    if (colorNameEl) colorNameEl.textContent = state.color.name;
    if (sizeNameEl) sizeNameEl.textContent = state.size;
    if (priceValEl) priceValEl.textContent = fmt(state.color.price);
    if (addPriceEl) addPriceEl.textContent = fmt(state.color.price);
    if (stickyMeta)
      stickyMeta.textContent =
        state.color.name + " · " + state.size + " · " + fmt(state.color.price);
    // re-mark checked states without full re-render of color
    if (colorSwatches) {
      colorSwatches.querySelectorAll(".swatch").forEach(function (sw, i) {
        sw.setAttribute("aria-checked", String(colors[i].id === state.color.id));
      });
      thumbs.querySelectorAll(".product-thumb").forEach(function (th, i) {
        th.setAttribute("aria-current", String(colors[i].id === state.color.id));
      });
    }
    renderSizes();
  }

  renderSwatches();
  renderSizes();
  syncUI();

  /* ---- Add to cart ---- */
  function addToCart() {
    toast(
      "Added — Écru Coat · " +
        state.color.name +
        " · " +
        state.size +
        " (" +
        fmt(state.color.price) +
        ")"
    );
  }
  var addBtn = document.getElementById("addBtn");
  var stickyAdd = document.getElementById("stickyAdd");
  if (addBtn) addBtn.addEventListener("click", addToCart);
  if (stickyAdd) stickyAdd.addEventListener("click", addToCart);

  var sizeGuideBtn = document.getElementById("sizeGuideBtn");
  if (sizeGuideBtn)
    sizeGuideBtn.addEventListener("click", function () {
      toast("Size guide: M fits 96–101cm chest. Runs true to size.");
    });

  /* ---- Plan CTAs ---- */
  document.querySelectorAll(".plan-cta").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".plan");
      var name = card ? card.querySelector("h3").textContent : "Bundle";
      toast("Added “" + name + "” to your cart.");
    });
  });

  /* ---- Sticky add-to-cart visibility ---- */
  var stickyCart = document.getElementById("stickyCart");
  var product = document.getElementById("product");
  var pricing = document.getElementById("pricing");
  if (stickyCart && product && "IntersectionObserver" in window) {
    var shownBelow = false; // past product hero
    var pastPricing = false;
    var ioProduct = new IntersectionObserver(
      function (entries) {
        shownBelow = entries[0].boundingClientRect.top < 0 && !entries[0].isIntersecting;
        updateSticky();
      },
      { threshold: 0 }
    );
    ioProduct.observe(product);
    if (pricing) {
      var ioPricing = new IntersectionObserver(
        function (entries) {
          // hide once user has scrolled past pricing into footer area
          pastPricing = entries[0].boundingClientRect.top < 0 && !entries[0].isIntersecting;
          updateSticky();
        },
        { threshold: 0 }
      );
      ioPricing.observe(pricing);
    }
    function updateSticky() {
      var show = shownBelow && !pastPricing;
      stickyCart.classList.toggle("show", show);
      stickyCart.setAttribute("aria-hidden", String(!show));
    }
  }

  /* ---- Waitlist form ---- */
  var form = document.getElementById("waitlistForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("email");
      var val = (input.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        input.classList.add("invalid");
        input.focus();
        toast("Please enter a valid email.");
        return;
      }
      input.classList.remove("invalid");
      input.value = "";
      toast("You're on the list — Drop 02 access incoming.");
    });
    document.getElementById("email").addEventListener("input", function () {
      this.classList.remove("invalid");
    });
  }

  /* ---- Dismiss announcement on its own click is not needed; keep simple ---- */
})();
