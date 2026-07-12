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

  /* ---------- Data ---------- */
  var EPISODES = [
    'EP. 214 — “The Great Cereal Debate”',
    'EP. 213 — “Is a Hot Dog a Taco?”',
    'EP. 212 — “Haunted IKEA, Part 4”',
    'EP. 211 — “Pigeons: Government Drones?”'
  ];

  var CLIPS = [
    { emoji: "🥣", title: "Cereal is legally soup", desc: "Dev builds an airtight, deeply wrong legal case.", dur: "0:38", laugh: 96 },
    { emoji: "👻", title: "The haunted meatball", desc: "Marnie screams. Pete drops the mic. Chaos.", dur: "0:52", laugh: 88 },
    { emoji: "🐦", title: "Pigeon surveillance state", desc: "A conspiracy theory that goes way too far.", dur: "1:04", laugh: 92 },
    { emoji: "🌭", title: "Taco or hot dog?", desc: "45 minutes of geometry nobody asked for.", dur: "0:41", laugh: 84 },
    { emoji: "🎸", title: "Dev's terrible jingle", desc: "He wrote a theme song. It has one chord.", dur: "0:29", laugh: 79 }
  ];

  var TOUR = [
    { m: "Jul", d: "18", city: "Austin, TX", venue: "The Laughing Armadillo", status: "open" },
    { m: "Jul", d: "26", city: "Chicago, IL", venue: "Midway Comedy Hall", status: "few" },
    { m: "Aug", d: "03", city: "Brooklyn, NY", venue: "The Basement Room", status: "sold" },
    { m: "Aug", d: "15", city: "Denver, CO", venue: "Altitude Theater", status: "open" },
    { m: "Aug", d: "22", city: "Portland, OR", venue: "The Damp Barn", status: "few" }
  ];

  /* ---------- Player toggle ---------- */
  var playBtn = document.getElementById("playBtn");
  var player = document.querySelector(".player");
  var nowEp = document.getElementById("nowEp");
  var epIndex = 0;
  var playing = false;

  function setPlaying(state) {
    playing = state;
    playBtn.setAttribute("aria-pressed", String(state));
    playBtn.setAttribute("aria-label", state ? "Pause episode" : "Play latest episode");
    player.classList.toggle("playing", state);
    if (state) {
      toast("▶ Now playing — " + nowEp.textContent.replace(/EP\. \d+ — /, ""));
    } else {
      toast("⏸ Paused. The silence is deafening.");
    }
  }

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      setPlaying(!playing);
    });
  }

  // Clicking the episode title cycles to the next episode
  if (nowEp) {
    nowEp.style.cursor = "pointer";
    nowEp.title = "Click for another episode";
    nowEp.addEventListener("click", function () {
      epIndex = (epIndex + 1) % EPISODES.length;
      nowEp.textContent = EPISODES[epIndex];
      if (playing) toast("⏭ Skipped to — " + EPISODES[epIndex].replace(/EP\. \d+ — /, ""));
    });
  }

  /* ---------- Listen chips ---------- */
  document.querySelectorAll(".chip[data-app]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      toast("Opening " + chip.getAttribute("data-app") + "… (pretend it worked)");
    });
  });

  /* ---------- Build clip reel ---------- */
  var reel = document.getElementById("reel");
  if (reel) {
    CLIPS.forEach(function (c, i) {
      var card = document.createElement("button");
      card.className = "clip";
      card.setAttribute("role", "listitem");
      card.setAttribute("aria-label", "Play clip: " + c.title);
      card.innerHTML =
        '<div class="clip-thumb" style="background:linear-gradient(150deg, hsl(' +
        (255 - i * 26) + ' 70% 22%), hsl(' + (190 + i * 8) + ' 65% 16%))">' +
        '<span aria-hidden="true">' + c.emoji + "</span>" +
        '<span class="mini-play"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>' +
        '<span class="dur">' + c.dur + "</span>" +
        "</div>" +
        '<div class="clip-body">' +
        "<h3>" + c.title + "</h3>" +
        "<p>" + c.desc + "</p>" +
        '<div class="laugh"><span aria-hidden="true">😂</span>' +
        '<span class="laugh-bar"><i data-fill="' + c.laugh + '"></i></span>' +
        '<span class="laugh-val">' + c.laugh + "%</span></div>" +
        "</div>";
      card.addEventListener("click", function () {
        toast("🎧 Clip: “" + c.title + "” — laugh-o-meter says " + c.laugh + "%");
      });
      reel.appendChild(card);
    });
  }

  /* ---------- Laugh meter animation on view ---------- */
  function fillMeters() {
    document.querySelectorAll(".laugh-bar i[data-fill]").forEach(function (el) {
      el.style.width = el.getAttribute("data-fill") + "%";
    });
  }
  if ("IntersectionObserver" in window && reel) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fillMeters(); obs.disconnect(); }
      });
    }, { threshold: 0.2 });
    io.observe(reel);
  } else {
    fillMeters();
  }

  /* ---------- Build tour list ---------- */
  var tourList = document.getElementById("tourList");
  if (tourList) {
    TOUR.forEach(function (t) {
      var li = document.createElement("li");
      li.className = "tour-row";
      var cta;
      if (t.status === "sold") {
        cta = '<span class="sold"><s>Get Tickets</s> Sold out</span>';
      } else {
        var label = t.status === "few" ? "Few left 🔥" : "Get Tickets →";
        cta = '<button class="btn-ticket" type="button" data-city="' + t.city + '">' + label + "</button>";
      }
      li.innerHTML =
        '<div class="tour-date"><span class="m">' + t.m + '</span><span class="d">' + t.d + "</span></div>" +
        '<div class="tour-info"><strong>' + t.city + "</strong><span>" + t.venue + "</span></div>" +
        '<div class="tour-cta">' + cta + "</div>";
      tourList.appendChild(li);
    });

    tourList.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-ticket");
      if (!btn) return;
      toast("🎟️ Tickets for " + btn.getAttribute("data-city") + " added to cart!");
    });
  }

  /* ---------- Subscribe form ---------- */
  var form = document.getElementById("subForm");
  var email = document.getElementById("email");
  var err = document.getElementById("subErr");
  var PUNS = [
    "You're in! Prepare for pun-ishment.",
    "Subscribed! Your inbox will never be the same.",
    "Welcome aboard, you beautiful weirdo."
  ];

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (email.value || "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      err.classList.remove("ok");
      if (!valid) {
        email.classList.add("invalid");
        email.setAttribute("aria-invalid", "true");
        err.textContent = "That email looks as fake as our facts. Try again?";
        email.focus();
        return;
      }
      email.classList.remove("invalid");
      email.removeAttribute("aria-invalid");
      var msg = PUNS[Math.floor(Math.random() * PUNS.length)];
      err.textContent = msg;
      err.classList.add("ok");
      toast("✅ " + msg);
      email.value = "";
    });

    email.addEventListener("input", function () {
      email.classList.remove("invalid");
      err.textContent = "";
      err.classList.remove("ok");
    });
  }
})();
