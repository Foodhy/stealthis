(function () {
  "use strict";

  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // JS getDay(): 0=Sun..6=Sat -> map to our Mon-first index
  var jsDay = new Date().getDay();
  var TODAY = (jsDay + 6) % 7;

  // Seeded starter data — realistic but fictional. done = boolean[7]
  var habits = [
    { id: id(), emoji: "🏋️", name: "Strength training", done: [true, true, false, true, true, false, false] },
    { id: id(), emoji: "💧", name: "Drink 3L water", done: [true, true, true, true, false, false, false] },
    { id: id(), emoji: "🥗", name: "Hit protein target", done: [true, true, true, true, true, false, false] },
    { id: id(), emoji: "🏃", name: "10k steps", done: [false, true, true, false, true, false, false] },
    { id: id(), emoji: "😴", name: "Sleep by 11pm", done: [true, false, true, true, false, false, false] }
  ];

  var gridHead = document.getElementById("gridHead");
  var gridBody = document.getElementById("gridBody");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function id() {
    return "h" + Math.random().toString(36).slice(2, 9);
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  // Current streak = consecutive done days ending at today, walking backwards.
  function streakFor(habit) {
    var s = 0;
    for (var i = TODAY; i >= 0; i--) {
      if (habit.done[i]) s++;
      else break;
    }
    return s;
  }

  function buildHead() {
    gridHead.innerHTML = "";
    var label = document.createElement("span");
    label.className = "cell-habit head-habit";
    label.textContent = "Habit";
    gridHead.appendChild(label);
    DAYS.forEach(function (d, i) {
      var h = document.createElement("span");
      h.className = "day-head" + (i === TODAY ? " is-today" : "");
      h.textContent = d;
      gridHead.appendChild(h);
    });
  }

  function renderRows() {
    gridBody.innerHTML = "";
    habits.forEach(function (habit) {
      var row = document.createElement("div");
      row.className = "habit-row";

      var info = document.createElement("div");
      info.className = "habit-info cell-habit";
      info.style.textTransform = "none";
      info.style.letterSpacing = "0";

      var emoji = document.createElement("span");
      emoji.className = "habit-emoji";
      emoji.textContent = habit.emoji;

      var meta = document.createElement("div");
      meta.className = "habit-meta";
      var name = document.createElement("div");
      name.className = "habit-name";
      name.textContent = habit.name;
      var streak = document.createElement("div");
      var s = streakFor(habit);
      streak.className = "habit-streak" + (s === 0 ? " is-zero" : "");
      streak.innerHTML = '<span class="streak-badge">🔥 ' + s + "</span> day streak";
      meta.appendChild(name);
      meta.appendChild(streak);

      var remove = document.createElement("button");
      remove.className = "remove-habit";
      remove.type = "button";
      remove.setAttribute("aria-label", "Remove " + habit.name);
      remove.textContent = "✕";
      remove.addEventListener("click", function () {
        habits = habits.filter(function (h) { return h.id !== habit.id; });
        render();
        toast("Removed “" + habit.name + "”");
      });

      info.appendChild(emoji);
      info.appendChild(meta);
      info.appendChild(remove);
      row.appendChild(info);

      DAYS.forEach(function (d, i) {
        var cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell" +
          (habit.done[i] ? " is-done" : "") +
          (i === TODAY ? " is-today" : "");
        cell.textContent = "✓";
        cell.setAttribute(
          "aria-pressed",
          habit.done[i] ? "true" : "false"
        );
        cell.setAttribute("aria-label", habit.name + " — " + d + (habit.done[i] ? " (done)" : ""));
        cell.addEventListener("click", function () {
          habit.done[i] = !habit.done[i];
          if (habit.done[i]) cell.classList.add("pop");
          render();
        });
        row.appendChild(cell);
      });

      gridBody.appendChild(row);
    });
  }

  function renderStats() {
    var total = habits.length * 7;
    var checks = 0;
    var longest = 0;
    habits.forEach(function (h) {
      h.done.forEach(function (v) { if (v) checks++; });
      var s = streakFor(h);
      if (s > longest) longest = s;
    });
    var pct = total ? Math.round((checks / total) * 100) : 0;

    document.getElementById("statChecks").textContent = checks;
    document.getElementById("statChecksSub").textContent =
      habits.length + (habits.length === 1 ? " habit" : " habits") + " tracked";
    document.getElementById("statStreak").innerHTML = longest + '<span class="stat-unit">d</span>';
    document.getElementById("statPct").textContent = pct + "%";

    var bar = document.getElementById("weekProgress");
    document.getElementById("weekProgressFill").style.width = pct + "%";
    bar.setAttribute("aria-valuenow", String(pct));
  }

  function render() {
    renderRows();
    renderStats();
  }

  // Emoji picker
  var selectedEmoji = "🏋️";
  var emojiBtns = document.querySelectorAll(".emoji-btn");
  emojiBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      emojiBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      selectedEmoji = btn.getAttribute("data-emoji");
    });
  });

  // Add habit
  var form = document.getElementById("addForm");
  var input = document.getElementById("habitName");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = input.value.trim();
    if (!name) {
      toast("Give your habit a name first");
      input.focus();
      return;
    }
    habits.push({
      id: id(),
      emoji: selectedEmoji,
      name: name,
      done: [false, false, false, false, false, false, false]
    });
    input.value = "";
    render();
    toast(selectedEmoji + "  Added “" + name + "” — let's go!");
    // scroll new row into view on small screens
    var rows = gridBody.querySelectorAll(".habit-row");
    if (rows.length) rows[rows.length - 1].scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // Reset week
  var resetArmed = false;
  var resetTimer;
  var resetBtn = document.getElementById("resetWeek");
  resetBtn.addEventListener("click", function () {
    if (!resetArmed) {
      resetArmed = true;
      resetBtn.textContent = "Tap again to confirm";
      toast("This clears every check for the week");
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        resetArmed = false;
        resetBtn.textContent = "Reset week";
      }, 3000);
      return;
    }
    resetArmed = false;
    clearTimeout(resetTimer);
    resetBtn.textContent = "Reset week";
    habits.forEach(function (h) {
      h.done = [false, false, false, false, false, false, false];
    });
    render();
    toast("Week reset — fresh start 💪");
  });

  buildHead();
  render();
})();
