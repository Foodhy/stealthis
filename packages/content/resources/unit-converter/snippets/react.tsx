import { useState } from "react";

type Category = "length" | "weight" | "temperature";

const UNITS: Record<
  Category,
  { label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]
> = {
  length: [
    { label: "Meters", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilometers", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Miles", toBase: (v) => v * 1609.34, fromBase: (v) => v / 1609.34 },
    { label: "Feet", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { label: "Inches", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { label: "Centimeters", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
  ],
  weight: [
    { label: "Kilograms", toBase: (v) => v, fromBase: (v) => v },
    { label: "Grams", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { label: "Pounds", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { label: "Ounces", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { label: "Tons", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  ],
  temperature: [
    { label: "Celsius", toBase: (v) => v, fromBase: (v) => v },
    { label: "Fahrenheit", toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
    { label: "Kelvin", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
};

const CATEGORIES: Category[] = ["length", "weight", "temperature"];

export default function UnitConverterRC() {
  const [category, setCategory] = useState<Category>("length");
  const [value, setValue] = useState("1");
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);

  const units = UNITS[category];
  const fromUnit = units[fromIdx];
  const toUnit = units[toIdx];
  const numVal = parseFloat(value || "0");
  const converted = toUnit.fromBase(fromUnit.toBase(numVal));

  function setcat(c: Category) {
    setCategory(c);
    setFromIdx(0);
    setToIdx(1);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
        <h2 className="text-[#e6edf3] font-bold text-lg mb-4">Unit Converter</h2>

        <div className="flex gap-2 mb-5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setcat(c)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                category === c
                  ? "bg-[#58a6ff] text-[#0d1117]"
                  : "bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
            <select
              value={fromIdx}
              onChange={(e) => setFromIdx(Number(e.target.value))}
              className="w-full bg-transparent text-[#8b949e] text-xs mb-2 focus:outline-none"
            >
              {units.map((u, i) => (
                <option key={u.label} value={i}>
                  {u.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-transparent text-[#e6edf3] text-3xl font-bold focus:outline-none tabular-nums"
            />
          </div>

          <div className="flex justify-center text-[#484f58]">↓</div>

          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
            <select
              value={toIdx}
              onChange={(e) => setToIdx(Number(e.target.value))}
              className="w-full bg-transparent text-[#8b949e] text-xs mb-2 focus:outline-none"
            >
              {units.map((u, i) => (
                <option key={u.label} value={i}>
                  {u.label}
                </option>
              ))}
            </select>
            <p className="text-[#7ee787] text-3xl font-bold tabular-nums">
              {isNaN(converted) ? "—" : parseFloat(converted.toPrecision(8)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
