// Flip Text — cycles through words with a vertical flip animation
(function () {
  "use strict";

  const el = document.querySelector(".flip-text");
  if (!el) return;

  let words;
  try {
    words = JSON.parse(el.getAttribute("data-words") || "[]");
  } catch {
    words = ["amazing", "beautiful", "fast"];
  }

  if (words.length === 0) return;

  let index = 0;
  const wordEl = el.querySelector(".flip-word");
  if (!wordEl) return;

  // Read duration from CSS custom property
  const style = getComputedStyle(el);
  const durationStr = style.getPropertyValue("--flip-duration").trim() || "2.5s";
  const duration = parseFloat(durationStr) * 1000;

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  function nextWord() {
    index = (index + 1) % words.length;
    wordEl.textContent = words[index];

    // Restart animation
    wordEl.style.animation = "none";
    wordEl.offsetHeight; // trigger reflow
    wordEl.style.animation = "";
  }

  setInterval(nextWord, duration);
})();
