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
    }, 2600);
  }

  /* ---------- smooth scroll to target ---------- */
  function scrollTo(sel) {
    var el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- nav scroll state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  function closeMobile() {
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
  }
  burger.addEventListener("click", function () {
    var open = mobileNav.classList.toggle("is-open");
    mobileNav.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMobile);
  });

  /* ---------- delegated clicks: scroll + toast ---------- */
  document.addEventListener("click", function (e) {
    var s = e.target.closest("[data-scroll]");
    if (s) {
      e.preventDefault();
      closeMobile();
      scrollTo(s.getAttribute("data-scroll"));
      return;
    }
    var t = e.target.closest("[data-toast]");
    if (t) {
      e.preventDefault();
      toast(t.getAttribute("data-toast"));
    }
  });

  /* ---------- collection filters ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("#collectionGrid .card"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      var f = chip.getAttribute("data-filter");
      var shown = 0;
      cards.forEach(function (card) {
        var match = f === "all" || (" " + card.getAttribute("data-tags") + " ").indexOf(" " + f + " ") !== -1;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      toast(f === "all" ? "Showing all " + cards.length + " collections" : shown + " collection" + (shown === 1 ? "" : "s") + " in " + chip.textContent.trim());
    });
  });

  /* ---------- card open ---------- */
  cards.forEach(function (card) {
    function open() {
      var title = card.querySelector("h3");
      toast("Opening “" + (title ? title.textContent : "collection") + "” — demo only");
    }
    card.addEventListener("click", open);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  /* ---------- billing toggle ---------- */
  var billOpts = Array.prototype.slice.call(document.querySelectorAll(".billing__opt"));
  var amts = Array.prototype.slice.call(document.querySelectorAll(".plan__amt"));
  var pers = Array.prototype.slice.call(document.querySelectorAll(".plan__per"));
  billOpts.forEach(function (opt) {
    opt.addEventListener("click", function () {
      billOpts.forEach(function (o) { o.classList.remove("is-active"); });
      opt.classList.add("is-active");
      var yearly = opt.getAttribute("data-bill") === "yearly";
      amts.forEach(function (a) {
        var v = yearly ? a.getAttribute("data-yearly") : a.getAttribute("data-monthly");
        a.textContent = "$" + v;
      });
      pers.forEach(function (p) { p.textContent = yearly ? "/yr" : "/mo"; });
    });
  });

  /* ---------- community signup ---------- */
  var joinBtn = document.getElementById("joinBtn");
  var emailInput = document.getElementById("email");
  var note = document.getElementById("signupNote");
  if (joinBtn) {
    joinBtn.addEventListener("click", function () {
      var val = (emailInput.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        emailInput.focus();
        note.textContent = "Please enter a valid email address.";
        note.classList.remove("is-ok");
        return;
      }
      note.textContent = "You're on the list — first letter ships Friday.";
      note.classList.add("is-ok");
      emailInput.value = "";
      toast("Welcome to the Driftframe club ✨");
    });
    emailInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") joinBtn.click();
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-in"); });
  }
})();
