(function () {
  "use strict";

  var svg = document.getElementById("route-svg");
  var routeBase = document.getElementById("route-base");
  var routeDone = document.getElementById("route-done");
  var driver = document.getElementById("driver");
  var pinPickup = document.getElementById("pin-pickup");
  var pinDrop = document.getElementById("pin-drop");
  var etaTime = document.getElementById("eta-time");
  var etaDist = document.getElementById("eta-dist");
  var etaClock = document.getElementById("eta-clock");
  var progress = document.getElementById("progress");
  var progressBar = document.getElementById("progress-bar");
  var stepLive = document.getElementById("step-live");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));

  var playBtn = document.getElementById("play");
  var playLabel = document.getElementById("play-label");
  var resetBtn = document.getElementById("reset");
  var recenterBtn = document.getElementById("recenter");
  var speedBtns = Array.prototype.slice.call(document.querySelectorAll(".speed__btn"));
  var toastHost = document.getElementById("toast-host");

  // Trip model
  var TOTAL_MIN = 17;        // total trip minutes when t = 0..1
  var TOTAL_MI = 4.1;        // total route distance
  var DURATION_MS = 26000;   // base wall-clock for full route at 1x
  var t = 0.42;              // normalized progress along path (matches markup)
  var speed = 1;
  var playing = false;
  var rafId = null;
  var lastTs = 0;
  var pathLen = 0;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // --- Toast helper ---
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind === "ok" ? " toast--ok" : "");
    el.textContent = msg;
    toastHost.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-in"); });
    setTimeout(function () {
      el.classList.remove("is-in");
      setTimeout(function () { el.remove(); }, 220);
    }, 2200);
  }

  // --- Geometry: map SVG userspace point to map pixel coords ---
  function svgPointToMap(pt) {
    var rect = svg.getBoundingClientRect();
    return {
      x: (pt.x / 600) * rect.width,
      y: (pt.y / 400) * rect.height
    };
  }

  function placeAt(el, pt, anchorBottom) {
    var p = svgPointToMap(pt);
    el.style.left = p.x + "px";
    el.style.top = p.y + "px";
  }

  function pointAtT(frac) {
    return routeBase.getPointAtLength(pathLen * clamp01(frac));
  }

  // --- Render driver + traveled overlay for current t ---
  function render() {
    pathLen = routeBase.getTotalLength();
    var done = pathLen * t;
    routeDone.style.strokeDasharray = pathLen + " " + pathLen;
    routeDone.style.strokeDashoffset = (pathLen - done);

    placeAt(driver, pointAtT(t));
    placeAt(pinPickup, routeBase.getPointAtLength(0));
    placeAt(pinDrop, routeBase.getPointAtLength(pathLen));

    var remainMin = Math.max(0, Math.round(TOTAL_MIN * (1 - t)));
    var remainMi = Math.max(0, TOTAL_MI * (1 - t));
    etaTime.innerHTML = (t >= 1 ? "0" : remainMin) + "<small>min</small>";
    etaDist.textContent = (t >= 1 ? "Arrived" : remainMi.toFixed(1) + " mi left");

    var arrive = new Date(Date.now() + remainMin * 60000);
    etaClock.textContent = "ETA " + fmtClock(arrive);

    var pct = Math.round(t * 100);
    progressBar.style.width = pct + "%";
    progress.setAttribute("aria-valuenow", String(pct));

    updateSteps();
  }

  function fmtClock(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    var ap = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return h + ":" + (m < 10 ? "0" + m : m) + " " + ap;
  }

  function updateSteps() {
    // step 0 (pickup) always done; step 1 active until t>=1; step 2 done at arrival
    steps.forEach(function (s) { s.classList.remove("is-active"); });
    if (t >= 1) {
      steps[1].classList.add("is-done");
      steps[2].classList.add("is-done", "is-active");
      var p = steps[2].querySelector(".pill");
      p.textContent = "Delivered";
      p.className = "pill pill--done";
      stepLive.textContent = "Complete";
      stepLive.className = "pill pill--done";
    } else {
      steps[1].classList.add("is-active");
      steps[2].classList.remove("is-done", "is-active");
      var p2 = steps[2].querySelector(".pill");
      p2.textContent = "Pending";
      p2.className = "pill pill--pending";
      stepLive.textContent = "In transit";
      stepLive.className = "pill pill--track";
    }
  }

  // --- Animation loop ---
  var arrivedFired = false;
  function tick(ts) {
    if (!playing) return;
    if (!lastTs) lastTs = ts;
    var dt = ts - lastTs;
    lastTs = ts;
    t = clamp01(t + (dt / DURATION_MS) * speed);
    render();
    if (t >= 1) {
      if (!arrivedFired) {
        arrivedFired = true;
        toast("Driver arrived at 1140 Larkspur Ave", "ok");
      }
      stop();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (t >= 1) { restart(); }
    playing = true;
    arrivedFired = false;
    lastTs = 0;
    playBtn.classList.add("is-playing");
    playBtn.setAttribute("aria-pressed", "true");
    playLabel.textContent = "Pause trip";
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    playing = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    playBtn.classList.remove("is-playing");
    playBtn.setAttribute("aria-pressed", "false");
    playLabel.textContent = t >= 1 ? "Trip complete" : "Resume trip";
  }

  function restart() {
    t = 0;
    arrivedFired = false;
    render();
    playLabel.textContent = "Start trip";
  }

  // --- Recenter (subtle nudge + spin feedback) ---
  function recenter() {
    recenterBtn.classList.remove("is-spin");
    void recenterBtn.offsetWidth;
    recenterBtn.classList.add("is-spin");
    render();
    toast("Recentered on driver");
  }

  // --- Events ---
  playBtn.addEventListener("click", function () {
    if (playing) { stop(); } else { start(); }
  });

  resetBtn.addEventListener("click", function () {
    stop();
    restart();
    toast("Trip restarted");
  });

  recenterBtn.addEventListener("click", recenter);

  speedBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      speed = parseFloat(btn.getAttribute("data-speed"));
      speedBtns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      toast("Playback " + speed + "×");
    });
  });

  // Recompute positions on resize (path is percentage-mapped)
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(render, 80);
  });

  // Initial paint (wait a frame so map has layout)
  requestAnimationFrame(function () {
    requestAnimationFrame(render);
  });
})();
