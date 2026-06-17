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

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a") && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated counters ---------- */
  function formatNum(n, prefix, suffix) {
    var s = Math.round(n).toLocaleString("en-US");
    return (prefix || "") + s + (suffix || "");
  }
  function animateCount(el) {
    var to = parseFloat(el.getAttribute("data-to")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1500, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(to * eased, prefix, suffix);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(to, prefix, suffix);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".count");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCount(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Thermometer fill on reveal ---------- */
  var thermoFill = document.getElementById("thermoFill");
  if (thermoFill) {
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          thermoFill.style.width = "73%";
          tio.disconnect();
        }
      });
    }, { threshold: 0.5 });
    tio.observe(thermoFill);
  }

  /* ---------- Donation widget ---------- */
  var freq = "mo"; // "mo" | "once"
  var amount = 35;
  var customAmt = document.getElementById("customAmt");
  var amtButtons = document.querySelectorAll(".amt[data-amt]");
  var tgButtons = document.querySelectorAll(".tg");
  var donateAmt = document.getElementById("donateAmt");
  var giveImpact = document.getElementById("giveImpact");
  var donateBtn = document.getElementById("donateBtn");

  function suffixLabel() { return freq === "mo" ? "/mo" : ""; }
  function impactText(a) {
    if (a >= 150) return "$" + a + suffixLabel() + " funds a full scholarship term for one student.";
    if (a >= 75) return "$" + a + suffixLabel() + " covers a month of mentoring and learning-hub access.";
    if (a >= 35) return "$" + a + suffixLabel() + " gives one student tutoring + a hot meal every week.";
    if (a >= 15) return "$" + a + suffixLabel() + " supplies books and supplies for a young learner.";
    return "$" + a + suffixLabel() + " helps keep our learning hubs open.";
  }
  function refresh() {
    var label = "$" + amount.toLocaleString("en-US") + suffixLabel();
    if (donateAmt) donateAmt.textContent = label;
    if (giveImpact) giveImpact.textContent = impactText(amount);
  }

  amtButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      amtButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      amount = parseInt(btn.getAttribute("data-amt"), 10);
      if (customAmt) customAmt.value = "";
      refresh();
    });
  });

  if (customAmt) {
    customAmt.addEventListener("input", function () {
      var v = parseInt(customAmt.value, 10);
      if (v && v > 0) {
        amtButtons.forEach(function (b) { b.classList.remove("active"); });
        amount = v;
        refresh();
      }
    });
    customAmt.closest(".amt-custom").addEventListener("click", function () {
      customAmt.focus();
    });
  }

  tgButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tgButtons.forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      freq = btn.getAttribute("data-freq");
      refresh();
    });
  });

  if (donateBtn) {
    donateBtn.addEventListener("click", function () {
      toast("Thank you! A $" + amount.toLocaleString("en-US") + suffixLabel() +
        " gift would keep a student learning. (Demo only)");
    });
  }
  refresh();

  /* ---------- Volunteer form ---------- */
  var volForm = document.getElementById("volForm");
  if (volForm) {
    volForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("volEmail");
      var val = input.value.trim();
      if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        input.focus();
        toast("Please enter a valid email so we can reach you.");
        return;
      }
      input.value = "";
      toast("You're on the list! A mentoring coordinator will be in touch. (Demo)");
    });
  }
})();
