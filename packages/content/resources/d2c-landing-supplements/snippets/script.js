/* =========================================================
   Vitalize landing — vanilla JS interactions
   ========================================================= */
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
    }, 2600);
  }
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () {
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  function closeNav() {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("is-open");
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("is-open", !open);
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }

  /* ---------- Nav shadow on scroll ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Pricing toggle ---------- */
  var billSub = document.getElementById("billSub");
  var billOnce = document.getElementById("billOnce");
  var amounts = document.querySelectorAll(".amt");
  var pers = document.querySelectorAll(".plan__price .per");
  var saveTag = document.querySelector(".toggle__save");

  function setBilling(mode) {
    var sub = mode === "sub";
    billSub.classList.toggle("is-active", sub);
    billOnce.classList.toggle("is-active", !sub);
    billSub.setAttribute("aria-pressed", String(sub));
    billOnce.setAttribute("aria-pressed", String(!sub));
    amounts.forEach(function (a) {
      var val = a.getAttribute(sub ? "data-sub" : "data-once");
      if (val) a.textContent = "$" + val;
    });
    pers.forEach(function (p) { p.textContent = sub ? "/mo" : " once"; });
    if (saveTag) saveTag.style.visibility = sub ? "visible" : "hidden";
    syncAtc();
  }
  if (billSub && billOnce) {
    billSub.addEventListener("click", function () { setBilling("sub"); });
    billOnce.addEventListener("click", function () { setBilling("once"); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".acc__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.parentElement;
      var panel = item.querySelector(".acc__a");
      var open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", String(open));
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
    });
  });

  /* ---------- Sticky add-to-cart ---------- */
  var atc = document.getElementById("atc");
  var atcPrice = document.getElementById("atcPrice");
  var featuredAmt = document.querySelector(".plan--featured .amt");
  var hero = document.querySelector(".hero");
  var footer = document.querySelector(".footer");

  function syncAtc() {
    if (atcPrice && featuredAmt) atcPrice.textContent = featuredAmt.textContent;
  }
  syncAtc();

  if (atc && "IntersectionObserver" in window) {
    var pastHero = false, atFooter = false;
    function updateAtc() {
      var show = pastHero && !atFooter;
      atc.hidden = !show;
      atc.classList.toggle("is-visible", show);
    }
    var heroIo = new IntersectionObserver(function (entries) {
      pastHero = !entries[0].isIntersecting;
      updateAtc();
    }, { threshold: 0 });
    if (hero) heroIo.observe(hero);

    var footIo = new IntersectionObserver(function (entries) {
      atFooter = entries[0].isIntersecting;
      updateAtc();
    }, { threshold: 0 });
    if (footer) footIo.observe(footer);
  }

  /* ---------- Newsletter form ---------- */
  var news = document.getElementById("newsForm");
  if (news) {
    news.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("newsEmail");
      toast("You're in — 15% code is on its way to " + (input.value || "your inbox"));
      news.reset();
    });
  }
})();
