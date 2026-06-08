(function () {
  "use strict";

  /* ---------- Exercise library data ---------- */
  var LIBRARY = [
    { id: "ex-bench", name: "Barbell Bench Press", group: "Chest", type: "compound", icon: "🏋️", est: 9 },
    { id: "ex-incdb", name: "Incline Dumbbell Press", group: "Chest", type: "compound", icon: "💪", est: 7 },
    { id: "ex-fly", name: "Cable Fly", group: "Chest", type: "isolation", icon: "🔗", est: 5 },
    { id: "ex-pull", name: "Weighted Pull-Up", group: "Back", type: "compound", icon: "🧗", est: 8 },
    { id: "ex-row", name: "Barbell Row", group: "Back", type: "compound", icon: "🚣", est: 8 },
    { id: "ex-pulldown", name: "Lat Pulldown", group: "Back", type: "compound", icon: "⬇️", est: 6 },
    { id: "ex-ohp", name: "Overhead Press", group: "Shoulders", type: "compound", icon: "🆙", est: 8 },
    { id: "ex-lat", name: "Lateral Raise", group: "Shoulders", type: "isolation", icon: "↔️", est: 5 },
    { id: "ex-rear", name: "Rear Delt Fly", group: "Shoulders", type: "isolation", icon: "🦅", est: 5 },
    { id: "ex-squat", name: "Back Squat", group: "Legs", type: "compound", icon: "🦵", est: 10 },
    { id: "ex-rdl", name: "Romanian Deadlift", group: "Legs", type: "compound", icon: "⚙️", est: 9 },
    { id: "ex-legpress", name: "Leg Press", group: "Legs", type: "compound", icon: "🛗", est: 7 },
    { id: "ex-curl", name: "Leg Curl", group: "Legs", type: "isolation", icon: "🌀", est: 5 },
    { id: "ex-bicep", name: "EZ-Bar Curl", group: "Arms", type: "isolation", icon: "💥", est: 5 },
    { id: "ex-tricep", name: "Triceps Pushdown", group: "Arms", type: "isolation", icon: "🔻", est: 5 },
    { id: "ex-hammer", name: "Hammer Curl", group: "Arms", type: "isolation", icon: "🔨", est: 5 },
    { id: "ex-plank", name: "Weighted Plank", group: "Core", type: "isolation", icon: "🧱", est: 4 },
    { id: "ex-crunch", name: "Cable Crunch", group: "Core", type: "isolation", icon: "🌊", est: 4 }
  ];

  var GROUPS = ["Chest", "Back", "Shoulders", "Legs", "Arms", "Core"];

  /* ---------- State ---------- */
  var uid = 0;
  function nextId(prefix) { uid += 1; return prefix + "-" + Date.now().toString(36) + "-" + uid; }

  // Each day: { id, name, exercises: [{ rowId, libId, name, group, type, est, sets, reps, rest }] }
  var state = { days: [] };

  function makeRow(libId, opts) {
    var lib = LIBRARY.filter(function (x) { return x.id === libId; })[0];
    if (!lib) return null;
    opts = opts || {};
    return {
      rowId: nextId("row"),
      libId: lib.id,
      name: lib.name,
      group: lib.group,
      type: lib.type,
      est: lib.est,
      sets: opts.sets != null ? opts.sets : (lib.type === "compound" ? 4 : 3),
      reps: opts.reps != null ? opts.reps : (lib.type === "compound" ? 8 : 12),
      rest: opts.rest != null ? opts.rest : (lib.type === "compound" ? 120 : 60)
    };
  }

  function seed() {
    var day1 = { id: nextId("day"), name: "Day 1 — Push", exercises: [] };
    ["ex-bench", "ex-ohp", "ex-incdb", "ex-lat", "ex-tricep"].forEach(function (id) {
      var r = makeRow(id); if (r) day1.exercises.push(r);
    });
    var day2 = { id: nextId("day"), name: "Day 2 — Pull", exercises: [] };
    ["ex-pull", "ex-row", "ex-pulldown", "ex-bicep", "ex-rear"].forEach(function (id) {
      var r = makeRow(id); if (r) day2.exercises.push(r);
    });
    var day3 = { id: nextId("day"), name: "Day 3 — Legs", exercises: [] };
    ["ex-squat", "ex-rdl", "ex-legpress", "ex-curl", "ex-plank"].forEach(function (id) {
      var r = makeRow(id); if (r) day3.exercises.push(r);
    });
    state.days = [day1, day2, day3];
  }

  /* ---------- DOM refs ---------- */
  var libraryList = document.getElementById("libraryList");
  var filterRow = document.getElementById("filterRow");
  var searchInput = document.getElementById("searchInput");
  var daysContainer = document.getElementById("daysContainer");
  var addDayBtn = document.getElementById("addDayBtn");
  var resetBtn = document.getElementById("resetBtn");
  var saveBtn = document.getElementById("saveBtn");
  var toastStack = document.getElementById("toastStack");
  var statDays = document.getElementById("statDays");
  var statExercises = document.getElementById("statExercises");
  var statVolume = document.getElementById("statVolume");

  var activeFilter = "All";
  var searchTerm = "";

  /* ---------- Toast ---------- */
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastStack.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 360);
    }, 2400);
  }

  /* ---------- Library render ---------- */
  function renderFilters() {
    filterRow.innerHTML = "";
    var all = ["All"].concat(GROUPS);
    all.forEach(function (g) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = g;
      chip.setAttribute("role", "tab");
      chip.setAttribute("aria-selected", g === activeFilter ? "true" : "false");
      chip.addEventListener("click", function () {
        activeFilter = g;
        renderFilters();
        renderLibrary();
      });
      filterRow.appendChild(chip);
    });
  }

  function renderLibrary() {
    libraryList.innerHTML = "";
    var matches = LIBRARY.filter(function (ex) {
      var byGroup = activeFilter === "All" || ex.group === activeFilter;
      var bySearch = !searchTerm || ex.name.toLowerCase().indexOf(searchTerm) !== -1 || ex.group.toLowerCase().indexOf(searchTerm) !== -1;
      return byGroup && bySearch;
    });

    if (!matches.length) {
      var empty = document.createElement("div");
      empty.className = "lib-empty";
      empty.textContent = "No exercises match your search.";
      libraryList.appendChild(empty);
      return;
    }

    var groupsToShow = activeFilter === "All" ? GROUPS : [activeFilter];
    groupsToShow.forEach(function (group) {
      var inGroup = matches.filter(function (ex) { return ex.group === group; });
      if (!inGroup.length) return;
      var label = document.createElement("div");
      label.className = "lib-group-label";
      label.textContent = group;
      libraryList.appendChild(label);
      inGroup.forEach(function (ex) {
        libraryList.appendChild(buildLibCard(ex));
      });
    });
  }

  function buildLibCard(ex) {
    var card = document.createElement("div");
    card.className = "lib-card";
    card.setAttribute("draggable", "true");
    card.dataset.libId = ex.id;

    var icon = document.createElement("div");
    icon.className = "lib-icon";
    icon.textContent = ex.icon;

    var info = document.createElement("div");
    info.className = "lib-info";
    var name = document.createElement("div");
    name.className = "lib-name";
    name.textContent = ex.name;
    var meta = document.createElement("div");
    meta.className = "lib-meta";
    meta.innerHTML = '<span class="badge ' + ex.type + '">' + ex.type + "</span>";
    info.appendChild(name);
    info.appendChild(meta);

    card.appendChild(icon);
    card.appendChild(info);

    card.addEventListener("dragstart", function (e) {
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData("application/x-lib-id", ex.id);
      e.dataTransfer.setData("text/plain", ex.id);
    });
    card.addEventListener("dragend", function () { card.classList.remove("dragging"); });
    return card;
  }

  /* ---------- Days render ---------- */
  function estDayMinutes(day) {
    // base exercise est + ~ per-set time from rest
    var mins = 0;
    day.exercises.forEach(function (r) {
      var sets = clampInt(r.sets, 1, 12);
      var rest = clampInt(r.rest, 0, 600);
      // working time ~ 45s/set + rest between sets
      mins += (sets * 45 + (sets - 1) * rest) / 60;
    });
    return Math.round(mins);
  }

  function renderDays() {
    daysContainer.innerHTML = "";
    state.days.forEach(function (day, i) {
      daysContainer.appendChild(buildDay(day, i));
    });
    updateStats();
  }

  function buildDay(day, index) {
    var el = document.createElement("article");
    el.className = "day";
    el.dataset.dayId = day.id;

    /* head */
    var head = document.createElement("div");
    head.className = "day-head";
    var idx = document.createElement("span");
    idx.className = "day-index";
    idx.textContent = "Day " + (index + 1);
    var nameInput = document.createElement("input");
    nameInput.className = "day-name";
    nameInput.value = day.name;
    nameInput.setAttribute("aria-label", "Day name");
    nameInput.addEventListener("input", function () { day.name = nameInput.value; });
    var del = document.createElement("button");
    del.className = "day-remove";
    del.type = "button";
    del.setAttribute("aria-label", "Remove " + day.name);
    del.textContent = "×";
    del.addEventListener("click", function () {
      state.days = state.days.filter(function (d) { return d.id !== day.id; });
      renderDays();
      toast("Removed " + day.name);
    });
    head.appendChild(idx);
    head.appendChild(nameInput);
    head.appendChild(del);

    /* body */
    var body = document.createElement("div");
    body.className = "day-body";
    body.dataset.dayId = day.id;

    if (!day.exercises.length) {
      var empty = document.createElement("div");
      empty.className = "day-empty";
      empty.textContent = "Drag exercises here";
      body.appendChild(empty);
    } else {
      day.exercises.forEach(function (row) {
        body.appendChild(buildRow(day, row));
      });
    }

    /* drop handling for adding from library */
    body.addEventListener("dragover", function (e) {
      e.preventDefault();
      el.classList.add("drop-active");
      e.dataTransfer.dropEffect = isRowDrag(e) ? "move" : "copy";
    });
    body.addEventListener("dragleave", function (e) {
      if (!body.contains(e.relatedTarget)) el.classList.remove("drop-active");
    });
    body.addEventListener("drop", function (e) {
      e.preventDefault();
      el.classList.remove("drop-active");
      var libId = e.dataTransfer.getData("application/x-lib-id");
      if (libId && !isRowDrag(e)) {
        var row = makeRow(libId);
        if (row) {
          day.exercises.push(row);
          renderDays();
          toast(row.name + " added to " + day.name);
        }
      }
    });

    /* footer */
    var footer = document.createElement("div");
    footer.className = "day-footer";
    var summary = document.createElement("div");
    summary.className = "day-summary";
    summary.innerHTML = "<strong>" + day.exercises.length + "</strong> exercises · <strong>" +
      totalSets(day) + "</strong> sets";
    var dur = document.createElement("div");
    dur.className = "day-duration";
    dur.innerHTML = "⏱ ~" + estDayMinutes(day) + " min";
    footer.appendChild(summary);
    footer.appendChild(dur);

    el.appendChild(head);
    el.appendChild(body);
    el.appendChild(footer);
    return el;
  }

  function totalSets(day) {
    return day.exercises.reduce(function (sum, r) { return sum + clampInt(r.sets, 0, 99); }, 0);
  }

  function buildRow(day, row) {
    var el = document.createElement("div");
    el.className = "ex-row";
    el.setAttribute("draggable", "true");
    el.dataset.rowId = row.rowId;

    var top = document.createElement("div");
    top.className = "ex-top";
    var handle = document.createElement("span");
    handle.className = "ex-handle";
    handle.textContent = "⋮⋮";
    handle.setAttribute("aria-hidden", "true");
    var name = document.createElement("span");
    name.className = "ex-name";
    name.textContent = row.name;
    var muscle = document.createElement("span");
    muscle.className = "ex-muscle";
    muscle.textContent = row.group;
    var rm = document.createElement("button");
    rm.className = "ex-remove";
    rm.type = "button";
    rm.setAttribute("aria-label", "Remove " + row.name);
    rm.textContent = "×";
    rm.addEventListener("click", function () {
      day.exercises = day.exercises.filter(function (r) { return r.rowId !== row.rowId; });
      renderDays();
      toast("Removed " + row.name);
    });
    top.appendChild(handle);
    top.appendChild(name);
    top.appendChild(muscle);
    top.appendChild(rm);

    var fields = document.createElement("div");
    fields.className = "ex-fields";
    fields.appendChild(buildField("Sets", row.sets, 1, 12, function (v) { row.sets = v; }, day));
    fields.appendChild(buildField("Reps", row.reps, 1, 50, function (v) { row.reps = v; }, day));
    fields.appendChild(buildField("Rest s", row.rest, 0, 600, function (v) { row.rest = v; }, day));

    el.appendChild(top);
    el.appendChild(fields);

    /* reorder drag */
    el.addEventListener("dragstart", function (e) {
      el.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/x-row-id", row.rowId);
      e.dataTransfer.setData("application/x-row-day", day.id);
      e.dataTransfer.setData("text/plain", row.rowId);
    });
    el.addEventListener("dragend", function () {
      el.classList.remove("dragging");
      el.classList.remove("drag-over-top");
      el.classList.remove("drag-over-bottom");
    });
    el.addEventListener("dragover", function (e) {
      if (!isRowDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      var rect = el.getBoundingClientRect();
      var before = (e.clientY - rect.top) < rect.height / 2;
      el.classList.toggle("drag-over-top", before);
      el.classList.toggle("drag-over-bottom", !before);
    });
    el.addEventListener("dragleave", function () {
      el.classList.remove("drag-over-top");
      el.classList.remove("drag-over-bottom");
    });
    el.addEventListener("drop", function (e) {
      if (!isRowDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      var rect = el.getBoundingClientRect();
      var before = (e.clientY - rect.top) < rect.height / 2;
      el.classList.remove("drag-over-top");
      el.classList.remove("drag-over-bottom");
      handleRowDrop(e, day, row.rowId, before);
    });

    return el;
  }

  function buildField(label, value, min, max, onChange, day) {
    var wrap = document.createElement("div");
    wrap.className = "field";
    var lab = document.createElement("label");
    lab.textContent = label;
    var inp = document.createElement("input");
    inp.type = "number";
    inp.min = String(min);
    inp.max = String(max);
    inp.value = String(value);
    inp.setAttribute("aria-label", label);
    inp.addEventListener("input", function () {
      var v = clampInt(parseInt(inp.value, 10), min, max);
      onChange(v);
      // live-update footer without full re-render
      refreshDayFooter(day);
    });
    inp.addEventListener("blur", function () {
      var v = clampInt(parseInt(inp.value, 10), min, max);
      inp.value = String(v);
    });
    wrap.appendChild(lab);
    wrap.appendChild(inp);
    return wrap;
  }

  function refreshDayFooter(day) {
    var dayEl = daysContainer.querySelector('[data-day-id="' + cssEscape(day.id) + '"]');
    if (!dayEl) return;
    var summary = dayEl.querySelector(".day-summary");
    var dur = dayEl.querySelector(".day-duration");
    if (summary) {
      summary.innerHTML = "<strong>" + day.exercises.length + "</strong> exercises · <strong>" +
        totalSets(day) + "</strong> sets";
    }
    if (dur) dur.innerHTML = "⏱ ~" + estDayMinutes(day) + " min";
    updateStats();
  }

  /* ---------- Row drop / reorder logic ---------- */
  function isRowDrag(e) {
    var types = e.dataTransfer.types || [];
    return Array.prototype.indexOf.call(types, "application/x-row-id") !== -1;
  }

  function handleRowDrop(e, targetDay, targetRowId, before) {
    var rowId = e.dataTransfer.getData("application/x-row-id");
    var fromDayId = e.dataTransfer.getData("application/x-row-day");
    if (!rowId || rowId === targetRowId) return;

    var fromDay = state.days.filter(function (d) { return d.id === fromDayId; })[0];
    if (!fromDay) return;
    var movingIdx = indexOfRow(fromDay, rowId);
    if (movingIdx === -1) return;
    var moving = fromDay.exercises.splice(movingIdx, 1)[0];

    var targetIdx = indexOfRow(targetDay, targetRowId);
    if (targetIdx === -1) {
      targetDay.exercises.push(moving);
    } else {
      targetDay.exercises.splice(before ? targetIdx : targetIdx + 1, 0, moving);
    }
    renderDays();
  }

  function indexOfRow(day, rowId) {
    for (var i = 0; i < day.exercises.length; i++) {
      if (day.exercises[i].rowId === rowId) return i;
    }
    return -1;
  }

  /* ---------- Stats ---------- */
  function updateStats() {
    var exCount = 0, setCount = 0;
    state.days.forEach(function (d) {
      exCount += d.exercises.length;
      setCount += totalSets(d);
    });
    statDays.textContent = String(state.days.length);
    statExercises.textContent = String(exCount);
    statVolume.textContent = String(setCount);
  }

  /* ---------- Helpers ---------- */
  function clampInt(n, min, max) {
    if (isNaN(n)) n = min;
    n = Math.round(n);
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  }

  function cssEscape(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/["\\]/g, "\\$&");
  }

  /* ---------- Top-level actions ---------- */
  addDayBtn.addEventListener("click", function () {
    var n = state.days.length + 1;
    state.days.push({ id: nextId("day"), name: "Day " + n + " — New", exercises: [] });
    renderDays();
    var last = daysContainer.lastElementChild;
    if (last) last.scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("Day " + n + " added");
  });

  resetBtn.addEventListener("click", function () {
    seed();
    renderDays();
    toast("Plan reset to default split");
  });

  saveBtn.addEventListener("click", function () {
    var title = document.getElementById("programTitle").value || "Untitled Program";
    var exCount = state.days.reduce(function (s, d) { return s + d.exercises.length; }, 0);
    toast("Saved “" + title + "” · " + state.days.length + " days, " + exCount + " exercises");
  });

  searchInput.addEventListener("input", function () {
    searchTerm = searchInput.value.trim().toLowerCase();
    renderLibrary();
  });

  /* ---------- Init ---------- */
  seed();
  renderFilters();
  renderLibrary();
  renderDays();
})();
