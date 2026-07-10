/*
 * Interactive demos for the Playbooks docs.
 * Plain web components (shadow DOM) so they can live inside raw Markdown.
 * Colors come from Starlight CSS custom properties, which inherit through
 * the shadow boundary, so light/dark themes work automatically.
 *
 * Elements:
 *   <pb-race>   — O(n·m) nested scan vs O(n+m) Map index, side by side
 *   <pb-block>  — really blocks the main thread vs chunked vs worker
 *   <pb-vlist>  — render-all list vs virtualized list, live DOM counts
 *   <pb-lanes>  — sequential vs unbounded vs bounded-concurrency timeline
 */
(() => {
  if (customElements.get("pb-race")) return;

  const BASE_CSS = `
    :host { display:block; margin:1.75rem 0; }
    * { box-sizing:border-box; }
    .wrap {
      border:1px solid var(--sl-color-gray-5, #444);
      border-radius:.6rem; padding:1rem 1rem .85rem;
      background:var(--sl-color-gray-7, var(--sl-color-black, #17181c));
      color:var(--sl-color-white, #eee);
      font-size:.82rem; line-height:1.45;
    }
    .head { display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; margin-bottom:.8rem; }
    .title { font-weight:600; font-size:.85rem; }
    .hint { color:var(--sl-color-gray-3, #999); font-size:.75rem; }
    button {
      font:inherit; font-weight:600; cursor:pointer;
      color:var(--sl-color-white, #eee);
      background:var(--sl-color-gray-6, #2a2b31);
      border:1px solid var(--sl-color-gray-5, #444);
      border-radius:.45rem; padding:.3rem .7rem;
    }
    button:hover:not(:disabled) { border-color:var(--sl-color-gray-3, #888); }
    button:disabled { opacity:.45; cursor:default; }
    button.primary { background:var(--sl-color-accent-low, #1b3a57); border-color:var(--sl-color-accent, #3b82f6); }
    .note { margin-top:.75rem; color:var(--sl-color-gray-3, #999); font-size:.75rem; }
    .mono { font-variant-numeric:tabular-nums; font-family:var(--__sl-font-mono, ui-monospace, monospace); }
  `;

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };
  const fmt = (x) => x.toLocaleString("en-US");

  /* ------------------------------------------------------------------ */
  /* <pb-race> — nested scan vs indexed lookup                           */
  /* ------------------------------------------------------------------ */
  class PbRace extends HTMLElement {
    connectedCallback() {
      this.n = parseInt(this.getAttribute("n") || "12", 10);
      this.m = parseInt(this.getAttribute("m") || "14", 10);
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .panels { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
        @media (max-width:640px){ .panels { grid-template-columns:1fr; } }
        .panel { border:1px solid var(--sl-color-gray-5,#444); border-radius:.5rem; padding:.7rem .75rem; }
        .plabel { font-weight:600; margin-bottom:.15rem; }
        .psub { color:var(--sl-color-gray-3,#999); font-size:.72rem; margin-bottom:.55rem; }
        .cells { display:grid; grid-template-columns:repeat(${this.m},1fr); gap:3px; margin-bottom:.6rem; }
        .cell { aspect-ratio:1; border-radius:2px; background:var(--sl-color-gray-5,#3a3b40); transition:background .12s; }
        .cell.scan { background:#e5484d; }
        .cell.built { background:var(--sl-color-accent-low,#1b3a57); }
        .cell.hit { background:var(--sl-color-accent,#3b82f6); }
        .stats { display:flex; justify-content:space-between; gap:.5rem; font-size:.75rem; }
        .ops { font-weight:700; }
        .done { color:var(--sl-color-accent,#3b82f6); font-weight:700; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      const title = el("div", "title", this.getAttribute("title") || "Same job, two shapes");
      const btns = el("div");
      this.runBtn = el("button", "primary", "▶ Run");
      this.resetBtn = el("button", null, "Reset");
      this.resetBtn.style.marginLeft = ".4rem";
      btns.append(this.runBtn, this.resetBtn);
      head.append(title, btns);

      const panels = el("div", "panels");
      this.left = this.buildPanel(
        this.getAttribute("left-label") || "O(n·m) — scan inside the loop",
        this.getAttribute("left-sub") || "each item re-scans the array until it finds its match"
      );
      this.right = this.buildPanel(
        this.getAttribute("right-label") || "O(n+m) — index first, then O(1) lookups",
        this.getAttribute("right-sub") || "one pass to build the Map, one flash per lookup"
      );
      panels.append(this.left.panel, this.right.panel);

      this.noteEl = el("div", "note", this.getAttribute("note") || "");
      wrap.append(head, panels, this.noteEl);
      root.append(wrap);

      this.runBtn.addEventListener("click", () => this.run());
      this.resetBtn.addEventListener("click", () => this.reset());
      this.reset();
    }

    buildPanel(label, sub) {
      const panel = el("div", "panel");
      const cells = el("div", "cells");
      for (let i = 0; i < this.m; i++) cells.append(el("div", "cell"));
      const stats = el("div", "stats");
      const items = el("span", "mono", "");
      const ops = el("span", "ops mono", "");
      stats.append(items, ops);
      panel.append(el("div", "plabel", label), el("div", "psub", sub), cells, stats);
      return { panel, cells: [...cells.children], items, ops };
    }

    reset() {
      clearInterval(this.timer);
      this.runBtn.disabled = false;
      for (const p of [this.left, this.right]) {
        for (const c of p.cells) c.className = "cell";
        p.items.textContent = `items 0/${this.n}`;
        p.ops.textContent = "0 ops";
        p.ops.classList.remove("done");
      }
    }

    run() {
      this.reset();
      this.runBtn.disabled = true;
      const { n, m } = this;
      // deterministic "random" targets so every run tells the same story
      const target = (i) => 1 + ((i * 7 + 3) % m);

      const L = { item: 0, j: 0, ops: 0, done: false };
      const R = { phase: 0, j: 0, item: 0, ops: 0, done: false };

      this.timer = setInterval(() => {
        // left: one comparison per tick
        if (!L.done) {
          this.left.cells.forEach((c) => c.classList.remove("scan", "hit"));
          const t = target(L.item);
          L.j++; L.ops++;
          if (L.j < t) {
            this.left.cells[L.j - 1].classList.add("scan");
          } else {
            this.left.cells[t - 1].classList.add("hit");
            L.item++; L.j = 0;
            if (L.item >= n) L.done = true;
          }
          this.left.items.textContent = `items ${Math.min(L.item, n)}/${n}`;
          this.left.ops.textContent = `${fmt(L.ops)} ops`;
          if (L.done) this.left.ops.classList.add("done");
        }
        // right: build phase, then one O(1) lookup per tick
        if (!R.done) {
          if (R.phase === 0) {
            this.right.cells[R.j].classList.add("built");
            R.j++; R.ops++;
            if (R.j >= m) R.phase = 1;
          } else {
            this.right.cells.forEach((c) => c.classList.remove("hit"));
            const t = target(R.item);
            this.right.cells[t - 1].classList.add("hit");
            R.item++; R.ops++;
            if (R.item >= n) R.done = true;
          }
          this.right.items.textContent = `items ${Math.min(R.item, n)}/${n}`;
          this.right.ops.textContent = `${fmt(R.ops)} ops`;
          if (R.done) this.right.ops.classList.add("done");
        }
        if (L.done && R.done) {
          clearInterval(this.timer);
          this.runBtn.disabled = false;
        }
      }, 45);
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-block> — genuinely block the main thread vs chunk vs worker     */
  /* ------------------------------------------------------------------ */
  class PbBlock extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .stage { position:relative; height:56px; border:1px solid var(--sl-color-gray-5,#444);
                 border-radius:.5rem; margin:.5rem 0 .7rem; overflow:hidden; }
        .ball { position:absolute; top:14px; width:28px; height:28px; border-radius:50%;
                background:var(--sl-color-accent,#3b82f6); will-change:transform; }
        .row { display:flex; gap:.5rem; flex-wrap:wrap; align-items:center; }
        .fps { min-width:6.5rem; }
        .status { margin-top:.55rem; font-size:.75rem; color:var(--sl-color-gray-3,#999); min-height:1.2em; }
        .warn { color:#e5484d; font-weight:600; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      head.append(
        el("div", "title", "Feel the event loop"),
        el("div", "hint", "the ball and this page share ONE thread")
      );
      const stage = el("div", "stage");
      this.ball = el("div", "ball");
      stage.append(this.ball);

      const row = el("div", "row");
      this.fpsEl = el("span", "fps mono", "-- fps");
      this.clickBtn = el("button", null, "Click me: 0");
      this.blockBtn = el("button", "primary", "Block 2s (sync loop)");
      this.chunkBtn = el("button", "primary", "Chunked 2s");
      this.workerBtn = el("button", "primary", "Worker 2s");
      row.append(this.fpsEl, this.clickBtn, this.blockBtn, this.chunkBtn, this.workerBtn);
      this.status = el("div", "status", "Run a task, then try clicking while it works.");
      wrap.append(head, stage, row, this.status);
      root.append(wrap);

      let clicks = 0;
      this.clickBtn.addEventListener("click", () => {
        this.clickBtn.textContent = `Click me: ${++clicks}`;
      });
      this.blockBtn.addEventListener("click", () => this.block());
      this.chunkBtn.addEventListener("click", () => this.chunk());
      this.workerBtn.addEventListener("click", () => this.worker());

      // ball + fps, driven by rAF so a blocked loop freezes them honestly
      let t0 = performance.now();
      let frames = 0;
      let lastFps = performance.now();
      const loop = (now) => {
        if (!this.isConnected) return;
        const w = stage.clientWidth - 28;
        const x = (Math.sin((now - t0) / 500) * 0.5 + 0.5) * Math.max(w, 0);
        this.ball.style.transform = `translateX(${x}px)`;
        frames++;
        if (now - lastFps >= 1000) {
          this.fpsEl.textContent = `${frames} fps`;
          frames = 0;
          lastFps = now;
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    busy(ms) {
      const end = performance.now() + ms;
      while (performance.now() < end) { /* burn */ }
    }

    setStatus(text, warn) {
      this.status.textContent = text;
      this.status.classList.toggle("warn", !!warn);
    }

    block() {
      this.setStatus("Blocking the main thread for 2s — nothing on this page can move…", true);
      // let the status paint first, then take the thread hostage
      setTimeout(() => {
        const t = performance.now();
        this.busy(2000);
        this.setStatus(`Blocked for ${Math.round(performance.now() - t)}ms — the ball froze, clicks queued.`);
      }, 60);
    }

    async chunk() {
      this.setStatus("Same 2s of CPU work, in 25ms slices with a yield between each…");
      const t = performance.now();
      let done = 0;
      while (done < 2000) {
        this.busy(25);
        done += 25;
        await new Promise((r) => setTimeout(r, 0));
      }
      this.setStatus(`Chunked: ${Math.round(performance.now() - t)}ms wall time — ball kept moving, clicks worked.`);
    }

    worker() {
      this.setStatus("Same 2s of CPU work on a Worker thread…");
      const src = `self.onmessage = (e) => { const end = Date.now() + e.data; while (Date.now() < end) {} postMessage("done") }`;
      const w = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
      const t = performance.now();
      w.onmessage = () => {
        this.setStatus(`Worker: ${Math.round(performance.now() - t)}ms — main thread never even noticed.`);
        w.terminate();
      };
      w.postMessage(2000);
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-vlist> — render everything vs render the window                 */
  /* ------------------------------------------------------------------ */
  class PbVlist extends HTMLElement {
    connectedCallback() {
      this.ROWS = parseInt(this.getAttribute("rows") || "5000", 10);
      this.H = 28;
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .panels { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
        @media (max-width:640px){ .panels { grid-template-columns:1fr; } }
        .plabel { font-weight:600; margin-bottom:.35rem; }
        .list { height:236px; overflow-y:auto; border:1px solid var(--sl-color-gray-5,#444);
                border-radius:.5rem; position:relative; }
        .rowi { height:28px; line-height:28px; padding:0 .6rem; font-size:.72rem;
                white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .rowi:nth-child(odd) { background:color-mix(in srgb, var(--sl-color-gray-5,#444) 26%, transparent); }
        .vrow { position:absolute; left:0; right:0; }
        .meta { margin-top:.4rem; font-size:.73rem; color:var(--sl-color-gray-3,#999); min-height:2.4em; }
        .meta b { color:var(--sl-color-white,#eee); }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      head.append(el("div", "title", `Scroll both — same ${fmt(this.ROWS)} rows`), (this.loadBtn = el("button", "primary", `Load ${fmt(this.ROWS)} rows`)));
      const panels = el("div", "panels");

      const mk = (label) => {
        const box = el("div");
        const list = el("div", "list");
        const meta = el("div", "meta", "—");
        box.append(el("div", "plabel", label), list, meta);
        return { box, list, meta };
      };
      this.full = mk("Render all — O(n) DOM nodes");
      this.virt = mk("Virtualized — O(visible) DOM nodes");
      panels.append(this.full.box, this.virt.box);
      wrap.append(head, panels);
      root.append(wrap);

      this.loadBtn.addEventListener("click", () => this.load());
    }

    row(i, cls) {
      const r = el("div", cls, `#${i + 1} — order ${1000 + i} · user ${(i * 7) % 900}`);
      return r;
    }

    load() {
      this.loadBtn.disabled = true;
      const { ROWS, H } = this;

      // full render
      let t = performance.now();
      const frag = document.createDocumentFragment();
      for (let i = 0; i < ROWS; i++) frag.append(this.row(i, "rowi"));
      this.full.list.append(frag);
      const fullMs = performance.now() - t;
      this.full.meta.innerHTML = `DOM rows: <b>${fmt(ROWS)}</b> · built in <b>${fullMs.toFixed(0)}ms</b>`;

      // virtualized render
      t = performance.now();
      const spacer = el("div");
      spacer.style.height = `${ROWS * H}px`;
      spacer.style.position = "relative";
      this.virt.list.append(spacer);
      const pool = [];
      const paint = () => {
        const top = this.virt.list.scrollTop;
        const first = Math.max(0, Math.floor(top / H) - 2);
        const count = Math.ceil(236 / H) + 4;
        while (pool.length < count) {
          const r = this.row(0, "rowi vrow");
          pool.push(r);
          spacer.append(r);
        }
        for (let k = 0; k < pool.length; k++) {
          const i = first + k;
          const r = pool[k];
          if (i >= ROWS) { r.style.display = "none"; continue; }
          r.style.display = "";
          r.style.top = `${i * H}px`;
          r.textContent = `#${i + 1} — order ${1000 + i} · user ${(i * 7) % 900}`;
          r.style.background = i % 2 ? "" : "color-mix(in srgb, var(--sl-color-gray-5,#444) 26%, transparent)";
        }
        this.virt.meta.innerHTML = `DOM rows: <b>${pool.length}</b> · built in <b>${virtMs.toFixed(1)}ms</b> · scrolled to #${fmt(first + 1)}`;
      };
      const virtMs = performance.now() - t;
      paint();
      this.virt.list.addEventListener("scroll", () => requestAnimationFrame(paint));
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-lanes> — sequential vs unbounded vs bounded concurrency         */
  /* ------------------------------------------------------------------ */
  class PbLanes extends HTMLElement {
    connectedCallback() {
      this.N = 12;
      // deterministic durations, 150–500ms
      this.durs = Array.from({ length: this.N }, (_, i) => 150 + ((i * 97) % 8) * 50);
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .rows { display:grid; gap:4px; margin:.6rem 0 .5rem; }
        .lane { display:grid; grid-template-columns:2.6rem 1fr; align-items:center; gap:.5rem; }
        .lname { font-size:.68rem; color:var(--sl-color-gray-3,#999); }
        .track { position:relative; height:14px; border-radius:3px;
                 background:color-mix(in srgb, var(--sl-color-gray-5,#444) 40%, transparent); }
        .bar { position:absolute; top:0; bottom:0; border-radius:3px;
               background:var(--sl-color-accent,#3b82f6); opacity:.9; }
        .bar.waiting { background:var(--sl-color-gray-4,#666); opacity:.5; }
        .total { font-weight:700; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      const btns = el("div");
      this.buttons = {};
      for (const [mode, label] of [["seq", "Sequential"], ["all", "All at once"], ["lim", "Limit 3"]]) {
        const b = el("button", "primary", label);
        b.style.marginRight = ".4rem";
        b.addEventListener("click", () => this.run(mode));
        this.buttons[mode] = b;
        btns.append(b);
      }
      head.append(el("div", "title", `${this.N} requests, same durations every run`), btns);

      const rows = el("div", "rows");
      this.lanes = this.durs.map((_, i) => {
        const lane = el("div", "lane");
        const track = el("div", "track");
        const bar = el("div", "bar");
        bar.style.width = "0";
        track.append(bar);
        lane.append(el("div", "lname mono", `req ${i + 1}`), track);
        rows.append(lane);
        return bar;
      });
      this.totalEl = el("div", "note", "Pick a strategy — bars show when each request runs.");
      wrap.append(head, rows, this.totalEl);
      root.append(wrap);
    }

    schedule(mode) {
      const starts = [];
      if (mode === "seq") {
        let t = 0;
        for (const d of this.durs) { starts.push(t); t += d; }
      } else if (mode === "all") {
        this.durs.forEach(() => starts.push(0));
      } else {
        const K = 3;
        const free = Array(K).fill(0);
        for (const d of this.durs) {
          const lane = free.indexOf(Math.min(...free));
          starts.push(free[lane]);
          free[lane] += d;
        }
      }
      const total = Math.max(...starts.map((s, i) => s + this.durs[i]));
      return { starts, total };
    }

    run(mode) {
      cancelAnimationFrame(this.raf);
      Object.values(this.buttons).forEach((b) => (b.disabled = true));
      const { starts, total } = this.schedule(mode);
      const labels = { seq: "sequential (await in a loop)", all: "unbounded Promise.all", lim: "bounded, 3 in flight" };
      const t0 = performance.now();
      const step = () => {
        const t = performance.now() - t0;
        for (let i = 0; i < this.N; i++) {
          const bar = this.lanes[i];
          const s = starts[i], d = this.durs[i];
          bar.style.left = `${(s / total) * 100}%`;
          const p = Math.max(0, Math.min(1, (t - s) / d));
          bar.style.width = `${(p * d / total) * 100}%`;
          bar.classList.toggle("waiting", t < s);
        }
        this.totalEl.innerHTML = `<span class="mono">${labels[mode]}</span> — elapsed <b class="total mono">${Math.min(t, total).toFixed(0)}ms</b>${t >= total ? ` · done (total <b class="mono">${total.toFixed(0)}ms</b>)` : ""}`;
        if (t < total) this.raf = requestAnimationFrame(step);
        else Object.values(this.buttons).forEach((b) => (b.disabled = false));
      };
      this.raf = requestAnimationFrame(step);
    }
  }

  customElements.define("pb-race", PbRace);
  customElements.define("pb-block", PbBlock);
  customElements.define("pb-vlist", PbVlist);
  customElements.define("pb-lanes", PbLanes);
})();
