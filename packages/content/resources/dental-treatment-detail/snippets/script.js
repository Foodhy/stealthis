(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ---------- steps timeline ---------- */
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var railFill = document.getElementById("railFill");

  function updateRail() {
    var openIdx = steps.findIndex(function (s) {
      return s.classList.contains("is-open");
    });
    if (openIdx < 0) openIdx = 0;
    // fill grows from step 1 to the currently open step
    var pct = ((openIdx + 1) / steps.length) * 100;
    if (railFill) railFill.style.height = pct + "%";
  }

  steps.forEach(function (step) {
    var head = step.querySelector(".step__head");
    head.addEventListener("click", function () {
      var isOpen = step.classList.contains("is-open");
      steps.forEach(function (s) {
        s.classList.remove("is-open");
        s.querySelector(".step__head").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        step.classList.add("is-open");
        head.setAttribute("aria-expanded", "true");
      }
      updateRail();
    });
  });
  updateRail();

  /* ---------- FAQ accordion ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq__item"));
  faqItems.forEach(function (item) {
    var q = item.querySelector(".faq__q");
    var a = item.querySelector(".faq__a");
    q.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
    });
  });

  /* ---------- cost estimator ---------- */
  // base ranges per complexity (single arch)
  var COMPLEXITY = {
    minor:    { low: 1400, high: 2100, dur: "3–6 mo" },
    moderate: { low: 2200, high: 3400, dur: "6–9 mo" },
    complex:  { low: 3600, high: 5200, dur: "12–18 mo" }
  };
  var WHITENING = 250;

  var priceLow = document.getElementById("priceLow");
  var priceHigh = document.getElementById("priceHigh");
  var perMonth = document.getElementById("perMonth");
  var durEl = document.getElementById("dur");
  var floatPrice = document.getElementById("floatPrice");

  function fmt(n) {
    return n.toLocaleString("en-US");
  }

  // animated count-up between old and new value
  function animateNumber(el, to, prefix) {
    prefix = prefix || "";
    var from = parseInt((el.dataset.val || el.textContent).replace(/[^0-9]/g, ""), 10) || 0;
    var start = performance.now();
    var dur = 380;
    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = Math.round(from + (to - from) * eased);
      el.textContent = prefix + fmt(val);
      if (t < 1) requestAnimationFrame(tick);
      else el.dataset.val = String(to);
    }
    el.dataset.val = String(from);
    requestAnimationFrame(tick);
  }

  function getVal(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  function recalc() {
    var c = COMPLEXITY[getVal("complexity")] || COMPLEXITY.minor;
    var multi = getVal("arch") === "both" ? 1.7 : 1;
    var add = document.getElementById("whitening").checked ? WHITENING : 0;

    var low = Math.round((c.low * multi + add) / 10) * 10;
    var high = Math.round((c.high * multi + add) / 10) * 10;
    var month = Math.round(low / 24);

    animateNumber(priceLow, low);
    animateNumber(priceHigh, high);
    animateNumber(perMonth, month, "$");
    durEl.textContent = c.dur;
    if (floatPrice) floatPrice.textContent = "$" + fmt(low) + "–$" + fmt(high);
  }

  Array.prototype.slice
    .call(document.querySelectorAll('input[name="complexity"], input[name="arch"], #whitening'))
    .forEach(function (input) {
      input.addEventListener("change", recalc);
    });
  recalc();

  /* ---------- booking actions ---------- */
  function book() {
    var daySel = document.getElementById("day");
    var day = daySel ? daySel.value : "your preferred time";
    toast("Consultation requested — <b>" + day + "</b>. We'll confirm within 1 business day.");
  }
  var bookBtn = document.getElementById("bookBtn");
  var floatBtn = document.getElementById("floatBtn");
  if (bookBtn) bookBtn.addEventListener("click", book);
  if (floatBtn)
    floatBtn.addEventListener("click", function () {
      var book = document.getElementById("book");
      if (book) book.scrollIntoView({ behavior: "smooth", block: "center" });
      toast("Scroll down to pick a time and request your free consult.");
    });

  /* ---------- floating cta visibility ---------- */
  var floatcta = document.querySelector(".floatcta");
  var hero = document.querySelector(".hero");
  if (floatcta && hero && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          floatcta.classList.toggle("show", !e.isIntersecting);
        });
      },
      { rootMargin: "-120px 0px 0px 0px" }
    );
    io.observe(hero);
  }

  /* ---------- smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
