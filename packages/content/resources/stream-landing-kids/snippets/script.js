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
    }, 2600);
  }

  /* ---------- sticky nav ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-stuck");
    else nav.classList.remove("is-stuck");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- age-tab show grids ---------- */
  var SHOWS = {
    toddler: [
      { t: "Hop & Bloom", m: "Songs · 5 min", b: "New", q: "HD", e: "🐰", c: "#ffe1f0" },
      { t: "Twinkle Town", m: "Lullabies · 6 min", b: "Calm", q: "HD", e: "🌙", c: "#e6e1ff" },
      { t: "Baby Beats", m: "Music · 4 min", b: "Popular", q: "HD", e: "🥁", c: "#e1f4ff" },
      { t: "Color Pals", m: "Learning · 5 min", b: "Edu", q: "HD", e: "🎨", c: "#fff3d6" }
    ],
    little: [
      { t: "Captain Comet", m: "Adventure · 11 min", b: "New", q: "4K", e: "🚀", c: "#e1f0ff" },
      { t: "The Giggle Garden", m: "Comedy · 12 min", b: "Top 10", q: "4K", e: "🌻", c: "#fff3d6" },
      { t: "Mira & the Map", m: "Explore · 13 min", b: "Edu", q: "HD", e: "🗺️", c: "#e7ffef" },
      { t: "Dino Dance Club", m: "Music · 9 min", b: "Popular", q: "4K", e: "🦕", c: "#ffe1f0" }
    ],
    big: [
      { t: "Robo Rangers", m: "Action · 18 min", b: "New", q: "4K", e: "🤖", c: "#e1f4ff" },
      { t: "Mystery Mansion", m: "Puzzle · 20 min", b: "Top 10", q: "4K", e: "🔍", c: "#ece1ff" },
      { t: "Code Quest", m: "Learning · 16 min", b: "Edu", q: "4K", e: "💡", c: "#fff3d6" },
      { t: "Ocean Outlaws", m: "Adventure · 19 min", b: "Popular", q: "4K", e: "🐙", c: "#e7ffef" }
    ]
  };

  var grid = document.getElementById("showGrid");
  function renderShows(age) {
    var list = SHOWS[age] || [];
    grid.innerHTML = "";
    list.forEach(function (s, i) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "show-card";
      card.style.animationDelay = (i * 0.06) + "s";
      card.innerHTML =
        '<div class="show-card__art" style="background:' + s.c + '">' +
          '<span class="show-card__badge">' + s.b + "</span>" +
          '<span class="show-card__q">' + s.q + "</span>" +
          "<span>" + s.e + "</span>" +
        "</div>" +
        '<div class="show-card__body">' +
          '<div class="show-card__title">' + s.t + "</div>" +
          '<div class="show-card__meta">' + s.m + "</div>" +
        "</div>";
      card.addEventListener("click", function () {
        toast("▶ Playing “" + s.t + "” — enjoy!");
      });
      grid.appendChild(card);
    });
  }

  var tabs = document.querySelectorAll(".age-tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      grid.setAttribute("aria-labelledby", tab.id);
      renderShows(tab.dataset.age);
    });
  });
  renderShows("toddler");

  /* ---------- parental controls ---------- */
  var limit = document.getElementById("limit");
  var limitOut = document.getElementById("limitOut");
  function syncLimit() {
    var v = +limit.value;
    limitOut.textContent = v >= 120 ? "No limit" : v + " min";
    var pct = ((v - limit.min) / (limit.max - limit.min)) * 100;
    limit.style.setProperty("--fill", pct + "%");
  }
  limit.addEventListener("input", syncLimit);
  limit.addEventListener("change", function () {
    toast("Screen-time limit saved: " + limitOut.textContent);
  });
  syncLimit();

  document.querySelectorAll(".switch").forEach(function (sw) {
    if (sw.id === "billSwitch") return; // handled separately
    sw.addEventListener("click", function () {
      var on = !sw.classList.contains("is-on");
      sw.classList.toggle("is-on", on);
      sw.setAttribute("aria-checked", String(on));
    });
  });

  /* ---------- pricing toggle ---------- */
  var billSwitch = document.getElementById("billSwitch");
  var lblMonthly = document.getElementById("lblMonthly");
  var lblYearly = document.getElementById("lblYearly");
  var amts = document.querySelectorAll(".plan__price .amt");
  var pers = document.querySelectorAll(".plan__price .per");

  function setBilling(yearly) {
    billSwitch.classList.toggle("is-on", yearly);
    billSwitch.setAttribute("aria-checked", String(yearly));
    lblMonthly.classList.toggle("is-active", !yearly);
    lblYearly.classList.toggle("is-active", yearly);
    amts.forEach(function (a) {
      a.textContent = yearly ? a.dataset.y : a.dataset.m;
    });
    pers.forEach(function (p) {
      p.textContent = yearly ? "/mo billed yearly" : "/mo";
    });
  }
  billSwitch.addEventListener("click", function () {
    setBilling(!billSwitch.classList.contains("is-on"));
  });
  setBilling(false);

  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("🎉 " + btn.dataset.plan + " plan selected — 30 days free!");
    });
  });

  /* ---------- generic CTAs ---------- */
  ["heroCta", "navCta", "mobileCta", "signinBtn", "safeCta", "trailerBtn"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function () {
      if (id === "trailerBtn") { toast("🎬 Loading the PixiePlay trailer…"); return; }
      if (id === "signinBtn") { toast("Sign in is just for show here ✨"); return; }
      if (id === "safeCta") {
        document.getElementById("safe").scrollIntoView({ behavior: "smooth" });
        return;
      }
      toast("✨ Your 30-day free trial is ready to go!");
    });
  });

  /* ---------- email capture ---------- */
  var form = document.getElementById("ctaForm");
  var email = document.getElementById("email");
  var ctaMsg = document.getElementById("ctaMsg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = email.value.trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!ok) {
      ctaMsg.textContent = "Oops! Please enter a valid email address.";
      ctaMsg.style.color = "#ffe08a";
      email.focus();
      return;
    }
    ctaMsg.textContent = "Yay! Check " + v + " for your welcome link 🎈";
    ctaMsg.style.color = "#fff";
    email.value = "";
    toast("🎉 Welcome to PixiePlay! Trial activated.");
  });
})();
