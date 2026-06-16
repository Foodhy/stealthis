const ITEMS = [
  // produce
  {
    id: "tom",
    name: "Heirloom tomato",
    glyph: "🍅",
    code: "PR-014",
    cat: "produce",
    supplier: "Aravaca Farm",
    region: "Own garden · Madrid",
    stock: 14,
    par: 18,
    lastIso: -1,
  },
  {
    id: "bas",
    name: "Garden basil",
    glyph: "🌿",
    code: "PR-022",
    cat: "produce",
    supplier: "Aravaca Farm",
    region: "Own garden",
    stock: 4,
    par: 6,
    lastIso: -1,
  },
  {
    id: "fen",
    name: "Fennel bulb",
    glyph: "🥬",
    code: "PR-031",
    cat: "produce",
    supplier: "Mercado Central",
    region: "Madrid",
    stock: 12,
    par: 16,
    lastIso: -2,
  },
  {
    id: "pot",
    name: "Yukon potato",
    glyph: "🥔",
    code: "PR-007",
    cat: "produce",
    supplier: "Mercado Central",
    region: "Castilla-La Mancha",
    stock: 38,
    par: 40,
    lastIso: -2,
  },
  {
    id: "lem",
    name: "Preserved lemon",
    glyph: "🍋",
    code: "PR-052",
    cat: "produce",
    supplier: "Casa Olivar (in-house)",
    region: "Pantry",
    stock: 22,
    par: 24,
    lastIso: -7,
  },
  // meat / fish
  {
    id: "rib",
    name: "Ribeye · dry-aged 28d",
    glyph: "🥩",
    code: "MF-101",
    cat: "meat",
    supplier: "Heritage Foods",
    region: "USA",
    stock: 9,
    par: 12,
    lastIso: -3,
    lastWeight: "16.4 kg",
  },
  {
    id: "bra",
    name: "Branzino · whole",
    glyph: "🐟",
    code: "MF-203",
    cat: "meat",
    supplier: "Pescados Marín",
    region: "Galicia",
    stock: 6,
    par: 10,
    lastIso: -1,
  },
  {
    id: "sal",
    name: "Salmón · plancha",
    glyph: "🐟",
    code: "MF-204",
    cat: "meat",
    supplier: "Pescados Marín",
    region: "Galicia",
    stock: 0,
    par: 8,
    lastIso: -1,
    oos: true,
  },
  {
    id: "lam",
    name: "Lamb shoulder",
    glyph: "🐑",
    code: "MF-307",
    cat: "meat",
    supplier: "Heritage Foods",
    region: "USA",
    stock: 11,
    par: 14,
    lastIso: -3,
  },
  {
    id: "oct",
    name: "Pulpo · charred",
    glyph: "🐙",
    code: "MF-220",
    cat: "meat",
    supplier: "Pescados Marín",
    region: "Galicia",
    stock: 5,
    par: 7,
    lastIso: -1,
  },
  // dairy
  {
    id: "bur",
    name: "Burrata · 250g",
    glyph: "🧀",
    code: "DA-031",
    cat: "dairy",
    supplier: "Salumi de Madrid",
    region: "Spain · import",
    stock: 14,
    par: 18,
    lastIso: -2,
  },
  {
    id: "par",
    name: "Parmigiano · 24m",
    glyph: "🧀",
    code: "DA-042",
    cat: "dairy",
    supplier: "Salumi de Madrid",
    region: "Emilia-Romagna",
    stock: 7,
    par: 8,
    lastIso: -7,
  },
  {
    id: "but",
    name: "Cultured butter",
    glyph: "🧈",
    code: "DA-018",
    cat: "dairy",
    supplier: "Local dairy",
    region: "León",
    stock: 22,
    par: 24,
    lastIso: -3,
  },
  {
    id: "mil",
    name: "Whole milk · 1L",
    glyph: "🥛",
    code: "DA-001",
    cat: "dairy",
    supplier: "Local dairy",
    region: "León",
    stock: 32,
    par: 30,
    lastIso: -1,
  },
  // dry
  {
    id: "rou",
    name: "Sourdough starter",
    glyph: "🌾",
    code: "DR-001",
    cat: "dry",
    supplier: "Casa Olivar (in-house)",
    region: "Pantry",
    stock: 1,
    par: 1,
    lastIso: -120,
  },
  {
    id: "flo",
    name: "00 flour · 25 kg",
    glyph: "🌾",
    code: "DR-014",
    cat: "dry",
    supplier: "Molino Carbonell",
    region: "Valencia",
    stock: 4,
    par: 6,
    lastIso: -4,
  },
  {
    id: "pas",
    name: "Pappardelle dough",
    glyph: "🍝",
    code: "DR-066",
    cat: "dry",
    supplier: "Casa Olivar (in-house)",
    region: "Pantry",
    stock: 9,
    par: 12,
    lastIso: -1,
  },
  {
    id: "ric",
    name: "Carnaroli rice",
    glyph: "🍚",
    code: "DR-022",
    cat: "dry",
    supplier: "Riso Acquerello",
    region: "Piedmont",
    stock: 7,
    par: 8,
    lastIso: -10,
  },
  {
    id: "oil",
    name: "Olive oil · extra virgin",
    glyph: "🫒",
    code: "DR-104",
    cat: "dry",
    supplier: "Cooperativa Andújar",
    region: "Andalucía",
    stock: 18,
    par: 18,
    lastIso: -14,
  },
  {
    id: "sal2",
    name: "Sea salt · Maldon",
    glyph: "🧂",
    code: "DR-205",
    cat: "dry",
    supplier: "Maldon",
    region: "UK · import",
    stock: 12,
    par: 12,
    lastIso: -30,
  },
  {
    id: "veg",
    name: "Carbon · oak",
    glyph: "🪵",
    code: "DR-301",
    cat: "dry",
    supplier: "Carbón Sevilla",
    region: "Andalucía",
    stock: 28,
    par: 40,
    lastIso: -7,
  },
  // bev
  {
    id: "tin",
    name: "Tinto · Mencía '22",
    glyph: "🍷",
    code: "BV-401",
    cat: "bev",
    supplier: "Vinos Bierzo",
    region: "León",
    stock: 18,
    par: 24,
    lastIso: -7,
  },
  {
    id: "alb",
    name: "Albariño '23",
    glyph: "🥂",
    code: "BV-402",
    cat: "bev",
    supplier: "Pazo de Señorans",
    region: "Galicia",
    stock: 22,
    par: 24,
    lastIso: -7,
  },
  {
    id: "ver",
    name: "Vermut casa · tap",
    glyph: "🥃",
    code: "BV-501",
    cat: "bev",
    supplier: "Casa Olivar (in-house)",
    region: "On-tap",
    stock: 3,
    par: 4,
    lastIso: -2,
  },
  {
    id: "neg",
    name: "Campari",
    glyph: "🍸",
    code: "BV-606",
    cat: "bev",
    supplier: "Distribuciones Sur",
    region: "Italy · import",
    stock: 4,
    par: 4,
    lastIso: -14,
  },
  {
    id: "agu",
    name: "Agua mineral · 1L",
    glyph: "💧",
    code: "BV-701",
    cat: "bev",
    supplier: "Solán de Cabras",
    region: "Cuenca",
    stock: 96,
    par: 96,
    lastIso: -2,
  },
  // misc
  {
    id: "cof",
    name: "Espresso beans · 1kg",
    glyph: "☕",
    code: "MS-110",
    cat: "misc",
    supplier: "Café Cordobés",
    region: "Andalucía",
    stock: 5,
    par: 6,
    lastIso: -4,
  },
  {
    id: "can",
    name: "Beeswax candles",
    glyph: "🕯",
    code: "MS-220",
    cat: "misc",
    supplier: "Mercado Central",
    region: "Madrid",
    stock: 30,
    par: 40,
    lastIso: -21,
  },
];

const CAT_LABEL = {
  produce: "Produce",
  meat: "Meat & fish",
  dairy: "Dairy",
  dry: "Dry goods",
  bev: "Beverages",
  misc: "Misc",
};

const rowsEl = document.getElementById("rows");
const emptyEl = document.getElementById("empty");
const chips = document.getElementById("chips");
const searchEl = document.getElementById("search");
const lowCountEl = document.getElementById("lowCount");
const outCountEl = document.getElementById("outCount");
const toast = document.getElementById("toast");

const drawerOverlay = document.getElementById("drawerOverlay");
const adjustDrawer = document.getElementById("adjustDrawer");
const drawerTitle = document.getElementById("drawerTitle");
const drawerMeta = document.getElementById("drawerMeta");
const drawerUnit = document.getElementById("drawerUnit");
const drawerQty = document.getElementById("drawerQty");
const drawerPar = document.getElementById("drawerPar");
const drawerClose = document.getElementById("drawerClose");
const drawerCancel = document.getElementById("drawerCancel");
const drawerSave = document.getElementById("drawerSave");
const drawerDec = document.getElementById("drawerDec");
const drawerInc = document.getElementById("drawerInc");

let cat = "all";
let q = "";
let adjustingId = null;

function relDate(dDays) {
  const d = new Date();
  d.setDate(d.getDate() + dDays);
  const iso = d.toISOString().slice(0, 10);
  let txt = "—";
  if (dDays === 0) txt = "today";
  else if (dDays === -1) txt = "yesterday";
  else if (dDays > -30) txt = `${Math.abs(dDays)} days ago`;
  else txt = `${Math.round(Math.abs(dDays) / 7)} weeks ago`;
  return { iso, txt };
}

function tone(item) {
  if (item.oos || item.stock === 0) return "is-danger";
  const ratio = item.stock / item.par;
  if (ratio <= 0.4) return "is-warn";
  return "";
}

function visible(item) {
  if (cat !== "all" && item.cat !== cat) return false;
  if (!q) return true;
  const haystack = `${item.name} ${item.supplier} ${item.code} ${item.region}`.toLowerCase();
  return haystack.includes(q);
}

function render() {
  let visibleCount = 0;
  let low = 0;
  let out = 0;
  rowsEl.innerHTML = ITEMS.map((item) => {
    const hidden = !visible(item);
    if (!hidden) visibleCount += 1;
    const t = tone(item);
    if (t === "is-warn") low += 1;
    if (t === "is-danger") out += 1;
    const pct = Math.min(100, Math.round((item.stock / Math.max(1, item.par)) * 100));
    const d = relDate(item.lastIso);
    return `<tr class="${hidden ? "row-hidden" : ""}" data-id="${item.id}">
      <td class="col-name">
        <div class="ing">
          <div class="ing-glyph">${item.glyph}</div>
          <div class="ing-info">
            <p class="ing-name">${item.name}</p>
            <p class="ing-code">${item.code} · ${CAT_LABEL[item.cat]}</p>
          </div>
        </div>
      </td>
      <td>
        <p class="supplier">${item.supplier}<small>${item.region}</small></p>
      </td>
      <td class="col-stock">
        <div class="par ${t}">
          <p class="par-text">
            <strong>${item.stock}</strong>
            <span>par ${item.par} · ${pct}%</span>
          </p>
          <div class="par-bar"><div class="par-fill" style="width:${pct}%"></div></div>
        </div>
      </td>
      <td>
        <p class="delivery">${d.txt}<small>${d.iso}${item.lastWeight ? ` · ${item.lastWeight}` : ""}</small></p>
      </td>
      <td class="col-action">
        ${
          item.oos
            ? `<span class="tag-86">86'd</span>`
            : t === ""
              ? `<button class="btn-quiet" data-action="adjust" data-id="${item.id}">Adjust</button>`
              : `<button class="btn-reorder" data-action="reorder" data-id="${item.id}">Reorder</button>`
        }
      </td>
    </tr>`;
  }).join("");

  lowCountEl.firstChild.textContent = String(low) + " ";
  outCountEl.firstChild.textContent = String(out) + " ";
  emptyEl.hidden = visibleCount > 0;
}

function openAdjust(id) {
  const item = ITEMS.find((i) => i.id === id);
  if (!item) return;
  adjustingId = id;
  drawerTitle.textContent = item.name;
  drawerMeta.textContent = `${CAT_LABEL[item.cat]} · ${item.stock === 0 ? "Out of stock" : item.stock <= item.par * 0.4 ? "Low stock" : "In stock"}`;
  drawerUnit.textContent = item.unit || "units";
  drawerQty.value = item.stock;
  drawerPar.textContent = `Par level: ${item.par}`;
  drawerOverlay.hidden = false;
  adjustDrawer.hidden = false;
  drawerQty.focus();
}

function closeDrawer() {
  drawerOverlay.hidden = true;
  adjustDrawer.hidden = true;
  adjustingId = null;
}

drawerClose.addEventListener("click", closeDrawer);
drawerCancel.addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

drawerDec.addEventListener("click", () => {
  const val = Number(drawerQty.value);
  if (val > 0) drawerQty.value = val - 1;
});
drawerInc.addEventListener("click", () => {
  drawerQty.value = Number(drawerQty.value) + 1;
});

drawerSave.addEventListener("click", () => {
  const item = ITEMS.find((i) => i.id === adjustingId);
  if (!item) return;
  item.stock = Number(drawerQty.value);
  item.oos = item.stock === 0;
  item.lastIso = 0;
  closeDrawer();
  render();
  showToast(`${item.name} adjusted to ${item.stock}`);
});

chips.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  cat = btn.dataset.cat;
  chips.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === btn));
  render();
});
searchEl.addEventListener("input", (e) => {
  q = e.target.value.trim().toLowerCase();
  render();
});

rowsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (action === "reorder") {
    const item = ITEMS.find((i) => i.id === id);
    if (item) {
      item.stock = item.par;
      item.lastIso = 0;
      item.oos = false;
      render();
      showToast(`Reordered · ${item.name} to par`);
    }
  } else if (action === "adjust") {
    openAdjust(id);
  }
});

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2400);
}

render();
