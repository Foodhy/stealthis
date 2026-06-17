(function () {
  "use strict";

  var MAX_SEATS = 6;

  var TIERS = {
    vip:   { label: "VIP Pit",     price: 240, color: "#ff3d81" },
    front: { label: "Front Block", price: 165, color: "#7c3aed" },
    mid:   { label: "Mid Tier",    price: 98,  color: "#2563eb" },
    rear:  { label: "Rear Stand",  price: 55,  color: "#0d9488" }
  };

  // Row layout: letter, tier, seat count. Aisle splits each row in two blocks.
  var ROWS = [
    { row: "A", tier: "vip" },
    { row: "B", tier: "vip" },
    { row: "C", tier: "front" },
    { row: "D", tier: "front" },
    { row: "E", tier: "front" },
    { row: "F", tier: "mid" },
    { row: "G", tier: "mid" },
    { row: "H", tier: "mid" },
    { row: "J", tier: "mid" },
    { row: "K", tier: "rear" },
    { row: "L", tier: "rear" }
  ];
  var SEATS_PER_BLOCK = 8; // two blocks per row

  var grid = document.getElementById("seat-grid");
  var tooltip = document.getElementById("tooltip");
  var mapWrap = tooltip.parentElement;
  var chips = document.getElementById("chips");
  var chipsEmpty = document.getElementById("chips-empty");
  var selCount = document.getElementById("sel-count");
  var selTotal = document.getElementById("sel-total");
  var checkoutBtn = document.getElementById("checkout");
  var toastEl = document.getElementById("toast");

  var selected = []; // array of seat ids in selection order
  var seatMap = {};  // id -> { el, row, num, tier, taken }

  // ---- deterministic pseudo-random for stable "taken" seats ----
  function seeded(n) {
    var x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  // ---- build grid ----
  var seedCounter = 1;
  ROWS.forEach(function (def) {
    var rowEl = document.createElement("div");
    rowEl.className = "seat-row";
    rowEl.setAttribute("role", "row");

    var lblL = document.createElement("span");
    lblL.className = "row-label";
    lblL.textContent = def.row;
    rowEl.appendChild(lblL);

    for (var block = 0; block < 2; block++) {
      for (var s = 1; s <= SEATS_PER_BLOCK; s++) {
        var num = block * SEATS_PER_BLOCK + s;
        var id = def.row + num;
        var taken = seeded(seedCounter++) < 0.22;

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "seat" + (taken ? " taken" : "");
        btn.dataset.tier = def.tier;
        btn.dataset.id = id;
        btn.dataset.row = def.row;
        btn.dataset.num = num;
        btn.setAttribute("role", "gridcell");
        btn.setAttribute(
          "aria-label",
          "Row " + def.row + " seat " + num + ", " + TIERS[def.tier].label +
          ", $" + TIERS[def.tier].price + (taken ? ", unavailable" : "")
        );
        if (taken) btn.setAttribute("aria-disabled", "true");

        rowEl.appendChild(btn);
        seatMap[id] = { el: btn, row: def.row, num: num, tier: def.tier, taken: taken };
      }
      if (block === 0) {
        var aisle = document.createElement("span");
        aisle.className = "aisle";
        aisle.setAttribute("aria-hidden", "true");
        rowEl.appendChild(aisle);
      }
    }

    var lblR = document.createElement("span");
    lblR.className = "row-label";
    lblR.textContent = def.row;
    rowEl.appendChild(lblR);

    grid.appendChild(rowEl);
  });

  // ---- toast helper ----
  var toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (kind ? " " + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast" + (kind ? " " + kind : "");
    }, 2200);
  }

  // ---- selection ----
  function toggleSeat(id) {
    var seat = seatMap[id];
    if (!seat || seat.taken) return;

    var idx = selected.indexOf(id);
    if (idx > -1) {
      selected.splice(idx, 1);
      seat.el.classList.remove("selected");
      seat.el.setAttribute("aria-pressed", "false");
    } else {
      if (selected.length >= MAX_SEATS) {
        toast("Limit of " + MAX_SEATS + " seats per order reached.", "warn");
        return;
      }
      selected.push(id);
      seat.el.classList.add("selected");
      seat.el.setAttribute("aria-pressed", "true");
    }
    render();
  }

  function removeSeat(id) {
    var seat = seatMap[id];
    if (!seat) return;
    var idx = selected.indexOf(id);
    if (idx > -1) selected.splice(idx, 1);
    seat.el.classList.remove("selected");
    seat.el.setAttribute("aria-pressed", "false");
    render();
  }

  function render() {
    // chips
    chips.querySelectorAll(".chip").forEach(function (c) { c.remove(); });
    chipsEmpty.style.display = selected.length ? "none" : "";

    var total = 0;
    selected.forEach(function (id) {
      var seat = seatMap[id];
      var t = TIERS[seat.tier];
      total += t.price;

      var chip = document.createElement("span");
      chip.className = "chip";

      var dot = document.createElement("span");
      dot.className = "chip-tier";
      dot.style.background = t.color;

      var tag = document.createElement("span");
      tag.className = "seat-tag";
      tag.textContent = seat.row + seat.num;

      var price = document.createElement("span");
      price.className = "chip-price";
      price.textContent = "$" + t.price;

      var rm = document.createElement("button");
      rm.type = "button";
      rm.setAttribute("aria-label", "Remove seat " + seat.row + seat.num);
      rm.textContent = "×";
      rm.addEventListener("click", function () { removeSeat(id); });

      chip.appendChild(dot);
      chip.appendChild(tag);
      chip.appendChild(price);
      chip.appendChild(rm);
      chips.appendChild(chip);
    });

    selCount.textContent = selected.length + (selected.length === 1 ? " seat" : " seats");
    selTotal.textContent = "$" + total.toLocaleString("en-US");
    checkoutBtn.disabled = selected.length === 0;
  }

  // ---- best available: pick MAX best contiguous seats by tier priority ----
  function bestAvailable() {
    // clear current selection first
    selected.slice().forEach(function (id) { removeSeat(id); });

    var order = ["vip", "front", "mid", "rear"];
    var want = MAX_SEATS;

    for (var t = 0; t < order.length && want > 0; t++) {
      var rowsInTier = ROWS.filter(function (r) { return r.tier === order[t]; });
      for (var ri = 0; ri < rowsInTier.length && want > 0; ri++) {
        var picked = pickContiguous(rowsInTier[ri].row, want);
        if (picked.length) {
          picked.forEach(function (id) {
            selected.push(id);
            var s = seatMap[id];
            s.el.classList.add("selected");
            s.el.setAttribute("aria-pressed", "true");
          });
          want -= picked.length;
        }
      }
    }

    render();
    if (selected.length) {
      var first = seatMap[selected[0]];
      first.el.focus();
      toast("Picked " + selected.length + " best seats in " + TIERS[first.tier].label + ".", "ok");
    } else {
      toast("No seats available right now.", "warn");
    }
  }

  // find a contiguous free run of up to `want` seats within a row block
  function pickContiguous(row, want) {
    var best = [];
    for (var block = 0; block < 2; block++) {
      var run = [];
      for (var s = 1; s <= SEATS_PER_BLOCK; s++) {
        var num = block * SEATS_PER_BLOCK + s;
        var id = row + num;
        var seat = seatMap[id];
        if (seat && !seat.taken) {
          run.push(id);
          if (run.length > best.length) best = run.slice();
          if (best.length >= want) return best.slice(0, want);
        } else {
          run = [];
        }
      }
    }
    return best.slice(0, want);
  }

  // ---- tooltip ----
  function showTooltip(seatEl) {
    var seat = seatMap[seatEl.dataset.id];
    if (!seat) return;
    var t = TIERS[seat.tier];
    var status = seat.taken ? " · <strong>Taken</strong>" : "";
    tooltip.innerHTML =
      "Row " + seat.row + " · Seat " + seat.num + " — <strong>$" + t.price + "</strong>" +
      "<br>" + t.label + status;

    var wrapRect = mapWrap.getBoundingClientRect();
    var sRect = seatEl.getBoundingClientRect();
    var x = sRect.left - wrapRect.left + sRect.width / 2;
    var y = sRect.top - wrapRect.top;
    tooltip.style.left = x + "px";
    tooltip.style.top = (y - 8) + "px";
    tooltip.classList.add("show");
    tooltip.setAttribute("aria-hidden", "false");
  }

  function hideTooltip() {
    tooltip.classList.remove("show");
    tooltip.setAttribute("aria-hidden", "true");
  }

  // ---- event delegation ----
  grid.addEventListener("click", function (e) {
    var seatEl = e.target.closest(".seat");
    if (!seatEl) return;
    if (seatEl.classList.contains("taken")) {
      toast("Row " + seatEl.dataset.row + seatEl.dataset.num + " is already taken.", "warn");
      return;
    }
    toggleSeat(seatEl.dataset.id);
  });

  grid.addEventListener("mouseover", function (e) {
    var seatEl = e.target.closest(".seat");
    if (seatEl) showTooltip(seatEl);
  });
  grid.addEventListener("mouseout", function (e) {
    if (e.target.closest(".seat")) hideTooltip();
  });
  grid.addEventListener("focusin", function (e) {
    var seatEl = e.target.closest(".seat");
    if (seatEl) showTooltip(seatEl);
  });
  grid.addEventListener("focusout", hideTooltip);

  // ---- zoom ----
  var zoom = 1;
  var ZMIN = 0.7, ZMAX = 1.6, ZSTEP = 0.15;
  var zoomVal = document.getElementById("zoom-val");

  function applyZoom() {
    grid.style.transform = "scale(" + zoom + ")";
    zoomVal.textContent = Math.round(zoom * 100) + "%";
  }
  document.getElementById("zoom-in").addEventListener("click", function () {
    zoom = Math.min(ZMAX, +(zoom + ZSTEP).toFixed(2));
    applyZoom();
  });
  document.getElementById("zoom-out").addEventListener("click", function () {
    zoom = Math.max(ZMIN, +(zoom - ZSTEP).toFixed(2));
    applyZoom();
  });

  // ---- controls ----
  document.getElementById("best-avail").addEventListener("click", bestAvailable);
  document.getElementById("clear-sel").addEventListener("click", function () {
    if (!selected.length) { toast("Nothing to clear."); return; }
    selected.slice().forEach(function (id) { removeSeat(id); });
    toast("Selection cleared.");
  });
  checkoutBtn.addEventListener("click", function () {
    if (!selected.length) return;
    var total = selected.reduce(function (sum, id) { return sum + TIERS[seatMap[id].tier].price; }, 0);
    toast("Holding " + selected.length + " seats · $" + total.toLocaleString("en-US") + " — demo only.", "ok");
  });

  // ---- countdown ----
  var deadline = Date.now() + 3 * 3600 * 1000 + 47 * 60 * 1000 + 12 * 1000;
  var cdEl = document.getElementById("countdown");
  function tick() {
    var diff = Math.max(0, deadline - Date.now());
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    cdEl.textContent = pad(h) + ":" + pad(m) + ":" + pad(s);
  }
  tick();
  setInterval(tick, 1000);

  render();
})();
