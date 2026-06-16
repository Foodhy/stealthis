import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

// ─── Customizable constants ──────────────────────────────────────────────────
const TITLE = "🤧 Common Cold — Know the Signs";
const CLINIC_NAME = "Greenfield Medical Center";
const FOOTER_CTA = "Ask your doctor.";

const SYMPTOM_CHIPS: { emoji: string; label: string; dot: "warn" | "coral" }[] = [
  { emoji: "💧", label: "Runny Nose", dot: "warn" },
  { emoji: "🔥", label: "Sore Throat", dot: "coral" },
  { emoji: "🌡️", label: "Mild Fever", dot: "warn" },
  { emoji: "😣", label: "Body Aches", dot: "coral" },
];

const DANGER_SIGNS = [
  "Fever above 39°C",
  "Difficulty breathing",
  "Symptoms lasting 10+ days",
];

const CHIP_STAGGER_FRAMES = 15;
const SPRING_CONFIG = { damping: 14, stiffness: 120 };

// Duration
const TOTAL_FRAMES = 210;

// ─── Color palette ───────────────────────────────────────────────────────────
const BG = "#0a1a18";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const WHITE = "#ffffff";
const CORAL = "#ff7a66";
const MUTED = "#6b9e99";
const DANGER = "#d4503e";
const WARN = "#d98a2b";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clamp(
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number],
): number {
  return interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function useSpring(frame: number, delay = 0, config = SPRING_CONFIG) {
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
}

// ─── Background ──────────────────────────────────────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const glowOpacity = clamp(frame, [0, 20], [0, 1]);
  // Subtle ambient pulse using sine
  const pulse = 0.85 + 0.15 * Math.sin((frame * 0.04) % (Math.PI * 2));

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Top radial teal glow */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 50% 30%, ${TEAL}22 0%, transparent 70%)`,
          opacity: glowOpacity * pulse,
        }}
      />
      {/* Bottom vignette */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 400,
          background: `linear-gradient(to top, ${BG} 0%, transparent 100%)`,
        }}
      />
      {/* Subtle grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${TEAL}08 1px, transparent 1px), linear-gradient(90deg, ${TEAL}08 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: glowOpacity * 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Title ───────────────────────────────────────────────────────────────────
const TitleSection: React.FC<{ frame: number }> = ({ frame }) => {
  const titleSpring = useSpring(frame, 6);
  const translateY = interpolate(titleSpring, [0, 1], [-120, 0]);
  const opacity = clamp(frame, [6, 22], [0, 1]);

  const dividerOpacity = clamp(frame, [24, 34], [0, 1]);
  const dividerScale = clamp(frame, [24, 38], [0, 1]);

  return (
    <div
      style={{
        paddingTop: 120,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
        }}
      >
        {/* Eyebrow label */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: TEAL,
            marginBottom: 18,
          }}
        >
          Health Information
        </div>
        {/* Main headline */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 68,
            fontWeight: 800,
            color: WHITE,
            lineHeight: 1.1,
            textShadow: `0 0 40px ${TEAL}55, 0 4px 20px rgba(0,0,0,0.6)`,
          }}
        >
          {TITLE}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          marginTop: 30,
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(to right, ${TEAL}, ${TEAL}00)`,
          opacity: dividerOpacity,
          transform: `scaleX(${dividerScale})`,
          transformOrigin: "left",
        }}
      />
    </div>
  );
};

// ─── Symptom Chip ─────────────────────────────────────────────────────────────
const SymptomChip: React.FC<{
  frame: number;
  emoji: string;
  label: string;
  dot: "warn" | "coral";
  delay: number;
}> = ({ frame, emoji, label, dot, delay }) => {
  const { fps } = useVideoConfig();
  const chipSpring = spring({ frame: frame - delay, fps, config: SPRING_CONFIG });
  const translateY = interpolate(chipSpring, [0, 1], [60, 0]);
  const scale = interpolate(chipSpring, [0, 1], [0.82, 1]);
  const opacity = clamp(frame, [delay, delay + 10], [0, 1]);
  const dotColor = dot === "warn" ? WARN : CORAL;

  return (
    <div
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        position: "relative",
        background: `linear-gradient(135deg, ${TEAL}18 0%, ${TEAL}08 100%)`,
        border: `1.5px solid ${TEAL}30`,
        borderRadius: 24,
        padding: "32px 28px",
        boxShadow: `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 ${TEAL}20`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        minHeight: 160,
        justifyContent: "center",
      }}
    >
      {/* Urgency dot */}
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: dotColor,
          boxShadow: `0 0 10px ${dotColor}88`,
        }}
      />
      {/* Emoji */}
      <span style={{ fontSize: 48, lineHeight: 1 }}>{emoji}</span>
      {/* Label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 34,
          fontWeight: 700,
          color: WHITE,
          lineHeight: 1.1,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ─── Symptom Grid ─────────────────────────────────────────────────────────────
const SymptomGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const sectionOpacity = clamp(frame, [28, 38], [0, 1]);

  return (
    <div
      style={{
        paddingLeft: 60,
        paddingRight: 60,
        marginTop: 52,
        opacity: sectionOpacity,
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 26,
          fontWeight: 600,
          color: MUTED,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 28,
        }}
      >
        Symptoms to watch for
      </div>

      {/* 2×2 Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {SYMPTOM_CHIPS.map((chip, i) => (
          <SymptomChip
            key={chip.label}
            frame={frame}
            emoji={chip.emoji}
            label={chip.label}
            dot={chip.dot}
            delay={30 + i * CHIP_STAGGER_FRAMES}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Danger Panel ─────────────────────────────────────────────────────────────
const DangerPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const panelSpring = spring({ frame: frame - 105, fps, config: SPRING_CONFIG });
  const translateY = interpolate(panelSpring, [0, 1], [80, 0]);
  const opacity = clamp(frame, [105, 118], [0, 1]);

  return (
    <div
      style={{
        paddingLeft: 60,
        paddingRight: 60,
        marginTop: 52,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      <div
        style={{
          borderLeft: `5px solid ${DANGER}`,
          background: `linear-gradient(135deg, ${DANGER}14 0%, ${DANGER}06 100%)`,
          borderRadius: "0 20px 20px 0",
          padding: "34px 36px",
          boxShadow: `0 8px 40px ${DANGER}22, inset 0 1px 0 ${DANGER}18`,
        }}
      >
        {/* Panel header */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 30,
            fontWeight: 800,
            color: DANGER,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 34 }}>⚠️</span>
          When to See a Doctor
        </div>

        {/* Sign rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {DANGER_SIGNS.map((sign, i) => {
            const signOpacity = clamp(frame, [112 + i * 8, 126 + i * 8], [0, 1]);
            const signX = clamp(frame, [112 + i * 8, 130 + i * 8], [-20, 0]);
            return (
              <div
                key={sign}
                style={{
                  opacity: signOpacity,
                  transform: `translateX(${signX}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: DANGER,
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${DANGER}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                    fontSize: 32,
                    fontWeight: 500,
                    color: TEAL_SOFT,
                    lineHeight: 1.3,
                  }}
                >
                  {sign}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = clamp(frame, [145, 162], [0, 1]);
  const fadeOut = clamp(frame, [195, 210], [1, 0]);
  // Soft pulse for footer teal dot
  const dotPulse = 0.7 + 0.3 * Math.sin((frame * 0.12) % (Math.PI * 2));

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 70,
        paddingLeft: 60,
        paddingRight: 60,
        opacity: opacity * fadeOut,
      }}
    >
      {/* Separator */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(to right, transparent, ${TEAL}40, transparent)`,
          marginBottom: 28,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Pulsing teal dot */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: TEAL,
            flexShrink: 0,
            boxShadow: `0 0 ${10 * dotPulse}px ${TEAL}`,
            opacity: dotPulse,
          }}
        />
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: MUTED,
          }}
        >
          {CLINIC_NAME}
          <span
            style={{
              color: `${MUTED}80`,
              fontWeight: 400,
              marginLeft: 14,
            }}
          >
            · {FOOTER_CTA}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Global fade-out overlay ──────────────────────────────────────────────────
const FadeOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = clamp(frame, [195, 210], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        background: BG,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const SymptomClip: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Background frame={frame} />

      <AbsoluteFill>
        <TitleSection frame={frame} />
        <SymptomGrid frame={frame} />
        <DangerPanel frame={frame} />
        <Footer frame={frame} />
      </AbsoluteFill>

      <FadeOverlay frame={frame} />
    </AbsoluteFill>
  );
};

// ─── Remotion root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SymptomClip"
      component={SymptomClip}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
