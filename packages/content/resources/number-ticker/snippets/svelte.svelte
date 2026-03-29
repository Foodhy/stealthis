<script>
import { onMount } from "svelte";

export let value = 48253;
export let separator = ",";
export let prefix = "";
export let suffix = "";
export let duration = 1;

let animate = false;

$: digits = String(value).split("").map(Number);

onMount(() => {
  const timer = setTimeout(() => {
    animate = true;
  }, 200);
  return () => clearTimeout(timer);
});

function replay() {
  animate = false;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animate = true;
    });
  });
}

function needsSep(i) {
  return separator && i > 0 && (digits.length - i) % 3 === 0;
}

function getDelay(i) {
  return (digits.length - 1 - i) * 0.06;
}
</script>

<div style="min-height: 100vh; background: #0a0a0a; display: grid; place-items: center; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; color: #f1f5f9;">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 2rem;">
    <h2 style="font-size: 1.375rem; font-weight: 700;">Statistics</h2>

    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 1rem; padding: 2rem 2.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
      <span style="font-size: 0.8rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em;">
        Total Count
      </span>

      <div style="display: flex; align-items: baseline;">
        {#if prefix}
          <span style="font-size: 2rem; font-weight: 700; color: #e2e8f0;">{prefix}</span>
        {/if}

        <div style="display: flex; align-items: baseline; overflow: hidden; height: 1em; font-size: 2.5rem; font-weight: 700; line-height: 1; color: #f8fafc;">
          {#each digits as digit, i}
            {#if needsSep(i)}
              <span style="height: 1em; display: flex; align-items: center; color: #475569; font-size: 0.85em;">
                {separator}
              </span>
            {/if}
            <div
              style="display: flex; flex-direction: column; transition: {animate ? `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${getDelay(i)}s` : 'none'}; transform: {animate ? `translateY(-${digit}em)` : 'translateY(0)'};"
            >
              {#each Array(10) as _, d}
                <span style="height: 1em; display: flex; align-items: center; justify-content: center;">
                  {d}
                </span>
              {/each}
            </div>
          {/each}
        </div>

        {#if suffix}
          <span style="font-size: 1.25rem; color: #64748b; margin-left: 0.1rem;">{suffix}</span>
        {/if}
      </div>
    </div>

    <button
      on:click={replay}
      style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); color: #a5b4fc; font-size: 0.85rem; font-weight: 500; padding: 0.5rem 1.25rem; border-radius: 0.5rem; cursor: pointer;"
    >
      Replay Animation
    </button>
  </div>
</div>
