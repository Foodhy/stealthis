(function () {
  "use strict";

  /* ---------- Seed data (fictional Push Day A) ---------- */
  const workout = [
    {
      name: "Back Squat",
      meta: "Barbell · Legs · 3 min rest",
      rest: 180,
      sets: [
        { weight: 100, reps: 5, done: false },
        { weight: 100, reps: 5, done: false },
        { weight: 100, reps: 5, done: false },
      ],
    },
    {
      name: "Bench Press",
      meta: "Barbell · Chest · 2 min rest",
      rest: 120,
      sets: [
        { weight: 80, reps: 8, done: false },
        { weight: 80, reps: 8, done: false },
        { weight: 75, reps: 10, done: false },
      ],
    },
    {
      name: "Deadlift",
      meta: "Barbell · Posterior · 3 min rest",
      rest: 180,
      sets: [
        { weight: 140, reps: 3, done: false },
        { weight: 140, reps: 3, done: false },
      ],
    },
    {
      name: "Overhead Press",
      meta: "Barbell · Shoulders · 90s rest",
      rest: 90,
      sets: [
        { weight: 45, reps: 8, done: false },
        { weight: 45, reps: 8, done: false },
      ],
    },
  ];

  /* ---------- Toast helper ---------- */
  const toastHost = document.getElementById("toastHost");
  function toast(msg, opts) {
    opts = opts || {};
    const el = document.createElement("div");
    el.className = "toast" + (opts.summary ? " summary" : "");
    el.innerHTML = msg;
    toastHost.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    const life = opts.life || 3200;
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, life);
  }

  /* ---------- Render exercises ---------- */
  const root = document.getElementById("exercises");
  const tpl = document.getElementById("exTpl");

  function render() {
    root.innerHTML = "";
    workout.forEach((ex, ei) => {
      const node = tpl.content.cloneNode(true);
      const card = node.querySelector(".ex-card");
      card.dataset.ex = ei;
      node.querySelector(".ex-index").textContent = ei + 1;
      node.querySelector(".ex-name").textContent = ex.name;
      node.querySelector(".ex-meta").textContent = ex.meta;
      node.querySelector(".rest-secs").textContent = ex.rest;
      node.querySelector(".rest-set").dataset.secs = ex.rest;

      const rows = node.querySelector(".set-rows");
      ex.sets.forEach((set, si) => rows.appendChild(buildRow(ei, si, set)));

      updateCard(card, ex);
      root.appendChild(node);

      // re-grab the live card (appendChild moves the fragment children)
      const live = root.querySelector('.ex-card[data-ex="' + ei + '"]');
      updateCard(live, ex);
    });
    recalc();
  }

  function buildRow(ei, si, set) {
    const row = document.createElement("div");
    row.className = "set-row" + (set.done ? " done" : "");
    row.dataset.ex = ei;
    row.dataset.set = si;
    row.innerHTML =
      '<span class="set-num">' + (si + 1) + "</span>" +
      '<input type="number" inputmode="decimal" min="0" step="2.5" class="in-weight" value="' + set.weight + '" aria-label="Weight in kilograms" />' +
      '<input type="number" inputmode="numeric" min="0" step="1" class="in-reps" value="' + set.reps + '" aria-label="Repetitions" />' +
      '<button class="check" aria-label="Mark set ' + (si + 1) + ' done" aria-pressed="' + set.done + '">✓</button>';
    return row;
  }

  function updateCard(card, ex) {
    const done = ex.sets.filter((s) => s.done).length;
    card.querySelector(".ex-badge").textContent = done + "/" + ex.sets.length;
    card.classList.toggle("complete", done === ex.sets.length && ex.sets.length > 0);
  }

  /* ---------- Event delegation ---------- */
  root.addEventListener("click", (e) => {
    const card = e.target.closest(".ex-card");
    if (!card) return;
    const ei = +card.dataset.ex;
    const ex = workout[ei];

    if (e.target.classList.contains("check")) {
      const row = e.target.closest(".set-row");
      const si = +row.dataset.set;
      ex.sets[si].done = !ex.sets[si].done;
      row.classList.toggle("done", ex.sets[si].done);
      e.target.setAttribute("aria-pressed", String(ex.sets[si].done));
      updateCard(card, ex);
      recalc();
      if (ex.sets[si].done) startTimer(ex.rest, true);
      return;
    }

    if (e.target.classList.contains("add-set")) {
      const last = ex.sets[ex.sets.length - 1] || { weight: 20, reps: 8 };
      ex.sets.push({ weight: last.weight, reps: last.reps, done: false });
      const rows = card.querySelector(".set-rows");
      rows.appendChild(buildRow(ei, ex.sets.length - 1, ex.sets[ex.sets.length - 1]));
      updateCard(card, ex);
      recalc();
      toast("Added set to <b>" + ex.name + "</b>");
      return;
    }

    if (e.target.classList.contains("rest-set")) {
      startTimer(+e.target.dataset.secs, true);
      return;
    }
  });

  root.addEventListener("input", (e) => {
    const row = e.target.closest(".set-row");
    if (!row) return;
    const ei = +row.dataset.ex;
    const si = +row.dataset.set;
    const set = workout[ei].sets[si];
    if (e.target.classList.contains("in-weight")) set.weight = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains("in-reps")) set.reps = parseInt(e.target.value, 10) || 0;
    recalc();
  });

  /* ---------- Running totals ---------- */
  const elTotalVolume = document.getElementById("totalVolume");
  const elSetsDone = document.getElementById("setsDone");
  const elSetsTotal = document.getElementById("setsTotal");
  const elExDone = document.getElementById("exDone");
  const elExTotal = document.getElementById("exTotal");

  function totals() {
    let volume = 0, setsDone = 0, setsTotal = 0, exDone = 0;
    workout.forEach((ex) => {
      let allDone = ex.sets.length > 0;
      ex.sets.forEach((s) => {
        setsTotal++;
        if (s.done) {
          setsDone++;
          volume += s.weight * s.reps;
        } else {
          allDone = false;
        }
      });
      if (allDone) exDone++;
    });
    return { volume, setsDone, setsTotal, exDone, exTotal: workout.length };
  }

  function recalc() {
    const t = totals();
    elTotalVolume.textContent = t.volume.toLocaleString();
    elSetsDone.textContent = t.setsDone;
    elSetsTotal.textContent = t.setsTotal;
    elExDone.textContent = t.exDone;
    elExTotal.textContent = t.exTotal;
  }

  /* ---------- Rest timer ---------- */
  const display = document.getElementById("timerDisplay");
  const bar = document.getElementById("timerBar");
  const card = document.getElementById("timerCard");
  const startBtn = document.getElementById("timerStart");
  const resetBtn = document.getElementById("timerReset");
  const chips = Array.from(document.querySelectorAll(".chip"));

  let total = 120;        // selected preset
  let remaining = 120;    // seconds left
  let running = false;
  let endAt = 0;
  let raf = null;

  function fmt(s) {
    s = Math.max(0, Math.ceil(s));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }

  function paintTimer() {
    display.textContent = fmt(remaining);
    bar.style.width = total > 0 ? (Math.max(0, remaining) / total) * 100 + "%" : "0%";
  }

  function tick() {
    remaining = (endAt - Date.now()) / 1000;
    if (remaining <= 0) {
      remaining = 0;
      paintTimer();
      finishTimer();
      return;
    }
    paintTimer();
    raf = requestAnimationFrame(tick);
  }

  function setStartLabel() {
    if (running) {
      startBtn.textContent = "Pause";
      startBtn.classList.add("btn-paused");
      startBtn.classList.remove("btn-neon");
    } else {
      startBtn.textContent = remaining < total && remaining > 0 ? "Resume" : "Start";
      startBtn.classList.add("btn-neon");
      startBtn.classList.remove("btn-paused");
    }
  }

  function startTimer(secs, fresh) {
    card.classList.remove("alarm");
    display.classList.remove("flash");
    if (typeof secs === "number" && fresh) {
      total = secs;
      remaining = secs;
      selectChip(secs);
    }
    if (remaining <= 0) remaining = total;
    endAt = Date.now() + remaining * 1000;
    running = true;
    display.classList.add("running");
    setStartLabel();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function pauseTimer() {
    running = false;
    cancelAnimationFrame(raf);
    display.classList.remove("running");
    setStartLabel();
  }

  function resetTimer() {
    pauseTimer();
    remaining = total;
    card.classList.remove("alarm");
    display.classList.remove("flash");
    paintTimer();
    setStartLabel();
  }

  function finishTimer() {
    running = false;
    cancelAnimationFrame(raf);
    display.classList.remove("running");
    // beep-free visual flash
    card.classList.add("alarm");
    display.classList.remove("flash");
    void display.offsetWidth; // restart animation
    display.classList.add("flash");
    setStartLabel();
    toast("Rest done — back to work! 💪");
  }

  function selectChip(secs) {
    chips.forEach((c) => c.classList.toggle("active", +c.dataset.secs === secs));
  }

  startBtn.addEventListener("click", () => {
    if (running) pauseTimer();
    else startTimer();
  });
  resetBtn.addEventListener("click", resetTimer);
  chips.forEach((c) =>
    c.addEventListener("click", () => startTimer(+c.dataset.secs, true))
  );

  selectChip(120);
  paintTimer();
  setStartLabel();

  /* ---------- Elapsed workout clock ---------- */
  const elElapsed = document.getElementById("elapsed");
  const workoutStart = Date.now();
  function tickElapsed() {
    const s = Math.floor((Date.now() - workoutStart) / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    elElapsed.textContent =
      (h > 0 ? String(h) + ":" + String(m).padStart(2, "0") : String(m).padStart(2, "0")) +
      ":" + String(r).padStart(2, "0");
  }
  tickElapsed();
  setInterval(tickElapsed, 1000);

  /* ---------- Finish workout ---------- */
  document.getElementById("finishBtn").addEventListener("click", () => {
    const t = totals();
    const elapsed = elElapsed.textContent;
    if (t.setsDone === 0) {
      toast("Log at least one set before finishing.", { life: 2600 });
      return;
    }
    toast(
      "🏁 <b>Workout complete!</b>" +
        '<span class="toast-line">' +
        t.setsDone + " sets · " + t.volume.toLocaleString() + " kg volume · " +
        t.exDone + "/" + t.exTotal + " exercises · " + elapsed + " elapsed" +
        "</span>",
      { summary: true, life: 6000 }
    );
  });

  /* ---------- Boot ---------- */
  render();
})();
