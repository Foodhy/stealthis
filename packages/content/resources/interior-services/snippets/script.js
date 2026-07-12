(function () {
  "use strict";

  // --- Service data -------------------------------------------------------
  var SERVICES = [
    {
      id: "full-design",
      name: "Full Design",
      swatch: "linear-gradient(135deg, #b08968, #8c6a4f)",
      duration: "10–14 weeks",
      base: 4800,        // fixed studio fee
      perRoom: 1200,     // added per room
      featured: true,
      brief: "End to end. We plan, source, and install a complete scheme so you move into a finished home.",
      deliverables: [
        "Space planning & 3D concept",
        "Curated furniture & lighting schedule",
        "Full sourcing & procurement",
        "Trade coordination on site",
        "Styling & final reveal day"
      ]
    },
    {
      id: "e-design",
      name: "E-Design",
      swatch: "linear-gradient(135deg, #9caf88, #6f8258)",
      duration: "3–4 weeks",
      base: 950,
      perRoom: 480,
      featured: false,
      brief: "A remote design package delivered as a clickable board — you source and install at your own pace.",
      deliverables: [
        "Digital mood & concept board",
        "Scaled 2D floor layout",
        "Shoppable product list with links",
        "One round of revisions",
        "Styling & placement guide (PDF)"
      ]
    },
    {
      id: "consultation",
      name: "Consultation",
      swatch: "linear-gradient(135deg, #c9a888, #b08968)",
      duration: "Half day",
      base: 420,
      perRoom: 0,
      featured: false,
      brief: "A focused visit to unblock decisions — paint, layout, lighting — with clear notes to act on.",
      deliverables: [
        "90-minute on-site or video visit",
        "Colour & material direction",
        "Layout & flow recommendations",
        "Written action summary",
        "Priority shopping shortlist"
      ]
    },
    {
      id: "styling",
      name: "Styling",
      swatch: "linear-gradient(135deg, #5c4433, #3f2e22)",
      duration: "1–2 weeks",
      base: 1400,
      perRoom: 600,
      featured: false,
      brief: "The finishing layer — art, textiles, and objects arranged so the room finally feels complete.",
      deliverables: [
        "Accessory & art sourcing",
        "Textile & soft-furnishing edit",
        "In-person styling session",
        "Shelf & surface composition",
        "Photo-ready final styling"
      ]
    }
  ];

  var MIN_ROOMS = 1;
  var MAX_ROOMS = 12;
  var rooms = 3;

  var grid = document.querySelector(".grid");
  var roomOut = document.getElementById("roomCount");

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function priceFor(svc, r) {
    return svc.base + svc.perRoom * Math.max(0, r - 1);
  }

  // --- Render cards -------------------------------------------------------
  function renderCards() {
    grid.innerHTML = "";
    SERVICES.forEach(function (svc) {
      var card = document.createElement("article");
      card.className = "card" + (svc.featured ? " is-featured" : "");
      card.setAttribute("data-id", svc.id);

      var badge = svc.featured
        ? '<span class="badge badge-featured">Most requested</span>'
        : '<span class="badge badge-dur">' + svc.duration + "</span>";

      var deliverables = svc.deliverables
        .map(function (d) { return "<li>" + d + "</li>"; })
        .join("");

      var priceWrap = svc.perRoom
        ? '<span class="price" data-price>' + money(priceFor(svc, rooms)) + "</span>"
        : '<span class="price" data-price>' + money(svc.base) + " <small>flat</small></span>";

      card.innerHTML =
        '<div class="card-top">' +
          '<span class="card-swatch" style="background:' + svc.swatch + '"></span>' +
          badge +
        "</div>" +
        "<h2>" + svc.name + "</h2>" +
        '<p class="card-brief">' + svc.brief + "</p>" +
        '<ul class="deliverables">' + deliverables + "</ul>" +
        '<div class="card-foot">' +
          "<div>" +
            '<span class="price-label">From</span>' +
            priceWrap +
          "</div>" +
          '<button type="button" class="btn" data-enquire="' + svc.name + '">Enquire</button>' +
        "</div>";

      grid.appendChild(card);
    });
  }

  function updatePrices() {
    roomOut.textContent = String(rooms);
    SERVICES.forEach(function (svc) {
      var card = grid.querySelector('[data-id="' + svc.id + '"]');
      if (!card) return;
      var el = card.querySelector("[data-price]");
      if (!el) return;
      if (svc.perRoom) {
        el.textContent = money(priceFor(svc, rooms));
        el.style.transition = "color .2s";
        el.style.color = "var(--clay-d)";
        setTimeout(function () { el.style.color = ""; }, 220);
      }
    });
    var fRooms = document.getElementById("fRooms");
    if (fRooms) fRooms.value = String(rooms);
    if (panel.classList.contains("open")) updateSummary();
  }

  renderCards();

  // --- Stepper ------------------------------------------------------------
  document.querySelectorAll(".step").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var delta = parseInt(btn.getAttribute("data-step"), 10);
      rooms = Math.min(MAX_ROOMS, Math.max(MIN_ROOMS, rooms + delta));
      updatePrices();
    });
  });

  // --- Enquiry panel ------------------------------------------------------
  var panel = document.getElementById("panel");
  var backdrop = document.getElementById("backdrop");
  var panelClose = document.getElementById("panelClose");
  var panelTitle = document.getElementById("panelTitle");
  var form = document.getElementById("enquiryForm");
  var fService = document.getElementById("fService");
  var fRooms = document.getElementById("fRooms");
  var summary = document.getElementById("panelSummary");
  var lastFocus = null;

  // Populate service select
  SERVICES.forEach(function (svc) {
    var opt = document.createElement("option");
    opt.value = svc.id;
    opt.textContent = svc.name;
    fService.appendChild(opt);
  });
  var studioOpt = document.createElement("option");
  studioOpt.value = "studio";
  studioOpt.textContent = "General / not sure yet";
  fService.appendChild(studioOpt);

  function updateSummary() {
    var svc = SERVICES.filter(function (s) { return s.id === fService.value; })[0];
    var r = Math.min(MAX_ROOMS, Math.max(MIN_ROOMS, parseInt(fRooms.value, 10) || 1));
    if (!svc) {
      summary.innerHTML = "We'll help you pick the right service on the call.";
      return;
    }
    var total = priceFor(svc, r);
    var line = svc.perRoom
      ? "Estimated from <strong>" + money(total) + "</strong> for " + r + " room" + (r > 1 ? "s" : "")
      : "Estimated from <strong>" + money(svc.base) + "</strong> (flat rate)";
    summary.innerHTML = svc.name + " · " + svc.duration + "<br>" + line;
  }

  function openPanel(serviceName) {
    lastFocus = document.activeElement;
    var match = SERVICES.filter(function (s) { return s.name === serviceName; })[0];
    fService.value = match ? match.id : "studio";
    fRooms.value = String(rooms);
    panelTitle.textContent = match ? "Enquire · " + match.name : "Enquire";
    updateSummary();

    backdrop.hidden = false;
    requestAnimationFrame(function () {
      backdrop.classList.add("show");
      panel.classList.add("open");
    });
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      var firstInput = form.querySelector('input[name="name"]');
      if (firstInput) firstInput.focus();
    }, 320);
  }

  function closePanel() {
    panel.classList.remove("open");
    backdrop.classList.remove("show");
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(function () { backdrop.hidden = true; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-enquire]");
    if (trigger) {
      e.preventDefault();
      openPanel(trigger.getAttribute("data-enquire"));
    }
  });

  panelClose.addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
  });

  fService.addEventListener("change", updateSummary);
  fRooms.addEventListener("input", updateSummary);

  // --- Submit -------------------------------------------------------------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    if (!name) { toast("Please add your name."); form.name.focus(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast("That email doesn't look right.");
      form.email.focus();
      return;
    }
    var svc = SERVICES.filter(function (s) { return s.id === fService.value; })[0];
    var label = svc ? svc.name : "your project";
    closePanel();
    form.reset();
    fRooms.value = String(rooms);
    toast("Thanks " + name.split(" ")[0] + " — your " + label + " enquiry is in.");
  });

  // --- Toast --------------------------------------------------------------
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }
})();
