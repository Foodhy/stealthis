/* DIY — Guide Step Navigator
   Vertical stepper + compact horizontal variant driven by one shared state.
   Done-state persists to localStorage; arrows / buttons move the active step. */

(function () {
  "use strict";

  var STORAGE_KEY = "diy-step-stepper:rt-0042";

  var stepsList = document.getElementById("stepsList");
  var steps = Array.prototype.slice.call(stepsList.querySelectorAll(".step"));
  var total = steps.length;

  var meterCount = document.getElementById("meterCount");
  var meterPct = document.getElementById("meterPct");
  var meterFill = document.getElementById("meterFill");
  var meterBar = document.getElementById("meterBar");
  var resetBtn = document.getElementById("resetBtn");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var miniTrack = document.getElementById("miniTrack");
  var toastEl = document.getElementById("toast");

  var MINI_LABELS = ["Power off", "Open up", "Unplug", "Old fan out", "New fan in", "Test"];

  /* ---------- state ---------- */

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (
          parsed &&
          Array.isArray(parsed.done) &&
          parsed.done.length === total &&
          typeof parsed.active === "number"
        ) {
          parsed.active = clamp(parsed.active, 0, total - 1);
          return parsed;
        }
      }
    } catch (e) {
      /* corrupted storage — fall through to defaults */
    }
    return { done: new Array(total).fill(false), active: 0 };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable (private mode) — session-only state */
    }
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  /* ---------- toast ---------- */

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  /* ---------- compact variant (built once) ---------- */

  var miniSteps = steps.map(function (_, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mini-step";
    btn.setAttribute("role", "listitem");
    btn.setAttribute("aria-label", "Go to step " + (i + 1) + ": " + MINI_LABELS[i]);

    var dot = document.createElement("span");
    dot.className = "mini-dot";
    dot.textContent = String(i + 1);

    var label = document.createElement("span");
    label.className = "mini-label";
    label.textContent = MINI_LABELS[i];

    btn.appendChild(dot);
    btn.appendChild(label);
    btn.addEventListener("click", function () {
      setActive(i, true);
    });
    miniTrack.appendChild(btn);
    return { btn: btn, dot: dot };
  });

  /* ---------- render ---------- */

  function render() {
    var doneCount = state.done.filter(Boolean).length;
    var pct = Math.round((doneCount / total) * 100);

    meterCount.textContent = doneCount + "/" + total;
    meterPct.textContent = pct + "%";
    meterFill.style.width = pct + "%";
    meterFill.classList.toggle("is-complete", doneCount === total);
    meterBar.setAttribute("aria-valuenow", String(pct));

    steps.forEach(function (step, i) {
      var isDone = state.done[i];
      var isActive = i === state.active;
      step.classList.toggle("is-done", isDone);
      step.classList.toggle("is-active", isActive);
      step.setAttribute("aria-current", isActive ? "step" : "false");

      var check = step.querySelector(".done-check");
      if (check.checked !== isDone) check.checked = isDone;

      var label = step.querySelector(".done-label");
      label.textContent = isDone ? "Done" : "Mark as done";

      var mini = miniSteps[i];
      mini.btn.classList.toggle("is-done", isDone);
      mini.btn.classList.toggle("is-active", isActive);
      mini.dot.textContent = isDone ? "✓" : String(i + 1);
    });

    prevBtn.disabled = state.active === 0;
    nextBtn.disabled = state.active === total - 1;
  }

  function setActive(index, scroll) {
    state.active = clamp(index, 0, total - 1);
    save();
    render();
    if (scroll) {
      steps[state.active].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function toggleDone(index) {
    state.done[index] = !state.done[index];
    save();
    render();

    var doneCount = state.done.filter(Boolean).length;
    if (doneCount === total) {
      toast("All 6 steps complete — enjoy the quiet fan!");
    } else if (state.done[index]) {
      toast("Step " + (index + 1) + " done · " + doneCount + "/" + total + " complete");
    } else {
      toast("Step " + (index + 1) + " reopened");
    }
  }

  /* ---------- wiring ---------- */

  steps.forEach(function (step, i) {
    step.querySelector(".step-node").addEventListener("click", function () {
      setActive(i, true);
    });
    step.querySelector(".done-check").addEventListener("change", function () {
      toggleDone(i);
    });
    // Clicking anywhere on the card focuses that step (but not the toggle itself)
    step.querySelector(".step-card").addEventListener("click", function (e) {
      if (!e.target.closest(".done-toggle")) setActive(i, false);
    });
  });

  prevBtn.addEventListener("click", function () {
    setActive(state.active - 1, true);
  });

  nextBtn.addEventListener("click", function () {
    setActive(state.active + 1, true);
  });

  resetBtn.addEventListener("click", function () {
    state = { done: new Array(total).fill(false), active: 0 };
    save();
    render();
    steps[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("Progress reset · back to step 1");
  });

  document.addEventListener("keydown", function (e) {
    // Don't hijack arrows while typing in a form control
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" && document.activeElement.type === "text") return;
    if (tag === "TEXTAREA" || tag === "SELECT") return;

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActive(state.active + 1, true);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive(state.active - 1, true);
    } else if (e.key === "Enter" && document.activeElement === document.body) {
      toggleDone(state.active);
    }
  });

  render();
})();
