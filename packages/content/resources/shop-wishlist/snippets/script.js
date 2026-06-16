(function () {
  "use strict";

  var STORE_KEY = "nw_wishlist_v1";
  var CART_KEY = "nw_cart_count_v1";

  // ── Seed catalogue (fictional) ───────────────────────────
  var SEED = [
    {
      id: "p1", brand: "Aer", title: "Loft Over-Ear Headphones",
      price: 189, was: 249, rating: 4.7, reviews: 412, stock: "in",
      drop: true, isnew: false, tint: ["#eef2ff", "#dbe4ff"], hue: "#3457ff", shape: "headphones"
    },
    {
      id: "p2", brand: "Norden", title: "Maple Standing Desk 48\"",
      price: 429, was: null, rating: 4.9, reviews: 198, stock: "low",
      drop: false, isnew: true, tint: ["#fff7ed", "#ffe8cc"], hue: "#d97706", shape: "desk"
    },
    {
      id: "p3", brand: "Lumen", title: "Arc Task Lamp",
      price: 79, was: 99, rating: 4.5, reviews: 327, stock: "in",
      drop: true, isnew: false, tint: ["#ecfdf5", "#d1fae5"], hue: "#1f9d55", shape: "lamp"
    },
    {
      id: "p4", brand: "Pace", title: "Trail Runner GT Sneakers",
      price: 134, was: null, rating: 4.6, reviews: 904, stock: "in",
      drop: false, isnew: false, tint: ["#fdf2f8", "#fce7f3"], hue: "#e0245e", shape: "shoe"
    },
    {
      id: "p5", brand: "Kettle", title: "Pour-Over Coffee Set",
      price: 58, was: null, rating: 4.4, reviews: 156, stock: "out",
      drop: false, isnew: false, tint: ["#f5f3ff", "#ede9fe"], hue: "#7c3aed", shape: "kettle"
    },
    {
      id: "p6", brand: "Field", title: "Canvas Weekender Bag",
      price: 112, was: 140, rating: 4.8, reviews: 271, stock: "low",
      drop: false, isnew: false, tint: ["#f0fdfa", "#ccfbf1"], hue: "#0d9488", shape: "bag"
    }
  ];

  // ── Inline SVG product silhouettes ───────────────────────
  function silhouette(shape, hue) {
    var c = hue;
    var map = {
      headphones:
        '<path d="M14 40v-6a18 18 0 0 1 36 0v6" fill="none" stroke="' + c + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<rect x="9" y="38" width="9" height="16" rx="4" fill="' + c + '"/>' +
        '<rect x="46" y="38" width="9" height="16" rx="4" fill="' + c + '"/>',
      desk:
        '<rect x="8" y="22" width="48" height="6" rx="2" fill="' + c + '"/>' +
        '<rect x="13" y="28" width="5" height="26" rx="2" fill="' + c + '"/>' +
        '<rect x="46" y="28" width="5" height="26" rx="2" fill="' + c + '"/>' +
        '<rect x="22" y="14" width="20" height="13" rx="2" fill="' + c + '" opacity=".55"/>',
      lamp:
        '<rect x="22" y="52" width="20" height="4" rx="2" fill="' + c + '"/>' +
        '<path d="M32 52V30" stroke="' + c + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M32 30l14-14" stroke="' + c + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M40 8l12 12-7 6-11-11 6-7z" fill="' + c + '"/>',
      shoe:
        '<path d="M8 42c4-2 10-4 16-10 3 4 8 6 16 6 6 0 14 1 16 6v4H8v-12z" fill="' + c + '"/>' +
        '<path d="M24 32c2 3 6 5 12 5" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>',
      kettle:
        '<path d="M20 26h24l-3 24a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4l-3-24z" fill="' + c + '"/>' +
        '<path d="M44 32l8-6" stroke="' + c + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M24 26c0-6 16-6 16 0" fill="none" stroke="' + c + '" stroke-width="3.4"/>',
      bag:
        '<rect x="12" y="26" width="40" height="28" rx="6" fill="' + c + '"/>' +
        '<path d="M24 26v-4a8 8 0 0 1 16 0v4" fill="none" stroke="' + c + '" stroke-width="3.4"/>' +
        '<rect x="28" y="38" width="8" height="9" rx="2" fill="#fff" opacity=".55"/>'
    };
    return '<svg class="silhouette" viewBox="0 0 64 64" aria-hidden="true">' + (map[shape] || "") + "</svg>";
  }

  // ── Money ────────────────────────────────────────────────
  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ── State / persistence ──────────────────────────────────
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var ids = JSON.parse(raw);
        if (Array.isArray(ids)) {
          var byId = {};
          SEED.forEach(function (p) { byId[p.id] = p; });
          var list = ids.map(function (id) { return byId[id]; }).filter(Boolean);
          if (list.length) return list;
        }
      }
    } catch (e) { /* fall through to seed */ }
    return SEED.slice();
  }
  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(items.map(function (p) { return p.id; }))); } catch (e) {}
  }
  function loadCart() {
    var n = parseInt(localStorage.getItem(CART_KEY) || "0", 10);
    return isNaN(n) ? 0 : n;
  }
  function bumpCart(by) {
    cartCount += by;
    try { localStorage.setItem(CART_KEY, String(cartCount)); } catch (e) {}
    els.cartCount.textContent = cartCount;
  }

  var items = load();
  var selected = {};       // id -> true
  var cartCount = loadCart();

  // ── DOM refs ─────────────────────────────────────────────
  var els = {
    grid: document.getElementById("grid"),
    empty: document.getElementById("empty"),
    bulk: document.getElementById("bulk"),
    selectAll: document.getElementById("selectAll"),
    selText: document.getElementById("selText"),
    bulkMove: document.getElementById("bulkMove"),
    bulkRemove: document.getElementById("bulkRemove"),
    headCount: document.getElementById("headCount"),
    savedBadge: document.getElementById("savedBadge"),
    cartCount: document.getElementById("cartCount"),
    browse: document.getElementById("browse"),
    toast: document.getElementById("toast"),
    toastMsg: document.getElementById("toastMsg"),
    toastBtn: document.getElementById("toastBtn")
  };

  // ── Toast w/ optional undo ───────────────────────────────
  var toastTimer = null;
  function toast(msg, undoFn) {
    clearTimeout(toastTimer);
    els.toastMsg.textContent = msg;
    if (undoFn) {
      els.toastBtn.hidden = false;
      els.toastBtn.onclick = function () {
        clearTimeout(toastTimer);
        hideToast();
        undoFn();
      };
    } else {
      els.toastBtn.hidden = true;
      els.toastBtn.onclick = null;
    }
    els.toast.hidden = false;
    requestAnimationFrame(function () { els.toast.classList.add("is-on"); });
    toastTimer = setTimeout(hideToast, undoFn ? 5000 : 2600);
  }
  function hideToast() {
    els.toast.classList.remove("is-on");
    setTimeout(function () { els.toast.hidden = true; }, 220);
  }

  // ── Render ───────────────────────────────────────────────
  var STOCK_LABEL = { in: "In stock", low: "Only a few left", out: "Out of stock" };

  function cardHTML(p) {
    var stars = Math.round((p.rating / 5) * 100);
    var badges = "";
    if (p.drop) badges += '<span class="tag tag--drop">Price drop</span>';
    if (p.isnew) badges += '<span class="tag tag--new">New</span>';

    var priceBlock = p.was
      ? '<span class="price__now is-sale">' + money(p.price) + '</span><span class="price__was">' + money(p.was) + '</span>'
      : '<span class="price__now">' + money(p.price) + '</span>';

    var outOfStock = p.stock === "out";

    return '' +
      '<article class="card' + (selected[p.id] ? " is-selected" : "") + '" data-id="' + p.id + '">' +
        '<div class="card__media" style="background:linear-gradient(135deg,' + p.tint[0] + ',' + p.tint[1] + ');">' +
          '<label class="card__check">' +
            '<input type="checkbox" data-sel="' + p.id + '" aria-label="Select ' + p.title + '"' + (selected[p.id] ? " checked" : "") + '/>' +
            '<span class="card__checkbox" aria-hidden="true"><svg viewBox="0 0 16 16" width="11" height="11"><path d="M3 8.2l3.2 3.2L13 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
          '</label>' +
          '<button class="card__heart" type="button" data-remove="' + p.id + '" aria-label="Remove ' + p.title + ' from wishlist" title="Remove from wishlist">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.5 0 5 3.5 3.5 6.5C19 15.65 12 20 12 20z" fill="currentColor"/></svg>' +
          '</button>' +
          silhouette(p.shape, p.hue) +
          (badges ? '<div class="badges">' + badges + '</div>' : "") +
        '</div>' +
        '<div class="card__body">' +
          '<span class="card__brand">' + p.brand + '</span>' +
          '<h3 class="card__title">' + p.title + '</h3>' +
          '<span class="rating"><span class="rating__stars" aria-hidden="true"><span class="rating__fill" style="width:' + stars + '%"></span></span>' +
            '<span>' + p.rating.toFixed(1) + ' (' + p.reviews.toLocaleString("en-US") + ')</span></span>' +
          '<div class="price">' + priceBlock + '</div>' +
          '<span class="stock stock--' + p.stock + '">' + STOCK_LABEL[p.stock] + '</span>' +
          '<div class="card__foot">' +
            '<button class="card__cta" type="button" data-move="' + p.id + '"' + (outOfStock ? " disabled" : "") + '>' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12L6 6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M6 6L5 3H2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.3" fill="currentColor"/><circle cx="18" cy="20" r="1.3" fill="currentColor"/></svg>' +
              '<span class="label">' + (outOfStock ? "Out of stock" : "Move to cart") + '</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function render() {
    var hasItems = items.length > 0;
    els.empty.hidden = hasItems;
    els.bulk.style.display = hasItems ? "" : "none";
    els.grid.style.display = hasItems ? "" : "none";

    els.grid.innerHTML = items.map(cardHTML).join("");

    var n = items.length;
    els.headCount.textContent = n + (n === 1 ? " item" : " items");
    els.savedBadge.textContent = n;
    persist();
    syncBulk();
  }

  // ── Bulk-bar state ───────────────────────────────────────
  function selectedIds() {
    return items.filter(function (p) { return selected[p.id]; }).map(function (p) { return p.id; });
  }
  function syncBulk() {
    var sel = selectedIds();
    var count = sel.length;
    var total = items.length;

    els.selectAll.checked = count > 0 && count === total;
    els.selectAll.indeterminate = count > 0 && count < total;
    els.selText.textContent = count ? count + " selected" : "Select all";

    els.bulkMove.disabled = count === 0;
    els.bulkRemove.disabled = count === 0;
  }

  // ── Actions ──────────────────────────────────────────────
  function moveToCart(id) {
    var idx = items.findIndex(function (p) { return p.id === id; });
    if (idx === -1) return;
    var p = items[idx];
    if (p.stock === "out") { toast("That item is out of stock."); return; }
    items.splice(idx, 1);
    delete selected[id];
    bumpCart(1);
    var snapshot = { item: p, index: idx };
    render();
    toast("Moved “" + p.title + "” to cart", function () {
      items.splice(snapshot.index, 0, snapshot.item);
      bumpCart(-1);
      render();
    });
  }

  function removeItem(id) {
    var idx = items.findIndex(function (p) { return p.id === id; });
    if (idx === -1) return;
    var p = items[idx];
    var card = els.grid.querySelector('.card[data-id="' + id + '"]');
    var snapshot = { item: p, index: idx, wasSelected: !!selected[id] };
    delete selected[id];

    var commit = function () {
      items.splice(idx, 1);
      render();
      toast("Removed “" + p.title + "”", function () {
        items.splice(snapshot.index, 0, snapshot.item);
        if (snapshot.wasSelected) selected[snapshot.item.id] = true;
        render();
      });
    };

    if (card) {
      card.classList.add("is-leaving");
      setTimeout(commit, 220);
    } else {
      commit();
    }
  }

  function bulkMove() {
    var movable = items.filter(function (p) { return selected[p.id] && p.stock !== "out"; });
    if (!movable.length) { toast("Selected items are out of stock."); return; }
    var snapshot = items.map(function (p) { return p; });
    var moved = movable.map(function (p) { return p.id; });
    items = items.filter(function (p) { return moved.indexOf(p.id) === -1; });
    moved.forEach(function (id) { delete selected[id]; });
    bumpCart(moved.length);
    render();
    toast(moved.length + (moved.length === 1 ? " item" : " items") + " moved to cart", function () {
      items = snapshot;
      bumpCart(-moved.length);
      render();
    });
  }

  function bulkRemove() {
    var ids = selectedIds();
    if (!ids.length) return;
    var snapshot = { list: items.slice(), sel: Object.assign({}, selected) };
    items = items.filter(function (p) { return ids.indexOf(p.id) === -1; });
    ids.forEach(function (id) { delete selected[id]; });
    render();
    toast(ids.length + (ids.length === 1 ? " item" : " items") + " removed", function () {
      items = snapshot.list;
      selected = snapshot.sel;
      render();
    });
  }

  // ── Events (delegated) ───────────────────────────────────
  els.grid.addEventListener("click", function (e) {
    var moveBtn = e.target.closest("[data-move]");
    if (moveBtn) { moveToCart(moveBtn.getAttribute("data-move")); return; }

    var heart = e.target.closest("[data-remove]");
    if (heart) {
      heart.classList.add("pop");
      removeItem(heart.getAttribute("data-remove"));
    }
  });

  els.grid.addEventListener("change", function (e) {
    var box = e.target.closest("[data-sel]");
    if (!box) return;
    var id = box.getAttribute("data-sel");
    if (box.checked) selected[id] = true; else delete selected[id];
    var card = els.grid.querySelector('.card[data-id="' + id + '"]');
    if (card) card.classList.toggle("is-selected", box.checked);
    syncBulk();
  });

  els.selectAll.addEventListener("change", function () {
    if (els.selectAll.checked) {
      items.forEach(function (p) { selected[p.id] = true; });
    } else {
      selected = {};
    }
    render();
  });

  els.bulkMove.addEventListener("click", bulkMove);
  els.bulkRemove.addEventListener("click", bulkRemove);

  els.browse.addEventListener("click", function () {
    items = SEED.slice();
    selected = {};
    render();
    toast("Wishlist restored with sample items");
  });

  // ── Boot ─────────────────────────────────────────────────
  els.cartCount.textContent = cartCount;
  render();
})();
