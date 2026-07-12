(function () {
  "use strict";

  // --- Data model ---------------------------------------------------------
  // basePerRoom = price per room; base = flat studio fee added once.
  var PACKAGES = [
    {
      id: "refresh",
      name: "Refresh",
      tag: "One room, styled and reworked",
      base: 900,
      perRoom: 1400,
      revisions: 2,
      timeline: "3–4 weeks",
      featured: false,
      deliverables: [
        "Concept moodboard & palette",
        "2D furniture layout plan",
        "Curated shopping list with links",
        "One styling call (45 min)"
      ]
    },
    {
      id: "signature",
      name: "Signature",
      tag: "Full room design, managed end to end",
      base: 1800,
      perRoom: 2600,
      revisions: 3,
      timeline: "6–8 weeks",
      featured: true,
      deliverables: [
        "Everything in Refresh",
        "3D renders of each room",
        "Custom joinery & lighting spec",
        "Trade pricing + procurement",
        "Delivery & install coordination"
      ]
    },
    {
      id: "full-home",
      name: "Full Home",
      tag: "Whole-home direction, cohesive throughout",
      base: 3200,
      perRoom: 3400,
      revisions: 5,
      timeline: "10–14 weeks",
      featured: false,
      deliverables: [
        "Everything in Signature",
        "Whole-home style framework",
        "Bespoke furniture design",
        "On-site project management",
        "Final styling & photo-ready reveal"
      ]
    }
  ];

  var COMPARE_ROWS = [
    { label: "Moodboard & palette", vals: ["yes", "yes", "yes"] },
    { label: "2D layout plan", vals: ["yes", "yes", "yes"] },
    { label: "Shopping list", vals: ["yes", "yes", "yes"] },
    { label: "3D renders", vals: ["no", "yes", "yes"] },
    { label: "Joinery & lighting spec", vals: ["no", "yes", "yes"] },
    { label: "Procurement & install", vals: ["no", "yes", "yes"] },
    { label: "On-site project management", vals: ["no", "no", "yes"] },
    { label: "Bespoke furniture design", vals: ["no", "no", "yes"] },
    { label: "Revision rounds", vals: ["2", "3", "5"] },
    { label: "Typical timeline", vals: ["3–4 wks", "6–8 wks", "10–14 wks"] }
  ];

  var state = { rooms: 3, billing: "once" };

  // --- Helpers ------------------------------------------------------------
  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function priceFor(pkg) {
    return pkg.base + pkg.perRoom * state.rooms;
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  // --- Render packages ----------------------------------------------------
  var packagesEl = document.getElementById("packages");

  function renderPackages() {
    packagesEl.innerHTML = "";
    PACKAGES.forEach(function (pkg) {
      var total = priceFor(pkg);
      var monthly = total / 4;
      var showMonthly = state.billing === "monthly";

      var card = document.createElement("article");
      card.className = "pkg" + (pkg.featured ? " is-featured" : "");
      card.dataset.id = pkg.id;

      var deliverables = pkg.deliverables
        .map(function (d) {
          return (
            '<li><span class="tick" aria-hidden="true">✓</span>' + d + "</li>"
          );
        })
        .join("");

      var priceMain = showMonthly ? money(monthly) : money(total);
      var priceUnit = showMonthly ? "/mo × 4" : "one-time";
      var priceSub = showMonthly
        ? "Total " + money(total) + " · " + state.rooms + " room" + (state.rooms > 1 ? "s" : "")
        : "For " + state.rooms + " room" + (state.rooms > 1 ? "s" : "") + " · incl. studio fee";

      card.innerHTML =
        (pkg.featured ? '<span class="ribbon">Most chosen</span>' : "") +
        '<h3 class="pkg-name">' + pkg.name + "</h3>" +
        '<p class="pkg-tag">' + pkg.tag + "</p>" +
        '<div class="price-block">' +
        '<span class="price">' + priceMain + "</span>" +
        '<span class="price-per">' + priceUnit + "</span>" +
        "</div>" +
        '<p class="price-sub">' + priceSub + "</p>" +
        '<div class="meta-strip">' +
        '<span class="badge"><b>' + state.rooms + "</b> rooms</span>" +
        '<span class="badge"><b>' + pkg.revisions + "</b> revisions</span>" +
        '<span class="badge">' + pkg.timeline + "</span>" +
        "</div>" +
        '<ul class="deliverables">' + deliverables + "</ul>" +
        '<button class="btn ' +
        (pkg.featured ? "btn-primary" : "btn-outline") +
        ' btn-block book-btn" data-id="' +
        pkg.id +
        '">Book this package</button>';

      packagesEl.appendChild(card);
    });
  }

  // --- Render comparison --------------------------------------------------
  function renderCompare() {
    var body = document.getElementById("compare-body");
    body.innerHTML = COMPARE_ROWS.map(function (row) {
      var cells = row.vals
        .map(function (v, i) {
          var cls = i === 1 ? " class=\"col-flag\"" : "";
          var content;
          if (v === "yes") content = '<span class="mark-yes" aria-label="Included">✓</span>';
          else if (v === "no") content = '<span class="mark-no" aria-label="Not included">—</span>';
          else content = '<span class="mark-text">' + v + "</span>";
          return "<td" + cls + ">" + content + "</td>";
        })
        .join("");
      return "<tr><td>" + row.label + "</td>" + cells + "</tr>";
    }).join("");
  }

  // --- Controls -----------------------------------------------------------
  var roomsValue = document.getElementById("rooms-value");
  var minusBtn = document.getElementById("rooms-minus");
  var plusBtn = document.getElementById("rooms-plus");
  var MIN_ROOMS = 1;
  var MAX_ROOMS = 8;

  function updateStepperButtons() {
    minusBtn.disabled = state.rooms <= MIN_ROOMS;
    plusBtn.disabled = state.rooms >= MAX_ROOMS;
    roomsValue.textContent = state.rooms;
  }

  function changeRooms(delta) {
    var next = Math.min(MAX_ROOMS, Math.max(MIN_ROOMS, state.rooms + delta));
    if (next === state.rooms) return;
    state.rooms = next;
    updateStepperButtons();
    renderPackages();
    syncBookingSummary();
  }

  minusBtn.addEventListener("click", function () { changeRooms(-1); });
  plusBtn.addEventListener("click", function () { changeRooms(1); });

  var segOnce = document.getElementById("seg-once");
  var segMonthly = document.getElementById("seg-monthly");
  var saveNote = document.getElementById("save-note");

  function setBilling(mode) {
    state.billing = mode;
    var isMonthly = mode === "monthly";
    segMonthly.classList.toggle("is-active", isMonthly);
    segOnce.classList.toggle("is-active", !isMonthly);
    segMonthly.setAttribute("aria-selected", String(isMonthly));
    segOnce.setAttribute("aria-selected", String(!isMonthly));
    saveNote.hidden = !isMonthly;
    renderPackages();
    syncBookingSummary();
  }

  segOnce.addEventListener("click", function () { setBilling("once"); });
  segMonthly.addEventListener("click", function () { setBilling("monthly"); });

  // Delegated book buttons
  packagesEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".book-btn");
    if (!btn) return;
    openBooking(btn.dataset.id);
  });

  // --- Booking panel ------------------------------------------------------
  var booking = document.getElementById("booking");
  var scrim = document.getElementById("scrim");
  var closeBtn = document.getElementById("booking-close");
  var form = document.getElementById("booking-form");
  var currentPkgId = null;
  var lastFocused = null;

  function syncBookingSummary() {
    if (!currentPkgId) return;
    var pkg = PACKAGES.find(function (p) { return p.id === currentPkgId; });
    if (!pkg) return;
    document.getElementById("booking-title").textContent = pkg.name;
    document.getElementById("sum-package").textContent = pkg.name;
    document.getElementById("sum-rooms").textContent = state.rooms;
    document.getElementById("sum-timeline").textContent = pkg.timeline;
    var total = priceFor(pkg);
    var label =
      state.billing === "monthly"
        ? money(total / 4) + "/mo × 4"
        : money(total);
    document.getElementById("sum-total").textContent = label;
  }

  function openBooking(id) {
    currentPkgId = id;
    lastFocused = document.activeElement;
    syncBookingSummary();
    scrim.hidden = false;
    // force reflow so transition runs
    void scrim.offsetWidth;
    scrim.classList.add("is-open");
    booking.classList.add("is-open");
    booking.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { document.getElementById("f-name").focus(); }, 320);
    document.addEventListener("keydown", onKeydown);
  }

  function closeBooking() {
    booking.classList.remove("is-open");
    scrim.classList.remove("is-open");
    booking.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    setTimeout(function () { scrim.hidden = true; }, 320);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") { closeBooking(); return; }
    if (e.key === "Tab") trapFocus(e);
  }

  function trapFocus(e) {
    var focusable = booking.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  closeBtn.addEventListener("click", closeBooking);
  scrim.addEventListener("click", closeBooking);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("f-name");
    var email = document.getElementById("f-email");
    if (!name.value.trim()) { name.focus(); toast("Please add your name"); return; }
    if (!email.checkValidity()) { email.focus(); toast("Please add a valid email"); return; }
    var pkg = PACKAGES.find(function (p) { return p.id === currentPkgId; });
    closeBooking();
    form.reset();
    toast("Request sent — we'll email a " + (pkg ? pkg.name : "") + " proposal within 2 days");
  });

  // --- Init ---------------------------------------------------------------
  updateStepperButtons();
  renderPackages();
  renderCompare();
})();
