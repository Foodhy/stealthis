/* Masonry Bento Layout — column-balanced masonry with drag + keyboard reordering. */
(() => {
  const board = document.querySelector("#board");
  const colsInput = document.querySelector("#cols");
  const colsOut = document.querySelector("#colsOut");
  const balanceInput = document.querySelector("#balance");
  const shuffleBtn = document.querySelector("#shuffle");
  const live = document.querySelector("#live");
  if (!board) return;

  const DATA = [
    { tag: "Research", title: "Discovery notes", body: "Twelve interviews synthesised into four recurring jobs-to-be-done.", lines: 3 },
    { tag: "Signals", title: "Weekly activation", body: "Activation is up 6.2% week over week, driven mostly by the new empty state.", lines: 5 },
    { tag: "Metrics", title: "p95 latency", body: "142 ms", lines: 1 },
    { tag: "Notes", title: "Design debt", body: "Two legacy modals still bypass the focus trap and need migrating.", lines: 4 },
    { tag: "Team", title: "On call", body: "Ana → Wed, Marco → Thu.", lines: 2 },
    { tag: "Revenue", title: "MRR", body: "Expansion revenue now covers churn for the third consecutive month.", lines: 6 },
    { tag: "Support", title: "Backlog", body: "31 open tickets, median first reply 47 min.", lines: 2 },
    { tag: "Release", title: "v2.9", body: "Ships Friday behind a flag; rollback plan documented.", lines: 3 }
  ];

  let order = DATA.map((_, i) => i);
  let dragFrom = null;

  function makeTile(item, index) {
    const el = document.createElement("article");
    el.className = "tile";
    el.draggable = true;
    el.tabIndex = 0;
    el.dataset.index = String(index);
    el.setAttribute("role", "listitem");
    el.setAttribute("aria-roledescription", "reorderable tile");

    const tag = document.createElement("span");
    tag.className = "tile__tag";
    tag.textContent = item.tag;

    const h = document.createElement("h2");
    h.textContent = item.title;

    const p = document.createElement("p");
    // `lines` fakes varying intrinsic height — that is what makes masonry visible.
    p.textContent = Array.from({ length: item.lines }, () => item.body).join(" ");

    const bar = document.createElement("div");
    bar.className = "tile__bar";
    bar.style.width = 30 + item.lines * 10 + "%";

    el.append(tag, h, p, bar);
    return el;
  }

  /* Layout ------------------------------------------------------------- */

  function columnCount() {
    const requested = Number(colsInput.value);
    const w = board.clientWidth || window.innerWidth;
    // Responsive clamp: never squeeze columns below ~220px.
    return Math.max(1, Math.min(requested, Math.floor(w / 220) || 1));
  }

  function layout() {
    const n = columnCount();
    const balanced = balanceInput.checked;

    board.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
    board.replaceChildren();

    const cols = [];
    const heights = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const c = document.createElement("div");
      c.className = "board__col";
      c.setAttribute("role", "list");
      cols.push(c);
      board.append(c);
    }

    order.forEach((dataIndex, pos) => {
      const tile = makeTile(DATA[dataIndex], pos);
      // Shortest-column-first placement needs a measured height, so tiles are
      // appended provisionally then measured; without balancing we round-robin.
      const target = balanced ? heights.indexOf(Math.min(...heights)) : pos % n;
      cols[target].append(tile);
      heights[target] += tile.offsetHeight + 14;
    });
  }

  /* Reordering --------------------------------------------------------- */

  function move(from, to) {
    if (to < 0 || to >= order.length || from === to) return;
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    layout();
    const moved = board.querySelector(`.tile[data-index="${to}"]`);
    if (moved) moved.focus();
    live.textContent = `${DATA[item].title} moved to position ${to + 1} of ${order.length}.`;
  }

  board.addEventListener("dragstart", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;
    dragFrom = Number(tile.dataset.index);
    tile.classList.add("is-dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(dragFrom));
  });

  board.addEventListener("dragover", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile || dragFrom === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    board.querySelectorAll(".is-over").forEach((t) => t.classList.remove("is-over"));
    tile.classList.add("is-over");
  });

  board.addEventListener("drop", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile || dragFrom === null) return;
    e.preventDefault();
    move(dragFrom, Number(tile.dataset.index));
    dragFrom = null;
  });

  board.addEventListener("dragend", () => {
    dragFrom = null;
    board.querySelectorAll(".is-dragging, .is-over")
      .forEach((t) => t.classList.remove("is-dragging", "is-over"));
  });

  board.addEventListener("keydown", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;
    const i = Number(tile.dataset.index);
    const n = columnCount();
    const map = {
      ArrowLeft: i - 1,
      ArrowRight: i + 1,
      ArrowUp: balanceInput.checked ? i - 1 : i - n,
      ArrowDown: balanceInput.checked ? i + 1 : i + n
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    move(i, Math.max(0, Math.min(order.length - 1, map[e.key])));
  });

  /* Controls ----------------------------------------------------------- */

  colsInput.addEventListener("input", () => {
    colsOut.textContent = colsInput.value;
    layout();
  });
  balanceInput.addEventListener("change", layout);
  shuffleBtn.addEventListener("click", () => {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    layout();
    live.textContent = "Tiles shuffled.";
  });

  let raf = 0;
  const onResize = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(layout);
  };
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(board);
  else window.addEventListener("resize", onResize);

  layout();
})();
