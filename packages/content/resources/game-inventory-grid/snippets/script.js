(() => {
  "use strict";

  const GRID_SLOTS = 24; // 6 x 4
  const WEIGHT_MAX = 120;

  // ---- item catalog (fictional) ----
  const ITEMS = {
    stormpike: {
      name: "Stormpike Edge", glyph: "sword", rar: "legendary", type: "Two-Handed Blade",
      slot: "weapon", weight: 14, stack: 1, flavor: "Forged in the Ashen Vents of Nullforge.",
      stats: { Power: 142, Crit: "9%", Speed: "1.4" }
    },
    nightveil: {
      name: "Nightveil Plate", glyph: "chest", rar: "epic", type: "Heavy Chest",
      slot: "chest", weight: 18, stack: 1, flavor: "Woven shadow hardens to steel.",
      stats: { Armor: 96, Vitality: 40 }
    },
    aegis: {
      name: "Aegis of Hollow Reign", glyph: "shield", rar: "epic", type: "Tower Shield",
      slot: "weapon", weight: 16, stack: 1, flavor: "Last bastion of the fallen kings.",
      stats: { Armor: 72, Block: "22%" }
    },
    sentinel: {
      name: "Sentinel Helm", glyph: "helm", rar: "rare", type: "Plate Helm",
      slot: "head", weight: 8, stack: 1, flavor: "Eyes that never close.",
      stats: { Armor: 44, Focus: 18 }
    },
    emberband: {
      name: "Emberband", glyph: "ring", rar: "rare", type: "Signet Ring",
      slot: "ring", weight: 1, stack: 1, flavor: "Warm to the touch, always.",
      stats: { Crit: "6%", Power: 20 }
    },
    driftbow: {
      name: "Neon Drift", glyph: "bow", rar: "uncommon", type: "Recurve Bow",
      slot: "weapon", weight: 9, stack: 1, flavor: "Hums when the wind shifts.",
      stats: { Power: 58, Range: "+30" }
    },
    embervial: {
      name: "Ember Vial", glyph: "potion", rar: "uncommon", type: "Consumable",
      slot: null, weight: 1, stack: 12, flavor: "Restores 240 HP over 6s.",
      stats: { Heal: 240 }
    },
    voidshard: {
      name: "Void Shard", glyph: "gem", rar: "epic", type: "Crafting Gem",
      slot: null, weight: 1, stack: 5, flavor: "A splinter of the space between worlds.",
      stats: { Value: 900 }
    },
    scrollwind: {
      name: "Scroll of Wending", glyph: "scroll", rar: "common", type: "Consumable",
      slot: null, weight: 1, stack: 3, flavor: "Recall to the last sanctuary.",
      stats: { Cooldown: "30m" }
    },
    pulseorb: {
      name: "Pulse Orb", glyph: "orb", rar: "rare", type: "Trinket",
      slot: null, weight: 2, stack: 1, flavor: "Throbs in time with your heartbeat.",
      stats: { Energy: 60 }
    },
    iron: {
      name: "Iron Ingot", glyph: "gem", rar: "common", type: "Material",
      slot: null, weight: 2, stack: 20, flavor: "Standard smithing stock.",
      stats: { Value: 12 }
    }
  };

  const RAR_ORDER = ["common", "uncommon", "rare", "epic", "legendary"];

  // ---- initial layout (slot index -> {id, count}) ----
  let bag = new Array(GRID_SLOTS).fill(null);
  const seed = [
    ["stormpike", 1], ["nightveil", 1], ["sentinel", 1], ["emberband", 1],
    ["driftbow", 1], ["aegis", 1], ["embervial", 7], ["voidshard", 3],
    ["scrollwind", 2], ["pulseorb", 1], ["iron", 14]
  ];
  seed.forEach(([id, c], i) => { bag[i] = { id, count: c }; });

  const equip = { head: null, chest: null, weapon: null, ring: null };

  // ---- DOM ----
  const grid = document.getElementById("grid");
  const tip = document.getElementById("tip");
  const toasts = document.getElementById("toasts");
  const wtCur = document.getElementById("wt-cur");
  const wtFill = document.getElementById("wt-fill");
  const wtBar = document.getElementById("wt-bar");
  const goldEl = document.getElementById("gold");

  let gold = 12480;

  // ---- build grid slots ----
  for (let i = 0; i < GRID_SLOTS; i++) {
    const s = document.createElement("div");
    s.className = "slot";
    s.dataset.idx = String(i);
    s.setAttribute("role", "gridcell");
    grid.appendChild(s);
  }

  const equipSlots = [...document.querySelectorAll(".equip__slot")];

  // ---- toast helper ----
  function toast(msg, kind) {
    const el = document.createElement("div");
    el.className = "toast" + (kind ? " toast--" + kind : "");
    el.innerHTML = `<span class="toast__dot"></span><span>${msg}</span>`;
    toasts.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 2600);
  }

  // ---- create an item element ----
  function makeItem(id, count) {
    const def = ITEMS[id];
    const el = document.createElement("div");
    el.className = "item";
    el.dataset.id = id;
    el.dataset.rar = def.rar;
    el.draggable = true;
    el.tabIndex = 0;
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", `${def.name}, ${def.rar} ${def.type}`);
    el.innerHTML = `<span class="glyph glyph--${def.glyph}"></span>` +
      (count > 1 ? `<span class="stack">${count}</span>` : "");
    return el;
  }

  // ---- render everything ----
  function render() {
    // bag
    [...grid.children].forEach((slotEl, i) => {
      slotEl.querySelector(".item")?.remove();
      const cell = bag[i];
      if (cell) slotEl.appendChild(makeItem(cell.id, cell.count));
    });
    // equipment
    equipSlots.forEach((slotEl) => {
      slotEl.querySelector(".item")?.remove();
      const id = equip[slotEl.dataset.equip];
      slotEl.classList.toggle("has-item", !!id);
      if (id) slotEl.appendChild(makeItem(id, 1));
    });
    updateWeight();
    updateStats();
  }

  function totalWeight() {
    let w = 0;
    bag.forEach((c) => { if (c) w += ITEMS[c.id].weight * c.count; });
    Object.values(equip).forEach((id) => { if (id) w += ITEMS[id].weight; });
    return w;
  }

  function updateWeight() {
    const w = totalWeight();
    const pct = Math.min(100, (w / WEIGHT_MAX) * 100);
    wtCur.textContent = w;
    wtFill.style.width = pct + "%";
    wtFill.classList.toggle("warn", pct >= 75 && pct < 100);
    wtFill.classList.toggle("over", pct >= 100);
    wtBar.setAttribute("aria-valuenow", String(w));
  }

  function updateStats() {
    let pow = 90, arm = 40, crit = 5;
    Object.values(equip).forEach((id) => {
      if (!id) return;
      const s = ITEMS[id].stats;
      if (s.Power) pow += +String(s.Power).replace(/\D/g, "");
      if (s.Armor) arm += +String(s.Armor).replace(/\D/g, "");
      if (s.Crit) crit += +String(s.Crit).replace(/\D/g, "");
    });
    document.getElementById("stat-pow").textContent = pow;
    document.getElementById("stat-arm").textContent = arm;
    document.getElementById("stat-crit").textContent = crit + "%";
  }

  // ---- tooltip ----
  function showTip(itemEl, x, y) {
    const id = itemEl.dataset.id;
    const def = ITEMS[id];
    tip.style.setProperty("--rar", `var(--rar-${def.rar})`);
    document.getElementById("tip-name").textContent = def.name;
    document.getElementById("tip-rar").textContent = def.rar;
    document.getElementById("tip-type").textContent = def.type;
    const statsEl = document.getElementById("tip-stats");
    statsEl.innerHTML = Object.entries(def.stats)
      .map(([k, v]) => `<li><span>${k}</span><span class="pos">${v}</span></li>`)
      .join("");
    document.getElementById("tip-flavor").textContent = def.flavor;
    const inEquip = itemEl.closest(".equip__slot");
    document.getElementById("tip-cta").textContent =
      inEquip ? "Right-click to unequip" :
      def.slot ? "Right-click to equip" :
      def.stats.Heal || def.type === "Consumable" ? "Right-click to use" : "";
    moveTip(x, y);
    tip.classList.add("show");
    tip.setAttribute("aria-hidden", "false");
  }
  function moveTip(x, y) {
    const pad = 14, w = tip.offsetWidth, h = tip.offsetHeight;
    let left = x + 16, top = y + 16;
    if (left + w + pad > innerWidth) left = x - w - 16;
    if (top + h + pad > innerHeight) top = innerHeight - h - pad;
    tip.style.left = Math.max(pad, left) + "px";
    tip.style.top = Math.max(pad, top) + "px";
  }
  function hideTip() {
    tip.classList.remove("show");
    tip.setAttribute("aria-hidden", "true");
  }

  // ---- drag & drop ----
  let dragSrc = null; // { kind:'bag', idx } | { kind:'equip', slot }

  function locateItem(itemEl) {
    const bagSlot = itemEl.closest(".slot");
    if (bagSlot) return { kind: "bag", idx: +bagSlot.dataset.idx };
    const eqSlot = itemEl.closest(".equip__slot");
    if (eqSlot) return { kind: "equip", slot: eqSlot.dataset.equip };
    return null;
  }

  grid.addEventListener("dragstart", onDragStart);
  document.querySelector(".equip__doll").addEventListener("dragstart", onDragStart);

  function onDragStart(e) {
    const item = e.target.closest(".item");
    if (!item) return;
    dragSrc = locateItem(item);
    item.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.dataset.id);
    hideTip();
  }

  document.addEventListener("dragend", (e) => {
    e.target.closest?.(".item")?.classList.remove("dragging");
    clearDropHints();
    dragSrc = null;
  });

  function clearDropHints() {
    document.querySelectorAll(".drop-ok, .drop-bad").forEach((el) =>
      el.classList.remove("drop-ok", "drop-bad"));
  }

  // bag slots accept anything
  grid.addEventListener("dragover", (e) => {
    const slot = e.target.closest(".slot");
    if (!slot || !dragSrc) return;
    e.preventDefault();
    slot.classList.add("drop-ok");
  });
  grid.addEventListener("dragleave", (e) => {
    e.target.closest(".slot")?.classList.remove("drop-ok");
  });
  grid.addEventListener("drop", (e) => {
    const slot = e.target.closest(".slot");
    if (!slot || !dragSrc) return;
    e.preventDefault();
    dropToBag(+slot.dataset.idx);
  });

  // equipment slots accept only matching types
  equipSlots.forEach((slot) => {
    slot.addEventListener("dragover", (e) => {
      if (!dragSrc) return;
      const id = draggedId();
      const def = id && ITEMS[id];
      const ok = def && def.slot === slot.dataset.accept;
      e.preventDefault();
      slot.classList.add(ok ? "drop-ok" : "drop-bad");
    });
    slot.addEventListener("dragleave", () => slot.classList.remove("drop-ok", "drop-bad"));
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      dropToEquip(slot.dataset.equip);
    });
  });

  function draggedId() {
    if (!dragSrc) return null;
    return dragSrc.kind === "bag" ? bag[dragSrc.idx]?.id : equip[dragSrc.slot];
  }

  function dropToBag(targetIdx) {
    if (!dragSrc) return;
    if (dragSrc.kind === "bag") {
      if (dragSrc.idx === targetIdx) return;
      const a = bag[dragSrc.idx];
      const b = bag[targetIdx];
      // merge stacks of the same stackable item
      if (a && b && a.id === b.id && ITEMS[a.id].stack > 1) {
        const moved = Math.min(a.count, ITEMS[a.id].stack - b.count);
        if (moved > 0) {
          b.count += moved;
          a.count -= moved;
          if (a.count <= 0) bag[dragSrc.idx] = null;
          clearDropHints();
          render();
          return;
        }
      }
      bag[targetIdx] = a;
      bag[dragSrc.idx] = b; // swap (b may be null = move)
    } else {
      // moving an equipped item back into bag
      const id = equip[dragSrc.slot];
      const existing = bag[targetIdx];
      if (existing && ITEMS[existing.id].slot === dragSrc.slot) {
        // swap-equip: target item takes the gear slot
        equip[dragSrc.slot] = existing.id;
        bag[targetIdx] = { id, count: 1 };
        toast(`Equipped ${ITEMS[existing.id].name}`, "good");
      } else if (!existing) {
        equip[dragSrc.slot] = null;
        bag[targetIdx] = { id, count: 1 };
        toast(`Unequipped ${ITEMS[id].name}`, "warn");
      } else {
        toast("That slot is occupied", "warn");
      }
    }
    clearDropHints();
    render();
  }

  function dropToEquip(slotName) {
    const id = draggedId();
    if (!id) { clearDropHints(); return; }
    const def = ITEMS[id];
    if (def.slot !== slotName) { toast(`${def.name} can't go there`, "warn"); clearDropHints(); return; }
    if (dragSrc.kind === "bag") {
      const prev = equip[slotName];
      equip[slotName] = id;
      // equippables are stack 1: source slot takes the previous gear (or empties)
      bag[dragSrc.idx] = prev ? { id: prev, count: 1 } : null;
    } else {
      const prev = equip[slotName];
      equip[slotName] = id;
      equip[dragSrc.slot] = prev;
    }
    toast(`Equipped ${def.name}`, "good");
    clearDropHints();
    render();
  }

  // ---- hover tooltip (delegated) ----
  document.addEventListener("mouseover", (e) => {
    const item = e.target.closest(".item");
    if (item) showTip(item, e.clientX, e.clientY);
  });
  document.addEventListener("mousemove", (e) => {
    if (tip.classList.contains("show") && e.target.closest(".item")) moveTip(e.clientX, e.clientY);
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(".item") && !e.relatedTarget?.closest?.(".item")) hideTip();
  });
  // keyboard focus tooltip
  document.addEventListener("focusin", (e) => {
    const item = e.target.closest(".item");
    if (item) { const r = item.getBoundingClientRect(); showTip(item, r.right, r.top); }
  });
  document.addEventListener("focusout", (e) => { if (e.target.closest(".item")) hideTip(); });

  // ---- right-click: use / equip / unequip ----
  document.addEventListener("contextmenu", (e) => {
    const item = e.target.closest(".item");
    if (!item) return;
    e.preventDefault();
    const loc = locateItem(item);
    const id = item.dataset.id;
    const def = ITEMS[id];

    if (loc.kind === "equip") {
      const free = bag.indexOf(null);
      if (free === -1) { toast("Backpack is full", "warn"); return; }
      bag[free] = { id, count: 1 };
      equip[loc.slot] = null;
      toast(`Unequipped ${def.name}`, "warn");
      hideTip(); render(); return;
    }

    // in bag
    if (def.slot) {
      const cell = bag[loc.idx];
      const prev = equip[def.slot];
      equip[def.slot] = id;
      bag[loc.idx] = prev ? { id: prev, count: 1 } :
        (cell.count > 1 ? { id, count: cell.count - 1 } : null);
      toast(`Equipped ${def.name}`, "good");
    } else if (def.stats.Heal || def.type === "Consumable") {
      const cell = bag[loc.idx];
      cell.count -= 1;
      if (cell.count <= 0) bag[loc.idx] = null;
      toast(`Used ${def.name}`, "good");
    } else {
      toast(`${def.name} can't be used`, "warn");
      return;
    }
    hideTip(); render();
  });

  // keyboard: Enter / E to use-equip the focused item
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key.toLowerCase() !== "e") return;
    const item = document.activeElement?.closest?.(".item");
    if (!item) return;
    e.preventDefault();
    item.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
  });

  // ---- sort button ----
  document.getElementById("sort").addEventListener("click", () => {
    const items = bag.filter(Boolean);
    items.sort((a, b) => {
      const ra = RAR_ORDER.indexOf(ITEMS[b.id].rar) - RAR_ORDER.indexOf(ITEMS[a.id].rar);
      if (ra !== 0) return ra;
      return ITEMS[a.id].name.localeCompare(ITEMS[b.id].name);
    });
    bag = new Array(GRID_SLOTS).fill(null);
    items.forEach((it, i) => { bag[i] = it; });
    render();
    toast("Backpack sorted by rarity", "good");
  });

  // ---- footer actions ----
  document.getElementById("repair").addEventListener("click", () => {
    const cost = 340;
    if (gold < cost) { toast("Not enough gold to repair", "warn"); return; }
    gold -= cost;
    goldEl.textContent = gold.toLocaleString();
    toast(`Repaired all gear · -${cost} gold`, "good");
  });

  document.getElementById("loot").addEventListener("click", () => {
    const pool = ["embervial", "iron", "voidshard", "scrollwind", "pulseorb"];
    const id = pool[Math.floor(Math.random() * pool.length)];
    const def = ITEMS[id];
    // stack onto existing if stackable
    if (def.stack > 1) {
      const ex = bag.findIndex((c) => c && c.id === id && c.count < def.stack);
      if (ex !== -1) { bag[ex].count = Math.min(def.stack, bag[ex].count + 1); render(); toast(`Looted ${def.name}`, "good"); return; }
    }
    const free = bag.indexOf(null);
    if (free === -1) { toast("Backpack is full", "warn"); return; }
    bag[free] = { id, count: 1 };
    render();
    toast(`Looted ${def.name}`, "good");
  });

  goldEl.textContent = gold.toLocaleString();
  document.getElementById("wt-max").textContent = WEIGHT_MAX;
  render();
})();
