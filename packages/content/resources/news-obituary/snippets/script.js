(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  function formatCount(n) {
    return n.toLocaleString("en-US");
  }

  /* ---------- Primary "light a candle" counter ---------- */
  var candleBtn = document.getElementById("candleBtn");
  var candleCount = document.getElementById("candleCount");
  var count = 1284;
  var lit = false;

  if (candleBtn && candleCount) {
    candleBtn.addEventListener("click", function () {
      if (!lit) {
        count += 1;
        lit = true;
        candleBtn.classList.add("is-lit");
        candleBtn.querySelector(".candle__label").textContent = "Candle lit";
        candleBtn.setAttribute("aria-pressed", "true");
        candleCount.textContent = formatCount(count);
        toast("Your candle now burns for Eleanor. Thank you.");
      } else {
        count -= 1;
        lit = false;
        candleBtn.classList.remove("is-lit");
        candleBtn.querySelector(".candle__label").textContent = "Light a candle";
        candleBtn.setAttribute("aria-pressed", "false");
        candleCount.textContent = formatCount(count);
        toast("Candle dimmed.");
      }
    });
  }

  /* ---------- Compact list mini candle buttons ---------- */
  var miniBtns = document.querySelectorAll(".ministem");
  Array.prototype.forEach.call(miniBtns, function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-lit")) return;
      btn.classList.add("is-lit");
      btn.textContent = "Candle lit ✓";
      btn.setAttribute("aria-pressed", "true");
      var name = btn.getAttribute("data-name") || "this neighbour";
      toast("A candle was lit for " + name + ".");
    });
  });

  /* ---------- Share ---------- */
  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var shareData = {
        title: "In Memoriam — Eleanor M. Whitcombe",
        text: "Remembering Eleanor M. Whitcombe (1940–2026), beloved teacher of Meridian Falls.",
        url: window.location.href
      };

      if (navigator.share) {
        navigator
          .share(shareData)
          .then(function () {
            toast("Thank you for sharing this remembrance.");
          })
          .catch(function () {
            /* user cancelled — stay quiet */
          });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(shareData.text + " " + shareData.url)
          .then(function () {
            toast("Remembrance link copied to clipboard.");
          })
          .catch(function () {
            toast("Could not copy — please copy the page link manually.");
          });
        return;
      }

      toast("Sharing is not available in this preview.");
    });
  }
})();
