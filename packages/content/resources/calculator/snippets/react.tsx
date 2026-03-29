import { useState } from "react";

const BUTTONS = [
  ["C", "+/-", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

export default function CalculatorRC() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waitNext, setWaitNext] = useState(false);

  function press(key: string) {
    if (key === "C") {
      setDisplay("0"); setPrev(null); setOp(null); setWaitNext(false);
      return;
    }
    if (key === "+/-") { setDisplay((d) => String(-parseFloat(d))); return; }
    if (key === "%") { setDisplay((d) => String(parseFloat(d) / 100)); return; }

    if (["÷", "×", "−", "+"].includes(key)) {
      setPrev(display);
      setOp(key);
      setWaitNext(true);
      return;
    }

    if (key === "=") {
      if (!op || !prev) return;
      const a = parseFloat(prev);
      const b = parseFloat(display);
      let result = 0;
      if (op === "÷") result = a / b;
      else if (op === "×") result = a * b;
      else if (op === "−") result = a - b;
      else if (op === "+") result = a + b;
      const str = String(parseFloat(result.toPrecision(10)));
      setDisplay(str);
      setPrev(null); setOp(null); setWaitNext(false);
      return;
    }

    if (key === ".") {
      if (display.includes(".") && !waitNext) return;
      setDisplay(waitNext ? "0." : display + ".");
      setWaitNext(false);
      return;
    }

    const next = waitNext ? key : display === "0" ? key : display + key;
    setDisplay(next);
    setWaitNext(false);
  }

  function btnClass(key: string) {
    if (["÷", "×", "−", "+", "="].includes(key))
      return "bg-[#f6901f] hover:bg-[#e8830a] text-white font-semibold";
    if (["C", "+/-", "%"].includes(key))
      return "bg-[#a5a5a5] hover:bg-[#bfbfbf] text-black font-semibold";
    return "bg-[#333333] hover:bg-[#4a4a4a] text-white";
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-[280px] bg-black rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-5 pt-6 pb-3 text-right">
          <p className="text-[#8b949e] text-sm h-5 truncate">{op ? `${prev} ${op}` : ""}</p>
          <p className="text-white text-[48px] font-light leading-none truncate">
            {display.length > 9 ? parseFloat(display).toExponential(3) : display}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-px bg-[#1c1c1c] p-px">
          {BUTTONS.flat().map((key, i) => (
            <button
              key={i}
              onClick={() => press(key)}
              className={`${btnClass(key)} ${key === "0" ? "col-span-2" : ""} h-16 rounded-none text-xl transition-opacity active:opacity-70 flex items-center ${key === "0" ? "justify-start px-6" : "justify-center"}`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
