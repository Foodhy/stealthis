import { useState } from "react";

export default function LikeButtonRC() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(142);
  const [burst, setBurst] = useState(false);

  function toggle() {
    if (!liked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
    setLiked((l) => !l);
    setCount((c) => (liked ? c - 1 : c + 1));
  }

  const PARTICLES = Array.from({ length: 6 }, (_, i) => ({
    angle: (i / 6) * 360,
    color: ["#ff6b6b", "#ff8e53", "#ff6b9d", "#c56cf0", "#ff9ff3", "#ffd32a"][i],
  }));

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-8 p-6">
      {/* Single like button */}
      <div className="relative flex flex-col items-center">
        <button
          onClick={toggle}
          aria-label={liked ? "Unlike" : "Like"}
          className="relative flex items-center gap-2.5 px-6 py-3 rounded-full border transition-all duration-200 select-none"
          style={{
            background: liked ? "rgba(255,107,107,0.12)" : "rgba(255,255,255,0.04)",
            borderColor: liked ? "rgba(255,107,107,0.4)" : "rgba(255,255,255,0.1)",
            transform: burst ? "scale(0.93)" : "scale(1)",
          }}
        >
          <svg
            width="22" height="22" viewBox="0 0 24 24"
            fill={liked ? "#ff6b6b" : "none"}
            stroke={liked ? "#ff6b6b" : "#8b949e"}
            strokeWidth="2"
            style={{
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: liked ? "scale(1.2)" : "scale(1)",
            }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span
            className="font-semibold text-sm tabular-nums transition-colors"
            style={{ color: liked ? "#ff6b6b" : "#8b949e" }}
          >
            {count.toLocaleString()}
          </span>
        </button>

        {/* Burst particles */}
        {burst && PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              background: p.color,
              animation: "particle-burst 0.6s ease-out both",
              transformOrigin: "center",
              "--angle": `${p.angle}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Variants showcase */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: "♥", label: "Love", color: "#ff6b6b", count: 248 },
          { icon: "👍", label: "Like", color: "#58a6ff", count: 1024 },
          { icon: "★", label: "Star", color: "#f1e05a", count: 87 },
        ].map(({ icon, label, color, count: c }) => {
          return (
            <LikeVariant key={label} icon={icon} label={label} color={color} initialCount={c} />
          );
        })}
      </div>

      <style>{`
        @keyframes particle-burst {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(calc(cos(var(--angle)) * 32px), calc(sin(var(--angle)) * 32px)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function LikeVariant({ icon, label, color, initialCount }: { icon: string; label: string; color: string; initialCount: number }) {
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(initialCount);

  function toggle() {
    setActive((a) => !a);
    setCount((c) => (active ? c - 1 : c + 1));
  }

  return (
    <button
      onClick={toggle}
      className="flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl border transition-all duration-200"
      style={{
        background: active ? `${color}18` : "rgba(255,255,255,0.03)",
        borderColor: active ? `${color}40` : "rgba(255,255,255,0.08)",
        transform: active ? "scale(1.05)" : "scale(1)",
      }}
    >
      <span className="text-2xl" style={{ filter: active ? "none" : "grayscale(1) opacity(0.4)", transition: "filter 0.2s" }}>
        {icon}
      </span>
      <span className="text-xs font-semibold tabular-nums" style={{ color: active ? color : "#8b949e" }}>
        {count.toLocaleString()}
      </span>
      <span className="text-[10px] text-[#484f58]">{label}</span>
    </button>
  );
}
