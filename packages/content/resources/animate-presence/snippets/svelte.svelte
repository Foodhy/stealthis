<script>
const icons = ["✦", "◆", "●", "▲", "★", "◉", "⬟", "⬡"];
const colors = [
  "rgba(109,40,217,0.25)",
  "rgba(59,130,246,0.25)",
  "rgba(16,185,129,0.25)",
  "rgba(245,158,11,0.25)",
  "rgba(239,68,68,0.25)",
  "rgba(236,72,153,0.25)",
  "rgba(14,165,233,0.25)",
  "rgba(168,85,247,0.25)",
];
const borderColors = [
  "rgba(109,40,217,0.5)",
  "rgba(59,130,246,0.5)",
  "rgba(16,185,129,0.5)",
  "rgba(245,158,11,0.5)",
  "rgba(239,68,68,0.5)",
  "rgba(236,72,153,0.5)",
  "rgba(14,165,233,0.5)",
  "rgba(168,85,247,0.5)",
];
const names = [
  "Design tokens updated",
  "New component merged",
  "Build pipeline passed",
  "Sprint review scheduled",
  "Pull request approved",
  "Test coverage improved",
  "Deployment complete",
  "Security audit passed",
];

let items = [];
let counter = 0;

function addItem() {
  const i = counter % icons.length;
  counter++;
  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  items = [
    {
      id: Date.now(),
      icon: icons[i],
      color: colors[i],
      border: borderColors[i],
      name: names[Math.floor(Math.random() * names.length)],
      time: now,
      state: "entering",
    },
    ...items,
  ];
  setTimeout(() => {
    items = items.map((item) => (item.state === "entering" ? { ...item, state: "present" } : item));
  }, 350);
}

function removeItem(id) {
  items = items.map((item) => (item.id === id ? { ...item, state: "exiting" } : item));
  setTimeout(() => {
    items = items.filter((item) => item.id !== id);
  }, 300);
}

function clearAll() {
  items = [];
}

function getAnimStyle(state) {
  if (state === "entering")
    return "animation: fadeSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0;";
  if (state === "exiting")
    return "animation: fadeSlideOut 0.3s cubic-bezier(0.22,1,0.36,1) forwards;";
  return "";
}
</script>

<div
  style="min-height: 100vh; background: #0a0a0a; display: grid; place-items: center; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; color: #e4e4e7;"
>
  <div style="width: min(480px, 100%); display: flex; flex-direction: column; gap: 1.25rem;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #f4f4f5;">Animate Presence</h2>
        <p style="font-size: 0.8rem; color: #52525b; margin-top: 0.25rem;">Items animate in and out of the DOM</p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button
          on:click={clearAll}
          style="padding: 0.5rem 1rem; font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; cursor: pointer; background: rgba(255,255,255,0.06); color: #a1a1aa;"
        >
          Clear all
        </button>
        <button
          on:click={addItem}
          style="padding: 0.5rem 1rem; font-size: 0.8rem; font-weight: 600; border: none; border-radius: 0.5rem; cursor: pointer; background: #6d28d9; color: #f4f4f5;"
        >
          + Add item
        </button>
      </div>
    </div>

    <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; min-height: 60px; padding: 0; margin: 0;">
      {#each items as item (item.id)}
        <li
          style="display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; {getAnimStyle(item.state)}"
        >
          <div
            style="width: 36px; height: 36px; border-radius: 0.5rem; display: grid; place-items: center; font-size: 1rem; flex-shrink: 0; background: {item.color}; border: 1px solid {item.border}; color: {item.border.replace('0.5', '1')};"
          >
            {item.icon}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 0.875rem; font-weight: 600; color: #e4e4e7;">{item.name}</div>
            <div style="font-size: 0.7rem; color: #52525b; margin-top: 0.15rem;">{item.time}</div>
          </div>
          <button
            on:click={() => removeItem(item.id)}
            style="width: 28px; height: 28px; border-radius: 0.375rem; border: none; background: rgba(255,255,255,0.04); color: #71717a; cursor: pointer; display: grid; place-items: center; font-size: 1rem;"
          >
            &times;
          </button>
        </li>
      {/each}
      {#if items.length === 0}
        <p style="text-align: center; padding: 2rem; color: #3f3f46; font-size: 0.85rem;">
          Click "+ Add item" to begin
        </p>
      {/if}
    </ul>
  </div>
</div>

<style>
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(-12px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes fadeSlideOut {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to { opacity: 0; transform: translateY(12px) scale(0.96); }
  }
</style>
