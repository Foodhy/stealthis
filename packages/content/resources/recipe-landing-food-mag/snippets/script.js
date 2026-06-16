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
    }, 2600);
  }

  /* ---------- Sticky condensing header ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("condensed");
    else header.classList.remove("condensed");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu toggle ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var sectionNav = document.getElementById("sectionNav");
  if (menuBtn && sectionNav) {
    menuBtn.addEventListener("click", function () {
      var open = sectionNav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    sectionNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        sectionNav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Section nav active state ---------- */
  if (sectionNav) {
    var navLinks = sectionNav.querySelectorAll("a");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.forEach(function (l) { l.classList.remove("active"); });
        link.classList.add("active");
      });
    });
  }

  /* ---------- Category tab filter ---------- */
  var tabs = document.querySelectorAll(".tab");
  var tiles = document.querySelectorAll("#grid .tile");
  var emptyState = document.getElementById("emptyState");

  function applyFilter(cat) {
    var visible = 0;
    tiles.forEach(function (tile) {
      var match = cat === "all" || tile.getAttribute("data-cat") === cat;
      tile.classList.toggle("hidden", !match);
      if (match) visible++;
    });
    if (emptyState) emptyState.hidden = visible !== 0;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      var cat = tab.getAttribute("data-cat");
      applyFilter(cat);
      toast(cat === "all" ? "Showing all stories" : "Filtered: " + tab.textContent);
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Subscribe form ---------- */
  var form = document.getElementById("subForm");
  var emailInput = document.getElementById("email");
  var formMsg = document.getElementById("formMsg");

  function setMsg(text, kind) {
    if (!formMsg) return;
    formMsg.textContent = text;
    formMsg.className = "form-msg" + (kind ? " " + kind : "");
  }

  if (form && emailInput) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = emailInput.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        setMsg("Please enter a valid email address.", "err");
        emailInput.focus();
        return;
      }
      setMsg("You're in — welcome to FOLIO. Issue 042 ships Sunday.", "ok");
      toast("Subscribed ✓");
      form.reset();
    });
  }
})();
