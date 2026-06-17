(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Expandable fee breakdown ---------- */
  var feesBtn = document.getElementById("feesBtn");
  var feesPanel = document.getElementById("feesPanel");
  if (feesBtn && feesPanel) {
    feesBtn.addEventListener("click", function () {
      var open = feesBtn.getAttribute("aria-expanded") === "true";
      feesBtn.setAttribute("aria-expanded", String(!open));
      feesPanel.hidden = open;
    });
  }

  /* ---------- Rate order stars ---------- */
  var starWrap = document.getElementById("stars");
  var rateResult = document.getElementById("rateResult");
  var rated = 0;
  var labels = {
    1: "Sorry it missed — we'll flag this order.",
    2: "Thanks — we'll work on it.",
    3: "Noted, thanks for the feedback.",
    4: "Great! Glad it landed well.",
    5: "Loved it! Marisol will be thrilled."
  };

  if (starWrap) {
    var stars = Array.prototype.slice.call(starWrap.querySelectorAll(".star"));

    function paint(n) {
      stars.forEach(function (s) {
        var v = Number(s.getAttribute("data-value"));
        s.classList.toggle("lit", v <= n);
      });
    }

    function commit(n) {
      rated = n;
      stars.forEach(function (s) {
        var v = Number(s.getAttribute("data-value"));
        s.setAttribute("aria-checked", String(v === n));
        s.setAttribute("tabindex", v === n ? "0" : "-1");
      });
      paint(n);
      if (rateResult) rateResult.textContent = labels[n] || "";
      toast("Thanks — you rated this order " + n + "★");
    }

    stars.forEach(function (star) {
      var v = Number(star.getAttribute("data-value"));
      star.addEventListener("mouseenter", function () { paint(v); });
      star.addEventListener("focus", function () { paint(v); });
      star.addEventListener("click", function () { commit(v); });
      star.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          commit(Math.min(5, (rated || v) + 1));
          stars[Math.min(5, (rated || v) + 1) - 1].focus();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          var nv = Math.max(1, (rated || v) - 1);
          commit(nv);
          stars[nv - 1].focus();
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          commit(v);
        }
      });
    });

    starWrap.addEventListener("mouseleave", function () { paint(rated); });
  }

  /* ---------- Reorder ---------- */
  var reorderBtn = document.getElementById("reorderBtn");
  if (reorderBtn) {
    reorderBtn.addEventListener("click", function () {
      var original = reorderBtn.textContent;
      reorderBtn.disabled = true;
      reorderBtn.textContent = "Adding…";
      setTimeout(function () {
        reorderBtn.disabled = false;
        reorderBtn.textContent = original;
        toast("3 items added to a new cart from Saffron & Salt");
      }, 700);
    });
  }

  /* ---------- Get help ---------- */
  var helpBtn = document.getElementById("helpBtn");
  if (helpBtn) {
    helpBtn.addEventListener("click", function () {
      toast("Connecting you to support for order #SS-48207…");
    });
  }

  /* ---------- Topbar buttons (illustrative) ---------- */
  var shareBtn = document.querySelector('[aria-label="Share receipt"]');
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      toast("Receipt link copied to clipboard");
    });
  }
  var backBtn = document.querySelector('[aria-label="Back to orders"]');
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      toast("Returning to your orders");
    });
  }
})();
