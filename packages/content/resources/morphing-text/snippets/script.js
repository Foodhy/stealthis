// Morphing Text — alternates between two text elements with SVG blur morph effect
(function () {
  "use strict";

  const container = document.querySelector(".morph-container");
  if (!container) return;

  let texts;
  try {
    texts = JSON.parse(container.getAttribute("data-texts") || "[]");
  } catch {
    texts = ["Innovative", "Creative", "Powerful"];
  }

  if (texts.length < 2) return;

  const textA = container.querySelector(".morph-text--a");
  const textB = container.querySelector(".morph-text--b");
  const wrapper = container.querySelector(".morph-wrapper");
  if (!textA || !textB || !wrapper) return;

  let index = 0;
  let showingA = true;
  const MORPH_DURATION = 2000; // ms between morphs

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  function morph() {
    const nextIndex = (index + 1) % texts.length;

    if (showingA) {
      // A is showing, prepare B with next text, then cross-fade
      textB.textContent = texts[nextIndex];
      wrapper.setAttribute("data-current", texts[nextIndex]);

      textA.classList.add("morph-out");
      textB.classList.add("morph-in");

      setTimeout(() => {
        textA.classList.remove("morph-out");
        textB.classList.remove("morph-in");
        // Swap: now B is showing, reset A's opacity
        textA.style.opacity = "0";
        textB.style.opacity = "1";
        showingA = false;
      }, 700);
    } else {
      // B is showing, prepare A with next text, then cross-fade
      textA.textContent = texts[nextIndex];
      wrapper.setAttribute("data-current", texts[nextIndex]);

      textB.style.opacity = "0";
      textA.style.opacity = "1";
      showingA = true;
    }

    index = nextIndex;
  }

  // Set initial state
  textA.textContent = texts[0];
  wrapper.setAttribute("data-current", texts[0]);

  setInterval(morph, MORPH_DURATION);
})();
