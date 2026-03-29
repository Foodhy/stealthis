(() => {
  const dataList = document.getElementById("dataList");
  const searchInput = document.getElementById("searchInput");
  const selectAll = document.getElementById("selectAll");
  const bulkBar = document.getElementById("bulkBar");
  const bulkCount = document.getElementById("bulkCount");
  const rowCount = document.getElementById("rowCount");
  const emptyState = document.getElementById("emptyState");

  let sortState = { col: null, dir: "asc" };

  // ── Helpers ──
  function getRows() {
    return Array.from(dataList.querySelectorAll(".dl-row--data"));
  }

  function updateRowCount() {
    const visible = getRows().filter((r) => r.style.display !== "none").length;
    const total = getRows().length;
    rowCount.textContent = `${visible}${visible !== total ? " of " + total : ""} member${total !== 1 ? "s" : ""}`;
    emptyState.style.display = visible === 0 ? "flex" : "none";
  }

  function updateBulkBar() {
    const checked = dataList.querySelectorAll(".row-check:checked");
    const allVisible = getRows().filter((r) => r.style.display !== "none");
    const allChecked = allVisible.every((r) => r.querySelector(".row-check").checked);
    const someChecked = allVisible.some((r) => r.querySelector(".row-check").checked);

    selectAll.checked = allChecked && allVisible.length > 0;
    selectAll.indeterminate = someChecked && !allChecked;

    if (checked.length > 0) {
      bulkBar.classList.add("visible");
      bulkCount.textContent = `${checked.length} selected`;
    } else {
      bulkBar.classList.remove("visible");
    }

    getRows().forEach((row) => {
      const cb = row.querySelector(".row-check");
      row.classList.toggle("selected", cb.checked);
    });
  }

  // ── Search ──
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    getRows().forEach((row) => {
      const name = (row.dataset.name || "").toLowerCase();
      const email = (row.dataset.email || "").toLowerCase();
      row.style.display = !q || name.includes(q) || email.includes(q) ? "" : "none";
    });
    updateRowCount();
    updateBulkBar();
  });

  // ── Select All ──
  selectAll.addEventListener("change", () => {
    const visibleRows = getRows().filter((r) => r.style.display !== "none");
    visibleRows.forEach((row) => {
      row.querySelector(".row-check").checked = selectAll.checked;
    });
    updateBulkBar();
  });

  // ── Row checkboxes (delegated) ──
  dataList.addEventListener("change", (e) => {
    if (e.target.classList.contains("row-check")) updateBulkBar();
  });

  // ── Sort ──
  document.querySelectorAll(".sortable").forEach((header) => {
    header.addEventListener("click", () => {
      const col = header.dataset.sort;
      if (sortState.col === col) {
        sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
      } else {
        sortState.col = col;
        sortState.dir = "asc";
      }

      // Update header indicators
      document.querySelectorAll(".sortable").forEach((h) => {
        h.classList.remove("asc", "desc");
      });
      header.classList.add(sortState.dir);

      // Sort rows
      const rows = getRows();
      rows.sort((a, b) => {
        let valA = (a.dataset[col] || "").toLowerCase();
        let valB = (b.dataset[col] || "").toLowerCase();
        // Date comparison
        if (col === "joined") {
          valA = new Date(a.dataset.joined);
          valB = new Date(b.dataset.joined);
          return sortState.dir === "asc" ? valA - valB : valB - valA;
        }
        return sortState.dir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });

      rows.forEach((row) => dataList.appendChild(row));
    });
  });

  // ── Action dropdown ──
  let openDropdown = null;

  dataList.addEventListener("click", (e) => {
    // Toggle dropdown
    const menuBtn = e.target.closest(".action-menu-btn");
    if (menuBtn) {
      e.stopPropagation();
      const dropdown = menuBtn.nextElementSibling;
      if (openDropdown && openDropdown !== dropdown) {
        openDropdown.classList.remove("open");
      }
      dropdown.classList.toggle("open");
      openDropdown = dropdown.classList.contains("open") ? dropdown : null;
      return;
    }

    // Action item
    const actionItem = e.target.closest(".action-item");
    if (actionItem) {
      const row = actionItem.closest(".dl-row--data");
      if (actionItem.classList.contains("action-item--danger") && row) {
        row.classList.add("removing");
        setTimeout(() => {
          row.remove();
          updateRowCount();
          updateBulkBar();
        }, 300);
      }
      if (openDropdown) {
        openDropdown.classList.remove("open");
        openDropdown = null;
      }
    }
  });

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (openDropdown && !e.target.closest(".dl-col--actions")) {
      openDropdown.classList.remove("open");
      openDropdown = null;
    }
  });

  // ── Edit Modal ──
  const editModalBackdrop = document.getElementById("editModalBackdrop");
  let editingRow = null;

  function openEditModal(row) {
    editingRow = row;
    document.getElementById("editName").value = row.dataset.name || "";
    document.getElementById("editEmail").value = row.dataset.email || "";
    document.getElementById("editRole").value = row.dataset.role || "Viewer";
    document.getElementById("editStatus").value = row.dataset.status || "Active";
    editModalBackdrop.classList.add("open");
  }

  function closeEditModal() {
    editModalBackdrop.classList.remove("open");
    editingRow = null;
  }

  document.getElementById("editModalClose").addEventListener("click", closeEditModal);
  document.getElementById("editModalCancel").addEventListener("click", closeEditModal);
  editModalBackdrop.addEventListener("click", (e) => {
    if (e.target === editModalBackdrop) closeEditModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeEditModal();
  });

  document.getElementById("editModalSave").addEventListener("click", () => {
    if (!editingRow) return;
    const newName = document.getElementById("editName").value.trim();
    const newEmail = document.getElementById("editEmail").value.trim();
    const newRole = document.getElementById("editRole").value;
    const newStatus = document.getElementById("editStatus").value;
    if (!newName || !newEmail) return;

    // Update data attributes
    editingRow.dataset.name = newName;
    editingRow.dataset.email = newEmail;
    editingRow.dataset.role = newRole;
    editingRow.dataset.status = newStatus;

    // Update visible cells
    const nameEl = editingRow.querySelector(".member-name");
    const emailEl = editingRow.querySelector(".member-email");
    const roleEl = editingRow.querySelector(".role-badge");
    const statusEl = editingRow.querySelector(".status-badge");

    if (nameEl) nameEl.textContent = newName;
    if (emailEl) emailEl.textContent = newEmail;

    if (roleEl) {
      roleEl.textContent = newRole;
      roleEl.className = `role-badge role-badge--${newRole.toLowerCase()}`;
    }
    if (statusEl) {
      statusEl.textContent = newStatus;
      statusEl.className = `status-badge status-badge--${newStatus.toLowerCase()}`;
    }

    closeEditModal();
  });

  // Wire Edit buttons via delegated click on dataList
  dataList.addEventListener("click", (e) => {
    const actionItem = e.target.closest(".action-item");
    if (
      actionItem &&
      !actionItem.classList.contains("action-item--danger") &&
      actionItem.textContent.trim() === "Edit"
    ) {
      const row = actionItem.closest(".dl-row--data");
      if (row) openEditModal(row);
      if (openDropdown) {
        openDropdown.classList.remove("open");
        openDropdown = null;
      }
    }
  });

  // ── Init ──
  updateRowCount();
})();
