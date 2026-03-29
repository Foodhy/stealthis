import { useState, useEffect } from "react";

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

export default function StockTickerRC() {
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [flash, setFlash] = useState<Record<string, "up" | "down" | null>>({});

  useEffect(() => {
    const id = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const movement = (Math.random() - 0.48) * 2;
          const newPrice = Math.max(0.01, s.price + movement);
          return { ...s, price: newPrice, change: parseFloat((s.change + (Math.random() - 0.5) * 0.1).toFixed(2)) };
        })
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 gap-6">
      {/* Ticker strip */}
      <div className="w-full overflow-hidden bg-[#161b22] border border-[#30363d] rounded-xl py-2">
        <div className="flex gap-8 animate-ticker whitespace-nowrap">
          {[...stocks, ...stocks].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm">
              <span className="font-bold text-[#e6edf3]">{s.symbol}</span>
              <span className="font-mono text-[#8b949e]">${s.price.toFixed(2)}</span>
              <span className={s.change >= 0 ? "text-[#7ee787]" : "text-[#f85149]"}>
                {s.change >= 0 ? "▴" : "▾"} {Math.abs(s.change).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2 border-b border-[#30363d]">
          {["Symbol", "Name", "Price", "Change"].map((h) => (
            <span key={h} className="text-[11px] text-[#484f58] uppercase tracking-wider">{h}</span>
          ))}
        </div>
        <div className="divide-y divide-[#21262d]">
          {stocks.map((s) => (
            <div key={s.symbol} className="grid grid-cols-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
              <span className="font-bold text-sm text-[#e6edf3]">{s.symbol}</span>
              <span className="text-sm text-[#8b949e]">{s.name}</span>
              <span className="font-mono text-sm text-[#e6edf3] tabular-nums">
                ${s.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-semibold tabular-nums ${s.change >= 0 ? "text-[#7ee787]" : "text-[#f85149]"}`}>
                {s.change >= 0 ? "▴" : "▾"} {Math.abs(s.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-ticker { animation: ticker 20s linear infinite; }
      `}</style>
    </div>
  );
}
