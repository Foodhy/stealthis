<script>
import { onMount } from "svelte";

export let threshold = 0.15;
export let delay = 0;

let el;
let visible = false;

onMount(() => {
  if (!el) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    visible = true;
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible = true;
        observer.unobserve(el);
      }
    },
    { threshold, rootMargin: "0px 0px -40px 0px" }
  );

  observer.observe(el);
  return () => observer.disconnect();
});
</script>

<div
  bind:this={el}
  style="opacity: {visible ? 1 : 0}; transform: {visible ? 'translateY(0)' : 'translateY(24px)'}; transition: opacity 0.6s ease-out {delay}ms, transform 0.6s ease-out {delay}ms;"
>
  <slot />
</div>
