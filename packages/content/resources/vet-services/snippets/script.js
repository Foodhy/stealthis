(function () {
  "use strict";

  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var countEl = document.getElementById("resultCount");
  var emptyEl = document.getElementById("emptyState");
  var bookBtn = document.getElementById("bookBtn");

  // Active filter state: one category + one pet filter, "all" resets both groups.
  var state = { cat: "all", pet: "all" };

  var CATS = ["all", "preventive", "medical", "lifestyle"];
  var PETS = ["dog", "cat", "small"];

  function matches(card) {
    var cat = card.getAttribute("data-cat");
    var pets = (card.getAttribute("data-pets") || "").split(" ");
    var catOk = state.cat === "all" || cat === state.cat;
    var petOk = state.pet === "all" || pets.indexOf(state.pet) !== -1;
    return catOk && petOk;
  }

  function render() {
    var shown = 0;
    cards.forEach(function (card) {
      if (matches(card)) {
        card.classList.remove("is-hidden");
        shown++;
      } else {
        card.classList.add("is-hidden");
      }
    });

    countEl.textContent =
      "Showing " + shown + " service" + (shown === 1 ? "" : "s");
    emptyEl.hidden = shown !== 0;
  }

  function syncChips() {
    chips.forEach(function (chip) {
      var f = chip.getAttribute("data-filter");
      var active =
        f === state.cat || f === state.pet || (f === "all" && state.cat === "all");
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");

      if (f === "all") {
        state.cat = "all";
        state.pet = "all";
      } else if (CATS.indexOf(f) !== -1) {
        state.cat = state.cat === f ? "all" : f;
      } else if (PETS.indexOf(f) !== -1) {
        state.pet = state.pet === f ? "all" : f;
      }

      syncChips();
      render();
    });
  });

  if (bookBtn) {
    bookBtn.addEventListener("click", function () {
      var cta = document.querySelector(".cta");
      if (cta && cta.scrollIntoView) {
        cta.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      bookBtn.classList.add("is-booked");
      bookBtn.textContent = "We'll call you ✓";
      setTimeout(function () {
        bookBtn.classList.remove("is-booked");
        bookBtn.textContent = "Book now";
      }, 2200);
    });
  }

  syncChips();
  render();
})();
