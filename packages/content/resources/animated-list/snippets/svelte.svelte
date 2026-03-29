<script>
import { onMount } from "svelte";

export let staggerDelay = 80;

const items = [
  {
    id: "1",
    title: "Build successful",
    description: "Your project compiled without errors",
    time: "2m ago",
    iconColor: "#4ade80",
    iconBg: "rgba(34,197,94,0.12)",
  },
  {
    id: "2",
    title: "New comment",
    description: "Alex left feedback on your PR",
    time: "5m ago",
    iconColor: "#60a5fa",
    iconBg: "rgba(59,130,246,0.12)",
  },
  {
    id: "3",
    title: "Disk usage warning",
    description: "Storage is at 85% capacity",
    time: "12m ago",
    iconColor: "#fbbf24",
    iconBg: "rgba(245,158,11,0.12)",
  },
  {
    id: "4",
    title: "New team member",
    description: "Jordan joined the engineering team",
    time: "1h ago",
    iconColor: "#c084fc",
    iconBg: "rgba(168,85,247,0.12)",
  },
  {
    id: "5",
    title: "Security update",
    description: "All dependencies patched successfully",
    time: "3h ago",
    iconColor: "#4ade80",
    iconBg: "rgba(34,197,94,0.12)",
  },
  {
    id: "6",
    title: "Milestone reached",
    description: "Project hit 10,000 stars on GitHub",
    time: "1d ago",
    iconColor: "#fb7185",
    iconBg: "rgba(244,63,94,0.12)",
  },
];

let visible = items.map(() => false);
let itemEls = [];

onMount(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = itemEls.indexOf(entry.target);
          if (idx !== -1) {
            visible[idx] = true;
            visible = visible;
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  itemEls.forEach((el) => {
    if (el) observer.observe(el);
  });

  return () => observer.disconnect();
});
</script>

<div
  style="min-height: 100vh; background: #0a0a0a; display: grid; place-items: center; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; color: #f1f5f9;"
>
  <div style="width: min(520px, 100%); display: flex; flex-direction: column; gap: 0.5rem;">
    <h2 style="font-size: 1.375rem; font-weight: 700; color: #f1f5f9;">Notifications</h2>
    <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 1rem;">Watch the items animate in</p>
    <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; padding: 0;">
      {#each items as item, i}
        <li
          bind:this={itemEls[i]}
          style="display: flex; align-items: center; gap: 0.875rem; padding: 0.875rem 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.875rem; opacity: {visible[i] ? 1 : 0}; transform: translateX({visible[i] ? '0' : (i % 2 === 0 ? '-30px' : '30px')}); transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1) {i * staggerDelay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) {i * staggerDelay}ms;"
        >
          <div
            style="flex-shrink: 0; width: 40px; height: 40px; border-radius: 0.625rem; display: grid; place-items: center; background: {item.iconBg}; color: {item.iconColor};"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4 12 14.01l-3-3" />
            </svg>
          </div>
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.125rem;">
            <strong style="font-size: 0.875rem; font-weight: 600; color: #e2e8f0;">{item.title}</strong>
            <span style="font-size: 0.8rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{item.description}</span>
          </div>
          {#if item.time}
            <span style="flex-shrink: 0; font-size: 0.75rem; color: #475569;">{item.time}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</div>
