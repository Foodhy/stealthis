document.querySelectorAll('.kpi-card').forEach(card => {
  const val = parseInt(card.dataset.value);
  const prev = parseInt(card.dataset.prev);
  const prefix = card.dataset.prefix;
  const suffix = card.dataset.suffix;
  const label = card.dataset.label;
  const period = card.dataset.period;
  const color = card.dataset.color;

  const delta = prev ? ((val - prev) / prev * 100).toFixed(1) : 0;
  const isUp = delta > 0;
  const isDown = delta < 0;

  let deltaHtml = '';
  if (isUp) deltaHtml = `<div class="kpi-delta up">▲ ${Math.abs(delta)}%</div>`;
  else if (isDown) deltaHtml = `<div class="kpi-delta down">▼ ${Math.abs(delta)}%</div>`;
  else deltaHtml = `<div class="kpi-delta">0%</div>`;

  card.innerHTML = `
    <div class="kpi-accent-bar" style="background:${color}"></div>
    <div class="kpi-period">${period}</div>
    <div class="kpi-value"><span class="kpi-val-num">0</span>${suffix}</div>
    <div class="kpi-label">${label}</div>
    ${deltaHtml}

    <svg class="kpi-sparkline" width="60" height="24" viewBox="0 0 60 24">
      <path d="M0,24 L10,14 L20,18 L30,8 L40,12 L50,4 L60,0" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  const numEl = card.querySelector('.kpi-val-num');

  // Animate counter
  let start = null;
  const duration = 1200;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const curr = Math.round(val * eased);

    numEl.textContent = prefix + curr.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      numEl.textContent = prefix + val.toLocaleString();
    }
  }
  requestAnimationFrame(step);
});
