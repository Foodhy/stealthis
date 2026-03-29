// Scroll Velocity Text — marquee speed responds to scroll velocity
(function () {
  "use strict";

  const BASE_SPEED = 0.5; // px per frame at rest
  const SPEED_MULTIPLIER = 3; // how much scroll velocity amplifies speed
  const SMOOTHING = 0.05; // lerp factor (lower = smoother)

  const marquees = [];
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let smoothVelocity = 0;
  let animationId;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function initMarquees() {
    const elements = document.querySelectorAll(".velocity-marquee");

    elements.forEach((el) => {
      const track = el.querySelector(".velocity-marquee-track");
      if (!track) return;

      // Duplicate children for seamless loop
      const children = Array.from(track.children);
      children.forEach((child) => {
        const clone = child.cloneNode(true);
        track.appendChild(clone);
      });

      const direction = el.dataset.direction === "right" ? 1 : -1;
      const speed = parseFloat(el.dataset.speed) || BASE_SPEED;

      marquees.push({
        track,
        direction,
        baseSpeed: speed,
        position: 0,
        halfWidth: 0,
      });
    });

    // Measure half-width after cloning
    requestAnimationFrame(() => {
      marquees.forEach((m) => {
        m.halfWidth = m.track.scrollWidth / 2;
      });
    });
  }

  function onScroll() {
    const currentY = window.scrollY;
    scrollVelocity = currentY - lastScrollY;
    lastScrollY = currentY;
  }

  function animate() {
    // Smooth the velocity
    smoothVelocity = lerp(smoothVelocity, scrollVelocity, SMOOTHING);
    // Decay the raw velocity so it returns to 0 when not scrolling
    scrollVelocity = lerp(scrollVelocity, 0, SMOOTHING);

    const absVelocity = Math.abs(smoothVelocity);

    marquees.forEach((m) => {
      const speed = m.baseSpeed + absVelocity * SPEED_MULTIPLIER * 0.1;
      // Scroll direction can influence marquee direction
      const scrollDir = smoothVelocity >= 0 ? 1 : -1;
      m.position += speed * m.direction * scrollDir;

      // Reset for seamless loop
      if (Math.abs(m.position) >= m.halfWidth) {
        m.position = 0;
      }

      m.track.style.transform = `translateX(${m.position}px)`;
    });

    // Update speed indicator if present
    const indicator = document.getElementById("speed-value");
    if (indicator) {
      indicator.textContent = absVelocity.toFixed(1);
    }

    animationId = requestAnimationFrame(animate);
  }

  function init() {
    initMarquees();
    window.addEventListener("scroll", onScroll, { passive: true });
    animationId = requestAnimationFrame(animate);
  }

  function destroy() {
    window.removeEventListener("scroll", onScroll);
    cancelAnimationFrame(animationId);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Cleanup on page hide
  window.addEventListener("pagehide", destroy);
})();
