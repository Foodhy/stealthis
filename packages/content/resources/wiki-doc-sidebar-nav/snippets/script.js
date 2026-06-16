/* Aurora DB Docs — collapsible doc tree nav
   Vanilla JS: expand/collapse, live filter, keyboard nav, mobile drawer. */
(function () {
  "use strict";

  /* ─── Doc tree data (fictional Aurora DB docs) ─── */
  const TREE = [
    {
      label: "Getting started",
      icon: "rocket",
      open: true,
      children: [
        { label: "Introduction", href: "#intro", active: false },
        { label: "Install the CLI", href: "#install" },
        { label: "Your first cluster", href: "#first-cluster" },
        { label: "Connecting a client", href: "#connect" },
      ],
    },
    {
      label: "Guides",
      icon: "book",
      open: true,
      children: [
        { label: "Schema modeling", href: "#schema" },
        { label: "Indexes & query plans", href: "#indexes" },
        {
          label: "Replication & failover",
          href: "#replication",
          active: true,
        },
        { label: "Backups & restore", href: "#backups" },
        { label: "Scaling read replicas", href: "#scaling", badge: "new" },
        {
          label: "Operations",
          icon: "gear",
          children: [
            { label: "Health checks", href: "#health" },
            { label: "Rolling upgrades", href: "#upgrades" },
            { label: "Disaster recovery", href: "#dr" },
          ],
        },
      ],
    },
    {
      label: "API reference",
      icon: "code",
      children: [
        { label: "connect()", href: "#api-connect" },
        { label: "query()", href: "#api-query" },
        { label: "transaction()", href: "#api-tx" },
        {
          label: "Cluster admin",
          icon: "gear",
          children: [
            { label: "failover()", href: "#api-failover" },
            { label: "promote()", href: "#api-promote" },
            { label: "snapshot()", href: "#api-snapshot", badge: "beta" },
          ],
        },
      ],
    },
    {
      label: "Reference",
      icon: "book",
      children: [
        { label: "Configuration keys", href: "#config" },
        { label: "Consistency model (Helios)", href: "#helios" },
        { label: "Error codes", href: "#errors" },
        { label: "Glossary", href: "#glossary" },
        { label: "CLI command index", href: "#cli-index" },
      ],
    },
  ];

  const ICONS = {
    rocket:
      '<path d="M5 13l2 2-3 4 4-3 2 2 7-7c2-2 3-7 3-7s-5 1-7 3l-7 7z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
    book: '<path d="M5 4h9a2 2 0 012 2v13H7a2 2 0 00-2 2V4z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
    gear: '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="currentColor" stroke-width="1.4"/>',
    code: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    page: '<path d="M7 3h7l4 4v14H7V3z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/>',
    chevron:
      '<path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  };

  const tree = document.getElementById("tree");
  const searchInput = document.getElementById("treeSearch");
  const resultCount = document.getElementById("resultCount");
  const treeEmpty = document.getElementById("treeEmpty");
  const emptyTerm = document.getElementById("emptyTerm");
  const toastEl = document.getElementById("toast");

  let leafCount = 0;
  const rows = []; // flat list of all .node-row buttons, in DOM order
  let kbIndex = -1;

  function svg(inner, cls) {
    return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
  }

  /* ─── Render tree recursively ─── */
  function render(nodes, parent, depth) {
    nodes.forEach((node) => {
      const li = document.createElement("li");
      li.setAttribute("role", "none");

      const hasChildren = Array.isArray(node.children) && node.children.length;
      const row = document.createElement(hasChildren ? "button" : "a");
      row.className = "node-row";
      row.setAttribute("role", "treeitem");
      row.dataset.label = node.label.toLowerCase();

      let html = "";
      if (hasChildren) {
        row.type = "button";
        row.setAttribute("aria-expanded", node.open ? "true" : "false");
        html += svg(ICONS.chevron, "chevron");
      } else {
        row.href = node.href || "#";
        html += '<span class="chevron-spacer"></span>';
      }
      html += svg(ICONS[node.icon] || ICONS.page, "node-icon");
      html += `<span class="node-label">${node.label}</span>`;
      if (node.badge) {
        html += `<span class="node-badge ${node.badge}">${node.badge}</span>`;
      }
      row.innerHTML = html;

      if (node.active) {
        row.classList.add("is-active");
        row.setAttribute("aria-current", "page");
      }

      li.appendChild(row);
      rows.push(row);

      if (hasChildren) {
        const ul = document.createElement("ul");
        ul.setAttribute("role", "group");
        if (!node.open) li.dataset.collapsed = "true";
        ul.hidden = !node.open;
        render(node.children, ul, depth + 1);
        li.appendChild(ul);

        row.addEventListener("click", () => toggle(row, ul));
      } else {
        leafCount++;
        row.addEventListener("click", (e) => {
          e.preventDefault();
          activate(row);
          toast("Opened “" + node.label + "”");
          closeDrawer();
        });
      }

      parent.appendChild(li);
    });
  }

  function toggle(row, ul, force) {
    const willOpen =
      typeof force === "boolean"
        ? force
        : row.getAttribute("aria-expanded") !== "true";
    row.setAttribute("aria-expanded", willOpen ? "true" : "false");
    ul.hidden = !willOpen;
  }

  function activate(row) {
    rows.forEach((r) => {
      r.classList.remove("is-active");
      r.removeAttribute("aria-current");
    });
    row.classList.add("is-active");
    row.setAttribute("aria-current", "page");
  }

  render(TREE, tree, 0);
  if (resultCount) resultCount.textContent = leafCount;

  /* ─── Expand / collapse all ─── */
  function setAll(open) {
    tree.querySelectorAll('.node-row[aria-expanded]').forEach((row) => {
      const ul = row.parentElement.querySelector(":scope > ul");
      if (ul) toggle(row, ul, open);
    });
  }
  document
    .getElementById("expandAll")
    .addEventListener("click", () => setAll(true));
  document
    .getElementById("collapseAll")
    .addEventListener("click", () => setAll(false));

  /* ─── Live filter ─── */
  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function clearMarks() {
    tree.querySelectorAll(".node-label").forEach((lbl) => {
      if (lbl.dataset.raw) lbl.innerHTML = lbl.dataset.raw;
    });
  }

  function filter(term) {
    term = term.trim().toLowerCase();
    clearMarks();

    if (!term) {
      // reset: show everything, restore each branch's natural open state
      tree.querySelectorAll("li").forEach((li) => (li.hidden = false));
      tree.querySelectorAll('.node-row[aria-expanded]').forEach((row) => {
        const ul = row.parentElement.querySelector(":scope > ul");
        if (ul) toggle(row, ul, li_initiallyOpen(row));
      });
      treeEmpty.hidden = true;
      tree.hidden = false;
      resultCount.textContent = leafCount;
      return;
    }

    const re = new RegExp("(" + escapeRe(term) + ")", "ig");
    let matches = 0;

    // First pass: decide which rows match.
    rows.forEach((row) => {
      const li = row.parentElement;
      const label = row.dataset.label;
      const hit = label.indexOf(term) !== -1;
      li.dataset.matchSelf = hit ? "1" : "0";
      if (hit && row.classList.contains("node-row") && !row.querySelector(".chevron")) {
        // leaf hit
      }
    });

    // Second pass: a li is visible if it matches OR has a visible descendant.
    function visit(ul) {
      let anyVisible = false;
      ul.querySelectorAll(":scope > li").forEach((li) => {
        const row = li.querySelector(":scope > .node-row");
        const childUl = li.querySelector(":scope > ul");
        const selfHit = li.dataset.matchSelf === "1";
        let childVisible = false;
        if (childUl) childVisible = visit(childUl);

        const visible = selfHit || childVisible;
        li.hidden = !visible;

        if (visible) {
          anyVisible = true;
          if (row && !row.querySelector(".chevron")) matches++;
          // auto-expand branches that contain matches
          if (childUl) {
            toggle(row, childUl, true);
          }
          // highlight the matching part of the label
          const lbl = row && row.querySelector(".node-label");
          if (lbl && selfHit) {
            if (!lbl.dataset.raw) lbl.dataset.raw = lbl.innerHTML;
            lbl.innerHTML = lbl.dataset.raw.replace(re, "<mark>$1</mark>");
          }
        }
      });
      return anyVisible;
    }
    visit(tree);

    resultCount.textContent = matches;
    if (matches === 0) {
      tree.hidden = true;
      treeEmpty.hidden = false;
      emptyTerm.textContent = term;
    } else {
      tree.hidden = false;
      treeEmpty.hidden = true;
    }
  }

  // remember initial open state for reset
  const initialOpen = new WeakMap();
  tree.querySelectorAll('.node-row[aria-expanded]').forEach((row) => {
    initialOpen.set(row, row.getAttribute("aria-expanded") === "true");
  });
  function li_initiallyOpen(row) {
    return initialOpen.get(row) === true;
  }

  let filterTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(filterTimer);
    const v = searchInput.value;
    filterTimer = setTimeout(() => filter(v), 90);
    kbIndex = -1;
    setKbFocus(-1);
  });

  /* ─── Keyboard navigation ─── */
  function visibleRows() {
    return rows.filter((r) => {
      let el = r;
      while (el && el !== tree) {
        if (el.tagName === "LI" && el.hidden) return false;
        el = el.parentElement;
      }
      return true;
    });
  }

  function setKbFocus(i) {
    rows.forEach((r) => r.classList.remove("kb-focus"));
    const vis = visibleRows();
    if (i < 0 || i >= vis.length) return;
    const row = vis[i];
    row.classList.add("kb-focus");
    row.scrollIntoView({ block: "nearest" });
    kbCurrent = row;
  }
  let kbCurrent = null;

  function moveKb(delta) {
    const vis = visibleRows();
    if (!vis.length) return;
    let idx = vis.indexOf(kbCurrent);
    idx = idx === -1 ? (delta > 0 ? 0 : vis.length - 1) : idx + delta;
    idx = Math.max(0, Math.min(vis.length - 1, idx));
    kbIndex = idx;
    setKbFocus(idx);
  }

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveKb(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveKb(-1);
    } else if (e.key === "Enter" && kbCurrent) {
      e.preventDefault();
      kbCurrent.click();
    } else if (e.key === "Escape") {
      searchInput.value = "";
      filter("");
      kbIndex = -1;
      setKbFocus(-1);
    } else if (
      (e.key === "ArrowRight" || e.key === "ArrowLeft") &&
      kbCurrent &&
      kbCurrent.hasAttribute("aria-expanded")
    ) {
      e.preventDefault();
      const ul = kbCurrent.parentElement.querySelector(":scope > ul");
      if (ul) toggle(kbCurrent, ul, e.key === "ArrowRight");
    }
  });

  // Arrow navigation also works when a tree row itself has focus.
  tree.addEventListener("keydown", (e) => {
    const row = e.target.closest(".node-row");
    if (!row) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const vis = visibleRows();
      let idx = vis.indexOf(row) + (e.key === "ArrowDown" ? 1 : -1);
      idx = Math.max(0, Math.min(vis.length - 1, idx));
      vis[idx].focus();
    } else if (e.key === "ArrowRight" && row.hasAttribute("aria-expanded")) {
      const ul = row.parentElement.querySelector(":scope > ul");
      if (ul && row.getAttribute("aria-expanded") === "false") {
        e.preventDefault();
        toggle(row, ul, true);
      }
    } else if (e.key === "ArrowLeft" && row.hasAttribute("aria-expanded")) {
      const ul = row.parentElement.querySelector(":scope > ul");
      if (ul && row.getAttribute("aria-expanded") === "true") {
        e.preventDefault();
        toggle(row, ul, false);
      }
    }
  });

  /* Global "/" focuses the filter */
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "/" &&
      document.activeElement !== searchInput &&
      !/^(input|textarea|select)$/i.test(document.activeElement.tagName)
    ) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  /* ─── Mobile drawer ─── */
  const navToggle = document.getElementById("navToggle");
  const scrim = document.getElementById("scrim");

  function openDrawer() {
    document.body.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
    scrim.hidden = false;
  }
  function closeDrawer() {
    if (!document.body.classList.contains("nav-open")) return;
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle.addEventListener("click", () => {
    document.body.classList.contains("nav-open") ? closeDrawer() : openDrawer();
  });
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  /* ─── TOC scroll spy ─── */
  const tocLinks = Array.from(document.querySelectorAll(".toc-list a"));
  const sections = tocLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            tocLinks.forEach((a) =>
              a.classList.toggle("active", a.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
  }

  /* ─── Toast helper ─── */
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }
})();
