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
const BG = "#0a0a0f";
const SURFACE = "#12121a";
const CARD = "#1a1a2e";
const BRAND = "#6366f1";
const BRAND_2 = "#8b5cf6";
const ACCENT = "#06b6d4";
const TEXT = "#f8fafc";
const TEXT_MUTED = "rgba(248,250,252,0.55)";
const SUCCESS = "#10b981";
const WARNING = "#f59e0b";
const DANGER = "#ef4444";

// ── Content ──────────────────────────────────────────────────────────────────
const COMPANY_NAME = "TechCorp Inc";
const COMPANY_INDUSTRY = "Enterprise SaaS";
const PRODUCT = "Launchpad";

const CHALLENGE_TITLE = "The Challenge";
const CHALLENGE_TEXT_1 = "TechCorp's legacy release pipeline averaged 14-day deploy cycles,";
const CHALLENGE_TEXT_2 = "drowning the eng team in manual rollbacks and L1 support noise.";

const SOLUTION_POINTS = [
  { icon: "⚡", text: "Automated CI/CD pipelines with zero-config deployments" },
  { icon: "🛡️", text: "AI-powered canary rollouts with instant rollback triggers" },
  { icon: "📊", text: "Unified observability dashboard across 60+ microservices" },
];

const METRICS = [
  { value: 340, suffix: "%", prefix: "+", label: "ROI in 90 days", color: SUCCESS },
  { value: 2, suffix: "×", prefix: "", label: "Faster deployments", color: BRAND },
  { value: 60, suffix: "%", prefix: "−", label: "Support tickets", color: ACCENT },
];

const QUOTE_TEXT =
  "Launchpad didn't just speed us up — it fundamentally changed how our engineers think about shipping. We went from fear to confidence overnight.";
const QUOTE_AUTHOR = "— Sarah Chen, CTO at TechCorp Inc";

// ── Helpers ──────────────────────────────────────────────────────────────────
function easeOut(frame: number, from: number, to: number, duration = 20): number {
  return interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
}

function fadeIn(frame: number, start: number, duration = 18): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function slideUp(frame: number, start: number, duration = 22, distance = 40): string {
  const p = interpolate(frame, [start, start + duration], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });
  return `translateY(${p}px)`;
}

// ── Background glow ───────────────────────────────────────────────────────────
const BGGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "30%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND}22 0%, transparent 65%)`,
          opacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          right: "20%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 60%)`,
          opacity,
        }}
      />
    </>
  );
};

// ── Act 1: Company Intro (0–3 s, frames 0–90) ────────────────────────────────
const Act1: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, from: 0.4, to: 1 });
  const logoOpacity = fadeIn(frame, 0, 20);

  const nameOpacity = fadeIn(frame, 18, 20);
  const nameTranslate = slideUp(frame, 18, 22);

  const tagOpacity = fadeIn(frame, 30, 18);
  const tagTranslate = slideUp(frame, 30, 20);

  const challengeLabelOpacity = fadeIn(frame, 48, 18);
  const challengeLabelTranslate = slideUp(frame, 48, 20);

  const line1Opacity = fadeIn(frame, 60, 16);
  const line1Translate = slideUp(frame, 60, 18);

  const line2Opacity = fadeIn(frame, 70, 16);
  const line2Translate = slideUp(frame, 70, 18);

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
      {/* Logo mark */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          width: 72,
          height: 72,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_2} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          boxShadow: `0 0 40px ${BRAND}55`,
        }}
      >
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          <rect x="5" y="5" width="12" height="12" rx="3" fill="white" opacity="0.9" />
          <rect x="21" y="5" width="12" height="12" rx="3" fill="white" opacity="0.6" />
          <rect x="5" y="21" width="12" height="12" rx="3" fill="white" opacity="0.6" />
          <rect x="21" y="21" width="12" height="12" rx="3" fill="white" opacity="0.9" />
        </svg>
      </div>

      {/* Company name */}
      <div
        style={{
          opacity: nameOpacity,
          transform: nameTranslate,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 48,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: "-0.02em",
          marginBottom: 10,
        }}
      >
        {COMPANY_NAME}
      </div>

      {/* Industry tag */}
      <div
        style={{
          opacity: tagOpacity,
          transform: tagTranslate,
          background: `${BRAND}22`,
          border: `1px solid ${BRAND}44`,
          borderRadius: 100,
          padding: "6px 18px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: BRAND,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          marginBottom: 48,
        }}
      >
        {COMPANY_INDUSTRY}
      </div>

      {/* Divider */}
      <div
        style={{
          width: interpolate(frame, [46, 70], [0, 320], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
          height: 1,
          background: `linear-gradient(90deg, transparent, ${BRAND}66, transparent)`,
          marginBottom: 32,
        }}
      />

      {/* Challenge label */}
      <div
        style={{
          opacity: challengeLabelOpacity,
          transform: challengeLabelTranslate,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: WARNING,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          marginBottom: 12,
        }}
      >
        {CHALLENGE_TITLE}
      </div>

      {/* Problem line 1 */}
      <div
        style={{
          opacity: line1Opacity,
          transform: line1Translate,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 20,
          fontWeight: 400,
          color: TEXT_MUTED,
          textAlign: "center" as const,
          lineHeight: 1.6,
        }}
      >
        {CHALLENGE_TEXT_1}
      </div>

      {/* Problem line 2 */}
      <div
        style={{
          opacity: line2Opacity,
          transform: line2Translate,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 20,
          fontWeight: 400,
          color: TEXT_MUTED,
          textAlign: "center" as const,
          lineHeight: 1.6,
        }}
      >
        {CHALLENGE_TEXT_2}
      </div>
    </AbsoluteFill>
  );
};

// ── Act 2: Solution Reveal (3–7 s, frames 90–210) ───────────────────────────
const SolutionPoint: React.FC<{
  frame: number;
  fps: number;
  index: number;
  icon: string;
  text: string;
  startFrame: number;
}> = ({ frame, fps, index, icon, text, startFrame }) => {
  const localFrame = frame - startFrame;
  const scaleSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 130 },
    from: 0,
    to: 1,
  });
  const opacity = fadeIn(frame, startFrame, 15);
  const tx = interpolate(frame, [startFrame, startFrame + 22], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "18px 24px",
        borderRadius: 14,
        background: CARD,
        border: `1px solid rgba(99,102,241,0.2)`,
        opacity,
        transform: `translateX(${tx}px) scale(${scaleSpring})`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${BRAND}33, ${BRAND_2}33)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 17,
          fontWeight: 500,
          color: TEXT,
          lineHeight: 1.4,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Act2: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const headerOpacity = fadeIn(frame, 90, 20);
  const headerTranslate = slideUp(frame, 90, 22);

  const subOpacity = fadeIn(frame, 105, 18);
  const subTranslate = slideUp(frame, 105, 20);

  const pointStarts = [120, 140, 160];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
        gap: 0,
      }}
    >
      {/* Section label */}
      <div
        style={{
          opacity: subOpacity,
          transform: subTranslate,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: ACCENT,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          marginBottom: 10,
        }}
      >
        Case Study · Solution
      </div>

      {/* Main header */}
      <div
        style={{
          opacity: headerOpacity,
          transform: headerTranslate,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 42,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: "-0.02em",
          marginBottom: 40,
          textAlign: "center" as const,
        }}
      >
        How{" "}
        <span
          style={{
            background: `linear-gradient(90deg, ${BRAND}, ${BRAND_2})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {PRODUCT}
        </span>{" "}
        helped
      </div>

      {/* Solution points */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: 780,
        }}
      >
        {SOLUTION_POINTS.map((pt, i) => (
          <SolutionPoint
            key={i}
            frame={frame}
            fps={fps}
            index={i}
            icon={pt.icon}
            text={pt.text}
            startFrame={pointStarts[i]}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Act 3: Results (7–12 s, frames 210–360) ──────────────────────────────────
const MetricCard: React.FC<{
  frame: number;
  fps: number;
  prefix: string;
  value: number;
  suffix: string;
  label: string;
  color: string;
  startFrame: number;
}> = ({ frame, fps, prefix, value, suffix, label, color, startFrame }) => {
  const localFrame = frame - startFrame;

  const scaleSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 100 },
    from: 0.6,
    to: 1,
  });

  const opacity = fadeIn(frame, startFrame, 18);

  // Count-up using spring
  const countedValue = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 60 },
    from: 0,
    to: value,
  });

  const displayValue = Math.round(countedValue);

  const glowOpacity = interpolate(localFrame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scaleSpring})`,
        flex: 1,
        background: CARD,
        border: `1px solid ${color}33`,
        borderRadius: 20,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 60px ${color}18`,
      }}
    >
      {/* Subtle card glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />

      {/* Big metric number */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 62,
          fontWeight: 800,
          color,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          position: "relative",
        }}
      >
        {prefix}{displayValue}{suffix}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
          fontWeight: 500,
          color: TEXT_MUTED,
          textAlign: "center" as const,
          lineHeight: 1.4,
          position: "relative",
        }}
      >
        {label}
      </div>

      {/* Bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: glowOpacity,
        }}
      />
    </div>
  );
};

const Act3: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const headerOpacity = fadeIn(frame, 210, 20);
  const headerTranslate = slideUp(frame, 210, 22);

  const labelOpacity = fadeIn(frame, 210, 18);

  const metricStarts = [228, 252, 276];

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
      {/* Section label */}
      <div
        style={{
          opacity: labelOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: SUCCESS,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          marginBottom: 10,
        }}
      >
        Measurable Impact
      </div>

      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          transform: headerTranslate,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 44,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: "-0.02em",
          marginBottom: 44,
          textAlign: "center" as const,
        }}
      >
        Results after 90 days
      </div>

      {/* Metric cards row */}
      <div
        style={{
          display: "flex",
          gap: 24,
          width: "100%",
        }}
      >
        {METRICS.map((m, i) => (
          <MetricCard
            key={i}
            frame={frame}
            fps={fps}
            prefix={m.prefix}
            value={m.value}
            suffix={m.suffix}
            label={m.label}
            color={m.color}
            startFrame={metricStarts[i]}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Act 4: Quote + CTA (12–15 s, frames 360–450) ────────────────────────────
const Act4: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const bgOpacity = fadeIn(frame, 360, 20);

  const quoteMarkOpacity = fadeIn(frame, 368, 18);
  const quoteMarkScale = spring({
    frame: frame - 368,
    fps,
    config: { damping: 12, stiffness: 100 },
    from: 0.5,
    to: 1,
  });

  const quoteTextOpacity = fadeIn(frame, 384, 22);
  const quoteTextTranslate = slideUp(frame, 384, 24, 30);

  const authorOpacity = fadeIn(frame, 410, 18);
  const authorTranslate = slideUp(frame, 410, 20);

  const dividerWidth = interpolate(frame, [406, 430], [0, 560], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const ctaOpacity = fadeIn(frame, 418, 20);
  const ctaScale = spring({
    frame: frame - 418,
    fps,
    config: { damping: 14, stiffness: 110 },
    from: 0.85,
    to: 1,
  });

  // Pulse for CTA button
  const pulse = interpolate(
    ((frame - 430) % 45) / 45,
    [0, 0.3, 0.6, 1],
    [1, 1.04, 1.04, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ctaPulse = frame >= 430 ? pulse : 1;

  // Product logo opacity in corner
  const logoOpacity = fadeIn(frame, 362, 18);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
        opacity: bgOpacity,
      }}
    >
      {/* Corner product watermark */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 48,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: logoOpacity,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 38 38" fill="none">
            <rect x="5" y="5" width="12" height="12" rx="3" fill="white" opacity="0.9" />
            <rect x="21" y="5" width="12" height="12" rx="3" fill="white" opacity="0.6" />
            <rect x="5" y="21" width="12" height="12" rx="3" fill="white" opacity="0.6" />
            <rect x="21" y="21" width="12" height="12" rx="3" fill="white" opacity="0.9" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: "-0.01em",
          }}
        >
          {PRODUCT}
        </span>
      </div>

      {/* Quote mark */}
      <div
        style={{
          opacity: quoteMarkOpacity,
          transform: `scale(${quoteMarkScale})`,
          fontFamily: "Georgia, serif",
          fontSize: 96,
          lineHeight: 1,
          color: BRAND,
          marginBottom: -24,
          alignSelf: "flex-start",
          marginLeft: 40,
          opacity: quoteMarkOpacity,
        }}
      >
        "
      </div>

      {/* Quote text */}
      <div
        style={{
          opacity: quoteTextOpacity,
          transform: quoteTextTranslate,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 22,
          fontWeight: 500,
          color: TEXT,
          lineHeight: 1.65,
          textAlign: "center" as const,
          maxWidth: 860,
          marginBottom: 28,
          fontStyle: "italic",
        }}
      >
        {QUOTE_TEXT}
      </div>

      {/* Author */}
      <div
        style={{
          opacity: authorOpacity,
          transform: authorTranslate,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 15,
          fontWeight: 600,
          color: TEXT_MUTED,
          marginBottom: 36,
        }}
      >
        {QUOTE_AUTHOR}
      </div>

      {/* Divider */}
      <div
        style={{
          width: dividerWidth,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${BRAND}55, transparent)`,
          marginBottom: 36,
        }}
      />

      {/* CTA button */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale * ctaPulse})`,
          background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_2} 100%)`,
          borderRadius: 100,
          padding: "16px 44px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 17,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.01em",
          boxShadow: `0 0 40px ${BRAND}55, 0 4px 20px rgba(0,0,0,0.4)`,
          cursor: "pointer",
        }}
      >
        Read Full Case Study →
      </div>
    </AbsoluteFill>
  );
};

// ── Root composition ─────────────────────────────────────────────────────────
const CaseStudyHighlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Global fade-out last 0.5 s (15 frames)
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Determine which act to show (cross-fade between acts)
  const act1Opacity = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const act2Opacity = interpolate(frame, [80, 95, 195, 210], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const act3Opacity = interpolate(frame, [200, 215, 345, 360], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const act4Opacity = interpolate(frame, [352, 368], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, opacity: globalOpacity }}>
      <BGGlow frame={frame} />

      {/* Act 1 */}
      <AbsoluteFill style={{ opacity: act1Opacity }}>
        <Act1 frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* Act 2 */}
      <AbsoluteFill style={{ opacity: act2Opacity }}>
        <Act2 frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* Act 3 */}
      <AbsoluteFill style={{ opacity: act3Opacity }}>
        <Act3 frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* Act 4 */}
      <AbsoluteFill style={{ opacity: act4Opacity }}>
        <Act4 frame={frame} fps={fps} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Remotion root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CaseStudyHighlight"
      component={CaseStudyHighlight}
      durationInFrames={450}
      fps={30}
      width={1280}
      height={720}
    />
  );
};

export default CaseStudyHighlight;
