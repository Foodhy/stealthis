/* ============================================================
   Music — Waveform / Progress Scrubber
   Vanilla JS, no audio. Playback is simulated with timers.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  /* Deterministic pseudo-random bar pattern from a seed (mulberry32). */
  function makeBars(seed, count) {
    var t = seed >>> 0;
    function rnd() {
      t += 0x6d2b79f5;
      var x = t;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    }
    var out = [];
    for (var i = 0; i < count; i++) {
      // blend a slow sine envelope with noise so it looks like a real waveform
      var env = 0.45 + 0.4 * Math.sin((i / count) * Math.PI * 3.2 + seed);
      var h = clamp(Math.abs(env) * 0.7 + rnd() * 0.45, 0.12, 1);
      out.push(h);
    }
    return out;
  }

  /* toast helper */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-shown");
    }, 1800);
  }

  /* ============================================================
     Reusable Waveform Scrubber controller
     ============================================================ */
  function Scrubber(opts) {
    var self = this;
    this.root = opts.root;
    this.barsEl = opts.barsEl;
    this.headEl = opts.headEl || null;
    this.hoverEl = opts.hoverEl || null;
    this.tipEl = opts.tipEl || null;
    this.duration = opts.duration;
    this.barCount = opts.barCount;
    this.onSeek = opts.onSeek || function () {};
    this.bars = [];
    this.progress = 0; // 0..1

    var heights = makeBars(opts.seed, this.barCount);
    var frag = document.createDocumentFragment();
    heights.forEach(function (h) {
      var b = document.createElement("span");
      b.className = "bar";
      b.style.height = Math.round(h * 100) + "%";
      frag.appendChild(b);
      self.bars.push(b);
    });
    this.barsEl.appendChild(frag);

    /* ---- pointer geometry ---- */
    function ratioFromEvent(e) {
      var rect = self.root.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      return clamp(x / rect.width, 0, 1);
    }

    this.dragging = false;

    function down(e) {
      self.dragging = true;
      self.root.classList.add("is-dragging");
      apply(ratioFromEvent(e), true);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      e.preventDefault();
    }
    function move(e) {
      if (!self.dragging) return;
      apply(ratioFromEvent(e), true);
    }
    function up() {
      self.dragging = false;
      self.root.classList.remove("is-dragging");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }
    function apply(ratio, fromUser) {
      self.set(ratio);
      if (fromUser) self.onSeek(ratio * self.duration);
    }

    /* ---- hover preview ---- */
    this.root.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = ratioFromEvent(e);
      self.root.classList.add("is-hovering");
      if (self.hoverEl) self.hoverEl.style.left = r * 100 + "%";
      if (self.tipEl) {
        self.tipEl.style.left = r * 100 + "%";
        self.tipEl.textContent = fmt(r * self.duration);
      }
    });
    this.root.addEventListener("pointerleave", function () {
      self.root.classList.remove("is-hovering");
    });

    this.root.addEventListener("pointerdown", down);

    /* ---- keyboard (role=slider) ---- */
    this.root.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 0.1 : 0.02;
      var r = self.progress;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") r += step;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") r -= step;
      else if (e.key === "Home") r = 0;
      else if (e.key === "End") r = 1;
      else return;
      e.preventDefault();
      r = clamp(r, 0, 1);
      self.set(r);
      self.onSeek(r * self.duration);
    });

    this.set(0);
  }

  Scrubber.prototype.set = function (ratio) {
    this.progress = clamp(ratio, 0, 1);
    var cursorIdx = Math.round(this.progress * (this.bars.length - 1));
    for (var i = 0; i < this.bars.length; i++) {
      var played = i / (this.bars.length - 1) <= this.progress;
      this.bars[i].classList.toggle("is-played", played);
      this.bars[i].classList.toggle("is-cursor", i === cursorIdx && this.progress > 0 && this.progress < 1);
    }
    if (this.headEl) this.headEl.style.left = this.progress * 100 + "%";

    if (this.root.getAttribute("role") === "slider") {
      var pct = Math.round(this.progress * 100);
      this.root.setAttribute("aria-valuenow", String(pct));
      this.root.setAttribute(
        "aria-valuetext",
        fmt(this.progress * this.duration) + " of " + fmt(this.duration)
      );
    }
  };

  /* ============================================================
     Primary player — simulated playback engine
     ============================================================ */
  var PRIMARY_DURATION = 222; // 3:42

  var scrub = new Scrubber({
    root: document.getElementById("scrub"),
    barsEl: document.getElementById("scrubBars"),
    headEl: document.getElementById("scrubHead"),
    hoverEl: document.getElementById("scrubHover"),
    tipEl: document.getElementById("scrubTip"),
    duration: PRIMARY_DURATION,
    barCount: 96,
    seed: 1337,
    onSeek: function (sec) {
      player.current = sec;
      player.render();
    }
  });

  var player = {
    current: 0,
    duration: PRIMARY_DURATION,
    playing: false,
    speed: 1,
    raf: null,
    last: 0,

    render: function () {
      curTime.textContent = fmt(this.current);
      if (!scrub.dragging) scrub.set(this.current / this.duration);
    },

    tick: function (ts) {
      if (!this.playing) return;
      if (!this.last) this.last = ts;
      var dt = (ts - this.last) / 1000;
      this.last = ts;
      this.current += dt * this.speed;
      if (this.current >= this.duration) {
        this.current = this.duration;
        this.render();
        this.pause();
        toast("Track finished");
        // auto-reset shortly after, like a real player ending
        return;
      }
      this.render();
      this.raf = requestAnimationFrame(this.tick.bind(this));
    },

    play: function () {
      if (this.current >= this.duration) this.current = 0;
      this.playing = true;
      this.last = 0;
      playBtn.setAttribute("aria-pressed", "true");
      playBtn.setAttribute("aria-label", "Pause");
      eq.classList.add("is-on");
      this.raf = requestAnimationFrame(this.tick.bind(this));
      // pause any queue item that was acting as the active source
      stopAllQueue();
    },

    pause: function () {
      this.playing = false;
      cancelAnimationFrame(this.raf);
      playBtn.setAttribute("aria-pressed", "false");
      playBtn.setAttribute("aria-label", "Play");
      eq.classList.remove("is-on");
    },

    toggle: function () {
      this.playing ? this.pause() : this.play();
    },

    seekBy: function (delta) {
      this.current = clamp(this.current + delta, 0, this.duration);
      this.render();
    }
  };

  var playBtn = document.getElementById("play");
  var curTime = document.getElementById("curTime");
  var totTime = document.getElementById("totTime");
  var eq = document.getElementById("eq");

  totTime.textContent = fmt(PRIMARY_DURATION);

  playBtn.addEventListener("click", function () {
    player.toggle();
  });
  document.getElementById("rewind").addEventListener("click", function () {
    player.seekBy(-10);
    toast("◀ 10s");
  });
  document.getElementById("forward").addEventListener("click", function () {
    player.seekBy(10);
    toast("10s ▶");
  });

  document.getElementById("speed").addEventListener("change", function (e) {
    player.speed = parseFloat(e.target.value);
    toast("Speed " + e.target.value + "×");
  });

  /* like toggle */
  var likeBtn = document.querySelector(".like");
  likeBtn.addEventListener("click", function () {
    var on = likeBtn.getAttribute("aria-pressed") === "true";
    likeBtn.setAttribute("aria-pressed", String(!on));
    toast(on ? "Removed from Liked" : "Added to Liked Songs");
  });

  player.render();

  /* ============================================================
     Mini queue — each row has its own compact scrubber
     ============================================================ */
  var TRACKS = [
    { name: "Paper Lanterns", artist: "Velvet Static", dur: 198, seed: 21, theme: "#8b5cf6" },
    { name: "Glass Harbor", artist: "Neon Tides", dur: 245, seed: 88, theme: "#1db954" },
    { name: "Cobalt Hour", artist: "Halcyon Drift", dur: 176, seed: 305, theme: "#ff3d71" },
    { name: "Slow Static", artist: "Velvet Static", dur: 212, seed: 412, theme: "#38bdf8" }
  ];

  var queueEl = document.getElementById("queue");
  var queueControllers = [];

  function stopAllQueue() {
    queueControllers.forEach(function (c) {
      if (c.playing) c.stop();
    });
  }

  TRACKS.forEach(function (track, idx) {
    var li = document.createElement("li");
    li.className = "qitem";

    var btn = document.createElement("button");
    btn.className = "qitem__play";
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Play " + track.name);
    btn.style.background = track.theme;
    btn.innerHTML =
      '<svg class="play ico" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
      '<svg class="pause ico" viewBox="0 0 24 24"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>';

    var main = document.createElement("div");
    main.className = "qitem__main";
    main.innerHTML =
      '<div class="qitem__name">' + track.name + "</div>" +
      '<div class="qitem__artist">' + track.artist + "</div>";

    var wave = document.createElement("div");
    wave.className = "qwave";
    wave.setAttribute("role", "slider");
    wave.setAttribute("tabindex", "0");
    wave.setAttribute("aria-label", "Seek " + track.name);
    wave.setAttribute("aria-valuemin", "0");
    wave.setAttribute("aria-valuemax", "100");
    wave.setAttribute("aria-valuenow", "0");

    var dur = document.createElement("span");
    dur.className = "qitem__dur";
    dur.textContent = fmt(track.dur);

    li.appendChild(btn);
    li.appendChild(main);
    li.appendChild(wave);
    li.appendChild(dur);
    queueEl.appendChild(li);

    var ctrl = {
      playing: false,
      current: 0,
      timer: null,
      scrub: null,
      stop: function () {
        this.playing = false;
        clearInterval(this.timer);
        btn.setAttribute("aria-pressed", "false");
        li.classList.remove("is-active");
      },
      start: function () {
        // exclusive playback: stop primary + other queue items
        player.pause();
        stopAllQueue();
        this.playing = true;
        if (this.current >= track.dur) this.current = 0;
        btn.setAttribute("aria-pressed", "true");
        li.classList.add("is-active");
        var c = this;
        this.timer = setInterval(function () {
          c.current += 0.25;
          if (c.current >= track.dur) {
            c.current = track.dur;
            c.scrub.set(1);
            dur.textContent = fmt(track.dur);
            c.stop();
            return;
          }
          c.scrub.set(c.current / track.dur);
          dur.textContent = fmt(track.dur - c.current);
        }, 100);
      }
    };

    ctrl.scrub = new Scrubber({
      root: wave,
      barsEl: wave,
      duration: track.dur,
      barCount: 48,
      seed: track.seed,
      onSeek: function (sec) {
        ctrl.current = sec;
        dur.textContent = fmt(track.dur - sec);
      }
    });

    btn.addEventListener("click", function () {
      if (ctrl.playing) {
        ctrl.stop();
      } else {
        ctrl.start();
        toast("Playing · " + track.name);
      }
    });

    queueControllers.push(ctrl);
  });
})();
