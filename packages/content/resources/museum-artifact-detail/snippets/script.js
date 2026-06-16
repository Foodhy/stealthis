(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---------- add to tour ---------- */
  var tourBtn = document.getElementById("tourBtn");
  if (tourBtn) {
    tourBtn.addEventListener("click", function () {
      var on = tourBtn.getAttribute("aria-pressed") === "true";
      on = !on;
      tourBtn.setAttribute("aria-pressed", String(on));
      tourBtn.querySelector(".btn__label").textContent = on
        ? "Added to tour"
        : "Add to my tour";
      toast(
        on
          ? "Added “Vessel of the Tide-Keepers” to your tour."
          : "Removed from your tour."
      );
    });
  }

  /* ---------- copy accession no. ---------- */
  var copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var acc = "1987.214";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(acc).then(
          function () { toast("Accession no. " + acc + " copied."); },
          function () { toast("Accession no. " + acc); }
        );
      } else {
        toast("Accession no. " + acc);
      }
    });
  }

  /* ---------- share ---------- */
  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var data = {
        title: "Vessel of the Tide-Keepers",
        text: "Workshop of Oríel of Kestharn, c. 432 — Meridian Museum of Art",
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else {
        toast("Share link copied to your notes.");
      }
    });
  }

  /* ---------- more-from-gallery cards ---------- */
  var strip = document.getElementById("strip");
  if (strip) {
    strip.addEventListener("click", function (e) {
      var card = e.target.closest(".card");
      if (!card) return;
      toast("Opening “" + card.getAttribute("data-title") + "” …");
    });
  }

  /* ---------- zoom + pan lightbox ---------- */
  var canvas = document.getElementById("canvas");
  var srcArt = canvas ? canvas.querySelector("svg") : null;
  var lightbox = document.getElementById("lightbox");
  var stage = document.getElementById("lightboxStage");
  var closeBtn = document.getElementById("lightboxClose");
  var zlevel = document.getElementById("zlevel");
  var zoomCtl = document.querySelector(".zoomctl");

  var MIN = 1;
  var MAX = 4;
  var state = { scale: 1, x: 0, y: 0 };
  var artNode = null;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function applyTransform() {
    if (!artNode) return;
    // keep pan within bounds based on current scale
    var rect = stage.getBoundingClientRect();
    var maxX = (state.scale - 1) * rect.width;
    var maxY = (state.scale - 1) * rect.height;
    state.x = clamp(state.x, -maxX, 0);
    state.y = clamp(state.y, -maxY, 0);
    artNode.style.transform =
      "translate(" + state.x + "px," + state.y + "px) scale(" + state.scale + ")";
    if (zlevel) zlevel.textContent = Math.round(state.scale * 100) + "%";
    stage.style.cursor = state.scale > 1 ? "grab" : "default";
  }

  function setScale(next, originX, originY) {
    var prev = state.scale;
    next = clamp(next, MIN, MAX);
    if (next === prev) return;
    var rect = stage.getBoundingClientRect();
    // zoom toward a point (default: centre)
    var ox = originX == null ? rect.width / 2 : originX;
    var oy = originY == null ? rect.height / 2 : originY;
    var ratio = next / prev;
    state.x = ox - (ox - state.x) * ratio;
    state.y = oy - (oy - state.y) * ratio;
    state.scale = next;
    if (next === MIN) { state.x = 0; state.y = 0; }
    applyTransform();
  }

  function openLightbox() {
    if (!lightbox || !srcArt) return;
    artNode = srcArt.cloneNode(true);
    artNode.removeAttribute("class");
    stage.innerHTML = "";
    stage.appendChild(artNode);
    state = { scale: 1.4, x: 0, y: 0 };
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    applyTransform();
    closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (canvas) canvas.focus();
  }

  if (canvas) {
    canvas.addEventListener("click", openLightbox);
  }
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (lightbox && !lightbox.hidden) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "+" || e.key === "=") setScale(state.scale + 0.4);
      else if (e.key === "-" || e.key === "_") setScale(state.scale - 0.4);
    }
  });

  /* wheel zoom inside stage */
  if (stage) {
    stage.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        var rect = stage.getBoundingClientRect();
        var ox = e.clientX - rect.left;
        var oy = e.clientY - rect.top;
        var delta = e.deltaY < 0 ? 0.25 : -0.25;
        setScale(state.scale + delta, ox, oy);
      },
      { passive: false }
    );

    /* drag to pan */
    var dragging = false;
    var startX = 0;
    var startY = 0;
    var baseX = 0;
    var baseY = 0;

    function pointerDown(e) {
      if (state.scale <= 1) return;
      dragging = true;
      stage.classList.add("is-panning");
      var p = e.touches ? e.touches[0] : e;
      startX = p.clientX;
      startY = p.clientY;
      baseX = state.x;
      baseY = state.y;
    }
    function pointerMove(e) {
      if (!dragging) return;
      var p = e.touches ? e.touches[0] : e;
      state.x = baseX + (p.clientX - startX);
      state.y = baseY + (p.clientY - startY);
      applyTransform();
      if (e.cancelable) e.preventDefault();
    }
    function pointerUp() {
      dragging = false;
      stage.classList.remove("is-panning");
    }

    stage.addEventListener("mousedown", pointerDown);
    window.addEventListener("mousemove", pointerMove);
    window.addEventListener("mouseup", pointerUp);
    stage.addEventListener("touchstart", pointerDown, { passive: true });
    stage.addEventListener("touchmove", pointerMove, { passive: false });
    stage.addEventListener("touchend", pointerUp);
  }

  /* inline zoom controls (open lightbox + zoom) */
  if (zoomCtl) {
    zoomCtl.addEventListener("click", function (e) {
      var b = e.target.closest(".zbtn");
      if (!b) return;
      var kind = b.getAttribute("data-zoom");
      if (lightbox.hidden) {
        openLightbox();
        if (kind === "reset") setScale(MIN);
        return;
      }
      if (kind === "in") setScale(state.scale + 0.4);
      else if (kind === "out") setScale(state.scale - 0.4);
      else if (kind === "reset") setScale(MIN);
    });
  }
})();
