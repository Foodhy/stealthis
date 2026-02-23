/**
 * TECHNIQUE: Sequencing with <Series> and <Sequence>
 *
 * How it works:
 * - `<Series>` plays children one after another automatically
 * - `<Series.Sequence durationInFrames={N}>` defines how long each slide shows
 * - Inside each slide, `useCurrentFrame()` returns the LOCAL frame (starts at 0 again)
 *   so animations are relative to when that slide begins — no math needed!
 * - `premountFor` preloads the next slide before it's visible (avoids pop-in)
 *
 * <Sequence> vs <Series>:
 *   - Use <Series> when slides play one-after-another with no overlap
 *   - Use <Sequence from={X}> when you need precise manual timing or overlapping
 *
 * To recreate this pattern:
 *   1. Wrap slides in <Series>
 *   2. Give each <Series.Sequence> a durationInFrames
 *   3. Each slide component animates from frame 0 (its own local timeline)
 */

import {
  AbsoluteFill,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ============================================================
// SLIDE 1 — Simple fade + scale in
// ============================================================
const Slide1: React.FC = () => {
  // Inside a Series.Sequence, frame resets to 0 when this slide starts
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1e1b4b",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          color: "#c7d2fe",
          fontSize: 80,
          fontFamily: "sans-serif",
          margin: 0,
          // Spring drives both scale and opacity simultaneously
          transform: `scale(${interpolate(progress, [0, 1], [0.7, 1])})`,
          opacity: progress,
        }}
      >
        Slide One
      </h1>
    </AbsoluteFill>
  );
};

// ============================================================
// SLIDE 2 — Staggered word reveal
// ============================================================
const WORDS = ["Design.", "Animate.", "Ship."];

const Slide2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#022c22",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        flexDirection: "column",
      }}
    >
      {WORDS.map((word, i) => {
        // Each word delays by 10 frames * its index
        const delay = i * 10;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 20, stiffness: 200 }, // snappy feel
        });

        return (
          <h2
            key={word}
            style={{
              color: "#6ee7b7",
              fontSize: 72,
              fontFamily: "sans-serif",
              margin: 0,
              // Each word slides in from the left with a spring
              transform: `translateX(${interpolate(progress, [0, 1], [-120, 0])}px)`,
              opacity: progress,
            }}
          >
            {word}
          </h2>
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================
// SLIDE 3 — Counter + radial pulse (shows combining techniques)
// ============================================================
const Slide3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Count from 0 to 100 over 2 seconds using eased interpolate
  const count = Math.round(
    interpolate(frame, [0, 2 * fps], [0, 100], {
      extrapolateRight: "clamp",
    })
  );

  // Pulse: scale oscillates using Math.sin — this is fine since it's frame-driven
  const pulse = 1 + 0.05 * Math.sin((frame / fps) * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1c1917",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Pulsing ring */}
      <div
        style={{
          width: 260,
          height: 260,
          borderRadius: "50%",
          border: "6px solid #f97316",
          transform: `scale(${pulse})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#fed7aa",
            fontSize: 80,
            fontFamily: "monospace",
            fontWeight: 700,
          }}
        >
          {count}%
        </span>
      </div>
      <p style={{ color: "#78716c", fontSize: 28, fontFamily: "sans-serif", margin: 0 }}>
        Complete
      </p>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN — Assembles slides using <Series>
// ============================================================
export const SlideshowAnimation: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    // Series plays each child one after another
    <Series>
      {/* Each Series.Sequence defines how many frames that slide is visible */}
      <Series.Sequence durationInFrames={2.5 * fps} premountFor={fps}>
        <Slide1 />
      </Series.Sequence>

      <Series.Sequence durationInFrames={3 * fps} premountFor={fps}>
        <Slide2 />
      </Series.Sequence>

      <Series.Sequence durationInFrames={3.5 * fps} premountFor={fps}>
        <Slide3 />
      </Series.Sequence>
    </Series>
  );
};
