/* =============================================
   Takeout Pickup Status — script.js
   ============================================= */

const ORDERS = {
  'T-042': { items: ['Burrata huerta', 'Ribeye 14oz'], step: 0, eta: 18 },
  'T-038': { items: ['Tarta de queso'], step: 2, eta: 3 },
  'T-051': { items: ['Pulpo brasa', 'Pappardelle ragú', 'Negroni sbagliato'], step: 1, eta: 12 },
};

const STEPS = [
  'Order received',
  'Preparing your food',
  'Ready for pickup',
  'Order picked up',
];

const STEP_EMOJIS = ['📋', '👨‍🍳', '🛎️', '✅'];

const STEP_TIMES = ['20:31', '20:33', '', ''];

// Runtime step times — filled in as steps are simulated
const stepTimes = { ...{} };

let currentOrderKey = null;
let autoDemoTimer = null;
let autoDemoStep = 0;

// ---- DOM refs ----
const lookupForm = document.getElementById('lookupForm');
const orderInput = document.getElementById('orderInput');
const lookupHint = document.getElementById('lookupHint');
const orderNumberEl = document.getElementById('orderNumber');
const orderItemsEl = document.getElementById('orderItems');
const readyBanner = document.getElementById('readyBanner');
const etaMinutesEl = document.getElementById('etaMinutes');
const etaFill = document.getElementById('etaFill');
const etaSection = document.getElementById('etaSection');
const simBtn = document.getElementById('simBtn');

// ---- Helpers ----
function nowTime() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function etaPercent(step, etaMin) {
  if (step >= 3) return 100;
  if (step === 2) return 90;
  if (step === 1) return 55;
  return 20;
}

// ---- Render ----
function render(orderKey) {
  const order = ORDERS[orderKey];
  if (!order) return;

  const step = order.step;
  const eta = order.eta;

  // Meta
  orderNumberEl.textContent = orderKey;
  const count = order.items.length;
  orderItemsEl.textContent = `${count} item${count !== 1 ? 's' : ''} · ${order.items.join(', ')}`;

  // Steps
  for (let i = 0; i < 4; i++) {
    const circle = document.getElementById(`circle-${i}`);
    const timeEl = document.getElementById(`time-${i}`);
    const labelEl = circle?.closest('.step')?.querySelector('.step-label');

    // Determine state
    circle.classList.remove('completed', 'active');

    if (i < step) {
      // Completed
      circle.classList.add('completed');
      circle.innerHTML = `<span style="color:#fff;font-size:1rem;">✓</span>`;
      if (labelEl) labelEl.classList.remove('muted');
    } else if (i === step) {
      // Active (current)
      circle.classList.add('active');
      circle.innerHTML = `<span class="step-emoji">${STEP_EMOJIS[i]}</span>`;
      if (labelEl) labelEl.classList.remove('muted');
    } else {
      // Future
      circle.innerHTML = `<span class="step-emoji" style="opacity:0.35;">${STEP_EMOJIS[i]}</span>`;
      if (labelEl) labelEl.classList.add('muted');
    }

    // Times
    const key = `${orderKey}_${i}`;
    if (i < step) {
      // Use persisted or defaults
      timeEl.textContent = stepTimes[key] || STEP_TIMES[i] || '';
    } else if (i === step) {
      if (!stepTimes[key]) {
        stepTimes[key] = nowTime();
      }
      timeEl.textContent = stepTimes[key];
    } else {
      timeEl.textContent = '';
    }

    // Connectors
    const connectorBottom = document.getElementById(`connector-${i}`);
    if (connectorBottom) {
      if (i < step) {
        connectorBottom.classList.add('filled');
      } else {
        connectorBottom.classList.remove('filled');
      }
    }
    const connectorTop = document.getElementById(`connector-top-${i}`);
    if (connectorTop) {
      if (i <= step && step > 0) {
        connectorTop.classList.add('filled');
      } else {
        connectorTop.classList.remove('filled');
      }
    }
  }

  // Ready banner
  if (step === 2) {
    readyBanner.classList.add('visible');
  } else {
    readyBanner.classList.remove('visible');
  }

  // ETA
  if (step >= 3) {
    etaSection.classList.add('done');
    etaMinutesEl.textContent = '0';
    etaSection.querySelector('.eta-label').innerHTML = '<span>Order</span> <strong>collected</strong> <span>— enjoy!</span>';
    setTimeout(() => { etaFill.style.width = '100%'; }, 80);
  } else {
    etaSection.classList.remove('done');
    etaSection.querySelector('.eta-label').innerHTML = `<span>Ready in approx</span> <strong id="etaMinutes">${eta}</strong> <span>min</span>`;
    const pct = etaPercent(step, eta);
    setTimeout(() => { etaFill.style.width = `${pct}%`; }, 80);
  }

  // Simulate button
  simBtn.disabled = step >= 3;
  simBtn.textContent = step >= 3 ? 'Order complete ✓' : 'Simulate next step →';
}

// ---- Lookup ----
lookupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = orderInput.value.trim().toUpperCase();
  if (!raw) return;

  stopAutoDemo();

  if (ORDERS[raw]) {
    currentOrderKey = raw;
    lookupHint.textContent = `Showing status for ${raw}`;
    lookupHint.classList.remove('error');
    render(currentOrderKey);
  } else {
    lookupHint.textContent = `Order "${raw}" not found. Try T-042, T-038, or T-051.`;
    lookupHint.classList.add('error');
  }
});

// ---- Simulate button ----
simBtn.addEventListener('click', () => {
  if (!currentOrderKey) return;
  const order = ORDERS[currentOrderKey];
  if (order.step < 3) {
    order.step += 1;

    // Reduce eta
    if (order.step === 1) order.eta = Math.max(1, order.eta - 6);
    if (order.step === 2) order.eta = 0;
    if (order.step === 3) order.eta = 0;

    render(currentOrderKey);
  }
});

// ---- Auto-demo ----
function startAutoDemo() {
  autoDemoStep = 0;
  ORDERS['T-042'].step = 0;
  currentOrderKey = 'T-042';
  render('T-042');

  autoDemoTimer = setInterval(() => {
    autoDemoStep = (autoDemoStep + 1) % 4;
    ORDERS['T-042'].step = autoDemoStep;
    // Reset eta for demo
    ORDERS['T-042'].eta = [18, 12, 0, 0][autoDemoStep];
    render('T-042');

    if (autoDemoStep === 3) {
      // Pause at final state, then restart
      clearInterval(autoDemoTimer);
      setTimeout(() => {
        if (!orderInput.value.trim()) {
          startAutoDemo();
        }
      }, 3500);
    }
  }, 3000);
}

function stopAutoDemo() {
  if (autoDemoTimer) {
    clearInterval(autoDemoTimer);
    autoDemoTimer = null;
  }
}

// ---- Init ----
startAutoDemo();
