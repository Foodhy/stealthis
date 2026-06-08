(() => {
  "use strict";

  /* ---------- Data ---------- */
  const TIMES = ["06:00", "07:30", "09:00", "12:00", "17:30", "18:45", "20:00"];
  const ROOMS = ["Studio A", "Studio B", "The Box", "Spin Loft", "Mind Room"];

  // type → intensity helper colors handled in CSS
  // Each class: {day(0=Mon..6=Sun), time, name, type, trainer, room, intensity, capacity}
  const RAW = [
    { day: 0, time: "06:00", name: "HIIT Burn", type: "Cardio", trainer: "Dana Reyes", room: "The Box", intensity: "high", capacity: 18 },
    { day: 0, time: "09:00", name: "Vinyasa Flow", type: "Yoga", trainer: "Mira Okafor", room: "Mind Room", intensity: "low", capacity: 22 },
    { day: 0, time: "17:30", name: "Spin45", type: "Cycle", trainer: "Leo Banks", room: "Spin Loft", intensity: "mid", capacity: 26 },
    { day: 0, time: "18:45", name: "Power Lift", type: "Strength", trainer: "Sam Cho", room: "Studio A", intensity: "high", capacity: 14 },

    { day: 1, time: "07:30", name: "Kettlebell Strong", type: "Strength", trainer: "Sam Cho", room: "Studio A", intensity: "mid", capacity: 16 },
    { day: 1, time: "12:00", name: "Express Core", type: "Cardio", trainer: "Dana Reyes", room: "Studio B", intensity: "mid", capacity: 20 },
    { day: 1, time: "18:45", name: "Restorative Yoga", type: "Yoga", trainer: "Mira Okafor", room: "Mind Room", intensity: "low", capacity: 22 },
    { day: 1, time: "20:00", name: "Night Ride", type: "Cycle", trainer: "Priya Nair", room: "Spin Loft", intensity: "high", capacity: 26 },

    { day: 2, time: "06:00", name: "Sunrise Spin", type: "Cycle", trainer: "Leo Banks", room: "Spin Loft", intensity: "mid", capacity: 26 },
    { day: 2, time: "09:00", name: "Mobility Mat", type: "Yoga", trainer: "Mira Okafor", room: "Mind Room", intensity: "low", capacity: 18 },
    { day: 2, time: "17:30", name: "Tabata Torch", type: "Cardio", trainer: "Dana Reyes", room: "The Box", intensity: "high", capacity: 18 },
    { day: 2, time: "18:45", name: "Deadlift Club", type: "Strength", trainer: "Sam Cho", room: "Studio A", intensity: "high", capacity: 12 },

    { day: 3, time: "07:30", name: "Boxing Cardio", type: "Cardio", trainer: "Marcus Hale", room: "The Box", intensity: "high", capacity: 18 },
    { day: 3, time: "12:00", name: "Lunch Flow", type: "Yoga", trainer: "Mira Okafor", room: "Mind Room", intensity: "low", capacity: 20 },
    { day: 3, time: "18:45", name: "Spin45", type: "Cycle", trainer: "Priya Nair", room: "Spin Loft", intensity: "mid", capacity: 26 },
    { day: 3, time: "20:00", name: "Functional Strength", type: "Strength", trainer: "Sam Cho", room: "Studio B", intensity: "mid", capacity: 16 },

    { day: 4, time: "06:00", name: "HIIT Burn", type: "Cardio", trainer: "Dana Reyes", room: "The Box", intensity: "high", capacity: 18 },
    { day: 4, time: "09:00", name: "Power Vinyasa", type: "Yoga", trainer: "Mira Okafor", room: "Mind Room", intensity: "mid", capacity: 22 },
    { day: 4, time: "17:30", name: "Friday Ride", type: "Cycle", trainer: "Leo Banks", room: "Spin Loft", intensity: "high", capacity: 26 },
    { day: 4, time: "18:45", name: "Total Body Lift", type: "Strength", trainer: "Sam Cho", room: "Studio A", intensity: "high", capacity: 14 },

    { day: 5, time: "09:00", name: "Weekend Warrior", type: "Strength", trainer: "Marcus Hale", room: "Studio A", intensity: "high", capacity: 16 },
    { day: 5, time: "12:00", name: "Spin & Sweat", type: "Cycle", trainer: "Priya Nair", room: "Spin Loft", intensity: "mid", capacity: 26 },
    { day: 5, time: "17:30", name: "Sunset Flow", type: "Yoga", trainer: "Mira Okafor", room: "Mind Room", intensity: "low", capacity: 24 },

    { day: 6, time: "09:00", name: "Recovery Stretch", type: "Yoga", trainer: "Mira Okafor", room: "Mind Room", intensity: "low", capacity: 24 },
    { day: 6, time: "12:00", name: "Steady Spin", type: "Cycle", trainer: "Leo Banks", room: "Spin Loft", intensity: "low", capacity: 26 },
  ];

  // Deterministic-ish booked count per class so spots feel real
  const classes = RAW.map((c, i) => {
    const taken = Math.min(c.capacity, Math.round(((i * 7 + 11) % c.capacity) * 0.82) + 2);
    return {
      id: "c" + i,
      ...c,
      booked: Math.min(taken, c.capacity),
      mine: false,
    };
  });

  const INTENSITY_LABEL = { low: "Low", mid: "Moderate", high: "High" };
  const TYPE_COLORVAR = { Strength: "--c-strength", Cardio: "--c-cardio", Yoga: "--c-yoga", Cycle: "--c-cycle" };

  /* ---------- State ---------- */
  let activeFilter = "all";
  let weekOffset = 0;          // 0 = current week
  let selectedId = null;

  /* ---------- DOM ---------- */
  const grid = document.getElementById("grid");
  const weekRange = document.getElementById("weekRange");
  const overlay = document.getElementById("overlay");
  const panel = document.getElementById("panel");
  const panelBody = document.getElementById("panelBody");
  const toastHost = document.getElementById("toastHost");
  let lastFocused = null;

  /* ---------- Date helpers ---------- */
  function mondayOf(offset) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const dow = (d.getDay() + 6) % 7; // 0 = Mon
    d.setDate(d.getDate() - dow + offset * 7);
    return d;
  }
  function todayDayIndex() {
    return (new Date().getDay() + 6) % 7;
  }
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ---------- Render headers ---------- */
  function renderHeaders() {
    const mon = mondayOf(weekOffset);
    const heads = grid.querySelectorAll(".dayhead");
    const isCurrentWeek = weekOffset === 0;
    const todayIdx = todayDayIndex();

    heads.forEach((h, i) => {
      const d = new Date(mon);
      d.setDate(d.getDate() + i);
      h.querySelector(".d-date").textContent = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
      h.classList.toggle("is-today", isCurrentWeek && i === todayIdx);
    });

    const last = new Date(mon); last.setDate(last.getDate() + 6);
    if (isCurrentWeek) {
      weekRange.textContent = "This Week";
    } else if (weekOffset === 1) {
      weekRange.textContent = "Next Week";
    } else if (weekOffset === -1) {
      weekRange.textContent = "Last Week";
    } else {
      weekRange.textContent = `${MONTHS[mon.getMonth()]} ${mon.getDate()} – ${MONTHS[last.getMonth()]} ${last.getDate()}`;
    }
  }

  /* ---------- Render grid body ---------- */
  function spotsLeft(c) { return c.capacity - c.booked; }

  function blockHTML(c) {
    const left = spotsLeft(c);
    const spotCls = left === 0 ? "is-full" : left <= 3 ? "is-low" : "";
    const spotTxt = left === 0 ? "Full" : `${left} spot${left === 1 ? "" : "s"} left`;
    const dimCls = activeFilter !== "all" && c.type !== activeFilter ? "dim" : "";
    const selCls = c.id === selectedId ? "is-selected" : "";
    const bookedCls = c.mine ? "is-booked" : "";
    return `<button class="block ${dimCls} ${selCls} ${bookedCls}" data-type="${c.type}" data-id="${c.id}" type="button"
        aria-label="${c.name} with ${c.trainer} at ${c.time}, ${spotTxt}">
        <p class="b-name">${c.name}</p>
        <p class="b-meta">${c.time} · ${c.trainer.split(" ")[0]}</p>
        <div class="b-foot">
          <span class="b-int int-${c.intensity}">${INTENSITY_LABEL[c.intensity]}</span>
          <span class="b-spots ${spotCls}">${spotTxt}</span>
        </div>
      </button>`;
  }

  function renderGrid() {
    // remove existing rows (everything after the 8 header cells)
    const headerCount = 8;
    while (grid.children.length > headerCount) grid.removeChild(grid.lastChild);

    const todayIdx = todayDayIndex();
    const highlightCol = weekOffset === 0;

    TIMES.forEach((time) => {
      const tc = document.createElement("div");
      tc.className = "timecell";
      tc.textContent = time;
      grid.appendChild(tc);

      for (let day = 0; day < 7; day++) {
        const slot = document.createElement("div");
        slot.className = "slot" + (highlightCol && day === todayIdx ? " is-today-col" : "");
        slot.setAttribute("role", "gridcell");
        const match = classes.find((c) => c.day === day && c.time === time);
        if (match) slot.innerHTML = blockHTML(match);
        grid.appendChild(slot);
      }
    });
  }

  /* ---------- Detail panel ---------- */
  function openPanel(c) {
    selectedId = c.id;
    const colorVar = TYPE_COLORVAR[c.type];
    const left = spotsLeft(c);
    const pct = Math.round((c.booked / c.capacity) * 100);
    const fillCls = left === 0 ? "is-full" : left <= 3 ? "is-low" : "";

    const bookLabel = c.mine ? "✓ Booked — Tap to cancel" : left === 0 ? "Class Full" : "Book This Class";
    const bookCls = c.mine ? "is-booked" : "";
    const bookDisabled = left === 0 && !c.mine ? "disabled" : "";

    panelBody.innerHTML = `
      <span class="pn-type" style="color:var(${colorVar});background:color-mix(in srgb, var(${colorVar}) 14%, transparent)">
        <span class="dot" style="background:var(${colorVar})"></span>${c.type}
      </span>
      <h2 class="pn-title">${c.name}</h2>
      <p class="pn-sub">with ${c.trainer}</p>

      <div class="pn-rows">
        <div class="pn-row"><span class="pn-k">Time</span><span class="pn-v">${c.time} – ${addMins(c.time, c.intensity === "low" ? 60 : 45)}</span></div>
        <div class="pn-row"><span class="pn-k">Room</span><span class="pn-v">${c.room}</span></div>
        <div class="pn-row"><span class="pn-k">Intensity</span><span class="pn-v"><span class="b-int int-${c.intensity}">${INTENSITY_LABEL[c.intensity]}</span></span></div>
        <div class="pn-row"><span class="pn-k">Capacity</span><span class="pn-v">${c.booked}/${c.capacity}</span></div>
      </div>

      <div class="pn-spots-bar" aria-hidden="true">
        <div class="pn-spots-fill ${fillCls}" style="width:${pct}%"></div>
      </div>

      <p class="pn-desc">${describe(c)}</p>

      <button class="pn-book ${bookCls}" id="bookBtn" type="button" ${bookDisabled}>${bookLabel}</button>
    `;

    const bookBtn = document.getElementById("bookBtn");
    if (bookBtn) bookBtn.addEventListener("click", () => toggleBooking(c));

    lastFocused = document.activeElement;
    overlay.hidden = false;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    panel.focus();
    renderGrid(); // refresh selection highlight
  }

  function closePanel() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    selectedId = null;
    renderGrid();
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function toggleBooking(c) {
    if (!c.mine && spotsLeft(c) === 0) return;
    if (c.mine) {
      c.mine = false;
      c.booked = Math.max(0, c.booked - 1);
      toast(`Cancelled · ${c.name}`);
    } else {
      c.mine = true;
      c.booked = Math.min(c.capacity, c.booked + 1);
      toast(`Booked · ${c.name} @ ${c.time}`);
    }
    openPanel(c); // re-render panel + grid
  }

  function addMins(hhmm, mins) {
    const [h, m] = hhmm.split(":").map(Number);
    const total = h * 60 + m + mins;
    const nh = Math.floor(total / 60) % 24;
    const nm = total % 60;
    return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
  }

  function describe(c) {
    const map = {
      Strength: `A coach-led ${c.intensity === "high" ? "heavy" : "progressive"} strength session focused on compound lifts and controlled tempo. Bring a towel and water.`,
      Cardio: `High-output conditioning built around intervals to spike your heart rate and torch calories. Scalable for all levels.`,
      Yoga: `A breath-guided ${c.intensity === "low" ? "grounding" : "dynamic"} practice to build mobility, balance and recovery. Mats provided.`,
      Cycle: `Beat-driven indoor ride with climbs, sprints and recovery flats. Cycling shoes available to borrow at the desk.`,
    };
    return map[c.type];
  }

  /* ---------- Toast ---------- */
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(() => {
      el.classList.add("toast-out");
      el.addEventListener("animationend", () => el.remove());
    }, 2400);
  }

  /* ---------- Filters ---------- */
  function setFilter(type) {
    activeFilter = type;
    document.querySelectorAll(".chip").forEach((chip) => {
      const active = chip.dataset.type === type;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    renderGrid();
  }

  /* ---------- Events ---------- */
  document.getElementById("chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) setFilter(chip.dataset.type);
  });

  grid.addEventListener("click", (e) => {
    const block = e.target.closest(".block");
    if (!block) return;
    const c = classes.find((x) => x.id === block.dataset.id);
    if (c) openPanel(c);
  });

  document.getElementById("prevWeek").addEventListener("click", () => { weekOffset--; renderHeaders(); renderGrid(); });
  document.getElementById("nextWeek").addEventListener("click", () => { weekOffset++; renderHeaders(); renderGrid(); });
  document.getElementById("todayBtn").addEventListener("click", () => {
    weekOffset = 0; renderHeaders(); renderGrid(); toast("Jumped to this week");
  });

  document.getElementById("panelClose").addEventListener("click", closePanel);
  overlay.addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) closePanel();
  });

  /* ---------- Init ---------- */
  renderHeaders();
  renderGrid();
})();
