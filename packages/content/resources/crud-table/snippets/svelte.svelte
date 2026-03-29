<script>
const seedRows = [
  { id: 1, name: "Lia Stone", role: "Engineer", status: "active", email: "lia@example.com" },
  { id: 2, name: "Milo Park", role: "Designer", status: "pending", email: "milo@example.com" },
  { id: 3, name: "Aya Reed", role: "Product", status: "active", email: "aya@example.com" },
  { id: 4, name: "Noah Cruz", role: "Engineer", status: "inactive", email: "noah@example.com" },
  { id: 5, name: "Zoe Hart", role: "Designer", status: "active", email: "zoe@example.com" },
  { id: 6, name: "Eli Frost", role: "Product", status: "pending", email: "eli@example.com" },
  { id: 7, name: "Ira Blake", role: "Engineer", status: "active", email: "ira@example.com" },
];

const PAGE_SIZE = 5;
const ROLE_OPTIONS = ["Engineer", "Designer", "Product"];
const STATUS_OPTIONS = ["active", "pending", "inactive"];

let rows = [...seedRows];
let sortKey = "id";
let sortDir = "asc";
let page = 1;
let editingId = null;
let error = "";
let formName = "";
let formEmail = "";
let formRole = "Engineer";
let formStatus = "active";

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "email", label: "Email" },
];

$: sorted = (() => {
  const arr = rows.slice();
  arr.sort((a, b) => {
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
  return arr;
})();

$: totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
$: safePage = Math.min(page, totalPages);
$: visible = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
$: if (page > totalPages) page = totalPages;

function onSort(key) {
  if (sortKey === key) {
    sortDir = sortDir === "asc" ? "desc" : "asc";
  } else {
    sortKey = key;
    sortDir = "asc";
  }
  page = 1;
}

function sortIndicator(key) {
  if (sortKey !== key) return "\u21D5";
  return sortDir === "asc" ? "\u2191" : "\u2193";
}

function resetForm() {
  editingId = null;
  formName = "";
  formEmail = "";
  formRole = "Engineer";
  formStatus = "active";
  error = "";
}

function submit() {
  if (formName.trim().length < 2) {
    error = "Name must contain at least 2 characters.";
    return;
  }
  if (!formEmail.includes("@") || !formEmail.includes(".")) {
    error = "Please provide a valid email address.";
    return;
  }
  if (editingId === null) {
    const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    rows = [
      { id: nextId, name: formName, role: formRole, status: formStatus, email: formEmail },
      ...rows,
    ];
  } else {
    rows = rows.map((r) =>
      r.id === editingId
        ? { ...r, name: formName, role: formRole, status: formStatus, email: formEmail }
        : r
    );
  }
  page = 1;
  resetForm();
}

function editRow(row) {
  editingId = row.id;
  formName = row.name;
  formRole = row.role;
  formStatus = row.status;
  formEmail = row.email;
  error = "";
}

function deleteRow(id) {
  rows = rows.filter((r) => r.id !== id);
}

function statusStyle(status) {
  if (status === "active")
    return "background:rgba(16,185,129,0.15);color:#6ee7b7;border:1px solid rgba(52,211,153,0.25)";
  if (status === "pending")
    return "background:rgba(245,158,11,0.15);color:#fcd34d;border:1px solid rgba(251,191,36,0.25)";
  return "background:rgba(100,116,139,0.2);color:#cbd5e1;border:1px solid rgba(148,163,184,0.25)";
}
</script>

<section style="min-height:100vh;background:#0d1117;padding:1.5rem 1rem;font-family:system-ui,-apple-system,sans-serif;color:#e6edf3">
  <div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:1rem">
    <!-- Header -->
    <header style="border-radius:1rem;border:1px solid #30363d;background:#161b22;padding:1rem">
      <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b949e;margin:0">Pattern</p>
      <h1 style="margin:0.25rem 0 0;font-size:1.125rem;font-weight:700;color:#e6edf3">CRUD Table</h1>
      <p style="margin:0.25rem 0 0;font-size:0.875rem;color:#8b949e">Create, edit, delete, sort, and paginate rows in a single table flow.</p>
    </header>

    <!-- Form -->
    <form on:submit|preventDefault={submit} style="border-radius:1rem;border:1px solid #30363d;background:#161b22;padding:1rem">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.5rem">
        <input bind:value={formName} placeholder="Full name" style="border-radius:0.5rem;border:1px solid #30363d;background:#0d1117;padding:0.5rem 0.75rem;font-size:0.875rem;color:#e6edf3;outline:none" />
        <input bind:value={formEmail} placeholder="work@email.com" style="border-radius:0.5rem;border:1px solid #30363d;background:#0d1117;padding:0.5rem 0.75rem;font-size:0.875rem;color:#e6edf3;outline:none" />
        <select bind:value={formRole} style="border-radius:0.5rem;border:1px solid #30363d;background:#0d1117;padding:0.5rem 0.75rem;font-size:0.875rem;color:#e6edf3;outline:none">
          {#each ROLE_OPTIONS as r}
            <option value={r}>{r}</option>
          {/each}
        </select>
        <select bind:value={formStatus} style="border-radius:0.5rem;border:1px solid #30363d;background:#0d1117;padding:0.5rem 0.75rem;font-size:0.875rem;color:#e6edf3;outline:none">
          {#each STATUS_OPTIONS as s}
            <option value={s}>{s}</option>
          {/each}
        </select>
        <button type="submit" style="border-radius:0.5rem;border:1px solid rgba(88,166,255,0.4);background:rgba(88,166,255,0.15);padding:0.5rem 1rem;font-size:0.875rem;font-weight:600;color:#c9e6ff;cursor:pointer">
          {editingId === null ? 'Add row' : 'Save'}
        </button>
        {#if editingId !== null}
          <button type="button" on:click={resetForm} style="border-radius:0.5rem;border:1px solid #30363d;background:transparent;padding:0.5rem 1rem;font-size:0.875rem;font-weight:600;color:#9ca3af;cursor:pointer">
            Cancel
          </button>
        {/if}
      </div>
      <p style="margin-top:0.5rem;min-height:1.25rem;font-size:0.75rem;color:#f87171">{error}</p>
    </form>

    <!-- Table -->
    <div style="border-radius:1rem;border:1px solid #30363d;background:#161b22;overflow:hidden">
      <div style="overflow-x:auto">
        <table style="width:100%;min-width:700px;text-align:left;font-size:0.875rem;border-collapse:collapse">
          <thead style="background:#21262d;color:#c9d1d9">
            <tr>
              {#each columns as col}
                <th style="padding:0.75rem 1rem;font-weight:600">
                  <button type="button" on:click={() => onSort(col.key)} style="background:none;border:none;color:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:0.25rem;font-weight:600;font-size:0.875rem">
                    {col.label}
                    <span style="font-size:0.75rem;color:#8b949e">{sortIndicator(col.key)}</span>
                  </button>
                </th>
              {/each}
              <th style="padding:0.75rem 1rem;font-weight:600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each visible as row (row.id)}
              <tr style="border-top:1px solid #21262d;color:#e6edf3">
                <td style="padding:0.75rem 1rem;font-family:monospace;font-size:0.75rem;color:#9ca3af">{row.id}</td>
                <td style="padding:0.75rem 1rem;font-weight:500">{row.name}</td>
                <td style="padding:0.75rem 1rem;color:#c9d1d9">{row.role}</td>
                <td style="padding:0.75rem 1rem">
                  <span style="{statusStyle(row.status)};display:inline-flex;border-radius:0.375rem;padding:0.25rem 0.5rem;font-size:0.75rem;font-weight:600">{row.status}</span>
                </td>
                <td style="padding:0.75rem 1rem;color:#9fb3c8">{row.email}</td>
                <td style="padding:0.75rem 1rem">
                  <div style="display:flex;gap:0.5rem">
                    <button type="button" on:click={() => editRow(row)} style="border-radius:0.375rem;border:1px solid rgba(61,93,138,0.4);background:rgba(88,166,255,0.1);padding:0.25rem 0.625rem;font-size:0.75rem;font-weight:600;color:#9ed0ff;cursor:pointer">Edit</button>
                    <button type="button" on:click={() => deleteRow(row.id)} style="border-radius:0.375rem;border:1px solid rgba(244,63,94,0.35);background:rgba(244,63,94,0.1);padding:0.25rem 0.625rem;font-size:0.75rem;font-weight:600;color:#fda4af;cursor:pointer">Delete</button>
                  </div>
                </td>
              </tr>
            {/each}
            {#if visible.length === 0}
              <tr>
                <td colspan="6" style="padding:2rem 1rem;text-align:center;font-size:0.875rem;color:#8b949e">No rows available.</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #21262d;padding:0.75rem 1rem;font-size:0.875rem">
        <p style="color:#8b949e;margin:0">Page <span style="color:#e6edf3">{safePage}</span> of <span style="color:#e6edf3">{totalPages}</span></p>
        <div style="display:flex;gap:0.5rem">
          <button type="button" disabled={safePage <= 1} on:click={() => page = Math.max(1, page - 1)} style="border-radius:0.375rem;border:1px solid #30363d;background:transparent;padding:0.375rem 0.75rem;font-size:0.75rem;font-weight:600;color:#c9d1d9;cursor:pointer;opacity:{safePage <= 1 ? 0.4 : 1}">Prev</button>
          <button type="button" disabled={safePage >= totalPages} on:click={() => page = Math.min(totalPages, page + 1)} style="border-radius:0.375rem;border:1px solid #30363d;background:transparent;padding:0.375rem 0.75rem;font-size:0.75rem;font-weight:600;color:#c9d1d9;cursor:pointer;opacity:{safePage >= totalPages ? 0.4 : 1}">Next</button>
        </div>
      </div>
    </div>
  </div>
</section>
