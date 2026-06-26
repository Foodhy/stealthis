// Insurance — Coverage Detail
// Recalculates the live monthly premium as add-on riders are toggled. Vanilla JS, no libraries.
(function () {
  "use strict";

  var BASE_PRICE = 148;

  var riderList = document.getElementById("riderList");
  var heroPrice = document.getElementById("heroPrice");
  var ctaPrice = document.getElementById("ctaPrice");
  var heroNote = document.getElementById("heroNote");
  var ctaRiders = document.getElementById("ctaRiders");
  var getPlan = document.getElementById("getPlan");

  if (!riderList) return;

  var riders = Array.prototype.slice.call(
    riderList.querySelectorAll("[data-rider]")
  );

  function recalc() {
    var total = BASE_PRICE;
    var active = [];

    riders.forEach(function (rider) {
      var input = rider.querySelector("[data-toggle]");
      var amount = parseInt(rider.getAttribute("data-amount"), 10) || 0;
      var on = input && input.checked;
      rider.classList.toggle("is-on", !!on);
      if (on) {
        total += amount;
        var name = rider.querySelector(".rider__name");
        if (name) active.push(name.textContent.trim());
      }
    });

    // Update the two price displays with a small flash micro-interaction.
    [heroPrice, ctaPrice].forEach(function (el) {
      if (!el) return;
      if (el.textContent !== String(total)) {
        el.textContent = total;
        el.classList.remove("flash");
        // force reflow so the animation can replay
        void el.offsetWidth;
        el.classList.add("flash");
      }
    });

    if (heroNote) {
      heroNote.textContent = active.length
        ? active.length + " add-on" + (active.length > 1 ? "s" : "") + " selected"
        : "Base plan only";
    }

    if (ctaRiders) {
      if (active.length === 0) {
        ctaRiders.textContent = "no add-ons";
      } else if (active.length <= 2) {
        ctaRiders.textContent = "+ " + active.join(", ");
      } else {
        ctaRiders.textContent = "+ " + active.length + " add-ons";
      }
    }
  }

  riders.forEach(function (rider) {
    var input = rider.querySelector("[data-toggle]");
    if (input) input.addEventListener("change", recalc);
  });

  if (getPlan) {
    getPlan.addEventListener("click", function (e) {
      e.preventDefault();
      var price = ctaPrice ? ctaPrice.textContent : BASE_PRICE;
      var label = getPlan.textContent;
      getPlan.textContent = "Securing $" + price + "/mo plan…";
      getPlan.style.pointerEvents = "none";
      setTimeout(function () {
        getPlan.textContent = "Plan reserved ✓";
        setTimeout(function () {
          getPlan.textContent = label;
          getPlan.style.pointerEvents = "";
        }, 1800);
      }, 700);
    });
  }

  recalc();
})();
