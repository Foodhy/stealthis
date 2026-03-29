<script setup>
import { ref, computed, watch } from "vue";

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

const rows = ref([...seedRows]);
const sortKey = ref("id");
const sortDir = ref("asc");
const page = ref(1);
const editingId = ref(null);
const error = ref("");
const formName = ref("");
const formEmail = ref("");
const formRole = ref("Engineer");
const formStatus = ref("active");

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "email", label: "Email" },
];

const sorted = computed(() => {
  const arr = rows.value.slice();
  arr.sort((a, b) => {
    const left = a[sortKey.value];
    const right = b[sortKey.value];
    if (left === right) return 0;
    if (typeof left === "number" && typeof right === "number") {
      return sortDir.value === "asc" ? left - right : right - left;
    }
    return sortDir.value === "asc"
      ? String(left).localeCompare(String(right))
      : String(right).localeCompare(String(left));
  });
  return arr;
});

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / PAGE_SIZE)));
const safePage = computed(() => Math.min(page.value, totalPages.value));
const visible = computed(() =>
  sorted.value.slice((safePage.value - 1) * PAGE_SIZE, safePage.value * PAGE_SIZE)
);

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
});

function onSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
  page.value = 1;
}

function sortIndicator(key) {
  if (sortKey.value !== key) return "\u21D5";
  return sortDir.value === "asc" ? "\u2191" : "\u2193";
}

function resetForm() {
  editingId.value = null;
  formName.value = "";
  formEmail.value = "";
  formRole.value = "Engineer";
  formStatus.value = "active";
  error.value = "";
}

function submit() {
  if (formName.value.trim().length < 2) {
    error.value = "Name must contain at least 2 characters.";
    return;
  }
  if (!formEmail.value.includes("@") || !formEmail.value.includes(".")) {
    error.value = "Please provide a valid email address.";
    return;
  }
  if (editingId.value === null) {
    const nextId = rows.value.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    rows.value = [
      {
        id: nextId,
        name: formName.value,
        role: formRole.value,
        status: formStatus.value,
        email: formEmail.value,
      },
      ...rows.value,
    ];
  } else {
    rows.value = rows.value.map((r) =>
      r.id === editingId.value
        ? {
            ...r,
            name: formName.value,
            role: formRole.value,
            status: formStatus.value,
            email: formEmail.value,
          }
        : r
    );
  }
  page.value = 1;
  resetForm();
}

function editRow(row) {
  editingId.value = row.id;
  formName.value = row.name;
  formRole.value = row.role;
  formStatus.value = row.status;
  formEmail.value = row.email;
  error.value = "";
}

function deleteRow(id) {
  rows.value = rows.value.filter((r) => r.id !== id);
}

function statusStyle(status) {
  if (status === "active")
    return "background:rgba(16,185,129,0.15);color:#6ee7b7;border:1px solid rgba(52,211,153,0.25)";
  if (status === "pending")
    return "background:rgba(245,158,11,0.15);color:#fcd34d;border:1px solid rgba(251,191,36,0.25)";
  return "background:rgba(100,116,139,0.2);color:#cbd5e1;border:1px solid rgba(148,163,184,0.25)";
}
</script>

<template>
  <section style="min-height:100vh;background:#0d1117;padding:1.5rem 1rem;font-family:system-ui,-apple-system,sans-serif;color:#e6edf3">
    <div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:1rem">
      <!-- Header -->
      <header style="border-radius:1rem;border:1px solid #30363d;background:#161b22;padding:1rem">
        <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b949e;margin:0">Pattern</p>
        <h1 style="margin:0.25rem 0 0;font-size:1.125rem;font-weight:700;color:#e6edf3">CRUD Table</h1>
        <p style="margin:0.25rem 0 0;font-size:0.875rem;color:#8b949e">Create, edit, delete, sort, and paginate rows in a single table flow.</p>
      </header>

      <!-- Form -->
      <form @submit.prevent="submit" style="border-radius:1rem;border:1px solid #30363d;background:#161b22;padding:1rem">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.5rem">
          <input v-model="formName" placeholder="Full name" style="border-radius:0.5rem;border:1px solid #30363d;background:#0d1117;padding:0.5rem 0.75rem;font-size:0.875rem;color:#e6edf3;outline:none" />
          <input v-model="formEmail" placeholder="work@email.com" style="border-radius:0.5rem;border:1px solid #30363d;background:#0d1117;padding:0.5rem 0.75rem;font-size:0.875rem;color:#e6edf3;outline:none" />
          <select v-model="formRole" style="border-radius:0.5rem;border:1px solid #30363d;background:#0d1117;padding:0.5rem 0.75rem;font-size:0.875rem;color:#e6edf3;outline:none">
            <option v-for="r in ROLE_OPTIONS" :key="r" :value="r">{{ r }}</option>
          </select>
          <select v-model="formStatus" style="border-radius:0.5rem;border:1px solid #30363d;background:#0d1117;padding:0.5rem 0.75rem;font-size:0.875rem;color:#e6edf3;outline:none">
            <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
          </select>
          <button type="submit" style="border-radius:0.5rem;border:1px solid rgba(88,166,255,0.4);background:rgba(88,166,255,0.15);padding:0.5rem 1rem;font-size:0.875rem;font-weight:600;color:#c9e6ff;cursor:pointer">
            {{ editingId === null ? 'Add row' : 'Save' }}
          </button>
          <button v-if="editingId !== null" type="button" @click="resetForm" style="border-radius:0.5rem;border:1px solid #30363d;background:transparent;padding:0.5rem 1rem;font-size:0.875rem;font-weight:600;color:#9ca3af;cursor:pointer">
            Cancel
          </button>
        </div>
        <p style="margin-top:0.5rem;min-height:1.25rem;font-size:0.75rem;color:#f87171">{{ error }}</p>
      </form>

      <!-- Table -->
      <div style="border-radius:1rem;border:1px solid #30363d;background:#161b22;overflow:hidden">
        <div style="overflow-x:auto">
          <table style="width:100%;min-width:700px;text-align:left;font-size:0.875rem;border-collapse:collapse">
            <thead style="background:#21262d;color:#c9d1d9">
              <tr>
                <th v-for="col in columns" :key="col.key" style="padding:0.75rem 1rem;font-weight:600">
                  <button type="button" @click="onSort(col.key)" style="background:none;border:none;color:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:0.25rem;font-weight:600;font-size:0.875rem">
                    {{ col.label }}
                    <span style="font-size:0.75rem;color:#8b949e">{{ sortIndicator(col.key) }}</span>
                  </button>
                </th>
                <th style="padding:0.75rem 1rem;font-weight:600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in visible" :key="row.id" style="border-top:1px solid #21262d;color:#e6edf3">
                <td style="padding:0.75rem 1rem;font-family:monospace;font-size:0.75rem;color:#9ca3af">{{ row.id }}</td>
                <td style="padding:0.75rem 1rem;font-weight:500">{{ row.name }}</td>
                <td style="padding:0.75rem 1rem;color:#c9d1d9">{{ row.role }}</td>
                <td style="padding:0.75rem 1rem">
                  <span :style="statusStyle(row.status) + ';display:inline-flex;border-radius:0.375rem;padding:0.25rem 0.5rem;font-size:0.75rem;font-weight:600'">{{ row.status }}</span>
                </td>
                <td style="padding:0.75rem 1rem;color:#9fb3c8">{{ row.email }}</td>
                <td style="padding:0.75rem 1rem">
                  <div style="display:flex;gap:0.5rem">
                    <button type="button" @click="editRow(row)" style="border-radius:0.375rem;border:1px solid rgba(61,93,138,0.4);background:rgba(88,166,255,0.1);padding:0.25rem 0.625rem;font-size:0.75rem;font-weight:600;color:#9ed0ff;cursor:pointer">Edit</button>
                    <button type="button" @click="deleteRow(row.id)" style="border-radius:0.375rem;border:1px solid rgba(244,63,94,0.35);background:rgba(244,63,94,0.1);padding:0.25rem 0.625rem;font-size:0.75rem;font-weight:600;color:#fda4af;cursor:pointer">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="visible.length === 0">
                <td colspan="6" style="padding:2rem 1rem;text-align:center;font-size:0.875rem;color:#8b949e">No rows available.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #21262d;padding:0.75rem 1rem;font-size:0.875rem">
          <p style="color:#8b949e;margin:0">Page <span style="color:#e6edf3">{{ safePage }}</span> of <span style="color:#e6edf3">{{ totalPages }}</span></p>
          <div style="display:flex;gap:0.5rem">
            <button type="button" :disabled="safePage <= 1" @click="page = Math.max(1, page - 1)" style="border-radius:0.375rem;border:1px solid #30363d;background:transparent;padding:0.375rem 0.75rem;font-size:0.75rem;font-weight:600;color:#c9d1d9;cursor:pointer" :style="{ opacity: safePage <= 1 ? 0.4 : 1 }">Prev</button>
            <button type="button" :disabled="safePage >= totalPages" @click="page = Math.min(totalPages, page + 1)" style="border-radius:0.375rem;border:1px solid #30363d;background:transparent;padding:0.375rem 0.75rem;font-size:0.75rem;font-weight:600;color:#c9d1d9;cursor:pointer" :style="{ opacity: safePage >= totalPages ? 0.4 : 1 }">Next</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
