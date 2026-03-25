(function () {
  "use strict";

  const area = document.getElementById("spring-area");
  const ball = document.getElementById("spring-ball");
  const line = document.getElementById("spring-line");
  const velocityFill = document.getElementById("velocity-fill");

  const stiffnessSlider = document.getElementById("stiffness");
  const dampingSlider = document.getElementById("damping");
  const massSlider = document.getElementById("mass");
  const stiffnessVal = document.getElementById("stiffness-val");
  const dampingVal = document.getElementById("damping-val");
  const massVal = document.getElementById("mass-val");

  // Spring state
  let posX = 0, posY = 0;
  let velX = 0, velY = 0;
  let isDragging = false;
  let dragOffsetX = 0, dragOffsetY = 0;

  function getParams() {
    return {
      stiffness: Number(stiffnessSlider.value),
      damping: Number(dampingSlider.value),
      mass: Number(massSlider.value),
    };
  }

  // Update value displays
  stiffnessSlider.addEventListener("input", () => { stiffnessVal.textContent = stiffnessSlider.value; });
  dampingSlider.addEventListener("input", () => { dampingVal.textContent = dampingSlider.value; });
  massSlider.addEventListener("input", () => { massVal.textContent = massSlider.value; });

  // ── Drag handling ──
  ball.addEventListener("pointerdown", (e) => {
    isDragging = true;
    ball.classList.add("dragging");
    ball.setPointerCapture(e.pointerId);

    const rect = area.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    dragOffsetX = e.clientX - rect.left - centerX - posX;
    dragOffsetY = e.clientY - rect.top - centerY - posY;

    velX = 0;
    velY = 0;
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    const rect = area.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    posX = e.clientX - rect.left - centerX - dragOffsetX;
    posY = e.clientY - rect.top - centerY - dragOffsetY;
  });

  window.addEventListener("pointerup", () => {
    if (!isDragging) return;
    isDragging = false;
    ball.classList.remove("dragging");
  });

  // ── Spring simulation loop ──
  let lastTime = performance.now();

  function simulate(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.032); // Cap at ~30fps delta
    lastTime = now;

    if (!isDragging) {
      const { stiffness, damping, mass } = getParams();

      // Hooke's law: F = -kx - cv
      const forceX = -stiffness * posX - damping * velX;
      const forceY = -stiffness * posY - damping * velY;

      // Acceleration = F / m
      const accX = forceX / mass;
      const accY = forceY / mass;

      // Velocity integration
      velX += accX * dt;
      velY += accY * dt;

      // Position integration
      posX += velX * dt;
      posY += velY * dt;

      // Settle threshold
      if (Math.abs(posX) < 0.01 && Math.abs(posY) < 0.01 &&
          Math.abs(velX) < 0.01 && Math.abs(velY) < 0.01) {
        posX = 0; posY = 0;
        velX = 0; velY = 0;
      }
    }

    // Update ball position
    ball.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px))`;

    // Update spring line
    const dist = Math.sqrt(posX * posX + posY * posY);
    const angle = Math.atan2(posY, posX) * (180 / Math.PI);
    line.style.width = `${dist}px`;
    line.style.transform = `rotate(${angle}deg)`;

    // Update velocity indicator
    const speed = Math.sqrt(velX * velX + velY * velY);
    velocityFill.style.width = `${Math.min(speed / 8, 100)}%`;

    requestAnimationFrame(simulate);
  }

  requestAnimationFrame(simulate);
})();
