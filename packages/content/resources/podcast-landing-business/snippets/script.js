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
    }, 2600);
  }

  /* ---------- mini player + waveforms ---------- */
  var player = document.getElementById("player");
  var playHero = document.getElementById("playHero");
  var playerPlay = document.getElementById("playerPlay");
  var playerClose = document.getElementById("playerClose");
  var heroWave = document.getElementById("heroWave");
  var playerWave = document.getElementById("playerWave");
  var playing = false;

  function setPlaying(state) {
    playing = state;
    if (playHero) playHero.setAttribute("aria-pressed", String(state));
    if (playerPlay) {
      playerPlay.setAttribute("aria-pressed", String(state));
      playerPlay.setAttribute("aria-label", state ? "Pause" : "Play");
    }
    [heroWave, playerWave].forEach(function (w) {
      if (w) w.classList.toggle("playing", state);
    });
  }

  function openPlayer() {
    if (player) {
      player.classList.add("open");
      player.setAttribute("aria-hidden", "false");
    }
  }
  function closePlayer() {
    if (player) {
      player.classList.remove("open");
      player.setAttribute("aria-hidden", "true");
    }
    setPlaying(false);
    toast("Playback stopped");
  }

  if (playHero) {
    playHero.addEventListener("click", function () {
      var next = !playing;
      setPlaying(next);
      if (next) {
        openPlayer();
        toast("▶ Playing EP 148 — Pricing your way out of a plateau");
      } else {
        toast("Paused");
      }
    });
  }
  if (playerPlay) {
    playerPlay.addEventListener("click", function () {
      setPlaying(!playing);
      toast(playing ? "Resumed" : "Paused");
    });
  }
  if (playerClose) playerClose.addEventListener("click", closePlayer);

  /* episode card play buttons */
  document.querySelectorAll(".ep-play").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var card = btn.closest(".ep-card");
      var title = card ? card.querySelector("h3").textContent : "episode";
      var pm = player && player.querySelector(".player-meta strong");
      if (pm) pm.textContent = title;
      openPlayer();
      setPlaying(true);
      toast("▶ Playing — " + title);
    });
  });

  /* simulated player clock */
  var elapsed = 12 * 60 + 4;
  var total = 42 * 60 + 17;
  var timeEl = document.getElementById("playerTime");
  function fmt(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }
  setInterval(function () {
    if (!playing) return;
    elapsed = elapsed >= total ? 0 : elapsed + 1;
    if (timeEl) timeEl.textContent = fmt(elapsed) + " / " + fmt(total);
  }, 1000);

  /* ---------- subscribe chips (copy feed url) ---------- */
  document.querySelectorAll("[data-feed]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var url = chip.getAttribute("data-feed");
      var label = chip.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () { toast("Feed copied — subscribe on " + label); },
          function () { toast("Subscribe on " + label); }
        );
      } else {
        toast("Subscribe on " + label);
      }
    });
  });

  /* header subscribe -> scroll to newsletter */
  var subScroll = document.querySelector("[data-subscribe-scroll]");
  if (subScroll) {
    subScroll.addEventListener("click", function () {
      var nl = document.getElementById("newsletter");
      if (nl) nl.scrollIntoView({ behavior: "smooth", block: "center" });
      var input = document.getElementById("nlEmail");
      if (input) setTimeout(function () { input.focus(); }, 500);
    });
  }

  /* ---------- takeaways expand ---------- */
  var toggleTake = document.getElementById("toggleTake");
  if (toggleTake) {
    toggleTake.addEventListener("click", function () {
      var extras = document.querySelectorAll(".take.extra");
      var expanded = toggleTake.getAttribute("aria-expanded") === "true";
      extras.forEach(function (el) { el.hidden = expanded; });
      toggleTake.setAttribute("aria-expanded", String(!expanded));
      toggleTake.textContent = expanded ? "Show 3 more" : "Show less";
    });
  }

  /* ---------- newsletter validation ---------- */
  var form = document.getElementById("nlForm");
  var email = document.getElementById("nlEmail");
  var errEl = document.getElementById("nlError");
  var okEl = document.getElementById("nlOk");
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = email.value.trim();
      var valid = re.test(val);
      if (!valid) {
        email.classList.add("invalid");
        if (errEl) errEl.hidden = false;
        if (okEl) okEl.hidden = true;
        email.focus();
        return;
      }
      email.classList.remove("invalid");
      if (errEl) errEl.hidden = true;
      if (okEl) okEl.hidden = false;
      email.value = "";
      toast("Subscribed — welcome to the Tuesday memo!");
    });
    email.addEventListener("input", function () {
      if (email.classList.contains("invalid") && re.test(email.value.trim())) {
        email.classList.remove("invalid");
        if (errEl) errEl.hidden = true;
      }
    });
  }

  /* ---------- animated stat counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var isBig = target >= 1000;
    var dur = 1400;
    var start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      var out;
      if (isBig && target >= 1000000) out = (v / 1000000).toFixed(v >= target ? 1 : 1) + "M";
      else if (isBig) out = Math.round(v / 1000) + "k";
      else out = Math.round(v) + suffix;
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- scroll reveal + counter trigger ---------- */
  var sections = document.querySelectorAll(
    ".hero-stats, .guests, .episodes, .takeaways, .newsletter"
  );
  sections.forEach(function (s) { s.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        entry.target.querySelectorAll("[data-count]").forEach(animateCount);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18 });
    sections.forEach(function (s) { io.observe(s); });
  } else {
    sections.forEach(function (s) { s.classList.add("in"); });
    document.querySelectorAll("[data-count]").forEach(animateCount);
  }
})();
