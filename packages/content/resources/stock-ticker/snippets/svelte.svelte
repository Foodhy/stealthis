<script>
import { onMount, onDestroy } from "svelte";

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

let stocks = [...INITIAL_STOCKS];
$: doubled = [...stocks, ...stocks];

const headers = ["Symbol", "Name", "Price", "Change"];

function formatPrice(price) {
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let interval;

onMount(() => {
  interval = setInterval(() => {
    stocks = stocks.map((s) => {
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

onDestroy(() => {
  clearInterval(interval);
});
</script>

<div class="page">
  <!-- Ticker strip -->
  <div class="ticker-strip">
    <div class="ticker-track">
      {#each doubled as s, i (i)}
        <span class="ticker-item">
          <span class="ticker-symbol">{s.symbol}</span>
          <span class="ticker-price">${s.price.toFixed(2)}</span>
          <span class={s.change >= 0 ? 'ticker-up' : 'ticker-down'}>
            {s.change >= 0 ? '▴' : '▾'} {Math.abs(s.change).toFixed(2)}%
          </span>
        </span>
      {/each}
    </div>
  </div>

  <!-- Table -->
  <div class="table">
    <div class="table-header">
      {#each headers as h}
        <span class="table-heading">{h}</span>
      {/each}
    </div>
    <div class="table-body">
      {#each stocks as s (s.symbol)}
        <div class="table-row">
          <span class="row-symbol">{s.symbol}</span>
          <span class="row-name">{s.name}</span>
          <span class="row-price">${formatPrice(s.price)}</span>
          <span class="row-change" class:up={s.change >= 0} class:down={s.change < 0}>
            {s.change >= 0 ? '▴' : '▾'} {Math.abs(s.change).toFixed(2)}%
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    background: #0d1117;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    gap: 1.5rem;
    font-family: system-ui, -apple-system, sans-serif;
    box-sizing: border-box;
  }

  .ticker-strip {
    width: 100%;
    overflow: hidden;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 0.75rem;
    padding: 0.5rem 0;
  }

  .ticker-track {
    display: flex;
    gap: 2rem;
    white-space: nowrap;
    animation: ticker 20s linear infinite;
  }

  .ticker-item {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .ticker-symbol { font-weight: 700; color: #e6edf3; }
  .ticker-price { font-family: monospace; color: #8b949e; }
  .ticker-up { color: #7ee787; }
  .ticker-down { color: #f85149; }

  .table {
    width: 100%;
    max-width: 672px;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #30363d;
  }

  .table-heading {
    font-size: 11px;
    color: #484f58;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .table-body {
    display: flex;
    flex-direction: column;
  }

  .table-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #21262d;
    transition: background 0.15s;
  }

  .table-row:hover { background: rgba(255, 255, 255, 0.02); }
  .table-row:last-child { border-bottom: none; }

  .row-symbol { font-weight: 700; font-size: 0.875rem; color: #e6edf3; }
  .row-name { font-size: 0.875rem; color: #8b949e; }
  .row-price { font-family: monospace; font-size: 0.875rem; color: #e6edf3; font-variant-numeric: tabular-nums; }

  .row-change {
    font-size: 0.875rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .row-change.up { color: #7ee787; }
  .row-change.down { color: #f85149; }

  @keyframes ticker {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
</style>
