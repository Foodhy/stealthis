const SEED = [
  {
    id: "b-101",
    table: "Table 7 · Lina",
    age: 5 * 60 + 22,
    drinks: [
      { qty: 2, name: "Negroni sbagliato", mod: "extra orange peel", flag: "Up" },
      { qty: 1, name: "Spritz", mod: "less ice", flag: "Less ice" },
    ],
  },
  {
    id: "b-102",
    table: "Bar 2",
    age: 8 * 60 + 41,
    drinks: [
      { qty: 1, name: "Vermut casa", mod: "with olive", flag: "Rocks" },
      { qty: 1, name: "Tinto natural", mod: "" },
    ],
  },
  {
    id: "b-103",
    table: "Table 11 · Marco",
    age: 1 * 60 + 38,
    drinks: [
      { qty: 4, name: "Albariño", mod: "splash sparkling" },
      { qty: 1, name: "Agua mineral", mod: "with lemon" },
    ],
  },
  {
    id: "b-104",
    table: "Take-out",
    age: 30,
    drinks: [
      { qty: 1, name: "Espresso", mod: "double" },
      { qty: 1, name: "Cortado", mod: "" },
    ],
  },
];

const ALL_OPTIONS = [
  { name: "Negroni sbagliato", flag: "Up" },
  { name: "Vermut casa", flag: "Rocks" },
  { name: "Tinto natural", flag: "" },
  { name: "Albariño", flag: "" },
  { name: "Spritz", flag: "Less ice" },
  { name: "Cold brew", flag: "" },
];
const TABLES = ["Table 3", "Table 5", "Bar 1", "Bar 3", "Patio 2"];

let tickets = SEED.map((t) => ({
  ...t,
  createdAt: Date.now() - t.age * 1000,
  doneSet: new Set(),
  bumped: false,
}));

const col = document.getElementById("col");
const tt = document.getElementById("tt");
const statActive = document.getElementById("statActive");
const statAvg = document.getElementById("statAvg");
const statOver = document.getElementById("statOver");
const clockEl = document.getElementById("clock");

function age(t) {
  return (Date.now() - t.createdAt) / 1000;
}
function fmtAge(s) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, "0")}`;
}
function bucket(s) {
  if (s >= 7 * 60) return "is-hot";
  if (s >= 4 * 60) return "is-warm";
  return "";
}

function render() {
  col.innerHTML = "";
  const live = tickets.filter((t) => !t.bumped);
  live.sort((a, b) => a.createdAt - b.createdAt);
  live.forEach((t) => {
    const node = tt.content.cloneNode(true);
    const art = node.querySelector(".ticket");
    art.dataset.id = t.id;
    const s = age(t);
    const cls = bucket(s);
    if (cls) art.classList.add(cls);
    node.querySelector(".t-table").textContent = t.table;
    node.querySelector(".t-age").textContent = fmtAge(s);
    const ul = node.querySelector(".drinks");
    ul.innerHTML = t.drinks
      .map(
        (d, i) => `<li class="d-row ${t.doneSet.has(i) ? "is-done" : ""}" data-line="${i}">
          <span class="d-qty">${d.qty}×</span>
          <div>
            <span class="d-name">${d.name}</span>
            ${d.mod ? `<span class="d-mods">${d.mod}</span>` : ""}
          </div>
          ${d.flag ? `<span class="d-flag">${d.flag}</span>` : ""}
        </li>`
      )
      .join("");
    col.appendChild(node);
  });

  statActive.textContent = live.length;
  const overCount = live.filter((t) => age(t) >= 7 * 60).length;
  statOver.textContent = overCount;
  const avg = live.length
    ? Math.round(live.reduce((sum, t) => sum + age(t), 0) / live.length / 60)
    : 0;
  statAvg.textContent = avg;
}

function refreshAgesAndStats() {
  const live = tickets.filter((t) => !t.bumped);
  let overCount = 0;
  let totalAge = 0;

  live.forEach((t) => {
    const s = age(t);
    totalAge += s;
    if (s >= 7 * 60) overCount += 1;

    const ticketEl = col.querySelector(`.ticket[data-id="${t.id}"]`);
    if (!ticketEl) return;

    const ageEl = ticketEl.querySelector(".t-age");
    if (ageEl) ageEl.textContent = fmtAge(s);

    ticketEl.classList.remove("is-warm", "is-hot");
    const cls = bucket(s);
    if (cls) ticketEl.classList.add(cls);
  });

  statActive.textContent = live.length;
  statOver.textContent = overCount;
  statAvg.textContent = live.length ? Math.round(totalAge / live.length / 60) : 0;
}

col.addEventListener("click", (e) => {
  const ticket = e.target.closest(".ticket");
  if (!ticket) return;
  const t = tickets.find((x) => x.id === ticket.dataset.id);
  if (!t) return;
  const action = e.target.closest("[data-action]");
  if (action) {
    if (action.dataset.action === "bump") t.bumped = true;
    if (action.dataset.action === "back") {
      t.bumped = false;
      t.createdAt = Date.now() - 2 * 60 * 1000;
      t.doneSet = new Set();
    }
    render();
    return;
  }
  const row = e.target.closest("[data-line]");
  if (row) {
    const i = Number(row.dataset.line);
    if (t.doneSet.has(i)) t.doneSet.delete(i);
    else t.doneSet.add(i);
    render();
  }
});

document.getElementById("add").addEventListener("click", () => {
  const count = 1 + Math.floor(Math.random() * 2);
  const drinks = Array.from({ length: count }, () => {
    const o = ALL_OPTIONS[Math.floor(Math.random() * ALL_OPTIONS.length)];
    return { qty: 1 + Math.floor(Math.random() * 2), name: o.name, mod: "", flag: o.flag };
  });
  tickets.push({
    id: `b-${Date.now()}`,
    table: TABLES[Math.floor(Math.random() * TABLES.length)],
    createdAt: Date.now(),
    doneSet: new Set(),
    bumped: false,
    drinks,
  });
  render();
});

function tickClock() {
  const d = new Date();
  clockEl.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
tickClock();
setInterval(tickClock, 20000);
setInterval(refreshAgesAndStats, 1000);
render();
