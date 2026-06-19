(function () {
  "use strict";

  // ---- fictional data ---------------------------------------------------
  var DESKS = [
    { id: "A1", type: "Hot desk", status: "free", price: 14, credits: 2, fav: false, amenities: ["Monitor", "Power", "Window seat"] },
    { id: "A2", type: "Hot desk", status: "occupied", price: 14, credits: 2, fav: false, amenities: ["Power", "Window seat"] },
    { id: "A3", type: "Hot desk", status: "free", price: 14, credits: 2, fav: true, amenities: ["Monitor", "Power", "Standing"] },
    { id: "A4", type: "Quiet desk", status: "reserved", price: 18, credits: 3, fav: false, amenities: ["Monitor", "Power", "Acoustic"] },
    { id: "A5", type: "Quiet desk", status: "free", price: 18, credits: 3, fav: false, amenities: ["Dual monitor", "Power", "Acoustic"] },
    { id: "B1", type: "Hot desk", status: "free", price: 14, credits: 2, fav: false, amenities: ["Power", "Plant view"] },
    { id: "B2", type: "Standing", status: "occupied", price: 16, credits: 2, fav: false, amenities: ["Standing", "Power", "Monitor"] },
    { id: "B3", type: "Standing", status: "free", price: 16, credits: 2, fav: true, amenities: ["Standing", "Power", "Dual monitor"] },
    { id: "B4", type: "Quiet desk", status: "free", price: 18, credits: 3, fav: false, amenities: ["Monitor", "Acoustic", "Locker"] },
    { id: "B5", type: "Hot desk", status: "occupied", price: 14, credits: 2, fav: false, amenities: ["Power", "Monitor"] },
    { id: "C1", type: "Studio bench", status: "reserved", price: 22, credits: 4, fav: false, amenities: ["Wide bench", "Power", "Daylight lamp"] },
    { id: "C2", type: "Studio bench", status: "free", price: 22, credits: 4, fav: true, amenities: ["Wide bench", "Power", "Daylight lamp", "Storage"] },
    { id: "C3", type: "Hot desk", status: "free", price: 14, credits: 2, fav: false, amenities: ["Power", "Plant view"] },
    { id: "C4", type: "Quiet desk", status: "free", price: 18, credits: 3, fav: false, amenities: ["Monitor", "Acoustic"] },
  ];

  var SLOTS = [
    { id: "am", label: "Morning", time: "08–12", hours: 4 },
    { id: "pm", label: "Afternoon", time: "12–18", hours: 6 },
    { id: "eve", label: "Evening", time: "18–22", hours: 4 },
    { id: "day", label: "Full day", time: "08–22", hours: 14 },
  ];

  var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var state = { deskId: null, dateIdx: 0, slotId: null };

  var grid = document.getElementById("deskGrid");
  var dateRow = document.getElementById("dateRow");
  var slotRow = document.getElementById("slotRow");
  var detail = document.getElementById("deskDetail");
  var summary = document.getElementById("summary");

  // ---- toast ------------------------------------------------------------
  function toast(msg) {
    var wrap = document.getElementById("toastWrap");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () {
        el.remove();
      }, 250);
    }, 2600);
  }

  // ---- dates ------------------------------------------------------------
  function buildDates() {
    var base = new Date(2026, 5, 18); // fictional fixed "today"
    for (var i = 0; i < 4; i++) {
      var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "date" + (i === 0 ? " is-active" : "");
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", i === 0 ? "true" : "false");
      btn.dataset.idx = String(i);
      var label = i === 0 ? "Today" : DAY_NAMES[d.getDay()];
      btn.innerHTML =
        "<small>" + label + "</small><b>" + d.getDate() + "</b>";
      btn.dataset.full =
        DAY_NAMES[d.getDay()] + " " + MON_NAMES[d.getMonth()] + " " + d.getDate();
      btn.addEventListener("click", function () {
        state.dateIdx = parseInt(this.dataset.idx, 10);
        [].forEach.call(dateRow.children, function (c) {
          var on = c === this;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-checked", on ? "true" : "false");
        }, this);
        refresh();
      });
      dateRow.appendChild(btn);
    }
  }

  // ---- slots ------------------------------------------------------------
  function buildSlots() {
    SLOTS.forEach(function (s) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", "false");
      btn.dataset.id = s.id;
      btn.innerHTML =
        "<b>" + s.label + "</b><span>" + s.time + "</span>";
      btn.addEventListener("click", function () {
        if (this.hasAttribute("disabled")) return;
        state.slotId = s.id;
        [].forEach.call(slotRow.children, function (c) {
          var on = c === this;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-checked", on ? "true" : "false");
        }, this);
        refresh();
      });
      slotRow.appendChild(btn);
    });
  }

  // ---- desks ------------------------------------------------------------
  function buildDesks() {
    DESKS.forEach(function (desk) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "desk desk--" + desk.status;
      btn.dataset.id = desk.id;
      var label =
        "Desk " + desk.id + ", " + desk.type + ", " + statusWord(desk.status);
      btn.setAttribute("aria-label", label);
      if (desk.status === "occupied") btn.setAttribute("aria-disabled", "true");
      btn.innerHTML =
        '<span class="desk__id">' + desk.id + "</span>" +
        '<span class="desk__type">' + desk.type + "</span>" +
        (desk.fav ? '<span class="desk__fav" title="One of your favourites">★</span>' : "");
      btn.addEventListener("click", function () {
        selectDesk(desk.id);
      });
      grid.appendChild(btn);
    });
  }

  function statusWord(s) {
    if (s === "free") return "available";
    if (s === "reserved") return "reserved, request only";
    return "occupied";
  }

  function selectDesk(id) {
    var desk = DESKS.find(function (d) { return d.id === id; });
    if (!desk) return;
    if (desk.status === "occupied") {
      toast("Desk " + id + " is occupied — pick another.");
      return;
    }
    state.deskId = id;
    [].forEach.call(grid.children, function (c) {
      c.classList.toggle("is-selected", c.dataset.id === id);
    });
    renderDetail(desk);
    refresh();
  }

  function renderDetail(desk) {
    var reserved = desk.status === "reserved";
    var amen = desk.amenities
      .map(function (a) { return "<li>" + a + "</li>"; })
      .join("");
    detail.innerHTML =
      '<div class="detail__card">' +
        '<div class="detail__top">' +
          "<div>" +
            '<div class="detail__name">Desk ' + desk.id + "</div>" +
            '<div class="detail__type">' + desk.type + "</div>" +
          "</div>" +
          '<span class="tag tag--' + (reserved ? "reserved" : "free") + '">' +
            (reserved ? "Request" : "Available") +
          "</span>" +
        "</div>" +
        '<ul class="amen">' + amen + "</ul>" +
        '<div class="detail__price">' +
          "<div><b>$" + desk.price + "</b> <span>/ slot</span></div>" +
          '<span class="credits-cost">or ' + desk.credits + " credits</span>" +
        "</div>" +
      "</div>";
  }

  // ---- summary / refresh ------------------------------------------------
  function refresh() {
    var desk = DESKS.find(function (d) { return d.id === state.deskId; });
    var slot = SLOTS.find(function (s) { return s.id === state.slotId; });
    var dateBtn = dateRow.children[state.dateIdx];

    if (!desk) {
      summary.hidden = true;
      return;
    }
    summary.hidden = false;

    document.getElementById("sumDesk").textContent =
      desk.id + " · " + desk.type;
    document.getElementById("sumWhen").textContent =
      (dateBtn ? dateBtn.dataset.full : "—") +
      (slot ? " · " + slot.label + " (" + slot.time + ")" : " · pick a slot");
    document.getElementById("sumDur").textContent =
      slot ? slot.hours + " hours" : "—";

    var total = document.getElementById("sumTotal");
    var btn = document.getElementById("confirmBtn");
    if (slot) {
      // full day priced as ~3 slots for the discount feel
      var mult = slot.id === "day" ? 2.6 : slot.hours <= 4 ? 1 : 1.5;
      var cost = Math.round(desk.price * mult);
      var cr = Math.round(desk.credits * mult);
      total.textContent = "$" + cost + "  ·  " + cr + " credits";
      btn.disabled = false;
    } else {
      total.textContent = "—";
      btn.disabled = true;
    }
  }

  // ---- confirm ----------------------------------------------------------
  document.getElementById("confirmBtn").addEventListener("click", function () {
    var desk = DESKS.find(function (d) { return d.id === state.deskId; });
    var slot = SLOTS.find(function (s) { return s.id === state.slotId; });
    if (!desk || !slot) return;
    var dateBtn = dateRow.children[state.dateIdx];
    toast(
      "Desk " + desk.id + " booked · " +
      (dateBtn ? dateBtn.dataset.full : "") + " · " + slot.label
    );
    // mark desk occupied to simulate live availability
    desk.status = "occupied";
    var node = grid.querySelector('[data-id="' + desk.id + '"]');
    if (node) {
      node.className = "desk desk--occupied";
      node.setAttribute("aria-disabled", "true");
    }
    state.deskId = null;
    state.slotId = null;
    [].forEach.call(slotRow.children, function (c) {
      c.classList.remove("is-active");
      c.setAttribute("aria-checked", "false");
    });
    detail.innerHTML =
      '<div class="detail__empty"><span class="detail__icon">🪑</span>' +
      "<p>Select a desk on the plan to see its type, amenities and price.</p></div>";
    summary.hidden = true;
  });

  // ---- init -------------------------------------------------------------
  buildDates();
  buildSlots();
  buildDesks();
})();
