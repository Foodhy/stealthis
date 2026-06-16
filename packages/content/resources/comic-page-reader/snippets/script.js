/* Neon Ronin #07 — Paged Comic Reader
   Vanilla JS: page state, 3D flip transition, zoom transform, keyboard nav. */
(function () {
  "use strict";

  /* ---------- page data (fictional) ---------- */
  const SCENES = ["sky", "night", "storm", "neon", "dawn", "ink"];

  const PAGES = [
    { layout: "a", title: "Static Bloom", sfx: "KRA-KOOM!", sfxPos: "tr",
      cap: "Sector 7 — 03:14",
      lines: ["The grid's gone dark again, Ronin.", "Then we move where the light can't follow."] },
    { layout: "b", title: "Cold Open", sfx: "VWOOSH", sfxPos: "bl",
      cap: "Above the Drift",
      lines: ["Iron Vanguard, do you copy?", "Always have. Always will.", "Hold the line."] },
    { layout: "c", title: "Wire & Rain", sfx: "TSSST", sfxPos: "tr",
      cap: "Rooftops, eastside",
      lines: ["Rain's the only thing the cameras can't bribe.", "Then let it pour."] },
    { layout: "d", title: "The Ask", sfx: "THWIP!", sfxPos: "bl",
      cap: "Lotus Arcade",
      lines: ["One blade. One night.", "You said that last year.", "I lied last year."] },
    { layout: "a", title: "Crossfire", sfx: "BLAM!", sfxPos: "tr",
      cap: "Loading dock",
      lines: ["Down!", "Cover me — counting to three.", "Make it two."] },
    { layout: "b", title: "Neon Ghosts", sfx: "HMMMM", sfxPos: "bl",
      cap: "The Undermarket",
      lines: ["They sell faces here.", "Then we'll buy a new one.", "Cash only."] },
    { layout: "c", title: "Static Bloom", sfx: "KRRRK", sfxPos: "tr",
      cap: "Sector 7 — 03:42",
      lines: ["You came back for me.", "I never left.", "Liar."] },
    { layout: "d", title: "Edge of Drift", sfx: "WHUMP", sfxPos: "bl",
      cap: "Skybridge 9",
      lines: ["Jump. I've got you.", "You always say that.", "And I always do."] },
  ];
  // pad to a believable 24-page issue by cycling content
  const TOTAL = 24;
  function pageData(i) {
    const base = PAGES[i % PAGES.length];
    return Object.assign({}, base, {
      scene: SCENES[i % SCENES.length],
      scene2: SCENES[(i + 3) % SCENES.length],
    });
  }

  /* ---------- DOM ---------- */
  const $ = (s) => document.querySelector(s);
  const stage = $("#stage");
  const pageFlip = $("#pageFlip");
  const pageMount = $("#pageMount");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const counterCur = $("#counterCur");
  const counterTot = $("#counterTot");
  const pageSelect = $("#pageSelect");
  const fitWidth = $("#fitWidth");
  const fitHeight = $("#fitHeight");
  const zoomSlider = $("#zoomSlider");
  const zoomVal = $("#zoomVal");
  const zoomIn = $("#zoomIn");
  const zoomOut = $("#zoomOut");
  const zoomReset = $("#zoomReset");
  const thumbToggle = $("#thumbToggle");
  const thumbStrip = $("#thumbStrip");
  const thumbsList = $("#thumbsList");
  const toastEl = $("#toast");

  /* ---------- state ---------- */
  let current = 0; // 0-based
  let zoom = 100; // percent
  let zoomOrigin = "center center";
  let busy = false;

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 1800);
  }

  /* ---------- render a comic page ---------- */
  function panelCount(layout) {
    return { a: 3, b: 4, c: 3, d: 4 }[layout] || 3;
  }

  function buildBalloon(text, idx, layout) {
    const b = document.createElement("p");
    const variant = idx === 0 ? "" : idx % 2 === 0 ? " balloon--right" : "";
    const shout = /[!?]{1}$/.test(text) && text === text.toUpperCase() && text.length < 14;
    b.className = "balloon" + variant + (shout ? " balloon--shout" : "");
    b.textContent = text;
    return b;
  }

  function buildPage(i) {
    const d = pageData(i);
    const comic = document.createElement("article");
    comic.className = "comic comic--" + d.layout;
    comic.setAttribute("role", "img");
    comic.setAttribute(
      "aria-label",
      `Neon Ronin issue 7, page ${i + 1} of ${TOTAL}: ${d.title}`
    );

    // banner
    const bann = document.createElement("header");
    bann.className = "comic__bann";
    const h = document.createElement("h2");
    h.className = "comic__title";
    h.textContent = d.title;
    const pn = document.createElement("span");
    pn.className = "comic__pageno";
    pn.textContent = "PG " + (i + 1);
    bann.append(h, pn);

    // panels
    const panels = document.createElement("div");
    panels.className = "comic__panels";
    const n = panelCount(d.layout);
    for (let p = 0; p < n; p++) {
      const panel = document.createElement("div");
      const scene = p % 2 === 0 ? d.scene : d.scene2;
      panel.className = "panel panel--" + scene;

      // horizon + figures for set dressing
      const horizon = document.createElement("span");
      horizon.className = "panel__horizon";
      panel.appendChild(horizon);

      const figL = document.createElement("span");
      figL.className = "panel__fig panel__fig--l";
      panel.appendChild(figL);
      if (p === 0) {
        const figR = document.createElement("span");
        figR.className = "panel__fig panel__fig--r";
        panel.appendChild(figR);
      }

      // caption on first panel
      if (p === 0) {
        const cap = document.createElement("span");
        cap.className = "caption";
        cap.textContent = d.cap;
        panel.appendChild(cap);
      }

      // SFX on a panel
      if (p === 1) {
        const sfx = document.createElement("span");
        sfx.className = "sfx sfx--" + (d.sfxPos || "tr");
        sfx.textContent = d.sfx;
        panel.appendChild(sfx);
      }

      // a balloon line if available
      if (d.lines[p]) {
        panel.appendChild(buildBalloon(d.lines[p], p, d.layout));
      }
      panels.appendChild(panel);
    }

    // footer
    const foot = document.createElement("footer");
    foot.className = "comic__foot";
    const cont = document.createElement("span");
    cont.textContent = i + 1 < TOTAL ? "Continued ›" : "End of issue";
    const credit = document.createElement("span");
    credit.textContent = "Neon Ronin · Stealthis Comics";
    foot.append(credit, cont);

    comic.append(bann, panels, foot);
    return comic;
  }

  /* ---------- zoom ---------- */
  function applyZoom() {
    const comic = pageMount.querySelector(".comic");
    if (!comic) return;
    comic.style.transformOrigin = zoomOrigin;
    comic.style.transform = "scale(" + zoom / 100 + ")";
    zoomVal.textContent = zoom + "%";
    zoomSlider.value = String(zoom);
    pageMount.classList.toggle("is-zoomed", zoom > 100);
    pageMount.classList.toggle("page-mount", true);
  }

  function setZoom(v, origin) {
    zoom = Math.max(100, Math.min(300, Math.round(v)));
    if (origin) zoomOrigin = origin;
    if (zoom === 100) zoomOrigin = "center center";
    applyZoom();
  }

  /* ---------- render current page ---------- */
  function render(direction) {
    const node = buildPage(current);

    const swap = () => {
      pageMount.innerHTML = "";
      pageMount.appendChild(node);
      zoom = 100;
      zoomOrigin = "center center";
      applyZoom();
      counterCur.textContent = String(current + 1);
      pageSelect.value = String(current);
      updateThumbs();
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === TOTAL - 1;
      pageFlip.classList.remove("is-flip-next", "is-flip-prev");
      busy = false;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (direction && !reduce) {
      busy = true;
      pageFlip.classList.add(direction === "next" ? "is-flip-next" : "is-flip-prev");
      setTimeout(swap, 230);
    } else {
      swap();
    }
  }

  function goTo(idx, direction, announce) {
    idx = Math.max(0, Math.min(TOTAL - 1, idx));
    if (idx === current && !direction) return;
    if (busy) return;
    const dir = direction || (idx > current ? "next" : idx < current ? "prev" : null);
    current = idx;
    render(dir);
    if (announce !== false) toast("Page " + (current + 1) + " of " + TOTAL);
  }

  function next() {
    if (current >= TOTAL - 1) {
      toast("Last page");
      return;
    }
    goTo(current + 1, "next", false);
  }
  function prev() {
    if (current <= 0) {
      toast("First page");
      return;
    }
    goTo(current - 1, "prev", false);
  }

  /* ---------- thumbnails ---------- */
  function buildThumbs() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < TOTAL; i++) {
      const li = document.createElement("li");
      li.className = "thumb";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thumb__btn";
      btn.setAttribute("aria-label", "Go to page " + (i + 1));
      const mini = document.createElement("span");
      mini.className = "thumb__mini";
      const scene = pageData(i).scene;
      for (let c = 0; c < 4; c++) {
        const cell = document.createElement("span");
        cell.className = "thumb__cell panel--" + (c % 2 === 0 ? scene : pageData(i).scene2);
        mini.appendChild(cell);
      }
      const no = document.createElement("span");
      no.className = "thumb__no";
      no.textContent = String(i + 1);
      btn.append(mini, no);
      btn.addEventListener("click", () => {
        goTo(i);
      });
      li.appendChild(btn);
      frag.appendChild(li);
    }
    thumbsList.appendChild(frag);
  }

  function updateThumbs() {
    const btns = thumbsList.querySelectorAll(".thumb__btn");
    btns.forEach((b, i) => {
      const active = i === current;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-current", active ? "true" : "false");
      if (active && thumbStrip.dataset.open === "true") {
        b.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    });
  }

  /* ---------- page-jump select ---------- */
  function buildSelect() {
    for (let i = 0; i < TOTAL; i++) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = "Page " + (i + 1) + " / " + TOTAL;
      pageSelect.appendChild(opt);
    }
  }

  /* ---------- fit mode ---------- */
  function setFit(mode) {
    stage.dataset.fit = mode;
    const isW = mode === "width";
    fitWidth.classList.toggle("is-active", isW);
    fitHeight.classList.toggle("is-active", !isW);
    fitWidth.setAttribute("aria-pressed", String(isW));
    fitHeight.setAttribute("aria-pressed", String(!isW));
    setZoom(100);
    toast(isW ? "Fit to width" : "Fit to height");
  }

  /* ---------- wire events ---------- */
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  pageSelect.addEventListener("change", () => {
    goTo(parseInt(pageSelect.value, 10));
  });

  fitWidth.addEventListener("click", () => setFit("width"));
  fitHeight.addEventListener("click", () => setFit("height"));

  zoomSlider.addEventListener("input", () => setZoom(parseInt(zoomSlider.value, 10)));
  zoomIn.addEventListener("click", () => setZoom(zoom + 25));
  zoomOut.addEventListener("click", () => setZoom(zoom - 25));
  zoomReset.addEventListener("click", () => {
    setZoom(100);
    toast("Zoom reset");
  });

  // double-click to zoom into the clicked point
  pageMount.addEventListener("dblclick", (e) => {
    const comic = pageMount.querySelector(".comic");
    if (!comic) return;
    if (zoom > 100) {
      setZoom(100);
      return;
    }
    const r = comic.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom(200, x + "% " + y + "%");
  });

  // thumbnail strip toggle
  thumbToggle.addEventListener("click", () => {
    const open = thumbStrip.dataset.open !== "true";
    thumbStrip.dataset.open = String(open);
    thumbToggle.setAttribute("aria-expanded", String(open));
    if (open) updateThumbs();
  });

  // keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
        e.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        prev();
        break;
      case "Home":
        e.preventDefault();
        goTo(0);
        break;
      case "End":
        e.preventDefault();
        goTo(TOTAL - 1);
        break;
      case "+":
      case "=":
        e.preventDefault();
        setZoom(zoom + 25);
        break;
      case "-":
        e.preventDefault();
        setZoom(zoom - 25);
        break;
      case "0":
        e.preventDefault();
        setZoom(100);
        break;
      default:
        break;
    }
  });

  /* ---------- init ---------- */
  counterTot.textContent = String(TOTAL);
  stage.dataset.fit = "width";
  buildSelect();
  buildThumbs();
  render();
  toast("Use ← → to turn pages · double-click to zoom");
})();
