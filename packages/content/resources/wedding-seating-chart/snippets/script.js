(function () {
  "use strict";

  /* ---------- Data ---------- */
  var GUESTS = [
    { id: "g1", name: "Amara Voss", side: "Bride" },
    { id: "g2", name: "Theo Bright", side: "Groom" },
    { id: "g3", name: "Nadia Fell", side: "Bride" },
    { id: "g4", name: "Marcus Lyle", side: "Groom" },
    { id: "g5", name: "Priya Anand", side: "Bride" },
    { id: "g6", name: "Ivo Kessler", side: "Groom" },
    { id: "g7", name: "Delphine Ray", side: "Bride" },
    { id: "g8", name: "Otto Crane", side: "Groom" },
    { id: "g9", name: "Selma Wren", side: "Bride" },
    { id: "g10", name: "Cyrus Bell", side: "Groom" },
    { id: "g11", name: "Talia Moss", side: "Bride" },
    { id: "g12", name: "Rafe Dunmore", side: "Groom" },
    { id: "g13", name: "Odessa Kim", side: "Bride" },
    { id: "g14", name: "Julian Frost", side: "Groom" },
    { id: "g15", name: "Bianca Serel", side: "Bride" },
    { id: "g16", name: "Emmett Cole", side: "Groom" },
    { id: "g17", name: "Wren Aldous", side: "Bride" },
    { id: "g18", name: "Silas Vaughn", side: "Groom" },
    { id: "g19", name: "Cora Nightingale", side: "Bride" },
    { id: "g20", name: "Dante Fiore", side: "Groom" }
  ];

  var TABLES = [
    { id: "t1", name: "Peony", seats: 6 },
    { id: "t2", name: "Laurel", seats: 6 },
    { id: "t3", name: "Ranunculus", seats: 4 },
    { id: "t4", name: "Sweet Pea", seats: 4 }
  ];

  /* state: guestId -> { table, seat } | null (in pool) */
  var placement = {};
  GUESTS.forEach(function (g) { placement[g.id] = null; });

  var byId = {};
  GUESTS.forEach(function (g) { byId[g.id] = g; });

  /* ---------- DOM refs ---------- */
  var poolEl = document.getElementById("pool");
  var tablesEl = document.getElementById("tables");
  var searchEl = document.getElementById("search");
  var resetEl = document.getElementById("reset");
  var toastWrap = document.getElementById("toastWrap");
  var liveEl = document.getElementById("live");
  var poolBadge = document.getElementById("poolBadge");

  var selectedChipId = null; /* keyboard: chip awaiting a seat */

  /* ---------- Helpers ---------- */
  function initials(name) {
    return name.split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }

  function seatedCountFor(tableId) {
    var n = 0;
    for (var id in placement) {
      if (placement[id] && placement[id].table === tableId) n++;
    }
    return n;
  }

  function firstOpenSeat(tableId) {
    var t = tableFor(tableId);
    var taken = {};
    for (var id in placement) {
      if (placement[id] && placement[id].table === tableId) taken[placement[id].seat] = true;
    }
    for (var s = 0; s < t.seats; s++) { if (!taken[s]) return s; }
    return -1;
  }

  function tableFor(id) {
    return TABLES.filter(function (t) { return t.id === id; })[0];
  }

  function guestAt(tableId, seat) {
    for (var id in placement) {
      if (placement[id] && placement[id].table === tableId && placement[id].seat === seat) return id;
    }
    return null;
  }

  function announce(msg) { liveEl.textContent = msg; }

  function toast(msg, gold) {
    var el = document.createElement("div");
    el.className = "toast" + (gold ? " gold" : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 300);
    }, 2400);
  }

  /* ---------- Placement actions ---------- */
  function assign(guestId, tableId, seat) {
    var t = tableFor(tableId);
    if (seatedCountFor(tableId) >= t.seats && (!placement[guestId] || placement[guestId].table !== tableId)) {
      toast("Table " + t.name + " is full", true);
      return false;
    }
    var occupant = guestAt(tableId, seat);
    if (occupant && occupant !== guestId) {
      /* swap seat target: send occupant to pool if no room, else pick next open */
      var open = firstOpenSeat(tableId);
      if (open === -1 || open === seat) {
        placement[occupant] = null;
      } else {
        placement[occupant] = { table: tableId, seat: open };
      }
    }
    placement[guestId] = { table: tableId, seat: seat };
    render();
    var willBeFull = seatedCountFor(tableId) >= t.seats;
    announce(byId[guestId].name + " seated at Table " + t.name);
    if (willBeFull) toast("Table " + t.name + " is complete", true);
    else toast(byId[guestId].name + " → Table " + t.name);
    return true;
  }

  function unassign(guestId) {
    if (!placement[guestId]) return;
    placement[guestId] = null;
    render();
    announce(byId[guestId].name + " returned to the pool");
    toast(byId[guestId].name + " back to pool");
  }

  /* ---------- Chip factory ---------- */
  function makeChip(guest, context) {
    var chip = document.createElement(context === "pool" ? "li" : "span");
    chip.className = "chip";
    chip.setAttribute("draggable", "true");
    chip.dataset.guest = guest.id;
    chip.tabIndex = 0;
    chip.setAttribute("role", "button");
    chip.setAttribute("aria-label", guest.name + ", " + guest.side + " side" +
      (context === "pool" ? ". Press Enter then choose a seat." : ""));

    var av = document.createElement("span");
    av.className = "avatar";
    av.textContent = initials(guest.name);
    av.setAttribute("aria-hidden", "true");

    var label = document.createElement("span");
    label.textContent = guest.name;

    var side = document.createElement("span");
    side.className = "side";
    side.textContent = guest.side === "Bride" ? "B" : "G";

    chip.appendChild(av);
    chip.appendChild(label);
    chip.appendChild(side);

    chip.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", guest.id);
      e.dataTransfer.effectAllowed = "move";
      chip.classList.add("dragging");
    });
    chip.addEventListener("dragend", function () { chip.classList.remove("dragging"); });

    chip.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (context === "pool") {
          selectedChipId = selectedChipId === guest.id ? null : guest.id;
          if (selectedChipId) {
            toast("Choose an open seat for " + guest.name);
            announce("Selected " + guest.name + ". Now activate an open seat.");
          }
        } else {
          unassign(guest.id);
        }
      }
    });

    return chip;
  }

  /* ---------- Render ---------- */
  function render() {
    /* Pool */
    var q = (searchEl.value || "").trim().toLowerCase();
    poolEl.innerHTML = "";
    var poolGuests = GUESTS.filter(function (g) { return placement[g.id] === null; });
    var visible = poolGuests.filter(function (g) {
      return !q || g.name.toLowerCase().indexOf(q) !== -1 || g.side.toLowerCase().indexOf(q) !== -1;
    });
    visible.forEach(function (g) { poolEl.appendChild(makeChip(g, "pool")); });
    poolBadge.textContent = poolGuests.length;

    /* Tables */
    tablesEl.innerHTML = "";
    TABLES.forEach(function (t) {
      tablesEl.appendChild(makeTableCard(t));
    });

    /* Stats */
    var seated = GUESTS.filter(function (g) { return placement[g.id] !== null; }).length;
    document.getElementById("seatedCount").textContent = seated;
    document.getElementById("poolCount").textContent = GUESTS.length - seated;
    document.getElementById("tableCount").textContent = TABLES.length;
  }

  function makeTableCard(t) {
    var card = document.createElement("section");
    card.className = "table-card";
    var count = seatedCountFor(t.id);
    var full = count >= t.seats;
    if (full) card.className += " full";

    var head = document.createElement("div");
    head.className = "table-head";
    var h3 = document.createElement("h3");
    h3.textContent = "Table " + t.name;
    var cap = document.createElement("span");
    cap.className = "cap";
    cap.textContent = count + " / " + t.seats;
    head.appendChild(h3);
    head.appendChild(cap);
    card.appendChild(head);

    var round = document.createElement("div");
    round.className = "round";

    var center = document.createElement("div");
    center.className = "centerpiece";
    var cspan = document.createElement("span");
    cspan.textContent = full ? "Complete" : t.name;
    center.appendChild(cspan);
    round.appendChild(center);

    /* seats around a circle */
    var radius = 90;
    for (var s = 0; s < t.seats; s++) {
      var angle = (s / t.seats) * Math.PI * 2 - Math.PI / 2;
      var x = 90 + Math.cos(angle) * (radius - 20);
      var y = 90 + Math.sin(angle) * (radius - 20);
      round.appendChild(makeSeat(t, s, x, y));
    }
    card.appendChild(round);

    var foot = document.createElement("p");
    foot.className = "table-foot";
    foot.innerHTML = full
      ? "Seating <strong>complete</strong> ✦"
      : "<strong>" + (t.seats - count) + "</strong> seat" + (t.seats - count === 1 ? "" : "s") + " remaining";
    card.appendChild(foot);

    return card;
  }

  function makeSeat(t, seatIndex, x, y) {
    var seat = document.createElement("button");
    seat.type = "button";
    seat.className = "seat";
    seat.style.left = x + "px";
    seat.style.top = y + "px";
    seat.dataset.table = t.id;
    seat.dataset.seat = seatIndex;

    var guestId = guestAt(t.id, seatIndex);

    if (guestId) {
      var g = byId[guestId];
      seat.className += " occupied";
      seat.setAttribute("draggable", "true");
      seat.setAttribute("aria-label", g.name + " at Table " + t.name + ", seat " + (seatIndex + 1) + ". Activate to remove.");
      seat.textContent = initials(g.name);

      var rm = document.createElement("span");
      rm.className = "remove";
      rm.setAttribute("role", "button");
      rm.setAttribute("aria-hidden", "true");
      rm.textContent = "×";
      seat.appendChild(rm);

      seat.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", guestId);
        e.dataTransfer.effectAllowed = "move";
        seat.classList.add("dragging");
      });
      seat.addEventListener("dragend", function () { seat.classList.remove("dragging"); });
      seat.addEventListener("click", function () { unassign(guestId); });
    } else {
      seat.setAttribute("aria-label", "Open seat " + (seatIndex + 1) + " at Table " + t.name);
      seat.textContent = seatIndex + 1;
      seat.addEventListener("click", function () {
        if (selectedChipId) {
          var gid = selectedChipId;
          selectedChipId = null;
          assign(gid, t.id, seatIndex);
        } else {
          toast("Select a guest from the pool first");
        }
      });
    }

    /* drop handling on every seat */
    seat.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      seat.classList.add("drag-over");
    });
    seat.addEventListener("dragleave", function () { seat.classList.remove("drag-over"); });
    seat.addEventListener("drop", function (e) {
      e.preventDefault();
      seat.classList.remove("drag-over");
      var gid = e.dataTransfer.getData("text/plain");
      if (gid) assign(gid, t.id, seatIndex);
    });

    return seat;
  }

  /* ---------- Pool as drop target (unassign) ---------- */
  var poolAside = poolEl.closest(".pool");
  poolAside.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    poolAside.classList.add("drag-over");
  });
  poolAside.addEventListener("dragleave", function (e) {
    if (!poolAside.contains(e.relatedTarget)) poolAside.classList.remove("drag-over");
  });
  poolAside.addEventListener("drop", function (e) {
    e.preventDefault();
    poolAside.classList.remove("drag-over");
    var gid = e.dataTransfer.getData("text/plain");
    if (gid && placement[gid]) unassign(gid);
  });

  /* ---------- Controls ---------- */
  searchEl.addEventListener("input", render);

  resetEl.addEventListener("click", function () {
    GUESTS.forEach(function (g) { placement[g.id] = null; });
    selectedChipId = null;
    render();
    toast("All guests returned to the pool");
    announce("Seating chart reset.");
  });

  /* ---------- Init ---------- */
  render();
  toast("Drag guests onto a seat to begin ✦", true);
})();
