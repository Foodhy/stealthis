(function () {
  "use strict";

  // ---------- Config / demo data ----------
  var SERVICE_FEE = 2.5; // per paid ticket
  var MAX_PAID = 10;

  var TICKET_TYPES = [
    { id: "adult",   name: "Adult",            desc: "Ages 18–64",            price: 24, badge: null },
    { id: "senior",  name: "Senior",           desc: "Ages 65+ · ID at door", price: 18, badge: null },
    { id: "student", name: "Student",          desc: "Valid student ID",      price: 16, badge: null },
    { id: "child",   name: "Child",            desc: "Ages 6–17",             price: 10, badge: null },
    { id: "free",    name: "Child 5 & under",  desc: "No charge",             price: 0,  badge: "Free" },
    { id: "member",  name: "Member",           desc: "Present card at door",  price: 0,  badge: "Members" }
  ];

  // Time slots (label, base capacity). Closed days handled separately.
  var SLOT_TEMPLATE = [
    { time: "10:00 AM", cap: 60 },
    { time: "11:30 AM", cap: 60 },
    { time: "1:00 PM",  cap: 45 },
    { time: "2:30 PM",  cap: 45 },
    { time: "4:00 PM",  cap: 30 }
  ];

  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // ---------- State ----------
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var selectedDate = null; // Date
  var selectedSlot = null; // { time, remaining }
  var qty = {};
  TICKET_TYPES.forEach(function (t) { qty[t.id] = 0; });

  // ---------- Elements ----------
  var $ = function (id) { return document.getElementById(id); };
  var calGrid = $("calGrid"), calTitle = $("calTitle");
  var slotsEl = $("slots"), slotSub = $("slotSub");
  var ticketsEl = $("tickets");
  var sumDate = $("sumDate"), sumTime = $("sumTime"), sumQty = $("sumQty");
  var sumLines = $("sumLines"), sumSub = $("sumSub"), sumFee = $("sumFee"), sumTotal = $("sumTotal");
  var checkoutBtn = $("checkout");

  // ---------- Helpers ----------
  function money(n) { return "$" + n.toFixed(2); }

  function isOpenDay(d) { return d.getDay() !== 1; } // closed Mondays

  function sameDate(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function dateKey(d) { return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate(); }

  // Deterministic pseudo-random per date+slot so capacity feels real but stable.
  function seededRemaining(d, idx, cap) {
    var seed = (d.getFullYear() * 1000 + (d.getMonth() + 1) * 40 + d.getDate()) * 7 + idx * 13;
    var r = Math.abs(Math.sin(seed) * 10000) % 1;
    var sold = Math.floor(r * (cap + 8));
    return Math.max(0, cap - sold);
  }

  var dateFmt = new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  });

  // ---------- Toast ----------
  var toastWrap = $("toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 300);
    }, 2600);
  }

  // ---------- Calendar ----------
  function renderCalendar() {
    calTitle.textContent = MONTHS[viewMonth] + " " + viewYear;
    calGrid.innerHTML = "";

    var first = new Date(viewYear, viewMonth, 1);
    var startPad = first.getDay();
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (var p = 0; p < startPad; p++) {
      var pad = document.createElement("div");
      pad.className = "cal-cell is-pad";
      calGrid.appendChild(pad);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var d = new Date(viewYear, viewMonth, day);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-cell";
      btn.textContent = String(day);
      btn.setAttribute("role", "gridcell");

      var past = d < today;
      var closed = !isOpenDay(d);
      var avail = !past && !closed;

      if (avail) {
        btn.classList.add("is-avail");
        btn.setAttribute("aria-label", dateFmt.format(d) + " — available");
        btn.addEventListener("click", makeDatePick(d));
      } else {
        btn.classList.add("is-disabled");
        btn.disabled = true;
        btn.setAttribute("aria-label", dateFmt.format(d) + (closed ? " — closed" : " — unavailable"));
      }
      if (sameDate(d, selectedDate)) {
        btn.classList.add("is-selected");
        btn.setAttribute("aria-current", "date");
      }
      calGrid.appendChild(btn);
    }

    // Disable prev nav when at/before current month
    var prevBtn = $("calPrev");
    var atCurrent = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
    prevBtn.disabled = atCurrent;
  }

  function makeDatePick(d) {
    return function () {
      selectedDate = d;
      selectedSlot = null;
      renderCalendar();
      renderSlots();
      updateSummary();
      toast("Date set — " + dateFmt.format(d), "ok");
    };
  }

  $("calPrev").addEventListener("click", function () {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  $("calNext").addEventListener("click", function () {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  // ---------- Slots ----------
  function renderSlots() {
    slotsEl.innerHTML = "";
    if (!selectedDate) {
      slotSub.textContent = "Select a date to see available times.";
      var msg = document.createElement("p");
      msg.className = "slots-msg";
      msg.textContent = "No date chosen yet.";
      slotsEl.appendChild(msg);
      return;
    }

    slotSub.textContent = "Entry times for " + dateFmt.format(selectedDate);

    SLOT_TEMPLATE.forEach(function (s, idx) {
      var remaining = seededRemaining(selectedDate, idx, s.cap);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", "false");

      var full = remaining === 0;
      var low = !full && remaining <= 10;

      btn.innerHTML =
        '<span class="slot-time">' + s.time + "</span>" +
        '<span class="slot-cap' + (low ? " low" : "") + '">' +
        (full ? "Sold out" : remaining + " left") + "</span>";

      if (full) {
        btn.classList.add("is-full");
        btn.disabled = true;
        btn.setAttribute("aria-disabled", "true");
      } else {
        btn.addEventListener("click", function () {
          selectedSlot = { time: s.time, remaining: remaining };
          Array.prototype.forEach.call(slotsEl.querySelectorAll(".slot"), function (b) {
            b.classList.remove("is-selected");
            b.setAttribute("aria-checked", "false");
          });
          btn.classList.add("is-selected");
          btn.setAttribute("aria-checked", "true");
          updateSummary();
        });
      }

      if (selectedSlot && selectedSlot.time === s.time && !full) {
        btn.classList.add("is-selected");
        btn.setAttribute("aria-checked", "true");
      }
      slotsEl.appendChild(btn);
    });
  }

  // ---------- Tickets ----------
  function totalPaid() {
    return TICKET_TYPES.reduce(function (n, t) {
      return n + (t.price > 0 ? qty[t.id] : 0);
    }, 0);
  }
  function totalGuests() {
    return TICKET_TYPES.reduce(function (n, t) { return n + qty[t.id]; }, 0);
  }

  function renderTickets() {
    ticketsEl.innerHTML = "";
    TICKET_TYPES.forEach(function (t) {
      var li = document.createElement("li");
      li.className = "tk";

      var info = document.createElement("div");
      info.className = "tk-info";
      var nameHtml = '<span class="tk-name">' + t.name +
        (t.badge ? ' <span class="tk-badge">' + t.badge + "</span>" : "") + "</span>" +
        '<span class="tk-desc">' + t.desc + "</span>";
      info.innerHTML = nameHtml;

      var price = document.createElement("div");
      price.className = "tk-price";
      if (t.price === 0) {
        price.innerHTML = '<span class="tk-free">Free</span>';
      } else {
        price.innerHTML = money(t.price) + "<small>per ticket</small>";
      }

      var stepper = document.createElement("div");
      stepper.className = "stepper";
      stepper.setAttribute("role", "group");
      stepper.setAttribute("aria-label", t.name + " quantity");

      var minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", "Remove one " + t.name);

      var q = document.createElement("span");
      q.className = "qty";
      q.id = "qty-" + t.id;
      q.setAttribute("aria-live", "polite");
      q.textContent = "0";

      var plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "Add one " + t.name);

      minus.addEventListener("click", function () { changeQty(t, -1); });
      plus.addEventListener("click", function () { changeQty(t, 1); });

      stepper.appendChild(minus);
      stepper.appendChild(q);
      stepper.appendChild(plus);

      li.appendChild(info);
      li.appendChild(price);
      li.appendChild(stepper);
      ticketsEl.appendChild(li);
    });
  }

  function changeQty(t, delta) {
    var next = qty[t.id] + delta;
    if (next < 0) return;

    if (delta > 0 && t.price > 0 && totalPaid() >= MAX_PAID) {
      toast("Up to " + MAX_PAID + " paid tickets per order.", "warn");
      return;
    }
    // Capacity guard against the chosen slot
    if (delta > 0 && selectedSlot && totalGuests() >= selectedSlot.remaining) {
      toast("Only " + selectedSlot.remaining + " spaces left in that time slot.", "warn");
      return;
    }

    qty[t.id] = next;
    var qEl = $("qty-" + t.id);
    qEl.textContent = String(next);
    updateSummary();
  }

  // ---------- Summary ----------
  function updateSummary() {
    sumDate.textContent = selectedDate ? dateFmt.format(selectedDate) : "—";
    sumTime.textContent = selectedSlot ? selectedSlot.time : "—";
    sumQty.textContent = String(totalGuests());

    sumLines.innerHTML = "";
    var subtotal = 0;
    var any = false;

    TICKET_TYPES.forEach(function (t) {
      if (qty[t.id] > 0) {
        any = true;
        var line = t.price * qty[t.id];
        subtotal += line;
        var li = document.createElement("li");
        li.innerHTML =
          '<span class="sl-label">' + qty[t.id] + " × " + t.name + "</span>" +
          '<span class="sl-amt">' + (t.price === 0 ? "Free" : money(line)) + "</span>";
        sumLines.appendChild(li);
      }
    });

    if (!any) {
      var empty = document.createElement("li");
      empty.className = "sum-empty";
      empty.textContent = "No tickets selected yet.";
      sumLines.appendChild(empty);
    }

    var fee = totalPaid() * SERVICE_FEE;
    var total = subtotal + fee;

    sumSub.textContent = money(subtotal);
    sumFee.textContent = money(fee);
    sumTotal.textContent = money(total);

    var ready = selectedDate && selectedSlot && totalGuests() > 0;
    checkoutBtn.disabled = !ready;
  }

  // ---------- Checkout ----------
  checkoutBtn.addEventListener("click", function () {
    if (!selectedDate) { toast("Please choose a date first.", "warn"); return; }
    if (!selectedSlot) { toast("Please pick an entry time.", "warn"); return; }
    if (totalGuests() === 0) { toast("Add at least one ticket.", "warn"); return; }
    toast(
      "Reserved " + totalGuests() + " ticket(s) for " +
      dateFmt.format(selectedDate) + " at " + selectedSlot.time + ".",
      "ok"
    );
  });

  // ---------- Init ----------
  renderCalendar();
  renderSlots();
  renderTickets();
  updateSummary();
})();
