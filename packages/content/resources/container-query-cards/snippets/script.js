(function () {
  "use strict";

  // Feature detection for CSS container queries.
  var supportsCQ =
    typeof CSS !== "undefined" &&
    CSS.supports &&
    CSS.supports("container-type", "inline-size");

  if (!supportsCQ) {
    var note = document.querySelector(".nosupport");
    if (note) note.hidden = false;
  }

  var stage = document.querySelector(".stage");
  var tpl = document.getElementById("panel-tpl");
  if (!stage || !tpl) return;

  // Three presets: label, starting width, min, max.
  var PRESETS = [
    { name: "Sidebar", width: 210, min: 150, max: 900 },
    { name: "Card grid cell", width: 360, min: 150, max: 900 },
    { name: "Full-bleed", width: 720, min: 150, max: 980 }
  ];

  // Breakpoints must mirror the @container rules in style.css.
  function layoutFor(w) {
    if (w < 240) return "compact";
    if (w < 480) return "stacked";
    return "horizontal";
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function buildPanel(preset) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.preset = preset.name;

    var nameEl = node.querySelector(".panel__name");
    var body = node.querySelector(".panel__body");
    var handle = node.querySelector(".panel__handle");
    var wNum = node.querySelector(".panel__w-num");
    var cwNum = node.querySelector(".card__cw-num");
    var layoutEl = node.querySelector(".card__layout");
    var buy = node.querySelector(".buy");

    nameEl.textContent = preset.name;

    // Cap the initial width so it never overflows a narrow screen.
    var maxAvail = Math.min(preset.max, stage.clientWidth || 900);
    var startW = clamp(preset.width, preset.min, maxAvail);
    node.style.width = startW + "px";

    function report() {
      // Read the real rendered width of the container context.
      var cw = Math.round(body.clientWidth);
      var full = Math.round(node.getBoundingClientRect().width);
      wNum.textContent = full;
      cwNum.textContent = cw;
      var name = supportsCQ ? layoutFor(cw) : "stacked";
      layoutEl.textContent = name;
    }

    // ResizeObserver keeps the readout in sync with whatever CSS does.
    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(report);
      ro.observe(body);
    }
    report();

    // ---- Pointer drag to resize ----
    var dragging = false;
    var startX = 0;
    var startWidth = 0;

    function curMax() {
      // Don't let a panel grow wider than the stage.
      var stageW = stage.clientWidth || preset.max;
      return Math.min(preset.max, stageW);
    }

    function onPointerDown(e) {
      dragging = true;
      startX = e.clientX;
      startWidth = node.getBoundingClientRect().width;
      node.classList.add("is-dragging");
      handle.setPointerCapture && handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      var next = clamp(startWidth + (e.clientX - startX), preset.min, curMax());
      node.style.width = next + "px";
      report();
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      node.classList.remove("is-dragging");
      if (handle.releasePointerCapture && e.pointerId != null) {
        try {
          handle.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    }

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
    handle.addEventListener("pointercancel", onPointerUp);

    // ---- Keyboard resize (arrow keys) ----
    handle.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 40 : 12;
      var cur = node.getBoundingClientRect().width;
      var next = null;
      if (e.key === "ArrowLeft") next = cur - step;
      else if (e.key === "ArrowRight") next = cur + step;
      else if (e.key === "Home") next = preset.min;
      else if (e.key === "End") next = curMax();
      if (next == null) return;
      e.preventDefault();
      node.style.width = clamp(next, preset.min, curMax()) + "px";
      report();
    });

    // ---- Add to cart micro-interaction ----
    buy.addEventListener("click", function () {
      if (buy.classList.contains("is-added")) return;
      var original = buy.textContent;
      buy.classList.add("is-added");
      buy.textContent = "Added ✓";
      setTimeout(function () {
        buy.classList.remove("is-added");
        buy.textContent = original;
      }, 1400);
    });

    return { node: node, report: report };
  }

  var panels = PRESETS.map(function (p) {
    var built = buildPanel(p);
    stage.appendChild(built.node);
    return built;
  });

  // Keep widths sane if the window shrinks below a panel width.
  var raf = null;
  window.addEventListener("resize", function () {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      var stageW = stage.clientWidth;
      panels.forEach(function (p) {
        var w = p.node.getBoundingClientRect().width;
        if (w > stageW) {
          p.node.style.width = stageW + "px";
        }
        p.report();
      });
    });
  });
})();
