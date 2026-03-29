<script>
let cardEl;
function handleMove(e) {
  if (!cardEl) return;
  const rect = cardEl.getBoundingClientRect();
  const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
  const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
  cardEl.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
}
function handleLeave() {
  if (cardEl) cardEl.style.transform = "";
}
</script>
<div class="min-h-screen grid place-items-center" style="background:radial-gradient(ellipse 600px 400px at 20% 30%,rgba(56,189,248,0.25) 0%,transparent 70%),radial-gradient(ellipse 500px 350px at 80% 70%,rgba(168,85,247,0.25) 0%,transparent 70%),#0f172a">
  <div bind:this={cardEl} on:mousemove={handleMove} on:mouseleave={handleLeave} class="w-full max-w-sm p-10 rounded-3xl flex flex-col gap-4 text-slate-100 border border-white/10" style="background:rgba(255,255,255,0.06);backdrop-filter:blur(16px) saturate(1.6);-webkit-backdrop-filter:blur(16px) saturate(1.6);transition:transform 0.1s ease;box-shadow:0 4px 32px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.1)">
    <span class="text-3xl text-sky-400">✦</span>
    <h2 class="text-xl font-bold tracking-tight">Glassmorphism</h2>
    <p class="text-slate-400 text-sm leading-relaxed">A frosted-glass card effect using CSS backdrop-filter, subtle borders, and layered transparency.</p>
    <div class="flex flex-wrap gap-2">
      {#each ["CSS", "backdrop-filter", "UI"] as tag}
        <span class="text-xs font-medium px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-slate-300">{tag}</span>
      {/each}
    </div>
    <button class="mt-2 self-start text-sm font-semibold px-5 py-2.5 rounded-xl bg-sky-400/10 border border-sky-400/40 text-sky-400 hover:bg-sky-400/20 hover:border-sky-400/60 transition-colors duration-200 active:scale-95">Steal This →</button>
  </div>
</div>
