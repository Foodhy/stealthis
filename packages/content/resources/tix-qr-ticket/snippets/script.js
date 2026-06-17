(function () {
  "use strict";

  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  var STATE_LABEL = { valid: "Valid", used: "Used", expired: "Expired" };

  /* ---------- QR lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbQr = document.getElementById("lightboxQr");
  var lbCode = document.getElementById("lightboxCode");
  var lastFocused = null;

  function openLightbox(raw) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    // pretty-print the code (strip the trailing colour seed)
    var code = String(raw).split("-")[0];
    var grouped = code.replace(/(.{4})/g, "$1 ").trim();
    if (lbCode) lbCode.textContent = grouped;
    if (lbQr) lbQr.style.setProperty("--seed", "1");
    lightbox.hidden = false;
    var closeBtn = lightbox.querySelector(".js-lb-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  document.querySelectorAll(".js-qr").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      openLightbox(btn.getAttribute("data-qr") || "");
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    var closeBtn = lightbox.querySelector(".js-lb-close");
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- mark as used ---------- */
  document.querySelectorAll(".js-use").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var stub = btn.closest(".stub");
      if (!stub) return;
      var state = stub.getAttribute("data-state");

      if (state === "used") {
        toast("This ticket was already scanned in.");
        return;
      }
      if (state === "expired") {
        toast("Event has passed — entry closed.");
        return;
      }

      // valid -> used
      stub.setAttribute("data-state", "used");
      var badge = stub.querySelector(".js-state-badge");
      if (badge) badge.textContent = STATE_LABEL.used;
      btn.textContent = "Scanned ✓";
      var hint = stub.querySelector(".qr__hint");
      if (hint) {
        var now = new Date();
        var hh = String(now.getHours()).padStart(2, "0");
        var mm = String(now.getMinutes()).padStart(2, "0");
        hint.textContent = "Scanned just now · " + hh + ":" + mm;
      }
      var title = stub.querySelector(".stub__title");
      toast("Entry granted — " + (title ? title.textContent : "ticket") + " marked used.");
    });
  });

  /* ---------- keyboard: Enter/Space on a stub opens its QR ---------- */
  document.querySelectorAll(".stub").forEach(function (stub) {
    stub.addEventListener("keydown", function (e) {
      if (e.target !== stub) return; // only when the card itself is focused
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var qr = stub.querySelector(".js-qr");
        if (qr) openLightbox(qr.getAttribute("data-qr") || "");
      }
    });
  });
})();
