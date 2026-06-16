import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Config ────────────────────────────────────────────────────────────────────
const PRIZE_LABEL = "Win a $500 Tech Bundle!";
const ENTRY_COUNT_TARGET = 4231;
const STEPS = [
  { icon: "👤", action: "Follow", detail: "@stealthis on all platforms" },
  { icon: "❤️", action: "Like", detail: "this post to enter" },
  { icon: "🏷️", action: "Tag", detail: "a friend in the comments" },
];
const CTA_LABEL = "Enter Now";
const CTA_SUBLABEL = "Ends Jun 30 · Open worldwide";
const COLOR_PINK = "#ec4899";
const COLOR_YELLOW = "#fbbf24";
const COLOR_CYAN = "#06b6d4";
const COLOR_PURPLE = "#a855f7";
const BG_COLOR = "#07070e";
const DURATION = 120;

// ── Confetti data (pre-computed so no randomness during render) ───────────────
const CONFETTI_PARTICLES = Array.from({ length: 48 }, (_, i) => ({
  x: ((i * 137.5) % 1280),
  y: ((i * 211.3) % 720),
  size: 6 + ((i * 7) % 10),
  color: [COLOR_PINK, COLOR_YELLOW, COLOR_CYAN, COLOR_PURPLE, "#f97316", "#22c55e"][i % 6],
  speed: 0.6 + ((i * 0.13) % 0.8),
  angle: (i * 47.3) % 360,
  delay: (i * 1.9) % 18,
  shape: i % 3 === 0 ? "circle" : i % 3 === 1 ? "rect" : "diamond",
}));

// ── Background: gradient + radial glows ──────────────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Slow rotating hue shift for the glow blobs
  const rotateA = interpolate(frame, [0, DURATION], [0, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Base dark bg */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: BG_COLOR }} />

      {/* Pink blob top-left */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: -80,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLOR_PINK}18 0%, ${COLOR_PINK}06 45%, transparent 70%)`,
          opacity: fadeIn,
          transform: `rotate(${rotateA}deg)`,
        }}
      />
      {/* Cyan blob bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -60,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLOR_CYAN}1a 0%, ${COLOR_CYAN}06 45%, transparent 70%)`,
          opacity: fadeIn,
          transform: `rotate(${-rotateA}deg)`,
        }}
      />
      {/* Yellow center accent */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 800,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${COLOR_YELLOW}0c 0%, transparent 60%)`,
          transform: "translate(-50%, -50%)",
          opacity: fadeIn,
        }}
      />
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          opacity: fadeIn * 0.7,
        }}
      />
    </>
  );
};

// ── Confetti particles layer ──────────────────────────────────────────────────
const Confetti: React.FC<{ frame: number }> = ({ frame }) => {
  const globalReveal = interpolate(frame, [8, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {CONFETTI_PARTICLES.map((p, i) => {
        const localFrame = Math.max(0, frame - p.delay);
        const particleOpacity = interpolate(localFrame, [0, 12], [0, 0.75], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        // Gentle drift downward + slight sway
        const drift = (localFrame * p.speed) % 720;
        const sway = Math.sin((localFrame * 0.04 + i * 0.9)) * 18;
        const rotate = interpolate(localFrame, [0, DURATION], [0, p.angle], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const y = (p.y + drift) % 780 - 30;
        const x = p.x + sway;

        const shapeStyle: React.CSSProperties =
          p.shape === "circle"
            ? { borderRadius: "50%", width: p.size, height: p.size }
            : p.shape === "rect"
            ? { borderRadius: 2, width: p.size * 1.4, height: p.size * 0.7 }
            : { borderRadius: 2, width: p.size, height: p.size, transform: `rotate(${rotate + 45}deg)` };

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              backgroundColor: p.color,
              opacity: particleOpacity * globalReveal,
              transform: p.shape !== "diamond" ? `rotate(${rotate}deg)` : undefined,
              ...shapeStyle,
            }}
          />
        );
      })}
    </div>
  );
};

// ── "GIVEAWAY" hero text — rainbow gradient, scale spring ────────────────────
const GiveawayTitle: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 180, mass: 0.7 },
  });

  // The overshoot goes to ~1.3 naturally with low damping — spring handles it
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shimmer sweep across title text
  const shimmerX = interpolate(frame, [15, 55], [-320, 1000], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 118,
          letterSpacing: -4,
          lineHeight: 1,
          background: `linear-gradient(90deg, ${COLOR_PINK} 0%, ${COLOR_YELLOW} 35%, ${COLOR_CYAN} 65%, ${COLOR_PURPLE} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: `drop-shadow(0 0 30px ${COLOR_PINK}60) drop-shadow(0 0 60px ${COLOR_CYAN}40)`,
          display: "block",
        }}
      >
        GIVEAWAY
      </span>
      {/* Shimmer highlight */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: shimmerX,
          width: 120,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          transform: "skewX(-10deg)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ── Prize box (emoji-style rect with ribbon) ──────────────────────────────────
const PrizeBox: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const START = 12;
  const f = Math.max(0, frame - START);

  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 9, stiffness: 220, mass: 0.55 },
  });
  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle bob after entrance
  const bob = Math.sin((frame - START) * 0.08) * 5;

  // Glow pulse
  const glowSize = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [20, 38],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${bob}px)`,
        position: "relative",
        marginBottom: 6,
      }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: "absolute",
          inset: -glowSize,
          borderRadius: 32,
          background: `radial-gradient(circle, ${COLOR_YELLOW}20 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Box body */}
      <div
        style={{
          width: 110,
          height: 100,
          borderRadius: 16,
          background: `linear-gradient(145deg, #d97706 0%, #92400e 100%)`,
          border: `2px solid ${COLOR_YELLOW}80`,
          boxShadow: `0 0 24px ${COLOR_YELLOW}40, 0 8px 32px rgba(0,0,0,0.5)`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        {/* Box lid */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 32,
            background: `linear-gradient(145deg, #f59e0b 0%, #b45309 100%)`,
            borderBottom: `2px solid ${COLOR_YELLOW}60`,
          }}
        />
        {/* Ribbon vertical */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 14,
            height: "100%",
            background: `linear-gradient(90deg, ${COLOR_PINK}cc, ${COLOR_PINK}, ${COLOR_PINK}cc)`,
            zIndex: 1,
          }}
        />
        {/* Ribbon horizontal */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 0,
            right: 0,
            height: 14,
            background: `linear-gradient(180deg, ${COLOR_PINK}cc, ${COLOR_PINK}, ${COLOR_PINK}cc)`,
            zIndex: 1,
          }}
        />
        {/* Bow top-left */}
        <div
          style={{
            position: "absolute",
            top: 2,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            display: "flex",
            gap: 2,
          }}
        >
          <div
            style={{
              width: 22,
              height: 16,
              borderRadius: "50%",
              background: COLOR_PINK,
              transform: "rotate(-20deg) translateX(4px)",
              boxShadow: `0 0 8px ${COLOR_PINK}80`,
            }}
          />
          <div
            style={{
              width: 22,
              height: 16,
              borderRadius: "50%",
              background: COLOR_PINK,
              transform: "rotate(20deg) translateX(-4px)",
              boxShadow: `0 0 8px ${COLOR_PINK}80`,
            }}
          />
        </div>
        {/* Star sparkle inside box */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 26,
            zIndex: 1,
          }}
        >
          ⭐
        </div>
      </div>
    </div>
  );
};

// ── Prize description — typewriter effect ─────────────────────────────────────
const PrizeDescription: React.FC<{ frame: number }> = ({ frame }) => {
  const START = 22;
  const CHARS_PER_FRAME = 1.6;
  const f = Math.max(0, frame - START);
  const charsVisible = Math.floor(f * CHARS_PER_FRAME);
  const text = PRIZE_LABEL;
  const visible = text.slice(0, charsVisible);

  const slideY = interpolate(Math.min(f, 10), [0, 10], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Blinking cursor
  const cursorVisible = charsVisible < text.length || (Math.floor(frame / 8) % 2 === 0);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${slideY}px)`,
        marginTop: 4,
        marginBottom: 2,
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 38,
          color: "#ffffff",
          letterSpacing: -0.5,
          lineHeight: 1.2,
          filter: `drop-shadow(0 0 12px ${COLOR_YELLOW}50)`,
        }}
      >
        {visible}
        {cursorVisible && charsVisible <= text.length && (
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: 36,
              backgroundColor: COLOR_YELLOW,
              marginLeft: 2,
              verticalAlign: "middle",
              borderRadius: 2,
            }}
          />
        )}
      </span>
    </div>
  );
};

// ── Entry counter — animates 0 → target ──────────────────────────────────────
const EntryCounter: React.FC<{ frame: number }> = ({ frame }) => {
  const START = 30;
  const END = 80;
  const f = Math.max(0, frame - START);

  const progress = interpolate(f, [0, END - START], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });
  const count = Math.floor(progress * ENTRY_COUNT_TARGET);

  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse on the number as it counts
  const scalePulse = interpolate(f % 4, [0, 2, 4], [1, 1.04, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const formattedCount = count.toLocaleString("en-US");

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 2,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#4ade80",
          boxShadow: "0 0 8px #4ade80, 0 0 16px #4ade8080",
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        <span
          style={{
            color: COLOR_CYAN,
            fontWeight: 900,
            fontSize: 22,
            transform: `scale(${scalePulse})`,
            display: "inline-block",
            textShadow: `0 0 12px ${COLOR_CYAN}80`,
          }}
        >
          {formattedCount}
        </span>
        {" "}entries so far
      </span>
    </div>
  );
};

// ── Steps to enter ────────────────────────────────────────────────────────────
const StepItem: React.FC<{
  step: { icon: string; action: string; detail: string };
  index: number;
  frame: number;
  fps: number;
}> = ({ step, index, frame, fps }) => {
  const START = 48 + index * 14;
  const f = Math.max(0, frame - START);

  const x = spring({
    frame: f,
    fps,
    from: -32,
    to: 0,
    config: { damping: 14, stiffness: 140, mass: 0.6 },
  });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Checkmark badge springs in slightly after the row
  const checkScale = spring({
    frame: Math.max(0, f - 6),
    fps,
    from: 0,
    to: 1,
    config: { damping: 9, stiffness: 260, mass: 0.4 },
  });

  // Accent color per step
  const accentColors = [COLOR_CYAN, COLOR_PINK, COLOR_YELLOW];
  const accent = accentColors[index % accentColors.length];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity,
        transform: `translateX(${x}px)`,
        marginBottom: 10,
      }}
    >
      {/* Step number badge */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: `${accent}20`,
          border: `1.5px solid ${accent}70`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${checkScale})`,
          flexShrink: 0,
          boxShadow: `0 0 12px ${accent}30`,
        }}
      >
        <span style={{ fontSize: 18 }}>{step.icon}</span>
      </div>

      {/* Text content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 17,
            color: "#ffffff",
            letterSpacing: 0.2,
          }}
        >
          {step.action}
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {step.detail}
        </span>
      </div>

      {/* Check mark — appears after step */}
      <div
        style={{
          marginLeft: "auto",
          width: 22,
          height: 22,
          borderRadius: "50%",
          backgroundColor: `${accent}25`,
          border: `1.5px solid ${accent}90`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${checkScale})`,
          flexShrink: 0,
        }}
      >
        <svg
          width="11"
          height="9"
          viewBox="0 0 11 9"
          fill="none"
        >
          <path
            d="M1 4.5L4 7.5L10 1"
            stroke={accent}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// ── "Enter Now" pulsing CTA button ────────────────────────────────────────────
const EnterNowButton: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const START = 82;
  const f = Math.max(0, frame - START);

  const scale = spring({
    frame: f,
    fps,
    from: 0.78,
    to: 1,
    config: { damping: 10, stiffness: 200, mass: 0.55 },
  });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Continuous pulse ring
  const ringPhase = (f - 8) % 40;
  const ringScale = interpolate(ringPhase, [0, 40], [1, 1.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(ringPhase, [0, 15, 40], [0.6, 0.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showRing = f >= 8;

  // Shimmer sweep
  const shimmerX = interpolate((frame - START - 14) % 50, [0, 50], [-80, 380], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showShimmer = f >= 14;

  // Subtle scale breathe
  const breathe = interpolate(
    Math.sin(f * 0.12),
    [-1, 1],
    [0.98, 1.02],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale * breathe})`,
        transformOrigin: "left center",
        position: "relative",
        display: "inline-block",
        marginTop: 10,
      }}
    >
      {/* Pulse ring */}
      {showRing && (
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: 18,
            border: `2px solid ${COLOR_PINK}`,
            opacity: ringOpacity,
            transform: `scale(${ringScale})`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Button */}
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${COLOR_PINK} 0%, #be185d 100%)`,
          borderRadius: 16,
          padding: "16px 48px",
          overflow: "hidden",
          boxShadow: `0 0 40px ${COLOR_PINK}50, 0 8px 32px rgba(236,72,153,0.4)`,
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 22,
            color: "#ffffff",
            letterSpacing: 0.5,
            position: "relative",
            zIndex: 1,
          }}
        >
          {CTA_LABEL} →
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 12,
            color: "rgba(255,255,255,0.72)",
            letterSpacing: 0.3,
            marginTop: 2,
            position: "relative",
            zIndex: 1,
          }}
        >
          {CTA_SUBLABEL}
        </span>

        {/* Shimmer sweep */}
        {showShimmer && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: shimmerX,
              width: 80,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
              transform: "skewX(-12deg)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        )}
      </div>
    </div>
  );
};

// ── Divider ───────────────────────────────────────────────────────────────────
const Divider: React.FC<{ frame: number; delay: number; color: string }> = ({
  frame,
  delay,
  color,
}) => {
  const f = Math.max(0, frame - delay);
  const scaleX = interpolate(f, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(f, [0, 10], [0, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        height: 1,
        width: "100%",
        background: `linear-gradient(90deg, ${color}60, ${color}30, transparent)`,
        transformOrigin: "left center",
        transform: `scaleX(${scaleX})`,
        opacity,
        marginTop: 8,
        marginBottom: 8,
      }}
    />
  );
};

// ── "LIVE" badge top-right ────────────────────────────────────────────────────
const LiveBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - 4);
  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 11, stiffness: 220, mass: 0.45 },
  });
  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Blinking dot
  const dotOpacity = interpolate(
    Math.sin(frame * 0.2),
    [-1, 1],
    [0.4, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        right: 52,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "right center",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        padding: "6px 14px",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#ef4444",
          boxShadow: "0 0 6px #ef4444",
          opacity: dotOpacity,
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: "#ffffff",
          letterSpacing: 2,
          textTransform: "uppercase" as const,
        }}
      >
        Live
      </span>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export const GiveawayAnnouncement: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out in last 20 frames
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: globalOpacity }}>
      <Background frame={frame} />
      <Confetti frame={frame} />

      {/* LIVE badge top-right */}
      <LiveBadge frame={frame} fps={fps} />

      {/* Main layout — two columns */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          paddingLeft: 72,
          paddingRight: 64,
          gap: 56,
        }}
      >
        {/* LEFT COLUMN — hero title + prize box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: 480,
            gap: 12,
          }}
        >
          <GiveawayTitle frame={frame} fps={fps} />
          <PrizeBox frame={frame} fps={fps} />
          <PrizeDescription frame={frame} />
          <EntryCounter frame={frame} />
        </div>

        {/* RIGHT COLUMN — steps + CTA */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 8,
          }}
        >
          {/* "How to Enter" heading */}
          <Sequence from={40}>
            <HowToEnterHeading fps={fps} />
          </Sequence>

          <Divider frame={frame} delay={44} color={COLOR_CYAN} />

          {/* Steps */}
          {STEPS.map((step, i) => (
            <StepItem
              key={i}
              step={step}
              index={i}
              frame={frame}
              fps={fps}
            />
          ))}

          <Divider frame={frame} delay={78} color={COLOR_PINK} />

          <EnterNowButton frame={frame} fps={fps} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── "How to Enter" heading — used inside Sequence ────────────────────────────
const HowToEnterHeading: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const x = spring({
    frame,
    fps,
    from: -20,
    to: 0,
    config: { damping: 16, stiffness: 130 },
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        marginBottom: 4,
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 20,
          color: COLOR_CYAN,
          letterSpacing: 3,
          textTransform: "uppercase" as const,
          textShadow: `0 0 12px ${COLOR_CYAN}60`,
        }}
      >
        How to Enter
      </span>
    </div>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="GiveawayAnnouncement"
    component={GiveawayAnnouncement}
    durationInFrames={DURATION}
    fps={30}
    width={1280}
    height={720}
  />
);
