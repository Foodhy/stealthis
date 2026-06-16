(function () {
  "use strict";

  /* ---------- Data: fictional recipes ---------- */
  // Categories drive aisle grouping & order.
  const CATEGORY_META = {
    produce: { label: "Produce", emoji: "🥕", order: 1 },
    meat: { label: "Meat & Fish", emoji: "🍖", order: 2 },
    dairy: { label: "Dairy & Eggs", emoji: "🧀", order: 3 },
    pantry: { label: "Pantry", emoji: "🫙", order: 4 },
  };

  const RECIPES = [
    {
      id: "orzo",
      title: "Charred Tomato & Saffron Orzo",
      meta: "Dinner · 35 min · serves 4",
      accent: "var(--tomato)",
      emoji: "🍅",
      ingredients: [
        { name: "Cherry tomatoes", qty: 500, unit: "g", cat: "produce" },
        { name: "Garlic", qty: 4, unit: "clove", cat: "produce" },
        { name: "Yellow onion", qty: 1, unit: "", cat: "produce" },
        { name: "Orzo pasta", qty: 300, unit: "g", cat: "pantry" },
        { name: "Saffron threads", qty: 1, unit: "pinch", cat: "pantry" },
        { name: "Vegetable stock", qty: 750, unit: "ml", cat: "pantry" },
        { name: "Olive oil", qty: 3, unit: "tbsp", cat: "pantry" },
        { name: "Pecorino", qty: 60, unit: "g", cat: "dairy" },
        { name: "Fresh basil", qty: 0, unit: "to taste", cat: "produce" },
      ],
    },
    {
      id: "shakshuka",
      title: "Smoky Red Pepper Shakshuka",
      meta: "Brunch · 30 min · serves 3",
      accent: "var(--clay)",
      emoji: "🍳",
      ingredients: [
        { name: "Eggs", qty: 6, unit: "", cat: "dairy" },
        { name: "Red bell pepper", qty: 2, unit: "", cat: "produce" },
        { name: "Yellow onion", qty: 1, unit: "", cat: "produce" },
        { name: "Garlic", qty: 3, unit: "clove", cat: "produce" },
        { name: "Cherry tomatoes", qty: 400, unit: "g", cat: "produce" },
        { name: "Smoked paprika", qty: 2, unit: "tsp", cat: "pantry" },
        { name: "Olive oil", qty: 2, unit: "tbsp", cat: "pantry" },
        { name: "Feta", qty: 100, unit: "g", cat: "dairy" },
        { name: "Fresh parsley", qty: 0, unit: "to taste", cat: "produce" },
      ],
    },
    {
      id: "chicken",
      title: "Lemon-Herb Roast Chicken Thighs",
      meta: "Dinner · 50 min · serves 4",
      accent: "var(--saffron)",
      emoji: "🍗",
      ingredients: [
        { name: "Chicken thighs", qty: 8, unit: "", cat: "meat" },
        { name: "Lemon", qty: 2, unit: "", cat: "produce" },
        { name: "Garlic", qty: 5, unit: "clove", cat: "produce" },
        { name: "Baby potatoes", qty: 700, unit: "g", cat: "produce" },
        { name: "Olive oil", qty: 3, unit: "tbsp", cat: "pantry" },
        { name: "Dried thyme", qty: 1, unit: "tbsp", cat: "pantry" },
        { name: "Butter", qty: 40, unit: "g", cat: "dairy" },
      ],
    },
    {
      id: "soup",
      title: "Tuscan White Bean & Kale Soup",
      meta: "Lunch · 40 min · serves 6",
      accent: "var(--sage)",
      emoji: "🥬",
      ingredients: [
        { name: "Cannellini beans", qty: 2, unit: "can", cat: "pantry" },
        { name: "Kale", qty: 200, unit: "g", cat: "produce" },
        { name: "Carrot", qty: 3, unit: "", cat: "produce" },
        { name: "Celery", qty: 3, unit: "stalk", cat: "produce" },
        { name: "Yellow onion", qty: 1, unit: "", cat: "produce" },
        { name: "Garlic", qty: 3, unit: "clove", cat: "produce" },
        { name: "Vegetable stock", qty: 1000, unit: "ml", cat: "pantry" },
        { name: "Parmesan rind", qty: 1, unit: "", cat: "dairy" },
        { name: "Olive oil", qty: 2, unit: "tbsp", cat: "pantry" },
      ],
    },
    {
      id: "tacos",
      title: "Crispy Black Bean Tacos",
      meta: "Dinner · 25 min · serves 4",
      accent: "var(--tomato-d)",
      emoji: "🌮",
      ingredients: [
        { name: "Black beans", qty: 2, unit: "can", cat: "pantry" },
        { name: "Corn tortillas", qty: 12, unit: "", cat: "pantry" },
        { name: "Avocado", qty: 2, unit: "", cat: "produce" },
        { name: "Lime", qty: 2, unit: "", cat: "produce" },
        { name: "Red onion", qty: 1, unit: "", cat: "produce" },
        { name: "Cherry tomatoes", qty: 200, unit: "g", cat: "produce" },
        { name: "Ground cumin", qty: 1, unit: "tsp", cat: "pantry" },
        { name: "Cheddar", qty: 120, unit: "g", cat: "dairy" },
        { name: "Sour cream", qty: 150, unit: "g", cat: "dairy" },
      ],
    },
  ];

  /* ---------- State ---------- */
  const selected = new Set();
  // checked + per-item overrides keyed by "cat|name"
  const checked = new Set();
  const removed = new Set();
  const overrides = {}; // key -> display string override

  /* ---------- Elements ---------- */
  const chipsEl = document.getElementById("recipe-chips");
  const groupsEl = document.getElementById("groups");
  const emptyEl = document.getElementById("empty");
  const summaryEl = document.getElementById("summary");
  const pickerSub = document.getElementById("picker-sub");
  const progressWrap = document.getElementById("progress-wrap");
  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");
  const toastEl = document.getElementById("toast");

  /* ---------- Helpers ---------- */
  function keyFor(item) {
    return item.cat + "|" + item.name.toLowerCase();
  }

  function fmtNum(n) {
    // round to at most 2 decimals, drop trailing zeros
    const r = Math.round(n * 100) / 100;
    return Number.isInteger(r) ? String(r) : String(r).replace(/\.?0+$/, "");
  }

  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ---------- Aggregation ---------- */
  // Returns { cat: [ {name, cat, lines:[{qty,unit}], from:Set} ] }
  function aggregate() {
    const map = new Map(); // key -> entry
    selected.forEach((rid) => {
      const recipe = RECIPES.find((r) => r.id === rid);
      if (!recipe) return;
      recipe.ingredients.forEach((ing) => {
        const k = keyFor(ing);
        if (removed.has(k)) return;
        if (!map.has(k)) {
          map.set(k, {
            key: k,
            name: ing.name,
            cat: ing.cat,
            units: new Map(), // unit -> summed qty (qty 0 = "to taste" style)
            from: new Set(),
          });
        }
        const entry = map.get(k);
        entry.from.add(recipe.title);
        const u = ing.unit;
        if (ing.qty === 0) {
          // non-numeric (to taste); store as a flag unit with qty 0
          if (!entry.units.has(u)) entry.units.set(u, 0);
        } else {
          entry.units.set(u, (entry.units.get(u) || 0) + ing.qty);
        }
      });
    });
    return map;
  }

  // Build a readable quantity string from a units map.
  function qtyString(unitsMap) {
    const parts = [];
    unitsMap.forEach((qty, unit) => {
      if (qty === 0) {
        parts.push(unit || "as needed"); // e.g. "to taste"
        return;
      }
      const plural = (unit === "clove" || unit === "stalk" || unit === "can") && qty !== 1 ? "s" : "";
      const unitStr = unit ? unit + plural : "";
      parts.push(unitStr ? fmtNum(qty) + " " + unitStr : "×" + fmtNum(qty));
    });
    return parts.join(" + ");
  }

  /* ---------- Render list ---------- */
  function render() {
    const map = aggregate();
    const items = Array.from(map.values());

    // group by category
    const byCat = {};
    items.forEach((it) => {
      (byCat[it.cat] = byCat[it.cat] || []).push(it);
    });

    const cats = Object.keys(byCat).sort(
      (a, b) => CATEGORY_META[a].order - CATEGORY_META[b].order
    );

    groupsEl.innerHTML = "";

    if (items.length === 0) {
      emptyEl.hidden = false;
      progressWrap.hidden = true;
    } else {
      emptyEl.hidden = true;
    }

    let total = 0;
    let done = 0;

    cats.forEach((cat) => {
      const list = byCat[cat].sort((a, b) => a.name.localeCompare(b.name));
      const meta = CATEGORY_META[cat];

      const group = document.createElement("div");
      group.className = "group";

      const head = document.createElement("div");
      head.className = "group-head";
      head.innerHTML =
        '<span class="group-emoji" aria-hidden="true">' + meta.emoji + "</span>" +
        '<h3 class="group-title">' + meta.label + "</h3>" +
        '<span class="group-count">' + list.length + (list.length === 1 ? " item" : " items") + "</span>";
      group.appendChild(head);

      list.forEach((it) => {
        total++;
        const isDone = checked.has(it.key);
        if (isDone) done++;

        const row = document.createElement("div");
        row.className = "item" + (isDone ? " done" : "");

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "item-check";
        cb.checked = isDone;
        cb.setAttribute("aria-label", "Got " + it.name);
        cb.addEventListener("change", () => {
          if (cb.checked) checked.add(it.key);
          else checked.delete(it.key);
          render();
        });

        const body = document.createElement("div");
        const qty = overrides[it.key] != null ? overrides[it.key] : qtyString(it.units);
        const fromTxt =
          it.from.size > 1 ? " · from " + it.from.size + " recipes" : "";
        body.innerHTML =
          '<div class="item-name"></div>' +
          '<div class="item-from"></div>';
        body.querySelector(".item-name").textContent = it.name;
        body.querySelector(".item-from").textContent =
          (qty ? "" : "") + fromTxt.trim();

        const right = document.createElement("div");
        right.className = "item-actions";

        const qtyEl = document.createElement("span");
        qtyEl.className = "item-qty";
        qtyEl.textContent = qty;

        const editBtn = document.createElement("button");
        editBtn.className = "icon-btn";
        editBtn.type = "button";
        editBtn.title = "Edit quantity";
        editBtn.setAttribute("aria-label", "Edit quantity for " + it.name);
        editBtn.textContent = "✎";
        editBtn.addEventListener("click", () => startEdit(it, row, qtyEl));

        const rmBtn = document.createElement("button");
        rmBtn.className = "icon-btn";
        rmBtn.type = "button";
        rmBtn.title = "Remove";
        rmBtn.setAttribute("aria-label", "Remove " + it.name);
        rmBtn.textContent = "✕";
        rmBtn.addEventListener("click", () => {
          removed.add(it.key);
          checked.delete(it.key);
          toast(it.name + " removed");
          render();
        });

        right.appendChild(qtyEl);
        right.appendChild(editBtn);
        right.appendChild(rmBtn);

        row.appendChild(cb);
        row.appendChild(body);
        row.appendChild(right);
        group.appendChild(row);
      });

      groupsEl.appendChild(group);
    });

    // summary
    const aisles = cats.length;
    if (total === 0) {
      summaryEl.textContent =
        selected.size === 0
          ? "No recipes selected yet."
          : "Everything removed — add a recipe or reset.";
    } else {
      summaryEl.textContent =
        total + (total === 1 ? " item" : " items") + " · " +
        aisles + (aisles === 1 ? " aisle" : " aisles") + " · " +
        selected.size + (selected.size === 1 ? " recipe" : " recipes");
    }

    // progress
    if (total > 0) {
      progressWrap.hidden = false;
      const pct = Math.round((done / total) * 100);
      progressFill.style.width = pct + "%";
      progressLabel.textContent = done + " of " + total + " gathered (" + pct + "%)";
    } else {
      progressWrap.hidden = true;
    }
  }

  function startEdit(it, row, qtyEl) {
    const input = document.createElement("input");
    input.className = "item-edit";
    input.value = qtyEl.textContent;
    input.setAttribute("aria-label", "Quantity for " + it.name);
    qtyEl.replaceWith(input);
    input.focus();
    input.select();
    const commit = () => {
      const v = input.value.trim();
      if (v) overrides[it.key] = v;
      render();
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      if (e.key === "Escape") { render(); }
    });
    input.addEventListener("blur", commit);
  }

  /* ---------- Recipe chips ---------- */
  function renderChips() {
    chipsEl.innerHTML = "";
    RECIPES.forEach((r) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.style.setProperty("--accent", r.accent);
      btn.setAttribute("aria-pressed", selected.has(r.id) ? "true" : "false");
      btn.innerHTML =
        '<span class="chip-thumb" aria-hidden="true">' + r.emoji + "</span>" +
        '<span class="chip-body">' +
        '<span class="chip-title"></span>' +
        '<span class="chip-meta"></span>' +
        "</span>" +
        '<span class="chip-tick" aria-hidden="true">✓</span>';
      btn.querySelector(".chip-title").textContent = r.title;
      btn.querySelector(".chip-meta").textContent = r.meta;
      btn.addEventListener("click", () => {
        if (selected.has(r.id)) {
          selected.delete(r.id);
        } else {
          selected.add(r.id);
          // re-include any items previously removed if recipe re-added? keep removed sticky.
        }
        btn.setAttribute("aria-pressed", selected.has(r.id) ? "true" : "false");
        render();
        updatePickerSub();
      });
      chipsEl.appendChild(btn);
    });
  }

  function updatePickerSub() {
    pickerSub.textContent =
      selected.size === 0
        ? "Tap to add or remove a dish."
        : selected.size + (selected.size === 1 ? " dish" : " dishes") + " selected.";
  }

  /* ---------- Export text ---------- */
  function buildText() {
    const map = aggregate();
    const items = Array.from(map.values());
    if (items.length === 0) return "Shopping list is empty.";
    const byCat = {};
    items.forEach((it) => (byCat[it.cat] = byCat[it.cat] || []).push(it));
    const cats = Object.keys(byCat).sort(
      (a, b) => CATEGORY_META[a].order - CATEGORY_META[b].order
    );
    let out = "SHOPPING LIST\n";
    out += items.length + " items · " + cats.length + " aisles\n";
    cats.forEach((cat) => {
      out += "\n" + CATEGORY_META[cat].label.toUpperCase() + "\n";
      byCat[cat]
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((it) => {
          const mark = checked.has(it.key) ? "[x]" : "[ ]";
          const qty = overrides[it.key] != null ? overrides[it.key] : qtyString(it.units);
          out += mark + " " + it.name + (qty ? " — " + qty : "") + "\n";
        });
    });
    return out;
  }

  /* ---------- Actions ---------- */
  document.getElementById("copy-btn").addEventListener("click", async () => {
    const text = buildText();
    try {
      await navigator.clipboard.writeText(text);
      toast("List copied to clipboard");
    } catch (e) {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast("List copied"); }
      catch (_) { toast("Copy not supported"); }
      ta.remove();
    }
  });

  document.getElementById("print-btn").addEventListener("click", () => {
    if (selected.size === 0) { toast("Select a recipe first"); return; }
    window.print();
  });

  document.getElementById("share-btn").addEventListener("click", async () => {
    const text = buildText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Shopping list", text });
        return;
      } catch (e) { /* cancelled */ return; }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast("Share unavailable — copied instead");
    } catch (_) {
      toast("Sharing not supported here");
    }
  });

  /* ---------- Init ---------- */
  renderChips();
  updatePickerSub();
  // preselect a couple so the demo isn't empty on load
  selected.add("orzo");
  selected.add("tacos");
  renderChips();
  updatePickerSub();
  render();
})();
