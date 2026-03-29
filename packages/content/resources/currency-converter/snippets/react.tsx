import { useState } from "react";

const RATES: Record<string, number> = {
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
const SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "CA$",
  AUD: "A$",
  CHF: "Fr",
  CNY: "¥",
  MXN: "$",
  BRL: "R$",
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

  const selectCls =
    "bg-[#161b22] border border-white/[0.08] text-[#e6edf3] rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#60a5fa]/50 cursor-pointer";

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl">
        <h2 className="text-[#e6edf3] font-bold text-sm mb-4">Currency Converter</h2>

        <div className="space-y-3">
          {/* From */}
          <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl p-3.5">
            <label className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold block mb-1.5">
              Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[#60a5fa] font-bold text-base">{SYMBOLS[from]}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-[#e6edf3] text-xl font-bold focus:outline-none tabular-nums min-w-0"
                min="0"
              />
              <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectCls}>
                {currencies.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap */}
          <div className="flex justify-center">
            <button
              onClick={swap}
              className="w-8 h-8 bg-white/[0.06] border border-white/[0.08] rounded-lg flex items-center justify-center text-[#60a5fa] text-sm hover:bg-[#60a5fa]/15 hover:border-[#60a5fa]/35 transition-all duration-200 hover:rotate-180"
            >
              ⇅
            </button>
          </div>

          {/* To */}
          <div className="bg-gradient-to-br from-[#60a5fa]/[0.08] to-[#34d399]/[0.06] border border-[#60a5fa]/15 rounded-xl p-3.5">
            <label className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold block mb-1.5">
              Converted
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[#34d399] font-bold text-base">{SYMBOLS[to]}</span>
              <p className="flex-1 text-[#e6edf3] text-xl font-bold tabular-nums min-w-0">
                {isNaN(converted)
                  ? "—"
                  : converted.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </p>
              <select value={to} onChange={(e) => setTo(e.target.value)} className={selectCls}>
                {currencies.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#475569] mt-3">
          1 {from} = {(RATES[to] / RATES[from]).toFixed(4)} {to} · Indicative rates
        </p>
      </div>
    </div>
  );
}
