/* ── lgc-65-nft-marketplace · script.js ──────────────────────────────────── */

/* ── Bid Price Ticker ──────────────────────────────────────────────────────── */
(function initBidTicker() {
  var prices = document.querySelectorAll('.bid-price');
  if (!prices.length) return;

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function tick() {
    var idx = Math.floor(Math.random() * prices.length);
    var el = prices[idx];
    var raw = parseFloat(el.textContent.replace(/[^\d.]/g, '')) || 0;
    var increment = parseFloat(randomBetween(0.01, 0.05).toFixed(2));
    var newVal = (raw + increment).toFixed(2);

    el.textContent = newVal + ' ETH';
    el.classList.add('flash');

    setTimeout(function() {
      el.classList.remove('flash');
    }, 600);

    // schedule next tick between 3-8 seconds
    var delay = Math.floor(randomBetween(3000, 8000));
    setTimeout(tick, delay);
  }

  // start after a short initial delay
  setTimeout(tick, 2000);
})();

/* ── Countdown Timers ──────────────────────────────────────────────────────── */
(function initCountdowns() {
  var timers = document.querySelectorAll('.auction-countdown[data-end]');
  if (!timers.length) return;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function update() {
    var now = Date.now();
    timers.forEach(function(el) {
      var end = parseInt(el.dataset.end, 10) * 1000;
      var diff = Math.max(0, end - now);
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      el.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
      if (diff === 0) el.textContent = 'Ended';
    });
  }

  // For demo: if no data-end is set, create fake future timestamps
  timers.forEach(function(el) {
    if (!el.dataset.end) {
      var offset = Math.floor(Math.random() * 3600 * 24) + 3600;
      el.dataset.end = Math.floor(Date.now() / 1000) + offset;
    }
  });

  update();
  setInterval(update, 1000);
})();

/* ── Connect Wallet Button ─────────────────────────────────────────────────── */
(function initWallet() {
  var btn = document.querySelector('.wallet-btn');
  if (!btn) return;

  var connected = false;

  var addresses = [
    '0x71C7…4E2a',
    '0xA903…B1f0',
    '0x3F9d…C247',
  ];

  btn.addEventListener('click', function() {
    if (connected) {
      connected = false;
      btn.textContent = 'Connect Wallet';
      btn.classList.remove('connected');
    } else {
      connected = true;
      var addr = addresses[Math.floor(Math.random() * addresses.length)];
      btn.textContent = addr;
      btn.classList.add('connected');
    }
  });
})();
