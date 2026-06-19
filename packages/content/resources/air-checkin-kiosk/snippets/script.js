(function () {
  "use strict";

  // ---------- fictional booking data ----------
  var BOOKING = {
    ref: "7QK2RX",
    lastName: "MARSH",
    flight: "AU 418",
    passengers: [
      { id: "p1", first: "Elena", last: "Marsh", initials: "EM", type: "Adult", tier: "Gold" },
      { id: "p2", first: "Theo", last: "Marsh", initials: "TM", type: "Adult", tier: null },
      { id: "p3", first: "Iris", last: "Marsh", initials: "IM", type: "Child (8)", tier: null }
    ]
  };

  var SEAT_FEE_EXTRA = 45;
  var BAG_FEE = 60;
  var GROUPS = ["A1", "B2", "C1"];

  // taken seats + extra-legroom rows
  var TAKEN = ["12A", "12C", "13F", "15B", "15C", "16D", "17A", "17F", "18E"];
  var EXTRA_ROWS = [11];
  var ROWS = [11, 12, 13, 14, 15, 16, 17, 18];
  var COLS = ["A", "B", "C", "D", "E", "F"];

  var state = { passengers: [], seat: null, bags: 1 };

  // ---------- helpers ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var toastEl = $("#toast");
  var toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2600);
  }

  function money(n) { return "$" + n.toFixed(0); }

  // ---------- clock ----------
  (function clock() {
    var el = $("#clock");
    function tick() {
      var d = new Date();
      el.textContent =
        String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }
    tick();
    setInterval(tick, 15000);
  })();

  // ---------- step navigation ----------
  var current = 1;
  function goTo(step) {
    current = step;
    $$(".panel").forEach(function (p) {
      var s = Number(p.getAttribute("data-step"));
      var on = s === step;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
    $$(".steps__item").forEach(function (li, i) {
      var n = i + 1;
      li.classList.toggle("is-active", n === step);
      li.classList.toggle("is-done", n < step);
    });
    var k = $(".kiosk");
    if (k && k.scrollIntoView) k.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  $$("[data-back]").forEach(function (b) {
    b.addEventListener("click", function () { goTo(Number(b.getAttribute("data-back"))); });
  });

  // ---------- STEP 1: retrieve ----------
  var refInput = $("#refInput");
  var nameInput = $("#nameInput");

  $("#demoRef").addEventListener("click", function () {
    refInput.value = BOOKING.ref;
    nameInput.value = "Marsh";
    refInput.classList.remove("is-err");
    toast("Demo booking filled in");
  });

  $("#scanBtn").addEventListener("click", function () {
    var btn = this;
    if (btn.classList.contains("is-scanning")) return;
    btn.classList.add("is-scanning");
    toast("Reading document…");
    setTimeout(function () {
      btn.classList.remove("is-scanning");
      refInput.value = BOOKING.ref;
      nameInput.value = "Marsh";
      toast("Booking " + BOOKING.ref + " found");
      foundBooking();
    }, 1300);
  });

  $("#ffBtn").addEventListener("click", function () {
    toast("Frequent flyer lookup is offline at this kiosk — use reference instead");
  });

  $("#findBtn").addEventListener("click", function () {
    var ref = refInput.value.trim().toUpperCase();
    var name = nameInput.value.trim().toUpperCase();
    if (ref !== BOOKING.ref || name !== BOOKING.lastName) {
      refInput.classList.add("is-err");
      nameInput.classList.toggle("is-err", name !== BOOKING.lastName);
      toast("No booking matches those details. Try " + BOOKING.ref + " / Marsh");
      return;
    }
    refInput.classList.remove("is-err");
    nameInput.classList.remove("is-err");
    foundBooking();
  });

  refInput.addEventListener("input", function () { this.classList.remove("is-err"); });
  nameInput.addEventListener("input", function () { this.classList.remove("is-err"); });

  function foundBooking() {
    $("#bookingRef2").textContent = BOOKING.ref;
    buildPaxList();
    goTo(2);
    toast("Welcome aboard, Marsh party");
  }

  // ---------- STEP 2: passengers ----------
  var paxNext = $("#paxNext");
  function buildPaxList() {
    var ul = $("#paxList");
    ul.innerHTML = "";
    BOOKING.passengers.forEach(function (p) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pax";
      btn.setAttribute("aria-pressed", "false");
      btn.dataset.id = p.id;
      btn.innerHTML =
        '<span class="pax__check"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' +
        '<span class="pax__avatar">' + p.initials + "</span>" +
        '<span class="pax__info"><span class="pax__name">' + p.first + " " + p.last + "</span>" +
        '<span class="pax__sub">' + p.type + " · Economy</span></span>" +
        (p.tier ? '<span class="pax__tag">' + p.tier + "</span>" : "");
      btn.addEventListener("click", function () {
        var on = btn.classList.toggle("is-on");
        btn.setAttribute("aria-pressed", String(on));
        updatePaxSel();
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
    // preselect all
    $$(".pax").forEach(function (b) { b.classList.add("is-on"); b.setAttribute("aria-pressed", "true"); });
    updatePaxSel();
  }

  function updatePaxSel() {
    state.passengers = $$(".pax.is-on").map(function (b) { return b.dataset.id; });
    paxNext.disabled = state.passengers.length === 0;
    paxNext.textContent =
      state.passengers.length > 1
        ? "Continue · " + state.passengers.length + " passengers"
        : "Continue";
  }

  paxNext.addEventListener("click", function () {
    var first = BOOKING.passengers.filter(function (p) {
      return state.passengers.indexOf(p.id) !== -1;
    })[0];
    $("#seatPaxName").textContent = first ? first.first + " " + first.last : "—";
    buildSeatMap();
    goTo(3);
  });

  // ---------- STEP 3: seats ----------
  var seatNext = $("#seatNext");
  function buildSeatMap() {
    var map = $("#seatMap");
    map.innerHTML = "";
    ROWS.forEach(function (row) {
      var rowEl = document.createElement("div");
      rowEl.className = "seatrow";
      rowEl.setAttribute("role", "row");
      var no = document.createElement("span");
      no.className = "seatrow__no";
      no.textContent = row;
      rowEl.appendChild(no);
      COLS.forEach(function (col, ci) {
        if (ci === 3) {
          var aisle = document.createElement("span");
          aisle.className = "aisle";
          rowEl.appendChild(aisle);
        }
        var id = row + col;
        var seat = document.createElement("button");
        seat.type = "button";
        seat.className = "seat";
        seat.textContent = col;
        seat.dataset.seat = id;
        seat.setAttribute("role", "gridcell");
        var isExtra = EXTRA_ROWS.indexOf(row) !== -1;
        if (TAKEN.indexOf(id) !== -1) {
          seat.classList.add("seat--taken");
          seat.disabled = true;
          seat.setAttribute("aria-label", "Seat " + id + " taken");
        } else {
          seat.classList.add(isExtra ? "seat--extra" : "seat--open");
          seat.dataset.extra = isExtra ? "1" : "0";
          seat.setAttribute("aria-label", "Seat " + id + (isExtra ? ", extra legroom" : ""));
          seat.addEventListener("click", function () { pickSeat(seat); });
        }
        rowEl.appendChild(seat);
      });
      map.appendChild(rowEl);
    });
  }

  function pickSeat(seat) {
    $$(".seat.is-sel").forEach(function (s) { s.classList.remove("is-sel"); });
    seat.classList.add("is-sel");
    var id = seat.dataset.seat;
    var extra = seat.dataset.extra === "1";
    state.seat = { id: id, extra: extra };
    $("#seatBig").textContent = id;
    var col = id.slice(-1);
    var pos = col === "A" || col === "F" ? "Window" : col === "C" || col === "D" ? "Aisle" : "Middle";
    $("#seatDesc").textContent = pos + " seat" + (extra ? " · extra legroom" : "");
    $("#seatFee").textContent = extra ? "+" + money(SEAT_FEE_EXTRA) + " seat fee" : "No extra charge";
    seatNext.disabled = false;
  }

  seatNext.addEventListener("click", function () {
    renderBagSummary();
    goTo(4);
  });

  // ---------- STEP 4: bags ----------
  var bagCountEl = $("#bagCount");
  var bagMinus = $("#bagMinus");
  var bagPlus = $("#bagPlus");

  function setBags(n) {
    state.bags = Math.max(0, Math.min(5, n));
    bagCountEl.textContent = state.bags;
    bagMinus.disabled = state.bags === 0;
    bagPlus.disabled = state.bags === 5;
    var extra = Math.max(0, state.bags - 1);
    $("#bagNote").textContent =
      state.bags === 0
        ? "Travelling with carry-on only"
        : "First bag included" + (extra ? " · " + extra + " extra at " + money(BAG_FEE) + " each" : "") + " · 23 kg limit";
    renderBagSummary();
  }
  bagMinus.addEventListener("click", function () { setBags(state.bags - 1); });
  bagPlus.addEventListener("click", function () { setBags(state.bags + 1); });

  function renderBagSummary() {
    var extraBags = Math.max(0, state.bags - 1) * BAG_FEE;
    var seatFee = state.seat && state.seat.extra ? SEAT_FEE_EXTRA : 0;
    var total = extraBags + seatFee;
    var rows = "";
    rows += row("Checked bags", state.bags + " × " + (state.bags ? "23 kg" : "—"), state.bags > 1 ? money(extraBags) : "Included");
    if (state.seat) rows += row("Seat " + state.seat.id, state.seat.extra ? "Extra legroom" : "Standard", seatFee ? money(seatFee) : "Free");
    rows +=
      '<div class="summary__row summary__row--total"><span>Total due</span><strong>' +
      (total ? money(total) : "$0") + "</strong></div>";
    $("#bagSummary").innerHTML = rows;
    function row(label, sub, val) {
      return (
        '<div class="summary__row"><span>' + label + " · " + sub +
        "</span><strong>" + val + "</strong></div>"
      );
    }
  }

  $("#bagNext").addEventListener("click", function () {
    fillBoardingPass();
    goTo(5);
    runPrint();
  });

  // ---------- STEP 5: boarding pass + print ----------
  function fillBoardingPass() {
    var pax = BOOKING.passengers.filter(function (p) {
      return state.passengers.indexOf(p.id) !== -1;
    })[0] || BOOKING.passengers[0];
    var name = (pax.last + "/" + pax.first).toUpperCase();
    $("#bpName").textContent = name;
    var seat = state.seat ? state.seat.id : "14C";
    $("#bpSeat").textContent = seat;
    $("#bpSeat2").textContent = seat;
    $("#bpBags").textContent = state.bags;
    var grp = pax.tier === "Gold" ? "A1" : GROUPS[(Number(seat.slice(0, -1)) % GROUPS.length)] || "C1";
    $("#bpGroup").textContent = grp.slice(-2);
    $("#bpSeq").textContent = "SEQ 0" + (40 + Math.floor(Math.random() * 9));
  }

  function runPrint() {
    var printer = $("#printer");
    var msg = $("#printerMsg");
    var title = $("#doneTitle");
    var sub = $("#doneSub");
    printer.classList.remove("is-done");
    printer.classList.add("is-printing");
    msg.textContent = "Printing boarding pass & bag tags…";
    title.textContent = "Printing…";
    setTimeout(function () {
      printer.classList.remove("is-printing");
      printer.classList.add("is-done");
      msg.textContent = "Boarding pass & " + state.bags + " bag tag" + (state.bags === 1 ? "" : "s") + " ready";
      title.textContent = "You're checked in!";
      sub.textContent =
        "Collect your documents below. Drop bags at the Aurelia Air counter, then proceed to Gate B22.";
      toast("Check-in complete — Gate B22 boards 06:00");
    }, 1700);
  }

  $("#restartBtn").addEventListener("click", function () {
    state = { passengers: [], seat: null, bags: 1 };
    refInput.value = "";
    nameInput.value = "";
    $("#printer").classList.remove("is-printing", "is-done");
    $("#seatBig").textContent = "—";
    $("#seatDesc").textContent = "No seat selected";
    $("#seatFee").textContent = "";
    seatNext.disabled = true;
    setBags(1);
    goTo(1);
    toast("Ready for the next passenger");
  });

  // init defaults
  setBags(1);
})();
