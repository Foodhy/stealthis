(function () {
  "use strict";

  if (!window.gsap) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  function setupMarquee(trackEl) {
    // Fill viewport with clones
    const origWidth = trackEl.scrollWidth;
    const vw = window.innerWidth;
    let clone = trackEl.cloneNode(true);
    trackEl.parentElement.appendChild(clone);
    // Keep cloning until we have at least 2× viewport width
    while (trackEl.parentElement.scrollWidth < vw * 2.5) {
      const c = trackEl.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      trackEl.parentElement.appendChild(c);
    }

    const speed    = parseFloat(trackEl.dataset.speed) || 1;
    const reverse  = trackEl.dataset.reverse === "true";
    const baseSpeed = speed * (reverse ? 1 : -1);

    let xPos  = 0;
    let vel   = baseSpeed;
    const singleW = origWidth;

    gsap.ticker.add(() => {
      xPos += vel;
      // Loop: when offset > 0 or < -singleW, reset
      if (vel < 0 && xPos <= -singleW) xPos = 0;
      if (vel > 0 && xPos >= 0)        xPos = -singleW;
      trackEl.parentElement.style.transform = `translateX(${xPos}px)`;
    });

    // Ease speed on hover
    trackEl.parentElement.parentElement.addEventListener("mouseenter", () => {
      gsap.to({ vel }, { duration: 0.6, ease: "power2.out", onUpdate() {} });
      vel = baseSpeed * 0.2;
    });
    trackEl.parentElement.parentElement.addEventListener("mouseleave", () => {
      vel = baseSpeed;
    });
  }

  // Wrap each track in an overflow container
  document.querySelectorAll(".marquee-track").forEach((track) => {
    const row = track.parentElement;
    row.style.overflow = "hidden";
    // Use a wrapper div for the transform
    const wrapper = document.createElement("div");
    wrapper.style.display = "inline-flex";
    wrapper.style.willChange = "transform";
    row.innerHTML = "";
    row.appendChild(wrapper);
    wrapper.appendChild(track);
    setupMarquee(track);
  });
})();
