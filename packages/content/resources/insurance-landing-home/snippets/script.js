// Harborline home-insurance landing — vanilla JS, no dependencies.
(function () {
  "use strict";

  var usd = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };

  /* ---------------------------------------------------------------
     Instant quote estimator
     A simple, illustrative premium model:
       base rate scales with home value, modified by deductible tier.
  --------------------------------------------------------------- */
  var valueInput = document.getElementById("value");
  var valueOut = document.getElementById("valueOut");
  var deductible = document.getElementById("deductible");
  var premiumEl = document.getElementById("premium");
  var annualNote = document.getElementById("annualNote");
  var quoteForm = document.getElementById("quoteForm");

  // Lower deductible => higher premium multiplier.
  var deductibleFactor = {
    "500": 1.18,
    "1000": 1.0,
    "2500": 0.88,
    "5000": 0.79
  };

  function calcPremium() {
    if (!valueInput) return;
    var value = Number(valueInput.value);
    var factor = deductibleFactor[deductible.value] || 1;

    // ~$0.0021 per dollar of value per year, plus a $180 base, then /12.
    var annual = (value * 0.0021 + 180) * factor;
    var monthly = annual / 12;

    valueOut.textContent = usd(value);
    premiumEl.textContent = usd(monthly);
    annualNote.textContent = "≈ " + usd(monthly * 12) + " billed yearly";
  }

  if (valueInput) {
    valueInput.addEventListener("input", calcPremium);
    deductible.addEventListener("change", calcPremium);
    calcPremium();
  }

  // ZIP: digits only.
  var zip = document.getElementById("zip");
  if (zip) {
    zip.addEventListener("input", function () {
      zip.value = zip.value.replace(/\D/g, "").slice(0, 5);
    });
  }

  if (quoteForm) {
    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = quoteForm.querySelector('button[type="submit"]');
      if (!btn || btn.dataset.busy) return;
      var original = btn.textContent;
      btn.dataset.busy = "1";
      btn.disabled = true;
      btn.textContent = "Saved! Check the demo ✓";
      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = original;
        delete btn.dataset.busy;
      }, 2200);
    });
  }

  /* ---------------------------------------------------------------
     Bundle savings calculator
     Discounts stack additively, capped at 27%. Savings shown against
     an illustrative $1,540/yr combined bundle premium.
  --------------------------------------------------------------- */
  var bundleOptions = document.getElementById("bundleOptions");
  var bundlePct = document.getElementById("bundlePct");
  var bundleSaved = document.getElementById("bundleSaved");
  var bundleCount = document.getElementById("bundleCount");
  var bundleList = document.getElementById("bundleList");

  var BUNDLE_BASE = 1540; // illustrative combined yearly premium
  var BUNDLE_CAP = 27;

  function updateBundle() {
    if (!bundleOptions) return;
    var checked = bundleOptions.querySelectorAll('input[type="checkbox"]:checked');
    var pct = 0;
    var items = ["🏠 Home insurance — included"];

    checked.forEach(function (c) {
      pct += Number(c.value);
      items.push("➕ " + c.dataset.label + " — added");
    });

    pct = Math.min(pct, BUNDLE_CAP);
    var saved = (BUNDLE_BASE * pct) / 100;

    bundlePct.textContent = pct + "%";
    bundleSaved.textContent = usd(saved);
    bundleCount.textContent = checked.length + 1;

    bundleList.innerHTML = items
      .map(function (t) {
        return "<li>" + t + "</li>";
      })
      .join("");

    // Little bump micro-interaction on change.
    bundlePct.classList.remove("bump");
    void bundlePct.offsetWidth; // reflow to restart animation
    bundlePct.classList.add("bump");
  }

  if (bundleOptions) {
    bundleOptions.addEventListener("change", updateBundle);
    updateBundle();
  }

  /* ---------------------------------------------------------------
     Smooth in-page nav active state (lightweight scroll spy).
  --------------------------------------------------------------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".nav-links a[href^='#']")
  );
  var sections = links
    .map(function (l) {
      return document.querySelector(l.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) {
            var on = l.getAttribute("href") === "#" + entry.target.id;
            l.style.color = on ? "var(--ink)" : "";
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }
})();
