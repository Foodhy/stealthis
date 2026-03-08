import { useState } from "react";

const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36,
  AUD: 1.53, CHF: 0.89, CNY: 7.24, MXN: 17.15, BRL: 4.97,
};
const SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "CA$",
  AUD: "A$", CHF: "Fr", CNY: "¥", MXN: "$", BRL: "R$",
};

export default function CurrencyConverterRC() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");

  const converted = (parseFloat(amount || "0") / RATES[from]) * RATES[to];
  const currencies = Object.keys(RATES);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
        <h2 className="text-[#e6edf3] font-bold text-lg mb-6">Currency Converter</h2>

        <div className="space-y-3">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
            <label className="text-[11px] text-[#8b949e] uppercase tracking-wider block mb-2">Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-[#58a6ff] font-bold text-lg">{SYMBOLS[from]}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-[#e6edf3] text-2xl font-bold focus:outline-none tabular-nums"
                min="0"
              />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-[#21262d] border border-[#30363d] text-[#e6edf3] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#58a6ff]"
              >
                {currencies.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={swap}
              className="w-9 h-9 bg-[#21262d] border border-[#30363d] rounded-full flex items-center justify-center text-[#8b949e] hover:text-[#58a6ff] hover:border-[#58a6ff]/40 transition-colors"
            >
              ⇅
            </button>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
            <label className="text-[11px] text-[#8b949e] uppercase tracking-wider block mb-2">Converted</label>
            <div className="flex items-center gap-2">
              <span className="text-[#7ee787] font-bold text-lg">{SYMBOLS[to]}</span>
              <p className="flex-1 text-[#e6edf3] text-2xl font-bold tabular-nums">
                {isNaN(converted) ? "—" : converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-[#21262d] border border-[#30363d] text-[#e6edf3] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#58a6ff]"
              >
                {currencies.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#484f58] mt-4">
          1 {from} = {(RATES[to] / RATES[from]).toFixed(4)} {to} · Indicative rates
        </p>
      </div>
    </div>
  );
}
