/**
 * Text Highlighter
 * Wraps each word in a <span>, then sequentially triggers a highlight
 * animation on each one. Click to replay.
 */
(function () {
  const container = document.querySelector(".text-highlighter");
  if (!container) return;

  const text =
    container.dataset.text ||
    "Design is not just what it looks like and feels like. Design is how it works. Every detail matters when crafting remarkable experiences.";

  const delayPerWord = parseInt(container.dataset.delay, 10) || 120;

  let timeouts = [];

  function setup() {
    // Clear any previous state
    timeouts.forEach(clearTimeout);
    timeouts = [];
    container.innerHTML = "";

    const words = text.split(/\s+/);
    words.forEach((word, i) => {
      const span = document.createElement("span");
      span.classList.add("word");
      span.textContent = word;
      container.appendChild(span);

      // Add a space after each word except the last
      if (i < words.length - 1) {
        container.appendChild(document.createTextNode(" "));
      }
    });

    // Stagger highlight
    const spans = container.querySelectorAll(".word");
    spans.forEach((span, i) => {
      const tid = setTimeout(() => {
        span.classList.add("highlighted");
      }, delayPerWord * i);
      timeouts.push(tid);
    });
  }

  setup();

  // Replay on click
  container.addEventListener("click", setup);
})();
