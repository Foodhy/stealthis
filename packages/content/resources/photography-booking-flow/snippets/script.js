(function () {
  "use strict";

  var TOTAL_STEPS = 4;
  var state = {
    step: 1,
    type: null,
    typeLabel: "",
    price: 0,
    length: "",
    date: null,
    dateLabel: "",
    time: null,
    name: "",
    email: "",
    phone: "",
    place: "Studio — Aperture Loft",
    notes: ""
  };

  var form = document.getElementById("bookingForm");
  var panels = Array.prototype.slice.call(form.querySelectorAll(".panel"));
  var steps = Array.prototype.slice.call(document.querySelectorAll(".stepper .step"));
  var progressFill = document.querySelector(".progress-fill");
  var progressBar = document.querySelector(".progress");
  var backBtn = document.getElementById("backBtn");
  var nextBtn = document.getElementById("nextBtn");
  var confirmBtn = document.getElementById("confirmBtn");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  /* ---------- Toast ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 320);
    }, 2400);
  }

  /* ---------- Step 1: session cards ---------- */
  var cards = Array.prototype.slice.call(form.querySelectorAll(".card"));
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      cards.forEach(function (c) { c.setAttribute("aria-checked", "false"); });
      card.setAttribute("aria-checked", "true");
      state.type = card.dataset.type;
      state.typeLabel = card.querySelector(".card-name").textContent.trim();
      state.price = parseInt(card.dataset.price, 10);
      state.length = card.dataset.len;
      hideError("type");
      updateNav();
      toast(state.typeLabel + " selected");
    });
  });

  /* ---------- Step 2: build date strip ---------- */
  var dateStrip = document.getElementById("dateStrip");
  var slotGrid = document.getElementById("slotGrid");
  var slotHint = document.getElementById("slotHint");
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var ALL_SLOTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"];

  function buildDates() {
    var frag = document.createDocumentFragment();
    var base = new Date();
    base.setHours(0, 0, 0, 0);
    for (var i = 1; i <= 10; i++) {
      var d = new Date(base.getTime());
      d.setDate(base.getDate() + i);
      var iso = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      var label = DOW[d.getDay()] + ", " + MON[d.getMonth()] + " " + d.getDate();
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "date";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", "false");
      btn.setAttribute("aria-label", label);
      btn.dataset.iso = iso;
      btn.dataset.label = label;
      btn.dataset.seed = String((d.getDate() + d.getDay()) % ALL_SLOTS.length);
      btn.innerHTML =
        '<span class="dow">' + DOW[d.getDay()] + "</span>" +
        '<span class="dnum">' + d.getDate() + "</span>" +
        '<span class="dmon">' + MON[d.getMonth()] + "</span>";
      btn.addEventListener("click", function (e) {
        var t = e.currentTarget;
        Array.prototype.forEach.call(dateStrip.children, function (c) { c.setAttribute("aria-checked", "false"); });
        t.setAttribute("aria-checked", "true");
        state.date = t.dataset.iso;
        state.dateLabel = t.dataset.label;
        state.time = null;
        hideError("date");
        buildSlots(parseInt(t.dataset.seed, 10));
        updateNav();
      });
      frag.appendChild(btn);
    }
    dateStrip.appendChild(frag);
  }

  function buildSlots(seed) {
    slotGrid.innerHTML = "";
    slotHint.hidden = true;
    ALL_SLOTS.forEach(function (time, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", "false");
      btn.textContent = time;
      // deterministically mark a couple slots as taken based on the date seed
      var taken = ((idx + seed) % 3 === 0) || ((idx * 2 + seed) % 5 === 0);
      if (taken) {
        btn.disabled = true;
        btn.setAttribute("aria-label", time + " — unavailable");
      } else {
        btn.addEventListener("click", function () {
          Array.prototype.forEach.call(slotGrid.children, function (c) {
            if (!c.disabled) c.setAttribute("aria-checked", "false");
          });
          btn.setAttribute("aria-checked", "true");
          state.time = time;
          hideError("time");
          updateNav();
        });
      }
      slotGrid.appendChild(btn);
    });
  }

  buildDates();

  /* ---------- Step 3: inputs ---------- */
  var inputName = form.elements.name;
  var inputEmail = form.elements.email;
  var inputPhone = form.elements.phone;
  var inputPlace = form.elements.place;
  var inputNotes = form.elements.notes;
  var inputAgree = form.elements.agree;

  [inputName, inputEmail, inputPhone].forEach(function (el) {
    el.addEventListener("input", function () {
      el.classList.remove("invalid");
      hideError(el.name);
      updateNav();
    });
  });
  inputAgree.addEventListener("change", function () { hideError("agree"); updateNav(); });

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validPhone(v) { return (v.replace(/\D/g, "").length >= 7); }

  /* ---------- Error helpers ---------- */
  function showError(key) {
    var el = form.querySelector('[data-err="' + key + '"]');
    if (el) el.hidden = false;
  }
  function hideError(key) {
    var el = form.querySelector('[data-err="' + key + '"]');
    if (el) el.hidden = true;
  }

  /* ---------- Step completeness (for enabling Next) ---------- */
  function stepComplete(step) {
    if (step === 1) return !!state.type;
    if (step === 2) return !!state.date && !!state.time;
    if (step === 3) {
      return inputName.value.trim() &&
        validEmail(inputEmail.value.trim()) &&
        validPhone(inputPhone.value.trim()) &&
        inputAgree.checked;
    }
    return true;
  }

  /* ---------- Validate with error messages ---------- */
  function validateStep(step) {
    var ok = true;
    if (step === 1) {
      if (!state.type) { showError("type"); ok = false; }
    } else if (step === 2) {
      if (!state.date) { showError("date"); ok = false; }
      if (!state.time) { showError("time"); ok = false; }
    } else if (step === 3) {
      if (!inputName.value.trim()) { showError("name"); inputName.classList.add("invalid"); ok = false; }
      if (!validEmail(inputEmail.value.trim())) { showError("email"); inputEmail.classList.add("invalid"); ok = false; }
      if (!validPhone(inputPhone.value.trim())) { showError("phone"); inputPhone.classList.add("invalid"); ok = false; }
      if (!inputAgree.checked) { showError("agree"); ok = false; }
    }
    return ok;
  }

  /* ---------- Navigation / rendering ---------- */
  function render() {
    panels.forEach(function (p) {
      var isCurrent = p.dataset.panel === String(state.step);
      p.hidden = !isCurrent;
      p.classList.toggle("is-active", isCurrent);
    });

    steps.forEach(function (s) {
      var n = parseInt(s.dataset.step, 10);
      s.classList.toggle("is-active", n === state.step);
      s.classList.toggle("is-done", n < state.step);
    });

    var pct = Math.round((state.step / TOTAL_STEPS) * 100);
    progressFill.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", String(pct));

    backBtn.hidden = state.step === 1;
    nextBtn.hidden = state.step === TOTAL_STEPS;
    confirmBtn.hidden = state.step !== TOTAL_STEPS;

    updateNav();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateNav() {
    if (state.step < TOTAL_STEPS) {
      nextBtn.disabled = !stepComplete(state.step);
    }
  }

  function goTo(step) {
    state.step = step;
    if (step === 4) buildReview();
    render();
  }

  nextBtn.addEventListener("click", function () {
    // sync latest field values into state before validating step 3
    if (state.step === 3) syncDetails();
    if (!validateStep(state.step)) {
      toast("Please complete this step");
      return;
    }
    goTo(state.step + 1);
  });

  backBtn.addEventListener("click", function () {
    if (state.step > 1) goTo(state.step - 1);
  });

  function syncDetails() {
    state.name = inputName.value.trim();
    state.email = inputEmail.value.trim();
    state.phone = inputPhone.value.trim();
    state.place = inputPlace.value;
    state.notes = inputNotes.value.trim();
  }

  /* ---------- Review ---------- */
  var reviewList = document.getElementById("reviewList");
  var reviewTotal = document.getElementById("reviewTotal");

  function rows(target, data) {
    target.innerHTML = "";
    data.forEach(function (r) {
      var wrap = document.createElement("div");
      wrap.className = "row";
      var dt = document.createElement("dt");
      dt.textContent = r[0];
      var dd = document.createElement("dd");
      dd.textContent = r[1];
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      target.appendChild(wrap);
    });
  }

  function buildReview() {
    syncDetails();
    var data = [
      ["Session", state.typeLabel + " · " + state.length],
      ["Date", state.dateLabel],
      ["Time", state.time],
      ["Location", state.place],
      ["Name", state.name],
      ["Email", state.email],
      ["Phone", state.phone]
    ];
    if (state.notes) data.push(["Notes", state.notes]);
    rows(reviewList, data);
    reviewTotal.textContent = "$" + state.price + (state.type === "event" ? " /hr" : "");
  }

  /* ---------- Confirm / submit ---------- */
  var doneSummary = document.getElementById("doneSummary");
  var refCode = document.getElementById("refCode");

  function makeRef() {
    var n = "";
    for (var i = 0; i < 6; i++) n += Math.floor(Math.random() * 10);
    return "APT-" + n;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    // final safety validation of all gated steps
    if (!state.type || !state.date || !state.time || !stepComplete(3)) {
      toast("Something is missing — please review");
      return;
    }
    refCode.textContent = makeRef();
    rows(doneSummary, [
      ["Session", state.typeLabel],
      ["When", state.dateLabel + " · " + state.time],
      ["Total", "$" + state.price + (state.type === "event" ? " /hr" : "")],
      ["Confirmation sent to", state.email]
    ]);

    // hide stepper/progress/nav, show confirmation panel
    panels.forEach(function (p) {
      var done = p.dataset.panel === "done";
      p.hidden = !done;
      p.classList.toggle("is-active", done);
    });
    document.getElementById("navBar").hidden = true;
    steps.forEach(function (s) { s.classList.add("is-done"); s.classList.remove("is-active"); });
    progressFill.style.width = "100%";
    progressBar.setAttribute("aria-valuenow", "100");
    toast("Booking confirmed ✓");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Restart ---------- */
  document.getElementById("restartBtn").addEventListener("click", function () {
    // reset state
    state.step = 1; state.type = null; state.typeLabel = ""; state.price = 0; state.length = "";
    state.date = null; state.dateLabel = ""; state.time = null;
    state.name = ""; state.email = ""; state.phone = ""; state.place = "Studio — Aperture Loft"; state.notes = "";

    cards.forEach(function (c) { c.setAttribute("aria-checked", "false"); });
    Array.prototype.forEach.call(dateStrip.children, function (c) { c.setAttribute("aria-checked", "false"); });
    slotGrid.innerHTML = "";
    slotHint.hidden = false;
    form.reset();
    [inputName, inputEmail, inputPhone].forEach(function (el) { el.classList.remove("invalid"); });
    ["type", "date", "time", "name", "email", "phone", "agree"].forEach(hideError);
    document.getElementById("navBar").hidden = false;
    render();
    toast("Let's book another shoot");
  });

  /* ---------- Init ---------- */
  render();
})();
