(function () {
  "use strict";

  // ---------- Recipe data (fictional) ----------
  var STEPS = [
    {
      emoji: "🍅",
      title: "Char the tomatoes",
      text: "Halve 6 ripe Roma tomatoes, toss with olive oil and flaky salt, and blister cut-side down in a dry cast-iron pan over high heat until deeply browned.",
      hint: "~6 min",
      timer: { seconds: 360, label: "Blister tomatoes — flip at 4:00" }
    },
    {
      emoji: "🧄",
      title: "Bloom the saffron",
      text: "Crush a generous pinch of saffron threads and steep in 2 tbsp warm stock. Soften 3 sliced garlic cloves in the tomato fat until just golden and fragrant.",
      hint: "~3 min",
      timer: { seconds: 180, label: "Steep saffron & soften garlic" }
    },
    {
      emoji: "🍚",
      title: "Toast the orzo",
      text: "Add 300 g orzo to the pan and stir constantly until the edges turn nutty and amber. This builds a toasty backbone before any liquid goes in.",
      hint: "~2 min",
      timer: { seconds: 120, label: "Toast orzo to amber" }
    },
    {
      emoji: "🍋",
      title: "Simmer to creamy",
      text: "Pour in the saffron stock plus 700 ml hot vegetable broth, a ladle at a time. Stir often, scraping the charred tomato into the grains, until plump and creamy.",
      hint: "~12 min",
      timer: { seconds: 720, label: "Simmer until al dente" }
    },
    {
      emoji: "🌿",
      title: "Finish & fold",
      text: "Off the heat, fold in cold butter, lemon zest, torn basil and a fistful of grated pecorino. Loosen with a splash of broth so it ribbons off the spoon.",
      hint: "~2 min",
      timer: null
    },
    {
      emoji: "🥄",
      title: "Plate & rest",
      text: "Spoon into warm shallow bowls, top with the charred tomato halves and a crack of pepper. Rest one minute so the flavours settle, then serve.",
      hint: "~1 min",
      timer: { seconds: 60, label: "Rest before serving" }
    }
  ];

  var INGREDIENTS = [
    { qty: "6", name: "Roma tomatoes, halved" },
    { qty: "1 pinch", name: "Saffron threads" },
    { qty: "300 g", name: "Orzo pasta" },
    { qty: "3 cloves", name: "Garlic, sliced" },
    { qty: "700 ml", name: "Hot vegetable broth" },
    { qty: "30 g", name: "Cold butter" },
    { qty: "1", name: "Lemon, zested" },
    { qty: "1 handful", name: "Fresh basil" },
    { qty: "40 g", name: "Pecorino, grated" },
    { qty: "to taste", name: "Olive oil, salt, pepper" }
  ];

  // ---------- State ----------
  var current = 0;
  var seen = STEPS.map(function () { return false; });
  // independent timer state per step
  var timers = STEPS.map(function (s) {
    return s.timer
      ? { remaining: s.timer.seconds, total: s.timer.seconds, running: false, done: false, intervalId: null }
      : null;
  });

  // ---------- Elements ----------
  var $ = function (id) { return document.getElementById(id); };
  var stepNow = $("stepNow"), stepTotal = $("stepTotal"), stepTimeHint = $("stepTimeHint");
  var stepTitle = $("stepTitle"), stepText = $("stepText"), stepEmoji = $("stepEmoji");
  var progressBar = $("progressBar"), live = $("live"), dotsEl = $("dots");
  var prevBtn = $("prevBtn"), nextBtn = $("nextBtn");
  var timerWrap = $("timerWrap"), timerBox = $("timerBox"), timerToggle = $("timerToggle");
  var timerToggleLabel = $("timerToggleLabel"), timerDuration = $("timerDuration");
  var timerClock = $("timerClock"), timerReset = $("timerReset"), timerLabel = $("timerLabel");

  stepTotal.textContent = STEPS.length;

  // ---------- Toast ----------
  function toast(msg, kind) {
    var box = $("toasts");
    var el = document.createElement("div");
    el.className = "toast" + (kind === "done" ? " toast--done" : "");
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s ease";
      el.style.opacity = "0";
      setTimeout(function () { el.remove(); }, 300);
    }, 2800);
  }

  function announce(msg) { live.textContent = ""; setTimeout(function () { live.textContent = msg; }, 30); }

  function fmt(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  // ---------- Beep ----------
  function beep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      [0, 0.22, 0.44].forEach(function (offset) {
        var osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        osc.connect(gain); gain.connect(ctx.destination);
        var t = ctx.currentTime + offset;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        osc.start(t); osc.stop(t + 0.2);
      });
      setTimeout(function () { ctx.close(); }, 900);
    } catch (e) { /* no audio */ }
  }

  // ---------- Dots ----------
  STEPS.forEach(function (_, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Go to step " + (i + 1));
    b.addEventListener("click", function () { go(i); });
    li.appendChild(b);
    dotsEl.appendChild(li);
  });
  var dotBtns = dotsEl.querySelectorAll("button");

  // ---------- Ingredients ----------
  var ingList = $("ingList");
  INGREDIENTS.forEach(function (ing) {
    var li = document.createElement("li");
    li.innerHTML = '<span class="qty"></span><span class="nm"></span>';
    li.querySelector(".qty").textContent = ing.qty;
    li.querySelector(".nm").textContent = ing.name;
    li.setAttribute("role", "button");
    li.tabIndex = 0;
    function toggle() { li.classList.toggle("is-checked"); }
    li.addEventListener("click", toggle);
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
    ingList.appendChild(li);
  });

  // ---------- Timer rendering for current step ----------
  function paintTimer() {
    var t = timers[current];
    var def = STEPS[current].timer;
    if (!def) { timerWrap.hidden = true; return; }
    timerWrap.hidden = false;
    timerLabel.textContent = def.label;
    timerDuration.textContent = "· " + fmt(def.total);
    timerClock.textContent = fmt(t.remaining);
    timerBox.classList.toggle("is-running", t.running);
    timerBox.classList.toggle("is-done", t.done);
    timerReset.hidden = !(t.running || t.done || t.remaining !== t.total);
    timerToggleLabel.textContent = t.done ? "Done ✓" : (t.running ? "Pause" : (t.remaining === t.total ? "Start" : "Resume"));
  }

  function tick(idx) {
    var t = timers[idx];
    t.remaining -= 1;
    if (t.remaining <= 0) {
      t.remaining = 0;
      stopInterval(idx);
      t.running = false;
      t.done = true;
      beep();
      var msg = "⏲ Timer done — " + STEPS[idx].timer.label;
      toast(msg, "done");
      announce(msg);
    }
    if (idx === current) paintTimer();
  }

  function stopInterval(idx) {
    if (timers[idx].intervalId) { clearInterval(timers[idx].intervalId); timers[idx].intervalId = null; }
  }

  function startTimer(idx) {
    var t = timers[idx];
    if (t.done) return;
    t.running = true;
    stopInterval(idx);
    t.intervalId = setInterval(function () { tick(idx); }, 1000);
    if (idx === current) paintTimer();
    announce("Timer started: " + fmt(t.remaining) + " remaining");
  }

  function pauseTimer(idx) {
    var t = timers[idx];
    t.running = false;
    stopInterval(idx);
    if (idx === current) paintTimer();
    announce("Timer paused at " + fmt(t.remaining));
  }

  function resetTimer(idx) {
    var t = timers[idx];
    stopInterval(idx);
    t.remaining = t.total;
    t.running = false;
    t.done = false;
    if (idx === current) paintTimer();
  }

  timerToggle.addEventListener("click", function () {
    var t = timers[current];
    if (!t || t.done) return;
    if (t.running) pauseTimer(current); else startTimer(current);
  });
  timerReset.addEventListener("click", function () { resetTimer(current); });

  // ---------- Navigation ----------
  function render() {
    var s = STEPS[current];
    stepNow.textContent = current + 1;
    stepEmoji.textContent = s.emoji;
    stepTitle.textContent = s.title;
    stepText.textContent = s.text;
    stepTimeHint.textContent = s.hint;
    progressBar.style.width = (((current + 1) / STEPS.length) * 100) + "%";

    prevBtn.disabled = current === 0;
    nextBtn.textContent = "";
    if (current === STEPS.length - 1) {
      nextBtn.innerHTML = "Finish <span aria-hidden=\"true\">🎉</span>";
    } else {
      nextBtn.innerHTML = "Next <span aria-hidden=\"true\">→</span>";
    }

    dotBtns.forEach(function (b, i) {
      b.setAttribute("aria-current", i === current ? "true" : "false");
      b.classList.toggle("is-done", seen[i] && i !== current);
    });

    paintTimer();
  }

  function go(i) {
    if (i < 0 || i >= STEPS.length) return;
    seen[current] = true;
    current = i;
    seen[current] = true;
    render();
    announce("Step " + (current + 1) + " of " + STEPS.length + ": " + STEPS[current].title);
  }

  prevBtn.addEventListener("click", function () { go(current - 1); });
  nextBtn.addEventListener("click", function () {
    if (current === STEPS.length - 1) {
      toast("🎉 Recipe complete — buon appetito!", "done");
      announce("Recipe complete.");
    } else {
      go(current + 1);
    }
  });

  // ---------- Keyboard ----------
  document.addEventListener("keydown", function (e) {
    if ($("drawer").classList.contains("is-open")) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
    else if (e.key === " " && tag !== "button" && tag !== "li") {
      var t = timers[current];
      if (t && !t.done) { e.preventDefault(); if (t.running) pauseTimer(current); else startTimer(current); }
    }
  });

  // ---------- Drawer ----------
  var drawer = $("drawer"), scrim = $("scrim"), ingredientsBtn = $("ingredientsBtn"), drawerClose = $("drawerClose");
  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    ingredientsBtn.setAttribute("aria-expanded", "true");
    drawerClose.focus();
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    ingredientsBtn.setAttribute("aria-expanded", "false");
    ingredientsBtn.focus();
  }
  ingredientsBtn.addEventListener("click", openDrawer);
  drawerClose.addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });

  // ---------- Wake lock ----------
  var wakeText = $("wakeText"), wakeNote = $("wakeNote"), wakeLock = null;
  if ("wakeLock" in navigator) {
    navigator.wakeLock.request("screen").then(function (lock) {
      wakeLock = lock;
      wakeText.textContent = "Screen stays on";
      document.addEventListener("visibilitychange", function () {
        if (wakeLock !== null && document.visibilityState === "visible") {
          navigator.wakeLock.request("screen").then(function (l) { wakeLock = l; }).catch(function () {});
        }
      });
    }).catch(function () {
      wakeNote.classList.add("is-off");
      wakeText.textContent = "Keep screen awake manually";
    });
  } else {
    wakeNote.classList.add("is-off");
    wakeText.textContent = "Keep your screen awake";
  }

  // ---------- Init ----------
  seen[0] = true;
  render();
})();
