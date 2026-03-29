<script>
const RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.89,
  CNY: 7.24,
  MXN: 17.15,
  BRL: 4.97,
};
const SYMBOLS = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  JPY: "\u00A5",
  CAD: "CA$",
  AUD: "A$",
  CHF: "Fr",
  CNY: "\u00A5",
  MXN: "$",
  BRL: "R$",
};
const currencies = Object.keys(RATES);

let amount = "1";
let from = "USD";
let to = "EUR";

$: converted = (() => {
  const val = (parseFloat(amount || "0") / RATES[from]) * RATES[to];
  return isNaN(val)
    ? "\u2014"
    : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
})();

$: rate = (RATES[to] / RATES[from]).toFixed(4);

function swap() {
  const temp = from;
  from = to;
  to = temp;
}
</script>

<div style="min-height:100vh;background:#0b1120;display:flex;align-items:center;justify-content:center;padding:1rem;font-family:system-ui,-apple-system,sans-serif">
  <div style="width:100%;max-width:380px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:1rem;padding:1.25rem;backdrop-filter:blur(20px)">
    <h2 style="color:#e6edf3;font-weight:700;font-size:0.875rem;margin:0 0 1rem">Currency Converter</h2>

    <div style="display:flex;flex-direction:column;gap:0.75rem">
      <!-- Amount -->
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:0.75rem;padding:0.875rem">
        <label style="display:block;font-size:0.625rem;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:0.375rem">Amount</label>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span style="color:#60a5fa;font-weight:700;font-size:1rem">{SYMBOLS[from]}</span>
          <input type="number" bind:value={amount} min="0" style="flex:1;background:transparent;border:none;color:#e6edf3;font-size:1.25rem;font-weight:700;outline:none;font-variant-numeric:tabular-nums;min-width:0" />
          <select bind:value={from} style="background:#161b22;border:1px solid rgba(255,255,255,0.08);color:#e6edf3;border-radius:0.5rem;padding:0.375rem 0.625rem;font-size:0.75rem;font-weight:500;outline:none;cursor:pointer">
            {#each currencies as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Swap -->
      <div style="display:flex;justify-content:center">
        <button on:click={swap} style="width:2rem;height:2rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:0.5rem;display:flex;align-items:center;justify-content:center;color:#60a5fa;cursor:pointer;font-size:0.875rem">{'\u21C5'}</button>
      </div>

      <!-- Converted -->
      <div style="background:linear-gradient(135deg,rgba(96,165,250,0.08),rgba(52,211,153,0.06));border:1px solid rgba(96,165,250,0.15);border-radius:0.75rem;padding:0.875rem">
        <label style="display:block;font-size:0.625rem;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:0.375rem">Converted</label>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span style="color:#34d399;font-weight:700;font-size:1rem">{SYMBOLS[to]}</span>
          <p style="flex:1;color:#e6edf3;font-size:1.25rem;font-weight:700;margin:0;font-variant-numeric:tabular-nums;min-width:0">{converted}</p>
          <select bind:value={to} style="background:#161b22;border:1px solid rgba(255,255,255,0.08);color:#e6edf3;border-radius:0.5rem;padding:0.375rem 0.625rem;font-size:0.75rem;font-weight:500;outline:none;cursor:pointer">
            {#each currencies as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <p style="text-align:center;font-size:0.625rem;color:#475569;margin-top:0.75rem">
      1 {from} = {rate} {to} &middot; Indicative rates
    </p>
  </div>
</div>
