(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 3200);
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navlinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Animated counters ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function formatNumber(n, prefix, suffix) {
    var s;
    if (n >= 1000000) {
      s = (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
    } else {
      s = Math.round(n).toLocaleString("en-US");
    }
    return (prefix || "") + s + (suffix || "");
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = formatNumber(target, prefix, suffix);
      return;
    }
    var start = performance.now();
    var dur = 1700;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNumber(target * eased, prefix, suffix);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatNumber(target, prefix, suffix);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Thermometer fill ---------- */
  var raised = 1284500;
  var goal = 2000000;
  function fillThermo() {
    var fill = document.getElementById("thermoFill");
    if (fill) {
      var pct = Math.min((raised / goal) * 100, 100);
      fill.style.setProperty("--pct", pct.toFixed(1) + "%");
    }
  }

  /* ---------- Intersection-driven reveal + counters ---------- */
  var counted = new WeakSet();
  var io;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var t = entry.target;
        t.classList.add("is-in");

        if (t.classList.contains("thermo")) fillThermo();

        t.querySelectorAll("[data-count]").forEach(function (c) {
          if (!counted.has(c)) { counted.add(c); animateCount(c); }
        });
        if (t.hasAttribute("data-count") && !counted.has(t)) {
          counted.add(t); animateCount(t);
        }
        io.unobserve(t);
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".reveal, .thermo, .stat, .allocation, [data-count]").forEach(function (el) {
      io.observe(el);
    });
  } else {
    // Fallback
    document.querySelectorAll(".reveal, .allocation").forEach(function (el) { el.classList.add("is-in"); });
    document.querySelectorAll("[data-count]").forEach(animateCount);
    fillThermo();
  }

  /* ---------- Days-left countdown ---------- */
  var daysLeftEl = document.getElementById("daysLeft");
  if (daysLeftEl) {
    var deadline = new Date();
    deadline.setDate(deadline.getDate() + 11);
    var diff = Math.max(0, Math.ceil((deadline - new Date()) / 86400000));
    daysLeftEl.textContent = diff;
  }

  /* ---------- Appeal amount selection ---------- */
  var amounts = document.getElementById("amounts");
  var customInput = document.getElementById("customAmount");
  var appealImpact = document.getElementById("appealImpact");
  var appealGive = document.getElementById("appealGive");
  var monthly = document.getElementById("monthly");
  var selectedAmount = 75;

  function impactText(amt, isMonthly) {
    var kits = Math.max(1, Math.round(amt / 35));
    var per = isMonthly ? " every month" : "";
    if (amt >= 500) return "$" + amt + per + " funds an emergency water station for a whole village.";
    if (amt >= 150) return "$" + amt + per + " delivers " + kits + " water kits + food for " + kits + " families.";
    return "$" + amt + per + " delivers " + kits + " water kit" + (kits > 1 ? "s" : "") + " + a week of food for one family.";
  }

  function updateAppeal() {
    var m = monthly && monthly.checked;
    if (appealImpact) appealImpact.textContent = impactText(selectedAmount, m);
    if (appealGive) appealGive.textContent = "Give $" + selectedAmount + (m ? "/mo" : "") + " now";
  }

  if (amounts) {
    amounts.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip[data-amount]");
      if (!btn) return;
      amounts.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      btn.classList.add("is-active");
      if (customInput) customInput.value = "";
      selectedAmount = parseInt(btn.getAttribute("data-amount"), 10);
      updateAppeal();
    });
  }
  if (customInput) {
    customInput.addEventListener("input", function () {
      var v = parseInt(customInput.value, 10);
      if (v > 0) {
        amounts.querySelectorAll(".chip[data-amount]").forEach(function (c) { c.classList.remove("is-active"); });
        customInput.closest(".chip").classList.add("is-active");
        selectedAmount = v;
        updateAppeal();
      }
    });
  }
  if (monthly) monthly.addEventListener("change", updateAppeal);
  updateAppeal();

  /* ---------- Donate CTA form ---------- */
  var donateAmounts = document.getElementById("donateAmounts");
  var donateLabel = document.getElementById("donateLabel");
  var donateForm = document.getElementById("donateForm");
  var donorEmail = document.getElementById("donorEmail");
  var donateAmount = 100;

  if (donateAmounts) {
    donateAmounts.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip[data-amount]");
      if (!btn) return;
      donateAmounts.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      btn.classList.add("is-active");
      donateAmount = parseInt(btn.getAttribute("data-amount"), 10);
      if (donateLabel) donateLabel.textContent = "$" + donateAmount;
    });
  }

  if (donateForm) {
    donateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = donorEmail ? donorEmail.value.trim() : "";
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast("Please enter a valid email for your receipt.");
        if (donorEmail) donorEmail.focus();
        return;
      }
      // Matched 2x this week
      var matched = donateAmount * 2;
      toast("Thank you! Your $" + donateAmount + " becomes $" + matched + " with matching. (Demo only)");
      donateForm.reset();
      donateAmounts.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      var def = donateAmounts.querySelector('[data-amount="100"]');
      if (def) def.classList.add("is-active");
      donateAmount = 100;
      if (donateLabel) donateLabel.textContent = "$100";
    });
  }

  /* ---------- Donate buttons that scroll (links) feedback ---------- */
  document.querySelectorAll('a[href="#donate"]').forEach(function (a) {
    if (a.classList.contains("btn--donate") && a.id !== "appealGive") {
      a.addEventListener("click", function () {
        setTimeout(function () {
          var input = document.getElementById("donorEmail");
          if (input) input.focus({ preventScroll: true });
        }, 700);
      });
    }
  });
  if (appealGive) {
    appealGive.addEventListener("click", function () {
      setTimeout(function () {
        var input = document.getElementById("donorEmail");
        if (input) input.focus({ preventScroll: true });
      }, 700);
    });
  }
})();
