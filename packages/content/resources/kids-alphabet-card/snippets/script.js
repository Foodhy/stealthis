(function () {
  "use strict";

  /* ---------- The A–Z deck (fictional, friendly facts) ---------- */
  var DECK = [
    { l: "A", word: "Apple", emoji: "🍎", fact: "Apples float because almost a quarter of an apple is air!" },
    { l: "B", word: "Bear", emoji: "🐻", fact: "A baby bear is called a cub and loves to tumble." },
    { l: "C", word: "Cat", emoji: "🐱", fact: "Cats say 'purr' when they feel happy and cozy." },
    { l: "D", word: "Dog", emoji: "🐶", fact: "Dogs can learn over a hundred words, just like you!" },
    { l: "E", word: "Egg", emoji: "🥚", fact: "An egg is a tiny home a baby bird grows inside." },
    { l: "F", word: "Fish", emoji: "🐠", fact: "Fish breathe underwater using gills, not a nose." },
    { l: "G", word: "Grapes", emoji: "🍇", fact: "Grapes grow in bunches on twisty climbing vines." },
    { l: "H", word: "Hat", emoji: "🎩", fact: "A hat keeps the sunshine off your nose on hot days." },
    { l: "I", word: "Igloo", emoji: "🛖", fact: "An igloo is a snug little house built out of snow blocks." },
    { l: "J", word: "Jelly", emoji: "🍮", fact: "Jelly wiggles and wobbles because it is mostly water." },
    { l: "K", word: "Kite", emoji: "🪁", fact: "A kite dances in the sky when the wind gives it a push." },
    { l: "L", word: "Lion", emoji: "🦁", fact: "A lion's roar is so loud it can be heard miles away!" },
    { l: "M", word: "Moon", emoji: "🌙", fact: "The Moon has no light of its own — it borrows the Sun's." },
    { l: "N", word: "Nest", emoji: "🪺", fact: "Birds build a soft nest to keep their eggs warm and safe." },
    { l: "O", word: "Owl", emoji: "🦉", fact: "An owl can turn its head almost all the way around." },
    { l: "P", word: "Panda", emoji: "🐼", fact: "A panda munches bamboo for many hours every single day." },
    { l: "Q", word: "Queen", emoji: "👑", fact: "A queen wears a sparkly crown on top of her head." },
    { l: "R", word: "Rocket", emoji: "🚀", fact: "A rocket pushes so hard it can zoom all the way to space." },
    { l: "S", word: "Sun", emoji: "☀️", fact: "The Sun is a giant star that keeps our whole planet warm." },
    { l: "T", word: "Tree", emoji: "🌳", fact: "Trees breathe out the fresh air that we breathe in." },
    { l: "U", word: "Umbrella", emoji: "☂️", fact: "An umbrella is a little roof you can carry in the rain." },
    { l: "V", word: "Violin", emoji: "🎻", fact: "A violin sings when you slide a bow across its strings." },
    { l: "W", word: "Whale", emoji: "🐳", fact: "A whale is the biggest animal that has ever lived!" },
    { l: "X", word: "Xylophone", emoji: "🎶", fact: "Tap a xylophone's bars to make a bright, bouncy tune." },
    { l: "Y", word: "Yo-yo", emoji: "🪀", fact: "A yo-yo rolls down its string and then climbs right back up." },
    { l: "Z", word: "Zebra", emoji: "🦓", fact: "Every zebra has stripes in a pattern all its own." }
  ];

  /* ---------- State ---------- */
  var order = DECK.map(function (_, i) { return i; }); // indexes into DECK, in display order
  var pos = 0; // position within `order`
  var visited = {};

  /* ---------- Elements ---------- */
  var card = document.getElementById("flashcard");
  var frontLetter = document.getElementById("front-letter");
  var frontArt = document.getElementById("front-art");
  var frontWord = document.getElementById("front-word");
  var badgePos = document.getElementById("badge-pos");
  var backEmoji = document.getElementById("back-emoji");
  var backWord = document.getElementById("back-word");
  var backFact = document.getElementById("back-fact");

  var prevBtn = document.getElementById("prev-btn");
  var nextBtn = document.getElementById("next-btn");
  var shuffleBtn = document.getElementById("shuffle-btn");
  var resetBtn = document.getElementById("reset-btn");
  var dyslexiaBtn = document.getElementById("dyslexia-btn");
  var sayBtn = document.getElementById("say-btn");

  var dotsWrap = document.getElementById("dots");
  var progressLabel = document.getElementById("progress-label");
  var alphaGrid = document.getElementById("alpha-grid");
  var toastEl = document.getElementById("toast");

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---------- Toast helper ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  /* ---------- Build progress dots + alpha strip once ---------- */
  function buildDots() {
    dotsWrap.innerHTML = "";
    DECK.forEach(function (entry, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dot";
      b.setAttribute("aria-label", "Go to letter " + entry.l);
      b.addEventListener("click", function () {
        var p = order.indexOf(i);
        goTo(p, true);
      });
      dotsWrap.appendChild(b);
    });
  }

  function buildAlpha() {
    alphaGrid.innerHTML = "";
    DECK.forEach(function (entry, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "alpha-btn";
      b.textContent = entry.l;
      b.setAttribute("aria-label", "Jump to letter " + entry.l + " for " + entry.word);
      b.addEventListener("click", function () {
        var p = order.indexOf(i);
        goTo(p, true);
      });
      alphaGrid.appendChild(b);
    });
  }

  function current() {
    return DECK[order[pos]];
  }

  /* ---------- Render the current card ---------- */
  function render(flipBack) {
    var c = current();
    var deckIndex = order[pos];

    if (flipBack !== false) {
      card.classList.remove("flipped");
      card.setAttribute("aria-pressed", "false");
    }

    frontLetter.textContent = c.l + c.l.toLowerCase();
    frontArt.textContent = c.emoji;
    frontWord.textContent = c.word;
    badgePos.textContent = (pos + 1) + " / " + DECK.length;

    backEmoji.textContent = c.emoji;
    backWord.textContent = c.word;
    backFact.textContent = c.fact;

    card.setAttribute(
      "aria-label",
      "Flashcard for letter " + c.l + ", " + c.word + ". Press Enter or Space to flip."
    );

    visited[deckIndex] = true;

    // progress dots — dot i maps to DECK[i]
    var dotEls = dotsWrap.children;
    for (var i = 0; i < dotEls.length; i++) {
      dotEls[i].classList.toggle("done", !!visited[i]);
      dotEls[i].classList.toggle("current", i === deckIndex);
    }

    // alpha strip highlight
    var alphaEls = alphaGrid.children;
    for (var j = 0; j < alphaEls.length; j++) {
      alphaEls[j].classList.toggle("current", j === deckIndex);
    }

    progressLabel.textContent =
      "Letter " + c.l + " — card " + (pos + 1) + " of " + DECK.length;

    // pop animation
    if (!reduceMotion) {
      card.classList.remove("popping");
      void card.offsetWidth; // reflow to restart
      card.classList.add("popping");
    }
  }

  function goTo(newPos, announce) {
    if (newPos < 0) newPos = DECK.length - 1;
    if (newPos >= DECK.length) newPos = 0;
    pos = newPos;
    render(true);
    if (announce) toast(current().l + " is for " + current().word + "!");
  }

  /* ---------- Flip ---------- */
  function flip() {
    var flipped = card.classList.toggle("flipped");
    card.setAttribute("aria-pressed", flipped ? "true" : "false");
  }

  /* ---------- Shuffle (Fisher–Yates) ---------- */
  function shuffle() {
    var activeDeckIndex = order[pos];
    for (var i = order.length - 1; i > 0; i--) {
      var k = Math.floor(Math.random() * (i + 1));
      var tmp = order[i];
      order[i] = order[k];
      order[k] = tmp;
    }
    pos = order.indexOf(activeDeckIndex); // keep the same card on screen
    render(true);
    toast("Cards shuffled! 🎉");
  }

  function resetOrder() {
    var activeDeckIndex = order[pos];
    order = DECK.map(function (_, i) { return i; });
    pos = activeDeckIndex; // back to natural index
    render(true);
    toast("Back in A–Z order");
  }

  /* ---------- Say it (Web Speech + animated mouth fallback) ---------- */
  var speakTimer;
  function sayIt() {
    var c = current();
    var phrase = c.l + " is for " + c.word;

    // animate the little mouth
    sayBtn.classList.add("talking");
    clearTimeout(speakTimer);

    var hasSpeech =
      "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

    if (hasSpeech && !reduceMotion) {
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(phrase);
        u.rate = 0.85;
        u.pitch = 1.25;
        u.onend = stopTalking;
        u.onerror = stopTalking;
        window.speechSynthesis.speak(u);
        // safety stop in case onend never fires
        speakTimer = setTimeout(stopTalking, 3500);
      } catch (e) {
        speakTimer = setTimeout(stopTalking, 1300);
      }
    } else {
      // no speech available — just animate the mouth for a beat
      speakTimer = setTimeout(stopTalking, 1300);
    }

    toast("🔊 " + phrase);
  }

  function stopTalking() {
    sayBtn.classList.remove("talking");
  }

  /* ---------- Dyslexia-friendly font toggle ---------- */
  function toggleEasyRead() {
    var on = document.body.classList.toggle("easy-read");
    dyslexiaBtn.setAttribute("aria-pressed", on ? "true" : "false");
    toast(on ? "Easy-read font on" : "Easy-read font off");
  }

  /* ---------- Wire up events ---------- */
  card.addEventListener("click", flip);
  card.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      flip();
    }
  });

  prevBtn.addEventListener("click", function () { goTo(pos - 1, false); });
  nextBtn.addEventListener("click", function () { goTo(pos + 1, false); });
  shuffleBtn.addEventListener("click", shuffle);
  resetBtn.addEventListener("click", resetOrder);
  dyslexiaBtn.addEventListener("click", toggleEasyRead);
  sayBtn.addEventListener("click", sayIt);

  // arrow keys move through the deck
  document.addEventListener("keydown", function (e) {
    if (e.target === card) return; // card handles its own keys
    var tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "ArrowLeft") {
      goTo(pos - 1, false);
    } else if (e.key === "ArrowRight") {
      goTo(pos + 1, false);
    }
  });

  /* ---------- Boot ---------- */
  buildDots();
  buildAlpha();
  render(true);
})();
