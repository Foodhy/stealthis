<script>
  const cards = [
    { title: "Card One", body: "This card fades in when it enters the viewport." },
    { title: "Card Two", body: "Each card fades in independently as you scroll." },
    { title: "Card Three", body: "Powered by the native Intersection Observer API." },
    { title: "Card Four", body: "No libraries required — just Svelte + CSS." },
  ];

  function fadeIn(el, { delay = 0, threshold = 0.15 } = {}) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return { destroy() { observer.disconnect(); } };
  }
</script>

<div style="min-height: 100vh; background: #0f172a; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6;">
  <section style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem;">
    <h1 style="font-size: clamp(2rem, 5vw, 4rem); font-weight: 700; margin-bottom: 1rem; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
      Scroll Fade In
    </h1>
    <p style="color: #94a3b8; font-size: 1.125rem;">Scroll down to see elements fade in.</p>
  </section>
  <div style="max-width: 720px; margin: 0 auto; padding: 2rem; display: flex; flex-direction: column; gap: 2rem;">
    {#each cards as card, i}
      <div use:fadeIn={{ delay: i * 100 }} style="background: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 2rem;">
        <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #38bdf8;">{card.title}</h2>
        <p>{card.body}</p>
      </div>
    {/each}
  </div>
</div>
