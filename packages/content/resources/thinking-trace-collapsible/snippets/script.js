(function () {
  "use strict";

  // Simulated chain-of-thought. Each step streams in with a small delay.
  var STEPS = [
    {
      head: "Parse the rule",
      text: "Autocomplete resolves a word once its third letter is typed, then one accept keystroke commits the suggestion.",
      delay: 700
    },
    {
      head: "Type the prefix",
      text: "Enter b, a, n — that is 3 keystrokes for the first three letters.",
      delay: 650
    },
    {
      head: "Check ambiguity",
      text: "After “ban” the intended target is “banana”. Assume it is the sole/top completion offered.",
      delay: 700
    },
    {
      head: "Count the accept",
      text: "Accepting the suggestion (Tab or Enter) is 1 more keystroke.",
      delay: 600
    },
    {
      head: "Sum keystrokes",
      text: "3 letters + 1 accept = 4 total keystrokes.",
      delay: 650
    },
    {
      head: "Sanity check",
      text: "Typing all 6 letters manually would be 6, so autocomplete saves 2 — consistent.",
      delay: 600
    }
  ];

  var trace = document.querySelector(".trace");
  var head = trace.querySelector(".trace__head");
  var labelEl = trace.querySelector('[data-role="label"]');
  var timerEl = trace.querySelector('[data-role="timer"]');
  var stepCountEl = trace.querySelector('[data-role="stepcount"]');
  var stepsList = trace.querySelector('[data-role="steps"]');
  var answerEl = document.querySelector('[data-role="answer"]');
  var runBtn = document.querySelector('[data-role="run"]');
  var autoCollapseEl = document.querySelector('[data-role="autocollapse"]');
  var statusEl = document.querySelector('[data-role="status"]');

  var rafId = null;
  var timeouts = [];
  var startTime = 0;
  var finalDuration = 0;
  var isThinking = false;
  var userToggledDuringRun = false;

  function fmt(sec) {
    return sec.toFixed(1) + "s";
  }

  function clearTimers() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    timeouts.forEach(clearTimeout);
    timeouts = [];
  }

  // rAF-driven, drift-free elapsed timer.
  function tick() {
    var elapsed = (performance.now() - startTime) / 1000;
    timerEl.textContent = fmt(elapsed);
    rafId = requestAnimationFrame(tick);
  }

  function setOpen(open) {
    trace.setAttribute("data-open", open ? "true" : "false");
    head.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function addStep(step, index) {
    var li = document.createElement("li");
    li.className = "step";
    var num = document.createElement("span");
    num.className = "step__num";
    num.textContent = index + 1;
    var body = document.createElement("div");
    body.className = "step__body";
    var h = document.createElement("div");
    h.className = "step__head";
    h.textContent = step.head;
    var t = document.createElement("div");
    t.className = "step__text";
    t.textContent = step.text;
    body.appendChild(h);
    body.appendChild(t);
    li.appendChild(num);
    li.appendChild(body);
    stepsList.appendChild(li);
  }

  function finish() {
    isThinking = false;
    clearTimers();
    finalDuration = (performance.now() - startTime) / 1000;

    trace.setAttribute("data-state", "done");
    labelEl.textContent = "Thought for " + fmt(finalDuration);
    timerEl.textContent = fmt(finalDuration);
    timerEl.hidden = true;
    stepCountEl.hidden = false;
    stepCountEl.textContent = STEPS.length + " steps";

    answerEl.hidden = false;
    statusEl.textContent = "Done · " + fmt(finalDuration);
    runBtn.disabled = false;

    // Auto-collapse honors the switch, unless the user manually opened it mid-run.
    if (autoCollapseEl.checked && !userToggledDuringRun) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }

  function run() {
    clearTimers();
    userToggledDuringRun = false;
    isThinking = true;
    finalDuration = 0;

    // Reset UI
    stepsList.innerHTML = "";
    answerEl.hidden = true;
    stepCountEl.hidden = true;
    timerEl.hidden = false;
    timerEl.textContent = "0.0s";
    labelEl.textContent = "Thinking";
    trace.setAttribute("data-state", "thinking");
    setOpen(true); // expanded while streaming so you can watch steps arrive
    runBtn.disabled = true;
    statusEl.textContent = "Streaming reasoning…";

    startTime = performance.now();
    rafId = requestAnimationFrame(tick);

    // Stream steps sequentially using accumulated delays.
    var acc = 0;
    STEPS.forEach(function (step, i) {
      acc += step.delay;
      timeouts.push(
        setTimeout(function () {
          addStep(step, i);
        }, acc)
      );
    });

    // Finish shortly after the last step lands.
    timeouts.push(setTimeout(finish, acc + 500));
  }

  // Header toggle (expand/collapse). Disabled while actively thinking is allowed —
  // user can peek, but we record the manual intent so auto-collapse won't override.
  head.addEventListener("click", function () {
    var open = trace.getAttribute("data-open") === "true";
    setOpen(!open);
    if (isThinking) userToggledDuringRun = true;
  });

  runBtn.addEventListener("click", run);

  // If the user flips auto-collapse after a finished run, apply it immediately.
  autoCollapseEl.addEventListener("change", function () {
    if (!isThinking && finalDuration > 0) {
      setOpen(!autoCollapseEl.checked);
      userToggledDuringRun = false;
    }
  });

  // Kick off the first run on load.
  run();
})();
