/* MakerBench — Projects Browse Grid
   Vanilla JS: live search, category pills, difficulty/time filters,
   sorting, staggered card animation, heart toggles, empty state. */

(function () {
  "use strict";

  /* ---------------- Data (fictional) ---------------- */

  const CATEGORIES = {
    electronics: { label: "Electronics", color: "var(--c-electronics)" },
    woodworking: { label: "Woodworking", color: "var(--c-woodworking)" },
    printing: { label: "3D Printing", color: "var(--c-printing)" },
    crafts: { label: "Crafts", color: "var(--c-crafts)" },
    home: { label: "Home", color: "var(--c-home)" },
  };

  // timeBucket: quick (<2h) | medium (2-8h) | long (weekend+)
  const PROJECTS = [
    { id: "EL-101", title: "Solder-Fume Extractor Mk.II", author: "Priya Deshmukh", cat: "electronics", difficulty: "intermediate", timeBucket: "medium", timeLabel: "4 h", hours: 4, favs: 312, added: 20260722, art: "circuit" },
    { id: "WD-204", title: "Dovetail Spice Rack", author: "Marcus Vane", cat: "woodworking", difficulty: "beginner", timeBucket: "medium", timeLabel: "3 h", hours: 3, favs: 187, added: 20260718, art: "saw" },
    { id: "3D-330", title: "Parametric Cable Combs", author: "Iris Kowalczyk", cat: "printing", difficulty: "beginner", timeBucket: "quick", timeLabel: "45 min", hours: 0.75, favs: 421, added: 20260726, art: "printer" },
    { id: "CR-118", title: "Kraft-Paper Star Lanterns", author: "June Okafor", cat: "crafts", difficulty: "beginner", timeBucket: "quick", timeLabel: "90 min", hours: 1.5, favs: 264, added: 20260711, art: "scissors" },
    { id: "HM-042", title: "Squeak-Free Door Hinge Fix", author: "Tomás Ferreyra", cat: "home", difficulty: "beginner", timeBucket: "quick", timeLabel: "30 min", hours: 0.5, favs: 98, added: 20260702, art: "house" },
    { id: "EL-137", title: "ESP32 Weather Kiosk", author: "Priya Deshmukh", cat: "electronics", difficulty: "advanced", timeBucket: "long", timeLabel: "2 days", hours: 16, favs: 538, added: 20260714, art: "circuit" },
    { id: "WD-219", title: "Workshop French Cleat Wall", author: "Hana Brandt", cat: "woodworking", difficulty: "intermediate", timeBucket: "long", timeLabel: "Weekend", hours: 12, favs: 610, added: 20260619, art: "saw" },
    { id: "3D-355", title: "Snap-Fit Drawer Organizers", author: "Iris Kowalczyk", cat: "printing", difficulty: "intermediate", timeBucket: "medium", timeLabel: "6 h", hours: 6, favs: 233, added: 20260724, art: "printer" },
    { id: "CR-131", title: "Sashiko-Stitch Tool Roll", author: "June Okafor", cat: "crafts", difficulty: "intermediate", timeBucket: "medium", timeLabel: "5 h", hours: 5, favs: 176, added: 20260707, art: "scissors" },
    { id: "HM-057", title: "Under-Sink Leak Sensor Mount", author: "Tomás Ferreyra", cat: "home", difficulty: "intermediate", timeBucket: "quick", timeLabel: "1 h", hours: 1, favs: 142, added: 20260728, art: "house" },
    { id: "EL-149", title: "Bench PSU From ATX Supply", author: "Marcus Vane", cat: "electronics", difficulty: "advanced", timeBucket: "medium", timeLabel: "7 h", hours: 7, favs: 389, added: 20260625, art: "circuit" },
    { id: "WD-233", title: "Hand-Cut Bandsaw Boxes", author: "Hana Brandt", cat: "woodworking", difficulty: "advanced", timeBucket: "long", timeLabel: "3 days", hours: 20, favs: 295, added: 20260601, art: "saw" },
    { id: "3D-368", title: "Print-in-Place Vise Clamp", author: "Sana Al-Rashid", cat: "printing", difficulty: "advanced", timeBucket: "medium", timeLabel: "8 h", hours: 8, favs: 471, added: 20260721, art: "printer" },
    { id: "HM-063", title: "Blueprint Grid Accent Wall", author: "Sana Al-Rashid", cat: "home", difficulty: "beginner", timeBucket: "long", timeLabel: "Weekend", hours: 10, favs: 205, added: 20260716, art: "house" },
  ];

  /* ---------------- Thumbnail art (CSS/SVG illustrations) ---------------- */

  const ART = {
    circuit: `
      <svg viewBox="0 0 140 90" width="140" height="90" fill="none" stroke-linecap="round" aria-hidden="true">
        <rect x="38" y="22" width="64" height="46" rx="6" fill="#16385f" stroke="#8cb4dc" stroke-width="2"/>
        <rect x="54" y="36" width="32" height="18" rx="3" fill="#0a1e36" stroke="#ff6b35" stroke-width="2"/>
        <circle cx="48" cy="30" r="2.5" fill="#ff6b35"/>
        <circle cx="92" cy="60" r="2.5" fill="#2f9e6f"/>
        <path d="M38 32H18M38 45H12M38 58H20M102 32h20M102 45h26M102 58h18" stroke="#8cb4dc" stroke-width="2" stroke-dasharray="1 5"/>
        <path d="M60 22V10M70 22V14M80 22V10M60 68v12M70 68v8M80 68v12" stroke="#8cb4dc" stroke-width="2"/>
      </svg>`,
    saw: `
      <svg viewBox="0 0 140 90" width="140" height="90" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="16" y="52" width="108" height="16" rx="3" fill="#a0672f" stroke="#d9c7a7" stroke-width="2"/>
        <path d="M16 60h108" stroke="#7d4e21" stroke-width="1.5" stroke-dasharray="8 6"/>
        <path d="M34 52 62 20h34l10 12-14 20" fill="#d9c7a7" stroke="#efe6d4" stroke-width="2"/>
        <path d="M34 52h58l-4 6H40z" fill="#efe6d4"/>
        <path d="M40 52l4 6M50 52l4 6M60 52l4 6M70 52l4 6M80 52l4 6" stroke="#a0672f" stroke-width="2"/>
        <rect x="96" y="18" width="18" height="12" rx="4" fill="#ff6b35" stroke="#e0521f" stroke-width="2"/>
      </svg>`,
    printer: `
      <svg viewBox="0 0 140 90" width="140" height="90" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M42 14h56M42 14v56M98 14v56M34 70h72" stroke="#8cb4dc" stroke-width="3"/>
        <rect x="52" y="26" width="36" height="10" rx="2" fill="#16385f" stroke="#8cb4dc" stroke-width="2"/>
        <path d="M70 36v8" stroke="#ff6b35" stroke-width="3"/>
        <path d="M58 70 70 48l12 22z" fill="#ff6b35" stroke="#e0521f" stroke-width="2"/>
        <path d="M62 63h16" stroke="#ffe3d6" stroke-width="1.5"/>
        <path d="M64 58h12" stroke="#ffe3d6" stroke-width="1.5"/>
      </svg>`,
    scissors: `
      <svg viewBox="0 0 140 90" width="140" height="90" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 45h100" stroke="#ff6b35" stroke-width="2" stroke-dasharray="7 6"/>
        <circle cx="52" cy="30" r="9" stroke="#d9c7a7" stroke-width="3"/>
        <circle cx="52" cy="60" r="9" stroke="#d9c7a7" stroke-width="3"/>
        <path d="M59 36 108 58M59 54 108 32" stroke="#efe6d4" stroke-width="4"/>
        <circle cx="76" cy="45" r="3" fill="#ff6b35"/>
        <path d="M112 28l8-4M112 62l8 4" stroke="#8cb4dc" stroke-width="2"/>
      </svg>`,
    house: `
      <svg viewBox="0 0 140 90" width="140" height="90" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M40 44 70 18l30 26" stroke="#efe6d4" stroke-width="3.5"/>
        <path d="M48 42v30h44V42" stroke="#d9c7a7" stroke-width="3"/>
        <rect x="63" y="52" width="14" height="20" fill="#ff6b35" stroke="#e0521f" stroke-width="2"/>
        <rect x="52" y="46" width="9" height="9" stroke="#8cb4dc" stroke-width="2"/>
        <rect x="79" y="46" width="9" height="9" stroke="#8cb4dc" stroke-width="2"/>
        <path d="M30 72h80" stroke="#8cb4dc" stroke-width="2" stroke-dasharray="2 5"/>
      </svg>`,
  };

  /* ---------------- State ---------------- */

  const state = {
    search: "",
    cat: "all",
    difficulty: "all",
    time: "all",
    sort: "popular",
    favorites: new Set(),
  };

  /* ---------------- DOM refs ---------------- */

  const grid = document.getElementById("grid");
  const emptyEl = document.getElementById("empty");
  const countEl = document.getElementById("results-count");
  const clearBtn = document.getElementById("clear-filters");
  const searchInput = document.getElementById("search");
  const difficultySel = document.getElementById("difficulty");
  const timeSel = document.getElementById("time");
  const sortSel = document.getElementById("sort");
  const pills = Array.from(document.querySelectorAll(".pill"));
  const toastEl = document.getElementById("toast");

  /* ---------------- Toast helper ---------------- */

  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ---------------- Rendering ---------------- */

  function initials(name) {
    return name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function formatFavs(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
  }

  function cardHTML(p, index) {
    const cat = CATEGORIES[p.cat];
    const isFav = state.favorites.has(p.id);
    const favCount = p.favs + (isFav ? 1 : 0);
    const diffLabel = p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1);
    return `
      <article class="card is-in" style="--accent:${cat.color}; --delay:${index * 55}ms" data-id="${p.id}">
        <div class="thumb">
          <span class="thumb-cat">${cat.label}</span>
          ${ART[p.art]}
          <span class="thumb-part mono">PART NO. ${p.id}</span>
          <button class="fav${isFav ? " is-fav" : ""}" type="button"
                  aria-pressed="${isFav}" aria-label="${isFav ? "Remove from" : "Add to"} favorites — ${p.title}">
            <svg class="heart" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20.3 4.9 13a4.6 4.6 0 0 1 0-6.5 4.4 4.4 0 0 1 6.3 0l.8.8.8-.8a4.4 4.4 0 0 1 6.3 0 4.6 4.6 0 0 1 0 6.5z"/>
            </svg>
            <span class="fav-count">${formatFavs(favCount)}</span>
          </button>
        </div>
        <div class="card-body">
          <h2 class="card-title"><a href="#${p.id}" onclick="return false">${p.title}</a></h2>
          <p class="card-author">
            <span class="avatar" aria-hidden="true">${initials(p.author)}</span>
            by ${p.author}
          </p>
          <div class="card-badges">
            <span class="badge badge-${p.difficulty}">${diffLabel.toUpperCase()}</span>
            <span class="badge">⏱ ${p.timeLabel.toUpperCase()}</span>
          </div>
        </div>
      </article>`;
  }

  function applyFilters() {
    const q = state.search.trim().toLowerCase();
    let list = PROJECTS.filter((p) => {
      if (state.cat !== "all" && p.cat !== state.cat) return false;
      if (state.difficulty !== "all" && p.difficulty !== state.difficulty) return false;
      if (state.time !== "all" && p.timeBucket !== state.time) return false;
      if (q) {
        const hay = (p.title + " " + p.author + " " + CATEGORIES[p.cat].label + " " + p.id).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    switch (state.sort) {
      case "newest":
        list.sort((a, b) => b.added - a.added);
        break;
      case "quickest":
        list.sort((a, b) => a.hours - b.hours);
        break;
      default: // popular
        list.sort((a, b) => (b.favs + (state.favorites.has(b.id) ? 1 : 0)) - (a.favs + (state.favorites.has(a.id) ? 1 : 0)));
    }
    return list;
  }

  function hasActiveFilters() {
    return state.search.trim() !== "" || state.cat !== "all" || state.difficulty !== "all" || state.time !== "all";
  }

  function render() {
    const list = applyFilters();

    grid.innerHTML = list.map(cardHTML).join("");
    emptyEl.hidden = list.length !== 0;
    grid.hidden = list.length === 0;

    countEl.innerHTML = `Showing <strong>${list.length}</strong> of <strong>${PROJECTS.length}</strong> projects`;
    clearBtn.hidden = !hasActiveFilters();
  }

  /* ---------------- Events ---------------- */

  // Live search (debounced a touch so the stagger doesn't thrash)
  let searchTimer = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = searchInput.value;
      render();
    }, 140);
  });

  // "/" focuses search
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput && !/^(input|select|textarea)$/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Category pills
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => {
        p.classList.toggle("is-active", p === pill);
        p.setAttribute("aria-selected", p === pill ? "true" : "false");
      });
      state.cat = pill.dataset.cat;
      render();
    });
  });

  // Selects
  difficultySel.addEventListener("change", () => { state.difficulty = difficultySel.value; render(); });
  timeSel.addEventListener("change", () => { state.time = timeSel.value; render(); });
  sortSel.addEventListener("change", () => {
    state.sort = sortSel.value;
    render();
    const label = sortSel.options[sortSel.selectedIndex].textContent;
    toast("SORTED BY: " + label.toUpperCase());
  });

  // Heart toggle (event delegation — cards are re-rendered on filter)
  grid.addEventListener("click", (e) => {
    const favBtn = e.target.closest(".fav");
    if (!favBtn) return;
    const card = favBtn.closest(".card");
    const id = card.dataset.id;
    const project = PROJECTS.find((p) => p.id === id);

    const nowFav = !state.favorites.has(id);
    if (nowFav) state.favorites.add(id);
    else state.favorites.delete(id);

    favBtn.classList.toggle("is-fav", nowFav);
    favBtn.setAttribute("aria-pressed", String(nowFav));
    favBtn.setAttribute("aria-label", (nowFav ? "Remove from" : "Add to") + " favorites — " + project.title);
    favBtn.querySelector(".fav-count").textContent = formatFavs(project.favs + (nowFav ? 1 : 0));

    toast(nowFav ? "★ SAVED: " + project.id : "REMOVED: " + project.id);
  });

  // Clear / reset
  function resetFilters() {
    state.search = "";
    state.cat = "all";
    state.difficulty = "all";
    state.time = "all";
    searchInput.value = "";
    difficultySel.value = "all";
    timeSel.value = "all";
    pills.forEach((p) => {
      const active = p.dataset.cat === "all";
      p.classList.toggle("is-active", active);
      p.setAttribute("aria-selected", String(active));
    });
    render();
    toast("FILTERS CLEARED — FULL CATALOG");
  }

  clearBtn.addEventListener("click", resetFilters);
  document.getElementById("empty-reset").addEventListener("click", resetFilters);

  /* ---------------- Init ---------------- */

  render();
})();
