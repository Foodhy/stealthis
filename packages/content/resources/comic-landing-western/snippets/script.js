(function () {
  "use strict";

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

  /* ---------- Generic [data-toast] triggers ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () {
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile burger menu ---------- */
  var burger = document.getElementById("burger");
  var links = document.querySelector(".nav__links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Hero / scroll reveal entrance ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = i * 120 + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- Hero card active toggle (touch friendly) ---------- */
  document.querySelectorAll(".hero-card").forEach(function (card) {
    function activate() {
      document.querySelectorAll(".hero-card.is-active").forEach(function (c) {
        if (c !== card) c.classList.remove("is-active");
      });
      card.classList.toggle("is-active");
      if (card.classList.contains("is-active")) {
        var name = card.querySelector("h3");
        toast("Recruited " + (name ? name.textContent : "hero") + " to your team!");
      }
    }
    card.addEventListener("click", activate);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });

  /* ---------- Issue carousel ---------- */
  var track = document.getElementById("track");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var dotsWrap = document.getElementById("dots");

  if (track && prevBtn && nextBtn) {
    var items = Array.prototype.slice.call(track.children);

    function perView() {
      if (window.innerWidth <= 520) return 1;
      if (window.innerWidth <= 900) return 2;
      return 3;
    }

    var index = 0;

    function pages() {
      return Math.max(1, items.length - perView() + 1);
    }

    function clamp() {
      index = Math.max(0, Math.min(index, pages() - 1));
    }

    function update() {
      clamp();
      var item = items[0];
      var gap = parseFloat(getComputedStyle(track).columnGap || "0") || 19;
      var step = item.getBoundingClientRect().width + gap;
      track.style.transform = "translateX(" + -(index * step) + "px)";
      buildDots();
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index >= pages() - 1;
      prevBtn.style.opacity = prevBtn.disabled ? ".4" : "1";
      nextBtn.style.opacity = nextBtn.disabled ? ".4" : "1";
    }

    function buildDots() {
      if (!dotsWrap) return;
      var total = pages();
      if (dotsWrap.childElementCount !== total) {
        dotsWrap.innerHTML = "";
        for (var i = 0; i < total; i++) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("role", "tab");
          b.setAttribute("aria-label", "Go to issue group " + (i + 1));
          (function (n) {
            b.addEventListener("click", function () {
              index = n;
              update();
            });
          })(i);
          dotsWrap.appendChild(b);
        }
      }
      Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
        dot.setAttribute("aria-selected", String(i === index));
      });
    }

    nextBtn.addEventListener("click", function () {
      index++;
      update();
    });
    prevBtn.addEventListener("click", function () {
      index--;
      update();
    });

    var rt;
    window.addEventListener("resize", function () {
      window.clearTimeout(rt);
      rt = window.setTimeout(update, 150);
    });

    update();
  }

  /* ---------- Subscribe form validation ---------- */
  var form = document.getElementById("subForm");
  var emailInput = document.getElementById("email");
  var errEl = document.getElementById("subError");
  if (form && emailInput) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
      if (!ok) {
        if (errEl) errEl.hidden = false;
        emailInput.focus();
        return;
      }
      if (errEl) errEl.hidden = true;
      toast("KAPOW! You're on the pull list — variant cover incoming.");
      form.reset();
    });
    emailInput.addEventListener("input", function () {
      if (errEl) errEl.hidden = true;
    });
  }
})();
