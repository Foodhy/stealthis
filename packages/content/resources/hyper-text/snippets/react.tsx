import { useState, useEffect, useCallback, useRef } from "react";

interface HyperTextProps {
  text?: string;
  scrambleSpeed?: number;
  resolveDelay?: number;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

export default function HyperText({
  text = "STEALTHIS",
  scrambleSpeed = 50,
  resolveDelay = 80,
}: HyperTextProps) {
  const [displayChars, setDisplayChars] = useState<string[]>(text.split(""));
  const [resolvedFlags, setResolvedFlags] = useState<boolean[]>(new Array(text.length).fill(true));
  const isAnimating = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scramble = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const resolved = new Array(text.length).fill(false);
    setResolvedFlags([...resolved]);

    // Clear previous timeouts
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    // Stagger resolve
    text.split("").forEach((_, i) => {
      const tid = setTimeout(
        () => {
          resolved[i] = true;
          setResolvedFlags([...resolved]);
        },
        resolveDelay * (i + 1)
      );
      timeoutRefs.current.push(tid);
    });

    // Scramble loop
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const next = text.split("").map((ch, i) => {
        if (ch === " ") return "\u00A0";
        if (resolved[i]) return ch;
        return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      });
      setDisplayChars(next);

      if (resolved.every(Boolean)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayChars(text.split(""));
        isAnimating.current = false;
      }
    }, scrambleSpeed);
  }, [text, scrambleSpeed, resolveDelay]);

  // Scramble on mount
  useEffect(() => {
    const tid = setTimeout(scramble, 400);
    return () => {
      clearTimeout(tid);
      if (intervalRef.current) clearInterval(intervalRef.current);
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, [scramble]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "3rem",
      }}
    >
      <div
        onMouseEnter={scramble}
        style={{
          fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", "Consolas", monospace',
          fontSize: "clamp(2rem, 6vw, 4.5rem)",
          fontWeight: 700,
          letterSpacing: "0.05em",
          color: "#f1f5f9",
          cursor: "default",
          display: "inline-flex",
        }}
      >
        {displayChars.map((ch, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              minWidth: "0.6em",
              textAlign: "center",
              color: resolvedFlags[i] ? "#f1f5f9" : "#a78bfa",
              textShadow: resolvedFlags[i]
                ? "0 0 4px rgba(241,245,249,0.2)"
                : "0 0 8px rgba(167,139,250,0.5)",
              transition: "color 0.15s ease",
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </div>

      <p
        style={{
          fontSize: "0.75rem",
          color: "#333",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Hover to scramble
      </p>
    </div>
  );
}
