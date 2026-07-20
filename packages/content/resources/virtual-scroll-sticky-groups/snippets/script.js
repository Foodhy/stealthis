/* Sticky Group Headers — manual windowing over a flattened grouped list.
   Zero dependencies. Heights are explicit so offset math stays exact. */

const ROW_H = 52;
const HEAD_H = 34;
const OVERSCAN = 4;

const viewport = document.querySelector("[data-viewport]");
const sizer = document.querySelector("[data-sizer]");
const slice = document.querySelector("[data-slice]");
const sticky = document.querySelector("[data-sticky]");
const stat = (k) => document.querySelector(`[data-stat="${k}"]`);

/* ---------- fake data: 26 groups x ~230 rows ---------- */
const FIRST = ["Ada", "Bo", "Cyd", "Dev", "Eli", "Fay", "Gus", "Hana", "Ivo", "Jun", "Kai", "Lena", "Mira", "Noa", "Oz", "Pia", "Quin", "Rey", "Sol", "Tao"];
const LAST = ["Aster", "Brook", "Chen", "Duarte", "Eriks", "Fontan", "Grave", "Hollis", "Imani", "Jarv", "Kessler", "Lund", "Marek", "Novak", "Ortiz", "Pike", "Rossi", "Stein", "Tamm", "Vance"];
const HUES = [212, 268, 160, 32, 340, 190];

const groups = [];
for (let g = 0; g < 26; g++) {
  const letter = String.fromCharCode(65 + g);
  const count = 180 + ((g * 37) % 90);
  const rows = [];
  for (let i = 0; i < count; i++) {
    const f = FIRST[(g * 7 + i * 3) % FIRST.length];
    const l = LAST[(g * 11 + i * 5) % LAST.length];
    rows.push({
      name: `${letter}${f.slice(1)} ${l}`,
      hue: HUES[(g + i) % HUES.length],
      seen: `${1 + ((i * 13) % 28)}d ago`,
    });
  }
  groups.push({ label: `Group ${letter}`, rows });
}

/* ---------- flatten + prefix offsets ---------- */
const items = [];          // { kind, groupIndex, data }
for (let g = 0; g < groups.length; g++) {
  items.push({ kind: "head", groupIndex: g, data: groups[g] });
  for (const r of groups[g].rows) items.push({ kind: "row", groupIndex: g, data: r });
}

const offsets = new Float64Array(items.length + 1);
for (let i = 0; i < items.length; i++) {
  offsets[i + 1] = offsets[i] + (items[i].kind === "head" ? HEAD_H : ROW_H);
}
const totalHeight = offsets[items.length];
const rowCount = items.length - groups.length;

sizer.style.height = `${totalHeight}px`;
stat("total").textContent = rowCount.toLocaleString();

/** First index whose bottom edge is > y. */
function indexAt(y) {
  let lo = 0;
  let hi = items.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid + 1] <= y) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/* ---------- rendering ---------- */
let activeIndex = 1; // first row (index 0 is a header)
let rendered = { start: -1, end: -1 };

function buildNode(item, index) {
  if (item.kind === "head") {
    const h = document.createElement("div");
    h.className = "ghead";
    h.innerHTML = `<span></span><span class="ghead__count"></span>`;
    h.firstChild.textContent = item.data.label;
    h.lastChild.textContent = `${item.data.rows.length} people`;
    return h;
  }
  const r = document.createElement("div");
  r.className = "row";
  r.id = `vrow-${index}`;
  r.setAttribute("role", "option");
  r.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
  r.style.setProperty("--av", `hsl(${item.data.hue} 80% 70%)`);
  r.innerHTML = `<span class="row__avatar"></span><span class="row__name"></span><span class="row__meta"></span>`;
  r.children[0].textContent = item.data.name[0];
  r.children[1].textContent = item.data.name;
  r.children[2].textContent = item.data.seen;
  return r;
}

function render() {
  const top = viewport.scrollTop;
  const bottom = top + viewport.clientHeight;

  let start = Math.max(0, indexAt(top) - OVERSCAN);
  let end = Math.min(items.length - 1, indexAt(bottom) + OVERSCAN);

  if (start !== rendered.start || end !== rendered.end) {
    const frag = document.createDocumentFragment();
    for (let i = start; i <= end; i++) frag.append(buildNode(items[i], i));
    slice.replaceChildren(frag);
    slice.style.transform = `translateY(${offsets[start]}px)`;
    rendered = { start, end };
    stat("dom").textContent = String(end - start + 1);
  }

  // sticky label: the group owning the row at the top edge
  const g = items[indexAt(top)].groupIndex;
  const label = `${groups[g].label} · ${groups[g].rows.length} people`;
  if (sticky.textContent !== label) {
    sticky.textContent = label;
    stat("group").textContent = groups[g].label;
  }
}

let ticking = false;
viewport.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { ticking = false; render(); });
}, { passive: true });

new ResizeObserver(() => render()).observe(viewport);

/* ---------- keyboard navigation ---------- */
function setActive(index) {
  const next = Math.min(items.length - 1, Math.max(0, index));
  activeIndex = items[next].kind === "head" ? Math.min(items.length - 1, next + 1) : next;

  const top = offsets[activeIndex];
  const bottom = top + ROW_H;
  if (top - HEAD_H < viewport.scrollTop) viewport.scrollTop = Math.max(0, top - HEAD_H);
  else if (bottom > viewport.scrollTop + viewport.clientHeight) {
    viewport.scrollTop = bottom - viewport.clientHeight;
  }

  render();
  for (const el of slice.children) {
    if (el.classList.contains("row")) {
      el.setAttribute("aria-selected", el.id === `vrow-${activeIndex}` ? "true" : "false");
    }
  }
  viewport.setAttribute("aria-activedescendant", `vrow-${activeIndex}`);
}

const page = () => Math.max(1, Math.floor(viewport.clientHeight / ROW_H) - 1);

viewport.addEventListener("keydown", (e) => {
  const moves = {
    ArrowDown: () => activeIndex + 1,
    ArrowUp: () => activeIndex - 1,
    PageDown: () => activeIndex + page(),
    PageUp: () => activeIndex - page(),
    Home: () => 0,
    End: () => items.length - 1,
  };
  const fn = moves[e.key];
  if (!fn) return;
  e.preventDefault();
  setActive(fn());
});

viewport.addEventListener("click", (e) => {
  const row = e.target.closest(".row");
  if (row) setActive(Number(row.id.slice(5)));
});

render();
