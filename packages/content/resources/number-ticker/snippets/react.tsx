import { useEffect, useState, useMemo, useCallback } from "react";

interface NumberTickerProps {
  value?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

function DigitColumn({
  digit,
  index,
  totalDigits,
  animate,
  duration,
}: {
  digit: number;
  index: number;
  totalDigits: number;
  animate: boolean;
  duration: number;
}) {
  const delay = (totalDigits - 1 - index) * 0.06;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        transition: animate
          ? `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`
          : "none",
        transform: animate ? `translateY(-${digit}em)` : "translateY(0)",
      }}
    >
      {Array.from({ length: 10 }, (_, d) => (
        <span
          key={d}
          style={{
            height: "1em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

export default function NumberTicker({
  value = 48253,
  separator = ",",
  prefix,
  suffix,
  duration = 1,
}: NumberTickerProps) {
  const [animate, setAnimate] = useState(false);

  const digits = useMemo(() => {
    return String(value).split("").map(Number);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const replay = useCallback(() => {
    setAnimate(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
      });
    });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.375rem", fontWeight: 700 }}>Statistics</h2>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "1rem",
            padding: "2rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.8rem",
              color: "#64748b",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Total Count
          </span>

          <div style={{ display: "flex", alignItems: "baseline" }}>
            {prefix && (
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "#e2e8f0" }}>{prefix}</span>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                overflow: "hidden",
                height: "1em",
                fontSize: "2.5rem",
                fontWeight: 700,
                lineHeight: 1,
                color: "#f8fafc",
              }}
            >
              {digits.map((digit, i) => {
                const needsSep = separator && i > 0 && (digits.length - i) % 3 === 0;

                return (
                  <span key={i} style={{ display: "contents" }}>
                    {needsSep && (
                      <span
                        style={{
                          height: "1em",
                          display: "flex",
                          alignItems: "center",
                          color: "#475569",
                          fontSize: "0.85em",
                        }}
                      >
                        {separator}
                      </span>
                    )}
                    <DigitColumn
                      digit={digit}
                      index={i}
                      totalDigits={digits.length}
                      animate={animate}
                      duration={duration}
                    />
                  </span>
                );
              })}
            </div>

            {suffix && (
              <span style={{ fontSize: "1.25rem", color: "#64748b", marginLeft: "0.1rem" }}>
                {suffix}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={replay}
          style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#a5b4fc",
            fontSize: "0.85rem",
            fontWeight: 500,
            padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Replay Animation
        </button>
      </div>
    </div>
  );
}
