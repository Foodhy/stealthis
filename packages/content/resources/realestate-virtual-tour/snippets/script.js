(function () {
  "use strict";

  /* ---------- Room data ---------- */
  var ROOMS = [
    {
      id: "living",
      name: "Living Room",
      dim: "21 × 18 ft",
      desc: "Sun-drenched great room with double-height ceilings, white-oak floors, and a limestone fireplace anchoring the lounge.",
      feat: ["Gas fireplace", "12 ft ceilings", "South-facing windows"],
      // floor-plan marker position (svg viewBox coords)
      here: { cx: 56, cy: 49 },
      // hotspots: x/y are % across the panoramic image
      hotspots: [
        { x: 30, y: 58, label: "Step into Kitchen", to: "kitchen" },
        { x: 72, y: 50, label: "Fireplace detail", info: "Honed limestone surround." }
      ]
    },
    {
      id: "kitchen",
      name: "Chef's Kitchen",
      dim: "16 × 14 ft",
      desc: "Bespoke walnut cabinetry, a marble waterfall island, and integrated appliances open to the dining terrace.",
      feat: ["Marble island", "Walk-in pantry", "Pro range"],
      here: { cx: 150, cy: 38 },
      hotspots: [
        { x: 24, y: 56, label: "Back to Living", to: "living" },
        { x: 70, y: 60, label: "To Primary Suite", to: "primary" }
      ]
    },
    {
      id: "primary",
      name: "Primary Suite",
      dim: "19 × 16 ft",
      desc: "A private retreat with a sitting nook, custom dressing room, and a spa bath behind pocket doors.",
      feat: ["Walk-in closet", "Private balcony", "Spa ensuite"],
      here: { cx: 150, cy: 107 },
      hotspots: [
        { x: 32, y: 54, label: "Back to Kitchen", to: "kitchen" },
        { x: 74, y: 64, label: "Into Bath", to: "bath" }
      ]
    },
    {
      id: "bath",
      name: "Spa Bath",
      dim: "12 × 10 ft",
      desc: "Floor-to-ceiling porcelain, a freestanding soaking tub, and a glass rain shower with brass fixtures.",
      feat: ["Soaking tub", "Heated floors", "Double vanity"],
      here: { cx: 56, cy: 118 },
      hotspots: [{ x: 36, y: 56, label: "Back to Primary", to: "primary" }]
    }
  ];

  var byId = {};
  ROOMS.forEach(function (r) {
    byId[r.id] = r;
  });

  /* ---------- Refs ---------- */
  var stage = document.getElementById("stage");
  var pano = document.getElementById("pano");
  var hotspotsEl = document.getElementById("hotspots");
  var rail = document.getElementById("rail");
  var roomTag = document.getElementById("roomTag");
  var mapLabel = document.getElementById("mapLabel");
  var dragHint = document.getElementById("dragHint");
  var fpHere = document.getElementById("fpHere");
  var detailName = document.getElementById("detailName");
  var detailDim = document.getElementById("detailDim");
  var detailDesc = document.getElementById("detailDesc");
  var detailFeat = document.getElementById("detailFeat");
  var toastEl = document.getElementById("toast");

  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var autoBtn = document.getElementById("autoBtn");
  var fsBtn = document.getElementById("fsBtn");
  var bookBtn = document.getElementById("bookBtn");

  var current = 0;
  var panX = 0; // current pan offset in px
  var maxPan = 0; // how far we can pan each side
  var autoTimer = null;
  var autoPanRAF = null;

  /* ---------- Toast helper ---------- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- Build thumbnail rail ---------- */
  ROOMS.forEach(function (r, i) {
    var btn = document.createElement("button");
    btn.className = "thumb";
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.dataset.index = String(i);
    btn.setAttribute("aria-label", "View " + r.name);
    btn.innerHTML =
      '<span class="thumb__img" data-room="' +
      r.id +
      '"></span><span class="thumb__label">' +
      r.name +
      "</span>";
    btn.addEventListener("click", function () {
      goTo(i, true);
    });
    rail.appendChild(btn);
  });
  var thumbs = Array.prototype.slice.call(rail.children);

  /* ---------- Floor-plan rooms ---------- */
  var fpRooms = Array.prototype.slice.call(
    document.querySelectorAll(".fp-room")
  );
  fpRooms.forEach(function (rect) {
    rect.addEventListener("click", function () {
      var idx = ROOMS.findIndex(function (r) {
        return r.id === rect.dataset.room;
      });
      if (idx >= 0) goTo(idx, true);
    });
  });

  /* ---------- Pan helpers ---------- */
  function computeMaxPan() {
    // pano is 230% wide; overflow each side = (230-100)/2 = 65% of stage width
    maxPan = stage.clientWidth * 0.6;
  }

  function applyPan() {
    pano.style.transform = "translateX(" + panX + "px)";
  }

  function clampPan(v) {
    if (v > maxPan) return maxPan;
    if (v < -maxPan) return -maxPan;
    return v;
  }

  /* ---------- Render hotspots for current room ---------- */
  function renderHotspots(room) {
    hotspotsEl.innerHTML = "";
    room.hotspots.forEach(function (h) {
      var b = document.createElement("button");
      b.className = "hotspot";
      b.type = "button";
      b.style.left = h.x + "%";
      b.style.top = h.y + "%";
      b.setAttribute("aria-label", h.label);
      b.innerHTML = '<span class="tip">' + h.label + "</span>";
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        if (h.to && byId[h.to]) {
          var idx = ROOMS.findIndex(function (r) {
            return r.id === h.to;
          });
          goTo(idx, true);
        } else if (h.info) {
          toast(h.info);
        }
      });
      hotspotsEl.appendChild(b);
    });
  }

  /* ---------- Go to a room ---------- */
  function goTo(index, userInitiated) {
    if (index < 0) index = ROOMS.length - 1;
    if (index >= ROOMS.length) index = 0;
    current = index;
    var room = ROOMS[index];

    pano.dataset.room = room.id;
    roomTag.textContent = room.name;
    mapLabel.textContent = room.name;
    detailName.textContent = room.name;
    detailDim.textContent = room.dim;
    detailDesc.textContent = room.desc;

    detailFeat.innerHTML = "";
    room.feat.forEach(function (f) {
      var li = document.createElement("li");
      li.textContent = f;
      detailFeat.appendChild(li);
    });

    // reset pan to centre on room change
    panX = 0;
    applyPan();
    renderHotspots(room);

    // active states
    thumbs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === index);
      t.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    fpRooms.forEach(function (rect) {
      rect.classList.toggle("is-active", rect.dataset.room === room.id);
    });

    // move you-are-here marker
    fpHere.setAttribute("cx", room.here.cx);
    fpHere.setAttribute("cy", room.here.cy);

    if (userInitiated) toast("Now viewing · " + room.name);
  }

  /* ---------- Drag to pan ---------- */
  var dragging = false;
  var startX = 0;
  var startPan = 0;
  var hintDismissed = false;

  function dismissHint() {
    if (hintDismissed) return;
    hintDismissed = true;
    dragHint.classList.add("hide");
  }

  function pointerDown(e) {
    if (e.target.closest(".hotspot")) return;
    dragging = true;
    startX = e.clientX;
    startPan = panX;
    stage.classList.add("dragging", "no-anim");
    stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
    dismissHint();
    stopAuto();
  }

  function pointerMove(e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    panX = clampPan(startPan + dx);
    applyPan();
  }

  function pointerUp() {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("dragging", "no-anim");
  }

  stage.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerup", pointerUp);
  window.addEventListener("pointercancel", pointerUp);

  /* ---------- Keyboard pan + nav ---------- */
  stage.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      panX = clampPan(panX + 60);
      applyPan();
      dismissHint();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      panX = clampPan(panX - 60);
      applyPan();
      dismissHint();
    } else if (e.key === "[" || e.key === "PageUp") {
      goTo(current - 1, true);
    } else if (e.key === "]" || e.key === "PageDown") {
      goTo(current + 1, true);
    }
  });

  /* ---------- Prev / next ---------- */
  prevBtn.addEventListener("click", function () {
    goTo(current - 1, true);
  });
  nextBtn.addEventListener("click", function () {
    goTo(current + 1, true);
  });

  /* ---------- Auto tour ---------- */
  function isPlaying() {
    return stage.classList.contains("is-playing");
  }

  function startAuto() {
    stage.classList.add("is-playing");
    autoBtn.setAttribute("aria-pressed", "true");
    autoBtn.setAttribute("aria-label", "Pause auto tour");
    toast("Auto tour started");
    runAutoStep();
  }

  function runAutoStep() {
    // gently sweep the pan, then advance to next room
    var dir = 1;
    var t0 = null;
    cancelAnimationFrame(autoPanRAF);

    function sweep(ts) {
      if (!isPlaying()) return;
      if (t0 === null) t0 = ts;
      // sweep across over ~3.4s using a sine ease
      var p = (ts - t0) / 3400;
      var eased = Math.sin(Math.min(p, 1) * Math.PI - Math.PI / 2);
      panX = eased * maxPan * dir;
      applyPan();
      if (p < 1) {
        autoPanRAF = requestAnimationFrame(sweep);
      }
    }
    autoPanRAF = requestAnimationFrame(sweep);

    autoTimer = setTimeout(function () {
      if (!isPlaying()) return;
      goTo(current + 1, false);
      runAutoStep();
    }, 3800);
  }

  function stopAuto() {
    if (!isPlaying()) return;
    stage.classList.remove("is-playing");
    autoBtn.setAttribute("aria-pressed", "false");
    autoBtn.setAttribute("aria-label", "Play auto tour");
    clearTimeout(autoTimer);
    cancelAnimationFrame(autoPanRAF);
  }

  autoBtn.addEventListener("click", function () {
    if (isPlaying()) {
      stopAuto();
      toast("Auto tour paused");
    } else {
      dismissHint();
      startAuto();
    }
  });

  /* ---------- Fullscreen ---------- */
  fsBtn.addEventListener("click", function () {
    if (!document.fullscreenElement) {
      if (stage.requestFullscreen) {
        stage.requestFullscreen().catch(function () {
          toast("Fullscreen unavailable here");
        });
      } else {
        toast("Fullscreen unavailable here");
      }
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", function () {
    var on = document.fullscreenElement === stage;
    stage.classList.toggle("is-fs", on);
    computeMaxPan();
  });

  /* ---------- Book showing ---------- */
  bookBtn.addEventListener("click", function () {
    toast("Showing request sent to Delphine — she'll confirm shortly.");
  });

  /* ---------- Resize ---------- */
  window.addEventListener("resize", function () {
    computeMaxPan();
    panX = clampPan(panX);
    applyPan();
  });

  /* ---------- Init ---------- */
  computeMaxPan();
  goTo(0, false);

  // auto-dismiss the drag hint after a few seconds
  setTimeout(dismissHint, 5200);
})();
