/* ── lgc-65-nft-marketplace · script.js ──────────────────────────────────── */

/* ── Bid Price Ticker ──────────────────────────────────────────────────────── */
(function initBidTicker() {
  var prices = document.querySelectorAll(".bid-eth");
  if (!prices.length) return;

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Update only the text node to preserve the inner SVG icon
  function getTextNode(el) {
    for (var i = el.childNodes.length - 1; i >= 0; i--) {
      if (el.childNodes[i].nodeType === 3) return el.childNodes[i];
    }
    return null;
  }

  function tick() {
    var idx = Math.floor(Math.random() * prices.length);
    var el = prices[idx];
    var textNode = getTextNode(el);
    if (!textNode) return;

    var raw = parseFloat(textNode.textContent.replace(/[^\d.]/g, "")) || 0;
    var increment = parseFloat(randomBetween(0.01, 0.05).toFixed(2));
    var newVal = (raw + increment).toFixed(2);

    textNode.textContent = " " + newVal + " ETH";
    el.classList.add("flash");

    setTimeout(function () {
      el.classList.remove("flash");
    }, 600);

    var delay = Math.floor(randomBetween(3000, 8000));
    setTimeout(tick, delay);
  }

  setTimeout(tick, 2000);
})();

/* ── Countdown Timers ──────────────────────────────────────────────────────── */
(function initCountdowns() {
  var timers = document.querySelectorAll(".auction-timer");
  if (!timers.length) return;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function update() {
    var now = Date.now();
    timers.forEach(function (el) {
      var end = parseInt(el.dataset.end, 10) * 1000;
      var diff = Math.max(0, end - now);
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      el.textContent = pad(h) + ":" + pad(m) + ":" + pad(s);
      if (diff === 0) el.textContent = "Ended";
    });
  }

  // Assign fake future timestamps for demo timers without data-end
  timers.forEach(function (el) {
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
  var btn = document.querySelector(".btn-wallet");
  if (!btn) return;

  var connected = false;

  var addresses = ["0x71C7…4E2a", "0xA903…B1f0", "0x3F9d…C247"];

  btn.addEventListener("click", function () {
    if (connected) {
      connected = false;
      btn.textContent = "Connect Wallet";
      btn.classList.remove("connected");
    } else {
      connected = true;
      var addr = addresses[Math.floor(Math.random() * addresses.length)];
      btn.textContent = addr;
      btn.classList.add("connected");
    }
  });
})();
