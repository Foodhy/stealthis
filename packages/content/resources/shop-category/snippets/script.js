/* Lumen — Category / PLP. Vanilla JS faceted filtering engine. */
(function () {
  "use strict";

  /* ---------- Data ---------- */
  const COLORS = {
    midnight: "#1d2433",
    sand: "#d8c4a6",
    rose: "#e09aad",
    sky: "#7fb3e8",
    sage: "#9bb89a",
    coral: "#ef7d5a",
  };

  const PRODUCTS = [
    { id: "p1",  name: "Aurora Over-Ear", brand: "Lumen", cat: "Headphones", price: 249, was: 299, rating: 4.8, reviews: 1284, colors: ["midnight", "sand"], fit: "Over-ear", stock: 14, new: false, sale: true,  day: 28 },
    { id: "p2",  name: "Pulse Mini Buds", brand: "Sonara", cat: "Earbuds", price: 89,  was: null, rating: 4.5, reviews: 642,  colors: ["rose", "sky"], fit: "In-ear", stock: 40, new: true,  sale: false, day: 41 },
    { id: "p3",  name: "Echo Stage 360", brand: "Voltic", cat: "Speakers", price: 199, was: null, rating: 4.7, reviews: 503,  colors: ["midnight", "sage"], fit: "Portable", stock: 7,  new: false, sale: false, day: 18 },
    { id: "p4",  name: "Drift Wireless", brand: "Lumen", cat: "Headphones", price: 159, was: 189, rating: 4.3, reviews: 388,  colors: ["sky", "sand", "coral"], fit: "On-ear", stock: 22, new: false, sale: true,  day: 12 },
    { id: "p5",  name: "Tide Pro ANC", brand: "Sonara", cat: "Earbuds", price: 179, was: null, rating: 4.9, reviews: 2140, colors: ["midnight", "rose"], fit: "In-ear", stock: 0,  new: false, sale: false, day: 35 },
    { id: "p6",  name: "Halo Desk Speaker", brand: "Voltic", cat: "Speakers", price: 119, was: 139, rating: 4.2, reviews: 219,  colors: ["sand", "sage"], fit: "Desktop", stock: 31, new: false, sale: true,  day: 9 },
    { id: "p7",  name: "Nova Studio XL", brand: "Lumen", cat: "Headphones", price: 379, was: null, rating: 4.9, reviews: 876,  colors: ["midnight"], fit: "Over-ear", stock: 5,  new: true,  sale: false, day: 44 },
    { id: "p8",  name: "Spark Sport Buds", brand: "Kinetic", cat: "Earbuds", price: 69,  was: 99,  rating: 4.1, reviews: 311,  colors: ["coral", "sky"], fit: "In-ear", stock: 60, new: false, sale: true,  day: 5 },
    { id: "p9",  name: "Bloom Bookshelf", brand: "Voltic", cat: "Speakers", price: 289, was: null, rating: 4.6, reviews: 158,  colors: ["sand", "midnight"], fit: "Bookshelf", stock: 11, new: false, sale: false, day: 22 },
    { id: "p10", name: "Vibe On-Ear", brand: "Kinetic", cat: "Headphones", price: 99,  was: null, rating: 3.9, reviews: 174,  colors: ["rose", "sage", "sky"], fit: "On-ear", stock: 26, new: false, sale: false, day: 14 },
    { id: "p11", name: "Mist Open Buds", brand: "Sonara", cat: "Earbuds", price: 129, was: 149, rating: 4.4, reviews: 421,  colors: ["sage", "sand"], fit: "Open-ear", stock: 18, new: true,  sale: true,  day: 39 },
    { id: "p12", name: "Quasar Floor 500", brand: "Voltic", cat: "Speakers", price: 549, was: null, rating: 4.8, reviews: 92,   colors: ["midnight"], fit: "Floor", stock: 3,  new: false, sale: false, day: 30 },
    { id: "p13", name: "Pebble Clip Buds", brand: "Kinetic", cat: "Earbuds", price: 49,  was: 59,  rating: 3.8, reviews: 540,  colors: ["coral", "rose", "sky"], fit: "Clip-on", stock: 80, new: false, sale: true,  day: 3 },
    { id: "p14", name: "Lyric Travel Pair", brand: "Lumen", cat: "Headphones", price: 219, was: null, rating: 4.6, reviews: 667,  colors: ["sand", "midnight"], fit: "Over-ear", stock: 9,  new: true,  sale: false, day: 42 },
    { id: "p15", name: "Ripple Room Fill", brand: "Voltic", cat: "Speakers", price: 169, was: 199, rating: 4.5, reviews: 287,  colors: ["sage", "sky"], fit: "Portable", stock: 0,  new: false, sale: true,  day: 16 },
  ];

  /* ---------- State ---------- */
  const state = {
    category: new Set(),
    color: new Set(),
    size: new Set(),
    rating: 0,
    priceMin: 0,
    priceMax: 600,
    inStock: false,
    sort: "featured",
    query: "",
    page: 1,
  };
  const PER_PAGE = 9;

  /* ---------- Helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const titleize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function starsHTML(r) {
    const full = Math.round(r);
    let out = "";
    for (let i = 1; i <= 5; i++) out += i <= full ? "★" : '<span class="off">★</span>';
    return out;
  }

  function productSVG(p) {
    const c = COLORS[p.colors[0]] || "#1d2433";
    const tints = { Headphones: "#eef1ff", Earbuds: "#fff0f4", Speakers: "#eefaf2" };
    const bg = tints[p.cat] || "#f1f3f8";
    let shape;
    if (p.cat === "Headphones") {
      shape = `<path d="M30 58a40 40 0 0 1 80 0" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
        <rect x="20" y="54" width="22" height="40" rx="11" fill="${c}"/>
        <rect x="98" y="54" width="22" height="40" rx="11" fill="${c}"/>`;
    } else if (p.cat === "Earbuds") {
      shape = `<circle cx="50" cy="48" r="17" fill="${c}"/><rect x="44" y="58" width="12" height="42" rx="6" fill="${c}"/>
        <circle cx="90" cy="48" r="17" fill="${c}" opacity=".82"/><rect x="84" y="58" width="12" height="42" rx="6" fill="${c}" opacity=".82"/>`;
    } else {
      shape = `<rect x="44" y="20" width="52" height="92" rx="14" fill="${c}"/>
        <circle cx="70" cy="50" r="13" fill="${bg}"/><circle cx="70" cy="84" r="9" fill="${bg}" opacity=".7"/>`;
    }
    return `<svg viewBox="0 0 140 128" role="img" aria-label="${p.name}" style="background:${bg}">${shape}</svg>`;
  }

  /* ---------- Build facet controls ---------- */
  function buildFacets() {
    const cats = [...new Set(PRODUCTS.map((p) => p.cat))];
    const catUl = $('[data-group="category"]');
    catUl.innerHTML = cats
      .map((c) => {
        const n = PRODUCTS.filter((p) => p.cat === c).length;
        return `<li><label class="opt"><input type="checkbox" value="${c}">
          <span class="opt__box"><svg viewBox="0 0 16 16" width="12" height="12"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span>${c}</span><span class="opt__count">${n}</span></label></li>`;
      })
      .join("");

    const sw = $('[data-group="color"]');
    sw.innerHTML = Object.entries(COLORS)
      .map(([k, v]) => `<button class="swatch" type="button" data-color="${k}" style="background:${v}" aria-pressed="false" aria-label="${titleize(k)}" title="${titleize(k)}"></button>`)
      .join("");

    const fits = [...new Set(PRODUCTS.map((p) => p.fit))];
    $('[data-group="size"]').innerHTML = fits
      .map((f) => `<button class="chip-btn" type="button" data-size="${f}" aria-pressed="false">${f}</button>`)
      .join("");

    $('[data-group="rating"]').innerHTML = [4, 3, 2]
      .map((r) => `<button class="rating-opt" type="button" data-rating="${r}" role="radio" aria-checked="false">
        <span class="stars">${starsHTML(r)}</span><span>&amp; up</span></button>`)
      .join("");
  }

  /* ---------- Filter + sort ---------- */
  function compute() {
    let list = PRODUCTS.filter((p) => {
      if (state.category.size && !state.category.has(p.cat)) return false;
      if (state.color.size && !p.colors.some((c) => state.color.has(c))) return false;
      if (state.size.size && !state.size.has(p.fit)) return false;
      if (state.rating && p.rating < state.rating) return false;
      if (p.price < state.priceMin || p.price > state.priceMax) return false;
      if (state.inStock && p.stock === 0) return false;
      if (state.query) {
        const hay = (p.name + " " + p.brand + " " + p.cat + " " + p.fit).toLowerCase();
        if (!hay.includes(state.query)) return false;
      }
      return true;
    });

    const sorters = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      newest: (a, b) => b.day - a.day,
      featured: (a, b) => Number(b.new) - Number(a.new) || b.reviews - a.reviews,
    };
    list.sort(sorters[state.sort] || sorters.featured);
    return list;
  }

  /* ---------- Render ---------- */
  function render() {
    const all = compute();
    const grid = $("#grid");
    const shown = all.slice(0, state.page * PER_PAGE);

    if (all.length === 0) {
      grid.innerHTML = "";
      $("#empty").hidden = false;
      $("#moreRow").hidden = true;
    } else {
      $("#empty").hidden = true;
      grid.innerHTML = shown.map(cardHTML).join("");
      $("#moreRow").hidden = shown.length >= all.length;
    }

    $("#count").innerHTML = `Showing <strong>${shown.length}</strong> of <strong>${all.length}</strong> products`;
    renderChips();
  }

  function cardHTML(p) {
    const out = p.stock === 0;
    const low = p.stock > 0 && p.stock <= 7;
    const badge = out
      ? '<span class="badge badge--out">Sold out</span>'
      : p.sale
      ? '<span class="badge badge--sale">Sale</span>'
      : p.new
      ? '<span class="badge badge--new">New</span>'
      : "";
    const swatches = p.colors.map((c) => `<span style="background:${COLORS[c]}"></span>`).join("");
    const priceBlock = p.was
      ? `<div class="price price--sale"><span class="price__now">${money(p.price)}</span><span class="price__was">${money(p.was)}</span></div>`
      : `<div class="price"><span class="price__now">${money(p.price)}</span></div>`;
    const foot = out
      ? `<span class="stock stock--low">Out of stock</span><button class="add" data-id="${p.id}" disabled>Sold out</button>`
      : `${priceBlock}<button class="add" data-id="${p.id}" data-name="${p.name}">Add</button>`;
    const stockLine = low ? `<span class="stock stock--low">Only ${p.stock} left</span>` : "";

    return `<article class="card">
      <div class="card__media">
        ${productSVG(p)}
        ${badge}
        <button class="wish" type="button" data-wish="${p.id}" aria-pressed="false" aria-label="Save ${p.name}">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none"><path d="M12 20s-7-4.4-9.2-8.4C1.3 8.7 2.6 5.4 5.8 5.4c2 0 3.2 1.3 4.2 2.6 1-1.3 2.2-2.6 4.2-2.6 3.2 0 4.5 3.3 3 6.2C19 15.6 12 20 12 20Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="card__body">
        <span class="card__brand">${p.brand}</span>
        <h3 class="card__name">${p.name}</h3>
        <div class="card__rate"><span class="stars">${starsHTML(p.rating)}</span> ${p.rating.toFixed(1)} <span>(${p.reviews.toLocaleString("en-US")})</span></div>
        <div class="card__swatches" aria-hidden="true">${swatches}</div>
        ${stockLine}
        <div class="card__foot">${foot}</div>
      </div>
    </article>`;
  }

  /* ---------- Active filter chips ---------- */
  function renderChips() {
    const wrap = $("#activeChips");
    const chips = [];
    state.category.forEach((c) => chips.push({ type: "category", val: c, label: c }));
    state.color.forEach((c) => chips.push({ type: "color", val: c, label: titleize(c) }));
    state.size.forEach((s) => chips.push({ type: "size", val: s, label: s }));
    if (state.rating) chips.push({ type: "rating", val: state.rating, label: state.rating + "★ & up" });
    if (state.priceMin > 0 || state.priceMax < 600)
      chips.push({ type: "price", val: "", label: `${money(state.priceMin).replace(".00", "")} – ${money(state.priceMax).replace(".00", "")}` });
    if (state.inStock) chips.push({ type: "inStock", val: "", label: "In stock" });

    if (!chips.length) { wrap.innerHTML = ""; return; }

    wrap.innerHTML =
      chips
        .map(
          (c) =>
            `<span class="fchip">${c.label}<button type="button" data-chip-type="${c.type}" data-chip-val="${c.val}" aria-label="Remove ${c.label} filter">×</button></span>`
        )
        .join("") + `<button class="fchip fchip--clear" type="button" id="chipClear">Clear all</button>`;
  }

  /* ---------- Mutations ---------- */
  function changed() {
    state.page = 1;
    render();
  }

  function removeChip(type, val) {
    if (type === "category") state.category.delete(val);
    else if (type === "color") {
      state.color.delete(val);
      const b = document.querySelector(`.swatch[data-color="${val}"]`);
      if (b) b.setAttribute("aria-pressed", "false");
    } else if (type === "size") {
      state.size.delete(val);
      const b = document.querySelector(`.chip-btn[data-size="${val}"]`);
      if (b) b.setAttribute("aria-pressed", "false");
    } else if (type === "rating") {
      state.rating = 0;
      document.querySelectorAll(".rating-opt").forEach((r) => r.setAttribute("aria-checked", "false"));
    } else if (type === "price") {
      state.priceMin = 0;
      state.priceMax = 600;
      syncPriceInputs();
    } else if (type === "inStock") {
      state.inStock = false;
      $("#inStock").checked = false;
    }
    // un-tick category checkbox
    if (type === "category") {
      const cb = document.querySelector(`[data-group="category"] input[value="${val}"]`);
      if (cb) cb.checked = false;
    }
    changed();
  }

  function clearAll() {
    state.category.clear();
    state.color.clear();
    state.size.clear();
    state.rating = 0;
    state.priceMin = 0;
    state.priceMax = 600;
    state.inStock = false;
    document.querySelectorAll('[data-group="category"] input').forEach((i) => (i.checked = false));
    document.querySelectorAll(".swatch").forEach((s) => s.setAttribute("aria-pressed", "false"));
    document.querySelectorAll(".chip-btn").forEach((c) => c.setAttribute("aria-pressed", "false"));
    document.querySelectorAll(".rating-opt").forEach((r) => r.setAttribute("aria-checked", "false"));
    $("#inStock").checked = false;
    syncPriceInputs();
    changed();
    toast("Filters cleared");
  }

  function syncPriceInputs() {
    $("#priceMin").value = state.priceMin;
    $("#priceMax").value = state.priceMax;
    $("#priceRange").value = state.priceMax;
    $("#priceLabel").textContent = `${money(state.priceMin).replace(".00", "")} – ${money(state.priceMax).replace(".00", "")}`;
  }

  /* ---------- Cart ---------- */
  let cartN = 0;
  function addToCart(btn) {
    cartN++;
    const cc = $("#cartCount");
    cc.textContent = cartN;
    cc.classList.remove("bump");
    void cc.offsetWidth;
    cc.classList.add("bump");
    btn.classList.add("added");
    const orig = btn.textContent;
    btn.textContent = "✓ Added";
    setTimeout(() => {
      btn.classList.remove("added");
      btn.textContent = orig;
    }, 1100);
    toast(`Added “${btn.dataset.name}” to cart`);
  }

  /* ---------- Wire events ---------- */
  function wire() {
    // category checkboxes
    $('[data-group="category"]').addEventListener("change", (e) => {
      const cb = e.target.closest("input");
      if (!cb) return;
      cb.checked ? state.category.add(cb.value) : state.category.delete(cb.value);
      changed();
    });

    // color swatches
    $('[data-group="color"]').addEventListener("click", (e) => {
      const b = e.target.closest(".swatch");
      if (!b) return;
      const on = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", String(!on));
      on ? state.color.delete(b.dataset.color) : state.color.add(b.dataset.color);
      changed();
    });

    // size chips
    $('[data-group="size"]').addEventListener("click", (e) => {
      const b = e.target.closest(".chip-btn");
      if (!b) return;
      const on = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", String(!on));
      on ? state.size.delete(b.dataset.size) : state.size.add(b.dataset.size);
      changed();
    });

    // rating radios (toggleable)
    $('[data-group="rating"]').addEventListener("click", (e) => {
      const b = e.target.closest(".rating-opt");
      if (!b) return;
      const val = Number(b.dataset.rating);
      const already = state.rating === val;
      document.querySelectorAll(".rating-opt").forEach((r) => r.setAttribute("aria-checked", "false"));
      if (already) {
        state.rating = 0;
      } else {
        state.rating = val;
        b.setAttribute("aria-checked", "true");
      }
      changed();
    });

    // price inputs
    function applyPrice() {
      let mn = parseInt($("#priceMin").value, 10) || 0;
      let mx = parseInt($("#priceMax").value, 10);
      if (isNaN(mx)) mx = 600;
      mn = Math.max(0, Math.min(mn, 600));
      mx = Math.max(0, Math.min(mx, 600));
      if (mn > mx) [mn, mx] = [mx, mn];
      state.priceMin = mn;
      state.priceMax = mx;
      syncPriceInputs();
      changed();
    }
    $("#priceMin").addEventListener("change", applyPrice);
    $("#priceMax").addEventListener("change", applyPrice);
    $("#priceRange").addEventListener("input", (e) => {
      state.priceMax = parseInt(e.target.value, 10);
      if (state.priceMin > state.priceMax) state.priceMin = state.priceMax;
      $("#priceMin").value = state.priceMin;
      $("#priceMax").value = state.priceMax;
      $("#priceLabel").textContent = `${money(state.priceMin).replace(".00", "")} – ${money(state.priceMax).replace(".00", "")}`;
      changed();
    });

    // in-stock toggle
    $("#inStock").addEventListener("change", (e) => {
      state.inStock = e.target.checked;
      changed();
    });

    // sort
    $("#sort").addEventListener("change", (e) => {
      state.sort = e.target.value;
      render();
    });

    // search
    let qTimer;
    $("#q").addEventListener("input", (e) => {
      clearTimeout(qTimer);
      qTimer = setTimeout(() => {
        state.query = e.target.value.trim().toLowerCase();
        changed();
      }, 160);
    });

    // clear all (rail button)
    $("#clearAll").addEventListener("click", clearAll);
    $("#emptyReset").addEventListener("click", clearAll);

    // active chips delegation
    $("#activeChips").addEventListener("click", (e) => {
      if (e.target.id === "chipClear") return clearAll();
      const btn = e.target.closest("button[data-chip-type]");
      if (btn) removeChip(btn.dataset.chipType, btn.dataset.chipVal);
    });

    // grid delegation: add to cart + wishlist
    $("#grid").addEventListener("click", (e) => {
      const add = e.target.closest(".add");
      if (add && !add.disabled) return addToCart(add);
      const wish = e.target.closest(".wish");
      if (wish) {
        const on = wish.getAttribute("aria-pressed") === "true";
        wish.setAttribute("aria-pressed", String(!on));
        toast(on ? "Removed from wishlist" : "Saved to wishlist ♥");
      }
    });

    // load more
    $("#loadMore").addEventListener("click", () => {
      state.page++;
      render();
    });

    // cart button
    $("#cartBtn").addEventListener("click", () => toast(`Cart · ${cartN} item${cartN === 1 ? "" : "s"}`));

    // mobile filter drawer
    const toggle = $("#filterToggle");
    const facets = $("#facets");
    toggle.addEventListener("click", () => {
      const open = facets.classList.toggle("open");
      document.body.classList.toggle("facets-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.body.addEventListener("click", (e) => {
      if (
        facets.classList.contains("open") &&
        !facets.contains(e.target) &&
        !toggle.contains(e.target) &&
        window.innerWidth <= 980
      ) {
        facets.classList.remove("open");
        document.body.classList.remove("facets-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && facets.classList.contains("open")) {
        facets.classList.remove("open");
        document.body.classList.remove("facets-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Init ---------- */
  buildFacets();
  syncPriceInputs();
  wire();
  render();
})();
