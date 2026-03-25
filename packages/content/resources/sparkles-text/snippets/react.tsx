import { useEffect, useRef, useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";

interface SparklesTextProps {
  children: ReactNode;
  colors?: string[];
  sparkleCount?: number;
  spawnInterval?: number;
  className?: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export function SparklesText({
  children,
  colors = ["#ffd700", "#ffffff", "#00d4ff", "#ff9ff3", "#a78bfa"],
  sparkleCount = 3,
  spawnInterval = 400,
  className = "",
}: SparklesTextProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const idCounter = useRef(0);

  const createSparkle = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const size = Math.random() * 14 + 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * (rect.width + 40) - 20;
    const y = Math.random() * (rect.height + 40) - 20;

    const sparkle = document.createElement("span");
    sparkle.className = "sparkle-react";
    sparkle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 2;
      animation: sparkle-react-anim 0.8s ease-out forwards;
    `;
    sparkle.innerHTML = `
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
        <path d="M12 0l3.09 7.26L23 8.27l-5.46 5.04L18.82 21 12 17.27 5.18 21l1.28-7.69L1 8.27l7.91-1.01z"/>
      </svg>
    `;

    wrapper.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }, [colors]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Initial burst
    for (let i = 0; i < sparkleCount * 2; i++) {
      setTimeout(() => createSparkle(), i * 100);
    }

    const interval = setInterval(() => {
      for (let i = 0; i < sparkleCount; i++) {
        createSparkle();
      }
    }, spawnInterval);

    return () => clearInterval(interval);
  }, [createSparkle, sparkleCount, spawnInterval]);

  const wrapperStyle: CSSProperties = {
    position: "relative",
    display: "inline-block",
    padding: "1rem 2rem",
  };

  return (
    <>
      <style>{`
        @keyframes sparkle-react-anim {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1) rotate(90deg); opacity: 1; }
          100% { transform: scale(0) rotate(180deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sparkle-react { display: none !important; }
        }
      `}</style>
      <span ref={wrapperRef} className={className} style={wrapperStyle}>
        {children}
      </span>
    </>
  );
}

// Demo usage
export default function SparklesTextDemo() {
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
        <SparklesText>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "#f0f0f0",
              position: "relative",
              zIndex: 1,
            }}
          >
            Sparkles Text
          </h1>
        </SparklesText>
        <p style={{ marginTop: "1.5rem", color: "#666", fontSize: "1rem", position: "relative", zIndex: 1 }}>
          Floating sparkle particles around text
        </p>
      </div>
    </div>
  );
}
