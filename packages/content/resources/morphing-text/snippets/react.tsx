import { useEffect, useState, useRef, useCallback } from "react";
import type { CSSProperties } from "react";

interface MorphingTextProps {
  texts: string[];
  morphDuration?: number;
  className?: string;
}

export function MorphingText({
  texts,
  morphDuration = 2000,
  className = "",
}: MorphingTextProps) {
  const [index, setIndex] = useState(0);
  const [showingA, setShowingA] = useState(true);
  const [aText, setAText] = useState(texts[0] || "");
  const [bText, setBText] = useState(texts[1] || "");
  const [aOpacity, setAOpacity] = useState(1);
  const [bOpacity, setBOpacity] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (texts.length < 2) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIndex((prev) => {
        const nextIndex = (prev + 1) % texts.length;

        setShowingA((wasA) => {
          if (wasA) {
            setBText(texts[nextIndex]);
            setAOpacity(0);
            setBOpacity(1);
          } else {
            setAText(texts[nextIndex]);
            setAOpacity(1);
            setBOpacity(0);
          }
          return !wasA;
        });

        return nextIndex;
      });
    }, morphDuration);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [texts, morphDuration]);

  const wrapperStyle: CSSProperties = {
    position: "relative",
    display: "inline-block",
    filter: "url(#morph-blur-react) contrast(30)",
  };

  const textBaseStyle: CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    whiteSpace: "nowrap",
    fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    color: "#e8e8e8",
    transition: "opacity 0.6s ease",
  };

  const spacerStyle: CSSProperties = {
    ...textBaseStyle,
    position: "relative",
    left: "auto",
    top: "auto",
    transform: "none",
    visibility: "hidden",
  };

  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="morph-blur-react">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
        </defs>
      </svg>
      <span className={className} style={wrapperStyle}>
        {/* Spacer to reserve width */}
        <span style={spacerStyle}>{showingA ? aText : bText}</span>
        <span style={{ ...textBaseStyle, opacity: aOpacity }}>{aText}</span>
        <span style={{ ...textBaseStyle, opacity: bOpacity }}>{bText}</span>
      </span>
    </>
  );
}

// Demo usage
export default function MorphingTextDemo() {
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
        <MorphingText texts={["Innovative", "Creative", "Powerful", "Beautiful", "Seamless"]} />
        <p style={{ marginTop: "1.5rem", color: "#666", fontSize: "1rem", position: "relative", zIndex: 1 }}>
          Text morphs smoothly between words via SVG blur
        </p>
      </div>
    </div>
  );
}
