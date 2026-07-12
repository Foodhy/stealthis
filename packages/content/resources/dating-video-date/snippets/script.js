(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- view switching ---------- */
  var switchBtns = Array.prototype.slice.call(document.querySelectorAll(".switch-btn"));
  var views = {
    call: document.getElementById("view-call"),
    incoming: document.getElementById("view-incoming"),
  };

  function showView(name) {
    Object.keys(views).forEach(function (key) {
      var active = key === name;
      views[key].hidden = !active;
      views[key].classList.toggle("is-active", active);
    });
    switchBtns.forEach(function (b) {
      var active = b.dataset.view === name;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (name === "call") startTimer();
    else stopTimer();
  }

  switchBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      showView(b.dataset.view);
    });
  });

  /* ---------- call timer ---------- */
  var timerEl = document.getElementById("timer");
  var seconds = 0;
  var timerId = null;
  function paint() {
    var m = String(Math.floor(seconds / 60)).padStart(2, "0");
    var s = String(seconds % 60).padStart(2, "0");
    timerEl.textContent = m + ":" + s;
  }
  function startTimer() {
    if (timerId) return;
    timerId = setInterval(function () {
      seconds++;
      paint();
    }, 1000);
  }
  function stopTimer() {
    clearInterval(timerId);
    timerId = null;
  }
  paint();
  startTimer();

  /* ---------- connection quality ---------- */
  var quality = document.getElementById("quality");
  var qLabel = document.getElementById("qLabel");
  var levels = [
    { key: "excellent", label: "Excellent", w: 0.6 },
    { key: "good", label: "Good", w: 0.3 },
    { key: "weak", label: "Weak", w: 0.1 },
  ];
  function setQuality() {
    var r = Math.random();
    var acc = 0;
    var chosen = levels[0];
    for (var i = 0; i < levels.length; i++) {
      acc += levels[i].w;
      if (r <= acc) { chosen = levels[i]; break; }
    }
    if (quality.dataset.level !== chosen.key && chosen.key === "weak") {
      toast("Connection is a little weak");
    }
    quality.dataset.level = chosen.key;
    qLabel.textContent = chosen.label;
  }
  setQuality();
  setInterval(setQuality, 5000);

  /* ---------- controls ---------- */
  var btnMute = document.getElementById("btnMute");
  var btnCam = document.getElementById("btnCam");
  var btnFx = document.getElementById("btnFx");
  var btnFlip = document.getElementById("btnFlip");
  var btnEnd = document.getElementById("btnEnd");
  var pip = document.getElementById("pip");
  var pipMute = document.getElementById("pipMute");
  var fxTray = document.getElementById("fxTray");
  var videoBg = document.querySelector(".video-bg");

  btnMute.addEventListener("click", function () {
    var on = btnMute.getAttribute("aria-pressed") === "true";
    on = !on;
    btnMute.setAttribute("aria-pressed", on ? "true" : "false");
    pipMute.hidden = !on;
    toast(on ? "Microphone muted" : "Microphone on");
  });

  btnCam.addEventListener("click", function () {
    var on = btnCam.getAttribute("aria-pressed") === "true";
    on = !on;
    btnCam.setAttribute("aria-pressed", on ? "true" : "false");
    pip.classList.toggle("cam-off", on);
    toast(on ? "Your camera is off" : "Your camera is on");
  });

  btnFx.addEventListener("click", function () {
    var open = fxTray.hidden;
    fxTray.hidden = !open;
    btnFx.setAttribute("aria-pressed", open ? "true" : "false");
  });

  fxTray.addEventListener("click", function (e) {
    var chip = e.target.closest(".fx-chip");
    if (!chip) return;
    fxTray.querySelectorAll(".fx-chip").forEach(function (c) {
      c.classList.remove("is-on");
    });
    chip.classList.add("is-on");
    videoBg.className = "video-bg";
    var fx = chip.dataset.fx;
    if (fx !== "none") videoBg.classList.add("fx-" + fx);
    toast(fx === "none" ? "Filter cleared" : chip.textContent + " filter applied");
  });

  btnFlip.addEventListener("click", function () {
    videoBg.animate(
      [{ transform: "rotateY(0)" }, { transform: "rotateY(90deg)" }, { transform: "rotateY(0)" }],
      { duration: 420, easing: "ease-in-out" }
    );
    toast("Camera flipped");
  });

  btnEnd.addEventListener("click", function () {
    var phone = document.getElementById("phone");
    stopTimer();
    views.call.style.transition = "opacity .4s ease, filter .4s ease";
    views.call.style.opacity = "0";
    views.call.style.filter = "grayscale(1)";
    toast("Call ended · " + timerEl.textContent);
    setTimeout(function () {
      views.call.style.opacity = "";
      views.call.style.filter = "";
      seconds = 0;
      paint();
      showView("incoming");
    }, 900);
  });

  /* ---------- incoming actions ---------- */
  document.getElementById("btnAccept").addEventListener("click", function () {
    toast("Connecting…");
    seconds = 0;
    paint();
    showView("call");
  });
  document.getElementById("btnDecline").addEventListener("click", function () {
    toast("Call declined");
  });

  /* ---------- draggable pip ---------- */
  (function makeDraggable() {
    var dragging = false;
    var startX, startY, origX, origY;
    var stage = document.getElementById("videoMain");

    function pointerDown(e) {
      dragging = true;
      pip.classList.add("is-dragging");
      var pt = e.touches ? e.touches[0] : e;
      startX = pt.clientX;
      startY = pt.clientY;
      var rect = pip.getBoundingClientRect();
      var pRect = stage.getBoundingClientRect();
      origX = rect.left - pRect.left;
      origY = rect.top - pRect.top;
      pip.style.right = "auto";
      pip.style.left = origX + "px";
      pip.style.top = origY + "px";
      document.addEventListener("mousemove", pointerMove);
      document.addEventListener("touchmove", pointerMove, { passive: false });
      document.addEventListener("mouseup", pointerUp);
      document.addEventListener("touchend", pointerUp);
    }
    function pointerMove(e) {
      if (!dragging) return;
      if (e.cancelable) e.preventDefault();
      var pt = e.touches ? e.touches[0] : e;
      var dx = pt.clientX - startX;
      var dy = pt.clientY - startY;
      var pRect = stage.getBoundingClientRect();
      var maxX = pRect.width - pip.offsetWidth;
      var maxY = pRect.height - pip.offsetHeight;
      var nx = Math.min(Math.max(origX + dx, 4), maxX - 4);
      var ny = Math.min(Math.max(origY + dy, 4), maxY - 4);
      pip.style.left = nx + "px";
      pip.style.top = ny + "px";
    }
    function pointerUp() {
      dragging = false;
      pip.classList.remove("is-dragging");
      document.removeEventListener("mousemove", pointerMove);
      document.removeEventListener("touchmove", pointerMove);
      document.removeEventListener("mouseup", pointerUp);
      document.removeEventListener("touchend", pointerUp);
    }
    pip.addEventListener("mousedown", pointerDown);
    pip.addEventListener("touchstart", pointerDown, { passive: true });

    // keyboard nudge
    pip.addEventListener("keydown", function (e) {
      var map = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
      if (!map[e.key]) return;
      e.preventDefault();
      var pRect = stage.getBoundingClientRect();
      var rect = pip.getBoundingClientRect();
      var cx = rect.left - pRect.left;
      var cy = rect.top - pRect.top;
      pip.style.right = "auto";
      pip.style.left = Math.min(Math.max(cx + map[e.key][0], 4), pRect.width - pip.offsetWidth - 4) + "px";
      pip.style.top = Math.min(Math.max(cy + map[e.key][1], 4), pRect.height - pip.offsetHeight - 4) + "px";
    });
  })();
})();
