(function () {
  "use strict";

  var toggle = document.getElementById("seasonToggle");
  var hint = document.getElementById("seasonHint");
  var amounts = Array.prototype.slice.call(
    document.querySelectorAll(".price__amount")
  );
  var enquireButtons = Array.prototype.slice.call(
    document.querySelectorAll(".enquire")
  );
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  var HINTS = {
    peak: "Showing peak-season rates for May–October weddings.",
    off: "Showing off-peak rates — save on November–April celebrations.",
  };

  /* --- toast helper --- */
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 3400);
  }

  /* --- season pricing swap --- */
  function applySeason(isOffPeak) {
    var key = isOffPeak ? "off" : "peak";
    amounts.forEach(function (el) {
      var next = "$" + el.getAttribute("data-" + key);
      if (el.textContent === next) return;
      el.classList.add("is-swapping");
      setTimeout(function () {
        el.textContent = next;
        el.classList.remove("is-swapping");
      }, 200);
    });
    if (hint) hint.textContent = isOffPeak ? HINTS.off : HINTS.peak;
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = toggle.getAttribute("aria-checked") !== "true";
      toggle.setAttribute("aria-checked", String(next));
      applySeason(next);
    });
  }

  /* --- enquire actions --- */
  enquireButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pkg = btn.getAttribute("data-package") || "your collection";
      var name = pkg.split(" — ")[0];
      toast(
        "Thank you — your enquiry for " +
          name +
          " has been noted. We will be in touch within two days."
      );
    });
  });
})();
