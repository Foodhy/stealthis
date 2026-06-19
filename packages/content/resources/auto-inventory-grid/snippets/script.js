(function () {
  "use strict";

  // ---------- Data (fictional inventory) ----------
  var VEHICLES = [
    { id: "v1", year: 2022, make: "Ford", model: "F-150 XLT", trim: "4WD · SuperCrew · 3.5L EcoBoost", body: "Truck", fuel: "Gas", price: 41980, msrp: 44900, miles: 28450, vin: "1FTFW1E84NK", plate: "8XT 4192", g1: "#2a3b4f", g2: "#4d6480", badges: ["Certified"], feat: 9 },
    { id: "v2", year: 2021, make: "Tesla", model: "Model 3", trim: "Long Range · Dual Motor AWD", body: "Sedan", fuel: "Electric", price: 33450, msrp: 33450, miles: 31200, vin: "5YJ3E1EB6MF", plate: "ELC 220", g1: "#1f2a44", g2: "#3a4f7a", badges: ["Hot deal"], feat: 8 },
    { id: "v3", year: 2020, make: "Toyota", model: "RAV4 LE", trim: "AWD · 2.5L · 8-Spd Auto", body: "SUV", fuel: "Gas", price: 24990, msrp: 27100, miles: 49870, vin: "2T3F1RFV4LC", plate: "7RV 901", g1: "#3a2f24", g2: "#6b5238", badges: ["Reduced"], feat: 6 },
    { id: "v4", year: 2023, make: "Honda", model: "Civic Sport", trim: "FWD · 2.0L · CVT", body: "Sedan", fuel: "Gas", price: 27340, msrp: 27340, miles: 12100, vin: "2HGFE2F58PH", plate: "9CV 778", g1: "#27343a", g2: "#46606a", badges: ["Certified"], feat: 7 },
    { id: "v5", year: 2019, make: "Chevrolet", model: "Silverado LT", trim: "4WD · 5.3L V8 · Crew Cab", body: "Truck", fuel: "Gas", price: 32600, msrp: 36500, miles: 64300, vin: "3GCUYDED9KG", plate: "5SL 330", g1: "#33231f", g2: "#5e3d33", badges: ["Reduced"], feat: 5 },
    { id: "v6", year: 2022, make: "Hyundai", model: "Ioniq 5 SEL", trim: "RWD · 77.4 kWh", body: "SUV", fuel: "Electric", price: 38900, msrp: 41200, miles: 19600, vin: "KM8KNDAF0NU", plate: "ION 5XX", g1: "#1e3340", g2: "#386076", badges: ["Hot deal", "Certified"], feat: 8 },
    { id: "v7", year: 2018, make: "Toyota", model: "Camry SE", trim: "FWD · 2.5L · 8-Spd Auto", body: "Sedan", fuel: "Gas", price: 18750, msrp: 18750, miles: 78400, vin: "4T1B11HK2JU", plate: "2CM 614", g1: "#2c2c34", g2: "#4d4d5c", badges: [], feat: 4 },
    { id: "v8", year: 2021, make: "Ford", model: "Escape SE", trim: "AWD · 1.5L Hybrid", body: "SUV", fuel: "Hybrid", price: 26450, msrp: 28000, miles: 41200, vin: "1FMCU9G63MU", plate: "6ES 207", g1: "#243a34", g2: "#3f6b5b", badges: ["Reduced"], feat: 6 },
    { id: "v9", year: 2023, make: "Tesla", model: "Model Y", trim: "Long Range · AWD", body: "SUV", fuel: "Electric", price: 46900, msrp: 46900, miles: 9800, vin: "7SAYGDEE8PF", plate: "MDY 023", g1: "#1c2740", g2: "#34487a", badges: ["Hot deal"], feat: 9 },
    { id: "v10", year: 2017, make: "Honda", model: "CR-V EX", trim: "AWD · 1.5L Turbo", body: "SUV", fuel: "Gas", price: 19980, msrp: 19980, miles: 92600, vin: "2HKRW2H56HH", plate: "1CR 845", g1: "#2e2a26", g2: "#54493f", badges: [], feat: 3 },
    { id: "v11", year: 2020, make: "Chevrolet", model: "Bolt EV LT", trim: "FWD · 66 kWh", body: "Sedan", fuel: "Electric", price: 17900, msrp: 21500, miles: 38900, vin: "1G1FY6S07L4", plate: "BLT 100", g1: "#1f3a3a", g2: "#357070", badges: ["Reduced"], feat: 5 },
    { id: "v12", year: 2022, make: "Hyundai", model: "Tucson SEL", trim: "AWD · 2.5L · 8-Spd Auto", body: "SUV", fuel: "Gas", price: 28700, msrp: 30100, miles: 24300, vin: "5NMJBCAE5NH", plate: "TUC 552", g1: "#2a3340", g2: "#465a72", badges: ["Certified"], feat: 7 }
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var fmtMoney = function (n) { return "$" + n.toLocaleString("en-US"); };
  var fmtMiles = function (n) { return n.toLocaleString("en-US") + " mi"; };

  var state = {
    q: "",
    makes: new Set(),
    bodies: new Set(),
    fuels: new Set(),
    yearMin: null,
    yearMax: null,
    maxPrice: 80000,
    maxMiles: 150000,
    sort: "featured",
    saved: new Set(),
    compare: new Set()
  };

  var grid = $("#grid");
  var empty = $("#empty");

  // ---------- Toast ----------
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // ---------- Build filters ----------
  function uniq(key) {
    var seen = {}, out = [];
    VEHICLES.forEach(function (v) { if (!seen[v[key]]) { seen[v[key]] = 1; out.push(v[key]); } });
    return out.sort();
  }

  function buildChips(containerId, values, set) {
    var c = $("#" + containerId);
    values.forEach(function (val) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = val;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        if (set.has(val)) { set.delete(val); b.setAttribute("aria-pressed", "false"); }
        else { set.add(val); b.setAttribute("aria-pressed", "true"); }
        render();
      });
      c.appendChild(b);
    });
  }

  buildChips("makeFilters", uniq("make"), state.makes);
  buildChips("bodyFilters", uniq("body"), state.bodies);
  buildChips("fuelFilters", uniq("fuel"), state.fuels);

  // year selects
  var years = VEHICLES.map(function (v) { return v.year; });
  var minY = Math.min.apply(null, years), maxY = Math.max.apply(null, years);
  var ySelMin = $("#yearMin"), ySelMax = $("#yearMax");
  for (var y = maxY; y >= minY; y--) {
    var o1 = document.createElement("option"); o1.value = y; o1.textContent = y; ySelMin.appendChild(o1);
    var o2 = document.createElement("option"); o2.value = y; o2.textContent = y; ySelMax.appendChild(o2);
  }
  ySelMin.value = minY; ySelMax.value = maxY;
  state.yearMin = minY; state.yearMax = maxY;

  // ---------- Inputs ----------
  $("#search").addEventListener("input", function (e) { state.q = e.target.value.trim().toLowerCase(); render(); });
  $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  ySelMin.addEventListener("change", function (e) { state.yearMin = +e.target.value; render(); });
  ySelMax.addEventListener("change", function (e) { state.yearMax = +e.target.value; render(); });

  var priceRange = $("#priceRange"), priceVal = $("#priceVal");
  priceRange.addEventListener("input", function (e) {
    state.maxPrice = +e.target.value;
    priceVal.textContent = state.maxPrice >= 80000 ? "$80,000+" : fmtMoney(state.maxPrice);
    render();
  });
  var mileRange = $("#mileRange"), mileVal = $("#mileVal");
  mileRange.addEventListener("input", function (e) {
    state.maxMiles = +e.target.value;
    mileVal.textContent = state.maxMiles >= 150000 ? "150,000+ mi" : fmtMiles(state.maxMiles);
    render();
  });

  function resetAll() {
    state.q = ""; $("#search").value = "";
    state.makes.clear(); state.bodies.clear(); state.fuels.clear();
    state.maxPrice = 80000; priceRange.value = 80000; priceVal.textContent = "$80,000+";
    state.maxMiles = 150000; mileRange.value = 150000; mileVal.textContent = "150,000+ mi";
    state.yearMin = minY; state.yearMax = maxY; ySelMin.value = minY; ySelMax.value = maxY;
    document.querySelectorAll(".chip[aria-pressed='true']").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    render();
    toast("Filters reset");
  }
  $("#resetBtn").addEventListener("click", resetAll);
  $("#emptyReset").addEventListener("click", resetAll);

  // mobile filter toggle
  var rail = $("#rail"), filterToggle = $("#filterToggle");
  filterToggle.addEventListener("click", function () {
    var open = rail.classList.toggle("open");
    filterToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ---------- Filter + sort ----------
  function filtered() {
    var list = VEHICLES.filter(function (v) {
      if (state.makes.size && !state.makes.has(v.make)) return false;
      if (state.bodies.size && !state.bodies.has(v.body)) return false;
      if (state.fuels.size && !state.fuels.has(v.fuel)) return false;
      if (v.year < state.yearMin || v.year > state.yearMax) return false;
      if (v.price > state.maxPrice) return false;
      if (v.miles > state.maxMiles) return false;
      if (state.q) {
        var hay = (v.year + " " + v.make + " " + v.model + " " + v.trim + " " + v.vin + " " + v.plate + " " + v.body + " " + v.fuel).toLowerCase();
        if (hay.indexOf(state.q) === -1) return false;
      }
      return true;
    });
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === "price-asc") return a.price - b.price;
      if (s === "price-desc") return b.price - a.price;
      if (s === "mile-asc") return a.miles - b.miles;
      if (s === "year-desc") return b.year - a.year || a.miles - b.miles;
      return b.feat - a.feat || a.price - b.price; // featured
    });
    return list;
  }

  // ---------- Card ----------
  function badgeMarkup(v) {
    return v.badges.map(function (b) {
      var cls = b === "Hot deal" ? "hot" : b === "Certified" ? "cert" : b === "Reduced" ? "reduced" : "";
      return '<span class="badge ' + cls + '">' + b + "</span>";
    }).join("");
  }

  var heartPath = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2 5 5.2 5c2 0 3.3 1.1 4 2.2C9.9 6.1 11.2 5 13.2 5 16.4 5 18 8.4 16.3 11.7 13.8 16.4 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  function cardMarkup(v) {
    var saved = state.saved.has(v.id);
    var inCmp = state.compare.has(v.id);
    var reduced = v.price < v.msrp;
    return '' +
      '<article class="card" data-id="' + v.id + '" style="--g1:' + v.g1 + ';--g2:' + v.g2 + '">' +
        '<div class="photo" style="--g1:' + v.g1 + ';--g2:' + v.g2 + '">' +
          '<button class="save-toggle" type="button" aria-pressed="' + saved + '" aria-label="Save vehicle" data-save>' + heartPath + '</button>' +
          '<div class="photo-badges">' + badgeMarkup(v) + '</div>' +
          '<span class="vin-strip tnum">' + v.body.toUpperCase() + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3 class="card-title"><span class="yr">' + v.year + '</span> ' + v.make + " " + v.model + '</h3>' +
          '<p class="card-trim">' + v.trim + '</p>' +
          '<div class="spec-row">' +
            '<span class="spec tnum"><b>' + fmtMiles(v.miles) + '</b></span>' +
            '<span class="spec">' + v.fuel + '</span>' +
            '<span class="spec">' + v.body + '</span>' +
          '</div>' +
          '<div class="price-row">' +
            '<div class="price tnum">' + (reduced ? '<s>' + fmtMoney(v.msrp) + '</s>' : '') + fmtMoney(v.price) + '</div>' +
            '<button class="quick-btn" type="button" data-quick>Quick view</button>' +
          '</div>' +
          '<label class="compare-check"><input type="checkbox" data-compare ' + (inCmp ? "checked" : "") + '> Compare</label>' +
        '</div>' +
      '</article>';
  }

  function render() {
    var list = filtered();
    $("#count").textContent = list.length;
    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      grid.innerHTML = list.map(cardMarkup).join("");
    }
    syncCompareUI();
  }

  // ---------- Card events (delegated) ----------
  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".card");
    if (!card) return;
    var v = byId(card.getAttribute("data-id"));
    if (e.target.closest("[data-save]")) {
      var btn = e.target.closest("[data-save]");
      if (state.saved.has(v.id)) { state.saved.delete(v.id); btn.setAttribute("aria-pressed", "false"); toast("Removed from saved"); }
      else { state.saved.add(v.id); btn.setAttribute("aria-pressed", "true"); toast("Saved " + v.year + " " + v.make + " " + v.model); }
      return;
    }
    if (e.target.closest("[data-quick]")) { openQuick(v); }
  });

  grid.addEventListener("change", function (e) {
    if (!e.target.matches("[data-compare]")) return;
    var card = e.target.closest(".card");
    var v = byId(card.getAttribute("data-id"));
    toggleCompare(v, e.target.checked);
  });

  function byId(id) { for (var i = 0; i < VEHICLES.length; i++) if (VEHICLES[i].id === id) return VEHICLES[i]; }

  // ---------- Compare ----------
  function toggleCompare(v, on) {
    if (on) {
      if (state.compare.size >= 3) {
        toast("Compare up to 3 vehicles");
        var cb = document.querySelector('.card[data-id="' + v.id + '"] [data-compare]');
        if (cb) cb.checked = false;
        return;
      }
      state.compare.add(v.id);
    } else {
      state.compare.delete(v.id);
    }
    syncCompareUI();
  }

  function syncCompareUI() {
    var n = state.compare.size;
    $("#compareCount").textContent = n;
    var tray = $("#compareTray"), inner = $("#trayInner");
    if (!n) { tray.hidden = true; inner.innerHTML = ""; return; }
    tray.hidden = false;
    inner.innerHTML = Array.from(state.compare).map(function (id) {
      var v = byId(id);
      return '<div class="tray-item">' +
        '<div class="tray-thumb" style="--g1:' + v.g1 + ';--g2:' + v.g2 + '"></div>' +
        '<div class="tray-meta"><strong>' + v.make + " " + v.model + '</strong><span class="tnum">' + v.year + " · " + fmtMoney(v.price) + '</span></div>' +
        '<button class="tray-x" type="button" data-remove="' + id + '" aria-label="Remove">&times;</button>' +
        '</div>';
    }).join("");
  }

  $("#trayInner").addEventListener("click", function (e) {
    var rm = e.target.closest("[data-remove]");
    if (!rm) return;
    var id = rm.getAttribute("data-remove");
    state.compare.delete(id);
    var cb = document.querySelector('.card[data-id="' + id + '"] [data-compare]');
    if (cb) cb.checked = false;
    syncCompareUI();
  });

  $("#compareBtn").addEventListener("click", openCompare);
  $("#trayView").addEventListener("click", openCompare);

  function openCompare() {
    if (state.compare.size < 2) { toast("Pick at least 2 vehicles to compare"); return; }
    var vs = Array.from(state.compare).map(byId);
    var minP = Math.min.apply(null, vs.map(function (v) { return v.price; }));
    var minM = Math.min.apply(null, vs.map(function (v) { return v.miles; }));
    var maxYr = Math.max.apply(null, vs.map(function (v) { return v.year; }));

    var rows = [
      { label: "Price", get: function (v) { return fmtMoney(v.price); }, best: function (v) { return v.price === minP; } },
      { label: "Mileage", get: function (v) { return fmtMiles(v.miles); }, best: function (v) { return v.miles === minM; } },
      { label: "Year", get: function (v) { return String(v.year); }, best: function (v) { return v.year === maxYr; } },
      { label: "Body", get: function (v) { return v.body; } },
      { label: "Fuel", get: function (v) { return v.fuel; } },
      { label: "Drivetrain", get: function (v) { return v.trim; } },
      { label: "VIN", get: function (v) { return v.vin + "…"; } }
    ];

    var head = '<tr><th></th>' + vs.map(function (v) {
      return '<th><div class="cmp-thumb" style="--g1:' + v.g1 + ';--g2:' + v.g2 + '"></div><div class="veh-head">' + v.make + " " + v.model + '<small>' + v.year + " · " + v.trim + '</small></div></th>';
    }).join("") + "</tr>";

    var body = rows.map(function (r) {
      return "<tr><td class=\"rowlabel\">" + r.label + "</td>" + vs.map(function (v) {
        var best = r.best && r.best(v) ? " best" : "";
        return '<td class="val' + best + '">' + r.get(v) + (best ? " ✓" : "") + "</td>";
      }).join("") + "</tr>";
    }).join("");

    $("#cmpCard").innerHTML =
      '<div class="cmp-head"><h3 id="cmpTitle">Compare ' + vs.length + ' vehicles</h3>' +
      '<button class="qv-close" type="button" data-close style="position:static">&times;</button></div>' +
      '<div class="cmp-scroll"><table class="cmp-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
    showModal("#compareModal");
  }

  // ---------- Quick view ----------
  function openQuick(v) {
    var reduced = v.price < v.msrp;
    $("#qvCard").innerHTML =
      '<div class="qv-photo" style="--g1:' + v.g1 + ';--g2:' + v.g2 + '">' +
        '<button class="qv-close" type="button" data-close aria-label="Close">&times;</button>' +
        '<div class="photo-badges">' + badgeMarkup(v) + '</div>' +
      '</div>' +
      '<div class="qv-body">' +
        '<h3 id="qvTitle"><span class="yr">' + v.year + '</span> ' + v.make + " " + v.model + '</h3>' +
        '<p class="qv-trim">' + v.trim + '</p>' +
        '<div class="qv-price tnum">' + (reduced ? '<s style="font-size:15px;color:var(--muted);font-weight:600;margin-right:8px;">' + fmtMoney(v.msrp) + '</s>' : '') + fmtMoney(v.price) + '</div>' +
        '<div class="qv-grid">' +
          cell("Mileage", fmtMiles(v.miles)) +
          cell("Body / Fuel", v.body + " · " + v.fuel) +
          cell("VIN", v.vin + "…") +
          cell("Plate", v.plate) +
        '</div>' +
        '<div class="qv-actions">' +
          '<button class="btn btn-primary" type="button" data-qsave>' + (state.saved.has(v.id) ? "Saved ✓" : "Save vehicle") + '</button>' +
          '<button class="btn btn-ghost" type="button" data-close style="background:var(--bg);color:var(--ink);border-color:var(--line-2)">Close</button>' +
        '</div>' +
      '</div>';
    var qsave = $("#qvCard").querySelector("[data-qsave]");
    qsave.addEventListener("click", function () {
      if (state.saved.has(v.id)) { state.saved.delete(v.id); qsave.textContent = "Save vehicle"; toast("Removed from saved"); }
      else { state.saved.add(v.id); qsave.textContent = "Saved ✓"; toast("Saved " + v.make + " " + v.model); }
      var cardBtn = document.querySelector('.card[data-id="' + v.id + '"] [data-save]');
      if (cardBtn) cardBtn.setAttribute("aria-pressed", state.saved.has(v.id) ? "true" : "false");
    });
    showModal("#quickView");
  }
  function cell(k, v) { return '<div class="qv-cell"><div class="k">' + k + '</div><div class="v">' + v + "</div></div>"; }

  // ---------- Modal helpers ----------
  var lastFocus = null;
  function showModal(sel) {
    var m = $(sel);
    lastFocus = document.activeElement;
    m.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModals() {
    ["#quickView", "#compareModal"].forEach(function (s) { $(s).hidden = true; });
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeModals(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!$("#quickView").hidden || !$("#compareModal").hidden) closeModals();
      else if (rail.classList.contains("open")) { rail.classList.remove("open"); filterToggle.setAttribute("aria-expanded", "false"); }
    }
  });

  priceVal.textContent = "$80,000+";
  mileVal.textContent = "150,000+ mi";
  render();
})();
