(function () {
  "use strict";

  // ── Data ──
  const EMPLOYEES = [
    {
      id: 1,
      name: "Alice Martin",
      dept: "Engineering",
      salary: 120000,
      status: "Active",
      startDate: "2021-03-15",
      initials: "AM",
      color: "#38bdf8",
    },
    {
      id: 2,
      name: "Bob Kowalski",
      dept: "Design",
      salary: 95000,
      status: "Active",
      startDate: "2022-07-01",
      initials: "BK",
      color: "#818cf8",
    },
    {
      id: 3,
      name: "Carol Schmidt",
      dept: "Marketing",
      salary: 78000,
      status: "Inactive",
      startDate: "2020-11-20",
      initials: "CS",
      color: "#f472b6",
    },
    {
      id: 4,
      name: "David Reyes",
      dept: "Sales",
      salary: 88000,
      status: "Active",
      startDate: "2023-01-10",
      initials: "DR",
      color: "#34d399",
    },
    {
      id: 5,
      name: "Emma Johnson",
      dept: "Engineering",
      salary: 135000,
      status: "Active",
      startDate: "2019-06-05",
      initials: "EJ",
      color: "#fb923c",
    },
    {
      id: 6,
      name: "Frank Lee",
      dept: "HR",
      salary: 72000,
      status: "On Leave",
      startDate: "2021-09-30",
      initials: "FL",
      color: "#fbbf24",
    },
    {
      id: 7,
      name: "Grace Park",
      dept: "Engineering",
      salary: 110000,
      status: "Active",
      startDate: "2022-04-18",
      initials: "GP",
      color: "#a78bfa",
    },
    {
      id: 8,
      name: "Henry Wilson",
      dept: "Sales",
      salary: 82000,
      status: "Inactive",
      startDate: "2020-08-22",
      initials: "HW",
      color: "#2dd4bf",
    },
    {
      id: 9,
      name: "Iris Thompson",
      dept: "Design",
      salary: 91000,
      status: "Active",
      startDate: "2023-05-14",
      initials: "IT",
      color: "#e879f9",
    },
    {
      id: 10,
      name: "Jake Novak",
      dept: "Marketing",
      salary: 76000,
      status: "Active",
      startDate: "2021-12-03",
      initials: "JN",
      color: "#60a5fa",
    },
  ];

  const DEFAULT_PRESETS = [
    {
      name: "Q1 Report",
      state: {
        search: "",
        depts: ["Engineering", "Sales"],
        status: "Active",
        salaryMin: "",
        salaryMax: "",
        dateFrom: "",
        dateTo: "",
      },
    },
    {
      name: "Engineering Only",
      state: {
        search: "",
        depts: ["Engineering"],
        status: "all",
        salaryMin: "",
        salaryMax: "",
        dateFrom: "",
        dateTo: "",
      },
    },
  ];

  // ── State ──
  let activeState = {
    search: "",
    depts: [],
    status: "all",
    salaryMin: "",
    salaryMax: "",
    dateFrom: "",
    dateTo: "",
  };

  // ── DOM refs ──
  const searchInput = document.getElementById("searchInput");
  const deptChecks = document.querySelectorAll(".dept-check");
  const statusGroup = document.getElementById("statusGroup");
  const salaryMin = document.getElementById("salaryMin");
  const salaryMax = document.getElementById("salaryMax");
  const dateFrom = document.getElementById("dateFrom");
  const dateTo = document.getElementById("dateTo");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const resultsCount = document.getElementById("resultsCount");
  const filterCountBadge = document.getElementById("filterCountBadge");
  const activeChips = document.getElementById("activeChips");
  const employeeList = document.getElementById("employeeList");
  const presetSelect = document.getElementById("presetSelect");
  const savePresetBtn = document.getElementById("savePresetBtn");
  const presetModal = document.getElementById("presetModal");
  const presetNameInput = document.getElementById("presetNameInput");
  const modalCancel = document.getElementById("modalCancel");
  const modalSave = document.getElementById("modalSave");
  const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
  const filterSidebar = document.getElementById("filterSidebar");

  if (!employeeList) return;

  // ── localStorage presets ──
  const STORAGE_KEY = "advanced-filters-presets";

  function loadPresets() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return Array.isArray(stored) ? stored : [...DEFAULT_PRESETS];
    } catch {
      return [...DEFAULT_PRESETS];
    }
  }

  function savePresets(presets) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch {}
  }

  let presets = loadPresets();

  function renderPresetSelect() {
    const current = presetSelect.value;
    presetSelect.innerHTML = `<option value="">Load a preset…</option>`;
    presets.forEach((p, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = p.name;
      presetSelect.appendChild(opt);
    });
    presetSelect.value = current;
  }

  renderPresetSelect();

  // ── Filtering ──
  function getFilteredEmployees() {
    return EMPLOYEES.filter((emp) => {
      if (activeState.search && !emp.name.toLowerCase().includes(activeState.search.toLowerCase()))
        return false;
      if (activeState.depts.length > 0 && !activeState.depts.includes(emp.dept)) return false;
      if (activeState.status !== "all" && emp.status !== activeState.status) return false;
      if (activeState.salaryMin !== "" && emp.salary < Number(activeState.salaryMin)) return false;
      if (activeState.salaryMax !== "" && emp.salary > Number(activeState.salaryMax)) return false;
      if (activeState.dateFrom && emp.startDate < activeState.dateFrom) return false;
      if (activeState.dateTo && emp.startDate > activeState.dateTo) return false;
      return true;
    });
  }

  function countActiveFilters() {
    let count = 0;
    if (activeState.search) count++;
    if (activeState.depts.length > 0) count++;
    if (activeState.status !== "all") count++;
    if (activeState.salaryMin || activeState.salaryMax) count++;
    if (activeState.dateFrom || activeState.dateTo) count++;
    return count;
  }

  // ── Render employee list ──
  function renderEmployees(filtered) {
    if (filtered.length === 0) {
      employeeList.innerHTML = `<div class="no-results">No employees match the current filters.</div>`;
      return;
    }

    employeeList.innerHTML = filtered
      .map((emp) => {
        const statusClass =
          emp.status === "Active"
            ? "status-active"
            : emp.status === "Inactive"
              ? "status-inactive"
              : "status-leave";
        const salary = emp.salary.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        });
        const date = new Date(emp.startDate + "T00:00:00").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        return `
        <div class="employee-card">
          <div class="employee-avatar" style="background: ${emp.color}20; color: ${emp.color}; border: 1px solid ${emp.color}30">${emp.initials}</div>
          <div class="employee-info">
            <div class="employee-name">${emp.name}</div>
            <div class="employee-meta">${emp.dept} · Joined ${date}</div>
          </div>
          <div class="employee-salary">${salary}</div>
          <span class="status-badge ${statusClass}">${emp.status}</span>
        </div>
      `;
      })
      .join("");
  }

  // ── Render chips ──
  function renderChips() {
    const chips = [];

    if (activeState.search) {
      chips.push({
        label: `Search: "${activeState.search}"`,
        remove: () => {
          activeState.search = "";
          searchInput.value = "";
        },
      });
    }
    if (activeState.depts.length > 0) {
      chips.push({
        label: `Dept: ${activeState.depts.join(", ")}`,
        remove: () => {
          activeState.depts = [];
          deptChecks.forEach((c) => {
            c.checked = false;
          });
        },
      });
    }
    if (activeState.status !== "all") {
      chips.push({
        label: `Status: ${activeState.status}`,
        remove: () => {
          activeState.status = "all";
          statusGroup
            .querySelectorAll(".toggle-btn")
            .forEach((b) => b.classList.toggle("active", b.dataset.value === "all"));
        },
      });
    }
    if (activeState.salaryMin || activeState.salaryMax) {
      const min = activeState.salaryMin
        ? `$${Number(activeState.salaryMin).toLocaleString()}`
        : "Any";
      const max = activeState.salaryMax
        ? `$${Number(activeState.salaryMax).toLocaleString()}`
        : "Any";
      chips.push({
        label: `Salary: ${min} – ${max}`,
        remove: () => {
          activeState.salaryMin = "";
          activeState.salaryMax = "";
          salaryMin.value = "";
          salaryMax.value = "";
        },
      });
    }
    if (activeState.dateFrom || activeState.dateTo) {
      const from = activeState.dateFrom || "Any";
      const to = activeState.dateTo || "Any";
      chips.push({
        label: `Date: ${from} – ${to}`,
        remove: () => {
          activeState.dateFrom = "";
          activeState.dateTo = "";
          dateFrom.value = "";
          dateTo.value = "";
        },
      });
    }

    activeChips.innerHTML = chips
      .map(
        (chip, i) => `
      <span class="chip">
        ${chip.label}
        <button class="chip-remove" data-index="${i}" aria-label="Remove filter">&times;</button>
      </span>
    `
      )
      .join("");

    activeChips.querySelectorAll(".chip-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        chips[Number(btn.dataset.index)].remove();
        applyFilters();
      });
    });
  }

  function applyFilters() {
    const filtered = getFilteredEmployees();
    renderEmployees(filtered);
    renderChips();
    const count = countActiveFilters();
    filterCountBadge.textContent = count;
    filterCountBadge.dataset.count = count;
    resultsCount.textContent = `Showing ${filtered.length} of ${EMPLOYEES.length} employees`;
  }

  // ── Sync inputs to state ──
  searchInput.addEventListener("input", () => {
    activeState.search = searchInput.value;
    applyFilters();
  });

  deptChecks.forEach((cb) => {
    cb.addEventListener("change", () => {
      activeState.depts = Array.from(deptChecks)
        .filter((c) => c.checked)
        .map((c) => c.value);
      applyFilters();
    });
  });

  statusGroup.addEventListener("click", (e) => {
    const btn = e.target.closest(".toggle-btn");
    if (!btn) return;
    statusGroup.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeState.status = btn.dataset.value;
    applyFilters();
  });

  salaryMin.addEventListener("input", () => {
    activeState.salaryMin = salaryMin.value;
    applyFilters();
  });
  salaryMax.addEventListener("input", () => {
    activeState.salaryMax = salaryMax.value;
    applyFilters();
  });
  dateFrom.addEventListener("change", () => {
    activeState.dateFrom = dateFrom.value;
    applyFilters();
  });
  dateTo.addEventListener("change", () => {
    activeState.dateTo = dateTo.value;
    applyFilters();
  });

  // ── Clear all ──
  clearAllBtn.addEventListener("click", () => {
    activeState = {
      search: "",
      depts: [],
      status: "all",
      salaryMin: "",
      salaryMax: "",
      dateFrom: "",
      dateTo: "",
    };
    searchInput.value = "";
    deptChecks.forEach((c) => {
      c.checked = false;
    });
    statusGroup
      .querySelectorAll(".toggle-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.value === "all"));
    salaryMin.value = "";
    salaryMax.value = "";
    dateFrom.value = "";
    dateTo.value = "";
    presetSelect.value = "";
    applyFilters();
  });

  // ── Presets ──
  presetSelect.addEventListener("change", () => {
    const idx = presetSelect.value;
    if (idx === "") return;
    const preset = presets[Number(idx)];
    if (!preset) return;
    activeState = { ...preset.state };

    // Sync UI to loaded state
    searchInput.value = activeState.search;
    deptChecks.forEach((c) => {
      c.checked = activeState.depts.includes(c.value);
    });
    statusGroup
      .querySelectorAll(".toggle-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.value === activeState.status));
    salaryMin.value = activeState.salaryMin;
    salaryMax.value = activeState.salaryMax;
    dateFrom.value = activeState.dateFrom;
    dateTo.value = activeState.dateTo;
    applyFilters();
  });

  savePresetBtn.addEventListener("click", () => {
    presetNameInput.value = "";
    presetModal.hidden = false;
    presetNameInput.focus();
  });

  modalCancel.addEventListener("click", () => {
    presetModal.hidden = true;
  });

  modalSave.addEventListener("click", () => {
    const name = presetNameInput.value.trim();
    if (!name) {
      presetNameInput.focus();
      return;
    }
    presets.push({ name, state: { ...activeState } });
    savePresets(presets);
    renderPresetSelect();
    presetModal.hidden = true;
  });

  presetModal.addEventListener("click", (e) => {
    if (e.target === presetModal) presetModal.hidden = true;
  });

  // ── Sidebar toggle (mobile) ──
  toggleSidebarBtn.addEventListener("click", () => {
    filterSidebar.classList.toggle("hidden");
  });

  // ── Init ──
  applyFilters();
})();
