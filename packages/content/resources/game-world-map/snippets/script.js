(function () {
  "use strict";

  /* ============================================================
     Ashen Vanguard — Interactive World Atlas
     Vanilla JS: pins + popover, layer toggles, zoom/pan,
     fog-of-war reveal, region progress meters, markers.
     ============================================================ */

  var world = document.getElementById("world");
  var viewport = document.getElementById("viewport");
  var popover = document.getElementById("popover");
  var toastEl = document.getElementById("toast");

  /* ---------- Location data (fictional) ---------- */
  // x/y are percentages of the 1400x900 world.
  var LOCATIONS = [
    { id: "havenmoor", layer: "town", region: "verdant", x: 18, y: 22, icon: "⌂",
      name: "Havenmoor", type: "Settlement", level: "Lv 1–8", here: true,
      desc: "A walled river town and the Vanguard's last safe muster point before the Reach." },
    { id: "mossgrave", layer: "dungeon", region: "verdant", x: 33, y: 38, icon: "⚔",
      name: "Mossgrave Barrow", type: "Dungeon", level: "Lv 8–14",
      desc: "A flooded burial delve where root-bound revenants guard a sealed king's vault." },
    { id: "verdant-quest", layer: "quest", region: "verdant", x: 26, y: 14, icon: "❢",
      name: "The Withered Oath", type: "Quest", level: "Lv 6+",
      desc: "Recover the Warden's broken sigil from the orchard ruins south of Havenmoor." },
    { id: "frostwatch", layer: "town", region: "frost", x: 70, y: 18, icon: "⌂",
      name: "Frostwatch Hold", type: "Settlement", level: "Lv 14–20",
      desc: "A garrison carved into a glacier face; the only forge that still tempers rimesteel." },
    { id: "rime-merchant", layer: "shop", region: "frost", x: 80, y: 14, icon: "⬢",
      name: "Vael's Cold Caravan", type: "Merchant", level: "—",
      desc: "A wandering rimewright who trades in frost runes and contraband Nullforge schematics." },
    { id: "wyrm-boss", layer: "boss", region: "frost", x: 88, y: 30, icon: "☠",
      name: "Glaciaxis, the Pale Wyrm", type: "World Boss", level: "Lv 28",
      desc: "A frost drake roosting in the shattered peak. Group content — bring at least four." },
    { id: "frost-quest", layer: "quest", region: "frost", x: 62, y: 24, icon: "❢",
      name: "Embers in the Snow", type: "Quest", level: "Lv 16+",
      desc: "Relight the four warding braziers before the tundra storm swallows the pass." },
    { id: "marrow-vault", layer: "dungeon", region: "marrow", x: 16, y: 55, icon: "⚔",
      name: "The Sunken Vault", type: "Dungeon", level: "Lv 22–28", fogged: true,
      desc: "A drowned Nullforge armory. The tide reveals a new floor every hour it remembers you." },
    { id: "marrow-shop", layer: "shop", region: "marrow", x: 28, y: 62, icon: "⬢", fogged: true,
      name: "The Hollow Exchange", type: "Merchant", level: "—",
      desc: "A black-market stall lit by drowned lanterns. Pays in marrow-shards, asks no names." },
    { id: "ember-boss", layer: "boss", region: "ember", x: 72, y: 56, icon: "☠",
      name: "Warden Kael, Oathbreaker", type: "World Boss", level: "Lv 34", locked: true,
      desc: "Sealed behind the Crown's edict. Defeat the three Reach captains to break the ward." },
    { id: "ember-travel", layer: "travel", region: "ember", x: 66, y: 52, icon: "✦", fogged: true,
      name: "Cinderspire Waypoint", type: "Waypoint", level: "—",
      desc: "An attuned fast-travel obelisk overlooking the lava terraces of Emberfall Reach." }
  ];

  var REGIONS = ["verdant", "frost", "marrow", "ember"];

  /* ---------- State ---------- */
  var state = {
    zoom: 1,
    minZoom: 0.55,
    maxZoom: 2.4,
    tx: 0,
    ty: 0,
    activeId: null,
    activePinEl: null,
    layers: { town: true, dungeon: true, boss: true, travel: true, shop: true, quest: true }
  };

  var pinEls = {};

  /* ---------- Toast helper ---------- */
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Build pins ---------- */
  function buildPins() {
    LOCATIONS.forEach(function (loc) {
      var pin = document.createElement("button");
      pin.type = "button";
      pin.className = "pin pin--" + loc.layer;
      pin.style.left = loc.x + "%";
      pin.style.top = loc.y + "%";
      pin.dataset.id = loc.id;
      pin.dataset.layer = loc.layer;
      pin.innerHTML = (loc.fogged ? "?" : loc.icon) +
        '<span class="pin__flag" aria-hidden="true">⚑</span>';

      var label = loc.fogged ? "Uncharted location" : loc.name + " — " + loc.type;
      pin.setAttribute("aria-label", label);

      if (loc.fogged) pin.classList.add("is-fogged");
      if (loc.locked) pin.classList.add("is-locked");
      if (loc.here) pin.classList.add("is-here");

      pin.addEventListener("click", function (e) {
        e.stopPropagation();
        onPinClick(loc, pin);
      });

      world.appendChild(pin);
      pinEls[loc.id] = pin;
    });
  }

  /* ---------- Pin click ---------- */
  function onPinClick(loc, pin) {
    if (loc.fogged) {
      // discover it
      loc.fogged = false;
      pin.classList.remove("is-fogged");
      pin.firstChild.textContent = loc.icon;
      pin.setAttribute("aria-label", loc.name + " — " + loc.type);
      pin.classList.add("just-discovered");
      pin.addEventListener("animationend", function handler() {
        pin.classList.remove("just-discovered");
        pin.removeEventListener("animationend", handler);
      });
      toast("✦ Charted: " + loc.name);
      updateProgress();
    }
    selectPin(loc, pin);
  }

  function selectPin(loc, pin) {
    if (state.activePinEl) state.activePinEl.classList.remove("is-active");
    pin.classList.add("is-active");
    state.activePinEl = pin;
    state.activeId = loc.id;
    openPopover(loc, pin);
  }

  /* ---------- Popover ---------- */
  var popType = document.getElementById("popType");
  var popLevel = document.getElementById("popLevel");
  var popName = document.getElementById("popName");
  var popDesc = document.getElementById("popDesc");
  var popStatus = document.getElementById("popStatus");
  var travelBtn = document.getElementById("travelBtn");
  var markBtn = document.getElementById("markBtn");
  var popClose = document.getElementById("popClose");

  var pinColors = {
    town: "var(--accent)", dungeon: "var(--accent-2)", boss: "var(--accent-3)",
    travel: "var(--success)", shop: "var(--warn)", quest: "var(--quest)"
  };

  function openPopover(loc, pin) {
    popType.textContent = loc.type;
    popLevel.textContent = loc.level;
    popName.textContent = loc.name;
    popDesc.textContent = loc.desc;
    popover.style.setProperty("--pop-color", pinColors[loc.layer] || "var(--accent)");

    // status line
    popStatus.className = "popover__status";
    if (loc.locked) {
      popStatus.textContent = "✖ Sealed — story-locked region";
      popStatus.classList.add("is-bad");
      travelBtn.disabled = true;
    } else if (loc.here) {
      popStatus.textContent = "● You are here";
      popStatus.classList.add("is-good");
      travelBtn.disabled = true;
    } else {
      popStatus.textContent = loc.layer === "travel"
        ? "✦ Attuned waypoint — instant travel"
        : "↟ Reachable — discovered";
      popStatus.classList.add("is-good");
      travelBtn.disabled = false;
    }

    markBtn.textContent = pin.classList.contains("is-marked") ? "⚑ Marked" : "⚑ Set Marker";

    travelBtn.onclick = function () {
      if (travelBtn.disabled) return;
      toast("✦ Fast travelling to " + loc.name + "…");
      // move "you are here" marker
      LOCATIONS.forEach(function (l) {
        if (pinEls[l.id]) pinEls[l.id].classList.remove("is-here");
        l.here = false;
      });
      pin.classList.add("is-here");
      loc.here = true;
      centerOn(loc);
      closePopover();
    };

    markBtn.onclick = function () {
      var on = pin.classList.toggle("is-marked");
      markBtn.textContent = on ? "⚑ Marked" : "⚑ Set Marker";
      toast(on ? "⚑ Marker set on " + loc.name : "Marker cleared");
    };

    // position popover near pin (in viewport coords)
    popover.hidden = false;
    positionPopover(pin);
  }

  function positionPopover(pin) {
    var vpRect = viewport.getBoundingClientRect();
    var pinRect = pin.getBoundingClientRect();
    var px = pinRect.left - vpRect.left + pinRect.width / 2;
    var py = pinRect.top - vpRect.top;

    var pw = popover.offsetWidth || 268;
    var ph = popover.offsetHeight || 220;

    var left = px - pw / 2;
    var top = py - ph - 14;

    if (top < 8) top = py + pinRect.height + 14; // flip below
    left = Math.max(8, Math.min(left, vpRect.width - pw - 8));
    top = Math.max(8, Math.min(top, vpRect.height - ph - 8));

    popover.style.left = left + "px";
    popover.style.top = top + "px";
  }

  function closePopover() {
    popover.hidden = true;
    if (state.activePinEl) state.activePinEl.classList.remove("is-active");
    state.activePinEl = null;
    state.activeId = null;
  }

  popClose.addEventListener("click", closePopover);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !popover.hidden) closePopover();
  });

  /* ---------- Layer toggles ---------- */
  function applyLayers() {
    LOCATIONS.forEach(function (loc) {
      var pin = pinEls[loc.id];
      if (!pin) return;
      pin.classList.toggle("layer-off", !state.layers[loc.layer]);
    });
    // close popover if its pin got hidden
    if (state.activeId) {
      var p = pinEls[state.activeId];
      if (p && p.classList.contains("layer-off")) closePopover();
    }
  }

  function updateLayerCounts() {
    var counts = {};
    LOCATIONS.forEach(function (loc) { counts[loc.layer] = (counts[loc.layer] || 0) + 1; });
    document.querySelectorAll("[data-count]").forEach(function (el) {
      el.textContent = counts[el.getAttribute("data-count")] || 0;
    });
  }

  document.querySelectorAll("#layerToggles input[data-layer]").forEach(function (input) {
    input.addEventListener("change", function () {
      var layer = input.getAttribute("data-layer");
      state.layers[layer] = input.checked;
      applyLayers();
      toast((input.checked ? "Showing " : "Hiding ") + layer + " markers");
    });
  });

  /* ---------- Region progress meters ---------- */
  function updateProgress() {
    REGIONS.forEach(function (region) {
      var inRegion = LOCATIONS.filter(function (l) { return l.region === region; });
      var found = inRegion.filter(function (l) { return !l.fogged; }).length;
      var pct = inRegion.length ? Math.round((found / inRegion.length) * 100) : 0;
      var meter = document.querySelector('.meter[data-region="' + region + '"]');
      if (!meter) return;
      meter.querySelector("[data-meter-fill]").style.width = pct + "%";
      meter.querySelector("[data-meter-val]").textContent = pct + "%";
    });

    var total = LOCATIONS.length;
    var charted = LOCATIONS.filter(function (l) { return !l.fogged; }).length;
    var stat = document.getElementById("chartedStat");
    if (stat) stat.textContent = charted + " / " + total;

    var lensBtn = document.getElementById("lensBtn");
    if (lensBtn) {
      var remaining = total - charted;
      lensBtn.disabled = remaining === 0;
      lensBtn.textContent = remaining === 0 ? "✓ Realm Fully Charted" : "✦ Reveal a Location";
    }
  }

  /* ---------- Cartographer's Lens (reveal random fogged) ---------- */
  document.getElementById("lensBtn").addEventListener("click", function () {
    var fogged = LOCATIONS.filter(function (l) { return l.fogged; });
    if (!fogged.length) { toast("The realm is already fully charted."); return; }
    var loc = fogged[Math.floor(Math.random() * fogged.length)];
    var pin = pinEls[loc.id];
    loc.fogged = false;
    pin.classList.remove("is-fogged");
    pin.firstChild.textContent = loc.icon;
    pin.setAttribute("aria-label", loc.name + " — " + loc.type);
    pin.classList.add("just-discovered");
    pin.addEventListener("animationend", function h() {
      pin.classList.remove("just-discovered");
      pin.removeEventListener("animationend", h);
    });
    toast("✦ Lens charge spent — revealed " + loc.name);
    updateProgress();
    centerOn(loc);
  });

  /* ---------- Reveal fog: legend reveal button (if present) ---------- */
  // (Lens handles random reveal; clicking fogged pins also charts them.)

  /* ============================================================
     Zoom + Pan
     ============================================================ */
  var zoomLevel = document.getElementById("zoomLevel");
  var coordsReadout = document.getElementById("coordsReadout");

  function clampPan() {
    var vpRect = viewport.getBoundingClientRect();
    var worldW = 1400 * state.zoom;
    var worldH = 900 * state.zoom;
    var minTx = Math.min(0, vpRect.width - worldW);
    var minTy = Math.min(0, vpRect.height - worldH);
    state.tx = Math.max(minTx, Math.min(0, state.tx));
    state.ty = Math.max(minTy, Math.min(0, state.ty));
  }

  function render() {
    clampPan();
    world.style.transform = "translate(" + state.tx + "px," + state.ty + "px) scale(" + state.zoom + ")";
    if (zoomLevel) zoomLevel.textContent = Math.round(state.zoom * 100) + "%";
    if (!popover.hidden && state.activePinEl) positionPopover(state.activePinEl);
  }

  function setZoom(z, originX, originY) {
    var prev = state.zoom;
    var next = Math.max(state.minZoom, Math.min(state.maxZoom, z));
    if (next === prev) return;

    // zoom around a viewport point (default = center)
    var vpRect = viewport.getBoundingClientRect();
    if (originX == null) originX = vpRect.width / 2;
    if (originY == null) originY = vpRect.height / 2;

    var worldX = (originX - state.tx) / prev;
    var worldY = (originY - state.ty) / prev;
    state.zoom = next;
    state.tx = originX - worldX * next;
    state.ty = originY - worldY * next;
    render();
  }

  document.getElementById("zoomIn").addEventListener("click", function () { setZoom(state.zoom + 0.25); });
  document.getElementById("zoomOut").addEventListener("click", function () { setZoom(state.zoom - 0.25); });
  document.getElementById("zoomReset").addEventListener("click", function () {
    state.zoom = 1; state.tx = 0; state.ty = 0; render();
    toast("View reset");
  });

  // wheel zoom
  viewport.addEventListener("wheel", function (e) {
    e.preventDefault();
    var vpRect = viewport.getBoundingClientRect();
    var ox = e.clientX - vpRect.left;
    var oy = e.clientY - vpRect.top;
    setZoom(state.zoom + (e.deltaY < 0 ? 0.18 : -0.18), ox, oy);
  }, { passive: false });

  // center a location in the viewport
  function centerOn(loc) {
    var vpRect = viewport.getBoundingClientRect();
    var wx = (loc.x / 100) * 1400;
    var wy = (loc.y / 100) * 900;
    state.tx = vpRect.width / 2 - wx * state.zoom;
    state.ty = vpRect.height / 2 - wy * state.zoom;
    render();
  }

  /* ---------- Pan via pointer drag ---------- */
  var dragging = false, moved = false, startX = 0, startY = 0, startTx = 0, startTy = 0;

  viewport.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".pin") || e.target.closest(".popover")) return;
    dragging = true; moved = false;
    startX = e.clientX; startY = e.clientY;
    startTx = state.tx; startTy = state.ty;
    viewport.classList.add("is-panning");
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener("pointermove", function (e) {
    var vpRect = viewport.getBoundingClientRect();
    if (coordsReadout) {
      var wx = Math.round((e.clientX - vpRect.left - state.tx) / state.zoom);
      var wy = Math.round((e.clientY - vpRect.top - state.ty) / state.zoom);
      coordsReadout.textContent = "X " + pad(wx) + " · Y " + pad(wy);
    }
    if (!dragging) return;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    state.tx = startTx + dx;
    state.ty = startTy + dy;
    render();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("is-panning");
    if (e && e.pointerId != null) {
      try { viewport.releasePointerCapture(e.pointerId); } catch (err) {}
    }
  }
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  // click on empty map closes popover (but not after a drag)
  viewport.addEventListener("click", function (e) {
    if (moved) { moved = false; return; }
    if (!e.target.closest(".pin") && !e.target.closest(".popover")) closePopover();
  });

  function pad(n) {
    var neg = n < 0;
    var s = String(Math.abs(n));
    while (s.length < 4) s = "0" + s;
    return (neg ? "-" : "") + s;
  }

  /* ---------- Init ---------- */
  buildPins();
  updateLayerCounts();
  applyLayers();
  updateProgress();
  render();

  // reposition popover on resize
  window.addEventListener("resize", function () {
    clampPan();
    render();
  });
})();
