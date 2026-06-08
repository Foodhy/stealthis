// ---------------------------------------------------------------------------
// Ironpulse — Classes Overview
// Vanilla JS: render class grid, category filtering with fade reveal, toasts.
// ---------------------------------------------------------------------------

(function () {
  "use strict";

  /** Class catalog — fictional but realistic data. */
  const CLASSES = [
    {
      cat: "strength",
      label: "Strength",
      name: "Barbell Foundations",
      blurb: "Squat, hinge, press. Build raw force with progressive barbell work and clean technique.",
      duration: "60 min",
      intensity: 4,
      trainer: "Marcus Vega",
      role: "Head S&C Coach",
    },
    {
      cat: "strength",
      label: "Strength",
      name: "Iron Hour",
      blurb: "Hypertrophy-focused supersets across push, pull, and legs. Leave with a real pump.",
      duration: "55 min",
      intensity: 3,
      trainer: "Dana Okafor",
      role: "Strength Coach",
    },
    {
      cat: "cardio",
      label: "Cardio",
      name: "Tread & Shred",
      blurb: "Treadmill intervals mixed with floor circuits to torch calories and lift your engine.",
      duration: "45 min",
      intensity: 4,
      trainer: "Priya Anand",
      role: "Conditioning Coach",
    },
    {
      cat: "cardio",
      label: "Cardio",
      name: "Row Republic",
      blurb: "Low-impact, high-output rowing intervals. Big aerobic gains, easy on the joints.",
      duration: "40 min",
      intensity: 3,
      trainer: "Leo Marsh",
      role: "Endurance Coach",
    },
    {
      cat: "cycle",
      label: "Cycle",
      name: "Night Ride",
      blurb: "Beat-matched indoor cycling in the dark with neon visuals and relentless climbs.",
      duration: "45 min",
      intensity: 4,
      trainer: "Sofia Reyes",
      role: "Ride Captain",
    },
    {
      cat: "cycle",
      label: "Cycle",
      name: "Power Sprint",
      blurb: "Short, savage cycle sprints built around wattage targets and recovery blocks.",
      duration: "30 min",
      intensity: 5,
      trainer: "Sofia Reyes",
      role: "Ride Captain",
    },
    {
      cat: "yoga",
      label: "Yoga",
      name: "Flow & Restore",
      blurb: "A slow vinyasa flow into deep restorative holds. Reset your nervous system.",
      duration: "60 min",
      intensity: 2,
      trainer: "Hannah Lim",
      role: "Yoga Instructor",
    },
    {
      cat: "yoga",
      label: "Yoga",
      name: "Power Vinyasa",
      blurb: "Heated, breath-led flow that builds heat, balance, and serious core control.",
      duration: "55 min",
      intensity: 3,
      trainer: "Hannah Lim",
      role: "Yoga Instructor",
    },
    {
      cat: "hiit",
      label: "HIIT",
      name: "Engine Room",
      blurb: "Rowers, bikes, and barbell complexes in timed intervals. Featured 6-week series.",
      duration: "45 min",
      intensity: 5,
      trainer: "Marcus Vega",
      role: "Head S&C Coach",
    },
    {
      cat: "hiit",
      label: "HIIT",
      name: "Tabata 20",
      blurb: "Twenty minutes, eight rounds, zero excuses. Bodyweight intervals at max effort.",
      duration: "30 min",
      intensity: 5,
      trainer: "Priya Anand",
      role: "Conditioning Coach",
    },
    {
      cat: "mobility",
      label: "Mobility",
      name: "Joints & Jelly",
      blurb: "Controlled articular rotations and loaded stretching to bulletproof your joints.",
      duration: "40 min",
      intensity: 1,
      trainer: "Leo Marsh",
      role: "Endurance Coach",
    },
    {
      cat: "mobility",
      label: "Mobility",
      name: "Deep Reset",
      blurb: "Foam rolling, breathwork, and mobility drills to unwind after a heavy training week.",
      duration: "35 min",
      intensity: 2,
      trainer: "Dana Okafor",
      role: "Strength Coach",
    },
  ];

  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const countEl = document.querySelector("[data-count]");
  const filterBtns = Array.from(document.querySelectorAll(".filter"));
  const toastEl = document.getElementById("toast");

  let activeFilter = "all";
  let toastTimer = null;

  /** Initials for the trainer avatar. */
  function initials(name) {
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  /** Build the intensity meter (5 bars). */
  function intensityBars(level) {
    let bars = "";
    for (let i = 1; i <= 5; i++) {
      bars += `<span class="intensity__bar${i <= level ? " on" : ""}"></span>`;
    }
    return bars;
  }

  /** Render one card element from a class record. */
  function makeCard(c) {
    const el = document.createElement("article");
    el.className = "card";
    el.dataset.cat = c.cat;
    el.innerHTML = `
      <div class="card__header h-${c.cat}">
        <span class="card__cat">${c.label}</span>
        <span class="card__time">${c.duration}</span>
      </div>
      <div class="card__body">
        <h3 class="card__name">${c.name}</h3>
        <p class="card__blurb">${c.blurb}</p>
        <div class="intensity">
          <div class="intensity__label">
            <span>Intensity</span><span>${c.intensity}/5</span>
          </div>
          <div class="intensity__bars" role="img" aria-label="Intensity ${c.intensity} out of 5">
            ${intensityBars(c.intensity)}
          </div>
        </div>
        <div class="card__foot">
          <div class="trainer">
            <span class="trainer__avatar" aria-hidden="true">${initials(c.trainer)}</span>
            <span>
              <span class="trainer__name">${c.trainer}</span><br />
              <span class="trainer__role">${c.role}</span>
            </span>
          </div>
          <button class="card__link" data-schedule="${c.name}">
            See schedule <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>`;
    return el;
  }

  /** Initial render of all cards. */
  function render() {
    const frag = document.createDocumentFragment();
    CLASSES.forEach((c) => frag.appendChild(makeCard(c)));
    grid.appendChild(frag);
  }

  /** Apply the active filter with a staggered fade-in reveal. */
  function applyFilter(filter) {
    activeFilter = filter;
    const cards = Array.from(grid.children);
    let shown = 0;
    let stagger = 0;

    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.cat === filter;
      if (match) {
        shown++;
        card.classList.remove("is-hidden");
        card.classList.add("is-enter");
        // stagger the reveal for a smooth cascade
        const delay = stagger;
        stagger += 45;
        requestAnimationFrame(() => {
          card.style.transitionDelay = delay + "ms";
          requestAnimationFrame(() => {
            card.classList.remove("is-enter");
            card.classList.add("is-in");
          });
        });
        // clear the delay after the reveal so hover stays snappy
        window.setTimeout(() => {
          card.style.transitionDelay = "";
        }, delay + 400);
      } else {
        card.classList.add("is-hidden");
        card.classList.remove("is-enter", "is-in");
      }
    });

    empty.hidden = shown > 0;
    updateCount(shown);
  }

  function updateCount(n) {
    const word = n === 1 ? "class" : "classes";
    const scope = activeFilter === "all" ? "all" : activeFilter;
    countEl.textContent = `${n} ${word} · ${scope}`;
  }

  function setActiveButton(btn) {
    filterBtns.forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  /** Lightweight toast helper. */
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2600);
  }

  // ----- Wire up events -----
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveButton(btn);
      applyFilter(btn.dataset.filter);
    });
  });

  // Delegated clicks for "See schedule" + booking CTAs.
  document.addEventListener("click", (e) => {
    const schedule = e.target.closest("[data-schedule]");
    if (schedule) {
      toast(`Opening the schedule for “${schedule.dataset.schedule}”…`);
      return;
    }
    const book = e.target.closest("[data-book]");
    if (book) {
      toast(`Nice — we saved you a ${book.dataset.book}. Check your email!`);
    }
  });

  // ----- Boot -----
  render();
  applyFilter("all");
})();
