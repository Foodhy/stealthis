(() => {
  const grid = document.getElementById("productGrid");
  const sortSelect = document.getElementById("sortSelect");
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");
  const priceSlider = document.getElementById("priceSlider");
  const stockToggle = document.getElementById("stockToggle");
  const clearBtn = document.getElementById("clearFilters");
  const activeFiltersEl = document.getElementById("activeFilters");
  const showingCount = document.getElementById("showingCount");
  const productTotal = document.getElementById("productTotal");
  const pagination = document.getElementById("pagination");
  const sidebar = document.getElementById("shopSidebar");
  const mobileToggle = document.getElementById("mobileFilterToggle");
  const sidebarClose = document.getElementById("sidebarClose");

  let ratingFilter = 0;
  let currentPage = 1;

  function getCards() {
    return Array.from(grid.querySelectorAll(".product-card"));
  }

  /* ── Price Filter ──────────────────────────── */

  priceSlider.addEventListener("input", () => {
    priceMax.value = priceSlider.value;
    applyFilters();
  });

  priceMin.addEventListener("change", () => applyFilters());
  priceMax.addEventListener("change", () => {
    priceSlider.value = priceMax.value;
    applyFilters();
  });

  /* ── Brand Filter ──────────────────────────── */

  sidebar.querySelectorAll('.check-label input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", () => applyFilters());
  });

  /* ── Rating Filter ─────────────────────────── */

  sidebar.querySelectorAll(".star-label").forEach((label) => {
    label.addEventListener("click", () => {
      const min = parseInt(label.getAttribute("data-min"), 10);
      if (ratingFilter === min) {
        ratingFilter = 0;
        label.classList.remove("active");
      } else {
        sidebar.querySelectorAll(".star-label").forEach((l) => l.classList.remove("active"));
        ratingFilter = min;
        label.classList.add("active");
      }
      applyFilters();
    });
  });

  /* ── Stock Toggle ──────────────────────────── */

  stockToggle.addEventListener("click", () => {
    const current = stockToggle.getAttribute("aria-checked") === "true";
    stockToggle.setAttribute("aria-checked", !current);
    applyFilters();
  });

  /* ── Sort ───────────────────────────────────── */

  sortSelect.addEventListener("change", () => applyFilters());

  /* ── View Toggle ───────────────────────────── */

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.getAttribute("data-view");
      grid.classList.toggle("list-view", view === "list");
    });
  });

  /* ── Collapsible Sections ──────────────────── */

  sidebar.querySelectorAll(".filter-heading").forEach((heading) => {
    heading.addEventListener("click", () => {
      heading.closest(".filter-section").classList.toggle("collapsed");
    });
  });

  /* ── Clear All ─────────────────────────────── */

  clearBtn.addEventListener("click", () => {
    priceMin.value = 0;
    priceMax.value = 500;
    priceSlider.value = 500;
    sidebar.querySelectorAll('.check-label input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
    ratingFilter = 0;
    sidebar.querySelectorAll(".star-label").forEach((l) => l.classList.remove("active"));
    stockToggle.setAttribute("aria-checked", "false");
    sortSelect.value = "featured";
    applyFilters();
  });

  /* ── Mobile Sidebar ────────────────────────── */

  mobileToggle.addEventListener("click", () => {
    sidebar.classList.add("open");
    document.body.style.overflow = "hidden";
  });

  sidebarClose.addEventListener("click", () => {
    sidebar.classList.remove("open");
    document.body.style.overflow = "";
  });

  /* ── Apply Filters ─────────────────────────── */

  function applyFilters() {
    const cards = getCards();
    const minPrice = parseInt(priceMin.value, 10) || 0;
    const maxPrice = parseInt(priceMax.value, 10) || 500;
    const stockOnly = stockToggle.getAttribute("aria-checked") === "true";

    const selectedBrands = Array.from(sidebar.querySelectorAll(".check-label input:checked")).map(
      (cb) => cb.value
    );

    let visibleCount = 0;

    cards.forEach((card) => {
      const price = parseInt(card.getAttribute("data-price"), 10);
      const brand = card.getAttribute("data-brand");
      const rating = parseFloat(card.getAttribute("data-rating"));
      const inStock = card.getAttribute("data-stock") === "true";

      let show = true;

      if (price < minPrice || price > maxPrice) show = false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(brand)) show = false;
      if (ratingFilter > 0 && rating < ratingFilter) show = false;
      if (stockOnly && !inStock) show = false;

      card.style.display = show ? "" : "none";
      if (show) visibleCount++;
    });

    /* Sort visible cards */
    sortCards();

    /* Update counts */
    showingCount.textContent = `Showing ${visibleCount} of 48 products`;
    productTotal.textContent = `${visibleCount} products`;

    /* Update active filter pills */
    updateFilterPills(minPrice, maxPrice, selectedBrands, stockOnly);
  }

  function sortCards() {
    const val = sortSelect.value;
    const cards = getCards();

    cards.sort((a, b) => {
      const pa = parseInt(a.getAttribute("data-price"), 10);
      const pb = parseInt(b.getAttribute("data-price"), 10);
      const ra = parseFloat(a.getAttribute("data-rating"));
      const rb = parseFloat(b.getAttribute("data-rating"));
      const da = new Date(a.getAttribute("data-date"));
      const db = new Date(b.getAttribute("data-date"));

      switch (val) {
        case "price-asc":
          return pa - pb;
        case "price-desc":
          return pb - pa;
        case "newest":
          return db - da;
        case "rating":
          return rb - ra;
        default:
          return 0;
      }
    });

    cards.forEach((card) => grid.appendChild(card));
  }

  /* ── Active Filter Pills ───────────────────── */

  function updateFilterPills(minPrice, maxPrice, brands, stockOnly) {
    activeFiltersEl.innerHTML = "";

    if (minPrice > 0 || maxPrice < 500) {
      addPill(`$${minPrice} – $${maxPrice}`, () => {
        priceMin.value = 0;
        priceMax.value = 500;
        priceSlider.value = 500;
        applyFilters();
      });
    }

    brands.forEach((brand) => {
      addPill(capitalize(brand), () => {
        const cb = sidebar.querySelector(`.check-label input[value="${brand}"]`);
        if (cb) cb.checked = false;
        applyFilters();
      });
    });

    if (ratingFilter > 0) {
      addPill(`${ratingFilter}★ & up`, () => {
        ratingFilter = 0;
        sidebar.querySelectorAll(".star-label").forEach((l) => l.classList.remove("active"));
        applyFilters();
      });
    }

    if (stockOnly) {
      addPill("In Stock", () => {
        stockToggle.setAttribute("aria-checked", "false");
        applyFilters();
      });
    }
  }

  function addPill(text, onRemove) {
    const pill = document.createElement("span");
    pill.className = "filter-pill";
    pill.innerHTML = `${escapeHtml(text)} <button aria-label="Remove">&times;</button>`;
    pill.querySelector("button").addEventListener("click", onRemove);
    activeFiltersEl.appendChild(pill);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ── Pagination ────────────────────────────── */

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

    pagination.querySelectorAll(".page-btn[data-page]").forEach((p) => {
      p.classList.toggle("active", parseInt(p.getAttribute("data-page"), 10) === currentPage);
    });

    pagination.querySelector(".prev").disabled = currentPage <= 1;
    pagination.querySelector(".next").disabled = currentPage >= 4;

    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ── Render Stars ──────────────────────────── */

  document.querySelectorAll(".stars-display").forEach((el) => {
    const rating = parseFloat(el.getAttribute("data-rating"));
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    el.textContent =
      "\u2605".repeat(full) + (half ? "\u2605" : "") + "\u2606".repeat(empty - (half ? 0 : 0));
    /* Re-render with proper full/empty */
    let stars = "";
    for (let i = 0; i < full; i++) stars += "\u2605";
    for (let i = 0; i < 5 - full; i++) stars += "\u2606";
    el.textContent = stars;
  });

  /* ── Init ──────────────────────────────────── */
  applyFilters();
})();
