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

  /* ------------------------------------------------------------------ */
  /* <pb-flow> — symptom → diagnosis → fix loop (index page)             */
  /* ------------------------------------------------------------------ */
  class PbFlow extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      const steps = ["Symptom", "Diagnosis", "Recommendation", "Trade-offs"];
      root.innerHTML = `<style>${BASE_CSS}
        .flow { display:flex; align-items:center; justify-content:center; gap:.5rem; flex-wrap:wrap; padding:.35rem 0; }
        .chip { border:1px solid var(--sl-color-gray-5,#444); border-radius:2rem; padding:.35rem .85rem;
                font-weight:600; font-size:.78rem; animation:pulse 4.8s infinite; }
        .arrow { color:var(--sl-color-gray-3,#999); animation:pulse 4.8s infinite; }
        @keyframes pulse {
          0%,100% { border-color:var(--sl-color-gray-5,#444); color:var(--sl-color-gray-2,#bbb); }
          12% { border-color:var(--sl-color-accent,#3b82f6); color:var(--sl-color-white,#fff); }
        }
      </style>
      <div class="wrap"><div class="flow">${steps
        .map((s, i) => `<span class="chip" style="animation-delay:${i * 1.2}s">${s}</span>${i < 3 ? `<span class="arrow" style="animation-delay:${i * 1.2 + 0.6}s">→</span>` : ""}`)
        .join("")}</div></div>`;
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-growth> — how each complexity class grows with n (slider)       */
  /* ------------------------------------------------------------------ */
  class PbGrowth extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        input[type=range] { width:min(320px,100%); accent-color:var(--sl-color-accent,#3b82f6); }
        .rows { display:grid; gap:.45rem; margin-top:.7rem; }
        .row { display:grid; grid-template-columns:6.2rem 1fr 6.5rem; gap:.6rem; align-items:center; }
        .lbl { font-weight:600; font-size:.76rem; }
        .track { height:14px; border-radius:3px; background:color-mix(in srgb, var(--sl-color-gray-5,#444) 35%, transparent); overflow:hidden; }
        .bar { height:100%; border-radius:3px; background:var(--sl-color-accent,#3b82f6); transition:width .2s; }
        .bar.hot { background:#e5484d; }
        .ops { font-size:.73rem; text-align:right; }
        .nval { font-weight:700; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      const title = el("div", "title");
      title.innerHTML = `n = <span class="nval mono">1,000</span> items`;
      this.nval = title.querySelector(".nval");
      this.slider = document.createElement("input");
      this.slider.type = "range";
      this.slider.min = "1"; this.slider.max = "4.3"; this.slider.step = "0.01"; this.slider.value = "3";
      head.append(title, this.slider);

      const classes = [
        ["O(1)", (n) => 1],
        ["O(log n)", (n) => Math.log2(n)],
        ["O(n)", (n) => n],
        ["O(n log n)", (n) => n * Math.log2(n)],
        ["O(n²)", (n) => n * n],
      ];
      const rows = el("div", "rows");
      this.bars = classes.map(([lbl, fn]) => {
        const row = el("div", "row");
        const track = el("div", "track");
        const bar = el("div", "bar");
        track.append(bar);
        const ops = el("div", "ops mono");
        row.append(el("div", "lbl mono", lbl), track, ops);
        rows.append(row);
        return { fn, bar, ops };
      });
      const note = el("div", "note", "Log-scale bars. Red = past ~10⁷ operations: a visible main-thread stall. O(n²) gets there at n in the low thousands; O(n) needs tens of millions.");
      wrap.append(head, rows, note);
      root.append(wrap);
      const si = (x) => x >= 1e9 ? (x / 1e9).toFixed(1) + "B" : x >= 1e6 ? (x / 1e6).toFixed(1) + "M" : x >= 1e3 ? (x / 1e3).toFixed(1) + "k" : String(Math.round(x));
      const update = () => {
        const n = Math.round(10 ** parseFloat(this.slider.value));
        this.nval.textContent = fmt(n);
        for (const { fn, bar, ops } of this.bars) {
          const v = fn(n);
          bar.style.width = `${Math.min(100, (Math.log10(v + 1) / 9) * 100)}%`;
          bar.classList.toggle("hot", v > 1e7);
          ops.textContent = `${si(v)} ops`;
        }
      };
      this.slider.addEventListener("input", update);
      update();
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-search> — real filtering over 40k strings, naive vs prepared    */
  /* ------------------------------------------------------------------ */
  class PbSearch extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .panels { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
        @media (max-width:640px){ .panels { grid-template-columns:1fr; } }
        .plabel { font-weight:600; margin-bottom:.4rem; font-size:.78rem; }
        input[type=text] { width:100%; font:inherit; padding:.4rem .6rem; border-radius:.45rem;
          border:1px solid var(--sl-color-gray-5,#444); background:var(--sl-color-gray-6,#222); color:inherit; }
        .stat { margin-top:.45rem; font-size:.74rem; color:var(--sl-color-gray-3,#999); min-height:1.2em; }
        .stat b { color:var(--sl-color-white,#eee); }
      </style>`;
      const ADJ = ["fast", "lazy", "green", "spicy", "quiet", "brave", "vivid", "rustic"];
      const NOUN = ["falcon", "kernel", "teapot", "harbor", "cactus", "violin", "packet", "lantern"];
      const N = 40000;
      const data = Array.from({ length: N }, (_, i) => `${ADJ[i % 8]} ${NOUN[(i >> 3) % 8]} Model-${i} (${ADJ[(i * 5) % 8]} edition)`);
      const dataLc = data.map((s) => s.toLowerCase());

      const wrap = el("div", "wrap");
      const head = el("div", "head");
      head.append(el("div", "title", `Type in both — same ${fmt(N)} records`), el("div", "hint", 'try "spicy falcon"'));
      const panels = el("div", "panels");

      const mk = (label) => {
        const box = el("div");
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "search…";
        const stat = el("div", "stat", "—");
        box.append(el("div", "plabel", label), input, stat);
        panels.append(box);
        return { input, stat };
      };
      const naive = mk("Naive — toLowerCase() per item, per keystroke");
      const prep = mk("Prepared — normalized once + debounced 250ms");

      naive.input.addEventListener("input", () => {
        const q = naive.input.value;
        const t = performance.now();
        const hits = data.filter((s) => s.toLowerCase().includes(q.toLowerCase()));
        naive.stat.innerHTML = `scan: <b>${(performance.now() - t).toFixed(1)}ms</b> per keystroke · ${fmt(hits.length)} matches`;
      });
      let deb;
      prep.input.addEventListener("input", () => {
        prep.stat.innerHTML = `echo instant · waiting for pause…`;
        clearTimeout(deb);
        deb = setTimeout(() => {
          const q = prep.input.value.toLowerCase();
          const t = performance.now();
          let count = 0;
          for (const s of dataLc) if (s.includes(q)) count++;
          prep.stat.innerHTML = `scan: <b>${(performance.now() - t).toFixed(1)}ms</b>, once per pause · ${fmt(count)} matches`;
        }, 250);
      });
      wrap.append(head, panels, el("div", "note", "Left pays normalization × 40,000 × every keystroke. Right pays it once at load and reacts once per pause — same results."));
      root.append(wrap);
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-sortcost> — comparator cost measured for real                   */
  /* ------------------------------------------------------------------ */
  class PbSortcost extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .res { display:grid; gap:.4rem; margin-top:.6rem; font-size:.8rem; }
        .res b { font-variant-numeric:tabular-nums; }
        .bar { height:12px; border-radius:3px; background:var(--sl-color-accent,#3b82f6); transition:width .3s; }
        .bar.slow { background:#e5484d; }
        .rrow { display:grid; grid-template-columns:16rem 1fr 5.5rem; gap:.6rem; align-items:center; }
        @media (max-width:640px){ .rrow { grid-template-columns:1fr; } .bar{display:none} }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      this.btn = el("button", "primary", "▶ Sort 60,000 rows by date — both ways");
      head.append(el("div", "title", "Same sort, two comparators (measured live on your machine)"), this.btn);
      const res = el("div", "res");
      const row = (label) => {
        const r = el("div", "rrow");
        const lbl = el("div", null, label);
        const bar = el("div", "bar");
        bar.style.width = "0";
        const ms = el("div", "mono", "");
        r.append(lbl, bar, ms);
        res.append(r);
        return { bar, ms };
      };
      this.slow = row("new Date(a.createdAt) inside the comparator");
      this.fast = row("precompute timestamps once, compare numbers");
      this.slow.bar.classList.add("slow");
      this.summary = el("div", "note", "Same O(n log n) shape — the comparator runs ~n·log n times, so what's inside it multiplies.");
      wrap.append(head, res, this.summary);
      root.append(wrap);

      this.btn.addEventListener("click", () => {
        this.btn.disabled = true;
        setTimeout(() => {
          const N = 60000;
          const rows = Array.from({ length: N }, (_, i) => ({
            createdAt: new Date(1500000000000 + ((i * 2654435761) % 500000000) * 1000).toISOString(),
          }));
          let t = performance.now();
          [...rows].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          const slowMs = performance.now() - t;

          t = performance.now();
          const keyed = rows.map((r) => ({ r, ts: Date.parse(r.createdAt) }));
          keyed.sort((a, b) => a.ts - b.ts);
          keyed.map((k) => k.r);
          const fastMs = performance.now() - t;

          const max = Math.max(slowMs, fastMs);
          this.slow.bar.style.width = `${(slowMs / max) * 100}%`;
          this.fast.bar.style.width = `${Math.max(2, (fastMs / max) * 100)}%`;
          this.slow.ms.textContent = `${slowMs.toFixed(0)}ms`;
          this.fast.ms.textContent = `${fastMs.toFixed(0)}ms`;
          this.summary.textContent = `${(slowMs / fastMs).toFixed(1)}× faster by hoisting the key extraction — same order, same results.`;
          this.btn.disabled = false;
        }, 30);
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-input> — heavy work per keystroke vs debounced (really felt)    */
  /* ------------------------------------------------------------------ */
  class PbInput extends HTMLElement {
    busy(ms) { const end = performance.now() + ms; while (performance.now() < end) {} }
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .panels { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
        @media (max-width:640px){ .panels { grid-template-columns:1fr; } }
        .plabel { font-weight:600; margin-bottom:.4rem; font-size:.78rem; }
        input { width:100%; font:inherit; padding:.4rem .6rem; border-radius:.45rem;
          border:1px solid var(--sl-color-gray-5,#444); background:var(--sl-color-gray-6,#222); color:inherit; }
        .stat { margin-top:.45rem; font-size:.74rem; color:var(--sl-color-gray-3,#999); min-height:1.2em; }
      </style>`;
      const wrap = el("div", "wrap");
      wrap.append(Object.assign(el("div", "head"), {}));
      wrap.firstChild.append(
        el("div", "title", "Type fast in both — 80ms of reaction work per keystroke"),
        el("div", "hint", "left really lags; that's the demo")
      );
      const panels = el("div", "panels");
      const mk = (label) => {
        const box = el("div");
        const input = document.createElement("input");
        input.placeholder = "type here fast…";
        const stat = el("div", "stat", "—");
        box.append(el("div", "plabel", label), input, stat);
        panels.append(box);
        return { input, stat };
      };
      const sync = mk("Reaction runs synchronously on every keystroke");
      const deb = mk("Echo instant, reaction debounced 250ms");
      sync.input.addEventListener("input", () => {
        this.busy(80);
        sync.stat.textContent = "80ms burned before your character could paint";
      });
      let timer, count = 0;
      deb.input.addEventListener("input", () => {
        deb.stat.textContent = "echo painted instantly — reaction waiting for a pause…";
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.busy(80);
          deb.stat.textContent = `reaction ran once (${++count} total) after you paused — typing never felt it`;
        }, 250);
      });
      wrap.append(panels, el("div", "note", "The keystroke's task must finish before the browser can paint the character you typed. Left puts 80ms in that path; right takes it out."));
      root.append(wrap);
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-eventloop> — step through task → microtasks → paint             */
  /* ------------------------------------------------------------------ */
  class PbEventloop extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .cols { display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:.6rem; margin:.6rem 0; }
        @media (max-width:640px){ .cols { grid-template-columns:1fr 1fr; } }
        .col { border:1px solid var(--sl-color-gray-5,#444); border-radius:.5rem; padding:.5rem; min-height:5.2rem; }
        .clabel { font-size:.68rem; color:var(--sl-color-gray-3,#999); margin-bottom:.35rem; text-transform:uppercase; letter-spacing:.04em; }
        .chip { display:block; border-radius:.35rem; padding:.22rem .45rem; font-size:.72rem; margin-bottom:.25rem;
                background:var(--sl-color-gray-6,#2a2b31); border:1px solid var(--sl-color-gray-5,#444); }
        .chip.running { background:var(--sl-color-accent-low,#1b3a57); border-color:var(--sl-color-accent,#3b82f6); font-weight:600; }
        .paintbox { display:flex; align-items:center; justify-content:center; width:3.6rem; border-radius:.5rem;
                    border:1px dashed var(--sl-color-gray-5,#444); font-size:1.2rem; opacity:.25; transition:all .2s; }
        .paintbox.on { opacity:1; border-color:var(--sl-color-accent,#3b82f6); background:var(--sl-color-accent-low,#1b3a57); }
        .desc { min-height:2.6em; font-size:.78rem; }
        .stepn { color:var(--sl-color-gray-3,#999); }
      </style>`;
      this.steps = [
        { d: "Idle. A click lands in the task queue.", stack: null, micro: [], tasks: ["click handler"], paint: false },
        { d: "The loop takes the task. The handler runs to completion — nothing can interrupt it. (Blocking = staying here.)", stack: "click handler", micro: [], tasks: [], paint: false },
        { d: "Inside the handler: promise.then(cb) queues a MICROtask; setTimeout(cb) queues a task.", stack: "click handler", micro: ["promise cb"], tasks: ["timeout cb"], paint: false },
        { d: "Handler finishes. Before anything else: drain the microtask queue — all of it.", stack: null, micro: ["promise cb"], tasks: ["timeout cb"], paint: false },
        { d: "The promise callback runs. New microtasks queued here would also run now, before any render.", stack: "promise cb", micro: [], tasks: ["timeout cb"], paint: false },
        { d: "Microtasks empty → the browser may paint a frame now.", stack: null, micro: [], tasks: ["timeout cb"], paint: true },
        { d: "Next loop turn: the timeout callback (a plain task) gets the thread.", stack: "timeout cb", micro: [], tasks: [], paint: false },
        { d: "Done — loop waits for the next task. One task, all microtasks, maybe paint. Repeat forever.", stack: null, micro: [], tasks: [], paint: true },
      ];
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      this.stepBtn = el("button", "primary", "Step ▸");
      this.resetBtn = el("button", null, "Reset");
      this.resetBtn.style.marginLeft = ".4rem";
      const btns = el("div");
      btns.append(this.stepBtn, this.resetBtn);
      head.append(el("div", "title", "One turn of the event loop, step by step"), btns);

      const cols = el("div", "cols");
      const mkcol = (label) => {
        const c = el("div", "col");
        c.append(el("div", "clabel", label));
        const body = el("div");
        c.append(body);
        cols.append(c);
        return body;
      };
      this.stackEl = mkcol("Call stack");
      this.microEl = mkcol("Microtask queue");
      this.tasksEl = mkcol("Task queue");
      this.paintEl = el("div", "paintbox", "🖌");
      cols.append(this.paintEl);
      this.descEl = el("div", "desc");
      wrap.append(head, cols, this.descEl);
      root.append(wrap);

      this.i = 0;
      this.stepBtn.addEventListener("click", () => { this.i = Math.min(this.i + 1, this.steps.length - 1); this.render(); });
      this.resetBtn.addEventListener("click", () => { this.i = 0; this.render(); });
      this.render();
    }
    render() {
      const s = this.steps[this.i];
      const fill = (host, items, running) => {
        host.textContent = "";
        for (const it of items) host.append(el("span", `chip${running ? " running" : ""}`, it));
      };
      fill(this.stackEl, s.stack ? [s.stack] : [], true);
      fill(this.microEl, s.micro, false);
      fill(this.tasksEl, s.tasks, false);
      this.paintEl.classList.toggle("on", s.paint);
      this.descEl.innerHTML = `<span class="stepn mono">${this.i + 1}/${this.steps.length}</span> — ${s.d}`;
      this.stepBtn.disabled = this.i === this.steps.length - 1;
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-pipeline> — which stages each kind of change triggers           */
  /* ------------------------------------------------------------------ */
  class PbPipeline extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .stages { display:flex; gap:.4rem; align-items:center; margin:.7rem 0 .4rem; flex-wrap:wrap; }
        .stage { flex:1; min-width:4.2rem; text-align:center; padding:.5rem .3rem; border-radius:.45rem;
                 border:1px solid var(--sl-color-gray-5,#444); font-size:.74rem; font-weight:600;
                 opacity:.45; transition:all .18s; }
        .stage.lit { opacity:1; border-color:var(--sl-color-accent,#3b82f6); background:var(--sl-color-accent-low,#1b3a57); }
        .stage.skipped { opacity:.25; text-decoration:line-through; }
        .arr { color:var(--sl-color-gray-3,#999); }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      const btns = el("div");
      this.geoBtn = el("button", "primary", "Change width / top");
      this.compBtn = el("button", "primary", "Change transform / opacity");
      this.compBtn.style.marginLeft = ".4rem";
      btns.append(this.geoBtn, this.compBtn);
      head.append(el("div", "title", "What each kind of change costs"), btns);

      const names = ["JS", "Style", "Layout", "Paint", "Composite"];
      const stages = el("div", "stages");
      this.boxes = names.map((n, i) => {
        const b = el("div", "stage", n);
        stages.append(b);
        if (i < names.length - 1) stages.append(el("span", "arr", "→"));
        return b;
      });
      this.noteEl = el("div", "note", "Geometry changes re-run the whole line for every affected node. transform/opacity skip straight to the GPU.");
      wrap.append(head, stages, this.noteEl);
      root.append(wrap);

      this.geoBtn.addEventListener("click", () => this.play([0, 1, 2, 3, 4], []));
      this.compBtn.addEventListener("click", () => this.play([0, 1, 4], [2, 3]));
    }
    play(lit, skipped) {
      clearTimeout(this.t);
      this.boxes.forEach((b) => b.classList.remove("lit", "skipped"));
      skipped.forEach((i) => this.boxes[i].classList.add("skipped"));
      const step = (k) => {
        if (k >= lit.length) return;
        this.boxes[lit[k]].classList.add("lit");
        this.t = setTimeout(() => step(k + 1), 260);
      };
      step(0);
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-images> — layout shift vs reserved space, side by side          */
  /* ------------------------------------------------------------------ */
  class PbImages extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .panels { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
        @media (max-width:640px){ .panels { grid-template-columns:1fr; } }
        .plabel { font-weight:600; margin-bottom:.4rem; font-size:.78rem; }
        .page { border:1px solid var(--sl-color-gray-5,#444); border-radius:.5rem; padding:.6rem; height:170px; overflow:hidden; }
        .txt { height:7px; border-radius:3px; margin:.35rem 0; background:color-mix(in srgb, var(--sl-color-gray-4,#666) 55%, transparent); }
        .txt.short { width:62%; }
        .imgpop { height:0; border-radius:.3rem; background:var(--sl-color-accent-low,#1b3a57);
                  border:0 solid var(--sl-color-accent,#3b82f6); transition:height .25s; }
        .imgpop.loaded { height:38px; border-width:1px; }
        .imgres { height:38px; border-radius:.3rem; border:1px dashed var(--sl-color-gray-5,#444);
                  background:color-mix(in srgb, var(--sl-color-gray-5,#444) 20%, transparent); position:relative; }
        .fill { position:absolute; inset:0; border-radius:.3rem; background:var(--sl-color-accent-low,#1b3a57);
                border:1px solid var(--sl-color-accent,#3b82f6); opacity:0; transition:opacity .35s; }
        .fill.loaded { opacity:1; }
        .stat { margin-top:.4rem; font-size:.74rem; color:var(--sl-color-gray-3,#999); }
        .stat b.bad { color:#e5484d; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      this.btn = el("button", "primary", "▶ Load the page");
      head.append(el("div", "title", "Same page, images arriving over a slow network"), this.btn);
      const panels = el("div", "panels");

      const mkPage = (reserved) => {
        const box = el("div");
        const page = el("div", "page");
        const imgs = [];
        for (let i = 0; i < 3; i++) {
          page.append(el("div", "txt"), el("div", "txt short"));
          if (reserved) {
            const holder = el("div", "imgres");
            const fill = el("div", "fill");
            holder.append(fill);
            page.append(holder);
            imgs.push(fill);
          } else {
            const img = el("div", "imgpop");
            page.append(img);
            imgs.push(img);
          }
        }
        page.append(el("div", "txt"), el("div", "txt short"), el("div", "txt"));
        const stat = el("div", "stat", "—");
        box.append(el("div", "plabel", reserved ? "width/height set — space reserved" : "no dimensions — content jumps"), page, stat);
        panels.append(box);
        return { imgs, stat };
      };
      this.bad = mkPage(false);
      this.good = mkPage(true);
      wrap.append(head, panels, el("div", "note", "Left: every image arrival re-runs layout and shoves the text down — that's CLS, and the user was probably mid-read. Right: same arrivals, zero movement."));
      root.append(wrap);

      this.btn.addEventListener("click", () => {
        this.btn.disabled = true;
        [this.bad, this.good].forEach((p) => {
          p.imgs.forEach((i) => i.classList.remove("loaded"));
          p.stat.textContent = "loading…";
        });
        const delays = [500, 1300, 2200];
        delays.forEach((d, i) => {
          setTimeout(() => {
            this.bad.imgs[i].classList.add("loaded");
            this.bad.stat.innerHTML = `layout shifted <b class="bad">${i + 1}×</b>`;
            this.good.imgs[i].classList.add("loaded");
            this.good.stat.innerHTML = `layout shifts: <b>0</b>`;
            if (i === 2) this.btn.disabled = false;
          }, d);
        });
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-btree> — sequential scan vs B-tree walk                         */
  /* ------------------------------------------------------------------ */
  class PbBtree extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .panels { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
        @media (max-width:640px){ .panels { grid-template-columns:1fr; } }
        .plabel { font-weight:600; margin-bottom:.45rem; font-size:.78rem; }
        .grid { display:grid; grid-template-columns:repeat(8,1fr); gap:3px; }
        .cell { aspect-ratio:1.6; border-radius:2px; background:color-mix(in srgb, var(--sl-color-gray-5,#444) 55%, transparent); transition:background .1s; }
        .cell.read { background:#e5484d; }
        .cell.hit { background:var(--sl-color-accent,#3b82f6); }
        .lvl { display:flex; justify-content:center; gap:6px; margin-bottom:8px; }
        .node { padding:.28rem .5rem; border-radius:.3rem; font-size:.66rem;
                border:1px solid var(--sl-color-gray-5,#444); background:var(--sl-color-gray-6,#2a2b31); transition:all .15s; }
        .node.read { border-color:var(--sl-color-accent,#3b82f6); background:var(--sl-color-accent-low,#1b3a57); font-weight:700; }
        .stat { margin-top:.45rem; font-size:.75rem; }
        .stat b { font-variant-numeric:tabular-nums; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      this.btn = el("button", "primary", "▶ Find user_id = 42");
      head.append(el("div", "title", "Same row, two access paths"), this.btn);
      const panels = el("div", "panels");

      // left: table scan
      const L = el("div");
      L.append(el("div", "plabel", "Seq Scan — read every row, O(n)"));
      const grid = el("div", "grid");
      this.cells = [];
      for (let i = 0; i < 32; i++) { const c = el("div", "cell"); this.cells.push(c); grid.append(c); }
      this.lstat = el("div", "stat", "rows read: 0");
      L.append(grid, this.lstat);

      // right: index walk
      const R = el("div");
      R.append(el("div", "plabel", "Index Scan — B-tree walk, O(log n)"));
      const tree = el("div");
      this.nodes = [];
      const levels = [["root: [500 | 2000]"], ["[100|300]", "[800|1500]", "[3000|…]"], ["leaf: 42 → row ptr"]];
      for (const lv of levels) {
        const lane = el("div", "lvl");
        for (const label of lv) { const n = el("div", "node", label); this.nodes.push(n); lane.append(n); }
        tree.append(lane);
      }
      const rowLane = el("div", "lvl");
      this.rowNode = el("div", "node", "table row #27");
      rowLane.append(this.rowNode);
      tree.append(rowLane);
      this.rstat = el("div", "stat", "pages read: 0");
      R.append(tree, this.rstat);

      panels.append(L, R);
      wrap.append(head, panels, el("div", "note", "At 32 rows it hardly matters. At 10,000,000 rows the scan reads 10M rows; the B-tree still reads ~4 pages."));
      root.append(wrap);

      this.btn.addEventListener("click", () => this.run());
    }
    run() {
      this.btn.disabled = true;
      this.cells.forEach((c) => (c.className = "cell"));
      this.nodes.forEach((n) => (n.className = "node"));
      this.rowNode.className = "node";
      const TARGET = 26;
      let i = 0;
      const scan = setInterval(() => {
        this.cells[i].classList.add(i === TARGET ? "hit" : "read");
        this.lstat.innerHTML = `rows read: <b>${i + 1}</b>${i === TARGET ? " · found (but a scan can't know it's the only one — it keeps going)" : ""}`;
        i++;
        if (i >= this.cells.length) { clearInterval(scan); this.btn.disabled = false; }
      }, 90);
      const path = [this.nodes[0], this.nodes[1], this.nodes[4], this.rowNode];
      path.forEach((n, k) => setTimeout(() => {
        n.classList.add("read");
        this.rstat.innerHTML = `pages read: <b>${k + 1}</b>${k === 3 ? " · done" : ""}`;
      }, 250 + k * 350));
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-nplus1> — 1+N round trips vs 2 queries                          */
  /* ------------------------------------------------------------------ */
  class PbNplus1 extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .panels { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
        @media (max-width:640px){ .panels { grid-template-columns:1fr; } }
        .plabel { font-weight:600; margin-bottom:.45rem; font-size:.78rem; }
        .tl { display:grid; gap:3px; }
        .q { position:relative; height:11px; border-radius:2px;
             background:color-mix(in srgb, var(--sl-color-gray-5,#444) 30%, transparent); }
        .qb { position:absolute; top:0; bottom:0; border-radius:2px; background:var(--sl-color-accent,#3b82f6); }
        .qb.n1 { background:#e5484d; }
        .stat { margin-top:.5rem; font-size:.75rem; }
        .stat b { font-variant-numeric:tabular-nums; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      this.btn = el("button", "primary", "▶ Run the request");
      head.append(el("div", "title", "GET /orders — the ORM's queries, on a timeline"), this.btn);

      // schedules (ms): 1 list query + 12 per-row queries vs 2 batched
      this.L = { bars: [], sched: [{ s: 0, d: 60 }], stat: null };
      for (let i = 0; i < 12; i++) this.L.sched.push({ s: 70 + i * 30, d: 22 });
      this.R = { bars: [], sched: [{ s: 0, d: 60 }, { s: 70, d: 42 }], stat: null };
      this.total = Math.max(...this.L.sched.map((q) => q.s + q.d));

      const panels = el("div", "panels");
      const mk = (side, label, cls) => {
        const box = el("div");
        const tl = el("div", "tl");
        for (const q of side.sched) {
          const track = el("div", "q");
          const bar = el("div", `qb ${cls}`);
          bar.style.left = `${(q.s / this.total) * 100}%`;
          bar.style.width = "0";
          track.append(bar);
          tl.append(track);
          side.bars.push(bar);
        }
        side.stat = el("div", "stat", "—");
        box.append(el("div", "plabel", label), tl, side.stat);
        panels.append(box);
      };
      mk(this.L, "Lazy relations — 1 + 12 round trips", "n1");
      mk(this.R, "include / JOIN — 2 round trips", "");
      wrap.append(head, panels, el("div", "note", "Each bar is one network round trip to the DB. Same data returned. With 100 rows the left side is 101 queries — before any of them is even slow."));
      root.append(wrap);
      this.btn.addEventListener("click", () => this.run());
    }
    run() {
      cancelAnimationFrame(this.raf);
      this.btn.disabled = true;
      const SLOW = 4; // 4× slow-motion
      const t0 = performance.now();
      const step = () => {
        const t = (performance.now() - t0) / SLOW;
        for (const side of [this.L, this.R]) {
          let done = 0;
          side.sched.forEach((q, i) => {
            const p = Math.max(0, Math.min(1, (t - q.s) / q.d));
            side.bars[i].style.width = `${(p * q.d / this.total) * 100}%`;
            if (p >= 1) done++;
          });
          const end = Math.max(...side.sched.map((q) => q.s + q.d));
          side.stat.innerHTML = `<b>${done}/${side.sched.length}</b> queries · ${t >= end ? `done in <b>${end}ms</b>` : `${Math.min(t, end).toFixed(0)}ms`}`;
        }
        if (t < this.total) this.raf = requestAnimationFrame(step);
        else this.btn.disabled = false;
      };
      this.raf = requestAnimationFrame(step);
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-cache> — every read hits the DB vs cache with TTL               */
  /* ------------------------------------------------------------------ */
  class PbCache extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .panels { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
        @media (max-width:640px){ .panels { grid-template-columns:1fr; } }
        .plabel { font-weight:600; margin-bottom:.45rem; font-size:.78rem; }
        .reqs { display:grid; gap:3px; min-height:12.2rem; align-content:start; }
        .req { display:flex; justify-content:space-between; gap:.4rem; font-size:.7rem; padding:.14rem .45rem;
               border-radius:.3rem; background:color-mix(in srgb, var(--sl-color-gray-5,#444) 25%, transparent); opacity:0; transition:opacity .15s; }
        .req.show { opacity:1; }
        .badge { font-weight:700; }
        .db { color:#e5484d; }
        .hit { color:var(--sl-color-accent,#3b82f6); }
        .stat { margin-top:.45rem; font-size:.75rem; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      this.btn = el("button", "primary", "▶ 12 requests for the same catalog");
      head.append(el("div", "title", "Same read, with and without a 60s TTL cache"), this.btn);
      const panels = el("div", "panels");
      const mk = (label) => {
        const box = el("div");
        const reqs = el("div", "reqs");
        const stat = el("div", "stat", "DB queries: 0");
        box.append(el("div", "plabel", label), reqs, stat);
        panels.append(box);
        return { reqs, stat };
      };
      this.no = mk("No cache — every request pays the query");
      this.yes = mk("cached('catalog', 60s) — first miss fills it");
      wrap.append(head, panels, el("div", "note", "Reads scale with traffic; the data changed zero times during those 12 requests. The cache turns 'per request' into 'per TTL window'."));
      root.append(wrap);
      this.btn.addEventListener("click", () => this.run());
    }
    run() {
      this.btn.disabled = true;
      this.no.reqs.textContent = ""; this.yes.reqs.textContent = "";
      let dbNo = 0, dbYes = 0;
      const N = 12;
      for (let i = 0; i < N; i++) {
        setTimeout(() => {
          const isTtlExpiry = i === 9;
          const rowA = el("div", "req");
          rowA.innerHTML = `<span>GET /catalog #${i + 1}</span><span class="badge db">DB · 14ms</span>`;
          this.no.reqs.append(rowA);
          requestAnimationFrame(() => rowA.classList.add("show"));
          this.no.stat.innerHTML = `DB queries: <b>${++dbNo}</b>`;

          const miss = i === 0 || isTtlExpiry;
          const rowB = el("div", "req");
          rowB.innerHTML = `<span>GET /catalog #${i + 1}${isTtlExpiry ? " (TTL expired)" : ""}</span><span class="badge ${miss ? "db" : "hit"}">${miss ? "DB · 14ms" : "cache · 0.05ms"}</span>`;
          this.yes.reqs.append(rowB);
          requestAnimationFrame(() => rowB.classList.add("show"));
          if (miss) dbYes++;
          this.yes.stat.innerHTML = `DB queries: <b>${dbYes}</b> · hits: <b>${i + 1 - dbYes}</b>`;
          if (i === N - 1) this.btn.disabled = false;
        }, i * 260);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-queue> — inline heavy work vs enqueue + worker                  */
  /* ------------------------------------------------------------------ */
  class PbQueue extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .panels { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
        @media (max-width:640px){ .panels { grid-template-columns:1fr; } }
        .plabel { font-weight:600; margin-bottom:.45rem; font-size:.78rem; }
        .lane { display:grid; grid-template-columns:3.4rem 1fr 4.2rem; gap:.45rem; align-items:center; margin-bottom:4px; }
        .lname { font-size:.66rem; color:var(--sl-color-gray-3,#999); }
        .track { position:relative; height:12px; border-radius:3px; background:color-mix(in srgb, var(--sl-color-gray-5,#444) 30%, transparent); }
        .bar { position:absolute; top:0; bottom:0; left:0; border-radius:3px; background:var(--sl-color-accent,#3b82f6); width:0; }
        .bar.inline { background:#c88a2b; }
        .bar.dead { background:#e5484d; }
        .bar.job { background:var(--sl-color-gray-3,#8b8d94); }
        .res { font-size:.66rem; text-align:right; font-variant-numeric:tabular-nums; }
        .res.bad { color:#e5484d; font-weight:700; }
        .sub { font-size:.68rem; color:var(--sl-color-gray-3,#999); margin:.35rem 0 .2rem; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      this.btn = el("button", "primary", "▶ 5 signups arrive");
      head.append(el("div", "title", "Email + thumbnails inline vs enqueued (timeout at 1,500ms)"), this.btn);
      const panels = el("div", "panels");

      const mkLane = (host, name) => {
        const lane = el("div", "lane");
        const track = el("div", "track");
        const bar = el("div", "bar");
        track.append(bar);
        const res = el("div", "res", "");
        lane.append(el("div", "lname mono", name), track, res);
        host.append(lane);
        return { bar, res };
      };
      const L = el("div"); L.append(el("div", "plabel", "Inline — response waits for the work"));
      const R = el("div"); R.append(el("div", "plabel", "Queue — respond in ~50ms, workers drain jobs"));
      this.inline = []; this.fast = []; this.jobs = [];
      this.durs = [900, 1400, 1750, 1100, 2000];
      for (let i = 0; i < 5; i++) this.inline.push(mkLane(L, `req ${i + 1}`));
      for (let i = 0; i < 5; i++) this.fast.push(mkLane(R, `req ${i + 1}`));
      R.append(el("div", "sub", "worker lane (2 workers, retries included):"));
      for (let i = 0; i < 5; i++) this.jobs.push(mkLane(R, `job ${i + 1}`));
      panels.append(L, R);
      wrap.append(head, panels, el("div", "note", "Left: two responses die at the 1,500ms timeout — and their work is lost. Right: every response is instant; the same work happens in worker processes that can retry."));
      root.append(wrap);
      this.btn.addEventListener("click", () => this.run());
    }
    run() {
      cancelAnimationFrame(this.raf);
      this.btn.disabled = true;
      const TIMEOUT = 1500, SLOW = 1.6;
      const arrive = (i) => i * 140;
      // queue side: responses 50ms; jobs on 2 workers
      const workers = [0, 0];
      const jobSched = this.durs.map((d, i) => {
        const w = workers[0] <= workers[1] ? 0 : 1;
        const s = Math.max(arrive(i) + 50, workers[w]);
        workers[w] = s + d * 0.55;
        return { s, d: d * 0.55 };
      });
      const total = Math.max(TIMEOUT + 400, ...jobSched.map((j) => j.s + j.d));
      const t0 = performance.now();
      const step = () => {
        const t = (performance.now() - t0) / SLOW;
        this.durs.forEach((d, i) => {
          const s = arrive(i);
          // inline
          const cap = Math.min(d, TIMEOUT);
          const p = Math.max(0, Math.min(1, (t - s) / cap));
          const bar = this.inline[i].bar;
          bar.style.width = `${p * (cap / total) * 100}%`;
          bar.style.marginLeft = `${(s / total) * 100}%`;
          bar.className = `bar inline${d > TIMEOUT && t >= s + TIMEOUT ? " dead" : ""}`;
          if (t >= s + cap) this.inline[i].res.textContent = d > TIMEOUT ? "✗ timeout" : `${d}ms`;
          this.inline[i].res.className = `res${d > TIMEOUT && t >= s + cap ? " bad" : ""}`;
          // fast response
          const fp = Math.max(0, Math.min(1, (t - s) / 50));
          const fbar = this.fast[i].bar;
          fbar.style.width = `${Math.max(fp * (50 / total) * 100, fp * 1.2)}%`;
          fbar.style.marginLeft = `${(s / total) * 100}%`;
          if (fp >= 1) this.fast[i].res.textContent = "202 · 50ms";
          // job
          const j = jobSched[i];
          const jp = Math.max(0, Math.min(1, (t - j.s) / j.d));
          const jbar = this.jobs[i].bar;
          jbar.className = "bar job";
          jbar.style.width = `${jp * (j.d / total) * 100}%`;
          jbar.style.marginLeft = `${(j.s / total) * 100}%`;
          if (jp >= 1) this.jobs[i].res.textContent = "done";
        });
        if (t < total) this.raf = requestAnimationFrame(step);
        else this.btn.disabled = false;
      };
      // reset
      [...this.inline, ...this.fast, ...this.jobs].forEach(({ bar, res }) => { bar.style.width = "0"; res.textContent = ""; res.className = "res"; });
      this.raf = requestAnimationFrame(step);
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-bottleneck> — the narrowest point decides; scaling the wrong    */
  /* tier does nothing                                                    */
  /* ------------------------------------------------------------------ */
  class PbBottleneck extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .tiers { display:grid; gap:.5rem; margin:.6rem 0; }
        .tier { display:grid; grid-template-columns:8.5rem 1fr 8rem; gap:.6rem; align-items:center; }
        .tname { font-size:.74rem; font-weight:600; }
        .track { height:16px; border-radius:3px; background:color-mix(in srgb, var(--sl-color-gray-5,#444) 30%, transparent); overflow:hidden; }
        .load { height:100%; background:var(--sl-color-accent,#3b82f6); transition:width .3s; }
        .load.sat { background:#e5484d; }
        .tval { font-size:.7rem; color:var(--sl-color-gray-3,#999); font-variant-numeric:tabular-nums; }
        .p95 { font-size:.85rem; margin-top:.4rem; }
        .p95 b { font-variant-numeric:tabular-nums; }
        .p95 .bad { color:#e5484d; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      const btns = el("div");
      this.appBtn = el("button", "primary", "Add app instance");
      this.fixBtn = el("button", "primary", "Fix queries + index");
      this.rstBtn = el("button", null, "Reset");
      this.fixBtn.style.margin = "0 .4rem";
      btns.append(this.appBtn, this.fixBtn, this.rstBtn);
      head.append(el("div", "title", "Load: 100 req/s. Where's the bottleneck?"), btns);

      const tiers = el("div", "tiers");
      const mk = (name) => {
        const tier = el("div", "tier");
        const track = el("div", "track");
        const load = el("div", "load");
        track.append(load);
        const val = el("div", "tval");
        tier.append(el("div", "tname", name), track, val);
        tiers.append(tier);
        return { load, val, nameEl: tier.firstChild };
      };
      this.app = mk("App tier (1×)");
      this.db = mk("Database");
      this.p95 = el("div", "p95");
      wrap.append(head, tiers, this.p95, el("div", "note", "Adding app instances while the DB is saturated changes nothing — capacity added anywhere except the narrowest point is wasted. Fixing the wasteful queries is the cheap 4× that makes scaling meaningful."));
      root.append(wrap);

      this.appBtn.addEventListener("click", () => { this.state.instances++; this.render(); });
      this.fixBtn.addEventListener("click", () => { this.state.fixed = true; this.render(); });
      this.rstBtn.addEventListener("click", () => { this.state = { instances: 1, fixed: false }; this.render(); });
      this.state = { instances: 1, fixed: false };
      this.render();
    }
    render() {
      const LOAD = 100;
      const appCap = 120 * this.state.instances;
      const dbCap = this.state.fixed ? 400 : 80; // bad queries burn the DB
      const appUse = Math.min(1, LOAD / appCap);
      const dbUse = Math.min(1, LOAD / dbCap);
      this.app.nameEl.textContent = `App tier (${this.state.instances}×)`;
      this.app.load.style.width = `${appUse * 100}%`;
      this.app.load.classList.toggle("sat", appUse >= 1);
      this.app.val.textContent = `${Math.round(appUse * 100)}% of ${appCap} req/s`;
      this.db.load.style.width = `${dbUse * 100}%`;
      this.db.load.classList.toggle("sat", dbUse >= 1);
      this.db.val.textContent = `${Math.round(dbUse * 100)}% of ${dbCap} req/s ${this.state.fixed ? "(efficient queries)" : "(N+1s + seq scans)"}`;
      const saturated = dbUse >= 1 || appUse >= 1;
      this.p95.innerHTML = saturated
        ? `p95 latency: <b class="bad">4,800ms and climbing</b> — requests queue at the saturated tier`
        : `p95 latency: <b>180ms</b> — headroom everywhere`;
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-tree> — walk a decision tree (config in the `config` attr)      */
  /* ------------------------------------------------------------------ */
  class PbTree extends HTMLElement {
    connectedCallback() {
      this.cfg = JSON.parse(this.getAttribute("config"));
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .q { font-size:.92rem; font-weight:600; margin:.4rem 0 .8rem; min-height:2.4em; }
        .crumbs { font-size:.7rem; color:var(--sl-color-gray-3,#999); margin-bottom:.5rem; min-height:1.1em; }
        .result { border:1px solid var(--sl-color-accent,#3b82f6); background:var(--sl-color-accent-low,#1b3a57);
                  border-radius:.5rem; padding:.7rem .8rem; font-size:.85rem; }
        a { color: var(--sl-color-accent-high, var(--sl-color-accent,#7ab8ff)); }
        .yes { margin-right:.5rem; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      this.restart = el("button", null, "↺ Restart");
      head.append(el("div", "title", this.getAttribute("title") || "Walk the decision"), this.restart);
      this.crumbs = el("div", "crumbs");
      this.qEl = el("div", "q");
      this.body = el("div");
      wrap.append(head, this.crumbs, this.qEl, this.body);
      root.append(wrap);
      this.restart.addEventListener("click", () => this.go("start", true));
      this.go("start", true);
    }
    go(id, reset) {
      if (reset) this.path = [];
      const node = this.cfg[id];
      this.crumbs.textContent = this.path.join("  ·  ");
      this.body.textContent = "";
      if (node.result) {
        this.qEl.textContent = "";
        const r = el("div", "result");
        r.innerHTML = node.result;
        this.body.append(r);
        return;
      }
      this.qEl.textContent = node.q;
      const yes = el("button", "primary yes", node.yesLabel || "Yes");
      const no = el("button", "primary", node.noLabel || "No");
      yes.addEventListener("click", () => { this.path.push(`${node.crumb || node.q} → ${node.yesLabel || "yes"}`); this.go(node.yes); });
      no.addEventListener("click", () => { this.path.push(`${node.crumb || node.q} → ${node.noLabel || "no"}`); this.go(node.no); });
      this.body.append(yes, no);
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-spectrum> — web / PWA / hybrid / native trade-off explorer      */
  /* ------------------------------------------------------------------ */
  class PbSpectrum extends HTMLElement {
    connectedCallback() {
      const DATA = {
        Web: { codebases: 1, deploy: "minutes", discovery: "URL / SEO", device: 25, cost: 1 },
        PWA: { codebases: 1, deploy: "minutes", discovery: "URL + install", device: 35, cost: 1.1 },
        Hybrid: { codebases: 1.2, deploy: "store review (days)", discovery: "app stores", device: 80, cost: 1.5 },
        Native: { codebases: 2, deploy: "store review (days)", discovery: "app stores", device: 100, cost: 2.5 },
      };
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .chips { display:flex; gap:.4rem; flex-wrap:wrap; }
        .chip { font:inherit; font-weight:600; cursor:pointer; padding:.3rem .8rem; border-radius:2rem;
                border:1px solid var(--sl-color-gray-5,#444); background:transparent; color:inherit; }
        .chip.on { border-color:var(--sl-color-accent,#3b82f6); background:var(--sl-color-accent-low,#1b3a57); }
        .facts { display:grid; gap:.45rem; margin-top:.75rem; }
        .fact { display:grid; grid-template-columns:9rem 1fr; gap:.6rem; align-items:center; font-size:.76rem; }
        .fname { color:var(--sl-color-gray-3,#999); }
        .track { height:12px; border-radius:3px; background:color-mix(in srgb, var(--sl-color-gray-5,#444) 30%, transparent); overflow:hidden; }
        .fbar { height:100%; background:var(--sl-color-accent,#3b82f6); transition:width .35s; }
        .ftext { font-weight:600; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      head.append(el("div", "title", "Pick a platform — watch the trade-offs move"), el("div", "hint", "reach vs capability vs cost"));
      const chips = el("div", "chips");
      const facts = el("div", "facts");
      const mkFact = (name, isBar) => {
        const f = el("div", "fact");
        f.append(el("div", "fname", name));
        let out;
        if (isBar) { const track = el("div", "track"); out = el("div", "fbar"); track.append(out); f.append(track); }
        else { out = el("div", "ftext"); f.append(out); }
        facts.append(f);
        return out;
      };
      const codebases = mkFact("codebases", false);
      const deploy = mkFact("iterate / deploy", false);
      const discovery = mkFact("discovery", false);
      const device = mkFact("device API reach", true);
      const cost = mkFact("relative v1 cost", true);
      const select = (name) => {
        [...chips.children].forEach((c) => c.classList.toggle("on", c.textContent === name));
        const d = DATA[name];
        codebases.textContent = `${d.codebases} to build & maintain, forever`;
        deploy.textContent = d.deploy;
        discovery.textContent = d.discovery;
        device.style.width = `${d.device}%`;
        cost.style.width = `${(d.cost / 2.5) * 100}%`;
      };
      for (const name of Object.keys(DATA)) {
        const c = el("button", "chip", name);
        c.addEventListener("click", () => select(name));
        chips.append(c);
      }
      wrap.append(head, chips, facts, el("div", "note", "Native's cost isn't a one-time fee — it's a second codebase for every feature, forever. The question is which capability you actually can't live without."));
      root.append(wrap);
      select("Web");
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-threads> — JS-driven vs compositor-driven animation under a     */
  /* really blocked main thread (the RN two-thread model, in a browser)  */
  /* ------------------------------------------------------------------ */
  class PbThreads extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .lane { display:grid; grid-template-columns:11rem 1fr; gap:.6rem; align-items:center; margin-bottom:.5rem; }
        .lname { font-size:.72rem; font-weight:600; }
        .lname small { display:block; font-weight:400; color:var(--sl-color-gray-3,#999); }
        .stage { position:relative; height:34px; border:1px solid var(--sl-color-gray-5,#444); border-radius:.45rem; overflow:hidden; }
        .dot { position:absolute; top:7px; left:0; width:20px; height:20px; border-radius:50%; background:var(--sl-color-accent,#3b82f6); }
        .dot.css { animation:slide 1.6s ease-in-out infinite alternate; background:#4cc38a; }
        @keyframes slide { from { transform:translateX(0); } to { transform:translateX(min(56vw, 480px)); } }
        .status { font-size:.75rem; color:var(--sl-color-gray-3,#999); min-height:1.2em; margin-top:.3rem; }
        .warn { color:#e5484d; font-weight:600; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      this.btn = el("button", "primary", "Block the JS thread 2s (really)");
      head.append(el("div", "title", "Two threads, two fates"), this.btn);

      const mkLane = (label, sub) => {
        const lane = el("div", "lane");
        const name = el("div", "lname", label);
        name.append(el("small", null, sub));
        const stage = el("div", "stage");
        const dot = el("div", "dot");
        stage.append(dot);
        lane.append(name, stage);
        wrap.append(lane);
        return { stage, dot };
      };
      wrap.append(head);
      const js = mkLane("JS-driven", "rAF on the JS thread — like JS-driven Animated");
      const ui = mkLane("Compositor-driven", "CSS transform — like useNativeDriver / Reanimated");
      ui.dot.classList.add("css");
      this.status = el("div", "status", "Both move. Now block the JS thread and watch which one survives.");
      wrap.append(this.status);
      root.append(wrap);

      const t0 = performance.now();
      const loop = (now) => {
        if (!this.isConnected) return;
        const w = js.stage.clientWidth - 20;
        const p = Math.abs(((now - t0) / 1600) % 2 - 1);
        js.dot.style.transform = `translateX(${p * Math.max(w, 0)}px)`;
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);

      this.btn.addEventListener("click", () => {
        this.status.textContent = "JS thread blocked — top dot frozen, bottom keeps gliding…";
        this.status.classList.add("warn");
        setTimeout(() => {
          const end = performance.now() + 2000;
          while (performance.now() < end) {}
          this.status.classList.remove("warn");
          this.status.textContent = "That's the whole native-driver argument: work on the busy thread froze; work on the other thread never noticed.";
        }, 80);
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-blank> — blank cells when items render slower than you scroll   */
  /* ------------------------------------------------------------------ */
  class PbBlank extends HTMLElement {
    connectedCallback() {
      const ROWS = 3000, H = 28;
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .list { height:224px; overflow-y:auto; border:1px solid var(--sl-color-gray-5,#444); border-radius:.5rem; }
        .inner { position:relative; }
        .rowi { position:absolute; left:0; right:0; height:28px; line-height:28px; padding:0 .6rem; font-size:.72rem; }
        .rowi.blank { background:repeating-linear-gradient(90deg, color-mix(in srgb, var(--sl-color-gray-5,#444) 45%, transparent) 0 40%, transparent 40% 100%);
                      color:transparent; border-radius:4px; }
        label { display:flex; align-items:center; gap:.4rem; font-size:.78rem; cursor:pointer; }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      const toggle = document.createElement("label");
      const check = document.createElement("input");
      check.type = "checkbox";
      toggle.append(check, document.createTextNode("cheap, memoized items"));
      head.append(el("div", "title", "Flick-scroll fast — items take 140ms to render"), toggle);
      const list = el("div", "list");
      const inner = el("div", "inner");
      inner.style.height = `${ROWS * H}px`;
      list.append(inner);
      wrap.append(head, list, el("div", "note", "Gray stripes = the scroll got there before the JS thread could render the item. Tick the box (memoized rows, sized images, flat trees) and the blanks disappear."));
      root.append(wrap);

      const pool = [];
      let gen = 0;
      const paint = () => {
        gen++;
        const myGen = gen;
        const first = Math.max(0, Math.floor(list.scrollTop / H) - 1);
        const count = Math.ceil(224 / H) + 3;
        while (pool.length < count) { const r = el("div", "rowi"); pool.push(r); inner.append(r); }
        pool.forEach((r, k) => {
          const i = first + k;
          if (i >= ROWS) { r.style.display = "none"; return; }
          r.style.display = "";
          r.style.top = `${i * H}px`;
          if (r.dataset.i === String(i)) return; // already rendered
          r.dataset.i = String(i);
          const delay = check.checked ? 0 : 140;
          r.classList.add("blank");
          r.textContent = "…";
          setTimeout(() => {
            if (gen !== myGen && r.dataset.i !== String(i)) return;
            if (r.dataset.i !== String(i)) return;
            r.classList.remove("blank");
            r.textContent = `#${i + 1} — post ${9000 + i} · @user${(i * 13) % 700}`;
          }, delay);
        });
      };
      list.addEventListener("scroll", () => requestAnimationFrame(paint));
      paint();
    }
  }

  /* ------------------------------------------------------------------ */
  /* <pb-outbox> — offline writes queue locally, flush on reconnect      */
  /* ------------------------------------------------------------------ */
  class PbOutbox extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${BASE_CSS}
        .pill { display:inline-block; padding:.18rem .6rem; border-radius:1rem; font-size:.72rem; font-weight:700; }
        .pill.on { background:color-mix(in srgb, #4cc38a 25%, transparent); color:#4cc38a; }
        .pill.off { background:color-mix(in srgb, #e5484d 22%, transparent); color:#e5484d; }
        .items { display:grid; gap:4px; margin-top:.6rem; min-height:3rem; }
        .item { display:flex; justify-content:space-between; align-items:center; gap:.5rem; font-size:.74rem;
                padding:.28rem .55rem; border-radius:.35rem; border:1px solid var(--sl-color-gray-5,#444); }
        .badge { font-size:.66rem; font-weight:700; padding:.08rem .45rem; border-radius:1rem; }
        .badge.pending { background:color-mix(in srgb, #c88a2b 25%, transparent); color:#e0a94f; }
        .badge.synced { background:color-mix(in srgb, #4cc38a 20%, transparent); color:#4cc38a; }
        .counts { margin-top:.5rem; font-size:.75rem; color:var(--sl-color-gray-3,#999); }
      </style>`;
      const wrap = el("div", "wrap");
      const head = el("div", "head");
      const controls = el("div");
      this.pill = el("span", "pill on", "● online");
      this.netBtn = el("button", null, "Go offline");
      this.addBtn = el("button", "primary", "＋ New report");
      this.netBtn.style.margin = "0 .4rem";
      controls.append(this.pill, this.netBtn, this.addBtn);
      head.append(el("div", "title", "The outbox is the write path, not a fallback"), controls);
      this.items = el("div", "items");
      this.counts = el("div", "counts", "Create reports; kill the network mid-way; bring it back.");
      wrap.append(head, this.items, this.counts, el("div", "note", "Saving always writes locally first (instant UI), then the queue flushes whenever the network allows — a deploy, a crash, or a tunnel doesn't lose the work."));
      root.append(wrap);

      this.online = true;
      this.n = 0;
      this.queue = [];
      this.netBtn.addEventListener("click", () => {
        this.online = !this.online;
        this.pill.className = `pill ${this.online ? "on" : "off"}`;
        this.pill.textContent = this.online ? "● online" : "○ offline";
        this.netBtn.textContent = this.online ? "Go offline" : "Reconnect";
        if (this.online) this.flush();
      });
      this.addBtn.addEventListener("click", () => {
        const id = ++this.n;
        const item = el("div", "item");
        const badge = el("span", "badge pending", "pending");
        item.append(el("span", null, `Inspection report #${id} — saved locally`), badge);
        this.items.append(item);
        this.queue.push(badge);
        this.update();
        if (this.online) this.flush();
      });
    }
    flush() {
      if (this.flushing) return;
      this.flushing = true;
      const next = () => {
        if (!this.online || this.queue.length === 0) { this.flushing = false; this.update(); return; }
        const badge = this.queue.shift();
        setTimeout(() => {
          badge.className = "badge synced";
          badge.textContent = "synced ✓";
          this.update();
          next();
        }, 450);
      };
      next();
    }
    update() {
      const pending = this.queue.length;
      const synced = this.n - pending;
      this.counts.textContent = `outbox: ${pending} pending · ${synced} synced${!this.online && pending ? " — waiting for network, nothing lost" : ""}`;
    }
  }

  customElements.define("pb-race", PbRace);
  customElements.define("pb-block", PbBlock);
  customElements.define("pb-vlist", PbVlist);
  customElements.define("pb-lanes", PbLanes);
  customElements.define("pb-flow", PbFlow);
  customElements.define("pb-growth", PbGrowth);
  customElements.define("pb-search", PbSearch);
  customElements.define("pb-sortcost", PbSortcost);
  customElements.define("pb-input", PbInput);
  customElements.define("pb-eventloop", PbEventloop);
  customElements.define("pb-pipeline", PbPipeline);
  customElements.define("pb-images", PbImages);
  customElements.define("pb-btree", PbBtree);
  customElements.define("pb-nplus1", PbNplus1);
  customElements.define("pb-cache", PbCache);
  customElements.define("pb-queue", PbQueue);
  customElements.define("pb-bottleneck", PbBottleneck);
  customElements.define("pb-tree", PbTree);
  customElements.define("pb-spectrum", PbSpectrum);
  customElements.define("pb-threads", PbThreads);
  customElements.define("pb-blank", PbBlank);
  customElements.define("pb-outbox", PbOutbox);
})();
