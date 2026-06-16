(function () {
  "use strict";

  /* ---------- Demo data: fictional collection ---------- */
  var OBJECTS = [
    { id: "o1", title: "Composition in Slate", artist: "Margit Halász", date: 1931, medium: "Painting", cat: "AMA.1931.0142", width: 1.6, c1: "#3a3f4a", c2: "#6b7280" },
    { id: "o2", title: "Reclining Form, No. 4", artist: "Edouard Brun", date: 1948, medium: "Sculpture", cat: "AMA.1948.0061", width: 2.4, c1: "#b08a5a", c2: "#7c5f38" },
    { id: "o3", title: "Untitled (Lattice)", artist: "Yara Osei", date: 1969, medium: "Painting", cat: "AMA.1969.0307", width: 1.9, c1: "#c0492f", c2: "#7c2d1c" },
    { id: "o4", title: "Salt Flats at Dawn", artist: "Ren Takeda", date: 1972, medium: "Photograph", cat: "AMA.1972.0028", width: 0.9, c1: "#dcd2c0", c2: "#9aa3ad" },
    { id: "o5", title: "Woven Field I", artist: "Astrid Lindqvist", date: 1965, medium: "Textile", cat: "AMA.1965.0190", width: 2.1, c1: "#8a6f3c", c2: "#c9a96a" },
    { id: "o6", title: "Black Square Study", artist: "Margit Halász", date: 1928, medium: "Painting", cat: "AMA.1928.0099", width: 1.2, c1: "#1f1d1a", c2: "#3a342c" },
    { id: "o7", title: "Cantilever", artist: "Edouard Brun", date: 1955, medium: "Sculpture", cat: "AMA.1955.0211", width: 1.8, c1: "#9ca3ab", c2: "#5b626a" },
    { id: "o8", title: "Two Apertures", artist: "Yara Osei", date: 1974, medium: "Painting", cat: "AMA.1974.0140", width: 2.0, c1: "#2e5a44", c2: "#1c3a2b" },
    { id: "o9", title: "Quay, Long Exposure", artist: "Ren Takeda", date: 1970, medium: "Photograph", cat: "AMA.1970.0066", width: 1.0, c1: "#cbd2d9", c2: "#7d8893" },
    { id: "o10", title: "Threshold (Indigo)", artist: "Astrid Lindqvist", date: 1968, medium: "Textile", cat: "AMA.1968.0233", width: 1.7, c1: "#3b4a78", c2: "#23315a" },
    { id: "o11", title: "Plumb Line", artist: "Margit Halász", date: 1940, medium: "Painting", cat: "AMA.1940.0177", width: 1.4, c1: "#a98140", c2: "#876631" },
    { id: "o12", title: "Folded Plane", artist: "Edouard Brun", date: 1961, medium: "Sculpture", cat: "AMA.1961.0058", width: 2.2, c1: "#7a7468", c2: "#4a4640" },
    { id: "o13", title: "Grid, Reduced", artist: "Yara Osei", date: 1967, medium: "Painting", cat: "AMA.1967.0301", width: 1.5, c1: "#b4493a", c2: "#7c2d24" },
    { id: "o14", title: "Tide Marks", artist: "Ren Takeda", date: 1975, medium: "Photograph", cat: "AMA.1975.0012", width: 0.8, c1: "#e0d8c8", c2: "#a8b0b8" }
  ];

  var WALL_TOTAL = 62.0; // metres of available wall

  /* ---------- State ---------- */
  var state = {
    placed: {}, // id -> true
    rooms: [
      { id: "r1", name: "Room 1 · Beginnings", walltext: "The exhibition opens with the earliest works, where pictorial space is pared back to its essential structure.", objs: ["o6", "o1"] },
      { id: "r2", name: "Room 2 · The Built Object", walltext: "", objs: ["o2"] }
    ],
    filter: "all",
    query: "",
    dirty: false
  };
  state.rooms.forEach(function (r) { r.objs.forEach(function (id) { state.placed[id] = true; }); });

  var roomSeq = 3;

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function byId(id) { return OBJECTS.filter(function (o) { return o.id === id; })[0]; }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2400);
  }

  function thumbStyle(o) {
    return "background:linear-gradient(135deg," + o.c1 + "," + o.c2 + ");";
  }

  function markDirty() {
    if (!state.dirty) {
      state.dirty = true;
      var s = $("#draftStamp");
      s.classList.remove("is-saved");
      s.textContent = "Draft · unsaved";
    }
  }

  /* ---------- Pool rendering ---------- */
  var poolList = $("#poolList");
  var poolTpl = $("#poolCardTpl");

  function renderPool() {
    poolList.innerHTML = "";
    var q = state.query.trim().toLowerCase();
    var matches = OBJECTS.filter(function (o) {
      if (state.filter !== "all" && o.medium !== state.filter) return false;
      if (!q) return true;
      return (o.title + " " + o.artist + " " + o.cat).toLowerCase().indexOf(q) !== -1;
    });

    if (!matches.length) {
      var p = document.createElement("p");
      p.className = "pool__empty";
      p.textContent = "No objects match your search.";
      poolList.appendChild(p);
    }

    matches.forEach(function (o) {
      var node = poolTpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = o.id;
      $("[data-thumb]", node).setAttribute("style", thumbStyle(o));
      $("[data-title]", node).textContent = o.title;
      $("[data-artist]", node).textContent = o.artist;
      $("[data-date]", node).textContent = o.date;
      $("[data-medium]", node).textContent = o.medium;
      $("[data-cat]", node).textContent = o.cat;
      if (state.placed[o.id]) node.classList.add("is-used");

      $("[data-add]", node).addEventListener("click", function () { addToSequence(o.id); });
      node.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && !state.placed[o.id]) {
          e.preventDefault();
          addToSequence(o.id);
        }
      });
      poolList.appendChild(node);
    });

    var placedCount = Object.keys(state.placed).length;
    $("#poolCount").textContent = OBJECTS.length + " objects in store · " + placedCount + " placed";
  }

  /* ---------- Sequence / rooms rendering ---------- */
  var roomsEl = $("#rooms");
  var roomTpl = $("#roomTpl");
  var seqRowTpl = $("#seqRowTpl");

  function renderRooms() {
    roomsEl.innerHTML = "";

    state.rooms.forEach(function (room, ri) {
      var node = roomTpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = room.id;
      $("[data-roomno]", node).textContent = ri + 1;

      var nameInput = $("[data-name]", node);
      nameInput.value = room.name;
      nameInput.addEventListener("input", function () { room.name = nameInput.value; markDirty(); });

      var wallText = $("[data-walltext]", node);
      wallText.value = room.walltext;
      wallText.addEventListener("input", function () { room.walltext = wallText.value; markDirty(); });

      var roomWall = room.objs.reduce(function (sum, id) {
        var o = byId(id); return sum + (o ? o.width : 0);
      }, 0);
      $("[data-stat]", node).textContent = room.objs.length + " obj · " + roomWall.toFixed(1) + " m";

      var delRoom = $("[data-delroom]", node);
      delRoom.disabled = state.rooms.length <= 1;
      delRoom.addEventListener("click", function () { removeRoom(ri); });

      var objsUl = $("[data-objs]", node);
      var emptyP = $("[data-empty]", node);
      emptyP.style.display = room.objs.length ? "none" : "";

      room.objs.forEach(function (id, oi) {
        var o = byId(id);
        if (!o) return;
        var row = seqRowTpl.content.firstElementChild.cloneNode(true);
        $("[data-thumb]", row).setAttribute("style", thumbStyle(o));
        $("[data-title]", row).textContent = o.title;
        $("[data-artist]", row).textContent = o.artist;
        $("[data-date]", row).textContent = o.date;
        $("[data-cat]", row).textContent = o.cat;

        var up = $("[data-up]", row);
        var down = $("[data-down]", row);
        up.disabled = (ri === 0 && oi === 0);
        down.disabled = (ri === state.rooms.length - 1 && oi === room.objs.length - 1);
        up.addEventListener("click", function () { moveObject(ri, oi, -1); });
        down.addEventListener("click", function () { moveObject(ri, oi, 1); });
        $("[data-remove]", row).addEventListener("click", function () { removeFromSequence(ri, oi); });
        objsUl.appendChild(row);
      });

      roomsEl.appendChild(node);
    });

    updateMeters();
  }

  /* ---------- Meters ---------- */
  function updateMeters() {
    var count = state.rooms.reduce(function (n, r) { return n + r.objs.length; }, 0);
    var wall = 0;
    state.rooms.forEach(function (r) {
      r.objs.forEach(function (id) { var o = byId(id); if (o) wall += o.width; });
    });

    $("#objCount").textContent = count;
    $("#wallUsed").textContent = wall.toFixed(1);
    $("#wallTotal").textContent = WALL_TOTAL.toFixed(1);

    var pct = Math.min(100, (wall / WALL_TOTAL) * 100);
    var fill = $("#wallFill");
    fill.style.width = pct + "%";
    var bar = $("#wallBar");
    bar.setAttribute("aria-valuenow", wall.toFixed(1));

    var hint = $("#wallHint");
    if (wall > WALL_TOTAL) {
      bar.classList.add("is-over");
      hint.classList.add("is-warn");
      hint.textContent = "Over capacity by " + (wall - WALL_TOTAL).toFixed(1) + " m — remove or relocate objects.";
    } else {
      bar.classList.remove("is-over");
      hint.classList.remove("is-warn");
      var rem = WALL_TOTAL - wall;
      hint.textContent = rem > 15 ? "Plenty of wall space remaining." : rem.toFixed(1) + " m of wall space remaining.";
    }
  }

  /* ---------- Mutations ---------- */
  function addToSequence(id) {
    if (state.placed[id]) return;
    var last = state.rooms[state.rooms.length - 1];
    last.objs.push(id);
    state.placed[id] = true;
    markDirty();
    var o = byId(id);
    toast("Added “" + o.title + "” to " + last.name.replace(/^Room \d+ · /, "") || "the sequence");
    renderPool();
    renderRooms();
  }

  function removeFromSequence(ri, oi) {
    var id = state.rooms[ri].objs[oi];
    state.rooms[ri].objs.splice(oi, 1);
    delete state.placed[id];
    markDirty();
    toast("Removed from sequence.");
    renderPool();
    renderRooms();
  }

  function moveObject(ri, oi, dir) {
    var room = state.rooms[ri];
    var target = oi + dir;
    if (target >= 0 && target < room.objs.length) {
      // swap within room
      var tmp = room.objs[oi];
      room.objs[oi] = room.objs[target];
      room.objs[target] = tmp;
    } else {
      // move across room boundary
      var nextRi = ri + dir;
      if (nextRi < 0 || nextRi >= state.rooms.length) return;
      var moved = room.objs.splice(oi, 1)[0];
      if (dir === 1) {
        state.rooms[nextRi].objs.unshift(moved);
      } else {
        state.rooms[nextRi].objs.push(moved);
      }
    }
    markDirty();
    renderRooms();
  }

  function addRoom() {
    state.rooms.push({ id: "r" + roomSeq++, name: "Room " + (state.rooms.length + 1) + " · Untitled", walltext: "", objs: [] });
    markDirty();
    toast("Room added.");
    renderRooms();
  }

  function removeRoom(ri) {
    if (state.rooms.length <= 1) return;
    var room = state.rooms[ri];
    room.objs.forEach(function (id) { delete state.placed[id]; });
    var freed = room.objs.length;
    state.rooms.splice(ri, 1);
    // renumber default names
    state.rooms.forEach(function (r, i) {
      r.name = r.name.replace(/^Room \d+/, "Room " + (i + 1));
    });
    markDirty();
    toast(freed ? "Room removed · " + freed + " object(s) returned to store." : "Room removed.");
    renderPool();
    renderRooms();
  }

  /* ---------- Wiring ---------- */
  $("#poolSearch").addEventListener("input", function (e) { state.query = e.target.value; renderPool(); });

  $("#poolFilters").addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    state.filter = btn.dataset.medium;
    Array.prototype.forEach.call(this.querySelectorAll(".chip"), function (c) { c.classList.remove("is-active"); });
    btn.classList.add("is-active");
    renderPool();
  });

  $("#addSectionBtn").addEventListener("click", addRoom);

  $("#saveBtn").addEventListener("click", function () {
    state.dirty = false;
    var s = $("#draftStamp");
    s.classList.add("is-saved");
    s.textContent = "Draft saved · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    var count = state.rooms.reduce(function (n, r) { return n + r.objs.length; }, 0);
    toast("Draft saved — " + state.rooms.length + " rooms, " + count + " objects.");
  });

  $("#previewBtn").addEventListener("click", function () {
    var count = state.rooms.reduce(function (n, r) { return n + r.objs.length; }, 0);
    toast("Walkthrough: " + state.rooms.length + " rooms · " + count + " objects in sequence.");
  });

  /* ---------- Init ---------- */
  renderPool();
  renderRooms();
})();
