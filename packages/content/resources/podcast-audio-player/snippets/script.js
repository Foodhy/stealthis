(function () {
  "use strict";

  var audio = document.getElementById("audio");
  var player = document.querySelector(".player");
  var playBtn = document.getElementById("play");
  var back15 = document.getElementById("back15");
  var fwd15 = document.getElementById("fwd15");
  var speedBtn = document.getElementById("speed");
  var muteBtn = document.getElementById("mute");
  var vol = document.querySelector(".vol");
  var volTrack = document.getElementById("volTrack");
  var volFill = document.getElementById("volFill");
  var volKnob = document.getElementById("volKnob");
  var wave = document.getElementById("wave");
  var waveBars = document.getElementById("waveBars");
  var playhead = document.getElementById("playhead");
  var curEl = document.getElementById("current");
  var durEl = document.getElementById("duration");
  var chaptersEl = document.getElementById("chapters");
  var toastEl = document.getElementById("toast");

  var FALLBACK_DURATION = 120; // silence clip is ~2 min; used if metadata missing
  var BAR_COUNT = 64;
  var bars = [];

  var chapters = [
    { t: 0, name: "Cold open — the myth of willpower" },
    { t: 18, name: "Designing a room that thinks for you" },
    { t: 42, name: "The 90-minute attention block" },
    { t: 66, name: "Notifications as a tax you keep paying" },
    { t: 90, name: "Listener questions & rituals" },
    { t: 108, name: "Closing thoughts and next week" }
  ];

  var speeds = [1, 1.5, 2];
  var speedIndex = 0;
  var lastVolume = 0.8;

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1600);
  }

  /* ---------- helpers ---------- */
  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  function getDuration() {
    return isFinite(audio.duration) && audio.duration > 0
      ? audio.duration
      : FALLBACK_DURATION;
  }

  /* ---------- build waveform ---------- */
  function buildWave() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < BAR_COUNT; i++) {
      var b = document.createElement("span");
      b.className = "bar";
      // pseudo-random but deterministic height profile
      var h = 26 + Math.abs(Math.sin(i * 0.9) * 46) + Math.abs(Math.cos(i * 0.33) * 20);
      b.style.height = Math.min(100, h) + "%";
      frag.appendChild(b);
      bars.push(b);
    }
    waveBars.appendChild(frag);
  }

  /* ---------- build chapters ---------- */
  function buildChapters() {
    chapters.forEach(function (ch, idx) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chapter";
      btn.dataset.index = idx;
      btn.setAttribute("aria-label", "Jump to " + ch.name + " at " + fmt(ch.t));
      btn.innerHTML =
        '<span class="chapter__dot"></span>' +
        '<span class="chapter__name"></span>' +
        '<span class="chapter__time">' + fmt(ch.t) + "</span>";
      btn.querySelector(".chapter__name").textContent = ch.name;
      btn.addEventListener("click", function () {
        audio.currentTime = Math.min(ch.t, getDuration() - 0.2);
        if (audio.paused) audio.play();
        toast("Chapter: " + ch.name);
      });
      li.appendChild(btn);
      chaptersEl.appendChild(li);
    });
  }

  function activeChapter(time) {
    var active = 0;
    for (var i = 0; i < chapters.length; i++) {
      if (time >= chapters[i].t) active = i;
    }
    var nodes = chaptersEl.querySelectorAll(".chapter");
    nodes.forEach(function (n) {
      n.classList.toggle("is-active", Number(n.dataset.index) === active);
    });
  }

  /* ---------- progress render ---------- */
  function render() {
    var dur = getDuration();
    var pct = dur ? (audio.currentTime / dur) : 0;
    pct = Math.max(0, Math.min(1, pct));

    var filled = Math.round(pct * BAR_COUNT);
    for (var i = 0; i < BAR_COUNT; i++) {
      bars[i].classList.toggle("is-played", i < filled);
    }
    playhead.style.left = (pct * 100) + "%";

    curEl.textContent = fmt(audio.currentTime);
    durEl.textContent = fmt(dur);

    wave.setAttribute("aria-valuenow", Math.round(pct * 100));
    wave.setAttribute("aria-valuetext", Math.round(pct * 100) + " percent");

    activeChapter(audio.currentTime);
  }

  /* ---------- play / pause ---------- */
  function togglePlay() {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  audio.addEventListener("play", function () {
    player.classList.add("is-playing");
    wave.classList.add("is-active");
    playBtn.setAttribute("aria-pressed", "true");
    playBtn.setAttribute("aria-label", "Pause episode");
  });
  audio.addEventListener("pause", function () {
    player.classList.remove("is-playing");
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.setAttribute("aria-label", "Play episode");
  });
  audio.addEventListener("ended", function () {
    wave.classList.remove("is-active");
    toast("Episode finished");
  });

  audio.addEventListener("timeupdate", render);
  audio.addEventListener("loadedmetadata", render);
  audio.addEventListener("durationchange", render);

  playBtn.addEventListener("click", togglePlay);

  back15.addEventListener("click", function () {
    audio.currentTime = Math.max(0, audio.currentTime - 15);
    toast("−15 seconds");
  });
  fwd15.addEventListener("click", function () {
    audio.currentTime = Math.min(getDuration() - 0.2, audio.currentTime + 15);
    toast("+15 seconds");
  });

  /* ---------- speed ---------- */
  speedBtn.addEventListener("click", function () {
    speedIndex = (speedIndex + 1) % speeds.length;
    var sp = speeds[speedIndex];
    audio.playbackRate = sp;
    speedBtn.textContent = sp + "×";
    speedBtn.classList.toggle("is-boost", sp !== 1);
    toast("Speed " + sp + "×");
  });

  /* ---------- volume ---------- */
  function setVolume(v) {
    v = Math.max(0, Math.min(1, v));
    audio.volume = v;
    audio.muted = v === 0;
    volFill.style.width = (v * 100) + "%";
    volKnob.style.left = (v * 100) + "%";
    volTrack.setAttribute("aria-valuenow", Math.round(v * 100));
    vol.classList.toggle("is-muted", v === 0);
    if (v > 0) lastVolume = v;
  }

  function volFromEvent(clientX) {
    var r = volTrack.getBoundingClientRect();
    setVolume((clientX - r.left) / r.width);
  }

  var draggingVol = false;
  volTrack.addEventListener("pointerdown", function (e) {
    draggingVol = true;
    volTrack.setPointerCapture(e.pointerId);
    volFromEvent(e.clientX);
  });
  volTrack.addEventListener("pointermove", function (e) {
    if (draggingVol) volFromEvent(e.clientX);
  });
  volTrack.addEventListener("pointerup", function () { draggingVol = false; });
  volTrack.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      setVolume(audio.volume + 0.05); e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      setVolume(audio.volume - 0.05); e.preventDefault();
    }
  });

  muteBtn.addEventListener("click", function () {
    if (audio.volume === 0 || audio.muted) {
      setVolume(lastVolume || 0.8);
      toast("Unmuted");
    } else {
      setVolume(0);
      toast("Muted");
    }
  });

  /* ---------- waveform seek ---------- */
  function seekFromEvent(clientX) {
    var r = wave.getBoundingClientRect();
    var pct = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    audio.currentTime = pct * getDuration();
    render();
  }

  function markCursor(clientX) {
    var r = waveBars.getBoundingClientRect();
    var pct = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    var idx = Math.round(pct * (BAR_COUNT - 1));
    for (var i = 0; i < BAR_COUNT; i++) {
      bars[i].classList.toggle("is-cursor", i === idx);
    }
  }

  var draggingWave = false;
  wave.addEventListener("pointerdown", function (e) {
    draggingWave = true;
    wave.setPointerCapture(e.pointerId);
    seekFromEvent(e.clientX);
  });
  wave.addEventListener("pointermove", function (e) {
    markCursor(e.clientX);
    if (draggingWave) seekFromEvent(e.clientX);
  });
  wave.addEventListener("pointerup", function () { draggingWave = false; });
  wave.addEventListener("pointerleave", function () {
    bars.forEach(function (b) { b.classList.remove("is-cursor"); });
  });
  wave.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      audio.currentTime = Math.min(getDuration() - 0.2, audio.currentTime + 5);
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      audio.currentTime = Math.max(0, audio.currentTime - 5);
      e.preventDefault();
    } else if (e.key === " " || e.key === "Enter") {
      togglePlay();
      e.preventDefault();
    }
  });

  /* ---------- global keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    var isControl = /BUTTON|INPUT/.test(tag) ||
      (e.target && e.target.getAttribute("role") === "slider");
    if (e.key === " " && !isControl) {
      togglePlay();
      e.preventDefault();
    }
  });

  /* ---------- init ---------- */
  buildWave();
  buildChapters();
  setVolume(0.8);
  audio.playbackRate = 1;
  render();
})();
