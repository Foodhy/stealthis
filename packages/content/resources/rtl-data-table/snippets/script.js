(() => {
  const html = document.documentElement;
  const dirToggle = document.getElementById("dir-toggle");
  const dirLabel = document.getElementById("dir-label");
  const searchInput = document.getElementById("search-input");
  const tableBody = document.getElementById("table-body");
  const pageInfo = document.getElementById("page-info");
  const pageControls = document.getElementById("page-controls");
  const recordCount = document.getElementById("record-count");

  const ROWS_PER_PAGE = 5;
  let currentPage = 1;
  let sortCol = null;
  let sortDir = null;

  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
    "#22c55e",
    "#f59e0b",
    "#06b6d4",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f97316",
    "#a855f7",
    "#10b981",
  ];

  const DATA = [
    {
      name: "Ahmed Hassan",
      department: "Engineering",
      role: "Senior Developer",
      location: "Cairo",
      status: "active",
      joined: "2023-01-15",
    },
    {
      name: "Sara Al-Rashid",
      department: "Design",
      role: "UI/UX Lead",
      location: "Dubai",
      status: "active",
      joined: "2022-06-22",
    },
    {
      name: "Mohamed Youssef",
      department: "Engineering",
      role: "Backend Developer",
      location: "Riyadh",
      status: "away",
      joined: "2023-03-10",
    },
    {
      name: "Layla Mahmoud",
      department: "Marketing",
      role: "Content Manager",
      location: "Amman",
      status: "active",
      joined: "2022-11-05",
    },
    {
      name: "Omar Khalil",
      department: "Product",
      role: "Product Manager",
      location: "Cairo",
      status: "active",
      joined: "2021-09-18",
    },
    {
      name: "Fatima Nasser",
      department: "Engineering",
      role: "Frontend Developer",
      location: "Dubai",
      status: "offline",
      joined: "2023-07-01",
    },
    {
      name: "Khalid Ibrahim",
      department: "Sales",
      role: "Sales Director",
      location: "Jeddah",
      status: "active",
      joined: "2020-04-12",
    },
    {
      name: "Nour Amin",
      department: "Design",
      role: "Brand Designer",
      location: "Beirut",
      status: "away",
      joined: "2023-02-28",
    },
    {
      name: "Youssef Tamer",
      department: "Engineering",
      role: "DevOps Engineer",
      location: "Cairo",
      status: "active",
      joined: "2022-08-15",
    },
    {
      name: "Hana Al-Saud",
      department: "HR",
      role: "HR Manager",
      location: "Riyadh",
      status: "active",
      joined: "2021-12-01",
    },
    {
      name: "Ali Farouk",
      department: "Engineering",
      role: "QA Engineer",
      location: "Amman",
      status: "offline",
      joined: "2023-05-20",
    },
    {
      name: "Reem Abdullah",
      department: "Finance",
      role: "Financial Analyst",
      location: "Dubai",
      status: "active",
      joined: "2022-10-08",
    },
  ];

  let filteredData = [...DATA];

  /* ── Direction toggle ── */
  dirToggle.addEventListener("click", () => {
    const isRtl = html.getAttribute("dir") === "rtl";
    const newDir = isRtl ? "ltr" : "rtl";
    html.setAttribute("dir", newDir);
    html.setAttribute("lang", isRtl ? "en" : "ar");
    dirLabel.textContent = newDir.toUpperCase();
  });

  /* ── Initials ── */
  function getInitials(name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  /* ── Search ── */
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();
    filteredData = DATA.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.role.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
    );
    currentPage = 1;
    applySort();
    render();
  });

  /* ── Sort ── */
  document.querySelectorAll(".sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (sortCol === col) {
        sortDir = sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc";
      } else {
        sortCol = col;
        sortDir = "asc";
      }

      if (!sortDir) sortCol = null;

      /* Update header classes */
      document.querySelectorAll(".sortable").forEach((h) => {
        h.classList.remove("asc", "desc");
      });
      if (sortDir) th.classList.add(sortDir);

      applySort();
      render();
    });
  });

  function applySort() {
    if (!sortCol || !sortDir) {
      filteredData = DATA.filter((d) => {
        const q = searchInput.value.toLowerCase().trim();
        return (
          d.name.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
        );
      });
      return;
    }

    filteredData.sort((a, b) => {
      let va = a[sortCol];
      let vb = b[sortCol];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  /* ── Render ── */
  function render() {
    const total = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = Math.min(start + ROWS_PER_PAGE, total);
    const pageData = filteredData.slice(start, end);

    recordCount.textContent = total + " record" + (total !== 1 ? "s" : "");

    /* Render rows */
    tableBody.innerHTML = pageData
      .map((d, i) => {
        const color = COLORS[(start + i) % COLORS.length];
        const initials = getInitials(d.name);
        return `
          <tr>
            <td>
              <div class="name-cell">
                <div class="name-avatar" style="background:${color}">${initials}</div>
                <span class="name-text">${d.name}</span>
              </div>
            </td>
            <td>${d.department}</td>
            <td>${d.role}</td>
            <td>${d.location}</td>
            <td>
              <span class="status-badge ${d.status}">
                <span class="dot"></span>
                ${d.status.charAt(0).toUpperCase() + d.status.slice(1)}
              </span>
            </td>
            <td>${d.joined}</td>
          </tr>
        `;
      })
      .join("");

    /* Page info */
    if (total === 0) {
      pageInfo.textContent = "No results found";
    } else {
      pageInfo.textContent = `Showing ${start + 1}\u2013${end} of ${total}`;
    }

    /* Page controls */
    let btns = "";
    btns += `<button class="page-btn prev" ${currentPage <= 1 ? "disabled" : ""} data-page="${currentPage - 1}">&#8249;</button>`;

    for (let p = 1; p <= totalPages; p++) {
      btns += `<button class="page-btn ${p === currentPage ? "active" : ""}" data-page="${p}">${p}</button>`;
    }

    btns += `<button class="page-btn next" ${currentPage >= totalPages ? "disabled" : ""} data-page="${currentPage + 1}">&#8250;</button>`;

    pageControls.innerHTML = btns;

    /* Bind page buttons */
    pageControls.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = parseInt(btn.dataset.page, 10);
        if (p >= 1 && p <= totalPages) {
          currentPage = p;
          render();
        }
      });
    });
  }

  /* Initial render */
  render();
})();
