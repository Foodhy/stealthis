const cards = document.querySelectorAll(".metric-card");

function formatNumber(value, suffix) {
  const fixed = value % 1 === 0 ? 0 : 1;
  return `${value.toFixed(fixed)}${suffix}`;
}

function animateCount(card) {
  const target = parseFloat(card.dataset.value);
  const suffix = card.dataset.suffix || "";
  const display = card.querySelector(".value");
  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    display.textContent = formatNumber(value, suffix);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

cards.forEach((card) => animateCount(card));
