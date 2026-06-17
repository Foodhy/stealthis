"use strict";

/* ---------- Pricing model (fictional) ---------- */
const BASE = 4.0; // base dispatch fare
const PER_MILE = 0.95;
const SIZE_FEE = { small: 0, medium: 4.5, large: 11 };
const SIZE_LABEL = { small: "Small", medium: "Medium", large: "Large" };
const SERVICE = {
  standard: { mult: 1, label: "Standard", note: "Delivered within your slot" },
  express: { mult: 1.55, label: "Express", note: "First in the driver queue" },
};
const DISTANCE_MI = 6.2;

/* ---------- State ---------- */
const state = {
  size: "small",
  service: "standard",
  date: null, // {dow, dnum, mon, full}
  slot: null, // {time, tag}
};

/* ---------- Helpers ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const money = (n) => `$${n.toFixed(2)}`;

function toast(msg) {
  const host = $("#toastHost");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => el.remove(), 2900);
}

/* radiogroup: single-select, set aria-checked + active class */
function selectInGroup(group, target) {
  $$('[role="radio"]', group).forEach((b) => b.setAttribute("aria-checked", "false"));
  target.setAttribute("aria-checked", "true");
}

/* ---------- Build date strip (next 7 days) ---------- */
function buildDates() {
  const row = $("#dateRow");
  const today = new Date();
  const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    const label = i === 0 ? "Today" : i === 1 ? "Tmrw" : DOW[d.getDay()];
    btn.innerHTML =
      `<span class="dow">${label}</span>` +
      `<span class="dnum">${d.getDate()}</span>` +
      `<span class="mon">${MON[d.getMonth()]}</span>`;
    const info = {
      dow: label,
      dnum: d.getDate(),
      mon: MON[d.getMonth()],
      full: `${i === 0 ? "Today" : i === 1 ? "Tomorrow" : DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`,
      index: i,
    };
    btn.addEventListener("click", () => {
      selectInGroup(row, btn);
      state.date = info;
      buildSlots(i === 0);
      updateRecap();
      validate();
    });
    row.appendChild(btn);
  }
  // preselect today
  const first = $(".day", row);
  first.setAttribute("aria-checked", "true");
  state.date = {
    dow: "Today",
    dnum: today.getDate(),
    mon: MON[today.getMonth()],
    full: `Today, ${MON[today.getMonth()]} ${today.getDate()}`,
    index: 0,
  };
}

/* ---------- Build time slots (some sold out if "today") ---------- */
const SLOTS = [
  { time: "9:00–11:00", tag: "Morning" },
  { time: "11:00–1:00", tag: "Midday" },
  { time: "1:00–3:00", tag: "Afternoon" },
  { time: "3:00–5:00", tag: "Late PM" },
  { time: "5:00–7:00", tag: "Evening" },
  { time: "7:00–9:00", tag: "Night" },
];

function buildSlots(isToday) {
  const grid = $("#slotGrid");
  grid.innerHTML = "";
  // For "today", earlier slots are sold out
  const soldOutUntil = isToday ? 2 : 0;
  SLOTS.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    const soldOut = i < soldOutUntil;
    if (soldOut) btn.disabled = true;
    btn.innerHTML =
      `<span class="slot-time">${s.time}</span>` +
      `<span class="slot-tag">${soldOut ? "Sold out" : s.tag}</span>`;
    if (!soldOut) {
      btn.addEventListener("click", () => {
        selectInGroup(grid, btn);
        state.slot = s;
        updateRecap();
        validate();
      });
    }
    grid.appendChild(btn);
  });
  // reset slot selection when rebuilding
  state.slot = null;
  updateRecap();
  validate();
}

/* ---------- Pricing ---------- */
function computeBreakdown(serviceKey, sizeKey) {
  const svc = SERVICE[serviceKey];
  const base = BASE;
  const distance = PER_MILE * DISTANCE_MI;
  const sizeFee = SIZE_FEE[sizeKey];
  const subtotal = base + distance + sizeFee;
  const total = subtotal * svc.mult;
  const expressAdd = total - subtotal;
  return { base, distance, sizeFee, subtotal, total, expressAdd };
}

function priceFor(serviceKey) {
  return computeBreakdown(serviceKey, state.size).total;
}

function renderServicePrices() {
  $$(".svc-price[data-base]").forEach((el) => {
    const key = el.getAttribute("data-base");
    el.textContent = `from ${money(priceFor(key))}`;
  });
}

function updatePrice() {
  const b = computeBreakdown(state.service, state.size);
  $("#priceNum").textContent = b.total.toFixed(2);
  $("#priceNote").textContent =
    `${SERVICE[state.service].label} · ${SIZE_LABEL[state.size]} package`;

  const bd = $("#breakdown");
  bd.innerHTML = "";
  const rows = [
    ["Base dispatch", money(b.base)],
    [`Distance · ${DISTANCE_MI} mi`, money(b.distance)],
  ];
  if (b.sizeFee > 0) rows.push([`${SIZE_LABEL[state.size]} handling`, money(b.sizeFee)]);
  rows.forEach(([k, v]) => addRow(bd, k, v));
  if (state.service === "express") {
    addRow(bd, "Express priority", `+${money(b.expressAdd)}`, "discount");
  }
  addRow(bd, "Total estimate", money(b.total), "total");

  renderServicePrices();
}

function addRow(ul, label, val, cls) {
  const li = document.createElement("li");
  if (cls) li.className = cls;
  li.innerHTML = `<span>${label}</span><span>${val}</span>`;
  ul.appendChild(li);
}

/* ---------- Recap ---------- */
function shortAddr(v) {
  return v.split(",")[0].trim() || "—";
}
function updateRecap() {
  $("#recapFrom").textContent = shortAddr($("#pickup").value);
  $("#recapTo").textContent = shortAddr($("#dropoff").value);
  if (state.date && state.slot) {
    $("#recapWhen").textContent = `${state.date.full} · ${state.slot.time}`;
  } else if (state.date) {
    $("#recapWhen").textContent = `${state.date.full} · select a slot`;
  } else {
    $("#recapWhen").textContent = "Select a slot";
  }
}

/* ---------- Validation ---------- */
function validate() {
  const ok =
    $("#pickup").value.trim() &&
    $("#dropoff").value.trim() &&
    state.date &&
    state.slot;
  $("#confirmBtn").disabled = !ok;
  return ok;
}

/* ---------- Wire static groups ---------- */
function wireGroups() {
  const sizeGroup = $(".size-grid");
  $$(".size", sizeGroup).forEach((btn) => {
    btn.addEventListener("click", () => {
      selectInGroup(sizeGroup, btn);
      state.size = btn.dataset.size;
      updatePrice();
    });
  });

  const svcGroup = $(".service-grid");
  $$(".service", svcGroup).forEach((btn) => {
    btn.addEventListener("click", () => {
      selectInGroup(svcGroup, btn);
      state.service = btn.dataset.service;
      updatePrice();
      toast(
        state.service === "express"
          ? "Express selected — priority dispatch"
          : "Standard service selected"
      );
    });
  });

  // keyboard: Enter/Space activates focused radio
  $$('[role="radio"]').forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });
  });

  $("#pickup").addEventListener("input", () => {
    updateRecap();
    validate();
  });
  $("#dropoff").addEventListener("input", () => {
    updateRecap();
    validate();
  });
}

/* ---------- Submit / success ---------- */
function makeId() {
  let s = "PCX-";
  for (let i = 0; i < 6; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function wireSubmit() {
  $("#bookForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      toast("Pick a date and time slot first");
      return;
    }
    const total = priceFor(state.service);
    const id = makeId();
    $("#okId").textContent = id;
    $("#okSub").textContent =
      `${SERVICE[state.service].label} · ${SIZE_LABEL[state.size]} · ${state.date.full}, ${state.slot.time}. ` +
      `Estimated ${money(total)}.`;
    $("#overlay").hidden = false;

    // advance the mini step dots
    $$(".steps-mini .dot").forEach((d) => d.classList.add("on"));
  });

  $("#okClose").addEventListener("click", () => {
    $("#overlay").hidden = true;
    toast("Tracking link sent to your phone");
  });

  $("#overlay").addEventListener("click", (e) => {
    if (e.target === $("#overlay")) $("#overlay").hidden = true;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#overlay").hidden) $("#overlay").hidden = true;
  });
}

/* ---------- Init ---------- */
buildDates();
buildSlots(true); // today by default → early slots sold out
wireGroups();
wireSubmit();
updatePrice();
updateRecap();
validate();
renderServicePrices();
