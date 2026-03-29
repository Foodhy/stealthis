<script setup>
const linkStyle = {
  fontSize: "0.8125rem",
  color: "#94a3b8",
  textDecoration: "none",
  cursor: "pointer",
};

const btnStyle = {
  background: "rgba(56,189,248,0.1)",
  color: "#38bdf8",
  border: "1px solid rgba(56,189,248,0.2)",
  padding: "0.4rem 0.875rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  fontFamily: "inherit",
  borderRadius: "0.5rem",
  cursor: "pointer",
};

const btnSmStyle = {
  ...btnStyle,
  padding: "0.25rem 0.625rem",
  fontSize: "0.75rem",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.2rem 0.625rem",
  fontSize: "0.6875rem",
  fontWeight: 600,
  color: "#38bdf8",
  background: "rgba(56,189,248,0.1)",
  borderRadius: "999px",
};

const stats = [
  { value: "128", label: "Components" },
  { value: "2.4k", label: "Downloads" },
  { value: "56", label: "Contributors" },
  { value: "4.9", label: "Rating" },
];
</script>

<template>
  <div
    style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; font-family: Inter, system-ui, sans-serif; color: #f2f6ff; padding: 2rem;"
  >
    <div style="width: 100%; max-width: 640px; display: flex; flex-direction: column; gap: 1.5rem;">
      <div>
        <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.375rem;">
          Level Layout
        </h1>
        <p style="color: #475569; font-size: 0.875rem;">
          Horizontal alignment with left/center/right slots.
        </p>
      </div>

      <!-- Navigation Bar -->
      <div>
        <span class="section-label">Navigation Bar</span>
        <div class="level-bar">
          <div class="slot-left">
            <span style="font-size: 1rem; font-weight: 800; color: #38bdf8; letter-spacing: -0.02em;">
              Stealthis
            </span>
          </div>
          <div class="slot-center">
            <span :style="linkStyle">Home</span>
            <span :style="linkStyle">Library</span>
            <span :style="linkStyle">Docs</span>
          </div>
          <div class="slot-right">
            <button :style="btnStyle">Sign In</button>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div>
        <span class="section-label">Stats Row</span>
        <div class="level-bar" style="justify-content: space-around;">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <span style="font-size: 1.25rem; font-weight: 800; color: #f2f6ff;">
              {{ stat.value }}
            </span>
            <span
              style="font-size: 0.6875rem; font-weight: 500; color: #4a4a4a; text-transform: uppercase; letter-spacing: 0.05em;"
            >
              {{ stat.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Card Header -->
      <div>
        <span class="section-label">Card Header</span>
        <div class="level-bar">
          <div class="slot-left">
            <h3 style="font-size: 0.9375rem; font-weight: 700; color: #f2f6ff;">Recent Activity</h3>
          </div>
          <div class="slot-right">
            <span :style="badgeStyle">12 new</span>
            <button :style="btnSmStyle">View All</button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div>
        <span class="section-label">Footer</span>
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.625rem 1rem; background: transparent; border: 1px solid #1a1a1a; border-radius: 0.75rem;"
        >
          <div class="slot-left">
            <span style="font-size: 0.8125rem; color: #4a4a4a;">&copy; 2026 Stealthis</span>
          </div>
          <div class="slot-right">
            <span style="font-size: 0.75rem; color: #4a4a4a; cursor: pointer;">Privacy</span>
            <span style="font-size: 0.75rem; color: #4a4a4a; cursor: pointer;">Terms</span>
            <span style="font-size: 0.75rem; color: #4a4a4a; cursor: pointer;">Contact</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.625rem;
}
.level-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #141414;
  border: 1px solid #1e1e1e;
  border-radius: 0.75rem;
}
.slot-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: flex-start;
}
.slot-center {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
}
.slot-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: flex-end;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}
</style>
