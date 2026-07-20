/* Signature Draw — pointer capture + smoothed SVG paths + stroke-dasharray replay. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const pad = document.getElementById("pad");
  const ink = document.getElementById("ink");
  const caret = document.getElementById("caret");
  const statusEl = document.getElementById("status");
  const speedEl = document.getElementById("speed");
  const btnReplay = document.getElementById("replay");
  const btnUndo = document.getElementById("undo");
  const btnClear = document.getElementById("clear");

  const VW = 600;
  const VH = 260;
  const MIN_DIST = 1.6; // viewBox units between recorded samples

  /** @type {{points: {x:number,y:number}[], el: SVGPathElement}[]} */
  const strokes = [];
  let active = null;
  let replayRAF = 0;

  /* ---------- geometry ---------- */

  function toLocal(evt) {
    const r = pad.getBoundingClientRect();
    return {
      x: clamp(((evt.clientX - r.left) / r.width) * VW, 0, VW),
      y: clamp(((evt.clientY - r.top) / r.height) * VH, 0, VH),
    };
  }

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const round = (n) => Math.round(n * 10) / 10;

  // Catmull-Rom -> cubic Bezier, giving a smooth handwritten look.
  function toPathData(pts) {
    if (pts.length === 0) return "";
    if (pts.length === 1) {
      const p = pts[0];
      return `M ${round(p.x)} ${round(p.y)} l 0.01 0`;
    }
    let d = `M ${round(pts[0].x)} ${round(pts[0].y)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${round(c1x)} ${round(c1y)}, ${round(c2x)} ${round(c2y)}, ${round(p2.x)} ${round(p2.y)}`;
    }
    return d;
  }

  /* ---------- stroke lifecycle ---------- */

  function beginStroke(pt) {
    cancelReplay();
    const el = document.createElementNS(NS, "path");
    el.setAttribute("d", "");
    ink.appendChild(el);
    active = { points: [pt], el };
    strokes.push(active);
    render(active);
  }

  function extendStroke(pt) {
    if (!active) return;
    const last = active.points[active.points.length - 1];
    if (Math.hypot(pt.x - last.x, pt.y - last.y) < MIN_DIST) return;
    active.points.push(pt);
    render(active);
  }

  function endStroke() {
    if (!active) return;
    if (active.points.length < 2 && active.points.length > 0) {
      // keep the dot, it is still ink
    }
    active = null;
    report();
  }

  function render(stroke) {
    stroke.el.setAttribute("d", toPathData(stroke.points));
  }

  function totalLength() {
    return strokes.reduce((sum, s) => sum + s.el.getTotalLength(), 0);
  }

  function report(msg) {
    if (msg) {
      statusEl.textContent = msg;
      return;
    }
    if (!strokes.length) {
      statusEl.textContent = "Empty signature.";
    } else {
      const pts = strokes.reduce((n, s) => n + s.points.length, 0);
      statusEl.textContent =
        `${strokes.length} stroke${strokes.length > 1 ? "s" : ""} · ${pts} points · ` +
        `${Math.round(totalLength())} units of path.`;
    }
    syncButtons();
  }

  function syncButtons() {
    const empty = strokes.length === 0;
    btnReplay.disabled = empty;
    btnUndo.disabled = empty;
    btnClear.disabled = empty;
  }

  /* ---------- pointer input ---------- */

  pad.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    pad.setPointerCapture(e.pointerId);
    beginStroke(toLocal(e));
    e.preventDefault();
  });

  pad.addEventListener("pointermove", (e) => {
    if (!active) return;
    // Coalesced events keep fast strokes faithful on high-rate pointers.
    const evts = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [e];
    for (const ev of evts) extendStroke(toLocal(ev));
  });

  const stop = (e) => {
    if (pad.hasPointerCapture && pad.hasPointerCapture(e.pointerId)) {
      pad.releasePointerCapture(e.pointerId);
    }
    endStroke();
  };
  pad.addEventListener("pointerup", stop);
  pad.addEventListener("pointercancel", stop);

  /* ---------- keyboard pen ---------- */

  let pen = { x: 300, y: 200 };
  let penDown = false;

  function moveCaret() {
    caret.setAttribute("cx", String(round(pen.x)));
    caret.setAttribute("cy", String(round(pen.y)));
    caret.setAttribute("data-inking", String(penDown));
  }
  moveCaret();

  pad.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 16 : 5;
    let dx = 0;
    let dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      penDown = !penDown;
      if (penDown) beginStroke({ x: pen.x, y: pen.y });
      else endStroke();
      moveCaret();
      report(penDown ? "Pen down — arrows draw." : undefined);
      return;
    } else if (e.key === "Enter") {
      if (penDown) {
        penDown = false;
        endStroke();
        moveCaret();
      }
      return;
    } else {
      return;
    }

    e.preventDefault();
    pen = { x: clamp(pen.x + dx, 0, VW), y: clamp(pen.y + dy, 0, VH) };
    moveCaret();
    if (penDown && active) {
      active.points.push({ x: pen.x, y: pen.y });
      render(active);
    }
  });

  pad.addEventListener("blur", () => {
    if (penDown) {
      penDown = false;
      endStroke();
      moveCaret();
    }
  });

  /* ---------- replay ---------- */

  function cancelReplay() {
    if (replayRAF) cancelAnimationFrame(replayRAF);
    replayRAF = 0;
    for (const s of strokes) {
      s.el.style.strokeDasharray = "";
      s.el.style.strokeDashoffset = "";
      s.el.style.opacity = "";
    }
  }

  function replay() {
    cancelReplay();
    if (!strokes.length) return;

    const lens = strokes.map((s) => s.el.getTotalLength());
    const total = lens.reduce((a, b) => a + b, 0) || 1;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 0 : Number(speedEl.value);

    strokes.forEach((s, i) => {
      s.el.style.strokeDasharray = `${lens[i]} ${lens[i]}`;
      s.el.style.strokeDashoffset = String(lens[i]);
    });

    if (duration === 0) {
      strokes.forEach((s) => (s.el.style.strokeDashoffset = "0"));
      report("Replay complete (reduced motion: instant).");
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      // Single clock drives every stroke in recorded order, proportional to length.
      const drawn = clamp((now - start) / duration, 0, 1) * total;
      let acc = 0;
      strokes.forEach((s, i) => {
        const local = clamp(drawn - acc, 0, lens[i]);
        s.el.style.strokeDashoffset = String(lens[i] - local);
        acc += lens[i];
      });
      if (now - start < duration) {
        replayRAF = requestAnimationFrame(tick);
      } else {
        replayRAF = 0;
        report("Replay complete.");
      }
    };
    replayRAF = requestAnimationFrame(tick);
    report("Replaying…");
  }

  /* ---------- controls ---------- */

  btnReplay.addEventListener("click", replay);

  btnUndo.addEventListener("click", () => {
    cancelReplay();
    const s = strokes.pop();
    if (s) s.el.remove();
    active = null;
    penDown = false;
    moveCaret();
    report();
    pad.focus();
  });

  btnClear.addEventListener("click", () => {
    cancelReplay();
    strokes.length = 0;
    active = null;
    penDown = false;
    ink.textContent = "";
    moveCaret();
    report();
    pad.focus();
  });

  report();
})();
