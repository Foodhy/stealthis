/* RoboBug — Kit Product Landing interactions (vanilla JS) */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Cart ---------- */
  var cartCount = 0;
  var countEl = document.getElementById("cartCount");
  var navCartBtn = document.getElementById("navCartBtn");
  var miniCountEl = document.getElementById("minicartCount");

  var TIER_NAMES = {
    starter: "RoboBug Starter",
    pro: "RoboBug Pro",
    classroom: "Classroom Pack (10 kits)"
  };

  function updateCartUI() {
    countEl.textContent = String(cartCount);
    miniCountEl.textContent = "CART: " + cartCount;
    navCartBtn.setAttribute(
      "aria-label",
      "Cart, " + cartCount + " item" + (cartCount === 1 ? "" : "s")
    );
    countEl.classList.add("bump");
    setTimeout(function () {
      countEl.classList.remove("bump");
    }, 200);
  }

  function addToCart(tier, price) {
    cartCount += 1;
    updateCartUI();
    toast("ADDED: " + (TIER_NAMES[tier] || "RoboBug") + " — $" + price);
  }

  document.querySelectorAll("[data-tier]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      addToCart(btn.dataset.tier, btn.dataset.price);
    });
  });

  navCartBtn.addEventListener("click", function () {
    if (cartCount === 0) {
      toast("CART EMPTY — GRAB A ROBOBUG!");
    } else {
      toast("CHECKOUT: " + cartCount + " ITEM" + (cartCount === 1 ? "" : "S") + " (DEMO)");
    }
  });

  /* ---------- Step carousel ---------- */
  var track = document.getElementById("carouselTrack");
  var slides = track.children;
  var dotsWrap = document.getElementById("carDots");
  var prevBtn = document.getElementById("prevSlide");
  var nextBtn = document.getElementById("nextSlide");
  var current = 0;
  var total = slides.length;

  for (var i = 0; i < total; i++) {
    var dot = document.createElement("button");
    dot.className = "car-dot";
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Go to step " + (i + 1));
    dot.dataset.index = String(i);
    dot.addEventListener("click", function () {
      goTo(parseInt(this.dataset.index, 10));
    });
    dotsWrap.appendChild(dot);
  }

  var dots = dotsWrap.children;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    for (var j = 0; j < total; j++) {
      dots[j].setAttribute("aria-selected", j === current ? "true" : "false");
    }
  }

  prevBtn.addEventListener("click", function () { goTo(current - 1); });
  nextBtn.addEventListener("click", function () { goTo(current + 1); });

  // Keyboard nav on the carousel region
  document.getElementById("stepCarousel").addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { goTo(current - 1); }
    if (e.key === "ArrowRight") { goTo(current + 1); }
  });

  goTo(0);

  /* ---------- Sticky mini cart after hero ---------- */
  var minicart = document.getElementById("minicart");
  var hero = document.getElementById("top");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        var heroVisible = entries[0].isIntersecting;
        minicart.classList.toggle("visible", !heroVisible);
        minicart.setAttribute("aria-hidden", heroVisible ? "true" : "false");
      },
      { threshold: 0.05 }
    );
    io.observe(hero);
  } else {
    window.addEventListener("scroll", function () {
      var past = window.scrollY > hero.offsetHeight;
      minicart.classList.toggle("visible", past);
      minicart.setAttribute("aria-hidden", past ? "false" : "true");
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var isOpen = btn.getAttribute("aria-expanded") === "true";

      // close others
      document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        if (openItem !== item) {
          var openBtn = openItem.querySelector(".faq-q");
          var openPanel = document.getElementById(openBtn.getAttribute("aria-controls"));
          openBtn.setAttribute("aria-expanded", "false");
          openPanel.hidden = true;
          openItem.classList.remove("open");
        }
      });

      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      panel.hidden = isOpen;
      item.classList.toggle("open", !isOpen);
    });
  });

  /* ---------- Smooth scroll for anchor nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
