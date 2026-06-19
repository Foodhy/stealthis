(function () {
  "use strict";

  /** @type {Array<Object>} */
  var PARTS = [
    { sku: "BRK-1042", name: "Ceramic Brake Pads — Front", fits: "Civic / Accord '18–'23", brand: "StopLine", bin: "A-12", price: 48.9, qty: 14, reorder: 6, supplier: "Midstate Auto Supply" },
    { sku: "FLT-0099", name: "Engine Oil Filter (Spin-On)", fits: "Most 4-cyl import", brand: "PureFlow", bin: "B-03", price: 7.25, qty: 3, reorder: 12, supplier: "Pacific Parts Co." },
    { sku: "BAT-7700", name: "Group 35 AGM Battery", fits: "12V · 650 CCA", brand: "VoltCore", bin: "D-21", price: 184.0, qty: 5, reorder: 4, supplier: "Northgate Distributors" },
    { sku: "SPK-3318", name: "Iridium Spark Plug", fits: "Universal · 14mm", brand: "IgnaTek", bin: "A-05", price: 9.6, qty: 0, reorder: 24, supplier: "Pacific Parts Co." },
    { sku: "WPR-2201", name: 'Beam Wiper Blade 24"', fits: "Hook-style arm", brand: "ClearSweep", bin: "C-09", price: 14.75, qty: 22, reorder: 8, supplier: "Midstate Auto Supply" },
    { sku: "ALT-5560", name: "Alternator 130A (Reman)", fits: "F-150 '15–'20", brand: "ReGen", bin: "E-02", price: 219.5, qty: 2, reorder: 2, supplier: "Northgate Distributors" },
    { sku: "TIR-9001", name: "All-Season Tire 215/55R17", fits: "Touring · 94H", brand: "RoadHold", bin: "T-Rack 4", price: 132.0, qty: 16, reorder: 8, supplier: "Summit Tire Wholesale" },
    { sku: "COOL-440", name: "OAT Coolant Concentrate 1gal", fits: "Long-life · orange", brand: "ThermaShield", bin: "F-14", price: 22.4, qty: 9, reorder: 6, supplier: "Pacific Parts Co." },
    { sku: "BLT-1180", name: "Serpentine Belt 6-Rib", fits: "Camry '12–'17", brand: "DriveLink", bin: "B-18", price: 26.9, qty: 1, reorder: 5, supplier: "Midstate Auto Supply" },
    { sku: "ROT-6620", name: "Vented Brake Rotor — Front", fits: "CR-V '17–'22", brand: "StopLine", bin: "A-13", price: 58.0, qty: 8, reorder: 4, supplier: "Midstate Auto Supply" },
    { sku: "CAB-0301", name: "Cabin Air Filter (Carbon)", fits: "Multi-fit · 21×21cm", brand: "PureFlow", bin: "B-06", price: 12.3, qty: 4, reorder: 10, supplier: "Pacific Parts Co." },
    { sku: "SEN-7745", name: "Upstream O2 Sensor", fits: "Sonata '15–'19", brand: "IgnaTek", bin: "E-07", price: 71.0, qty: 0, reorder: 3, supplier: "Northgate Distributors" },
    { sku: "HUB-3340", name: "Wheel Hub Bearing Assembly", fits: "Rogue '14–'20", brand: "AxlePro", bin: "G-01", price: 96.5, qty: 6, reorder: 3, supplier: "Summit Tire Wholesale" },
    { sku: "FUS-0150", name: "Mini Blade Fuse Kit (120pc)", fits: "Assorted amperage", brand: "CircuitMate", bin: "C-22", price: 18.9, qty: 11, reorder: 4, supplier: "Pacific Parts Co." }
  ];

  var state = { filter: "all", query: "" };
  var activeSku = null;

  var rowsEl = document.getElementById("rows");
  var emptyEl = document.getElementById("empty");
  var searchEl = document.getElementById("search");
  var toastsEl = document.getElementById("toasts");

  var fmtMoney = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var fmtMoney0 = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var statusOf = function (p) {
    if (p.qty <= 0) return "out";
    if (p.qty <= p.reorder) return "low";
    return "ok";
  };

  var pillFor = function (s) {
    if (s === "out") return '<span class="pill pill-out">Out of Stock</span>';
    if (s === "low") return '<span class="pill pill-low">Low Stock</span>';
    return '<span class="pill pill-ok">In Stock</span>';
  };

  function matches(p) {
    var s = statusOf(p);
    if (state.filter !== "all" && state.filter !== s) return false;
    var q = state.query.trim().toLowerCase();
    if (!q) return true;
    return (p.sku + " " + p.name + " " + p.brand + " " + p.fits).toLowerCase().indexOf(q) !== -1;
  }

  function render() {
    var visible = PARTS.filter(matches);
    rowsEl.innerHTML = visible.map(rowHtml).join("");
    emptyEl.hidden = visible.length !== 0;
    updateStats();
  }

  function rowHtml(p) {
    var s = statusOf(p);
    var rowClass = s === "out" ? "row-out" : s === "low" ? "row-low" : "";
    var reorder =
      s === "ok"
        ? ""
        : '<button class="reorder-btn" data-reorder="' + p.sku + '" type="button">Reorder</button>';
    return (
      '<tr class="' + rowClass + '" data-sku="' + p.sku + '" tabindex="0" role="button" aria-label="Open detail for ' + esc(p.name) + '">' +
      '<td class="cell-sku tnum">' + esc(p.sku) + "</td>" +
      '<td><span class="cell-name">' + esc(p.name) + '</span><span class="cell-fits hide-sm">' + esc(p.fits) + "</span></td>" +
      '<td class="cell-brand hide-sm">' + esc(p.brand) + "</td>" +
      '<td class="ta-c hide-sm"><span class="cell-bin tnum">' + esc(p.bin) + "</span></td>" +
      '<td class="ta-c cell-qty tnum">' + p.qty + "</td>" +
      '<td class="ta-r cell-price tnum hide-sm">' + fmtMoney(p.price) + "</td>" +
      '<td class="ta-r">' + pillFor(s) + "</td>" +
      '<td class="ta-r"><div class="row-actions">' + reorder + '<button class="icon-btn" data-open="' + p.sku + '" type="button" aria-label="Open detail">›</button></div></td>' +
      "</tr>"
    );
  }

  function updateStats() {
    var total = PARTS.length;
    var units = 0, low = 0, value = 0, out = 0, ok = 0;
    PARTS.forEach(function (p) {
      units += p.qty;
      value += p.qty * p.price;
      var s = statusOf(p);
      if (s === "low") low++;
      else if (s === "out") out++;
      else ok++;
    });
    document.getElementById("statTotal").textContent = total;
    document.getElementById("statUnits").textContent = units.toLocaleString("en-US");
    document.getElementById("statLow").textContent = low + out;
    document.getElementById("statValue").textContent = fmtMoney0(value);
    document.getElementById("cAll").textContent = total;
    document.getElementById("cLow").textContent = low;
    document.getElementById("cOut").textContent = out;
    document.getElementById("cOk").textContent = ok;
  }

  /* ---------- Toast ---------- */
  function toast(title, msg, icon) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="toast-ico" aria-hidden="true">' + (icon || "✓") + "</span>" +
      "<div><strong>" + esc(title) + "</strong><span>" + esc(msg) + "</span></div>";
    toastsEl.appendChild(el);
    setTimeout(function () {
      el.classList.add("toast-out");
      setTimeout(function () { el.remove(); }, 220);
    }, 3600);
  }

  function reorder(sku) {
    var p = find(sku);
    if (!p) return;
    var suggest = Math.max(p.reorder * 2 - p.qty, p.reorder);
    toast(
      "Reorder placed — " + p.sku,
      suggest + " × " + p.brand + " from " + p.supplier,
      "⛟"
    );
  }

  function find(sku) {
    for (var i = 0; i < PARTS.length; i++) if (PARTS[i].sku === sku) return PARTS[i];
    return null;
  }

  /* ---------- Drawer ---------- */
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  var lastFocus = null;

  function openDrawer(sku) {
    var p = find(sku);
    if (!p) return;
    activeSku = sku;
    lastFocus = document.activeElement;
    document.getElementById("dSku").textContent = p.sku;
    document.getElementById("dName").textContent = p.name;
    document.getElementById("dBrand").textContent = p.brand;
    document.getElementById("dBin").textContent = p.bin;
    document.getElementById("dFits").textContent = p.fits;
    document.getElementById("dPrice").textContent = fmtMoney(p.price);
    document.getElementById("dReorder").textContent = p.reorder + " units";
    document.getElementById("dSupplier").textContent = p.supplier;
    document.getElementById("dQty").textContent = p.qty;
    scrim.hidden = false;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.focus();
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    activeSku = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function adjust(sku, delta) {
    var p = find(sku);
    if (!p) return;
    p.qty = Math.max(0, p.qty + delta);
    document.getElementById("dQty").textContent = p.qty;
    render();
  }

  /* ---------- Events ---------- */
  searchEl.addEventListener("input", function () {
    state.query = searchEl.value;
    render();
  });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      state.filter = chip.getAttribute("data-filter");
      render();
    });
  });

  rowsEl.addEventListener("click", function (e) {
    var reBtn = e.target.closest("[data-reorder]");
    if (reBtn) { e.stopPropagation(); reorder(reBtn.getAttribute("data-reorder")); return; }
    var openBtn = e.target.closest("[data-open]");
    if (openBtn) { e.stopPropagation(); openDrawer(openBtn.getAttribute("data-open")); return; }
    var row = e.target.closest("tr[data-sku]");
    if (row) openDrawer(row.getAttribute("data-sku"));
  });

  rowsEl.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var row = e.target.closest("tr[data-sku]");
    if (row && e.target === row) {
      e.preventDefault();
      openDrawer(row.getAttribute("data-sku"));
    }
  });

  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeSku) closeDrawer();
  });

  drawer.querySelectorAll(".step").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (activeSku) adjust(activeSku, parseInt(btn.getAttribute("data-step"), 10));
    });
  });

  document.getElementById("dReorderBtn").addEventListener("click", function () {
    if (activeSku) reorder(activeSku);
  });

  document.getElementById("exportBtn").addEventListener("click", function () {
    toast("Inventory exported", PARTS.length + " SKUs written to parts-eastside.csv", "⬇");
  });

  render();
})();
