/* Brightwood Family Dental — landing interactions */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = '<span class="toast-ico" aria-hidden="true">✓</span>' + msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3600);
  }

  /* ---------- Services data + render ---------- */
  var services = [
    { icon: "🦷", title: "Checkups & Cleanings", desc: "Gentle exams, plaque removal, and a fresh polish to keep every smile bright.", price: "89", tags: ["adults", "seniors", "teens"], groups: ["adults", "teens", "seniors"] },
    { icon: "👶", title: "Kids' First Visit", desc: "A calm, playful introduction to the dentist with counting games and a prize.", price: "Free", tags: ["kids"], groups: ["kids"] },
    { icon: "✨", title: "Teeth Whitening", desc: "Professional brightening that lifts years of stains in a single relaxed visit.", price: "249", tags: ["adults", "teens"], groups: ["adults", "teens"] },
    { icon: "🛡️", title: "Sealants & Fluoride", desc: "Protective barriers that keep growing teeth cavity-free through the school years.", price: "45", tags: ["kids", "teens"], groups: ["kids", "teens"] },
    { icon: "🦷", title: "Braces & Aligners", desc: "Clear or classic — straighten smiles with check-ins that fit busy schedules.", price: "from 1,900", tags: ["teens", "adults"], groups: ["teens", "adults"] },
    { icon: "🩺", title: "Fillings & Crowns", desc: "Tooth-colored repairs and same-day crowns that blend right in, no drama.", price: "from 160", tags: ["adults", "seniors"], groups: ["adults", "seniors"] },
    { icon: "🦴", title: "Dentures & Implants", desc: "Comfortable, natural-looking solutions to restore confident chewing and smiles.", price: "from 990", tags: ["seniors"], groups: ["seniors"] },
    { icon: "😌", title: "Sedation Comfort", desc: "Nervous patient? Gentle sedation options make longer treatments feel like a nap.", price: "120", tags: ["adults", "seniors", "teens"], groups: ["adults", "teens", "seniors"] },
    { icon: "🩷", title: "Emergency Care", desc: "Chipped tooth or sudden ache? Same-day urgent slots for the whole family.", price: "95", tags: ["kids", "adults", "seniors"], groups: ["kids", "teens", "adults", "seniors"] }
  ];

  var grid = document.getElementById("serviceGrid");
  function priceMarkup(p) {
    if (p === "Free") return '<span class="card-price" style="color:var(--ok)">Free</span>';
    if (p.indexOf("from") === 0) return '<span class="card-price"><span>from </span>$' + p.replace("from ", "") + "</span>";
    return '<span class="card-price">$' + p + " <span>/ visit</span></span>";
  }
  function renderServices(filter) {
    if (!grid) return;
    var list = filter === "all" ? services : services.filter(function (s) { return s.groups.indexOf(filter) !== -1; });
    grid.innerHTML = list.map(function (s, i) {
      var tags = s.tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("");
      return (
        '<article class="card" style="animation-delay:' + (i * 40) + 'ms">' +
        '<div class="card-ico" aria-hidden="true">' + s.icon + "</div>" +
        "<h3>" + s.title + "</h3>" +
        "<p>" + s.desc + "</p>" +
        '<div class="tags">' + tags + "</div>" +
        '<div class="card-meta">' + priceMarkup(s.price) +
        '<a class="card-link" href="#book">Book →</a>' +
        "</div></article>"
      );
    }).join("");
  }
  renderServices("all");

  /* ---------- Filter chips ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      renderServices(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- Animated smile counter ---------- */
  var counter = document.getElementById("smileCount");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var start = null;
    var dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(eased * target).toLocaleString() + "+";
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counter) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(counter); io.disconnect(); }
        });
      }, { threshold: 0.4 });
      io.observe(counter);
    } else {
      animateCount(counter);
    }
  }

  /* ---------- Day picker ---------- */
  var daysEl = document.getElementById("days");
  var dowNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var selectedDay = null;
  function buildDays() {
    if (!daysEl) return;
    var frag = "";
    var count = 0;
    var d = new Date();
    d.setDate(d.getDate() + 1); // start tomorrow
    while (count < 5) {
      var dow = d.getDay();
      if (dow !== 0) { // skip Sundays (clinic closed)
        var label = dowNames[dow];
        var num = d.getDate();
        frag += '<button type="button" class="day" role="radio" aria-checked="false" ' +
          'data-day="' + label + " " + num + '">' +
          '<span class="dow">' + label + "</span>" +
          '<span class="dnum">' + num + "</span></button>";
        count++;
      }
      d.setDate(d.getDate() + 1);
    }
    daysEl.innerHTML = frag;
    var dayBtns = daysEl.querySelectorAll(".day");
    dayBtns[0].classList.add("sel");
    dayBtns[0].setAttribute("aria-checked", "true");
    selectedDay = dayBtns[0].getAttribute("data-day");
    Array.prototype.forEach.call(dayBtns, function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(dayBtns, function (b) {
          b.classList.remove("sel");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("sel");
        btn.setAttribute("aria-checked", "true");
        selectedDay = btn.getAttribute("data-day");
      });
    });
  }
  buildDays();

  /* ---------- Time slots ---------- */
  var slotsEl = document.getElementById("slots");
  var slotTimes = ["9:00", "10:30", "12:00", "1:30", "3:00", "4:30", "5:45", "6:30"];
  var soldOut = ["12:00", "4:30"]; // pretend unavailable
  var selectedSlot = null;
  function buildSlots() {
    if (!slotsEl) return;
    slotsEl.innerHTML = slotTimes.map(function (t) {
      var off = soldOut.indexOf(t) !== -1;
      return '<button type="button" class="slot" role="radio" ' +
        'aria-checked="false" aria-disabled="' + (off ? "true" : "false") + '" ' +
        'data-slot="' + t + '">' + t + "</button>";
    }).join("");
    var slotBtns = slotsEl.querySelectorAll(".slot");
    Array.prototype.forEach.call(slotBtns, function (btn) {
      btn.addEventListener("click", function () {
        if (btn.getAttribute("aria-disabled") === "true") {
          toast("Sorry, that slot just filled — try another time.");
          return;
        }
        Array.prototype.forEach.call(slotBtns, function (b) {
          b.classList.remove("sel");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("sel");
        btn.setAttribute("aria-checked", "true");
        selectedSlot = btn.getAttribute("data-slot");
      });
    });
  }
  buildSlots();

  /* ---------- Form submit ---------- */
  var form = document.getElementById("bookForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = document.getElementById("fullName");
      var name = nameInput.value.trim();
      if (!name) {
        nameInput.classList.add("invalid");
        nameInput.focus();
        toast("Please add your name so we can confirm.");
        return;
      }
      nameInput.classList.remove("invalid");
      if (!selectedSlot) {
        toast("Pick a time slot to finish booking.");
        return;
      }
      var first = name.split(" ")[0];
      toast("Thanks, " + first + "! " + selectedDay + " at " + selectedSlot + " is reserved.");
      form.reset();
      // restore default selections
      buildSlots();
      selectedSlot = null;
    });

    document.getElementById("fullName").addEventListener("input", function () {
      this.classList.remove("invalid");
    });
  }
})();
