<script>
const demos = [
  { label: "Get Started", color: "59, 130, 246", size: "md", id: "blue" },
  { label: "Subscribe Now", color: "139, 92, 246", size: "md", id: "purple" },
  { label: "Download Free", color: "16, 185, 129", size: "md", id: "emerald" },
  { label: "Sign Up Today", color: "244, 63, 94", size: "lg", id: "rose" },
  { label: "Learn More", color: "245, 158, 11", size: "sm", id: "amber" },
];

const sizeClass = { sm: "pulse-btn--sm", md: "", lg: "pulse-btn--lg" };

function colorStyle(color) {
  return `--pulse-color: ${color}; background: rgb(${color});`;
}

function handleClick(e) {
  const btn = e.currentTarget;
  btn.style.animation = "none";
  btn.offsetHeight; // reflow
  btn.style.animation = "";
}
</script>

<style>
  :global(*), :global(*::before), :global(*::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .demo-wrap {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e2e8f0;
  }

  p {
    color: #525252;
    font-size: 0.875rem;
  }

  .button-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
  }

  .pulse-btn {
    --pulse-color: 59, 130, 246;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.875rem 2rem;
    border-radius: 999px;
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    cursor: pointer;
    border: none;
    outline: none;
    color: #fff;
    background: rgb(var(--pulse-color));
    box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0.6);
    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    transition: transform 0.2s ease, filter 0.2s ease;
  }

  .pulse-btn:hover {
    transform: scale(1.05);
    filter: brightness(1.15);
  }

  .pulse-btn:active {
    transform: scale(0.97);
  }

  .pulse-btn--sm {
    padding: 0.625rem 1.5rem;
    font-size: 0.8125rem;
  }

  .pulse-btn--lg {
    padding: 1.125rem 2.75rem;
    font-size: 1.0625rem;
  }

  .pulse-btn--amber {
    color: #0a0a0a;
  }

  /* Svelte keeps @keyframes global — no scoping needed */
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0px  rgba(var(--pulse-color), 0.55); }
    50%  { box-shadow: 0 0 0 14px rgba(var(--pulse-color), 0);    }
    100% { box-shadow: 0 0 0 0px  rgba(var(--pulse-color), 0);    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pulse-btn { animation: none; }
  }
</style>

<div class="demo-wrap">
  <h2>Pulsating Buttons</h2>
  <p>Buttons with animated glow rings</p>

  <div class="button-row">
    {#each demos.slice(0, 3) as d}
      <button
        class="pulse-btn {sizeClass[d.size]} {d.id === 'amber' ? 'pulse-btn--amber' : ''}"
        style={colorStyle(d.color)}
        on:click={handleClick}
      >
        {d.label}
      </button>
    {/each}
  </div>

  <div class="button-row">
    {#each demos.slice(3) as d}
      <button
        class="pulse-btn {sizeClass[d.size]} {d.id === 'amber' ? 'pulse-btn--amber' : ''}"
        style={colorStyle(d.color)}
        on:click={handleClick}
      >
        {d.label}
      </button>
    {/each}
  </div>
</div>
