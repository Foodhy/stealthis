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

// ── Design tokens ────────────────────────────────────────────────────────────
const BG = "#09090f";
const SURFACE = "#111118";
const CARD = "#16161f";
const CARD_ELEVATED = "#1c1c28";
const PROBLEM_ACCENT = "#ef4444"; // red — Act 1
const SOLUTION_ACCENT = "#6366f1"; // indigo — Act 2
const SOLUTION_ACCENT_2 = "#818cf8";
const RESULT_ACCENT = "#10b981"; // emerald — Act 3
const CTA_ACCENT = "#f59e0b"; // amber — closing
const TEXT = "#f8fafc";
const TEXT_MUTED = "rgba(248,250,252,0.5)";
const TEXT_FAINT = "rgba(248,250,252,0.25)";

// ── Fictional SaaS content ───────────────────────────────────────────────────
const PRODUCT = "Orion";
const TAGLINE = "Ship with confidence, every time";

const PROBLEM = {
  eyebrow: "The Problem",
  headline: "Manual deployments are\nkilling your team",
  bullets: [
    "14-day release cycles slow you to a crawl",
    "Rollbacks take hours, not seconds",
    "On-call engineers burned out from alerts",
  ],
};

const SOLUTIONS = [
  { icon: "✓", text: "One-click automated CI/CD pipelines" },
  { icon: "✓", text: "AI-powered canary rollouts — zero config" },
  { icon: "✓", text: "Instant rollback on any anomaly detected" },
  { icon: "✓", text: "Unified observability across all services" },
];

const RESULTS = [
  { value: 3, suffix: "×", label: "Faster releases", color: "#6366f1" },
  { value: 60, suffix: "%", label: "Less infra cost", color: "#10b981" },
  { value: 99, suffix: "%", label: "Uptime SLA", color: "#f59e0b" },
];

const CTA_HEADLINE = "Start your free trial";
const CTA_SUB = "No credit card required · 14-day trial · Cancel anytime";

// ── Total duration: 270 frames (9 s @ 30 fps) ────────────────────────────────
// Act 1: 0  – 90   (frames 0–90)   "The Problem"
// Act 2: 80 – 180  (frames 80–180)  "The Solution"
// Act 3: 170 – 255 (frames 170–255) "The Result"
// CTA:   245 – 270 (frames 245–270) "Start Free Trial"
// Progress bar: spans all 270 frames

// ── Helpers ──────────────────────────────────────────────────────────────────
function fadeIn(
  frame: number,
  start: number,
  duration = 18,
  easing?: (t: number) => number
): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing ?? Easing.out(Easing.quad),
  });
}

function slideUp(
  frame: number,
  start: number,
  distance = 36,
  duration = 22
): string {
  const y = interpolate(frame, [start, start + duration], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return `translateY(${y}px)`;
}

function slideIn(
  frame: number,
  start: number,
  distance = -50,
  duration = 22
): string {
  const x = interpolate(frame, [start, start + duration], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return `translateX(${x}px)`;
}

// ── Shared: background grid overlay ─────────────────────────────────────────
const GridOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
      `,
      backgroundSize: "60px 60px",
      pointerEvents: "none",
    }}
  />
);

// ── Shared: radial glow ───────────────────────────────────────────────────────
const RadialGlow: React.FC<{
  color: string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  size?: number;
  opacity?: number;
}> = ({ color, top, left, right, bottom, size = 600, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      right,
      bottom,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}28 0%, transparent 70%)`,
      opacity,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }}
  />
);

// ── Shared: Progress Bar ─────────────────────────────────────────────────────
const ProgressBar: React.FC<{ frame: number; total: number }> = ({
  frame,
  total,
}) => {
  const progress = interpolate(frame, [0, total], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${SOLUTION_ACCENT}, ${RESULT_ACCENT})`,
          boxShadow: `0 0 12px ${SOLUTION_ACCENT}88`,
          transition: "width 0.016s linear",
        }}
      />
    </div>
  );
};

// ── Act 1: The Problem ────────────────────────────────────────────────────────
const ProblemBullet: React.FC<{
  text: string;
  frame: number;
  fps: number;
  startFrame: number;
}> = ({ text, frame, fps, startFrame }) => {
  const localFrame = Math.max(0, frame - startFrame);
  const opacity = fadeIn(frame, startFrame, 16);
  const x = interpolate(frame, [startFrame, startFrame + 22], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dotScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 140 },
    from: 0,
    to: 1,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `translateX(${x}px)`,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: PROBLEM_ACCENT,
          flexShrink: 0,
          transform: `scale(${dotScale})`,
          boxShadow: `0 0 10px ${PROBLEM_ACCENT}88`,
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 20,
          fontWeight: 400,
          color: TEXT_MUTED,
          lineHeight: 1.5,
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Act1Problem: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const eyebrowOpacity = fadeIn(frame, 0, 20);
  const headlineOpacity = fadeIn(frame, 12, 22);
  const headlineY = slideUp(frame, 12, 40, 24);

  const iconScale = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 10, stiffness: 80 },
    from: 0,
    to: 1,
  });
  const iconOpacity = fadeIn(frame, 5, 18);

  const bulletStarts = [40, 58, 76];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 140px",
      }}
    >
      <RadialGlow color={PROBLEM_ACCENT} top="10%" left="50%" size={700} opacity={0.6} />

      {/* Sad icon */}
      <div
        style={{
          opacity: iconOpacity,
          transform: `scale(${iconScale})`,
          width: 80,
          height: 80,
          borderRadius: 24,
          background: `${PROBLEM_ACCENT}18`,
          border: `1.5px solid ${PROBLEM_ACCENT}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 38,
          marginBottom: 28,
          boxShadow: `0 0 48px ${PROBLEM_ACCENT}33`,
        }}
      >
        💥
      </div>

      {/* Eyebrow */}
      <div
        style={{
          opacity: eyebrowOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: PROBLEM_ACCENT,
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          marginBottom: 14,
        }}
      >
        {PROBLEM.eyebrow}
      </div>

      {/* Headline */}
      <div
        style={{
          opacity: headlineOpacity,
          transform: headlineY,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 48,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: "-0.025em",
          lineHeight: 1.2,
          textAlign: "center" as const,
          marginBottom: 44,
          whiteSpace: "pre-line" as const,
        }}
      >
        {PROBLEM.headline}
      </div>

      {/* Bullets */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "flex-start",
          alignSelf: "flex-start",
          marginLeft: 60,
        }}
      >
        {PROBLEM.bullets.map((b, i) => (
          <ProblemBullet
            key={i}
            text={b}
            frame={frame}
            fps={fps}
            startFrame={bulletStarts[i]}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Act 2: The Solution ───────────────────────────────────────────────────────
const CheckItem: React.FC<{
  icon: string;
  text: string;
  frame: number;
  fps: number;
  startFrame: number;
  index: number;
}> = ({ icon, text, frame, fps, startFrame, index }) => {
  const localFrame = Math.max(0, frame - startFrame);
  const opacity = fadeIn(frame, startFrame, 18);
  const x = interpolate(frame, [startFrame, startFrame + 26], [-50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.3)),
  });
  const checkScale = spring({
    frame: Math.max(0, localFrame - 4),
    fps,
    config: { damping: 11, stiffness: 160 },
    from: 0,
    to: 1,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "16px 22px",
        borderRadius: 14,
        background: CARD_ELEVATED,
        border: `1px solid ${SOLUTION_ACCENT}28`,
        opacity,
        transform: `translateX(${x}px)`,
        boxShadow: `0 2px 16px rgba(0,0,0,0.3)`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${SOLUTION_ACCENT}44, ${SOLUTION_ACCENT_2}44)`,
          border: `1.5px solid ${SOLUTION_ACCENT}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transform: `scale(${checkScale})`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 16,
            fontWeight: 800,
            color: SOLUTION_ACCENT_2,
          }}
        >
          {icon}
        </span>
      </div>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 18,
          fontWeight: 500,
          color: TEXT,
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Act2Solution: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const eyebrowOpacity = fadeIn(frame, 90, 18);
  const headlineOpacity = fadeIn(frame, 100, 22);
  const headlineY = slideUp(frame, 100, 36, 24);

  const checkStarts = [118, 138, 158, 178];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
      }}
    >
      <RadialGlow
        color={SOLUTION_ACCENT}
        top="15%"
        left="60%"
        size={600}
        opacity={0.7}
      />
      <RadialGlow
        color={SOLUTION_ACCENT_2}
        top="80%"
        left="30%"
        size={400}
        opacity={0.4}
      />

      {/* Eyebrow */}
      <div
        style={{
          opacity: eyebrowOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: SOLUTION_ACCENT_2,
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          marginBottom: 12,
        }}
      >
        The Solution
      </div>

      {/* Headline */}
      <div
        style={{
          opacity: headlineOpacity,
          transform: headlineY,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 46,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: "-0.025em",
          lineHeight: 1.15,
          textAlign: "center" as const,
          marginBottom: 40,
        }}
      >
        Meet{" "}
        <span
          style={{
            background: `linear-gradient(90deg, ${SOLUTION_ACCENT}, ${SOLUTION_ACCENT_2})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {PRODUCT}
        </span>
      </div>

      {/* Checkmark items */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
          maxWidth: 820,
        }}
      >
        {SOLUTIONS.map((s, i) => (
          <CheckItem
            key={i}
            icon={s.icon}
            text={s.text}
            frame={frame}
            fps={fps}
            startFrame={checkStarts[i]}
            index={i}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Act 3: The Result ─────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  value: number;
  suffix: string;
  label: string;
  color: string;
  frame: number;
  fps: number;
  startFrame: number;
}> = ({ value, suffix, label, color, frame, fps, startFrame }) => {
  const localFrame = Math.max(0, frame - startFrame);
  const opacity = fadeIn(frame, startFrame, 20);
  const scaleSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 100 },
    from: 0.65,
    to: 1,
  });

  // Count-up animation
  const counted = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 55 },
    from: 0,
    to: value,
  });
  const displayVal = Math.round(counted);

  const glowOpacity = interpolate(localFrame, [0, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        opacity,
        transform: `scale(${scaleSpring})`,
        background: CARD_ELEVATED,
        border: `1px solid ${color}33`,
        borderRadius: 22,
        padding: "36px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 8px 40px rgba(0,0,0,0.45), 0 0 60px ${color}18`,
      }}
    >
      {/* Inner glow */}
      <div
        style={{
          position: "absolute",
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}28 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />

      {/* Big number */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 72,
          fontWeight: 800,
          color,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          position: "relative",
        }}
      >
        {displayVal}
        {suffix}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 15,
          fontWeight: 500,
          color: TEXT_MUTED,
          textAlign: "center" as const,
          position: "relative",
        }}
      >
        {label}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${color}BB, transparent)`,
          opacity: glowOpacity,
        }}
      />
    </div>
  );
};

const Act3Results: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const eyebrowOpacity = fadeIn(frame, 175, 18);
  const headlineOpacity = fadeIn(frame, 185, 22);
  const headlineY = slideUp(frame, 185, 36, 24);

  const cardStarts = [200, 220, 240];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <RadialGlow
        color={RESULT_ACCENT}
        top="20%"
        left="50%"
        size={700}
        opacity={0.45}
      />

      {/* Eyebrow */}
      <div
        style={{
          opacity: eyebrowOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: RESULT_ACCENT,
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          marginBottom: 12,
        }}
      >
        The Result
      </div>

      {/* Headline */}
      <div
        style={{
          opacity: headlineOpacity,
          transform: headlineY,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 46,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: "-0.025em",
          marginBottom: 48,
          textAlign: "center" as const,
        }}
      >
        Real numbers, real impact
      </div>

      {/* Metric cards */}
      <div
        style={{
          display: "flex",
          gap: 24,
          width: "100%",
        }}
      >
        {RESULTS.map((r, i) => (
          <MetricCard
            key={i}
            value={r.value}
            suffix={r.suffix}
            label={r.label}
            color={r.color}
            frame={frame}
            fps={fps}
            startFrame={cardStarts[i]}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Closing CTA ───────────────────────────────────────────────────────────────
const CTACard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = Math.max(0, frame - 248);
  const opacity = fadeIn(frame, 248, 22);
  const scaleSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 100 },
    from: 0.85,
    to: 1,
  });

  // Pulsing border glow
  const pulsePhase = ((frame - 258) % 48) / 48;
  const pulseGlow =
    frame >= 258
      ? interpolate(pulsePhase, [0, 0.5, 1], [0.5, 1, 0.5], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const logoOpacity = fadeIn(frame, 250, 18);
  const headlineOpacity = fadeIn(frame, 256, 18);
  const headlineY = slideUp(frame, 256, 24, 20);
  const subOpacity = fadeIn(frame, 268, 16);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
        opacity,
      }}
    >
      <RadialGlow
        color={CTA_ACCENT}
        top="50%"
        left="50%"
        size={650}
        opacity={0.4}
      />

      {/* CTA card */}
      <div
        style={{
          transform: `scale(${scaleSpring})`,
          background: CARD_ELEVATED,
          border: `1.5px solid ${CTA_ACCENT}${Math.round(40 + pulseGlow * 60).toString(16).padStart(2, "0")}`,
          borderRadius: 28,
          padding: "52px 72px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          maxWidth: 700,
          width: "100%",
          position: "relative",
          boxShadow: `0 0 80px ${CTA_ACCENT}${Math.round(pulseGlow * 40)
            .toString(16)
            .padStart(2, "0")}, 0 16px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Product logo mark */}
        <div
          style={{
            opacity: logoOpacity,
            width: 60,
            height: 60,
            borderRadius: 18,
            background: `linear-gradient(135deg, ${SOLUTION_ACCENT} 0%, ${SOLUTION_ACCENT_2} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            boxShadow: `0 0 32px ${SOLUTION_ACCENT}55`,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="10" cy="10" r="4" fill="white" opacity="0.9" />
            <circle cx="22" cy="10" r="4" fill="white" opacity="0.55" />
            <circle cx="10" cy="22" r="4" fill="white" opacity="0.55" />
            <circle cx="22" cy="22" r="4" fill="white" opacity="0.9" />
          </svg>
        </div>

        {/* CTA headline */}
        <div
          style={{
            opacity: headlineOpacity,
            transform: headlineY,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 44,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            textAlign: "center" as const,
            marginBottom: 16,
          }}
        >
          {CTA_HEADLINE}
        </div>

        {/* Subtext */}
        <div
          style={{
            opacity: subOpacity,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 15,
            fontWeight: 400,
            color: TEXT_FAINT,
            textAlign: "center" as const,
            marginBottom: 36,
            letterSpacing: "0.01em",
          }}
        >
          {CTA_SUB}
        </div>

        {/* CTA button */}
        <div
          style={{
            opacity: headlineOpacity,
            background: `linear-gradient(135deg, ${CTA_ACCENT} 0%, #f97316 100%)`,
            borderRadius: 100,
            padding: "16px 48px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 17,
            fontWeight: 700,
            color: "#0a0a0f",
            letterSpacing: "0.02em",
            boxShadow: `0 0 40px ${CTA_ACCENT}55, 0 4px 20px rgba(0,0,0,0.4)`,
            transform: `scale(${1 + pulseGlow * 0.015})`,
          }}
        >
          Get started free →
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Top-right product badge ───────────────────────────────────────────────────
const ProductBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = fadeIn(frame, 0, 24);
  return (
    <div
      style={{
        position: "absolute",
        top: 32,
        right: 44,
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          background: `linear-gradient(135deg, ${SOLUTION_ACCENT}, ${SOLUTION_ACCENT_2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
          <circle cx="10" cy="10" r="4" fill="white" opacity="0.9" />
          <circle cx="22" cy="10" r="4" fill="white" opacity="0.55" />
          <circle cx="10" cy="22" r="4" fill="white" opacity="0.55" />
          <circle cx="22" cy="22" r="4" fill="white" opacity="0.9" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: TEXT,
          letterSpacing: "-0.01em",
          opacity: 0.85,
        }}
      >
        {PRODUCT}
      </span>
    </div>
  );
};

// ── Act transition helpers ───────────────────────────────────────────────────
function actOpacity(
  frame: number,
  fadeInAt: number,
  fadeOutAt: number,
  fadeDuration = 12
): number {
  return interpolate(
    frame,
    [
      fadeInAt,
      fadeInAt + fadeDuration,
      fadeOutAt,
      fadeOutAt + fadeDuration,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

// ── Main composition ──────────────────────────────────────────────────────────
export const ExplainerVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Act crossfade timing
  // Act 1: 0–90, fade out 78–90
  // Act 2: 80–175, fade in 80–92, fade out 163–175
  // Act 3: 165–248, fade in 165–177, fade out 236–248
  // CTA: 240–270, fade in 240–252

  const act1Opacity = interpolate(frame, [0, 8, 78, 92], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const act2Opacity = interpolate(frame, [80, 92, 163, 177], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const act3Opacity = interpolate(frame, [165, 177, 236, 250], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [240, 254], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Global fade-out at very end
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: globalOpacity }}>
      <GridOverlay />

      {/* Act 1: Problem */}
      <AbsoluteFill style={{ opacity: act1Opacity }}>
        <Act1Problem frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* Act 2: Solution */}
      <AbsoluteFill style={{ opacity: act2Opacity }}>
        <Act2Solution frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* Act 3: Results */}
      <AbsoluteFill style={{ opacity: act3Opacity }}>
        <Act3Results frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* CTA */}
      <AbsoluteFill style={{ opacity: ctaOpacity }}>
        <CTACard frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* Always-on chrome */}
      <ProductBadge frame={frame} />
      <ProgressBar frame={frame} total={durationInFrames} />
    </AbsoluteFill>
  );
};

// ── Remotion root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ExplainerVideo"
      component={ExplainerVideo}
      durationInFrames={270}
      fps={30}
      width={1280}
      height={720}
    />
  );
};

export default ExplainerVideo;
