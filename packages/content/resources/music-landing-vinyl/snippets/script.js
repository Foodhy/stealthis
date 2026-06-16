/* Revolver Press — vinyl / analog retro landing
   Vanilla JS only. No audio files: playback is simulated with timers + CSS. */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- catalog data ---------- */
  var PRESSINGS = [
    {
      artist: "Neon Tides", album: "Midnight Reservoir", genre: "soul",
      price: 32, disc: "#d99a4e",
      art: "linear-gradient(160deg,#8c2f22,#3a1f14 70%),radial-gradient(circle at 70% 25%,rgba(217,154,78,.6),transparent 50%)"
    },
    {
      artist: "Velvet Static", album: "Paper Lanterns", genre: "jazz",
      price: 28, disc: "#8c2f22",
      art: "linear-gradient(200deg,#2e2118,#46341f),radial-gradient(circle at 30% 70%,rgba(217,154,78,.7),transparent 55%)"
    },
    {
      artist: "The Amber Hours", album: "Slow Combustion", genre: "folk",
      price: 26, disc: "#c0a888",
      art: "linear-gradient(140deg,#5a3a1c,#241a12),repeating-linear-gradient(90deg,rgba(217,154,78,.18) 0 8px,transparent 8px 18px)"
    },
    {
      artist: "Coral & Smoke", album: "Tide Glass", genre: "soul",
      price: 34, disc: "#d99a4e",
      art: "radial-gradient(circle at 50% 30%,#d99a4e,#8c2f22 60%,#241a12)"
    },
    {
      artist: "Birch Avenue", album: "Wintering", genre: "folk",
      price: 24, disc: "#8c2f22",
      art: "linear-gradient(180deg,#46341f,#241a12),radial-gradient(circle at 80% 20%,rgba(243,231,211,.25),transparent 45%)"
    },
    {
      artist: "Loretta Vane", album: "Brass Cathedral", genre: "jazz",
      price: 30, disc: "#d99a4e",
      art: "conic-gradient(from 200deg at 50% 50%,#8c2f22,#d99a4e,#3a2a1d,#8c2f22)"
    },
    {
      artist: "Sableffield", album: "Dust & Honey", genre: "folk",
      price: 27, disc: "#c0a888",
      art: "linear-gradient(120deg,#7a4a22,#2e2118),radial-gradient(circle at 25% 80%,rgba(217,154,78,.5),transparent 50%)"
    },
    {
      artist: "Marble Choir", album: "Saltwater Hymn", genre: "soul",
      price: 35, disc: "#8c2f22",
      art: "linear-gradient(160deg,#a23a2b,#8c2f22 40%,#241a12)"
    }
  ];

  var GENRE_LABEL = { soul: "Soul", jazz: "Jazz", folk: "Folk" };

  /* ---------- render press cards ---------- */
  var grid = document.getElementById("pressGrid");
  var cardRefs = [];

  function fmtCount() {
    return (Math.floor(Math.random() * 900) + 90) + "k plays";
  }

  PRESSINGS.forEach(function (p, i) {
    var card = document.createElement("article");
    card.className = "press-card";
    card.dataset.genre = p.genre;
    card.dataset.index = String(i);
    card.style.setProperty("--disc", p.disc);

    card.innerHTML =
      '<div class="sleeve">' +
        '<div class="sleeve-art" style="background-image:' + p.art + '"></div>' +
        '<div class="sleeve-disc"></div>' +
        '<span class="sleeve-title">' + p.album + "</span>" +
      "</div>" +
      '<div class="press-meta">' +
        "<div>" +
          '<p class="press-artist">' + p.artist + "</p>" +
          '<p class="press-album">' + p.album + " · LP</p>" +
        "</div>" +
        '<span class="press-genre">' + GENRE_LABEL[p.genre] + "</span>" +
      "</div>" +
      '<div class="press-foot">' +
        '<span class="press-price">$' + p.price + ' <small>180g</small></span>' +
        '<div class="press-actions">' +
          '<button class="icon-btn like-btn" type="button" aria-pressed="false" aria-label="Like ' + p.album + '"><span class="heart" aria-hidden="true"></span></button>' +
          '<button class="icon-btn play-btn" type="button" aria-pressed="false" aria-label="Preview ' + p.album + '"><span class="play-ico" aria-hidden="true"></span></button>' +
          '<button class="icon-btn cart" type="button" aria-label="Add ' + p.album + ' to cart">+</button>' +
        "</div>" +
      "</div>";

    grid.appendChild(card);
    cardRefs.push(card);
  });

  /* ---------- like toggles ---------- */
  grid.addEventListener("click", function (e) {
    var like = e.target.closest(".like-btn");
    if (like) {
      var on = like.getAttribute("aria-pressed") === "true";
      like.setAttribute("aria-pressed", String(!on));
      like.classList.remove("bump");
      void like.offsetWidth; // reflow to restart animation
      like.classList.add("bump");
      var album = like.closest(".press-card").querySelector(".press-artist").textContent;
      toast(on ? "Removed " + album + " from favourites" : "♥ Saved " + album + " to your crate");
      return;
    }

    var cart = e.target.closest(".cart");
    if (cart) {
      var c = cart.closest(".press-card");
      var name = c.querySelector(".sleeve-title").textContent;
      bumpCart();
      toast("Added “" + name + "” to your bag · " + cartCount + " item" + (cartCount > 1 ? "s" : ""));
      return;
    }

    var play = e.target.closest(".play-btn");
    if (play) {
      togglePreview(play);
      return;
    }
  });

  /* cart counter */
  var cartCount = 0;
  function bumpCart() { cartCount += 1; }

  /* ---------- card preview playback (only one at a time) ---------- */
  var activePreview = null;
  function togglePreview(btn) {
    var card = btn.closest(".press-card");
    var isOn = btn.getAttribute("aria-pressed") === "true";

    if (activePreview && activePreview !== btn) {
      activePreview.setAttribute("aria-pressed", "false");
      activePreview.closest(".press-card").classList.remove("is-playing");
    }

    if (isOn) {
      btn.setAttribute("aria-pressed", "false");
      card.classList.remove("is-playing");
      activePreview = null;
      return;
    }

    btn.setAttribute("aria-pressed", "true");
    card.classList.add("is-playing");
    activePreview = btn;
    var album = card.querySelector(".sleeve-title").textContent;
    toast("Now previewing “" + album + "” — Side A");
  }

  /* ---------- genre tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".genre-tab"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      var g = tab.dataset.genre;
      var shown = 0;
      cardRefs.forEach(function (c) {
        var match = g === "all" || c.dataset.genre === g;
        c.classList.toggle("is-hidden", !match);
        if (match) shown += 1;
      });
      toast(g === "all" ? "Showing all " + shown + " pressings" : "Filtered to " + shown + " " + tab.textContent + " title" + (shown !== 1 ? "s" : ""));
    });
  });

  /* ---------- hero turntable (record spin + tonearm + crackle) ---------- */
  var record = document.getElementById("record");
  var platter = document.getElementById("platter");
  var tonearm = document.getElementById("tonearm");
  var crackle = document.getElementById("crackle");
  var nowSpinning = document.getElementById("nowSpinning");
  var nsText = nowSpinning.querySelector(".ns-text");
  var heroPlay = document.getElementById("heroPlay");
  var heroPlayLabel = heroPlay.querySelector(".hero-play-label");

  var spinning = false;
  var elapsed = 0;       // simulated seconds played
  var spinTimer = null;
  var TRACK_LEN = 222;   // 3:42

  function fmtTime(s) {
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  function setSpin(on) {
    spinning = on;
    record.classList.toggle("is-spinning", on);
    tonearm.classList.toggle("is-down", on);
    crackle.classList.toggle("is-live", on);
    nowSpinning.classList.toggle("is-live", on);
    platter.setAttribute("aria-pressed", String(on));
    heroPlay.setAttribute("aria-pressed", String(on));
    heroPlayLabel.textContent = on ? "Lift the needle" : "Drop the needle";

    if (on) {
      toast("Needle down — Midnight Reservoir, Side A");
      tick();
      spinTimer = setInterval(tick, 1000);
    } else {
      clearInterval(spinTimer);
      spinTimer = null;
      nsText.textContent = "Stopped — click the record";
    }
  }

  function tick() {
    elapsed += 1;
    if (elapsed >= TRACK_LEN) {
      elapsed = 0;
      toast("Side A finished — flip the record");
      setSpin(false);
      return;
    }
    nsText.textContent = "Now spinning · " + fmtTime(elapsed) + " / " + fmtTime(TRACK_LEN);
  }

  function toggleSpin() { setSpin(!spinning); }

  platter.addEventListener("click", toggleSpin);
  platter.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleSpin(); }
  });
  heroPlay.addEventListener("click", toggleSpin);

  /* ---------- newsletter cut-out ---------- */
  var form = document.getElementById("letterForm");
  var email = document.getElementById("letterEmail");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = email.value.trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) {
      email.classList.add("invalid");
      email.focus();
      toast("Hmm — that email doesn’t look right");
      return;
    }
    email.classList.remove("invalid");
    email.value = "";
    toast("You’re on the list — first dibs incoming ✉");
  });
  email.addEventListener("input", function () { email.classList.remove("invalid"); });

  /* gentle intro nudge */
  setTimeout(function () { toast("Tip: click the record to drop the needle"); }, 1100);
})();
