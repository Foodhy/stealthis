const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const strength = 0.35;
const max = 18;

document.querySelectorAll("[data-magnet]").forEach((btn) => {
  const wrap = document.createElement("span");
  wrap.className = "magnet-wrap";
  btn.parentNode.insertBefore(wrap, btn);
  wrap.append(btn);

  if (reduced) return;

  wrap.addEventListener("mousemove", (e) => {
    const r = wrap.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const x = gsap.utils.clamp(-max, max, dx * strength);
    const y = gsap.utils.clamp(-max, max, dy * strength);
    gsap.to(btn, { x, y, duration: 0.35, ease: "power2.out" });
  });

  wrap.addEventListener("mouseleave", () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
  });
});
