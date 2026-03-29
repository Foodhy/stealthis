(() => {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const resultsList = document.getElementById("resultsList");
  const resultsCount = document.getElementById("resultsCount");
  const emptyResults = document.getElementById("emptyResults");
  const pagination = document.getElementById("pagination");
  const sortSelect = document.getElementById("sortSelect");
  const typeTabs = document.querySelectorAll(".type-tab");
  const filterSidebar = document.getElementById("filterSidebar");
  const mobileFilterOpen = document.getElementById("mobileFilterOpen");
  const mobileFilterClose = document.getElementById("mobileFilterClose");

  let activeType = "all";
  let currentPage = 1;

  function getCards() {
    return Array.from(resultsList.querySelectorAll(".result-card"));
  }

  /* ── Highlight Search Terms ────────────────── */

  function highlightTerms(query) {
    const cards = getCards();
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);

    cards.forEach((card) => {
      const desc = card.querySelector(".result-desc");
      const url = card.querySelector(".result-url");

      [desc, url].forEach((el) => {
        if (!el.dataset.original) {
          el.dataset.original = el.textContent;
        }
        let text = el.dataset.original;
        if (terms.length > 0) {
          const regex = new RegExp(
            `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
            "gi"
          );
          text = text.replace(regex, "<mark>$1</mark>");
        }
        el.innerHTML = text;
      });
    });
  }

  /* ── Filter by Type Tab ────────────────────── */

  function filterByType() {
    const cards = getCards();
    cards.forEach((card) => {
      const cardType = card.getAttribute("data-type");
      card.style.display = activeType === "all" || cardType === activeType ? "" : "none";
    });
  }

  /* ── Filter by Category Checkboxes ─────────── */

  function getActiveCategories() {
    const checks = filterSidebar.querySelectorAll('.filter-check input[type="checkbox"]');
    return Array.from(checks)
      .filter((c) => c.checked)
      .map((c) => c.value);
  }

  function filterByCategory() {
    const active = getActiveCategories();
    const cards = getCards();
    cards.forEach((card) => {
      const cat = card.getAttribute("data-cat");
      if (card.style.display === "none") return; /* already hidden by type */
      if (active.length > 0 && !active.includes(cat)) {
        card.style.display = "none";
      }
    });
  }

  /* ── Sort ───────────────────────────────────── */

  function sortResults() {
    const val = sortSelect.value;
    const cards = getCards();

    cards.sort((a, b) => {
      if (val === "newest") {
        return new Date(b.getAttribute("data-date")) - new Date(a.getAttribute("data-date"));
      }
      if (val === "popular") {
        return parseInt(b.getAttribute("data-pop"), 10) - parseInt(a.getAttribute("data-pop"), 10);
      }
      return 0; /* relevance = original order */
    });

    cards.forEach((card) => resultsList.appendChild(card));
  }

  /* ── Update UI ─────────────────────────────── */

  function updateResults() {
    /* Reset visibility */
    getCards().forEach((c) => (c.style.display = ""));

    filterByType();
    filterByCategory();
    sortResults();

    const visible = getCards().filter((c) => c.style.display !== "none");
    const query = searchInput.value.trim();
    const total = visible.length;

    if (total === 0) {
      emptyResults.style.display = "";
      pagination.style.display = "none";
      resultsCount.textContent = `No results for \u201c${query}\u201d`;
    } else {
      emptyResults.style.display = "none";
      pagination.style.display = "";
      resultsCount.innerHTML = `About ${total * 31} results for &ldquo;<strong>${escapeHtml(query)}</strong>&rdquo; (0.${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 9)}s)`;
    }

    highlightTerms(query);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ── Event Listeners ───────────────────────── */

  /* Search form */
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentPage = 1;
    updateResults();
  });

  /* Type tabs */
  typeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      typeTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeType = tab.getAttribute("data-type");
      currentPage = 1;
      updateResults();
    });
  });

  /* Category checkboxes */
  filterSidebar.querySelectorAll('.filter-check input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", () => updateResults());
  });

  /* Date radios (simulated filter) */
  filterSidebar.querySelectorAll('.filter-radio input[type="radio"]').forEach((r) => {
    r.addEventListener("change", () => updateResults());
  });

  /* Sort */
  sortSelect.addEventListener("change", () => updateResults());

  /* Pagination */
  pagination.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn");
    if (!btn || btn.disabled) return;

    if (btn.classList.contains("prev")) {
      if (currentPage > 1) currentPage--;
    } else if (btn.classList.contains("next")) {
      currentPage++;
    } else {
      currentPage = parseInt(btn.getAttribute("data-page"), 10);
    }

    /* Update active state */
    pagination.querySelectorAll(".page-btn[data-page]").forEach((p) => {
      p.classList.toggle("active", parseInt(p.getAttribute("data-page"), 10) === currentPage);
    });

    const prevBtn = pagination.querySelector(".prev");
    const nextBtn = pagination.querySelector(".next");
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= 25;

    /* Scroll to top */
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* Mobile filter toggle */
  mobileFilterOpen.addEventListener("click", () => {
    filterSidebar.classList.add("open");
  });

  mobileFilterClose.addEventListener("click", () => {
    filterSidebar.classList.remove("open");
  });

  /* ── Init ──────────────────────────────────── */
  highlightTerms(searchInput.value);
})();
