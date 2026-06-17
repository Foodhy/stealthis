(function () {
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.hasAttribute("hidden");
      if (open) { menu.removeAttribute("hidden"); } else { menu.setAttribute("hidden", ""); }
      burger.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.setAttribute("hidden", "");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- animated counters ---------- */
  function fmt(n, dec) {
    return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function runCounter(el) {
    var to = parseFloat(el.getAttribute("data-to")) || 0;
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var target = el.querySelector("strong") || el;
    if (prefersReduced) { target.textContent = prefix + fmt(to, dec) + suffix; return; }
    var dur = 1500, start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      target.textContent = prefix + fmt(to * eased, dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else target.textContent = prefix + fmt(to, dec) + suffix;
    }
    requestAnimationFrame(tick);
  }
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-counter]"));
  if (!("IntersectionObserver" in window)) {
    counters.forEach(runCounter);
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- card flip ---------- */
  var cardflip = document.getElementById("cardflip");
  if (cardflip) {
    var flip = function () { cardflip.classList.toggle("is-flipped"); };
    cardflip.addEventListener("click", flip);
    cardflip.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });
  }

  /* ---------- showcase tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var name = tab.getAttribute("data-screen");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      screens.forEach(function (s) {
        s.classList.toggle("is-active", s.getAttribute("data-screen") === name);
      });
    });
  });

  /* ---------- pricing billing toggle ---------- */
  var billBtns = Array.prototype.slice.call(document.querySelectorAll(".billtoggle__btn"));
  var amts = Array.prototype.slice.call(document.querySelectorAll(".plan__price .amt"));
  billBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var bill = btn.getAttribute("data-bill");
      billBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      amts.forEach(function (a) {
        var v = a.getAttribute(bill === "yearly" ? "data-y" : "data-m");
        a.textContent = "€" + v;
      });
      toast(bill === "yearly" ? "Yearly pricing — save 20%" : "Switched to monthly billing");
    });
  });

  /* ---------- quick action buttons (phone) ---------- */
  document.querySelectorAll(".quick__btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var label = (b.querySelector("small") || {}).textContent || "Action";
      toast(label + " — demo only");
    });
  });

  /* ---------- signup form ---------- */
  var form = document.getElementById("signup");
  if (form) {
    var input = document.getElementById("email");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        input.classList.add("invalid");
        input.focus();
        toast("Please enter a valid email address");
        return;
      }
      input.classList.remove("invalid");
      input.value = "";
      toast("🎉 You're on the list — check your inbox!");
    });
    input.addEventListener("input", function () { input.classList.remove("invalid"); });
  }

  /* ---------- phone parallax tilt (desktop only) ---------- */
  var phone = document.getElementById("phone");
  if (phone && !prefersReduced && window.matchMedia("(pointer:fine)").matches) {
    var host = phone.parentElement;
    host.addEventListener("mousemove", function (ev) {
      var r = host.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5;
      var y = (ev.clientY - r.top) / r.height - 0.5;
      phone.style.transform = "rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg)";
    });
    host.addEventListener("mouseleave", function () { phone.style.transform = ""; });
  }
})();
