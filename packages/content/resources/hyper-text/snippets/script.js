/**
 * Hyper Text
 * On hover (or on load), scrambles characters through random glyphs
 * before resolving to the target text one character at a time.
 */
(function () {
  const container = document.querySelector(".hyper-text");
  if (!container) return;

  const targetText = container.dataset.text || "STEALTHIS";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
  const scrambleSpeed = parseInt(container.dataset.speed, 10) || 50;
  const resolveDelay = parseInt(container.dataset.resolveDelay, 10) || 80;

  let isAnimating = false;
  let intervalId = null;

  function init() {
    container.innerHTML = "";
    for (let i = 0; i < targetText.length; i++) {
      const span = document.createElement("span");
      span.classList.add("char", "resolved");
      span.textContent = targetText[i] === " " ? "\u00A0" : targetText[i];
      container.appendChild(span);
    }
  }

  function scramble() {
    if (isAnimating) return;
    isAnimating = true;

    const chars = container.querySelectorAll(".char");
    const resolvedAt = new Array(chars.length).fill(false);
    let resolvedCount = 0;

    // Mark all as scrambling
    chars.forEach((c) => {
      c.classList.remove("resolved");
      c.classList.add("scrambling");
    });

    // Start resolving characters left to right on a stagger
    chars.forEach((_, i) => {
      setTimeout(
        () => {
          resolvedAt[i] = true;
          resolvedCount++;
        },
        resolveDelay * (i + 1)
      );
    });

    intervalId = setInterval(() => {
      chars.forEach((span, i) => {
        if (targetText[i] === " ") {
          span.textContent = "\u00A0";
          return;
        }
        if (resolvedAt[i]) {
          span.textContent = targetText[i];
          span.classList.remove("scrambling");
          span.classList.add("resolved");
        } else {
          span.textContent = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      });

      if (resolvedCount >= chars.length) {
        clearInterval(intervalId);
        isAnimating = false;
      }
    }, scrambleSpeed);
  }

  init();

  // Scramble on load
  setTimeout(scramble, 400);

  // Scramble on hover
  container.addEventListener("mouseenter", scramble);
})();
