<script setup>
import { ref, computed } from "vue";

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

const amount = ref("1");
const from = ref("USD");
const to = ref("EUR");

const converted = computed(() => {
  const val = (parseFloat(amount.value || "0") / RATES[from.value]) * RATES[to.value];
  return isNaN(val)
    ? "\u2014"
    : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const rate = computed(() => (RATES[to.value] / RATES[from.value]).toFixed(4));

function swap() {
  const temp = from.value;
  from.value = to.value;
  to.value = temp;
}
</script>

<template>
  <div style="min-height:100vh;background:#0d1117;display:flex;align-items:center;justify-content:center;padding:1.5rem;font-family:system-ui,-apple-system,sans-serif">
    <div style="width:100%;max-width:24rem;background:#161b22;border:1px solid #30363d;border-radius:1rem;padding:1.5rem">
      <h2 style="color:#e6edf3;font-weight:700;font-size:1.125rem;margin:0 0 1.5rem">Currency Converter</h2>

      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <!-- Amount input -->
        <div style="background:#0d1117;border:1px solid #30363d;border-radius:0.75rem;padding:1rem">
          <label style="display:block;font-size:0.6875rem;color:#8b949e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem">Amount</label>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span style="color:#58a6ff;font-weight:700;font-size:1.125rem">{{ SYMBOLS[from] }}</span>
            <input type="number" v-model="amount" min="0" style="flex:1;background:transparent;border:none;color:#e6edf3;font-size:1.5rem;font-weight:700;outline:none;font-variant-numeric:tabular-nums;width:100%" />
            <select v-model="from" style="background:#21262d;border:1px solid #30363d;color:#e6edf3;border-radius:0.5rem;padding:0.25rem 0.5rem;font-size:0.875rem;outline:none">
              <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>

        <!-- Swap button -->
        <div style="display:flex;justify-content:center">
          <button @click="swap" style="width:2.25rem;height:2.25rem;background:#21262d;border:1px solid #30363d;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#8b949e;cursor:pointer;font-size:1rem">⇅</button>
        </div>

        <!-- Converted output -->
        <div style="background:#0d1117;border:1px solid #30363d;border-radius:0.75rem;padding:1rem">
          <label style="display:block;font-size:0.6875rem;color:#8b949e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem">Converted</label>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span style="color:#7ee787;font-weight:700;font-size:1.125rem">{{ SYMBOLS[to] }}</span>
            <p style="flex:1;color:#e6edf3;font-size:1.5rem;font-weight:700;margin:0;font-variant-numeric:tabular-nums">{{ converted }}</p>
            <select v-model="to" style="background:#21262d;border:1px solid #30363d;color:#e6edf3;border-radius:0.5rem;padding:0.25rem 0.5rem;font-size:0.875rem;outline:none">
              <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>
      </div>

      <p style="text-align:center;font-size:0.6875rem;color:#484f58;margin-top:1rem">
        1 {{ from }} = {{ rate }} {{ to }} &middot; Indicative rates
      </p>
    </div>
  </div>
</template>
