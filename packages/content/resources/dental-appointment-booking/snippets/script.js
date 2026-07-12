(function () {
  "use strict";

  var TOTAL_STEPS = 4;
  var state = {
    step: 1,
    treatment: null, duration: null, price: null,
    dentist: null,
    day: null, // {label, iso}
    slot: null, // "09:30"
    period: null
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Toast ---------- */
  var toastEl = $("#toast");
  var toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- Selectable cards (treatment + dentist) ---------- */
  function wireCards(groupSel, onPick) {
    $$(groupSel + " .card").forEach(function (card) {
      var input = $("input", card);
      function select() {
        $$(groupSel + " .card").forEach(function (c) {
          c.classList.remove("is-selected");
          c.setAttribute("aria-checked", "false");
        });
        card.classList.add("is-selected");
        card.setAttribute("aria-checked", "true");
        input.checked = true;
        onPick(input, card);
      }
      card.addEventListener("click", select);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); }
      });
    });
  }

  wireCards(".treat-grid", function (input) {
    state.treatment = input.value;
    state.duration = input.getAttribute("data-dur");
    state.price = input.getAttribute("data-price");
    syncSummary();
    autoAdvanceHint();
  });

  wireCards(".dentist-grid", function (input) {
    state.dentist = input.value;
    syncSummary();
    autoAdvanceHint();
  });

  function autoAdvanceHint() { validateNav(); }

  /* ---------- Calendar ---------- */
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  // Fixed reference "today" for the demo so availability is deterministic.
  var baseDate = new Date(2026, 6, 1); // 1 Jul 2026
  var weekOffset = 0;

  // Deterministic pseudo-availability per date -> 'open' | 'few' | 'full'
  function dayAvailability(d) {
    var dow = d.getDay();
    if (dow === 0) return "full"; // Sunday closed
    var seed = (d.getDate() * 7 + d.getMonth() * 13 + dow * 3) % 10;
    if (seed < 2) return "full";
    if (seed < 5) return "few";
    return "open";
  }

  function slotState(d, hourKey) {
    var seed = (d.getDate() * 3 + hourKey * 5 + d.getDay()) % 7;
    if (seed === 0 || seed === 1) return "booked";
    if (seed === 2) return "few";
    return "open";
  }

  var weekEl = $("#week");
  var calMonth = $("#calMonth");
  var calPrev = $("#calPrev");
  var calNext = $("#calNext");

  function startOfWeek(offset) {
    var d = new Date(baseDate);
    d.setDate(d.getDate() + offset * 7);
    return d;
  }

  function renderWeek() {
    weekEl.innerHTML = "";
    var start = startOfWeek(weekOffset);
    calMonth.textContent = MONTHS[start.getMonth()] + " " + start.getFullYear();
    calPrev.disabled = weekOffset <= 0;

    for (var i = 0; i < 7; i++) {
      (function (i) {
        var d = new Date(start);
        d.setDate(start.getDate() + i);
        var avail = dayAvailability(d);
        var full = avail === "full";
        var iso = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "day" + (full ? " is-full" : "");
        btn.disabled = full;
        btn.setAttribute("role", "option");
        btn.setAttribute("aria-label", DOW[d.getDay()] + " " + d.getDate() + " " +
          MONTHS[d.getMonth()] + (full ? ", fully booked" : ", available"));
        btn.innerHTML = '<span class="dow">' + DOW[d.getDay()] + '</span>' +
          '<span class="dnum">' + d.getDate() + '</span>';

        if (state.day && state.day.iso === iso) {
          btn.classList.add("is-selected");
          btn.setAttribute("aria-selected", "true");
        }

        btn.addEventListener("click", function () {
          $$(".day", weekEl).forEach(function (b) {
            b.classList.remove("is-selected");
            b.setAttribute("aria-selected", "false");
          });
          btn.classList.add("is-selected");
          btn.setAttribute("aria-selected", "true");
          var label = DOW[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3);
          state.day = { label: label, iso: iso, dateObj: new Date(d) };
          state.slot = null;
          state.period = null;
          renderSlots(d);
          syncSummary();
          validateNav();
        });

        weekEl.appendChild(btn);
      })(i);
    }
  }

  var SLOT_TIMES = {
    Morning: [["08:30", 8], ["09:15", 9], ["10:00", 10], ["10:45", 10], ["11:30", 11]],
    Afternoon: [["13:00", 13], ["13:45", 13], ["14:30", 14], ["15:15", 15], ["16:00", 16]],
    Evening: [["17:00", 17], ["17:45", 17], ["18:30", 18]]
  };
  var TAGS = { open: "Available", few: "Few left", booked: "Booked" };

  function renderSlots(d) {
    ["Morning", "Afternoon", "Evening"].forEach(function (period) {
      var wrap = $("#slots" + period);
      wrap.innerHTML = "";
      SLOT_TIMES[period].forEach(function (t) {
        var time = t[0], hourKey = t[1];
        var st = slotState(d, hourKey);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "slot " + st;
        btn.disabled = st === "booked";
        btn.setAttribute("aria-label", time + ", " + TAGS[st]);
        btn.innerHTML = '<span class="time">' + time + '</span>' +
          '<span class="tag">' + TAGS[st] + '</span>';

        if (st !== "booked") {
          btn.addEventListener("click", function () {
            $$(".slot").forEach(function (s) { s.classList.remove("is-selected"); s.setAttribute("aria-pressed", "false"); });
            btn.classList.add("is-selected");
            btn.setAttribute("aria-pressed", "true");
            state.slot = time;
            state.period = period;
            syncSummary();
            validateNav();
            if (st === "few") toast("Nice — that's one of the last slots that day.");
          });
        }
        wrap.appendChild(btn);
      });
    });
  }

  calPrev.addEventListener("click", function () { if (weekOffset > 0) { weekOffset--; renderWeek(); } });
  calNext.addEventListener("click", function () { weekOffset++; renderWeek(); });

  /* ---------- Summary ---------- */
  function setV(id, val) {
    var el = $("#" + id);
    if (val) { el.textContent = val; el.classList.add("set"); }
    else { el.classList.remove("set"); }
  }
  function syncSummary() {
    setV("sTreat", state.treatment); if (!state.treatment) $("#sTreat").textContent = "Not chosen";
    $("#sDur").textContent = state.duration || "—";
    $("#sPrice").textContent = state.price || "—";
    setV("sDentist", state.dentist); if (!state.dentist) $("#sDentist").textContent = "Not chosen";
    if (state.day && state.slot) {
      setV("sWhen", state.day.label + " · " + state.slot);
    } else {
      $("#sWhen").textContent = "Not chosen"; $("#sWhen").classList.remove("set");
    }
  }

  /* ---------- Step navigation ---------- */
  var backBtn = $("#backBtn");
  var nextBtn = $("#nextBtn");

  function showStep(n) {
    state.step = n;
    $$(".panel").forEach(function (p) {
      p.hidden = parseInt(p.getAttribute("data-panel"), 10) !== n;
    });
    $$(".step").forEach(function (s) {
      var sn = parseInt(s.getAttribute("data-step"), 10);
      s.classList.toggle("is-active", sn === n);
      s.classList.toggle("is-done", sn < n);
    });
    backBtn.disabled = n <= 1;
    nextBtn.textContent = n === TOTAL_STEPS ? "Confirm booking" : "Continue";
    $("#nav").style.display = n > TOTAL_STEPS ? "none" : "flex";
    validateNav();
    // scroll panel into view on small screens
    if (window.innerWidth < 900) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateNav() {
    var ok = true;
    if (state.step === 1) ok = !!state.treatment;
    if (state.step === 2) ok = !!state.dentist;
    if (state.step === 3) ok = !!(state.day && state.slot);
    nextBtn.disabled = !ok;
  }

  backBtn.addEventListener("click", function () {
    if (state.step > 1) showStep(state.step - 1);
  });

  nextBtn.addEventListener("click", function () {
    if (state.step === 1 && !state.treatment) return toast("Please choose a treatment.");
    if (state.step === 2 && !state.dentist) return toast("Please pick a dentist.");
    if (state.step === 3 && !(state.day && state.slot)) return toast("Please choose a date and time.");
    if (state.step === 4) { submitBooking(); return; }
    showStep(state.step + 1);
  });

  /* ---------- Step 4 validation + submit ---------- */
  function setFieldError(name, msg) {
    var input = $('[name="' + name + '"]');
    var field = input.closest(".field");
    var err = $('.err[data-for="' + name + '"]');
    if (msg) { field.classList.add("has-error"); err.textContent = msg; }
    else { field.classList.remove("has-error"); err.textContent = ""; }
  }

  ["name", "phone", "email"].forEach(function (name) {
    var input = $('[name="' + name + '"]');
    input.addEventListener("input", function () { setFieldError(name, ""); });
  });

  function validateDetails() {
    var name = $('[name="name"]').value.trim();
    var phone = $('[name="phone"]').value.trim();
    var email = $('[name="email"]').value.trim();
    var ok = true;
    if (name.length < 2) { setFieldError("name", "Please enter your full name."); ok = false; }
    var digits = phone.replace(/[^0-9]/g, "");
    if (digits.length < 7) { setFieldError("phone", "Enter a valid contact number."); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError("email", "Enter a valid email address."); ok = false; }
    return ok ? { name: name, phone: phone, email: email } : null;
  }

  function makeRef() {
    var s = "BSD-";
    for (var i = 0; i < 6; i++) s += "ABCDEFGHJKMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 30));
    return s;
  }

  function submitBooking() {
    var details = validateDetails();
    if (!details) { toast("Please fix the highlighted fields."); return; }

    $("#cRef").textContent = makeRef();
    $("#cTreat").textContent = state.treatment;
    $("#cDentist").textContent = state.dentist;
    $("#cWhen").textContent = state.day.label + " · " + state.slot + " (" + state.period + ")";
    $("#cName").textContent = details.name;
    $("#cEmail").textContent = details.email;

    // show confirmation panel
    $$(".panel").forEach(function (p) { p.hidden = parseInt(p.getAttribute("data-panel"), 10) !== 5; });
    $$(".step").forEach(function (s) { s.classList.remove("is-active"); s.classList.add("is-done"); });
    $("#nav").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Appointment confirmed — see you soon!");
  }

  $("#againBtn").addEventListener("click", function () {
    // reset
    state = { step: 1, treatment: null, duration: null, price: null, dentist: null, day: null, slot: null, period: null };
    $("#bookingForm").reset();
    $$(".card").forEach(function (c) { c.classList.remove("is-selected"); c.setAttribute("aria-checked", "false"); });
    ["name", "phone", "email"].forEach(function (n) { setFieldError(n, ""); });
    $("#slotsMorning").innerHTML = "";
    $("#slotsAfternoon").innerHTML = "";
    $("#slotsEvening").innerHTML = "";
    weekOffset = 0;
    renderWeek();
    syncSummary();
    showStep(1);
  });

  /* ---------- Init ---------- */
  renderWeek();
  syncSummary();
  showStep(1);
})();
