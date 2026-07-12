/* Coach — Exercise Library
   Searchable/filterable movement grid + detail modal. Vanilla JS only. */
(function () {
  "use strict";

  const GRADIENTS = {
    lime: "linear-gradient(135deg, #1f232c 0%, #2a3410 60%, #3f4d12 100%)",
    orange: "linear-gradient(135deg, #241118 0%, #3a1a10 60%, #4d2410 100%)",
    steel: "linear-gradient(135deg, #171a21 0%, #232a36 60%, #2c3a4d 100%)",
    violet: "linear-gradient(135deg, #1b1626 0%, #2a2140 60%, #3a2c55 100%)",
  };

  const EXERCISES = [
    {
      name: "Back Squat", glyph: "🏋️", grad: "lime", diff: "intermediate",
      muscle: "Legs", equip: "Barbell", rx: "4 × 6 reps",
      primary: ["Quadriceps", "Glutes"], secondary: ["Hamstrings", "Core"],
      summary: "The king of lower-body strength. Load the bar across your traps and drive through the floor with intent.",
      steps: ["Set the bar on your rear delts, hands just outside shoulders.", "Brace your core and unrack, taking two steps back.", "Sit down and back, knees tracking over toes.", "Descend until hip crease passes the knee.", "Drive through mid-foot and stand tall to lockout."],
    },
    {
      name: "Deadlift", glyph: "💪", grad: "orange", diff: "advanced",
      muscle: "Back", equip: "Barbell", rx: "5 × 3 reps",
      primary: ["Erectors", "Glutes"], secondary: ["Hamstrings", "Lats", "Traps"],
      summary: "A full-body hinge that builds raw pulling power from the floor.",
      steps: ["Stand mid-foot under the bar, shins an inch away.", "Hinge and grip just outside your knees.", "Set a flat back, chest proud, lats tight.", "Push the floor away and drag the bar up your legs.", "Lock out hips and knees together, then control down."],
    },
    {
      name: "Bench Press", glyph: "🛋️", grad: "steel", diff: "intermediate",
      muscle: "Chest", equip: "Barbell", rx: "4 × 8 reps",
      primary: ["Pectorals"], secondary: ["Triceps", "Front Delts"],
      summary: "The benchmark upper-body press for chest and pushing strength.",
      steps: ["Set feet flat, shoulder blades pinched and down.", "Grip slightly wider than shoulder width.", "Unrack and stack the bar over your shoulders.", "Lower to mid-chest with elbows at 45 degrees.", "Press up and slightly back to lockout."],
    },
    {
      name: "Pull-Up", glyph: "🧗", grad: "violet", diff: "advanced",
      muscle: "Back", equip: "Bodyweight", rx: "4 × AMRAP",
      primary: ["Lats"], secondary: ["Biceps", "Rear Delts", "Core"],
      summary: "The purest test of relative upper-body pulling strength.",
      steps: ["Grip the bar just outside shoulder width, palms away.", "Start from a full dead hang, shoulders active.", "Drive elbows down and pull chest toward the bar.", "Clear your chin over the bar at the top.", "Lower under control to a full hang."],
    },
    {
      name: "Overhead Press", glyph: "🙆", grad: "lime", diff: "intermediate",
      muscle: "Shoulders", equip: "Barbell", rx: "5 × 5 reps",
      primary: ["Deltoids"], secondary: ["Triceps", "Upper Chest", "Core"],
      summary: "A strict vertical press that builds bulletproof shoulders.",
      steps: ["Rack the bar on your front delts, grip shoulder width.", "Brace hard and squeeze your glutes.", "Press straight up, moving your head back slightly.", "Push through and shrug at lockout overhead.", "Lower under control back to the shelf."],
    },
    {
      name: "Kettlebell Swing", glyph: "🔔", grad: "orange", diff: "beginner",
      muscle: "Glutes", equip: "Kettlebell", rx: "5 × 15 reps",
      primary: ["Glutes", "Hamstrings"], secondary: ["Core", "Shoulders"],
      summary: "An explosive hip hinge for power, conditioning, and posterior chain.",
      steps: ["Stand tall with the bell a foot in front of you.", "Hinge and hike the bell back between your legs.", "Snap your hips forward to float the bell up.", "Let it rise to chest height on momentum only.", "Guide it back down and repeat the hinge."],
    },
    {
      name: "Dumbbell Row", glyph: "🚣", grad: "steel", diff: "beginner",
      muscle: "Back", equip: "Dumbbell", rx: "3 × 12 reps",
      primary: ["Lats", "Mid-Back"], secondary: ["Biceps", "Rear Delts"],
      summary: "A single-arm row that carves back thickness and fixes imbalances.",
      steps: ["Plant one knee and hand on a flat bench.", "Let the dumbbell hang with a long arm.", "Pull the bell to your hip, elbow tight.", "Squeeze your shoulder blade at the top.", "Lower slowly to a full stretch."],
    },
    {
      name: "Goblet Squat", glyph: "🥤", grad: "lime", diff: "beginner",
      muscle: "Legs", equip: "Kettlebell", rx: "3 × 12 reps",
      primary: ["Quadriceps"], secondary: ["Glutes", "Core"],
      summary: "A friendly loaded squat that grooves clean pattern and depth.",
      steps: ["Hold a bell at chest height, elbows tucked.", "Set feet shoulder width, toes slightly out.", "Sit straight down between your hips.", "Keep the chest tall and heels planted.", "Drive up and stand fully upright."],
    },
    {
      name: "Plank Hold", glyph: "🧱", grad: "violet", diff: "beginner",
      muscle: "Core", equip: "Bodyweight", rx: "3 × 45 sec",
      primary: ["Abdominals"], secondary: ["Glutes", "Shoulders"],
      summary: "An anti-extension hold that teaches full-body bracing.",
      steps: ["Set forearms under shoulders, elbows bent 90 degrees.", "Extend legs back, feet hip width apart.", "Squeeze glutes and brace your abs hard.", "Keep a straight line from head to heels.", "Breathe steadily and hold the position."],
    },
    {
      name: "Romanian Deadlift", glyph: "🦵", grad: "orange", diff: "intermediate",
      muscle: "Hamstrings", equip: "Barbell", rx: "4 × 8 reps",
      primary: ["Hamstrings", "Glutes"], secondary: ["Erectors"],
      summary: "A hip hinge with soft knees that lights up the hamstrings.",
      steps: ["Hold the bar at your hips, soft knees.", "Push your hips back and slide the bar down.", "Feel a stretch as the bar passes your knees.", "Keep the bar close and back flat.", "Drive hips forward to stand tall."],
    },
    {
      name: "Push-Up", glyph: "🤸", grad: "steel", diff: "beginner",
      muscle: "Chest", equip: "Bodyweight", rx: "3 × 15 reps",
      primary: ["Pectorals"], secondary: ["Triceps", "Core"],
      summary: "The everywhere press that builds a strong pushing base.",
      steps: ["Set hands just wider than shoulders.", "Form a straight plank from head to heels.", "Lower your chest to just above the floor.", "Keep elbows around 45 degrees to the torso.", "Press back up to full lockout."],
    },
    {
      name: "Cable Face Pull", glyph: "🪢", grad: "violet", diff: "beginner",
      muscle: "Shoulders", equip: "Cable", rx: "3 × 15 reps",
      primary: ["Rear Delts"], secondary: ["Traps", "Rotator Cuff"],
      summary: "A shoulder-health staple for posture and rear-delt detail.",
      steps: ["Set a rope at upper-chest height.", "Grip both ends with thumbs back.", "Pull the rope toward your forehead.", "Flare elbows high and squeeze the rear delts.", "Return slowly with control."],
    },
  ];

  // ---- State ----
  const state = { query: "", muscle: "All", equip: "All" };

  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const searchInput = document.getElementById("search");
  const clearSearch = document.getElementById("clearSearch");
  const resultCount = document.getElementById("resultCount");
  const muscleChips = document.getElementById("muscleChips");
  const equipChips = document.getElementById("equipChips");
  const modal = document.getElementById("modal");
  const toastEl = document.getElementById("toast");

  let lastFocused = null;
  let toastTimer = null;

  // ---- Toast ----
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("is-show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-show");
      setTimeout(() => (toastEl.hidden = true), 260);
    }, 2200);
  }

  // ---- Build filter chips ----
  function unique(key) {
    return ["All", ...Array.from(new Set(EXERCISES.map((e) => e[key]))).sort()];
  }

  function buildChips(container, values, group) {
    container.innerHTML = "";
    values.forEach((val) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = val;
      btn.setAttribute("aria-pressed", String(state[group] === val));
      btn.addEventListener("click", () => {
        state[group] = val;
        syncChips(container, group);
        render();
      });
      container.appendChild(btn);
    });
  }

  function syncChips(container, group) {
    container.querySelectorAll(".chip").forEach((c) => {
      c.setAttribute("aria-pressed", String(c.textContent === state[group]));
    });
  }

  // ---- Filtering ----
  function matches(ex) {
    const q = state.query.trim().toLowerCase();
    if (q && !(ex.name.toLowerCase().includes(q) || ex.muscle.toLowerCase().includes(q) || ex.equip.toLowerCase().includes(q))) {
      return false;
    }
    if (state.muscle !== "All" && ex.muscle !== state.muscle) return false;
    if (state.equip !== "All" && ex.equip !== state.equip) return false;
    return true;
  }

  // ---- Render grid ----
  function render() {
    const list = EXERCISES.filter(matches);
    grid.innerHTML = "";

    list.forEach((ex) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.setAttribute("role", "listitem");
      card.setAttribute("aria-label", ex.name + ", " + ex.diff + " " + ex.muscle + " movement");
      card.innerHTML =
        '<span class="card__thumb" style="background:' + GRADIENTS[ex.grad] + '">' +
          '<span class="card__diff" data-diff="' + ex.diff + '">' + ex.diff + "</span>" +
          '<span class="card__glyph">' + ex.glyph + "</span>" +
        "</span>" +
        '<span class="card__body">' +
          '<span class="card__name">' + ex.name + "</span>" +
          '<span class="card__primary">Targets <strong>' + ex.primary.join(", ") + "</strong></span>" +
          '<span class="card__tags">' +
            '<span class="tag">' + ex.muscle + "</span>" +
            '<span class="tag tag--equip">' + ex.equip + "</span>" +
          "</span>" +
        "</span>";
      card.addEventListener("click", () => openModal(ex, card));
      grid.appendChild(card);
    });

    const n = list.length;
    resultCount.textContent = n + (n === 1 ? " movement" : " movements");
    empty.hidden = n !== 0;
    grid.hidden = n === 0;
  }

  // ---- Modal ----
  function chipTags(container, values, secondary) {
    container.textContent = "";
    values.forEach((v, i) => {
      if (i) container.appendChild(document.createTextNode(", "));
      const span = document.createElement("strong");
      span.textContent = v;
      span.style.color = secondary ? "var(--muted)" : "var(--ink)";
      span.style.fontWeight = "600";
      container.appendChild(span);
    });
  }

  function openModal(ex, trigger) {
    lastFocused = trigger || document.activeElement;

    document.getElementById("modalThumb").style.background = GRADIENTS[ex.grad];
    document.getElementById("modalThumb").textContent = ex.glyph;
    document.getElementById("modalTitle").textContent = ex.name;
    document.getElementById("modalSummary").textContent = ex.summary;
    document.getElementById("modalRx").textContent = ex.rx;

    const badges = document.getElementById("modalBadges");
    badges.innerHTML =
      '<span class="tag tag--equip" style="color:var(--lime);border-color:var(--lime)">' + ex.muscle + "</span>" +
      '<span class="tag tag--equip">' + ex.equip + "</span>" +
      '<span class="card__diff" data-diff="' + ex.diff + '" style="position:static">' + ex.diff + "</span>";

    const steps = document.getElementById("modalSteps");
    steps.innerHTML = "";
    ex.steps.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      steps.appendChild(li);
    });

    chipTags(document.getElementById("modalPrimary"), ex.primary, false);
    chipTags(document.getElementById("modalSecondary"), ex.secondary, true);

    const addBtn = document.getElementById("addToPlan");
    addBtn.onclick = () => {
      toast(ex.name + " added to today's plan ⚡");
      closeModal();
    };

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal__close").focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      const focusables = modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));

  // ---- Search ----
  searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    clearSearch.hidden = !searchInput.value;
    render();
  });

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    state.query = "";
    clearSearch.hidden = true;
    searchInput.focus();
    render();
  });

  function resetAll() {
    state.query = "";
    state.muscle = "All";
    state.equip = "All";
    searchInput.value = "";
    clearSearch.hidden = true;
    syncChips(muscleChips, "muscle");
    syncChips(equipChips, "equip");
    render();
    toast("Library reset");
  }

  document.getElementById("resetFilters").addEventListener("click", resetAll);
  document.getElementById("emptyReset").addEventListener("click", resetAll);

  // ---- Init ----
  buildChips(muscleChips, unique("muscle"), "muscle");
  buildChips(equipChips, unique("equip"), "equip");
  render();
})();
