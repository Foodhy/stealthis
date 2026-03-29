import { useMemo } from "react";

interface SpinningTextProps {
  text?: string;
  radius?: number;
  duration?: number;
}

export default function SpinningText({
  text = "STEAL THIS COMPONENT * ",
  radius = 125,
  duration = 10,
}: SpinningTextProps) {
  const chars = useMemo(() => {
    const arr = text.split("");
    const step = 360 / arr.length;
    return arr.map((char, i) => ({ char, angle: step * i }));
  }, [text]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: radius * 2,
          height: radius * 2,
        }}
      >
        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 8,
            height: 8,
            background: "#a78bfa",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 20px #a78bfa, 0 0 40px rgba(167,139,250,0.3)",
          }}
        />

        {/* Spinning container */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            animation: `spinText ${duration}s linear infinite`,
          }}
        >
          {chars.map(({ char, angle }, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#e2e8f0",
                transformOrigin: `0 ${radius}px`,
                transform: `rotate(${angle}deg)`,
                textShadow: "0 0 8px rgba(167,139,250,0.4)",
              }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spinText {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
