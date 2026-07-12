(function () {
  "use strict";

  // Fictional shoots. `after` = edited (color/graded), `before` = raw look
  // generated from the same base via Unsplash tuning params.
  var SHOOTS = [
    {
      id: "portrait",
      title: "Golden Hour Portrait",
      sub: "85mm · f/1.4 · warm skin grade",
      base: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "landscape",
      title: "Fjord at First Light",
      sub: "24mm · f/8 · sky replacement + haze pull",
      base: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "product",
      title: "Ceramic Still Life",
      sub: "100mm macro · dodge & burn cleanup",
      base: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "street",
      title: "Neon District",
      sub: "35mm · teal & orange split-tone",
      base: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=80"
    }
  ];

  var compare = document.getElementById("compare");
  var layerBefore = document.getElementById("layerBefore");
  var divider = document.getElementById("divider");
  var handle = document.getElementById("handle");
  var imgBefore = document.getElementById("imgBefore");
  var imgAfter = document.getElementById("imgAfter");
  var chipBefore = document.getElementById("chipBefore");
  var chipAfter = document.getElementById("chipAfter");
  var readoutVal = document.getElementById("readoutVal");
  var shotTitle = document.getElementById("shotTitle");
  var shotSub = document.getElementById("shotSub");
  var thumbs = document.getElementById("thumbs");
  var reset = document.getElementById("reset");
  var toastEl = document.getElementById("toast");

  var pos = 50; // percent from left where the divider sits
  var dragging = false;
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function render() {
    var v = clamp(pos, 0, 100);
    // Before layer keeps its LEFT portion visible: clip from the right.
    layerBefore.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
    divider.style.left = v + "%";
    var rounded = Math.round(v);
    readoutVal.textContent = String(100 - rounded); // % of edited image showing
    compare.setAttribute("aria-valuenow", String(100 - rounded));
    // Fade chips based on how much of their side is showing.
    chipBefore.style.opacity = v < 12 ? "0.25" : "1";
    chipAfter.style.opacity = v > 88 ? "0.25" : "1";
  }

  function setPos(v, announce) {
    pos = clamp(v, 0, 100);
    render();
    if (announce) toast(Math.round(100 - pos) + "% edited");
  }

  function posFromClientX(clientX) {
    var rect = compare.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  // Pointer events unify mouse + touch + pen.
  function onDown(e) {
    dragging = true;
    compare.classList.add("dragging");
    compare.setPointerCapture && e.pointerId != null && compare.setPointerCapture(e.pointerId);
    setPos(posFromClientX(e.clientX), false);
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    setPos(posFromClientX(e.clientX), false);
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    compare.classList.remove("dragging");
  }

  compare.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  // Keyboard support on the slider.
  compare.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 10 : 3;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      setPos(pos - step, false);
      e.preventDefault();
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      setPos(pos + step, false);
      e.preventDefault();
    } else if (e.key === "Home") {
      setPos(0, true);
      e.preventDefault();
    } else if (e.key === "End") {
      setPos(100, true);
      e.preventDefault();
    }
  });

  // Prevent the handle button click from also triggering a jump.
  handle.addEventListener("click", function (e) {
    e.preventDefault();
    compare.focus();
  });

  reset.addEventListener("click", function () {
    setPos(50, false);
    toast("Divider centered");
  });

  // Build thumbnail strip and wire selection.
  var current = 0;

  function loadShoot(idx, announce) {
    var s = SHOOTS[idx];
    current = idx;
    imgAfter.src = s.base;
    imgAfter.alt = "Edited version — " + s.title;
    // Raw look: desaturated + flatter tone via Unsplash params.
    imgBefore.src = s.base + "&sat=-80&exp=-1&con=-15";
    imgBefore.alt = "Raw version — " + s.title;
    shotTitle.textContent = s.title;
    shotSub.textContent = s.sub;
    Array.prototype.forEach.call(thumbs.children, function (btn, i) {
      btn.setAttribute("aria-selected", i === idx ? "true" : "false");
    });
    setPos(50, false);
    if (announce) toast("Loaded — " + s.title);
  }

  SHOOTS.forEach(function (s, i) {
    var btn = document.createElement("button");
    btn.className = "thumb";
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
    btn.setAttribute("aria-label", "Show " + s.title);
    var im = document.createElement("img");
    im.src = s.base + "&w=180&q=60";
    im.alt = "";
    im.draggable = false;
    btn.appendChild(im);
    btn.addEventListener("click", function () { loadShoot(i, true); });
    thumbs.appendChild(btn);
  });

  loadShoot(0, false);
  render();
})();
