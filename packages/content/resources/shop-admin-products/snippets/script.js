(function () {
  "use strict";

  /* ---------- Seed data ---------- */
  var GRADS = [
    "linear-gradient(135deg,#fde68a,#fb923c)",
    "linear-gradient(135deg,#bfdbfe,#3457ff)",
    "linear-gradient(135deg,#bbf7d0,#1f9d55)",
    "linear-gradient(135deg,#fbcfe8,#e0245e)",
    "linear-gradient(135deg,#ddd6fe,#7c3aed)",
    "linear-gradient(135deg,#a5f3fc,#0891b2)",
    "linear-gradient(135deg,#fed7aa,#c2410c)",
    "linear-gradient(135deg,#e2e8f0,#475569)"
  ];

  var products = [
    { id: 1, title: "Cedar Pour-Over Kettle", sku: "KIT-0291", price: 78.0, stock: 42, status: "published", emoji: "☕", variants: ["Matte Black", "Brushed Steel"] },
    { id: 2, title: "Linen Apron — Field", sku: "APR-1180", price: 36.5, stock: 8, status: "published", emoji: "🧵", variants: ["S/M", "L/XL"] },
    { id: 3, title: "Smoked Glass Tumbler Set", sku: "GLS-0044", price: 54.0, stock: 0, status: "published", emoji: "🥃", variants: ["Set of 2", "Set of 4"] },
    { id: 4, title: "Walnut Cutting Board", sku: "BRD-7720", price: 64.0, stock: 19, status: "published", emoji: "🪵", variants: [] },
    { id: 5, title: "Beeswax Wood Balm", sku: "CAR-0310", price: 14.0, stock: 120, status: "published", emoji: "🐝", variants: ["4oz", "8oz"] },
    { id: 6, title: "Stoneware Mug — Fog", sku: "MUG-2204", price: 22.0, stock: 6, status: "draft", emoji: "🫖", variants: ["Fog", "Clay", "Moss"] },
    { id: 7, title: "Copper Espresso Spoon", sku: "SPN-0099", price: 12.0, stock: 64, status: "published", emoji: "🥄", variants: [] },
    { id: 8, title: "Indigo Tea Towel Pair", sku: "TWL-3301", price: 28.0, stock: 31, status: "published", emoji: "🧺", variants: ["Indigo", "Rust"] },
    { id: 9, title: "Cast Iron Skillet 10\"", sku: "PAN-0510", price: 89.0, stock: 14, status: "published", emoji: "🍳", variants: ["10 inch", "12 inch"] },
    { id: 10, title: "Hand-Dipped Beeswax Tapers", sku: "CDL-1402", price: 18.0, stock: 0, status: "draft", emoji: "🕯️", variants: ["Natural", "Charcoal"] },
    { id: 11, title: "Ceramic Spice Jar Trio", sku: "JAR-6612", price: 42.0, stock: 27, status: "published", emoji: "🫙", variants: [] },
    { id: 12, title: "Oak Coffee Scoop", sku: "SCP-0073", price: 16.0, stock: 9, status: "archived", emoji: "🥄", variants: [] },
    { id: 13, title: "Waxed Canvas Tote", sku: "TOT-9001", price: 96.0, stock: 22, status: "published", emoji: "👜", variants: ["Olive", "Sand", "Black"] },
    { id: 14, title: "Slate Cheese Board", sku: "BRD-4408", price: 48.0, stock: 5, status: "published", emoji: "🧀", variants: [] },
    { id: 15, title: "Recycled Wool Throw", sku: "THR-2025", price: 128.0, stock: 11, status: "published", emoji: "🧶", variants: ["Heather", "Charcoal"] },
    { id: 16, title: "Brass Bottle Opener", sku: "OPN-0150", price: 24.0, stock: 0, status: "archived", emoji: "🍾", variants: [] },
    { id: 17, title: "Maple Honey Dipper", sku: "DIP-0801", price: 9.0, stock: 88, status: "published", emoji: "🍯", variants: [] },
    { id: 18, title: "Enamel Camp Mug", sku: "MUG-7700", price: 19.0, stock: 47, status: "draft", emoji: "🏕️", variants: ["Cream", "Navy"] }
  ];
  var nextId = 19;

  /* ---------- State ---------- */
  var state = {
    search: "",
    status: "all",
    sortKey: "title",
    sortDir: "asc",
    page: 1,
    perPage: 8,
    selected: new Set(),
    editingId: null,
    formVariants: []
  };

  /* ---------- Helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function gradFor(id) { return GRADS[id % GRADS.length]; }

  /* ---------- Toast ---------- */
  var toastHost = $("#toasts");
  function toast(msg, kind) {
    var t = document.createElement("div");
    t.className = "toast " + (kind || "ok");
    var ico = kind === "warn" ? "⚠" : kind === "info" ? "ℹ" : "✓";
    t.innerHTML = '<span class="t-ico">' + ico + "</span>" + esc(msg);
    toastHost.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 260);
    }, 2600);
  }

  /* ---------- Filtering / sorting ---------- */
  function filtered() {
    var q = state.search.trim().toLowerCase();
    var rows = products.filter(function (p) {
      if (state.status !== "all" && p.status !== state.status) return false;
      if (q) {
        return (p.title.toLowerCase().indexOf(q) !== -1) || (p.sku.toLowerCase().indexOf(q) !== -1);
      }
      return true;
    });
    var dir = state.sortDir === "asc" ? 1 : -1;
    var k = state.sortKey;
    rows.sort(function (a, b) {
      var av = a[k], bv = b[k];
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return rows;
  }

  /* ---------- Render stats ---------- */
  function renderStats() {
    var total = products.length;
    var pub = products.filter(function (p) { return p.status === "published"; }).length;
    var oos = products.filter(function (p) { return p.stock === 0; }).length;
    var val = products.reduce(function (s, p) { return s + p.price * p.stock; }, 0);
    $("#stat-total").textContent = total;
    $("#stat-published").textContent = pub;
    $("#stat-oos").textContent = oos;
    $("#stat-value").textContent = money(val);
    $("#catalog-count").textContent = total + " products · " + pub + " published";
  }

  /* ---------- Render table ---------- */
  function stockClass(s) { return s === 0 ? "stock-out" : s <= 10 ? "stock-low" : ""; }

  function rowHtml(p) {
    var sel = state.selected.has(p.id);
    var variantsLabel = p.variants.length ? p.variants.length + " variants" : "Single variant";
    return (
      '<tr data-id="' + p.id + '" class="' + (sel ? "is-selected" : "") + '">' +
        '<td class="col-check"><input type="checkbox" class="row-check" ' + (sel ? "checked" : "") +
          ' aria-label="Select ' + esc(p.title) + '" /></td>' +
        '<td class="col-prod"><div class="prod-cell">' +
          '<span class="thumb" style="background:' + gradFor(p.id) + '" aria-hidden="true">' + p.emoji + "</span>" +
          '<div><div class="prod-name">' + esc(p.title) + "</div>" +
          '<div class="prod-meta">' + esc(variantsLabel) + "</div></div></div></td>" +
        '<td class="col-sku"><span class="sku-mono">' + esc(p.sku) + "</span></td>" +
        '<td class="col-price price-cell">' + money(p.price) + "</td>" +
        '<td class="col-stock"><input type="number" min="0" step="1" value="' + p.stock +
          '" class="stock-edit ' + stockClass(p.stock) + '" data-stock="' + p.id +
          '" aria-label="Stock for ' + esc(p.title) + '" /></td>' +
        '<td class="col-status"><span class="badge badge-' + p.status + '">' +
          p.status.charAt(0).toUpperCase() + p.status.slice(1) + "</span></td>" +
        '<td class="col-act"><div class="row-act">' +
          '<button type="button" class="icon-btn" data-edit="' + p.id + '" title="Edit" aria-label="Edit ' + esc(p.title) + '">✎</button>' +
          '<button type="button" class="icon-btn danger" data-del="' + p.id + '" title="Delete" aria-label="Delete ' + esc(p.title) + '">🗑</button>' +
        "</div></td>" +
      "</tr>"
    );
  }

  function renderTable() {
    var rows = filtered();
    var pages = Math.max(1, Math.ceil(rows.length / state.perPage));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * state.perPage;
    var pageRows = rows.slice(start, start + state.perPage);

    var tbody = $("#rows");
    var empty = $("#empty");
    if (rows.length === 0) {
      tbody.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      tbody.innerHTML = pageRows.map(rowHtml).join("");
    }

    // pager
    $("#pagerInfo").textContent = rows.length
      ? "Showing " + (start + 1) + "–" + (start + pageRows.length) + " of " + rows.length
      : "No results";
    $("#prevPage").disabled = state.page <= 1;
    $("#nextPage").disabled = state.page >= pages;
    var pagesHtml = "";
    for (var i = 1; i <= pages; i++) {
      pagesHtml += '<button type="button" class="page-num ' + (i === state.page ? "is-active" : "") +
        '" data-page="' + i + '"' + (i === state.page ? ' aria-current="page"' : "") + ">" + i + "</button>";
    }
    $("#pagerPages").innerHTML = pagesHtml;

    // select-all reflects current page
    var checkAll = $("#checkAll");
    var allSel = pageRows.length > 0 && pageRows.every(function (p) { return state.selected.has(p.id); });
    var someSel = pageRows.some(function (p) { return state.selected.has(p.id); });
    checkAll.checked = allSel;
    checkAll.indeterminate = !allSel && someSel;

    // sort indicators
    $$(".sort").forEach(function (b) {
      b.classList.remove("asc", "desc");
      b.removeAttribute("aria-sort");
      if (b.dataset.sort === state.sortKey) {
        b.classList.add(state.sortDir);
        b.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
      }
    });

    renderBulk();
  }

  function renderBulk() {
    var bar = $("#bulkbar");
    var n = state.selected.size;
    if (n > 0) {
      bar.hidden = false;
      $("#bulk-n").textContent = n;
    } else {
      bar.hidden = true;
    }
  }

  function renderAll() { renderStats(); renderTable(); }

  /* ---------- Events: toolbar ---------- */
  $("#search").addEventListener("input", function (e) {
    state.search = e.target.value;
    state.page = 1;
    renderTable();
  });

  $$(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$(".chip").forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-selected", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      state.status = chip.dataset.status;
      state.page = 1;
      renderTable();
    });
  });

  $$(".sort").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = "asc";
      }
      renderTable();
    });
  });

  $("#resetFilters").addEventListener("click", function () {
    state.search = ""; state.status = "all"; state.page = 1;
    $("#search").value = "";
    $$(".chip").forEach(function (c) {
      var on = c.dataset.status === "all";
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderTable();
  });

  /* ---------- Events: table delegation ---------- */
  $("#rows").addEventListener("change", function (e) {
    var id;
    if (e.target.classList.contains("row-check")) {
      id = Number(e.target.closest("tr").dataset.id);
      if (e.target.checked) state.selected.add(id); else state.selected.delete(id);
      e.target.closest("tr").classList.toggle("is-selected", e.target.checked);
      renderTable();
    } else if (e.target.classList.contains("stock-edit")) {
      id = Number(e.target.dataset.stock);
      var p = products.find(function (x) { return x.id === id; });
      var v = Math.max(0, parseInt(e.target.value, 10) || 0);
      e.target.value = v;
      p.stock = v;
      toast("Stock updated for " + p.title + " → " + v, "info");
      renderStats();
      // refresh class on the field without full rerender to keep focus
      e.target.className = "stock-edit " + stockClass(v);
    }
  });

  $("#rows").addEventListener("click", function (e) {
    var editBtn = e.target.closest("[data-edit]");
    var delBtn = e.target.closest("[data-del]");
    if (editBtn) { openDrawer(Number(editBtn.dataset.edit)); }
    if (delBtn) {
      var id = Number(delBtn.dataset.del);
      var p = products.find(function (x) { return x.id === id; });
      if (!p) return;
      products = products.filter(function (x) { return x.id !== id; });
      state.selected.delete(id);
      toast("Deleted “" + p.title + "”", "warn");
      renderAll();
    }
  });

  /* ---------- Select-all ---------- */
  $("#checkAll").addEventListener("change", function (e) {
    var rows = filtered();
    var start = (state.page - 1) * state.perPage;
    var pageRows = rows.slice(start, start + state.perPage);
    pageRows.forEach(function (p) {
      if (e.target.checked) state.selected.add(p.id); else state.selected.delete(p.id);
    });
    renderTable();
  });

  /* ---------- Bulk actions ---------- */
  $$("[data-bulk]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.dataset.bulk;
      var ids = Array.from(state.selected);
      if (!ids.length) return;
      if (action === "delete") {
        products = products.filter(function (p) { return !state.selected.has(p.id); });
        toast(ids.length + " product" + (ids.length > 1 ? "s" : "") + " deleted", "warn");
        state.selected.clear();
      } else {
        var newStatus = action === "publish" ? "published" : "archived";
        ids.forEach(function (id) {
          var p = products.find(function (x) { return x.id === id; });
          if (p) p.status = newStatus;
        });
        toast(ids.length + " product" + (ids.length > 1 ? "s" : "") + " " + newStatus, "ok");
      }
      renderAll();
    });
  });

  $("#bulkClear").addEventListener("click", function () {
    state.selected.clear();
    renderTable();
  });

  /* ---------- Pager ---------- */
  $("#prevPage").addEventListener("click", function () {
    if (state.page > 1) { state.page--; renderTable(); }
  });
  $("#nextPage").addEventListener("click", function () {
    var pages = Math.max(1, Math.ceil(filtered().length / state.perPage));
    if (state.page < pages) { state.page++; renderTable(); }
  });
  $("#pagerPages").addEventListener("click", function (e) {
    var b = e.target.closest("[data-page]");
    if (b) { state.page = Number(b.dataset.page); renderTable(); }
  });

  /* ---------- Export (mock) ---------- */
  $("#exportBtn").addEventListener("click", function () {
    var rows = filtered();
    toast("Exported " + rows.length + " products to CSV", "ok");
  });

  /* ---------- Drawer ---------- */
  var drawer = $("#drawer");
  var scrim = $("#scrim");
  var form = $("#prodForm");
  var lastFocused = null;

  function renderFormVariants() {
    var host = $("#variants");
    host.innerHTML = state.formVariants.map(function (v, i) {
      return '<span class="variant-tag">' + esc(v) +
        '<button type="button" data-rmv="' + i + '" aria-label="Remove ' + esc(v) + '">✕</button></span>';
    }).join("");
  }

  function updatePreview() {
    var em = state.editingId ? (products.find(function (p) { return p.id === state.editingId; }) || {}).emoji : "📦";
    $("#dPreview").textContent = em || "📦";
  }

  function openDrawer(id) {
    lastFocused = document.activeElement;
    state.editingId = id || null;
    form.reset();
    clearErrors();
    if (id) {
      var p = products.find(function (x) { return x.id === id; });
      $("#drawerTitle").textContent = "Edit product";
      $("#fTitle").value = p.title;
      $("#fPrice").value = p.price;
      $("#fStock").value = p.stock;
      $("#fSku").value = p.sku;
      $("#fStatus").value = p.status;
      state.formVariants = p.variants.slice();
      $("#dPreview").textContent = p.emoji;
      $("#dPreview").style.background = gradFor(p.id);
    } else {
      $("#drawerTitle").textContent = "Add product";
      state.formVariants = [];
      $("#dPreview").textContent = "📦";
      $("#dPreview").style.background = "linear-gradient(135deg,var(--brand-soft),#f3eaff)";
    }
    renderFormVariants();
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    setTimeout(function () { $("#fTitle").focus(); }, 60);
    document.addEventListener("keydown", onEsc);
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    document.removeEventListener("keydown", onEsc);
    if (lastFocused) lastFocused.focus();
  }

  function onEsc(e) {
    if (e.key === "Escape") closeDrawer();
    // simple focus trap across drawer panel + footer Save button
    if (e.key === "Tab") {
      var f = $$('button, input, select', drawer).concat([$("#drawerSave")]);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  $("#addBtn").addEventListener("click", function () { openDrawer(null); });
  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#drawerCancel").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);

  // variants in form
  $("#variantAdd").addEventListener("click", addVariant);
  $("#variantInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addVariant(); }
  });
  function addVariant() {
    var input = $("#variantInput");
    var v = input.value.trim();
    if (!v) return;
    if (state.formVariants.indexOf(v) === -1) state.formVariants.push(v);
    input.value = "";
    input.focus();
    renderFormVariants();
  }
  $("#variants").addEventListener("click", function (e) {
    var b = e.target.closest("[data-rmv]");
    if (b) {
      state.formVariants.splice(Number(b.dataset.rmv), 1);
      renderFormVariants();
    }
  });

  /* ---------- Validation + save ---------- */
  function clearErrors() {
    ["Title", "Price", "Stock"].forEach(function (f) {
      $("#err" + f).textContent = "";
      $("#f" + f).classList.remove("invalid");
    });
  }
  function err(field, msg) {
    $("#err" + field).textContent = msg;
    $("#f" + field).classList.add("invalid");
  }

  function makeSku(title) {
    var prefix = (title.replace(/[^a-z]/gi, "").slice(0, 3) || "PRD").toUpperCase();
    return prefix + "-" + String(Math.floor(1000 + Math.random() * 9000));
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var title = $("#fTitle").value.trim();
    var price = parseFloat($("#fPrice").value);
    var stock = parseInt($("#fStock").value, 10);
    var ok = true;
    if (!title) { err("Title", "Title is required."); ok = false; }
    if (isNaN(price) || price < 0) { err("Price", "Enter a valid price."); ok = false; }
    if (isNaN(stock) || stock < 0) { err("Stock", "Enter inventory ≥ 0."); ok = false; }
    if (!ok) return;

    var sku = $("#fSku").value.trim() || makeSku(title);
    var status = $("#fStatus").value;
    var variants = state.formVariants.slice();

    if (state.editingId) {
      var p = products.find(function (x) { return x.id === state.editingId; });
      p.title = title; p.price = price; p.stock = stock; p.sku = sku; p.status = status; p.variants = variants;
      toast("Saved changes to “" + title + "”", "ok");
    } else {
      products.unshift({
        id: nextId++, title: title, sku: sku, price: price, stock: stock,
        status: status, emoji: "📦", variants: variants
      });
      toast("Product “" + title + "” created", "ok");
    }
    closeDrawer();
    renderAll();
  });

  /* ---------- Init ---------- */
  renderAll();
})();
