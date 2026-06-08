/* Meridian Heights — Urban Condo Tower landing
   Vanilla JS: floor-availability ticker, residences grid, amenities,
   floor selector, register-interest form. No external libraries. */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  /* ---------- listing imagery via CSS gradients ---------- */
  var PHOTOS = [
    "linear-gradient(135deg,#2c3a45 0%,#41616f 45%,#8aa9b6 100%)",
    "linear-gradient(150deg,#3a3f46 0%,#5a8fb0 60%,#cfd6dd 100%)",
    "linear-gradient(120deg,#23303a 0%,#365163 50%,#9fb6c2 100%)",
    "linear-gradient(160deg,#2a2e34 0%,#46758f 55%,#b9c6cf 100%)",
    "linear-gradient(135deg,#1f262c 0%,#3d6b86 50%,#cfd6dd 100%)"
  ];

  /* tiny floorplan svg generators */
  function plan(kind) {
    var inner = {
      studio: '<rect x="3" y="3" width="34" height="34"/><line x1="3" y1="24" x2="20" y2="24"/><line x1="20" y1="24" x2="20" y2="37"/>',
      one: '<rect x="3" y="3" width="34" height="34"/><line x1="20" y1="3" x2="20" y2="37"/><line x1="20" y1="20" x2="37" y2="20"/>',
      two: '<rect x="3" y="3" width="34" height="34"/><line x1="3" y1="20" x2="37" y2="20"/><line x1="20" y1="3" x2="20" y2="20"/><line x1="20" y1="20" x2="20" y2="37"/>',
      three: '<rect x="3" y="3" width="34" height="34"/><line x1="3" y1="16" x2="37" y2="16"/><line x1="3" y1="28" x2="37" y2="28"/><line x1="20" y1="16" x2="20" y2="37"/>',
      penthouse: '<rect x="3" y="3" width="34" height="34"/><line x1="3" y1="14" x2="37" y2="14"/><line x1="14" y1="14" x2="14" y2="37"/><line x1="26" y1="14" x2="26" y2="37"/>'
    };
    return '<svg viewBox="0 0 40 40" aria-hidden="true">' + (inner[kind] || inner.one) + "</svg>";
  }

  /* ---------- residences data ---------- */
  var RESIDENCES = [
    {
      name: "The Atrium Studio",
      plan: "studio",
      beds: "Studio",
      bath: "1 Bath",
      sqft: 512,
      from: 489000,
      status: "available",
      statusLabel: "12 left",
      desc: "Floor-to-ceiling glass, integrated kitchen, and a Juliet balcony facing the river."
    },
    {
      name: "The Riverline One",
      plan: "one",
      beds: "1 Bed",
      bath: "1 Bath",
      sqft: 740,
      from: 638000,
      status: "available",
      statusLabel: "21 left",
      desc: "Open-plan living with a dedicated home-office nook and a private corner terrace."
    },
    {
      name: "The Chrome Two",
      plan: "two",
      beds: "2 Bed",
      bath: "2 Bath",
      sqft: 1080,
      from: 945000,
      status: "low",
      statusLabel: "6 left",
      desc: "Split-bedroom layout, chef's island kitchen, and double-aspect skyline views."
    },
    {
      name: "The Cantilever Three",
      plan: "three",
      beds: "3 Bed",
      bath: "2.5 Bath",
      sqft: 1465,
      from: 1390000,
      status: "low",
      statusLabel: "3 left",
      desc: "Wraparound terrace, family room, and a wine wall framed in brushed chrome."
    },
    {
      name: "The Skyline Penthouse",
      plan: "penthouse",
      beds: "4 Bed",
      bath: "4 Bath",
      sqft: 3240,
      from: 4200000,
      status: "low",
      statusLabel: "2 left",
      desc: "Two-story crown residence with a private elevator, plunge pool, and 360° terrace."
    }
  ];

  function statusClass(s) {
    return s === "low" ? "badge-status-low" : "badge-status-ok";
  }

  function renderResidences() {
    var grid = document.getElementById("res-grid");
    if (!grid) return;
    grid.innerHTML = RESIDENCES.map(function (r, i) {
      return (
        '<article class="res-card">' +
          '<div class="res-photo" style="background-image:' + PHOTOS[i % PHOTOS.length] + '">' +
            '<div class="res-floorplan">' + plan(r.plan) + "</div>" +
            '<div class="res-badges">' +
              '<span class="badge badge-price">From ' + money(r.from) + "</span>" +
              '<span class="badge ' + statusClass(r.status) + '">' + r.statusLabel + "</span>" +
            "</div>" +
          "</div>" +
          '<div class="res-body">' +
            '<h3 class="res-name">' + r.name + "</h3>" +
            '<div class="res-spec">' +
              "<span><b>" + r.beds + "</b></span>" +
              "<span><b>" + r.bath + "</b></span>" +
              "<span><b>" + r.sqft.toLocaleString() + "</b> sq ft</span>" +
            "</div>" +
            '<p class="res-desc">' + r.desc + "</p>" +
            '<div class="res-foot">' +
              '<span class="res-price">Starting at<b>' + money(r.from) + "</b></span>" +
              '<button class="res-cta" type="button" data-res="' + r.name + '">View floorplan</button>' +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    grid.querySelectorAll(".res-cta").forEach(function (btn) {
      btn.addEventListener("click", function () {
        toast("Floorplan for " + btn.getAttribute("data-res") + " sent to your sales advisor");
      });
    });
  }

  /* ---------- amenities ---------- */
  var ICONS = {
    rooftop: '<path d="M3 20h18"/><path d="M5 20V9l7-5 7 5v11"/><path d="M9 20v-5h6v5"/>',
    gym: '<path d="M4 8v8M20 8v8M7 6v12M17 6v12M7 12h10"/>',
    concierge: '<circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    pool: '<path d="M3 18c2 0 2-1.5 4-1.5S9 18 11 18s2-1.5 4-1.5S17 18 19 18"/><path d="M3 13c2 0 2-1.5 4-1.5S9 13 11 13"/><path d="M8 16V6a2 2 0 0 1 4 0M16 16V6"/>',
    lounge: '<rect x="3" y="11" width="18" height="7" rx="2"/><path d="M5 11V8a3 3 0 0 1 6 0M19 11V8a3 3 0 0 0-6 0"/>',
    parking: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 16V8h3a2.5 2.5 0 0 1 0 5H9"/>'
  };
  var AMENITIES = [
    { icon: "rooftop", title: "Sky Terrace", desc: "Rooftop garden, fire lounges, and an outdoor cinema on level 42." },
    { icon: "gym", title: "Performance Gym", desc: "2,400 sq ft of equipment with a glass-walled studio and trainers on call." },
    { icon: "concierge", title: "24/7 Concierge", desc: "Dedicated lobby team for packages, bookings, and resident requests." },
    { icon: "pool", title: "Lap Pool & Spa", desc: "Heated 20-meter infinity lane with sauna, steam, and cold plunge." },
    { icon: "lounge", title: "Residents' Lounge", desc: "Co-working bar, private dining room, and a curated library." },
    { icon: "parking", title: "Smart Parking", desc: "EV-ready spaces with app-controlled valet and secure bike storage." }
  ];

  function renderAmenities() {
    var grid = document.getElementById("amen-grid");
    if (!grid) return;
    grid.innerHTML = AMENITIES.map(function (a) {
      return (
        '<div class="amen-tile">' +
          '<div class="amen-icon"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[a.icon] + "</svg></div>" +
          "<h3>" + a.title + "</h3>" +
          "<p>" + a.desc + "</p>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------- floor selector ---------- */
  var TYPES = ["Studio", "1 Bed", "2 Bed", "3 Bed", "Penthouse"];
  function buildUnits(band) {
    // deterministic pseudo-random so the demo is stable per band
    var seed = band.id.charCodeAt(0) + band.id.charCodeAt(band.id.length - 1);
    var units = [];
    for (var i = 0; i < band.units; i++) {
      var n = band.lowFloor + Math.floor(i / 4);
      var letter = "ABCDEF"[i % 4];
      var t = TYPES[(seed + i) % TYPES.length];
      var roll = (seed * 7 + i * 13) % 10;
      var status = roll < 5 ? "available" : roll < 8 ? "reserved" : "sold";
      var basePrice = 480000 + (TYPES.indexOf(t) * 280000) + ((n - band.lowFloor) * 14000) + band.premium;
      units.push({
        no: n + letter,
        type: t,
        sqft: 500 + TYPES.indexOf(t) * 360,
        price: Math.round(basePrice / 1000) * 1000,
        status: status
      });
    }
    return units;
  }

  var BANDS = [
    { id: "podium", name: "Podium", lowFloor: 3, highFloor: 9, units: 14, premium: 0 },
    { id: "midrise", name: "Mid-Rise", lowFloor: 10, highFloor: 24, units: 16, premium: 90000 },
    { id: "highrise", name: "High-Rise", lowFloor: 25, highFloor: 38, units: 12, premium: 240000 },
    { id: "crown", name: "The Crown", lowFloor: 39, highFloor: 42, units: 6, premium: 620000 }
  ];
  BANDS.forEach(function (b) { b.unitData = buildUnits(b); });

  function availCount(b) {
    return b.unitData.filter(function (u) { return u.status === "available"; }).length;
  }

  function renderFloorRail() {
    var rail = document.getElementById("floor-rail");
    if (!rail) return;
    rail.innerHTML = BANDS.map(function (b, i) {
      return (
        '<button class="floor-btn" role="tab" type="button" id="tab-' + b.id + '"' +
          ' aria-controls="floor-panel" aria-selected="' + (i === 0 ? "true" : "false") + '"' +
          ' data-band="' + b.id + '">' +
          "<span>" +
            '<span class="fb-name">' + b.name + "</span>" +
            '<span class="fb-floors">Floors ' + b.lowFloor + "–" + b.highFloor + "</span>" +
          "</span>" +
          '<span class="fb-count">' + availCount(b) + "</span>" +
        "</button>"
      );
    }).join("");

    rail.querySelectorAll(".floor-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { selectBand(btn.getAttribute("data-band")); });
      btn.addEventListener("keydown", function (e) {
        var btns = Array.prototype.slice.call(rail.querySelectorAll(".floor-btn"));
        var idx = btns.indexOf(btn);
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          btns[(idx + 1) % btns.length].focus();
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          btns[(idx - 1 + btns.length) % btns.length].focus();
        }
      });
    });
  }

  var STATUS_LABEL = { available: "Available", reserved: "Reserved", sold: "Sold" };
  var STATUS_CLASS = { available: "us-available", reserved: "us-reserved", sold: "us-sold" };

  function selectBand(id) {
    var band = BANDS.filter(function (b) { return b.id === id; })[0];
    if (!band) return;

    document.querySelectorAll(".floor-btn").forEach(function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-band") === id ? "true" : "false");
    });

    var panel = document.getElementById("floor-panel");
    if (!panel) return;
    var avail = availCount(band);
    var rows = band.unitData.map(function (u) {
      var sold = u.status === "sold";
      return (
        '<div class="unit-row' + (sold ? " is-sold" : "") + '">' +
          '<span class="unit-no">' + u.no + "</span>" +
          '<span class="unit-meta">' +
            '<span class="unit-type">' + u.type + "</span>" +
            '<span class="unit-detail">' + u.sqft.toLocaleString() + " sq ft · Floor " + u.no.replace(/[A-F]$/, "") + "</span>" +
          "</span>" +
          '<span class="unit-price">' + money(u.price) + "</span>" +
          '<span class="unit-status ' + STATUS_CLASS[u.status] + '">' + STATUS_LABEL[u.status] + "</span>" +
        "</div>"
      );
    }).join("");

    panel.innerHTML =
      '<div class="fp-head">' +
        "<div>" +
          "<h3>" + band.name + "</h3>" +
          '<span class="fp-sub">Floors ' + band.lowFloor + "–" + band.highFloor + " · " + avail + " of " + band.unitData.length + " available</span>" +
        "</div>" +
        '<span class="fp-premium">' + (band.premium ? "+" + money(band.premium) + " view premium" : "No view premium") + "</span>" +
      "</div>" +
      '<div class="unit-list">' + rows + "</div>";
  }

  /* ---------- availability ticker ---------- */
  function renderTicker() {
    var track = document.getElementById("ticker-track");
    if (!track) return;
    var items = BANDS.map(function (b) {
      var avail = availCount(b);
      var cls = avail === 0 ? "dot-sold" : avail <= 3 ? "dot-low" : "dot-ok";
      var label = avail === 0 ? "Sold out" : avail + " available";
      return '<span class="ticker-item"><span class="dot ' + cls + '"></span><b>' + b.name + "</b> · " + label + " · Floors " + b.lowFloor + "–" + b.highFloor + "</span>";
    });
    items.push('<span class="ticker-item"><span class="dot dot-ok"></span><b>Move-in</b> · Q3 2027</span>');
    items.push('<span class="ticker-item"><span class="dot dot-low"></span><b>Penthouse</b> · 2 remaining</span>');
    // duplicate for a seamless loop
    track.innerHTML = items.join("") + items.join("");
  }

  /* ---------- register form ---------- */
  function bindForm() {
    var form = document.getElementById("register-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("f-name");
      var email = document.getElementById("f-email");
      var ok = true;

      function mark(input, valid) {
        var field = input.closest(".field");
        if (field) field.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      }

      mark(name, name.value.trim().length >= 2);
      mark(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));

      if (!ok) {
        toast("Please check the highlighted fields");
        return;
      }
      var interest = document.getElementById("f-interest").value;
      toast("Thanks " + name.value.trim().split(" ")[0] + " — you're on the " + interest + " priority list");
      form.reset();
      form.querySelectorAll(".field.invalid").forEach(function (f) { f.classList.remove("invalid"); });
    });

    form.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) field.classList.remove("invalid");
      });
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderResidences();
    renderAmenities();
    renderTicker();
    renderFloorRail();
    selectBand(BANDS[0].id);
    bindForm();
  });
})();
