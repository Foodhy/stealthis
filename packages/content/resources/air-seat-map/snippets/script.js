(function () {
  "use strict";

  var MAX_SEATS = 2;
  var COLS = ["A", "B", "C", "D", "E", "F", "G", "K"];

  // Zone definitions for the A350-900 (fictional Skyhaven config).
  var ZONES = [
    {
      name: "First",
      cls: "first",
      cols: ["A", "C", "D", "G"], // 1-2-1 suite layout
      aisleAfter: ["A", "D"],
      rows: [1, 2, 3],
      basePrice: 0,
      kind: "first",
      label: "First Class · Suite",
    },
    {
      name: "Business",
      cls: "biz",
      cols: ["A", "C", "D", "G"], // 1-2-1
      aisleAfter: ["A", "D"],
      rows: [4, 5, 6, 7],
      basePrice: 0,
      kind: "business",
      label: "Business · Lie-flat",
    },
    {
      name: "Economy",
      cls: "eco",
      cols: ["A", "B", "C", "D", "E", "G", "K"], // 3-2-... use 7 across for demo
      aisleAfter: ["C", "E"],
      rows: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
      basePrice: 14,
      kind: "economy",
      label: "Economy",
      exitRows: [24],
      legroomRows: [20],
    },
  ];

  // Deterministic pseudo-random occupancy + pricing.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }

  var seats = {}; // id -> seat data
  var selected = []; // array of seat ids (preserves order)

  var cabin = document.getElementById("cabin");
  var seatList = document.getElementById("seat-list");
  var emptyState = document.getElementById("empty-state");
  var countOut = document.getElementById("count-out");
  var subtotalOut = document.getElementById("subtotal-out");
  var totalOut = document.getElementById("total-out");
  var confirmBtn = document.getElementById("confirm-btn");
  var tooltip = document.getElementById("tooltip");
  var fuselage = document.getElementById("fuselage");

  function money(n) {
    return "$" + n.toFixed(2);
  }

  function seatTypeMeta(zone, row) {
    var isExit = zone.exitRows && zone.exitRows.indexOf(row) !== -1;
    var isLegroom = zone.legroomRows && zone.legroomRows.indexOf(row) !== -1;
    var price = zone.basePrice;
    var type = zone.label;
    if (zone.kind === "first") {
      price = 0;
      type = "First suite (included)";
    } else if (zone.kind === "business") {
      price = 0;
      type = "Lie-flat (included)";
    } else {
      if (isExit) {
        price += 35;
        type = "Exit row · extra legroom";
      } else if (isLegroom) {
        price += 22;
        type = "Bulkhead · extra legroom";
      } else {
        type = "Standard economy";
      }
    }
    return { price: price, type: type, isExit: isExit, isLegroom: isLegroom };
  }

  function build() {
    ZONES.forEach(function (zone) {
      var label = document.createElement("div");
      label.className = "zone-label" + (zone.kind === "first" ? " first" : "");
      label.textContent = zone.name;
      cabin.appendChild(label);

      var nCols = zone.cols.length;

      zone.rows.forEach(function (row) {
        var isExit = zone.exitRows && zone.exitRows.indexOf(row) !== -1;
        var rowEl = document.createElement("div");
        rowEl.className = "row" + (isExit ? " exit-row" : "");
        rowEl.style.setProperty("--cols", String(nCols));

        var num = document.createElement("span");
        num.className = "row-num";
        num.textContent = row;
        rowEl.appendChild(num);

        zone.cols.forEach(function (col) {
          var id = row + col;
          var meta = seatTypeMeta(zone, row);
          var occupied = hash(id + zone.name) % 100 < 32; // ~32% taken

          seats[id] = {
            id: id,
            row: row,
            col: col,
            zone: zone.name,
            price: meta.price,
            type: meta.type,
            occupied: occupied,
          };

          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "seat " + zone.cls;
          if (zone.kind === "first" || zone.kind === "business") btn.classList.add("first");
          if (meta.isLegroom) btn.classList.add("legroom");
          if (meta.isExit) btn.classList.add("exit");
          if (occupied) btn.classList.add("occupied");
          btn.textContent = col;
          btn.dataset.id = id;
          btn.setAttribute(
            "aria-label",
            "Seat " + id + ", " + meta.type +
              (occupied ? ", occupied" : ", " + (meta.price === 0 ? "included" : money(meta.price)))
          );
          if (occupied) btn.setAttribute("aria-disabled", "true");
          rowEl.appendChild(btn);

          // aisle spacer
          if (zone.aisleAfter.indexOf(col) !== -1) {
            var gap = document.createElement("span");
            gap.className = "aisle-gap";
            gap.setAttribute("aria-hidden", "true");
            rowEl.appendChild(gap);
          }
        });

        cabin.appendChild(rowEl);
      });
    });
  }

  function toast(msg, kind) {
    var wrap = document.getElementById("toast-wrap");
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 320);
    }, 2400);
  }

  function toggleSeat(id) {
    var seat = seats[id];
    if (!seat || seat.occupied) return;
    var idx = selected.indexOf(id);
    var btn = cabin.querySelector('.seat[data-id="' + id + '"]');

    if (idx !== -1) {
      selected.splice(idx, 1);
      btn.classList.remove("selected");
      btn.setAttribute("aria-pressed", "false");
    } else {
      if (selected.length >= MAX_SEATS) {
        toast("You can pick up to " + MAX_SEATS + " seats for this passenger.", "warn");
        return;
      }
      selected.push(id);
      btn.classList.add("selected");
      btn.setAttribute("aria-pressed", "true");
      toast("Seat " + id + " added — " + (seat.price === 0 ? "included" : money(seat.price)));
    }
    render();
  }

  function render() {
    // list
    seatList.innerHTML = "";
    if (selected.length === 0) {
      seatList.appendChild(emptyState);
    } else {
      selected.forEach(function (id) {
        var seat = seats[id];
        var li = document.createElement("li");
        li.className = "seat-item";
        li.innerHTML =
          '<span class="badge">' + seat.id + "</span>" +
          '<span class="info"><strong>' + seat.zone + "</strong><span>" + seat.type + "</span></span>" +
          '<span class="price">' + (seat.price === 0 ? "Incl." : money(seat.price)) + "</span>" +
          '<button class="rm" type="button" aria-label="Remove seat ' + seat.id + '">&times;</button>';
        li.querySelector(".rm").addEventListener("click", function () {
          toggleSeat(id);
        });
        seatList.appendChild(li);
      });
    }

    var subtotal = selected.reduce(function (sum, id) {
      return sum + seats[id].price;
    }, 0);

    countOut.textContent = selected.length;
    subtotalOut.textContent = money(subtotal);
    totalOut.textContent = money(subtotal);
    confirmBtn.disabled = selected.length === 0;
    confirmBtn.textContent =
      selected.length === 0
        ? "Confirm selection"
        : "Confirm " + selected.length + " seat" + (selected.length > 1 ? "s" : "") + " · " + money(subtotal);
  }

  // ---- Tooltip ----
  function showTooltip(seat, target) {
    var rect = target.getBoundingClientRect();
    var priceStr = seat.occupied
      ? '<span class="tt-meta">Occupied</span>'
      : seat.price === 0
        ? '<span class="tt-price">Included</span>'
        : '<span class="tt-price">' + money(seat.price) + "</span>";
    tooltip.innerHTML =
      '<span class="tt-num">' + seat.id + "</span> · " +
      '<span class="tt-meta">' + seat.type + "</span><br>" + priceStr;
    tooltip.hidden = false;
    tooltip.style.left = rect.left + rect.width / 2 + "px";
    tooltip.style.top = rect.top + "px";
  }
  function hideTooltip() { tooltip.hidden = true; }

  // ---- Events (delegated) ----
  cabin.addEventListener("click", function (e) {
    var btn = e.target.closest(".seat");
    if (btn && btn.dataset.id) toggleSeat(btn.dataset.id);
  });
  cabin.addEventListener("mouseover", function (e) {
    var btn = e.target.closest(".seat");
    if (btn && btn.dataset.id) showTooltip(seats[btn.dataset.id], btn);
  });
  cabin.addEventListener("mouseout", function (e) {
    if (e.target.closest(".seat")) hideTooltip();
  });
  cabin.addEventListener("focusin", function (e) {
    var btn = e.target.closest(".seat");
    if (btn && btn.dataset.id) showTooltip(seats[btn.dataset.id], btn);
  });
  cabin.addEventListener("focusout", hideTooltip);

  // ---- Zoom ----
  var zoom = 1;
  var ZMIN = 0.8, ZMAX = 1.4, ZSTEP = 0.1;
  var zoomLabel = document.getElementById("zoom-label");
  function applyZoom() {
    fuselage.style.transform = "scale(" + zoom + ")";
    zoomLabel.textContent = Math.round(zoom * 100) + "%";
    document.getElementById("zoom-out").disabled = zoom <= ZMIN + 0.001;
    document.getElementById("zoom-in").disabled = zoom >= ZMAX - 0.001;
  }
  document.getElementById("zoom-in").addEventListener("click", function () {
    zoom = Math.min(ZMAX, +(zoom + ZSTEP).toFixed(2));
    applyZoom();
  });
  document.getElementById("zoom-out").addEventListener("click", function () {
    zoom = Math.max(ZMIN, +(zoom - ZSTEP).toFixed(2));
    applyZoom();
  });

  confirmBtn.addEventListener("click", function () {
    if (selected.length === 0) return;
    toast("Seats " + selected.join(", ") + " confirmed for Amara Reyes.");
  });

  build();
  applyZoom();
  render();
})();
