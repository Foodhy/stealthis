(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, icon) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = '<span class="t-ico" aria-hidden="true">' + (icon || "🌿") + "</span><span></span>";
    el.querySelector("span:last-child").textContent = msg;
    toastWrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 320);
    }, 3200);
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  function closeNav() {
    if (!navToggle) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    navLinks.classList.remove("open");
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      navLinks.classList.toggle("open", !open);
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute("data-reveal-delay") || "0", 10);
          setTimeout(function () { entry.target.classList.add("in"); }, delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* ---------- Animated hero stats ---------- */
  var stats = [
    { id: "statMembers", to: 184 },
    { id: "statDesks", to: 6 },
    { id: "statMinutes", to: 4 }
  ];
  function animateStat(node, to) {
    var start = 0, dur = 1100, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = String(Math.round(start + (to - start) * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var statsDone = false;
  function runStats() {
    if (statsDone) return;
    statsDone = true;
    stats.forEach(function (s) {
      var n = document.getElementById(s.id);
      if (n) animateStat(n, s.to);
    });
  }
  var hero = document.getElementById("hero");
  if (hero && "IntersectionObserver" in window) {
    var hio = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { runStats(); hio.disconnect(); }
    }, { threshold: 0.3 });
    hio.observe(hero);
  } else {
    runStats();
  }

  /* ---------- Live availability clock ---------- */
  var availTime = document.getElementById("availTime");
  function tick() {
    if (!availTime) return;
    var now = new Date();
    var hh = now.getHours();
    var mm = String(now.getMinutes()).padStart(2, "0");
    var ampm = hh >= 12 ? "pm" : "am";
    var h12 = hh % 12 || 12;
    availTime.textContent = "updated " + h12 + ":" + mm + ampm;
  }
  tick();
  setInterval(tick, 30000);

  /* ---------- Amenities show more / fewer ---------- */
  var amenList = document.getElementById("amenList");
  var amenMore = document.getElementById("amenMore");
  if (amenList && amenMore) {
    var items = Array.prototype.slice.call(amenList.querySelectorAll("li"));
    var COLLAPSED = 4;
    var expanded = true;
    function applyAmen() {
      items.forEach(function (li, i) {
        li.classList.toggle("is-hidden", !expanded && i >= COLLAPSED);
      });
      amenMore.textContent = expanded ? "Show fewer" : "Show all amenities";
      amenMore.setAttribute("aria-expanded", String(expanded));
    }
    amenMore.addEventListener("click", function () {
      expanded = !expanded;
      applyAmen();
    });
    applyAmen();
  }

  /* ---------- Plan billing toggle ---------- */
  var billOpts = document.querySelectorAll(".bill-opt");
  var amounts = document.querySelectorAll(".price .amount");
  function setBilling(mode) {
    billOpts.forEach(function (b) {
      var on = b.getAttribute("data-bill") === mode;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    amounts.forEach(function (a) {
      var val = a.getAttribute("data-" + mode);
      if (val == null) return;
      a.style.opacity = "0";
      setTimeout(function () {
        a.textContent = val;
        a.style.opacity = "1";
      }, 140);
    });
  }
  billOpts.forEach(function (b) {
    b.addEventListener("click", function () {
      setBilling(b.getAttribute("data-bill"));
    });
  });

  /* ---------- Plan select ---------- */
  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast(btn.getAttribute("data-plan") + " plan saved — see you at the hub!", "🎉");
      var visit = document.getElementById("visit");
      if (visit) visit.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Tour form ---------- */
  var tourForm = document.getElementById("tourForm");
  if (tourForm) {
    var nameI = document.getElementById("cfName");
    var emailI = document.getElementById("cfEmail");
    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    tourForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      [nameI, emailI].forEach(function (f) { f.classList.remove("invalid"); });
      if (!nameI.value.trim()) { nameI.classList.add("invalid"); ok = false; }
      if (!validEmail(emailI.value.trim())) { emailI.classList.add("invalid"); ok = false; }
      if (!ok) {
        toast("Add your name and a valid email to book.", "✋");
        var bad = tourForm.querySelector(".invalid");
        if (bad) bad.focus();
        return;
      }
      var first = nameI.value.trim().split(" ")[0];
      toast("Thanks " + first + "! Your day pass is held — coffee's on us. ☕", "✅");
      tourForm.reset();
    });
    [nameI, emailI].forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("invalid"); });
    });
  }

  /* ---------- Footer newsletter ---------- */
  var subForm = document.getElementById("subForm");
  if (subForm) {
    var subEmail = document.getElementById("subEmail");
    subForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subEmail.value.trim())) {
        subEmail.focus();
        toast("Pop in a valid email to join the loop.", "✋");
        return;
      }
      toast("You're on the list — neighborly news inbound.", "📬");
      subForm.reset();
    });
  }

  /* ---------- Footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
