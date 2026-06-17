/* ============ Vox — Voice AI landing · vanilla JS ============ */
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
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- sticky nav style ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  toggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- generic waveform renderer ---------- */
  function makeWave(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = canvas.width, H = canvas.height;
    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (rect.width) {
        W = canvas.width = Math.round(rect.width * dpr);
        H = canvas.height = Math.round(rect.height * dpr);
      }
    }
    resize();
    window.addEventListener("resize", resize);

    var bars = opts.bars || 48;
    var amp = 0;            // 0..1 envelope
    var targetAmp = opts.idle != null ? opts.idle : 0.18;
    var speed = opts.speed || 1.4;
    var phase = Math.random() * 10;
    var color1 = opts.c1 || "#8a78ff";
    var color2 = opts.c2 || "#7ce0d3";
    var raf;

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      amp += (targetAmp - amp) * 0.08;
      var grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      var bw = (W / bars) * 0.55;
      var gap = W / bars;
      for (var i = 0; i < bars; i++) {
        var n = Math.sin(i * 0.5 + t * 0.004 * speed + phase) * 0.5 +
                Math.sin(i * 0.17 - t * 0.006 * speed) * 0.5;
        var h = (Math.abs(n) * 0.5 + 0.12) * amp * H;
        h = Math.max(h, dpr * 2);
        var x = i * gap + (gap - bw) / 2;
        var y = (H - h) / 2;
        var r = Math.min(bw / 2, h / 2);
        roundRect(ctx, x, y, bw, h, r);
      }
      raf = requestAnimationFrame(draw);
    }
    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
      c.fill();
    }
    raf = requestAnimationFrame(draw);

    return {
      setActive: function (on) { targetAmp = on ? (opts.active || 0.95) : (opts.idle != null ? opts.idle : 0.18); },
      setSpeed: function (s) { speed = s; },
      setColors: function (a, b) { color1 = a; color2 = b; }
    };
  }

  /* ---------- hero orb wave + press to talk ---------- */
  var heroWave = makeWave(document.getElementById("heroWave"), { bars: 40, idle: 0.25, active: 0.9, c1: "#aeb6ff", c2: "#7ce0d3" });
  var orb = document.getElementById("orb");
  var talkBtn = document.getElementById("talkBtn");
  var talkLabel = talkBtn.querySelector(".talk-label");
  var talking = false;
  var talkTimer;
  talkBtn.addEventListener("click", function () {
    talking = !talking;
    talkBtn.setAttribute("aria-pressed", String(talking));
    orb.classList.toggle("live", talking);
    heroWave.setActive(talking);
    talkLabel.textContent = talking ? "Listening…" : "Press to talk";
    clearTimeout(talkTimer);
    if (talking) {
      toast("🎙️ Listening — say something (demo)");
      talkTimer = setTimeout(function () {
        talking = false;
        talkBtn.setAttribute("aria-pressed", "false");
        orb.classList.remove("live");
        heroWave.setActive(false);
        talkLabel.textContent = "Press to talk";
        toast("✨ \"How can I help today?\"");
      }, 4200);
    }
  });

  /* ---------- voices showcase ---------- */
  var voiceWave = makeWave(document.getElementById("voiceWave"), { bars: 64, idle: 0.12, active: 0.92, c1: "#8a78ff", c2: "#7ce0d3" });
  var pills = document.querySelectorAll(".voice-pill");
  var voiceName = document.getElementById("voiceName");
  var voiceNameInline = document.getElementById("voiceNameInline");
  var voiceDesc = document.getElementById("voiceDesc");
  var playBtn = document.getElementById("playBtn");
  var playing = false;
  var playTimer;

  var voiceColors = {
    Aria: ["#8a78ff", "#aeb6ff"],
    Nico: ["#7ce0d3", "#aef0e6"],
    Sable: ["#c9a0ff", "#8a78ff"],
    Wren: ["#ffb47c", "#ffd9b0"]
  };

  function stopPlay() {
    playing = false;
    playBtn.setAttribute("aria-pressed", "false");
    voiceWave.setActive(false);
    clearTimeout(playTimer);
  }

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) { p.classList.remove("is-active"); p.setAttribute("aria-selected", "false"); });
      pill.classList.add("is-active");
      pill.setAttribute("aria-selected", "true");
      var name = pill.dataset.voice;
      voiceName.textContent = name;
      voiceNameInline.textContent = name;
      voiceDesc.textContent = pill.dataset.desc;
      voiceWave.setSpeed(parseFloat(pill.dataset.speed) || 1.4);
      var c = voiceColors[name] || ["#8a78ff", "#7ce0d3"];
      voiceWave.setColors(c[0], c[1]);
      stopPlay();
    });
  });

  playBtn.addEventListener("click", function () {
    playing = !playing;
    playBtn.setAttribute("aria-pressed", String(playing));
    voiceWave.setActive(playing);
    if (playing) {
      toast("▶ Playing " + voiceName.textContent + " (demo)");
      playTimer = setTimeout(stopPlay, 3600);
    }
  });

  /* ---------- pricing toggle ---------- */
  var billSwitch = document.getElementById("billSwitch");
  var amounts = document.querySelectorAll(".amt");
  billSwitch.addEventListener("click", function () {
    var annual = billSwitch.getAttribute("aria-checked") !== "true";
    billSwitch.setAttribute("aria-checked", String(annual));
    amounts.forEach(function (el) {
      var v = annual ? el.dataset.a : el.dataset.m;
      el.textContent = /^\d+$/.test(v) ? "$" + v : v;
    });
    toast(annual ? "Annual pricing — save 20%" : "Switched to monthly");
  });

  /* ---------- CTA form ---------- */
  var ctaForm = document.getElementById("ctaForm");
  ctaForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("ctaEmail").value.trim();
    toast("🔑 API key sent to " + (email || "your inbox") + " (demo)");
    ctaForm.reset();
  });
})();
