const stocks = [
  { symbol: 'AAPL', price: 182.52, change: 1.25 },
  { symbol: 'TSLA', price: 202.64, change: -2.45 },
  { symbol: 'BTC', price: 62450.00, change: 5.12 },
  { symbol: 'NVDA', price: 785.38, change: 3.21 },
  { symbol: 'ETH', price: 3450.25, change: 1.85 },
  { symbol: 'MSFT', price: 415.50, change: -0.42 },
  { symbol: 'AMZN', price: 178.22, change: 0.88 },
  { symbol: 'GOOGL', price: 142.15, change: -1.15 }
];

const tickerWrapper = document.getElementById('ticker-wrapper');

function createTickerItem(stock) {
  const item = document.createElement('div');
  item.className = 'ticker-item';
  
  const isUp = stock.change >= 0;
  const changeIcon = isUp ? '▴' : '▾';
  const changeClass = isUp ? 'up' : 'down';
  
  item.innerHTML = `
    <span class="symbol">${stock.symbol}</span>
    <span class="price">$${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
    <span class="change ${changeClass}">${changeIcon} ${Math.abs(stock.change)}%</span>
  `;
  
  return item;
}

function initTicker() {
  // Add items twice for seamless looping
  const items = [...stocks, ...stocks];
  items.forEach(stock => {
    tickerWrapper.appendChild(createTickerItem(stock));
  });
}

// Simulate price updates
function updatePrices() {
  const items = tickerWrapper.querySelectorAll('.ticker-item');
  items.forEach((item, index) => {
    const stockIndex = index % stocks.length;
    const stock = stocks[stockIndex];
    
    // Tiny random movement
    const movement = (Math.random() - 0.5) * 0.1;
    stock.price += movement;
    
    const priceEl = item.querySelector('.price');
    priceEl.textContent = `$${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  });
}

initTicker();
setInterval(updatePrices, 2000);
