// Photography — Portfolio Gallery
// Filterable CSS-columns masonry + keyboard-driven lightbox. Vanilla JS.

(function () {
  "use strict";

  var U = "https://images.unsplash.com/";
  var Q = "?auto=format&fit=crop&w=900&q=70";

  // Fictional portfolio archive. category drives filtering.
  var PHOTOS = [
    { id: "p01", cat: "weddings", title: "First Dance", loc: "Sintra, PT", img: "photo-1519741497674-611481863552", ratio: 66 },
    { id: "p02", cat: "portraits", title: "Studio No. 4", loc: "Lisbon, PT", img: "photo-1494790108377-be9c29b29330", ratio: 125 },
    { id: "p03", cat: "products", title: "Ceramic Study", loc: "Porto, PT", img: "photo-1600585154340-be6161a56a0c", ratio: 75 },
    { id: "p04", cat: "travel", title: "Blue Hour Bridge", loc: "Kyoto, JP", img: "photo-1493976040374-85c8e12f0c0e", ratio: 66 },
    { id: "p05", cat: "weddings", title: "Vows at Dusk", loc: "Amalfi, IT", img: "photo-1465495976277-4387d4b0b4c6", ratio: 130 },
    { id: "p06", cat: "portraits", title: "Window Light", loc: "Lisbon, PT", img: "photo-1506794778202-cad84cf45f1d", ratio: 128 },
    { id: "p07", cat: "products", title: "Amber Bottle", loc: "Studio", img: "photo-1523275335684-37898b6baf30", ratio: 100 },
    { id: "p08", cat: "travel", title: "Salt Flats", loc: "Uyuni, BO", img: "photo-1470071459604-3b5ec3a7fe05", ratio: 66 },
    { id: "p09", cat: "weddings", title: "Confetti Exit", loc: "Sevilla, ES", img: "photo-1511285560929-80b456fea0bc", ratio: 70 },
    { id: "p10", cat: "portraits", title: "Golden Coat", loc: "Madrid, ES", img: "photo-1544005313-94ddf0286df2", ratio: 132 },
    { id: "p11", cat: "products", title: "Fresh Roast", loc: "Studio", img: "photo-1461023058943-07fcbe16d735", ratio: 66 },
    { id: "p12", cat: "travel", title: "Alpine Fog", loc: "Dolomites, IT", img: "photo-1506905925346-21bda4d32df4", ratio: 66 },
    { id: "p13", cat: "weddings", title: "Held Close", loc: "Sintra, PT", img: "photo-1583939003579-730e3918a45a", ratio: 120 },
    { id: "p14", cat: "portraits", title: "Quiet Profile", loc: "Lisbon, PT", img: "photo-1529626455594-4ff0802cfb7e", ratio: 100 },
    { id: "p15", cat: "products", title: "Leather & Brass", loc: "Studio", img: "photo-1553062407-98eeb64c6a62", ratio: 75 },
    { id: "p16", cat: "travel", title: "Terracotta Roofs", loc: "Marrakesh, MA", img: "photo-1539020140153-e479b8c22e70", ratio: 66 },
    { id: "p17", cat: "portraits", title: "Backlit Curls", loc: "Porto, PT", img: "photo-1531123897727-8f129e1688ce", ratio: 130 },
    { id: "p18", cat: "travel", title: "Harbor Morning", loc: "Nazaré, PT", img: "photo-1502602898657-3e91760cbb34", ratio: 66 }
  ];

  var gallery = document.getElementById("gallery");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var toastEl = document.getElementById("toast");

  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbBadge = document.getElementById("lbBadge");
  var lbTitle = document.getElementById("lbTitle");
  var lbLoc = document.getElementById("lbLoc");
  var lbCounter = document.getElementById("lbCounter");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");

  var LABELS = {
    all: "All work",
    weddings: "Weddings",
    portraits: "Portraits",
    products: "Products",
    travel: "Travel"
  };

  var currentFilter = "all";
  var visible = [];      // photo objects currently shown (filtered order)
  var lbIndex = -1;      // index within `visible`
  var lastFocused = null;
  var toastTimer = null;

  // ---- Build the grid ----
  function buildGrid() {
    var frag = document.createDocumentFragment();
    PHOTOS.forEach(function (p) {
      var btn = document.createElement("button");
      btn.className = "frame is-entering";
      btn.type = "button";
      btn.dataset.cat = p.cat;
      btn.dataset.id = p.id;
      btn.setAttribute("aria-label", "View " + p.title + " — " + p.loc);

      var img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.src = U + p.img + Q;
      img.alt = p.title + ", " + LABELS[p.cat] + " in " + p.loc;
      // reserve space to reduce reflow jump
      img.width = 900;
      img.height = Math.round(900 * p.ratio / 100);

      var overlay = document.createElement("div");
      overlay.className = "frame-overlay";
      overlay.innerHTML =
        '<span class="frame-badge">' + LABELS[p.cat] + '</span>' +
        '<span class="frame-title">' + p.title + '</span>' +
        '<span class="frame-loc">' + p.loc + '</span>';

      btn.appendChild(img);
      btn.appendChild(overlay);
      btn.addEventListener("click", function () { openLightbox(p.id, btn); });
      frag.appendChild(btn);
    });
    gallery.appendChild(frag);
  }

  // ---- Chip counts ----
  function paintCounts() {
    var counts = { all: PHOTOS.length };
    PHOTOS.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    document.querySelectorAll(".chip-count").forEach(function (el) {
      var key = el.getAttribute("data-count");
      el.textContent = counts[key] || 0;
    });
  }

  // ---- Filtering ----
  function applyFilter(filter) {
    currentFilter = filter;
    visible = [];
    var frames = gallery.querySelectorAll(".frame");

    frames.forEach(function (frame) {
      var match = filter === "all" || frame.dataset.cat === filter;
      if (match) {
        var wasHidden = frame.classList.contains("is-gone");
        frame.classList.remove("is-gone", "is-hiding");
        if (wasHidden) {
          // re-entry animation
          frame.classList.remove("is-entering");
          void frame.offsetWidth; // reflow to restart animation
          frame.classList.add("is-entering");
        }
        var photo = PHOTOS.filter(function (p) { return p.id === frame.dataset.id; })[0];
        if (photo) visible.push(photo);
      } else {
        frame.classList.add("is-hiding");
      }
    });

    // remove from flow after the fade so masonry recollapses
    window.setTimeout(function () {
      frames.forEach(function (frame) {
        if (frame.classList.contains("is-hiding")) frame.classList.add("is-gone");
      });
    }, 400);
  }

  function setActiveChip(chip) {
    chips.forEach(function (c) {
      var on = c === chip;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.dataset.filter;
      if (filter === currentFilter) return;
      setActiveChip(chip);
      applyFilter(filter);
      var n = filter === "all" ? PHOTOS.length : PHOTOS.filter(function (p) { return p.cat === filter; }).length;
      toast(LABELS[filter] + " — " + n + " frame" + (n === 1 ? "" : "s"));
    });
  });

  // ---- Lightbox ----
  function openLightbox(id, trigger) {
    lbIndex = visible.map(function (p) { return p.id; }).indexOf(id);
    if (lbIndex < 0) return;
    lastFocused = trigger || document.activeElement;
    renderLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function renderLightbox() {
    var p = visible[lbIndex];
    if (!p) return;
    lbImg.src = U + p.img + "?auto=format&fit=crop&w=1600&q=80";
    lbImg.alt = p.title + ", " + LABELS[p.cat] + " in " + p.loc;
    // restart the stage-in animation
    lbImg.style.animation = "none";
    void lbImg.offsetWidth;
    lbImg.style.animation = "";
    lbBadge.textContent = LABELS[p.cat];
    lbTitle.textContent = p.title;
    lbLoc.textContent = p.loc;
    lbCounter.textContent = (lbIndex + 1) + " / " + visible.length;
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function step(dir) {
    if (!visible.length) return;
    lbIndex = (lbIndex + dir + visible.length) % visible.length;
    renderLightbox();
  }

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { step(-1); });
  lbNext.addEventListener("click", function () { step(1); });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });

  // ---- Toast ----
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  // ---- Init ----
  buildGrid();
  paintCounts();
  applyFilter("all");
})();
