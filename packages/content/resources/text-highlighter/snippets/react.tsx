import { useState, useEffect, useCallback } from "react";

interface TextHighlighterProps {
  text?: string;
  delayPerWord?: number;
  highlightColor?: string;
}

export default function TextHighlighter({
  text = "Design is not just what it looks like and feels like. Design is how it works. Every detail matters when crafting remarkable experiences.",
  delayPerWord = 120,
  highlightColor = "rgba(167, 139, 250, 0.15)",
}: TextHighlighterProps) {
  const words = text.split(/\s+/);
  const [highlightedCount, setHighlightedCount] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setHighlightedCount(0);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    words.forEach((_, i) => {
      const tid = setTimeout(() => {
        setHighlightedCount(i + 1);
      }, delayPerWord * i);
      timeouts.push(tid);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [key, delayPerWord, words.length]);

  const replay = useCallback(() => {
    setKey((k) => k + 1);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 640 }}>
        <p
          onClick={replay}
          style={{
            fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
            fontWeight: 600,
            lineHeight: 1.6,
            color: "rgba(241,245,249,0.3)",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {words
            .map((word, i) => {
              const active = i < highlightedCount;
              return (
                <span
                  key={`${key}-${i}`}
                  style={{
                    position: "relative",
                    display: "inline-block",
                    padding: "0 0.1em",
                    color: active ? "#f1f5f9" : undefined,
                    transition: "color 0.3s ease",
                  }}
                >
                  {/* Highlight background */}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: highlightColor,
                      borderRadius: 4,
                      transform: active ? "scaleX(1)" : "scaleX(0)",
                      transformOrigin: "left",
                      transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                      zIndex: -1,
                    }}
                  />
                  {word}
                </span>
              );
            })
            .reduce<React.ReactNode[]>((acc, el, i) => {
              if (i > 0) acc.push(" ");
              acc.push(el);
              return acc;
            }, [])}
        </p>

        <p
          style={{
            textAlign: "center",
            marginTop: "2rem",
            fontSize: "0.75rem",
            color: "#333",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Click to replay
        </p>
      </div>
    </div>
  );
}
