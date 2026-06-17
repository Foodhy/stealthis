(function () {
  "use strict";

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
    }, 3200);
  }

  /* ---------- sticky topbar shadow ---------- */
  var topbar = document.querySelector(".topbar");
  function onScroll() {
    if (!topbar) return;
    topbar.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var hamburger = document.getElementById("hamburger");
  var nav = document.getElementById("primary-nav");
  if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- smooth scroll + close mobile nav ---------- */
  document.querySelectorAll("[data-scroll]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id.charAt(0) !== "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (nav && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---------- sign in (demo) ---------- */
  var signin = document.getElementById("signinBtn");
  if (signin) {
    signin.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Secure sign-in is a demo — no real login.");
    });
  }

  /* ---------- live balance shimmer (subtle realism) ---------- */
  var snapBalance = document.getElementById("snapBalance");
  var base = 48920.16;
  function renderBalance(v) {
    if (!snapBalance) return;
    snapBalance.textContent = "$" + v.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  setInterval(function () {
    base += (Math.random() - 0.4) * 3.5;
    renderBalance(base);
  }, 4200);

  /* ---------- rates "last updated" date ---------- */
  var ratesDate = document.getElementById("ratesDate");
  if (ratesDate) {
    ratesDate.textContent = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  /* ---------- branch <-> pin linking ---------- */
  var pins = Array.prototype.slice.call(document.querySelectorAll(".pin"));
  var branches = Array.prototype.slice.call(document.querySelectorAll(".branch"));

  function activate(idx) {
    pins.forEach(function (p) {
      p.classList.toggle("is-active", p.dataset.branch === String(idx));
    });
    branches.forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.branch === String(idx));
    });
  }
  pins.forEach(function (p) {
    p.addEventListener("mouseenter", function () { activate(p.dataset.branch); });
    p.addEventListener("focus", function () { activate(p.dataset.branch); });
    p.addEventListener("click", function () {
      activate(p.dataset.branch);
      var b = branches.filter(function (x) { return x.dataset.branch === p.dataset.branch; })[0];
      if (b) toast("Selected " + b.querySelector("strong").textContent + " branch.");
    });
  });
  branches.forEach(function (b) {
    b.addEventListener("mouseenter", function () { activate(b.dataset.branch); });
    b.addEventListener("click", function () {
      activate(b.dataset.branch);
      toast("Directions to " + b.querySelector("strong").textContent + " (demo).");
    });
  });

  /* ---------- locator search ---------- */
  var locatorForm = document.getElementById("locatorForm");
  if (locatorForm) {
    locatorForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var zip = document.getElementById("zip").value.trim();
      if (!/^\d{5}$/.test(zip)) {
        toast("Please enter a valid 5-digit ZIP code.");
        return;
      }
      toast("Found 3 branches near " + zip + " — sorted by distance.");
    });
  }

  /* ---------- open account form ---------- */
  var openForm = document.getElementById("openForm");
  if (openForm) {
    openForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("fullname");
      var email = document.getElementById("email");
      var product = document.getElementById("product");
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      var nameOk = name.value.trim().length >= 2;

      name.setAttribute("aria-invalid", nameOk ? "false" : "true");
      email.setAttribute("aria-invalid", emailOk ? "false" : "true");

      if (!nameOk) { toast("Please enter your full name."); name.focus(); return; }
      if (!emailOk) { toast("Please enter a valid email address."); email.focus(); return; }

      toast("Welcome, " + name.value.trim().split(" ")[0] + "! Your " + product.value + " application is queued.");
      openForm.reset();
    });
  }
})();
