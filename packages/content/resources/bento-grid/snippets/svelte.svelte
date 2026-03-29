<script>
import { onMount } from "svelte";

let visibleItems = new Set();

function reveal(node, { index = 0 }) {
  const timer = setTimeout(() => {
    node.style.opacity = "1";
    node.style.transform = "translateY(0)";
  }, index * 80);
  return {
    destroy() {
      clearTimeout(timer);
    },
  };
}

const items = [
  {
    colSpan: 2,
    rowSpan: 2,
    icon: "♦",
    iconColor: "#22d3ee",
    title: "Analytics Dashboard",
    desc: "Real-time metrics and charts with interactive filters and drill-down capabilities.",
    hasChart: true,
  },
  {
    colSpan: 1,
    rowSpan: 1,
    icon: "✳",
    iconColor: "#a855f7",
    title: "Authentication",
    desc: "Secure login with OAuth, 2FA, and session management.",
  },
  {
    colSpan: 1,
    rowSpan: 1,
    icon: "✦",
    iconColor: "#34d399",
    title: "API Gateway",
    desc: "Rate limiting, caching, and request routing.",
  },
  {
    colSpan: 2,
    rowSpan: 1,
    icon: "❇",
    iconColor: "#f59e0b",
    title: "Team Collaboration",
    desc: "Real-time editing, comments, and shared workspaces for your entire team.",
    hasAvatars: true,
  },
  {
    colSpan: 1,
    rowSpan: 1,
    icon: "♥",
    iconColor: "#ec4899",
    title: "Notifications",
    desc: "Push, email, and in-app alerts.",
  },
];
const chartBars = [60, 85, 45, 70, 90, 55, 75];
const avatars = [
  { initials: "SC", bg: "#22d3ee" },
  { initials: "JD", bg: "#a855f7" },
  { initials: "MK", bg: "#34d399" },
  { initials: "AL", bg: "#f59e0b" },
];
</script>

<div style="min-height:100vh;display:grid;place-items:center;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;padding:2rem">
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;width:100%;max-width:900px">
    {#each items as item, idx}
      <div
        use:reveal={{ index: idx }}
        style="grid-column:span {item.colSpan};grid-row:span {item.rowSpan};padding:1.5rem;border-radius:1rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;gap:0.75rem;opacity:0;transform:translateY(16px);transition:opacity 0.5s ease, transform 0.5s ease, border-color 0.2s ease, background 0.2s ease"
        on:mouseenter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
        on:mouseleave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
      >
        <div style="width:40px;height:40px;display:grid;place-items:center;border-radius:0.75rem;font-size:1.125rem;background:{item.iconColor}1a;color:{item.iconColor}">{item.icon}</div>
        <h3 style="font-size:1rem;font-weight:700;color:#f1f5f9;margin:0">{item.title}</h3>
        <p style="font-size:0.8125rem;line-height:1.55;color:#94a3b8;margin:0">{item.desc}</p>
        {#if item.hasChart}
          <div style="display:flex;align-items:flex-end;gap:0.5rem;height:80px;margin-top:auto;padding-top:1rem">
            {#each chartBars as h}
              <div style="flex:1;height:{h}%;border-radius:0.25rem 0.25rem 0 0;background:linear-gradient(to top,rgba(34,211,238,0.3),rgba(34,211,238,0.1));border:1px solid rgba(34,211,238,0.2);border-bottom:none"></div>
            {/each}
          </div>
        {/if}
        {#if item.hasAvatars}
          <div style="display:flex;margin-top:0.5rem">
            {#each avatars as a, i}
              <div style="width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:0.6875rem;font-weight:700;color:#0a0a0a;background:{a.bg};border:2px solid #0a0a0a;margin-left:{i === 0 ? '0' : '-8px'}">{a.initials}</div>
            {/each}
            <div style="width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:0.6875rem;font-weight:600;color:#94a3b8;background:rgba(255,255,255,0.1);border:2px solid #0a0a0a;margin-left:-8px">+5</div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
