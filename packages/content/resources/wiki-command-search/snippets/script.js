(function () {
  "use strict";

  /* ───────────────────────── Icons ───────────────────────── */
  var ICONS = {
    page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 21V5a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M9 13h6M9 17h4"/></svg>',
    api: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 9-3 3 3 3M16 9l3 3-3 3M13 6l-2 12"/></svg>',
    recent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    action: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m13 2-9 11h7l-1 9 9-11h-7z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>'
  };

  /* ───────────────────────── Searchable index ───────────────────────── */
  var INDEX = [
    { group: "Pages", icon: "page", title: "The Aurora DB storage engine", sub: "Core concepts", meta: "Guide" },
    { group: "Pages", icon: "page", title: "Write path & write-ahead log", sub: "Core concepts", meta: "Guide" },
    { group: "Pages", icon: "page", title: "Leveled compaction", sub: "Operations", meta: "Guide" },
    { group: "Pages", icon: "page", title: "Replication & failover", sub: "Core concepts", meta: "Guide" },
    { group: "Pages", icon: "page", title: "Consistency model", sub: "Core concepts", meta: "Guide" },
    { group: "Pages", icon: "page", title: "Backups and point-in-time restore", sub: "Operations", meta: "Guide" },
    { group: "Pages", icon: "page", title: "Quickstart in five minutes", sub: "Getting started", meta: "Guide" },
    { group: "Pages", icon: "page", title: "Monitoring & alerting", sub: "Operations", meta: "Guide" },

    { group: "API", icon: "api", title: "client.connect(uri, opts)", sub: "Connection pool", meta: "Method" },
    { group: "API", icon: "api", title: "table.insert(rows)", sub: "Write operations", meta: "Method" },
    { group: "API", icon: "api", title: "query.where(predicate)", sub: "Query builder", meta: "Method" },
    { group: "API", icon: "api", title: "engine.compact(level)", sub: "Maintenance", meta: "Method" },
    { group: "API", icon: "api", title: "snapshot.restore(id)", sub: "Backups", meta: "Method" },

    { group: "Actions", icon: "action", title: "Toggle dark mode", sub: "Appearance", meta: "Action", action: true },
    { group: "Actions", icon: "action", title: "Copy current page URL", sub: "Share", meta: "Action", action: true },
    { group: "Actions", icon: "action", title: "Open the changelog", sub: "Releases", meta: "Action", action: true },
    { group: "Actions", icon: "action", title: "Contact support", sub: "Help", meta: "Action", action: true }
  ];

  var GROUP_ORDER = ["Recent", "Pages", "API", "Actions"];
  var RECENT_KEY = "aurora-cmdk-recent";
  var MAX_RECENT = 4;

  /* ───────────────────────── DOM refs ───────────────────────── */
  var backdrop = document.getElementById("paletteBackdrop");
  var palette = document.getElementById("palette");
  var input = document.getElementById("paletteInput");
  var resultsEl = document.getElementById("paletteResults");
  var trigger = document.getElementById("searchTrigger");
  var toastEl = document.getElementById("toast");

  var flat = [];        // flattened active result list (in DOM order)
  var activeIndex = -1; // index into flat
  var lastFocused = null;

  /* ───────────────────────── Recent searches memory ───────────────────────── */
  function loadRecent() {
    try {
      var raw = sessionStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveRecent(item) {
    var recent = loadRecent().filter(function (r) { return r.title !== item.title; });
    recent.unshift({ title: item.title, sub: item.sub, icon: item.icon, meta: item.meta, action: !!item.action });
    recent = recent.slice(0, MAX_RECENT);
    try { sessionStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch (e) {}
  }

  /* ───────────────────────── Fuzzy-ish scoring ───────────────────────── */
  // Subsequence match; rewards contiguous runs and word-start hits.
  function fuzzy(query, text) {
    query = query.toLowerCase();
    var lower = text.toLowerCase();
    if (!query) return { score: 0, hits: [] };
    var qi = 0, score = 0, run = 0, hits = [];
    for (var i = 0; i < lower.length && qi < query.length; i++) {
      if (lower[i] === query[qi]) {
        hits.push(i);
        run++;
        score += run * 3;                       // contiguous run bonus
        if (i === 0 || lower[i - 1] === " ") score += 8; // word-start bonus
        qi++;
      } else {
        run = 0;
      }
    }
    if (qi < query.length) return null;          // not all chars matched
    if (lower.indexOf(query) !== -1) score += 30; // exact substring bonus
    return { score: score, hits: hits };
  }

  function highlight(text, hits) {
    if (!hits || !hits.length) return escapeHtml(text);
    var set = {};
    hits.forEach(function (h) { set[h] = true; });
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var ch = escapeHtml(text[i]);
      out += set[i] ? "<mark>" + ch + "</mark>" : ch;
    }
    return out;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ───────────────────────── Rendering ───────────────────────── */
  function buildList(query) {
    var groups = {};

    if (!query) {
      // Empty state: show Recent (if any) then default Pages/API/Actions.
      var recent = loadRecent();
      if (recent.length) {
        groups.Recent = recent.map(function (r) {
          return { item: { group: "Recent", icon: r.icon || "recent", title: r.title, sub: r.sub, meta: r.meta, action: r.action }, hits: [] };
        });
      }
      INDEX.forEach(function (item) {
        (groups[item.group] = groups[item.group] || []).push({ item: item, hits: [] });
      });
    } else {
      INDEX.forEach(function (item) {
        var m = fuzzy(query, item.title);
        var subM = fuzzy(query, item.sub);
        if (!m && !subM) return;
        var best = m || { score: 0, hits: [] };
        if (subM && (!m || subM.score > m.score + 6)) best = { score: subM.score - 5, hits: [] };
        (groups[item.group] = groups[item.group] || []).push({ item: item, hits: m ? m.hits : [], score: best.score });
      });
      Object.keys(groups).forEach(function (g) {
        groups[g].sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
      });
    }
    return groups;
  }

  function render(query) {
    var groups = buildList(query);
    resultsEl.innerHTML = "";
    flat = [];

    var any = GROUP_ORDER.some(function (g) { return groups[g] && groups[g].length; });
    if (!any) {
      var empty = document.createElement("div");
      empty.className = "palette-empty";
      empty.innerHTML = "<strong>No matches for &ldquo;" + escapeHtml(query) + "&rdquo;</strong>" +
        "Try a page name, an API method, or an action.";
      resultsEl.appendChild(empty);
      activeIndex = -1;
      input.setAttribute("aria-activedescendant", "");
      return;
    }

    var idCounter = 0;
    GROUP_ORDER.forEach(function (g) {
      var entries = groups[g];
      if (!entries || !entries.length) return;

      var label = document.createElement("div");
      label.className = "result-group-label";
      label.textContent = g;
      label.setAttribute("role", "presentation");
      resultsEl.appendChild(label);

      entries.forEach(function (entry) {
        var item = entry.item;
        var row = document.createElement("div");
        row.className = "result-item";
        row.id = "cmdk-opt-" + (idCounter++);
        row.setAttribute("role", "option");
        row.setAttribute("aria-selected", "false");

        var iconName = item.icon in ICONS ? item.icon : "page";
        row.innerHTML =
          '<span class="result-icon">' + ICONS[iconName] + '</span>' +
          '<span class="result-body">' +
            '<span class="result-title">' + highlight(item.title, entry.hits) + '</span>' +
            '<span class="result-sub">' + escapeHtml(item.sub) + '</span>' +
          '</span>' +
          '<span class="result-meta">' + escapeHtml(item.meta) + '</span>' +
          '<span class="result-arrow">' + ICONS.arrow + '</span>';

        var myIndex = flat.length;
        row.addEventListener("mousemove", function () { setActive(myIndex); });
        row.addEventListener("click", function () { activate(myIndex); });

        resultsEl.appendChild(row);
        flat.push({ el: row, item: item });
      });
    });

    setActive(flat.length ? 0 : -1);
  }

  function setActive(i) {
    if (activeIndex >= 0 && flat[activeIndex]) {
      flat[activeIndex].el.classList.remove("is-active");
      flat[activeIndex].el.setAttribute("aria-selected", "false");
    }
    activeIndex = i;
    if (i >= 0 && flat[i]) {
      var el = flat[i].el;
      el.classList.add("is-active");
      el.setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", el.id);
      el.scrollIntoView({ block: "nearest" });
    } else {
      input.setAttribute("aria-activedescendant", "");
    }
  }

  function move(delta) {
    if (!flat.length) return;
    var next = activeIndex + delta;
    if (next < 0) next = flat.length - 1;        // wrap to bottom
    if (next >= flat.length) next = 0;           // wrap to top
    setActive(next);
  }

  function activate(i) {
    if (i < 0 || !flat[i]) return;
    var item = flat[i].item;
    saveRecent(item);
    closePalette();
    if (item.action) {
      toast("Ran action <span class=\"toast-key\">" + escapeHtml(item.title) + "</span>");
    } else {
      toast("Opening <span class=\"toast-key\">" + escapeHtml(item.title) + "</span>…");
    }
  }

  /* ───────────────────────── Open / close + focus trap ───────────────────────── */
  function openPalette() {
    if (!backdrop.hidden) return;
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    input.value = "";
    render("");
    requestAnimationFrame(function () { input.focus(); });
  }

  function closePalette() {
    if (backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    var focusables = palette.querySelectorAll("input, [tabindex]:not([tabindex='-1'])");
    if (!focusables.length) { e.preventDefault(); return; }
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

  /* ───────────────────────── Toast helper ───────────────────────── */
  var toastTimer = null;
  function toast(html) {
    toastEl.innerHTML = html;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ───────────────────────── Event wiring ───────────────────────── */
  trigger.addEventListener("click", openPalette);

  input.addEventListener("input", function () { render(input.value.trim()); });

  document.addEventListener("keydown", function (e) {
    var meta = e.metaKey || e.ctrlKey;
    if (meta && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      backdrop.hidden ? openPalette() : closePalette();
      return;
    }
    // "/" opens search when not typing in a field
    if (e.key === "/" && backdrop.hidden) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        openPalette();
      }
    }
  });

  // Palette-scoped keys
  backdrop.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); closePalette(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); move(-1); return; }
    if (e.key === "Enter") { e.preventDefault(); activate(activeIndex); return; }
    if (e.key === "Home") { e.preventDefault(); setActive(0); return; }
    if (e.key === "End") { e.preventDefault(); setActive(flat.length - 1); return; }
    trapFocus(e);
  });

  backdrop.addEventListener("mousedown", function (e) {
    if (e.target === backdrop) closePalette();
  });

  /* ───────────────────────── Sidebar drawer (mobile) ───────────────────────── */
  var navToggle = document.getElementById("navToggle");
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("scrim");

  function toggleNav(open) {
    var isOpen = typeof open === "boolean" ? open : !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", isOpen);
    scrim.hidden = !isOpen;
    navToggle.setAttribute("aria-expanded", String(isOpen));
  }
  navToggle.addEventListener("click", function () { toggleNav(); });
  scrim.addEventListener("click", function () { toggleNav(false); });
  sidebar.addEventListener("click", function (e) {
    if (e.target.closest("a")) toggleNav(false);
  });
})();
