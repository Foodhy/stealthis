(function () {
  "use strict";

  // ── Data ────────────────────────────────────────────────────────────────────

  const DATA = [
    { id: 1,  name: "Alex Morgan",    email: "alex.morgan@acme.io",    role: "Admin",   status: "active",   joined: "2023-01-15" },
    { id: 2,  name: "Jordan Lee",     email: "jordan.lee@acme.io",     role: "Editor",  status: "active",   joined: "2023-03-08" },
    { id: 3,  name: "Sam Rivera",     email: "sam.rivera@acme.io",     role: "Viewer",  status: "inactive", joined: "2023-05-21" },
    { id: 4,  name: "Casey Kim",      email: "casey.kim@acme.io",      role: "Editor",  status: "pending",  joined: "2023-07-04" },
    { id: 5,  name: "Morgan Blake",   email: "morgan.blake@acme.io",   role: "Viewer",  status: "active",   joined: "2023-08-19" },
    { id: 6,  name: "Taylor Quinn",   email: "taylor.quinn@acme.io",   role: "Admin",   status: "active",   joined: "2023-09-30" },
    { id: 7,  name: "Drew Hayes",     email: "drew.hayes@acme.io",     role: "Viewer",  status: "inactive", joined: "2023-11-01" },
    { id: 8,  name: "Jamie Patel",    email: "jamie.patel@acme.io",    role: "Editor",  status: "active",   joined: "2024-01-22" },
    { id: 9,  name: "Robin West",     email: "robin.west@acme.io",     role: "Viewer",  status: "pending",  joined: "2024-02-14" },
    { id: 10, name: "Avery Chen",     email: "avery.chen@acme.io",     role: "Editor",  status: "active",   joined: "2024-03-05" },
    { id: 11, name: "Dakota Reed",    email: "dakota.reed@acme.io",    role: "Viewer",  status: "inactive", joined: "2024-04-18" },
    { id: 12, name: "Charlie Stone",  email: "charlie.stone@acme.io",  role: "Admin",   status: "active",   joined: "2024-05-30" },
    { id: 13, name: "Skyler Ramos",   email: "skyler.ramos@acme.io",   role: "Viewer",  status: "pending",  joined: "2024-07-11" },
    { id: 14, name: "Reese Torres",   email: "reese.torres@acme.io",   role: "Editor",  status: "active",   joined: "2024-08-03" },
    { id: 15, name: "Finley Cross",   email: "finley.cross@acme.io",   role: "Viewer",  status: "inactive", joined: "2024-09-27" },
  ];

  // ── Columns definition ───────────────────────────────────────────────────────

  const COLUMNS = [
    { id: "check",   label: "",         sortable: false, visible: true },
    { id: "name",    label: "Name",     sortable: true,  visible: true },
    { id: "email",   label: "Email",    sortable: true,  visible: true },
    { id: "role",    label: "Role",     sortable: true,  visible: true },
    { id: "status",  label: "Status",   sortable: true,  visible: true },
    { id: "joined",  label: "Joined",   sortable: true,  visible: true },
    { id: "actions", label: "Actions",  sortable: false, visible: true },
  ];

  // ── State ────────────────────────────────────────────────────────────────────

  let filteredData = DATA.slice();
  let sortCol  = null;
  let sortDir  = null; // "asc" | "desc" | null
  let currentPage = 1;
  const PAGE_SIZE = 10;
  const selected  = new Set();

  // ── DOM refs ─────────────────────────────────────────────────────────────────

  const theadRow    = document.getElementById("thead-row");
  const tbody       = document.getElementById("tbody");
  const pagination  = document.getElementById("pagination");
  const bulkBar     = document.getElementById("bulk-bar");
  const bulkCount   = document.getElementById("bulk-count");
  const searchInput = document.getElementById("search-input");
  const colDropdown = document.getElementById("col-dropdown");
  const colBtn      = document.getElementById("col-toggle-btn");
  const colWrap     = document.getElementById("col-toggle-wrap");

  // ── Render ───────────────────────────────────────────────────────────────────

  function render() {
    renderHeader();
    renderRows();
    renderPagination();
    renderBulkBar();
    renderColDropdown();
  }

  // ── Header ────────────────────────────────────────────────────────────────────

  function renderHeader() {
    theadRow.innerHTML = "";

    COLUMNS.forEach(function (col) {
      if (!col.visible) return;

      const th = document.createElement("th");
      th.dataset.col = col.id;

      if (col.id === "check") {
        th.className = "col-check";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.id   = "select-all";
        cb.setAttribute("aria-label", "Select all rows");
        const pageIds  = pageData().map(function (r) { return r.id; });
        const selCount = pageIds.filter(function (id) { return selected.has(id); }).length;
        cb.checked       = selCount === pageIds.length && pageIds.length > 0;
        cb.indeterminate = selCount > 0 && selCount < pageIds.length;
        cb.addEventListener("change", function () {
          pageData().forEach(function (row) {
            cb.checked ? selected.add(row.id) : selected.delete(row.id);
          });
          render();
        });
        th.appendChild(cb);
      } else {
        if (col.sortable) th.classList.add("sortable");
        if (sortCol === col.id) th.classList.add("col-sorted");

        const inner = document.createElement("span");
        inner.className = "th-inner";

        const lbl = document.createElement("span");
        lbl.textContent = col.label;
        inner.appendChild(lbl);

        if (col.sortable) {
          const icon = document.createElement("span");
          icon.className = "sort-icon" + (sortCol === col.id ? " sort-icon--active" : "");
          icon.setAttribute("aria-hidden", "true");
          icon.textContent = sortCol === col.id ? (sortDir === "asc" ? "↑" : "↓") : "↕";
          inner.appendChild(icon);

          th.addEventListener("click", function () {
            if (sortCol === col.id) {
              sortDir = sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc";
              if (sortDir === null) sortCol = null;
            } else {
              sortCol = col.id;
              sortDir = "asc";
            }
            currentPage = 1;
            applySort();
            render();
          });
        }

        th.appendChild(inner);
      }

      theadRow.appendChild(th);
    });
  }

  // ── Rows ──────────────────────────────────────────────────────────────────────

  function renderRows() {
    tbody.innerHTML = "";
    const rows = pageData();

    if (!rows.length) {
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      const td = document.createElement("td");
      td.setAttribute("colspan", COLUMNS.filter(function (c) { return c.visible; }).length);
      td.textContent = "No users found.";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    rows.forEach(function (row) {
      const tr = document.createElement("tr");
      if (selected.has(row.id)) tr.classList.add("selected");

      COLUMNS.forEach(function (col) {
        if (!col.visible) return;

        const td = document.createElement("td");
        td.dataset.col = col.id;
        if (sortCol === col.id) td.classList.add("col-sorted");

        switch (col.id) {
          case "check": {
            td.className = "col-check";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = selected.has(row.id);
            cb.setAttribute("aria-label", "Select " + row.name);
            cb.addEventListener("change", function () {
              cb.checked ? selected.add(row.id) : selected.delete(row.id);
              render();
            });
            td.appendChild(cb);
            break;
          }
          case "name": {
            td.innerHTML = '<span class="user-name">' + esc(row.name) + '</span>';
            break;
          }
          case "email": {
            td.innerHTML = '<span class="user-email">' + esc(row.email) + '</span>';
            break;
          }
          case "role": {
            td.innerHTML = '<span class="role-badge">' + esc(row.role) + '</span>';
            break;
          }
          case "status": {
            const cls = "status-badge--" + row.status;
            td.innerHTML = '<span class="status-badge ' + cls + '">' + cap(row.status) + '</span>';
            break;
          }
          case "joined": {
            td.textContent = formatDate(row.joined);
            break;
          }
          case "actions": {
            td.innerHTML = [
              '<div class="actions-cell">',
              '  <button class="action-btn" aria-label="Edit ' + esc(row.name) + '" title="Edit">✎</button>',
              '  <button class="action-btn action-btn--delete" aria-label="Delete ' + esc(row.name) + '" title="Delete">🗑</button>',
              '</div>',
            ].join("");
            td.querySelector(".action-btn").addEventListener("click", function () {
              alert("Edit: " + row.name);
            });
            td.querySelector(".action-btn--delete").addEventListener("click", function () {
              if (confirm("Delete " + row.name + "?")) {
                filteredData = filteredData.filter(function (r) { return r.id !== row.id; });
                selected.delete(row.id);
                render();
              }
            });
            break;
          }
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  // ── Pagination ────────────────────────────────────────────────────────────────

  function renderPagination() {
    const total = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end   = Math.min(currentPage * PAGE_SIZE, total);

    pagination.innerHTML = "";

    const info = document.createElement("span");
    info.className = "pagination-info";
    info.textContent = total > 0
      ? "Showing " + start + "–" + end + " of " + total
      : "No results";
    pagination.appendChild(info);

    const btns = document.createElement("div");
    btns.className = "page-btns";

    // Prev
    const prev = pageBtn("‹", function () { currentPage--; render(); });
    prev.setAttribute("aria-label", "Previous page");
    prev.disabled = currentPage === 1;
    btns.appendChild(prev);

    // Page numbers with ellipsis
    const pages = getPageNumbers(currentPage, totalPages);
    pages.forEach(function (p) {
      if (p === "…") {
        const span = document.createElement("span");
        span.className = "page-ellipsis";
        span.textContent = "…";
        btns.appendChild(span);
      } else {
        const btn = pageBtn(p, function () { currentPage = p; render(); });
        if (p === currentPage) btn.classList.add("active");
        btn.setAttribute("aria-label", "Page " + p);
        btn.setAttribute("aria-current", p === currentPage ? "page" : undefined);
        btns.appendChild(btn);
      }
    });

    // Next
    const next = pageBtn("›", function () { currentPage++; render(); });
    next.setAttribute("aria-label", "Next page");
    next.disabled = currentPage === totalPages;
    btns.appendChild(next);

    pagination.appendChild(btns);
  }

  function pageBtn(label, onClick) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function getPageNumbers(cur, total) {
    if (total <= 7) return Array.from({ length: total }, function (_, i) { return i + 1; });
    if (cur <= 4)  return [1, 2, 3, 4, 5, "…", total];
    if (cur >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "…", cur - 1, cur, cur + 1, "…", total];
  }

  // ── Bulk bar ──────────────────────────────────────────────────────────────────

  function renderBulkBar() {
    if (selected.size > 0) {
      bulkBar.removeAttribute("hidden");
      bulkCount.textContent = selected.size + " selected";
    } else {
      bulkBar.setAttribute("hidden", "");
    }
  }

  // ── Column visibility dropdown ────────────────────────────────────────────────

  function renderColDropdown() {
    colDropdown.innerHTML = "";
    COLUMNS.forEach(function (col) {
      if (col.id === "check" || col.id === "actions") return; // always visible
      const item = document.createElement("label");
      item.className = "col-item";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = col.visible;
      cb.addEventListener("change", function () {
        col.visible = cb.checked;
        render();
      });
      const lbl = document.createElement("span");
      lbl.textContent = col.label;
      item.appendChild(cb);
      item.appendChild(lbl);
      colDropdown.appendChild(item);
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function pageData() {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }

  function applyFilter(query) {
    const q = query.toLowerCase().trim();
    filteredData = DATA.filter(function (row) {
      return !q || row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q);
    });
    applySort();
  }

  function applySort() {
    if (!sortCol || !sortDir) return;
    filteredData = filteredData.slice().sort(function (a, b) {
      const av = a[sortCol] || "";
      const bv = b[sortCol] || "";
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cap(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatDate(str) {
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  // ── Events ────────────────────────────────────────────────────────────────────

  // Search
  searchInput.addEventListener("input", function () {
    currentPage = 1;
    selected.clear();
    applyFilter(searchInput.value);
    render();
  });

  // Bulk delete
  document.getElementById("bulk-delete").addEventListener("click", function () {
    if (!selected.size) return;
    if (!confirm("Delete " + selected.size + " selected user(s)?")) return;
    filteredData = filteredData.filter(function (r) { return !selected.has(r.id); });
    selected.clear();
    currentPage = 1;
    render();
  });

  // Bulk export (demo)
  document.getElementById("bulk-export").addEventListener("click", function () {
    const rows = filteredData.filter(function (r) { return selected.has(r.id); });
    const csv  = ["Name,Email,Role,Status,Joined"]
      .concat(rows.map(function (r) { return [r.name, r.email, r.role, r.status, r.joined].join(","); }))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Column visibility toggle
  colBtn.addEventListener("click", function () {
    const isHidden = colDropdown.hasAttribute("hidden");
    if (isHidden) {
      colDropdown.removeAttribute("hidden");
      colBtn.setAttribute("aria-expanded", "true");
    } else {
      colDropdown.setAttribute("hidden", "");
      colBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("click", function (e) {
    if (!colWrap.contains(e.target)) {
      colDropdown.setAttribute("hidden", "");
      colBtn.setAttribute("aria-expanded", "false");
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────────────

  render();
})();
