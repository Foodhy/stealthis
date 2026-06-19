(function () {
  "use strict";

  // ---- State -------------------------------------------------------------
  var BAG_PRICE = 45;
  var TOTAL_STEPS = 6;
  var booking = {
    ref: "QX7P2K",
    lastname: "Okafor",
    passenger: "Chidi Okafor",
  };
  var state = {
    step: 0,
    seat: null,
    seatFee: 0,
    bags: 0,
    docs: { passport: false, hazmat: false, health: false },
  };

  // ---- Helpers -----------------------------------------------------------
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function toast(msg) {
    var wrap = $("#toast-wrap");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2400);
  }

  var stepper = $("#stepper");
  var backBtn = $("#back-btn");
  var nextBtn = $("#next-btn");

  // ---- Navigation --------------------------------------------------------
  function panelFor(i) { return $('.panel[data-panel="' + i + '"]'); }

  function showStep(i) {
    state.step = i;
    $$(".panel").forEach(function (p) {
      var on = Number(p.getAttribute("data-panel")) === i;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
    $$(".step", stepper).forEach(function (s) {
      var n = Number(s.getAttribute("data-step"));
      s.classList.toggle("is-active", n === i);
      s.classList.toggle("is-done", n < i);
    });
    backBtn.hidden = i === 0;
    // Last step manages its own actions; hide footer continue.
    if (i === TOTAL_STEPS - 1) {
      nextBtn.style.display = "none";
      backBtn.hidden = true;
    } else {
      nextBtn.style.display = "";
      nextBtn.textContent = i === TOTAL_STEPS - 2 ? "Check in" : "Continue";
    }
    refreshNext();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Continue button enabled/disabled per step rules.
  function refreshNext() {
    var ok = true;
    switch (state.step) {
      case 0: ok = false; break; // advanced via find-form submit
      case 4: ok = state.docs.passport && state.docs.hazmat && state.docs.health; break;
      default: ok = true;
    }
    nextBtn.disabled = !ok;
  }

  backBtn.addEventListener("click", function () {
    if (state.step > 0) showStep(state.step - 1);
  });

  nextBtn.addEventListener("click", function () {
    if (state.step === 4 && !(state.docs.passport && state.docs.hazmat && state.docs.health)) {
      $("#docs-warn").hidden = false;
      return;
    }
    if (state.step === TOTAL_STEPS - 2) {
      issueBoardingPass();
    }
    if (state.step < TOTAL_STEPS - 1) showStep(state.step + 1);
  });

  // Allow clicking a completed step in the stepper to jump back.
  stepper.addEventListener("click", function (e) {
    var li = e.target.closest(".step");
    if (!li) return;
    var n = Number(li.getAttribute("data-step"));
    if (n < state.step) showStep(n);
  });

  // ---- Step 0: Find booking ---------------------------------------------
  var findForm = $("#find-form");
  var refInput = $("#ref");
  var lastInput = $("#lastname");

  $$("[data-fill]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var parts = btn.getAttribute("data-fill").split("|");
      refInput.value = parts[0];
      lastInput.value = parts[1];
      refInput.classList.remove("invalid");
      lastInput.classList.remove("invalid");
    });
  });

  refInput.addEventListener("input", function () {
    refInput.value = refInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  });

  findForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var ref = refInput.value.trim();
    var last = lastInput.value.trim();
    var bad = false;
    if (ref.length !== 6) { refInput.classList.add("invalid"); bad = true; }
    else { refInput.classList.remove("invalid"); }
    if (last.length < 2) { lastInput.classList.add("invalid"); bad = true; }
    else { lastInput.classList.remove("invalid"); }
    if (bad) { toast("Check the reference and last name."); return; }

    booking.ref = ref;
    booking.lastname = last;
    // Derive a plausible passenger name from the entered last name.
    booking.passenger = "Chidi " + last.charAt(0).toUpperCase() + last.slice(1).toLowerCase();
    $("#pax-ref").textContent = ref;
    var nameEl = $(".pax-name");
    if (nameEl) nameEl.textContent = booking.passenger;
    var av = $(".avatar");
    if (av) av.textContent = (booking.passenger.split(" ").map(function (w) { return w[0]; }).join("")).slice(0, 2).toUpperCase();
    toast("Booking " + ref + " found.");
    showStep(1);
  });

  // ---- Step 2: Seat map --------------------------------------------------
  var cabin = $("#cabin");
  var seatStatus = $("#seat-status");
  var COLS = ["A", "B", "C", "D", "E", "F"];
  var ROWS = 8;
  var startRow = 12;
  // Deterministic "taken" + "extra" layout.
  var taken = { "12C": 1, "13A": 1, "13F": 1, "14B": 1, "15E": 1, "16C": 1, "17A": 1, "17D": 1, "18F": 1, "19B": 1 };
  var extraRows = { 12: 1, 16: 1 }; // extra legroom rows

  function buildCabin() {
    for (var r = 0; r < ROWS; r++) {
      var rowNum = startRow + r;
      var row = document.createElement("div");
      row.className = "seat-row";
      var label = document.createElement("span");
      label.className = "row-num";
      label.textContent = rowNum;
      row.appendChild(label);
      COLS.forEach(function (col, idx) {
        if (idx === 3) {
          var gap = document.createElement("span");
          gap.className = "aisle-gap";
          gap.textContent = rowNum;
          row.appendChild(gap);
        }
        var id = rowNum + col;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "seat";
        btn.textContent = col;
        btn.setAttribute("aria-label", "Seat " + id);
        btn.dataset.seat = id;
        var isExtra = extraRows[rowNum];
        if (isExtra) { btn.classList.add("extra"); btn.dataset.fee = "39"; }
        if (taken[id]) {
          btn.classList.add("taken");
          btn.disabled = true;
          btn.setAttribute("aria-label", "Seat " + id + " unavailable");
        } else {
          btn.addEventListener("click", function () { selectSeat(btn); });
        }
        row.appendChild(btn);
      });
      cabin.appendChild(row);
    }
  }

  function selectSeat(btn) {
    $$(".seat.selected", cabin).forEach(function (s) { s.classList.remove("selected"); });
    btn.classList.add("selected");
    state.seat = btn.dataset.seat;
    state.seatFee = btn.dataset.fee ? Number(btn.dataset.fee) : 0;
    seatStatus.classList.add("chosen");
    if (state.seatFee) {
      seatStatus.textContent = "Seat " + state.seat + " selected — extra legroom, $" + state.seatFee + ".00.";
    } else {
      seatStatus.textContent = "Seat " + state.seat + " selected. Window/middle/aisle confirmed.";
    }
    toast("Seat " + state.seat + " selected.");
  }

  buildCabin();

  // ---- Step 3: Bags ------------------------------------------------------
  var bagMinus = $("#bag-minus");
  var bagPlus = $("#bag-plus");
  var bagCount = $("#bag-count");
  var bagTotal = $("#bag-total");

  function renderBags() {
    bagCount.textContent = state.bags;
    bagTotal.textContent = "$" + (state.bags * BAG_PRICE).toFixed(2);
    bagMinus.disabled = state.bags === 0;
    bagPlus.disabled = state.bags >= 5;
  }
  bagMinus.addEventListener("click", function () {
    if (state.bags > 0) { state.bags--; renderBags(); }
  });
  bagPlus.addEventListener("click", function () {
    if (state.bags < 5) { state.bags++; renderBags(); toast("Checked bag added · $" + BAG_PRICE + "."); }
  });
  renderBags();

  // ---- Step 4: Documents -------------------------------------------------
  $$('#check-list input[type="checkbox"]').forEach(function (cb) {
    cb.addEventListener("change", function () {
      state.docs[cb.dataset.doc] = cb.checked;
      cb.closest(".check-item").classList.toggle("on", cb.checked);
      var all = state.docs.passport && state.docs.hazmat && state.docs.health;
      if (all) $("#docs-warn").hidden = true;
      refreshNext();
    });
  });

  // ---- Step 5: Boarding pass --------------------------------------------
  function issueBoardingPass() {
    var seat = state.seat || "Auto";
    $("#bp-name").textContent = booking.passenger;
    $("#bp-seat").textContent = seat;
    $("#bp-stub-seat").textContent = seat;
    // Boarding group from cabin position (front rows board later in this demo).
    var group = state.seat ? String(((Number(state.seat.replace(/\D/g, "")) - 11) % 4) + 1) : "4";
    $("#bp-group").textContent = group;
    // Render a pseudo-random but stable barcode pattern.
    renderBarcode($("#barcode"), booking.ref + seat);
    toast("Boarding pass issued.");
  }

  function renderBarcode(el, seedStr) {
    var seed = 0;
    for (var i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    var bars = [];
    for (var b = 0; b < 48; b++) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      bars.push((seed % 3) + 1);
    }
    var grad = [];
    var x = 0;
    bars.forEach(function (w, idx) {
      var dark = idx % 2 === 0;
      grad.push((dark ? "var(--ink)" : "transparent") + " " + x + "px " + (x + w) + "px");
      x += w;
    });
    el.style.backgroundImage = "linear-gradient(90deg, " + grad.join(", ") + ")";
    el.style.backgroundSize = x + "px 100%";
    el.style.backgroundRepeat = "repeat-x";
  }

  $("#add-wallet").addEventListener("click", function () {
    toast("Boarding pass saved to wallet.");
  });

  $("#restart").addEventListener("click", function () {
    state.seat = null; state.seatFee = 0; state.bags = 0;
    state.docs = { passport: false, hazmat: false, health: false };
    $$(".seat.selected", cabin).forEach(function (s) { s.classList.remove("selected"); });
    seatStatus.classList.remove("chosen");
    seatStatus.textContent = "No seat selected — a seat will be assigned at the gate.";
    $$('#check-list input[type="checkbox"]').forEach(function (cb) {
      cb.checked = false; cb.closest(".check-item").classList.remove("on");
    });
    renderBags();
    refInput.value = ""; lastInput.value = "";
    showStep(0);
  });

  // ---- Init --------------------------------------------------------------
  showStep(0);
})();
