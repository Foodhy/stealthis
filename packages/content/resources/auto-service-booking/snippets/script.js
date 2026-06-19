(function () {
  "use strict";

  var CHECK =
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  // ---- Data ----------------------------------------------------------------
  var VEHICLES = [
    { name: "2021 Subaru Outback", vin: "JF2SJ…D8421", plate: "7KJ·4821" },
    { name: "2018 Ford F-150", vin: "1FTEW…B7710", plate: "RTX·9007" }
  ];

  var SERVICES = [
    { id: "oil", name: "Oil & filter change", code: "LOF-05", parts: 34.0, hours: 0.5, meta: "Full synthetic 0W-20 · 5 qt" },
    { id: "tires", name: "Tire rotation & balance", code: "TR-12", parts: 0.0, hours: 0.6, meta: "4-wheel rotation, road-force balance" },
    { id: "brakes", name: "Front brake service", code: "BRK-21", parts: 168.0, hours: 1.4, meta: "Pads + rotor resurface, inspection" },
    { id: "diag", name: "Check-engine diagnostic", code: "P0301", parts: 0.0, hours: 1.0, meta: "Scan, road test & report" },
    { id: "align", name: "4-wheel alignment", code: "ALN-04", parts: 0.0, hours: 1.0, meta: "Camber / caster / toe set to spec" },
    { id: "battery", name: "Battery test & replace", code: "BAT-09", parts: 189.0, hours: 0.4, meta: "Load test, terminals, AGM 750 CCA" }
  ];

  var LABOR_RATE = 145; // $/hr
  var SHOP_FEE = 12.5;
  var TAX_RATE = 0.0825;

  // ---- State ---------------------------------------------------------------
  var state = {
    vehicle: 0,
    services: {},
    date: null,
    slot: null,
    option: "dropoff",
    optionPrice: 0
  };

  // ---- Helpers -------------------------------------------------------------
  function $(s, c) { return (c || document).querySelector(s); }
  var fmt = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // ---- Build services ------------------------------------------------------
  var serviceList = $("#serviceList");
  SERVICES.forEach(function (s) {
    var labor = s.hours * LABOR_RATE;
    var total = s.parts + labor;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "svc";
    btn.setAttribute("aria-pressed", "false");
    btn.dataset.id = s.id;
    btn.innerHTML =
      '<span class="svc-box">' + CHECK + "</span>" +
      '<span class="svc-main"><span class="svc-name">' + s.name +
      ' <span class="svc-code mono">' + s.code + "</span></span>" +
      '<span class="svc-meta">' + s.meta + "</span></span>" +
      '<span class="svc-price mono">' + fmt(total) + "<small>est.</small></span>";
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", on ? "false" : "true");
      if (on) delete state.services[s.id];
      else state.services[s.id] = s;
      render();
    });
    serviceList.appendChild(btn);
  });

  // ---- Build dates ---------------------------------------------------------
  var dateRow = $("#dateRow");
  var DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var dates = [];
  var base = new Date(2026, 5, 18); // fixed reference for stable demo
  for (var i = 0; i < 7; i++) {
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    var closed = d.getDay() === 0; // Sunday closed
    dates.push({ date: d, closed: closed });
    var b = document.createElement("button");
    b.type = "button";
    b.className = "date";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", "false");
    if (closed) b.disabled = true;
    b.dataset.idx = i;
    b.innerHTML =
      '<div class="d-dow">' + (i === 0 ? "Today" : DOW[d.getDay()]) + "</div>" +
      '<div class="d-num">' + d.getDate() + "</div>" +
      '<div class="d-mon">' + MON[d.getMonth()] + (closed ? " · closed" : "") + "</div>";
    if (!closed) {
      b.addEventListener("click", function () { pickDate(parseInt(this.dataset.idx, 10)); });
    }
    dateRow.appendChild(b);
  }

  // ---- Slots ---------------------------------------------------------------
  var SLOTS = [
    { t: "8:00", bay: 1, open: true }, { t: "9:30", bay: 2, open: true },
    { t: "10:30", bay: 1, open: false }, { t: "11:30", bay: 3, open: true },
    { t: "1:00", bay: 2, open: true }, { t: "2:30", bay: 1, open: true },
    { t: "3:30", bay: 3, open: false }, { t: "4:30", bay: 2, open: true }
  ];
  var slotGrid = $("#slotGrid");

  function pickDate(idx) {
    state.date = idx;
    state.slot = null;
    Array.prototype.forEach.call(dateRow.children, function (el) {
      el.setAttribute("aria-checked", el.dataset.idx === String(idx) ? "true" : "false");
    });
    renderSlots(idx);
    render();
  }

  function renderSlots(idx) {
    slotGrid.innerHTML = "";
    SLOTS.forEach(function (s, si) {
      // make availability vary slightly by day so it feels live
      var open = s.open && !((idx + si) % 7 === 0);
      var b = document.createElement("button");
      b.type = "button";
      b.className = "slot";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      if (!open) b.disabled = true;
      b.dataset.slot = si;
      b.innerHTML = s.t + (si < 4 ? " AM" : " PM") +
        '<span class="slot-bay-no">Bay ' + s.bay + "</span>";
      if (open) {
        b.addEventListener("click", function () { pickSlot(parseInt(this.dataset.slot, 10)); });
      }
      slotGrid.appendChild(b);
    });
  }

  function pickSlot(si) {
    state.slot = si;
    Array.prototype.forEach.call(slotGrid.children, function (el) {
      el.setAttribute("aria-checked", el.dataset.slot === String(si) ? "true" : "false");
    });
    var s = SLOTS[si];
    toast("Slot held — " + s.t + (si < 4 ? " AM" : " PM") + " · Bay " + s.bay);
    render();
  }

  // ---- Vehicle select ------------------------------------------------------
  var vehicleGrid = $("#vehicleGrid");
  Array.prototype.forEach.call(vehicleGrid.querySelectorAll(".vehicle"), function (el) {
    el.addEventListener("click", function () {
      var v = el.dataset.vehicle;
      Array.prototype.forEach.call(vehicleGrid.children, function (c) {
        c.setAttribute("aria-checked", "false");
      });
      el.setAttribute("aria-checked", "true");
      if (v === "add") {
        toast("Add-vehicle form would open here.");
        return;
      }
      state.vehicle = parseInt(v, 10);
      $("#sumVin").textContent = VEHICLES[state.vehicle].vin;
      render();
    });
  });

  // ---- Options -------------------------------------------------------------
  var optionRow = $("#optionRow");
  Array.prototype.forEach.call(optionRow.querySelectorAll(".option"), function (el) {
    el.addEventListener("click", function () {
      Array.prototype.forEach.call(optionRow.children, function (c) {
        c.setAttribute("aria-checked", "false");
      });
      el.setAttribute("aria-checked", "true");
      state.option = el.dataset.opt;
      state.optionPrice = parseFloat(el.dataset.price) || 0;
      render();
    });
  });

  // ---- Render summary ------------------------------------------------------
  var sumLines = $("#sumLines");
  function render() {
    var ids = Object.keys(state.services);
    var parts = 0, hours = 0;

    sumLines.innerHTML = "";
    if (!ids.length) {
      sumLines.innerHTML = '<li class="empty">Select a service to see your estimate.</li>';
    } else {
      ids.forEach(function (id) {
        var s = state.services[id];
        parts += s.parts;
        hours += s.hours;
        var line = s.parts + s.hours * LABOR_RATE;
        var li = document.createElement("li");
        li.className = "sl-item";
        li.innerHTML =
          '<span class="sl-name">' + s.name + "</span>" +
          '<span class="sl-price mono">' + fmt(line) + "</span>" +
          '<span class="sl-sub">' + s.code + " · " + s.hours.toFixed(1) +
          " hr labor" + (s.parts ? " · " + fmt(s.parts) + " parts" : " · no parts") + "</span>";
        sumLines.appendChild(li);
      });
    }

    var labor = hours * LABOR_RATE;
    var opt = state.optionPrice;
    var subtotal = parts + labor + opt;
    var fee = ids.length ? SHOP_FEE : 0;
    var tax = (subtotal + fee) * TAX_RATE;
    var total = ids.length ? subtotal + fee + tax : 0;

    $("#tParts").textContent = fmt(parts);
    $("#tLabor").textContent = fmt(labor);
    $("#tHours").textContent = hours.toFixed(1) + " hr @ " + fmt(LABOR_RATE) + "/hr";
    $("#tOpt").textContent = fmt(opt);
    $("#tTax").textContent = fmt(ids.length ? fee + tax : 0);
    $("#tTotal").textContent = fmt(total);

    // when
    var whenBox = $("#sumWhen");
    var whenText = $("#whenText");
    var when = whenString();
    if (when) {
      whenBox.classList.add("set");
      whenText.textContent = when;
    } else {
      whenBox.classList.remove("set");
      whenText.textContent = "Choose a date and time slot";
    }

    var ready = ids.length && state.date !== null && state.slot !== null;
    $("#confirmBtn").disabled = !ready;
  }

  function whenString() {
    if (state.date === null || state.slot === null) return "";
    var d = dates[state.date].date;
    var s = SLOTS[state.slot];
    var label = DOW[d.getDay()] + " " + MON[d.getMonth()] + " " + d.getDate();
    return label + " · " + s.t + (state.slot < 4 ? " AM" : " PM") + " · Bay " + s.bay;
  }

  // ---- Confirm -------------------------------------------------------------
  var overlay = $("#overlay");
  $("#confirmBtn").addEventListener("click", function () {
    if (this.disabled) return;
    var wo = "RO-" + (50000 + Math.floor(Math.random() * 49999));
    $("#okWO").textContent = wo;
    $("#okWhen").textContent = whenString();
    $("#okVeh").textContent = VEHICLES[state.vehicle].name;
    $("#okTotal").textContent = $("#tTotal").textContent;
    overlay.hidden = false;
    $("#okClose").focus();
  });

  $("#okClose").addEventListener("click", function () { overlay.hidden = true; toast("Work order saved to your account."); });
  overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.hidden = true; });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden) overlay.hidden = true; });

  // ---- Init ----------------------------------------------------------------
  pickDate(0);
  render();
})();
