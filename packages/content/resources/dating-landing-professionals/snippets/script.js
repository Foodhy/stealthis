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
    }, 3200);
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var mnav = document.getElementById("mnav");
  if (toggle && mnav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      mnav.hidden = open;
    });
    mnav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        mnav.hidden = true;
      });
    });
  }

  /* ---------- Apply forms ---------- */
  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }
  function wireForm(formId, hintId, hintDefault) {
    var form = document.getElementById(formId);
    if (!form) return;
    var input = form.querySelector("input[type=email]");
    var hint = document.getElementById(hintId);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = input.value.trim();
      if (!isEmail(val)) {
        input.classList.add("invalid");
        input.focus();
        if (hint) { hint.textContent = "Please enter a valid work email."; hint.classList.add("error"); hint.classList.remove("ok"); }
        return;
      }
      input.classList.remove("invalid");
      if (hint) { hint.textContent = "Application received — check your inbox to verify."; hint.classList.remove("error"); hint.classList.add("ok"); }
      toast("Thanks! Your invite request is in review.");
      form.reset();
      setTimeout(function () {
        if (hint) { hint.textContent = hintDefault; hint.classList.remove("ok"); }
      }, 4500);
    });
    input.addEventListener("input", function () {
      input.classList.remove("invalid");
      if (hint && hint.classList.contains("error")) {
        hint.textContent = hintDefault; hint.classList.remove("error");
      }
    });
  }
  wireForm("apply-hero", "hero-hint", "We review new applications within 48 hours.");
  wireForm("apply-final", "final-hint", "Free to apply · 48-hour review · No spam, ever.");

  /* ---------- Live ticker ---------- */
  var ticker = document.getElementById("ticker");
  if (ticker) {
    var count = 1248;
    setInterval(function () {
      count += Math.floor(Math.random() * 3) + 1;
      ticker.textContent = count.toLocaleString();
      ticker.animate(
        [{ transform: "translateY(-3px)", opacity: 0.6 }, { transform: "translateY(0)", opacity: 1 }],
        { duration: 300, easing: "ease-out" }
      );
    }, 2600);
  }

  /* ---------- Count-up stats ---------- */
  var counters = document.querySelectorAll("[data-count]");
  var seen = false;
  function runCounters() {
    if (seen) return;
    seen = true;
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var cur = 0;
      var step = Math.max(1, Math.round(target / 40));
      var t = setInterval(function () {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = cur;
      }, 28);
    });
  }
  if (counters.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCounters(); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(counters[0].closest(".stats"));
  } else {
    runCounters();
  }

  /* ---------- Testimonial carousel ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var dotsWrap = document.getElementById("dots");
  var current = 0, autoTimer;
  if (slides.length && dotsWrap) {
    slides.forEach(function (_, i) {
      var d = document.createElement("button");
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", "Story " + (i + 1));
      d.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(d);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(n) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = (n + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
      dots[current].setAttribute("aria-selected", "true");
    }
    function next() { go(current + 1); }
    function prev() { go(current - 1); }
    function start() { autoTimer = setInterval(next, 5500); }
    function restart() { clearInterval(autoTimer); start(); }

    go(0);
    start();

    var nextBtn = document.getElementById("next");
    var prevBtn = document.getElementById("prev");
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });

    var carousel = document.querySelector(".carousel");
    carousel.addEventListener("mouseenter", function () { clearInterval(autoTimer); });
    carousel.addEventListener("mouseleave", start);
  }

  /* ---------- Pricing toggle ---------- */
  var billing = document.getElementById("billing");
  var lblM = document.getElementById("lbl-monthly");
  var lblA = document.getElementById("lbl-annual");
  var prices = document.querySelectorAll(".price strong[data-monthly]");
  if (billing) {
    billing.addEventListener("click", function () {
      var annual = billing.getAttribute("aria-checked") !== "true";
      billing.setAttribute("aria-checked", String(annual));
      lblM.setAttribute("data-active", String(!annual));
      lblA.setAttribute("data-active", String(annual));
      prices.forEach(function (p) {
        var to = parseInt(p.getAttribute(annual ? "data-annual" : "data-monthly"), 10);
        var from = parseInt(p.textContent, 10) || 0;
        var steps = 14, i = 0;
        var inc = (to - from) / steps;
        var anim = setInterval(function () {
          i++;
          p.textContent = Math.round(from + inc * i);
          if (i >= steps) { p.textContent = to; clearInterval(anim); }
        }, 22);
      });
      toast(annual ? "Annual billing — you save 20%" : "Switched to monthly billing");
    });
  }

  /* ---------- FAQ accordion ---------- */
  var accBtns = document.querySelectorAll(".acc-q");
  accBtns.forEach(function (btn) {
    var panel = btn.nextElementSibling;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      accBtns.forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
        b.nextElementSibling.style.maxHeight = null;
      });
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ---------- Plan CTAs ---------- */
  document.querySelectorAll(".plan-cta").forEach(function (b) {
    b.addEventListener("click", function () {
      var name = b.closest(".plan-card").querySelector("h3").textContent;
      toast(name + " selected — let's get you verified.");
      var apply = document.getElementById("apply");
      if (apply) apply.scrollIntoView({ behavior: "smooth" });
    });
  });
})();
