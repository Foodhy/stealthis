(function () {
  "use strict";

  /* ---------------- Data model (fictional) ---------------- */
  // Colors carry a display hex/gradient, a "tile" gradient for the media, and a base price.
  const COLORS = [
    { id: "black", name: "Black", fill: "#1d2026", tileA: "#1b1d24", tileB: "#3a3f4d", shoe: "#f4f5f7", base: 129, available: true },
    { id: "sand",  name: "Sand",  fill: "#d8c3a0", tileA: "#cdb892", tileB: "#e6d8bd", shoe: "#5b4d33", base: 129, available: true },
    { id: "moss",  name: "Moss",  fill: "#5a6b4a", tileA: "#41513a", tileB: "#6f8262", shoe: "#eef2e8", base: 134, available: true },
    { id: "coral", name: "Coral", fill: "#e8745c", tileA: "#d65b44", tileB: "#f2937c", shoe: "#fff3ef", base: 134, available: true },
    { id: "indigo", name: "Indigo", fill: "#3457ff", tileA: "#2a3fb8", tileB: "#5a73ff", shoe: "#eef1ff", base: 139, available: false }, // sold out color
  ];

  const MATERIALS = [
    { id: "knit", name: "Recycled knit", add: 0 },
    { id: "mesh", name: "Breathable mesh", add: 6 },
    { id: "suede", name: "Vegan suede", add: 14 },
  ];

  // Master size list (US). Per-variant availability is computed below.
  const SIZES = ["6", "7", "8", "9", "10", "11", "12"];

  const SIZE_GUIDE = [
    { us: "6", eu: "38", cm: "24.1" },
    { us: "7", eu: "39.5", cm: "25.0" },
    { us: "8", eu: "41", cm: "25.7" },
    { us: "9", eu: "42.5", cm: "26.5" },
    { us: "10", eu: "44", cm: "27.3" },
    { us: "11", eu: "45", cm: "28.1" },
    { us: "12", eu: "46.5", cm: "29.0" },
  ];

  // Inventory keyed by `${colorId}|${materialId}|${size}` -> stock count.
  // Build deterministic, realistic-looking stock with some out-of-stock combos.
  const INVENTORY = (function buildInventory() {
    const inv = {};
    let seed = 7;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    COLORS.forEach((c) => {
      MATERIALS.forEach((m) => {
        SIZES.forEach((s) => {
          let stock;
          if (!c.available) {
            stock = 0; // whole color sold out
          } else {
            const r = rnd();
            if (r < 0.16) stock = 0;        // out of stock
            else if (r < 0.32) stock = 1 + Math.floor(rnd() * 3); // low
            else stock = 5 + Math.floor(rnd() * 30);
          }
          inv[`${c.id}|${m.id}|${s}`] = stock;
        });
      });
    });
    // Guarantee a couple of clearly-shown disabled combos on the default view.
    inv["black|knit|6"] = 0;
    inv["black|knit|12"] = 0;
    return inv;
  })();

  /* ---------------- State ---------------- */
  const state = {
    color: "black",
    material: "knit",
    size: null,
    wished: false,
  };

  /* ---------------- DOM refs ---------------- */
  const $ = (id) => document.getElementById(id);
  const swatchesEl = $("swatches");
  const materialsEl = $("materials");
  const sizesEl = $("sizes");
  const colorValueEl = $("colorValue");
  const materialValueEl = $("materialValue");
  const summaryValueEl = $("summaryValue");
  const stockLineEl = $("stockLine");
  const stockTextEl = $("stockText");
  const sizeHintEl = $("sizeHint");
  const errorEl = $("errorMsg");
  const priceEl = $("price");
  const compareEl = $("compare");
  const saveChipEl = $("saveChip");
  const addBtn = $("addBtn");
  const addLabel = $("addLabel");
  const wishBtn = $("wishBtn");
  const mediaTile = $("mediaTile");
  const mediaBadge = $("mediaBadge");
  const shoeBody = document.querySelector(".shoe-body");
  const form = $("variantForm");

  const money = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

  const getColor = (id) => COLORS.find((c) => c.id === id);
  const getMaterial = (id) => MATERIALS.find((m) => m.id === id);
  const stockFor = (color, material, size) => INVENTORY[`${color}|${material}|${size}`] ?? 0;

  // Current unit price = color base + material add-on.
  function currentPrice() {
    const c = getColor(state.color);
    const m = getMaterial(state.material);
    return c.base + m.add;
  }
  // Compare-at is a fixed % above price (illustrative discount).
  function comparePrice(price) {
    return Math.round(price * 1.24);
  }

  /* ---------------- Renderers ---------------- */
  function renderSwatches() {
    swatchesEl.innerHTML = "";
    COLORS.forEach((c, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.setAttribute("role", "radio");
      btn.dataset.color = c.id;
      const checked = c.id === state.color;
      btn.setAttribute("aria-checked", String(checked));
      btn.setAttribute("aria-label", c.available ? c.name : `${c.name} (sold out)`);
      // Roving tabindex
      btn.tabIndex = checked ? 0 : -1;
      if (!c.available) btn.setAttribute("aria-disabled", "true");

      const fill = document.createElement("span");
      fill.className = "dot-fill";
      fill.style.background = c.fill;
      btn.appendChild(fill);

      btn.addEventListener("click", () => {
        if (!c.available) {
          toast(`${c.name} is sold out`, false);
          return;
        }
        selectColor(c.id);
      });
      swatchesEl.appendChild(btn);
    });
  }

  function renderMaterials() {
    materialsEl.innerHTML = "";
    MATERIALS.forEach((m) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute("role", "radio");
      btn.dataset.material = m.id;
      const checked = m.id === state.material;
      btn.setAttribute("aria-checked", String(checked));
      btn.tabIndex = checked ? 0 : -1;
      btn.textContent = m.add ? `${m.name} +${money(m.add).replace(".00", "")}` : m.name;
      btn.addEventListener("click", () => selectMaterial(m.id));
      materialsEl.appendChild(btn);
    });
  }

  function renderSizes() {
    sizesEl.innerHTML = "";
    let firstEnabled = null;
    SIZES.forEach((s) => {
      const stock = stockFor(state.color, state.material, s);
      const disabled = stock <= 0;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute("role", "radio");
      btn.dataset.size = s;
      btn.textContent = s;
      const checked = s === state.size;
      btn.setAttribute("aria-checked", String(checked));
      if (disabled) {
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("aria-label", `Size ${s} — unavailable in this combination`);
      } else if (firstEnabled === null) {
        firstEnabled = s;
      }
      btn.tabIndex = checked ? 0 : -1;
      btn.addEventListener("click", () => {
        if (disabled) {
          toast(`Size ${s} isn't available in ${getColor(state.color).name} · ${getMaterial(state.material).name}`, false);
          return;
        }
        selectSize(s);
      });
      sizesEl.appendChild(btn);
    });
    // Ensure at least one enabled size is tabbable when none selected.
    if (!state.size && firstEnabled) {
      const el = sizesEl.querySelector(`[data-size="${firstEnabled}"]`);
      if (el) el.tabIndex = 0;
    }
  }

  function updateMedia() {
    const c = getColor(state.color);
    mediaTile.style.background = `linear-gradient(150deg, ${c.tileA}, ${c.tileB})`;
    mediaTile.dataset.color = c.id;
    mediaBadge.textContent = c.name;
    if (shoeBody) shoeBody.style.fill = c.shoe;
  }

  function updatePriceAndSummary() {
    const price = currentPrice();
    const compare = comparePrice(price);
    priceEl.textContent = money(price);
    compareEl.textContent = money(compare);
    saveChipEl.textContent = `Save ${money(compare - price).replace(".00", "")}`;

    const c = getColor(state.color);
    const m = getMaterial(state.material);
    summaryValueEl.textContent = `${c.name} · ${m.name} · ${state.size ? `US ${state.size}` : "choose a size"}`;
    colorValueEl.textContent = c.name;
    materialValueEl.textContent = m.name;

    addLabel.textContent = `Add to cart · ${money(price)}`;
  }

  function updateStock() {
    // If a size is chosen, show that exact combo's stock; otherwise show whether
    // ANY size is available in the current color/material.
    if (state.size) {
      const stock = stockFor(state.color, state.material, state.size);
      if (stock <= 0) {
        setStock("out", "Out of stock for this size", true);
      } else if (stock <= 4) {
        setStock("low", `Only ${stock} left — order soon`, false);
      } else {
        setStock("in", "In stock — ready to ship", false);
      }
    } else {
      const anyAvailable = SIZES.some((s) => stockFor(state.color, state.material, s) > 0);
      if (anyAvailable) {
        setStock("pending", "Select a size to check availability", false);
      } else {
        setStock("out", "Sold out in this combination", true);
      }
    }
  }

  function setStock(stateName, text, disableAdd) {
    stockLineEl.dataset.state = stateName === "in" ? "" : stateName;
    stockTextEl.textContent = text;
    // Add button is disabled when the exact chosen combo is out of stock.
    addBtn.disabled = !!disableAdd;
  }

  /* ---------------- Selection handlers ---------------- */
  function selectColor(id) {
    state.color = id;
    // If current size is no longer available for new color/material, clear it.
    if (state.size && stockFor(state.color, state.material, state.size) <= 0) {
      state.size = null;
      flashSizeHint("Heads up: your size sold out in this color — pick another.");
    } else {
      clearSizeHint();
    }
    clearError();
    renderSwatches();
    renderSizes();
    updateMedia();
    updatePriceAndSummary();
    updateStock();
  }

  function selectMaterial(id) {
    state.material = id;
    if (state.size && stockFor(state.color, state.material, state.size) <= 0) {
      state.size = null;
      flashSizeHint("Heads up: your size sold out in this material — pick another.");
    } else {
      clearSizeHint();
    }
    clearError();
    renderMaterials();
    renderSizes();
    updatePriceAndSummary();
    updateStock();
  }

  function selectSize(s) {
    state.size = s;
    clearError();
    clearSizeHint();
    renderSizes();
    updatePriceAndSummary();
    updateStock();
  }

  function flashSizeHint(msg) {
    sizeHintEl.textContent = msg;
  }
  function clearSizeHint() {
    sizeHintEl.textContent = "";
  }

  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }

  /* ---------------- Keyboard roving for radiogroups ---------------- */
  function wireRoving(container, selector, onPick) {
    container.addEventListener("keydown", (e) => {
      const items = Array.from(container.querySelectorAll(selector));
      const enabled = items.filter((el) => el.getAttribute("aria-disabled") !== "true");
      if (!enabled.length) return;
      const current = document.activeElement;
      let idx = enabled.indexOf(current);
      if (idx === -1) idx = 0;
      let handled = true;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          idx = (idx + 1) % enabled.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          idx = (idx - 1 + enabled.length) % enabled.length;
          break;
        case "Home":
          idx = 0;
          break;
        case "End":
          idx = enabled.length - 1;
          break;
        case " ":
        case "Enter":
          current && current.click();
          handled = true;
          break;
        default:
          handled = false;
      }
      if (!handled) return;
      e.preventDefault();
      if (e.key === " " || e.key === "Enter") return;
      const next = enabled[idx];
      if (next) {
        next.tabIndex = 0;
        next.focus();
      }
    });
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(msg, success = true) {
    const region = $("toastRegion");
    const el = document.createElement("div");
    el.className = "toast";
    if (success) {
      const mark = document.createElement("span");
      mark.className = "toast-mark";
      mark.innerHTML =
        '<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      el.appendChild(mark);
    }
    const txt = document.createElement("span");
    txt.textContent = msg;
    el.appendChild(txt);
    region.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 260);
    }, 2600);
  }

  /* ---------------- Wishlist ---------------- */
  wishBtn.addEventListener("click", () => {
    state.wished = !state.wished;
    wishBtn.setAttribute("aria-pressed", String(state.wished));
    toast(state.wished ? "Saved to wishlist" : "Removed from wishlist", state.wished);
  });

  /* ---------------- Validation + add to cart ---------------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!state.size) {
      errorEl.hidden = false;
      errorEl.textContent = "Please choose a size before adding to cart.";
      // Move focus to first enabled size for quick correction.
      const firstSize = Array.from(sizesEl.querySelectorAll(".chip")).find(
        (el) => el.getAttribute("aria-disabled") !== "true"
      );
      if (firstSize) firstSize.focus();
      return;
    }
    const stock = stockFor(state.color, state.material, state.size);
    if (stock <= 0) {
      errorEl.hidden = false;
      errorEl.textContent = "That combination just sold out — pick a different size.";
      return;
    }
    clearError();
    const c = getColor(state.color);
    const m = getMaterial(state.material);
    toast(`Added · ${c.name} / ${m.name} / US ${state.size} — ${money(currentPrice())}`, true);
  });

  /* ---------------- Size guide dialog ---------------- */
  const dialog = $("sizeDialog");
  const backdrop = $("dialogBackdrop");
  const sizeGuideBtn = $("sizeGuideBtn");
  const dialogClose = $("dialogClose");
  let lastFocused = null;

  function buildSizeTable() {
    const body = $("sizeTableBody");
    body.innerHTML = "";
    SIZE_GUIDE.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${row.us}</td><td>${row.eu}</td><td>${row.cm}</td>`;
      body.appendChild(tr);
    });
  }

  function openDialog() {
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    dialogClose.focus();
  }
  function closeDialog() {
    backdrop.hidden = true;
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    if (lastFocused) lastFocused.focus();
  }

  sizeGuideBtn.addEventListener("click", openDialog);
  dialogClose.addEventListener("click", closeDialog);
  backdrop.addEventListener("click", closeDialog);
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeDialog();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && (dialog.open || dialog.hasAttribute("open"))) closeDialog();
  });

  /* ---------------- Init ---------------- */
  renderSwatches();
  renderMaterials();
  renderSizes();
  updateMedia();
  updatePriceAndSummary();
  updateStock();
  buildSizeTable();

  wireRoving(swatchesEl, ".swatch", selectColor);
  wireRoving(materialsEl, ".chip", selectMaterial);
  wireRoving(sizesEl, ".chip", selectSize);
})();
