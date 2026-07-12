(function () {
  "use strict";

  /* ---------- Material library ---------- */
  var LIBRARY = [
    { key: "oak",       name: "White Oak",       kind: "Wood",    hex: "#c9a97e" },
    { key: "walnut",    name: "Walnut",          kind: "Wood",    hex: "#6b4a33" },
    { key: "plaster",   name: "Lime Plaster",    kind: "Finish",  hex: "#e7ddce" },
    { key: "terracot",  name: "Terracotta",      kind: "Tile",    hex: "#b5654a" },
    { key: "linen",     name: "Oat Linen",       kind: "Fabric",  hex: "#d8cdb8" },
    { key: "sage",      name: "Sage Velvet",     kind: "Fabric",  hex: "#9caf88" },
    { key: "rattan",    name: "Rattan",          kind: "Weave",   hex: "#caa46a" },
    { key: "marble",    name: "Pietra Grey",     kind: "Stone",   hex: "#6f6a63" },
    { key: "brass",     name: "Aged Brass",      kind: "Metal",   hex: "#b08d57" },
    { key: "clay",      name: "Clay Wash",       kind: "Paint",   hex: "#b08968" }
  ];

  /* A few named photographic finishes for variety (gradient-backed, no hotlinking risk) */
  function swatchBg(hex) {
    var c = shade(hex, -18);
    var l = shade(hex, 16);
    return "linear-gradient(135deg, " + l + " 0%, " + hex + " 52%, " + c + " 100%)";
  }

  /* ---------- Color helpers ---------- */
  function hexToRgb(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  function rgbToHex(r, g, b) {
    function p(v) { v = Math.max(0, Math.min(255, Math.round(v))); return ("0" + v.toString(16)).slice(-2); }
    return "#" + p(r) + p(g) + p(b);
  }
  function shade(hex, amt) {
    var c = hexToRgb(hex);
    var t = amt < 0 ? 0 : 255;
    var p = Math.abs(amt) / 100;
    return rgbToHex(c.r + (t - c.r) * p, c.g + (t - c.g) * p, c.b + (t - c.b) * p);
  }
  function luminance(hex) {
    var c = hexToRgb(hex);
    return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
  }

  /* ---------- State ---------- */
  var canvas = document.getElementById("canvas");
  var canvasHint = document.getElementById("canvasHint");
  var tray = document.getElementById("swatchTray");
  var paletteStrip = document.getElementById("paletteStrip");
  var paletteCount = document.getElementById("paletteCount");
  var tileCountEl = document.getElementById("tileCount");
  var toastEl = document.getElementById("toast");

  var dupBtn = document.getElementById("dupBtn");
  var backBtn = document.getElementById("backBtn");
  var delBtn = document.getElementById("delBtn");
  var shuffleBtn = document.getElementById("shuffleBtn");
  var clearBtn = document.getElementById("clearBtn");

  var tiles = [];      // { id, mat, x, y, z, el }
  var selectedId = null;
  var zTop = 1;
  var idSeq = 1;

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1900);
  }

  /* ---------- Build material tray ---------- */
  LIBRARY.forEach(function (mat) {
    var btn = document.createElement("button");
    btn.className = "chip-btn";
    btn.type = "button";
    btn.setAttribute("role", "listitem");
    btn.setAttribute("aria-label", "Add " + mat.name + " chip to board");
    var dot = document.createElement("span");
    dot.className = "chip-dot";
    dot.style.background = swatchBg(mat.hex);
    var nm = document.createElement("span");
    nm.className = "chip-name";
    nm.textContent = mat.name;
    btn.appendChild(dot);
    btn.appendChild(nm);
    btn.addEventListener("click", function () { addTile(mat); });
    tray.appendChild(btn);
  });

  /* ---------- Tile creation ---------- */
  function addTile(mat, x, y) {
    var rect = canvas.getBoundingClientRect();
    var tileW = window.innerWidth <= 520 ? 128 : 150;
    var tileH = 140;
    if (typeof x !== "number") x = 24 + Math.random() * Math.max(20, rect.width - tileW - 48);
    if (typeof y !== "number") y = 20 + Math.random() * Math.max(20, rect.height - tileH - 40);

    var id = idSeq++;
    var el = document.createElement("div");
    el.className = "tile";
    el.tabIndex = 0;
    el.dataset.id = String(id);
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", mat.name + " tile. Drag or use arrow keys to move.");

    var textColor = luminance(mat.hex) > 0.62 ? "#2c2620" : "#fbf9f5";
    el.innerHTML =
      '<div class="tile-swatch" style="background:' + swatchBg(mat.hex) + '">' +
        '<span class="tile-badge">' + mat.kind + "</span>" +
      "</div>" +
      '<div class="tile-body">' +
        '<span class="tile-name">' + mat.name + "</span>" +
        '<span class="tile-hex">' + mat.hex.toUpperCase() + "</span>" +
      "</div>";
    void textColor;

    var t = { id: id, mat: mat, x: x, y: y, z: ++zTop, el: el };
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.zIndex = t.z;

    tiles.push(t);
    canvas.appendChild(el);
    attachDrag(t);
    attachKeys(t);
    el.addEventListener("pointerdown", function () { select(id); });
    select(id);
    sync();
    return t;
  }

  /* ---------- Selection ---------- */
  function select(id) {
    selectedId = id;
    tiles.forEach(function (t) { t.el.classList.toggle("selected", t.id === id); });
    var has = id !== null && getTile(id);
    dupBtn.disabled = !has;
    backBtn.disabled = !has;
    delBtn.disabled = !has;
  }
  function getTile(id) {
    for (var i = 0; i < tiles.length; i++) if (tiles[i].id === id) return tiles[i];
    return null;
  }

  function raise(t) {
    t.z = ++zTop;
    t.el.style.zIndex = t.z;
  }

  /* ---------- Drag (pointer events, mouse + touch) ---------- */
  function attachDrag(t) {
    var startX, startY, originX, originY, dragging = false, pid = null;

    t.el.addEventListener("pointerdown", function (e) {
      if (e.button && e.button !== 0) return;
      dragging = true;
      pid = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      originX = t.x;
      originY = t.y;
      raise(t);
      t.el.classList.add("dragging");
      try { t.el.setPointerCapture(pid); } catch (err) { /* noop */ }
      e.preventDefault();
    });

    t.el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var rect = canvas.getBoundingClientRect();
      var w = t.el.offsetWidth, h = t.el.offsetHeight;
      var nx = originX + (e.clientX - startX);
      var ny = originY + (e.clientY - startY);
      nx = Math.max(-w * 0.25, Math.min(rect.width - w * 0.75, nx));
      ny = Math.max(0, Math.min(rect.height - h * 0.4, ny));
      t.x = nx; t.y = ny;
      t.el.style.left = nx + "px";
      t.el.style.top = ny + "px";
    });

    function end() {
      if (!dragging) return;
      dragging = false;
      t.el.classList.remove("dragging");
      try { t.el.releasePointerCapture(pid); } catch (err) { /* noop */ }
    }
    t.el.addEventListener("pointerup", end);
    t.el.addEventListener("pointercancel", end);
  }

  /* ---------- Keyboard control ---------- */
  function attachKeys(t) {
    t.el.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 24 : 8;
      var rect = canvas.getBoundingClientRect();
      var w = t.el.offsetWidth, h = t.el.offsetHeight;
      var moved = false;
      if (e.key === "ArrowLeft") { t.x -= step; moved = true; }
      else if (e.key === "ArrowRight") { t.x += step; moved = true; }
      else if (e.key === "ArrowUp") { t.y -= step; moved = true; }
      else if (e.key === "ArrowDown") { t.y += step; moved = true; }
      else if (e.key === "Enter") { raise(t); select(t.id); toast("Raised to top"); e.preventDefault(); return; }
      else if (e.key === "Delete" || e.key === "Backspace") { removeTile(t.id); e.preventDefault(); return; }
      else { return; }

      if (moved) {
        t.x = Math.max(-w * 0.25, Math.min(rect.width - w * 0.75, t.x));
        t.y = Math.max(0, Math.min(rect.height - h * 0.4, t.y));
        t.el.style.left = t.x + "px";
        t.el.style.top = t.y + "px";
        select(t.id);
        e.preventDefault();
      }
    });
    t.el.addEventListener("focus", function () { select(t.id); });
  }

  /* ---------- Remove ---------- */
  function removeTile(id) {
    var t = getTile(id);
    if (!t) return;
    var focusNext = null;
    var idx = tiles.indexOf(t);
    t.el.remove();
    tiles.splice(idx, 1);
    if (selectedId === id) {
      focusNext = tiles.length ? tiles[Math.min(idx, tiles.length - 1)] : null;
      select(focusNext ? focusNext.id : null);
      if (focusNext) focusNext.el.focus();
    }
    sync();
    toast("Tile removed");
  }

  /* ---------- Palette derivation ---------- */
  function derivePalette() {
    if (!tiles.length) return [];
    // bucket similar hex values; count frequency weighted by recency (z)
    var buckets = {};
    tiles.forEach(function (t) {
      var c = hexToRgb(t.mat.hex);
      // quantize to reduce near-duplicates
      var key = [Math.round(c.r / 24), Math.round(c.g / 24), Math.round(c.b / 24)].join("-");
      if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, n: 0 };
      buckets[key].r += c.r; buckets[key].g += c.g; buckets[key].b += c.b; buckets[key].n += 1;
    });
    var arr = Object.keys(buckets).map(function (k) {
      var b = buckets[k];
      return { hex: rgbToHex(b.r / b.n, b.g / b.n, b.b / b.n), n: b.n };
    });
    arr.sort(function (a, b) { return b.n - a.n || luminance(b.hex) - luminance(a.hex); });
    return arr.slice(0, 5);
  }

  function renderPalette() {
    var pal = derivePalette();
    paletteStrip.innerHTML = "";
    if (!pal.length) {
      var empty = document.createElement("span");
      empty.className = "palette-empty";
      empty.textContent = "Add tiles to compose a palette.";
      paletteStrip.appendChild(empty);
      paletteCount.textContent = "—";
      return;
    }
    paletteCount.textContent = pal.length + (pal.length === 1 ? " tone" : " tones");
    pal.forEach(function (p, i) {
      var chip = document.createElement("button");
      chip.className = "palette-chip";
      chip.type = "button";
      chip.setAttribute("role", "listitem");
      chip.style.animationDelay = (i * 0.04) + "s";
      chip.setAttribute("aria-label", "Copy " + p.hex.toUpperCase());
      chip.innerHTML =
        '<span class="palette-color" style="background:' + p.hex + '"></span>' +
        '<span class="palette-label">' +
          '<span class="palette-hex">' + p.hex.toUpperCase() + "</span>" +
          '<span class="palette-share">' + Math.round((p.n / tiles.length) * 100) + "% of board</span>" +
        "</span>";
      chip.addEventListener("click", function () { copyHex(p.hex.toUpperCase()); });
      paletteStrip.appendChild(chip);
    });
  }

  function copyHex(hex) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hex).then(
        function () { toast(hex + " copied"); },
        function () { toast(hex); }
      );
    } else {
      toast(hex);
    }
  }

  /* ---------- Sync UI state ---------- */
  function sync() {
    var n = tiles.length;
    canvasHint.style.display = n ? "none" : "flex";
    tileCountEl.textContent = n + (n === 1 ? " tile on board" : " tiles on board");
    renderPalette();
  }

  /* ---------- Toolbar actions ---------- */
  dupBtn.addEventListener("click", function () {
    var t = getTile(selectedId);
    if (!t) return;
    addTile(t.mat, t.x + 22, t.y + 22);
    toast("Duplicated");
  });

  backBtn.addEventListener("click", function () {
    var t = getTile(selectedId);
    if (!t) return;
    var minZ = tiles.reduce(function (m, o) { return Math.min(m, o.z); }, Infinity);
    t.z = minZ - 1;
    t.el.style.zIndex = t.z;
    toast("Sent backward");
  });

  delBtn.addEventListener("click", function () {
    if (selectedId !== null) removeTile(selectedId);
  });

  shuffleBtn.addEventListener("click", function () {
    if (!tiles.length) { toast("Board is empty"); return; }
    var rect = canvas.getBoundingClientRect();
    tiles.forEach(function (t) {
      var w = t.el.offsetWidth, h = t.el.offsetHeight;
      t.x = 16 + Math.random() * Math.max(20, rect.width - w - 32);
      t.y = 14 + Math.random() * Math.max(20, rect.height - h - 28);
      t.el.style.left = t.x + "px";
      t.el.style.top = t.y + "px";
      raise(t);
    });
    toast("Scattered");
  });

  clearBtn.addEventListener("click", function () {
    if (!tiles.length) { toast("Already empty"); return; }
    tiles.forEach(function (t) { t.el.remove(); });
    tiles = [];
    select(null);
    sync();
    toast("Board cleared");
  });

  /* deselect when clicking empty canvas */
  canvas.addEventListener("pointerdown", function (e) {
    if (e.target === canvas || e.target === canvasHint) select(null);
  });

  /* ---------- Seed a starter board ---------- */
  function seed() {
    var picks = ["oak", "plaster", "terracot", "sage", "rattan", "walnut"];
    var rect = canvas.getBoundingClientRect();
    var cols = rect.width > 620 ? 3 : 2;
    picks.forEach(function (k, i) {
      var mat = LIBRARY.filter(function (m) { return m.key === k; })[0];
      var col = i % cols, row = Math.floor(i / cols);
      var x = 30 + col * (rect.width / cols - 20) * 0.9 + (Math.random() * 24 - 12);
      var y = 24 + row * 168 + (Math.random() * 20 - 10);
      addTile(mat, Math.max(10, x), Math.max(10, y));
    });
    select(null);
  }

  // wait for layout so canvas has real dimensions
  if (canvas.getBoundingClientRect().width > 0) seed();
  else window.requestAnimationFrame(seed);
})();
