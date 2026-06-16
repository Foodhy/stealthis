/* ============================================================
   Hollow Reign — AAA cinematic landing
   Vanilla JS: scroll-reveal, ember particle canvas (parallax),
   trailer lightbox, hover "ignite", boss strip, wishlist, toasts.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Toast ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = $("#siteNav");
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-revealed"); });
  }

  /* ---------- Threat bars fill when boss strip enters ---------- */
  var bossWrap = $(".boss-strip-wrap");
  if (bossWrap) {
    if ("IntersectionObserver" in window) {
      var bio = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            $$(".boss-card").forEach(function (c) { c.classList.add("is-revealed"); });
            obs.disconnect();
          }
        });
      }, { threshold: 0.25 });
      bio.observe(bossWrap);
    } else {
      $$(".boss-card").forEach(function (c) { c.classList.add("is-revealed"); });
    }
  }

  /* ---------- Hover "ignite" — radial ember follows pointer ---------- */
  $$(".ignite").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Boss strip arrows ---------- */
  var strip = $("#bossStrip");
  function scrollStrip(dir) {
    if (!strip) return;
    var card = strip.querySelector(".boss-card");
    var step = card ? card.getBoundingClientRect().width + 20 : 280;
    strip.scrollBy({ left: dir * step, behavior: prefersReduced ? "auto" : "smooth" });
  }
  var prevBtn = $("#bossPrev");
  var nextBtn = $("#bossNext");
  if (prevBtn) prevBtn.addEventListener("click", function () { scrollStrip(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { scrollStrip(1); });

  /* ---------- Wishlist toggle (synced across both buttons) ---------- */
  var wished = false;
  var wishBtns = [$("#navWishlist"), $("#heroWishlist")].filter(Boolean);
  function syncWishlist() {
    wishBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", String(wished));
      var label = b.querySelector(".wish-icon") ? b : b;
      // update text node after the icon
      var text = wished ? "Wishlisted" : (b.id === "navWishlist" ? "Wishlist" : "Wishlist Now");
      var icon = b.querySelector(".wish-icon");
      b.textContent = "";
      if (icon) b.appendChild(icon);
      b.appendChild(document.createTextNode(" " + text));
    });
  }
  wishBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      wished = !wished;
      syncWishlist();
      toast(wished ? "Added to your wishlist — you will be notified at launch." : "Removed from wishlist.");
    });
  });

  /* ---------- Edition pre-order ---------- */
  $$("[data-edition]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Pre-order reserved: " + btn.getAttribute("data-edition") + " Edition (demo — no payment taken).");
    });
  });

  /* ---------- Generic data-toast links ---------- */
  $$("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Trailer lightbox ---------- */
  var lightbox = $("#trailerLightbox");
  var openTrailerBtn = $("#trailerBtn");
  var closeBtn = $("#lightboxClose");
  var captionEl = $("#trailerCaption");
  var progressEl = $("#trailerProgress");
  var lastFocused = null;
  var trailerTimer = null;
  var captionIdx = 0;

  var captions = [
    "In the beginning, there was a crown…",
    "It promised an end to dying.",
    "The kingdom believed. The kingdom fell.",
    "Now the throne sits hollow — and hungry.",
    "Take up the ember. Take back the Reign.",
    "HOLLOW REIGN — Winter 2027"
  ];

  function openTrailer() {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
    runTrailer();
    document.addEventListener("keydown", onKeydown);
  }

  function closeTrailer() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    clearInterval(trailerTimer);
    if (progressEl) progressEl.style.width = "0%";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function runTrailer() {
    captionIdx = 0;
    var total = captions.length;
    var perStep = prefersReduced ? 1200 : 2400;
    function step() {
      if (captionEl) {
        captionEl.style.animation = "none";
        // force reflow to restart caption fade animation
        void captionEl.offsetWidth;
        captionEl.style.animation = "";
        captionEl.textContent = captions[captionIdx];
      }
      if (progressEl) {
        progressEl.style.width = Math.round(((captionIdx + 1) / total) * 100) + "%";
      }
      captionIdx++;
      if (captionIdx >= total) {
        clearInterval(trailerTimer);
      }
    }
    step();
    clearInterval(trailerTimer);
    trailerTimer = setInterval(step, perStep);
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeTrailer();
  }

  if (openTrailerBtn) openTrailerBtn.addEventListener("click", openTrailer);
  if (closeBtn) closeBtn.addEventListener("click", closeTrailer);
  $$("[data-close]", lightbox || document).forEach(function (el) {
    el.addEventListener("click", closeTrailer);
  });

  /* ---------- Ember particle canvas (hero) ---------- */
  var canvas = $("#emberCanvas");
  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext("2d");
    var hero = $(".hero");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var embers = [];
    var pointerX = 0.5; // 0..1, for parallax
    var rafId = null;
    var visible = true;

    function resize() {
      if (!hero) return;
      var rect = hero.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function makeEmber(initial) {
      var depth = Math.random(); // 0 far .. 1 near
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : H + Math.random() * 40,
        r: 0.6 + depth * 2.2,
        vy: -(0.25 + depth * 0.9),
        sway: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        depth: depth,
        life: 0,
        maxLife: 240 + Math.random() * 260,
        a: 0.25 + Math.random() * 0.6
      };
    }

    function seed() {
      var count = Math.max(28, Math.min(90, Math.round(W / 14)));
      embers = [];
      for (var i = 0; i < count; i++) embers.push(makeEmber(true));
    }

    function tick() {
      if (!visible) { rafId = null; return; }
      ctx.clearRect(0, 0, W, H);
      var parallax = (pointerX - 0.5) * 30;
      for (var i = 0; i < embers.length; i++) {
        var e = embers[i];
        e.life++;
        e.phase += 0.02;
        e.y += e.vy;
        e.x += Math.sin(e.phase) * e.sway * 0.3;
        var px = e.x + parallax * e.depth;
        var fade = Math.min(1, e.life / 40) * Math.max(0, 1 - e.life / e.maxLife);
        var alpha = e.a * fade;

        var g = ctx.createRadialGradient(px, e.y, 0, px, e.y, e.r * 3.5);
        g.addColorStop(0, "rgba(255,196,120," + alpha + ")");
        g.addColorStop(0.4, "rgba(255,106,26," + (alpha * 0.8) + ")");
        g.addColorStop(1, "rgba(192,57,43,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, e.y, e.r * 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (e.y < -20 || e.life > e.maxLife) {
          embers[i] = makeEmber(false);
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", function (e) {
      pointerX = e.clientX / window.innerWidth;
    }, { passive: true });

    // Pause when hero scrolled out of view
    if ("IntersectionObserver" in window && hero) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !rafId) tick();
      }, { threshold: 0.02 }).observe(hero);
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 160);
    });

    resize();
    tick();
  }

  /* ---------- Smooth anchor scrolling for in-page nav ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      }
    });
  });
})();
