import { useRef, useState, useEffect } from "react";

// ── Types ───────────────────────────────────────────────────────────
type EasingName = "linear" | "easeOut" | "easeInOut";

interface UseAnimatedCounterOptions {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  easing?: EasingName;
}

// ── Hook ────────────────────────────────────────────────────────────
const easings: Record<EasingName, (t: number) => number> = {
  linear:    (t) => t,
  easeOut:   (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

export function useAnimatedCounter({
  target,
  duration = 1800,
  prefix = "",
  suffix = "",
  decimals = 0,
  easing = "easeOut",
}: UseAnimatedCounterOptions) {
  const ref      = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(`${prefix}${(0).toFixed(decimals)}${suffix}`);
  const reduced  =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) {
      setDisplay(`${prefix}${target.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`);
      return;
    }

    const fn = easings[easing];
    let rafId = 0;

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();

        const start = performance.now();
        function tick(now: number) {
          const t   = Math.min((now - start) / duration, 1);
          const val = target * fn(t);
          setDisplay(
            `${prefix}${val.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}${suffix}`
          );
          if (t < 1) rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    if (ref.current) obs.observe(ref.current);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [target, duration, prefix, suffix, decimals, easing, reduced]);

  return { ref, display };
}

// ── Demo ────────────────────────────────────────────────────────────
interface StatProps {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  easing?: EasingName;
  label: string;
  color?: string;
}

function Stat({ target, prefix, suffix, decimals, easing, label, color = "#38bdf8" }: StatProps) {
  const { ref, display } = useAnimatedCounter({ target, prefix, suffix, decimals, easing });

  return (
    <div
      style={{
        textAlign: "center",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "1.25rem",
        padding: "2.5rem 2rem",
        minWidth: "180px",
        flex: "1 1 180px",
      }}
    >
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        style={{
          display: "block",
          fontSize: "3rem",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          marginBottom: "0.75rem",
        }}
      >
        {display}
      </span>
      <span style={{ fontSize: "0.8rem", color: "#475569" }}>{label}</span>
    </div>
  );
}

export default function AnimatedCounterDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050910",
        color: "#f2f6ff",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3rem",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          useAnimatedCounter
        </h1>
        <p style={{ color: "#475569", fontSize: "0.875rem" }}>
          Numbers animate when they enter the viewport
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1.25rem",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "860px",
          width: "100%",
        }}
      >
        <Stat target={12500}  prefix="$" suffix="+"      label="Monthly revenue"        color="#38bdf8" easing="easeOut"   />
        <Stat target={98.6}   suffix="%"  decimals={1}   label="Customer satisfaction"  color="#22c55e" easing="easeOut"   />
        <Stat target={4200}   suffix="+"                 label="Active users"           color="#a78bfa" easing="easeInOut" />
        <Stat target={47}                               label="Countries served"        color="#f97316" easing="easeOut"   />
      </div>

      {/* Easing comparison */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.72rem", color: "#334155", marginBottom: "1.25rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Easing variants
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          {(["linear", "easeOut", "easeInOut"] as EasingName[]).map((e) => (
            <div
              key={e}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "0.75rem",
                padding: "1.25rem 1.75rem",
                textAlign: "center",
              }}
            >
              <Stat target={1000} label={e} color="#64748b" easing={e} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
