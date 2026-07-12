(function () {
  "use strict";

  var PROGRAMS = [
    {
      id: "titan-strength",
      name: "Titan Strength",
      blurb: "Build a raw, brutal base of strength on the big three lifts.",
      goal: "strength",
      level: "advanced",
      weeks: 12,
      days: 4,
      price: 149,
      focus: ["Squat", "Bench", "Deadlift", "Powerbuilding"],
      popular: true
    },
    {
      id: "lean-machine",
      name: "Lean Machine",
      blurb: "High-intensity conditioning to strip fat while keeping muscle.",
      goal: "fat-loss",
      level: "intermediate",
      weeks: 8,
      days: 5,
      price: 99,
      focus: ["HIIT", "Metcon", "Nutrition"]
    },
    {
      id: "hyper-mass",
      name: "Hyper Mass",
      blurb: "Science-based hypertrophy blocks to pack on serious size.",
      goal: "hypertrophy",
      level: "intermediate",
      weeks: 10,
      days: 5,
      price: 119,
      focus: ["Volume", "Progressive Overload", "Split"]
    },
    {
      id: "first-rep",
      name: "First Rep",
      blurb: "Your zero-to-hero onboarding into the world of lifting.",
      goal: "strength",
      level: "beginner",
      weeks: 6,
      days: 3,
      price: 59,
      focus: ["Form", "Fundamentals", "Full Body"]
    },
    {
      id: "engine-builder",
      name: "Engine Builder",
      blurb: "Grow your aerobic engine for runs, rides and long efforts.",
      goal: "endurance",
      level: "intermediate",
      weeks: 10,
      days: 4,
      price: 89,
      focus: ["Zone 2", "Intervals", "Tempo"]
    },
    {
      id: "flow-restore",
      name: "Flow & Restore",
      blurb: "Daily mobility flows to unlock hips, shoulders and spine.",
      goal: "mobility",
      level: "beginner",
      weeks: 4,
      days: 6,
      price: 45,
      focus: ["Mobility", "Recovery", "Stability"]
    }
  ];

  var state = { goal: "all", level: "all" };

  var grid = document.getElementById("programGrid");
  var emptyState = document.getElementById("emptyState");
  var resultCount = document.getElementById("resultCount");
  var resetBtn = document.getElementById("resetBtn");
  var toastEl = document.getElementById("toast");
  var enrolled = {};
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function cardMarkup(p) {
    var tags = p.focus
      .map(function (f) { return '<span class="tag">' + esc(f) + "</span>"; })
      .join("");
    var badge = p.popular
      ? '<span class="badge">★ Most popular</span>'
      : "";
    var levelLabel = p.level.charAt(0).toUpperCase() + p.level.slice(1);
    var isEnrolled = !!enrolled[p.id];
    var btnClass = isEnrolled ? "btn is-enrolled" : "btn";
    var btnLabel = isEnrolled ? "✓ Enrolled" : "Enroll now";

    return (
      '<article class="card' + (p.popular ? " card--popular" : "") +
        '" data-goal="' + p.goal + '" data-level="' + p.level + '">' +
        badge +
        '<span class="card__level" data-level="' + p.level + '">' + levelLabel + "</span>" +
        '<h2 class="card__name">' + esc(p.name) + "</h2>" +
        '<p class="card__blurb">' + esc(p.blurb) + "</p>" +
        '<div class="card__stats">' +
          '<div class="stat"><span class="stat__val">' + p.weeks + '</span><span class="stat__key">Weeks</span></div>' +
          '<div class="stat"><span class="stat__val">' + p.days + '</span><span class="stat__key">Days / wk</span></div>' +
          '<div class="stat"><span class="stat__val">' + esc(capGoal(p.goal)) + '</span><span class="stat__key">Focus</span></div>' +
        "</div>" +
        '<div class="tags">' + tags + "</div>" +
        '<div class="card__foot">' +
          '<div class="price"><span class="price__amt">$' + p.price + '</span><span class="price__per">/ full block</span></div>' +
          '<button class="' + btnClass + '" data-enroll="' + p.id + '"' +
            (isEnrolled ? " disabled" : "") + '>' + btnLabel + "</button>" +
        "</div>" +
      "</article>"
    );
  }

  function capGoal(g) {
    var map = {
      "strength": "Strength",
      "hypertrophy": "Size",
      "fat-loss": "Fat Loss",
      "endurance": "Cardio",
      "mobility": "Mobility"
    };
    return map[g] || g;
  }

  function matches(p) {
    return (
      (state.goal === "all" || p.goal === state.goal) &&
      (state.level === "all" || p.level === state.level)
    );
  }

  function render() {
    var visible = PROGRAMS.filter(matches);
    grid.innerHTML = visible.map(cardMarkup).join("");

    var isEmpty = visible.length === 0;
    emptyState.hidden = !isEmpty;
    grid.hidden = isEmpty;

    resultCount.textContent =
      visible.length + (visible.length === 1 ? " program" : " programs");

    var filtered = state.goal !== "all" || state.level !== "all";
    resetBtn.hidden = !filtered;
  }

  function setFilter(type, value) {
    state[type] = value;
    var container = type === "goal" ? "goalChips" : "levelChips";
    var chips = document.getElementById(container).querySelectorAll(".chip");
    chips.forEach(function (chip) {
      var on = chip.dataset.value === value;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
    render();
  }

  function reset() {
    setFilter("goal", "all");
    setFilter("level", "all");
    toast("Filters cleared");
  }

  // ---- Event delegation ----
  document.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (chip) {
      setFilter(chip.dataset.filter, chip.dataset.value);
      return;
    }

    var enrollBtn = e.target.closest("[data-enroll]");
    if (enrollBtn && !enrollBtn.disabled) {
      var id = enrollBtn.dataset.enroll;
      var prog = PROGRAMS.find(function (p) { return p.id === id; });
      enrolled[id] = true;
      enrollBtn.classList.add("is-enrolled");
      enrollBtn.disabled = true;
      enrollBtn.textContent = "✓ Enrolled";
      toast("You're in — " + (prog ? prog.name : "program") + " unlocked!");
      return;
    }

    if (e.target.closest("[data-reset]") || e.target === resetBtn) {
      reset();
    }
  });

  render();
})();
