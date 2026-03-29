(function () {
  const filterPills = document.querySelectorAll(".filter-pill");
  const searchInput = document.querySelector(".search-input");
  const entries = document.querySelectorAll(".timeline-entry");

  let activeFilter = "all";

  // Filter pills
  filterPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      filterPills.forEach(function (p) {
        p.classList.remove("active");
      });
      pill.classList.add("active");
      activeFilter = pill.getAttribute("data-filter");
      applyFilters();
    });
  });

  // Search
  searchInput.addEventListener("input", function () {
    applyFilters();
  });

  function applyFilters() {
    var query = searchInput.value.toLowerCase().trim();

    entries.forEach(function (entry) {
      var items = entry.querySelectorAll(".change-item");
      var hasVisibleItem = false;

      items.forEach(function (item) {
        var type = item.getAttribute("data-type");
        var text = item.querySelector(".change-text").textContent.toLowerCase();

        var matchesFilter = activeFilter === "all" || type === activeFilter;
        var matchesSearch = !query || text.indexOf(query) !== -1;

        if (matchesFilter && matchesSearch) {
          item.classList.remove("hidden");
          hasVisibleItem = true;
        } else {
          item.classList.add("hidden");
        }
      });

      if (hasVisibleItem) {
        entry.classList.remove("hidden");
      } else {
        entry.classList.add("hidden");
      }
    });
  }

  // Expand / Collapse
  document.querySelectorAll(".expand-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".timeline-card");
      var entry = btn.closest(".timeline-entry");
      var isCollapsed = card.classList.contains("collapsed");

      if (isCollapsed) {
        card.classList.remove("collapsed");
        entry.setAttribute("data-expanded", "true");
        btn.setAttribute("aria-label", "Collapse version");
      } else {
        card.classList.add("collapsed");
        entry.setAttribute("data-expanded", "false");
        btn.setAttribute("aria-label", "Expand version");
      }
    });
  });

  // Smooth scroll to version via anchor hash
  if (window.location.hash) {
    var version = window.location.hash.replace("#", "");
    var target = document.querySelector('[data-version="' + version + '"]');
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      var card = target.querySelector(".timeline-card");
      if (card && card.classList.contains("collapsed")) {
        card.classList.remove("collapsed");
        target.setAttribute("data-expanded", "true");
      }
    }
  }
})();
