(function () {
  "use strict";

  // ---------- Data ----------
  var TOTAL_CREDITS = 12;
  var CARD_PRICE = 22.0;

  var CLASSES = [
    {
      id: "ride",
      title: "Power Ride",
      coach: "Coach Mara V.",
      duration: "45 min",
      intensity: "High burn",
      spotLabel: "bike",
      slots: [
        { time: "06:30", left: 4 },
        { time: "12:15", left: 1 },
        { time: "18:00", left: 9 },
        { time: "19:30", left: 0 }
      ]
    },
    {
      id: "hiit",
      title: "Inferno HIIT",
      coach: "Coach Deon R.",
      duration: "40 min",
      intensity: "All-out",
      spotLabel: "station",
      slots: [
        { time: "07:00", left: 6 },
        { time: "17:15", left: 2 },
        { time: "20:00", left: 11 }
      ]
    },
    {
      id: "lift",
      title: "Iron Strength",
      coach: "Coach Priya N.",
      duration: "55 min",
      intensity: "Build",
      spotLabel: "rack",
      slots: [
        { time: "08:30", left: 3 },
        { time: "13:00", left: 0 },
        { time: "18:45", left: 5 }
      ]
    },
    {
      id: "flow",
      title: "Mobility Flow",
      coach: "Coach Sam K.",
      duration: "50 min",
      intensity: "Recover",
      spotLabel: "mat",
      slots: [
        { time: "09:15", left: 8 },
        { time: "12:30", left: 12 },
        { time: "19:00", left: 4 }
      ]
    }
  ];

  // Deterministically "taken" spots per class+slot so the map feels real.
  function takenSet(seedStr, capacity, left) {
    var taken = capacity - left;
    var set = {};
    var h = 0;
    for (var i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
    var n = 0, idx = h % capacity;
    while (n < taken) {
      if (!set[idx]) { set[idx] = true; n++; }
      idx = (idx * 7 + 5) % capacity;
    }
    return set;
  }
  var SPOT_CAPACITY = 12;

  // ---------- State ----------
  var state = {
    step: 1,
    date: null,        // {dow, day, mon, iso, label}
    classId: null,
    slot: null,        // "06:30"
    spot: null         // number
  };

  // ---------- Elements ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var dateStrip = $("#dateStrip");
  var classList = $("#classList");
  var spotGrid = $("#spotGrid");
  var floorStage = $("#floorStage");
  var reviewBox = $("#reviewBox");
  var stepperFill = $("#stepperFill");
  var nextBtn = $("#nextBtn");
  var backBtn = $("#backBtn");
  var navHint = $("#navHint");
  var creditCount = $("#creditCount");

  creditCount.textContent = TOTAL_CREDITS;

  // ---------- Toast ----------
  function toast(msg, isErr) {
    var wrap = $("#toastWrap");
    var el = document.createElement("div");
    el.className = "toast" + (isErr ? " err" : "");
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      el.style.transition = "all .25s ease";
      setTimeout(function () { el.remove(); }, 260);
    }, 2200);
  }

  // ---------- Helpers ----------
  function classById(id) {
    for (var i = 0; i < CLASSES.length; i++) if (CLASSES[i].id === id) return CLASSES[i];
    return null;
  }
  function selectedSlot() {
    var c = classById(state.classId);
    if (!c || !state.slot) return null;
    for (var i = 0; i < c.slots.length; i++) if (c.slots[i].time === state.slot) return c.slots[i];
    return null;
  }

  // ---------- Step 1: date strip ----------
  function buildDates() {
    var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var base = new Date();
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 10; i++) {
      var d = new Date(base.getTime() + i * 86400000);
      var info = {
        dow: DOW[d.getDay()],
        day: d.getDate(),
        mon: MON[d.getMonth()],
        iso: d.toISOString().slice(0, 10),
        label: DOW[d.getDay()] + " " + MON[d.getMonth()] + " " + d.getDate(),
        isToday: i === 0
      };
      var card = document.createElement("button");
      card.type = "button";
      card.className = "datecard";
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", "false");
      card.setAttribute("aria-label", info.label);
      card.innerHTML =
        '<span class="dc-dow">' + info.dow + "</span>" +
        '<span class="dc-day">' + info.day + "</span>" +
        '<span class="dc-mon">' + info.mon + "</span>" +
        (info.isToday ? '<span class="dc-today">Today</span>' : "");
      (function (info, card) {
        card.addEventListener("click", function () {
          $$(".datecard", dateStrip).forEach(function (c) { c.setAttribute("aria-checked", "false"); });
          card.setAttribute("aria-checked", "true");
          state.date = info;
          updateSummary();
          updateNav();
        });
      })(info, card);
      frag.appendChild(card);
    }
    dateStrip.appendChild(frag);
  }

  // ---------- Step 2: classes ----------
  function buildClasses() {
    var frag = document.createDocumentFragment();
    CLASSES.forEach(function (c) {
      var card = document.createElement("div");
      card.className = "classcard";
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", "false");
      card.dataset.id = c.id;

      var slotsHtml = c.slots.map(function (s) {
        var dis = s.left <= 0;
        var low = s.left > 0 && s.left <= 2;
        var leftTxt = dis ? "Full" : s.left + " left";
        return (
          '<button type="button" class="slot' + (low ? " is-low" : "") + '" data-time="' +
          s.time + '"' + (dis ? " disabled" : "") + ">" +
          "<span>" + s.time + "</span>" +
          '<span class="slot-left">' + leftTxt + "</span>" +
          "</button>"
        );
      }).join("");

      card.innerHTML =
        '<div class="cc-head"><div><div class="cc-title">' + c.title + "</div>" +
        '<div class="cc-coach">' + c.coach + "</div></div></div>" +
        '<div class="cc-tags"><span class="badge dur">' + c.duration + "</span>" +
        '<span class="badge intensity">' + c.intensity + "</span></div>" +
        '<div class="cc-slots">' + slotsHtml + "</div>";

      // slot clicks
      $$(".slot", card).forEach(function (btn) {
        if (btn.disabled) return;
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          // select this class
          $$(".classcard", classList).forEach(function (cc) { cc.setAttribute("aria-checked", "false"); });
          card.setAttribute("aria-checked", "true");
          // clear other slot highlights
          $$(".slot", classList).forEach(function (s) { s.classList.remove("is-sel"); });
          btn.classList.add("is-sel");
          // reset spot if class/slot changed
          state.classId = c.id;
          state.slot = btn.dataset.time;
          state.spot = null;
          updateSummary();
          updateNav();
        });
      });

      frag.appendChild(card);
    });
    classList.appendChild(frag);
  }

  // ---------- Step 3: floor map ----------
  function buildSpots() {
    spotGrid.innerHTML = "";
    var c = classById(state.classId);
    var slot = selectedSlot();
    if (!c || !slot) return;
    floorStage.textContent = c.coach.replace("Coach ", "") + " · " + c.title;

    var taken = takenSet(c.id + slot.time, SPOT_CAPACITY, Math.min(slot.left, SPOT_CAPACITY));
    var frag = document.createDocumentFragment();
    for (var i = 1; i <= SPOT_CAPACITY; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "spot";
      btn.setAttribute("role", "gridcell");
      btn.textContent = i;
      var isTaken = !!taken[i - 1];
      if (isTaken) {
        btn.disabled = true;
        btn.setAttribute("aria-label", c.spotLabel + " " + i + " (taken)");
      } else {
        btn.setAttribute("aria-label", c.spotLabel + " " + i + " (open)");
        if (state.spot === i) btn.classList.add("is-sel");
        (function (n, b) {
          b.addEventListener("click", function () {
            $$(".spot", spotGrid).forEach(function (s) { s.classList.remove("is-sel"); });
            b.classList.add("is-sel");
            state.spot = n;
            updateSummary();
            updateNav();
          });
        })(i, btn);
      }
      frag.appendChild(btn);
    }
    spotGrid.appendChild(frag);
  }

  // ---------- Step 4: review + payment ----------
  function buildReview() {
    var c = classById(state.classId);
    var rows = [
      ["Date", state.date ? state.date.label : "—"],
      ["Class", c ? c.title : "—"],
      ["Coach", c ? c.coach : "—"],
      ["Time", state.slot || "—"],
      ["Spot", c && state.spot ? (cap(c.spotLabel) + " " + state.spot) : "—"]
    ];
    reviewBox.innerHTML = rows.map(function (r) {
      return '<div class="rrow"><span class="rk">' + r[0] + '</span><span class="rv">' + r[1] + "</span></div>";
    }).join("");

    $("#pmCreditsSub").textContent = "1 credit · " + (TOTAL_CREDITS - 1) + " left after";
    $("#pmCardPrice").textContent = "$" + CARD_PRICE.toFixed(2);
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---------- Summary rail ----------
  function setRow(key, value) {
    var row = $('.srow[data-srow="' + key + '"]');
    var val = $(".sv", row);
    val.textContent = value || "—";
    row.classList.toggle("is-filled", !!value);
  }
  function updateSummary() {
    var c = classById(state.classId);
    setRow("date", state.date ? state.date.label : "");
    setRow("class", c ? c.title : "");
    setRow("time", state.slot || "");
    setRow("spot", c && state.spot ? (cap(c.spotLabel) + " " + state.spot) : "");

    var total = "—";
    if (state.classId) {
      var pay = payMethod();
      total = pay === "card" ? "$" + CARD_PRICE.toFixed(2) : "1 credit";
    }
    $("#sumTotal").textContent = total;
  }
  function payMethod() {
    var checked = $('input[name="pay"]:checked');
    return checked ? checked.value : "credits";
  }

  // ---------- Validation ----------
  function isStepValid(step) {
    if (step === 1) return !!state.date;
    if (step === 2) return !!(state.classId && state.slot);
    if (step === 3) return !!state.spot;
    if (step === 4) return true;
    return false;
  }
  var HINTS = {
    1: "Select a date to continue",
    2: "Pick a class and time slot",
    3: "Tap an open spot on the floor map",
    4: "Choose a payment method and confirm"
  };

  // ---------- Navigation ----------
  function showStep(step) {
    state.step = step;
    $$(".panel").forEach(function (p) {
      var match = p.dataset.panel === String(step);
      p.hidden = !match;
      p.classList.toggle("is-active", match);
    });

    // stepper visuals
    $$(".step").forEach(function (li) {
      var n = parseInt(li.dataset.step, 10);
      li.classList.toggle("is-current", n === step);
      li.classList.toggle("is-done", n < step);
    });
    stepperFill.style.width = (step / 4 * 100) + "%";

    if (step === 3) buildSpots();
    if (step === 4) { buildReview(); updateSummary(); }

    backBtn.disabled = step <= 1;
    nextBtn.textContent = step === 4 ? "Confirm booking" : "Continue";
    updateNav();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateNav() {
    var valid = isStepValid(state.step);
    nextBtn.disabled = !valid;
    navHint.textContent = valid
      ? (state.step === 4 ? "Ready to confirm" : "Looks good — continue")
      : HINTS[state.step];
  }

  function next() {
    if (!isStepValid(state.step)) {
      toast(HINTS[state.step], true);
      return;
    }
    if (state.step === 4) { confirmBooking(); return; }
    showStep(state.step + 1);
  }
  function back() {
    if (state.step > 1) showStep(state.step - 1);
  }

  // ---------- Confirm ----------
  function genCode() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var s = "";
    for (var i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return "PH-" + s;
  }

  function confirmBooking() {
    var pay = payMethod();
    var c = classById(state.classId);
    if (pay === "credits") {
      var remaining = TOTAL_CREDITS - 1;
      creditCount.textContent = remaining;
    }
    var code = genCode();
    $("#bookingCode").textContent = code;
    $("#successLine").textContent =
      c.title + " · " + state.date.label + " at " + state.slot +
      " · " + cap(c.spotLabel) + " " + state.spot;

    $$(".panel").forEach(function (p) { p.hidden = true; p.classList.remove("is-active"); });
    var s = $('.panel[data-panel="success"]');
    s.hidden = false; s.classList.add("is-active");
    $$(".step").forEach(function (li) { li.classList.add("is-done"); li.classList.remove("is-current"); });
    stepperFill.style.width = "100%";

    nextBtn.disabled = true;
    backBtn.disabled = true;
    navHint.textContent = "Confirmation code " + code;
    toast("Booking confirmed — " + code);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    state = { step: 1, date: null, classId: null, slot: null, spot: null };
    $$(".datecard", dateStrip).forEach(function (c) { c.setAttribute("aria-checked", "false"); });
    $$(".classcard", classList).forEach(function (c) { c.setAttribute("aria-checked", "false"); });
    $$(".slot", classList).forEach(function (s) { s.classList.remove("is-sel"); });
    var creditsRadio = $('input[name="pay"][value="credits"]');
    if (creditsRadio) creditsRadio.checked = true;
    setRow("date", ""); setRow("class", ""); setRow("time", ""); setRow("spot", "");
    $("#sumTotal").textContent = "—";
    showStep(1);
  }

  // ---------- Wire up ----------
  nextBtn.addEventListener("click", next);
  backBtn.addEventListener("click", back);
  $("#againBtn").addEventListener("click", reset);
  $("#calBtn").addEventListener("click", function () { toast("Added to your calendar"); });

  $$('input[name="pay"]').forEach(function (r) {
    r.addEventListener("change", function () { updateSummary(); });
  });

  // keyboard: Enter advances, ArrowLeft goes back
  document.addEventListener("keydown", function (e) {
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    if (e.key === "Enter" && !nextBtn.disabled) { next(); }
  });

  buildDates();
  buildClasses();
  showStep(1);
})();
