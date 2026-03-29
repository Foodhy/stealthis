import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Config ────────────────────────────────────────────────────────────
const NAME = "Jane Doe";
const TITLE = "Senior Product Designer";
const ACCENT_COLOR = "#6366f1";
const BG_HOLD_START = 15; // frame when hold begins
const BG_HOLD_END = 105; // frame when slide-out starts
const DURATION = 120;

// ── Lower Third Component ─────────────────────────────────────────────
export const LowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide in: frames 0 → 15
  const slideIn = spring({
    frame,
    fps,
    from: -340,
    to: 0,
    config: { damping: 20, stiffness: 160 },
  });

  // Slide out: frames 105 → 120
  const slideOut =
    frame >= BG_HOLD_END
      ? spring({
          frame: frame - BG_HOLD_END,
          fps,
          from: 0,
          to: -340,
          config: { damping: 20, stiffness: 160 },
        })
      : 0;

  const translateX = frame < BG_HOLD_END ? slideIn : slideOut;

  // Accent bar width
  const barScaleX =
    frame < BG_HOLD_END
      ? interpolate(frame, [5, 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        })
      : interpolate(frame, [BG_HOLD_END, DURATION], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // Text opacity
  const textOpacity = interpolate(frame, [12, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Container positioned at bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 60,
          transform: `translateX(${translateX}px)`,
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: 280,
            height: 4,
            backgroundColor: ACCENT_COLOR,
            borderRadius: 2,
            transformOrigin: "left center",
            transform: `scaleX(${barScaleX})`,
            marginBottom: 10,
          }}
        />

        {/* Card */}
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(8px)",
            padding: "14px 24px 16px",
            borderLeft: `4px solid ${ACCENT_COLOR}`,
            opacity: textOpacity,
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 28,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: -0.5,
            }}
          >
            {NAME}
          </div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 15,
              color: "rgba(255,255,255,0.65)",
              marginTop: 4,
              letterSpacing: 0.3,
            }}
          >
            {TITLE}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="LowerThird"
    component={LowerThird}
    durationInFrames={120}
    fps={30}
    width={1280}
    height={720}
  />
);
