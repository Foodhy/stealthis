(() => {
  "use strict";

  /* ----------------------------------------------------------------
   * Fictional catalog. Each product carries the attributes the rail
   * facets against. Prices in whole dollars; rating 1 decimal.
   * ---------------------------------------------------------------- */
  const COLORS = {
    black:  { name: "Black",  hex: "#1c1f26" },
    white:  { name: "White",  hex: "#f3f4f6", light: true },
    blue:   { name: "Blue",   hex: "#3457ff" },
    red:    { name: "Red",    hex: "#e0245e" },
    green:  { name: "Green",  hex: "#1f9d55" },
    grey:   { name: "Grey",   hex: "#9aa1ad" },
    orange: { name: "Orange", hex: "#f5811e" },
    purple: { name: "Purple", hex: "#7c4dff" }
  };

  const CATEGORIES = ["Road", "Trail", "Track", "Walking", "Recovery"];
  const BRANDS = ["Strideworks", "Apex Run", "Tempo", "Northpeak", "Velo Athletics",
                  "Cadence", "Trailhead Co.", "Pace Lab", "Halcyon", "Meridian"];
  const SIZES = [6, 7, 8, 9, 10, 11, 12, 13];

  const NAMES = ["Velocity", "Glide", "Terra", "Summit", "Pulse", "Drift", "Cloudstep",
    "Trailblaze", "Momentum", "Cinder", "Horizon", "Quartz", "Vector", "Aero", "Granite",
    "Stratus", "Ridgeline", "Kestrel", "Nimbus", "Ember", "Solstice", "Comet", "Pioneer",
    "Tundra", "Zephyr", "Boulder", "Marathon", "Sprint"];

  function seeded(i) {
    // tiny deterministic generator so the demo is stable across reloads
    const x = Math.sin(i * 99.71) * 43758.5453;
    return x - Math.floor(x);
  }

  const PRODUCTS = NAMES.map((nm, i) => {
    const r = (n) => seeded(i + n);
    const colorKeys = Object.keys(COLORS);
    const cols = [];
    const cCount = 2 + Math.floor(r(1) * 3);
    while (cols.length < cCount) {
      const c = colorKeys[Math.floor(r(cols.length + 2) * colorKeys.length)];
      if (!cols.includes(c)) cols.push(c);
    }
    const sizes = SIZES.filter((_, si) => r(si + 20) > 0.22);
    const base = 70 + Math.round(r(7) * 46) * 5; // 70..300, step 5
    const onSale = r(8) > 0.66;
    const price = onSale ? Math.round(base * (0.78 - r(9) * 0.12)) : base;
    const inStock = r(10) > 0.12;
    return {
      id: i + 1,
      name: nm,
      brand: BRANDS[Math.floor(r(11) * BRANDS.length)],
      category: CATEGORIES[Math.floor(r(12) * CATEGORIES.length)],
      colors: cols,
      sizes: sizes.length ? sizes : [9, 10],
      price,
      was: onSale ? base : null,
      rating: Math.round((3.4 + r(13) * 1.6) * 10) / 10,
      reviews: 8 + Math.floor(r(14) * 920),
      isNew: !onSale && r(15) > 0.78,
      inStock
    };
  });

  const PRICE_MAX = 300;

  /* ---------------- State ---------------- */
  const state = {
    categories: new Set(),
    brands: new Set(),
    colors: new Set(),
    sizes: new Set(),
    rating: 0,
    inStock: false,
    priceMin: 0,
    priceMax: PRICE_MAX,
    sort: "featured"
  };

  /* ---------------- DOM ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const grid = $("#grid");
  const empty = $("#empty");
  const resultCount = $("#resultCount");
  const applyCount = $("#applyCount");
  const appliedBadge = $("#appliedBadge");
  const toggleCount = $("#toggleCount");
  const clearAllBtn = $("#clearAll");
  const chipRow = $("#chipRow");
  const activeFilters = $("#activeFilters");

  /* ---------------- Helpers ---------------- */
  const money = (n) => "$" + n.toLocaleString("en-US");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1900);
  }

  function stars(rating) {
    const full = Math.round(rating);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }

  function svgStars(min) {
    let out = "";
    for (let i = 1; i <= 5; i++) {
      out += `<span class="${i <= min ? "" : "s-off"}">★</span>`;
    }
    return out;
  }

  /* ---------------- Counts (computed against current filters,
   *  excluding the facet being counted, so each option shows how many
   *  products it WOULD add). For simplicity we count against base set
   *  + the other active facets. ---------------- */
  function matches(p, skip) {
    if (skip !== "category" && state.categories.size && !state.categories.has(p.category)) return false;
    if (skip !== "brand" && state.brands.size && !state.brands.has(p.brand)) return false;
    if (skip !== "color" && state.colors.size && !p.colors.some((c) => state.colors.has(c))) return false;
    if (skip !== "size" && state.sizes.size && !p.sizes.some((s) => state.sizes.has(s))) return false;
    if (skip !== "rating" && state.rating && p.rating < state.rating) return false;
    if (skip !== "stock" && state.inStock && !p.inStock) return false;
    if (skip !== "price" && (p.price < state.priceMin || p.price > state.priceMax)) return false;
    return true;
  }

  const filtered = () => PRODUCTS.filter((p) => matches(p, null));

  function countFor(facet, predicate) {
    return PRODUCTS.filter((p) => matches(p, facet) && predicate(p)).length;
  }

  /* ---------------- Build facet controls ---------------- */
  function buildCategories() {
    $("#catList").innerHTML = CATEGORIES.map((c) => `
      <li>
        <label class="check">
          <input type="checkbox" data-facet="category" value="${esc(c)}" />
          <span class="check__box" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M5 12l5 5L20 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="check__name">${esc(c)}</span>
          <span class="check__count" data-count="category:${esc(c)}">0</span>
        </label>
      </li>`).join("");
  }

  function buildBrands(filter = "") {
    const f = filter.trim().toLowerCase();
    const list = BRANDS.filter((b) => b.toLowerCase().includes(f));
    $("#brandEmpty").hidden = list.length > 0;
    $("#brandList").innerHTML = list.map((b) => {
      const label = f
        ? esc(b).replace(new RegExp(`(${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"),
            "<mark class=\"hl\">$1</mark>")
        : esc(b);
      return `
      <li>
        <label class="check">
          <input type="checkbox" data-facet="brand" value="${esc(b)}" ${state.brands.has(b) ? "checked" : ""} />
          <span class="check__box" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M5 12l5 5L20 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="check__name">${label}</span>
          <span class="check__count" data-count="brand:${esc(b)}">0</span>
        </label>
      </li>`;
    }).join("");
  }

  function buildColors() {
    $("#colorList").innerHTML = Object.entries(COLORS).map(([key, c]) => `
      <li class="swatch">
        <button class="swatch__btn${c.light ? " swatch__btn--light" : ""}" type="button"
          data-facet="color" value="${key}" aria-pressed="false"
          aria-label="${esc(c.name)}" style="background:${c.hex}"></button>
        <span class="swatch__name">${esc(c.name)}</span>
      </li>`).join("");
  }

  function buildSizes() {
    $("#sizeList").innerHTML = SIZES.map((s) => `
      <li>
        <button class="sizechip" type="button" data-facet="size" value="${s}"
          aria-pressed="false" aria-label="US ${s}">${s}</button>
      </li>`).join("");
  }

  function buildRatings() {
    $("#ratingList").innerHTML = [4, 3, 2].map((r) => `
      <li>
        <button class="rating-opt" type="button" role="radio" aria-checked="false"
          data-facet="rating" value="${r}">
          <span class="rating-opt__stars" aria-hidden="true">${svgStars(r)}</span>
          <span class="rating-opt__label">${r} &amp; up</span>
        </button>
      </li>`).join("");
  }

  /* ---------------- Sync counts + disabled states on controls ---------------- */
  function refreshCounts() {
    // category counts
    CATEGORIES.forEach((c) => {
      const el = $(`[data-count="category:${CSS.escape(c)}"]`);
      if (el) el.textContent = countFor("category", (p) => p.category === c);
    });
    // brand counts
    BRANDS.forEach((b) => {
      const el = $(`[data-count="brand:${CSS.escape(b)}"]`);
      if (el) el.textContent = countFor("brand", (p) => p.brand === b);
    });
    // size availability — disable sizes that yield 0 results
    document.querySelectorAll('[data-facet="size"]').forEach((btn) => {
      const s = Number(btn.value);
      const n = countFor("size", (p) => p.sizes.includes(s));
      const active = state.sizes.has(s);
      btn.disabled = n === 0 && !active;
      btn.title = active ? "" : `${n} result${n === 1 ? "" : "s"}`;
    });
  }

  /* ---------------- Active filter chips ---------------- */
  function renderChips() {
    const chips = [];
    state.categories.forEach((v) => chips.push({ facet: "category", val: v, label: v }));
    state.colors.forEach((v) => chips.push({
      facet: "color", val: v, label: COLORS[v].name, swatch: COLORS[v].hex
    }));
    state.sizes.forEach((v) => chips.push({ facet: "size", val: String(v), label: "US " + v }));
    state.brands.forEach((v) => chips.push({ facet: "brand", val: v, label: v }));
    if (state.rating) chips.push({ facet: "rating", val: String(state.rating), label: state.rating + "★ & up" });
    if (state.inStock) chips.push({ facet: "stock", val: "1", label: "In stock" });
    if (state.priceMin > 0 || state.priceMax < PRICE_MAX) {
      chips.push({ facet: "price", val: "1", label: `${money(state.priceMin)} – ${money(state.priceMax)}` });
    }

    const count = chips.length;
    activeFilters.hidden = count === 0;
    chipRow.innerHTML = chips.map((c) => `
      <li>
        <span class="chip">
          ${c.swatch ? `<span class="chip__swatch" style="background:${c.swatch}"></span>` : ""}
          ${esc(c.label)}
          <button class="chip__x" type="button" data-remove="${c.facet}" data-val="${esc(c.val)}"
            aria-label="Remove ${esc(c.label)} filter">×</button>
        </span>
      </li>`).join("");

    // applied count surfaces
    appliedBadge.hidden = count === 0;
    appliedBadge.textContent = count + " applied";
    toggleCount.hidden = count === 0;
    toggleCount.textContent = count;
    clearAllBtn.disabled = count === 0;
    return count;
  }

  function removeChip(facet, val) {
    switch (facet) {
      case "category": state.categories.delete(val); syncCheckbox("category", val, false); break;
      case "brand": state.brands.delete(val); syncCheckbox("brand", val, false); break;
      case "color": state.colors.delete(val); syncPressed("color", val, false); break;
      case "size": state.sizes.delete(Number(val)); syncPressed("size", val, false); break;
      case "rating": state.rating = 0; syncRating(0); break;
      case "stock": state.inStock = false; $("#inStock").checked = false; break;
      case "price":
        state.priceMin = 0; state.priceMax = PRICE_MAX;
        $("#priceMin").value = 0; $("#priceMax").value = PRICE_MAX; updatePriceUI();
        break;
    }
    render();
  }

  function syncCheckbox(facet, val, on) {
    const el = document.querySelector(`input[data-facet="${facet}"][value="${CSS.escape(val)}"]`);
    if (el) el.checked = on;
  }
  function syncPressed(facet, val, on) {
    const el = document.querySelector(`button[data-facet="${facet}"][value="${CSS.escape(val)}"]`);
    if (el) el.setAttribute("aria-pressed", on ? "true" : "false");
  }
  function syncRating(val) {
    document.querySelectorAll('[data-facet="rating"]').forEach((b) =>
      b.setAttribute("aria-checked", Number(b.value) === val ? "true" : "false"));
  }

  /* ---------------- Price dual range ---------------- */
  const minIn = $("#priceMin");
  const maxIn = $("#priceMax");
  function updatePriceUI() {
    let lo = Number(minIn.value);
    let hi = Number(maxIn.value);
    if (lo > hi - 5) { // keep a 5-unit gap; nudge the one being dragged
      if (document.activeElement === minIn) { lo = hi - 5; minIn.value = lo; }
      else { hi = lo + 5; maxIn.value = hi; }
    }
    state.priceMin = lo;
    state.priceMax = hi;
    $("#priceMinOut").textContent = money(lo);
    $("#priceMaxOut").textContent = money(hi);
    const pctLo = (lo / PRICE_MAX) * 100;
    const pctHi = (hi / PRICE_MAX) * 100;
    const fill = $("#rangeFill");
    fill.style.left = pctLo + "%";
    fill.style.right = (100 - pctHi) + "%";
  }

  /* ---------------- Render results ---------------- */
  function shoeSVG(p) {
    const c1 = COLORS[p.colors[0]].hex;
    const c2 = COLORS[p.colors[1] || p.colors[0]].hex;
    const id = "g" + p.id;
    return `
      <div class="card__media" style="background:linear-gradient(135deg,${c1}1a,${c2}33)">
        <svg class="card__shoe" viewBox="0 0 120 90" role="img" aria-label="${esc(p.name)} shoe">
          <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
          </linearGradient></defs>
          <path d="M10 58 C16 40 30 36 44 40 C54 43 60 50 74 50 C90 50 102 54 110 62 L110 68 C110 72 107 74 102 74 L18 74 C12 74 8 70 8 64 Z"
            fill="url(#${id})"/>
          <path d="M8 64 L112 64 L112 70 C112 73 110 74 106 74 L16 74 C11 74 8 70 8 64 Z" fill="rgba(0,0,0,.18)"/>
          <path d="M44 41 C50 36 58 35 66 38" stroke="rgba(255,255,255,.7)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <circle cx="52" cy="44" r="2" fill="rgba(255,255,255,.85)"/>
          <circle cx="60" cy="46" r="2" fill="rgba(255,255,255,.85)"/>
        </svg>
        ${p.was ? '<span class="card__badge card__badge--sale">Sale</span>' :
          p.isNew ? '<span class="card__badge card__badge--new">New</span>' : ""}
        ${!p.inStock ? '<div class="card__oos">Sold out</div>' : ""}
      </div>`;
  }

  function cardHTML(p) {
    const off = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
    return `
      <li class="card">
        ${shoeSVG(p)}
        <div class="card__body">
          <span class="card__brand">${esc(p.brand)}</span>
          <h3 class="card__name">${esc(p.name)} ${esc(p.category)}</h3>
          <div class="card__rate">
            <span class="card__stars" aria-hidden="true">${stars(p.rating)}</span>
            <span>${p.rating.toFixed(1)} · ${p.reviews.toLocaleString("en-US")}</span>
          </div>
          <div class="card__price">
            <span class="card__now${p.was ? " card__sale" : ""}">${money(p.price)}</span>
            ${p.was ? `<span class="card__was">${money(p.was)}</span><span class="card__sale">−${off}%</span>` : ""}
          </div>
        </div>
      </li>`;
  }

  function sortList(list) {
    const arr = list.slice();
    switch (state.sort) {
      case "price-asc": arr.sort((a, b) => a.price - b.price); break;
      case "price-desc": arr.sort((a, b) => b.price - a.price); break;
      case "rating": arr.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews); break;
      default: arr.sort((a, b) => (b.isNew - a.isNew) || (b.rating - a.rating)); break;
    }
    return arr;
  }

  function render() {
    const list = sortList(filtered());
    resultCount.textContent = list.length;
    applyCount.textContent = list.length;
    empty.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
    grid.innerHTML = list.map(cardHTML).join("");
    renderChips();
    refreshCounts();
  }

  /* ---------------- Event wiring ---------------- */
  function onCheckbox(e) {
    const el = e.target.closest('input[type="checkbox"][data-facet]');
    if (!el) return;
    const facet = el.dataset.facet;
    const setName = facet === "category" ? "categories" : "brands";
    if (el.checked) state[setName].add(el.value);
    else state[setName].delete(el.value);
    render();
  }

  document.querySelector("[data-rail-form]").addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"][data-facet]')) onCheckbox(e);
    if (e.target.id === "inStock") { state.inStock = e.target.checked; render(); }
  });

  // color + size + rating (button toggles via click delegation)
  document.querySelector("[data-rail-form]").addEventListener("click", (e) => {
    const color = e.target.closest('[data-facet="color"]');
    if (color) {
      const on = color.getAttribute("aria-pressed") !== "true";
      color.setAttribute("aria-pressed", on ? "true" : "false");
      on ? state.colors.add(color.value) : state.colors.delete(color.value);
      render(); return;
    }
    const size = e.target.closest('[data-facet="size"]');
    if (size && !size.disabled) {
      const on = size.getAttribute("aria-pressed") !== "true";
      size.setAttribute("aria-pressed", on ? "true" : "false");
      const v = Number(size.value);
      on ? state.sizes.add(v) : state.sizes.delete(v);
      render(); return;
    }
    const rate = e.target.closest('[data-facet="rating"]');
    if (rate) {
      const v = Number(rate.value);
      state.rating = state.rating === v ? 0 : v; // toggle off if same
      syncRating(state.rating);
      render(); return;
    }
  });

  // price slider
  [minIn, maxIn].forEach((el) =>
    el.addEventListener("input", () => { updatePriceUI(); render(); }));

  // brand search
  let brandTimer;
  $("#brandSearch").addEventListener("input", (e) => {
    clearTimeout(brandTimer);
    const v = e.target.value;
    brandTimer = setTimeout(() => { buildBrands(v); refreshCounts(); }, 90);
  });

  // chip removal
  chipRow.addEventListener("click", (e) => {
    const x = e.target.closest("[data-remove]");
    if (x) removeChip(x.dataset.remove, x.dataset.val);
  });

  // collapse / expand groups
  document.querySelectorAll(".facet__head").forEach((head) => {
    head.addEventListener("click", () => {
      const open = head.getAttribute("aria-expanded") === "true";
      head.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });

  // clear all
  function clearAll() {
    state.categories.clear();
    state.brands.clear();
    state.colors.clear();
    state.sizes.clear();
    state.rating = 0;
    state.inStock = false;
    state.priceMin = 0;
    state.priceMax = PRICE_MAX;
    minIn.value = 0; maxIn.value = PRICE_MAX; updatePriceUI();
    $("#inStock").checked = false;
    document.querySelectorAll('input[data-facet]').forEach((i) => (i.checked = false));
    document.querySelectorAll('[data-facet="color"],[data-facet="size"]')
      .forEach((b) => b.setAttribute("aria-pressed", "false"));
    syncRating(0);
    buildBrands($("#brandSearch").value);
    render();
    toast("Filters cleared");
  }
  clearAllBtn.addEventListener("click", clearAll);
  $("#emptyClear").addEventListener("click", clearAll);

  // sort
  $("#sortBy").addEventListener("change", (e) => { state.sort = e.target.value; render(); });

  /* ---------------- Mobile drawer ---------------- */
  const rail = $("#rail");
  const drawerToggle = $("#drawerToggle");
  function openDrawer() {
    rail.classList.add("open");
    drawerToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    const first = rail.querySelector(".rail__close");
    if (first) first.focus();
  }
  function closeDrawer() {
    rail.classList.remove("open");
    drawerToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    drawerToggle.focus();
  }
  drawerToggle.addEventListener("click", openDrawer);
  $("#railClose").addEventListener("click", closeDrawer);
  $("#railOverlay").addEventListener("click", closeDrawer);
  $("#applyBtn").addEventListener("click", () => {
    closeDrawer();
    toast(`${filtered().length} results shown`);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && rail.classList.contains("open")) closeDrawer();
  });

  /* ---------------- Init ---------------- */
  buildCategories();
  buildBrands();
  buildColors();
  buildSizes();
  buildRatings();
  updatePriceUI();
  render();
})();
