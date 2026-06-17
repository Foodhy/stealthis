(function () {
  "use strict";

  /* ---- Toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---- Nav scroll state ---- */
  var nav = document.getElementById("nav");
  var buybar = document.getElementById("buybar");
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 12);
    if (buybar) {
      buybar.hidden = false;
      buybar.classList.toggle("show", y > 700);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (!menu) return;
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) {
        closeMenu();
      } else {
        menu.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close menu");
      }
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---- Smooth scroll for in-page anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Spec tabs ---- */
  var tabs = document.querySelectorAll(".spectab");
  function activateTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        panel.hidden = !on;
        panel.classList.toggle("is-active", on);
      }
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activateTab(tab); });
    tab.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var next = e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      activateTab(tabs[next]);
    });
  });

  /* ---- Color swatches ---- */
  var swatches = document.querySelectorAll(".swatch");
  var swatchName = document.getElementById("swatchName");
  var device = document.getElementById("device");
  swatches.forEach(function (sw) {
    sw.addEventListener("click", function () {
      swatches.forEach(function (s) { s.classList.remove("is-active"); });
      sw.classList.add("is-active");
      var color = sw.getAttribute("data-color");
      var name = sw.getAttribute("data-name");
      if (swatchName) swatchName.textContent = name;
      if (device) {
        device.style.setProperty("--device-body", color);
        device.style.setProperty("--device-glow", color);
      }
    });
  });

  /* ---- Accordion FAQ ---- */
  document.querySelectorAll(".acc__head").forEach(function (head) {
    head.addEventListener("click", function () {
      var item = head.parentElement;
      var body = item.querySelector(".acc__body");
      var open = item.classList.toggle("open");
      head.setAttribute("aria-expanded", open ? "true" : "false");
      body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
    });
  });

  /* ---- Pricing quantity ---- */
  var qtyVal = document.getElementById("qtyVal");
  var totalEl = document.getElementById("total");
  var minus = document.getElementById("qtyMinus");
  var plus = document.getElementById("qtyPlus");
  var UNIT = 189;
  var qty = 1;
  function renderTotal() {
    if (qtyVal) qtyVal.textContent = qty;
    if (totalEl) totalEl.textContent = "$0.00";
  }
  if (minus) minus.addEventListener("click", function () { if (qty > 1) { qty--; renderTotal(); } });
  if (plus) plus.addEventListener("click", function () { if (qty < 9) { qty++; renderTotal(); } });
  renderTotal();

  var reserve = document.getElementById("reserveBtn");
  if (reserve) {
    reserve.addEventListener("click", function () {
      toast("Reserved " + qty + " × Halo X1 — $0 hold placed.");
    });
  }

  /* ---- Newsletter ---- */
  var news = document.getElementById("newsForm");
  if (news) {
    news.addEventListener("submit", function (e) {
      e.preventDefault();
      news.reset();
      toast("You're on the list. Field notes incoming.");
    });
  }

  /* ---- Beam flicker on hero hover ---- */
  var beam = document.getElementById("deviceBeam");
  if (device && beam) {
    device.addEventListener("mouseenter", function () { beam.style.opacity = "1"; beam.style.filter = "blur(3px)"; });
    device.addEventListener("mouseleave", function () { beam.style.opacity = ""; beam.style.filter = ""; });
  }
})();
