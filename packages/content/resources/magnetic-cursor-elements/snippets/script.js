(function () {
  "use strict";

  var doc = document;
  var body = doc.body;

  // ---- Feature detection ---------------------------------------------------
  var coarse =
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  var hasHover =
    window.matchMedia && window.matchMedia("(hover: hover)").matches;
  var reduceMotionMQ =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = reduceMotionMQ ? reduceMotionMQ.matches : false;

  // Touch / no-hover devices: never show the custom cursor.
  var touchLike = coarse || !hasHover;

  // ---- Elements ------------------------------------------------------------
  var cursor = doc.getElementById("cursor");
  var ring = doc.getElementById("cursorRing");
  var dot = doc.getElementById("cursorDot");
  var page = doc.getElementById("page");

  var enabledInput = doc.getElementById("enabled");
  var lagInput = doc.getElementById("lag");
  var strengthInput = doc.getElementById("strength");
  var radiusInput = doc.getElementById("radius");
  var lagOut = doc.getElementById("lagOut");
  var strengthOut = doc.getElementById("strengthOut");
  var radiusOut = doc.getElementById("radiusOut");
  var rPointer = doc.getElementById("rPointer");
  var rCaptured = doc.getElementById("rCaptured");
  var rStatus = doc.getElementById("rStatus");
  var modeNote = doc.getElementById("modeNote");

  // Guard against the intentional odd id above so the demo never breaks.
  if (!lagOut) lagOut = doc.querySelector('output[for="lag"]');

  // ---- State ---------------------------------------------------------------
  var settings = {
    lag: parseFloat(lagInput.value), // ring easing factor
    strength: parseFloat(strengthInput.value), // global multiplier
    radius: parseFloat(radiusInput.value), // pull radius in px
    enabled: enabledInput.checked
  };

  // Live pointer position (exact) and eased ring position.
  var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var ringPos = { x: pointer.x, y: pointer.y };
  var pointerSeen = false;

  // Build the list of magnetic targets with per-element eased offset state.
  var targets = [];
  var nodes = doc.querySelectorAll("[data-magnet]");
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    targets.push({
      el: el,
      label: el.querySelector("[data-magnet-label]"),
      strength: parseFloat(el.getAttribute("data-strength")) || 0.4,
      cx: 0,
      cy: 0,
      w: 0,
      h: 0,
      // current eased translate
      x: 0,
      y: 0,
      // goal translate
      gx: 0,
      gy: 0
    });
  }

  var captured = null; // currently magnetised target
  var hovering = false;

  // ---- Geometry ------------------------------------------------------------
  function measure() {
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      // Read layout from the *rest* position by subtracting current translate.
      var r = t.el.getBoundingClientRect();
      t.w = r.width;
      t.h = r.height;
      t.cx = r.left + r.width / 2 - t.x;
      t.cy = r.top + r.height / 2 - t.y;
    }
  }

  var measureQueued = false;
  function queueMeasure() {
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(function () {
      measureQueued = false;
      measure();
    });
  }

  // ---- Pointer tracking ----------------------------------------------------
  function onMove(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (!pointerSeen) {
      pointerSeen = true;
      ringPos.x = pointer.x;
      ringPos.y = pointer.y;
    }
    if (rPointer) {
      rPointer.textContent =
        Math.round(pointer.x) + ", " + Math.round(pointer.y);
    }
  }

  function onDown() {
    if (cursor) cursor.classList.add("is-down");
  }
  function onUp() {
    if (cursor) cursor.classList.remove("is-down");
  }

  // ---- Main loop -----------------------------------------------------------
  function tick() {
    // Ring easing toward the exact pointer.
    if (settings.enabled && !reduceMotion) {
      ringPos.x += (pointer.x - ringPos.x) * settings.lag;
      ringPos.y += (pointer.y - ringPos.y) * settings.lag;
    } else {
      ringPos.x = pointer.x;
      ringPos.y = pointer.y;
    }

    if (!touchLike) {
      if (dot) {
        dot.style.transform =
          "translate3d(" + pointer.x + "px," + pointer.y + "px,0) translate(-50%,-50%)";
      }
      if (ring) {
        ring.style.transform =
          "translate3d(" + ringPos.x + "px," + ringPos.y + "px,0) translate(-50%,-50%)";
      }
    }

    // Magnetism: find the nearest target within radius.
    var newCaptured = null;
    var bestDist = Infinity;

    if (settings.enabled) {
      for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        var dx = pointer.x - t.cx;
        var dy = pointer.y - t.cy;
        // Effective radius grows a little with the element half-size so big
        // tiles feel grabbable from their edges, not just their center.
        var reach = settings.radius + Math.max(t.w, t.h) * 0.35;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < reach) {
          var pull = settings.strength * t.strength * (1 - dist / reach);
          t.gx = dx * pull;
          t.gy = dy * pull;
          if (dist < bestDist) {
            bestDist = dist;
            newCaptured = t;
          }
        } else {
          t.gx = 0;
          t.gy = 0;
        }
      }
    } else {
      for (var j = 0; j < targets.length; j++) {
        targets[j].gx = 0;
        targets[j].gy = 0;
      }
    }

    // Ease each target (and its label a touch stronger for parallax).
    for (var k = 0; k < targets.length; k++) {
      var tt = targets[k];
      if (reduceMotion) {
        tt.x = tt.gx;
        tt.y = tt.gy;
      } else {
        tt.x += (tt.gx - tt.x) * 0.16;
        tt.y += (tt.gy - tt.y) * 0.16;
      }
      // Snap tiny residuals to zero to avoid sub-pixel jitter forever.
      if (Math.abs(tt.x) < 0.03 && Math.abs(tt.gx) === 0) tt.x = 0;
      if (Math.abs(tt.y) < 0.03 && Math.abs(tt.gy) === 0) tt.y = 0;

      tt.el.style.transform =
        "translate3d(" + tt.x.toFixed(2) + "px," + tt.y.toFixed(2) + "px,0)";
      if (tt.label) {
        tt.label.style.transform =
          "translate3d(" +
          (tt.x * 0.35).toFixed(2) +
          "px," +
          (tt.y * 0.35).toFixed(2) +
          "px,0)";
      }
    }

    // Update hover state on the cursor ring.
    var isHover = !!newCaptured;
    if (isHover !== hovering) {
      hovering = isHover;
      if (cursor) cursor.classList.toggle("is-hovering", hovering);
    }

    if (newCaptured !== captured) {
      captured = newCaptured;
      if (rCaptured) {
        rCaptured.textContent = captured
          ? describe(captured.el)
          : "none";
      }
    }

    requestAnimationFrame(tick);
  }

  function describe(el) {
    var label = el.querySelector("[data-magnet-label]");
    var txt = label ? label.textContent.trim() : el.textContent.trim();
    if (!txt) txt = el.getAttribute("aria-label") || el.tagName.toLowerCase();
    return txt.length > 16 ? txt.slice(0, 15) + "…" : txt;
  }

  // ---- Controls ------------------------------------------------------------
  function fmtLag() {
    if (lagOut) lagOut.textContent = settings.lag.toFixed(2);
  }
  function fmtStrength() {
    if (strengthOut)
      strengthOut.innerHTML = settings.strength.toFixed(2) + "&times;";
  }
  function fmtRadius() {
    if (radiusOut) radiusOut.textContent = Math.round(settings.radius) + "px";
  }

  lagInput.addEventListener("input", function () {
    settings.lag = parseFloat(lagInput.value);
    fmtLag();
  });
  strengthInput.addEventListener("input", function () {
    settings.strength = parseFloat(strengthInput.value);
    fmtStrength();
  });
  radiusInput.addEventListener("input", function () {
    settings.radius = parseFloat(radiusInput.value);
    fmtRadius();
  });
  enabledInput.addEventListener("change", function () {
    settings.enabled = enabledInput.checked;
    applyEnabled();
  });

  function applyEnabled() {
    var on = settings.enabled && !touchLike;
    body.classList.toggle("cursor-active", on);
    if (rStatus) {
      rStatus.textContent = settings.enabled
        ? touchLike
          ? "touch (native)"
          : reduceMotion
          ? "reduced motion"
          : "active"
        : "disabled";
    }
  }

  // ---- Reduced-motion live updates ----------------------------------------
  function onReduceChange(e) {
    reduceMotion = e.matches;
    applyEnabled();
  }
  if (reduceMotionMQ) {
    if (reduceMotionMQ.addEventListener) {
      reduceMotionMQ.addEventListener("change", onReduceChange);
    } else if (reduceMotionMQ.addListener) {
      reduceMotionMQ.addListener(onReduceChange);
    }
  }

  // ---- Wire up -------------------------------------------------------------
  fmtLag();
  fmtStrength();
  fmtRadius();

  if (touchLike) {
    // Native pointer only: hide controls that don't apply, note the mode.
    if (modeNote) {
      modeNote.innerHTML =
        "<strong>Touch device detected.</strong> The custom cursor is hidden; " +
        "targets keep their normal focus and hover states.";
    }
    applyEnabled();
  } else {
    if (modeNote) {
      modeNote.innerHTML = reduceMotion
        ? "<strong>Reduced motion.</strong> Lag and magnetic drift are disabled; " +
          "hover and focus styles remain."
        : "Tip: raise <strong>Magnet strength</strong> and <strong>Pull radius</strong>, " +
          "then glide slowly past a target to feel it catch.";
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("mouseleave", function () {
      if (cursor) cursor.classList.remove("is-hovering", "is-down");
    });
    applyEnabled();
  }

  window.addEventListener("resize", queueMeasure, { passive: true });
  window.addEventListener("scroll", queueMeasure, { passive: true });

  measure();
  requestAnimationFrame(tick);
})();
