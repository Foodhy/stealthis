(function () {
  "use strict";

  /* ---------- data ---------- */
  var U = "https://images.unsplash.com/";
  var q = "?auto=format&fit=crop&w=1200&q=80";
  var photos = [
    { id: 1, room: "living", size: "span-2", title: "The hearth room", cap: "Lime-plastered walls and a reclaimed oak mantel anchor the main living space.", img: U + "photo-1616486338812-3dadae4b4ace" + q },
    { id: 2, room: "kitchen", size: "", title: "Scullery kitchen", cap: "Hand-painted cabinetry in a soft clay tone, topped with honed limestone.", img: U + "photo-1556909212-d5b604d0c90d" + q },
    { id: 3, room: "detail", size: "", title: "Reading nook", cap: "A window seat upholstered in undyed Belgian linen.", img: U + "photo-1567016432779-094069958ea5" + q },
    { id: 4, room: "bedroom", size: "span-tall", title: "Principal bedroom", cap: "North light, layered wools and a low walnut headboard.", img: U + "photo-1616594039964-ae9021a400a0" + q },
    { id: 5, room: "detail", size: "", title: "Shelf styling", cap: "Slipware ceramics and dried grasses against a chalky sage wall.", img: U + "photo-1513694203232-719a280e022f" + q },
    { id: 6, room: "living", size: "", title: "Sitting area", cap: "A pair of vintage rush armchairs beside the garden doors.", img: U + "photo-1493809842364-78817add7ffb" + q },
    { id: 7, room: "kitchen", size: "", title: "Pantry corner", cap: "Open oak shelving keeps everyday tableware within reach.", img: U + "photo-1600585152220-90363fe7e115" + q },
    { id: 8, room: "bedroom", size: "", title: "Guest room", cap: "A restrained palette of oatmeal and warm white.", img: U + "photo-1522708323590-d24dbb6b0267" + q }
  ];

  var materials = [
    { type: "Flooring", name: "Reclaimed oak", src: "Salvaged barn boards, waxed", color: "#a07a52" },
    { type: "Walls", name: "Lime plaster", src: "Bauwerk Colour · Oyster", color: "#e7ddce" },
    { type: "Joinery", name: "Clay cabinetry", src: "Farrow & Ball · Dead Salmon", color: "#b08968" },
    { type: "Stone", name: "Honed limestone", src: "Dijon, brushed finish", color: "#cbbfa6" },
    { type: "Accent", name: "Chalky sage", src: "Little Greene · Aquamarine", color: "#9caf88" },
    { type: "Textiles", name: "Belgian linen", src: "Undyed, stonewashed", color: "#d9cdb8" },
    { type: "Metal", name: "Aged brass", src: "Unlacquered, hand-patinated", color: "#8c6a4f" },
    { type: "Detail", name: "Walnut trim", src: "Solid, oil-finished", color: "#5c4433" }
  ];

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- toast ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- build gallery ---------- */
  var grid = $("#galleryGrid");
  photos.forEach(function (p, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "frame" + (p.size ? " " + p.size : "");
    btn.setAttribute("data-room", p.room);
    btn.setAttribute("data-index", i);
    btn.setAttribute("aria-label", "View " + p.title);
    var photo = document.createElement("span");
    photo.className = "frame-photo";
    photo.style.backgroundImage = "url('" + p.img + "')";
    var cap = document.createElement("span");
    cap.className = "frame-cap";
    cap.innerHTML = '<span class="fc-room">' + p.room + '</span><span class="fc-title">' + p.title + "</span>";
    btn.appendChild(photo);
    btn.appendChild(cap);
    btn.addEventListener("click", function () { openLightbox(i); });
    grid.appendChild(btn);
  });

  /* ---------- filters ---------- */
  var chips = $$(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      var f = chip.getAttribute("data-filter");
      var shown = 0;
      $$(".frame", grid).forEach(function (frame) {
        var match = f === "all" || frame.getAttribute("data-room") === f;
        frame.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      toast(shown + (shown === 1 ? " room" : " rooms") + " shown");
    });
  });

  /* ---------- lightbox ---------- */
  var lb = $("#lightbox");
  var lbImg = $("#lbImg");
  var lbCap = $("#lbCaption");
  var lbCurrent = 0;
  var lastFocus = null;

  function visiblePhotos() {
    return $$(".frame", grid).filter(function (f) { return !f.classList.contains("is-hidden"); })
      .map(function (f) { return parseInt(f.getAttribute("data-index"), 10); });
  }

  function renderLb(idx) {
    var p = photos[idx];
    lbImg.style.backgroundImage = "url('" + p.img + "')";
    lbCap.innerHTML = "<b>" + p.title + "</b>" + p.cap;
    lbCurrent = idx;
  }

  function openLightbox(idx) {
    lastFocus = document.activeElement;
    renderLb(idx);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lbClose").focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function step(dir) {
    var vis = visiblePhotos();
    if (!vis.length) return;
    var pos = vis.indexOf(lbCurrent);
    if (pos === -1) pos = 0;
    pos = (pos + dir + vis.length) % vis.length;
    renderLb(vis[pos]);
  }

  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", function () { step(-1); });
  $("#lbNext").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  /* ---------- build materials ---------- */
  var matGrid = $("#matGrid");
  materials.forEach(function (m) {
    var li = document.createElement("li");
    li.className = "mat";
    li.innerHTML =
      '<div class="mat-swatch" style="background:' + m.color + '"></div>' +
      '<div class="mat-body">' +
      '<p class="mat-type">' + m.type + "</p>" +
      '<p class="mat-name">' + m.name + "</p>" +
      '<p class="mat-src">' + m.src + "</p>" +
      "</div>";
    li.addEventListener("click", function () { toast(m.name + " — " + m.src); });
    matGrid.appendChild(li);
  });

  /* ---------- before / after slider ---------- */
  var ba = $("#ba");
  var baBefore = $("#baBefore");
  var baHandle = $("#baHandle");
  var dragging = false;

  function setBA(pct) {
    pct = Math.max(0, Math.min(100, pct));
    baBefore.style.width = pct + "%";
    baHandle.style.left = pct + "%";
    baHandle.setAttribute("aria-valuenow", Math.round(pct));
  }
  function posFromEvent(e) {
    var rect = ba.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return (x / rect.width) * 100;
  }
  function startDrag(e) { dragging = true; baHandle.focus(); moveDrag(e); }
  function moveDrag(e) {
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    setBA(posFromEvent(e));
  }
  function endDrag() { dragging = false; }

  baHandle.addEventListener("mousedown", startDrag);
  ba.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", moveDrag);
  window.addEventListener("mouseup", endDrag);
  baHandle.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("touchmove", moveDrag, { passive: false });
  window.addEventListener("touchend", endDrag);

  baHandle.addEventListener("keydown", function (e) {
    var cur = parseFloat(baHandle.getAttribute("aria-valuenow")) || 50;
    if (e.key === "ArrowLeft") { setBA(cur - 4); e.preventDefault(); }
    else if (e.key === "ArrowRight") { setBA(cur + 4); e.preventDefault(); }
    else if (e.key === "Home") { setBA(0); e.preventDefault(); }
    else if (e.key === "End") { setBA(100); e.preventDefault(); }
  });
  setBA(50);

  /* ---------- save + share ---------- */
  var saveBtn = $("#saveBtn");
  saveBtn.addEventListener("click", function () {
    var on = saveBtn.getAttribute("aria-pressed") === "true";
    on = !on;
    saveBtn.setAttribute("aria-pressed", String(on));
    $(".ico", saveBtn).textContent = on ? "♥" : "♡";
    $(".lbl", saveBtn).textContent = on ? "Saved" : "Save";
    toast(on ? "Project saved to your board" : "Removed from board");
  });

  $("#shareBtn").addEventListener("click", function () {
    if (navigator.share) {
      navigator.share({ title: "Willowmere House", text: "A case study by Marlowe & Fern" })
        .catch(function () {});
    } else {
      toast("Link copied to clipboard");
    }
  });

  $("#nextProject").addEventListener("click", function (e) {
    e.preventDefault();
    toast("Loading Saltmarsh Studio…");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- scroll progress + smooth nav ---------- */
  var bar = $("#progressBar");
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
