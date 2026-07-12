(function () {
  "use strict";

  // ---------- Data ----------
  var LIBRARY = [
    { id: "bench",     name: "Barbell Bench Press", group: "Chest",     icon: "🏋️", sets: 4, reps: 8,  rest: 90 },
    { id: "incdb",     name: "Incline DB Press",    group: "Chest",     icon: "💪", sets: 3, reps: 10, rest: 75 },
    { id: "fly",       name: "Cable Fly",           group: "Chest",     icon: "🔗", sets: 3, reps: 12, rest: 60 },
    { id: "pullup",    name: "Weighted Pull-Up",    group: "Back",      icon: "🧗", sets: 4, reps: 6,  rest: 90 },
    { id: "row",       name: "Barbell Row",         group: "Back",      icon: "🚣", sets: 4, reps: 8,  rest: 90 },
    { id: "latpull",   name: "Lat Pulldown",        group: "Back",      icon: "⬇️", sets: 3, reps: 12, rest: 60 },
    { id: "squat",     name: "Back Squat",          group: "Legs",      icon: "🦵", sets: 5, reps: 5,  rest: 120 },
    { id: "rdl",       name: "Romanian Deadlift",   group: "Legs",      icon: "⚙️", sets: 4, reps: 8,  rest: 105 },
    { id: "lunge",     name: "Walking Lunge",       group: "Legs",      icon: "🚶", sets: 3, reps: 12, rest: 75 },
    { id: "ohp",       name: "Overhead Press",      group: "Shoulders", icon: "🙆", sets: 4, reps: 8,  rest: 90 },
    { id: "lateral",   name: "Lateral Raise",       group: "Shoulders", icon: "🕊️", sets: 3, reps: 15, rest: 45 },
    { id: "facepull",  name: "Face Pull",           group: "Shoulders", icon: "🎯", sets: 3, reps: 15, rest: 45 },
    { id: "curl",      name: "EZ-Bar Curl",         group: "Arms",      icon: "💪", sets: 3, reps: 12, rest: 60 },
    { id: "pushdown",  name: "Tricep Pushdown",     group: "Arms",      icon: "🔽", sets: 3, reps: 12, rest: 60 },
    { id: "hammer",    name: "Hammer Curl",         group: "Arms",      icon: "🔨", sets: 3, reps: 12, rest: 60 },
    { id: "plank",     name: "Weighted Plank",      group: "Core",      icon: "🧘", sets: 3, reps: 45, rest: 45 },
    { id: "hanging",   name: "Hanging Leg Raise",   group: "Core",      icon: "🪝", sets: 3, reps: 15, rest: 45 },
    { id: "cablecrunch", name: "Cable Crunch",      group: "Core",      icon: "🌀", sets: 3, reps: 15, rest: 45 }
  ];

  // Working plan: array of {uid, ref}
  var plan = [];
  var uidSeq = 1;
  var activeGroup = "all";
  var searchTerm = "";

  // ---------- Elements ----------
  var $ = function (s) { return document.querySelector(s); };
  var exList = $("#exList");
  var exEmpty = $("#exEmpty");
  var planList = $("#planList");
  var planEmpty = $("#planEmpty");
  var dropZone = $("#dropZone");
  var searchEl = $("#search");
  var toastEl = $("#toast");
  var saveBtn = $("#saveBtn");
  var clearBtn = $("#clearBtn");

  var byId = function (id) {
    for (var i = 0; i < LIBRARY.length; i++) if (LIBRARY[i].id === id) return LIBRARY[i];
    return null;
  };

  // ---------- Toast ----------
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  // ---------- Library render ----------
  function renderLibrary() {
    exList.innerHTML = "";
    var shown = 0;
    LIBRARY.forEach(function (ex) {
      var matchGroup = activeGroup === "all" || ex.group === activeGroup;
      var matchSearch = ex.name.toLowerCase().indexOf(searchTerm) !== -1 ||
                        ex.group.toLowerCase().indexOf(searchTerm) !== -1;
      if (!matchGroup || !matchSearch) return;
      shown++;

      var li = document.createElement("li");
      li.className = "ex-card";
      li.setAttribute("draggable", "true");
      li.dataset.id = ex.id;
      li.setAttribute("tabindex", "0");
      li.setAttribute("role", "button");
      li.setAttribute("aria-label", "Add " + ex.name + " to plan");
      li.innerHTML =
        '<span class="ex-thumb" data-g="' + ex.group + '" aria-hidden="true">' + ex.icon + "</span>" +
        '<div class="ex-info">' +
          '<p class="ex-name">' + ex.name + "</p>" +
          '<p class="ex-meta">' + ex.group + " · " + ex.sets + "×" + ex.reps + "</p>" +
        "</div>" +
        '<button class="ex-add" type="button" aria-hidden="true" tabindex="-1">+</button>';

      // drag
      li.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", ex.id);
        e.dataTransfer.effectAllowed = "copy";
        li.classList.add("dragging");
      });
      li.addEventListener("dragend", function () { li.classList.remove("dragging"); });

      // tap / keyboard add
      var add = function () { addExercise(ex.id); };
      li.addEventListener("click", add);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); add(); }
      });

      exList.appendChild(li);
    });
    exEmpty.hidden = shown !== 0;
  }

  // ---------- Plan operations ----------
  function addExercise(id) {
    var ref = byId(id);
    if (!ref) return;
    plan.push({
      uid: uidSeq++,
      id: ref.id,
      name: ref.name,
      group: ref.group,
      icon: ref.icon,
      sets: ref.sets,
      reps: ref.reps,
      rest: ref.rest
    });
    renderPlan(true);
    updateSummary();
    toast(ref.name + " added");
  }

  function removeExercise(uid) {
    plan = plan.filter(function (p) { return p.uid !== uid; });
    renderPlan(false);
    updateSummary();
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function renderPlan(animateLast) {
    planList.innerHTML = "";
    planEmpty.style.display = plan.length ? "none" : "flex";

    plan.forEach(function (item, i) {
      var li = document.createElement("li");
      li.className = "plan-row";
      if (animateLast && i === plan.length - 1) li.classList.add("pop");
      li.dataset.uid = item.uid;
      li.setAttribute("draggable", "true");

      li.innerHTML =
        '<div class="row-handle" aria-hidden="true" title="Drag to reorder">⋮⋮</div>' +
        '<div class="row-main">' +
          '<span class="row-idx">' + (i + 1) + "</span>" +
          '<h3 class="row-name">' + item.name + "</h3>" +
          '<p class="row-group">' + item.group + "</p>" +
          '<div class="row-fields">' +
            fieldHTML(item.uid, "sets", "Sets", item.sets, "") +
            fieldHTML(item.uid, "reps", "Reps", item.reps, "") +
            fieldHTML(item.uid, "rest", "Rest", item.rest, "s") +
          "</div>" +
        "</div>" +
        '<button class="row-remove" type="button" aria-label="Remove ' + item.name + '">✕</button>';

      // remove
      li.querySelector(".row-remove").addEventListener("click", function () {
        removeExercise(item.uid);
      });

      // stepper handlers
      li.querySelectorAll(".stepper").forEach(function (st) {
        var field = st.dataset.field;
        var input = st.querySelector("input");
        var conf = FIELD_CONF[field];
        st.querySelector(".dec").addEventListener("click", function () {
          setField(item.uid, field, item[field] - conf.step);
        });
        st.querySelector(".inc").addEventListener("click", function () {
          setField(item.uid, field, item[field] + conf.step);
        });
        input.addEventListener("change", function () {
          var v = parseInt(input.value, 10);
          if (isNaN(v)) v = conf.min;
          setField(item.uid, field, v);
        });
      });

      attachRowDrag(li);
      planList.appendChild(li);
    });
  }

  var FIELD_CONF = {
    sets: { min: 1, max: 12, step: 1 },
    reps: { min: 1, max: 60, step: 1 },
    rest: { min: 0, max: 300, step: 15 }
  };

  function fieldHTML(uid, field, label, val, unit) {
    return '<div class="field">' +
      '<span class="field-label">' + label + "</span>" +
      '<div class="stepper" data-field="' + field + '">' +
        '<button class="dec" type="button" aria-label="Decrease ' + label + '">−</button>' +
        '<input type="text" inputmode="numeric" value="' + val + '" aria-label="' + label + '" />' +
        (unit ? '<span class="unit">' + unit + "</span>" : "") +
        '<button class="inc" type="button" aria-label="Increase ' + label + '">+</button>' +
      "</div>" +
    "</div>";
  }

  function setField(uid, field, value) {
    var conf = FIELD_CONF[field];
    var v = clamp(value, conf.min, conf.max);
    for (var i = 0; i < plan.length; i++) {
      if (plan[i].uid === uid) { plan[i][field] = v; break; }
    }
    renderPlan(false);
    updateSummary();
  }

  // ---------- Reorder drag ----------
  var dragUid = null;
  function attachRowDrag(li) {
    li.addEventListener("dragstart", function (e) {
      dragUid = parseInt(li.dataset.uid, 10);
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/reorder", String(dragUid)); } catch (err) {}
    });
    li.addEventListener("dragend", function () {
      li.classList.remove("dragging");
      dragUid = null;
      Array.prototype.forEach.call(planList.children, function (c) {
        c.classList.remove("drop-target");
      });
    });
    li.addEventListener("dragover", function (e) {
      if (dragUid === null) return;
      e.preventDefault();
      li.classList.add("drop-target");
    });
    li.addEventListener("dragleave", function () { li.classList.remove("drop-target"); });
    li.addEventListener("drop", function (e) {
      if (dragUid === null) return;
      e.preventDefault();
      e.stopPropagation();
      var targetUid = parseInt(li.dataset.uid, 10);
      reorder(dragUid, targetUid);
    });
  }

  function reorder(fromUid, toUid) {
    if (fromUid === toUid) return;
    var fromIdx = -1, toIdx = -1;
    plan.forEach(function (p, i) {
      if (p.uid === fromUid) fromIdx = i;
      if (p.uid === toUid) toIdx = i;
    });
    if (fromIdx === -1 || toIdx === -1) return;
    var moved = plan.splice(fromIdx, 1)[0];
    plan.splice(toIdx, 0, moved);
    renderPlan(false);
    updateSummary();
  }

  // ---------- Summary ----------
  function updateSummary() {
    var totalSets = 0, totalReps = 0, totalSeconds = 0;
    plan.forEach(function (p) {
      totalSets += p.sets;
      totalReps += p.sets * p.reps;
      // estimate: ~4s per rep of work + rest between sets
      var workPerSet = p.group === "Core" ? p.reps : p.reps * 4;
      totalSeconds += p.sets * workPerSet + (p.sets - 1) * p.rest;
    });
    // transition between exercises
    if (plan.length > 1) totalSeconds += (plan.length - 1) * 45;

    $("#statSets").textContent = totalSets;
    $("#statVolume").textContent = totalReps;
    $("#statTime").innerHTML = Math.max(0, Math.round(totalSeconds / 60)) + "<small>m</small>";
    $("#rowCount").textContent = plan.length;

    updateDifficulty(totalSets);
    saveBtn.disabled = plan.length === 0;
  }

  function updateDifficulty(totalSets) {
    var badge = $("#diffBadge");
    badge.classList.remove("is-hard", "is-light");
    var label;
    if (totalSets === 0) { label = "Empty"; }
    else if (totalSets <= 12) { label = "Light"; badge.classList.add("is-light"); }
    else if (totalSets <= 22) { label = "Moderate"; }
    else { label = "Brutal"; badge.classList.add("is-hard"); }
    badge.textContent = label;
  }

  // ---------- Drop zone (add via drag from library) ----------
  dropZone.addEventListener("dragover", function (e) {
    // only highlight for library adds (no reorder in progress)
    if (dragUid !== null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    dropZone.classList.add("drag-over");
  });
  dropZone.addEventListener("dragleave", function (e) {
    if (e.target === dropZone) dropZone.classList.remove("drag-over");
  });
  dropZone.addEventListener("drop", function (e) {
    dropZone.classList.remove("drag-over");
    if (dragUid !== null) return; // reorder handled per-row
    var id = e.dataTransfer.getData("text/plain");
    if (id && byId(id)) {
      e.preventDefault();
      addExercise(id);
    }
  });

  // ---------- Filters & search ----------
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      activeGroup = chip.dataset.group;
      renderLibrary();
    });
  });

  searchEl.addEventListener("input", function () {
    searchTerm = searchEl.value.trim().toLowerCase();
    renderLibrary();
  });

  // ---------- Buttons ----------
  clearBtn.addEventListener("click", function () {
    if (!plan.length) { toast("Plan is already empty"); return; }
    plan = [];
    renderPlan(false);
    updateSummary();
    toast("Plan cleared");
  });

  saveBtn.addEventListener("click", function () {
    if (!plan.length) return;
    var name = $("#dayName").value.trim() || "Untitled workout";
    toast("Saved “" + name + "” · " + plan.length + " exercises 💪");
    saveBtn.animate(
      [{ transform: "scale(1)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }],
      { duration: 240 }
    );
  });

  // ---------- Seed ----------
  ["bench", "incdb", "ohp", "pushdown"].forEach(addExerciseSilent);
  function addExerciseSilent(id) {
    var ref = byId(id);
    if (!ref) return;
    plan.push({
      uid: uidSeq++, id: ref.id, name: ref.name, group: ref.group,
      icon: ref.icon, sets: ref.sets, reps: ref.reps, rest: ref.rest
    });
  }

  // ---------- Init ----------
  renderLibrary();
  renderPlan(false);
  updateSummary();
})();
