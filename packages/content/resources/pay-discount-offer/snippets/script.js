(function () {
  "use strict";

  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");
  var modalClose = document.getElementById("modalClose");
  var claimBtn = document.getElementById("claimBtn");
  var declineBtn = document.getElementById("declineBtn");
  var promoInput = document.getElementById("promoCode");
  var promoCopy = document.getElementById("promoCopy");
  var promoField = promoCopy ? promoCopy.closest(".promo-field") : null;
  var copyText = promoCopy ? promoCopy.querySelector(".promo-copy-text") : null;
  var icCopy = promoCopy ? promoCopy.querySelector(".ic-copy") : null;
  var icCheck = promoCopy ? promoCopy.querySelector(".ic-check") : null;
  var countdownEl = document.getElementById("countdown");
  var urgencyEl = document.getElementById("urgency");
  var toastWrap = document.getElementById("toastWrap");
  var openTriggers = document.querySelectorAll("[data-open-offer]");

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  var isOpen = false;
  var lastFocused = null;
  var hasOpenedOnce = false;
  var countdownTimer = null;
  var remaining = 10 * 60; // 10:00
  var copyResetTimer = null;

  /* ---------------- Toast ---------------- */
  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-11"/></svg>';

  function toast(msg, withCheck) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = (withCheck ? CHECK_SVG : "") + "<span></span>";
    el.querySelector("span").textContent = msg;
    toastWrap.appendChild(el);
    window.setTimeout(function () {
      el.classList.add("is-out");
      el.addEventListener("animationend", function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }, 2200);
  }

  /* ---------------- Countdown ---------------- */
  function fmt(total) {
    var m = Math.floor(total / 60);
    var s = total % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function tick() {
    if (remaining <= 0) {
      remaining = 0;
      if (countdownEl) countdownEl.textContent = "0:00";
      if (urgencyEl) {
        urgencyEl.classList.add("is-expired");
        var label = urgencyEl.querySelector("span:not(.urgency-dot)");
        if (label) label.textContent = "This offer has expired";
        if (countdownEl) countdownEl.hidden = true;
      }
      stopCountdown();
      return;
    }
    if (countdownEl) countdownEl.textContent = fmt(remaining);
    remaining -= 1;
  }

  function startCountdown() {
    stopCountdown();
    tick();
    countdownTimer = window.setInterval(tick, 1000);
  }

  function stopCountdown() {
    if (countdownTimer) {
      window.clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  /* ---------------- Focus trap ---------------- */
  function focusables() {
    return Array.prototype.filter.call(
      modal.querySelectorAll(FOCUSABLE),
      function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      }
    );
  }

  function trap(e) {
    if (e.key !== "Tab") return;
    var nodes = focusables();
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------------- Open / close ---------------- */
  function openModal() {
    if (isOpen) return;
    isOpen = true;
    hasOpenedOnce = true;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    remaining = 10 * 60;
    if (urgencyEl) urgencyEl.classList.remove("is-expired");
    if (countdownEl) countdownEl.hidden = false;
    startCountdown();
    // focus the decline action first (least destructive default)
    window.requestAnimationFrame(function () {
      if (declineBtn) declineBtn.focus();
    });
    document.addEventListener("keydown", onKeydown, true);
  }

  function closeModal() {
    if (!isOpen) return;
    isOpen = false;
    overlay.hidden = true;
    modal.hidden = true;
    document.body.style.overflow = "";
    stopCountdown();
    document.removeEventListener("keydown", onKeydown, true);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      toast("Offer dismissed — it'll be in your inbox.");
      return;
    }
    trap(e);
  }

  /* ---------------- Copy to clipboard ---------------- */
  function markCopied() {
    if (icCopy) icCopy.hidden = true;
    if (icCheck) icCheck.hidden = false;
    if (copyText) copyText.textContent = "Copied";
    if (promoCopy) promoCopy.classList.add("is-copied");
    if (promoField) promoField.classList.add("is-copied");
    if (copyResetTimer) window.clearTimeout(copyResetTimer);
    copyResetTimer = window.setTimeout(function () {
      if (icCopy) icCopy.hidden = false;
      if (icCheck) icCheck.hidden = true;
      if (copyText) copyText.textContent = "Copy";
      if (promoCopy) promoCopy.classList.remove("is-copied");
      if (promoField) promoField.classList.remove("is-copied");
    }, 2000);
  }

  function copyCode() {
    var code = promoInput ? promoInput.value : "";
    function done() {
      markCopied();
      toast("Code copied: " + code, true);
    }
    function fallback() {
      if (promoInput) {
        promoInput.removeAttribute("readonly");
        promoInput.focus();
        promoInput.select();
        try {
          document.execCommand("copy");
          done();
        } catch (err) {
          toast("Copy not supported — select the code manually.");
        }
        promoInput.setAttribute("readonly", "");
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done, fallback);
    } else {
      fallback();
    }
  }

  /* ---------------- Wire up ---------------- */
  Array.prototype.forEach.call(openTriggers, function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (overlay)
    overlay.addEventListener("click", function () {
      closeModal();
      toast("Offer dismissed — it'll be in your inbox.");
    });

  if (declineBtn)
    declineBtn.addEventListener("click", function () {
      closeModal();
      toast("No problem — the discount is saved for 24 hours.");
    });

  if (claimBtn)
    claimBtn.addEventListener("click", function () {
      var code = promoInput ? promoInput.value : "";
      closeModal();
      toast("Applied " + code + " — 30% off your first 3 months!", true);
    });

  if (promoCopy) promoCopy.addEventListener("click", copyCode);
  if (promoInput)
    promoInput.addEventListener("focus", function () {
      promoInput.select();
    });

  /* ---------------- Exit-intent simulation ---------------- */
  // Fire once when the cursor leaves through the top of the viewport.
  function onMouseOut(e) {
    if (hasOpenedOnce || isOpen) return;
    if (e.clientY <= 0 && !e.relatedTarget && !e.toElement) {
      openModal();
      toast("Heads up — we saved you a discount.");
    }
  }
  document.addEventListener("mouseout", onMouseOut);

  // Demo fallback: auto-trigger after a short delay if exit intent never fires
  // (e.g. inside an iframe or on touch devices).
  window.setTimeout(function () {
    if (!hasOpenedOnce) openModal();
  }, 6000);
})();
