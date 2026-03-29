const SCHEMA = [
  {
    id: "users",
    name: "users",
    icon: "👤",
    x: 40,
    y: 60,
    cols: [
      { name: "id", type: "uuid", key: "pk" },
      { name: "email", type: "varchar(255)" },
      { name: "name", type: "varchar(100)" },
      { name: "created_at", type: "timestamp", nullable: true },
    ],
  },
  {
    id: "orders",
    name: "orders",
    icon: "📦",
    x: 320,
    y: 40,
    cols: [
      { name: "id", type: "uuid", key: "pk" },
      { name: "user_id", type: "uuid", key: "fk" },
      { name: "status", type: "varchar(20)" },
      { name: "total", type: "numeric(10,2)" },
      { name: "created_at", type: "timestamp" },
    ],
  },
  {
    id: "order_items",
    name: "order_items",
    icon: "🗂",
    x: 580,
    y: 40,
    cols: [
      { name: "id", type: "uuid", key: "pk" },
      { name: "order_id", type: "uuid", key: "fk" },
      { name: "product_id", type: "uuid", key: "fk" },
      { name: "quantity", type: "integer" },
      { name: "unit_price", type: "numeric(10,2)" },
    ],
  },
  {
    id: "products",
    name: "products",
    icon: "🏷",
    x: 580,
    y: 280,
    cols: [
      { name: "id", type: "uuid", key: "pk" },
      { name: "name", type: "varchar(200)" },
      { name: "price", type: "numeric(10,2)" },
      { name: "stock", type: "integer" },
      { name: "category_id", type: "uuid", key: "fk" },
    ],
  },
  {
    id: "categories",
    name: "categories",
    icon: "🗃",
    x: 320,
    y: 280,
    cols: [
      { name: "id", type: "uuid", key: "pk" },
      { name: "name", type: "varchar(100)" },
      { name: "slug", type: "varchar(100)" },
    ],
  },
];

const RELATIONS = [
  { from: "orders", fromCol: "user_id", to: "users", toCol: "id", label: "1:N" },
  { from: "order_items", fromCol: "order_id", to: "orders", toCol: "id", label: "1:N" },
  { from: "order_items", fromCol: "product_id", to: "products", toCol: "id", label: "1:N" },
  { from: "products", fromCol: "category_id", to: "categories", toCol: "id", label: "N:1" },
];

const canvas = document.getElementById("sdCanvas");
const container = document.getElementById("tableContainer");
const svgEl = document.getElementById("sdSvg");
const linesG = document.getElementById("lines");

const tableEls = {};
const positions = {};

function renderTable(t) {
  const el = document.createElement("div");
  el.className = "sd-table";
  el.id = `tbl-${t.id}`;
  el.style.left = t.x + "px";
  el.style.top = t.y + "px";
  positions[t.id] = { x: t.x, y: t.y };

  let html = `<div class="sd-table-header"><span class="sd-table-icon">${t.icon}</span><span class="sd-table-name">${t.name}</span></div>`;
  t.cols.forEach((col) => {
    const keyHtml =
      col.key === "pk"
        ? `<span class="col-key col-pk">🔑</span>`
        : col.key === "fk"
          ? `<span class="col-key col-fk">🔗</span>`
          : `<span class="col-key"></span>`;
    const nullable = col.nullable ? `<span class="col-nullable">?</span>` : "";
    html += `<div class="sd-col">${keyHtml}<span class="col-name">${col.name}</span><span class="col-type">${col.type}</span>${nullable}</div>`;
  });
  el.innerHTML = html;

  // Drag
  let dragging = false,
    ox = 0,
    oy = 0;
  el.addEventListener("mousedown", (e) => {
    dragging = true;
    ox = e.clientX - positions[t.id].x;
    oy = e.clientY - positions[t.id].y;
    el.classList.add("selected");
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const x = e.clientX - ox;
    const y = e.clientY - oy;
    positions[t.id] = { x, y };
    el.style.left = x + "px";
    el.style.top = y + "px";
    renderLines();
  });
  window.addEventListener("mouseup", () => {
    if (dragging) {
      dragging = false;
      el.classList.remove("selected");
    }
  });

  container.appendChild(el);
  tableEls[t.id] = el;
}

function getCenter(id) {
  const el = tableEls[id];
  const { x, y } = positions[id];
  return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
}

function renderLines() {
  linesG.innerHTML = "";
  RELATIONS.forEach((rel) => {
    const fc = getCenter(rel.from);
    const tc = getCenter(rel.to);
    const mx = (fc.x + tc.x) / 2;
    const my = (fc.y + tc.y) / 2;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `M ${fc.x} ${fc.y} C ${mx} ${fc.y}, ${mx} ${tc.y}, ${tc.x} ${tc.y}`;
    path.setAttribute("d", d);
    path.setAttribute("stroke", "#9ca3af");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("fill", "none");
    path.setAttribute("marker-end", "url(#arrow)");
    linesG.appendChild(path);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", mx);
    text.setAttribute("y", (fc.y + tc.y) / 2 - 4);
    text.setAttribute("text-anchor", "middle");
    text.className.baseVal = "rel-label";
    text.textContent = rel.label;
    linesG.appendChild(text);
  });
}

SCHEMA.forEach(renderTable);

// Resize observer to re-render lines when tables are sized
const ro = new ResizeObserver(renderLines);
Object.values(tableEls).forEach((el) => ro.observe(el));
renderLines();

// Fit button
document.getElementById("fitBtn").addEventListener("click", () => {
  SCHEMA.forEach((t, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    positions[t.id] = { x: 40 + col * 260, y: 60 + row * 220 };
    tableEls[t.id].style.left = positions[t.id].x + "px";
    tableEls[t.id].style.top = positions[t.id].y + "px";
  });
  renderLines();
});
