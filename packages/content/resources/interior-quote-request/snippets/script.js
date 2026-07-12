(function () {
  "use strict";

  var MAX_STYLES = 3;
  var MIN_ROOMS = 1;
  var MAX_ROOMS = 12;

  var state = {
    ptype: "Full home",
    base: 24000,
    rooms: 3,
    budget: 40000,
    styles: [],
    timeline: "Flexible",
    tmult: 0.94,
  };

  // --- helpers ---
  var fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  function money(n) {
    return fmt.format(Math.round(n));
  }
  function $(sel) {
    return document.querySelector(sel);
  }
  function $all(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  // --- estimate math ---
  function computeRange() {
    // room factor scales sub-linearly for larger scopes
    var roomFactor = 0.55 + state.rooms * 0.18;
    var budgetTier = state.budget / 42000; // ~1 at the mid mark
    var styleFactor = 1 + state.styles.length * 0.04;
    var core = state.base * roomFactor * budgetTier * styleFactor * state.tmult;
    // blend with the stated budget so the range stays believable
    var blended = core * 0.6 + state.budget * 0.4;
    var low = blended * 0.82;
    var high = blended * 1.18;
    return { low: low, high: high };
  }

  var railRange = $("#estRange");
  function bumpRange() {
    railRange.classList.remove("bump");
    // force reflow to restart the transition
    void railRange.offsetWidth;
    railRange.classList.add("bump");
  }

  function render() {
    var r = computeRange();
    railRange.textContent = money(r.low) + " – " + money(r.high);
    bumpRange();

    $("#sumType").textContent = state.ptype;
    $("#sumRooms").textContent = state.rooms;
    $("#sumBudget").textContent = money(state.budget);
    $("#sumStyles").textContent = state.styles.length
      ? state.styles.join(", ")
      : "—";
    $("#sumTimeline").textContent = state.timeline;
  }

  // --- project type ---
  $all('input[name="ptype"]').forEach(function (input) {
    input.addEventListener("change", function () {
      state.ptype = input.value;
      state.base = parseInt(input.dataset.base, 10);
      render();
    });
  });

  // --- rooms stepper ---
  var roomVal = $("#roomVal");
  var minusBtn = $("#roomMinus");
  var plusBtn = $("#roomPlus");
  function setRooms(n) {
    state.rooms = Math.max(MIN_ROOMS, Math.min(MAX_ROOMS, n));
    roomVal.textContent = state.rooms;
    minusBtn.disabled = state.rooms <= MIN_ROOMS;
    plusBtn.disabled = state.rooms >= MAX_ROOMS;
    render();
  }
  minusBtn.addEventListener("click", function () {
    setRooms(state.rooms - 1);
  });
  plusBtn.addEventListener("click", function () {
    setRooms(state.rooms + 1);
  });

  // --- budget slider ---
  var budget = $("#budget");
  var budgetRead = $("#budgetRead");
  function paintSlider() {
    var pct =
      ((budget.value - budget.min) / (budget.max - budget.min)) * 100;
    budget.style.backgroundSize = pct + "% 100%";
  }
  budget.addEventListener("input", function () {
    state.budget = parseInt(budget.value, 10);
    budgetRead.textContent =
      state.budget >= 150000 ? "$150,000+" : money(state.budget);
    paintSlider();
    render();
  });

  // --- style chips ---
  var chips = $all(".chip");
  var styleCount = $("#styleCount");
  function refreshChipLocks() {
    var atMax = state.styles.length >= MAX_STYLES;
    chips.forEach(function (chip) {
      var on = chip.getAttribute("aria-pressed") === "true";
      chip.classList.toggle("is-locked", atMax && !on);
    });
    styleCount.textContent = state.styles.length
      ? state.styles.length + " of " + MAX_STYLES + " selected"
      : "Pick up to " + MAX_STYLES;
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var name = chip.dataset.style;
      var on = chip.getAttribute("aria-pressed") === "true";
      if (on) {
        chip.setAttribute("aria-pressed", "false");
        state.styles = state.styles.filter(function (s) {
          return s !== name;
        });
      } else {
        if (state.styles.length >= MAX_STYLES) {
          toast("Up to " + MAX_STYLES + " styles — deselect one first");
          return;
        }
        chip.setAttribute("aria-pressed", "true");
        state.styles.push(name);
      }
      refreshChipLocks();
      render();
    });
  });

  // --- timeline ---
  $all('input[name="timeline"]').forEach(function (input) {
    input.addEventListener("change", function () {
      state.timeline = input.value;
      state.tmult = parseFloat(input.dataset.mult);
      render();
    });
  });

  // --- validation ---
  function validateField(input, msg, test) {
    var wrap = input.closest(".input-wrap");
    var err = wrap.querySelector(".err");
    var ok = test(input.value.trim());
    wrap.classList.toggle("invalid", !ok);
    err.textContent = ok ? "" : msg;
    return ok;
  }
  var nameInput = $("#name");
  var emailInput = $("#email");
  function checkName() {
    return validateField(nameInput, "Please enter your name", function (v) {
      return v.length >= 2;
    });
  }
  function checkEmail() {
    return validateField(emailInput, "Enter a valid email", function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    });
  }
  nameInput.addEventListener("blur", checkName);
  emailInput.addEventListener("blur", checkEmail);
  nameInput.addEventListener("input", function () {
    if (nameInput.closest(".input-wrap").classList.contains("invalid")) checkName();
  });
  emailInput.addEventListener("input", function () {
    if (emailInput.closest(".input-wrap").classList.contains("invalid")) checkEmail();
  });

  // --- submit ---
  var form = $("#quoteForm");
  var confirmSec = $("#confirm");
  var confirmGrid = $("#confirmGrid");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var okName = checkName();
    var okEmail = checkEmail();
    if (!okName || !okEmail) {
      toast("Please fix the highlighted fields");
      (okName ? emailInput : nameInput).focus();
      return;
    }

    var r = computeRange();
    var rows = [
      ["Project", state.ptype],
      ["Rooms", String(state.rooms)],
      ["Budget", money(state.budget)],
      ["Styles", state.styles.length ? state.styles.join(", ") : "Open to ideas"],
      ["Timeline", state.timeline],
      ["Estimate", money(r.low) + " – " + money(r.high)],
    ];
    confirmGrid.innerHTML = rows
      .map(function (row) {
        return (
          "<div><dt>" + row[0] + "</dt><dd>" + row[1] + "</dd></div>"
        );
      })
      .join("");

    $("#cName").textContent = nameInput.value.trim().split(" ")[0];
    $("#cEmail").textContent = emailInput.value.trim();

    form.hidden = true;
    $(".rail").hidden = true;
    confirmSec.hidden = false;
    confirmSec.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Request queued — we'll be in touch");
  });

  $("#editBtn").addEventListener("click", function () {
    confirmSec.hidden = true;
    form.hidden = false;
    $(".rail").hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // --- init ---
  paintSlider();
  setRooms(state.rooms);
  refreshChipLocks();
  render();
})();
