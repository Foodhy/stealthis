(function () {
  "use strict";

  /* ---------- toast ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------- mobile nav ---------- */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  function closeNav() {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeNav();
  });

  /* ---------- nav scroll shadow ---------- */
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- live shifts feed ---------- */
  const companies = [
    { name: "Maple St Café", role: "Barista", color: "#0ea5a4", time: "6am–11am", dist: "0.8 mi", pay: "$17", unit: "/hr" },
    { name: "Riverbend Logistics", role: "Warehouse Picker", color: "#ff6a1a", time: "2pm–8pm", dist: "3.1 mi", pay: "$19", unit: "/hr" },
    { name: "QuickEats", role: "Delivery Driver", color: "#7c3aed", time: "5pm–10pm", dist: "1.4 mi", pay: "$21", unit: "/hr" },
    { name: "Lakeside Care", role: "Caregiver", color: "#db2777", time: "8am–4pm", dist: "2.2 mi", pay: "$23", unit: "/hr" },
    { name: "The Copper Tap", role: "Bartender", color: "#d97706", time: "7pm–1am", dist: "0.5 mi", pay: "$18", unit: "/hr" },
    { name: "Summit Events", role: "Event Setup", color: "#2563eb", time: "10am–3pm", dist: "4.0 mi", pay: "$16", unit: "/hr" },
    { name: "GreenLeaf Grocers", role: "Stock Associate", color: "#16a34a", time: "9pm–2am", dist: "1.9 mi", pay: "$17", unit: "/hr" },
    { name: "Harbor Hotel", role: "Housekeeping", color: "#0891b2", time: "8am–2pm", dist: "2.7 mi", pay: "$18", unit: "/hr" },
  ];

  function initials(name) {
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

  function shiftRow(c) {
    const li = document.createElement("li");
    li.className = "shiftrow";
    li.innerHTML =
      '<span class="shiftrow__logo" style="background:' + c.color + '">' + initials(c.name) + "</span>" +
      '<span><span class="shiftrow__role">' + c.role + "</span>" +
      '<span class="shiftrow__meta">' + c.name + " · " + c.time + " · " + c.dist + "</span></span>" +
      '<span class="shiftrow__pay">' + c.pay + "<small>" + c.unit + "</small></span>";
    li.addEventListener("click", () => toast("Shift saved · " + c.role + " at " + c.name));
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); }
    });
    return li;
  }

  const liveList = document.getElementById("liveList");
  let feedIdx = 0;
  function seedFeed() {
    liveList.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      liveList.appendChild(shiftRow(companies[(feedIdx + i) % companies.length]));
    }
    feedIdx = (feedIdx + 1) % companies.length;
  }
  seedFeed();
  // rotate one fresh shift in periodically
  setInterval(() => {
    if (document.hidden) return;
    const fresh = shiftRow(companies[feedIdx % companies.length]);
    fresh.style.animation = "none";
    liveList.insertBefore(fresh, liveList.firstChild);
    fresh.animate(
      [{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }],
      { duration: 360, easing: "ease" }
    );
    if (liveList.children.length > 4) liveList.removeChild(liveList.lastChild);
    feedIdx = (feedIdx + 1) % companies.length;
  }, 4200);

  /* ---------- search ---------- */
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const loc = document.getElementById("loc").value.trim() || "your area";
    const role = document.getElementById("role").value.trim();
    const n = 40 + Math.floor(Math.random() * 260);
    toast(role
      ? n + " " + role + " shifts found near " + loc
      : n + " open shifts found near " + loc);
  });

  document.getElementById("quickChips").addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    document.getElementById("role").value = btn.dataset.q;
    searchForm.requestSubmit();
  });

  /* ---------- count up stats ---------- */
  const counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    const target = +el.dataset.count;
    const dur = 1400;
    const start = performance.now();
    const fmt = (v) => target >= 1000 ? Math.round(v).toLocaleString() : Math.round(v);
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- wallet widget ---------- */
  const walletAmount = document.getElementById("walletAmount");
  const walletBar = document.getElementById("walletBar");
  const cashoutBtn = document.getElementById("cashoutBtn");
  const WALLET_TOTAL = 138.5;
  let walletAnimated = false;
  let cashedOut = false;
  function animateWallet() {
    if (walletAnimated) return;
    walletAnimated = true;
    walletBar.style.width = "82%";
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      walletAmount.textContent = "$" + (WALLET_TOTAL * eased).toFixed(2);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  cashoutBtn.addEventListener("click", () => {
    if (cashedOut) { toast("Already cashed out for today 🎉"); return; }
    cashedOut = true;
    walletBar.style.width = "0%";
    walletAmount.textContent = "$0.00";
    cashoutBtn.textContent = "Cashed out ✓";
    cashoutBtn.disabled = true;
    cashoutBtn.style.opacity = ".7";
    toast("$" + WALLET_TOTAL.toFixed(2) + " sent to your bank — usually instant");
  });

  /* ---------- categories ---------- */
  const cats = [
    { emoji: "🍽️", bg: "#fff1e8", title: "Hospitality", desc: "Servers, baristas, bartenders & kitchen", count: "1,240 shifts" },
    { emoji: "📦", bg: "#e6fafa", title: "Warehouse", desc: "Pickers, packers, forklift & loading", count: "980 shifts" },
    { emoji: "🚚", bg: "#ede9fe", title: "Delivery", desc: "Drivers, couriers & last-mile", count: "760 shifts" },
    { emoji: "🩺", bg: "#fce7f3", title: "Care & Health", desc: "Caregivers, aides & support staff", count: "540 shifts" },
    { emoji: "🛒", bg: "#dcfce7", title: "Retail", desc: "Stock, cashier & merchandising", count: "690 shifts" },
    { emoji: "🎪", bg: "#dbeafe", title: "Events", desc: "Setup, ushers & promo crew", count: "410 shifts" },
    { emoji: "🧹", bg: "#fef3c7", title: "Cleaning", desc: "Housekeeping & facilities", count: "320 shifts" },
    { emoji: "🏗️", bg: "#ffe4d6", title: "General Labor", desc: "Movers, helpers & site crew", count: "470 shifts" },
  ];
  const catGrid = document.getElementById("catGrid");
  cats.forEach((c) => {
    const b = document.createElement("button");
    b.className = "cat reveal";
    b.type = "button";
    b.innerHTML =
      '<span class="cat__emoji" style="background:' + c.bg + '">' + c.emoji + "</span>" +
      "<h3>" + c.title + "</h3>" +
      "<p>" + c.desc + "</p>" +
      '<span class="cat__count">' + c.count + "</span>";
    b.addEventListener("click", () => toast("Browsing " + c.title + " · " + c.count));
    catGrid.appendChild(b);
  });

  /* ---------- store + business ---------- */
  document.querySelectorAll(".store").forEach((s) => {
    s.addEventListener("click", () => toast("Opening " + s.dataset.store + " (demo)"));
  });

  const bizForm = document.getElementById("bizForm");
  bizForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("bizEmail").value.trim();
    toast("Thanks! We'll reach out to " + email + " shortly.");
    bizForm.reset();
  });

  /* ---------- scroll reveal ---------- */
  const reveals = () => document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        if (entry.target.querySelector("[data-count]") || entry.target.matches("[data-count]")) {
          /* handled below */
        }
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    reveals().forEach((el) => io.observe(el));

    // counters + wallet have their own observer for precise trigger
    const fx = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target.matches("[data-count]")) animateCount(entry.target);
        if (entry.target.classList.contains("wallet")) animateWallet();
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => fx.observe(c));
    const wallet = document.querySelector(".wallet");
    if (wallet) fx.observe(wallet);
  } else {
    reveals().forEach((el) => el.classList.add("in"));
    counters.forEach(animateCount);
    animateWallet();
  }
})();
