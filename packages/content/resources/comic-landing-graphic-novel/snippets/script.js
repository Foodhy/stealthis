(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll(".reveal")
  );
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Quote rotator ---------- */
  var quotes = [
    {
      text: "“A hushed, devastating book — the silences land harder than any battle.”",
      by: "The Paper Lantern Review",
    },
    {
      text: "“Vale paints distance like weather. You can feel the years between the letters.”",
      by: "Margin & Ink Quarterly",
    },
    {
      text: "“The most beautiful war comic in a decade — and barely a war comic at all.”",
      by: "Dispatch from the Drawn",
    },
    {
      text: "“A cartography of grief. I read the last spread three times and still wept.”",
      by: "Folio & Frame",
    },
  ];
  var quoteText = document.querySelector("[data-quote]");
  var quoteCite = document.querySelector("[data-cite]");
  var quoteDots = Array.prototype.slice.call(
    document.querySelectorAll(".quote__dot")
  );
  var qIndex = 0;
  var qTimer = null;

  function renderQuote(i, animate) {
    qIndex = (i + quotes.length) % quotes.length;
    var q = quotes[qIndex];
    quoteDots.forEach(function (dot, idx) {
      var active = idx === qIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (!quoteText) return;
    if (animate && !prefersReduced) {
      quoteText.classList.add("is-fading");
      if (quoteCite) quoteCite.classList.add("is-fading");
      window.setTimeout(function () {
        quoteText.textContent = q.text;
        if (quoteCite) quoteCite.textContent = q.by;
        quoteText.classList.remove("is-fading");
        if (quoteCite) quoteCite.classList.remove("is-fading");
      }, 320);
    } else {
      quoteText.textContent = q.text;
      if (quoteCite) quoteCite.textContent = q.by;
    }
  }

  function startQuoteAuto() {
    if (prefersReduced) return;
    stopQuoteAuto();
    qTimer = window.setInterval(function () {
      renderQuote(qIndex + 1, true);
    }, 6000);
  }
  function stopQuoteAuto() {
    window.clearInterval(qTimer);
  }

  quoteDots.forEach(function (dot, idx) {
    dot.addEventListener("click", function () {
      renderQuote(idx, true);
      startQuoteAuto();
    });
  });
  if (quotes.length) {
    renderQuote(0, false);
    startQuoteAuto();
  }

  /* ---------- Spread preview crossfade ---------- */
  var spreadCaps = [
    "Spread 1 — “The first letter arrives folded in a contour line.”",
    "Spread 2 — “Ash over the northern field; the ink will not dry.”",
    "Spread 3 — “The border, at last, drawn between two names.”",
  ];
  var pages = Array.prototype.slice.call(
    document.querySelectorAll(".spread__page")
  );
  var thumbs = Array.prototype.slice.call(document.querySelectorAll(".thumb"));
  var capEl = document.querySelector("[data-spread-cap]");
  var sIndex = 0;

  function goSpread(i) {
    sIndex = (i + pages.length) % pages.length;
    pages.forEach(function (p, idx) {
      p.classList.toggle("is-active", idx === sIndex);
    });
    thumbs.forEach(function (t, idx) {
      var active = idx === sIndex;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (capEl && spreadCaps[sIndex]) capEl.textContent = spreadCaps[sIndex];
  }

  thumbs.forEach(function (t) {
    t.addEventListener("click", function () {
      var i = parseInt(t.getAttribute("data-go"), 10) || 0;
      goSpread(i);
    });
  });

  /* arrow-key navigation across the thumb tablist */
  var thumbList = document.querySelector(".inside__thumbs");
  if (thumbList) {
    thumbList.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goSpread(sIndex + 1);
        if (thumbs[sIndex]) thumbs[sIndex].focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goSpread(sIndex - 1);
        if (thumbs[sIndex]) thumbs[sIndex].focus();
      }
    });
  }

  /* auto-advance the spread gently */
  if (!prefersReduced && pages.length) {
    window.setInterval(function () {
      goSpread(sIndex + 1);
    }, 8000);
  }

  /* ---------- Parallax (hero scene + spread) ---------- */
  var parallaxEls = Array.prototype.slice.call(
    document.querySelectorAll(".parallax")
  );
  var heroScene = document.querySelector(".hero__scene");
  var ticking = false;

  function onScroll() {
    if (ticking || prefersReduced) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (heroScene) {
        heroScene.style.transform = "translateY(" + y * 0.18 + "px)";
      }
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2 - window.innerHeight / 2;
        var amt = parseFloat(el.getAttribute("data-parallax")) || 0.05;
        el.style.transform = "translateY(" + center * -amt + "px)";
      });
      ticking = false;
    });
  }
  if (!prefersReduced) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Buy / wishlist actions ---------- */
  var buyBtn = document.querySelector("[data-buy]");
  var wishBtn = document.querySelector("[data-wish]");
  var inCart = false;
  var wished = false;

  if (buyBtn) {
    buyBtn.addEventListener("click", function () {
      inCart = !inCart;
      buyBtn.textContent = inCart ? "✓ In cart" : "Add to cart";
      toast(
        inCart
          ? "Added “The Ashfall Letters” to your cart."
          : "Removed from cart."
      );
    });
  }
  if (wishBtn) {
    wishBtn.addEventListener("click", function () {
      wished = !wished;
      wishBtn.textContent = wished ? "♥ Wishlisted" : "Add to wishlist";
      toast(wished ? "Saved to your wishlist." : "Removed from wishlist.");
    });
  }
})();
