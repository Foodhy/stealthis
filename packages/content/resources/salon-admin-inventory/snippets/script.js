(function () {
  "use strict";

  /* ============ DATA ============ */
  // Realistic but clearly fictional boutique salon retail stock.
  var PRODUCTS = [
    { id: "p1",  name: "Lumière Repair Shampoo 250ml", brand: "Sève Atelier",   sku: "SEV-SH-250", onHand: 14, par: 8,  price: 38,  supplier: "Sève Distribution", color: "#9d7a4f" },
    { id: "p2",  name: "Velvet Hydration Masque 200ml", brand: "Sève Atelier",  sku: "SEV-MQ-200", onHand: 5,  par: 6,  price: 54,  supplier: "Sève Distribution", color: "#c9a78f" },
    { id: "p3",  name: "Color Gloss 6N — Hazel",        brand: "Maison Toné",   sku: "MTN-6N-COL", onHand: 0,  par: 10, price: 12,  supplier: "Toné Pro Supply",   color: "#7c5a3a" },
    { id: "p4",  name: "Color Gloss 8A — Champagne",    brand: "Maison Toné",   sku: "MTN-8A-COL", onHand: 22, par: 10, price: 12,  supplier: "Toné Pro Supply",   color: "#cbb27e" },
    { id: "p5",  name: "Developer 20 Vol 1L",           brand: "Maison Toné",   sku: "MTN-DEV-20", onHand: 9,  par: 4,  price: 26,  supplier: "Toné Pro Supply",   color: "#b5bcc2" },
    { id: "p6",  name: "Argan Finishing Oil 100ml",     brand: "Fleur d'Or",    sku: "FDO-OIL-100",onHand: 3,  par: 6,  price: 48,  supplier: "Fleur d'Or Beauté", color: "#b08d57" },
    { id: "p7",  name: "Sea-Salt Texture Spray 200ml",  brand: "Fleur d'Or",    sku: "FDO-TXT-200",onHand: 11, par: 6,  price: 32,  supplier: "Fleur d'Or Beauté", color: "#a7b3a0" },
    { id: "p8",  name: "Thermal Shield Mist 150ml",     brand: "Fleur d'Or",    sku: "FDO-THM-150",onHand: 6,  par: 6,  price: 34,  supplier: "Fleur d'Or Beauté", color: "#c08a3e" },
    { id: "p9",  name: "Aria Ionic Blow Dryer",         brand: "Vance Tools",   sku: "VNC-DRY-001",onHand: 4,  par: 2,  price: 189, supplier: "Vance Pro Tools",   color: "#3d362f" },
    { id: "p10", name: "Tourmaline Flat Iron 1in",      brand: "Vance Tools",   sku: "VNC-IRN-100",onHand: 0,  par: 3,  price: 142, supplier: "Vance Pro Tools",   color: "#5a514a" },
    { id: "p11", name: "Boar-Bristle Round Brush 45mm", brand: "Vance Tools",   sku: "VNC-BRS-045",onHand: 7,  par: 5,  price: 44,  supplier: "Vance Pro Tools",   color: "#8c6d3f" },
    { id: "p12", name: "Rose Scalp Serum 60ml",         brand: "Sève Atelier",  sku: "SEV-SCP-060", onHand: 2, par: 5,  price: 62,  supplier: "Sève Distribution", color: "#c9a78f" }
  ];

  var state = { filter: "all", query: "" };

  /* ============ HELPERS ============ */
  function statusOf(p) {
    if (p.onHand <= 0) return "out";
    if (p.onHand <= p.par) return "low";
    return "ok";
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function initials(name) {
    var parts = name.replace(/[0-9].*$/, "").trim().split(/\s+/);
    return ((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "");
  }

  var STATUS_LABEL = { ok: "In stock", low: "Low", out: "Out" };

  /* ============ DOM REFS ============ */
  var tbody = document.getElementById("tbody");
  var emptyState = document.getElementById("emptyState");
  var searchInput = document.getElementById("searchInput");
  var rowSummary = document.getElementById("rowSummary");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  /* ============ TOAST ============ */
  function toast(msg, accent) {
    toastEl.innerHTML = accent
      ? msg + ' <span class="toast__accent">' + accent + "</span>"
      : msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ============ RENDER ============ */
  function matchesFilter(p) {
    if (state.filter === "all") return true;
    return statusOf(p) === state.filter;
  }

  function matchesQuery(p) {
    if (!state.query) return true;
    var q = state.query.toLowerCase();
    return (
      p.name.toLowerCase().indexOf(q) !== -1 ||
      p.brand.toLowerCase().indexOf(q) !== -1 ||
      p.sku.toLowerCase().indexOf(q) !== -1 ||
      p.supplier.toLowerCase().indexOf(q) !== -1
    );
  }

  function rowHTML(p) {
    var st = statusOf(p);
    var rowClass = st === "low" ? "row--low" : st === "out" ? "row--out" : "";
    var needsReorder = st === "low" || st === "out";

    var action = needsReorder
      ? '<button class="reorder" data-action="reorder" data-id="' + p.id +
        '" type="button">Reorder</button>'
      : '<span class="dash" aria-hidden="true">—</span>';

    return (
      '<tr class="' + rowClass + '" data-id="' + p.id + '">' +
        '<td class="tbl__product">' +
          '<div class="prod">' +
            '<span class="prod__sw" style="background:' + p.color + '" aria-hidden="true">' +
              initials(p.name) +
            "</span>" +
            "<span>" +
              '<span class="prod__name">' + p.name + "</span>" +
              '<span class="prod__brand">' + p.brand + "</span>" +
            "</span>" +
          "</div>" +
        "</td>" +
        '<td><span class="sku">' + p.sku + "</span></td>" +
        '<td class="tbl__num">' +
          '<span class="stepper">' +
            '<button class="step" data-action="dec" data-id="' + p.id +
              '" type="button" aria-label="Decrease on-hand for ' + p.name + '"' +
              (p.onHand <= 0 ? " disabled" : "") + ">&minus;</button>" +
            '<span class="stepper__val" data-val="' + p.id + '" aria-live="polite">' +
              p.onHand +
            "</span>" +
            '<button class="step" data-action="inc" data-id="' + p.id +
              '" type="button" aria-label="Increase on-hand for ' + p.name + '">+</button>' +
          "</span>" +
        "</td>" +
        '<td class="tbl__num num">' + p.par + "</td>" +
        "<td>" +
          '<span class="pill pill--' + st + '" data-pill="' + p.id + '">' +
            STATUS_LABEL[st] +
          "</span>" +
        "</td>" +
        '<td class="tbl__num retail">' + money(p.price) + "</td>" +
        '<td><span class="supplier">' + p.supplier + "</span></td>" +
        '<td class="tbl__act act-cell">' + action + "</td>" +
      "</tr>"
    );
  }

  function render() {
    var visible = PRODUCTS.filter(function (p) {
      return matchesFilter(p) && matchesQuery(p);
    });

    tbody.innerHTML = visible.map(rowHTML).join("");
    emptyState.hidden = visible.length !== 0;
    rowSummary.textContent =
      "Showing " + visible.length + " of " + PRODUCTS.length + " products";
  }

  function updateStats() {
    var low = 0, out = 0, retail = 0;
    PRODUCTS.forEach(function (p) {
      var st = statusOf(p);
      if (st === "low") low++;
      if (st === "out") out++;
      retail += p.onHand * p.price;
    });

    document.getElementById("statSkus").textContent = PRODUCTS.length;
    document.getElementById("statLow").textContent = low;
    document.getElementById("statOut").textContent = out;
    document.getElementById("statValue").textContent = money(retail);

    document.querySelector('[data-count="all"]').textContent = PRODUCTS.length;
    document.querySelector('[data-count="low"]').textContent = low;
    document.querySelector('[data-count="out"]').textContent = out;
  }

  function refresh() {
    updateStats();
    render();
  }

  /* ============ INTERACTIONS ============ */
  function adjust(id, delta) {
    var p = PRODUCTS.find(function (x) { return x.id === id; });
    if (!p) return;
    var next = p.onHand + delta;
    if (next < 0) return;
    p.onHand = next;

    // If the row is still visible under the current filter, update it in place
    // with a flash; otherwise the filter no longer matches, so re-render.
    var row = tbody.querySelector('tr[data-id="' + id + '"]');
    var stillVisible = matchesFilter(p) && matchesQuery(p);

    if (row && stillVisible) {
      var st = statusOf(p);
      row.className = st === "low" ? "row--low" : st === "out" ? "row--out" : "";
      row.querySelector('[data-val="' + id + '"]').textContent = p.onHand;

      var pill = row.querySelector('[data-pill="' + id + '"]');
      pill.className = "pill pill--" + st;
      pill.textContent = STATUS_LABEL[st];

      var dec = row.querySelector('[data-action="dec"]');
      dec.disabled = p.onHand <= 0;

      // refresh the action cell (reorder appears/disappears)
      var actCell = row.querySelector(".act-cell");
      if (st === "low" || st === "out") {
        if (!actCell.querySelector(".reorder")) {
          actCell.innerHTML =
            '<button class="reorder" data-action="reorder" data-id="' + id +
            '" type="button">Reorder</button>';
        }
      } else {
        actCell.innerHTML = '<span class="dash" aria-hidden="true">—</span>';
      }

      row.classList.remove("flash");
      void row.offsetWidth; // restart animation
      row.classList.add("flash");
      updateStats();
    } else {
      refresh();
    }
  }

  function reorder(id, btn) {
    var p = PRODUCTS.find(function (x) { return x.id === id; });
    if (!p || btn.classList.contains("is-done")) return;
    var qty = Math.max(p.par * 2 - p.onHand, p.par);
    btn.classList.add("is-done");
    btn.textContent = "Ordered";
    toast("Reorder placed · " + qty + " × " + p.name + " from", p.supplier);
  }

  /* delegated clicks on the table */
  tbody.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]");
    if (!t) return;
    var action = t.getAttribute("data-action");
    var id = t.getAttribute("data-id");
    if (action === "inc") adjust(id, 1);
    else if (action === "dec") adjust(id, -1);
    else if (action === "reorder") reorder(id, t);
  });

  /* filter tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      state.filter = tab.getAttribute("data-filter");
      render();
    });
  });

  /* search */
  searchInput.addEventListener("input", function () {
    state.query = searchInput.value.trim();
    render();
  });

  /* clear filters from empty state */
  document.getElementById("clearBtn").addEventListener("click", function () {
    state.filter = "all";
    state.query = "";
    searchInput.value = "";
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-filter") === "all";
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    render();
  });

  /* export (toast only — no backend) */
  document.getElementById("exportBtn").addEventListener("click", function () {
    toast("Exported " + PRODUCTS.length + " SKUs to", "inventory.csv");
  });

  /* ============ INIT ============ */
  refresh();
})();
