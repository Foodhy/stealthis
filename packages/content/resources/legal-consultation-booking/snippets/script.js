(function () {
  "use strict";

  var state = {
    area: null,
    attorney: "No preference",
    date: null, // Date object
    time: null,
  };

  var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);

  // A deterministic pool of times; some are "booked" per-day for realism.
  var allTimes = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Step 1 & 2: chips ---------- */
  function wireRadioGroup(container, onPick) {
    var buttons = container.querySelectorAll("button");
    buttons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        onPick(btn);
      });
    });
  }

  wireRadioGroup($("areas"), function (btn) {
    state.area = btn.getAttribute("data-area").replace(/&amp;/g, "&");
    $("sumArea").textContent = state.area;
    hide($("err-area"));
  });

  wireRadioGroup($("attorneys"), function (btn) {
    state.attorney = btn.getAttribute("data-atty");
    $("sumAtty").textContent = state.attorney;
  });

  /* ---------- Step 3: calendar ---------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function isoDay(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  // pseudo-random but stable per day, used to mark some slots booked
  function dayHash(d) {
    var s = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
    return s;
  }

  function buildCalendar() {
    $("calMonth").textContent = monthNames[view.getMonth()] + " " + view.getFullYear();
    var grid = $("calGrid");
    grid.innerHTML = "";

    var first = new Date(view.getFullYear(), view.getMonth(), 1);
    // Monday-first offset
    var startOffset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

    for (var i = 0; i < startOffset; i++) {
      var blank = document.createElement("div");
      blank.className = "cal__day is-empty";
      blank.setAttribute("aria-hidden", "true");
      grid.appendChild(blank);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var d = new Date(view.getFullYear(), view.getMonth(), day);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal__day";
      btn.textContent = day;
      btn.setAttribute("role", "gridcell");
      btn.setAttribute("aria-selected", "false");

      var weekend = d.getDay() === 0 || d.getDay() === 6;
      var past = d < today;
      btn.setAttribute("aria-label", labelFor(d));

      if (weekend || past) {
        btn.disabled = true;
      } else {
        (function (dateObj) {
          btn.addEventListener("click", function () {
            selectDate(dateObj, btn);
          });
        })(d);
      }

      // keep current selection highlighted across re-renders
      if (state.date && isoDay(state.date) === isoDay(d)) {
        btn.setAttribute("aria-selected", "true");
      }

      grid.appendChild(btn);
    }
  }

  function labelFor(d) {
    return d.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  }

  function selectDate(d, btn) {
    state.date = d;
    state.time = null;
    // clear previous selection
    var cells = $("calGrid").querySelectorAll(".cal__day");
    cells.forEach(function (c) { c.setAttribute("aria-selected", "false"); });
    btn.setAttribute("aria-selected", "true");

    $("sumDate").textContent = labelFor(d);
    $("sumTime").textContent = "—";
    hide($("err-date"));
    renderSlots(d);
  }

  function renderSlots(d) {
    var wrap = $("slots");
    var grid = $("slotGrid");
    grid.innerHTML = "";
    wrap.hidden = false;

    var h = dayHash(d);
    allTimes.forEach(function (t, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.textContent = t;
      btn.setAttribute("aria-pressed", "false");

      // mark ~2 slots booked deterministically
      var booked = (h + idx * 7) % 5 === 0;
      if (booked) {
        btn.disabled = true;
        btn.setAttribute("aria-label", t + " — unavailable");
      } else {
        btn.addEventListener("click", function () {
          grid.querySelectorAll(".slot").forEach(function (s) { s.setAttribute("aria-pressed", "false"); });
          btn.setAttribute("aria-pressed", "true");
          state.time = t;
          $("sumTime").textContent = t;
          hide($("err-time"));
        });
      }
      grid.appendChild(btn);
    });
  }

  $("prevMonth").addEventListener("click", function () {
    var candidate = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    // do not navigate before current month
    var floor = new Date(today.getFullYear(), today.getMonth(), 1);
    if (candidate < floor) return;
    view = candidate;
    buildCalendar();
  });
  $("nextMonth").addEventListener("click", function () {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    buildCalendar();
  });

  /* ---------- Step 4: fields ---------- */
  var matter = $("matter");
  matter.addEventListener("input", function () {
    $("count").textContent = matter.value.length;
  });

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
  function validPhone(v) { return v.replace(/[^\d]/g, "").length >= 7; }

  // clear field errors on input
  ["name", "email", "phone"].forEach(function (id) {
    $(id).addEventListener("input", function () {
      $(id).classList.remove("invalid");
      hide($("err-" + id));
    });
  });
  $("consent").addEventListener("change", function () { hide($("err-consent")); });

  /* ---------- Submit ---------- */
  $("booking").addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var firstBad = null;

    function fail(errEl, fieldEl) {
      ok = false;
      show(errEl);
      if (fieldEl) fieldEl.classList.add("invalid");
      if (!firstBad) firstBad = (fieldEl || errEl);
    }

    if (!state.area) fail($("err-area"));
    if (!state.date) fail($("err-date"));
    if (!state.time) fail($("err-time"));

    var name = $("name"), email = $("email"), phone = $("phone");
    if (!name.value.trim()) fail($("err-name"), name);
    if (!validEmail(email.value)) fail($("err-email"), email);
    if (!validPhone(phone.value)) fail($("err-phone"), phone);
    if (!$("consent").checked) fail($("err-consent"));

    if (!ok) {
      if (firstBad && firstBad.scrollIntoView) {
        firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
        if (firstBad.focus) firstBad.focus();
      }
      return;
    }

    succeed(name.value.trim());
  });

  function refNumber() {
    var n = Math.floor(1000 + Math.random() * 9000);
    var y = new Date().getFullYear();
    return "WR-" + y + "-" + n;
  }

  function succeed(name) {
    var ref = refNumber();
    $("doneRef").textContent = ref;

    var rows = [
      ["Client", name],
      ["Practice area", state.area],
      ["Attorney", state.attorney],
      ["Date", labelFor(state.date)],
      ["Time", state.time],
    ];
    var list = $("doneDetails");
    list.innerHTML = "";
    rows.forEach(function (r) {
      var div = document.createElement("div");
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = r[0];
      dd.textContent = r[1];
      div.appendChild(dt);
      div.appendChild(dd);
      list.appendChild(div);
    });

    $("done").hidden = false;
  }

  $("again").addEventListener("click", function () {
    $("done").hidden = true;
    $("booking").reset();
    state.area = null;
    state.attorney = "No preference";
    state.date = null;
    state.time = null;
    $("sumArea").textContent = "—";
    $("sumAtty").textContent = "First available";
    $("sumDate").textContent = "—";
    $("sumTime").textContent = "—";
    $("count").textContent = "0";
    $("slots").hidden = true;
    document.querySelectorAll('[aria-pressed="true"]').forEach(function (b) {
      b.setAttribute("aria-pressed", "false");
    });
    document.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
    document.querySelectorAll(".error").forEach(function (el) { el.hidden = true; });
    view = new Date(today.getFullYear(), today.getMonth(), 1);
    buildCalendar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- init ---------- */
  buildCalendar();
})();
