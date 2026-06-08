(() => {
  "use strict";

  /* ---------------- Data ---------------- */
  const SERVICES = [
    { id: "svc-cut", cat: "Hair", name: "Signature Cut & Style", desc: "Consultation, precision cut, blow-dry finish.", dur: 60, price: 85 },
    { id: "svc-blow", cat: "Hair", name: "Lumière Blowout", desc: "Wash, treatment mask and editorial styling.", dur: 45, price: 55 },
    { id: "svc-updo", cat: "Hair", name: "Occasion Updo", desc: "Sculpted styling for events and galleries.", dur: 75, price: 110 },
    { id: "svc-balayage", cat: "Color", name: "Hand-painted Balayage", desc: "Freehand lightening with gloss and toner.", dur: 165, price: 220 },
    { id: "svc-gloss", cat: "Color", name: "Glaze & Gloss", desc: "Shine-restoring demi-permanent refresh.", dur: 50, price: 75 },
    { id: "svc-root", cat: "Color", name: "Root Retouch", desc: "Seamless regrowth coverage, single process.", dur: 90, price: 95 },
    { id: "svc-mani", cat: "Nails", name: "Maison Manicure", desc: "Shaping, cuticle care and chrome finish.", dur: 45, price: 48 },
    { id: "svc-gel", cat: "Nails", name: "Gel Extensions", desc: "Custom-built tips with two-week wear.", dur: 90, price: 78 },
    { id: "svc-pedi", cat: "Spa", name: "Ritual Pedicure", desc: "Warm soak, exfoliation and pressure massage.", dur: 60, price: 65 },
    { id: "svc-facial", cat: "Spa", name: "Glow Facial", desc: "Double cleanse, mask and lymphatic massage.", dur: 75, price: 130 },
    { id: "svc-scalp", cat: "Spa", name: "Scalp Renewal", desc: "Detoxifying scrub and aromatic head massage.", dur: 40, price: 60 },
  ];

  const STYLISTS = [
    { id: "any", name: "Any available", spec: "We pair you with the soonest opening", rating: null, init: "✶", tint: null, cats: ["Hair", "Color", "Nails", "Spa"] },
    { id: "aria", name: "Aria Vance", spec: "Cutting & Editorial Color", rating: 4.9, init: "AV", tint: "linear-gradient(135deg,#c9a78f,#8c6d3f)", cats: ["Hair", "Color"] },
    { id: "noor", name: "Noor Halabi", spec: "Balayage & Blonding", rating: 4.8, init: "NH", tint: "linear-gradient(135deg,#b08d57,#5f4a2e)", cats: ["Color", "Hair"] },
    { id: "lena", name: "Lena Okafor", spec: "Nail Artistry", rating: 5.0, init: "LO", tint: "linear-gradient(135deg,#caa089,#9a6b50)", cats: ["Nails"] },
    { id: "mara", name: "Mara Sølv", spec: "Skin & Spa Rituals", rating: 4.9, init: "MS", tint: "linear-gradient(135deg,#a89178,#6e5a40)", cats: ["Spa"] },
    { id: "theo", name: "Theo Marchetti", spec: "Precision Barbering", rating: 4.7, init: "TM", tint: "linear-gradient(135deg,#9c8463,#5a4730)", cats: ["Hair"] },
  ];

  const SLOT_TIMES = ["9:30", "10:15", "11:00", "11:45", "13:00", "13:45", "14:30", "15:15", "16:00", "16:45", "17:30", "18:15"];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ---------------- State ---------------- */
  const state = {
    step: 1,
    service: null,
    stylist: null,
    cat: "all",
    day: null, // ISO date string
    slot: null,
  };

  /* ---------------- Helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = (n) => "$" + n;
  const fmtDur = (m) => {
    const h = Math.floor(m / 60), mm = m % 60;
    if (h && mm) return `${h}h ${mm}m`;
    if (h) return `${h}h`;
    return `${mm}m`;
  };

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3200);
  }

  /* ---------------- Render: services ---------------- */
  const serviceList = $("#serviceList");
  function renderServices() {
    const items = SERVICES.filter((s) => state.cat === "all" || s.cat === state.cat);
    serviceList.innerHTML = items
      .map(
        (s) => `
      <li>
        <button class="service ${state.service === s.id ? "is-selected" : ""}"
                data-svc="${s.id}" aria-pressed="${state.service === s.id}">
          <span class="service__cat">${s.cat}</span>
          <span class="service__body">
            <h3>${s.name}</h3>
            <p class="service__desc">${s.desc}</p>
          </span>
          <span class="service__meta">
            <span class="service__price">${money(s.price)}</span>
            <span class="service__dur">${fmtDur(s.dur)}</span>
          </span>
        </button>
      </li>`
      )
      .join("");
  }

  $("#serviceFilters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.cat = btn.dataset.cat;
    $$("#serviceFilters .chip").forEach((c) => {
      const on = c === btn;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", on);
    });
    renderServices();
  });

  serviceList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-svc]");
    if (!btn) return;
    state.service = btn.dataset.svc;
    // If chosen stylist can't do this category, reset stylist.
    const svc = SERVICES.find((s) => s.id === state.service);
    if (state.stylist) {
      const st = STYLISTS.find((s) => s.id === state.stylist);
      if (st && !st.cats.includes(svc.cat)) state.stylist = null;
    }
    renderServices();
    sync();
  });

  /* ---------------- Render: stylists ---------------- */
  const stylistGrid = $("#stylistGrid");
  function renderStylists() {
    const svc = SERVICES.find((s) => s.id === state.service);
    const list = STYLISTS.filter((s) => !svc || s.cats.includes(svc.cat));
    stylistGrid.innerHTML = list
      .map((s) => {
        const sel = state.stylist === s.id;
        const avatar = s.tint
          ? `style="background:${s.tint}"`
          : "";
        const rating =
          s.rating === null
            ? `<span class="stylist__rating muted">Flexible timing</span>`
            : `<span class="stylist__rating"><span class="star">★</span>${s.rating.toFixed(1)}</span>`;
        return `
        <li>
          <button class="stylist ${s.id === "any" ? "stylist--any" : ""} ${sel ? "is-selected" : ""}"
                  data-stylist="${s.id}" aria-pressed="${sel}">
            <span class="stylist__avatar" ${avatar}>${s.init}</span>
            <span class="stylist__name">${s.name}</span>
            <span class="stylist__spec">${s.spec}</span>
            ${rating}
          </button>
        </li>`;
      })
      .join("");
  }

  stylistGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-stylist]");
    if (!btn) return;
    state.stylist = btn.dataset.stylist;
    renderStylists();
    sync();
  });

  /* ---------------- Render: days & slots ---------------- */
  const dayStrip = $("#dayStrip");
  const slotGrid = $("#slotGrid");

  // Build the next 10 days starting tomorrow.
  const DAYS = (() => {
    const out = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 10; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push(d);
    }
    return out;
  })();

  function isoOf(d) {
    return d.toISOString().slice(0, 10);
  }

  // Deterministic pseudo-availability per day+time so it stays stable.
  function slotOpen(iso, time) {
    let h = 0;
    const str = iso + time;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h % 10 > 2; // ~70% open
  }

  function renderDays() {
    dayStrip.innerHTML = DAYS.map((d) => {
      const iso = isoOf(d);
      const sun = d.getDay() === 0; // closed Sundays
      const sel = state.day === iso;
      return `
        <button class="day ${sel ? "is-selected" : ""}" data-day="${iso}"
                role="option" aria-selected="${sel}" ${sun ? "disabled" : ""}>
          <span class="day__dow">${DOW[d.getDay()]}</span>
          <span class="day__num">${d.getDate()}</span>
          <span class="day__mon">${MON[d.getMonth()]}</span>
        </button>`;
    }).join("");
  }

  function renderSlots() {
    if (!state.day) {
      slotGrid.innerHTML = `<p class="slots__empty">Select a day above to see open times.</p>`;
      return;
    }
    slotGrid.innerHTML = SLOT_TIMES.map((t) => {
      const open = slotOpen(state.day, t);
      const sel = state.slot === t;
      return `
        <button class="slot ${sel ? "is-selected" : ""}" data-slot="${t}"
                role="option" aria-selected="${sel}" ${open ? "" : "disabled aria-disabled=\"true\""}>
          ${t}
        </button>`;
    }).join("");
  }

  dayStrip.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day]");
    if (!btn || btn.disabled) return;
    state.day = btn.dataset.day;
    state.slot = null; // reset slot when day changes
    renderDays();
    renderSlots();
    sync();
  });

  slotGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-slot]");
    if (!btn || btn.disabled) return;
    state.slot = btn.dataset.slot;
    renderSlots();
    sync();
  });

  /* ---------------- Summary + totals ---------------- */
  function prettyDay(iso) {
    const d = new Date(iso + "T00:00:00");
    return `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;
  }

  function setRow(row, valHtml, filled) {
    const valEl = $(`.summary__row[data-row="${row}"] .summary__val`);
    valEl.innerHTML = valHtml;
    valEl.classList.toggle("muted", !filled);
  }

  function sync() {
    const svc = SERVICES.find((s) => s.id === state.service);
    const st = STYLISTS.find((s) => s.id === state.stylist);

    setRow(
      "service",
      svc ? `${svc.name}<small>${svc.cat} · ${fmtDur(svc.dur)}</small>` : "Not selected",
      !!svc
    );
    setRow("stylist", st ? st.name : "Not selected", !!st);
    setRow(
      "when",
      state.day && state.slot
        ? `${prettyDay(state.day)}<small>${state.slot}</small>`
        : "Not selected",
      !!(state.day && state.slot)
    );

    $("#totalDuration").textContent = svc ? fmtDur(svc.dur) : "—";
    $("#totalPrice").textContent = svc ? money(svc.price) : "$0";

    // Footer continue button gating
    const nextBtn = $("#nextBtn");
    nextBtn.disabled = !stepValid(state.step);

    // Confirm button: needs everything
    $("#confirmBtn").disabled = !(state.service && state.stylist && state.day && state.slot);
  }

  function stepValid(step) {
    if (step === 1) return !!state.service;
    if (step === 2) return !!state.stylist;
    if (step === 3) return !!(state.day && state.slot);
    return false;
  }

  /* ---------------- Step navigation ---------------- */
  function showStep(step) {
    state.step = step;
    $$(".screen").forEach((s) => s.classList.remove("is-active"));
    $(`.screen[data-screen="${step}"]`).classList.add("is-active");

    $$("#steps .step").forEach((el) => {
      const n = Number(el.dataset.step);
      el.classList.toggle("is-active", n === step);
      el.classList.toggle("is-done", n < step);
    });

    $("#backBtn").hidden = step === 1;
    const nextBtn = $("#nextBtn");
    nextBtn.textContent = step === 3 ? "Review & confirm" : "Continue";
    $("#panelActions").hidden = false;

    if (step === 2) renderStylists();
    if (step === 3) {
      renderDays();
      renderSlots();
    }
    sync();
  }

  $("#nextBtn").addEventListener("click", () => {
    if (!stepValid(state.step)) {
      const msg =
        state.step === 1
          ? "Please choose a service first."
          : state.step === 2
            ? "Please choose a stylist."
            : "Please pick a date and time.";
      toast(msg);
      return;
    }
    if (state.step < 3) {
      showStep(state.step + 1);
    } else {
      $("#confirmBtn").focus();
      toast("Looking good — confirm to lock it in.");
    }
  });

  $("#backBtn").addEventListener("click", () => {
    if (state.step > 1) showStep(state.step - 1);
  });

  /* ---------------- Confirm ---------------- */
  function makeRef() {
    const a = "ML";
    const n = Math.floor(1000 + Math.random() * 9000);
    const c = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${a}-${n}-${c}`;
  }

  $("#confirmBtn").addEventListener("click", () => {
    if (!(state.service && state.stylist && state.day && state.slot)) {
      toast("Complete every step before confirming.");
      return;
    }
    const svc = SERVICES.find((s) => s.id === state.service);
    const st = STYLISTS.find((s) => s.id === state.stylist);
    const ref = makeRef();

    $("#confirmRef").textContent = ref;
    $("#confirmCopy").innerHTML =
      `Your <strong>${svc.name}</strong> with <strong>${st.name}</strong> is reserved for ` +
      `<strong>${prettyDay(state.day)} at ${state.slot}</strong>. We can't wait to see you.`;

    // Hide stepper + actions, show confirmation.
    $("#steps").classList.add("is-hidden");
    $$(".screen").forEach((s) => s.classList.remove("is-active"));
    $(`.screen[data-screen="done"]`).classList.add("is-active");
    $("#panelActions").hidden = true;
    $$("#steps .step").forEach((el) => el.classList.add("is-done"));

    toast(`Booked! Reference ${ref}`);
  });

  $("#restartBtn").addEventListener("click", () => {
    state.service = null;
    state.stylist = null;
    state.cat = "all";
    state.day = null;
    state.slot = null;
    $("#steps").classList.remove("is-hidden");
    $$("#steps .step").forEach((el) => el.classList.remove("is-done"));
    $$("#serviceFilters .chip").forEach((c, i) => {
      c.classList.toggle("is-active", i === 0);
      c.setAttribute("aria-selected", i === 0);
    });
    renderServices();
    showStep(1);
    toast("Let's start a fresh booking.");
  });

  /* ---------------- Init ---------------- */
  renderServices();
  showStep(1);
})();
