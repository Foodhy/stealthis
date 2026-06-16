(function () {
  "use strict";

  /* ---------- Stop type catalog ---------- */
  var TYPES = {
    sight: { label: "Sightseeing", icon: "🏛️", move: "🚶" },
    food: { label: "Food & drink", icon: "🍽️", move: "🚶" },
    transport: { label: "Transport", icon: "🚌", move: "🚏" },
    hotel: { label: "Hotel & rest", icon: "🛎️", move: "🚶" }
  };

  /* ---------- Seed itinerary (fictional) ---------- */
  function seed() {
    return [
      {
        id: uid(),
        type: "food",
        title: "Breakfast at Café Marea",
        note: "Pastel de nata and a cortado on the harbour terrace before the crowds arrive.",
        duration: 45,
        travel: 10
      },
      {
        id: uid(),
        type: "transport",
        title: "Tram 7 to the cliff trailhead",
        note: "Old wooden tram up the hillside. Tap on with the day pass; sit on the left for sea views.",
        duration: 20,
        travel: 5
      },
      {
        id: uid(),
        type: "sight",
        title: "Sea-cliff coastal walk",
        note: "Clifftop path past the old lighthouse with wide views over the bay. Easy gradient, shaded benches.",
        duration: 90,
        travel: 25
      },
      {
        id: uid(),
        type: "food",
        title: "Long lunch at Taberna do Sol",
        note: "Grilled catch of the day, a carafe of vinho verde, and zero rush. Reserve the courtyard table.",
        duration: 75,
        travel: 15
      },
      {
        id: uid(),
        type: "sight",
        title: "Azulejo Museum & old town",
        note: "Tiled cloisters and a quiet courtyard. Wander the lanes afterwards for ceramics shops.",
        duration: 60,
        travel: 20
      },
      {
        id: uid(),
        type: "hotel",
        title: "Sunset on the rooftop terrace",
        note: "Back to the guesthouse to freshen up, then golden hour with a vermouth before dinner plans.",
        duration: 60,
        travel: 0
      }
    ];
  }

  /* ---------- State ---------- */
  var state = {
    start: "08:30",
    stops: seed()
  };

  /* ---------- Elements ---------- */
  var timelineEl = document.getElementById("timeline");
  var template = document.getElementById("stop-template");
  var startInput = document.getElementById("start-time");
  var emptyState = document.getElementById("empty-state");
  var toastEl = document.getElementById("toast");

  var statStops = document.getElementById("stat-stops");
  var statHours = document.getElementById("stat-hours");
  var statTravel = document.getElementById("stat-travel");
  var statEnd = document.getElementById("stat-end");

  var dragId = null;

  /* ---------- Helpers ---------- */
  function uid() {
    return "s" + Math.random().toString(36).slice(2, 9);
  }

  function toMinutes(hhmm) {
    var parts = (hhmm || "0:0").split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function fmtClock(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var ampm = h < 12 ? "am" : "pm";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + ampm;
  }

  function fmtDur(mins) {
    if (mins < 60) return mins + "m";
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return m === 0 ? h + "h" : h + "h " + m + "m";
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function findIndex(id) {
    for (var i = 0; i < state.stops.length; i++) {
      if (state.stops[i].id === id) return i;
    }
    return -1;
  }

  /* ---------- Render ---------- */
  function render() {
    timelineEl.innerHTML = "";
    emptyState.hidden = state.stops.length > 0;

    var clock = toMinutes(state.start);

    state.stops.forEach(function (stop, i) {
      var node = template.content.firstElementChild.cloneNode(true);
      var meta = TYPES[stop.type] || TYPES.sight;

      node.dataset.id = stop.id;
      node.classList.add("t-" + stop.type);

      node.querySelector(".stop-icon").textContent = meta.icon;
      node.querySelector(".stop-title").textContent = stop.title;
      node.querySelector(".stop-time").textContent = fmtClock(clock);
      node.querySelector(".stop-dur").textContent = fmtDur(stop.duration);
      node.querySelector(".stop-note").textContent = stop.note;
      node.querySelector(".dur-readout").textContent = fmtDur(stop.duration);

      // travel connector to the NEXT stop
      var connectorLabel = node.querySelector(".connector-label");
      var connectorIcon = node.querySelector(".connector-icon");
      if (i < state.stops.length - 1) {
        if (stop.travel > 0) {
          connectorLabel.textContent = meta.move + " " + stop.travel + " min to next stop";
          connectorIcon.textContent = "↧";
        } else {
          connectorLabel.textContent = "Stay put — next stop here";
          connectorIcon.textContent = "•";
        }
      }

      // expand state preserved across renders
      var head = node.querySelector(".stop-head");
      head.setAttribute(
        "aria-expanded",
        stop.collapsed ? "false" : "true"
      );

      wireStop(node, stop);
      timelineEl.appendChild(node);

      // advance the running clock: this stop + travel to next
      clock += stop.duration + (i < state.stops.length - 1 ? stop.travel : 0);
    });

    updateSummary(clock);
  }

  function updateSummary(endClock) {
    var totalActive = 0;
    var totalTravel = 0;
    state.stops.forEach(function (s, i) {
      totalActive += s.duration;
      if (i < state.stops.length - 1) totalTravel += s.travel;
    });

    statStops.textContent = String(state.stops.length);
    statHours.textContent = state.stops.length ? fmtDur(totalActive) : "0h";
    statTravel.textContent = totalTravel > 0 ? fmtDur(totalTravel) : "0m";
    statEnd.textContent = state.stops.length ? fmtClock(endClock) : "—";
  }

  /* ---------- Per-stop wiring ---------- */
  function wireStop(node, stop) {
    var head = node.querySelector(".stop-head");
    var handle = node.querySelector(".drag-handle");

    // collapse / expand
    head.addEventListener("click", function () {
      stop.collapsed = !stop.collapsed;
      head.setAttribute("aria-expanded", stop.collapsed ? "false" : "true");
    });

    // duration steppers
    node.querySelectorAll(".step").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var delta = parseInt(btn.dataset.step, 10);
        var next = stop.duration + delta;
        if (next < 15) {
          toast("Minimum stop is 15 minutes");
          return;
        }
        if (next > 480) {
          toast("That is a long stop — capped at 8h");
          return;
        }
        stop.duration = next;
        render();
      });
    });

    // remove
    node.querySelector(".remove").addEventListener("click", function () {
      var idx = findIndex(stop.id);
      if (idx > -1) {
        state.stops.splice(idx, 1);
        render();
        toast("Removed “" + truncate(stop.title) + "”");
      }
    });

    // drag to reorder (handle is the drag source)
    handle.addEventListener("mousedown", enableDrag);
    handle.addEventListener("touchstart", enableTouchDrag, { passive: true });

    node.addEventListener("dragstart", function (e) {
      dragId = stop.id;
      node.classList.add("dragging");
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", stop.id);
      }
    });

    node.addEventListener("dragend", function () {
      node.classList.remove("dragging");
      clearDragOver();
      node.setAttribute("draggable", "false");
      dragId = null;
    });

    node.addEventListener("dragover", function (e) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      if (dragId && dragId !== stop.id) {
        clearDragOver();
        node.classList.add("drag-over");
      }
    });

    node.addEventListener("drop", function (e) {
      e.preventDefault();
      node.classList.remove("drag-over");
      if (dragId && dragId !== stop.id) {
        reorder(dragId, stop.id);
      }
    });

    function enableDrag() {
      node.setAttribute("draggable", "true");
    }
    function enableTouchDrag() {
      node.setAttribute("draggable", "true");
    }
  }

  function clearDragOver() {
    var prev = timelineEl.querySelectorAll(".drag-over");
    prev.forEach(function (el) {
      el.classList.remove("drag-over");
    });
  }

  function reorder(fromId, toId) {
    var from = findIndex(fromId);
    var to = findIndex(toId);
    if (from < 0 || to < 0 || from === to) return;
    var moved = state.stops.splice(from, 1)[0];
    state.stops.splice(to, 0, moved);
    render();
    toast("Reordered — times recalculated");
  }

  function truncate(str) {
    return str.length > 28 ? str.slice(0, 27) + "…" : str;
  }

  /* ---------- Add stop ---------- */
  var addIdeas = [
    {
      type: "food",
      title: "Coffee & cake at Doce Hora",
      note: "A quick pit stop — flat white and an almond tart in a sunny window seat.",
      duration: 30,
      travel: 10
    },
    {
      type: "sight",
      title: "Hidden cove swim stop",
      note: "Steps down to a sheltered cove. Calm water, bring a towel — worth the detour.",
      duration: 45,
      travel: 15
    },
    {
      type: "transport",
      title: "Ferry across the bay",
      note: "Ten-minute crossing with a breeze and skyline views. Buy tickets at the kiosk.",
      duration: 15,
      travel: 10
    },
    {
      type: "hotel",
      title: "Siesta break at the guesthouse",
      note: "Recharge through the heat of the afternoon before the evening picks up.",
      duration: 60,
      travel: 5
    }
  ];
  var addCursor = 0;

  document.getElementById("add-stop").addEventListener("click", function () {
    var idea = addIdeas[addCursor % addIdeas.length];
    addCursor++;
    var stop = {
      id: uid(),
      type: idea.type,
      title: idea.title,
      note: idea.note,
      duration: idea.duration,
      travel: idea.travel,
      collapsed: false
    };
    state.stops.push(stop);
    render();
    toast("Added “" + truncate(stop.title) + "”");
    // bring the new stop into view
    var last = timelineEl.lastElementChild;
    if (last && last.scrollIntoView) {
      last.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  /* ---------- Start time ---------- */
  startInput.addEventListener("input", function () {
    if (startInput.value) {
      state.start = startInput.value;
      render();
    }
  });

  /* ---------- Reset ---------- */
  document.getElementById("reset-day").addEventListener("click", function () {
    state.start = "08:30";
    startInput.value = "08:30";
    state.stops = seed();
    addCursor = 0;
    render();
    toast("Day reset to the original plan");
  });

  /* ---------- Init ---------- */
  startInput.value = state.start;
  render();
})();
