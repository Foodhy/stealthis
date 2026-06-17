(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- State ---------- */
  var state = {
    photo: false,
    signed: false,
    leaveDoor: false
  };

  var steps = {
    photo: document.querySelector('.step[data-step="photo"]'),
    sign: document.querySelector('.step[data-step="sign"]'),
    confirm: document.querySelector('.step[data-step="confirm"]')
  };

  /* ---------- Countdown (ETA window) ---------- */
  var etaEl = document.getElementById("eta");
  var remaining = 14 * 60 + 58;
  setInterval(function () {
    if (remaining <= 0) return;
    remaining--;
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    etaEl.textContent = m + ":" + (s < 10 ? "0" : "") + s;
  }, 1000);

  /* ---------- Step + footer sync ---------- */
  function refresh() {
    steps.photo.classList.toggle("done", state.photo);
    steps.sign.classList.toggle("done", state.leaveDoor || state.signed);

    var photoReq = document.getElementById("photoReq");
    if (state.photo) {
      photoReq.textContent = "Captured";
      photoReq.classList.add("done");
    } else {
      photoReq.textContent = "Required";
      photoReq.classList.remove("done");
    }

    var ready = state.photo && (state.leaveDoor || state.signed);
    steps.confirm.classList.toggle("done", ready);
  }

  /* ---------- Leave at door toggle ---------- */
  var leaveDoor = document.getElementById("leaveDoor");
  var signCard = document.getElementById("signCard");
  leaveDoor.addEventListener("change", function () {
    state.leaveDoor = leaveDoor.checked;
    signCard.classList.toggle("hidden", state.leaveDoor);
    toast(state.leaveDoor ? "Leave at door — signature skipped" : "Signature required");
    refresh();
  });

  /* ---------- Photo capture (mock) ---------- */
  var photoGrid = document.getElementById("photoGrid");
  var photoAdd = document.getElementById("photoAdd");
  var gradients = [
    "linear-gradient(135deg,#8aa7c2,#5f7c97)",
    "linear-gradient(135deg,#c2a98a,#977c5f)",
    "linear-gradient(135deg,#9bbf9b,#6f9a6f)"
  ];
  var photoIdx = 0;

  function nowStamp() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return (h % 12 || 12) + ":" + (m < 10 ? "0" : "") + m + (h < 12 ? "a" : "p");
  }

  photoAdd.addEventListener("click", function () {
    if (photoIdx >= 3) {
      toast("Max 3 photos");
      return;
    }
    var thumb = document.createElement("div");
    thumb.className = "photo-thumb";
    var img = document.createElement("span");
    img.className = "ph-img";
    img.style.background = gradients[photoIdx % gradients.length];
    var time = document.createElement("span");
    time.className = "ph-time";
    time.textContent = nowStamp();
    var x = document.createElement("button");
    x.className = "ph-x";
    x.type = "button";
    x.setAttribute("aria-label", "Remove photo");
    x.textContent = "×";
    x.addEventListener("click", function () {
      thumb.remove();
      photoIdx--;
      if (photoIdx <= 0) state.photo = false;
      refresh();
    });
    thumb.appendChild(img);
    thumb.appendChild(time);
    thumb.appendChild(x);
    photoGrid.insertBefore(thumb, photoAdd);
    photoIdx++;
    state.photo = true;
    if (photoIdx >= 3) photoAdd.style.display = "none";
    toast("Photo proof captured");
    refresh();
  });

  /* ---------- Signature pad ---------- */
  var canvas = document.getElementById("pad");
  var ctx = canvas.getContext("2d");
  var hint = document.getElementById("signHint");
  var drawing = false;
  var hasInk = false;
  var dpr = window.devicePixelRatio || 1;

  function sizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#16181d";
  }
  // Defer sizing until layout is ready
  requestAnimationFrame(sizeCanvas);
  window.addEventListener("resize", function () {
    // Re-size only if empty to avoid wiping a real signature
    if (!hasInk) sizeCanvas();
  });

  function pos(e) {
    var rect = canvas.getBoundingClientRect();
    var p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    var p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    if (!hasInk) {
      hasInk = true;
      hint.classList.add("gone");
      state.signed = true;
      refresh();
    }
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    var p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  function end() {
    drawing = false;
  }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  document.getElementById("clearSign").addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk = false;
    state.signed = false;
    hint.classList.remove("gone");
    refresh();
    toast("Signature cleared");
  });

  /* ---------- Notes ---------- */
  var notes = document.getElementById("notes");
  var noteCount = document.getElementById("noteCount");
  notes.addEventListener("input", function () {
    noteCount.textContent = notes.value.length;
  });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var active = chip.classList.contains("active");
      document.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("active");
      });
      if (active) return;
      chip.classList.add("active");
      var txt = chip.getAttribute("data-note");
      notes.value = txt;
      noteCount.textContent = txt.length;
    });
  });

  /* ---------- Secondary actions ---------- */
  document.getElementById("callBtn").addEventListener("click", function () {
    toast("Calling Maya — +1 (503) 555-0148");
  });
  document.getElementById("navBtn").addEventListener("click", function () {
    toast("Opening route to 2418 Cedarwood Ave");
  });
  document.getElementById("backBtn").addEventListener("click", function () {
    toast("Returning to stop list");
  });
  document.getElementById("failBtn").addEventListener("click", function () {
    toast("Marked unable to deliver — flagged for retry");
  });

  /* ---------- Confirm ---------- */
  var confirmBtn = document.getElementById("confirmBtn");
  var overlay = document.getElementById("overlay");

  confirmBtn.addEventListener("click", function () {
    if (!state.photo) {
      toast("Capture photo proof first");
      return;
    }
    if (!state.leaveDoor && !state.signed) {
      toast("Signature required to confirm");
      return;
    }
    confirmBtn.classList.add("loading");
    confirmBtn.disabled = true;

    setTimeout(function () {
      confirmBtn.classList.remove("loading");
      var meta = document.getElementById("successMeta");
      meta.textContent = state.leaveDoor
        ? "Left at door · photo on file"
        : "Parcel handed to Maya Adeyemi";
      overlay.classList.add("show");
      overlay.setAttribute("aria-hidden", "false");
    }, 1100);
  });

  document.getElementById("nextBtn").addEventListener("click", function () {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
    toast("Loading stop 8 of 12…");
  });

  refresh();
})();
