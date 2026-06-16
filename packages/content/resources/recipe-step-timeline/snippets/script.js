(function () {
  "use strict";

  /* ---------- Recipe data (fictional) ---------- */
  // text: instruction (use {{20 min}} markers to auto-detect a timer)
  // tip: optional callout. plate: optional {emoji,kind} CSS "photo".
  var STEPS = [
    {
      text: "Bring a wide, heavy skillet to medium-high and warm a generous glug of olive oil until it shimmers.",
      tip: "A dry, hot pan is the secret to char — don't crowd it.",
      plate: { emoji: "🫒", kind: "saffron" },
    },
    {
      text: "Add 400g of halved cherry tomatoes cut-side down and let them sit, undisturbed, to blister for {{6 min}}.",
      tip: "Resist stirring — you want deep, jammy char marks.",
      plate: { emoji: "🍅", kind: "tomato" },
    },
    {
      text: "Stir in 3 cloves of sliced garlic and a pinch of chili flakes; toast just until fragrant, about {{1 min}}.",
      tip: "Garlic burns fast — keep it moving here.",
    },
    {
      text: "Bloom a fat pinch of saffron threads in 60ml of warm stock, then pour it into the pan with 300g of orzo.",
      plate: { emoji: "🌾", kind: "saffron" },
    },
    {
      text: "Add 700ml of hot vegetable stock, season, cover, and simmer gently for {{15 min}}, stirring now and then.",
      tip: "Stir along the bottom so the orzo never catches.",
    },
    {
      text: "Uncover, fold through a knob of butter and a handful of grated pecorino, and rest off the heat for {{3 min}}.",
      tip: "Resting lets the starch set into a silky, risotto-like body.",
      plate: { emoji: "🧀", kind: "clay" },
    },
    {
      text: "Finish with torn basil, a squeeze of lemon, and a final drizzle of oil. Plate and serve warm.",
      tip: "Taste for salt one last time before it hits the table.",
      plate: { emoji: "🌿", kind: "sage" },
    },
  ];

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };

  /* ---------- Toast ---------- */
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Build markup ---------- */
  var timeline = $("#timeline");
  var timers = []; // one entry per step: { remaining, intervalId, seconds } | null

  function parseInstruction(raw) {
    // returns { html, minutes|null }
    var minutes = null;
    var html = raw.replace(/\{\{\s*(\d+)\s*min\s*\}\}/g, function (_, m) {
      minutes = parseInt(m, 10);
      return '<span class="hl">' + m + " min</span>";
    });
    return { html: html, minutes: minutes };
  }

  function fmt(total) {
    var m = Math.floor(total / 60);
    var s = total % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  STEPS.forEach(function (step, i) {
    var parsed = parseInstruction(step.text);

    var li = document.createElement("li");
    li.className = "step";
    li.dataset.index = String(i);

    var badge = document.createElement("div");
    badge.className = "badge";
    badge.setAttribute("aria-hidden", "true");
    badge.innerHTML =
      '<span class="num">' + (i + 1) + '</span><span class="check">✓</span>';

    var body = document.createElement("div");
    body.className = "step-body";

    var p = document.createElement("p");
    p.className = "step-text";
    p.innerHTML = parsed.html;
    body.appendChild(p);

    if (step.plate) {
      var plate = document.createElement("div");
      plate.className = "plate plate-" + step.plate.kind;
      plate.setAttribute("role", "img");
      plate.setAttribute("aria-label", "Illustrative dish photo");
      plate.innerHTML =
        '<span class="plate-emoji" aria-hidden="true">' +
        step.plate.emoji +
        "</span>";
      body.appendChild(plate);
    }

    if (step.tip) {
      var tip = document.createElement("p");
      tip.className = "tip";
      tip.innerHTML =
        '<span class="tip-emoji" aria-hidden="true">💡</span><span><b>Tip&nbsp;</b>' +
        step.tip +
        "</span>";
      body.appendChild(tip);
    }

    var actions = document.createElement("div");
    actions.className = "step-actions";

    var doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.className = "btn btn-done";
    doneBtn.textContent = "Mark done";
    doneBtn.addEventListener("click", function () {
      toggleDone(i);
    });
    actions.appendChild(doneBtn);

    if (parsed.minutes !== null) {
      var seconds = parsed.minutes * 60;
      timers[i] = { remaining: seconds, seconds: seconds, intervalId: null };

      var timerBtn = document.createElement("button");
      timerBtn.type = "button";
      timerBtn.className = "btn btn-timer";
      timerBtn.setAttribute("aria-live", "polite");
      timerBtn.innerHTML =
        '<span aria-hidden="true">⏱️</span> Start <span class="timer-clock">' +
        fmt(seconds) +
        "</span>";
      timerBtn.addEventListener("click", function () {
        toggleTimer(i, timerBtn, parsed.minutes);
      });
      actions.appendChild(timerBtn);
    } else {
      timers[i] = null;
      var hint = document.createElement("span");
      hint.className = "timer-hint";
      hint.textContent = "No timer for this step";
      actions.appendChild(hint);
    }

    body.appendChild(actions);
    li.appendChild(badge);
    li.appendChild(body);
    timeline.appendChild(li);
  });

  /* ---------- Done logic ---------- */
  function toggleDone(i) {
    var li = timeline.querySelector('.step[data-index="' + i + '"]');
    var doneBtn = li.querySelector(".btn-done");
    var isDone = li.classList.toggle("done");
    doneBtn.textContent = isDone ? "Undo" : "Mark done";

    if (isDone) {
      // stop any running timer on a completed step
      stopTimer(i);
    }
    updateProgress();
  }

  /* ---------- Timer logic ---------- */
  function toggleTimer(i, btn, minutes) {
    var t = timers[i];
    if (!t) return;

    if (t.intervalId) {
      stopTimer(i);
      return;
    }

    btn.classList.add("running");
    tickLabel(i, btn);
    t.intervalId = setInterval(function () {
      t.remaining -= 1;
      if (t.remaining <= 0) {
        t.remaining = 0;
        tickLabel(i, btn);
        stopTimer(i);
        ding(i, btn);
        return;
      }
      tickLabel(i, btn);
    }, 1000);
    toast("Step " + (i + 1) + " timer started — " + minutes + ":00");
  }

  function stopTimer(i) {
    var t = timers[i];
    if (!t || !t.intervalId) return;
    clearInterval(t.intervalId);
    t.intervalId = null;
    var li = timeline.querySelector('.step[data-index="' + i + '"]');
    var btn = li && li.querySelector(".btn-timer");
    if (btn) {
      btn.classList.remove("running");
      tickLabel(i, btn);
    }
  }

  function tickLabel(i, btn) {
    var t = timers[i];
    var clock = '<span class="timer-clock">' + fmt(t.remaining) + "</span>";
    var label;
    if (t.intervalId) {
      label = "Pause " + clock;
    } else if (t.remaining === 0) {
      label = "Done " + clock;
    } else if (t.remaining < t.seconds) {
      label = "Resume " + clock;
    } else {
      label = "Start " + clock;
    }
    btn.innerHTML = '<span aria-hidden="true">⏱️</span> ' + label;
  }

  function ding(i, btn) {
    toast("⏰ Step " + (i + 1) + " timer is up!");
    btn.classList.add("running");
    var flashes = 0;
    var flash = setInterval(function () {
      btn.classList.toggle("running");
      flashes += 1;
      if (flashes >= 6) {
        clearInterval(flash);
        btn.classList.remove("running");
      }
    }, 320);
  }

  /* ---------- Progress + rail fill ---------- */
  var progressFill = $("#progress-fill");
  var progressText = $("#progress-text");
  var finishCard = $("#finish-card");
  var total = STEPS.length;

  function updateProgress() {
    var doneCount = timeline.querySelectorAll(".step.done").length;
    var pct = total ? Math.round((doneCount / total) * 100) : 0;
    progressFill.style.width = pct + "%";
    timeline.style.setProperty("--rail-fill", pct + "%");
    progressText.textContent = doneCount + " of " + total + " steps done";
    finishCard.hidden = doneCount !== total;
    if (doneCount === total && total > 0) {
      toast("🍽️ Every step done — dinner is served!");
    }
  }

  /* ---------- Toolbar ---------- */
  $("#reset-all").addEventListener("click", function () {
    timeline.querySelectorAll(".step").forEach(function (li) {
      var i = parseInt(li.dataset.index, 10);
      li.classList.remove("done");
      var dBtn = li.querySelector(".btn-done");
      if (dBtn) dBtn.textContent = "Mark done";
      stopTimer(i);
      var t = timers[i];
      if (t) {
        t.remaining = t.seconds;
        var tBtn = li.querySelector(".btn-timer");
        if (tBtn) tickLabel(i, tBtn);
      }
    });
    updateProgress();
    toast("Timeline reset — back to step 1.");
  });

  $("#stop-timers").addEventListener("click", function () {
    var any = false;
    timers.forEach(function (t, i) {
      if (t && t.intervalId) {
        stopTimer(i);
        any = true;
      }
    });
    toast(any ? "All timers stopped." : "No timers were running.");
  });

  /* ---------- init ---------- */
  updateProgress();
})();
