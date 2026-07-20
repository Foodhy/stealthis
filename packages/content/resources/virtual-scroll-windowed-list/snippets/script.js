/* Windowed list: fixed row height, absolute spacer, translated row pool. */
(() => {
  const viewport = document.getElementById("viewport");
  const spacer = document.getElementById("spacer");
  const rowsEl = document.getElementById("rows");
  const overscanInput = document.getElementById("overscan");
  const overscanOut = document.getElementById("overscan-out");
  const jumpInput = document.getElementById("jump");
  const jumpBtn = document.getElementById("jump-btn");
  const statTotal = document.getElementById("stat-total");
  const statDom = document.getElementById("stat-dom");
  const statRange = document.getElementById("stat-range");

  const ROW_H = 44;
  const TOTAL = 20000;
  const STATES = ["ok", "ok", "ok", "warn", "down"];
  const REGIONS = ["us-east", "us-west", "eu-central", "ap-south", "sa-east"];
  const NAMES = ["ingest", "auth", "billing", "search", "media", "queue", "edge", "reports"];

  // Deterministic pseudo-random so rows are stable across re-renders.
  const hash = (n) => {
    let x = (n * 2654435761) % 4294967296;
    x ^= x >>> 15;
    return Math.abs(x);
  };
  const record = (i) => {
    const h = hash(i + 1);
    return {
      name: `${NAMES[h % NAMES.length]}-${String(i + 1).padStart(5, "0")}`,
      state: STATES[(h >> 3) % STATES.length],
      ms: 12 + ((h >> 7) % 780),
      region: REGIONS[(h >> 11) % REGIONS.length],
    };
  };

  let overscan = Number(overscanInput.value);
  let active = 0;
  let start = -1;
  let end = -1;
  let frame = 0;

  spacer.style.height = `${TOTAL * ROW_H}px`;
  statTotal.textContent = TOTAL.toLocaleString();

  const pool = []; // reused <li> elements

  function makeRow() {
    const li = document.createElement("li");
    li.className = "row";
    li.setAttribute("role", "option");
    li.innerHTML =
      '<span class="idx"></span>' +
      '<span class="name"><i class="dot"></i><span></span></span>' +
      '<span class="val"></span>' +
      '<span class="tag"></span>';
    rowsEl.append(li);
    return li;
  }

  function paint(li, i) {
    const r = record(i);
    li.id = `row-${i}`;
    li.dataset.index = String(i);
    li.setAttribute("aria-posinset", String(i + 1));
    li.setAttribute("aria-setsize", String(TOTAL));
    li.setAttribute("aria-selected", i === active ? "true" : "false");
    li.children[0].textContent = String(i + 1);
    li.children[1].firstElementChild.dataset.state = r.state;
    li.children[1].lastElementChild.textContent = r.name;
    li.children[2].textContent = `${r.ms} ms`;
    li.children[3].textContent = r.region;
  }

  function render(force) {
    const scrollTop = viewport.scrollTop;
    const visible = Math.ceil(viewport.clientHeight / ROW_H);
    const first = Math.max(0, Math.floor(scrollTop / ROW_H) - overscan);
    const last = Math.min(TOTAL, first + visible + overscan * 2 + 1);

    if (!force && first === start && last === end) return;
    start = first;
    end = last;

    const need = last - first;
    while (pool.length < need) pool.push(makeRow());
    for (let k = 0; k < pool.length; k++) {
      const li = pool[k];
      if (k < need) {
        li.hidden = false;
        paint(li, first + k);
      } else if (!li.hidden) {
        li.hidden = true;
      }
    }

    rowsEl.style.transform = `translateY(${first * ROW_H}px)`;
    statDom.textContent = String(need);
    statRange.textContent = `${first + 1}–${last}`;
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      render(false);
    });
  }

  function setActive(i, { scroll = true } = {}) {
    active = Math.max(0, Math.min(TOTAL - 1, i));
    if (scroll) {
      const top = active * ROW_H;
      const bottom = top + ROW_H;
      if (top < viewport.scrollTop) viewport.scrollTop = top;
      else if (bottom > viewport.scrollTop + viewport.clientHeight) {
        viewport.scrollTop = bottom - viewport.clientHeight;
      }
    }
    viewport.setAttribute("aria-activedescendant", `row-${active}`);
    render(true);
  }

  viewport.addEventListener("scroll", schedule, { passive: true });
  new ResizeObserver(() => render(true)).observe(viewport);

  viewport.addEventListener("keydown", (e) => {
    const page = Math.max(1, Math.floor(viewport.clientHeight / ROW_H) - 1);
    const moves = {
      ArrowDown: active + 1,
      ArrowUp: active - 1,
      PageDown: active + page,
      PageUp: active - page,
      Home: 0,
      End: TOTAL - 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    setActive(moves[e.key]);
  });

  rowsEl.addEventListener("click", (e) => {
    const li = e.target.closest(".row");
    if (li) setActive(Number(li.dataset.index), { scroll: false });
  });

  overscanInput.addEventListener("input", () => {
    overscan = Number(overscanInput.value);
    overscanOut.textContent = overscanInput.value;
    render(true);
  });

  const jump = () => {
    const i = Math.max(1, Math.min(TOTAL, Number(jumpInput.value) || 1)) - 1;
    viewport.scrollTop = i * ROW_H;
    setActive(i, { scroll: false });
    viewport.focus();
  };
  jumpBtn.addEventListener("click", jump);
  jumpInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") jump();
  });

  render(true);
})();
