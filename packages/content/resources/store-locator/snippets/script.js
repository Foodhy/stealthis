const STORES = [
  {
    id: 1,
    name: "Acme — Manhattan",
    addr: "350 5th Ave, New York, NY",
    dist: "0.4 km",
    open: true,
    flagship: true,
    x: 55,
    y: 42,
  },
  {
    id: 2,
    name: "Acme — SoHo",
    addr: "120 Spring St, New York, NY",
    dist: "1.8 km",
    open: true,
    flagship: false,
    x: 48,
    y: 60,
  },
  {
    id: 3,
    name: "Acme — Brooklyn",
    addr: "1 Court Square, LIC, NY",
    dist: "3.2 km",
    open: false,
    flagship: false,
    x: 72,
    y: 65,
  },
  {
    id: 4,
    name: "Acme — Hoboken",
    addr: "88 River St, Hoboken, NJ",
    dist: "5.1 km",
    open: true,
    flagship: false,
    x: 28,
    y: 50,
  },
  {
    id: 5,
    name: "Acme — Upper West",
    addr: "2109 Broadway, New York, NY",
    dist: "6.3 km",
    open: true,
    flagship: false,
    x: 50,
    y: 28,
  },
];

const list = document.getElementById("slList");
const pinsEl = document.getElementById("mapPins");
const popup = document.getElementById("selectedPopup");
let activeFilter = "all";
let searchQ = "";
let activeId = null;

function renderList() {
  list.innerHTML = "";
  STORES.forEach((s) => {
    const visible = filterMatch(s);
    const div = document.createElement("div");
    div.className = "sl-item" + (activeId === s.id ? " active" : "") + (visible ? "" : " hidden");
    const tags = [
      s.open ? '<span class="sl-tag sl-tag--open">Open now</span>' : "",
      s.flagship ? '<span class="sl-tag sl-tag--flagship">Flagship</span>' : "",
    ]
      .filter(Boolean)
      .join("");
    div.innerHTML = `
      <div class="sl-item-header"><span class="sl-item-name">${s.name}</span><span class="sl-item-dist">${s.dist}</span></div>
      <p class="sl-item-addr">${s.addr}</p>
      <div class="sl-item-tags">${tags}</div>
    `;
    div.addEventListener("click", () => selectStore(s.id));
    list.appendChild(div);
  });
}

function renderPins() {
  pinsEl.innerHTML = "";
  STORES.forEach((s) => {
    const pin = document.createElement("div");
    pin.className = "map-pin-el" + (activeId === s.id ? " active" : "");
    pin.style.left = s.x + "%";
    pin.style.top = s.y + "%";
    pin.innerHTML = `<svg width="20" height="28" viewBox="0 0 24 32" fill="none"><path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20s12-12 12-20c0-6.627-5.373-12-12-12z" fill="#6366f1"/><circle cx="12" cy="12" r="5" fill="#fff"/></svg>`;
    pin.addEventListener("click", () => selectStore(s.id));
    pinsEl.appendChild(pin);
  });
}

function filterMatch(s) {
  if (searchQ && !s.name.toLowerCase().includes(searchQ) && !s.addr.toLowerCase().includes(searchQ))
    return false;
  if (activeFilter === "open" && !s.open) return false;
  if (activeFilter === "flagship" && !s.flagship) return false;
  return true;
}

function selectStore(id) {
  activeId = id;
  const s = STORES.find((x) => x.id === id);
  document.getElementById("popupName").textContent = s.name;
  document.getElementById("popupAddr").textContent = s.addr;
  popup.hidden = false;
  renderList();
  renderPins();
}

document.getElementById("slSearch").addEventListener("input", (e) => {
  searchQ = e.target.value.toLowerCase();
  renderList();
});

document.querySelectorAll(".sf-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sf-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderList();
  });
});

renderList();
renderPins();
