<script setup>
import { ref, computed, onMounted, watch } from "vue";

const STATUS_OPTIONS = ["active", "pending", "archived"];

const DATA = [
  { id: 1, title: "Payment retries", status: "active", type: "workflow" },
  { id: 2, title: "Onboarding copy", status: "pending", type: "content" },
  { id: 3, title: "API docs refresh", status: "active", type: "docs" },
  { id: 4, title: "Quarterly report", status: "archived", type: "analytics" },
  { id: 5, title: "Token rotation", status: "pending", type: "security" },
  { id: 6, title: "Usage dashboard", status: "active", type: "analytics" },
  { id: 7, title: "Support macros", status: "archived", type: "ops" },
];

const q = ref("");
const statuses = ref([]);
const canSyncHistory = ref(false);

onMounted(() => {
  canSyncHistory.value =
    typeof window !== "undefined" && !window.location.href.startsWith("about:srcdoc");

  const params = new URLSearchParams(window.location.search);
  q.value = params.get("q") ?? "";
  const parsedStatuses = (params.get("status") ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter((v) => STATUS_OPTIONS.includes(v));
  statuses.value = parsedStatuses;
});

watch(
  [q, statuses],
  () => {
    if (!canSyncHistory.value) return;
    const params = new URLSearchParams();
    const trimmed = q.value.trim();
    if (trimmed) params.set("q", trimmed);
    if (statuses.value.length > 0) params.set("status", statuses.value.join(","));
    const next = params.toString();
    const nextUrl = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    try {
      window.history.replaceState({}, "", nextUrl);
    } catch {
      // ignore
    }
  },
  { deep: true }
);

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase();
  return DATA.filter((item) => {
    const queryMatch =
      query.length === 0 || `${item.title} ${item.type}`.toLowerCase().includes(query);
    const statusMatch = statuses.value.length === 0 || statuses.value.includes(item.status);
    return queryMatch && statusMatch;
  });
});

function toggleStatus(status) {
  if (statuses.value.includes(status)) {
    statuses.value = statuses.value.filter((v) => v !== status);
  } else {
    statuses.value = [...statuses.value, status];
  }
}

function clearFilters() {
  q.value = "";
  statuses.value = [];
}

function statusBadgeClass(status) {
  if (status === "active")
    return {
      borderColor: "rgba(52,211,153,0.3)",
      background: "rgba(16,185,129,0.1)",
      color: "#6ee7b7",
    };
  if (status === "pending")
    return {
      borderColor: "rgba(251,191,36,0.3)",
      background: "rgba(245,158,11,0.1)",
      color: "#fcd34d",
    };
  return {
    borderColor: "rgba(148,163,184,0.3)",
    background: "rgba(100,116,139,0.1)",
    color: "#cbd5e1",
  };
}

function filterLabelStyle(selected) {
  return {
    display: "flex",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "0.375rem",
    border: `1px solid ${selected ? "rgba(56,189,248,0.4)" : "#30363d"}`,
    padding: "0.5rem 0.625rem",
    fontSize: "0.875rem",
    textTransform: "capitalize",
    background: selected ? "rgba(14,165,233,0.1)" : "#0d1117",
    color: selected ? "#bae6fd" : "#c9d1d9",
  };
}
</script>

<template>
  <section style="min-height: 100vh; background: #0d1117; padding: 1rem 1rem; color: #e6edf3; font-family: system-ui, -apple-system, sans-serif;">
    <div style="margin: 0 auto; max-width: 72rem; display: grid; gap: 1rem; grid-template-columns: 280px minmax(0, 1fr);">
      <aside style="display: flex; flex-direction: column; gap: 1rem; border-radius: 1rem; border: 1px solid #30363d; background: #161b22; padding: 1rem;">
        <div>
          <p style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #8b949e;">Pattern</p>
          <h1 style="margin-top: 0.25rem; font-size: 1.125rem; font-weight: 700;">Search + Filter</h1>
          <p style="margin-top: 0.25rem; font-size: 0.875rem; color: #8b949e;">Filter items by text query and status facets.</p>
        </div>

        <label style="display: grid; gap: 0.375rem; font-size: 0.75rem; font-weight: 600; color: #8b949e;">
          Search
          <input
            v-model="q"
            placeholder="Find resources"
            style="border-radius: 0.5rem; border: 1px solid #30363d; background: #0d1117; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #e6edf3; outline: none;"
          />
        </label>

        <fieldset style="border-radius: 0.5rem; border: 1px solid #30363d; padding: 0.75rem;">
          <legend style="padding: 0 0.25rem; font-size: 0.75rem; font-weight: 600; color: #8b949e;">Status</legend>
          <div style="margin-top: 0.25rem; display: grid; gap: 0.5rem;">
            <label
              v-for="status in STATUS_OPTIONS"
              :key="status"
              :style="filterLabelStyle(statuses.includes(status))"
            >
              <span>{{ status }}</span>
              <input
                type="checkbox"
                :checked="statuses.includes(status)"
                @change="toggleStatus(status)"
                style="width: 14px; height: 14px; accent-color: #38bdf8;"
              />
            </label>
          </div>
        </fieldset>

        <button
          @click="clearFilters"
          style="width: 100%; border-radius: 0.5rem; border: 1px solid #30363d; background: #0d1117; padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 600; color: #c9d1d9; cursor: pointer;"
        >
          Clear filters
        </button>

        <p style="font-size: 0.75rem; color: #6e7681;">
          URL sync works outside <code style="color: #9fb3c8;">srcdoc</code>: <code style="color: #9fb3c8;">?q=&amp;status=active</code>
        </p>
      </aside>

      <section style="border-radius: 1rem; border: 1px solid #30363d; background: #161b22; padding: 1rem;">
        <header style="margin-bottom: 0.75rem; display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; border-bottom: 1px solid #21262d; padding-bottom: 0.75rem;">
          <div>
            <h2 style="font-size: 1rem; font-weight: 700;">Results</h2>
            <p style="font-size: 0.75rem; color: #8b949e;">
              Query: <span style="color: #c9d1d9;">{{ q.trim() || "none" }}</span>
            </p>
          </div>
          <p style="font-size: 0.75rem; font-weight: 600; color: #8b949e;">{{ filtered.length }} results</p>
        </header>

        <ul style="display: grid; gap: 0.5rem; list-style: none; padding: 0; margin: 0;">
          <li
            v-for="item in filtered"
            :key="item.id"
            style="border-radius: 0.75rem; border: 1px solid #30363d; background: rgba(13,17,23,0.5); padding: 0.625rem 0.75rem;"
          >
            <p style="font-size: 0.875rem; font-weight: 600; color: #e6edf3;">{{ item.title }}</p>
            <div style="margin-top: 0.25rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #8b949e;">
              <span style="border-radius: 999px; border: 1px solid #30363d; padding: 0.125rem 0.5rem; text-transform: capitalize; color: #9fb3c8;">
                {{ item.type }}
              </span>
              <span
                :style="{
                  borderRadius: '999px',
                  border: '1px solid',
                  padding: '0.125rem 0.5rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  ...statusBadgeClass(item.status),
                }"
              >
                {{ item.status }}
              </span>
            </div>
          </li>
          <li
            v-if="filtered.length === 0"
            style="border-radius: 0.75rem; border: 1px dashed #30363d; background: rgba(13,17,23,0.45); padding: 1.5rem 1rem; text-align: center; font-size: 0.875rem; color: #8b949e;"
          >
            No resources match this filter set.
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>
