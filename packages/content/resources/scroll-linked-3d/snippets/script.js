(function () {
  "use strict";

  var track = document.getElementById("track");
  var scene = document.getElementById("scene");
  var layers = Array.prototype.slice.call(document.querySelectorAll(".layer"));
  var caps = Array.prototype.slice.call(document.querySelectorAll(".cap"));
  var railFill = document.getElementById("railFill");
  var railPct = document.getElementById("railPct");
  var railStage = document.getElementById("railStage");
  var rail = document.querySelector(".rail");
  var srProgress = document.getElementById("srProgress");
  var rmFallback = document.getElementById("rmFallback");
  var rmCards = Array.prototype.slice.call(document.querySelectorAll(".rm-card"));

  var modeBtn = document.getElementById("modeBtn");
  var modeVal = document.getElementById("modeVal");
  var driftBtn = document.getElementById("driftBtn");
  var driftVal = document.getElementById("driftVal");
  var assembleBtn = document.getElementById("assembleBtn");

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- State ---- */
  var mode = "explode"; // "explode" | "rotate"
  var driftOn = true;
  var reduce = reduceQuery.matches;

  var rawP = 0; // scroll-derived progress 0..1
  var dispP = 0; // eased/animated progress actually rendered
  var forced = null; // when snap-to-assembled is active, target progress
  var lastStage = -1;
  var ticking = false;
  var driftPhase = 0;

  /* ---- Per-layer explode config (Z depth + parallax offset) ---- */
  var layerCfg = [
    { z: -160, ox: -0.9, oy: 0.7 },
    { z: -80, ox: -0.5, oy: 0.35 },
    { z: 0, ox: 0, oy: 0 },
    { z: 90, ox: 0.55, oy: -0.4 },
    { z: 190, ox: 1.0, oy: -0.8 }
  ];

  var stageLabels = ["idle", "tilt", "explode", "inspect"];

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* Compute scroll progress of the sticky stage through its track. */
  function computeProgress() {
    var rect = track.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    // total scrollable distance while the stage is pinned
    var scrollable = rect.height - vh;
    if (scrollable <= 0) return 0;
    var travelled = clamp(-rect.top, 0, scrollable);
    return travelled / scrollable;
  }

  /* Ease progress a touch for buttery scrub without lag. */
  function ease(t) {
    // smoothstep
    return t * t * (3 - 2 * t);
  }

  function render() {
    ticking = false;

    if (reduce) {
      renderReduced();
      return;
    }

    // choose target: forced snap or live scroll
    var target = forced != null ? forced : rawP;
    // approach target for smooth motion
    dispP += (target - dispP) * 0.18;
    if (Math.abs(target - dispP) < 0.0008) dispP = target;

    var p = clamp(dispP, 0, 1);
    var e = ease(p);

    /* Scene rotation: builds up over first ~40% then holds/rotates. */
    var rotX = lerp(2, 18, ease(clamp(p / 0.45, 0, 1)));
    var rotY = mode === "rotate"
      ? lerp(-30, 30, e)
      : lerp(-18, 22, e);

    var drift = 0;
    if (driftOn) {
      driftPhase += 0.008;
      drift = Math.sin(driftPhase) * 4;
    }

    scene.style.transform =
      "rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + (rotY + drift).toFixed(2) + "deg)";

    /* Explode factor: 0 until 25% progress, ramps to 1 by 95%. */
    var explode = mode === "explode"
      ? ease(clamp((p - 0.22) / 0.7, 0, 1))
      : ease(clamp((p - 0.4) / 0.5, 0, 1)) * 0.35;

    for (var i = 0; i < layers.length; i++) {
      var cfg = layerCfg[i];
      var z = cfg.z * explode;
      var tx = cfg.ox * 46 * explode;
      var ty = cfg.oy * 40 * explode;
      layers[i].style.transform =
        "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px," + z.toFixed(1) + "px)";
    }

    updateHud(p);

    // keep animating while drifting or approaching target
    if (driftOn || forced != null || Math.abs((forced != null ? forced : rawP) - dispP) > 0.0008) {
      requestFrame();
    }
  }

  function renderReduced() {
    var p = clamp(rawP, 0, 1);
    var idx = Math.min(rmCards.length - 1, Math.floor(p * rmCards.length));
    for (var i = 0; i < rmCards.length; i++) {
      rmCards[i].classList.toggle("on", i === idx);
    }
    updateHud(p);
  }

  function updateHud(p) {
    var pct = Math.round(p * 100);
    railFill.style.height = pct + "%";
    railPct.textContent = pct + "%";

    var stage = clamp(Math.floor(p * 4), 0, 3);
    railStage.textContent = stageLabels[stage];

    if (stage !== lastStage) {
      lastStage = stage;
      for (var i = 0; i < caps.length; i++) {
        caps[i].classList.toggle("on", i === stage);
      }
      srProgress.textContent =
        "Assembly stage " + (stage + 1) + " of 4, " + pct + " percent.";
    }
  }

  var frameReq = null;
  function requestFrame() {
    if (ticking) return;
    ticking = true;
    frameReq = requestAnimationFrame(render);
  }

  /* ---- Scroll: only store value, render in rAF ---- */
  function onScroll() {
    rawP = computeProgress();
    if (forced != null) {
      // any manual scroll cancels the snap
      forced = null;
      assembleBtn.classList.remove("ctrl-accent-active");
    }
    requestFrame();
  }

  /* ---- Rail visibility tied to the track ---- */
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(
      function (entries) {
        rail.classList.toggle("show", entries[0].isIntersecting);
      },
      { threshold: 0.02 }
    );
    io.observe(track);
  } else {
    rail.classList.add("show");
  }

  /* ---- Controls ---- */
  modeBtn.addEventListener("click", function () {
    mode = mode === "explode" ? "rotate" : "explode";
    modeVal.textContent = mode === "explode" ? "Explode" : "Rotate";
    modeBtn.dataset.mode = mode;
    modeBtn.setAttribute("aria-pressed", String(mode === "explode"));
    requestFrame();
  });

  driftBtn.addEventListener("click", function () {
    driftOn = !driftOn;
    driftVal.textContent = driftOn ? "On" : "Off";
    driftBtn.setAttribute("aria-pressed", String(driftOn));
    requestFrame();
  });

  assembleBtn.addEventListener("click", function () {
    // toggle between fully assembled (0) and fully exploded (1)
    forced = forced === 0 ? 1 : 0;
    assembleBtn.textContent = forced === 0 ? "Snap to exploded" : "Snap to assembled";
    requestFrame();
  });

  /* ---- Reduced-motion setup + live toggle ---- */
  function applyMotionPref() {
    reduce = reduceQuery.matches;
    if (reduce) {
      rmFallback.hidden = false;
      scene.parentElement.style.display = "none";
      caps.forEach(function (c) { c.style.display = "none"; });
    } else {
      rmFallback.hidden = true;
      scene.parentElement.style.display = "";
      caps.forEach(function (c) { c.style.display = ""; });
    }
    lastStage = -1;
    requestFrame();
  }

  if (reduceQuery.addEventListener) {
    reduceQuery.addEventListener("change", applyMotionPref);
  } else if (reduceQuery.addListener) {
    reduceQuery.addListener(applyMotionPref);
  }

  /* ---- Init ---- */
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  applyMotionPref();
  onScroll();
})();
