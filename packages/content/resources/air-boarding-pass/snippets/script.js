/* Skyward Air — mobile boarding passes (vanilla JS) */
(function () {
  "use strict";

  var planeSVG =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5s-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1L8 11l-2 2H4l-.5.5c-.3.3-.3.8 0 1.1L7 18l3.4 3.5c.3.3.8.3 1.1 0L12 21v-2l2-2 2.3 4.8c.2.4.7.5 1.1.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>';

  var passes = [
    {
      id: "p1",
      flightNo: "SW 482",
      status: "boarding",
      statusLabel: "Boarding",
      from: { code: "JFK", city: "New York", time: "18:40" },
      to: { code: "LHR", city: "London", time: "06:55" },
      gate: "B12",
      seat: "14A",
      zone: "2",
      terminal: "T4",
      board: "18:10",
      pnr: "QXR4ZK",
      name: "Amara N. Okafor",
      cabin: "Economy Plus",
      fare: "Flex",
      bags: "1 checked · 23kg",
      ff: "Skyward Gold",
      duration: "7h 15m",
    },
    {
      id: "p2",
      flightNo: "SW 119",
      status: "ontime",
      statusLabel: "On time",
      from: { code: "SFO", city: "San Francisco", time: "09:05" },
      to: { code: "NRT", city: "Tokyo", time: "13:30" },
      gate: "A07",
      seat: "3C",
      zone: "1",
      terminal: "T2",
      board: "08:35",
      pnr: "LM7PWD",
      name: "Diego Ferreira",
      cabin: "Business",
      fare: "Flex Plus",
      bags: "2 checked · 32kg",
      ff: "Skyward Platinum",
      duration: "11h 25m",
    },
    {
      id: "p3",
      flightNo: "SW 256",
      status: "delayed",
      statusLabel: "Delayed +35m",
      from: { code: "DXB", city: "Dubai", time: "23:50" },
      to: { code: "CDG", city: "Paris", time: "04:20" },
      gate: "C21",
      seat: "27F",
      zone: "4",
      terminal: "T3",
      board: "23:20",
      pnr: "VT9HBN",
      name: "Mei-Lin Chua",
      cabin: "Economy",
      fare: "Saver",
      bags: "1 checked · 23kg",
      ff: "Skyward Silver",
      duration: "7h 30m",
    },
  ];

  /* ---- QR-ish matrix renderer (deterministic, decorative) ---- */
  function drawQR(canvas, seed) {
    var n = 21;
    var ctx = canvas.getContext("2d");
    var px = 8;
    canvas.width = n * px;
    canvas.height = n * px;
    ctx.fillStyle = "#f6f9ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0e1f33";

    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    function rnd() {
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
      return ((h >>> 0) % 1000) / 1000;
    }
    function finder(ox, oy) {
      ctx.fillRect(ox * px, oy * px, 7 * px, 7 * px);
      ctx.fillStyle = "#f6f9ff";
      ctx.fillRect((ox + 1) * px, (oy + 1) * px, 5 * px, 5 * px);
      ctx.fillStyle = "#0e1f33";
      ctx.fillRect((ox + 2) * px, (oy + 2) * px, 3 * px, 3 * px);
    }
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        var inFinder =
          (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
        if (inFinder) continue;
        if (rnd() > 0.52) ctx.fillRect(x * px, y * px, px, px);
      }
    }
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  }

  /* ---- toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---- build a pass card ---- */
  function buildPass(p) {
    var el = document.createElement("article");
    el.className = "pass";
    el.dataset.id = p.id;

    el.innerHTML =
      '<div class="pass-inner">' +
        '<div class="face face-front">' +
          '<div class="pass-head">' +
            '<span class="pass-airline">' + planeSVG + " Skyward Air</span>" +
            '<span class="pass-flightno">' + p.flightNo + "</span>" +
          "</div>" +
          '<div class="route">' +
            '<div class="airport from">' +
              '<div class="code">' + p.from.code + "</div>" +
              '<div class="city">' + p.from.city + "</div>" +
              '<div class="time">' + p.from.time + "</div>" +
            "</div>" +
            '<div class="plane-line">' + planeSVG + "</div>" +
            '<div class="airport to">' +
              '<div class="code">' + p.to.code + "</div>" +
              '<div class="city">' + p.to.city + "</div>" +
              '<div class="time">' + p.to.time + "</div>" +
            "</div>" +
          "</div>" +
          '<div class="detail-row">' +
            detail("Gate", p.gate, "gate") +
            detail("Seat", p.seat) +
            detail("Zone", p.zone) +
            detail("Term", p.terminal) +
          "</div>" +
          '<div class="perf"><span class="dashes"></span></div>' +
          '<div class="stub">' +
            '<div class="qr"><canvas></canvas></div>' +
            '<div class="stub-info">' +
              '<div class="stub-name">' + p.name + "</div>" +
              '<div class="stub-sub">' + p.cabin + " · Boards " + p.board + "</div>" +
              '<div class="zone-row">' +
                '<span class="zone-chip">Zone ' + p.zone + "</span>" +
                '<span class="status ' + p.status + '">' + p.statusLabel + "</span>" +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="actions">' +
            '<button class="act wallet" type="button" data-act="wallet">' +
              '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>' +
              " Add to wallet</button>" +
            '<button class="act bright" type="button" data-act="bright" aria-pressed="false">' +
              '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
              " Brightness</button>" +
            '<button class="act" type="button" data-act="flip">Details</button>' +
          "</div>" +
        "</div>" +
        '<div class="face face-back">' +
          '<div class="back-head">' +
            "<h3>" + p.from.code + " → " + p.to.code + "</h3>" +
            "<p>" + p.flightNo + " · " + p.duration + " · " + p.name + "</p>" +
          "</div>" +
          '<div class="back-body">' +
            brow("Booking ref", p.pnr) +
            brow("Cabin", p.cabin) +
            brow("Fare", p.fare) +
            brow("Seat", p.seat) +
            brow("Baggage", p.bags) +
            brow("Frequent flyer", p.ff, true) +
            brow("Boarding", "Gate " + p.gate + " · " + p.board) +
          "</div>" +
          '<button class="flip-back" type="button" data-act="flip">Back to pass</button>' +
        "</div>" +
      "</div>";

    return el;
  }

  function detail(lab, val, extra) {
    var cls = "detail" + (extra ? " " + extra : "");
    return '<div class="' + cls + '"><div class="lab">' + lab +
      '</div><div class="val">' + val + "</div></div>";
  }
  function brow(k, v, ff) {
    return '<div class="brow"><span class="k">' + k + '</span><span class="v' +
      (ff ? " ff" : "") + '">' + v + "</span></div>";
  }

  /* ---- render all ---- */
  var container = document.getElementById("passes");
  passes.forEach(function (p) {
    var el = buildPass(p);
    container.appendChild(el);
    drawQR(el.querySelector(".qr canvas"), p.pnr + p.flightNo);
  });

  /* ---- interactions (event delegation) ---- */
  container.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var pass = btn.closest(".pass");
    var act = btn.dataset.act;

    if (act === "flip") {
      pass.classList.toggle("flipped");
      return;
    }
    if (act === "wallet") {
      var code = pass.querySelector(".pass-flightno").textContent;
      toast("Added " + code + " to Wallet");
      btn.disabled = true;
      btn.textContent = "Added ✓";
      return;
    }
    if (act === "bright") {
      var on = pass.classList.toggle("boosted");
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", String(on));
      toast(on ? "Brightness boosted for scanning" : "Brightness restored");
    }
  });

  /* ---- simulated gate change on the boarding flight ---- */
  setTimeout(function () {
    var first = container.querySelector('.pass[data-id="p1"]');
    if (!first) return;
    var gate = first.querySelector(".detail.gate");
    var val = gate.querySelector(".val");
    val.textContent = "B27";
    gate.classList.add("changed");
    if (!gate.querySelector(".gate-tag")) {
      var tag = document.createElement("span");
      tag.className = "gate-tag";
      tag.textContent = "Gate changed";
      gate.appendChild(tag);
    }
    toast("Gate change: SW 482 now boarding at B27");
  }, 4200);

  /* ---- add all to wallet ---- */
  document.getElementById("walletAll").addEventListener("click", function () {
    var btns = container.querySelectorAll('[data-act="wallet"]:not([disabled])');
    btns.forEach(function (b) {
      b.disabled = true;
      b.textContent = "Added ✓";
    });
    toast(
      btns.length
        ? "Added " + btns.length + " passes to Wallet"
        : "All passes already in Wallet"
    );
  });
})();
