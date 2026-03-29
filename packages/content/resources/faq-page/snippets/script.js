(function () {
  var triggers = document.querySelectorAll(".accordion-trigger");
  var searchInput = document.querySelector(".search-input");
  var sections = document.querySelectorAll(".faq-section");
  var noResults = document.querySelector(".no-results");
  var categoryCards = document.querySelectorAll(".category-card");

  // Accordion toggle
  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var item = trigger.closest(".accordion-item");
      var section = trigger.closest(".accordion");
      var isOpen = item.classList.contains("open");

      // Close other items in the same section
      section.querySelectorAll(".accordion-item.open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("open");
        }
      });

      if (isOpen) {
        item.classList.remove("open");
      } else {
        item.classList.add("open");
      }
    });
  });

  // Search filter
  searchInput.addEventListener("input", function () {
    var query = searchInput.value.toLowerCase().trim();
    var totalVisible = 0;

    sections.forEach(function (section) {
      var items = section.querySelectorAll(".accordion-item");
      var sectionVisible = 0;

      items.forEach(function (item) {
        var question = item
          .querySelector(".accordion-trigger span:first-child")
          .textContent.toLowerCase();
        var answer = item.querySelector(".accordion-content p").textContent.toLowerCase();

        if (!query || question.indexOf(query) !== -1 || answer.indexOf(query) !== -1) {
          item.classList.remove("search-hidden");
          sectionVisible++;
        } else {
          item.classList.add("search-hidden");
          item.classList.remove("open");
        }
      });

      if (sectionVisible === 0) {
        section.classList.add("section-hidden");
      } else {
        section.classList.remove("section-hidden");
      }

      totalVisible += sectionVisible;
    });

    if (totalVisible === 0 && query) {
      noResults.style.display = "block";
    } else {
      noResults.style.display = "none";
    }
  });

  // Category card click - scroll to section
  categoryCards.forEach(function (card) {
    card.addEventListener("click", function () {
      var targetId = card.getAttribute("data-target");
      var targetSection = document.getElementById(targetId);
      if (targetSection) {
        // Clear search
        searchInput.value = "";
        sections.forEach(function (section) {
          section.classList.remove("section-hidden");
          section.querySelectorAll(".accordion-item").forEach(function (item) {
            item.classList.remove("search-hidden");
          });
        });
        noResults.style.display = "none";

        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
