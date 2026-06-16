const TAX_RATE = 0.0825;
const SERVICE_RATE = 0.1;

const MENU = {
  entradas: {
    title: "Entradas",
    icon: "🥖",
    items: [
      { id: "pan", name: "Pan masa madre", desc: "Smoked oil, sea salt", price: 8 },
      { id: "burrata", name: "Burrata huerta", desc: "Heirloom tomato, basil", price: 16 },
      { id: "pulpo", name: "Pulpo brasa", desc: "Smoked paprika potato", price: 19 },
      { id: "croquetas", name: "Croquetas jamón", desc: "6 pcs, lemon aioli", price: 14 },
      {
        id: "anchoas",
        name: "Anchoas Cantábrico",
        desc: "Boquerones, butter, baguette",
        price: 17,
      },
      { id: "ensalada", name: "Ensalada huerta", desc: "Garden greens, vinaigrette", price: 13 },
    ],
  },
  principales: {
    title: "Principales",
    icon: "🥩",
    items: [
      { id: "ribeye", name: "Ribeye 14oz", desc: "Marrow butter, chimichurri", price: 48 },
      { id: "branzino", name: "Branzino entero", desc: "Fennel, preserved lemon", price: 38 },
      { id: "risotto", name: "Risotto hongos", desc: "Wild mushroom, parmesan", price: 26 },
      { id: "pollo", name: "Pollo carbón", desc: "Half chicken, garlic confit", price: 28 },
      { id: "pappardelle", name: "Pappardelle ragú", desc: "Slow lamb shoulder", price: 24 },
      { id: "salmon", name: "Salmón plancha", desc: "Citrus glaze", price: 32, soldOut: true },
      { id: "cordero", name: "Costilla cordero", desc: "Honey-mint glaze", price: 42 },
      { id: "huerto", name: "Plato huerto", desc: "Seasonal vegetables", price: 22 },
    ],
  },
  postres: {
    title: "Postres",
    icon: "🍰",
    items: [
      { id: "tarta", name: "Tarta de queso", desc: "Basque burnt, salted caramel", price: 11 },
      { id: "olive", name: "Olive oil cake", desc: "Crème fraîche, candied orange", price: 10 },
      { id: "ganache", name: "Chocolate ganache", desc: "Hazelnut praline", price: 12 },
      { id: "sorbete", name: "Sorbete cítrico", desc: "Citrus, mint", price: 9 },
    ],
  },
  bebidas: {
    title: "Bebidas",
    icon: "🍷",
    items: [
      { id: "vermut", name: "Vermut casa", price: 9 },
      { id: "negroni", name: "Negroni sbagliato", price: 14 },
      { id: "spritz", name: "Spritz", price: 13 },
      { id: "tinto", name: "Tinto natural (copa)", price: 12 },
      { id: "blanco", name: "Blanco copa", price: 11 },
      { id: "agua", name: "Agua mineral", price: 5 },
      { id: "cafe", name: "Espresso", price: 4 },
      { id: "tonica", name: "Tónica", price: 6 },
    ],
  },
};

const COURSE_NAMES = ["1st course", "2nd course", "3rd course", "4th course"];

const catsEl = document.getElementById("cats");
const tablesEl = document.getElementById("tables");
const tablesSectionEl = document.getElementById("tablesSection");
const tablesLabelEl = document.getElementById("tablesLabel");
const gridEl = document.getElementById("grid");
const catName = document.getElementById("catName");
const catCount = document.getElementById("catCount");
const searchEl = document.getElementById("search");
const ticketBody = document.getElementById("ticketBody");
const ticketTable = document.getElementById("ticketTable");
const ticketMeta = document.getElementById("ticketMeta");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const serviceEl = document.getElementById("service");
const totalEl = document.getElementById("total");
const sendTotalEl = document.getElementById("sendTotal");
const sendBtn = document.getElementById("send");
const payBtn = document.getElementById("pay");
const holdBtn = document.getElementById("hold");
const printBtn = document.getElementById("print");
const courseBtn = document.getElementById("course");
const clockEl = document.getElementById("clock");
const toast = document.getElementById("toast");

let activeCat = "entradas";
let activeTable = 7;
let serviceMode = "dine";
let takeCounter = 1;
let courses = [{ id: 1, name: COURSE_NAMES[0], sent: false, lines: [] }];

function money(v) {
  return `$${v.toFixed(2)}`;
}

function renderTables() {
  if (serviceMode === "bar") {
    tablesEl.innerHTML = Array.from({ length: 6 }, (_, i) => i + 1)
      .map(
        (n) =>
          `<button class="table-btn ${n === activeTable ? "is-active" : ""}" data-table="${n}">B${n}</button>`
      )
      .join("");
  } else {
    tablesEl.innerHTML = Array.from({ length: 12 }, (_, i) => i + 1)
      .map(
        (n) =>
          `<button class="table-btn ${n === activeTable ? "is-active" : ""}" data-table="${n}">${n}</button>`
      )
      .join("");
  }
}

function applyServiceMode() {
  if (serviceMode === "take") {
    tablesSectionEl.hidden = true;
  } else {
    tablesSectionEl.hidden = false;
    tablesLabelEl.textContent = serviceMode === "bar" ? "Bar stool" : "Table";
    if (serviceMode === "bar") {
      // Clamp activeTable to bar stool range (1–6)
      if (activeTable > 6) activeTable = 1;
    } else {
      // Restore a valid dine table if coming back from bar
      if (activeTable > 12) activeTable = 1;
    }
    renderTables();
  }
}

function renderCats() {
  catsEl.innerHTML = Object.entries(MENU)
    .map(
      ([key, c]) => `
      <button class="cat-btn ${key === activeCat ? "is-active" : ""}" data-cat="${key}">
        <span class="cat-icon">${c.icon}</span>
        <span>${c.title}</span>
      </button>`
    )
    .join("");
}

function renderGrid() {
  const cat = MENU[activeCat];
  const q = searchEl.value.trim().toLowerCase();
  const filtered = cat.items.filter(
    (i) => !q || i.name.toLowerCase().includes(q) || (i.desc || "").toLowerCase().includes(q)
  );
  catName.textContent = cat.title;
  catCount.textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`;
  gridEl.innerHTML = filtered
    .map(
      (item) => `
      <button class="tile ${item.soldOut ? "tile-86" : ""}" ${item.soldOut ? "disabled" : ""}
        data-item="${item.id}" data-name="${item.name}" data-price="${item.price}">
        <span class="tile-name">${item.name}</span>
        ${item.desc ? `<span class="tile-desc">${item.desc}</span>` : ""}
        <span class="tile-price">$${item.price.toFixed(2)}</span>
      </button>`
    )
    .join("");
}

function activeCourse() {
  return courses.find((c) => !c.sent) || courses[courses.length - 1];
}

function renderTicket() {
  if (serviceMode === "dine") {
    ticketTable.textContent = `Table ${activeTable}`;
  } else if (serviceMode === "take") {
    ticketTable.textContent = `Take-out #${takeCounter}`;
  } else {
    ticketTable.textContent = `Bar ${activeTable}`;
  }
  const totalItems = courses.reduce((n, c) => n + c.lines.reduce((m, l) => m + l.qty, 0), 0);
  ticketMeta.textContent = `${totalItems} ${totalItems === 1 ? "item" : "items"} · 2 guests`;

  ticketBody.innerHTML = courses
    .map(
      (course) => `
      <div class="course" data-course="${course.id}">
        <p class="course-label ${course.sent ? "is-sent" : ""}">
          <span class="dot"></span>
          <span>${course.name}</span>
          ${course.sent ? `<span class="course-sent-tag">Sent</span>` : ""}
        </p>
        ${
          course.lines.length === 0
            ? `<p class="empty-course">Add an item.</p>`
            : course.lines
                .map(
                  (l) => `
            <div class="line ${course.sent ? "is-sent" : ""}" data-id="${l.uid}">
              ${
                course.sent
                  ? `<span class="line-qty"><span>${l.qty}</span></span>`
                  : `<div class="line-qty">
                    <button data-action="dec" aria-label="Decrease">−</button>
                    <span>${l.qty}</span>
                    <button data-action="inc" aria-label="Increase">+</button>
                  </div>`
              }
              <div class="line-body">
                <p class="line-name">${l.name}</p>
                ${l.mods ? `<p class="line-mods">${l.mods}</p>` : ""}
              </div>
              <span class="line-price">${money(l.price * l.qty)}</span>
            </div>`
                )
                .join("")
        }
      </div>`
    )
    .join("");

  const subtotal = courses.reduce(
    (s, c) => s + c.lines.reduce((m, l) => m + l.price * l.qty, 0),
    0
  );
  const tax = subtotal * TAX_RATE;
  const service = subtotal * SERVICE_RATE;
  const total = subtotal + tax + service;
  subtotalEl.textContent = money(subtotal);
  taxEl.textContent = money(tax);
  serviceEl.textContent = money(service);
  totalEl.textContent = money(total);
  sendTotalEl.textContent = money(total);

  const hasUnsentItems = courses.some((c) => !c.sent && c.lines.length > 0);
  const hasAnyItems = courses.some((c) => c.lines.length > 0);
  sendBtn.disabled = !hasUnsentItems;
  payBtn.disabled = !hasAnyItems;
}

function addItem(id, name, price, tile) {
  const course = activeCourse();
  let existing = course.lines.find((l) => l.id === id);
  if (existing) existing.qty += 1;
  else
    course.lines.push({
      uid: `${id}-${Date.now()}`,
      id,
      name,
      price,
      qty: 1,
      mods: "",
    });
  renderTicket();
  if (tile) {
    tile.classList.remove("is-flash");
    void tile.offsetWidth;
    tile.classList.add("is-flash");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

document.querySelectorAll(".seg-btn[data-service]").forEach((btn) => {
  btn.addEventListener("click", () => {
    serviceMode = btn.dataset.service;
    document.querySelectorAll(".seg-btn[data-service]").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
    });
    applyServiceMode();
    renderTicket();
  });
});

catsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  activeCat = btn.dataset.cat;
  renderCats();
  renderGrid();
});
tablesEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-table]");
  if (!btn) return;
  activeTable = Number(btn.dataset.table);
  renderTables();
  renderTicket();
});
gridEl.addEventListener("click", (e) => {
  const tile = e.target.closest("[data-item]");
  if (!tile || tile.classList.contains("tile-86")) return;
  addItem(tile.dataset.item, tile.dataset.name, Number(tile.dataset.price), tile);
});
ticketBody.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const line = btn.closest("[data-id]");
  const courseEl = btn.closest("[data-course]");
  if (!line || !courseEl) return;
  const course = courses.find((c) => String(c.id) === courseEl.dataset.course);
  if (!course || course.sent) return;
  const l = course.lines.find((x) => x.uid === line.dataset.id);
  if (!l) return;
  if (btn.dataset.action === "inc") l.qty += 1;
  if (btn.dataset.action === "dec") {
    l.qty -= 1;
    if (l.qty <= 0) course.lines = course.lines.filter((x) => x.uid !== l.uid);
  }
  renderTicket();
});

searchEl.addEventListener("input", renderGrid);

courseBtn.addEventListener("click", () => {
  if (courses.length >= COURSE_NAMES.length) return;
  courses.push({
    id: Date.now(),
    name: COURSE_NAMES[courses.length],
    sent: false,
    lines: [],
  });
  renderTicket();
});

sendBtn.addEventListener("click", () => {
  let sentCount = 0;
  courses.forEach((c) => {
    if (!c.sent && c.lines.length > 0) {
      c.sent = true;
      sentCount += c.lines.reduce((n, l) => n + l.qty, 0);
    }
  });
  // Auto-open a new course for the next round if all current are sent.
  if (courses.every((c) => c.sent) && courses.length < COURSE_NAMES.length) {
    courses.push({
      id: Date.now(),
      name: COURSE_NAMES[courses.length],
      sent: false,
      lines: [],
    });
  }
  renderTicket();
  showToast(`Sent ${sentCount} items to kitchen`);
});

holdBtn.addEventListener("click", () => showToast("Order held"));
printBtn.addEventListener("click", () => showToast("Printing pre-bill…"));
payBtn.addEventListener("click", () => {
  if (serviceMode === "dine") {
    showToast(`Closing table ${activeTable}`);
  } else if (serviceMode === "take") {
    showToast(`Take-out #${takeCounter} paid`);
  } else {
    showToast(`Closing bar stool B${activeTable}`);
  }
  setTimeout(() => {
    courses = [{ id: 1, name: COURSE_NAMES[0], sent: false, lines: [] }];
    if (serviceMode === "take") takeCounter += 1;
    renderTicket();
  }, 800);
});

function tick() {
  const d = new Date();
  clockEl.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
tick();
setInterval(tick, 30000);

applyServiceMode();
renderCats();
renderGrid();
renderTicket();
