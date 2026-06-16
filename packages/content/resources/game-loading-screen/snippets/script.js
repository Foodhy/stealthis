(() => {
  "use strict";

  // ---------- Elements ----------
  const screen = document.getElementById("loadingScreen");
  const fill = document.getElementById("progressFill");
  const pctEl = document.getElementById("progressPct");
  const bar = document.getElementById("progressBar");
  const statusEl = document.getElementById("progressStatus");
  const tipText = document.getElementById("tipText");
  const continuePrompt = document.getElementById("continuePrompt");
  const continueBtn = document.getElementById("continueBtn");
  const restartBtn = document.getElementById("restartBtn");
  const glyph = document.getElementById("loaderGlyph");
  const toastEl = document.getElementById("toast");

  // ---------- Data ----------
  const TIPS = [
    "Parrying just before impact refunds 30% stamina and staggers Hollow enemies.",
    "Ember shards glow brighter near hidden walls. Follow the light.",
    "The Hollow Court is weak to Voltcraft. Socket a Storm Rune before the gates.",
    "Sprinting drains Resolve in Nightmare tier — pace your approach to the Citadel.",
    "You can re-spec at any Vanguard bonfire for 200 ash marks.",
    "Bell Wardens telegraph their slam twice. The third toll is the real one.",
    "Co-op partners share ember pickups in Act III. Be generous — or don't.",
    "Holding the dodge key performs a phase-step through thin projectiles.",
  ];

  const STATUS_STAGES = [
    [0, "Initializing world state…"],
    [12, "Streaming terrain — Ashen Reach…"],
    [28, "Decompressing citadel geometry…"],
    [45, "Loading Hollow Court AI behaviors…"],
    [62, "Compiling shaders (gloomlight pass)…"],
    [78, "Spawning entities + loot tables…"],
    [90, "Syncing Vanguard profile…"],
    [97, "Finalizing…"],
  ];

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2200);
  }

  // ---------- Tips rotation ----------
  let tipIndex = 0;
  let tipTimer = null;

  function cycleTip() {
    tipText.classList.add("is-swapping");
    setTimeout(() => {
      tipIndex = (tipIndex + 1) % TIPS.length;
      tipText.textContent = TIPS[tipIndex];
      tipText.classList.remove("is-swapping");
    }, 350);
  }

  function startTips() {
    stopTips();
    tipTimer = setInterval(cycleTip, 4200);
  }

  function stopTips() {
    if (tipTimer) clearInterval(tipTimer);
    tipTimer = null;
  }

  // ---------- Load simulation ----------
  let progress = 0;
  let rafId = null;
  let hitchUntil = 0;
  let done = false;

  function statusFor(p) {
    let label = STATUS_STAGES[0][1];
    for (const [threshold, text] of STATUS_STAGES) {
      if (p >= threshold) label = text;
    }
    return label;
  }

  function render() {
    const p = Math.min(100, Math.floor(progress));
    fill.style.width = p + "%";
    pctEl.textContent = p + "%";
    bar.setAttribute("aria-valuenow", String(p));
    statusEl.textContent = done ? "Load complete" : statusFor(p);
  }

  function tick(now) {
    if (done) return;

    if (now >= hitchUntil) {
      // Variable speed: fast early, slow near milestones, with random hitches.
      const remaining = 100 - progress;
      let speed = 0.08 + Math.random() * 0.5 + remaining * 0.004;

      // Slow crawl in the last stretch for drama.
      if (progress > 88) speed *= 0.3;

      progress += speed;

      // Occasional hitch: freeze for 250–900ms (more likely mid-load).
      if (Math.random() < 0.025 && progress < 94) {
        hitchUntil = now + 250 + Math.random() * 650;
      }
    }

    if (progress >= 100) {
      progress = 100;
      finishLoad();
    }

    render();
    if (!done) rafId = requestAnimationFrame(tick);
  }

  function finishLoad() {
    done = true;
    render();
    stopTips();
    glyph.classList.add("is-done");
    document.querySelector(".progress").classList.add("is-done");
    continuePrompt.hidden = false;
    continueBtn.focus();
    document.addEventListener("keydown", onAnyKey);
    toast("Load complete — press any key");
  }

  function onAnyKey(e) {
    // Ignore modifier-only presses and let the restart button keep working.
    if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
    launch();
  }

  function launch() {
    document.removeEventListener("keydown", onAnyKey);
    screen.classList.add("is-launching");
    toast("Entering The Ashen Citadel…");
    setTimeout(() => screen.classList.remove("is-launching"), 700);
  }

  // ---------- Restart ----------
  function restart() {
    cancelAnimationFrame(rafId);
    document.removeEventListener("keydown", onAnyKey);
    screen.classList.remove("is-launching");

    progress = 0;
    done = false;
    hitchUntil = 0;
    glyph.classList.remove("is-done");
    document.querySelector(".progress").classList.remove("is-done");
    continuePrompt.hidden = true;

    render();
    startTips();
    rafId = requestAnimationFrame(tick);
    toast("Replaying load sequence");
  }

  // ---------- Wire up ----------
  continueBtn.addEventListener("click", launch);
  restartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    restart();
  });

  // ---------- Boot ----------
  render();
  startTips();
  rafId = requestAnimationFrame(tick);
})();
