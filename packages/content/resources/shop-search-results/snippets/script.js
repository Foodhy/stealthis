/* ===== Stitch & Stone — search results ===== */
(function () {
  "use strict";

  /* ---------- Inline SVG product silhouettes ---------- */
  var ICONS = {
    shoe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h18a2 2 0 0 0 2-2c0-2-2-2.5-4-3.5L13 8l-2 2-2-1-2 2H4a2 2 0 0 0-2 2z"/><path d="M2 14h20"/></svg>',
    jacket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3 4 5v6l2 1v9h12v-9l2-1V5l-5-2-3 3z"/><path d="M12 6v15"/></svg>',
    lamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l3 7H5z"/><path d="M12 10v8"/><path d="M8 21h8"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l1 12H5z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
    bottle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4v3l1 2v13a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V7l1-2z"/><path d="M9 11h6"/></svg>',
    watch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 9v3l2 1"/><path d="M9 7 8 3h8l-1 4M9 17l-1 4h8l-1-4"/></svg>',
    cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a8 8 0 0 1 16 0z"/><path d="M12 6a8 8 0 0 0-8 8h8z"/><path d="M4 14h18"/></svg>',
    chair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v8h12V3M6 11l-1 10M18 11l1 10M5 16h14"/></svg>'
  };
  var TILES = ["--tile-a", "--tile-b", "--tile-c", "--tile-d", "--tile-e", "--tile-f"];

  /* ---------- Catalog (fictional) ---------- */
  var PRODUCTS = [
    { id: 1, name: "Trailblazer Running Shoe", cat: "Footwear", icon: "shoe", tile: 0, price: 119, was: 149, rating: 4.7, reviews: 412, stock: "in", sale: true, kw: "run running shoe sneaker trail" },
    { id: 2, name: "Featherlite Race Trainers", cat: "Footwear", icon: "shoe", tile: 5, price: 138, was: 0, rating: 4.5, reviews: 207, stock: "low", sale: false, kw: "run running race trainer light" },
    { id: 3, name: "Summit Trail Sneaker", cat: "Footwear", icon: "shoe", tile: 2, price: 96, was: 0, rating: 4.2, reviews: 88, stock: "in", sale: false, kw: "run trail sneaker hiking shoe" },
    { id: 4, name: "City Runner Knit Low", cat: "Footwear", icon: "shoe", tile: 1, price: 74, was: 99, rating: 4.0, reviews: 154, stock: "in", sale: true, kw: "run runner knit shoe city" },
    { id: 5, name: "Stormshell Rain Jacket", cat: "Apparel", icon: "jacket", tile: 3, price: 159, was: 0, rating: 4.8, reviews: 321, stock: "in", sale: false, kw: "jacket rain run coat waterproof" },
    { id: 6, name: "Pace Wind Vest", cat: "Apparel", icon: "jacket", tile: 4, price: 64, was: 89, rating: 4.4, reviews: 73, stock: "low", sale: true, kw: "vest jacket run wind apparel" },
    { id: 7, name: "Daybreak Running Cap", cat: "Apparel", icon: "cap", tile: 2, price: 28, was: 0, rating: 4.6, reviews: 199, stock: "in", sale: false, kw: "cap hat run running apparel" },
    { id: 8, name: "Horizon Hydration Pack", cat: "Gear", icon: "bag", tile: 5, price: 89, was: 0, rating: 4.3, reviews: 61, stock: "out", sale: false, kw: "pack bag run hydration gear backpack" },
    { id: 9, name: "Pulse Sport Watch", cat: "Gear", icon: "watch", tile: 0, price: 199, was: 249, rating: 4.9, reviews: 540, stock: "in", sale: true, kw: "watch run running gear gps fitness" },
    { id: 10, name: "Trailflask Insulated Bottle", cat: "Gear", icon: "bottle", tile: 2, price: 32, was: 0, rating: 4.1, reviews: 142, stock: "in", sale: false, kw: "bottle run water gear flask hydration" },
    { id: 11, name: "Aurora Desk Lamp", cat: "Gear", icon: "lamp", tile: 3, price: 78, was: 0, rating: 4.5, reviews: 95, stock: "low", sale: false, kw: "lamp light desk home gear" },
    { id: 12, name: "Loft Lounge Chair", cat: "Gear", icon: "chair", tile: 4, price: 349, was: 449, rating: 4.7, reviews: 38, stock: "in", sale: true, kw: "chair furniture home lounge gear seat" }
  ];

  var RECENT = ["running shoes", "rain jacket", "sport watch"];
  var POPULAR = ["sneakers", "lamp", "hydration pack", "wind vest"];
  var DICT = ["running", "shoe", "sneaker", "jacket", "vest", "watch", "lamp", "bottle", "chair", "trail", "hydration", "cap"];

  var money = function (n) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var stars = function (r) {
    var full = Math.round(r);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  };

  /* ---------- DOM refs ---------- */
  var form = document.getElementById("searchForm");
  var input = document.getElementById("q");
  var combo = input.closest(".combo");
  var acList = document.getElementById("acList");
  var clearBtn = document.getElementById("clearBtn");
  var grid = document.getElementById("results");
  var emptyEl = document.getElementById("empty");
  var emptyTerm = document.getElementById("emptyTerm");
  var emptyTags = document.getElementById("emptyTags");
  var termOut = document.getElementById("termOut");
  var resultMeta = document.getElementById("resultMeta");
  var dymWrap = document.getElementById("didYouMean");
  var dymBtn = document.getElementById("dymBtn");
  var facetsEl = document.getElementById("facets");
  var sortSel = document.getElementById("sortSel");
  var cartCountEl = document.getElementById("cartCount");
  var toastEl = document.getElementById("toast");

  var state = { query: "run", category: "all", onSale: false, inStock: false, sort: "relevance" };
  var cart = 2;
  var acItems = [];
  var acIndex = -1;
  var toastTimer;

  /* ---------- Toast ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 220);
    }, 1900);
  }

  /* ---------- Matching / scoring ---------- */
  function matches(p, q) {
    if (!q) return true;
    var hay = (p.name + " " + p.cat + " " + p.kw).toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (t) { return hay.indexOf(t) !== -1; });
  }
  function score(p, q) {
    var hay = (p.name + " " + p.kw).toLowerCase();
    var s = 0;
    q.toLowerCase().split(/\s+/).forEach(function (t) {
      if (p.name.toLowerCase().indexOf(t) === 0) s += 5;
      else if (p.name.toLowerCase().indexOf(t) !== -1) s += 3;
      else if (hay.indexOf(t) !== -1) s += 1;
    });
    return s;
  }

  function getResults() {
    var q = state.query.trim();
    var list = PRODUCTS.filter(function (p) {
      if (!matches(p, q)) return false;
      if (state.category !== "all" && p.cat !== state.category) return false;
      if (state.onSale && !p.sale) return false;
      if (state.inStock && p.stock === "out") return false;
      return true;
    });
    if (state.sort === "low") list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === "high") list.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === "rating") list.sort(function (a, b) { return b.rating - a.rating; });
    else list.sort(function (a, b) { return score(b, q) - score(a, q); });
    return list;
  }

  /* ---------- Levenshtein for did-you-mean ---------- */
  function lev(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) d[i] = [i];
    for (j = 0; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    return d[m][n];
  }
  function suggestSpelling(q) {
    var w = q.trim().toLowerCase();
    if (!w || w.indexOf(" ") !== -1 || w.length < 3) return null;
    var best = null, bestD = 99;
    DICT.forEach(function (d) {
      var dist = lev(w, d);
      if (dist > 0 && dist < bestD && dist <= 2) { bestD = dist; best = d; }
    });
    return best;
  }

  /* ---------- Render grid ---------- */
  function tileVar(p) { return "var(" + TILES[p.tile] + ")"; }
  function stockChip(stock) {
    if (stock === "in") return '<span class="stock stock-in">In stock</span>';
    if (stock === "low") return '<span class="stock stock-low">Low stock</span>';
    return '<span class="stock stock-out">Sold out</span>';
  }

  function renderResults() {
    var list = getResults();
    var q = state.query.trim();
    termOut.textContent = "“" + (q || "everything") + "”";

    // did-you-mean
    var fix = null;
    if (q && list.length === 0) fix = suggestSpelling(q);
    if (fix) {
      dymBtn.textContent = fix;
      dymWrap.hidden = false;
    } else {
      dymWrap.hidden = true;
    }

    if (list.length === 0) {
      grid.innerHTML = "";
      emptyEl.hidden = false;
      emptyTerm.textContent = "“" + (q || "your filters") + "”";
      resultMeta.textContent = "0 products";
      return;
    }
    emptyEl.hidden = true;
    resultMeta.textContent = list.length + (list.length === 1 ? " product" : " products");

    grid.innerHTML = list.map(function (p) {
      var badge = p.sale
        ? '<span class="badge badge-sale">Sale</span>'
        : (p.reviews < 80 ? '<span class="badge badge-new">New</span>' : "");
      var wasHtml = p.was ? '<span class="price-was">' + money(p.was) + "</span>" : "";
      var out = p.stock === "out";
      return '' +
        '<li class="card">' +
          '<div class="card-media" style="background:' + tileVar(p) + '">' +
            badge +
            '<button class="wish" type="button" aria-pressed="false" aria-label="Save ' + esc(p.name) + ' to wishlist" data-wish="' + p.id + '">' +
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>' +
            '</button>' +
            ICONS[p.icon] +
          '</div>' +
          '<div class="card-body">' +
            '<span class="card-cat">' + esc(p.cat) + '</span>' +
            '<h3 class="card-name">' + esc(p.name) + '</h3>' +
            '<div class="rating"><span class="stars" aria-hidden="true">' + stars(p.rating) + '</span>' +
              '<span>' + p.rating.toFixed(1) + ' (' + p.reviews + ')</span></div>' +
            '<div class="price-row">' +
              '<span class="price">' + money(p.price) + '</span>' + wasHtml +
              stockChip(p.stock) +
            '</div>' +
            '<button class="add-btn" type="button" data-add="' + p.id + '"' + (out ? " disabled" : "") + '>' +
              (out ? "Notify me" : "Add to cart") + '</button>' +
          '</div>' +
        '</li>';
    }).join("");
  }

  /* ---------- Autocomplete ---------- */
  function buildSuggestions(q) {
    q = q.trim().toLowerCase();
    var groups = [];

    if (!q) {
      if (RECENT.length) groups.push({ label: "Recent", items: RECENT.map(function (t) { return { type: "term", text: t, icon: "clock" }; }) });
      groups.push({ label: "Popular", items: POPULAR.map(function (t) { return { type: "term", text: t, icon: "trend" }; }) });
      return groups;
    }

    var termHits = RECENT.concat(POPULAR).filter(function (t, i, arr) {
      return t.toLowerCase().indexOf(q) !== -1 && arr.indexOf(t) === i;
    }).slice(0, 3).map(function (t, i) {
      return { type: "term", text: t, icon: RECENT.indexOf(t) !== -1 ? "clock" : "trend" };
    });
    if (termHits.length) groups.push({ label: "Suggestions", items: termHits });

    var prodHits = PRODUCTS.filter(function (p) { return matches(p, q); })
      .sort(function (a, b) { return score(b, q) - score(a, q); })
      .slice(0, 5)
      .map(function (p) { return { type: "product", product: p }; });
    if (prodHits.length) groups.push({ label: "Products", items: prodHits });

    return groups;
  }

  function highlight(text, q) {
    q = q.trim();
    if (!q) return esc(text);
    var idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return esc(text);
    return esc(text.slice(0, idx)) + "<mark>" + esc(text.slice(idx, idx + q.length)) + "</mark>" + esc(text.slice(idx + q.length));
  }

  var MINI = {
    clock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    trend: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>'
  };

  function openAC() {
    var q = input.value;
    var groups = buildSuggestions(q);
    acList.innerHTML = "";
    acItems = [];

    if (!groups.length) { closeAC(); return; }

    groups.forEach(function (g) {
      var lbl = document.createElement("li");
      lbl.className = "ac-group-label";
      lbl.setAttribute("aria-hidden", "true");
      lbl.textContent = g.label;
      acList.appendChild(lbl);

      g.items.forEach(function (it) {
        var li = document.createElement("li");
        li.className = "ac-item";
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.id = "ac-opt-" + acItems.length;

        if (it.type === "term") {
          li.dataset.value = it.text;
          li.innerHTML =
            '<span class="ac-mini-ico" aria-hidden="true">' + MINI[it.icon] + '</span>' +
            '<span class="ac-body"><span class="ac-label">' + highlight(it.text, q) + '</span></span>' +
            '<svg class="ac-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
        } else {
          var p = it.product;
          li.dataset.value = p.name;
          li.dataset.productId = p.id;
          li.innerHTML =
            '<span class="ac-thumb" style="background:var(' + TILES[p.tile] + ')" aria-hidden="true">' +
              '<span style="width:22px;height:22px;display:grid;place-items:center;color:rgba(22,24,29,.75)">' + ICONS[p.icon] + '</span>' +
            '</span>' +
            '<span class="ac-body"><span class="ac-label">' + highlight(p.name, q) + '</span>' +
              '<span class="ac-sub">' + esc(p.cat) + ' · ' + p.rating.toFixed(1) + ' ★</span></span>' +
            '<span class="ac-price">' + money(p.price) + '</span>';
        }
        acList.appendChild(li);
        acItems.push(li);
      });
    });

    acList.hidden = false;
    combo.setAttribute("aria-expanded", "true");
    acIndex = -1;
    input.setAttribute("aria-activedescendant", "");
  }

  function closeAC() {
    acList.hidden = true;
    acList.innerHTML = "";
    combo.setAttribute("aria-expanded", "false");
    acItems = [];
    acIndex = -1;
    input.setAttribute("aria-activedescendant", "");
  }

  function setActive(i) {
    acItems.forEach(function (el, idx) {
      var on = idx === i;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-selected", on ? "true" : "false");
    });
    acIndex = i;
    if (i >= 0 && acItems[i]) {
      input.setAttribute("aria-activedescendant", acItems[i].id);
      acItems[i].scrollIntoView({ block: "nearest" });
    } else {
      input.setAttribute("aria-activedescendant", "");
    }
  }

  function chooseItem(el) {
    if (el.dataset.productId) {
      var p = PRODUCTS.find(function (x) { return x.id === +el.dataset.productId; });
      input.value = p.name;
      runSearch(p.name);
      toast("Showing " + p.name);
    } else {
      input.value = el.dataset.value;
      runSearch(el.dataset.value);
    }
    closeAC();
  }

  /* ---------- Search execution ---------- */
  function runSearch(q) {
    state.query = q;
    toggleClear();
    renderResults();
  }

  function toggleClear() {
    clearBtn.hidden = input.value.length === 0;
  }

  /* ---------- Events ---------- */
  var debounce;
  input.addEventListener("input", function () {
    toggleClear();
    clearTimeout(debounce);
    debounce = setTimeout(openAC, 90);
  });

  input.addEventListener("focus", function () {
    if (acList.hidden) openAC();
  });

  input.addEventListener("keydown", function (e) {
    var open = !acList.hidden && acItems.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) { openAC(); return; }
      setActive(acIndex >= acItems.length - 1 ? 0 : acIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return;
      setActive(acIndex <= 0 ? acItems.length - 1 : acIndex - 1);
    } else if (e.key === "Enter") {
      if (open && acIndex >= 0) {
        e.preventDefault();
        chooseItem(acItems[acIndex]);
      }
    } else if (e.key === "Escape") {
      if (!acList.hidden) { e.preventDefault(); closeAC(); }
    }
  });

  acList.addEventListener("mousemove", function (e) {
    var li = e.target.closest(".ac-item");
    if (li) setActive(acItems.indexOf(li));
  });
  acList.addEventListener("mousedown", function (e) {
    var li = e.target.closest(".ac-item");
    if (li) { e.preventDefault(); chooseItem(li); }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    closeAC();
    runSearch(input.value.trim());
    input.blur();
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    state.query = "";
    toggleClear();
    closeAC();
    renderResults();
    input.focus();
  });

  document.addEventListener("click", function (e) {
    if (!combo.contains(e.target)) closeAC();
  });

  // facets
  facetsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    var f = btn.dataset.facet;
    if (f === "sale") {
      state.onSale = !state.onSale;
      btn.setAttribute("aria-pressed", String(state.onSale));
    } else if (f === "instock") {
      state.inStock = !state.inStock;
      btn.setAttribute("aria-pressed", String(state.inStock));
    } else {
      state.category = f;
      facetsEl.querySelectorAll("[data-facet]").forEach(function (c) {
        if (c.classList.contains("chip-toggle")) return;
        var on = c === btn;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
    }
    renderResults();
  });

  // sort
  sortSel.addEventListener("change", function () {
    state.sort = sortSel.value;
    renderResults();
  });

  // did you mean
  dymBtn.addEventListener("click", function () {
    var v = dymBtn.textContent;
    input.value = v;
    toggleClear();
    runSearch(v);
  });

  // empty-state popular tags
  emptyTags.innerHTML = POPULAR.map(function (t) {
    return '<button class="empty-tag" type="button" data-tag="' + esc(t) + '">' + esc(t) + "</button>";
  }).join("");
  emptyTags.addEventListener("click", function (e) {
    var b = e.target.closest(".empty-tag");
    if (!b) return;
    input.value = b.dataset.tag;
    toggleClear();
    runSearch(b.dataset.tag);
  });

  // grid actions (delegated)
  grid.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) {
      var p = PRODUCTS.find(function (x) { return x.id === +add.dataset.add; });
      cart += 1;
      cartCountEl.textContent = cart;
      add.textContent = "Added ✓";
      setTimeout(function () { add.textContent = "Add to cart"; }, 1100);
      toast(p.name + " added to cart");
      return;
    }
    var wish = e.target.closest("[data-wish]");
    if (wish) {
      var on = wish.getAttribute("aria-pressed") === "true";
      wish.setAttribute("aria-pressed", String(!on));
      toast(on ? "Removed from wishlist" : "Saved to wishlist");
    }
  });

  /* ---------- Init ---------- */
  toggleClear();
  renderResults();
})();
