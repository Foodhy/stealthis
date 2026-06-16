/* ===================================================================
   Wander — Guide Editor
   Vanilla JS, no libraries. Drives a 3-pane travel-CMS:
   left outline (drag-reorder / add / delete), center editable canvas
   (cover + POI/map/tip blocks), right inspector (settings/SEO/stats).
   =================================================================== */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const uid = () => "s" + Math.random().toString(36).slice(2, 8);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  const slugify = (s) =>
    String(s)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "untitled";
  const words = (s) => (String(s).trim().match(/\b[\w’'-]+\b/g) || []).length;

  let toastTimer;
  function toast(msg, icon = "✓") {
    const el = $("#toast");
    el.innerHTML = '<span aria-hidden="true">' + icon + "</span>" + esc(msg);
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 2200);
  }

  /* ---------- block factories ---------- */
  const TONES = 4;
  function poiBlock(over) {
    const pools = [
      { name: "Time Out Mercado", cat: "Food hall", desc: "Two dozen stalls under one roof — go hungry, go early.", rating: "4.6", price: "€€", tone: 0 },
      { name: "Miradouro da Graça", cat: "Viewpoint", desc: "Best light an hour before sunset, a pine for shade.", rating: "4.8", price: "Free", tone: 1 },
      { name: "Tram 28", cat: "Ride", desc: "The rattling line through Alfama — board at Martim Moniz.", rating: "4.3", price: "€", tone: 2 },
      { name: "Pastéis de Belém", cat: "Bakery", desc: "The original custard tart, warm with cinnamon on top.", rating: "4.7", price: "€", tone: 3 },
      { name: "LX Factory", cat: "Design district", desc: "Old print works turned shops, bookstores and rooftops.", rating: "4.5", price: "€€", tone: 0 },
    ];
    return Object.assign({ id: uid(), type: "poi", saved: false }, pools[(over || 0) % pools.length]);
  }
  function tipBlock() {
    const tips = [
      "Buy a 24-hour Viva Viagem card — trams, metro and the funiculars all accept it.",
      "Restaurants put a couvert (bread, olives) on the table; wave it away if you won’t eat it.",
      "Hills are steep — pack one comfortable pair of shoes and skip the heels.",
    ];
    return { id: uid(), type: "tip", text: tips[Math.floor(Math.random() * tips.length)] };
  }
  function mapBlock() {
    return {
      id: uid(),
      type: "map",
      title: "Walking route",
      note: "≈ 2.4 km · a gentle morning loop through the old town.",
      pins: [
        { x: 18, y: 64, n: 1, label: "Sé" },
        { x: 46, y: 38, n: 2, label: "Graça" },
        { x: 72, y: 58, n: 3, label: "Castelo" },
        { x: 86, y: 30, n: 4, label: "Mirante" },
      ],
    };
  }

  /* ---------- initial document state ---------- */
  const state = {
    docTitle: "Lisboa in 72 Hours",
    activeId: null,
    sections: [
      {
        id: uid(),
        name: "Arrival & Alfama",
        eyebrow: "City Guide · Portugal",
        body:
          "You land into low afternoon light and the smell of grilled sardines. Drop your bag, then let gravity pull you downhill through Alfama — the oldest, most tangled quarter, where laundry lines cross the alleys and every corner hides a viewpoint.",
        scene: "city",
        best: "Spring",
        published: true,
        slug: "arrival",
        blocks: [poiBlock(0), tipBlock(), poiBlock(1)],
      },
      {
        id: uid(),
        name: "A Day by the River",
        eyebrow: "Day Two · Belém",
        body:
          "Trade the hills for the Tagus. Belém spreads flat and bright along the water — monasteries, a tower, and the custard tart that started it all. Time it so the afternoon ferry carries you back across the estuary as the bridge lights flick on.",
        scene: "coast",
        best: "Summer",
        published: true,
        slug: "river",
        blocks: [mapBlock(), poiBlock(3)],
      },
      {
        id: uid(),
        name: "Day Trip — Sintra",
        eyebrow: "Day Three · Hills",
        body:
          "Catch the early train before the crowds. Sintra is cooler, greener and a little unreal: palaces painted like sweets, a Moorish wall along the ridge, and forest paths that smell of eucalyptus and rain.",
        scene: "alpine",
        best: "Autumn",
        published: false,
        slug: "sintra",
        blocks: [tipBlock()],
      },
    ],
  };
  state.activeId = state.sections[0].id;

  /* ---------- dirty / save indicator ---------- */
  let saveTimer;
  function markDirty() {
    const s = $("#saveState");
    s.textContent = "Saving…";
    s.setAttribute("data-dirty", "1");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      s.textContent = "All changes saved";
      s.removeAttribute("data-dirty");
    }, 750);
  }

  const active = () => state.sections.find((s) => s.id === state.activeId);

  /* =================================================================
     OUTLINE (left)
     ================================================================= */
  const listEl = $("#sectionList");

  function renderOutline() {
    listEl.innerHTML = "";
    state.sections.forEach((sec, i) => {
      const li = document.createElement("li");
      li.className = "sec" + (sec.id === state.activeId ? " is-active" : "");
      li.draggable = false;
      li.dataset.id = sec.id;
      li.dataset.published = String(sec.published);
      li.innerHTML =
        '<button class="sec__handle" type="button" aria-label="Drag to reorder" draggable="true" title="Drag to reorder (or Alt+↑/↓)">⠿</button>' +
        '<button class="sec__body" type="button">' +
        '<span class="sec__name">' + esc(sec.name || "Untitled section") + "</span>" +
        '<span class="sec__meta">' +
        '<span class="sec__dot" aria-hidden="true"></span>' +
        (sec.published ? "Published" : "Draft") +
        " · " + sec.blocks.length + " block" + (sec.blocks.length === 1 ? "" : "s") +
        "</span></button>" +
        '<button class="sec__del" type="button" aria-label="Delete ' + esc(sec.name) + '">✕</button>';

      $(".sec__body", li).addEventListener("click", () => selectSection(sec.id));
      $(".sec__del", li).addEventListener("click", (e) => {
        e.stopPropagation();
        deleteSection(sec.id);
      });
      wireDrag(li, $(".sec__handle", li), i);

      listEl.appendChild(li);
    });

    $("#sectionCount").textContent =
      state.sections.length + " section" + (state.sections.length === 1 ? "" : "s");
    updateOutlineMeta();
  }

  /* ----- drag & drop reorder ----- */
  let dragId = null;
  function wireDrag(li, handle) {
    handle.addEventListener("dragstart", (e) => {
      dragId = li.dataset.id;
      li.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", dragId); } catch (_) {}
    });
    handle.addEventListener("dragend", () => {
      dragId = null;
      $$(".sec", listEl).forEach((s) => s.classList.remove("is-dragging", "is-over"));
    });
    li.addEventListener("dragover", (e) => {
      if (!dragId || li.dataset.id === dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      $$(".sec", listEl).forEach((s) => s.classList.remove("is-over"));
      li.classList.add("is-over");
    });
    li.addEventListener("dragleave", () => li.classList.remove("is-over"));
    li.addEventListener("drop", (e) => {
      e.preventDefault();
      li.classList.remove("is-over");
      if (!dragId || li.dataset.id === dragId) return;
      reorder(dragId, li.dataset.id);
    });

    // keyboard reorder: Alt+Arrow on the handle
    handle.addEventListener("keydown", (e) => {
      if (!e.altKey) return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const id = li.dataset.id;
        moveBy(id, e.key === "ArrowUp" ? -1 : 1);
        requestAnimationFrame(() => {
          const moved = $('.sec[data-id="' + id + '"] .sec__handle', listEl);
          if (moved) moved.focus();
        });
      }
    });
  }

  function reorder(fromId, toId) {
    const from = state.sections.findIndex((s) => s.id === fromId);
    if (from < 0) return;
    const [moved] = state.sections.splice(from, 1);
    const to = state.sections.findIndex((s) => s.id === toId);
    state.sections.splice(to < 0 ? state.sections.length : to, 0, moved);
    renderOutline();
    markDirty();
    toast("Section reordered", "↕");
  }

  function moveBy(id, delta) {
    const i = state.sections.findIndex((s) => s.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= state.sections.length) return;
    const arr = state.sections;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    renderOutline();
    markDirty();
  }

  /* ----- add / delete ----- */
  function addSection() {
    const sec = {
      id: uid(),
      name: "New section",
      eyebrow: "Untitled",
      body: "Start writing this part of the guide…",
      scene: "city",
      best: "Spring",
      published: false,
      slug: "new-section",
      blocks: [],
    };
    state.sections.push(sec);
    renderOutline();
    selectSection(sec.id);
    markDirty();
    toast("Section added", "＋");
    requestAnimationFrame(() => $("#iTitle").select());
  }

  function deleteSection(id) {
    if (state.sections.length === 1) {
      toast("A guide needs at least one section", "!");
      return;
    }
    const idx = state.sections.findIndex((s) => s.id === id);
    const name = state.sections[idx].name;
    state.sections.splice(idx, 1);
    if (state.activeId === id) {
      state.activeId = state.sections[Math.max(0, idx - 1)].id;
      loadActive();
    }
    renderOutline();
    markDirty();
    toast("Deleted “" + name + "”", "🗑");
  }

  function selectSection(id) {
    state.activeId = id;
    renderOutline();
    loadActive();
    $("#canvas").scrollTop = 0;
  }

  /* =================================================================
     CANVAS (center)
     ================================================================= */
  const coverEl = $("#cover");
  const blocksEl = $("#blocks");

  function renderCover() {
    const s = active();
    coverEl.dataset.scene = s.scene;
    coverEl.dataset.published = String(s.published);
    $("#coverEyebrow").textContent = s.eyebrow || "Section";
    if ($("#coverTitle").textContent !== s.name) $("#coverTitle").textContent = s.name;
    const badge = $("#coverBadge");
    badge.textContent = "Best in " + s.best;
    badge.hidden = false;
  }

  function renderBlocks() {
    const s = active();
    blocksEl.innerHTML = "";

    // editable intro paragraph (with drop-cap via CSS)
    const intro = document.createElement("p");
    intro.className = "block-intro";
    intro.id = "introField";
    intro.contentEditable = "true";
    intro.spellcheck = true;
    intro.setAttribute("role", "textbox");
    intro.setAttribute("aria-label", "Section intro");
    intro.textContent = s.body;
    intro.addEventListener("input", () => {
      s.body = intro.textContent;
      $("#iBody").value = s.body;
      updateStats();
      updateSeo();
      updateOutlineMeta();
      markDirty();
    });
    blocksEl.appendChild(intro);

    if (!s.blocks.length) {
      const empty = document.createElement("div");
      empty.className = "blocks__empty";
      empty.textContent = "No POIs, maps or tips yet — add one below or from the inspector.";
      blocksEl.appendChild(empty);
    }

    s.blocks.forEach((b) => blocksEl.appendChild(renderBlock(b, s)));

    const addRow = document.createElement("div");
    addRow.className = "block-add";
    addRow.style.marginTop = "10px";
    addRow.innerHTML =
      '<button class="chip-btn" data-add="poi" type="button">＋ POI card</button>' +
      '<button class="chip-btn" data-add="map" type="button">🗺 Map block</button>' +
      '<button class="chip-btn" data-add="tip" type="button">💡 Tip callout</button>';
    addRow.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (btn) addBlock(btn.dataset.add);
    });
    blocksEl.appendChild(addRow);
  }

  function blockToolbar(block, s) {
    const bar = document.createElement("div");
    bar.className = "block__bar";
    const up = mkAct("↑", "Move block up", () => moveBlock(block.id, -1));
    const down = mkAct("↓", "Move block down", () => moveBlock(block.id, 1));
    const del = mkAct("✕", "Remove block", () => {
      s.blocks = s.blocks.filter((b) => b.id !== block.id);
      renderBlocks();
      renderOutline();
      updateStats();
      markDirty();
      toast("Block removed", "🗑");
    });
    bar.append(up, down, del);
    return bar;
  }
  function mkAct(label, aria, fn) {
    const b = document.createElement("button");
    b.className = "block__act";
    b.type = "button";
    b.textContent = label;
    b.setAttribute("aria-label", aria);
    b.title = aria;
    b.addEventListener("click", fn);
    return b;
  }

  function renderBlock(b, s) {
    const wrap = document.createElement("div");
    wrap.className = "block";
    wrap.dataset.id = b.id;
    wrap.appendChild(blockToolbar(b, s));

    if (b.type === "poi") {
      const card = document.createElement("div");
      card.className = "poi";
      card.innerHTML =
        '<div class="poi__thumb" data-tone="' + (b.tone % TONES) + '" aria-hidden="true">' + poiEmoji(b.cat) + "</div>" +
        '<div class="poi__main">' +
        '<p class="poi__name">' + esc(b.name) + "</p>" +
        '<span class="poi__cat">' + esc(b.cat) + "</span>" +
        '<p class="poi__desc">' + esc(b.desc) + "</p>" +
        "</div>" +
        '<div class="poi__side">' +
        '<span class="poi__rating">' + esc(b.rating) + "</span>" +
        '<span class="poi__price">' + esc(b.price) + "</span>" +
        '<button class="poi__save' + (b.saved ? " is-saved" : "") + '" type="button" aria-pressed="' + b.saved + '">' +
        (b.saved ? "♥ Saved" : "♡ Save") + "</button>" +
        "</div>";
      $(".poi__save", card).addEventListener("click", (e) => {
        b.saved = !b.saved;
        const btn = e.currentTarget;
        btn.classList.toggle("is-saved", b.saved);
        btn.setAttribute("aria-pressed", String(b.saved));
        btn.textContent = b.saved ? "♥ Saved" : "♡ Save";
        toast(b.saved ? "Added “" + b.name + "” to your trip" : "Removed from trip", b.saved ? "♥" : "♡");
      });
      wrap.appendChild(card);
    } else if (b.type === "tip") {
      const tip = document.createElement("div");
      tip.className = "tip";
      tip.innerHTML =
        '<span class="tip__icon" aria-hidden="true">💡</span>' +
        '<div><span class="tip__label">Travel tip</span>' +
        '<p class="tip__text" contenteditable="true" spellcheck="true" role="textbox" aria-label="Travel tip text">' +
        esc(b.text) + "</p></div>";
      const t = $(".tip__text", tip);
      t.addEventListener("input", () => {
        b.text = t.textContent;
        markDirty();
      });
      wrap.appendChild(tip);
    } else if (b.type === "map") {
      const map = document.createElement("div");
      map.className = "mapb";
      map.innerHTML =
        '<div class="mapb__head"><span>🗺 ' + esc(b.title) + "</span><span>" + b.pins.length + " stops</span></div>" +
        '<div class="mapb__canvas">' + mapSvg(b.pins) + '<div class="mapb__pins">' + mapPins(b.pins) + "</div></div>" +
        '<p class="mapb__note">' + esc(b.note) + "</p>";
      wrap.appendChild(map);
    }
    return wrap;
  }

  function poiEmoji(cat) {
    const c = cat.toLowerCase();
    if (c.includes("food") || c.includes("bakery")) return "🍽";
    if (c.includes("view")) return "🌅";
    if (c.includes("ride")) return "🚋";
    if (c.includes("design")) return "🛍";
    return "📍";
  }

  /* SVG map mockup with a dashed route through the pins */
  function mapSvg(pins) {
    const route = pins.map((p) => p.x + "," + p.y).join(" ");
    return (
      '<svg class="mapb__svg" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">' +
      '<rect width="100" height="60" fill="#eef3ee"/>' +
      '<path d="M0 46 Q25 42 50 47 T100 45 L100 60 L0 60 Z" fill="#bfe0e6"/>' +
      '<ellipse cx="30" cy="20" rx="14" ry="9" fill="#d6e6cf"/>' +
      '<ellipse cx="78" cy="16" rx="11" ry="7" fill="#d6e6cf"/>' +
      '<g stroke="#dcd6c9" stroke-width="1.2">' +
      '<path d="M0 30 H100"/><path d="M0 14 H100"/><path d="M20 0 V60"/>' +
      '<path d="M55 0 V60"/><path d="M82 0 V46"/>' +
      "</g>" +
      '<polyline points="' + route + '" fill="none" stroke="#e8623f" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 2.4"/>' +
      "</svg>"
    );
  }
  function mapPins(pins) {
    return pins
      .map(
        (p) =>
          '<div class="pin" style="left:' + p.x + "%;top:" + p.y + '%">' +
          '<span class="pin__dot"><span>' + p.n + "</span></span>" +
          '<span class="pin__label">' + esc(p.label) + "</span></div>"
      )
      .join("");
  }

  function moveBlock(id, delta) {
    const s = active();
    const i = s.blocks.findIndex((b) => b.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= s.blocks.length) return;
    [s.blocks[i], s.blocks[j]] = [s.blocks[j], s.blocks[i]];
    renderBlocks();
    markDirty();
  }

  function addBlock(kind) {
    const s = active();
    const b = kind === "poi" ? poiBlock(s.blocks.length) : kind === "map" ? mapBlock() : tipBlock();
    s.blocks.push(b);
    renderBlocks();
    renderOutline();
    updateStats();
    markDirty();
    const label = kind === "poi" ? "POI card" : kind === "map" ? "Map block" : "Travel tip";
    toast(label + " inserted", "＋");
    requestAnimationFrame(() => {
      const el = $('.block[data-id="' + b.id + '"]', blocksEl);
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  /* =================================================================
     INSPECTOR (right) + bindings
     ================================================================= */
  function loadActive() {
    const s = active();
    $("#inspectorTag").textContent = "Section " + (state.sections.indexOf(s) + 1);
    $("#iTitle").value = s.name;
    $("#iEyebrow").value = s.eyebrow;
    $("#iBody").value = s.body;
    $("#iPublish").checked = s.published;
    $("#iSlug").value = s.slug;

    $$(".scene-sw", $("#scenePick")).forEach((b) =>
      b.setAttribute("aria-checked", String(b.dataset.scene === s.scene))
    );
    $$(".seg__btn", $("#bestSeg")).forEach((b) => {
      const on = b.dataset.best === s.best;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", String(on));
    });

    renderCover();
    renderBlocks();
    updateSeo();
    updateStats();
  }

  function updateSeo() {
    const s = active();
    $("#seoSlug").textContent = s.slug;
    $("#seoTitle").textContent = s.name || "Untitled section";
    $("#seoDesc").textContent = s.body
      ? s.body.slice(0, 155) + (s.body.length > 155 ? "…" : "")
      : "Add an intro to generate a description.";
    const len = (s.body || "").length;
    const pct = Math.min(100, Math.round((len / 160) * 100));
    const bar = $("#seoBar");
    bar.style.width = pct + "%";
    let color = "var(--ok)", hint = "Good length";
    if (len < 70) { color = "var(--gold)"; hint = "A little short — aim for 70–160 chars"; }
    else if (len > 160) { color = "var(--coral)"; hint = "Trim to under 160 chars for search"; }
    bar.style.background = color;
    $("#seoHint").textContent = hint;
  }

  function updateStats() {
    const s = active();
    const w =
      words(s.body) +
      s.blocks.reduce((n, b) => n + (b.desc ? words(b.desc) : 0) + (b.text ? words(b.text) : 0), 0);
    $("#statWords").textContent = w;
    $("#statBlocks").textContent = s.blocks.length;
    $("#statRead").textContent = Math.max(1, Math.round(w / 200)) + "m";
  }

  /* ----- live two-way bindings ----- */
  function bindField(id, apply, afterRender) {
    $("#" + id).addEventListener("input", (e) => {
      apply(active(), e.target.value);
      afterRender && afterRender();
      markDirty();
    });
  }

  bindField("iTitle", (s, v) => { s.name = v; }, () => {
    renderCover();
    if ($("#coverTitle").textContent !== active().name) $("#coverTitle").textContent = active().name;
    updateNameInOutline();
    updateSeo();
  });
  bindField("iEyebrow", (s, v) => { s.eyebrow = v; }, renderCover);
  bindField("iBody", (s, v) => { s.body = v; }, () => {
    const intro = $("#introField");
    if (intro && intro.textContent !== active().body) intro.textContent = active().body;
    updateSeo();
    updateStats();
    updateOutlineMeta();
  });
  bindField("iSlug", (s, v) => { s.slug = slugify(v); }, updateSeo);
  $("#iSlug").addEventListener("blur", (e) => { e.target.value = active().slug; });

  // contenteditable cover title -> inspector + model
  $("#coverTitle").addEventListener("input", () => {
    const s = active();
    s.name = $("#coverTitle").textContent;
    $("#iTitle").value = s.name;
    updateNameInOutline();
    updateSeo();
    markDirty();
  });
  $("#coverTitle").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); e.target.blur(); }
  });

  function updateNameInOutline() {
    const li = $('.sec[data-id="' + state.activeId + '"]');
    if (li) $(".sec__name", li).textContent = active().name || "Untitled section";
  }
  function updateOutlineMeta() {
    const totalWords = state.sections.reduce(
      (n, s) => n + words(s.body) + s.blocks.reduce((m, b) => m + (b.desc ? words(b.desc) : b.text ? words(b.text) : 0), 0),
      0
    );
    $("#readTime").textContent = "~" + Math.max(1, Math.round(totalWords / 200)) + " min read";
  }

  // publish toggle
  $("#iPublish").addEventListener("change", (e) => {
    const s = active();
    s.published = e.target.checked;
    coverEl.dataset.published = String(s.published);
    const li = $('.sec[data-id="' + s.id + '"]');
    if (li) {
      li.dataset.published = String(s.published);
      const meta = $(".sec__meta", li);
      meta.childNodes[1].textContent = s.published ? "Published" : "Draft";
    }
    markDirty();
    toast(s.published ? "Section published" : "Moved to draft", s.published ? "👁" : "✎");
  });

  // scene swatches (radiogroup)
  $("#scenePick").addEventListener("click", (e) => {
    const sw = e.target.closest(".scene-sw");
    if (!sw) return;
    active().scene = sw.dataset.scene;
    $$(".scene-sw", e.currentTarget).forEach((b) =>
      b.setAttribute("aria-checked", String(b === sw))
    );
    renderCover();
    markDirty();
  });
  $("#scenePick").addEventListener("keydown", (e) => arrowRadio(e, ".scene-sw"));

  // best-time segment (radiogroup)
  $("#bestSeg").addEventListener("click", (e) => {
    const btn = e.target.closest(".seg__btn");
    if (!btn) return;
    active().best = btn.dataset.best;
    $$(".seg__btn", e.currentTarget).forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", String(on));
    });
    renderCover();
    markDirty();
  });
  $("#bestSeg").addEventListener("keydown", (e) => arrowRadio(e, ".seg__btn"));

  function arrowRadio(e, sel) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    const items = $$(sel, e.currentTarget);
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = items[(i + dir + items.length) % items.length];
    next.focus();
    next.click();
  }

  // inspector add-block chips
  $$(".block-add [data-add]").forEach((btn) =>
    btn.addEventListener("click", () => addBlock(btn.dataset.add))
  );

  $("#docTitle").textContent = state.docTitle;

  /* =================================================================
     TOPBAR ACTIONS
     ================================================================= */
  $("#addSectionBtn").addEventListener("click", addSection);

  $("#publishBtn").addEventListener("click", () => {
    const live = state.sections.filter((s) => s.published).length;
    if (!live) {
      toast("Publish at least one section first", "!");
      return;
    }
    const btn = $("#publishBtn");
    btn.classList.add("is-live");
    btn.textContent = "Published ✓";
    toast(live + " of " + state.sections.length + " sections are live", "🌍");
    setTimeout(() => {
      btn.classList.remove("is-live");
      btn.textContent = "Publish";
    }, 2400);
  });

  /* ----- preview modal ----- */
  const modal = $("#previewModal");
  let lastFocus = null;

  function openPreview() {
    lastFocus = document.activeElement;
    $("#previewBody").innerHTML = renderReader();
    modal.hidden = false;
    document.addEventListener("keydown", onModalKey);
    $("#closePreview").focus();
  }
  function closePreview() {
    modal.hidden = true;
    document.removeEventListener("keydown", onModalKey);
    if (lastFocus) lastFocus.focus();
  }
  function onModalKey(e) {
    if (e.key === "Escape") { closePreview(); return; }
    if (e.key === "Tab") {
      const f = $$("button, [href], input, [tabindex]:not([tabindex='-1'])", modal).filter(
        (el) => !el.disabled && el.offsetParent !== null
      );
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function renderReader() {
    const live = state.sections.filter((s) => s.published);
    if (!live.length) return '<div class="rd-empty">No published sections yet. Toggle “Published” to add one.</div>';
    return live
      .map((s) => {
        const pois = s.blocks
          .filter((b) => b.type === "poi")
          .map(
            (b) =>
              '<div class="rd-poi"><strong>' + esc(b.name) + "</strong> <span>" +
              esc(b.cat) + '</span><span class="rd-poi__r">★ ' + esc(b.rating) + "</span></div>"
          )
          .join("");
        return (
          '<div class="rd-cover" style="background:' + sceneBg(s.scene) + '">' +
          '<div><span class="rd-cover__eyebrow">' + esc(s.eyebrow) + "</span>" +
          "<h3>" + esc(s.name) + "</h3></div></div>" +
          '<div class="rd-body"><p>' + esc(s.body) + "</p>" + pois + "</div>"
        );
      })
      .join("");
  }
  function sceneBg(scene) {
    return {
      city: "linear-gradient(135deg,#ffd9a8,#e8916a)",
      coast: "linear-gradient(135deg,#8ec9d6,#3a9ca8)",
      alpine: "linear-gradient(135deg,#9ec1d2,#6f95a8)",
      desert: "linear-gradient(135deg,#e9a463,#cf7b46)",
    }[scene] || "linear-gradient(135deg,#ffd9a8,#e8916a)";
  }

  $("#previewBtn").addEventListener("click", openPreview);
  $("#closePreview").addEventListener("click", closePreview);
  modal.addEventListener("click", (e) => { if (e.target === modal) closePreview(); });

  /* ----- ⌘/Ctrl+S = "save" feel ----- */
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      markDirty();
      setTimeout(() => toast("Guide saved", "💾"), 760);
    }
  });

  /* =================================================================
     BOOT
     ================================================================= */
  renderOutline();
  loadActive();
})();
