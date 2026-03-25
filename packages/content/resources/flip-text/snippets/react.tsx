import { useEffect, useState, useCallback } from "react";
import type { CSSProperties } from "react";

interface FlipTextProps {
  words: string[];
  duration?: number;
  className?: string;
}

export function FlipText({
  words,
  duration = 2500,
  className = "",
}: FlipTextProps) {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
      setAnimKey((prev) => prev + 1);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  const containerStyle: CSSProperties = {
    display: "inline-block",
    position: "relative",
    height: "1.2em",
    overflow: "hidden",
    verticalAlign: "bottom",
    perspective: "600px",
  };

  const wordStyle: CSSProperties = {
    display: "inline-block",
    backgroundImage: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    animation: `flip-in ${duration}ms ease forwards`,
    transformOrigin: "center bottom",
    backfaceVisibility: "hidden",
  };

  return (
    <>
      <style>{`
        @keyframes flip-in {
          0% { transform: rotateX(90deg); opacity: 0; }
          15% { transform: rotateX(0deg); opacity: 1; }
          80% { transform: rotateX(0deg); opacity: 1; }
          100% { transform: rotateX(-90deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .flip-word-react { animation: none !important; transform: rotateX(0deg) !important; opacity: 1 !important; }
        }
      `}</style>
      <span className={className} style={containerStyle}>
        <span key={animKey} className="flip-word-react" style={wordStyle}>
          {words[index]}
        </span>
      </span>
    </>
  );
}

// Demo usage
export default function FlipTextDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 4rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            color: "#e0e0e0",
          }}
        >
          We build{" "}
          <FlipText words={["amazing", "beautiful", "fast", "modern", "stunning"]} />{" "}
          products
        </h1>
        <p style={{ marginTop: "1.5rem", color: "#666", fontSize: "1rem" }}>
          Words flip vertically to cycle through a list
        </p>
      </div>
    </div>
  );
}
