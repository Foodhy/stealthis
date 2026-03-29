<script>
let before = `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div className="counter">
      <p>Count: {count}</p>
      <button onClick={handleClick}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`;

let after = `import { useState, useCallback } from "react";

function Counter({ initial = 0, step = 1 }) {
  const [count, setCount] = useState(initial);

  const increment = useCallback(() => {
    setCount((prev) => prev + step);
  }, [step]);

  const decrement = useCallback(() => {
    setCount((prev) => prev - step);
  }, [step]);

  return (
    <div className="counter">
      <p>Count: {count}</p>
      <div className="counter-actions">
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
}

export default Counter;`;

let beforeLabel = "Before";
let afterLabel = "After";
let filename = "utils.ts";

let beforeScrollEl;
let afterScrollEl;
let syncing = false;

function computeDiff(oldLines, newLines) {
  const oldResult = [];
  const newResult = [];
  let oi = 0;
  let ni = 0;

  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
      oldResult.push({ text: oldLines[oi], type: "same", num: oi + 1 });
      newResult.push({ text: newLines[ni], type: "same", num: ni + 1 });
      oi++;
      ni++;
    } else {
      const oldInNew = newLines.indexOf(oldLines[oi], ni);
      const newInOld = oldLines.indexOf(newLines[ni], oi);

      if (oi < oldLines.length && (oldInNew === -1 || (newInOld !== -1 && newInOld <= oi + 2))) {
        oldResult.push({ text: oldLines[oi], type: "removed", num: oi + 1 });
        newResult.push({ text: "", type: "empty", num: null });
        oi++;
      } else if (ni < newLines.length) {
        oldResult.push({ text: "", type: "empty", num: null });
        newResult.push({ text: newLines[ni], type: "added", num: ni + 1 });
        ni++;
      } else {
        oi++;
        ni++;
      }
    }
  }
  return { oldResult, newResult };
}

$: diff = computeDiff(before.split("\n"), after.split("\n"));

function handleScroll(source) {
  if (syncing) return;
  syncing = true;
  if (source === "before" && afterScrollEl && beforeScrollEl) {
    afterScrollEl.scrollTop = beforeScrollEl.scrollTop;
  } else if (source === "after" && beforeScrollEl && afterScrollEl) {
    beforeScrollEl.scrollTop = afterScrollEl.scrollTop;
  }
  requestAnimationFrame(() => {
    syncing = false;
  });
}

const bgMap = {
  removed: "rgba(239,68,68,0.08)",
  added: "rgba(34,197,94,0.08)",
  empty: "rgba(255,255,255,0.02)",
  same: "transparent",
};
const colorMap = { removed: "#fca5a5", added: "#86efac", empty: "transparent", same: "#cbd5e1" };
const numColorMap = { removed: "#f87171", added: "#4ade80", empty: "transparent", same: "#475569" };

function getPrefix(type) {
  if (type === "removed") return "- ";
  if (type === "added") return "+ ";
  return "  ";
}
</script>

<div style="min-height: 100vh; background: #0a0a0a; display: grid; place-items: center; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; color: #f1f5f9;">
  <div style="width: min(900px, 100%); display: flex; flex-direction: column; gap: 1rem;">
    <h2 style="font-size: 1.375rem; font-weight: 700;">Code Changes</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.875rem; overflow: hidden;">
      <!-- Before panel -->
      <div style="background: #111318; display: flex; flex-direction: column; min-width: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.625rem 1rem; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06);">
          <span style="font-family: 'Fira Code', 'Cascadia Code', monospace; font-size: 0.8rem; color: #94a3b8;">{filename}</span>
          <span style="font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.15rem 0.5rem; border-radius: 999px; background: rgba(239,68,68,0.15); color: #f87171;">{beforeLabel}</span>
        </div>
        <div
          bind:this={beforeScrollEl}
          on:scroll={() => handleScroll('before')}
          style="font-family: 'Fira Code', 'Cascadia Code', monospace; font-size: 0.8rem; line-height: 1.7; overflow-x: auto; overflow-y: auto; padding: 0.5rem 0;"
        >
          {#each diff.oldResult as line, i}
            <div style="display: flex; padding: 0 0.75rem; min-height: 1.7em; background: {bgMap[line.type]};">
              <span style="flex-shrink: 0; width: 3ch; text-align: right; color: {numColorMap[line.type]}; margin-right: 1rem; user-select: none;">
                {line.num ?? ''}
              </span>
              <span style="flex: 1; white-space: pre; color: {colorMap[line.type]};">
                {getPrefix(line.type)}{line.text}
              </span>
            </div>
          {/each}
        </div>
      </div>

      <!-- After panel -->
      <div style="background: #111318; display: flex; flex-direction: column; min-width: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.625rem 1rem; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06);">
          <span style="font-family: 'Fira Code', 'Cascadia Code', monospace; font-size: 0.8rem; color: #94a3b8;">{filename}</span>
          <span style="font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.15rem 0.5rem; border-radius: 999px; background: rgba(34,197,94,0.15); color: #4ade80;">{afterLabel}</span>
        </div>
        <div
          bind:this={afterScrollEl}
          on:scroll={() => handleScroll('after')}
          style="font-family: 'Fira Code', 'Cascadia Code', monospace; font-size: 0.8rem; line-height: 1.7; overflow-x: auto; overflow-y: auto; padding: 0.5rem 0;"
        >
          {#each diff.newResult as line, i}
            <div style="display: flex; padding: 0 0.75rem; min-height: 1.7em; background: {bgMap[line.type]};">
              <span style="flex-shrink: 0; width: 3ch; text-align: right; color: {numColorMap[line.type]}; margin-right: 1rem; user-select: none;">
                {line.num ?? ''}
              </span>
              <span style="flex: 1; white-space: pre; color: {colorMap[line.type]};">
                {getPrefix(line.type)}{line.text}
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
