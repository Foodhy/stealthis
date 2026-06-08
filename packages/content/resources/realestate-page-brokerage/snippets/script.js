/* Harbor & Vale — Brokerage Landing
 * Vanilla JS: toast helper, animated stats, listings carousel, favourites,
 * search + CTA handlers. No external libraries.
 */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastHost = document.getElementById("toast-host");
  function toast(msg, opts) {
    opts = opts || {};
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    var ic = document.createElement("span");
    ic.className = "t-ic";
    ic.setAttribute("aria-hidden", "true");
    ic.textContent = opts.icon || "✓";
    var txt = document.createElement("span");
    txt.textContent = msg;
    el.appendChild(ic);
    el.appendChild(txt);
    toastHost.appendChild(el);
    // force reflow then animate in
    void el.offsetWidth;
    el.classList.add("is-in");
    var life = opts.duration || 3200;
    setTimeout(function () {
      el.classList.remove("is-in");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    }, life);
  }

  /* ---------- animated stat counters ---------- */
  function formatCount(value, decimals) {
    if (decimals > 0) return value.toFixed(decimals);
    return Math.round(value).toLocaleString("en-US");
  }

  function animateStat(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = target % 1 !== 0 ? 1 : 0;
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + formatCount(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + formatCount(target, decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  var statEls = Array.prototype.slice.call(document.querySelectorAll(".stat-num"));
  if (statEls.length) {
    if ("IntersectionObserver" in window) {
      var seen = new WeakSet();
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting && !seen.has(e.target)) {
              seen.add(e.target);
              animateStat(e.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      statEls.forEach(function (el) {
        io.observe(el);
      });
    } else {
      statEls.forEach(animateStat);
    }
  }

  /* ---------- listings carousel ---------- */
  var track = document.querySelector(".js-track");
  var prevBtn = document.querySelector(".js-prev");
  var nextBtn = document.querySelector(".js-next");
  var dotsHost = document.querySelector(".js-dots");

  if (track && prevBtn && nextBtn) {
    var slides = Array.prototype.slice.call(track.children);
    var page = 0;

    function perView() {
      var w = window.innerWidth;
      if (w <= 520) return 1;
      if (w <= 920) return 2;
      return 3;
    }
    function pageCount() {
      return Math.max(1, Math.ceil(slides.length / perView()));
    }

    function buildDots() {
      if (!dotsHost) return;
      dotsHost.innerHTML = "";
      var count = pageCount();
      for (var i = 0; i < count; i++) {
        var b = document.createElement("button");
        b.className = "dot-btn";
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Go to listing page " + (i + 1));
        (function (idx) {
          b.addEventListener("click", function () {
            goTo(idx);
          });
        })(i);
        dotsHost.appendChild(b);
      }
    }

    function update() {
      var pv = perView();
      var slide = slides[0];
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
      var slideW = slide.getBoundingClientRect().width;
      var step = (slideW + gap) * pv;
      var maxPage = pageCount() - 1;
      if (page > maxPage) page = maxPage;
      track.style.transform = "translateX(" + -(step * page) + "px)";

      prevBtn.disabled = page === 0;
      nextBtn.disabled = page === maxPage;

      if (dotsHost) {
        var dots = dotsHost.querySelectorAll(".dot-btn");
        dots.forEach(function (d, i) {
          d.classList.toggle("is-active", i === page);
          d.setAttribute("aria-selected", i === page ? "true" : "false");
        });
      }
    }

    function goTo(p) {
      var maxPage = pageCount() - 1;
      page = Math.max(0, Math.min(p, maxPage));
      update();
    }

    nextBtn.addEventListener("click", function () {
      goTo(page + 1);
    });
    prevBtn.addEventListener("click", function () {
      goTo(page - 1);
    });

    // keyboard arrows when carousel region focused/hovered
    document.querySelector(".carousel").setAttribute("tabindex", "0");
    document.querySelector(".carousel").addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(page + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(page - 1);
      }
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildDots();
        update();
      }, 120);
    });

    buildDots();
    update();
  }

  /* ---------- favourite (save) toggles ---------- */
  Array.prototype.slice.call(document.querySelectorAll(".js-fav")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var saved = btn.classList.toggle("is-saved");
      btn.setAttribute("aria-pressed", saved ? "true" : "false");
      btn.textContent = saved ? "♥" : "♡";
      var card = btn.closest(".listing");
      var title = card ? card.querySelector(".listing-title").textContent : "Listing";
      toast(saved ? "Saved " + title + " to your shortlist" : "Removed from shortlist", {
        icon: saved ? "♥" : "✕"
      });
    });
  });

  /* ---------- hero search ---------- */
  var searchForm = document.querySelector(".search");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var where = document.getElementById("q").value.trim();
      var place = where || "Aldermoor";
      toast("Searching " + place + " — 47 homes match your filters", { icon: "⌕" });
    });
    Array.prototype.slice.call(document.querySelectorAll(".search-hint .chip")).forEach(function (chip) {
      chip.addEventListener("click", function () {
        toast("Filter applied: " + chip.textContent, { icon: "✧" });
      });
    });
  }

  /* ---------- contact + CTA ---------- */
  Array.prototype.slice.call(document.querySelectorAll(".js-contact")).forEach(function (b) {
    b.addEventListener("click", function () {
      toast("An advisor will reach out within one business day.", { icon: "☎" });
    });
  });

  var ctaForm = document.querySelector(".js-cta-form");
  if (ctaForm) {
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = ctaForm.querySelector("input[type=email]").value.trim();
      if (!email) return;
      toast("Valuation request received for " + email, { icon: "✓" });
      ctaForm.reset();
    });
  }
})();
