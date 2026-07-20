/* Windowed Card Grid — manual virtualization over a responsive column grid. */
(() => {
  const TOTAL = 5000;
  const MIN_CARD_W = 210;
  const OVERSCAN = 2; // extra rows above and below the viewport

  const viewport = document.getElementById("viewport");
  const sizer = document.getElementById("sizer");
  const win = document.getElementById("window");
  const statRendered = document.getElementById("statRendered");
  const statCols = document.getElementById("statCols");
  const statRows = document.getElementById("statRows");
  const jump = document.getElementById("jump");
  const jumpBtn = document.getElementById("jumpBtn");

  document.getElementById("totalCount").textContent = TOTAL.toLocaleString();
  jump.max = String(TOTAL);

  const px = (name) =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

  // Deterministic pseudo-random data so cards look stable while scrolling.
  const NOUNS = ["Report", "Cluster", "Segment", "Cohort", "Pipeline", "Snapshot", "Batch", "Signal"];
  const record = (i) => {
    const h = (i * 2654435761) % 4294967296;
    return {
      id: i,
      hue: h % 360,
      name: `${NOUNS[h % NOUNS.length]} ${String(i + 1).padStart(4, "0")}`,
      pct: 5 + (h % 95),
    };
  };

  let cols = 0;
  let rows = 0;
  let rowH = 0;
  let firstRow = -1;
  let lastRow = -1;
  const pool = new Map(); // index -> element (reused across renders)

  function buildCard(i) {
    const d = record(i);
    const el = document.createElement("article");
    el.className = "card";
    el.style.setProperty("--hue", d.hue);
    el.setAttribute("aria-posinset", i + 1);
    el.setAttribute("aria-setsize", TOTAL);
    el.innerHTML =
      '<div class="card-top">' +
      `<span class="avatar" aria-hidden="true">${d.name.slice(0, 2).toUpperCase()}</span>` +
      `<span><span class="card-title">${d.name}</span><br><span class="card-id">#${i + 1}</span></span>` +
      "</div>" +
      '<div class="card-meta">' +
      `<span class="bar"><i style="width:${d.pct}%"></i></span><span>${d.pct}%</span>` +
      "</div>";
    return el;
  }

  function measure() {
    const gap = px("--gap");
    const cardH = px("--card-h");
    const inner = viewport.clientWidth - 2 * gap;
    const nextCols = Math.max(1, Math.floor((inner + gap) / (MIN_CARD_W + gap)));
    rowH = cardH + gap;
    if (nextCols !== cols) {
      cols = nextCols;
      win.style.setProperty("--cols", cols);
      rows = Math.ceil(TOTAL / cols);
      sizer.style.height = `${rows * rowH - gap}px`;
      firstRow = lastRow = -1; // force a full re-render
      pool.forEach((el) => el.remove());
      pool.clear();
    }
  }

  function render() {
    const viewRows = Math.ceil(viewport.clientHeight / rowH);
    const start = Math.max(0, Math.floor(viewport.scrollTop / rowH) - OVERSCAN);
    const end = Math.min(rows - 1, start + viewRows + OVERSCAN * 2);
    if (start === firstRow && end === lastRow) return;
    firstRow = start;
    lastRow = end;

    const from = start * cols;
    const to = Math.min(TOTAL - 1, (end + 1) * cols - 1);

    // Recycle: keep nodes still in range, build only the newly visible ones,
    // then re-append in index order (append moves existing nodes, no rebuild).
    pool.forEach((el, i) => {
      if (i < from || i > to) {
        el.remove();
        pool.delete(i);
      }
    });
    const frag = document.createDocumentFragment();
    for (let i = from; i <= to; i++) {
      let el = pool.get(i);
      if (!el) {
        el = buildCard(i);
        pool.set(i, el);
      }
      frag.append(el);
    }
    win.append(frag);

    win.style.transform = `translateY(${start * rowH}px)`;
    statRendered.textContent = pool.size;
    statCols.textContent = cols;
    statRows.textContent = `${start + 1}–${end + 1} / ${rows}`;
  }

  let ticking = false;
  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      render();
    });
  };

  viewport.addEventListener("scroll", schedule, { passive: true });
  new ResizeObserver(() => {
    measure();
    render();
  }).observe(viewport);

  function scrollToIndex(i) {
    const clamped = Math.min(TOTAL - 1, Math.max(0, i));
    viewport.scrollTop = Math.floor(clamped / cols) * rowH;
    schedule();
  }

  jumpBtn.addEventListener("click", () => scrollToIndex((parseInt(jump.value, 10) || 1) - 1));
  jump.addEventListener("keydown", (e) => {
    if (e.key === "Enter") jumpBtn.click();
  });

  viewport.addEventListener("keydown", (e) => {
    const page = Math.max(1, Math.floor(viewport.clientHeight / rowH) - 1);
    const row = Math.round(viewport.scrollTop / rowH);
    const go = (r) => {
      viewport.scrollTop = Math.max(0, Math.min(rows - 1, r)) * rowH;
      schedule();
      e.preventDefault();
    };
    if (e.key === "ArrowDown") go(row + 1);
    else if (e.key === "ArrowUp") go(row - 1);
    else if (e.key === "PageDown") go(row + page);
    else if (e.key === "PageUp") go(row - page);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(rows - 1);
  });

  measure();
  render();
})();
