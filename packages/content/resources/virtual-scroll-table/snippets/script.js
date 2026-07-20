/* Virtualized Table — manual windowing over 10,000 rows.
   Only ~visible rows + overscan exist in the DOM at any time. */
(() => {
  const viewport = document.getElementById("vt-viewport");
  const spacer = document.getElementById("vt-spacer");
  const windowEl = document.getElementById("vt-window");
  const filterInput = document.getElementById("vt-filter");
  const sortSelect = document.getElementById("vt-sort");
  const emptyEl = document.getElementById("vt-empty");
  const nodesEl = document.getElementById("vt-nodes");
  const rangeEl = document.getElementById("vt-range");
  const totalEl = document.getElementById("vt-total");
  if (!viewport || !windowEl) return;

  const ROW_H = 44;      // must match --row-h
  const OVERSCAN = 4;
  const TOTAL = 10000;

  /* ---- deterministic dataset (no network, no deps) ---- */
  const REGIONS = ["Nordic", "Iberia", "Benelux", "Levant", "Andes", "Pacific NW", "Sahel"];
  const WORDS = ["Helio", "Vertex", "Quanta", "Lumen", "Orbit", "Cinder", "Nimbus", "Talos", "Auric", "Kestrel"];
  let seed = 1337;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const DATA = Array.from({ length: TOTAL }, (_, i) => {
    const name = `${WORDS[Math.floor(rnd() * WORDS.length)]} ${WORDS[Math.floor(rnd() * WORDS.length)]}`;
    const uptime = 96 + rnd() * 4;
    return {
      id: i + 1,
      name,
      region: REGIONS[Math.floor(rnd() * REGIONS.length)],
      revenue: Math.round(5000 + rnd() * 995000),
      uptime,
      status: uptime > 99.5 ? "ok" : uptime > 98 ? "warn" : "bad",
    };
  });

  const money = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  });
  const STATUS_LABEL = { ok: "Healthy", warn: "Degraded", bad: "At risk" };

  /* ---- derived view (filter + sort) ---- */
  let view = DATA;
  let selectedIndex = -1;

  function recompute() {
    const q = filterInput.value.trim().toLowerCase();
    view = q
      ? DATA.filter((r) => r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q))
      : DATA;

    const key = sortSelect.value;
    if (key !== "id") {
      view = view.slice().sort((a, b) =>
        key === "name" ? a.name.localeCompare(b.name) : b[key] - a[key]
      );
    }

    selectedIndex = -1;
    spacer.style.height = `${view.length * ROW_H}px`;
    totalEl.textContent = view.length.toLocaleString();
    emptyEl.hidden = view.length > 0;
    viewport.scrollTop = 0;
    // force: the window range is often unchanged (scrollTop already 0), but the
    // underlying rows changed — a non-forced render would early-out and keep stale rows.
    render(true);
  }

  /* ---- the windowing core ---- */
  let lastStart = -1;
  let lastEnd = -1;

  function render(force) {
    const scrollTop = viewport.scrollTop;
    const visible = Math.ceil(viewport.clientHeight / ROW_H);
    const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
    const end = Math.min(view.length, start + visible + OVERSCAN * 2);

    if (!force && start === lastStart && end === lastEnd) return;
    lastStart = start;
    lastEnd = end;

    windowEl.style.transform = `translateY(${start * ROW_H}px)`;

    let html = "";
    for (let i = start; i < end; i++) {
      const r = view[i];
      html +=
        `<div class="vt-row vt-row--data" role="row" data-index="${i}"` +
        ` aria-rowindex="${i + 1}" aria-selected="${i === selectedIndex}">` +
        `<span class="vt-id" role="cell">#${r.id}</span>` +
        `<span class="vt-name" role="cell">${r.name}</span>` +
        `<span class="vt-region" role="cell">${r.region}</span>` +
        `<span class="num" role="cell">${money.format(r.revenue)}</span>` +
        `<span class="num" role="cell">${r.uptime.toFixed(2)}%</span>` +
        `<span role="cell"><span class="vt-badge ${r.status}">${STATUS_LABEL[r.status]}</span></span>` +
        `</div>`;
    }
    windowEl.innerHTML = html;

    nodesEl.textContent = end - start;
    rangeEl.textContent = view.length ? `${start + 1}–${end}` : "0–0";
  }

  /* ---- scroll: coalesce into one rAF per frame ---- */
  let ticking = false;
  viewport.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; render(); });
  }, { passive: true });

  new ResizeObserver(() => render(true)).observe(viewport);

  /* ---- selection + keyboard navigation ---- */
  function select(index) {
    if (!view.length) return;
    selectedIndex = Math.max(0, Math.min(view.length - 1, index));
    const top = selectedIndex * ROW_H;
    const bottom = top + ROW_H;
    if (top < viewport.scrollTop) viewport.scrollTop = top;
    else if (bottom > viewport.scrollTop + viewport.clientHeight) {
      viewport.scrollTop = bottom - viewport.clientHeight;
    }
    render(true);
  }

  windowEl.addEventListener("click", (e) => {
    const row = e.target.closest("[data-index]");
    if (row) select(Number(row.dataset.index));
  });

  viewport.addEventListener("keydown", (e) => {
    const page = Math.max(1, Math.floor(viewport.clientHeight / ROW_H) - 1);
    const base = selectedIndex < 0 ? Math.floor(viewport.scrollTop / ROW_H) - 1 : selectedIndex;
    const moves = {
      ArrowDown: base + 1,
      ArrowUp: base - 1,
      PageDown: base + page,
      PageUp: base - page,
      Home: 0,
      End: view.length - 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    select(moves[e.key]);
  });

  filterInput.addEventListener("input", recompute);
  sortSelect.addEventListener("change", recompute);

  recompute();
})();
