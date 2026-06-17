/* ============================================================
   Foundry & Field — landing interactions (vanilla JS)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
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

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- smooth scroll (with reduced-motion respect) ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- back to top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- case studies → toast ---------- */
  document.querySelectorAll(".case").forEach(function (c) {
    var name = (c.querySelector("h3") || {}).textContent || "this project";
    c.setAttribute("tabindex", "0");
    c.setAttribute("role", "button");
    c.setAttribute("aria-label", "View case study: " + name);
    function open() { toast("Case study for " + name + " — coming soon."); }
    c.addEventListener("click", open);
    c.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  /* ---------- testimonial carousel (auto + dots) ---------- */
  var quotes = Array.prototype.slice.call(document.querySelectorAll("[data-quote]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-dot]"));
  var qi = 0, qTimer;
  function showQuote(i) {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach(function (q, n) { q.classList.toggle("is-active", n === qi); });
    dots.forEach(function (d, n) {
      d.classList.toggle("is-active", n === qi);
      d.setAttribute("aria-selected", String(n === qi));
    });
  }
  function startQuotes() {
    if (reduce || quotes.length < 2) return;
    clearInterval(qTimer);
    qTimer = setInterval(function () { showQuote(qi + 1); }, 5200);
  }
  dots.forEach(function (d, n) {
    d.addEventListener("click", function () { showQuote(n); startQuotes(); });
  });
  if (quotes.length) { showQuote(0); startQuotes(); }

  /* ---------- contact form ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["name", "email", "brief"].forEach(function (id) {
        var f = form.querySelector("#" + id);
        if (!f) return;
        var bad = !f.value.trim() || (id === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        f.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) { toast("Add your name, a valid email and a quick brief."); return; }
      var who = (form.querySelector("#name").value || "").trim().split(" ")[0];
      form.reset();
      toast("Thanks" + (who ? ", " + who : "") + "! We'll reply within two business days.");
    });
    form.querySelectorAll("input, textarea").forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("invalid"); });
    });
  }
})();
