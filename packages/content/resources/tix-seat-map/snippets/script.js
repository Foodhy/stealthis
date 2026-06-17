(function () {
  "use strict";

  // ---------- Config ----------
  var MAX_SEATS = 6;
  var FEE_RATE = 0.14; // 14% service fee
  var SVGNS = "http://www.w3.org/2000/svg";

  var TIERS = {
    vip: { label: "VIP Pit", price: 240, color: "#ff3d81" },
    lower: { label: "Lower Bowl", price: 160, color: "#7c3aed" },
    mid: { label: "Mezzanine", price: 95, color: "#2563eb" },
    upper: { label: "Upper Deck", price: 55, color: "#0891b2" }
  };

  // Section blocks: each is a band of rows. taken seats are pseudo-random but stable.
  var SECTIONS = [
    { id: "VIP", tier: "vip", rows: 3, cols: 16, x: 70, y: 80, gap: 22 },
    { id: "A", tier: "lower", rows: 5, cols: 18, x: 50, y: 175, gap: 22 },
    { id: "B", tier: "mid", rows: 5, cols: 22, x: 28, y: 305, gap: 21 },
    { id: "C", tier: "upper", rows: 4, cols: 26, x: 10, y: 430, gap: 20 }
  ];

  var SEAT_R = 7;

  // ---------- State ----------
  var selected = {}; // id -> seat data
  var activeFilter = null;
  var scale = 1;
  var panX = 0;
  var panY = 0;
  var MIN_SCALE = 0.55;
  var MAX_SCALE = 2.4;

  // ---------- DOM ----------
  var svg = document.getElementById("seatSvg");
  var canvas = document.getElementById("canvas");
  var viewport = document.getElementById("viewport");
  var seatList = document.getElementById("seatList");
  var emptyState = document.getElementById("emptyState");
  var zoomLabel = document.getElementById("zoomLabel");
  var continueBtn = document.getElementById("continueBtn");

  // deterministic pseudo-random for "taken" seats
  function seeded(n) {
    var x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  // ---------- Build seat map ----------
  var seatIndex = {}; // id -> element + data
  var maxX = 0;
  var maxY = 0;
  var counter = 0;

  function buildSeats() {
    SECTIONS.forEach(function (sec) {
      var rowLetters = "ABCDEFGHIJ";
      for (var r = 0; r < sec.rows; r++) {
        var rowY = sec.y + r * sec.gap;
        // section is centered: indent so blocks look like an arc-ish bowl
        var indent = (26 - sec.cols) * (sec.gap / 2);
        var startX = sec.x + indent / 1.4;

        // row label
        var label = document.createElementNS(SVGNS, "text");
        label.setAttribute("x", startX - 16);
        label.setAttribute("y", rowY + 4);
        label.setAttribute("class", "row-label");
        label.textContent = sec.id + rowLetters[r];
        svg.appendChild(label);

        for (var c = 0; c < sec.cols; c++) {
          counter++;
          var cx = startX + c * sec.gap;
          var cy = rowY;
          if (cx + SEAT_R > maxX) maxX = cx + SEAT_R;
          if (cy + SEAT_R > maxY) maxY = cy + SEAT_R;

          var rnd = seeded(counter);
          var isTaken = rnd > 0.74;
          // a couple accessible seats at row ends of lower/vip
          var isAccessible =
            (sec.tier === "vip" || sec.tier === "lower") &&
            (c === 0 || c === sec.cols - 1) &&
            r === sec.rows - 1;

          var id = sec.id + rowLetters[r] + "-" + (c + 1);
          var tier = TIERS[sec.tier];

          var circle = document.createElementNS(SVGNS, "circle");
          circle.setAttribute("cx", cx);
          circle.setAttribute("cy", cy);
          circle.setAttribute("r", SEAT_R);
          circle.setAttribute("class", "seat");
          circle.setAttribute("tabindex", isTaken ? "-1" : "0");
          circle.setAttribute("role", "button");
          circle.setAttribute("data-id", id);
          circle.setAttribute("data-tier", sec.tier);

          var fill, stroke;
          if (isTaken) {
            fill = "#c9c9d6";
            stroke = "#b4b4c4";
            circle.classList.add("is-taken");
          } else if (isAccessible) {
            fill = "#f59e0b";
            stroke = "#d97706";
          } else {
            fill = "#ffffff";
            stroke = tier.color;
          }
          circle.setAttribute("fill", fill);
          circle.setAttribute("stroke", stroke);
          circle.setAttribute("stroke-width", "2");

          var aria =
            "Seat " + id + ", " + tier.label + ", $" + tier.price +
            (isTaken ? ", unavailable" : isAccessible ? ", accessible, available" : ", available");
          circle.setAttribute("aria-label", aria);

          svg.appendChild(circle);
          seatIndex[id] = {
            el: circle,
            id: id,
            section: sec.id,
            tier: sec.tier,
            price: tier.price,
            color: tier.color,
            taken: isTaken,
            accessible: isAccessible,
            baseFill: fill
          };
        }
      }
    });

    var w = maxX + 40;
    var h = maxY + 30;
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
  }

  // ---------- Selection ----------
  function toggleSeat(seat) {
    if (seat.taken) {
      toast("That seat is already taken.", true);
      return;
    }
    if (selected[seat.id]) {
      deselect(seat);
      return;
    }
    if (Object.keys(selected).length >= MAX_SEATS) {
      toast("Max " + MAX_SEATS + " seats per order.", true);
      return;
    }
    selected[seat.id] = seat;
    seat.el.classList.add("is-selected");
    seat.el.setAttribute("fill", seat.accessible ? "#b45309" : seat.color);
    seat.el.setAttribute("aria-pressed", "true");
    render();
  }

  function deselect(seat) {
    delete selected[seat.id];
    seat.el.classList.remove("is-selected");
    seat.el.setAttribute("fill", seat.baseFill);
    seat.el.setAttribute("aria-pressed", "false");
    render();
  }

  function render() {
    var ids = Object.keys(selected);
    var subtotal = 0;

    // clear list (keep empty node reference)
    seatList.querySelectorAll(".seat-row").forEach(function (n) {
      n.remove();
    });

    if (ids.length === 0) {
      emptyState.style.display = "";
    } else {
      emptyState.style.display = "none";
    }

    ids
      .sort()
      .forEach(function (id) {
        var s = selected[id];
        subtotal += s.price;
        var li = document.createElement("li");
        li.className = "seat-row";
        li.innerHTML =
          '<span class="seat-tier-tag" style="background:' +
          (s.accessible ? "#f59e0b" : s.color) +
          '"></span>' +
          '<span class="meta"><strong>Seat ' +
          s.id +
          "</strong><small>" +
          TIERS[s.tier].label +
          (s.accessible ? " · Accessible" : "") +
          "</small></span>" +
          '<span class="price">$' +
          s.price.toFixed(2) +
          "</span>" +
          '<button class="rm" aria-label="Remove seat ' +
          s.id +
          '">×</button>';
        li.querySelector(".rm").addEventListener("click", function () {
          deselect(s);
        });
        seatList.appendChild(li);
      });

    var fee = subtotal * FEE_RATE;
    document.getElementById("subtotal").textContent = "$" + subtotal.toFixed(2);
    document.getElementById("fee").textContent = "$" + fee.toFixed(2);
    document.getElementById("total").textContent =
      "$" + (subtotal + fee).toFixed(2);

    var count = ids.length;
    document.getElementById("seatCount").textContent =
      count + " seat" + (count === 1 ? "" : "s");
    continueBtn.disabled = count === 0;
  }

  // ---------- Tier filter ----------
  function setFilter(tier) {
    activeFilter = activeFilter === tier ? null : tier;
    var legend = document.querySelector(".legend");
    legend.classList.toggle("has-filter", !!activeFilter);

    document.querySelectorAll(".legend-chip").forEach(function (chip) {
      chip.setAttribute(
        "aria-pressed",
        chip.dataset.tier === activeFilter ? "true" : "false"
      );
    });

    Object.keys(seatIndex).forEach(function (id) {
      var s = seatIndex[id];
      var dim = activeFilter && s.tier !== activeFilter;
      s.el.classList.toggle("dim", !!dim);
    });
  }

  // ---------- Zoom / Pan ----------
  function applyTransform() {
    canvas.style.transform =
      "translate(" + panX + "px," + panY + "px) scale(" + scale + ")";
    zoomLabel.textContent = Math.round(scale * 100) + "%";
  }

  function clampPan() {
    var vw = viewport.clientWidth;
    var vh = viewport.clientHeight;
    var cw = (maxX + 60) * scale;
    var ch = (maxY + 60) * scale;
    var minX = Math.min(0, vw - cw);
    var minY = Math.min(0, vh - ch);
    panX = Math.max(minX, Math.min(20, panX));
    panY = Math.max(minY, Math.min(20, panY));
  }

  function zoomTo(newScale, originX, originY) {
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    var rect = viewport.getBoundingClientRect();
    var ox = originX == null ? rect.width / 2 : originX - rect.left;
    var oy = originY == null ? rect.height / 2 : originY - rect.top;
    // keep point under cursor stable
    panX = ox - ((ox - panX) / scale) * newScale;
    panY = oy - ((oy - panY) / scale) * newScale;
    scale = newScale;
    clampPan();
    applyTransform();
  }

  document.getElementById("zoomIn").addEventListener("click", function () {
    zoomTo(scale * 1.25);
  });
  document.getElementById("zoomOut").addEventListener("click", function () {
    zoomTo(scale / 1.25);
  });
  document.getElementById("zoomReset").addEventListener("click", function () {
    scale = 1;
    panX = 0;
    panY = 0;
    applyTransform();
  });

  viewport.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      var dir = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      zoomTo(scale * dir, e.clientX, e.clientY);
    },
    { passive: false }
  );

  // pan with pointer drag (but allow click on seats)
  var dragging = false;
  var moved = false;
  var startPX = 0;
  var startPY = 0;
  var startPanX = 0;
  var startPanY = 0;

  viewport.addEventListener("pointerdown", function (e) {
    dragging = true;
    moved = false;
    startPX = e.clientX;
    startPY = e.clientY;
    startPanX = panX;
    startPanY = panY;
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - startPX;
    var dy = e.clientY - startPY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      moved = true;
      viewport.classList.add("panning");
    }
    panX = startPanX + dx;
    panY = startPanY + dy;
    clampPan();
    applyTransform();
  });
  viewport.addEventListener("pointerup", function () {
    dragging = false;
    viewport.classList.remove("panning");
  });
  viewport.addEventListener("pointercancel", function () {
    dragging = false;
    viewport.classList.remove("panning");
  });

  // seat click (suppress if user was panning)
  svg.addEventListener("click", function (e) {
    if (moved) return;
    var t = e.target;
    if (!t.classList || !t.classList.contains("seat")) return;
    var seat = seatIndex[t.getAttribute("data-id")];
    if (seat) toggleSeat(seat);
  });

  // keyboard seat selection
  svg.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var t = e.target;
    if (!t.classList || !t.classList.contains("seat")) return;
    e.preventDefault();
    var seat = seatIndex[t.getAttribute("data-id")];
    if (seat) toggleSeat(seat);
  });

  // legend filters
  document.querySelectorAll(".legend-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      setFilter(chip.dataset.tier);
    });
  });

  // continue
  continueBtn.addEventListener("click", function () {
    var n = Object.keys(selected).length;
    if (!n) return;
    var total = document.getElementById("total").textContent;
    toast("Holding " + n + " seat" + (n === 1 ? "" : "s") + " · " + total + " — demo only");
  });

  // ---------- Toast ----------
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, warn) {
    var el = document.createElement("div");
    el.className = "toast" + (warn ? " warn" : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 2800);
  }

  // ---------- Countdown ----------
  var eventTime = new Date("2026-07-18T20:00:00").getTime();
  function tick() {
    var diff = eventTime - Date.now();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    set("d", d);
    set("h", h);
    set("m", m);
    set("s", s);
  }
  function set(k, v) {
    var el = document.querySelector('[data-cd="' + k + '"]');
    if (el) el.textContent = String(v).padStart(2, "0");
  }

  // ---------- Init ----------
  buildSeats();
  render();
  applyTransform();
  tick();
  setInterval(tick, 1000);
})();
