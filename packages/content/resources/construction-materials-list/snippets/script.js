(function () {
  "use strict";

  /** Demo inventory — illustrative data only. */
  var MATERIALS = [
    { sku: "LMB-2410", name: '2"x4"x8 KD Stud SPF', category: "Lumber", qty: 420, unit: "ea", reorder: 250, supplier: "Cascade Forest Products" },
    { sku: "LMB-3458", name: '3/4" OSB Sheathing 4x8', category: "Lumber", qty: 38, unit: "sheet", reorder: 60, supplier: "Cascade Forest Products" },
    { sku: "CON-0501", name: "Portland Cement Type I/II 94lb", category: "Concrete", qty: 12, unit: "bag", reorder: 40, supplier: "Granite State Supply" },
    { sku: "CON-0518", name: "Ready-Mix 5000psi", category: "Concrete", qty: 0, unit: "yd³", reorder: 6, supplier: "Granite State Supply" },
    { sku: "REB-0040", name: "#4 Rebar Grade 60 20ft", category: "Concrete", qty: 86, unit: "ea", reorder: 50, supplier: "Ironclad Steel & Rebar" },
    { sku: "FST-1625", name: '3" Exterior Deck Screw (5lb)', category: "Fasteners", qty: 7, unit: "box", reorder: 15, supplier: "Bolt & Bracket Co." },
    { sku: "FST-1208", name: '16d Galv. Framing Nail (50lb)', category: "Fasteners", qty: 4, unit: "box", reorder: 10, supplier: "Bolt & Bracket Co." },
    { sku: "FST-0904", name: '1/2" x 8 Anchor Bolt Galv.', category: "Fasteners", qty: 240, unit: "ea", reorder: 100, supplier: "Bolt & Bracket Co." },
    { sku: "DRY-1258", name: '1/2" Drywall 4x8 Std', category: "Drywall", qty: 64, unit: "sheet", reorder: 80, supplier: "Summit Building Center" },
    { sku: "DRY-1305", name: 'Joint Compound 4.5gal', category: "Drywall", qty: 9, unit: "pail", reorder: 12, supplier: "Summit Building Center" },
    { sku: "INS-0902", name: "R-13 Fiberglass Batt 15in", category: "Insulation", qty: 18, unit: "roll", reorder: 20, supplier: "Summit Building Center" },
    { sku: "ELC-2204", name: '12/2 NM-B Romex 250ft', category: "Electrical", qty: 11, unit: "coil", reorder: 8, supplier: "Voltline Distributors" },
    { sku: "ELC-2380", name: '3/4" EMT Conduit 10ft', category: "Electrical", qty: 5, unit: "ea", reorder: 24, supplier: "Voltline Distributors" },
    { sku: "PLM-3140", name: '3/4" PEX-A Tubing 100ft', category: "Plumbing", qty: 22, unit: "coil", reorder: 10, supplier: "Cascade Plumbing Wholesale" },
    { sku: "PLM-3266", name: '4" PVC DWV Pipe 10ft', category: "Plumbing", qty: 14, unit: "ea", reorder: 16, supplier: "Cascade Plumbing Wholesale" },
    { sku: "PNT-5012", name: "Exterior Acrylic Primer 5gal", category: "Paint", qty: 6, unit: "pail", reorder: 6, supplier: "Truecolor Paint Supply" },
    { sku: "SFT-7701", name: "Hi-Vis Class 2 Vest XL", category: "Safety", qty: 27, unit: "ea", reorder: 20, supplier: "Guardline Safety Gear" },
    { sku: "SFT-7745", name: "Hard Hat Type I White", category: "Safety", qty: 8, unit: "ea", reorder: 15, supplier: "Guardline Safety Gear" }
  ];

  var rowsEl = document.getElementById("rows");
  var emptyEl = document.getElementById("empty");
  var searchEl = document.getElementById("search");
  var categoryEl = document.getElementById("category");
  var orderOnlyEl = document.getElementById("orderOnly");
  var shortfallCountEl = document.getElementById("shortfallCount");
  var shortfallQtyEl = document.getElementById("shortfallQty");
  var totalCountEl = document.getElementById("totalCount");

  function statusOf(m) {
    if (m.qty <= 0) return "out";
    if (m.qty <= m.reorder) return "low";
    return "ok";
  }

  var STATUS_TEXT = { ok: "Stocked", low: "Low", out: "Out" };

  function buildCategories() {
    var seen = {};
    MATERIALS.forEach(function (m) { seen[m.category] = true; });
    Object.keys(seen).sort().forEach(function (cat) {
      var opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryEl.appendChild(opt);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function rowHtml(m) {
    var st = statusOf(m);
    return (
      '<tr class="' + (st === "ok" ? "" : "is-" + st) + '">' +
      '<td><span class="sku">' + escapeHtml(m.sku) + "</span></td>" +
      '<td class="matname">' + escapeHtml(m.name) + "</td>" +
      '<td><span class="tag">' + escapeHtml(m.category) + "</span></td>" +
      '<td class="num"><span class="qty">' + m.qty + '</span> <span class="unit">' + escapeHtml(m.unit) + "</span></td>" +
      '<td class="num">' + m.reorder + "</td>" +
      '<td class="supplier">' + escapeHtml(m.supplier) + "</td>" +
      '<td><span class="badge badge--' + st + '">' + STATUS_TEXT[st] + "</span></td>" +
      "</tr>"
    );
  }

  function render() {
    var q = searchEl.value.trim().toLowerCase();
    var cat = categoryEl.value;
    var orderOnly = orderOnlyEl.checked;

    var visible = MATERIALS.filter(function (m) {
      if (cat !== "all" && m.category !== cat) return false;
      if (orderOnly && statusOf(m) === "ok") return false;
      if (q) {
        var hay = (m.sku + " " + m.name + " " + m.supplier).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    rowsEl.innerHTML = visible.map(rowHtml).join("");
    emptyEl.hidden = visible.length > 0;

    // Order-needed summary (always over the full dataset).
    var shortCount = 0;
    var shortQty = 0;
    MATERIALS.forEach(function (m) {
      if (statusOf(m) !== "ok") {
        shortCount += 1;
        var need = m.reorder - m.qty;
        if (need > 0) shortQty += need;
      }
    });
    shortfallCountEl.textContent = shortCount;
    shortfallQtyEl.textContent = shortQty;
    totalCountEl.textContent = MATERIALS.length;
  }

  buildCategories();
  searchEl.addEventListener("input", render);
  categoryEl.addEventListener("change", render);
  orderOnlyEl.addEventListener("change", render);
  render();
})();
