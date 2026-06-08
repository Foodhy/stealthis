/* Real Estate — Transaction Pipeline
   Vanilla JS Kanban board with drag-and-drop, touch tap-to-move,
   and live column count / dollar-volume totals. */

(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Data ---------- */
  var STAGES = [
    { id: "lead", title: "New Lead", color: "#8aa0b6" },
    { id: "showing", title: "Showing", color: "#b08d57" },
    { id: "offer", title: "Offer", color: "#c98a2b" },
    { id: "contract", title: "Under Contract", color: "#26493e" },
    { id: "closing", title: "Closing", color: "#2f9e6f" },
    { id: "closed", title: "Closed", color: "#16302a" }
  ];

  var AVATAR_TONES = [
    "linear-gradient(135deg,#26493e,#16302a)",
    "linear-gradient(135deg,#b08d57,#94733f)",
    "linear-gradient(135deg,#5f7f86,#2f4b4a)",
    "linear-gradient(135deg,#9a5b48,#4f2f33)",
    "linear-gradient(135deg,#7b9159,#3c5034)",
    "linear-gradient(135deg,#9a6f86,#4a3a54)"
  ];

  // checklist = [done, total]; addedDaysAgo drives "days in stage"
  var DEALS = [
    { id: "d1", stage: "lead", ph: "ph-1", address: "418 Marisol Court", city: "Cedar Bluff, OR", price: 845000, beds: 4, baths: 3, client: "Priya Desai", days: 2, check: [1, 4] },
    { id: "d2", stage: "lead", ph: "ph-4", address: "27 Larkspur Way", city: "Glenmara, OR", price: 612000, beds: 3, baths: 2, client: "Owen Hartley", days: 5, check: [0, 4] },
    { id: "d3", stage: "lead", ph: "ph-7", address: "9 Ridgeline Terrace", city: "North Hollow, OR", price: 1290000, beds: 5, baths: 4, client: "The Okafor Family", days: 1, check: [2, 4] },

    { id: "d4", stage: "showing", ph: "ph-2", address: "612 Harborview Ave", city: "Saltspar, OR", price: 1075000, beds: 4, baths: 3, client: "Marcus Lindqvist", days: 4, check: [3, 5] },
    { id: "d5", stage: "showing", ph: "ph-6", address: "1145 Juniper Mill Rd", city: "Cedar Bluff, OR", price: 728000, beds: 3, baths: 2, client: "Hana Whitfield", days: 8, check: [2, 5] },

    { id: "d6", stage: "offer", ph: "ph-3", address: "84 Copperfield Lane", city: "Glenmara, OR", price: 965000, beds: 4, baths: 3, client: "Diego Salcedo", days: 3, check: [4, 6] },
    { id: "d7", stage: "offer", ph: "ph-8", address: "330 Amberton Place", city: "Saltspar, OR", price: 1540000, beds: 5, baths: 5, client: "Eleanor Vance", days: 6, check: [3, 6] },

    { id: "d8", stage: "contract", ph: "ph-5", address: "76 Wisteria Hollow", city: "North Hollow, OR", price: 689000, beds: 3, baths: 2, client: "The Berhane Trust", days: 11, check: [5, 7] },
    { id: "d9", stage: "contract", ph: "ph-1", address: "1208 Sunmeadow Dr", city: "Glenmara, OR", price: 902000, beds: 4, baths: 3, client: "Camille Roux", days: 4, check: [6, 7] },

    { id: "d10", stage: "closing", ph: "ph-2", address: "55 Beacon Crest", city: "Saltspar, OR", price: 1180000, beds: 4, baths: 4, client: "Theo & Mara Quinn", days: 2, check: [8, 9] },

    { id: "d11", stage: "closed", ph: "ph-6", address: "210 Willowbrook Ln", city: "Cedar Bluff, OR", price: 575000, beds: 3, baths: 2, client: "Aisha Nakamura", days: 0, check: [9, 9] },
    { id: "d12", stage: "closed", ph: "ph-3", address: "640 Crestmont Row", city: "North Hollow, OR", price: 1340000, beds: 5, baths: 4, client: "The Castellano Group", days: 1, check: [9, 9] }
  ];

  var STALE_THRESHOLD = 10; // days in stage before a card flags "stale"

  /* ---------- Formatting ---------- */
  function money(n) {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(2).replace(/\.?0+$/, "") + "M";
    if (n >= 1000) return "$" + Math.round(n / 1000) + "K";
    return "$" + n;
  }
  function moneyFull(n) {
    return "$" + n.toLocaleString("en-US");
  }
  function initials(name) {
    var clean = name.replace(/^The\s+/i, "");
    var parts = clean.split(/\s|&/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  function avatarTone(id) {
    var sum = 0;
    for (var i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return AVATAR_TONES[sum % AVATAR_TONES.length];
  }

  /* ---------- Build board ---------- */
  var board = document.querySelector(".board");

  function buildCard(d) {
    var card = document.createElement("article");
    card.className = "deal";
    card.id = d.id;
    card.setAttribute("draggable", "true");
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    var stage = STAGES.filter(function (s) { return s.id === d.stage; })[0];
    card.setAttribute(
      "aria-label",
      d.address + ", " + moneyFull(d.price) + ", client " + d.client +
      ", stage " + stage.title + ", " + d.days + " days in stage. Press Enter to advance."
    );

    var stale = d.days >= STALE_THRESHOLD;
    var pct = d.check[1] ? Math.round((d.check[0] / d.check[1]) * 100) : 0;
    var complete = d.check[0] >= d.check[1];

    card.innerHTML =
      '<div class="deal-thumb ph ' + d.ph + '">' +
        '<span class="beds-pill">' + d.beds + " bd · " + d.baths + " ba</span>" +
        '<span class="price-pill">' + money(d.price) + "</span>" +
      "</div>" +
      '<div class="deal-body">' +
        '<h3 class="deal-address">' + d.address + "</h3>" +
        '<p class="deal-city">' + d.city + "</p>" +
        '<div class="deal-meta">' +
          '<div class="deal-client">' +
            '<span class="avatar" style="background:' + avatarTone(d.id) + '" aria-hidden="true">' +
              initials(d.client) +
            "</span>" +
            '<span class="client-name">' + d.client + "</span>" +
          "</div>" +
          '<span class="days-badge' + (stale ? " stale" : "") + '" title="Days in stage">' +
            (d.days === 0 ? "today" : d.days + "d") +
          "</span>" +
        "</div>" +
        '<div class="checklist">' +
          '<div class="checklist-head">' +
            "<span>Closing checklist</span>" +
            '<span class="done">' + d.check[0] + "/" + d.check[1] + "</span>" +
          "</div>" +
          '<div class="progress' + (complete ? " complete" : "") + '">' +
            "<i style=\"width:" + pct + '%"></i>' +
          "</div>" +
        "</div>" +
      "</div>";

    wireCard(card);
    return card;
  }

  function buildColumn(stage) {
    var col = document.createElement("section");
    col.className = "column";
    col.dataset.stage = stage.id;
    col.setAttribute("aria-label", stage.title + " stage");

    col.innerHTML =
      '<div class="col-head">' +
        '<div class="col-title-row">' +
          '<span class="col-dot" style="background:' + stage.color + '"></span>' +
          '<h2 class="col-title">' + stage.title + "</h2>" +
          '<span class="col-count" data-count>0</span>' +
        "</div>" +
        '<p class="col-volume"><span data-vol-label>Volume</span></p>' +
      "</div>" +
      '<div class="col-body" data-body></div>';

    // Reorder head: put number then label looks cleaner — rebuild volume node
    var vol = col.querySelector(".col-volume");
    vol.innerHTML = '<em data-vol style="font-style:normal">$0</em><span>Volume</span>';

    wireColumn(col);
    return col;
  }

  // Render all columns
  STAGES.forEach(function (stage) {
    board.appendChild(buildColumn(stage));
  });

  // Place deals
  DEALS.forEach(function (d) {
    var body = board.querySelector('.column[data-stage="' + d.stage + '"] [data-body]');
    body.appendChild(buildCard(d));
  });

  /* ---------- Totals ---------- */
  function dealPrice(cardEl) {
    var d = DEALS.filter(function (x) { return x.id === cardEl.id; })[0];
    return d ? d.price : 0;
  }

  function recompute() {
    var grandCount = 0;
    var grandVol = 0;

    Array.prototype.forEach.call(board.querySelectorAll(".column"), function (col) {
      var body = col.querySelector("[data-body]");
      var cards = body.querySelectorAll(".deal");
      var count = cards.length;
      var vol = 0;
      Array.prototype.forEach.call(cards, function (c) { vol += dealPrice(c); });

      col.querySelector("[data-count]").textContent = count;
      col.querySelector("[data-vol]").textContent = money(vol);

      // empty placeholder
      var existing = body.querySelector(".col-empty");
      if (count === 0 && !existing) {
        var ph = document.createElement("div");
        ph.className = "col-empty";
        ph.textContent = "Drop a deal here";
        body.appendChild(ph);
      } else if (count > 0 && existing) {
        existing.remove();
      }

      // The "Closed" column counts toward closed value but stays out of "active" totals.
      if (col.dataset.stage !== "closed") {
        grandCount += count;
        grandVol += vol;
      }
    });

    document.getElementById("totalDeals").textContent = grandCount;
    document.getElementById("totalVolume").textContent = money(grandVol);
  }

  /* ---------- Move logic (shared by DnD + tap) ---------- */
  function moveCardTo(card, col) {
    if (!card || !col) return;
    var body = col.querySelector("[data-body]");
    var fromStage = card.closest(".column").dataset.stage;
    var toStage = col.dataset.stage;
    if (fromStage === toStage) return;

    var ph = body.querySelector(".col-empty");
    if (ph) ph.remove();
    body.appendChild(card);

    // Reset days-in-stage on the data + UI since the deal just advanced.
    var d = DEALS.filter(function (x) { return x.id === card.id; })[0];
    if (d) {
      d.stage = toStage;
      d.days = 0;
      var badge = card.querySelector(".days-badge");
      if (badge) {
        badge.textContent = "today";
        badge.classList.remove("stale");
      }
    }

    var stageTitle = STAGES.filter(function (s) { return s.id === toStage; })[0].title;
    var addr = d ? d.address : "Deal";
    recompute();
    toast(addr + " → " + stageTitle);
  }

  /* ---------- Drag & drop ---------- */
  var dragged = null;

  function wireCard(card) {
    card.addEventListener("dragstart", function (e) {
      dragged = card;
      card.classList.add("dragging");
      clearSelection();
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", card.id);
      }
    });
    card.addEventListener("dragend", function () {
      card.classList.remove("dragging");
      dragged = null;
      clearDragOver();
    });

    // Touch / click: tap to select, then tap a column to drop.
    card.addEventListener("click", function (e) {
      e.stopPropagation();
      if (card.classList.contains("selected")) {
        clearSelection();
        return;
      }
      clearSelection();
      card.classList.add("selected");
      toast("Selected — tap a stage to move it");
    });

    // Keyboard: Enter / →  advance one stage, ←  move back one stage.
    card.addEventListener("keydown", function (e) {
      var forward = e.key === "Enter" || e.key === "ArrowRight";
      var back = e.key === "ArrowLeft";
      if (!forward && !back) return;
      e.preventDefault();
      var curCol = card.closest(".column");
      var idx = STAGES.map(function (s) { return s.id; }).indexOf(curCol.dataset.stage);
      var nextIdx = forward ? idx + 1 : idx - 1;
      if (nextIdx < 0 || nextIdx >= STAGES.length) {
        toast(forward ? "Already at the final stage" : "Already at the first stage");
        return;
      }
      var target = board.querySelector('.column[data-stage="' + STAGES[nextIdx].id + '"]');
      moveCardTo(card, target);
      card.focus();
    });
  }

  function wireColumn(col) {
    col.addEventListener("dragover", function (e) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      col.classList.add("drag-over");
    });
    col.addEventListener("dragleave", function (e) {
      // only clear when leaving the column itself, not its children
      if (!col.contains(e.relatedTarget)) col.classList.remove("drag-over");
    });
    col.addEventListener("drop", function (e) {
      e.preventDefault();
      col.classList.remove("drag-over");
      var card = dragged;
      if (!card && e.dataTransfer) {
        card = document.getElementById(e.dataTransfer.getData("text/plain"));
      }
      moveCardTo(card, col);
    });

    // Tap-to-move target (touch devices)
    col.addEventListener("click", function () {
      var sel = board.querySelector(".deal.selected");
      if (sel) {
        moveCardTo(sel, col);
        clearSelection();
      }
    });
  }

  function clearDragOver() {
    Array.prototype.forEach.call(board.querySelectorAll(".drag-over"), function (c) {
      c.classList.remove("drag-over");
    });
  }
  function clearSelection() {
    Array.prototype.forEach.call(board.querySelectorAll(".deal.selected"), function (c) {
      c.classList.remove("selected");
    });
  }

  // Click outside clears selection
  document.addEventListener("click", clearSelection);

  /* ---------- Init ---------- */
  recompute();
  setTimeout(function () {
    var active = document.getElementById("totalDeals").textContent;
    toast(active + " active deals loaded — drag to advance a stage");
  }, 450);
})();
