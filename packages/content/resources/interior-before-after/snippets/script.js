(function () {
  "use strict";

  var UNSPLASH = "https://images.unsplash.com/";
  var Q = "?auto=format&fit=crop&w=1200&q=70";

  // Each room: a designed photo (after) and an empty-shell photo (before).
  // The empty layer also gets a desaturating wash via CSS so it reads as "bare".
  var ROOMS = {
    living: {
      after: "photo-1567767292278-a4f21aa2d36e" + Q,
      before: "photo-1505691938895-1758d7feb511" + Q,
      pos: 50,
      caption:
        "Warm oak, boucle seating and a layered rug turn the bare loft into a reading room."
    },
    kitchen: {
      after: "photo-1556911220-bff31c812dba" + Q,
      before: "photo-1600585152220-90363fe7e115" + Q,
      pos: 42,
      caption:
        "Clay-toned cabinetry and brass fittings replace the empty stud walls of Fenwick Terrace."
    },
    bedroom: {
      after: "photo-1522708323590-d24dbb6b0267" + Q,
      before: "photo-1560448204-e02f11c3d0e2" + Q,
      pos: 58,
      caption:
        "Linen layers, a walnut headboard and soft sconces dress the stripped-back guest room."
    }
  };

  var compare = document.getElementById("compare");
  var beforeLayer = document.getElementById("beforeLayer");
  var beforeInner = document.getElementById("beforeInner");
  var afterLayer = document.getElementById("afterLayer");
  var readout = document.getElementById("readout");
  var caption = document.getElementById("caption");
  var toastEl = document.getElementById("toast");
  var playBtn = document.getElementById("play");
  var playIcon = document.getElementById("playIcon");
  var playLabel = document.getElementById("playLabel");
  var roomBtns = Array.prototype.slice.call(document.querySelectorAll(".room"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  var pos = 50;
  var currentRoom = "living";
  var playing = false;
  var rafId = null;
  var toastTimer = null;

  function clamp(n) {
    return Math.max(0, Math.min(100, n));
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 1900);
  }

  function render() {
    var v = clamp(pos);
    compare.style.setProperty("--pos", v + "%");
    readout.textContent = Math.round(v) + "%";
    compare.setAttribute("aria-valuenow", String(Math.round(v)));
    compare.setAttribute("aria-valuetext", Math.round(v) + "% empty shell shown");
    syncChips(v);
  }

  function syncChips(v) {
    chips.forEach(function (chip) {
      var target = Number(chip.getAttribute("data-pos"));
      chip.classList.toggle("is-active", Math.round(v) === target);
    });
  }

  function setPos(v, announce) {
    pos = clamp(v);
    render();
    if (announce) {
      toast("Reveal set to " + Math.round(pos) + "%");
    }
  }

  function loadRoom(key) {
    var room = ROOMS[key];
    if (!room) return;
    currentRoom = key;
    afterLayer.style.backgroundImage = "url(" + UNSPLASH + room.after + ")";
    beforeInner.style.backgroundImage = "url(" + UNSPLASH + room.before + ")";
    caption.textContent = room.caption;

    roomBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-room") === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    setPos(room.pos, false);
  }

  /* ---------- Pointer dragging ---------- */
  function posFromEvent(clientX) {
    var rect = compare.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  var dragging = false;

  function onDown(e) {
    stopPlay();
    dragging = true;
    compare.classList.add("is-dragging");
    compare.setPointerCapture && e.pointerId != null && compare.setPointerCapture(e.pointerId);
    setPos(posFromEvent(e.clientX), false);
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    setPos(posFromEvent(e.clientX), false);
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    compare.classList.remove("is-dragging");
  }

  if (window.PointerEvent) {
    compare.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  } else {
    compare.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    compare.addEventListener("touchstart", function (e) {
      onDown({ clientX: e.touches[0].clientX, preventDefault: function () {} });
    });
    window.addEventListener("touchmove", function (e) {
      if (dragging) {
        e.preventDefault();
        setPos(posFromEvent(e.touches[0].clientX), false);
      }
    }, { passive: false });
    window.addEventListener("touchend", onUp);
  }

  /* ---------- Keyboard ---------- */
  compare.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 10 : 1;
    var handled = true;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        stopPlay();
        setPos(pos + step, false);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        stopPlay();
        setPos(pos - step, false);
        break;
      case "Home":
        stopPlay();
        setPos(0, true);
        break;
      case "End":
        stopPlay();
        setPos(100, true);
        break;
      case "PageUp":
        stopPlay();
        setPos(pos + 25, false);
        break;
      case "PageDown":
        stopPlay();
        setPos(pos - 25, false);
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
  });

  /* ---------- Presets ---------- */
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      stopPlay();
      var v = Number(chip.getAttribute("data-pos"));
      setPos(v, false);
      toast(chip.textContent.trim() + " · " + v + "%");
    });
  });

  /* ---------- Room tabs ---------- */
  roomBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-room");
      if (key === currentRoom) return;
      stopPlay();
      loadRoom(key);
      toast(btn.querySelector(".room__name").textContent + " loaded");
    });
  });

  /* ---------- Play / auto-sweep ---------- */
  var dir = 1;
  var last = 0;

  function tick(now) {
    if (!playing) return;
    if (!last) last = now;
    var dt = (now - last) / 1000;
    last = now;
    pos += dir * dt * 34; // percent per second
    if (pos >= 100) {
      pos = 100;
      dir = -1;
    } else if (pos <= 0) {
      pos = 0;
      dir = 1;
    }
    render();
    rafId = requestAnimationFrame(tick);
  }

  function startPlay() {
    if (playing) return;
    playing = true;
    last = 0;
    dir = pos >= 100 ? -1 : 1;
    playBtn.setAttribute("aria-pressed", "true");
    playIcon.textContent = "❚❚";
    playLabel.textContent = "Pause";
    rafId = requestAnimationFrame(tick);
    toast("Playing reveal");
  }

  function stopPlay() {
    if (!playing) return;
    playing = false;
    cancelAnimationFrame(rafId);
    playBtn.setAttribute("aria-pressed", "false");
    playIcon.textContent = "▶";
    playLabel.textContent = "Play reveal";
  }

  playBtn.addEventListener("click", function () {
    if (playing) {
      stopPlay();
    } else {
      startPlay();
    }
  });

  /* ---------- Init ---------- */
  loadRoom("living");
})();
