(() => {
  const seedRows = [
    { id: 1, name: "Lia Stone", role: "Engineer", status: "active", email: "lia@example.com" },
    { id: 2, name: "Milo Park", role: "Designer", status: "pending", email: "milo@example.com" },
    { id: 3, name: "Aya Reed", role: "Product", status: "active", email: "aya@example.com" },
    { id: 4, name: "Noah Cruz", role: "Engineer", status: "inactive", email: "noah@example.com" },
    { id: 5, name: "Zoe Hart", role: "Designer", status: "active", email: "zoe@example.com" },
    { id: 6, name: "Eli Frost", role: "Product", status: "pending", email: "eli@example.com" },
    { id: 7, name: "Ira Blake", role: "Engineer", status: "active", email: "ira@example.com" },
  ];

  let rows = seedRows.slice();
  let sortKey = "id";
  let sortDir = "asc";
  let page = 1;
  const pageSize = 5;
  let editingId = null;

  const body = document.getElementById("table-body");
  const summary = document.getElementById("summary");
  const pageIndicator = document.getElementById("page-indicator");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  const form = document.getElementById("record-form");
  const title = document.getElementById("form-title");
  const nameInput = document.getElementById("name");
  const roleInput = document.getElementById("role");
  const statusInput = document.getElementById("status");
  const emailInput = document.getElementById("email");
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const error = document.getElementById("form-error");

  const getSortedRows = () => {
    const next = rows.slice();
    next.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      if (left === right) return 0;
      if (typeof left === "number" && typeof right === "number") {
        return sortDir === "asc" ? left - right : right - left;
      }
      return sortDir === "asc"
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left));
    });
    return next;
  };

  const getPageRows = () => {
    const sorted = getSortedRows();
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  };

  const render = () => {
    const sorted = getSortedRows();
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    if (page > totalPages) page = totalPages;

    body.innerHTML = "";
    const pageRows = getPageRows();

    for (const row of pageRows) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.id}</td>
        <td>${row.name}</td>
        <td>${row.role}</td>
        <td><span class="status ${row.status}">${row.status}</span></td>
        <td>${row.email}</td>
        <td>
          <div class="row-actions">
            <button type="button" data-edit="${row.id}">Edit</button>
            <button type="button" class="danger" data-delete="${row.id}">Delete</button>
          </div>
        </td>
      `;
      body.appendChild(tr);
    }

    summary.textContent = `Showing ${pageRows.length} of ${rows.length} rows`;
    pageIndicator.textContent = `Page ${page} / ${totalPages}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
  };

  const resetForm = () => {
    form.reset();
    editingId = null;
    title.textContent = "Add user";
    saveBtn.textContent = "Add record";
    cancelBtn.hidden = true;
    error.textContent = "";
  };

  const fillForm = (row) => {
    editingId = row.id;
    title.textContent = `Edit user #${row.id}`;
    saveBtn.textContent = "Save changes";
    cancelBtn.hidden = false;
    nameInput.value = row.name;
    roleInput.value = row.role;
    statusInput.value = row.status;
    emailInput.value = row.email;
    error.textContent = "";
  };

  const sortButtons = document.querySelectorAll("th button[data-sort]");
  for (const btn of sortButtons) {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-sort");
      if (!key) return;
      if (sortKey === key) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDir = "asc";
      }
      page = 1;
      render();
    });
  }

  body.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const editId = target.getAttribute("data-edit");
    if (editId) {
      const row = rows.find((item) => item.id === Number(editId));
      if (row) fillForm(row);
      return;
    }

    const deleteId = target.getAttribute("data-delete");
    if (deleteId) {
      rows = rows.filter((item) => item.id !== Number(deleteId));
      if (editingId === Number(deleteId)) resetForm();
      render();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleInput.value;
    const status = statusInput.value;

    if (name.length < 2) {
      error.textContent = "Name must contain at least 2 characters.";
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      error.textContent = "Please provide a valid email address.";
      return;
    }

    if (editingId === null) {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      rows.unshift({ id: nextId, name, role, status, email });
    } else {
      rows = rows.map((row) => {
        if (row.id !== editingId) return row;
        return { ...row, name, role, status, email };
      });
    }

    page = 1;
    resetForm();
    render();
  });

  cancelBtn.addEventListener("click", resetForm);

  prevBtn.addEventListener("click", () => {
    page -= 1;
    render();
  });

  nextBtn.addEventListener("click", () => {
    page += 1;
    render();
  });

  render();
})();
