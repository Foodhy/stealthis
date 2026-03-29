/**
 * Spinning Text
 * Splits a string into individual characters and positions each one
 * around a circle. The CSS animation handles the continuous rotation.
 */
(function () {
  const container = document.querySelector(".spinning-text");
  if (!container) return;

  const text = container.dataset.text || "SPINNING TEXT EFFECT * ";
  const radius = parseInt(container.dataset.radius, 10) || 125;

  function render() {
    container.innerHTML = "";
    const chars = text.split("");
    const step = 360 / chars.length;

    chars.forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.transform = `rotate(${step * i}deg)`;
      span.style.transformOrigin = `0 ${radius}px`;
      container.appendChild(span);
    });
  }

  render();
})();
