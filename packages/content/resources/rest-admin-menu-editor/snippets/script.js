const CATS = [
  { id: "ent", name: "Entradas", course: "1st course" },
  { id: "pasta", name: "Pasta & arroces", course: "2nd course" },
  { id: "fuego", name: "Del fuego", course: "2nd course" },
  { id: "post", name: "Postres", course: "3rd course" },
  { id: "bev", name: "Bebidas", course: "Drink" },
  { id: "side", name: "Sides", course: "Side" },
];

const ITEMS = [
  {
    id: "pan",
    cat: "ent",
    name: "Pan de masa madre",
    desc: "Sourdough loaf, smoked olive oil, sea salt.",
    price: 8,
    course: "1st course",
    visible: true,
    chips: ["veg"],
  },
  {
    id: "bur",
    cat: "ent",
    name: "Burrata huerta",
    desc: "Heirloom tomato, garden basil, focaccia crumble.",
    price: 16,
    course: "1st course",
    visible: true,
    chips: ["veg", "dairy"],
  },
  {
    id: "pul",
    cat: "ent",
    name: "Pulpo a la brasa",
    desc: "Charred octopus, smoked paprika potato, salsa verde.",
    price: 19,
    course: "1st course",
    visible: true,
    chips: ["gf"],
  },
  {
    id: "cro",
    cat: "ent",
    name: "Croquetas de jamón",
    desc: "Iberico ham croquettes, six pieces, lemon aioli.",
    price: 14,
    course: "1st course",
    visible: true,
    chips: ["dairy"],
  },
  {
    id: "ens",
    cat: "ent",
    name: "Ensalada huerta",
    desc: "Garden lettuces, radish, soft herbs, lemon-shallot.",
    price: 13,
    course: "1st course",
    visible: true,
    chips: ["vg", "gf"],
  },

  {
    id: "pap",
    cat: "pasta",
    name: "Pappardelle al ragú",
    desc: "Hand-cut pasta, slow-braised lamb shoulder.",
    price: 24,
    course: "2nd course",
    visible: true,
    chips: ["dairy"],
  },
  {
    id: "ris",
    cat: "pasta",
    name: "Risotto de hongos",
    desc: "Carnaroli rice, wild mushrooms, parmesan.",
    price: 26,
    course: "2nd course",
    visible: true,
    chips: ["veg", "dairy"],
  },
  {
    id: "spa",
    cat: "pasta",
    name: "Spaghetti alle vongole",
    desc: "Clams, white wine, parsley, breadcrumbs.",
    price: 28,
    course: "2nd course",
    visible: true,
    chips: [],
  },

  {
    id: "rib",
    cat: "fuego",
    name: "Ribeye 14oz",
    desc: "Dry-aged 28 days, bone marrow butter, chimichurri.",
    price: 48,
    course: "2nd course",
    visible: true,
    chips: ["gf", "signature"],
  },
  {
    id: "bra",
    cat: "fuego",
    name: "Branzino entero",
    desc: "Whole roasted sea bass, fennel, preserved lemon.",
    price: 38,
    course: "2nd course",
    visible: true,
    chips: ["gf"],
  },
  {
    id: "pol",
    cat: "fuego",
    name: "Pollo al carbón",
    desc: "Half free-range chicken, garlic confit.",
    price: 28,
    course: "2nd course",
    visible: true,
    chips: ["gf"],
  },
  {
    id: "sal",
    cat: "fuego",
    name: "Salmón a la plancha",
    desc: "Citrus glaze, charred lemon.",
    price: 32,
    course: "2nd course",
    visible: false,
    chips: ["gf"],
  },
  {
    id: "cor",
    cat: "fuego",
    name: "Costilla de cordero",
    desc: "Lamb ribs, honey-mint glaze, charred onion.",
    price: 42,
    course: "2nd course",
    visible: true,
    chips: ["gf"],
  },

  {
    id: "tar",
    cat: "post",
    name: "Tarta de queso quemada",
    desc: "Basque burnt cheesecake, salted caramel.",
    price: 11,
    course: "3rd course",
    visible: true,
    chips: ["veg", "dairy", "signature"],
  },
  {
    id: "oli",
    cat: "post",
    name: "Olive oil cake",
    desc: "Citrus olive oil cake, crème fraîche.",
    price: 10,
    course: "3rd course",
    visible: true,
    chips: ["veg", "dairy"],
  },
  {
    id: "gan",
    cat: "post",
    name: "Chocolate ganache",
    desc: "Bittersweet dark chocolate, hazelnut praline.",
    price: 12,
    course: "3rd course",
    visible: true,
    chips: ["veg", "gf", "nuts"],
  },
  {
    id: "sor",
    cat: "post",
    name: "Sorbete cítrico",
    desc: "Citrus, mint, today's batch.",
    price: 9,
    course: "3rd course",
    visible: true,
    chips: ["vg", "gf"],
  },

  {
    id: "ver",
    cat: "bev",
    name: "Vermut de la casa",
    desc: "House vermouth on tap.",
    price: 9,
    course: "Drink",
    visible: true,
    chips: [],
  },
  {
    id: "neg",
    cat: "bev",
    name: "Negroni sbagliato",
    desc: "Campari, sweet vermouth, sparkling wine.",
    price: 14,
    course: "Drink",
    visible: true,
    chips: [],
  },
  {
    id: "tin",
    cat: "bev",
    name: "Tinto natural (copa)",
    desc: "Rotating natural red.",
    price: 12,
    course: "Drink",
    visible: true,
    chips: [],
  },
  {
    id: "alb",
    cat: "bev",
    name: "Albariño (copa)",
    desc: "Rías Baixas · 2023.",
    price: 11,
    course: "Drink",
    visible: true,
    chips: [],
  },

  {
    id: "fri",
    cat: "side",
    name: "Truffle fries",
    desc: "Parmesan, parsley.",
    price: 8,
    course: "Side",
    visible: true,
    chips: ["veg", "dairy"],
  },
  {
    id: "asp",
    cat: "side",
    name: "Grilled asparagus",
    desc: "Lemon, chilli oil.",
    price: 7,
    course: "Side",
    visible: true,
    chips: ["vg", "gf"],
  },
];

let activeCat = "ent";
let activeItem = null;
let dirty = false;
let filter = "";

const catListEl = document.getElementById("catList");
const itemListEl = document.getElementById("itemList");
const itemEmpty = document.getElementById("itemEmpty");
const itemsKicker = document.getElementById("itemsKicker");
const itemsTitle = document.getElementById("itemsTitle");
const editEmpty = document.getElementById("editEmpty");
const editForm = document.getElementById("editForm");
const editEyebrow = document.getElementById("editEyebrow");
const editName = document.getElementById("editName");
const editPrice = document.getElementById("editPrice");
const editCourse = document.getElementById("editCourse");
const editDesc = document.getElementById("editDesc");
const editVisible = document.getElementById("editVisible");
const saveBtn = document.getElementById("saveBtn");
const discardBtn = document.getElementById("discardBtn");
const saveMeta = document.getElementById("saveMeta");
const searchEl = document.getElementById("itemSearch");
const toast = document.getElementById("toast");

// Modal refs
const modalOverlay = document.getElementById("modalOverlay");
const modalAddCat = document.getElementById("modalAddCat");
const formAddCat = document.getElementById("formAddCat");
const catNameInput = document.getElementById("catNameInput");
const catIconInput = document.getElementById("catIconInput");
const cancelAddCat = document.getElementById("cancelAddCat");
const modalAddItem = document.getElementById("modalAddItem");
const formAddItem = document.getElementById("formAddItem");
const iNameInput = document.getElementById("iNameInput");
const iPriceInput = document.getElementById("iPriceInput");
const iCatInput = document.getElementById("iCatInput");
const iDescInput = document.getElementById("iDescInput");
const cancelAddItem = document.getElementById("cancelAddItem");

function openModal(modal) {
  modalOverlay.hidden = false;
  modal.showModal();
  const first = modal.querySelector("input, select, textarea, button");
  if (first) first.focus();
}

function closeModal(modal) {
  modal.close();
  modalOverlay.hidden = true;
}

function countFor(catId) {
  return ITEMS.filter((i) => i.cat === catId).length;
}

const DEFAULT_ICONS = { ent: "🥖", pasta: "🍝", fuego: "🔥", post: "🍰", bev: "🍷", side: "🥗" };

function renderCats() {
  catListEl.innerHTML = CATS.map(
    (c) => `<li class="${c.id === activeCat ? "is-active" : ""}" data-cat="${c.id}">
      <span class="ic">${c.icon || DEFAULT_ICONS[c.id] || "📋"}</span>
      <span>${c.name}</span>
      <span class="count">${countFor(c.id)}</span>
    </li>`
  ).join("");
  const cat = CATS.find((c) => c.id === activeCat);
  itemsKicker.textContent = cat ? cat.name : "—";
}

function renderItems() {
  const q = filter.toLowerCase();
  const list = ITEMS.filter(
    (i) =>
      i.cat === activeCat &&
      (!q || i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
  );
  itemListEl.innerHTML = list
    .map(
      (i) => `<li class="item-row ${i.id === activeItem ? "is-active" : ""}" data-id="${i.id}">
      <span class="item-grip" aria-hidden="true"></span>
      <div class="item-info">
        <p class="item-name">${i.name}${i.chips.includes("signature") ? ` <span style="color:var(--gold)">★</span>` : ""}</p>
        <p class="item-meta">${i.course} · ${i.chips.filter((c) => c !== "signature").join(" · ") || "no tags"}</p>
      </div>
      <span class="item-price">$${i.price.toFixed(2)}</span>
      <button class="item-vis ${i.visible ? "is-on" : ""}" data-action="vis" data-id="${i.id}" aria-label="Toggle visibility"></button>
    </li>`
    )
    .join("");
  itemEmpty.hidden = list.length > 0;
  itemsTitle.textContent =
    list.length === 0 ? "Empty section" : `${list.length} item${list.length === 1 ? "" : "s"}`;
}

function loadItem(id) {
  activeItem = id;
  const item = ITEMS.find((i) => i.id === id);
  if (!item) {
    editEmpty.hidden = false;
    editForm.hidden = true;
    return;
  }
  editEmpty.hidden = true;
  editForm.hidden = false;
  editEyebrow.textContent = `Editing · ${CATS.find((c) => c.id === item.cat)?.name}`;
  editName.value = item.name;
  editPrice.value = item.price;
  editCourse.value = item.course;
  editDesc.value = item.desc;
  editVisible.setAttribute("aria-pressed", String(item.visible));
  editVisible.querySelector(".vis-label").textContent = item.visible ? "Visible" : "Hidden";
  editForm.querySelectorAll("[data-chip]").forEach((cb) => {
    cb.checked = item.chips.includes(cb.dataset.chip);
  });
  dirty = false;
  saveBtn.disabled = true;
  discardBtn.disabled = true;
  saveMeta.classList.remove("is-dirty");
  saveMeta.textContent = "Last saved · just now";
  renderItems(); // to mark active row
}

function markDirty() {
  dirty = true;
  saveBtn.disabled = false;
  discardBtn.disabled = false;
  saveMeta.classList.add("is-dirty");
  saveMeta.textContent = "Unsaved changes";
}

catListEl.addEventListener("click", (e) => {
  const li = e.target.closest("[data-cat]");
  if (!li) return;
  activeCat = li.dataset.cat;
  activeItem = null;
  editEmpty.hidden = false;
  editForm.hidden = true;
  renderCats();
  renderItems();
});

itemListEl.addEventListener("click", (e) => {
  const vis = e.target.closest("[data-action='vis']");
  if (vis) {
    const item = ITEMS.find((i) => i.id === vis.dataset.id);
    if (item) {
      item.visible = !item.visible;
      renderItems();
      if (activeItem === item.id) {
        editVisible.setAttribute("aria-pressed", String(item.visible));
        editVisible.querySelector(".vis-label").textContent = item.visible ? "Visible" : "Hidden";
      }
      showToast(`${item.name} is now ${item.visible ? "visible" : "hidden (86'd)"}.`);
    }
    e.stopPropagation();
    return;
  }
  const row = e.target.closest("[data-id]");
  if (row) loadItem(row.dataset.id);
});

editVisible.addEventListener("click", () => {
  const next = editVisible.getAttribute("aria-pressed") !== "true";
  editVisible.setAttribute("aria-pressed", String(next));
  editVisible.querySelector(".vis-label").textContent = next ? "Visible" : "Hidden";
  markDirty();
});

["input", "change"].forEach((evt) =>
  editForm.addEventListener(evt, (e) => {
    if (e.target === editVisible) return;
    markDirty();
  })
);

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const item = ITEMS.find((i) => i.id === activeItem);
  if (!item) return;
  item.name = editName.value.trim() || item.name;
  item.price = Number(editPrice.value) || item.price;
  item.course = editCourse.value;
  item.desc = editDesc.value.trim();
  item.visible = editVisible.getAttribute("aria-pressed") === "true";
  item.chips = [...editForm.querySelectorAll("[data-chip]:checked")].map((c) => c.dataset.chip);
  dirty = false;
  saveBtn.disabled = true;
  discardBtn.disabled = true;
  saveMeta.classList.remove("is-dirty");
  const t = new Date();
  saveMeta.textContent = `Saved · ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  renderItems();
  renderCats();
  showToast(`Saved · ${item.name}`);
});

discardBtn.addEventListener("click", () => {
  if (activeItem) loadItem(activeItem);
});

document.getElementById("publish").addEventListener("click", () => {
  showToast("Carta published · diners will see this on next refresh");
});

searchEl.addEventListener("input", (e) => {
  filter = e.target.value.trim();
  renderItems();
});

document.getElementById("addCat").addEventListener("click", () => {
  openModal(modalAddCat);
});
document.getElementById("addItem").addEventListener("click", () => {
  iCatInput.innerHTML = CATS.map(
    (c) => `<option value="${c.id}">${c.name}</option>`
  ).join("");
  openModal(modalAddItem);
});

cancelAddCat.addEventListener("click", () => closeModal(modalAddCat));
cancelAddItem.addEventListener("click", () => closeModal(modalAddItem));

modalOverlay.addEventListener("click", () => {
  if (modalAddCat.open) closeModal(modalAddCat);
  if (modalAddItem.open) closeModal(modalAddItem);
});

formAddCat.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = catNameInput.value.trim();
  const icon = catIconInput.value.trim() || "📋";
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  CATS.push({ id, name, icon, course: "1st course" });
  renderCats();
  renderItems();
  closeModal(modalAddCat);
  formAddCat.reset();
  showToast(`Category "${name}" added`);
});

formAddItem.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = iNameInput.value.trim();
  const price = Number(iPriceInput.value) || 0;
  const catId = iCatInput.value;
  const desc = iDescInput.value.trim();
  const newItem = {
    id: Date.now().toString(36),
    name,
    price,
    course: "mains",
    desc,
    cat: catId,
    visible: true,
    chips: [],
  };
  ITEMS.push(newItem);
  const catName = CATS.find((c) => c.id === catId)?.name || catId;
  renderCats();
  renderItems();
  closeModal(modalAddItem);
  formAddItem.reset();
  showToast(`"${name}" added to ${catName}`);
});

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2400);
}

renderCats();
renderItems();
