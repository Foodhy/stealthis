/* ===== Lulla & Moon — nursery landing interactions ===== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

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

  /* ---------- Gentle Web Audio chime ---------- */
  var audioCtx = null;
  var NOTES = { C: 261.63, E: 329.63, G: 392.0, A: 440.0 };

  function ensureAudio() {
    if (audioCtx) return audioCtx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    return audioCtx;
  }

  function playChime(noteName) {
    var ctx = ensureAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var base = NOTES[noteName] || NOTES.C;
    // soft two-note bell: root + a fifth above, very quiet
    [base, base * 1.5].forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      var t0 = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.07, t0 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 1.5);
    });
  }

  /* ---------- Easy-read toggle ---------- */
  var calmToggle = document.getElementById("calmToggle");
  if (calmToggle) {
    calmToggle.addEventListener("click", function () {
      var on = document.body.classList.toggle("easy-read");
      calmToggle.setAttribute("aria-pressed", String(on));
      toast(on ? "Easy-read on — roomier text" : "Easy-read off");
    });
  }

  /* ---------- Hero hush button ---------- */
  var hushBtn = document.getElementById("hushBtn");
  var hushLabel = document.getElementById("hushLabel");
  if (hushBtn) {
    hushBtn.addEventListener("click", function () {
      var pressed = hushBtn.getAttribute("aria-pressed") === "true";
      if (pressed) {
        hushBtn.setAttribute("aria-pressed", "false");
        if (hushLabel) hushLabel.textContent = "Play a hush";
        stopAll();
        toast("Shh… all quiet now");
      } else {
        hushBtn.setAttribute("aria-pressed", "true");
        if (hushLabel) hushLabel.textContent = "Quiet please";
        playChime("A");
        setNowPlaying("Gentle hush — soft white noise drifting");
        toast("A soft hush is drifting in");
      }
    });
  }

  /* ---------- Lullaby player ---------- */
  var lullButtons = Array.prototype.slice.call(
    document.querySelectorAll(".lull")
  );
  var nowPlaying = document.getElementById("nowPlaying");
  var nowPlayingText = document.getElementById("nowPlayingText");
  var currentBtn = null;

  function setNowPlaying(text) {
    if (!nowPlaying || !nowPlayingText) return;
    nowPlayingText.textContent = text;
    nowPlaying.classList.add("is-active");
  }

  function clearNowPlaying() {
    if (!nowPlaying || !nowPlayingText) return;
    nowPlayingText.textContent = "Nothing playing — choose a lullaby above.";
    nowPlaying.classList.remove("is-active");
  }

  function stopAll() {
    lullButtons.forEach(function (b) {
      b.classList.remove("is-playing");
    });
    currentBtn = null;
    clearNowPlaying();
  }

  lullButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var nameEl = btn.querySelector(".lull__name");
      var name = nameEl ? nameEl.textContent.trim() : "Lullaby";

      if (currentBtn === btn) {
        // toggle off
        btn.classList.remove("is-playing");
        currentBtn = null;
        clearNowPlaying();
        toast("Paused " + name);
        return;
      }

      // switch to this one
      lullButtons.forEach(function (b) {
        b.classList.remove("is-playing");
      });
      btn.classList.add("is-playing");
      currentBtn = btn;

      playChime(btn.getAttribute("data-note"));
      var len = btn.getAttribute("data-len") || "";
      setNowPlaying("Now playing · " + name + (len ? " · " + len : ""));
      toast("Drifting into “" + name + "”");

      if (!prefersReducedMotion) {
        btn.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.015)" },
            { transform: "scale(1)" },
          ],
          { duration: 320, easing: "ease-out" }
        );
      }
    });
  });

  /* ---------- Signup form ---------- */
  var form = document.getElementById("signupForm");
  var emailInput = document.getElementById("email");
  var emailError = document.getElementById("emailError");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(show) {
    if (!emailError || !emailInput) return;
    emailError.hidden = !show;
    emailInput.classList.toggle("is-invalid", show);
    emailInput.setAttribute("aria-invalid", show ? "true" : "false");
  }

  if (form && emailInput) {
    emailInput.addEventListener("input", function () {
      if (!emailError.hidden && EMAIL_RE.test(emailInput.value.trim())) {
        showError(false);
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = emailInput.value.trim();
      if (!EMAIL_RE.test(value)) {
        showError(true);
        emailInput.focus();
        return;
      }
      showError(false);
      form.reset();
      toast("Your invite is on its way — sweet dreams ✨");
    });
  }

  /* ---------- Soft reveal on scroll ---------- */
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealEls = document.querySelectorAll(".card, .quote, .lull-card");
    revealEls.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = "opacity .6s ease, transform .6s ease";
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "none";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }
})();
