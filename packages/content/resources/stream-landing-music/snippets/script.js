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

  /* ---------- Gradient swatch generator ---------- */
  var palettes = [
    ["#8b5cf6", "#ec4899"], ["#ec4899", "#fb923c"], ["#6366f1", "#8b5cf6"],
    ["#fb923c", "#f43f5e"], ["#06b6d4", "#8b5cf6"], ["#f43f5e", "#fb923c"],
    ["#22d3ee", "#3b82f6"], ["#a855f7", "#fb7185"], ["#10b981", "#06b6d4"],
    ["#f59e0b", "#ec4899"], ["#7c3aed", "#2dd4bf"], ["#fb7185", "#fbbf24"]
  ];
  function gradFor(i, deg) {
    var p = palettes[i % palettes.length];
    return "linear-gradient(" + (deg || 135) + "deg, " + p[0] + ", " + p[1] + ")";
  }

  /* ---------- Album wall ---------- */
  var wallTitles = [
    "Halcyon", "Neon Tide", "Glasshouse", "Lowlight", "Afterglow", "Driftwood",
    "Velvet Hours", "Paper Moons", "Static Bloom", "Goldenrod", "Cassette", "Midnight Oil"
  ];
  var wall = document.getElementById("albumWall");
  if (wall) {
    var count = window.innerWidth <= 520 ? 9 : window.innerWidth <= 720 ? 8 : 12;
    for (var i = 0; i < count; i++) {
      var tile = document.createElement("div");
      tile.className = "tile";
      tile.style.background = gradFor(i, 120 + (i % 4) * 20);
      var tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = wallTitles[i % wallTitles.length];
      tile.appendChild(tag);
      wall.appendChild(tile);
    }
  }

  /* ---------- Artist spotlight ---------- */
  var artists = [
    { name: "Saint Vela", genre: "Synth-pop", monthly: "8.4M", track: "Glasshouse" },
    { name: "The Lowlights", genre: "Indie rock", monthly: "5.1M", track: "Paper Moons" },
    { name: "Mara Quill", genre: "Neo-soul", monthly: "3.9M", track: "Velvet Hours" },
    { name: "Cobalt Youth", genre: "Electronic", monthly: "6.7M", track: "Static Bloom" },
    { name: "River & Stone", genre: "Folk", monthly: "2.3M", track: "Driftwood" },
    { name: "Nova Sett", genre: "Hyperpop", monthly: "4.5M", track: "Afterglow" },
    { name: "Juno Reyes", genre: "Latin", monthly: "9.2M", track: "Goldenrod" }
  ];
  var row = document.getElementById("artistRow");
  if (row) {
    artists.forEach(function (a, i) {
      var card = document.createElement("article");
      card.className = "artist";
      card.setAttribute("role", "listitem");
      card.tabIndex = 0;
      card.innerHTML =
        '<div class="artist-cover" style="background:' + gradFor(i + 2) + '">' +
          '<span class="artist-badge">★ ' + a.monthly + '</span>' +
          '<button class="artist-play" type="button" aria-label="Play ' + a.track + ' by ' + a.name + '">' +
            '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 4v16l13-8z"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="artist-meta">' +
          '<h3>' + a.name + '</h3>' +
          '<span>' + a.genre + '</span>' +
          '<span class="monthly">Latest: ' + a.track + '</span>' +
        '</div>';
      function play() { setNowPlaying(a.track, a.name, i + 2); toast("Now playing " + a.track + " — " + a.name); }
      card.querySelector(".artist-play").addEventListener("click", function (e) { e.stopPropagation(); play(); });
      card.addEventListener("click", play);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); }
      });
      row.appendChild(card);
    });
  }

  /* ---------- Now playing (hero + phone mock) ---------- */
  var nowTrack = document.getElementById("nowTrack");
  var phoneTrack = document.getElementById("phoneTrack");
  var phoneArtist = document.getElementById("phoneArtist");
  var phoneCover = document.getElementById("phoneCover");
  function setNowPlaying(track, artist, gi) {
    if (nowTrack) nowTrack.textContent = track + " — " + artist;
    if (phoneTrack) phoneTrack.textContent = track;
    if (phoneArtist) phoneArtist.textContent = artist;
    if (phoneCover) phoneCover.style.background = gradFor(gi || 1);
  }

  /* ---------- Equalizer play/pause ---------- */
  var eq = document.getElementById("eq");
  var nowToggle = document.getElementById("nowToggle");
  var playIcon = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>';
  var pauseIcon = '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  if (nowToggle && eq) {
    nowToggle.addEventListener("click", function () {
      var paused = eq.classList.toggle("paused");
      nowToggle.setAttribute("aria-pressed", String(!paused));
      nowToggle.setAttribute("aria-label", paused ? "Play equalizer" : "Pause equalizer");
      nowToggle.innerHTML = paused ? playIcon : pauseIcon;
      toast(paused ? "Paused" : "Playing");
    });
  }

  /* ---------- Phone progress bar loop ---------- */
  var phoneBar = document.getElementById("phoneBar");
  if (phoneBar) {
    var pct = 24;
    setInterval(function () {
      pct += 0.7;
      if (pct > 100) pct = 0;
      phoneBar.style.width = pct + "%";
    }, 220);
  }

  /* ---------- Plan billing toggle ---------- */
  var planToggle = document.querySelector(".plan-toggle");
  if (planToggle) {
    planToggle.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-period]");
      if (!btn) return;
      planToggle.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var yearly = btn.dataset.period === "yearly";
      document.querySelectorAll(".plan-price .amt").forEach(function (el) {
        el.textContent = yearly ? el.dataset.yearly : el.dataset.monthly;
      });
      document.querySelectorAll(".plan-price .per").forEach(function (el) {
        el.textContent = yearly ? "/mo, billed yearly" : "/mo";
      });
      toast(yearly ? "Yearly pricing — save 20%" : "Monthly pricing");
    });
  }

  document.querySelectorAll("[data-plan]").forEach(function (b) {
    b.addEventListener("click", function () { toast("Starting your " + b.dataset.plan + " plan — 3 months free"); });
  });
  document.querySelectorAll("[data-store]").forEach(function (b) {
    b.addEventListener("click", function () { toast("Opening " + b.dataset.store + " (demo)"); });
  });
  document.querySelectorAll("[data-action='login']").forEach(function (b) {
    b.addEventListener("click", function () { toast("Log in is part of the demo only"); });
  });

  /* ---------- Hero email form ---------- */
  var heroForm = document.getElementById("heroForm");
  if (heroForm) {
    var emailInput = document.getElementById("heroEmail");
    heroForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
      if (!valid) {
        emailInput.classList.add("invalid");
        emailInput.focus();
        toast("Please enter a valid email");
        return;
      }
      emailInput.classList.remove("invalid");
      toast("You're in! Check " + emailInput.value.trim() + " for your free trial");
      emailInput.value = "";
    });
    emailInput.addEventListener("input", function () { emailInput.classList.remove("invalid"); });
  }
  document.querySelectorAll("[data-action='signup']").forEach(function (b) {
    b.addEventListener("click", function () {
      toast("3 months free, then cancel anytime");
      var h = document.getElementById("heroEmail");
      if (h) { h.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(function () { h.focus(); }, 400); }
      closeMobile();
    });
  });

  /* ---------- Mobile nav ---------- */
  var burger = document.querySelector(".nav-burger");
  var mobileNav = document.getElementById("mobile-nav");
  function closeMobile() {
    if (!mobileNav) return;
    mobileNav.hidden = true;
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = mobileNav.hidden;
      mobileNav.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMobile); });
  }

  /* ---------- Nav scrolled state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
