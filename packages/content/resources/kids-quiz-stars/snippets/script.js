/* ============================================================
   Storybook — Star-reward Quiz
   Vanilla JS, no libs. Fictional, kid-friendly content.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Inline SVG picture answers ---------- */
  const ART = {
    sun: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><circle cx="32" cy="32" r="14" fill="#ffd23f"/><g stroke="#ff8a3d" stroke-width="4" stroke-linecap="round">${rays()}</g></svg>`,
    moon: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M44 32a18 18 0 1 1-18-18 14 14 0 0 0 18 18z" fill="#cdb8ff"/><circle cx="30" cy="24" r="2.5" fill="#a98ff0"/><circle cx="38" cy="36" r="2" fill="#a98ff0"/></svg>`,
    frog: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><ellipse cx="32" cy="42" rx="20" ry="16" fill="#7bd389"/><circle cx="22" cy="22" r="8" fill="#7bd389"/><circle cx="42" cy="22" r="8" fill="#7bd389"/><circle cx="22" cy="21" r="4" fill="#fff"/><circle cx="42" cy="21" r="4" fill="#fff"/><circle cx="23" cy="22" r="2" fill="#2c2350"/><circle cx="41" cy="22" r="2" fill="#2c2350"/><path d="M22 44 Q32 50 42 44" stroke="#2c2350" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
    cat: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M18 18l6 10h16l6-10-3 14a14 14 0 0 1-28 0z" fill="#ff8a3d"/><circle cx="32" cy="36" r="14" fill="#ffb066"/><circle cx="26" cy="34" r="2.4" fill="#2c2350"/><circle cx="38" cy="34" r="2.4" fill="#2c2350"/><path d="M30 40 l2 2 2-2" stroke="#2c2350" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M22 40h-8M22 43h-8M42 40h8M42 43h8" stroke="#2c2350" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    star: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M32 8l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 25l16-2z" fill="#ffd23f" stroke="#ff8a3d" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    heart: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M32 52S10 38 10 24a11 11 0 0 1 22-3 11 11 0 0 1 22 3c0 14-22 28-22 28z" fill="#ff6f9c"/></svg>`,
    apple: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M32 18c-8-6-22-2-22 12 0 12 9 22 14 22 3 0 4-1.5 8-1.5s5 1.5 8 1.5c5 0 14-10 14-22 0-14-14-18-22-12z" fill="#ff5a5f"/><path d="M32 18c0-5 4-8 8-9" stroke="#7bd389" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    fish: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M14 32c8-12 26-12 34 0-8 12-26 12-34 0z" fill="#5ec5d6"/><path d="M48 24l10-6v28l-10-6z" fill="#3fa9bb"/><circle cx="24" cy="30" r="2.6" fill="#2c2350"/></svg>`,
    tree: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><rect x="29" y="36" width="6" height="18" rx="2" fill="#b07a45"/><circle cx="32" cy="26" r="16" fill="#7bd389"/><circle cx="22" cy="32" r="9" fill="#8fdc9b"/><circle cx="42" cy="32" r="9" fill="#67c47a"/></svg>`,
    rainbow: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><g fill="none" stroke-width="5" stroke-linecap="round"><path d="M10 48a22 22 0 0 1 44 0" stroke="#ff6f9c"/><path d="M16 48a16 16 0 0 1 32 0" stroke="#ffd23f"/><path d="M22 48a10 10 0 0 1 20 0" stroke="#5ec5d6"/></g></svg>`,
    cloud: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><ellipse cx="26" cy="36" rx="14" ry="11" fill="#e6f3fb"/><circle cx="38" cy="30" r="12" fill="#e6f3fb"/><circle cx="44" cy="38" r="9" fill="#e6f3fb"/></svg>`,
    boat: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M14 40h36l-6 12H20z" fill="#ff8a3d"/><path d="M32 12v26M32 12l14 14H32z" fill="#5ec5d6" stroke="#3fa9bb" stroke-width="2" stroke-linejoin="round"/></svg>`,
  };

  function rays() {
    let out = "";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const x1 = 32 + Math.cos(a) * 20;
      const y1 = 32 + Math.sin(a) * 20;
      const x2 = 32 + Math.cos(a) * 28;
      const y2 = 32 + Math.sin(a) * 28;
      out += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }
    return out;
  }

  /* ---------- Fictional storybook quiz data ---------- */
  const QUESTIONS = [
    {
      q: "Pip the firefly only glows at night. What does Pip wait for in the sky?",
      options: [
        { art: "moon", label: "The moon", correct: true },
        { art: "sun", label: "The sun", correct: false },
        { art: "cloud", label: "A cloud", correct: false },
        { art: "rainbow", label: "A rainbow", correct: false },
      ],
    },
    {
      q: "In Mossy Pond, who can hop the very highest of all?",
      options: [
        { art: "fish", label: "The fish", correct: false },
        { art: "frog", label: "The frog", correct: true },
        { art: "boat", label: "The boat", correct: false },
        { art: "tree", label: "The tree", correct: false },
      ],
    },
    {
      q: "Whiskers the cat picked one snack from the orchard. Which one?",
      options: [
        { art: "star", label: "A star", correct: false },
        { art: "heart", label: "A heart", correct: false },
        { art: "apple", label: "An apple", correct: true },
        { art: "cloud", label: "A cloud", correct: false },
      ],
    },
    {
      q: "After the rainstorm passed, what shone over Bramble Wood?",
      options: [
        { art: "rainbow", label: "A rainbow", correct: true },
        { art: "moon", label: "The moon", correct: false },
        { art: "fish", label: "A fish", correct: false },
        { art: "cat", label: "A cat", correct: false },
      ],
    },
    {
      q: "Little Tug sailed across the bay. Which one is Little Tug?",
      options: [
        { art: "tree", label: "The tree", correct: false },
        { art: "apple", label: "The apple", correct: false },
        { art: "boat", label: "The boat", correct: true },
        { art: "sun", label: "The sun", correct: false },
      ],
    },
  ];

  const CHEERS = ["Great job! ⭐", "You got it! 🎉", "Brilliant! 🌟", "Wonderful! 💫", "Hooray! 🥳"];
  const TRYS = ["Almost! Try again 💛", "Good guess — try once more!", "So close! Tap another card", "Keep going, you can do it!"];

  /* ---------- DOM refs ---------- */
  const $ = (id) => document.getElementById(id);
  const playView = $("play-view");
  const resultView = $("result-view");
  const optionsEl = $("options");
  const questionEl = $("question-text");
  const feedbackEl = $("feedback");
  const qNowEl = $("q-now");
  const qTotalEl = $("q-total");
  const progressFill = $("progress-fill");
  const progressbar = $("progressbar");
  const starCountEl = $("star-count");
  const meterSlots = Array.from(document.querySelectorAll(".meter__slot"));
  const meterTrack = $("meter-track");
  const mascot = $("mascot-bubble");
  const fxLayer = $("fx-layer");
  const toastEl = $("toast");
  const fontToggle = $("font-toggle");
  const soundToggle = $("sound-toggle");

  /* ---------- State ---------- */
  let current = 0; // current question index
  let stars = 0; // correct answers
  let locked = false; // prevents double-tap during transition
  let soundOn = true;
  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  qTotalEl.textContent = String(QUESTIONS.length);
  meterSlots.forEach((_, i) => {});

  /* ---------- Sound (tiny WebAudio beeps, no assets) ---------- */
  let audioCtx = null;
  function tone(freq, dur, type) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(audioCtx.destination);
      const t = audioCtx.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t);
      o.stop(t + dur);
    } catch (e) {
      /* audio not available — silent */
    }
  }
  function chime() {
    tone(660, 0.16, "triangle");
    setTimeout(() => tone(990, 0.22, "triangle"), 110);
  }
  function buzz() {
    tone(200, 0.18, "sine");
  }

  /* ---------- Toast helper ---------- */
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ---------- Render a question ---------- */
  function renderQuestion() {
    const data = QUESTIONS[current];
    locked = false;
    questionEl.textContent = data.q;
    qNowEl.textContent = String(current + 1);
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    optionsEl.innerHTML = "";

    data.options.forEach((opt, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.setAttribute("data-index", String(i));
      btn.setAttribute("aria-label", opt.label);
      btn.innerHTML = `<span class="option__art">${ART[opt.art] || ""}</span><span class="option__label">${opt.label}</span>`;
      btn.addEventListener("click", () => handleAnswer(btn, opt, data));
      li.appendChild(btn);
      optionsEl.appendChild(li);
    });

    updateProgress();
  }

  function updateProgress() {
    const pct = (current / QUESTIONS.length) * 100;
    progressFill.style.width = pct + "%";
    progressbar.setAttribute("aria-valuenow", String(current));
  }

  /* ---------- Handle an answer ---------- */
  function handleAnswer(btn, opt, data) {
    if (locked) return;

    if (opt.correct) {
      locked = true;
      btn.classList.add("is-correct");
      btn.setAttribute("aria-pressed", "true");
      mascot.classList.remove("oops");
      mascot.classList.add("cheer");
      feedbackEl.textContent = CHEERS[current % CHEERS.length];
      feedbackEl.className = "feedback good";
      chime();

      // disable all option buttons
      optionsEl.querySelectorAll("button").forEach((b) => (b.disabled = true));

      // reward animations
      flyStarToMeter(btn);
      burstConfetti();

      stars++;
      starCountEl.textContent = String(stars);

      setTimeout(() => {
        fillNextStar(); // pop the star into the meter
      }, prefersReduce ? 0 : 520);

      setTimeout(() => {
        mascot.classList.remove("cheer");
        current++;
        if (current >= QUESTIONS.length) {
          showResult();
        } else {
          renderQuestion();
        }
      }, prefersReduce ? 350 : 1250);
    } else {
      // gentle, no harsh fail
      btn.classList.remove("is-wrong");
      // reflow so animation can replay
      void btn.offsetWidth;
      btn.classList.add("is-wrong");
      mascot.classList.remove("cheer");
      mascot.classList.add("oops");
      feedbackEl.textContent = TRYS[Math.floor(Math.random() * TRYS.length)];
      feedbackEl.className = "feedback try";
      buzz();
      setTimeout(() => {
        btn.classList.remove("is-wrong");
        mascot.classList.remove("oops");
      }, 650);
    }
  }

  /* ---------- Star meter fill ---------- */
  function fillNextStar() {
    const slot = meterSlots[stars - 1];
    if (slot) {
      slot.textContent = "★";
      slot.classList.add("filled");
    }
    const label = `Star meter, ${stars} of ${QUESTIONS.length} stars earned`;
    meterTrack.setAttribute("aria-label", label);
  }

  /* ---------- Flying star animation ---------- */
  function flyStarToMeter(fromEl) {
    if (prefersReduce) return;
    const targetSlot = meterSlots[stars] || meterSlots[meterSlots.length - 1];
    const from = fromEl.getBoundingClientRect();
    const to = targetSlot.getBoundingClientRect();

    const star = document.createElement("span");
    star.className = "fly-star";
    star.textContent = "★";
    const startX = from.left + from.width / 2 - 15;
    const startY = from.top + from.height / 2 - 15;
    star.style.left = startX + "px";
    star.style.top = startY + "px";
    fxLayer.appendChild(star);

    const dx = to.left + to.width / 2 - 15 - startX;
    const dy = to.top + to.height / 2 - 15 - startY;

    const anim = star.animate(
      [
        { transform: "translate(0,0) scale(0.4) rotate(0deg)", opacity: 0 },
        { transform: "translate(" + dx * 0.5 + "px," + (dy * 0.5 - 40) + "px) scale(1.5) rotate(180deg)", opacity: 1, offset: 0.5 },
        { transform: "translate(" + dx + "px," + dy + "px) scale(0.8) rotate(360deg)", opacity: 0.9 },
      ],
      { duration: 700, easing: "cubic-bezier(0.34, 1.2, 0.64, 1)", fill: "forwards" }
    );
    anim.onfinish = () => star.remove();
  }

  /* ---------- Confetti ---------- */
  function burstConfetti() {
    if (prefersReduce) return;
    const colors = ["#ff8a3d", "#5ec5d6", "#ffd23f", "#ff6f9c", "#7bd389"];
    const count = 26;
    for (let i = 0; i < count; i++) {
      const c = document.createElement("span");
      c.className = "confetti";
      c.style.left = 30 + Math.random() * 40 + "%";
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      c.style.animationDelay = Math.random() * 0.25 + "s";
      const w = 8 + Math.random() * 8;
      c.style.width = w + "px";
      c.style.height = w * (0.6 + Math.random() * 0.8) + "px";
      if (Math.random() > 0.5) c.style.borderRadius = "50%";
      fxLayer.appendChild(c);
      setTimeout(() => c.remove(), 3400);
    }
  }

  /* ---------- Result screen ---------- */
  function showResult() {
    progressFill.style.width = "100%";
    progressbar.setAttribute("aria-valuenow", String(QUESTIONS.length));
    playView.hidden = true;
    resultView.hidden = false;

    const total = QUESTIONS.length;
    $("result-total").textContent = String(total);
    $("result-score").textContent = String(stars);

    let title, line;
    if (stars === total) {
      title = "Super Star Explorer! 🌟";
      line = "You found every answer in the storybook. Amazing!";
    } else if (stars >= Math.ceil(total / 2)) {
      title = "Wonderful work! 🎉";
      line = "You gathered lots of stars. Great reading!";
    } else {
      title = "Nice exploring! 💛";
      line = "Every star counts — come adventure again!";
    }
    $("result-title").textContent = title;
    $("result-line").textContent = line;

    // render the star row
    const row = $("result-stars");
    row.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const s = document.createElement("span");
      const earned = i < stars;
      s.className = "r-star" + (earned ? "" : " empty");
      s.textContent = earned ? "★" : "☆";
      if (earned && !prefersReduce) s.style.animationDelay = i * 0.12 + "s";
      row.appendChild(s);
    }

    if (stars > 0) {
      burstConfetti();
      if (!prefersReduce) setTimeout(burstConfetti, 400);
      chime();
    }
    resultView.scrollIntoView({ behavior: prefersReduce ? "auto" : "smooth", block: "nearest" });
    $("play-again").focus();
  }

  /* ---------- Play again ---------- */
  function resetQuiz() {
    current = 0;
    stars = 0;
    starCountEl.textContent = "0";
    meterSlots.forEach((s) => {
      s.textContent = "☆";
      s.classList.remove("filled");
    });
    meterTrack.setAttribute("aria-label", "Star meter, 0 of " + QUESTIONS.length + " stars earned");
    resultView.hidden = true;
    playView.hidden = false;
    renderQuestion();
    toast("New adventure! 🚀");
    questionEl.focus && questionEl.setAttribute("tabindex", "-1");
  }

  /* ---------- Toggles ---------- */
  fontToggle.addEventListener("click", () => {
    const on = document.body.classList.toggle("easy-read");
    fontToggle.setAttribute("aria-pressed", String(on));
    fontToggle.querySelector(".chip-btn__label").textContent = on ? "Easy-read on" : "Easy-read";
    toast(on ? "Easy-read text on 🔤" : "Standard text");
  });

  soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;
    soundToggle.setAttribute("aria-pressed", String(soundOn));
    soundToggle.querySelector(".chip-btn__icon").textContent = soundOn ? "🔊" : "🔇";
    soundToggle.querySelector(".chip-btn__label").textContent = soundOn ? "Sound on" : "Sound off";
    if (soundOn) chime();
    toast(soundOn ? "Sound on 🔊" : "Sound off 🔇");
  });

  $("play-again").addEventListener("click", resetQuiz);

  /* ---------- Boot ---------- */
  questionEl.setAttribute("tabindex", "-1");
  renderQuestion();
})();
