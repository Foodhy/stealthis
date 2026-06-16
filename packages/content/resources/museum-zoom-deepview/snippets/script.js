/* Meridian Museum — Deep-Zoom Image Viewer
 * Vanilla JS. Pan/zoom via CSS transform on .artwork (transform-origin: 0 0).
 * Coordinate model: artwork natural size is the stage box; scale >= 1.
 *   transform = translate(tx, ty) scale(scale)
 *   tx,ty in stage-pixel units, clamped so the artwork always covers the stage.
 */
(function () {
  "use strict";

  var stage = document.getElementById("stage");
  var canvas = document.getElementById("canvas");
  var artwork = document.getElementById("artwork");
  var zoomPct = document.getElementById("zoomPct");
  var navigator_ = document.getElementById("navigator");
  var navMini = document.getElementById("navMini");
  var navRect = document.getElementById("navRect");
  var magText = document.getElementById("magText");
  var magFill = document.getElementById("magFill");
  var zoomRange = document.getElementById("zoomRange");
  var toastEl = document.getElementById("toast");

  var MIN = 1;
  var MAX = 8;

  // state
  var scale = 1;
  var tx = 0;
  var ty = 0;

  /* ---------- toast helper ---------- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  /* ---------- geometry ---------- */
  function box() {
    return stage.getBoundingClientRect();
  }

  // Keep the artwork covering the stage: translation bounds.
  function clamp() {
    var b = box();
    var minX = b.width - b.width * scale; // <= 0
    var minY = b.height - b.height * scale;
    if (tx > 0) tx = 0;
    if (ty > 0) ty = 0;
    if (tx < minX) tx = minX;
    if (ty < minY) ty = minY;
  }

  function apply() {
    clamp();
    artwork.style.transform =
      "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
    var pct = Math.round(scale * 100);
    if (zoomPct) zoomPct.textContent = pct + "%";
    if (zoomRange) zoomRange.value = String(pct);
    if (magText) magText.textContent = (Math.round(scale * 10) / 10).toFixed(1) + "×";
    if (magFill) {
      var frac = (scale - MIN) / (MAX - MIN);
      magFill.style.width = Math.max(0, Math.min(1, frac)) * 100 + "%";
    }
    updateNav();
  }

  // Zoom toward a point given in stage-local pixel coords (px, py).
  function zoomTo(nextScale, px, py) {
    nextScale = Math.max(MIN, Math.min(MAX, nextScale));
    if (nextScale === scale) return;
    var b = box();
    if (px == null) px = b.width / 2;
    if (py == null) py = b.height / 2;
    // artwork-space point under the cursor stays fixed
    var ax = (px - tx) / scale;
    var ay = (py - ty) / scale;
    scale = nextScale;
    tx = px - ax * scale;
    ty = py - ay * scale;
    apply();
  }

  function zoomBy(factor, px, py) {
    zoomTo(scale * factor, px, py);
  }

  /* ---------- navigator minimap ---------- */
  function updateNav() {
    if (!navRect) return;
    var inv = 1 / scale; // fraction of artwork visible
    var ox = -tx / (box().width * scale); // left edge as fraction
    var oy = -ty / (box().height * scale);
    navRect.style.left = ox * 100 + "%";
    navRect.style.top = oy * 100 + "%";
    navRect.style.width = inv * 100 + "%";
    navRect.style.height = inv * 100 + "%";
  }

  // Build a low-res preview of the artwork SVG for the minimap background.
  function buildMiniThumb() {
    if (!navMini) return;
    var svg = artwork.querySelector("svg");
    if (!svg) return;
    try {
      var clone = svg.cloneNode(true);
      clone.removeAttribute("preserveAspectRatio");
      var xml = new XMLSerializer().serializeToString(clone);
      var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
      navMini.style.backgroundImage = "url('" + url + "')";
    } catch (e) {
      /* ignore — minimap still shows the static svg behind it */
    }
  }

  /* Click on minimap to recentre */
  if (navigator_) {
    var navThumb = navigator_.querySelector(".nav-thumb");
    if (navThumb) {
      navThumb.addEventListener("click", function (e) {
        var r = navThumb.getBoundingClientRect();
        var fx = (e.clientX - r.left) / r.width; // 0..1 centre target
        var fy = (e.clientY - r.top) / r.height;
        var b = box();
        // centre the viewport on (fx, fy)
        tx = -(fx * b.width * scale - b.width / 2);
        ty = -(fy * b.height * scale - b.height / 2);
        apply();
      });
    }
  }

  /* ---------- pointer pan (mouse + touch) ---------- */
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var moved = false;

  function localPoint(e) {
    var b = box();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  }

  stage.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    moved = false;
    lastX = e.clientX;
    lastY = e.clientY;
    stage.classList.add("dragging");
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    lastX = e.clientX;
    lastY = e.clientY;
    tx += dx;
    ty += dy;
    apply();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("dragging");
    try {
      stage.releasePointerCapture(e.pointerId);
    } catch (err) {}
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  /* ---------- wheel zoom ---------- */
  stage.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      var p = localPoint(e);
      var factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      zoomBy(factor, p.x, p.y);
    },
    { passive: false }
  );

  /* ---------- double-click to zoom in toward cursor ---------- */
  stage.addEventListener("dblclick", function (e) {
    var p = localPoint(e);
    zoomBy(1.8, p.x, p.y);
  });

  /* ---------- pinch zoom ---------- */
  var pinch = null; // { d, cx, cy }
  var activeTouches = {};

  function dist(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  stage.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length === 2) {
        dragging = false;
        stage.classList.remove("dragging");
        var b = box();
        var t0 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        var t1 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
        pinch = {
          d: dist(t0, t1),
          cx: (t0.x + t1.x) / 2 - b.left,
          cy: (t0.y + t1.y) / 2 - b.top,
        };
      }
    },
    { passive: true }
  );

  stage.addEventListener(
    "touchmove",
    function (e) {
      if (pinch && e.touches.length === 2) {
        e.preventDefault();
        var t0 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        var t1 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
        var d = dist(t0, t1);
        if (pinch.d > 0) zoomTo(scale * (d / pinch.d), pinch.cx, pinch.cy);
        pinch.d = d;
      }
    },
    { passive: false }
  );

  function endPinch(e) {
    if (e.touches.length < 2) pinch = null;
  }
  stage.addEventListener("touchend", endPinch);
  stage.addEventListener("touchcancel", endPinch);

  /* ---------- buttons ---------- */
  document.getElementById("zoomIn").addEventListener("click", function () {
    zoomBy(1.4);
  });
  document.getElementById("zoomOut").addEventListener("click", function () {
    zoomBy(1 / 1.4);
  });

  if (zoomRange) {
    zoomRange.addEventListener("input", function () {
      zoomTo(parseInt(zoomRange.value, 10) / 100);
    });
  }

  document.getElementById("resetBtn").addEventListener("click", function () {
    scale = 1;
    tx = 0;
    ty = 0;
    apply();
    toast("View reset");
  });

  document.getElementById("fitBtn").addEventListener("click", function () {
    scale = 1;
    tx = 0;
    ty = 0;
    apply();
    toast("Fit to frame");
  });

  /* ---------- fullscreen ---------- */
  var fsBtn = document.getElementById("fsBtn");
  function fsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  fsBtn.addEventListener("click", function () {
    if (!fsElement()) {
      var req =
        stage.requestFullscreen ||
        stage.webkitRequestFullscreen ||
        stage.msRequestFullscreen;
      if (req) {
        req.call(stage);
      } else {
        toast("Fullscreen not supported");
      }
    } else {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
    }
  });

  function onFsChange() {
    var on = !!fsElement();
    fsBtn.textContent = on ? "Exit fullscreen" : "Fullscreen";
    toast(on ? "Fullscreen" : "Exited fullscreen");
    // recompute clamp/nav after layout settles
    setTimeout(apply, 60);
  }
  document.addEventListener("fullscreenchange", onFsChange);
  document.addEventListener("webkitfullscreenchange", onFsChange);

  /* ---------- detail jumps ---------- */
  var jumps = document.querySelectorAll("#jumps .jump");
  Array.prototype.forEach.call(jumps, function (btn) {
    btn.addEventListener("click", function () {
      var fx = parseFloat(btn.getAttribute("data-x"));
      var fy = parseFloat(btn.getAttribute("data-y"));
      var z = parseFloat(btn.getAttribute("data-z"));
      scale = Math.max(MIN, Math.min(MAX, z));
      var b = box();
      // centre the chosen artwork fraction in the viewport
      tx = -(fx * b.width * scale - b.width / 2);
      ty = -(fy * b.height * scale - b.height / 2);
      apply();
      toast("Detail · " + btn.textContent.trim());
    });
  });

  /* ---------- keyboard ---------- */
  stage.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "+":
      case "=":
        e.preventDefault();
        zoomBy(1.4);
        break;
      case "-":
      case "_":
        e.preventDefault();
        zoomBy(1 / 1.4);
        break;
      case "0":
        e.preventDefault();
        scale = 1;
        tx = 0;
        ty = 0;
        apply();
        break;
      case "f":
      case "F":
        e.preventDefault();
        fsBtn.click();
        break;
      case "ArrowLeft":
        e.preventDefault();
        tx += 60;
        apply();
        break;
      case "ArrowRight":
        e.preventDefault();
        tx -= 60;
        apply();
        break;
      case "ArrowUp":
        e.preventDefault();
        ty += 60;
        apply();
        break;
      case "ArrowDown":
        e.preventDefault();
        ty -= 60;
        apply();
        break;
    }
  });

  /* ---------- init ---------- */
  buildMiniThumb();
  apply();
  window.addEventListener("resize", function () {
    // keep view valid on layout changes
    apply();
  });
})();
