import { useState } from "react";

/* ── Loader 1: Dots pulse ─────────────────────────────────────── */
function DotsPulse() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#58a6ff] animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.8s" }}
        />
      ))}
      <span className="ml-1 text-[13px] text-[#8b949e]">Thinking…</span>
    </div>
  );
}

/* ── Loader 2: Shimmer bar ────────────────────────────────────── */
function ShimmerBar() {
  return (
    <div className="space-y-2 w-full max-w-[320px]">
      {[100, 80, 60].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-gradient-to-r from-[#21262d] via-[#30363d] to-[#21262d] bg-[length:200%_100%] animate-shimmer"
          style={{ width: `${w}%` }}
        />
      ))}
      <style>{`@keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}.animate-shimmer{animation:shimmer 1.4s ease-in-out infinite}`}</style>
    </div>
  );
}

/* ── Loader 3: Orbit ring ─────────────────────────────────────── */
function OrbitRing() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-[#30363d]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#58a6ff] animate-spin" />
        <div className="absolute inset-1 rounded-full bg-[#58a6ff]/10 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 8v4l3 3"/>
          </svg>
        </div>
      </div>
      <span className="text-[13px] text-[#8b949e]">Processing…</span>
    </div>
  );
}

/* ── Loader 4: Wave bars ──────────────────────────────────────── */
function WaveBars() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-end gap-0.5 h-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-[#bc8cff]"
            style={{
              animation: `wave 0.9s ease-in-out ${i * 0.1}s infinite`,
              height: "60%",
            }}
          />
        ))}
      </div>
      <span className="text-[13px] text-[#8b949e]">Analyzing…</span>
      <style>{`@keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1.2)}}` }</style>
    </div>
  );
}

/* ── Loader 5: Typing cursor ──────────────────────────────────── */
function TypingCursor() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[13px] text-[#8b949e]">Generating response</span>
      <span
        className="inline-block w-0.5 h-4 bg-[#58a6ff] animate-pulse rounded-sm"
        style={{ animationDuration: "0.7s" }}
      />
    </div>
  );
}

/* ── Loader 6: Brain pulse (new) ─────────────────────────────── */
function BrainPulse() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#58a6ff]/20 to-[#bc8cff]/20 border border-[#58a6ff]/20 flex items-center justify-center animate-pulse">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="1.5">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/>
            <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 14.5 2z"/>
            <path d="M5 8.5a2.5 2.5 0 1 1 4 2"/>
            <path d="M15 8.5a2.5 2.5 0 1 0-4 2"/>
          </svg>
        </div>
      </div>
      <div>
        <p className="text-[13px] font-semibold text-[#e6edf3]">Deep reasoning</p>
        <p className="text-[11px] text-[#484f58]">Working through the problem…</p>
      </div>
    </div>
  );
}

/* ── Loader 7: Token stream (new) ───────────────────────────── */
function TokenStream() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#484f58] font-mono">tokens/s</span>
        <div className="flex-1 h-1 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ animation: "tokenbar 2s ease-in-out infinite" }}
          />
        </div>
        <span className="text-[11px] text-green-400 font-mono">~48</span>
      </div>
      <div className="font-mono text-[12px] text-[#8b949e] overflow-hidden whitespace-nowrap">
        {"The answer to your question involves ".split("").map((ch, i) => (
          <span
            key={i}
            className="inline-block"
            style={{ animation: `fade-in 0.05s ${i * 0.04}s both` }}
          >
            {ch}
          </span>
        ))}
        <span className="inline-block w-0.5 h-3.5 bg-[#58a6ff] align-middle animate-pulse ml-px" />
      </div>
      <style>{`
        @keyframes tokenbar{0%{width:0}70%{width:100%}100%{width:100%}}
        @keyframes fade-in{from{opacity:0}to{opacity:1}}
      `}</style>
    </div>
  );
}

/* ── Loader 8: Step progress (new) ─────────────────────────── */
function StepProgress() {
  const steps = ["Reading context", "Planning response", "Generating", "Reviewing"];
  return (
    <div className="space-y-1.5">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              animation: `step-reveal 0.3s ${i * 0.8}s both`,
              opacity: 0,
            }}
          >
            {i < 2 ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7ee787" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            ) : i === 2 ? (
              <div className="w-3 h-3 rounded-full border-2 border-[#e3b341] border-t-transparent animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#484f58]" />
            )}
          </div>
          <span
            className={`text-[12px] ${i < 2 ? "text-[#7ee787] line-through" : i === 2 ? "text-[#e3b341]" : "text-[#484f58]"}`}
            style={{ animation: `step-reveal 0.3s ${i * 0.8}s both`, opacity: 0 }}
          >
            {step}
          </span>
        </div>
      ))}
      <style>{`@keyframes step-reveal{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

const LOADERS = [
  { label: "Dots Pulse",    comp: DotsPulse },
  { label: "Shimmer Bar",   comp: ShimmerBar },
  { label: "Orbit Ring",    comp: OrbitRing },
  { label: "Wave Bars",     comp: WaveBars },
  { label: "Typing Cursor", comp: TypingCursor },
  { label: "Brain Pulse",   comp: BrainPulse },
  { label: "Token Stream",  comp: TokenStream },
  { label: "Step Progress", comp: StepProgress },
];

export default function AiThinkingLoaderRC() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[720px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LOADERS.map(({ label, comp: Comp }, i) => (
            <div
              key={label}
              className={`bg-[#161b22] border rounded-xl px-5 py-4 cursor-pointer transition-colors ${
                active === i ? "border-[#58a6ff]/40" : "border-[#30363d] hover:border-[#8b949e]/40"
              }`}
              onClick={() => setActive(active === i ? null : i)}
            >
              <p className="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-3">{label}</p>
              <Comp />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
