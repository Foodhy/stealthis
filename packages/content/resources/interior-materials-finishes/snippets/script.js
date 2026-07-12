/* Materials & Finishes selector — vanilla JS, no dependencies */
(function () {
  "use strict";

  var MAX = 6;

  // Each swatch: css = the rendered sample surface, color = flat tone for palette/tray dot.
  var MATERIALS = [
    { id: "walnut-oiled", family: "wood", name: "Oiled American Walnut", code: "WD-101", finish: "Hard-wax oil, matte", origin: "Ohio, USA", use: "Cabinetry & flooring", price: 3, color: "#5c4433",
      css: "linear-gradient(115deg,#6b4e39,#4c3626 60%,#5c4433),repeating-linear-gradient(92deg,rgba(0,0,0,.12) 0 2px,transparent 2px 9px)" },
    { id: "white-oak", family: "wood", name: "Rift White Oak", code: "WD-118", finish: "UV lacquer, satin", origin: "Vermont, USA", use: "Joinery & panelling", price: 3, color: "#c9a878",
      css: "linear-gradient(100deg,#d8bd97,#c2a074 55%,#cdae82),repeating-linear-gradient(90deg,rgba(120,86,52,.16) 0 1px,transparent 1px 7px)" },
    { id: "smoked-ash", family: "wood", name: "Fumed European Ash", code: "WD-124", finish: "Brushed, natural wax", origin: "Loire, FR", use: "Feature veneer", price: 4, color: "#7a6a58",
      css: "linear-gradient(110deg,#8c7a64,#655645 60%,#7d6c58),repeating-linear-gradient(88deg,rgba(0,0,0,.14) 0 2px,transparent 2px 11px)" },

    { id: "travertine", family: "stone", name: "Roman Travertine", code: "ST-204", finish: "Honed, unfilled", origin: "Tivoli, IT", use: "Vanity & wall cladding", price: 4, color: "#d8c9ac",
      css: "radial-gradient(circle at 30% 30%,#e7dcc4,#d3c3a3),repeating-linear-gradient(0deg,rgba(150,130,96,.18) 0 1px,transparent 1px 6px)" },
    { id: "calacatta", family: "stone", name: "Calacatta Viola", code: "ST-211", finish: "Polished slab", origin: "Carrara, IT", use: "Statement counters", price: 5, color: "#efe9e2",
      css: "linear-gradient(135deg,#f5f1ea,#e9e2d8),linear-gradient(58deg,transparent 46%,rgba(140,90,80,.5) 47% 49%,transparent 50%),linear-gradient(24deg,transparent 62%,rgba(90,70,90,.35) 63% 64%,transparent 65%)" },
    { id: "basalt", family: "stone", name: "Flamed Basalt", code: "ST-227", finish: "Flamed, textured", origin: "Auvergne, FR", use: "Flooring & hearth", price: 3, color: "#4a4744",
      css: "radial-gradient(circle at 60% 40%,#5a5652,#3c3936),repeating-radial-gradient(circle at 30% 70%,rgba(0,0,0,.25) 0 2px,transparent 2px 5px)" },

    { id: "boucle", family: "textile", name: "Ivory Wool Bouclé", code: "TX-302", finish: "Loop pile, 92k rubs", origin: "Yorkshire, UK", use: "Upholstery", price: 4, color: "#eae2d2",
      css: "radial-gradient(circle at 20% 25%,#fff 0 2px,transparent 2px),radial-gradient(circle at 70% 60%,#fff 0 2px,transparent 2px),radial-gradient(circle at 45% 85%,#fff 0 1.5px,transparent 2px),#e6ddca" },
    { id: "linen", family: "textile", name: "Washed Belgian Linen", code: "TX-315", finish: "Stonewashed, plain", origin: "Kortrijk, BE", use: "Drapery & cushions", price: 2, color: "#c8b59a",
      css: "repeating-linear-gradient(90deg,#cdba9d 0 2px,#c0ac8d 2px 4px),repeating-linear-gradient(0deg,rgba(120,100,70,.12) 0 2px,transparent 2px 4px)" },
    { id: "velvet", family: "textile", name: "Sage Cotton Velvet", code: "TX-329", finish: "Plush pile, matte", origin: "Como, IT", use: "Occasional seating", price: 4, color: "#9caf88",
      css: "linear-gradient(115deg,#a8ba95,#8ba077 55%,#9caf88),repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0 3px,transparent 3px 8px)" },

    { id: "brass", family: "metal", name: "Brushed Brass", code: "MT-401", finish: "Satin, lacquered", origin: "Sheffield, UK", use: "Hardware & trim", price: 3, color: "#b89a5e",
      css: "linear-gradient(100deg,#d8bd7f,#a9894f 55%,#c7a86a),repeating-linear-gradient(100deg,rgba(255,255,255,.25) 0 1px,transparent 1px 5px)" },
    { id: "blackened-steel", family: "metal", name: "Blackened Steel", code: "MT-414", finish: "Waxed patina", origin: "Pittsburgh, USA", use: "Framing & shelving", price: 3, color: "#33312e",
      css: "linear-gradient(120deg,#44413c,#2a2825 60%,#38352f),repeating-linear-gradient(120deg,rgba(255,255,255,.06) 0 1px,transparent 1px 6px)" },
    { id: "aged-copper", family: "metal", name: "Aged Copper", code: "MT-426", finish: "Living finish", origin: "Santa Fe, USA", use: "Accents & lighting", price: 4, color: "#9a6b4f",
      css: "linear-gradient(120deg,#b07a57,#7e5238 55%,#a86e4d),radial-gradient(circle at 65% 35%,rgba(120,160,140,.4) 0 12%,transparent 40%)" }
  ];

  var FAMILY_LABEL = { wood: "Wood", stone: "Stone", textile: "Textile", metal: "Metal" };

  var grid = document.getElementById("grid");
  var countEl = document.getElementById("count");
  var detail = document.getElementById("detail");
  var trayList = document.getElementById("trayList");
  var trayCount = document.getElementById("trayCount");
  var trayHint = document.getElementById("trayHint");
  var palette = document.getElementById("palette");
  var toastEl = document.getElementById("toast");

  var selected = [];        // array of material ids in tray
  var activeId = null;      // id shown in detail
  var currentFilter = "all";
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2000);
  }

  function byId(id) {
    for (var i = 0; i < MATERIALS.length; i++) if (MATERIALS[i].id === id) return MATERIALS[i];
    return null;
  }

  function priceBand(n) {
    var out = '<span class="price-band" aria-label="Price band ' + n + ' of 5">';
    for (var i = 1; i <= 5; i++) out += '<span class="' + (i <= n ? "on" : "") + '"></span>';
    return out + "</span>";
  }

  /* ---- Grid ---- */
  function renderGrid() {
    grid.innerHTML = "";
    var visible = 0;
    MATERIALS.forEach(function (m) {
      if (currentFilter !== "all" && m.family !== currentFilter) return;
      visible++;
      var btn = document.createElement("button");
      btn.className = "swatch" + (selected.indexOf(m.id) !== -1 ? " is-selected" : "");
      btn.type = "button";
      btn.setAttribute("aria-pressed", activeId === m.id ? "true" : "false");
      btn.setAttribute("data-id", m.id);
      btn.innerHTML =
        '<span class="swatch__sample" style="background:' + m.css + '"></span>' +
        '<span class="swatch__body">' +
          '<span class="swatch__fam">' + FAMILY_LABEL[m.family] + "</span>" +
          '<span class="swatch__name">' + m.name + "</span>" +
        "</span>";
      btn.addEventListener("click", function () { showDetail(m.id); });
      grid.appendChild(btn);
    });
    countEl.textContent = visible + (visible === 1 ? " finish" : " finishes");
  }

  /* ---- Detail ---- */
  function showDetail(id) {
    var m = byId(id);
    if (!m) return;
    activeId = id;
    var inTray = selected.indexOf(id) !== -1;
    detail.innerHTML =
      '<div class="detail__sample" style="background:' + m.css + '">' +
        '<span class="tag">' + FAMILY_LABEL[m.family] + "</span>" +
      "</div>" +
      '<div class="detail__inner">' +
        '<h2 class="detail__name">' + m.name + "</h2>" +
        '<p class="detail__code">' + m.code + "</p>" +
        '<ul class="spec">' +
          specRow("Finish", m.finish) +
          specRow("Origin", m.origin) +
          specRow("Application", m.use) +
          '<li><span class="k">Price band</span><span class="v">' + priceBand(m.price) + "</span></li>" +
        "</ul>" +
        '<button class="detail__add" type="button" id="addBtn"' + (inTray ? " disabled" : "") + ">" +
          (inTray ? "Already in tray" : "Add to selection tray") +
        "</button>" +
      "</div>";
    var addBtn = document.getElementById("addBtn");
    if (addBtn && !inTray) addBtn.addEventListener("click", function () { addToTray(id); });
    // reflect pressed state in grid
    var tiles = grid.querySelectorAll(".swatch");
    tiles.forEach(function (t) {
      t.setAttribute("aria-pressed", t.getAttribute("data-id") === id ? "true" : "false");
    });
  }

  function specRow(k, v) {
    return '<li><span class="k">' + k + '</span><span class="v">' + v + "</span></li>";
  }

  /* ---- Tray ---- */
  function addToTray(id) {
    if (selected.indexOf(id) !== -1) return;
    if (selected.length >= MAX) { toast("Tray is full — remove one to add another"); return; }
    selected.push(id);
    var m = byId(id);
    toast(m.name + " added to tray");
    renderTray();
    renderGrid();
    if (activeId === id) showDetail(id); // refresh add button state
  }

  function removeFromTray(id) {
    var i = selected.indexOf(id);
    if (i === -1) return;
    selected.splice(i, 1);
    renderTray();
    renderGrid();
    if (activeId === id) showDetail(id);
    toast("Removed from tray");
  }

  function renderTray() {
    trayCount.textContent = String(selected.length);
    trayList.innerHTML = "";

    if (!selected.length) {
      trayHint.textContent = "Nothing selected yet — add up to six materials to compose a scheme.";
    } else {
      trayHint.textContent = selected.length + " of " + MAX + " materials in scheme.";
    }

    selected.forEach(function (id) {
      var m = byId(id);
      var li = document.createElement("li");
      li.className = "tray__item";
      li.innerHTML =
        '<span class="tray__dot" style="background:' + m.color + '"></span>' +
        '<span class="tray__meta">' +
          '<span class="tray__nm">' + m.name + "</span>" +
          '<span class="tray__fam">' + FAMILY_LABEL[m.family] + " · " + m.code + "</span>" +
        "</span>" +
        '<button class="tray__rm" type="button" aria-label="Remove ' + m.name + '">&times;</button>';
      li.querySelector(".tray__rm").addEventListener("click", function () { removeFromTray(id); });
      trayList.appendChild(li);
    });

    renderPalette();
  }

  function renderPalette() {
    palette.innerHTML = "";
    if (!selected.length) return;
    selected.forEach(function (id) {
      var m = byId(id);
      var seg = document.createElement("span");
      seg.className = "palette__seg";
      seg.style.background = m.color;
      seg.title = m.name;
      palette.appendChild(seg);
    });
  }

  /* ---- Actions ---- */
  document.getElementById("clearBtn").addEventListener("click", function () {
    if (!selected.length) { toast("Tray is already empty"); return; }
    selected = [];
    renderTray();
    renderGrid();
    if (activeId) showDetail(activeId);
    toast("Selection cleared");
  });

  document.getElementById("copyBtn").addEventListener("click", function () {
    if (!selected.length) { toast("Add materials before copying"); return; }
    var lines = ["Material & finishes schedule — Studio Larkspur", ""];
    selected.forEach(function (id, i) {
      var m = byId(id);
      lines.push((i + 1) + ". " + m.name + " (" + m.code + ")");
      lines.push("   " + FAMILY_LABEL[m.family] + " · " + m.finish + " · " + m.origin);
    });
    var text = lines.join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast("Scheme copied to clipboard"); },
        function () { toast("Copy failed — select and copy manually"); }
      );
    } else {
      toast("Clipboard unavailable in this view");
    }
  });

  /* ---- Filters ---- */
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-selected", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      currentFilter = chip.getAttribute("data-filter");
      renderGrid();
    });
  });

  /* ---- Init ---- */
  renderGrid();
  renderTray();
})();
