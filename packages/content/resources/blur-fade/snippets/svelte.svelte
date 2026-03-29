<script>
import { onMount } from "svelte";

const cards = [
  {
    icon: "◈",
    title: "Performance",
    desc: "Hardware-accelerated CSS transitions keep animations silky smooth at 60fps.",
  },
  {
    icon: "◎",
    title: "Accessible",
    desc: "Uses IntersectionObserver for efficient, non-blocking scroll detection.",
  },
  {
    icon: "✦",
    title: "Customizable",
    desc: "Control blur amount, duration, easing, and stagger timing via props.",
  },
  {
    icon: "★",
    title: "Zero Dependencies",
    desc: "Pure Svelte with no external libraries required.",
  },
  { icon: "⚙", title: "Easy Setup", desc: "Just use the blur-fade action on any element." },
  {
    icon: "✨",
    title: "One-time Trigger",
    desc: "Elements are unobserved after reveal, keeping things lightweight.",
  },
];

function blurFade(node, { delay = 0, threshold = 0.15 } = {}) {
  node.style.filter = "blur(10px)";
  node.style.opacity = "0";
  node.style.transform = "translateY(20px)";
  node.style.transition = `filter 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, opacity 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`;
  node.style.willChange = "filter, opacity, transform";

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        node.style.filter = "blur(0px)";
        node.style.opacity = "1";
        node.style.transform = "translateY(0)";
        observer.unobserve(node);
      }
    },
    { threshold, rootMargin: "0px 0px -40px 0px" }
  );
  observer.observe(node);
  return {
    destroy() {
      observer.disconnect();
    },
  };
}
</script>

<div style="background:#0a0a0a;min-height:300vh;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0">
  <section style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;text-align:center;padding:2rem">
    <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#e0e7ff 0%,#818cf8 50%,#6366f1 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Blur Fade</h1>
    <p style="color:rgba(148,163,184,0.8);font-size:1.125rem">Elements fade from blurred to sharp as you scroll</p>
    <span style="margin-top:2rem;color:rgba(148,163,184,0.5);font-size:0.875rem">Scroll down to see the effect</span>
  </section>
  <section style="max-width:900px;margin:0 auto;padding:4rem 2rem;display:flex;flex-direction:column;gap:3rem">
    <h2 use:blurFade style="font-size:1.75rem;font-weight:700;color:#f1f5f9">Smooth Reveal</h2>
    <p use:blurFade={{ delay: 100 }} style="color:rgba(148,163,184,0.8);line-height:1.8;max-width:640px">Content emerges from a soft blur as it enters the viewport, creating a polished and modern scroll experience.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem">
      {#each cards.slice(0,3) as card, i}
        <div use:blurFade={{ delay: i * 120 }} style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-top:2px solid rgba(99,102,241,0.15);border-radius:16px;padding:2rem">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(99,102,241,0.15);display:grid;place-items:center;margin-bottom:1rem;font-size:1.5rem">{card.icon}</div>
          <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:#f1f5f9">{card.title}</h3>
          <p style="color:rgba(148,163,184,0.8);line-height:1.7;font-size:0.95rem">{card.desc}</p>
        </div>
      {/each}
    </div>
    <h2 use:blurFade style="font-size:1.75rem;font-weight:700;color:#f1f5f9">Cascading Effect</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem">
      {#each cards.slice(3) as card, i}
        <div use:blurFade={{ delay: i * 120 }} style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-top:2px solid rgba(99,102,241,0.15);border-radius:16px;padding:2rem">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(99,102,241,0.15);display:grid;place-items:center;margin-bottom:1rem;font-size:1.5rem">{card.icon}</div>
          <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:#f1f5f9">{card.title}</h3>
          <p style="color:rgba(148,163,184,0.8);line-height:1.7;font-size:0.95rem">{card.desc}</p>
        </div>
      {/each}
    </div>
  </section>
</div>
