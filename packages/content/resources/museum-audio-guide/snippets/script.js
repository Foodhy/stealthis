(function () {
  "use strict";

  // ---- demo data: a guided tour through fictional artworks ----
  var STOPS = [
    {
      n: 5,
      gallery: "Gallery 4 · Northern Light",
      title: "The Glassblower's Hands",
      artist: "Henrik Vahl",
      year: "1872",
      medium: "Oil on panel",
      cat: "AC-1872.041",
      dur: 196,
      grad: ["#8a6a9c", "#3c2c4d"],
      transcript:
        "Vahl spent a winter in the Murano workshops, and you can feel the heat coming off the panel — the molten gather glows the same amber as the candle behind it. Look only at the hands and the rest of the room dissolves into smoke.",
    },
    {
      n: 6,
      gallery: "Gallery 4 · Northern Light",
      title: "Evening Train, Kettle Vale",
      artist: "Rosa Linde",
      year: "1901",
      medium: "Pastel on grey paper",
      cat: "AC-1901.118",
      dur: 162,
      grad: ["#5b7a8c", "#243743"],
      transcript:
        "A pastel done from memory, Linde insisted, after a single delayed journey home. The smear of the locomotive's smoke is dragged with a thumb — you can still see the print if you lean to the right.",
    },
    {
      n: 7,
      gallery: "Gallery 4 · Northern Light",
      title: "Harbour at First Frost",
      artist: "Adèle Marchetti",
      year: "1887",
      medium: "Oil on linen",
      cat: "AC-1887.214",
      dur: 228,
      grad: ["#caa45e", "#7d5a28"],
      transcript:
        "Stand close and the harbour seems to breathe. Marchetti painted this in the failing light of a December afternoon, the linen barely primed so the weave still glints through the fog. Notice how the boats are scarcely there at all — three strokes, a smear of lead-white — and yet the whole cold morning hangs upon them.",
    },
    {
      n: 8,
      gallery: "Gallery 5 · The Long Room",
      title: "Self-Portrait with Quince",
      artist: "Teodora Reyes",
      year: "1914",
      medium: "Tempera on board",
      cat: "AC-1914.077",
      dur: 174,
      grad: ["#a8584c", "#5a221c"],
      transcript:
        "Reyes painted herself nine times; this is the only version where she meets your eye. The quince — bitter, unripe — was a private joke about the academy that rejected her twice before they finally hung this very picture.",
    },
    {
      n: 9,
      gallery: "Gallery 5 · The Long Room",
      title: "Study of Falling Water",
      artist: "Marek Osei",
      year: "1959",
      medium: "Ink and gouache",
      cat: "AC-1959.302",
      dur: 141,
      grad: ["#4f8f86", "#1f4a44"],
      transcript:
        "Osei made forty of these in a single week beside the Tana falls. The white is not paint at all — it is bare paper, the water described entirely by the dark left around it.",
    },
    {
      n: 10,
      gallery: "Gallery 5 · The Long Room",
      title: "Two Chairs, Late August",
      artist: "Liv Sandström",
      year: "1978",
      medium: "Acrylic on canvas",
      cat: "AC-1978.155",
      dur: 207,
      grad: ["#c98a4a", "#6b3f1d"],
      transcript:
        "An empty room, two chairs, and a light Sandström called the most honest hour of the day. Nothing happens here, which is exactly the point — the guide before me called it the loneliest picture in the wing.",
    },
  ];

  var SPEEDS = [1.0, 1.25, 1.5, 0.75];

  // ---- state ----
  var state = {
    index: 2, // start on "Harbour at First Frost" (stop 7)
    playing: false,
    elapsed: 0, // seconds
    speedIdx: 0,
    transcript: false,
    keyBuffer: "",
  };
  var timer = null;

  // ---- elements ----
  var $ = function (id) {
    return document.getElementById(id);
  };
  var els = {
    stopNum: $("stopNum"),
    artwork: $("artwork"),
    nowGallery: $("nowGallery"),
    nowTitle: $("nowTitle"),
    nowMeta: $("nowMeta"),
    nowCat: $("nowCat"),
    elapsed: $("elapsed"),
    total: $("total"),
    seek: $("seek"),
    play: $("play"),
    playGlyph: $("playGlyph"),
    skipBack: $("skipBack"),
    skipFwd: $("skipFwd"),
    speedBtn: $("speedBtn"),
    speedVal: $("speedVal"),
    transcriptBtn: $("transcriptBtn"),
    transcriptVal: $("transcriptVal"),
    transcript: $("transcript"),
    transcriptBody: $("transcriptBody"),
    queue: $("queue"),
    queueCount: $("queueCount"),
    keyReadout: $("keyReadout"),
    keypad: $("keypad"),
    toast: $("toast"),
  };

  // ---- helpers ----
  function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + pad2(s);
  }

  var toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2200);
  }

  function current() {
    return STOPS[state.index];
  }

  function setArtwork(stop) {
    var g = stop.grad;
    els.artwork.innerHTML =
      '<svg viewBox="0 0 120 150" role="img">' +
      '<defs><linearGradient id="ga" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' +
      g[0] +
      '" /><stop offset="1" stop-color="' +
      g[1] +
      '" /></linearGradient></defs>' +
      '<rect width="120" height="150" fill="url(#ga)" />' +
      '<circle cx="78" cy="44" r="22" fill="#f3ecdd" opacity="0.5" />' +
      '<path d="M0 120 L40 70 L70 110 L95 80 L120 118 L120 150 L0 150 Z" fill="#1c1b19" opacity="0.32" />' +
      "</svg>";
  }

  // ---- render ----
  function renderNow() {
    var s = current();
    els.stopNum.textContent = pad2(s.n);
    els.nowGallery.textContent = s.gallery;
    els.nowTitle.textContent = s.title;
    els.nowMeta.textContent = s.artist + " · " + s.year + " · " + s.medium;
    els.nowCat.textContent = "Cat. " + s.cat;
    els.total.textContent = fmt(s.dur);
    els.transcriptBody.textContent = s.transcript;
    setArtwork(s);
    renderProgress();
    renderQueue();
  }

  function renderProgress() {
    var s = current();
    var pct = s.dur ? (state.elapsed / s.dur) * 100 : 0;
    pct = Math.max(0, Math.min(100, pct));
    els.elapsed.textContent = fmt(state.elapsed);
    els.seek.value = pct;
    els.seek.style.setProperty("--p", pct + "%");
  }

  function renderPlay() {
    els.playGlyph.textContent = state.playing ? "❚❚" : "▶";
    els.playGlyph.className = state.playing ? "play-glyph paused" : "play-glyph";
    els.play.setAttribute("aria-label", state.playing ? "Pause" : "Play");
    els.play.setAttribute("aria-pressed", state.playing ? "true" : "false");
  }

  function renderQueue() {
    var upcoming = [];
    for (var i = 0; i < STOPS.length; i++) {
      if (i !== state.index) upcoming.push({ i: i, s: STOPS[i] });
    }
    // show the current + everything after it, in tour order
    var order = [];
    for (var j = state.index; j < STOPS.length; j++) order.push(j);
    for (var k = 0; k < state.index; k++) order.push(k);

    els.queue.innerHTML = "";
    var shown = 0;
    order.forEach(function (idx) {
      var s = STOPS[idx];
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "queue-item" + (idx === state.index ? " is-current" : "");
      btn.setAttribute("data-idx", idx);
      btn.innerHTML =
        '<span class="q-num">' +
        pad2(s.n) +
        "</span>" +
        '<span class="q-body">' +
        '<span class="q-title">' +
        s.title +
        "</span>" +
        '<span class="q-sub">' +
        s.artist +
        " · " +
        s.year +
        "</span>" +
        "</span>" +
        (idx === state.index
          ? '<span class="q-badge">Now</span>'
          : '<span class="q-dur">' + fmt(s.dur) + "</span>");
      li.appendChild(btn);
      els.queue.appendChild(li);
      shown++;
    });
    els.queueCount.textContent = shown + " stops";
  }

  // ---- playback simulation ----
  function tick() {
    var s = current();
    var step = 0.25 * SPEEDS[state.speedIdx];
    state.elapsed += step;
    if (state.elapsed >= s.dur) {
      state.elapsed = s.dur;
      renderProgress();
      stop();
      advance(true);
      return;
    }
    renderProgress();
  }

  function start() {
    if (state.playing) return;
    state.playing = true;
    renderPlay();
    timer = setInterval(tick, 250);
  }

  function stop() {
    state.playing = false;
    renderPlay();
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function togglePlay() {
    if (state.playing) {
      stop();
    } else {
      start();
    }
  }

  function goTo(idx, autoplay) {
    if (idx < 0 || idx >= STOPS.length) return;
    var wasPlaying = state.playing || autoplay;
    stop();
    state.index = idx;
    state.elapsed = 0;
    renderNow();
    if (wasPlaying) start();
  }

  function advance(autoplay) {
    var next = state.index + 1;
    if (next >= STOPS.length) {
      toast("End of tour reached");
      return;
    }
    goTo(next, autoplay);
    toast("Now playing · Stop " + current().n);
  }

  // ---- controls ----
  els.play.addEventListener("click", togglePlay);

  els.skipBack.addEventListener("click", function () {
    state.elapsed = Math.max(0, state.elapsed - 15);
    renderProgress();
  });

  els.skipFwd.addEventListener("click", function () {
    var s = current();
    state.elapsed = Math.min(s.dur, state.elapsed + 15);
    renderProgress();
    if (state.elapsed >= s.dur) {
      stop();
      advance(true);
    }
  });

  els.seek.addEventListener("input", function () {
    var s = current();
    state.elapsed = (parseFloat(els.seek.value) / 100) * s.dur;
    renderProgress();
  });

  els.speedBtn.addEventListener("click", function () {
    state.speedIdx = (state.speedIdx + 1) % SPEEDS.length;
    els.speedVal.textContent = SPEEDS[state.speedIdx].toFixed(2).replace(/0$/, "") + "×";
    toast("Speed " + SPEEDS[state.speedIdx] + "×");
  });

  els.transcriptBtn.addEventListener("click", function () {
    state.transcript = !state.transcript;
    els.transcript.hidden = !state.transcript;
    els.transcriptBtn.setAttribute("aria-pressed", state.transcript ? "true" : "false");
    els.transcriptBtn.setAttribute("aria-expanded", state.transcript ? "true" : "false");
    els.transcriptVal.textContent = state.transcript ? "Shown" : "Hidden";
  });

  // ---- queue clicks ----
  els.queue.addEventListener("click", function (e) {
    var btn = e.target.closest(".queue-item");
    if (!btn) return;
    var idx = parseInt(btn.getAttribute("data-idx"), 10);
    if (idx === state.index) return;
    goTo(idx, false);
    toast("Jumped to Stop " + current().n);
  });

  // ---- keypad ----
  var KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "go"];

  function renderReadout() {
    els.keyReadout.textContent = state.keyBuffer === "" ? "—" : state.keyBuffer;
  }

  function pressKey(val) {
    if (val === "clear") {
      state.keyBuffer = "";
    } else if (val === "go") {
      submitStop();
      return;
    } else {
      if (state.keyBuffer.length >= 2) state.keyBuffer = "";
      state.keyBuffer += val;
    }
    renderReadout();
  }

  function submitStop() {
    var num = parseInt(state.keyBuffer, 10);
    if (isNaN(num)) {
      toast("Enter a stop number");
      return;
    }
    var idx = -1;
    for (var i = 0; i < STOPS.length; i++) {
      if (STOPS[i].n === num) {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      toast("No stop " + num + " on this tour");
      els.keyReadout.animate(
        [{ color: "#b4493a" }, { color: "" }],
        { duration: 700 }
      );
      state.keyBuffer = "";
      renderReadout();
      return;
    }
    goTo(idx, true);
    toast("Now playing · Stop " + num);
    state.keyBuffer = "";
    renderReadout();
  }

  (function buildKeypad() {
    KEYS.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      if (k === "clear") {
        b.className = "key key-fn";
        b.textContent = "Clear";
        b.setAttribute("aria-label", "Clear entry");
      } else if (k === "go") {
        b.className = "key key-fn key-go";
        b.textContent = "Go";
        b.setAttribute("aria-label", "Go to stop");
      } else {
        b.className = "key";
        b.textContent = k;
        b.setAttribute("aria-label", "Digit " + k);
      }
      b.setAttribute("data-key", k);
      els.keypad.appendChild(b);
    });
  })();

  els.keypad.addEventListener("click", function (e) {
    var b = e.target.closest(".key");
    if (!b) return;
    pressKey(b.getAttribute("data-key"));
  });

  // physical keyboard support for the keypad
  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT") return;
    if (/^[0-9]$/.test(e.key)) {
      pressKey(e.key);
    } else if (e.key === "Enter") {
      if (state.keyBuffer !== "") submitStop();
    } else if (e.key === "Backspace") {
      state.keyBuffer = state.keyBuffer.slice(0, -1);
      renderReadout();
    } else if (e.key === " " && e.target.tagName !== "BUTTON") {
      e.preventDefault();
      togglePlay();
    }
  });

  // ---- init ----
  els.speedVal.textContent = SPEEDS[0].toFixed(1) + "×";
  renderNow();
  renderPlay();
  renderReadout();
})();
