(function () {
  "use strict";

  /* ---------------- Data ---------------- */
  // Each room: id, name, room no, kind (gallery|amenity|access), floor,
  // svg rect geometry, optional icon, exhibition details.
  var FLOORS = {
    L1: { label: "Main level · Entrance & Grand Galleries" },
    L2: { label: "Upper level · Modern & Works on Paper" },
    B:  { label: "Lower level · Antiquities, Café & Shop" }
  };

  var ROOMS = [
    // ---- Level 1 ----
    { id: "g101", floor: "L1", kind: "gallery", no: "Gallery 101", name: "Origins",
      x: 40, y: 50, w: 200, h: 150, accent: ["#8a9a8e", "#5f6f63"],
      ex: { title: "Before the Frame", status: "open",
        sub: "Landscapes of the Northern School, 1610–1740",
        dates: "On view through Nov 9, 2026",
        desc: "Sixty-one oils and ground studies tracing the slow invention of open-air painting.",
        artist: "Various masters", medium: "Oil on panel & canvas",
        works: "61 works", curator: "H. Albrecht" } },
    { id: "g102", floor: "L1", kind: "gallery", no: "Gallery 102", name: "Light & Atmosphere",
      x: 260, y: 50, w: 200, h: 150, accent: ["#d9c27a", "#b89a45"],
      ex: { title: "The Hour of Gold", status: "open",
        sub: "Luminist studies by Cora Vane, 1871–1889",
        dates: "On view through Jan 18, 2027",
        desc: "Vane's quiet shorelines, lent from the Hartwell bequest, gathered for the first time.",
        artist: "Cora Vane (1844–1902)", medium: "Oil & gouache",
        works: "34 works", curator: "M. Okonkwo" } },
    { id: "g103", floor: "L1", kind: "gallery", no: "Gallery 103", name: "Portraiture",
      x: 480, y: 50, w: 200, h: 150, accent: ["#a76f6f", "#7d4b4b"],
      ex: { title: "Faces of the Republic", status: "soon",
        sub: "Civic portraits, 1790–1860",
        dates: "Opens Jul 2, 2026",
        desc: "Installation in progress — a survey of the painted official portrait.",
        artist: "Various", medium: "Oil on canvas",
        works: "29 works", curator: "L. Strand" } },
    { id: "atrium", floor: "L1", kind: "access", no: "Hall", name: "Grand Atrium",
      x: 260, y: 220, w: 200, h: 110, icon: "✦",
      ex: { title: "Grand Atrium", status: "amenity",
        amenity: "The double-height entrance hall. Information desk, coat check, and step-free access to all levels via the central lift." } },
    { id: "entrance", floor: "L1", kind: "access", no: "Entrance", name: "Main Entrance",
      x: 300, y: 350, w: 120, h: 50, icon: "⌂",
      ex: { title: "Main Entrance", status: "amenity",
        amenity: "Street-level entry on Meridian Square. Ticketing, security check, and accessible ramp to the right of the steps." } },
    { id: "wc1", floor: "L1", kind: "amenity", no: "Amenity", name: "Restrooms",
      x: 40, y: 220, w: 90, h: 110, icon: "♿",
      ex: { title: "Restrooms", status: "amenity",
        amenity: "Accessible restrooms and baby-change facilities, just past Gallery 101." } },
    { id: "info", floor: "L1", kind: "amenity", no: "Amenity", name: "Information",
      x: 150, y: 220, w: 90, h: 110, icon: "ⓘ",
      ex: { title: "Information Desk", status: "amenity",
        amenity: "Tickets, maps, audio-guide hire, and daily tour sign-up. Staffed 10:00–17:30." } },
    { id: "shop1", floor: "L1", kind: "amenity", no: "Amenity", name: "Museum Shop",
      x: 480, y: 220, w: 200, h: 110, icon: "🛍",
      ex: { title: "Museum Shop", status: "amenity",
        amenity: "Catalogues, prints, and design objects. Members receive 10% off." } },

    // ---- Level 2 ----
    { id: "g201", floor: "L2", kind: "gallery", no: "Gallery 201", name: "Abstraction",
      x: 40, y: 50, w: 260, h: 150, accent: ["#6f7fa7", "#49587d"],
      ex: { title: "Fields & Edges", status: "open",
        sub: "Postwar abstraction, 1948–1969",
        dates: "On view through Sep 28, 2026",
        desc: "Color-field canvases and hard-edge works drawn entirely from the permanent collection.",
        artist: "Various", medium: "Acrylic & oil on canvas",
        works: "22 works", curator: "D. Reyes" } },
    { id: "g202", floor: "L2", kind: "gallery", no: "Gallery 202", name: "Works on Paper",
      x: 320, y: 50, w: 200, h: 150, accent: ["#b3aa97", "#8c8470"],
      ex: { title: "A Line Around a Thought", status: "open",
        sub: "Drawings & prints, 16th–20th c.",
        dates: "Rotating display",
        desc: "A light-sensitive rotation of drawings, etchings and lithographs shown at low lux.",
        artist: "Various", medium: "Ink, chalk & intaglio",
        works: "40 works", curator: "P. Nadeau" } },
    { id: "g203", floor: "L2", kind: "gallery", no: "Gallery 203", name: "Contemporary",
      x: 540, y: 50, w: 140, h: 150, accent: ["#7aa78c", "#4f7d63"],
      ex: { title: "Now / Adjacent", status: "soon",
        sub: "New acquisitions, 2019–present",
        dates: "Opens Aug 15, 2026",
        desc: "A first look at recent gifts spanning sculpture, video and textile.",
        artist: "Various living artists", medium: "Mixed media",
        works: "18 works", curator: "S. Imari" } },
    { id: "g204", floor: "L2", kind: "gallery", no: "Gallery 204", name: "Photography",
      x: 40, y: 220, w: 280, h: 110, accent: ["#8c8c8c", "#5c5c5c"],
      ex: { title: "Silver & Salt", status: "open",
        sub: "A century of the photographic print",
        dates: "On view through Dec 14, 2026",
        desc: "From wet-plate to gelatin silver, traced across 47 vintage prints.",
        artist: "Various", medium: "Photographic prints",
        works: "47 works", curator: "R. Voss" } },
    { id: "wc2", floor: "L2", kind: "amenity", no: "Amenity", name: "Restrooms",
      x: 340, y: 220, w: 100, h: 110, icon: "♿",
      ex: { title: "Restrooms", status: "amenity",
        amenity: "Accessible restrooms beside the upper lift landing." } },
    { id: "lounge", floor: "L2", kind: "amenity", no: "Amenity", name: "Members' Lounge",
      x: 460, y: 220, w: 220, h: 110, icon: "☕",
      ex: { title: "Members' Lounge", status: "amenity",
        amenity: "Quiet seating, complimentary tea, and the day's papers. Member card required." } },

    // ---- Lower B ----
    { id: "b01", floor: "B", kind: "gallery", no: "Gallery B1", name: "Antiquities",
      x: 40, y: 50, w: 300, h: 150, accent: ["#b59b6e", "#8c7242"],
      ex: { title: "Stone, Bronze & Clay", status: "open",
        sub: "The ancient Mediterranean, 900 BCE–400 CE",
        dates: "Permanent collection",
        desc: "Marble fragments, votive bronzes and painted ware from the founding Calloway gift.",
        artist: "Various cultures", medium: "Stone, bronze, terracotta",
        works: "73 objects", curator: "E. Marsh" } },
    { id: "b02", floor: "B", kind: "gallery", no: "Gallery B2", name: "Textiles & Costume",
      x: 360, y: 50, w: 320, h: 150, accent: ["#a78c9e", "#7d647a"],
      ex: { title: "Woven Histories", status: "closed",
        sub: "Dress & textile, 1680–1920",
        dates: "Temporarily closed for rehang",
        desc: "Gallery closed while garments are rotated for conservation. Reopens late July.",
        artist: "Various", medium: "Silk, wool & cotton",
        works: "31 objects", curator: "T. Bellweather" } },
    { id: "cafe", floor: "B", kind: "amenity", no: "Amenity", name: "Garden Café",
      x: 40, y: 220, w: 240, h: 130, icon: "☕",
      ex: { title: "Garden Café", status: "amenity",
        amenity: "Seasonal plates and pastries overlooking the sculpture court. Open 10:00–16:30." } },
    { id: "cloak", floor: "B", kind: "amenity", no: "Amenity", name: "Cloakroom",
      x: 300, y: 220, w: 130, h: 130, icon: "🧥",
      ex: { title: "Cloakroom", status: "amenity",
        amenity: "Free coat and bag check. Large luggage cannot be accommodated." } },
    { id: "lift", floor: "B", kind: "access", no: "Access", name: "Central Lift",
      x: 450, y: 220, w: 110, h: 130, icon: "⇕",
      ex: { title: "Central Lift", status: "amenity",
        amenity: "Step-free access to every level. Stairs adjacent for those who prefer them." } },
    { id: "wcb", floor: "B", kind: "amenity", no: "Amenity", name: "Restrooms",
      x: 580, y: 220, w: 100, h: 130, icon: "♿",
      ex: { title: "Restrooms", status: "amenity",
        amenity: "Accessible restrooms by the lower lift landing." } }
  ];

  var STATUS_LABEL = {
    open: "On View",
    soon: "Opening Soon",
    closed: "Closed",
    amenity: "Amenity"
  };
  var STATUS_CLASS = {
    open: "badge-open",
    soon: "badge-soon",
    closed: "badge-closed",
    amenity: "badge-amenity"
  };

  /* ---------------- Refs ---------------- */
  var SVGNS = "http://www.w3.org/2000/svg";
  var roomsGroup = document.getElementById("roomsGroup");
  var labelsGroup = document.getElementById("labelsGroup");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var floorMeta = document.getElementById("floorMeta");
  var panelBody = document.getElementById("panelBody");
  var findForm = document.querySelector(".find");
  var findInput = document.getElementById("findInput");
  var findResults = document.getElementById("findResults");
  var toastEl = document.getElementById("toast");

  var currentFloor = "L1";
  var selectedId = null;
  var resultCursor = -1;

  /* ---------------- Toast ---------------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- Render floor ---------------- */
  function renderFloor(floor) {
    currentFloor = floor;
    roomsGroup.innerHTML = "";
    labelsGroup.innerHTML = "";
    floorMeta.textContent = FLOORS[floor].label;

    ROOMS.filter(function (r) { return r.floor === floor; }).forEach(function (r) {
      var g = document.createElementNS(SVGNS, "g");
      g.setAttribute("class", "room");
      g.setAttribute("data-id", r.id);
      g.setAttribute("data-kind", r.kind);
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", r.name + " — " + (r.ex.sub ? r.ex.title : STATUS_LABEL[r.ex.status]));

      var rect = document.createElementNS(SVGNS, "rect");
      rect.setAttribute("class", "room-rect");
      rect.setAttribute("x", r.x);
      rect.setAttribute("y", r.y);
      rect.setAttribute("width", r.w);
      rect.setAttribute("height", r.h);
      rect.setAttribute("rx", "6");
      g.appendChild(rect);

      // accent swatch for galleries
      if (r.kind === "gallery" && r.accent) {
        var swatch = document.createElementNS(SVGNS, "rect");
        swatch.setAttribute("x", r.x + 10);
        swatch.setAttribute("y", r.y + 10);
        swatch.setAttribute("width", 26);
        swatch.setAttribute("height", 26);
        swatch.setAttribute("rx", "3");
        swatch.setAttribute("fill", r.accent[0]);
        swatch.setAttribute("stroke", r.accent[1]);
        swatch.setAttribute("stroke-width", "1");
        swatch.setAttribute("pointer-events", "none");
        g.appendChild(swatch);
      }

      roomsGroup.appendChild(g);

      // labels
      var cx = r.x + r.w / 2;
      var cy = r.y + r.h / 2;
      if (r.icon) {
        var ico = document.createElementNS(SVGNS, "text");
        ico.setAttribute("x", cx);
        ico.setAttribute("y", cy - 4);
        ico.setAttribute("font-size", "18");
        ico.setAttribute("text-anchor", "middle");
        ico.textContent = r.icon;
        labelsGroup.appendChild(ico);
      }
      var name = document.createElementNS(SVGNS, "text");
      name.setAttribute("x", cx);
      name.setAttribute("y", r.icon ? cy + 16 : cy);
      name.textContent = r.name;
      labelsGroup.appendChild(name);

      if (r.kind === "gallery") {
        var no = document.createElementNS(SVGNS, "text");
        no.setAttribute("class", "room-no");
        no.setAttribute("x", cx);
        no.setAttribute("y", cy + 16);
        no.textContent = r.no.toUpperCase();
        labelsGroup.appendChild(no);
      }
    });

    // re-apply selection highlight if the selected room is on this floor
    if (selectedId) {
      var stillHere = ROOMS.some(function (r) { return r.id === selectedId && r.floor === floor; });
      if (stillHere) markSelected(selectedId);
    }
  }

  /* ---------------- Selection ---------------- */
  function getRoom(id) {
    return ROOMS.filter(function (r) { return r.id === id; })[0];
  }

  function markSelected(id) {
    Array.prototype.forEach.call(roomsGroup.querySelectorAll(".room"), function (g) {
      g.classList.toggle("is-selected", g.getAttribute("data-id") === id);
    });
  }

  function selectRoom(id, opts) {
    opts = opts || {};
    var r = getRoom(id);
    if (!r) return;
    selectedId = id;

    if (r.floor !== currentFloor) {
      setFloor(r.floor, true);
    }
    markSelected(id);
    renderPanel(r);

    if (opts.found) {
      var g = roomsGroup.querySelector('.room[data-id="' + id + '"]');
      if (g) {
        var rect = g.querySelector(".room-rect");
        rect.classList.remove("is-found");
        // reflow to restart animation
        void rect.getBBox();
        rect.classList.add("is-found");
      }
    }
    if (opts.toast) toast(opts.toast);
  }

  function renderPanel(r) {
    var ex = r.ex;
    var statusCls = STATUS_CLASS[ex.status];
    var statusLbl = STATUS_LABEL[ex.status];

    if (ex.status === "amenity") {
      panelBody.innerHTML =
        '<div class="gx-head">' +
          '<div><span class="gx-no">' + escapeHtml(r.no) + ' · ' + currentFloor + '</span>' +
          '<h2 class="gx-name">' + escapeHtml(ex.title) + '</h2></div>' +
          '<span class="badge ' + statusCls + '">' + statusLbl + '</span>' +
        '</div>' +
        '<p class="amenity-note">' + escapeHtml(ex.amenity) + '</p>' +
        '<div class="gx-actions" style="margin-top:18px">' +
          '<button class="btn btn-ghost" data-route>Route from entrance</button>' +
        '</div>';
    } else {
      var grad = r.accent
        ? "linear-gradient(135deg," + r.accent[0] + " 0%," + r.accent[1] + " 100%)"
        : "var(--gold-50)";
      panelBody.innerHTML =
        '<div class="gx-head">' +
          '<div><span class="gx-no">' + escapeHtml(r.no) + ' · ' + escapeHtml(r.name) + ' · ' + currentFloor + '</span>' +
          '<h2 class="gx-name">' + escapeHtml(ex.title) + '</h2></div>' +
          '<span class="badge ' + statusCls + '">' + statusLbl + '</span>' +
        '</div>' +
        '<div class="gx-art" style="background:' + grad + '"><span class="mat"></span></div>' +
        '<p class="gx-sub">' + escapeHtml(ex.sub) + '</p>' +
        '<p class="gx-dates">' + escapeHtml(ex.dates) + '</p>' +
        '<p class="gx-desc">' + escapeHtml(ex.desc) + '</p>' +
        '<dl class="gx-meta">' +
          '<div><dt>Medium</dt><dd>' + escapeHtml(ex.medium) + '</dd></div>' +
          '<div><dt>Scope</dt><dd>' + escapeHtml(ex.works) + '</dd></div>' +
          '<div><dt>Attribution</dt><dd>' + escapeHtml(ex.artist) + '</dd></div>' +
          '<div><dt>Curator</dt><dd>' + escapeHtml(ex.curator) + '</dd></div>' +
        '</dl>' +
        '<div class="gx-actions">' +
          '<button class="btn btn-primary" data-guide>Add to my visit</button>' +
          '<button class="btn btn-ghost" data-route>Route from entrance</button>' +
        '</div>';
    }

    var guideBtn = panelBody.querySelector("[data-guide]");
    if (guideBtn) guideBtn.addEventListener("click", function () {
      toast("Added " + ex.title + " to your visit");
    });
    var routeBtn = panelBody.querySelector("[data-route]");
    if (routeBtn) routeBtn.addEventListener("click", function () {
      toast("Routing to " + r.name + " on " + currentFloor);
    });
  }

  function renderEmpty() {
    panelBody.innerHTML =
      '<div class="panel-empty">' +
        '<span class="pe-mark" aria-hidden="true">◈</span>' +
        '<h3>Select a space</h3>' +
        '<p>Tap any gallery or amenity on the plan to see its current exhibition and details.</p>' +
      '</div>';
  }

  /* ---------------- Floors / tabs ---------------- */
  function setFloor(floor, silent) {
    if (floor === currentFloor) { renderFloor(floor); return; }
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-floor") === floor;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderFloor(floor);
    if (!silent) toast("Now showing " + floorName(floor));
  }

  function floorName(f) {
    return f === "L1" ? "Level 1" : f === "L2" ? "Level 2" : "Lower B";
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      setFloor(t.getAttribute("data-floor"));
    });
  });

  /* ---------------- Room click / keyboard ---------------- */
  function onRoomActivate(e) {
    var g = e.target.closest ? e.target.closest(".room") : null;
    if (!g) return;
    selectRoom(g.getAttribute("data-id"));
  }
  roomsGroup.addEventListener("click", onRoomActivate);
  roomsGroup.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      var g = e.target.closest ? e.target.closest(".room") : null;
      if (g) { e.preventDefault(); selectRoom(g.getAttribute("data-id")); }
    }
  });

  /* ---------------- Find / search ---------------- */
  function searchRooms(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    return ROOMS.filter(function (r) {
      return r.name.toLowerCase().indexOf(q) > -1 ||
             r.no.toLowerCase().indexOf(q) > -1 ||
             (r.ex.title && r.ex.title.toLowerCase().indexOf(q) > -1);
    }).slice(0, 7);
  }

  function renderResults(list) {
    resultCursor = -1;
    if (!findInput.value.trim()) { hideResults(); return; }
    if (!list.length) {
      findResults.innerHTML = '<li class="res-empty">No matching space found</li>';
      findResults.hidden = false;
      return;
    }
    findResults.innerHTML = list.map(function (r) {
      var ic = r.kind === "gallery" ? "▣" : (r.icon || "•");
      return '<li role="option" data-id="' + r.id + '">' +
        '<span aria-hidden="true">' + ic + '</span>' +
        '<span>' + escapeHtml(r.name) + '</span>' +
        '<span class="res-floor">' + floorName(r.floor) + '</span></li>';
    }).join("");
    findResults.hidden = false;
  }

  function hideResults() {
    findResults.hidden = true;
    findResults.innerHTML = "";
    resultCursor = -1;
  }

  findInput.addEventListener("input", function () {
    renderResults(searchRooms(findInput.value));
  });

  findResults.addEventListener("click", function (e) {
    var li = e.target.closest("li[data-id]");
    if (!li) return;
    pickResult(li.getAttribute("data-id"));
  });

  function pickResult(id) {
    var r = getRoom(id);
    hideResults();
    findInput.value = r.name;
    selectRoom(id, { found: true, toast: "Highlighting " + r.name + " · " + floorName(r.floor) });
  }

  findForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var items = findResults.querySelectorAll("li[data-id]");
    if (resultCursor > -1 && items[resultCursor]) {
      pickResult(items[resultCursor].getAttribute("data-id"));
      return;
    }
    var list = searchRooms(findInput.value);
    if (list.length) {
      pickResult(list[0].id);
    } else {
      toast("No matching space found");
    }
  });

  findInput.addEventListener("keydown", function (e) {
    var items = findResults.querySelectorAll("li[data-id]");
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      resultCursor = Math.min(resultCursor + 1, items.length - 1);
      updateCursor(items);
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      resultCursor = Math.max(resultCursor - 1, 0);
      updateCursor(items);
    } else if (e.key === "Escape") {
      hideResults();
    }
  });

  function updateCursor(items) {
    Array.prototype.forEach.call(items, function (li, i) {
      li.classList.toggle("is-cursor", i === resultCursor);
    });
  }

  document.addEventListener("click", function (e) {
    if (!findForm.contains(e.target)) hideResults();
  });

  /* ---------------- Init ---------------- */
  renderFloor("L1");
  renderEmpty();
})();
