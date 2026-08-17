(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
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
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".js-toast");
    if (t) {
      e.preventDefault();
      toast(t.getAttribute("data-msg") || "Acción de demostración.");
    }
  });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Urgency countdown ---------- */
  var ticketEl = document.getElementById("ticketCount");
  if (ticketEl) {
    var end = Date.now() + 9 * 24 * 60 * 60 * 1000;
    function pad(n) {
      return String(n).padStart(2, "0");
    }
    function tick() {
      var ms = Math.max(0, end - Date.now());
      var d = Math.floor(ms / 86400000);
      var h = Math.floor((ms % 86400000) / 3600000);
      var m = Math.floor((ms % 3600000) / 60000);
      var s = Math.floor((ms % 60000) / 1000);
      ticketEl.textContent = pad(d) + "d " + pad(h) + ":" + pad(m) + ":" + pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Count-up ---------- */
  function fmt(value, decimals, sep, suffix) {
    var fixed = value.toFixed(decimals);
    if (decimals > 0) fixed = fixed.replace(".", ",");
    if (sep) fixed = Math.round(value).toLocaleString("es-ES");
    return fixed + (suffix || "");
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count") || "0");
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var sep = el.getAttribute("data-sep") === "true";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = fmt(target, decimals, sep, suffix);
      return;
    }
    var duration = 1300;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, decimals, sep, suffix);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target, decimals, sep, suffix);
    }
    requestAnimationFrame(step);
  }
  var countEls = Array.prototype.slice.call(document.querySelectorAll(".count"));
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    countEls.forEach(function (el) {
      cio.observe(el);
    });
  } else {
    countEls.forEach(animateCount);
  }

  /* ---------- Currency toggle ---------- */
  var RATE = 1.06; // EUR -> USD, demo rate
  var curButtons = Array.prototype.slice.call(document.querySelectorAll(".cur-btn"));
  var priceEls = Array.prototype.slice.call(document.querySelectorAll("[data-eur]"));

  function applyCurrency(cur) {
    priceEls.forEach(function (el) {
      var base = parseFloat(el.getAttribute(cur === "USD" ? "data-usd" : "data-eur"));
      if (isNaN(base)) return;
      el.textContent = cur === "USD" ? "$" + base.toFixed(0) : base.toFixed(0) + "€";
    });
    // Update comparison-table cells that carry a data-year value
    var yearCell = document.querySelector("[data-year]");
    if (yearCell) {
      var eur = parseFloat(yearCell.getAttribute("data-year"));
      var val = cur === "USD" ? "$" + Math.round(eur * RATE) : eur.toFixed(0) + "€";
      yearCell.textContent = "≈ " + val + "/año · solo una herramienta";
    }
    // Update buttons' demo labels
    curButtons.forEach(function (b) {
      var active = b.getAttribute("data-cur") === cur;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
  }

  curButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyCurrency(btn.getAttribute("data-cur"));
    });
  });

  /* ---------- FAQ single-open ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".fitem"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();
