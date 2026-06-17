(function () {
  "use strict";

  /* ===== Quiz data (fictional) ===== */
  const QUESTIONS = [
    {
      type: "single",
      text: "Which keyword declares a variable that cannot be reassigned?",
      points: 1,
      options: ["var", "let", "const", "static"],
      correct: [2],
      explain: "`const` creates a binding that cannot be reassigned. Note its value can still be mutated if it's an object.",
    },
    {
      type: "multi",
      text: "Select all values that are falsy in JavaScript.",
      points: 2,
      options: ["0", '"0"', "null", "NaN", "[]"],
      correct: [0, 2, 3],
      explain: 'The falsy values include `0`, `null`, and `NaN`. The string "0" and an empty array `[]` are both truthy.',
    },
    {
      type: "boolean",
      text: "`typeof null` returns the string \"object\".",
      points: 1,
      options: ["True", "False"],
      correct: [0],
      explain: "Correct — this is a long-standing quirk of JavaScript. `typeof null` evaluates to \"object\".",
    },
    {
      type: "single",
      text: "What does Array.prototype.map() return?",
      points: 1,
      options: [
        "The original array, mutated in place",
        "A new array of transformed values",
        "The number of elements processed",
        "undefined",
      ],
      correct: [1],
      explain: "`map()` returns a brand new array containing the results of calling the callback on every element. It never mutates the source.",
    },
    {
      type: "multi",
      text: "Which of these are valid ways to create a Promise that resolves immediately?",
      points: 2,
      options: [
        "Promise.resolve(42)",
        "new Promise(r => r(42))",
        "Promise.now(42)",
        "async () => 42",
      ],
      correct: [0, 1],
      explain: "`Promise.resolve()` and `new Promise(executor)` both produce promises. `Promise.now` is not a real method, and an async arrow is a function, not a promise.",
    },
  ];

  const TOTAL = QUESTIONS.length;
  const TIME_LIMIT = 10 * 60; // seconds

  /* ===== State ===== */
  const state = {
    current: 0,
    answers: QUESTIONS.map(() => []), // arrays of selected indices
    flagged: QUESTIONS.map(() => false),
    submitted: false,
    timeLeft: TIME_LIMIT,
  };

  /* ===== Elements ===== */
  const el = {
    card: document.getElementById("questionCard"),
    qnav: document.getElementById("qnav"),
    progressFill: document.getElementById("progressFill"),
    progressBar: document.getElementById("progressBar"),
    progressLabel: document.getElementById("progressLabel"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    flagBtn: document.getElementById("flagBtn"),
    flagLabel: document.getElementById("flagLabel"),
    timerText: document.getElementById("timerText"),
    timerPill: document.getElementById("timerPill"),
    submitBar: document.getElementById("submitBar"),
    submitBtn: document.getElementById("submitBtn"),
    submitHint: document.getElementById("submitHint"),
    scoreScreen: document.getElementById("scoreScreen"),
    quizBody: document.querySelector(".quiz-body"),
    quizHead: document.querySelector(".quiz-head"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalBody: document.getElementById("modalBody"),
    modalCancel: document.getElementById("modalCancel"),
    modalConfirm: document.getElementById("modalConfirm"),
    toastWrap: document.getElementById("toastWrap"),
  };

  const CHECK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const TYPE_LABEL = {
    single: "Multiple choice",
    multi: "Multi-select",
    boolean: "True / false",
  };

  /* ===== Toast helper ===== */
  let toastTimer;
  function toast(msg, kind) {
    const t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.textContent = msg;
    el.toastWrap.appendChild(t);
    setTimeout(() => {
      t.style.transition = "opacity .3s, transform .3s";
      t.style.opacity = "0";
      t.style.transform = "translateY(8px)";
      setTimeout(() => t.remove(), 300);
    }, 2200);
  }

  /* ===== Render navigator ===== */
  function buildNav() {
    el.qnav.innerHTML = "";
    QUESTIONS.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "qdot";
      b.type = "button";
      b.textContent = i + 1;
      b.setAttribute("aria-label", "Go to question " + (i + 1));
      b.addEventListener("click", () => goTo(i));
      el.qnav.appendChild(b);
    });
  }

  function refreshNav() {
    [...el.qnav.children].forEach((b, i) => {
      b.classList.toggle("current", i === state.current);
      b.classList.toggle("answered", state.answers[i].length > 0);
      b.classList.toggle("flagged", state.flagged[i]);
    });
  }

  /* ===== Render question ===== */
  function renderQuestion() {
    const i = state.current;
    const q = QUESTIONS[i];
    const sel = state.answers[i];
    const multi = q.type === "multi";

    let html = "";
    html += '<div class="q-meta">';
    html += '<span class="q-index">Question ' + (i + 1) + " of " + TOTAL + "</span>";
    html += '<span class="q-type">' + TYPE_LABEL[q.type] + "</span>";
    html += '<span class="q-points">' + q.points + (q.points > 1 ? " points" : " point") + "</span>";
    html += "</div>";
    html += '<p class="q-text">' + escapeHtml(q.text) + "</p>";
    if (multi) html += '<p class="multi-hint">Select all that apply.</p>';

    html += '<ul class="options" role="' + (multi ? "group" : "radiogroup") + '">';
    q.options.forEach((opt, oi) => {
      const isSel = sel.indexOf(oi) !== -1;
      const markCls = multi ? "check" : "radio";
      html +=
        '<li class="option' + (isSel ? " selected" : "") +
        '" tabindex="0" role="' + (multi ? "checkbox" : "radio") +
        '" aria-checked="' + isSel + '" data-opt="' + oi + '">' +
        '<span class="opt-mark ' + markCls + '">' + CHECK_SVG + "</span>" +
        '<span class="opt-text">' + escapeHtml(opt) + "</span>" +
        "</li>";
    });
    html += "</ul>";

    el.card.innerHTML = html;

    el.card.querySelectorAll(".option").forEach((node) => {
      node.addEventListener("click", () => selectOption(parseInt(node.dataset.opt, 10)));
      node.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          selectOption(parseInt(node.dataset.opt, 10));
        }
      });
    });

    // controls
    el.prevBtn.disabled = i === 0;
    el.nextBtn.disabled = i === TOTAL - 1;
    el.flagBtn.setAttribute("aria-pressed", String(state.flagged[i]));
    el.flagLabel.textContent = state.flagged[i] ? "Flagged" : "Flag for review";

    refreshNav();
    refreshProgress();
  }

  function selectOption(oi) {
    if (state.submitted) return;
    const q = QUESTIONS[state.current];
    const sel = state.answers[state.current];
    if (q.type === "multi") {
      const idx = sel.indexOf(oi);
      if (idx === -1) sel.push(oi);
      else sel.splice(idx, 1);
    } else {
      state.answers[state.current] = [oi];
    }
    renderQuestion();
  }

  /* ===== Progress ===== */
  function answeredCount() {
    return state.answers.filter((a) => a.length > 0).length;
  }
  function refreshProgress() {
    const done = answeredCount();
    const pct = Math.round((done / TOTAL) * 100);
    el.progressFill.style.width = pct + "%";
    el.progressBar.setAttribute("aria-valuenow", String(pct));
    el.progressLabel.textContent = done + " of " + TOTAL + " answered";
    if (done === TOTAL) {
      el.submitHint.textContent = "All questions answered — ready to submit.";
    } else {
      el.submitHint.textContent = TOTAL - done + " question" + (TOTAL - done > 1 ? "s" : "") + " left.";
    }
  }

  /* ===== Navigation ===== */
  function goTo(i) {
    if (state.submitted) return;
    state.current = Math.max(0, Math.min(TOTAL - 1, i));
    renderQuestion();
  }

  el.prevBtn.addEventListener("click", () => goTo(state.current - 1));
  el.nextBtn.addEventListener("click", () => goTo(state.current + 1));
  el.flagBtn.addEventListener("click", () => {
    if (state.submitted) return;
    state.flagged[state.current] = !state.flagged[state.current];
    const on = state.flagged[state.current];
    el.flagBtn.setAttribute("aria-pressed", String(on));
    el.flagLabel.textContent = on ? "Flagged" : "Flag for review";
    refreshNav();
    toast(on ? "Flagged for review" : "Flag removed", on ? "warn" : null);
  });

  // keyboard arrows
  document.addEventListener("keydown", (e) => {
    if (state.submitted || el.modalOverlay.hidden === false) return;
    if (e.key === "ArrowRight") goTo(state.current + 1);
    if (e.key === "ArrowLeft") goTo(state.current - 1);
  });

  /* ===== Timer ===== */
  let timerId;
  function startTimer() {
    updateTimer();
    timerId = setInterval(() => {
      state.timeLeft--;
      updateTimer();
      if (state.timeLeft <= 0) {
        clearInterval(timerId);
        toast("Time is up — submitting your answers", "warn");
        doSubmit();
      } else if (state.timeLeft === 60) {
        toast("1 minute remaining", "warn");
      }
    }, 1000);
  }
  function updateTimer() {
    const m = Math.floor(state.timeLeft / 60);
    const s = state.timeLeft % 60;
    el.timerText.textContent = m + ":" + String(s).padStart(2, "0");
    el.timerPill.classList.toggle("warn", state.timeLeft <= 60);
  }

  /* ===== Submit flow ===== */
  el.submitBtn.addEventListener("click", () => {
    const unanswered = TOTAL - answeredCount();
    if (unanswered > 0) {
      el.modalBody.textContent =
        "You have " + unanswered + " unanswered question" + (unanswered > 1 ? "s" : "") +
        ". You can review them before submitting.";
      openModal();
    } else {
      el.modalBody.textContent = "All questions are answered. Submit your final score?";
      openModal();
    }
  });
  el.modalCancel.addEventListener("click", closeModal);
  el.modalConfirm.addEventListener("click", () => {
    closeModal();
    doSubmit();
  });
  el.modalOverlay.addEventListener("click", (e) => {
    if (e.target === el.modalOverlay) closeModal();
  });
  function openModal() {
    el.modalOverlay.hidden = false;
    el.modalConfirm.focus();
  }
  function closeModal() {
    el.modalOverlay.hidden = true;
  }

  function arraysEqualAsSets(a, b) {
    if (a.length !== b.length) return false;
    const sa = [...a].sort();
    const sb = [...b].sort();
    return sa.every((v, i) => v === sb[i]);
  }

  function doSubmit() {
    if (state.submitted) return;
    state.submitted = true;
    clearInterval(timerId);

    let correctCount = 0,
      wrongCount = 0,
      skipCount = 0,
      earned = 0,
      totalPoints = 0;

    QUESTIONS.forEach((q, i) => {
      totalPoints += q.points;
      const ans = state.answers[i];
      if (ans.length === 0) {
        skipCount++;
      } else if (arraysEqualAsSets(ans, q.correct)) {
        correctCount++;
        earned += q.points;
      } else {
        wrongCount++;
      }
    });

    const pct = Math.round((earned / totalPoints) * 100);
    showScore({ pct, earned, totalPoints, correctCount, wrongCount, skipCount });
  }

  /* ===== Score screen ===== */
  function showScore(r) {
    el.quizHead.style.display = "none";
    el.quizBody.style.display = "none";
    el.submitBar.style.display = "none";
    el.scoreScreen.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const pass = r.pct >= 70;
    const ringFg = document.getElementById("ringFg");
    const circ = 2 * Math.PI * 52;
    document.getElementById("ringPct").textContent = r.pct + "%";
    document.getElementById("scoreVerdict").textContent = pass ? "Assessment passed" : "Almost there";
    document.getElementById("scoreLine").textContent = pass
      ? "Nice work, Priya — you've cleared the Module 4 checkpoint."
      : "You need 70% to pass. Review the explanations and retake the quiz.";

    ringFg.style.stroke = pass ? "var(--accent)" : "var(--amber)";
    requestAnimationFrame(() => {
      ringFg.style.strokeDashoffset = String(circ * (1 - r.pct / 100));
    });

    document.getElementById("scoreStats").innerHTML =
      stat("good", r.correctCount, "Correct") +
      stat("bad", r.wrongCount, "Incorrect") +
      stat("skip", r.skipCount, "Skipped") +
      stat("", r.earned + "/" + r.totalPoints, "Points");

    buildReview();
    toast(pass ? "Passed with " + r.pct + "%" : "Scored " + r.pct + "%", pass ? "ok" : "warn");
  }

  function stat(cls, value, label) {
    return '<div class="stat ' + cls + '"><b>' + value + "</b><span>" + label + "</span></div>";
  }

  function buildReview() {
    const list = document.getElementById("reviewList");
    list.innerHTML = "";
    QUESTIONS.forEach((q, i) => {
      const ans = state.answers[i];
      let status;
      if (ans.length === 0) status = "unanswered";
      else if (arraysEqualAsSets(ans, q.correct)) status = "correct";
      else status = "wrong";

      const li = document.createElement("li");
      li.className = "review-item " + status;

      const statusLabel = { correct: "Correct", wrong: "Incorrect", unanswered: "Skipped" }[status];

      const yourText =
        ans.length === 0
          ? "No answer"
          : ans.map((oi) => q.options[oi]).join(", ");
      const rightText = q.correct.map((oi) => q.options[oi]).join(", ");

      let inner = "";
      inner += '<div class="ri-head">';
      inner += '<span class="ri-q">Q' + (i + 1) + "</span>";
      inner += '<span class="ri-status ' + status + '">' + statusLabel + "</span>";
      inner += "</div>";
      inner += '<p class="ri-text">' + escapeHtml(q.text) + "</p>";
      inner += '<div class="ri-answers">';
      inner +=
        '<div class="ri-row your' + (status === "wrong" ? " is-wrong" : "") + '">' +
        '<span class="tag">Your answer</span><span>' + escapeHtml(yourText) + "</span></div>";
      if (status !== "correct") {
        inner +=
          '<div class="ri-row right"><span class="tag">Correct</span><span>' +
          escapeHtml(rightText) + "</span></div>";
      }
      inner += "</div>";
      inner += '<p class="ri-explain">' + escapeHtml(q.explain) + "</p>";

      li.innerHTML = inner;
      list.appendChild(li);
    });
  }

  /* ===== Restart / continue ===== */
  document.getElementById("restartBtn").addEventListener("click", () => {
    state.current = 0;
    state.answers = QUESTIONS.map(() => []);
    state.flagged = QUESTIONS.map(() => false);
    state.submitted = false;
    state.timeLeft = TIME_LIMIT;

    el.scoreScreen.hidden = true;
    el.quizHead.style.display = "";
    el.quizBody.style.display = "";
    el.submitBar.style.display = "";
    document.getElementById("ringFg").style.strokeDashoffset = String(2 * Math.PI * 52);
    window.scrollTo({ top: 0, behavior: "smooth" });

    renderQuestion();
    startTimer();
    toast("Quiz reset — good luck!");
  });
  document.getElementById("continueBtn").addEventListener("click", () => {
    toast("Returning to course…", "ok");
  });

  /* ===== Utils ===== */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  /* ===== Init ===== */
  buildNav();
  renderQuestion();
  startTimer();
})();
