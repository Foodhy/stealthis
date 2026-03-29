import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from "remotion";

// ── Config ────────────────────────────────────────────────────────────
const CHANNEL_NAME = "My Channel";
const BRAND_COLOR = "#6366f1";
const BG_COLOR = "#0a0a0f";

// ── "Thanks for watching" ─────────────────────────────────────────────
const ThankYouText: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = spring({
    frame,
    fps,
    from: 30,
    to: 0,
    config: { damping: 14, stiffness: 80 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 56,
          color: "#ffffff",
          letterSpacing: -1,
        }}
      >
        Thanks for watching!
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 22,
          color: "rgba(255,255,255,0.5)",
          marginTop: 10,
          letterSpacing: 1,
        }}
      >
        {CHANNEL_NAME}
      </div>
    </div>
  );
};

// ── Subscribe button ──────────────────────────────────────────────────
const SubscribeButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 12, stiffness: 150, mass: 0.8 },
  });

  // Pulse every 2 seconds after frame 120
  const pulseT = ((frame - 90) % 60) / 60;
  const pulse = frame > 90 ? 1 + 0.06 * Math.sin(pulseT * Math.PI * 2) : 1;

  return (
    <div
      style={{
        position: "absolute",
        top: 280,
        left: "50%",
        transform: `translateX(-50%) scale(${scale * pulse})`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          backgroundColor: "#ff0000",
          borderRadius: 4,
          padding: "18px 48px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: "#ffffff",
            letterSpacing: 0.5,
          }}
        >
          SUBSCRIBE
        </div>
      </div>
    </div>
  );
};

// ── End card placeholders ─────────────────────────────────────────────
const EndCard: React.FC<{
  frame: number;
  fps: number;
  label: string;
  offsetX: number;
}> = ({ frame, fps, label, offsetX }) => {
  const translateX = spring({
    frame,
    fps,
    from: offsetX > 0 ? 60 : -60,
    to: 0,
    config: { damping: 16, stiffness: 100 },
  });
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: `calc(50% + ${offsetX}px)`,
        transform: `translateX(-50%) translateX(${translateX}px)`,
        opacity,
      }}
    >
      <div
        style={{
          width: 260,
          height: 150,
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255,0.08)",
          border: `2px solid ${BRAND_COLOR}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 16,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────
export const YoutubeOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR, opacity: bgOpacity }}>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${BRAND_COLOR}22 0%, transparent 70%)`,
        }}
      />

      <ThankYouText frame={frame} fps={fps} />

      {/* Subscribe button appears at frame 60 */}
      <Sequence from={60}>
        <SubscribeButton frame={Math.max(0, frame - 60)} fps={fps} />
      </Sequence>

      {/* End cards appear at frame 120 */}
      <Sequence from={120}>
        <EndCard frame={Math.max(0, frame - 120)} fps={fps} label="Watch Next" offsetX={-160} />
        <EndCard frame={Math.max(0, frame - 120)} fps={fps} label="More Videos" offsetX={160} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="YoutubeOutro"
    component={YoutubeOutro}
    durationInFrames={600}
    fps={30}
    width={1280}
    height={720}
  />
);
