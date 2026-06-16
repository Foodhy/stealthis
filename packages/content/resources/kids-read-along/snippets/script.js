(function () {
  "use strict";

  // ---- Story content -------------------------------------------------------
  // Each sentence carries a scene label so the illustration caption can change.
  var STORY = [
    { text: "One frosty night the little fox climbed the tallest hill.", scene: "The snowy hill" },
    { text: "Far above, the round moon shivered in the cold dark sky.", scene: "Under the moon" },
    { text: "“Brrr,” whispered the moon, “I have lost my fuzzy mitten!”", scene: "The moon speaks" },
    { text: "So the brave fox searched the snow, the pines, and the silver pond.", scene: "The search" },
    { text: "At last, tucked in a tree, she found one warm pink mitten.", scene: "Found it!" },
    { text: "The fox tossed it up, the moon smiled, and the whole sky glowed.", scene: "A glowing sky" }
  ];

  // ---- Build word spans ----------------------------------------------------
  var storyEl = document.getElementById("storyText");
  var words = []; // { el, sentence, base } ms-per-word base duration tuning

  STORY.forEach(function (sentence, si) {
    var p = document.createElement("p");
    p.className = "story-line";
    p.style.margin = si === 0 ? "0" : "0.55em 0 0";
    var tokens = sentence.text.split(/(\s+)/);
    tokens.forEach(function (tok) {
      if (/^\s+$/.test(tok)) {
        p.appendChild(document.createTextNode(" "));
        return;
      }
      if (!tok) return;
      var span = document.createElement("span");
      span.className = "word";
      span.textContent = tok;
      span.setAttribute("role", "button");
      span.tabIndex = 0;
      span.setAttribute("aria-label", "Read from “" + tok.replace(/[“”.,!?]/g, "") + "”");
      var idx = words.length;
      span.dataset.idx = String(idx);
      words.push({ el: span, scene: sentence.scene, sceneIdx: si, raw: tok });
      p.appendChild(span);
    });
    storyEl.appendChild(p);
  });

  // ---- Elements ------------------------------------------------------------
  var playBtn = document.getElementById("playBtn");
  var playText = document.getElementById("playText");
  var restartBtn = document.getElementById("restartBtn");
  var muteBtn = document.getElementById("muteBtn");
  var speedRange = document.getElementById("speedRange");
  var speedVal = document.getElementById("speedVal");
  var progressEl = document.getElementById("wordProgress");
  var stateEl = document.getElementById("readingState");
  var sceneBadge = document.getElementById("sceneBadge");
  var sceneArt = document.getElementById("sceneArt");
  var toastEl = document.getElementById("toast");

  // ---- State ---------------------------------------------------------------
  var current = -1;
  var playing = false;
  var muted = false;
  var rate = 1;
  var timer = null;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var speech = ("speechSynthesis" in window) ? window.speechSynthesis : null;

  progressEl.textContent = "Word 0 of " + words.length;

  // ---- Toast helper --------------------------------------------------------
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  // ---- Word timing ---------------------------------------------------------
  // Base ~340ms/word, longer for long words, a beat after punctuation.
  function wordDuration(i) {
    var w = words[i].raw;
    var len = w.replace(/[“”.,!?;:]/g, "").length;
    var ms = 250 + len * 38;
    if (/[.,!?;:”]$/.test(w)) ms += 260;
    return ms / rate;
  }

  // ---- Highlight a word ----------------------------------------------------
  function paint(i) {
    if (current >= 0 && words[current]) {
      words[current].el.classList.remove("active");
    }
    for (var k = 0; k < words.length; k++) {
      words[k].el.classList.toggle("spoken", k < i);
    }
    current = i;
    if (i >= 0 && i < words.length) {
      var word = words[i];
      word.el.classList.add("active");
      word.el.classList.remove("spoken");
      progressEl.textContent = "Word " + (i + 1) + " of " + words.length;
      sceneBadge.textContent = "Page " + (word.sceneIdx + 1) + " · " + word.scene;
      scrollIntoView(word.el);
    }
  }

  function scrollIntoView(el) {
    var r = el.getBoundingClientRect();
    var margin = 120;
    if (r.top < margin || r.bottom > window.innerHeight - margin) {
      el.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "center"
      });
    }
  }

  // ---- Narration engine ----------------------------------------------------
  // Uses Web Speech API per-word when available + un-muted; otherwise a timer.
  // The visual highlight is always timer-driven so it stays in sync and the
  // demo works with no audio at all.
  function speakWord(i) {
    if (speech && !muted) {
      try {
        var u = new SpeechSynthesisUtterance(words[i].raw.replace(/[“”]/g, ""));
        u.rate = Math.min(2, Math.max(0.5, rate));
        u.pitch = 1.15;
        u.volume = 1;
        speech.speak(u);
      } catch (e) { /* ignore voice errors, keep visual sync */ }
    }
  }

  function step() {
    if (!playing) return;
    var next = current + 1;
    if (next >= words.length) {
      finish();
      return;
    }
    paint(next);
    speakWord(next);
    timer = setTimeout(step, wordDuration(next));
  }

  function play(fromRestart) {
    if (playing) return;
    if (current >= words.length - 1 || current < 0) {
      if (fromRestart || current >= words.length - 1) current = -1;
    }
    playing = true;
    updatePlayUI(true);
    setState("playing", "Reading…");
    sceneArt.classList.add("reading");
    if (speech && !muted) {
      try { speech.cancel(); } catch (e) {}
    }
    // If we are mid-word, re-speak current; else advance.
    if (current < 0) {
      step();
    } else {
      paint(current);
      speakWord(current);
      timer = setTimeout(step, wordDuration(current));
    }
  }

  function pause() {
    if (!playing) return;
    playing = false;
    clearTimeout(timer);
    if (speech) { try { speech.cancel(); } catch (e) {} }
    updatePlayUI(false);
    setState("paused", "Paused");
    sceneArt.classList.remove("reading");
  }

  function finish() {
    playing = false;
    clearTimeout(timer);
    if (words[current]) words[current].el.classList.remove("active");
    for (var k = 0; k < words.length; k++) words[k].el.classList.add("spoken");
    current = words.length - 1;
    progressEl.textContent = "Word " + words.length + " of " + words.length;
    updatePlayUI(false);
    setState("done", "The End ✨");
    sceneArt.classList.remove("reading");
    sceneBadge.textContent = "The End ✨";
    toast("You read the whole story! 🦊");
  }

  function restart() {
    clearTimeout(timer);
    if (speech) { try { speech.cancel(); } catch (e) {} }
    playing = false;
    current = -1;
    for (var k = 0; k < words.length; k++) {
      words[k].el.classList.remove("active", "spoken");
    }
    progressEl.textContent = "Word 0 of " + words.length;
    sceneBadge.textContent = "Page 1 · " + STORY[0].scene;
    updatePlayUI(false);
    setState("ready", "Back to the start");
    sceneArt.classList.remove("reading");
    storyEl.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "nearest" });
    toast("Back to the beginning ⏮️");
  }

  function jumpTo(i) {
    var wasPlaying = playing;
    clearTimeout(timer);
    if (speech) { try { speech.cancel(); } catch (e) {} }
    paint(i);
    if (wasPlaying) {
      playing = true;
      speakWord(i);
      timer = setTimeout(step, wordDuration(i));
    } else {
      setState("paused", "Jumped to “" + words[i].raw.replace(/[“”.,!?]/g, "") + "”");
    }
  }

  // ---- UI helpers ----------------------------------------------------------
  function updatePlayUI(isPlaying) {
    playBtn.setAttribute("aria-pressed", String(isPlaying));
    playBtn.setAttribute("aria-label", isPlaying ? "Pause the story" : "Play the story");
    playText.textContent = isPlaying ? "Pause" : (current >= words.length - 1 ? "Read again" : "Read to me");
  }

  function setState(kind, label) {
    stateEl.classList.remove("is-playing", "is-done");
    if (kind === "playing") stateEl.classList.add("is-playing");
    if (kind === "done") stateEl.classList.add("is-done");
    stateEl.textContent = label;
  }

  // ---- Events --------------------------------------------------------------
  playBtn.addEventListener("click", function () {
    if (playing) pause(); else play(false);
  });

  restartBtn.addEventListener("click", restart);

  muteBtn.addEventListener("click", function () {
    muted = !muted;
    muteBtn.setAttribute("aria-pressed", String(muted));
    muteBtn.setAttribute("aria-label", muted ? "Unmute narration voice" : "Mute narration voice");
    if (muted && speech) { try { speech.cancel(); } catch (e) {} }
    toast(muted ? "Voice off — words still light up 🔇" : "Voice on 🔊");
  });

  speedRange.addEventListener("input", function () {
    rate = parseFloat(speedRange.value);
    speedVal.textContent = rate.toFixed(1) + "×";
    if (playing) {
      // re-time the in-flight word with the new rate
      clearTimeout(timer);
      timer = setTimeout(step, wordDuration(current < 0 ? 0 : current));
    }
  });

  // Word click / keyboard jump
  storyEl.addEventListener("click", function (e) {
    var span = e.target.closest(".word");
    if (!span) return;
    jumpTo(parseInt(span.dataset.idx, 10));
  });

  storyEl.addEventListener("keydown", function (e) {
    var span = e.target.closest(".word");
    if (!span) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      jumpTo(parseInt(span.dataset.idx, 10));
    }
  });

  // Global keyboard shortcuts (ignore while typing in the slider etc.)
  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (e.target.classList && e.target.classList.contains("word")) return;
    if (tag === "input") return;
    if (e.code === "Space") {
      e.preventDefault();
      if (playing) pause(); else play(false);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      jumpTo(Math.min(words.length - 1, current + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      jumpTo(Math.max(0, current < 0 ? 0 : current - 1));
    } else if (e.key.toLowerCase() === "r") {
      restart();
    }
  });

  // Dyslexia-friendly toggle
  var dysToggle = document.getElementById("dysToggle");
  dysToggle.addEventListener("change", function () {
    document.body.classList.toggle("dyslexia", dysToggle.checked);
    toast(dysToggle.checked ? "Easy-read font on 📖" : "Easy-read font off");
  });

  // Pause cleanly if the tab is hidden so speech doesn't run on in background.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && playing) pause();
  });

  // Cancel any queued speech on unload (some browsers keep it alive).
  window.addEventListener("beforeunload", function () {
    if (speech) { try { speech.cancel(); } catch (e) {} }
  });

  // Initial caption
  sceneBadge.textContent = "Page 1 · " + STORY[0].scene;
})();
