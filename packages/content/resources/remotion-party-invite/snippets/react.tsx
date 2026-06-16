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
const EVENT_NAME = "NEON DREAMS";
const EVENT_SUBTITLE = "The Rooftop Rave";
const EVENT_DATE = "SAT, JULY 19";
const EVENT_TIME = "10 PM – 4 AM";
const EVENT_PLACE = "SkyDeck, Level 42";
const EVENT_ADDRESS = "42 Vertigo Blvd, NYC";
const RSVP_DEADLINE = "RSVP by July 14";
const DRESS_CODE = "Neon / Glow-in-Dark";

const COLOR_BLUE = "#00d4ff";
const COLOR_PINK = "#ff2d87";
const COLOR_LIME = "#b8ff00";
const COLOR_PURPLE = "#bf00ff";
const COLOR_ORANGE = "#ff6a00";
const BG_DARK = "#060612";
const DURATION = 120;

// ── Deterministic geometry helpers ───────────────────────────────────────────
// Golden-ratio scramble so particles are spread without Math.random()
function seeded(i: number, salt: number) {
  return ((i * 137.508 + salt * 53.29) % 1) * 1;
}
function seededRange(i: number, salt: number, lo: number, hi: number) {
  return lo + seeded(i, salt) * (hi - lo);
}

// ── Sparkle/star SVG paths (pre-computed, no Math.random) ─────────────────────
const SPARKLE_DATA = Array.from({ length: 24 }, (_, i) => {
  const x = seededRange(i, 1, 60, 1020);
  const y = seededRange(i, 2, 80, 1840);
  const size = seededRange(i, 3, 12, 32);
  const delay = seededRange(i, 4, 0, 60);
  const spin = seededRange(i, 5, 0, 360);
  const color = [COLOR_BLUE, COLOR_PINK, COLOR_LIME, COLOR_PURPLE, COLOR_ORANGE][i % 5];
  const kind = i % 3; // 0=4-point star, 1=diamond, 2=cross
  return { x, y, size, delay, spin, color, kind };
});

// Confetti particles — portrait 1080×1920
const CONFETTI = Array.from({ length: 64 }, (_, i) => ({
  x: seededRange(i, 10, 0, 1080),
  y: seededRange(i, 11, -200, 1920),
  size: seededRange(i, 12, 5, 14),
  speed: seededRange(i, 13, 0.5, 2.2),
  sway: seededRange(i, 14, 0.02, 0.08),
  phase: seededRange(i, 15, 0, Math.PI * 2),
  spinRate: seededRange(i, 16, 0.03, 0.12),
  color: [COLOR_PINK, COLOR_BLUE, COLOR_LIME, COLOR_PURPLE, COLOR_ORANGE, "#ffffff"][i % 6],
  shape: i % 4 === 0 ? "circle" : i % 4 === 1 ? "rect" : i % 4 === 2 ? "diamond" : "pill",
}));

// ── SVG Sparkle shape ─────────────────────────────────────────────────────────
const SparkleShape: React.FC<{
  size: number;
  color: string;
  kind: number;
}> = ({ size, color, kind }) => {
  const r = size / 2;
  if (kind === 0) {
    // 4-point star
    const pts = Array.from({ length: 4 }, (_, i) => {
      const outerAngle = (i * Math.PI) / 2 - Math.PI / 4;
      const innerAngle = outerAngle + Math.PI / 4;
      const ox = Math.cos(outerAngle) * r;
      const oy = Math.sin(outerAngle) * r;
      const ix = Math.cos(innerAngle) * r * 0.38;
      const iy = Math.sin(innerAngle) * r * 0.38;
      return `${ox + r},${oy + r} ${ix + r},${iy + r}`;
    }).join(" ");
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon points={pts} fill={color} opacity={0.9} />
      </svg>
    );
  }
  if (kind === 1) {
    // Diamond
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon
          points={`${r},0 ${size},${r} ${r},${size} 0,${r}`}
          fill={color}
          opacity={0.85}
        />
      </svg>
    );
  }
  // Cross / plus
  const t = size * 0.28;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={r - t / 2} y={0} width={t} height={size} fill={color} opacity={0.85} rx={t / 2} />
      <rect x={0} y={r - t / 2} width={size} height={t} fill={color} opacity={0.85} rx={t / 2} />
    </svg>
  );
};

// ── Background — deep dark with neon radial glows ────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Slow pulse on glows
  const pulse = Math.sin(frame * 0.05);
  const pinkGlow = interpolate(pulse, [-1, 1], [0.08, 0.16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blueGlow = interpolate(pulse, [-1, 1], [0.06, 0.13], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Base */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: BG_DARK }} />

      {/* Neon pink glow — top center */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLOR_PINK} 0%, transparent 65%)`,
          transform: "translateX(-50%)",
          opacity: pinkGlow * fadeIn,
        }}
      />

      {/* Electric blue glow — lower left */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: -200,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLOR_BLUE} 0%, transparent 65%)`,
          opacity: blueGlow * fadeIn,
        }}
      />

      {/* Lime accent glow — lower right */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          right: -100,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLOR_LIME} 0%, transparent 65%)`,
          opacity: (blueGlow * 0.55) * fadeIn,
        }}
      />

      {/* Subtle scan-line grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 48px)",
          opacity: fadeIn,
        }}
      />
    </>
  );
};

// ── Floating sparkles ─────────────────────────────────────────────────────────
const FloatingSparkles: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {SPARKLE_DATA.map((sp, i) => {
        const f = Math.max(0, frame - sp.delay);
        const appear = interpolate(f, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        // Twinkle pulse
        const twinkle = interpolate(
          Math.sin(f * 0.15 + i * 0.7),
          [-1, 1],
          [0.3, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const spinAngle = (f * 0.6 + sp.spin) % 360;
        const floatY = Math.sin(f * 0.04 + i * 0.5) * 8;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: sp.x,
              top: sp.y + floatY,
              opacity: appear * twinkle,
              transform: `rotate(${spinAngle}deg)`,
              filter: `drop-shadow(0 0 ${sp.size * 0.4}px ${sp.color}cc)`,
            }}
          >
            <SparkleShape size={sp.size} color={sp.color} kind={sp.kind} />
          </div>
        );
      })}
    </div>
  );
};

// ── Confetti burst ────────────────────────────────────────────────────────────
const ConfettiBurst: React.FC<{ frame: number }> = ({ frame }) => {
  const globalReveal = interpolate(frame, [6, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {CONFETTI.map((p, i) => {
        const localFrame = frame;
        const drift = (p.y + localFrame * p.speed) % 2100 - 100;
        const swayX = Math.sin(localFrame * p.sway + p.phase) * 28;
        const rotate = (localFrame * p.spinRate * 180) % 360;
        const opacity =
          globalReveal *
          interpolate(localFrame, [0, 16], [0, 0.8], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

        const sStyle: React.CSSProperties =
          p.shape === "circle"
            ? { borderRadius: "50%", width: p.size, height: p.size }
            : p.shape === "pill"
            ? { borderRadius: 99, width: p.size * 2, height: p.size * 0.55 }
            : p.shape === "diamond"
            ? {
                width: p.size,
                height: p.size,
                transform: `rotate(${rotate + 45}deg)`,
                borderRadius: 2,
              }
            : { borderRadius: 2, width: p.size * 1.5, height: p.size * 0.6 };

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + swayX,
              top: drift,
              backgroundColor: p.color,
              opacity,
              transform: p.shape !== "diamond" ? `rotate(${rotate}deg)` : undefined,
              ...sStyle,
            }}
          />
        );
      })}
    </div>
  );
};

// ── "YOU'RE INVITED" hero title ───────────────────────────────────────────────
const HeroTitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 160, mass: 0.6 },
  });

  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shimmer sweep
  const shimmerX = interpolate(frame, [18, 55], [-300, 1200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Subtle glow pulse after entrance
  const glowPulse = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [30, 55],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "relative",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        textAlign: "center",
        overflow: "hidden",
        borderRadius: 8,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 108,
          letterSpacing: -2,
          lineHeight: 0.9,
          background: `linear-gradient(130deg, ${COLOR_PINK} 0%, #ff80b4 30%, ${COLOR_BLUE} 65%, ${COLOR_LIME} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          display: "block",
          filter: `drop-shadow(0 0 ${glowPulse}px ${COLOR_PINK}80) drop-shadow(0 0 ${glowPulse * 0.6}px ${COLOR_BLUE}60)`,
        }}
      >
        YOU'RE
      </span>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 108,
          letterSpacing: -2,
          lineHeight: 0.95,
          background: `linear-gradient(130deg, ${COLOR_LIME} 0%, ${COLOR_BLUE} 45%, ${COLOR_PINK} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          display: "block",
          filter: `drop-shadow(0 0 ${glowPulse}px ${COLOR_LIME}70) drop-shadow(0 0 ${glowPulse * 0.5}px ${COLOR_BLUE}50)`,
        }}
      >
        INVITED
      </span>
      {/* Shimmer highlight */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: shimmerX,
          width: 160,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
          transform: "skewX(-8deg)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ── Event name badge ──────────────────────────────────────────────────────────
const EventNameBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const START = 18;
  const f = Math.max(0, frame - START);

  const scale = spring({
    frame: f,
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
  });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        marginTop: 8,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${COLOR_PINK}22, ${COLOR_PURPLE}22)`,
          border: `2px solid ${COLOR_PINK}60`,
          borderRadius: 16,
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 40,
          paddingRight: 40,
          boxShadow: `0 0 ${20 + glowPulse * 20}px ${COLOR_PINK}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 64,
            letterSpacing: 6,
            color: "#ffffff",
            textShadow: `0 0 20px ${COLOR_PINK}90, 0 0 40px ${COLOR_PINK}50`,
            display: "block",
            textAlign: "center",
          }}
        >
          {EVENT_NAME}
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 28,
            color: `${COLOR_BLUE}cc`,
            letterSpacing: 4,
            display: "block",
            textAlign: "center",
            marginTop: 2,
          }}
        >
          {EVENT_SUBTITLE}
        </span>
      </div>
    </div>
  );
};

// ── Detail row (icon + label + value) ────────────────────────────────────────
const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue?: string;
  accent: string;
  frame: number;
  fps: number;
  startFrame: number;
}> = ({ icon, label, value, subvalue, accent, frame, fps, startFrame }) => {
  const f = Math.max(0, frame - startFrame);

  const y = spring({
    frame: f,
    fps,
    from: 40,
    to: 0,
    config: { damping: 13, stiffness: 160, mass: 0.55 },
  });
  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        width: "100%",
        padding: "18px 0",
        borderBottom: `1px solid rgba(255,255,255,0.07)`,
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: `${accent}18`,
          border: `1.5px solid ${accent}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 0 16px ${accent}25`,
        }}
      >
        {icon}
      </div>
      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 20,
            color: `${accent}cc`,
            letterSpacing: 2,
            textTransform: "uppercase" as const,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 34,
            color: "#ffffff",
            letterSpacing: -0.5,
            textShadow: `0 0 12px ${accent}40`,
          }}
        >
          {value}
        </span>
        {subvalue && (
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {subvalue}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Calendar SVG icon ─────────────────────────────────────────────────────────
const CalendarIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="2" y="6" width="28" height="24" rx="4" stroke={color} strokeWidth="2" />
    <line x1="2" y1="13" x2="30" y2="13" stroke={color} strokeWidth="1.5" />
    <line x1="10" y1="2" x2="10" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="22" y1="2" x2="22" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <rect x="7" y="18" width="5" height="5" rx="1" fill={color} opacity="0.8" />
    <rect x="14" y="18" width="5" height="5" rx="1" fill={color} opacity="0.8" />
  </svg>
);

// ── Clock SVG icon ────────────────────────────────────────────────────────────
const ClockIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="13" stroke={color} strokeWidth="2" />
    <line x1="16" y1="8" x2="16" y2="16" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <line x1="16" y1="16" x2="22" y2="20" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="16" cy="16" r="2" fill={color} />
  </svg>
);

// ── Map pin SVG icon ──────────────────────────────────────────────────────────
const PinIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path
      d="M16 2C11.03 2 7 6.03 7 11c0 7.5 9 19 9 19s9-11.5 9-19c0-4.97-4.03-9-9-9z"
      stroke={color}
      strokeWidth="2"
    />
    <circle cx="16" cy="11" r="3.5" fill={color} opacity="0.85" />
  </svg>
);

// ── RSVP pulsing deadline pill ────────────────────────────────────────────────
const RsvpBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const START = 86;
  const f = Math.max(0, frame - START);

  const scale = spring({
    frame: f,
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 9, stiffness: 240, mass: 0.45 },
  });
  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse glow ring
  const ringPhase = Math.max(0, f - 10) % 36;
  const ringScale = interpolate(ringPhase, [0, 36], [1, 1.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(ringPhase, [0, 12, 36], [0.7, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showRing = f >= 10;

  // Shimmer
  const shimmerX = interpolate(Math.max(0, f - 14) % 44, [0, 44], [-100, 460], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showShimmer = f >= 14;

  // Breathe
  const breathe = interpolate(Math.sin(f * 0.13), [-1, 1], [0.98, 1.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dot blink
  const dotOpacity = interpolate(Math.sin(frame * 0.22), [-1, 1], [0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale * breathe})`,
        position: "relative",
        display: "inline-block",
        width: "100%",
      }}
    >
      {/* Pulse ring */}
      {showRing && (
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: 22,
            border: `2.5px solid ${COLOR_LIME}`,
            opacity: ringOpacity,
            transform: `scale(${ringScale})`,
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          background: `linear-gradient(135deg, ${COLOR_LIME}28 0%, ${COLOR_LIME}10 100%)`,
          border: `2px solid ${COLOR_LIME}70`,
          borderRadius: 18,
          padding: "20px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          boxShadow: `0 0 32px ${COLOR_LIME}30, 0 8px 24px rgba(0,0,0,0.5)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: COLOR_LIME,
            boxShadow: `0 0 10px ${COLOR_LIME}, 0 0 20px ${COLOR_LIME}80`,
            opacity: dotOpacity,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 36,
            color: COLOR_LIME,
            letterSpacing: 2,
            textShadow: `0 0 16px ${COLOR_LIME}80`,
            position: "relative",
            zIndex: 1,
          }}
        >
          {RSVP_DEADLINE}
        </span>
        {/* Shimmer */}
        {showShimmer && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: shimmerX,
              width: 100,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
              transform: "skewX(-10deg)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
};

// ── Dress code tag ────────────────────────────────────────────────────────────
const DressCodeTag: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const START = 100;
  const f = Math.max(0, frame - START);
  const y = spring({
    frame: f,
    fps,
    from: 24,
    to: 0,
    config: { damping: 14, stiffness: 180 },
  });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginTop: 4,
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 22,
          color: `${COLOR_PURPLE}aa`,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
        }}
      >
        Dress Code:
      </span>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: COLOR_PURPLE,
          letterSpacing: 1,
          textShadow: `0 0 12px ${COLOR_PURPLE}80`,
        }}
      >
        {DRESS_CODE}
      </span>
    </div>
  );
};

// ── "Party mode" top pill badge ───────────────────────────────────────────────
const PartyBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - 4);
  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 11, stiffness: 240, mass: 0.4 },
  });
  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Emoji pop-bounce
  const emojiScale = spring({
    frame: Math.max(0, f - 6),
    fps,
    from: 0,
    to: 1,
    config: { damping: 7, stiffness: 300, mass: 0.3 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: "50%",
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: "center top",
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 40,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 24,
        paddingRight: 24,
        backdropFilter: "blur(8px)",
        whiteSpace: "nowrap" as const,
      }}
    >
      <span style={{ fontSize: 28, transform: `scale(${emojiScale})`, display: "inline-block" }}>
        🎉
      </span>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: 3,
          textTransform: "uppercase" as const,
        }}
      >
        Party Mode ON
      </span>
      <span style={{ fontSize: 28, transform: `scale(${emojiScale})`, display: "inline-block" }}>
        🎊
      </span>
    </div>
  );
};

// ── Divider line ──────────────────────────────────────────────────────────────
const GlowDivider: React.FC<{ frame: number; delay: number; color: string }> = ({
  frame,
  delay,
  color,
}) => {
  const f = Math.max(0, frame - delay);
  const scaleX = interpolate(f, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(f, [0, 12], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        height: 1.5,
        width: "100%",
        background: `linear-gradient(90deg, transparent 0%, ${color}80 30%, ${color} 50%, ${color}80 70%, transparent 100%)`,
        transformOrigin: "left center",
        transform: `scaleX(${scaleX})`,
        opacity,
        marginTop: 6,
        marginBottom: 6,
        boxShadow: `0 0 8px ${color}60`,
      }}
    />
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export const RemotionPartyInvite: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: globalOpacity, overflow: "hidden" }}>
      <Background frame={frame} />
      <ConfettiBurst frame={frame} />
      <FloatingSparkles frame={frame} />

      {/* Party mode badge */}
      <PartyBadge frame={frame} fps={fps} />

      {/* Main column layout */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 48,
          paddingRight: 48,
          paddingTop: 160,
          paddingBottom: 60,
          gap: 0,
        }}
      >
        {/* YOU'RE INVITED */}
        <HeroTitle frame={frame} fps={fps} />

        {/* Event name badge */}
        <EventNameBadge frame={frame} fps={fps} />

        <GlowDivider frame={frame} delay={28} color={COLOR_PINK} />

        {/* Detail rows */}
        <div style={{ width: "100%", marginTop: 4 }}>
          <DetailRow
            icon={<CalendarIcon color={COLOR_BLUE} />}
            label="Date"
            value={EVENT_DATE}
            accent={COLOR_BLUE}
            frame={frame}
            fps={fps}
            startFrame={38}
          />
          <DetailRow
            icon={<ClockIcon color={COLOR_PINK} />}
            label="Time"
            value={EVENT_TIME}
            accent={COLOR_PINK}
            frame={frame}
            fps={fps}
            startFrame={52}
          />
          <DetailRow
            icon={<PinIcon color={COLOR_LIME} />}
            label="Location"
            value={EVENT_PLACE}
            subvalue={EVENT_ADDRESS}
            accent={COLOR_LIME}
            frame={frame}
            fps={fps}
            startFrame={66}
          />
        </div>

        <GlowDivider frame={frame} delay={78} color={COLOR_LIME} />

        {/* RSVP badge */}
        <div style={{ width: "100%", marginTop: 12 }}>
          <RsvpBadge frame={frame} fps={fps} />
        </div>

        {/* Dress code */}
        <DressCodeTag frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionPartyInvite"
    component={RemotionPartyInvite}
    durationInFrames={DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);
