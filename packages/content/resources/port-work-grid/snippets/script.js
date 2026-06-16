(function () {
  "use strict";

  /* ---------- Data (fictional but believable) ---------- */
  var PROJECTS = [
    {
      title: "Meridian Banking App",
      cat: "product",
      year: 2026,
      role: "Lead product designer",
      grad: "linear-gradient(135deg,#4f46e5,#7c75f5 55%,#a8a2ff)",
      glyph: "M",
      tags: ["iOS", "Design system", "Onboarding"],
      desc: "A complete rebuild of Meridian's mobile banking flow — a calmer dashboard, predictive transfers, and an onboarding that lifted activation by 23%.",
    },
    {
      title: "Harvest Logistics",
      cat: "product",
      year: 2025,
      role: "Senior designer",
      grad: "linear-gradient(135deg,#0f9d6b,#34c38f 60%,#a7f3d0)",
      glyph: "H",
      tags: ["B2B", "Dashboards", "Maps"],
      desc: "Routing and dispatch tooling for a regional produce network. Replaced spreadsheets with a live map and shaved 40 minutes off the average daily plan.",
    },
    {
      title: "Studio Lumen Site",
      cat: "web",
      year: 2026,
      role: "Designer & front-end",
      grad: "linear-gradient(135deg,#f97316,#fb923c 55%,#fed7aa)",
      glyph: "L",
      tags: ["Marketing", "CMS", "Motion"],
      desc: "A warm, editorial marketing site for an architecture studio. Built on a flexible CMS so the team can publish new projects without a developer.",
    },
    {
      title: "Northwind Docs",
      cat: "web",
      year: 2024,
      role: "Product designer",
      grad: "linear-gradient(135deg,#0ea5e9,#38bdf8 60%,#bae6fd)",
      glyph: "N",
      tags: ["Docs", "Search", "DX"],
      desc: "Developer documentation with instant search and runnable examples. Support tickets about setup dropped by a third in the first quarter.",
    },
    {
      title: "Bloom Coffee Identity",
      cat: "branding",
      year: 2025,
      role: "Brand designer",
      grad: "linear-gradient(135deg,#db2777,#ec4899 55%,#fbcfe8)",
      glyph: "B",
      tags: ["Logo", "Packaging", "Type"],
      desc: "A full identity for a neighbourhood roastery — wordmark, bag system, and a flexible type pairing that scales from labels to storefront.",
    },
    {
      title: "Atlas Conference",
      cat: "branding",
      year: 2023,
      role: "Art director",
      grad: "linear-gradient(135deg,#7c3aed,#a855f7 55%,#e9d5ff)",
      glyph: "A",
      tags: ["Event", "System", "Signage"],
      desc: "Visual identity for a 2,000-person design conference: badges, stage graphics, and a generative pattern that made every track feel distinct.",
    },
    {
      title: "Pulse Onboarding Reel",
      cat: "motion",
      year: 2026,
      role: "Motion designer",
      grad: "linear-gradient(135deg,#0891b2,#06b6d4 55%,#a5f3fc)",
      glyph: "P",
      tags: ["Animation", "Product", "UI"],
      desc: "A 40-second product walkthrough built from real UI, animated to make a dense feature set feel friendly. Used across web, sales, and app stores.",
    },
    {
      title: "Drift Loading States",
      cat: "motion",
      year: 2024,
      role: "Interaction designer",
      grad: "linear-gradient(135deg,#e11d48,#f43f5e 55%,#fecdd3)",
      glyph: "D",
      tags: ["Micro-interaction", "Prototype"],
      desc: "A library of playful loading and transition states for a music app — each one prototyped, timed, and handed off as production-ready specs.",
    },
    {
      title: "Field Notes CRM",
      cat: "product",
      year: 2023,
      role: "Product designer",
      grad: "linear-gradient(135deg,#475569,#64748b 55%,#cbd5e1)",
      glyph: "F",
      tags: ["CRM", "Tables", "Filters"],
      desc: "A lightweight CRM for field sales teams. Designed an offline-first record view and a fast filter model that survives a flaky signal.",
    },
    {
      title: "Verde Reports",
      cat: "web",
      year: 2025,
      role: "Designer",
      grad: "linear-gradient(135deg,#65a30d,#84cc16 55%,#d9f99d)",
      glyph: "V",
      tags: ["Data viz", "Print", "Web"],
      desc: "Annual sustainability reports that read well on screen and in print. A modular chart kit kept twelve markets visually consistent.",
    },
    {
      title: "Cargo Brandbook",
      cat: "branding",
      year: 2026,
      role: "Brand & systems",
      grad: "linear-gradient(135deg,#ca8a04,#eab308 55%,#fef08a)",
      glyph: "C",
      tags: ["Guidelines", "Tokens"],
      desc: "A living brand system delivered as a website and design tokens, so engineering and design pull from the same source of truth.",
    },
    {
      title: "Echo Title Sequence",
      cat: "motion",
      year: 2025,
      role: "Motion lead",
      grad: "linear-gradient(135deg,#1e293b,#334155 55%,#94a3b8)",
      glyph: "E",
      tags: ["Title", "Type", "Sound"],
      desc: "An opening title sequence for a documentary series — kinetic typography cut to an original score, balancing tension and clarity.",
    },
  ];

  var CAT_LABEL = {
    all: "All",
    product: "Product",
    web: "Web",
    branding: "Branding",
    motion: "Motion",
  };

  /* ---------- DOM refs ---------- */
  var grid = document.getElementById("grid");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var sortSel = document.getElementById("sort");
  var resultCount = document.getElementById("resultCount");
  var emptyEl = document.getElementById("empty");
  var resetEmpty = document.getElementById("resetEmpty");
  var toastEl = document.getElementById("toast");

  var ql = document.getElementById("quicklook");
  var qlPanel = ql.querySelector(".quicklook__panel");
  var qlThumb = document.getElementById("qlThumb");
  var qlCat = document.getElementById("qlCat");
  var qlTitle = document.getElementById("qlTitle");
  var qlYear = document.getElementById("qlYear");
  var qlDesc = document.getElementById("qlDesc");
  var qlTags = document.getElementById("qlTags");
  var qlLink = document.getElementById("qlLink");

  var state = { filter: "all", sort: "recent" };
  var lastFocused = null;
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Toast helper ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ---------- Build a tile ---------- */
  function buildTile(p, index) {
    var li = document.createElement("li");

    var btn = document.createElement("button");
    btn.className = "tile";
    btn.type = "button";
    btn.dataset.cat = p.cat;
    btn.dataset.index = String(index);
    btn.setAttribute(
      "aria-label",
      p.title + " — " + CAT_LABEL[p.cat] + ", " + p.year + ". Open quick look."
    );

    var media = document.createElement("div");
    media.className = "tile__media";

    var thumb = document.createElement("div");
    thumb.className = "tile__thumb";
    thumb.style.background = p.grad;

    var cat = document.createElement("span");
    cat.className = "tile__cat";
    cat.textContent = CAT_LABEL[p.cat];

    var glyph = document.createElement("span");
    glyph.className = "tile__glyph";
    glyph.textContent = p.glyph;

    media.appendChild(thumb);
    media.appendChild(cat);
    media.appendChild(glyph);

    var body = document.createElement("div");
    body.className = "tile__body";

    var head = document.createElement("div");
    head.className = "tile__head";

    var title = document.createElement("h3");
    title.className = "tile__title";
    title.textContent = p.title;

    var year = document.createElement("span");
    year.className = "tile__year";
    year.textContent = p.year;

    head.appendChild(title);
    head.appendChild(year);

    var tags = document.createElement("ul");
    tags.className = "tile__tags";
    p.tags.forEach(function (t) {
      var tli = document.createElement("li");
      tli.textContent = t;
      tags.appendChild(tli);
    });

    body.appendChild(head);
    body.appendChild(tags);

    btn.appendChild(media);
    btn.appendChild(body);
    li.appendChild(btn);

    btn.addEventListener("click", function () {
      openQuickLook(p, btn);
    });

    return li;
  }

  /* ---------- Sorting ---------- */
  function sortedIndices() {
    var idx = PROJECTS.map(function (_, i) {
      return i;
    });
    if (state.sort === "az") {
      idx.sort(function (a, b) {
        return PROJECTS[a].title.localeCompare(PROJECTS[b].title);
      });
    } else {
      idx.sort(function (a, b) {
        if (PROJECTS[b].year !== PROJECTS[a].year) {
          return PROJECTS[b].year - PROJECTS[a].year;
        }
        return PROJECTS[a].title.localeCompare(PROJECTS[b].title);
      });
    }
    return idx;
  }

  /* ---------- FLIP-style render ---------- */
  function render() {
    // First: record current positions of existing tiles.
    var existing = Array.prototype.slice.call(grid.children);
    var firstRects = {};
    existing.forEach(function (li) {
      var key = li.firstChild.dataset.index;
      firstRects[key] = li.getBoundingClientRect();
    });

    // Determine the ordered, filtered list.
    var order = sortedIndices().filter(function (i) {
      return state.filter === "all" || PROJECTS[i].cat === state.filter;
    });

    // Build a lookup of already-rendered <li> by index.
    var byIndex = {};
    existing.forEach(function (li) {
      byIndex[li.firstChild.dataset.index] = li;
    });

    var fragment = document.createDocumentFragment();
    var entering = [];
    order.forEach(function (i) {
      var li = byIndex[String(i)];
      if (!li) {
        li = buildTile(PROJECTS[i], i);
        entering.push(li);
      }
      fragment.appendChild(li);
    });

    // Tiles that exist now but are not in the new order = leaving.
    existing.forEach(function (li) {
      if (order.indexOf(Number(li.firstChild.dataset.index)) === -1) {
        li.remove();
      }
    });

    grid.appendChild(fragment);

    // Last + Invert + Play for moved tiles.
    if (!reduceMotion) {
      Array.prototype.slice.call(grid.children).forEach(function (li) {
        var key = li.firstChild.dataset.index;
        var prev = firstRects[key];
        if (!prev) return;
        var now = li.getBoundingClientRect();
        var dx = prev.left - now.left;
        var dy = prev.top - now.top;
        if (dx === 0 && dy === 0) return;
        li.firstChild.style.transition = "none";
        li.firstChild.style.transform =
          "translate(" + dx + "px," + dy + "px)";
        requestAnimationFrame(function () {
          li.firstChild.style.transition = "";
          li.firstChild.style.transform = "";
        });
      });

      // Animate newly entering tiles.
      entering.forEach(function (li, n) {
        var t = li.firstChild;
        t.classList.add("flip-enter");
        requestAnimationFrame(function () {
          setTimeout(function () {
            t.classList.remove("flip-enter");
          }, n * 35);
        });
      });
    }

    // Result count + empty state.
    var n = order.length;
    resultCount.textContent = String(n);
    document.querySelector(".result").style.display = n ? "" : "none";
    if (n === 0) {
      grid.hidden = true;
      emptyEl.hidden = false;
    } else {
      grid.hidden = false;
      emptyEl.hidden = true;
    }
  }

  /* ---------- Counts per category ---------- */
  function paintCounts() {
    var counts = { all: PROJECTS.length };
    PROJECTS.forEach(function (p) {
      counts[p.cat] = (counts[p.cat] || 0) + 1;
    });
    document.querySelectorAll(".chip__count").forEach(function (el) {
      var key = el.getAttribute("data-count");
      el.textContent = String(counts[key] || 0);
    });
  }

  /* ---------- Filter chips ---------- */
  function setFilter(value) {
    state.filter = value;
    chips.forEach(function (c) {
      var on = c.dataset.filter === value;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    render();
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      setFilter(c.dataset.filter);
    });
  });

  sortSel.addEventListener("change", function () {
    state.sort = sortSel.value;
    render();
  });

  resetEmpty.addEventListener("click", function () {
    setFilter("all");
    toast("Showing all projects");
  });

  /* ---------- Quick look ---------- */
  function openQuickLook(p, sourceBtn) {
    lastFocused = sourceBtn || document.activeElement;
    qlThumb.style.background = p.grad;
    qlCat.textContent = CAT_LABEL[p.cat];
    qlTitle.textContent = p.title;
    qlYear.textContent = p.year + " · " + p.role;
    qlDesc.textContent = p.desc;
    qlTags.innerHTML = "";
    p.tags.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      qlTags.appendChild(li);
    });
    ql.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      qlPanel.focus();
    });
  }

  function closeQuickLook() {
    if (ql.hidden) return;
    ql.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  ql.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeQuickLook();
  });

  qlLink.addEventListener("click", function (e) {
    e.preventDefault();
    toast("Case study is illustrative in this demo");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeQuickLook();
    // Simple focus trap within the open dialog.
    if (e.key === "Tab" && !ql.hidden) {
      var focusables = ql.querySelectorAll(
        'button, [href], select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------- Init ---------- */
  paintCounts();
  render();
})();
