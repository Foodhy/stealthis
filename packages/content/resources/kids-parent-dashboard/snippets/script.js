(function () {
  "use strict";

  /* ---------- Data (fictional) ---------- */
  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  var CHILDREN = [
    {
      id: "mila",
      name: "Mila",
      face: "🦊",
      age: "Age 6 · Ages 6–8 reader",
      week: [22, 30, 15, 40, 28, 52, 35],
      books: 5,
      goal: 8,
      streak: 6,
      best: 9,
      recommendedAge: "6-8",
      activity: [
        { icon: "📖", title: "The Little Lantern Fox", meta: "Finished · 12 spreads", tag: "finished" },
        { icon: "🦉", title: "Owl School Adventures", meta: "Read 18 min today", tag: "reading" },
        { icon: "⭐", title: "Forest Friends quiz", meta: "Scored 4 of 5 stars", tag: "quiz" },
        { icon: "🌙", title: "Goodnight Moonbeam", meta: "Read 11 min · last night", tag: "reading" }
      ]
    },
    {
      id: "theo",
      name: "Theo",
      face: "🐻",
      age: "Age 4 · Ages 3–5 reader",
      week: [12, 8, 18, 10, 20, 14, 9],
      books: 9,
      goal: 8,
      streak: 11,
      best: 11,
      recommendedAge: "3-5",
      activity: [
        { icon: "🚂", title: "Choo-Choo Counting", meta: "Finished · 8 pages", tag: "finished" },
        { icon: "🐶", title: "Puppy's Rainy Day", meta: "Read 9 min today", tag: "reading" },
        { icon: "🎨", title: "Colors with Coco", meta: "Finished · 10 pages", tag: "finished" },
        { icon: "⭐", title: "Shapes quiz", meta: "Scored 5 of 5 stars", tag: "quiz" }
      ]
    },
    {
      id: "ada",
      name: "Ada",
      face: "🐱",
      age: "Age 10 · Ages 9–12 reader",
      week: [45, 38, 60, 50, 42, 70, 55],
      books: 7,
      goal: 8,
      streak: 3,
      best: 14,
      recommendedAge: "9-12",
      activity: [
        { icon: "🚀", title: "Comet Riders: Book 2", meta: "Read 40 min today", tag: "reading" },
        { icon: "🗺️", title: "Atlas of Tiny Kingdoms", meta: "Finished · 24 chapters", tag: "finished" },
        { icon: "⭐", title: "Mythical Beasts quiz", meta: "Scored 5 of 5 stars", tag: "quiz" },
        { icon: "🔍", title: "The Clockwork Mystery", meta: "Read 22 min · yesterday", tag: "reading" }
      ]
    }
  ];

  /* ---------- State ---------- */
  var state = {
    childId: CHILDREN[0].id,
    limit: 45,
    limitOn: true,
    ages: { "3-5": true, "6-8": true, "9-12": false }
  };

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function currentChild() {
    return CHILDREN.filter(function (c) { return c.id === state.childId; })[0];
  }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- Build child switcher ---------- */
  function buildSwitcher() {
    var wrap = $("#childSwitcher");
    wrap.innerHTML = "";
    CHILDREN.forEach(function (c, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "child-tab";
      btn.setAttribute("role", "tab");
      btn.id = "tab-" + c.id;
      btn.setAttribute("aria-selected", c.id === state.childId ? "true" : "false");
      btn.tabIndex = c.id === state.childId ? 0 : -1;
      btn.innerHTML = '<span class="tab-face" aria-hidden="true">' + c.face + "</span>" +
        "<span>" + c.name + "</span>";
      btn.addEventListener("click", function () { selectChild(c.id); });
      btn.addEventListener("keydown", function (e) {
        var idx = i;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { idx = (i + 1) % CHILDREN.length; }
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { idx = (i - 1 + CHILDREN.length) % CHILDREN.length; }
        else { return; }
        e.preventDefault();
        selectChild(CHILDREN[idx].id);
        var next = $("#tab-" + CHILDREN[idx].id);
        if (next) next.focus();
      });
      wrap.appendChild(btn);
    });
  }

  function selectChild(id) {
    if (id === state.childId) return;
    state.childId = id;
    var c = currentChild();
    // auto-tune the recommended age filter for the chosen child
    syncSwitcherSelection();
    renderChild();
    toast("Now viewing " + c.name + "'s reading");
  }

  function syncSwitcherSelection() {
    var tabs = document.querySelectorAll(".child-tab");
    Array.prototype.forEach.call(tabs, function (t) {
      var on = t.id === "tab-" + state.childId;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
  }

  /* ---------- Render child stats ---------- */
  function renderChild() {
    var c = currentChild();

    $("#childFace").textContent = c.face;
    $("#childName").textContent = c.name;
    $("#childSub").textContent = c.age;

    // weekly totals
    var total = c.week.reduce(function (a, b) { return a + b; }, 0);
    var avg = Math.round(total / c.week.length);
    $("#weekTotal").textContent = total;
    $("#weekAvg").textContent = "~" + avg + " min/day";

    // books + streak
    $("#booksFinished").textContent = c.books;
    $("#booksGoal").textContent = "of " + c.goal + " goal";
    $("#streak").textContent = c.streak;
    $("#streakBest").textContent = "best " + c.best + " days";

    renderChart(c);
    renderActivity(c);
    updateLimitStatus();
  }

  function renderChart(c) {
    var chart = $("#chart");
    chart.innerHTML = "";
    var max = Math.max.apply(null, c.week);
    var peak = c.week.indexOf(max);
    c.week.forEach(function (min, i) {
      var pct = max ? Math.round((min / max) * 100) : 0;
      var cell = document.createElement("div");
      cell.className = "bar";
      var fill = document.createElement("div");
      fill.className = "bar-fill" + (i === peak ? " is-peak" : "");
      fill.style.height = Math.max(pct, 6) + "%";
      fill.setAttribute("data-min", min);
      var label = document.createElement("span");
      label.className = "bar-day";
      label.textContent = DAYS[i];
      cell.appendChild(fill);
      cell.appendChild(label);
      chart.appendChild(cell);
    });
    chart.setAttribute(
      "aria-label",
      c.name + "'s daily reading minutes: " +
        DAYS.map(function (d, i) { return d + " " + c.week[i]; }).join(", ")
    );
  }

  function renderActivity(c) {
    var list = $("#activityList");
    list.innerHTML = "";
    // only show activity that fits the enabled age filters' "vibe":
    // we keep all items but flag the recommended-age match in the count line.
    c.activity.forEach(function (a) {
      var li = document.createElement("li");
      li.className = "activity-item";
      var tagClass = a.tag === "finished" ? "tag-finished" : a.tag === "quiz" ? "tag-quiz" : "tag-reading";
      var tagText = a.tag === "finished" ? "Finished" : a.tag === "quiz" ? "Quiz" : "Reading";
      li.innerHTML =
        '<span class="activity-icon" aria-hidden="true">' + a.icon + "</span>" +
        '<div class="activity-body">' +
          '<p class="activity-title">' + a.title + "</p>" +
          '<p class="activity-meta">' + a.meta + "</p>" +
        "</div>" +
        '<span class="activity-tag ' + tagClass + '">' + tagText + "</span>";
      list.appendChild(li);
      // playful tap wiggle on the icon
      var icon = li.querySelector(".activity-icon");
      icon.addEventListener("click", function () {
        icon.classList.remove("wiggle");
        void icon.offsetWidth;
        icon.classList.add("wiggle");
      });
    });
    $("#activityCount").textContent = c.activity.length + " entries";
  }

  /* ---------- Limit control ---------- */
  var slider = $("#limitSlider");
  var limitToggle = $("#limitToggle");
  var limitControl = $("#limitControl");

  function updateLimitStatus() {
    var c = currentChild();
    var todayMin = c.week[c.week.length - 1]; // Sun as "today"
    var valEl = $("#limitValue");
    valEl.textContent = state.limit;
    $("#limitSlider").setAttribute("aria-valuetext", state.limit + " minutes");

    var status = $("#limitStatus");
    if (!state.limitOn) {
      limitControl.classList.add("is-off");
      status.textContent = "Limit is off — " + c.name + " can read with no daily cap.";
      return;
    }
    limitControl.classList.remove("is-off");
    var left = state.limit - todayMin;
    if (left > 0) {
      status.textContent = c.name + " has read " + todayMin + " of " + state.limit +
        " min today — " + left + " min left.";
    } else if (left === 0) {
      status.textContent = c.name + " has reached today's " + state.limit + " min limit. 🎉";
    } else {
      status.textContent = "Heads up: " + c.name + " read " + todayMin +
        " min, over the " + state.limit + " min limit.";
    }
  }

  slider.addEventListener("input", function () {
    state.limit = parseInt(slider.value, 10);
    $("#limitValue").textContent = state.limit;
    updateLimitStatus();
  });
  slider.addEventListener("change", function () {
    toast("Daily limit set to " + state.limit + " min");
  });

  limitToggle.addEventListener("change", function () {
    state.limitOn = limitToggle.checked;
    slider.disabled = !state.limitOn;
    updateLimitStatus();
    toast(state.limitOn ? "Daily limit turned on" : "Daily limit turned off");
  });

  /* ---------- Age filters ---------- */
  var ageButtons = document.querySelectorAll(".age-chip");
  function updateFilterSummary() {
    var on = [];
    Array.prototype.forEach.call(ageButtons, function (b) {
      var a = b.getAttribute("data-age");
      state.ages[a] = b.getAttribute("aria-pressed") === "true";
      if (state.ages[a]) on.push(b.textContent.replace("Ages ", ""));
    });
    var summary = $("#filterSummary");
    if (on.length === 0) {
      summary.textContent = "No age range selected — Storyleaf will hide all stories.";
    } else {
      summary.textContent = "Showing stories for ages " + on.join(", ") + ".";
    }
  }

  Array.prototype.forEach.call(ageButtons, function (b) {
    b.addEventListener("click", function () {
      var pressed = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", pressed ? "false" : "true");
      updateFilterSummary();
      var a = b.getAttribute("data-age");
      toast((!pressed ? "Enabled" : "Disabled") + " ages " + a);
    });
  });

  /* ---------- Easy-read font toggle ---------- */
  var fontToggle = $("#fontToggle");
  fontToggle.addEventListener("click", function () {
    var on = document.body.classList.toggle("easy-read");
    fontToggle.setAttribute("aria-pressed", on ? "true" : "false");
    toast(on ? "Easy-read font on" : "Easy-read font off");
  });

  /* ---------- Init ---------- */
  buildSwitcher();
  renderChild();
  state.limit = parseInt(slider.value, 10);
  updateLimitStatus();
  updateFilterSummary();
})();
