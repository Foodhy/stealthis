// Morphing Loader — pause/resume SMIL via the SVG animation timeline.
(function () {
  const demo = document.querySelector('[data-demo="Morphing Loader"]');
  const svg = document.querySelector(".morph");
  const btn = document.getElementById("loader-toggle");
  const status = document.getElementById("loader-status");
  if (!demo || !svg || !btn || !status) return;

  const SHAPES = ["ring", "square", "diamond"];
  const CYCLE = 3.6; // must match the SMIL `dur`
  let paused = false;

  function currentShape() {
    // getCurrentTime() is the SVG document timeline in seconds; it stops while paused.
    const t = typeof svg.getCurrentTime === "function" ? svg.getCurrentTime() : 0;
    const phase = ((t % CYCLE) + CYCLE) % CYCLE;
    return SHAPES[Math.floor((phase / CYCLE) * SHAPES.length) % SHAPES.length];
  }

  function render() {
    demo.dataset.paused = String(paused);
    btn.textContent = paused ? "Play" : "Pause";
    btn.setAttribute("aria-pressed", String(paused));
    status.textContent = paused
      ? "Paused on " + currentShape()
      : "Animating → " + currentShape();
  }

  function setPaused(next) {
    paused = next;
    if (paused) svg.pauseAnimations();
    else svg.unpauseAnimations();
    render();
  }

  btn.addEventListener("click", function () {
    setPaused(!paused);
  });

  // Keep the live status readable without spamming assistive tech.
  setInterval(function () {
    if (!paused) render();
  }, 600);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function applyMotionPreference(mq) {
    if (mq.matches) {
      svg.setCurrentTime(0); // freeze on the ring keyframe
      setPaused(true);
    }
  }
  if (typeof reduce.addEventListener === "function") {
    reduce.addEventListener("change", applyMotionPreference);
  }
  applyMotionPreference(reduce);

  render();
})();
