(function () {
  "use strict";

  // ── Utility: smooth lerp animation via rAF ──
  function animateValue(getCurrentValue, getTargetValue, applyValue, ease) {
    let current = getCurrentValue();
    let raf;

    function tick() {
      const target = getTargetValue();
      current += (target - current) * ease;

      // Settle
      if (Math.abs(current - target) < 0.001) {
        current = target;
        applyValue(current);
        return;
      }

      applyValue(current);
      raf = requestAnimationFrame(tick);
    }

    function start() {
      cancelAnimationFrame(raf);
      tick();
    }

    return { start, stop: () => cancelAnimationFrame(raf) };
  }

  // ═══════════════════════════════════════
  // 1. HOVER SCALE
  // ═══════════════════════════════════════
  const hoverEl = document.getElementById("hover-target");
  let hoverScale = 1;
  let hoverTarget = 1;

  const hoverAnim = animateValue(
    () => hoverScale,
    () => hoverTarget,
    (v) => {
      hoverScale = v;
      hoverEl.style.transform = `scale(${v})`;
    },
    0.12
  );

  hoverEl.addEventListener("mouseenter", () => {
    hoverTarget = 1.15;
    hoverAnim.start();
  });
  hoverEl.addEventListener("mouseleave", () => {
    hoverTarget = 1;
    hoverAnim.start();
  });

  // ═══════════════════════════════════════
  // 2. TAP SHRINK
  // ═══════════════════════════════════════
  const tapEl = document.getElementById("tap-target");
  let tapScale = 1;
  let tapTarget = 1;

  const tapAnim = animateValue(
    () => tapScale,
    () => tapTarget,
    (v) => {
      tapScale = v;
      tapEl.style.transform = `scale(${v})`;
    },
    0.15
  );

  tapEl.addEventListener("pointerdown", () => {
    tapTarget = 0.85;
    tapAnim.start();
  });
  tapEl.addEventListener("pointerup", () => {
    tapTarget = 1;
    tapAnim.start();
  });
  tapEl.addEventListener("pointerleave", () => {
    tapTarget = 1;
    tapAnim.start();
  });

  // ═══════════════════════════════════════
  // 3. DRAG CONSTRAINED
  // ═══════════════════════════════════════
  const dragArea = document.getElementById("drag-area");
  const dragEl = document.getElementById("drag-constrained");
  let dragX = 0,
    dragY = 0;
  let dragTargetX = 0,
    dragTargetY = 0;
  let isDragging = false;
  let dragOffX = 0,
    dragOffY = 0;
  let originX = 0,
    originY = 0;

  // Lerp for smooth return
  let dragLerpX = 0,
    dragLerpY = 0;
  let dragRaf;

  function dragTick() {
    dragLerpX += (dragTargetX - dragLerpX) * 0.15;
    dragLerpY += (dragTargetY - dragLerpY) * 0.15;

    if (Math.abs(dragLerpX - dragTargetX) < 0.1 && Math.abs(dragLerpY - dragTargetY) < 0.1) {
      dragLerpX = dragTargetX;
      dragLerpY = dragTargetY;
      dragEl.style.transform = `translate(calc(-50% + ${dragLerpX}px), calc(-50% + ${dragLerpY}px))`;
      return;
    }

    dragEl.style.transform = `translate(calc(-50% + ${dragLerpX}px), calc(-50% + ${dragLerpY}px))`;
    dragRaf = requestAnimationFrame(dragTick);
  }

  dragEl.addEventListener("pointerdown", (e) => {
    isDragging = true;
    dragEl.classList.add("dragging");
    dragEl.setPointerCapture(e.pointerId);

    const areaRect = dragArea.getBoundingClientRect();
    originX = areaRect.left + areaRect.width / 2;
    originY = areaRect.top + areaRect.height / 2;

    dragOffX = e.clientX - originX - dragLerpX;
    dragOffY = e.clientY - originY - dragLerpY;
    cancelAnimationFrame(dragRaf);
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    const areaRect = dragArea.getBoundingClientRect();
    const halfW = areaRect.width / 2 - 28;
    const halfH = areaRect.height / 2 - 28;

    let nx = e.clientX - originX - dragOffX;
    let ny = e.clientY - originY - dragOffY;

    // Clamp to area
    nx = Math.max(-halfW, Math.min(halfW, nx));
    ny = Math.max(-halfH, Math.min(halfH, ny));

    dragLerpX = nx;
    dragLerpY = ny;
    dragTargetX = nx;
    dragTargetY = ny;

    dragEl.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
  });

  window.addEventListener("pointerup", () => {
    if (!isDragging) return;
    isDragging = false;
    dragEl.classList.remove("dragging");

    // Spring back to center
    dragTargetX = 0;
    dragTargetY = 0;
    cancelAnimationFrame(dragRaf);
    dragRaf = requestAnimationFrame(dragTick);
  });

  // ═══════════════════════════════════════
  // 4. FOCUS GLOW
  // ═══════════════════════════════════════
  const focusInput = document.getElementById("focus-input");
  const focusGlow = document.getElementById("focus-glow");
  let glowOpacity = 0;
  let glowTarget = 0;
  let glowRotation = 0;
  let glowRaf;

  function glowTick() {
    glowOpacity += (glowTarget - glowOpacity) * 0.08;
    glowRotation += 1.5;

    if (Math.abs(glowOpacity - glowTarget) < 0.005 && glowTarget === 0) {
      glowOpacity = 0;
      focusGlow.style.opacity = "0";
      return;
    }

    focusGlow.style.opacity = String(glowOpacity);
    focusGlow.style.background = `conic-gradient(from ${glowRotation}deg, #ec4899, #8b5cf6, #6366f1, #0ea5e9, #10b981, #ec4899)`;

    glowRaf = requestAnimationFrame(glowTick);
  }

  focusInput.addEventListener("focus", () => {
    glowTarget = 0.6;
    cancelAnimationFrame(glowRaf);
    glowRaf = requestAnimationFrame(glowTick);
  });

  focusInput.addEventListener("blur", () => {
    glowTarget = 0;
    cancelAnimationFrame(glowRaf);
    glowRaf = requestAnimationFrame(glowTick);
  });
})();
