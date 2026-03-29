<script>
import { onMount } from "svelte";

const defaultEvents = [
  { date: "Jan 2025", title: "Research", description: "User interviews & competitive analysis" },
  { date: "Mar 2025", title: "Design", description: "Wireframes and high-fidelity prototypes" },
  { date: "Jun 2025", title: "Development", description: "Frontend and backend implementation" },
  { date: "Sep 2025", title: "Testing", description: "QA, performance, and accessibility audits" },
  { date: "Dec 2025", title: "Launch", description: "Public release and monitoring" },
];

export let events = defaultEvents;
export let radius = 250;
export let width = 600;
export let height = 380;

let containerEl;
let visible = false;

$: centerX = width / 2;
$: centerY = height - 80;
$: positions = events.map((_, i) => {
  const angle = Math.PI + (0 - Math.PI) * (i / (events.length - 1));
  return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
});
$: arcPathD =
  positions.length >= 2
    ? `M ${positions[0].x} ${positions[0].y} A ${radius} ${radius} 0 0 1 ${positions[positions.length - 1].x} ${positions[positions.length - 1].y}`
    : "";

onMount(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible = true;
        observer.unobserve(containerEl);
      }
    },
    { threshold: 0.2 }
  );
  observer.observe(containerEl);
  return () => observer.disconnect();
});
</script>

<div style="min-height:100vh;background:#0a0a0a;display:grid;place-items:center;padding:2rem;font-family:system-ui,-apple-system,sans-serif;color:#f1f5f9">
  <div style="display:flex;flex-direction:column;align-items:center;gap:2rem">
    <h2 style="font-size:1.375rem;font-weight:700;text-align:center">Project Timeline</h2>
    <div bind:this={containerEl} style="position:relative;width:{width}px;height:{height}px">
      <svg viewBox="0 0 {width} {height - 60}" fill="none" style="position:absolute;top:0;left:0;width:100%;height:{height - 60}px;pointer-events:none">
        <path d={arcPathD} stroke="rgba(148,163,184,0.2)" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
      </svg>
      {#each events as event, i}
        <div style="position:absolute;left:{positions[i].x}px;top:{positions[i].y}px;transform:translate(-50%,-50%) {visible ? 'scale(1)' : 'scale(0.6)'};opacity:{visible ? 1 : 0};transition:opacity 0.5s ease {i * 0.12}s, transform 0.5s ease {i * 0.12}s;display:flex;flex-direction:column;align-items:center">
          <div style="width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);border:3px solid #0a0a0a;box-shadow:0 0 0 2px rgba(99,102,241,0.4),0 0 12px rgba(99,102,241,0.2);flex-shrink:0;z-index:2"></div>
          <div style="margin-top:0.75rem;text-align:center;max-width:130px">
            <span style="font-size:0.7rem;color:#6366f1;font-weight:600;letter-spacing:0.04em;text-transform:uppercase">{event.date}</span>
            <strong style="display:block;font-size:0.85rem;color:#e2e8f0;margin-top:0.2rem">{event.title}</strong>
            <p style="font-size:0.75rem;color:#64748b;line-height:1.4;margin-top:0.2rem">{event.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
