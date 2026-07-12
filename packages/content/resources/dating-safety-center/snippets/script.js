(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Verification CTA ---------- */
  var verifyBtn = document.getElementById("verifyBtn");
  var verifyBadge = document.getElementById("verifyBadge");
  var verifyNote = document.getElementById("verifyNote");
  var verifyTrack = document.getElementById("verifyTrack");
  var verifyFill = document.getElementById("verifyFill");
  var verifying = false;

  verifyBtn.addEventListener("click", function () {
    if (verifying || verifyBadge.getAttribute("data-state") === "verified") {
      if (verifyBadge.getAttribute("data-state") === "verified") {
        toast("You're already verified ✨");
      }
      return;
    }
    verifying = true;
    verifyBtn.disabled = true;
    verifyBtn.textContent = "Scanning…";
    verifyBadge.setAttribute("data-state", "verifying");
    verifyBadge.textContent = "Verifying";
    verifyNote.textContent = "Matching your selfie to your photos…";
    verifyTrack.hidden = false;

    var pct = 0;
    var iv = setInterval(function () {
      pct = Math.min(100, pct + Math.random() * 22 + 8);
      verifyFill.style.width = pct + "%";
      if (pct >= 100) {
        clearInterval(iv);
        verifyBadge.setAttribute("data-state", "verified");
        verifyBadge.textContent = "Verified";
        verifyNote.textContent = "A blue check now shows on your profile.";
        verifyBtn.textContent = "Verified ✓";
        toast("Profile verified — nicely done!");
        setTimeout(function () { verifyTrack.hidden = true; }, 600);
      }
    }, 380);
  });

  /* ---------- Tip filter chips ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var tips = Array.prototype.slice.call(document.querySelectorAll(".tip"));
  var tipCount = document.getElementById("tipCount");
  var tipEmpty = document.getElementById("tipEmpty");

  function applyFilter(filter) {
    var shown = 0;
    tips.forEach(function (tip) {
      var match = filter === "all" || tip.getAttribute("data-cat") === filter;
      tip.classList.toggle("hide", !match);
      if (match) shown++;
    });
    tipCount.textContent = shown + (shown === 1 ? " tip" : " tips");
    tipEmpty.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- Expandable tip cards ---------- */
  tips.forEach(function (tip) {
    var head = tip.querySelector(".tip-head");
    var body = tip.querySelector(".tip-body");
    head.addEventListener("click", function () {
      var open = tip.classList.toggle("open");
      head.setAttribute("aria-expanded", open ? "true" : "false");
      body.style.maxHeight = open ? body.scrollHeight + "px" : "0";
    });
  });

  /* ---------- Report & block ---------- */
  document.getElementById("reportBtn").addEventListener("click", function () {
    toast("Report started — our Trust team reviews within 24h.");
  });
  document.getElementById("blockBtn").addEventListener("click", function () {
    toast("Blocking is instant and silent. Stay safe 💜");
  });

  /* ---------- Emergency actions ---------- */
  Array.prototype.slice.call(document.querySelectorAll(".emg-call")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var num = btn.getAttribute("data-number");
      var label = btn.textContent.trim().toLowerCase();
      if (label === "copy") {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(num).then(function () {
            toast("Copied " + num + " to clipboard.");
          }, function () {
            toast("Number: " + num);
          });
        } else {
          toast("Number: " + num);
        }
      } else {
        toast("Dialing " + num + "…");
      }
    });
  });

  /* ---------- Community guidelines accordion (single-open) ---------- */
  var accItems = Array.prototype.slice.call(document.querySelectorAll(".acc-item"));
  accItems.forEach(function (item) {
    var head = item.querySelector(".acc-head");
    var panel = item.querySelector(".acc-panel");
    head.addEventListener("click", function () {
      var willOpen = !item.classList.contains("open");
      accItems.forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".acc-head").setAttribute("aria-expanded", "false");
        other.querySelector(".acc-panel").style.maxHeight = "0";
      });
      if (willOpen) {
        item.classList.add("open");
        head.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
})();
