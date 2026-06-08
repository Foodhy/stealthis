// ── Room inventory (price is per night; stay = 3 nights) ──────────────────────
const NIGHTS = 3;
const ROOMS = [
  {
    id: "single-std",
    name: "Classic Single",
    type: "Standard",
    bed: "Twin",
    size: 18,
    price: 132,
    tag: "Smart value",
    amenities: ["Refundable"],
    specs: "City view · 18m² · 1 single bed",
  },
  {
    id: "double-std",
    name: "Classic Double",
    type: "Standard",
    bed: "Queen",
    size: 24,
    price: 168,
    tag: null,
    amenities: ["Breakfast", "Refundable"],
    specs: "Courtyard view · 24m² · Queen bed",
  },
  {
    id: "deluxe-double",
    name: "Deluxe Double",
    type: "Deluxe",
    bed: "King",
    size: 28,
    price: 184,
    tag: "Most booked",
    amenities: ["Breakfast", "Balcony", "Refundable"],
    specs: "City view · 28m² · King bed",
  },
  {
    id: "twin-deluxe",
    name: "Deluxe Twin",
    type: "Deluxe",
    bed: "Twin",
    size: 30,
    price: 196,
    tag: null,
    amenities: ["Breakfast", "Balcony"],
    specs: "Garden view · 30m² · 2 twin beds",
  },
  {
    id: "junior-suite",
    name: "Junior Suite",
    type: "Suite",
    bed: "King",
    size: 42,
    price: 268,
    tag: "Suite",
    amenities: ["Breakfast", "Balcony", "Refundable"],
    specs: "Balcony · 42m² · King + lounge area",
  },
  {
    id: "signature-suite",
    name: "Signature Suite",
    type: "Suite",
    bed: "King",
    size: 64,
    price: 412,
    tag: "Top suite",
    amenities: ["Breakfast", "Balcony", "Refundable"],
    specs: "Terrace · 64m² · Separate living room",
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  maxPrice: 520,
  type: new Set(),
  bed: new Set(),
  amenity: new Set(),
  sort: "rec",
};

const list = document.getElementById("roomList");
const empty = document.getElementById("empty");
const countEl = document.getElementById("count");
const toast = document.getElementById("toast");

const eur = (n) => "€" + n.toLocaleString("en-GB");

function passes(r) {
  if (r.price > state.maxPrice) return false;
  if (state.type.size && !state.type.has(r.type)) return false;
  if (state.bed.size && !state.bed.has(r.bed)) return false;
  for (const a of state.amenity) if (!r.amenities.includes(a)) return false;
  return true;
}

function sortRooms(rooms) {
  const s = [...rooms];
  if (state.sort === "price-asc") s.sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc") s.sort((a, b) => b.price - a.price);
  else if (state.sort === "size-desc") s.sort((a, b) => b.size - a.size);
  return s;
}

function render() {
  const visible = sortRooms(ROOMS.filter(passes));
  countEl.textContent = visible.length;
  empty.hidden = visible.length > 0;

  list.innerHTML = visible
    .map((r) => {
      const total = r.price * NIGHTS;
      const badges = r.amenities
        .map(
          (a) =>
            `<span class="badge ${a === "Refundable" ? "green" : ""}">${a === "Refundable" ? "Free cancellation" : a}</span>`
        )
        .join("");
      return `
      <article class="room">
        <div class="room-img t-${r.type.toLowerCase()}">
          ${r.tag ? `<span class="room-tag">${r.tag}</span>` : ""}
        </div>
        <div class="room-body">
          <h3>${r.name}</h3>
          <p class="room-specs">${r.specs}</p>
          <div class="badges">${badges}</div>
        </div>
        <div class="room-buy">
          <p class="price-night">${eur(r.price)} / night</p>
          <p class="price-total">${eur(total)}</p>
          <p class="price-sub">total · ${NIGHTS} nights · incl. taxes</p>
          <button class="select-btn" data-name="${r.name}">Select room</button>
        </div>
      </article>`;
    })
    .join("");
}

// ── Wiring ────────────────────────────────────────────────────────────────────
const priceRange = document.getElementById("priceRange");
const priceOut = document.getElementById("priceOut");
priceRange.addEventListener("input", () => {
  state.maxPrice = Number(priceRange.value);
  priceOut.textContent = eur(state.maxPrice);
  render();
});

document.querySelectorAll('input[type="checkbox"][data-filter]').forEach((cb) => {
  cb.addEventListener("change", () => {
    const bucket = state[cb.dataset.filter];
    if (cb.checked) bucket.add(cb.value);
    else bucket.delete(cb.value);
    render();
  });
});

document.getElementById("sort").addEventListener("change", (e) => {
  state.sort = e.target.value;
  render();
});

document.getElementById("clearFilters").addEventListener("click", () => {
  state.type.clear();
  state.bed.clear();
  state.amenity.clear();
  state.maxPrice = 520;
  state.sort = "rec";
  priceRange.value = 520;
  priceOut.textContent = eur(520);
  document.getElementById("sort").value = "rec";
  document
    .querySelectorAll('input[type="checkbox"][data-filter]')
    .forEach((cb) => (cb.checked = false));
  render();
});

list.addEventListener("click", (e) => {
  const btn = e.target.closest(".select-btn");
  if (!btn) return;
  showToast(`${btn.dataset.name} selected · continuing to room details…`);
});

document.querySelector(".edit-btn").addEventListener("click", () => showToast("Edit search"));

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2400);
}

render();
