/*
 * SVG Path Morph
 * ---------------
 * Library-free morphing between SVG shapes. Every shape is authored with the
 * SAME command structure (M + 8 cubic C segments + Z) and therefore the same
 * number of coordinates, so morphing reduces to a linear blend of matched
 * numbers wrapped in an easing curve.
 */

(function () {
  "use strict";

  /* ---- Shape library -------------------------------------------------
   * Each morph shape is authored as EXACTLY 8 anchor points around the
   * center of a 200×200 box. A closed Catmull-Rom → cubic-Bézier converter
   * turns those 8 points into a path with an identical command structure:
   *   M + 8 cubic C segments + Z  =  2 + 48 = 50 numbers.
   * Because every shape shares that layout, morphing is a plain linear blend
   * of the two flat number arrays — no external library required.
   *
   * The small `icon` on each target button is an independent 24×24 glyph.
   */
  var C = 100; // center
  function star(spikes, outer, inner) {
    var pts = [];
    var n = spikes * 2;
    for (var i = 0; i < n; i++) {
      var r = i % 2 === 0 ? outer : inner;
      var a = -Math.PI / 2 + (i * Math.PI) / spikes;
      pts.push([C + r * Math.cos(a), C + r * Math.sin(a)]);
    }
    return pts;
  }
  function radial(radii) {
    // 8 radii around the circle, starting at the top, clockwise.
    var pts = [];
    for (var i = 0; i < 8; i++) {
      var a = -Math.PI / 2 + (i * Math.PI) / 4;
      pts.push([C + radii[i] * Math.cos(a), C + radii[i] * Math.sin(a)]);
    }
    return pts;
  }

  var SHAPES = [
    {
      id: "heart",
      label: "Heart",
      icon:
        "M12 21s-7.5-4.6-9.9-9.2C.7 8.4 2.4 5 5.6 5c1.9 0 3.4 1 4.4 2.3C11 6 12.5 5 14.4 5 17.6 5 19.3 8.4 21.9 11.8 19.5 16.4 12 21 12 21z",
      points: [
        [100, 76],
        [138, 52],
        [162, 82],
        [128, 128],
        [100, 158],
        [72, 128],
        [38, 82],
        [62, 52]
      ]
    },
    {
      id: "star",
      label: "Star",
      icon:
        "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8L12 2z",
      points: star(4, 72, 30)
    },
    {
      id: "blob",
      label: "Blob",
      icon:
        "M12 3c3.5 0 6.5 1.8 7.6 4.9 1 3-.6 5.5-1.4 8.1-.9 2.8-2.7 4.9-6.2 4.9s-6-1.5-8-4.2C-.2 13.6.6 10 2.4 7 4 4.4 8.5 3 12 3z",
      points: radial([60, 70, 55, 68, 62, 58, 66, 70])
    },
    {
      id: "gear",
      label: "Gear",
      icon:
        "M12 8a4 4 0 100 8 4 4 0 000-8zm9.4-.9l-1.9.4-.9-2.1 1.1-1.6-1.6-1.6-1.6 1.1-2.1-.9-.4-1.9H8.5l-.4 1.9-2.1.9-1.6-1.1-1.6 1.6 1.1 1.6-.9 2.1-1.9.4v2.3l1.9.4.9 2.1-1.1 1.6 1.6 1.6 1.6-1.1 2.1.9.4 1.9h2.3l.4-1.9 2.1-.9 1.6 1.1 1.6-1.6-1.1-1.6.9-2.1 1.9-.4V7.1z",
      points: star(4, 74, 52)
    },
    {
      id: "droplet",
      label: "Droplet",
      icon:
        "M12 2s7 8.3 7 13a7 7 0 11-14 0c0-4.7 7-13 7-13z",
      points: [
        [100, 32],
        [122, 72],
        [140, 108],
        [128, 148],
        [100, 166],
        [72, 148],
        [60, 108],
        [78, 72]
      ]
    }
  ];

  /* ---- Closed Catmull-Rom → cubic Bézier -----------------------------
   * Produces a flat numbers array [Mx,My, c1x,c1y,c2x,c2y,ex,ey, ...×8].
   */
  var K = 1 / 6; // smoothing tension
  function pointsToNumbers(pts) {
    var n = pts.length;
    var nums = [round(pts[0][0]), round(pts[0][1])];
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n];
      var p1 = pts[i];
      var p2 = pts[(i + 1) % n];
      var p3 = pts[(i + 2) % n];
      var c1x = p1[0] + (p2[0] - p0[0]) * K;
      var c1y = p1[1] + (p2[1] - p0[1]) * K;
      var c2x = p2[0] - (p3[0] - p1[0]) * K;
      var c2y = p2[1] - (p3[1] - p1[1]) * K;
      nums.push(round(c1x), round(c1y), round(c2x), round(c2y), round(p2[0]), round(p2[1]));
    }
    return nums;
  }

  // Shared command template: M + one C per segment + Z.
  var SEG = SHAPES[0].points.length;
  var TEMPLATE = [{ cmd: "M", count: 0 }];
  for (var _s = 0; _s < SEG; _s++) {
    TEMPLATE.push({ cmd: "C", count: 2 + _s * 6 });
  }
  TEMPLATE.push({ cmd: "Z", count: 2 + SEG * 6 });

  var PARSED = SHAPES.map(function (s) {
    return { numbers: pointsToNumbers(s.points) };
  });

  var LEN = PARSED[0].numbers.length; // 50

  /* Rebuild a `d` string from the shared template + a numbers array. */
  function buildPath(nums) {
    var out = "";
    for (var i = 0; i < TEMPLATE.length; i++) {
      var seg = TEMPLATE[i];
      out += seg.cmd;
      var next = i + 1 < TEMPLATE.length ? TEMPLATE[i + 1].count : LEN;
      var slice = [];
      for (var j = seg.count; j < next; j++) {
        slice.push(round(nums[j]));
      }
      if (slice.length) out += slice.join(" ");
      out += " ";
    }
    return out.trim();
  }

  function round(n) {
    return Math.round(n * 100) / 100;
  }

  /* Interpolate two numbers arrays by t. */
  function lerpArr(a, b, t) {
    var r = new Array(LEN);
    for (var i = 0; i < LEN; i++) {
      r[i] = a[i] + (b[i] - a[i]) * t;
    }
    return r;
  }

  /* ---- Easing functions ---- */
  var EASINGS = {
    linear: function (t) {
      return t;
    },
    easeIn: function (t) {
      return t * t * t;
    },
    easeOut: function (t) {
      return 1 - Math.pow(1 - t, 3);
    },
    easeInOut: function (t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    elastic: function (t) {
      if (t === 0 || t === 1) return t;
      var p = 0.4;
      return (
        Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1
      );
    }
  };

  /* ---- DOM ---- */
  var pathEl = document.getElementById("morphPath");
  var pairLabel = document.getElementById("pairLabel");
  var pctLabel = document.getElementById("pctLabel");
  var progressFill = document.getElementById("progressFill");
  var playBtn = document.getElementById("playBtn");
  var stepBtn = document.getElementById("stepBtn");
  var speedInput = document.getElementById("speed");
  var speedOut = document.getElementById("speedOut");
  var easingSel = document.getElementById("easing");
  var targetWrap = document.getElementById("targetBtns");

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- Build target buttons ---- */
  var targetButtons = [];
  SHAPES.forEach(function (s, idx) {
    var btn = document.createElement("button");
    btn.className = "target-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Morph to " + s.label);
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
      s.icon +
      '"/></svg><span>' +
      s.label +
      "</span>";
    btn.addEventListener("click", function () {
      morphTo(idx);
    });
    targetWrap.appendChild(btn);
    targetButtons.push(btn);
  });

  /* ---- State ---- */
  var current = { from: 0, to: 1 }; // shape indices
  var baseNumbers = PARSED[0].numbers.slice(); // where the current morph starts
  var startNums = baseNumbers.slice();
  var startTime = 0;
  var duration = 1400; // ms at 1× (post ease)
  var holdAfter = 900; // ms pause at each shape when autoplaying
  var playing = !reduceMotion;
  var mode = "morph"; // "morph" | "hold"
  var holdUntil = 0;
  var rafId = null;
  var progress = 0;

  function speedFactor() {
    return parseFloat(speedInput.value) || 1;
  }

  function setActiveTarget(idx) {
    targetButtons.forEach(function (b, i) {
      b.classList.toggle("active", i === idx);
      if (i === idx) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  }

  function updateLabels(t) {
    pairLabel.textContent =
      SHAPES[current.from].label.toLowerCase() +
      " → " +
      SHAPES[current.to].label.toLowerCase();
    var pct = Math.round(t * 100);
    pctLabel.textContent = pct + "%";
    progressFill.style.width = pct + "%";
  }

  /* Begin morphing from the CURRENT rendered numbers to shape `toIdx`. */
  function morphTo(toIdx) {
    if (toIdx === current.to && progress < 1 && mode === "morph") {
      // already heading there
      current.to = toIdx;
    }
    startNums = baseNumbers.slice();
    current.to = toIdx;
    mode = "morph";
    progress = 0;
    startTime = performance.now();
    setActiveTarget(toIdx);

    if (reduceMotion) {
      // Snap instantly, no animation.
      baseNumbers = PARSED[toIdx].numbers.slice();
      pathEl.setAttribute("d", buildPath(baseNumbers));
      current.from = toIdx;
      updateLabels(1);
      progress = 1;
      scheduleHold();
      return;
    }
    if (!rafId) rafId = requestAnimationFrame(frame);
  }

  function scheduleHold() {
    if (!playing) return;
    mode = "hold";
    holdUntil = performance.now() + holdAfter / speedFactor();
    if (!rafId) rafId = requestAnimationFrame(frame);
  }

  function nextShape() {
    var next = (current.to + 1) % SHAPES.length;
    morphTo(next);
  }

  /* ---- Animation loop ---- */
  function frame(now) {
    rafId = null;

    if (mode === "hold") {
      current.from = current.to;
      if (playing && now >= holdUntil) {
        nextShape();
      } else if (playing) {
        rafId = requestAnimationFrame(frame);
      }
      return;
    }

    var dur = duration / speedFactor();
    var raw = Math.min(1, (now - startTime) / dur);
    var ease = EASINGS[easingSel.value] || EASINGS.easeInOut;
    var t = Math.max(0, Math.min(1, ease(raw)));
    progress = raw;

    var target = PARSED[current.to].numbers;
    baseNumbers = lerpArr(startNums, target, t);
    pathEl.setAttribute("d", buildPath(baseNumbers));
    updateLabels(raw);

    if (raw < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      baseNumbers = target.slice();
      current.from = current.to;
      pathEl.setAttribute("d", buildPath(baseNumbers));
      scheduleHold();
    }
  }

  /* ---- Controls ---- */
  function setPlaying(on) {
    playing = on;
    playBtn.setAttribute("aria-pressed", String(on));
    playBtn.querySelector(".txt").textContent = on ? "Pause" : "Play";
    playBtn.querySelector(".ico").textContent = on ? "❚❚" : "▶";
    if (on && !rafId) {
      if (mode === "hold") {
        holdUntil = performance.now() + holdAfter / speedFactor();
      }
      rafId = requestAnimationFrame(frame);
    }
  }

  playBtn.addEventListener("click", function () {
    setPlaying(!playing);
  });

  stepBtn.addEventListener("click", function () {
    nextShape();
  });

  speedInput.addEventListener("input", function () {
    speedOut.textContent = speedFactor().toFixed(1) + "×";
  });

  easingSel.addEventListener("change", function () {
    // restart current morph from present state so easing change is visible
    if (mode === "morph" && progress < 1) {
      startNums = baseNumbers.slice();
      startTime = performance.now();
    }
  });

  /* React to reduced-motion changes at runtime. */
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  (mq.addEventListener || mq.addListener).call(
    mq,
    mq.addEventListener ? "change" : undefined,
    function (e) {
      reduceMotion = e.matches;
      if (reduceMotion) {
        setPlaying(false);
      }
    }
  );

  /* ---- Init ---- */
  pathEl.setAttribute("d", buildPath(PARSED[0].numbers));
  setActiveTarget(0);
  updateLabels(0);
  speedOut.textContent = "1.0×";

  if (reduceMotion) {
    setPlaying(false);
    // Show the first shape statically; user can step via buttons.
  } else {
    setPlaying(true);
    morphTo(1);
  }
})();
