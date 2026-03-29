<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const INITIAL_STOCKS = [
  { symbol: "AAPL", name: "Apple", price: 182.52, change: 1.25 },
  { symbol: "TSLA", name: "Tesla", price: 202.64, change: -2.45 },
  { symbol: "BTC", name: "Bitcoin", price: 62450.0, change: 5.12 },
  { symbol: "NVDA", name: "Nvidia", price: 785.38, change: 3.21 },
  { symbol: "ETH", name: "Ethereum", price: 3450.25, change: 1.85 },
  { symbol: "MSFT", name: "Microsoft", price: 415.5, change: -0.42 },
  { symbol: "AMZN", name: "Amazon", price: 178.22, change: 0.88 },
  { symbol: "GOOGL", name: "Alphabet", price: 142.15, change: -1.15 },
];

const stocks = ref([...INITIAL_STOCKS]);
const doubled = computed(() => [...stocks.value, ...stocks.value]);

const headers = ["Symbol", "Name", "Price", "Change"];

function formatPrice(price) {
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let interval;

onMounted(() => {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .st-row:hover { background: rgba(255,255,255,0.02); }
    .st-row:last-child { border-bottom: none !important; }
  `;
  document.head.appendChild(style);

  interval = setInterval(() => {
    stocks.value = stocks.value.map((s) => {
      const movement = (Math.random() - 0.48) * 2;
      const newPrice = Math.max(0.01, s.price + movement);
      return {
        ...s,
        price: newPrice,
        change: parseFloat((s.change + (Math.random() - 0.5) * 0.1).toFixed(2)),
      };
    });
  }, 2000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div :style="{ minHeight:'100vh', background:'#0d1117', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1.5rem', gap:'1.5rem' }">
    <!-- Ticker strip -->
    <div :style="{ width:'100%', overflow:'hidden', background:'#161b22', border:'1px solid #30363d', borderRadius:'0.75rem', padding:'0.5rem 0' }">
      <div :style="{ display:'flex', gap:'2rem', whiteSpace:'nowrap', animation:'ticker 20s linear infinite' }">
        <span v-for="(s, i) in doubled" :key="i" :style="{ display:'inline-flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem' }">
          <span :style="{ fontWeight:700, color:'#e6edf3' }">{{ s.symbol }}</span>
          <span :style="{ fontFamily:'monospace', color:'#8b949e' }">${{ s.price.toFixed(2) }}</span>
          <span :style="{ color: s.change >= 0 ? '#7ee787' : '#f85149' }">
            {{ s.change >= 0 ? "▴" : "▾" }} {{ Math.abs(s.change).toFixed(2) }}%
          </span>
        </span>
      </div>
    </div>

    <!-- Table -->
    <div :style="{ width:'100%', maxWidth:'672px', background:'#161b22', border:'1px solid #30363d', borderRadius:'0.75rem', overflow:'hidden' }">
      <div :style="{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', padding:'0.5rem 1rem', borderBottom:'1px solid #30363d' }">
        <span v-for="h in headers" :key="h" :style="{ fontSize:'11px', color:'#484f58', textTransform:'uppercase', letterSpacing:'0.05em' }">{{ h }}</span>
      </div>
      <div>
        <div v-for="s in stocks" :key="s.symbol" class="st-row" :style="{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', padding:'0.75rem 1rem', borderBottom:'1px solid #21262d', transition:'background 0.15s' }">
          <span :style="{ fontWeight:700, fontSize:'0.875rem', color:'#e6edf3' }">{{ s.symbol }}</span>
          <span :style="{ fontSize:'0.875rem', color:'#8b949e' }">{{ s.name }}</span>
          <span :style="{ fontFamily:'monospace', fontSize:'0.875rem', color:'#e6edf3', fontVariantNumeric:'tabular-nums' }">${{ formatPrice(s.price) }}</span>
          <span :style="{ fontSize:'0.875rem', fontWeight:600, fontVariantNumeric:'tabular-nums', color: s.change >= 0 ? '#7ee787' : '#f85149' }">
            {{ s.change >= 0 ? "▴" : "▾" }} {{ Math.abs(s.change).toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
