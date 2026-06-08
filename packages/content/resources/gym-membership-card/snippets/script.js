(function () {
  "use strict";

  /* ---------- member data (fictional) ---------- */
  var member = {
    name: "Marcus Delgado",
    id: "IP-4827-0193",
    joined: "Mar 2022",
  };

  var TIERS = {
    black: { name: "Black Unlimited", id: "IP-4827-0193" },
    pro: { name: "Pro", id: "IP-3391-7740" },
    flex: { name: "Flex", id: "IP-8052-2218" },
  };

  /* ---------- elements ---------- */
  var card = document.getElementById("card");
  var flipBtn = document.getElementById("flipBtn");
  var frontDeskBtn = document.getElementById("frontDeskBtn");
  var boostBtn = document.getElementById("boostBtn");
  var boostLabel = document.getElementById("boostLabel");
  var tierName = document.querySelector(".tier__name");
  var memberIdEl = document.getElementById("memberId");
  var barcodeIdEl = document.querySelector(".barcode__id");
  var toastHost = document.getElementById("toastHost");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-tier]"));

  var flipped = false;
  var boosted = false;
  var pulseTimer = null;

  /* ---------- toast ---------- */
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastHost.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("show");
    });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 280);
    }, 2200);
  }

  /* ---------- deterministic pseudo-random from a seed ---------- */
  function seededRand(seed) {
    var s = 0;
    for (var i = 0; i < seed.length; i++) {
      s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* ---------- fake-but-realistic QR matrix ---------- */
  function drawQR(seedStr) {
    var canvas = document.getElementById("qr");
    var ctx = canvas.getContext("2d");
    var N = 25; // modules per side
    var size = canvas.width;
    var cell = Math.floor(size / N);
    var pad = Math.floor((size - cell * N) / 2);
    var rand = seededRand(seedStr);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#0d0f12";

    // build matrix
    var grid = [];
    var r, c;
    for (r = 0; r < N; r++) {
      grid[r] = [];
      for (c = 0; c < N; c++) {
        grid[r][c] = rand() > 0.5 ? 1 : 0;
      }
    }

    // finder pattern (7x7) drawn at a corner
    function finder(or_, oc) {
      for (var i = -1; i <= 7; i++) {
        for (var j = -1; j <= 7; j++) {
          var rr = or_ + i;
          var cc = oc + j;
          if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
          var ring = i >= 0 && i <= 6 && j >= 0 && j <= 6;
          var border = i === 0 || i === 6 || j === 0 || j === 6;
          var core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
          grid[rr][cc] = ring && (border || core) ? 1 : 0;
        }
      }
    }
    finder(0, 0);
    finder(0, N - 7);
    finder(N - 7, 0);

    // timing patterns
    for (var k = 8; k < N - 8; k++) {
      grid[6][k] = k % 2 === 0 ? 1 : 0;
      grid[k][6] = k % 2 === 0 ? 1 : 0;
    }

    // render
    for (r = 0; r < N; r++) {
      for (c = 0; c < N; c++) {
        if (grid[r][c]) {
          ctx.fillRect(pad + c * cell, pad + r * cell, cell, cell);
        }
      }
    }
  }

  /* ---------- barcode (Code 128-ish look) ---------- */
  function drawBarcode(seedStr) {
    var canvas = document.getElementById("barcode");
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var rand = seededRand(seedStr + "::bar");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#0d0f12";

    var x = 6;
    while (x < w - 6) {
      var barW = 1 + Math.floor(rand() * 4);
      var draw = rand() > 0.42;
      if (draw) ctx.fillRect(x, 4, barW, h - 8);
      x += barW + (1 + Math.floor(rand() * 2));
    }
  }

  /* ---------- flip ---------- */
  function setFlipped(state) {
    flipped = state;
    card.classList.toggle("is-flipped", flipped);
    card.setAttribute("aria-pressed", String(flipped));
    card.setAttribute(
      "aria-label",
      flipped
        ? "Membership card. Showing back with door check-in QR code. Activate to flip back."
        : "Membership card. Showing front. Activate to flip and reveal check-in QR code."
    );
    if (!flipped) {
      // re-run sheen on the front when returning
      card.classList.remove("sheen-run");
      void card.offsetWidth;
      card.classList.add("sheen-run");
    }
  }

  function toggleFlip() {
    setFlipped(!flipped);
  }

  card.addEventListener("click", toggleFlip);
  flipBtn.addEventListener("click", function () {
    toggleFlip();
  });

  /* ---------- front desk pulse ---------- */
  frontDeskBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!flipped) setFlipped(true);
    card.classList.add("pulsing");
    toast("Showing check-in code at front desk");
    if (pulseTimer) clearTimeout(pulseTimer);
    pulseTimer = setTimeout(function () {
      card.classList.remove("pulsing");
    }, 6000);
  });

  /* ---------- brightness boost ---------- */
  boostBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    boosted = !boosted;
    document.body.classList.toggle("boosted", boosted);
    boostBtn.setAttribute("aria-pressed", String(boosted));
    boostLabel.textContent = boosted ? "Boost on" : "Brightness boost";
    if (boosted && !flipped) setFlipped(true);
    toast(boosted ? "Max brightness for scanning" : "Brightness restored");
  });

  /* ---------- tier switch ---------- */
  function applyTier(key) {
    var t = TIERS[key];
    if (!t) return;
    tierName.textContent = t.name;
    memberIdEl.textContent = t.id;
    barcodeIdEl.textContent = t.id;
    member.id = t.id;
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.getAttribute("data-tier") === key));
    });
    renderCodes();
    toast("Tier set to " + t.name);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyTier(chip.getAttribute("data-tier"));
    });
  });

  /* ---------- render codes from current member ---------- */
  function renderCodes() {
    var payload = "IRONPULSE|" + member.id + "|CHECKIN";
    drawQR(payload);
    drawBarcode(member.id);
  }

  /* ---------- init ---------- */
  chips.forEach(function (chip) {
    chip.setAttribute("aria-pressed", String(chip.getAttribute("data-tier") === "black"));
  });
  renderCodes();

  // entrance sheen
  setTimeout(function () {
    card.classList.add("sheen-run");
  }, 300);
})();
