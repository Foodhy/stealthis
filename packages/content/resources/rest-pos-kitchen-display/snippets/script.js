const COLUMNS = [
  { id: "new", title: "New" },
  { id: "cook", title: "Cooking" },
  { id: "ready", title: "Ready" },
  { id: "served", title: "Served" },
];

const SEED = [
  {
    id: "t-401",
    table: "Table 4",
    course: "2nd · Mains",
    status: "cook",
    age: 9 * 60,
    lines: [
      { qty: 1, name: "Ribeye 14oz", mod: "Medium rare · Truffle fries", tag: "Hot" },
      { qty: 1, name: "Branzino entero", mod: "No fennel" },
      { qty: 1, name: "Risotto hongos", mod: "Veg" },
    ],
  },
  {
    id: "t-402",
    table: "Table 9",
    course: "1st · Apps",
    status: "ready",
    age: 4 * 60,
    lines: [
      { qty: 2, name: "Burrata huerta" },
      { qty: 1, name: "Pulpo brasa", tag: "GF" },
    ],
  },
  {
    id: "t-403",
    table: "Bar 2",
    course: "Drinks",
    status: "new",
    age: 22,
    lines: [
      { qty: 2, name: "Negroni sbagliato" },
      { qty: 1, name: "Spritz", mod: "Less ice" },
    ],
  },
  {
    id: "t-404",
    table: "Table 12",
    course: "2nd · Mains",
    status: "cook",
    age: 15 * 60 + 20,
    lines: [
      { qty: 1, name: "Costilla cordero", tag: "Hot" },
      { qty: 1, name: "Pollo carbón" },
      { qty: 1, name: "Plato huerto", mod: "Allergy: nuts" },
    ],
  },
  {
    id: "t-405",
    table: "Take-out",
    course: "Pickup",
    status: "new",
    age: 90,
    lines: [
      { qty: 1, name: "Pappardelle ragú" },
      { qty: 2, name: "Pan masa madre" },
      { qty: 1, name: "Tarta de queso" },
    ],
  },
  {
    id: "t-406",
    table: "Table 7",
    course: "Dessert",
    status: "ready",
    age: 2 * 60,
    lines: [
      { qty: 1, name: "Olive oil cake" },
      { qty: 1, name: "Chocolate ganache" },
    ],
  },
];

const RANDOM_LINES = [
  { qty: 1, name: "Burrata huerta", mod: "Add focaccia" },
  { qty: 2, name: "Croquetas jamón" },
  { qty: 1, name: "Ensalada huerta", tag: "Veg" },
  { qty: 1, name: "Ribeye 14oz", mod: "Medium" },
  { qty: 1, name: "Salmón plancha" },
  { qty: 2, name: "Tinto natural" },
];
const RANDOM_TABLES = ["Table 3", "Table 5", "Table 11", "Bar 1", "Take-out"];
const RANDOM_COURSES = ["1st · Apps", "2nd · Mains", "Drinks", "Dessert"];

let tickets = SEED.map((t) => ({
  ...t,
  doneLines: new Set(),
  createdAt: Date.now() - t.age * 1000,
}));

const board = document.getElementById("board");
const tpl = document.getElementById("ticketTpl");
const statActive = document.getElementById("statActive");
const statAvg = document.getElementById("statAvg");
const statOver = document.getElementById("statOver");
const clockEl = document.getElementById("clock");

function buildBoard() {
  board.innerHTML = COLUMNS.map(
    (col) => `
    <section class="col" data-status="${col.id}">
      <header class="col-head">
        <span class="col-title">${col.title}</span>
        <span class="col-count" data-count="${col.id}">0</span>
      </header>
      <div class="col-body" data-col="${col.id}"></div>
    </section>`
  ).join("");
}

function ageString(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ageBucket(seconds) {
  if (seconds >= 14 * 60) return "is-hot";
  if (seconds >= 8 * 60) return "is-warm";
  return "";
}

function renderTickets() {
  COLUMNS.forEach((col) => {
    const wrap = board.querySelector(`[data-col="${col.id}"]`);
    wrap.innerHTML = "";
  });

  tickets.forEach((t) => {
    const wrap = board.querySelector(`[data-col="${t.status}"]`);
    if (!wrap) return;
    const node = tpl.content.cloneNode(true);
    const article = node.querySelector("[data-ticket]");
    article.dataset.id = t.id;
    article.dataset.status = t.status;
    const seconds = (Date.now() - t.createdAt) / 1000;
    const bucket = t.status === "served" ? "is-served" : ageBucket(seconds);
    if (bucket) article.classList.add(bucket);

    node.querySelector(".t-table").textContent = t.table;
    node.querySelector(".t-course").textContent = t.course;
    node.querySelector("[data-age]").textContent = ageString(seconds);

    const linesEl = node.querySelector("[data-lines]");
    linesEl.innerHTML = t.lines
      .map(
        (l, idx) => `
        <li class="t-line ${t.doneLines.has(idx) ? "is-done" : ""}" data-line="${idx}">
          <span class="t-line-qty">${l.qty}×</span>
          <div>
            <span class="t-line-name">${l.name}</span>
            ${l.mod ? `<span class="t-line-mod">${l.mod}</span>` : ""}
          </div>
          ${l.tag ? `<span class="t-line-tag">${l.tag}</span>` : ""}
        </li>`
      )
      .join("");

    wrap.appendChild(node);
  });

  // Counts & header stats
  let activeCount = 0;
  let overCount = 0;
  let totalAge = 0;
  let ageSamples = 0;

  COLUMNS.forEach((col) => {
    const inCol = tickets.filter((t) => t.status === col.id);
    board.querySelector(`[data-count="${col.id}"]`).textContent = inCol.length;
    if (col.id !== "served") activeCount += inCol.length;
    inCol.forEach((t) => {
      const sec = (Date.now() - t.createdAt) / 1000;
      if (col.id !== "served") {
        totalAge += sec;
        ageSamples += 1;
        if (sec >= 14 * 60) overCount += 1;
      }
    });
    if (inCol.length === 0) {
      const empty = document.createElement("p");
      empty.className = "col-empty";
      empty.textContent = "No tickets.";
      board.querySelector(`[data-col="${col.id}"]`).appendChild(empty);
    }
  });
  statActive.textContent = activeCount;
  statAvg.textContent = ageSamples ? Math.round(totalAge / ageSamples / 60) : 0;
  statOver.textContent = overCount;
}

function refreshAgesAndStats() {
  let activeCount = 0;
  let overCount = 0;
  let totalAge = 0;
  let ageSamples = 0;

  tickets.forEach((t) => {
    const ticketEl = board.querySelector(`[data-ticket][data-id="${t.id}"]`);
    const sec = (Date.now() - t.createdAt) / 1000;

    if (ticketEl) {
      const ageEl = ticketEl.querySelector("[data-age]");
      if (ageEl) ageEl.textContent = ageString(sec);

      ticketEl.classList.remove("is-warm", "is-hot", "is-served");
      const bucket = t.status === "served" ? "is-served" : ageBucket(sec);
      if (bucket) ticketEl.classList.add(bucket);
    }

    if (t.status !== "served") {
      activeCount += 1;
      totalAge += sec;
      ageSamples += 1;
      if (sec >= 14 * 60) overCount += 1;
    }
  });

  statActive.textContent = activeCount;
  statAvg.textContent = ageSamples ? Math.round(totalAge / ageSamples / 60) : 0;
  statOver.textContent = overCount;
}

board.addEventListener("click", (e) => {
  const ticketEl = e.target.closest("[data-ticket]");
  if (!ticketEl) return;
  const t = tickets.find((x) => x.id === ticketEl.dataset.id);
  if (!t) return;

  const lineEl = e.target.closest("[data-line]");
  if (lineEl) {
    const idx = Number(lineEl.dataset.line);
    if (t.doneLines.has(idx)) t.doneLines.delete(idx);
    else t.doneLines.add(idx);
    renderTickets();
    return;
  }
  const actionBtn = e.target.closest("[data-action]");
  if (actionBtn) {
    const order = ["new", "cook", "ready", "served"];
    const i = order.indexOf(t.status);
    if (actionBtn.dataset.action === "next" && i < order.length - 1) t.status = order[i + 1];
    if (actionBtn.dataset.action === "back" && i > 0) t.status = order[i - 1];
    renderTickets();
  }
});

document.getElementById("add").addEventListener("click", () => {
  const lines = [];
  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const pick = RANDOM_LINES[Math.floor(Math.random() * RANDOM_LINES.length)];
    lines.push({ ...pick });
  }
  tickets.unshift({
    id: `t-${Date.now()}`,
    table: RANDOM_TABLES[Math.floor(Math.random() * RANDOM_TABLES.length)],
    course: RANDOM_COURSES[Math.floor(Math.random() * RANDOM_COURSES.length)],
    status: "new",
    age: 0,
    createdAt: Date.now(),
    lines,
    doneLines: new Set(),
  });
  renderTickets();
});

function tickClock() {
  const d = new Date();
  clockEl.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
tickClock();
setInterval(tickClock, 30000);
setInterval(refreshAgesAndStats, 1000);

buildBoard();
renderTickets();
