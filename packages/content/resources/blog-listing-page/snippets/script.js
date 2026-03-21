(function () {
  "use strict";

  var cards = Array.from(document.querySelectorAll("#postGrid .card"));
  var tabs = document.querySelectorAll("#categoryTabs .tab");
  var searchInput = document.getElementById("searchInput");
  var emptyState = document.getElementById("emptyState");
  var pagination = document.getElementById("pagination");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var navSearchBtn = document.getElementById("navSearchBtn");
  var pageBtns = document.querySelectorAll(".page-btn[data-page]");

  var POSTS_PER_PAGE = 9;
  var activeCategory = "all";
  var currentPage = 1;
  var debounceTimer = null;

  /* ── Helpers ── */

  function getFilteredCards() {
    var query = (searchInput.value || "").trim().toLowerCase();

    return cards.filter(function (card) {
      var category = card.getAttribute("data-category");
      var title = card.querySelector(".card-title").textContent.toLowerCase();
      var excerpt = card.querySelector(".card-excerpt").textContent.toLowerCase();

      var matchesCategory =
        activeCategory === "all" || category === activeCategory;
      var matchesSearch =
        !query || title.indexOf(query) !== -1 || excerpt.indexOf(query) !== -1;

      return matchesCategory && matchesSearch;
    });
  }

  function render() {
    var filtered = getFilteredCards();
    var totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    var start = (currentPage - 1) * POSTS_PER_PAGE;
    var end = start + POSTS_PER_PAGE;

    /* Show / hide cards */
    cards.forEach(function (card) {
      card.classList.add("hidden");
    });

    filtered.slice(start, end).forEach(function (card) {
      card.classList.remove("hidden");
    });

    /* Empty state */
    if (filtered.length === 0) {
      emptyState.classList.add("visible");
      pagination.style.display = "none";
    } else {
      emptyState.classList.remove("visible");
      pagination.style.display = "flex";
    }

    /* Pagination buttons */
    updatePagination(totalPages);
  }

  function updatePagination(totalPages) {
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    pageBtns.forEach(function (btn) {
      var page = parseInt(btn.getAttribute("data-page"), 10);
      btn.classList.toggle("active", page === currentPage);
    });
  }

  /* ── Category Tabs ── */

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("active");
      });
      tab.classList.add("active");
      activeCategory = tab.getAttribute("data-category");
      currentPage = 1;
      render();
    });
  });

  /* ── Search ── */

  searchInput.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      currentPage = 1;
      render();
    }, 200);
  });

  /* ── Nav search button ── */

  navSearchBtn.addEventListener("click", function () {
    searchInput.focus();
    searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* ── Pagination ── */

  pageBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentPage = parseInt(btn.getAttribute("data-page"), 10);
      render();
      window.scrollTo({ top: document.querySelector(".post-grid").offsetTop - 80, behavior: "smooth" });
    });
  });

  prevBtn.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      render();
      window.scrollTo({ top: document.querySelector(".post-grid").offsetTop - 80, behavior: "smooth" });
    }
  });

  nextBtn.addEventListener("click", function () {
    var filtered = getFilteredCards();
    var totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
    if (currentPage < totalPages) {
      currentPage++;
      render();
      window.scrollTo({ top: document.querySelector(".post-grid").offsetTop - 80, behavior: "smooth" });
    }
  });

  /* ── Init ── */

  render();
})();
