(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastHost = document.getElementById("toastHost");
  function toast(msg, kind) {
    if (!toastHost) return;
    var el = document.createElement("div");
    el.className = "toast toast--" + (kind === "ok" ? "ok" : "info");
    el.setAttribute("role", "status");
    var emoji = document.createElement("span");
    emoji.className = "toast-emoji";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = kind === "ok" ? "✓" : "🎟";
    var text = document.createElement("span");
    text.textContent = msg;
    el.appendChild(emoji);
    el.appendChild(text);
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    }, 2600);
  }

  /* ---------- Animated QR (deterministic-ish noise pattern) ---------- */
  var canvas = document.getElementById("qrCanvas");
  var qrCap = document.getElementById("qrCap");
  var ctx = canvas ? canvas.getContext("2d") : null;
  var GRID = 25;
  var seed = 1337;

  function rand() {
    // simple xorshift for repeatable-but-changing patterns
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) % 1000) / 1000;
  }

  function drawFinder(x, y, cell) {
    ctx.fillStyle = "#0e0e16";
    ctx.fillRect(x, y, cell * 7, cell * 7);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
    ctx.fillStyle = "#0e0e16";
    ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
  }

  function inFinder(c, r) {
    return (
      (c < 7 && r < 7) ||
      (c >= GRID - 7 && r < 7) ||
      (c < 7 && r >= GRID - 7)
    );
  }

  function renderQR(token) {
    if (!ctx) return;
    // seed from token + minute slice so it "rotates"
    var s = 2166136261;
    for (var i = 0; i < token.length; i++) {
      s ^= token.charCodeAt(i);
      s = (s * 16777619) >>> 0;
    }
    seed = (s ^ (Date.now() >> 14)) >>> 0 || 1;

    var size = canvas.width;
    var cell = Math.floor(size / GRID);
    var pad = Math.floor((size - cell * GRID) / 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#0e0e16";
    for (var r = 0; r < GRID; r++) {
      for (var c = 0; c < GRID; c++) {
        if (inFinder(c, r)) continue;
        if (rand() > 0.52) {
          ctx.fillRect(pad + c * cell, pad + r * cell, cell, cell);
        }
      }
    }
    // finder squares
    drawFinder(pad, pad, cell);
    drawFinder(pad + cell * (GRID - 7), pad, cell);
    drawFinder(pad, pad + cell * (GRID - 7), cell);
  }

  var tokenBase = "NPF-7K42-Q9";
  function freshToken() {
    var suffix = Math.floor(rand() * 9000 + 1000);
    return tokenBase + "-" + suffix;
  }

  var TTL = 15;
  var remaining = TTL;
  var qrTimerEl = document.getElementById("qrTimer");

  if (ctx) {
    renderQR(tokenBase);
    setInterval(function () {
      remaining -= 1;
      if (remaining <= 0) {
        remaining = TTL;
        renderQR(freshToken());
      }
      if (qrTimerEl) qrTimerEl.textContent = remaining;
    }, 1000);
  }

  /* ---------- Flip ---------- */
  var flipBtn = document.getElementById("flipBtn");
  var ticket = document.getElementById("ticket");
  var frontFace = document.querySelector(".ticket-front");
  var backFace = document.querySelector(".ticket-back");

  function setFlip(flipped) {
    ticket.classList.toggle("flipped", flipped);
    flipBtn.setAttribute("aria-pressed", String(flipped));
    flipBtn.textContent = flipped ? "Flip to QR code" : "Flip for details";
    if (frontFace) frontFace.setAttribute("aria-hidden", String(flipped));
    if (backFace) backFace.setAttribute("aria-hidden", String(!flipped));
  }
  if (flipBtn && ticket) {
    flipBtn.addEventListener("click", function () {
      setFlip(!ticket.classList.contains("flipped"));
    });
  }

  /* ---------- Brightness boost ---------- */
  var brightBtn = document.getElementById("brightBtn");
  if (brightBtn) {
    brightBtn.addEventListener("click", function () {
      var on = document.body.classList.toggle("bright");
      brightBtn.setAttribute("aria-pressed", String(on));
      brightBtn.querySelector(".bright-label").textContent = on
        ? "Brightness boosted"
        : "Boost brightness";
      toast(on ? "Screen brightness boosted for scanning" : "Brightness back to normal", "info");
    });
  }

  /* ---------- Add to wallet ---------- */
  var walletBtn = document.getElementById("walletBtn");
  if (walletBtn) {
    walletBtn.addEventListener("click", function () {
      walletBtn.disabled = true;
      walletBtn.style.opacity = "0.7";
      toast("Adding GA Floor pass to your wallet…", "info");
      setTimeout(function () {
        toast("Saved to Wallet — find it under Passes", "ok");
        walletBtn.disabled = false;
        walletBtn.style.opacity = "";
      }, 1100);
    });
  }

  /* ---------- Transfer modal ---------- */
  var transferBtn = document.getElementById("transferBtn");
  var modal = document.getElementById("transferModal");
  var form = document.getElementById("transferForm");
  var recName = document.getElementById("recName");
  var recContact = document.getElementById("recContact");
  var recError = document.getElementById("recError");
  var lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.addEventListener("keydown", onKey);
    setTimeout(function () {
      if (recName) recName.focus();
    }, 30);
  }
  function closeModal() {
    modal.hidden = true;
    document.removeEventListener("keydown", onKey);
    if (recError) recError.textContent = "";
    if (form) form.reset();
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") closeModal();
  }

  if (transferBtn) transferBtn.addEventListener("click", openModal);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-close")) closeModal();
    });
  }

  function validContact(v) {
    var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    var isPhone = /^[+]?[\d\s()-]{7,}$/.test(v);
    return isEmail || isPhone;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = recName.value.trim();
      var contact = recContact.value.trim();
      if (!name) {
        recError.textContent = "Add a recipient name.";
        recName.focus();
        return;
      }
      if (!validContact(contact)) {
        recError.textContent = "Enter a valid email or phone number.";
        recContact.focus();
        return;
      }
      recError.textContent = "";
      var who = name.split(" ")[0];
      closeModal();
      toast("Transfer request sent…", "info");
      setTimeout(function () {
        toast("Ticket transferred to " + who + " — your QR is now void", "ok");
      }, 1000);
    });
  }

  /* ---------- Countdown to doors ---------- */
  var countdownEl = document.getElementById("countdown");
  // Sat Jul 19 2026, 17:30 local
  var target = new Date(2026, 6, 19, 17, 30, 0).getTime();
  function tickCountdown() {
    if (!countdownEl) return;
    var diff = target - Date.now();
    if (diff <= 0) {
      countdownEl.innerHTML = "Doors are <strong>open</strong> — head to Gate C";
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    countdownEl.innerHTML =
      "Doors open in <strong>" +
      d + "d " + h + "h " + m + "m " + s + "s</strong>";
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);
})();
