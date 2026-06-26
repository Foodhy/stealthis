(function () {
  "use strict";

  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var count = document.getElementById("resultCount");
  var empty = document.getElementById("emptyState");
  var total = cards.length;

  function label(area) {
    var chip = chips.find(function (c) { return c.dataset.area === area; });
    return chip ? chip.textContent.trim() : area;
  }

  function applyFilter(area) {
    var visible = 0;

    cards.forEach(function (card) {
      var match = area === "all" || card.dataset.area === area;
      card.hidden = !match;
      if (match) { visible += 1; }
    });

    // Toggle active chip state
    chips.forEach(function (chip) {
      var active = chip.dataset.area === area;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });

    // Empty state + live count
    if (empty) { empty.hidden = visible !== 0; }
    if (count) {
      if (area === "all") {
        count.textContent = "Showing all " + total + " practice areas";
      } else if (visible === 0) {
        count.textContent = "No practice areas match “" + label(area) + "”";
      } else {
        count.textContent =
          "Showing " + visible + " of " + total + " — " + label(area);
      }
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyFilter(chip.dataset.area);
    });
  });

  // Initial state
  applyFilter("all");
})();
