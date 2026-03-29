<script setup>
import { ref, onMounted, onUnmounted } from "vue";

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
  { icon: "★", title: "Zero Dependencies", desc: "Pure Vue with no external libraries required." },
  { icon: "⚙", title: "Easy Setup", desc: "Just use the v-blur-fade directive on any element." },
  {
    icon: "✨",
    title: "One-time Trigger",
    desc: "Elements are unobserved after reveal, keeping things lightweight.",
  },
];

const vBlurFade = {
  mounted(el, binding) {
    const delay = binding.value?.delay ?? 0;
    const threshold = binding.value?.threshold ?? 0.15;
    el.style.filter = "blur(10px)";
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `filter 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, opacity 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`;
    el.style.willChange = "filter, opacity, transform";
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.filter = "blur(0px)";
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    el._blurObs = obs;
  },
  unmounted(el) {
    el._blurObs?.disconnect();
  },
};
</script>

<template>
  <div style="background:#0a0a0a;min-height:300vh;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0">
    <section style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;text-align:center;padding:2rem">
      <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#e0e7ff 0%,#818cf8 50%,#6366f1 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Blur Fade</h1>
      <p style="color:rgba(148,163,184,0.8);font-size:1.125rem">Elements fade from blurred to sharp as you scroll</p>
      <span style="margin-top:2rem;color:rgba(148,163,184,0.5);font-size:0.875rem">Scroll down to see the effect</span>
    </section>
    <section style="max-width:900px;margin:0 auto;padding:4rem 2rem;display:flex;flex-direction:column;gap:3rem">
      <h2 v-blur-fade style="font-size:1.75rem;font-weight:700;color:#f1f5f9">Smooth Reveal</h2>
      <p v-blur-fade="{ delay: 100 }" style="color:rgba(148,163,184,0.8);line-height:1.8;max-width:640px">Content emerges from a soft blur as it enters the viewport.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem">
        <div v-for="(card, i) in cards.slice(0,3)" :key="card.title" v-blur-fade="{ delay: i * 120 }" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-top:2px solid rgba(99,102,241,0.15);border-radius:16px;padding:2rem">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(99,102,241,0.15);display:grid;place-items:center;margin-bottom:1rem;font-size:1.5rem">{{ card.icon }}</div>
          <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:#f1f5f9">{{ card.title }}</h3>
          <p style="color:rgba(148,163,184,0.8);line-height:1.7;font-size:0.95rem">{{ card.desc }}</p>
        </div>
      </div>
      <h2 v-blur-fade style="font-size:1.75rem;font-weight:700;color:#f1f5f9">Cascading Effect</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem">
        <div v-for="(card, i) in cards.slice(3)" :key="card.title" v-blur-fade="{ delay: i * 120 }" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-top:2px solid rgba(99,102,241,0.15);border-radius:16px;padding:2rem">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(99,102,241,0.15);display:grid;place-items:center;margin-bottom:1rem;font-size:1.5rem">{{ card.icon }}</div>
          <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:#f1f5f9">{{ card.title }}</h3>
          <p style="color:rgba(148,163,184,0.8);line-height:1.7;font-size:0.95rem">{{ card.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
