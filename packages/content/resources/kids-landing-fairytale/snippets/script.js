/* ====================================================================
   Once Upon a Tale — interactions
   Vanilla JS, no libs. Every interaction actually works.
   ==================================================================== */
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
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ================================================================
     FEATURED TALES — render cards, queue toggling
     ================================================================ */
  var TALES = [
    { id: "fox",     title: "The Lantern Fox",       emoji: "🦊", g: "linear-gradient(160deg,#ff9a6c,#e0607c)", mins: 6,  age: "4–7", rating: "4.9", ribbon: "New" },
    { id: "castle",  title: "The Cloud Castle",      emoji: "🏰", g: "linear-gradient(160deg,#7cc0e8,#5e8ad6)", mins: 8,  age: "5–8", rating: "4.8", ribbon: "" },
    { id: "dragon",  title: "Ember the Kind Dragon", emoji: "🐉", g: "linear-gradient(160deg,#ffb86c,#e0607c)", mins: 7,  age: "4–7", rating: "5.0", ribbon: "Loved" },
    { id: "moon",    title: "The Moon's Lullaby",    emoji: "🌙", g: "linear-gradient(160deg,#8a7cd6,#5e5ad6)", mins: 5,  age: "3–6", rating: "4.9", ribbon: "" },
    { id: "rose",    title: "The Singing Rose",      emoji: "🌹", g: "linear-gradient(160deg,#ff7fa8,#d6488a)", mins: 6,  age: "5–8", rating: "4.7", ribbon: "" },
    { id: "swan",    title: "Brave Little Swan",     emoji: "🦢", g: "linear-gradient(160deg,#67c7c0,#3a8ed6)", mins: 9,  age: "6–9", rating: "4.8", ribbon: "" },
    { id: "lamp",    title: "The Wishing Lamp",      emoji: "🪔", g: "linear-gradient(160deg,#ffcf6c,#d69a3a)", mins: 7,  age: "5–8", rating: "4.9", ribbon: "" },
    { id: "forest",  title: "The Whispering Wood",   emoji: "🌲", g: "linear-gradient(160deg,#6cc28a,#3a9a64)", mins: 8,  age: "6–9", rating: "4.6", ribbon: "" }
  ];

  var queue = [];
  var grid = document.getElementById("taleGrid");
  var queueStatus = document.getElementById("queueStatus");

  function renderTales() {
    if (!grid) return;
    var frag = document.createDocumentFragment();
    TALES.forEach(function (t) {
      var card = document.createElement("article");
      card.className = "tale-card";
      card.setAttribute("role", "listitem");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", t.title + ", " + t.mins + " minute tale, ages " + t.age);
      card.dataset.id = t.id;

      card.innerHTML =
        '<div class="tale-cover" style="background:' + t.g + '">' +
          (t.ribbon ? '<span class="tale-ribbon">' + t.ribbon + "</span>" : "") +
          '<span class="tale-emoji" aria-hidden="true">' + t.emoji + "</span>" +
        "</div>" +
        '<div class="tale-body">' +
          '<h3 class="tale-title">' + t.title + "</h3>" +
          '<p class="tale-meta">' +
            "<span>⏱ " + t.mins + " min</span>" +
            '<span class="dot">·</span>' +
            "<span>Ages " + t.age + "</span>" +
          "</p>" +
          '<div class="tale-foot">' +
            '<button class="tale-add" type="button" data-queued="false" aria-pressed="false">' +
              '<span class="add-ico" aria-hidden="true">＋</span><span class="add-txt">Queue</span>' +
            "</button>" +
            '<span class="tale-rating">★ ' + t.rating + "</span>" +
          "</div>" +
        "</div>";

      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  function findTale(id) {
    for (var i = 0; i < TALES.length; i++) if (TALES[i].id === id) return TALES[i];
    return null;
  }

  function toggleQueue(card, btn) {
    var id = card.dataset.id;
    var tale = findTale(id);
    if (!tale) return;
    var idx = queue.indexOf(id);
    var addTxt = btn.querySelector(".add-txt");
    var addIco = btn.querySelector(".add-ico");

    if (idx === -1) {
      queue.push(id);
      btn.dataset.queued = "true";
      btn.setAttribute("aria-pressed", "true");
      if (addTxt) addTxt.textContent = "Queued";
      if (addIco) addIco.textContent = "✓";
      if (!prefersReduced) {
        btn.classList.remove("pop");
        void btn.offsetWidth; // reflow to restart animation
        btn.classList.add("pop");
      }
      toast("“" + tale.title + "” added to tonight's queue 🌙");
    } else {
      queue.splice(idx, 1);
      btn.dataset.queued = "false";
      btn.setAttribute("aria-pressed", "false");
      if (addTxt) addTxt.textContent = "Queue";
      if (addIco) addIco.textContent = "＋";
      toast("Removed “" + tale.title + "” from the queue");
    }
    updateQueueStatus();
  }

  function updateQueueStatus() {
    if (!queueStatus) return;
    if (queue.length === 0) {
      queueStatus.textContent = "No tales queued yet — choose a favourite to begin.";
      return;
    }
    var totalMins = queue.reduce(function (sum, id) {
      var t = findTale(id); return sum + (t ? t.mins : 0);
    }, 0);
    var names = queue.map(function (id) {
      var t = findTale(id); return t ? t.title : "";
    });
    var label = queue.length === 1 ? "1 tale" : queue.length + " tales";
    queueStatus.textContent =
      label + " queued · about " + totalMins + " min of bedtime — " + names.join(", ");
  }

  if (grid) {
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".tale-add");
      var card = e.target.closest(".tale-card");
      if (!card) return;
      if (btn) {
        e.stopPropagation();
        toggleQueue(card, btn);
      } else {
        // tapping the cover/title loads it into the reader
        loadTaleIntoReader(card.dataset.id);
      }
    });
    // keyboard: Enter/Space on a focused card loads it into the reader
    grid.addEventListener("keydown", function (e) {
      if (e.target.classList && e.target.classList.contains("tale-card") &&
         (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        loadTaleIntoReader(e.target.dataset.id);
      }
    });
  }

  /* ================================================================
     READ-ALOUD PLAYER — word highlighting + progress
     ================================================================ */
  var STORIES = {
    fox:    "Once upon a frosty night, a little fox lit a lantern to guide lost travellers home.",
    castle: "High on a hill of clouds there stood a castle made entirely of morning light.",
    dragon: "Ember the dragon never breathed fire — only warm puffs that toasted marshmallows.",
    moon:   "The moon leaned close and hummed a lullaby until the whole valley fell asleep.",
    rose:   "In the royal garden bloomed a rose that sang to anyone who was feeling sad.",
    swan:   "The smallest swan was the bravest, and she taught the river not to be afraid.",
    lamp:   "Whoever polished the old lamp was granted not a wish, but a kinder heart.",
    forest: "The whispering wood remembered every story ever told beneath its leaves."
  };
  var TALE_NAMES = {
    fox: "The Lantern Fox", castle: "The Cloud Castle", dragon: "Ember the Kind Dragon",
    moon: "The Moon's Lullaby", rose: "The Singing Rose", swan: "Brave Little Swan",
    lamp: "The Wishing Lamp", forest: "The Whispering Wood"
  };

  var readerText = document.getElementById("readerText");
  var readerTale = document.getElementById("readerTale");
  var readerProgress = document.getElementById("readerProgress");
  var playBtn = document.getElementById("playBtn");
  var rewindBtn = document.getElementById("rewindBtn");
  var speedRange = document.getElementById("speedRange");
  var voiceSelect = document.getElementById("voiceSelect");

  var words = [];
  var wordIndex = 0;
  var playing = false;
  var timer = null;

  function buildWords(text) {
    if (!readerText) return;
    readerText.innerHTML = "";
    var parts = text.split(/\s+/);
    words = [];
    parts.forEach(function (w, i) {
      var span = document.createElement("span");
      span.className = "word";
      span.textContent = w;
      readerText.appendChild(span);
      if (i < parts.length - 1) readerText.appendChild(document.createTextNode(" "));
      words.push(span);
    });
  }

  function loadTaleIntoReader(id) {
    var text = STORIES[id];
    if (!text) return;
    stopPlayback();
    buildWords(text);
    if (readerTale) readerTale.textContent = TALE_NAMES[id] || "A Tale";
    setActive(-1);
    if (readerProgress) readerProgress.style.width = "0%";
    wordIndex = 0;
    toast("Loaded “" + (TALE_NAMES[id] || "tale") + "” into the read-aloud player");
    // scroll the reader into view gently
    var ra = document.getElementById("read-aloud");
    if (ra) ra.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
  }

  function setActive(idx) {
    words.forEach(function (w, i) {
      w.classList.toggle("active", i === idx);
    });
    if (readerProgress && words.length) {
      var pct = idx < 0 ? 0 : Math.round(((idx + 1) / words.length) * 100);
      readerProgress.style.width = pct + "%";
    }
  }

  function stepDelay() {
    var speed = speedRange ? parseFloat(speedRange.value) : 1;
    return Math.round(420 / speed); // base ~420ms per word
  }

  function scheduleNext() {
    clearTimeout(timer);
    if (!playing) return;
    if (wordIndex >= words.length) {
      finishPlayback();
      return;
    }
    setActive(wordIndex);
    wordIndex++;
    timer = setTimeout(scheduleNext, stepDelay());
  }

  function startPlayback() {
    if (!words.length) return;
    if (wordIndex >= words.length) wordIndex = 0;
    playing = true;
    setPlayUI(true);
    scheduleNext();
  }

  function stopPlayback() {
    playing = false;
    clearTimeout(timer);
    setPlayUI(false);
  }

  function finishPlayback() {
    playing = false;
    clearTimeout(timer);
    setPlayUI(false);
    setActive(words.length - 1);
    if (readerProgress) readerProgress.style.width = "100%";
    wordIndex = words.length;
    toast("The end. Sweet dreams 💤");
  }

  function setPlayUI(isPlaying) {
    if (!playBtn) return;
    playBtn.setAttribute("aria-pressed", String(isPlaying));
    playBtn.setAttribute("aria-label", isPlaying ? "Pause read-aloud" : "Play read-aloud");
    var ico = playBtn.querySelector(".play-icon");
    if (ico) ico.textContent = isPlaying ? "❚❚" : "▶";
  }

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      if (playing) stopPlayback();
      else startPlayback();
    });
  }
  if (rewindBtn) {
    rewindBtn.addEventListener("click", function () {
      stopPlayback();
      wordIndex = 0;
      setActive(-1);
      if (readerProgress) readerProgress.style.width = "0%";
      toast("Back to the first page");
    });
  }
  if (speedRange) {
    speedRange.addEventListener("input", function () {
      // if currently playing, the next scheduled step picks up the new speed automatically
      var v = parseFloat(speedRange.value);
      speedRange.setAttribute("aria-valuetext", v.toFixed(1) + "× speed");
    });
  }
  if (voiceSelect) {
    voiceSelect.addEventListener("change", function () {
      toast("Now narrated by " + voiceSelect.value);
    });
  }

  // initialise reader from the markup-provided words
  if (readerText) {
    words = Array.prototype.slice.call(readerText.querySelectorAll(".word"));
  }

  /* ================================================================
     EASY-READ (dyslexia-friendly) TOGGLE
     ================================================================ */
  var dysBtn = document.querySelector(".dyslexia-toggle");
  if (dysBtn) {
    dysBtn.addEventListener("click", function () {
      var on = document.body.classList.toggle("easy-read");
      dysBtn.setAttribute("aria-pressed", String(on));
      toast(on ? "Easy-Read mode on — friendlier font & spacing" : "Easy-Read mode off");
    });
  }

  /* ================================================================
     SURPRISE ME — random tale into reader
     ================================================================ */
  var surpriseBtn = document.getElementById("surpriseBtn");
  if (surpriseBtn) {
    surpriseBtn.addEventListener("click", function () {
      var t = TALES[Math.floor(Math.random() * TALES.length)];
      loadTaleIntoReader(t.id);
    });
  }

  /* ================================================================
     CTA FORM — validation
     ================================================================ */
  var ctaForm = document.getElementById("ctaForm");
  var ctaEmail = document.getElementById("ctaEmail");
  var ctaMsg = document.getElementById("ctaMsg");

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  if (ctaForm) {
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = (ctaEmail.value || "").trim();
      if (!validEmail(v)) {
        ctaEmail.classList.add("invalid");
        ctaEmail.focus();
        if (ctaMsg) { ctaMsg.textContent = "Please enter a valid email to open the book."; ctaMsg.classList.remove("ok"); }
        toast("Hmm — that email doesn't look right ✦");
        return;
      }
      ctaEmail.classList.remove("invalid");
      var first = v.split("@")[0];
      if (ctaMsg) {
        ctaMsg.textContent = "Welcome, " + first + "! Your storybook is opening — check your inbox.";
        ctaMsg.classList.add("ok");
      }
      ctaForm.reset();
      toast("Once upon a time… your trial begins! 📖✨");
    });
    ctaEmail.addEventListener("input", function () {
      if (ctaEmail.classList.contains("invalid") && validEmail(ctaEmail.value.trim())) {
        ctaEmail.classList.remove("invalid");
      }
    });
  }

  /* ================================================================
     INIT
     ================================================================ */
  renderTales();
  updateQueueStatus();
})();
