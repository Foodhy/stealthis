/* ============================================================
   Lumen Wallet — landing interactions (vanilla JS, no libs)
   UI-only simulation: nothing here touches a real wallet,
   network, RPC, or chain. All data is mock/fictional.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  // any element with data-toast fires the toast on click
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) toast(t.getAttribute("data-toast"));
  });

  /* ---------- count-up stats (animate on first view) ---------- */
  function formatNum(value, decimals) {
    if (decimals) return value.toFixed(decimals);
    if (value >= 1e6) return (value / 1e6).toFixed(value % 1e6 === 0 ? 0 : 1) + "M";
    if (value >= 1e3) return Math.round(value).toLocaleString("en-US");
    return Math.round(value).toString();
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-countup")) || 0;
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = formatNum(target, decimals) + suffix;
      return;
    }
    el.classList.add("is-counting");
    var dur = 1500;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = formatNum(target * eased, decimals) + suffix;
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatNum(target, decimals) + suffix;
        el.classList.remove("is-counting");
      }
    }
    requestAnimationFrame(tick);
  }

  var stats = [].slice.call(document.querySelectorAll("[data-countup]"));
  if ("IntersectionObserver" in window && stats.length) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          countUp(en.target);
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(function (s) { io.observe(s); });
  } else {
    stats.forEach(countUp);
  }

  /* ---------- phone screen carousel ---------- */
  var phone = document.getElementById("phone");
  if (phone) {
    var screens = [].slice.call(phone.querySelectorAll(".screen"));
    var dots = [].slice.call(phone.querySelectorAll(".dot[data-go]"));
    var current = 0;
    var autoTimer;

    function showScreen(i, userInitiated) {
      current = (i + screens.length) % screens.length;
      screens.forEach(function (s, idx) {
        s.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (d, idx) {
        var on = idx === current;
        d.classList.toggle("is-active", on);
        d.setAttribute("aria-selected", on ? "true" : "false");
      });
      if (userInitiated) restartAuto();
    }

    function nextScreen() { showScreen(current + 1); }

    function startAuto() {
      if (reduceMotion) return;
      autoTimer = setInterval(nextScreen, 3600);
    }
    function restartAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        showScreen(parseInt(d.getAttribute("data-go"), 10), true);
      });
    });

    // pause cycling while hovering / focusing the phone
    phone.addEventListener("mouseenter", function () { clearInterval(autoTimer); });
    phone.addEventListener("mouseleave", startAuto);
    phone.addEventListener("focusin", function () { clearInterval(autoTimer); });
    phone.addEventListener("focusout", startAuto);

    // simulated CTA confirmations inside the phone
    phone.addEventListener("click", function (e) {
      var cta = e.target.closest(".screen-cta");
      if (cta) toast("Review screen (demo) — you'd confirm & sign locally. Nothing is broadcast.");
    });

    showScreen(0);
    startAuto();
  }

  /* ---------- testimonial slider ---------- */
  var track = document.getElementById("reviewsTrack");
  if (track) {
    var reviews = [].slice.call(track.querySelectorAll(".review"));
    var dotsWrap = document.getElementById("reviewsDots");
    var prevBtn = document.getElementById("revPrev");
    var nextBtn = document.getElementById("revNext");
    var rIndex = 0;
    var rTimer;

    // build dots
    reviews.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dot" + (i === 0 ? " is-active" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Testimonial " + (i + 1));
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.addEventListener("click", function () { showReview(i, true); });
      dotsWrap.appendChild(b);
    });
    var rDots = [].slice.call(dotsWrap.querySelectorAll(".dot"));

    function showReview(i, userInitiated) {
      rIndex = (i + reviews.length) % reviews.length;
      reviews.forEach(function (r, idx) { r.classList.toggle("is-active", idx === rIndex); });
      rDots.forEach(function (d, idx) {
        var on = idx === rIndex;
        d.classList.toggle("is-active", on);
        d.setAttribute("aria-selected", on ? "true" : "false");
      });
      if (userInitiated) restartReviews();
    }

    function startReviews() {
      if (reduceMotion) return;
      rTimer = setInterval(function () { showReview(rIndex + 1); }, 5200);
    }
    function restartReviews() { clearInterval(rTimer); startReviews(); }

    if (prevBtn) prevBtn.addEventListener("click", function () { showReview(rIndex - 1, true); });
    if (nextBtn) nextBtn.addEventListener("click", function () { showReview(rIndex + 1, true); });

    track.parentElement.addEventListener("mouseenter", function () { clearInterval(rTimer); });
    track.parentElement.addEventListener("mouseleave", startReviews);

    startReviews();
  }
})();
