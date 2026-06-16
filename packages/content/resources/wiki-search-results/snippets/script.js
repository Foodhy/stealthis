(function () {
  "use strict";

  // ---- Fictional knowledge-base corpus ----
  const NOW = new Date("2026-06-08T00:00:00Z");
  const DAY = 86400000;

  const RESULTS = [
    {
      type: "Doc", section: "Aurora DB",
      title: "Diagnosing and reducing replication lag",
      crumb: ["Aurora DB", "Operations", "Replication"],
      path: "/aurora-db/ops/replication-lag",
      snippet: "Replication lag is the delay between a write committing on the primary and the same change becoming visible on a replica. Aurora DB exposes lag through the replica_lag_ms gauge; sustained lag above 250 ms usually points at long-running transactions, hot partitions, or a saturated apply thread.",
      updated: 6,
    },
    {
      type: "Article", section: "Aurora DB",
      title: "How the Aurora DB replication pipeline works",
      crumb: ["Aurora DB", "Internals"],
      path: "/aurora-db/internals/replication-pipeline",
      snippet: "Every commit on the primary is appended to a durable log, fanned out to replicas, and applied by a dedicated worker. Understanding where lag accumulates — the shipping queue, the network hop, or the apply stage — is the first step in tuning a replica fleet for read-after-write consistency.",
      updated: 41,
    },
    {
      type: "API", section: "Aurora DB",
      title: "GET /v2/replicas/{id}/lag",
      crumb: ["Aurora DB", "API reference", "Replicas"],
      path: "/aurora-db/api/replicas-lag",
      snippet: "Returns the current replication lag for a single replica in milliseconds, along with the last applied log sequence number. Poll this endpoint to drive autoscaling and to gate traffic away from replicas whose lag exceeds your freshness budget.",
      updated: 19,
    },
    {
      type: "Tutorial", section: "Aurora DB",
      title: "Build a lag-aware read router in 20 minutes",
      crumb: ["Aurora DB", "Tutorials"],
      path: "/aurora-db/tutorials/lag-aware-router",
      snippet: "In this tutorial you wire a small proxy that reads each replica's lag, routes fresh-read requests to the primary, and sends everything else to the least-lagged replica. By the end you will have a working router that keeps tail replication lag inside a 100 ms service-level objective.",
      updated: 73,
    },
    {
      type: "Doc", section: "Project Nimbus",
      title: "Configuring write-ahead buffering for low lag",
      crumb: ["Project Nimbus", "Storage", "Tuning"],
      path: "/nimbus/storage/wal-buffering",
      snippet: "Project Nimbus batches writes into a configurable buffer before flushing to the shared log. A larger buffer raises throughput but can increase replication lag during bursts. This page covers the buffer.flush_interval and buffer.max_bytes knobs and how to balance them.",
      updated: 12,
    },
    {
      type: "Article", section: "Project Nimbus",
      title: "Capacity planning for the Nimbus shared log",
      crumb: ["Project Nimbus", "Operations"],
      path: "/nimbus/ops/capacity-planning",
      snippet: "The shared log is the backbone of Project Nimbus. When ingest approaches the log's sustained bandwidth, apply threads fall behind and lag grows non-linearly. We walk through estimating headroom, reading the saturation dashboards, and scaling shards before they tip over.",
      updated: 128,
    },
    {
      type: "API", section: "Project Nimbus",
      title: "POST /v1/streams/{name}/checkpoint",
      crumb: ["Project Nimbus", "API reference", "Streams"],
      path: "/nimbus/api/stream-checkpoint",
      snippet: "Commits a consumer checkpoint so that a restarted reader resumes without replaying the full stream. Frequent checkpoints reduce recovery time but add write pressure that can contribute to replication lag on busy partitions.",
      updated: 205,
    },
    {
      type: "Tutorial", section: "Verdant Mesh",
      title: "Federating two regions across the Verdant Mesh",
      crumb: ["Verdant Mesh", "Tutorials", "Multi-region"],
      path: "/verdant-mesh/tutorials/federate-regions",
      snippet: "The Verdant Mesh links regional clusters over an encrypted overlay. Cross-region replication inevitably carries lag bounded by the speed of light, so this tutorial shows how to mark a region as eventually consistent and surface staleness to the application layer.",
      updated: 34,
    },
    {
      type: "Article", section: "Verdant Mesh",
      title: "Consistency models in the Verdant Empire",
      crumb: ["Verdant Mesh", "Concepts"],
      path: "/verdant-mesh/concepts/consistency-models",
      snippet: "From strict serializability to bounded staleness, the Verdant Empire's services choose a consistency model per workload. This reference explains how each model trades latency for freshness and where replication lag becomes observable to end users.",
      updated: 96,
    },
    {
      type: "Doc", section: "Verdant Mesh",
      title: "Health checks and lag-based failover",
      crumb: ["Verdant Mesh", "Operations", "Reliability"],
      path: "/verdant-mesh/ops/lag-failover",
      snippet: "Verdant Mesh promotes a standby when the active node's replication lag crosses a threshold for a sustained window. Tune the failover.lag_ceiling and the dwell timer so transient spikes don't trigger needless promotions.",
      updated: 3,
    },
    {
      type: "Doc", section: "Platform Ops",
      title: "Alerting on replication lag with the Ops console",
      crumb: ["Platform Ops", "Observability", "Alerts"],
      path: "/platform-ops/observability/lag-alerts",
      snippet: "Define a multi-window alert that fires when replication lag stays above your objective. The Ops console ships a starter rule that pages on a fast burn and opens a ticket on a slow burn, so you catch both incidents and creeping regressions.",
      updated: 22,
    },
    {
      type: "Article", section: "Platform Ops",
      title: "A field guide to lag-related incidents",
      crumb: ["Platform Ops", "Runbooks"],
      path: "/platform-ops/runbooks/lag-incidents",
      snippet: "Collected postmortems from the platform team: a runaway migration that starved the apply thread, a noisy neighbor that saturated the network, and a clock skew that made replication lag look far worse than it was. Each entry ends with the durable fix.",
      updated: 58,
    },
    {
      type: "API", section: "Platform Ops",
      title: "GET /metrics/replication_lag_ms",
      crumb: ["Platform Ops", "API reference", "Metrics"],
      path: "/platform-ops/api/metrics-lag",
      snippet: "Scrapes the replication_lag_ms gauge for every node in a fleet. Pair this with a histogram recording rule to track p99 replication lag over time rather than chasing instantaneous spikes.",
      updated: 9,
    },
    {
      type: "Tutorial", section: "Platform Ops",
      title: "Load-testing a cluster until lag appears",
      crumb: ["Platform Ops", "Tutorials"],
      path: "/platform-ops/tutorials/lag-load-test",
      snippet: "Deliberately push a staging cluster past its apply capacity to learn its lag curve before production does. You will script a ramping write load, watch replication lag inflect, and record the throughput where freshness guarantees start to break.",
      updated: 150,
    },
  ];

  const QUERY = "replication lag";

  // ---- State ----
  const state = {
    facets: { type: new Set(), section: new Set() },
    date: "any",
    sort: "relevance",
    query: QUERY,
  };

  // ---- DOM refs ----
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const listEl = $("#resultList");
  const emptyEl = $("#emptyState");
  const chipsEl = $("#chips");
  const countEl = $("#resultCount");
  const queryEcho = $("#queryEcho");
  const toastEl = $("#toast");

  // ---- Helpers ----
  const FACET_LABELS = {
    type: "Type",
    section: "Section",
    date: "Updated",
  };
  const DATE_LABELS = { "30": "Past 30 days", "180": "Past 6 months", "365": "Past year" };

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function highlight(text) {
    const terms = state.query.trim().split(/\s+/).filter(Boolean);
    let html = escapeHtml(text);
    if (!terms.length) return html;
    const pattern = new RegExp(
      "(" + terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")",
      "gi"
    );
    return html.replace(pattern, "<mark>$1</mark>");
  }

  function relativeDate(daysAgo) {
    if (daysAgo === 0) return "today";
    if (daysAgo === 1) return "yesterday";
    if (daysAgo < 30) return daysAgo + " days ago";
    if (daysAgo < 60) return "a month ago";
    if (daysAgo < 365) return Math.round(daysAgo / 30) + " months ago";
    return Math.round(daysAgo / 365) + " year" + (daysAgo >= 730 ? "s" : "") + " ago";
  }

  function relevanceScore(item) {
    const hay = (item.title + " " + item.snippet).toLowerCase();
    const terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    let score = 0;
    terms.forEach((t) => {
      if (item.title.toLowerCase().includes(t)) score += 5;
      const m = hay.match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"));
      score += m ? m.length : 0;
    });
    return score;
  }

  // ---- Filtering ----
  function passesType(item) {
    return state.facets.type.size === 0 || state.facets.type.has(item.type);
  }
  function passesSection(item) {
    return state.facets.section.size === 0 || state.facets.section.has(item.section);
  }
  function passesDate(item) {
    if (state.date === "any") return true;
    return item.updated <= Number(state.date);
  }

  function filtered() {
    return RESULTS.filter((r) => passesType(r) && passesSection(r) && passesDate(r));
  }

  // Counts respect *other* facet groups so they stay meaningful.
  function facetCount(group, value) {
    return RESULTS.filter((item) => {
      if (group === "type") return item.type === value && passesSection(item) && passesDate(item);
      if (group === "section") return item.section === value && passesType(item) && passesDate(item);
      if (group === "date")
        return item.updated <= Number(value) && passesType(item) && passesSection(item);
      return false;
    }).length;
  }

  // ---- Render ----
  function renderCounts() {
    $$("[data-count]").forEach((el) => {
      const [group, value] = el.getAttribute("data-count").split(/:(.+)/);
      const n = facetCount(group, value);
      el.textContent = n;
      const label = el.closest(".check");
      if (label && group !== "date") label.classList.toggle("is-empty", n === 0 && !isChecked(group, value));
    });
  }

  function isChecked(group, value) {
    if (group === "date") return state.date === value;
    return state.facets[group] && state.facets[group].has(value);
  }

  function renderChips() {
    const chips = [];
    ["type", "section"].forEach((group) => {
      state.facets[group].forEach((value) => {
        chips.push({ group, value, label: value });
      });
    });
    if (state.date !== "any") {
      chips.push({ group: "date", value: state.date, label: DATE_LABELS[state.date] });
    }

    if (!chips.length) {
      chipsEl.innerHTML = "";
      return;
    }

    chipsEl.innerHTML =
      chips
        .map(
          (c) =>
            `<span class="chip"><span class="chip__key">${FACET_LABELS[c.group]}:</span>${escapeHtml(
              c.label
            )}<button class="chip__x" type="button" aria-label="Remove ${escapeHtml(
              c.label
            )} filter" data-group="${c.group}" data-value="${escapeHtml(c.value)}">&times;</button></span>`
        )
        .join("") +
      `<button class="chip--clear" type="button" id="clearAll">Clear all</button>`;
  }

  function renderList() {
    let items = filtered();

    if (state.sort === "newest") {
      items.sort((a, b) => a.updated - b.updated);
    } else {
      items.sort((a, b) => relevanceScore(b) - relevanceScore(a) || a.updated - b.updated);
    }

    countEl.textContent = items.length;
    queryEcho.textContent = "“" + state.query + "”";

    if (!items.length) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    listEl.innerHTML = items
      .map((item) => {
        const crumb = item.crumb
          .map((c) => `<a href="#">${escapeHtml(c)}</a>`)
          .join('<span class="sep" aria-hidden="true">&rsaquo;</span>');
        return `<li class="card">
          <nav class="card__crumb" aria-label="Breadcrumb">${crumb}</nav>
          <div class="card__titlerow">
            <h2 class="card__title"><a href="#">${highlight(item.title)}</a></h2>
            <span class="badge badge--${item.type}">${
          item.type === "API" ? "API" : item.type
        }</span>
          </div>
          <p class="card__snippet">${highlight(item.snippet)}</p>
          <div class="card__foot">
            <span class="card__path"><code>${escapeHtml(item.path)}</code></span>
            <span class="dot" aria-hidden="true"></span>
            <span>Updated ${relativeDate(item.updated)}</span>
          </div>
        </li>`;
      })
      .join("");
  }

  function renderAll() {
    renderCounts();
    renderChips();
    renderList();
  }

  // ---- Toast ----
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
  }

  // ---- Events ----
  $$('[data-facet="type"], [data-facet="section"]').forEach((input) => {
    input.addEventListener("change", () => {
      const group = input.getAttribute("data-facet");
      if (input.checked) state.facets[group].add(input.value);
      else state.facets[group].delete(input.value);
      renderAll();
    });
  });

  $$('[data-facet="date"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.date = input.value;
      renderAll();
    });
  });

  $("#sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderList();
    toast("Sorted by " + (state.sort === "newest" ? "newest" : "relevance"));
  });

  // Chip removal + clear-all (delegated)
  chipsEl.addEventListener("click", (e) => {
    const x = e.target.closest(".chip__x");
    if (x) {
      const group = x.getAttribute("data-group");
      const value = x.getAttribute("data-value");
      removeFilter(group, value);
      return;
    }
    if (e.target.id === "clearAll") {
      clearAllFilters();
      toast("All filters cleared");
    }
  });

  function removeFilter(group, value) {
    if (group === "date") {
      state.date = "any";
      const anyRadio = document.querySelector('[data-facet="date"][value="any"]');
      if (anyRadio) anyRadio.checked = true;
    } else {
      state.facets[group].delete(value);
      const input = document.querySelector(
        `[data-facet="${group}"][value="${cssEscape(value)}"]`
      );
      if (input) input.checked = false;
    }
    renderAll();
  }

  function clearAllFilters() {
    state.facets.type.clear();
    state.facets.section.clear();
    state.date = "any";
    $$('[data-facet="type"], [data-facet="section"]').forEach((i) => (i.checked = false));
    const anyRadio = document.querySelector('[data-facet="date"][value="any"]');
    if (anyRadio) anyRadio.checked = true;
    renderAll();
  }

  function cssEscape(v) {
    return (window.CSS && CSS.escape) ? CSS.escape(v) : v.replace(/["\\]/g, "\\$&");
  }

  $("#resetFacets").addEventListener("click", () => {
    clearAllFilters();
    toast("Filters reset");
  });
  $("#emptyClear").addEventListener("click", () => {
    clearAllFilters();
    toast("All filters cleared");
  });

  // Search form: update query + re-highlight
  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#searchInput").value.trim();
    state.query = v || "";
    renderAll();
    $("#searchInput").blur();
    toast(v ? "Searching “" + v + "”" : "Showing all pages");
  });

  // Keyboard: "/" focuses search
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== $("#searchInput")) {
      const tag = (document.activeElement.tagName || "").toLowerCase();
      if (tag !== "input" && tag !== "textarea" && tag !== "select") {
        e.preventDefault();
        $("#searchInput").focus();
        $("#searchInput").select();
      }
    }
  });

  // ---- Mobile drawer ----
  const facetsEl = $("#facets");
  const scrim = $("#drawerScrim");
  const toggle = $("#drawerToggle");
  function openDrawer() {
    facetsEl.classList.add("is-open");
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add("is-on"));
    toggle.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    facetsEl.classList.remove("is-open");
    scrim.classList.remove("is-on");
    setTimeout(() => (scrim.hidden = true), 220);
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", () =>
    facetsEl.classList.contains("is-open") ? closeDrawer() : openDrawer()
  );
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && facetsEl.classList.contains("is-open")) closeDrawer();
  });

  // ---- Init ----
  renderAll();
})();
