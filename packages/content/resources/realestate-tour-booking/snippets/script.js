(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3600);
  }

  /* ---------- State ---------- */
  var state = { type: "in-person", date: null, slot: null };

  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var BASE_SLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM", "6:00 PM"];

  // Deterministic "booked" slots per day so the UI feels real and disables some.
  function bookedFor(dayIndex) {
    var picks = {
      0: ["12:00 PM", "4:30 PM"],
      1: ["10:30 AM"],
      2: ["9:00 AM", "1:30 PM", "6:00 PM"],
      3: ["3:00 PM"],
      4: ["10:30 AM", "4:30 PM"],
      5: ["9:00 AM", "12:00 PM", "3:00 PM"],
      6: ["1:30 PM"]
    };
    return picks[dayIndex] || [];
  }

  /* ---------- Elements ---------- */
  var dateStrip = document.getElementById("dateStrip");
  var slotGrid = document.getElementById("slotGrid");
  var slotHint = document.getElementById("slotHint");
  var summary = document.getElementById("summary");
  var summaryText = document.getElementById("summaryText");
  var confirmBtn = document.getElementById("confirmBtn");
  var typeBtns = document.querySelectorAll(".toggle__opt");

  /* ---------- Build date strip (next 7 days) ---------- */
  var days = [];
  function buildDates() {
    var today = new Date();
    for (var i = 0; i < 7; i++) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      days.push(d);

      var el = document.createElement("button");
      el.type = "button";
      el.className = "date";
      el.setAttribute("role", "option");
      el.setAttribute("aria-selected", "false");
      el.dataset.idx = String(i);
      el.innerHTML =
        '<span class="dow">' + (i === 0 ? "Today" : DOW[d.getDay()]) + "</span>" +
        '<span class="dnum">' + d.getDate() + "</span>" +
        '<span class="mon">' + MON[d.getMonth()] + "</span>";
      el.addEventListener("click", function () {
        selectDate(parseInt(this.dataset.idx, 10));
      });
      dateStrip.appendChild(el);
    }
  }

  function selectDate(idx) {
    state.date = idx;
    state.slot = null;
    Array.prototype.forEach.call(dateStrip.children, function (c, i) {
      var on = i === idx;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderSlots(idx);
    update();
  }

  /* ---------- Slots ---------- */
  function renderSlots(idx) {
    slotGrid.innerHTML = "";
    var booked = bookedFor(idx);
    var available = 0;

    BASE_SLOTS.forEach(function (time) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "slot";
      b.setAttribute("role", "option");
      b.textContent = time;
      if (booked.indexOf(time) !== -1) {
        b.disabled = true;
        b.title = "Already booked";
        b.setAttribute("aria-disabled", "true");
      } else {
        available++;
        b.setAttribute("aria-selected", "false");
        b.addEventListener("click", function () {
          state.slot = time;
          Array.prototype.forEach.call(slotGrid.querySelectorAll(".slot"), function (s) {
            var on = s === b;
            s.classList.toggle("is-active", on);
            if (!s.disabled) s.setAttribute("aria-selected", on ? "true" : "false");
          });
          update();
        });
      }
      slotGrid.appendChild(b);
    });

    slotHint.textContent = "(" + available + " of " + BASE_SLOTS.length + " open)";
  }

  /* ---------- Tour type toggle ---------- */
  Array.prototype.forEach.call(typeBtns, function (btn) {
    btn.addEventListener("click", function () {
      state.type = this.dataset.type;
      Array.prototype.forEach.call(typeBtns, function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-checked", on ? "true" : "false");
      });
      update();
    });
  });

  /* ---------- Summary / readiness ---------- */
  function prettyDate(idx) {
    var d = days[idx];
    return DOW[d.getDay()] + ", " + MON[d.getMonth()] + " " + d.getDate();
  }

  function update() {
    var ready = state.date !== null && state.slot !== null;
    var typeLabel = state.type === "video" ? "Video tour" : "In-person tour";

    if (ready) {
      summaryText.innerHTML =
        "<strong>" + typeLabel + "</strong> &middot; " +
        prettyDate(state.date) + " at <strong>" + state.slot + "</strong>";
      summary.classList.add("is-ready");
    } else {
      var parts = [];
      if (state.date === null) parts.push("a date");
      if (state.slot === null) parts.push("a time");
      summaryText.textContent =
        typeLabel + " selected — now pick " + parts.join(" and ") + ".";
      summary.classList.remove("is-ready");
    }
    confirmBtn.disabled = !ready;
  }

  /* ---------- Confirm ---------- */
  confirmBtn.addEventListener("click", function () {
    if (confirmBtn.disabled) return;
    var name = (document.getElementById("fName").value || "").trim();
    var email = (document.getElementById("fEmail").value || "").trim();

    if (!name) { toast("Please add your name so the agent can reach you."); return; }
    if (!email || email.indexOf("@") === -1) { toast("Please enter a valid email address."); return; }

    var typeLabel = state.type === "video" ? "Video tour" : "In-person tour";
    toast("<b>Tour requested</b> &middot; " + typeLabel + " on " + prettyDate(state.date) + " at " + state.slot);

    // Lock the chosen slot as if newly booked.
    var chosen = slotGrid.querySelector(".slot.is-active");
    if (chosen) {
      chosen.classList.remove("is-active");
      chosen.disabled = true;
      chosen.title = "Booked by you";
    }
    state.slot = null;
    update();
    renderHint();
  });

  function renderHint() {
    if (state.date === null) return;
    var open = slotGrid.querySelectorAll(".slot:not(:disabled)").length;
    slotHint.textContent = "(" + open + " of " + BASE_SLOTS.length + " open)";
  }

  /* ---------- Open houses ---------- */
  var openHouses = [
    { mon: "Jun", day: 14, title: "Sunset Open House", when: "Sat 1:00 – 4:00 PM", going: 9 },
    { mon: "Jun", day: 18, title: "Twilight Walkthrough", when: "Wed 5:30 – 7:00 PM", going: 4 },
    { mon: "Jun", day: 21, title: "Weekend Showcase", when: "Sat 11:00 AM – 2:00 PM", going: 12 }
  ];

  var openList = document.getElementById("openList");
  openHouses.forEach(function (oh, i) {
    var li = document.createElement("li");
    li.className = "oh";
    li.innerHTML =
      '<span class="oh__cal"><span class="m">' + oh.mon + '</span><span class="d">' + oh.day + "</span></span>" +
      '<span class="oh__info"><b>' + oh.title + "</b><span>" + oh.when + "</span>" +
      '<span class="oh__count" data-count>' + oh.going + " attending</span></span>" +
      '<button type="button" class="oh__btn">RSVP</button>';

    var btn = li.querySelector(".oh__btn");
    var countEl = li.querySelector("[data-count]");
    var going = false;
    btn.addEventListener("click", function () {
      going = !going;
      oh.going += going ? 1 : -1;
      countEl.textContent = oh.going + " attending";
      btn.classList.toggle("is-going", going);
      btn.textContent = going ? "Going ✓" : "RSVP";
      toast(going
        ? "<b>You're on the list</b> for " + oh.title + " &middot; " + oh.when
        : "RSVP cancelled for " + oh.title);
    });
    openList.appendChild(li);
  });

  /* ---------- Init ---------- */
  buildDates();
  selectDate(0);
})();
