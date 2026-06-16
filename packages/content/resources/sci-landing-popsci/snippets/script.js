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
    }, 2400);
  }

  /* ---------- topic palette ---------- */
  var COLORS = {
    Space: "#6b4bff",
    Biology: "#0f9d6b",
    Climate: "#1f9be0",
    Tech: "#ff7a18",
    Mind: "#e0457b"
  };

  /* ---------- story data (fictional) ---------- */
  var STORIES = [
    { topic: "Climate", title: "The ocean swallowed a decade of our heat. We just found it.", dek: "Argo float #5907021 traced 0.91 W/m² sinking past 2,000 m.", author: "L. Hartono", read: 8 },
    { topic: "Biology", title: "This fungus farms ants, and the ants seem fine with it", dek: "A 47-million-year mutualism rewrites who domesticated whom.", author: "P. Okafor", read: 5 },
    { topic: "Tech", title: "A battery made of rust could buffer an entire city", dek: "Iron-air cells hit 41 $/kWh in the Verdant Grid pilot.", author: "S. Marchetti", read: 7 },
    { topic: "Mind", title: "Your brain quietly edits time every time you blink", dek: "fMRI shows a 27 ms backfill in 1,204 fictional volunteers.", author: "R. Delacroix", read: 6 },
    { topic: "Space", title: "A perfect spiral existed 700 million years too early", dek: "Halcyon Deep Field clocks it at z = 10.2, redshift-confirmed.", author: "M. Okonkwo-Reyes", read: 9 },
    { topic: "Biology", title: "The molecule that lets tardigrades shrug off the vacuum", dek: "CAHS-D glasses their cells at a measured 0.3% hydration.", author: "T. Nguyen-Bauer", read: 4 },
    { topic: "Climate", title: "Mangroves bank more carbon than we dared to count", dek: "Coastal cores log 1.8 GtC unaccounted across the tropics.", author: "A. Mwangi", read: 6 },
    { topic: "Tech", title: "A 12-qubit chip ran the algorithm nobody could fake", dek: "Sycorax-12 sampled a 2.3 × 10¹⁶ state space in 4.2 s.", author: "J. Park-Holloway", read: 7 },
    { topic: "Space", title: "Enceladus is venting the building blocks of life", dek: "Cassini-legacy reanalysis finds phosphates at 0.5 mmol/L.", author: "F. Castellanos", read: 6 }
  ];

  /* ---------- decorative card artwork ---------- */
  function art(color, seed) {
    var c2 = color;
    var ns = "http://www.w3.org/2000/svg";
    var s = '<svg viewBox="0 0 400 158" preserveAspectRatio="none" xmlns="' + ns + '">';
    s += '<defs><linearGradient id="lg' + seed + '" x1="0" y1="0" x2="1" y2="1">';
    s += '<stop offset="0%" stop-color="' + c2 + '"/><stop offset="100%" stop-color="#0a0e2a"/></linearGradient></defs>';
    s += '<rect width="400" height="158" fill="url(#lg' + seed + ')"/>';
    // pseudo-random orbs/lines from seed
    var r = seed * 9301 + 49297;
    for (var i = 0; i < 4; i++) {
      r = (r * 9301 + 49297) % 233280;
      var x = (r / 233280) * 400;
      r = (r * 9301 + 49297) % 233280;
      var y = (r / 233280) * 158;
      r = (r * 9301 + 49297) % 233280;
      var rad = 10 + (r / 233280) * 36;
      s += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + rad.toFixed(0) + '" fill="rgba(255,255,255,' + (0.06 + i * 0.04).toFixed(2) + ')"/>';
    }
    s += '</svg>';
    return s;
  }

  /* ---------- render grid ---------- */
  var grid = document.getElementById("story-grid");
  var gridCount = document.getElementById("grid-count");

  function render(topic) {
    grid.innerHTML = "";
    var shown = 0;
    STORIES.forEach(function (st, i) {
      if (topic !== "all" && st.topic !== topic) return;
      shown++;
      var color = COLORS[st.topic];
      var card = document.createElement("article");
      card.className = "card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "link");
      card.setAttribute("aria-label", st.title + ", " + st.topic + ", " + st.read + " minute read");
      card.innerHTML =
        '<div class="card-media">' + art(color, i + 1) + "</div>" +
        '<div class="card-body">' +
        '<span class="tag" style="--c:' + color + '">' + st.topic + "</span>" +
        "<h3>" + st.title + "</h3>" +
        "<p>" + st.dek + "</p>" +
        '<div class="card-foot"><span>By ' + st.author + "</span><span aria-hidden=\"true\">•</span>" +
        '<span class="readtime">▷ ' + st.read + " min</span></div>" +
        "</div>";
      function open() { toast("Opening: " + st.title); }
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
      grid.appendChild(card);
    });
    if (gridCount) gridCount.textContent = shown + (shown === 1 ? " story" : " stories");
  }
  render("all");

  /* ---------- topic chips ---------- */
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      render(chip.dataset.topic);
    });
  });

  /* ---------- search toggle + filter ---------- */
  var searchBtn = document.getElementById("search-btn");
  var searchbar = document.getElementById("searchbar");
  var searchInput = document.getElementById("search-input");
  searchBtn.addEventListener("click", function () {
    var open = searchbar.hidden;
    searchbar.hidden = !open;
    searchBtn.setAttribute("aria-expanded", String(open));
    if (open) searchInput.focus();
  });
  searchInput.addEventListener("input", function () {
    var q = searchInput.value.trim().toLowerCase();
    var cards = grid.querySelectorAll(".card");
    var n = 0;
    cards.forEach(function (card) {
      var txt = card.textContent.toLowerCase();
      var match = !q || txt.indexOf(q) !== -1;
      card.classList.toggle("hide", !match);
      if (match) n++;
    });
    if (gridCount) gridCount.textContent = q ? n + ' match' + (n === 1 ? "" : "es") + ' for "' + q + '"' : n + " stories";
  });

  /* ---------- read links + cover / trending ---------- */
  document.querySelectorAll("[data-read]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Opening: " + el.dataset.read);
    });
  });

  /* ---------- explainer cards ---------- */
  document.querySelectorAll(".exp-card").forEach(function (card) {
    card.setAttribute("tabindex", "0");
    var title = card.querySelector("h3").textContent;
    function go() { toast("Explainer: " + title); }
    card.addEventListener("click", go);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter") go();
    });
  });

  /* ---------- newsletter form ---------- */
  var form = document.getElementById("sub-form");
  var email = document.getElementById("sub-email");
  var msg = document.getElementById("sub-msg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = email.value.trim();
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!valid) {
      msg.textContent = "Please enter a valid email address.";
      msg.className = "sub-msg err";
      email.focus();
      return;
    }
    msg.textContent = "You're in! Confirmation sent to " + v + ".";
    msg.className = "sub-msg ok";
    email.value = "";
    toast("Subscribed — welcome aboard ✨");
  });

  document.getElementById("join-btn").addEventListener("click", function () {
    document.getElementById("subscribe").scrollIntoView({ behavior: "smooth" });
    setTimeout(function () { email.focus(); }, 500);
  });

  /* ---------- count-up animations ---------- */
  function animateCount(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var suffix = el.dataset.suffix || "";
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- hero starfield ---------- */
  var starGroup = document.querySelector(".hero-stars");
  if (starGroup) {
    var stars = "";
    for (var i = 0; i < 50; i++) {
      var x = Math.random() * 600, y = Math.random() * 420, r = Math.random() * 1.4 + 0.3;
      stars += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + r.toFixed(1) + '" opacity="' + (0.4 + Math.random() * 0.6).toFixed(2) + '"/>';
    }
    starGroup.innerHTML = stars;
  }
})();
