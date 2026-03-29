<script>
import { onMount } from "svelte";

const METRICS = [
  { label: "Website Visits", before: 45200, after: 52100, format: "num" },
  { label: "Bounce Rate", before: 54.2, after: 48.6, format: "pct", reverse: true },
  { label: "Conversion", before: 2.8, after: 3.4, format: "pct" },
  { label: "Avg Order", before: 65, after: 72, format: "currency" },
];

function fmt(v, f) {
  if (f === "pct") return v + "%";
  if (f === "currency") return "$" + v;
  return v.toLocaleString();
}

function delta(m) {
  return ((m.after - m.before) / m.before) * 100;
}

function isBetter(m) {
  const d = delta(m);
  return m.reverse ? d < 0 : d > 0;
}

function barPct(value, max) {
  return ((value / max) * 100).toFixed(1) + "%";
}

let ready = false;
onMount(() => {
  setTimeout(() => {
    ready = true;
  }, 50);
});
</script>

<div style="min-height:100vh;background:#0d1117;padding:1.5rem;display:flex;justify-content:center;font-family:system-ui,-apple-system,sans-serif;color:#e6edf3">
  <div style="width:100%;max-width:640px;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem">
    {#each METRICS as m}
      <div style="background:#161b22;border:1px solid #30363d;border-radius:0.75rem;padding:1.25rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
          <div style="font-weight:600;font-size:14px">{m.label}</div>
          <div style="font-size:12px;font-weight:700;padding:0.125rem 0.5rem;border-radius:9999px;background:{isBetter(m) ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)'};color:{isBetter(m) ? '#34d399' : '#f87171'}">
            {delta(m) > 0 ? '\u25B2' : '\u25BC'}{Math.abs(delta(m)).toFixed(1)}%
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.75rem">
          <div>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <div style="font-size:11px;width:6rem;text-align:right;flex-shrink:0;color:#484f58">Last Month</div>
              <div style="flex:1;height:1.25rem;background:#21262d;border-radius:9999px;overflow:hidden">
                <div style="height:100%;border-radius:9999px;background:#484f58;transition:width 0.7s ease-out;width:{ready ? barPct(m.before, Math.max(m.before, m.after) * 1.1) : '0%'}"></div>
              </div>
            </div>
            <div style="font-size:11px;color:#484f58;margin-top:0.25rem;text-align:right">{fmt(m.before, m.format)}</div>
          </div>

          <div>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <div style="font-size:11px;width:6rem;text-align:right;flex-shrink:0;color:#818cf8">This Month</div>
              <div style="flex:1;height:1.25rem;background:#21262d;border-radius:9999px;overflow:hidden">
                <div style="height:100%;border-radius:9999px;background:#818cf8;transition:width 0.7s ease-out;width:{ready ? barPct(m.after, Math.max(m.before, m.after) * 1.1) : '0%'}"></div>
              </div>
            </div>
            <div style="font-size:11px;color:#818cf8;margin-top:0.25rem;text-align:right;font-weight:600">{fmt(m.after, m.format)}</div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
