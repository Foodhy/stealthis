(() => {
  // Caption data (simulated timed captions)
  const captions = [
    { start: 0, end: 4, text: "Welcome to the accessible media player demonstration." },
    { start: 4, end: 8, text: "This player features full keyboard navigation." },
    { start: 8, end: 13, text: "Press Space or K to play and pause." },
    { start: 13, end: 17, text: "Use the left and right arrow keys to seek." },
    { start: 17, end: 22, text: "Press M to toggle mute, and F for fullscreen." },
    { start: 22, end: 27, text: "Captions can be toggled with the C key." },
    { start: 27, end: 32, text: "You can customize caption font size and color." },
    { start: 32, end: 37, text: "Background opacity helps readability on any content." },
    { start: 37, end: 42, text: "Captions can be positioned at the top or bottom." },
    { start: 42, end: 48, text: "All controls are accessible via keyboard and screen readers." },
    { start: 48, end: 54, text: "Proper ARIA attributes announce state changes." },
    { start: 54, end: 60, text: "Volume is adjustable with the slider control." },
    { start: 60, end: 66, text: "The progress bar allows seeking to any position." },
    { start: 66, end: 72, text: "This ensures all users can consume media content." },
    { start: 72, end: 78, text: "Inclusive design makes media available to everyone." },
    { start: 78, end: 84, text: "Custom captions meet diverse accessibility needs." },
    { start: 84, end: 90, text: "Settings are saved for a consistent experience." },
    { start: 90, end: 96, text: "Try adjusting the caption settings panel." },
    { start: 96, end: 102, text: "Explore the keyboard shortcuts for efficient control." },
    { start: 102, end: 110, text: "Thank you for exploring accessible media captions." },
    { start: 110, end: 120, text: "Building inclusive media experiences matters." },
    { start: 120, end: 130, text: "Every user deserves equal access to media content." },
    { start: 130, end: 140, text: "Accessibility is not optional, it is essential." },
    { start: 140, end: 150, text: "This concludes the accessible media captions demo." },
  ];

  const TOTAL_DURATION = 150; // seconds

  // Elements
  const player = document.getElementById("player");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const playOverlay = document.getElementById("play-overlay");
  const btnPlay = document.getElementById("btn-play");
  const btnMute = document.getElementById("btn-mute");
  const btnCaptions = document.getElementById("btn-captions");
  const btnSettings = document.getElementById("btn-settings");
  const progressBar = document.getElementById("progress-bar");
  const progressFill = document.getElementById("progress-fill");
  const timeDisplay = document.getElementById("time-display");
  const captionsEl = document.getElementById("captions");
  const captionText = document.getElementById("caption-text");
  const settingsPanel = document.getElementById("settings-panel");

  // Caption settings elements
  const capFontSize = document.getElementById("cap-font-size");
  const capFontSizeVal = document.getElementById("cap-font-size-val");
  const capBgOpacity = document.getElementById("cap-bg-opacity");
  const capBgOpacityVal = document.getElementById("cap-bg-opacity-val");
  const capColors = document.querySelectorAll(".cap-color");
  const posBtns = document.querySelectorAll(".pos-btn");

  // State
  let playing = false;
  let muted = false;
  let captionsEnabled = true;
  let currentTime = 0;
  let animFrame = null;
  let lastTimestamp = null;

  // Canvas animation (color-shifting gradient)
  const colors = [
    { r: 30, g: 15, b: 60 },
    { r: 20, g: 40, b: 80 },
    { r: 50, g: 20, b: 70 },
    { r: 15, g: 50, b: 60 },
  ];

  function lerpColor(a, b, t) {
    return {
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t),
    };
  }

  function drawCanvas() {
    const w = canvas.width;
    const h = canvas.height;
    const t = (currentTime % 20) / 20;

    const idx = Math.floor(t * colors.length) % colors.length;
    const next = (idx + 1) % colors.length;
    const frac = (t * colors.length) % 1;

    const c1 = lerpColor(colors[idx], colors[next], frac);
    const c2 = lerpColor(
      colors[(idx + 2) % colors.length],
      colors[(idx + 3) % colors.length],
      frac
    );

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, `rgb(${c1.r},${c1.g},${c1.b})`);
    grad.addColorStop(1, `rgb(${c2.r},${c2.g},${c2.b})`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Draw subtle grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Floating circle
    const cx = w / 2 + Math.sin(currentTime * 0.5) * 120;
    const cy = h / 2 + Math.cos(currentTime * 0.3) * 80;
    const circGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
    circGrad.addColorStop(0, "rgba(139,92,246,0.25)");
    circGrad.addColorStop(1, "rgba(139,92,246,0)");
    ctx.fillStyle = circGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function updateCaption() {
    if (!captionsEnabled) {
      captionText.textContent = "";
      return;
    }
    const active = captions.find((c) => currentTime >= c.start && currentTime < c.end);
    captionText.textContent = active ? active.text : "";
  }

  function updateUI() {
    const pct = (currentTime / TOTAL_DURATION) * 100;
    progressFill.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", Math.round(pct));
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(TOTAL_DURATION)}`;
    updateCaption();
  }

  function tick(timestamp) {
    if (!playing) return;
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    currentTime += delta;
    if (currentTime >= TOTAL_DURATION) {
      currentTime = 0;
      pause();
    }

    drawCanvas();
    updateUI();
    animFrame = requestAnimationFrame(tick);
  }

  function play() {
    playing = true;
    lastTimestamp = null;
    playOverlay.classList.add("hidden");
    btnPlay.querySelector(".icon-play").style.display = "none";
    btnPlay.querySelector(".icon-pause").style.display = "";
    btnPlay.setAttribute("aria-label", "Pause");
    animFrame = requestAnimationFrame(tick);
  }

  function pause() {
    playing = false;
    playOverlay.classList.remove("hidden");
    btnPlay.querySelector(".icon-play").style.display = "";
    btnPlay.querySelector(".icon-pause").style.display = "none";
    btnPlay.setAttribute("aria-label", "Play");
    if (animFrame) cancelAnimationFrame(animFrame);
  }

  function togglePlay() {
    playing ? pause() : play();
  }

  function toggleMute() {
    muted = !muted;
    btnMute.querySelector(".icon-volume").style.display = muted ? "none" : "";
    btnMute.querySelector(".icon-muted").style.display = muted ? "" : "none";
    btnMute.setAttribute("aria-label", muted ? "Unmute" : "Mute");
  }

  function toggleCaptions() {
    captionsEnabled = !captionsEnabled;
    btnCaptions.setAttribute("aria-pressed", String(captionsEnabled));
    updateCaption();
  }

  function seek(seconds) {
    currentTime = Math.max(0, Math.min(TOTAL_DURATION, currentTime + seconds));
    drawCanvas();
    updateUI();
  }

  // Event listeners
  playOverlay.addEventListener("click", togglePlay);
  btnPlay.addEventListener("click", togglePlay);
  btnMute.addEventListener("click", toggleMute);
  btnCaptions.addEventListener("click", toggleCaptions);

  btnSettings.addEventListener("click", () => {
    const isHidden = settingsPanel.hidden;
    settingsPanel.hidden = !isHidden;
  });

  // Progress bar seeking
  progressBar.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    currentTime = pct * TOTAL_DURATION;
    drawCanvas();
    updateUI();
  });

  // Keyboard controls
  player.addEventListener("keydown", (e) => {
    switch (e.key) {
      case " ":
      case "k":
      case "K":
        e.preventDefault();
        togglePlay();
        break;
      case "m":
      case "M":
        e.preventDefault();
        toggleMute();
        break;
      case "ArrowLeft":
        e.preventDefault();
        seek(-5);
        break;
      case "ArrowRight":
        e.preventDefault();
        seek(5);
        break;
      case "f":
      case "F":
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          player.requestFullscreen().catch(() => {});
        }
        break;
      case "c":
      case "C":
        e.preventDefault();
        toggleCaptions();
        break;
    }
  });

  // Caption settings
  capFontSize.addEventListener("input", () => {
    const val = capFontSize.value;
    capFontSizeVal.textContent = val + "px";
    captionText.style.fontSize = val + "px";
  });

  capBgOpacity.addEventListener("input", () => {
    const val = capBgOpacity.value;
    capBgOpacityVal.textContent = val + "%";
    captionText.style.background = `rgba(0,0,0,${val / 100})`;
  });

  capColors.forEach((btn) => {
    btn.addEventListener("click", () => {
      capColors.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      captionText.style.color = btn.dataset.color;
    });
  });

  posBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      posBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      captionsEl.dataset.pos = btn.dataset.pos;
      if (btn.dataset.pos === "top") {
        captionsEl.style.bottom = "auto";
        captionsEl.style.top = "20px";
      } else {
        captionsEl.style.top = "";
        captionsEl.style.bottom = "60px";
      }
    });
  });

  // Initial draw
  drawCanvas();
  updateUI();
})();
