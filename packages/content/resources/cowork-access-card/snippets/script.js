(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (kind === "warn" ? " toast--warn" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Deterministic QR-ish matrix ---------- */
  var qrSvg = document.getElementById("qrSvg");
  var qrCodeEl = document.getElementById("qrCode");
  var qrEl = document.getElementById("qr");

  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function drawQR(seed) {
    var N = 21;
    var cell = 100 / N;
    var rand = rng(seed);
    var parts = ['<rect width="100" height="100" fill="#efeae3"/>'];
    function finder(x, y) {
      parts.push(
        '<rect x="' + x * cell + '" y="' + y * cell + '" width="' + cell * 7 +
        '" height="' + cell * 7 + '" fill="#1c1b19"/>'
      );
      parts.push(
        '<rect x="' + (x + 1) * cell + '" y="' + (y + 1) * cell + '" width="' + cell * 5 +
        '" height="' + cell * 5 + '" fill="#efeae3"/>'
      );
      parts.push(
        '<rect x="' + (x + 2) * cell + '" y="' + (y + 2) * cell + '" width="' + cell * 3 +
        '" height="' + cell * 3 + '" fill="#1c1b19"/>'
      );
    }
    function inFinder(r, c) {
      return (
        (r < 8 && c < 8) ||
        (r < 8 && c > N - 9) ||
        (r > N - 9 && c < 8)
      );
    }
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        if (inFinder(r, c)) continue;
        if (rand() > 0.52) {
          parts.push(
            '<rect x="' + c * cell + '" y="' + r * cell + '" width="' + cell +
            '" height="' + cell + '" fill="#26241f"/>'
          );
        }
      }
    }
    finder(0, 0);
    finder(N - 7, 0);
    finder(0, N - 7);
    // amber locator accent
    parts.push(
      '<rect x="' + (N - 9) * cell + '" y="' + (N - 9) * cell + '" width="' + cell * 4 +
      '" height="' + cell * 4 + '" fill="none" stroke="#e8902b" stroke-width="' +
      cell * 0.7 + '"/>'
    );
    qrSvg.innerHTML = parts.join("");
  }

  function codeChunk() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var out = "";
    for (var i = 0; i < 4; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  function refreshCode(announce) {
    var seed = Date.now() % 1000000;
    drawQR(seed);
    qrCodeEl.textContent = "FC · " + codeChunk() + " · " + codeChunk();
    qrEl.classList.remove("refreshing");
    void qrEl.offsetWidth; // reflow to restart animation
    qrEl.classList.add("refreshing");
    countdown = REFRESH_SECS;
    timerEl.textContent = countdown;
    if (announce) toast("Access code refreshed");
  }

  qrEl.addEventListener("click", function () {
    refreshCode(true);
  });

  /* ---------- Auto-refresh timer ---------- */
  var REFRESH_SECS = 30;
  var countdown = REFRESH_SECS;
  var timerEl = document.getElementById("qrTimer");
  setInterval(function () {
    countdown -= 1;
    if (countdown <= 0) {
      refreshCode(false);
      return;
    }
    timerEl.textContent = countdown;
  }, 1000);

  /* ---------- Hold-to-unlock ---------- */
  var unlock = document.getElementById("unlock");
  var unlockLabel = document.getElementById("unlockLabel");
  var HOLD_MS = 850;
  var holdStart = 0;
  var holdRAF = null;
  var unlocking = false;

  function setHold(pct) {
    unlock.style.setProperty("--hold", pct + "%");
  }

  function tick() {
    var elapsed = Date.now() - holdStart;
    var pct = Math.min(100, (elapsed / HOLD_MS) * 100);
    setHold(pct);
    if (pct >= 100) {
      completeUnlock();
      return;
    }
    holdRAF = requestAnimationFrame(tick);
  }

  function startHold() {
    if (unlocking) return;
    holdStart = Date.now();
    unlockLabel.textContent = "Reading credential…";
    holdRAF = requestAnimationFrame(tick);
  }

  function cancelHold() {
    if (unlocking) return;
    if (holdRAF) cancelAnimationFrame(holdRAF);
    holdRAF = null;
    setHold(0);
    unlockLabel.textContent = "Hold to unlock door";
  }

  function completeUnlock() {
    if (unlocking) return;
    unlocking = true;
    if (holdRAF) cancelAnimationFrame(holdRAF);
    setHold(100);
    unlock.classList.add("success");
    unlockLabel.textContent = "Door unlocked";
    toast("Loft Bay door unlocked");
    addLog({
      where: "Loft Bay · Floor 3",
      meta: "QR credential · Studio Pass",
      status: "ok",
      time: "now"
    });
    setTimeout(function () {
      unlock.classList.remove("success");
      unlockLabel.textContent = "Hold to unlock door";
      setHold(0);
      unlocking = false;
    }, 2200);
  }

  unlock.addEventListener("mousedown", startHold);
  unlock.addEventListener("mouseup", cancelHold);
  unlock.addEventListener("mouseleave", cancelHold);
  unlock.addEventListener("touchstart", function (e) {
    e.preventDefault();
    startHold();
  }, { passive: false });
  unlock.addEventListener("touchend", cancelHold);
  unlock.addEventListener("touchcancel", cancelHold);
  // keyboard: Enter/Space triggers an instant unlock for accessibility
  unlock.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && !unlocking) {
      e.preventDefault();
      setHold(100);
      completeUnlock();
    }
  });

  /* ---------- Card flip ---------- */
  var card = document.getElementById("card");
  var frontFace = card.querySelector(".card__front");
  var backFace = card.querySelector(".card__back");

  function flip(toBack) {
    card.dataset.face = toBack ? "back" : "front";
    backFace.setAttribute("aria-hidden", String(!toBack));
    frontFace.setAttribute("aria-hidden", String(toBack));
  }
  document.getElementById("toBack").addEventListener("click", function () {
    flip(true);
  });
  document.getElementById("toFront").addEventListener("click", function () {
    flip(false);
  });

  /* ---------- Access log ---------- */
  var logList = document.getElementById("logList");
  var logCount = document.getElementById("logCount");
  var events = [
    { where: "Main Entrance · Floor 1", meta: "NFC tap · turnstile B", status: "ok", time: "08:41" },
    { where: "Roof Terrace", meta: "QR credential", status: "ok", time: "07:55" },
    { where: "Quiet Pod 2 · Floor 2", meta: "Booking expired", status: "warn", time: "Yesterday" },
    { where: "Server Room", meta: "Zone not permitted", status: "deny", time: "Mon" }
  ];

  var dotClass = { ok: "dot--ok", warn: "dot--warn", deny: "dot--deny" };

  function renderItem(ev, isNew) {
    var li = document.createElement("li");
    li.className = "log__item" + (isNew ? " is-new" : "");
    li.innerHTML =
      '<span class="dot ' + dotClass[ev.status] + '"></span>' +
      '<div class="log__body">' +
        '<p class="log__where"></p>' +
        '<p class="log__meta"></p>' +
      '</div>' +
      '<span class="log__time"></span>';
    li.querySelector(".log__where").textContent = ev.where;
    li.querySelector(".log__meta").textContent = ev.meta;
    li.querySelector(".log__time").textContent = ev.time;
    return li;
  }

  function updateCount() {
    var n = logList.children.length;
    logCount.textContent = n + (n === 1 ? " event" : " events");
  }

  function addLog(ev) {
    logList.insertBefore(renderItem(ev, true), logList.firstChild);
    while (logList.children.length > 6) {
      logList.removeChild(logList.lastChild);
    }
    updateCount();
  }

  events.forEach(function (ev) {
    logList.appendChild(renderItem(ev, false));
  });
  updateCount();

  /* ---------- Init ---------- */
  refreshCode(false);
})();
