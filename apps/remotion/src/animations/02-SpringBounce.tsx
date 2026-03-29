/**
 * TECHNIQUE: Spring Animation
 *
 * How it works:
 * - `spring()` simulates a physical spring — it goes from 0 to 1
 * - Unlike `interpolate`, it overshoots and oscillates based on physics params
 * - Combine it with `interpolate()` to map [0,1] to any range (scale, rotation, etc.)
 *
 * Key config options:
 *   damping  — higher = less bounce (200 = smooth, 8 = very bouncy)
 *   stiffness — higher = faster movement
 *   mass     — higher = slower, heavier feel
 *
 * To recreate this pattern:
 *   1. Call spring({ frame, fps }) → returns a 0–1 progress value
 *   2. Use that value directly as scale, or feed into interpolate() for other ranges
 *   3. Add `delay` to stagger multiple elements
 */

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// --- Spring config presets ---
// Adjust these to feel the difference between spring behaviors
const CONFIGS = {
  smooth: { damping: 200 }, // No bounce, silky
  snappy: { damping: 20, stiffness: 200 }, // Quick with tiny bounce
  bouncy: { damping: 8 }, // Playful overshoot
  heavy: { damping: 15, stiffness: 80, mass: 2 }, // Slow, weighty entrance
} as const;

type ConfigKey = keyof typeof CONFIGS;

// --- A single bouncing box ---
const Box: React.FC<{
  frame: number;
  fps: number;
  delay: number;
  configKey: ConfigKey;
  color: string;
  label: string;
}> = ({ frame, fps, delay, configKey, color, label }) => {
  // spring() returns a value 0→1 (with possible overshoot on bouncy configs)
  // `frame - delay` shifts when the animation starts — negative frames clamp to 0
  const progress = spring({
    frame: frame - delay, // subtract delay to stagger entrance
    fps,
    config: CONFIGS[configKey],
  });

  // Map the 0→1 spring output to a scale value: starts at 0, ends at 1
  // We use interpolate() here just to be explicit; you could also use `progress` directly
  const scale = interpolate(progress, [0, 1], [0, 1]);

  // Also animate a vertical "drop in" — map 0→1 to Y offset -200px → 0px
  const translateY = interpolate(progress, [0, 1], [-200, 0]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 24,
          backgroundColor: color,
          // Apply spring-driven transform — CSS transitions are FORBIDDEN in Remotion
          transform: `translateY(${translateY}px) scale(${scale})`,
        }}
      />
      <span
        style={{
          color: "#94a3b8",
          fontSize: 22,
          fontFamily: "monospace",
          // Fade in the label after the box lands
          opacity: interpolate(progress, [0.8, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {label}
      </span>
    </div>
  );
};

// --- Main composition ---
export const SpringBounceAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const boxes: { config: ConfigKey; color: string; delay: number }[] = [
    { config: "smooth", color: "#6366f1", delay: 0 },
    { config: "snappy", color: "#22d3ee", delay: 8 },
    { config: "bouncy", color: "#f59e0b", delay: 16 },
    { config: "heavy", color: "#ec4899", delay: 24 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
        flexDirection: "column",
      }}
    >
      {/* Title fades in with a smooth spring */}
      <h1
        style={{
          color: "#f8fafc",
          fontSize: 48,
          fontFamily: "sans-serif",
          margin: 0,
          opacity: spring({ frame, fps, config: { damping: 200 } }),
        }}
      >
        Spring Configs
      </h1>

      {/* Row of boxes — each uses a different spring config + staggered delay */}
      <div style={{ display: "flex", gap: 60 }}>
        {boxes.map((b) => (
          <Box
            key={b.config}
            frame={frame}
            fps={fps}
            delay={b.delay}
            configKey={b.config}
            color={b.color}
            label={b.config}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
