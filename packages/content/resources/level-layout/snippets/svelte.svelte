<script>
export let variant = "default";

const linkStyle = "font-size: 0.8125rem; color: #94a3b8; text-decoration: none; cursor: pointer;";
const btnStyle =
  "background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(56,189,248,0.2); padding: 0.4rem 0.875rem; font-size: 0.8125rem; font-weight: 600; font-family: inherit; border-radius: 0.5rem; cursor: pointer;";
const btnSmStyle =
  "background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(56,189,248,0.2); padding: 0.25rem 0.625rem; font-size: 0.75rem; font-weight: 600; font-family: inherit; border-radius: 0.5rem; cursor: pointer;";
const badgeStyle =
  "display: inline-flex; align-items: center; padding: 0.2rem 0.625rem; font-size: 0.6875rem; font-weight: 600; color: #38bdf8; background: rgba(56,189,248,0.1); border-radius: 999px;";

const stats = [
  { value: "128", label: "Components" },
  { value: "2.4k", label: "Downloads" },
  { value: "56", label: "Contributors" },
  { value: "4.9", label: "Rating" },
];
</script>

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
      <span
        style="display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.625rem;"
      >
        Navigation Bar
      </span>
      <div
        style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 1rem; background: #141414; border: 1px solid #1e1e1e; border-radius: 0.75rem;"
      >
        <div style="display: flex; align-items: center; gap: 0.75rem; justify-content: flex-start;">
          <span style="font-size: 1rem; font-weight: 800; color: #38bdf8; letter-spacing: -0.02em;">
            Stealthis
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem; justify-content: center;">
          <span style={linkStyle}>Home</span>
          <span style={linkStyle}>Library</span>
          <span style={linkStyle}>Docs</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem; justify-content: flex-end;">
          <button style={btnStyle}>Sign In</button>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div>
      <span
        style="display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.625rem;"
      >
        Stats Row
      </span>
      <div
        style="display: flex; align-items: center; justify-content: space-around; gap: 1rem; padding: 0.75rem 1rem; background: #141414; border: 1px solid #1e1e1e; border-radius: 0.75rem;"
      >
        {#each stats as stat}
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.125rem;">
            <span style="font-size: 1.25rem; font-weight: 800; color: #f2f6ff;">
              {stat.value}
            </span>
            <span
              style="font-size: 0.6875rem; font-weight: 500; color: #4a4a4a; text-transform: uppercase; letter-spacing: 0.05em;"
            >
              {stat.label}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Card Header -->
    <div>
      <span
        style="display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.625rem;"
      >
        Card Header
      </span>
      <div
        style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 1rem; background: #141414; border: 1px solid #1e1e1e; border-radius: 0.75rem;"
      >
        <div style="display: flex; align-items: center; gap: 0.75rem; justify-content: flex-start;">
          <h3 style="font-size: 0.9375rem; font-weight: 700; color: #f2f6ff;">Recent Activity</h3>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem; justify-content: flex-end;">
          <span style={badgeStyle}>12 new</span>
          <button style={btnSmStyle}>View All</button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div>
      <span
        style="display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.625rem;"
      >
        Footer
      </span>
      <div
        style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.625rem 1rem; background: transparent; border: 1px solid #1a1a1a; border-radius: 0.75rem;"
      >
        <div style="display: flex; align-items: center; gap: 0.75rem; justify-content: flex-start;">
          <span style="font-size: 0.8125rem; color: #4a4a4a;">&copy; 2026 Stealthis</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem; justify-content: flex-end;">
          <span style="font-size: 0.75rem; color: #4a4a4a; cursor: pointer;">Privacy</span>
          <span style="font-size: 0.75rem; color: #4a4a4a; cursor: pointer;">Terms</span>
          <span style="font-size: 0.75rem; color: #4a4a4a; cursor: pointer;">Contact</span>
        </div>
      </div>
    </div>
  </div>
</div>
