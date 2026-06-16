import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Customizable constants ───────────────────────────────────────────────────
const CLINIC_NAME = "Greenfield Medical Center";
const TITLE_TEXT = "Stay Protected";
const TITLE_SUBTITLE = "Vaccination Guide";
const CTA_LABEL = "Book Your Vaccination";
const DURATION_FRAMES = 240;
const GLOW_RADIUS = 700;

// Color palette
const BG = "#0a1a18";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const WHITE = "#ffffff";
const CORAL = "#ff7a66";
const MUTED = "#6b9e99";
const OK = "#2f9e6f";

// Spring preset
const SP = { damping: 14, stiffness: 120 };
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ─── Vaccine data ─────────────────────────────────────────────────────────────
type IconType = "syringe" | "shield" | "check";

interface VaccineEntry {
  name: string;
  schedule: string;
  detail: string;
  iconType: IconType;
  accent: string;
}

const VACCINES: VaccineEntry[] = [
  {
    name: "Flu Vaccine",
    schedule: "Annual",
    detail: "Recommended for all ages 6 months+",
    iconType: "syringe",
    accent: TEAL,
  },
  {
    name: "COVID-19 Booster",
    schedule: "Every 6–12 months",
    detail: "Check with your doctor for eligibility",
    iconType: "shield",
    accent: CORAL,
  },
  {
    name: "Hepatitis B",
    schedule: "3-dose series",
    detail: "Lifetime protection — ask about catch-up doses",
    iconType: "check",
    accent: OK,
  },
];

// ─── SVG icons ────────────────────────────────────────────────────────────────
const SyringeIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {/* Barrel */}
    <rect x="14" y="18" width="22" height="12" rx="6" fill={`${color}33`} stroke={color} strokeWidth="2" />
    {/* Plunger handle */}
    <rect x="36" y="21" width="8" height="6" rx="2" fill={color} />
    {/* Needle */}
    <rect x="4" y="22.5" width="10" height="3" rx="1.5" fill={color} />
    {/* Needle tip */}
    <path d="M4 24 L2 24" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Graduation marks */}
    <line x1="22" y1="18" x2="22" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="28" y1="18" x2="28" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    {/* Fill indicator */}
    <rect x="14" y="18" width="12" height="12" rx="6" fill={`${color}44`} />
  </svg>
);

const ShieldIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {/* Shield body */}
    <path
      d="M24 6L8 13v12c0 8.8 6.8 17 16 19 9.2-2 16-10.2 16-19V13L24 6z"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Inner check */}
    <path
      d="M16 24l5.5 5.5L32 19"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckCircleIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {/* Outer ring */}
    <circle cx="24" cy="24" r="18" fill={`${color}18`} stroke={color} strokeWidth="2" />
    {/* Inner fill arc — represents completion */}
    <path
      d="M24 10 A14 14 0 0 1 38 24"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
    />
    {/* Checkmark */}
    <path
      d="M15 24l6.5 6.5L33 17"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const VaccineIcon: React.FC<{ type: IconType; color: string; size: number }> = ({
  type, color, size,
}) => {
  if (type === "syringe") return <SyringeIcon color={color} size={size} />;
  if (type === "shield") return <ShieldIcon color={color} size={size} />;
  return <CheckCircleIcon color={color} size={size} />;
};

// ─── Background with animated per-panel glow ─────────────────────────────────
const Background: React.FC<{
  frame: number;
  activeAccent: string;
  accentOpacity: number;
}> = ({ frame, activeAccent, accentOpacity }) => {
  const globalGlow = interpolate(frame, [0, 20], [0, 1], clamp);
  const breathe = 0.85 + 0.15 * Math.sin((frame / 30) * 0.5);

  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: BG }} />

      {/* Per-panel accent glow — recolors with each vaccine */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: GLOW_RADIUS,
          height: GLOW_RADIUS,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${activeAccent}1c 0%, ${activeAccent}0a 42%, transparent 70%)`,
          opacity: globalGlow * accentOpacity * breathe,
          transition: "background 0.3s",
        }}
      />

      {/* Persistent subtle teal ambient at top */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          width: 800,
          height: 500,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${TEAL}0e 0%, transparent 68%)`,
          opacity: globalGlow * 0.7,
        }}
      />

      {/* Bottom vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 14%, transparent 82%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ─── Title bar (persists through all panels) ──────────────────────────────────
const TitleBar: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({ frame, fps, config: SP });
  const y = interpolate(prog, [0, 1], [-60, 0]);
  const opacity = interpolate(prog, [0, 0.25], [0, 1]);

  // Accent line width sweeps in
  const lineW = interpolate(frame, [10, 30], [0, 220], clamp);

  // Syringe emoji fade
  const emojiOpacity = interpolate(frame, [8, 22], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      {/* Emoji badge */}
      <div
        style={{
          fontSize: 52,
          lineHeight: 1,
          opacity: emojiOpacity,
          filter: `drop-shadow(0 0 16px ${TEAL}88)`,
        }}
      >
        💉
      </div>

      {/* Primary title */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 900,
          fontSize: 62,
          color: WHITE,
          textAlign: "center",
          letterSpacing: -1.5,
          lineHeight: 1.05,
          padding: "0 56px",
          textShadow: `0 2px 28px ${TEAL}44`,
        }}
      >
        {TITLE_TEXT}
      </div>

      {/* Teal accent line */}
      <div
        style={{
          width: 220,
          height: 3,
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: lineW,
            height: "100%",
            background: `linear-gradient(90deg, ${TEAL}, ${TEAL}88)`,
            borderRadius: 2,
            boxShadow: `0 0 12px 3px ${TEAL}66`,
          }}
        />
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 500,
          fontSize: 26,
          color: MUTED,
          letterSpacing: 4,
          textTransform: "uppercase" as const,
        }}
      >
        {TITLE_SUBTITLE}
      </div>
    </div>
  );
};

// ─── Single vaccine info panel ────────────────────────────────────────────────
const VaccinePanel: React.FC<{
  vaccine: VaccineEntry;
  localFrame: number;  // frame relative to Sequence start
  globalFrame: number;
}> = ({ vaccine, localFrame, globalFrame }) => {
  const { fps } = useVideoConfig();

  // Slide up entrance
  const entryProg = spring({ frame: localFrame, fps, config: SP });
  const y = interpolate(entryProg, [0, 1], [80, 0]);
  const opacity = interpolate(entryProg, [0, 0.2], [0, 1]);

  // Fade out near end of sequence (last 14 frames)
  const exitOpacity = interpolate(localFrame, [56, 70], [1, 0], clamp);

  // Icon glow breathe
  const iconGlow = 0.6 + 0.4 * Math.sin((globalFrame / 30) * 1.1);

  // Staggered detail line entrance
  const detailProg = spring({ frame: Math.max(0, localFrame - 12), fps, config: SP });
  const detailY = interpolate(detailProg, [0, 1], [18, 0]);
  const detailOpacity = interpolate(detailProg, [0, 0.25], [0, 1]);

  const { accent } = vaccine;

  return (
    <div
      style={{
        position: "absolute",
        top: 340,
        left: 52,
        right: 52,
        transform: `translateY(${y}px)`,
        opacity: opacity * exitOpacity,
      }}
    >
      {/* Card shell */}
      <div
        style={{
          background: `linear-gradient(155deg, #0f2825 0%, #091a18 100%)`,
          borderRadius: 32,
          border: `1.5px solid ${accent}44`,
          boxShadow: `0 0 0 1px ${accent}11, 0 28px 72px rgba(0,0,0,0.5), inset 0 1px 0 ${accent}22`,
          padding: "52px 48px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Top accent rule */}
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, ${accent}cc, ${accent}44, transparent)`,
            borderRadius: 1,
            marginBottom: 4,
          }}
        />

        {/* Icon + vaccine name row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          {/* Icon bubble */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: `${accent}18`,
              border: `2px solid ${accent}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 0 ${32 * iconGlow}px ${12 * iconGlow}px ${accent}2a`,
            }}
          >
            <VaccineIcon type={vaccine.iconType} color={accent} size={58} />
          </div>

          {/* Name + schedule */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                fontWeight: 800,
                fontSize: 42,
                color: WHITE,
                letterSpacing: -0.8,
                lineHeight: 1.1,
                textShadow: `0 2px 18px ${accent}44`,
              }}
            >
              {vaccine.name}
            </div>

            {/* Schedule pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: 14,
                paddingRight: 16,
                paddingTop: 6,
                paddingBottom: 6,
                borderRadius: 40,
                background: `${accent}1e`,
                border: `1.5px solid ${accent}55`,
                alignSelf: "flex-start",
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: accent,
                  boxShadow: `0 0 6px ${accent}`,
                }}
              />
              <span
                style={{
                  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                  fontSize: 20,
                  fontWeight: 600,
                  color: accent,
                  letterSpacing: "0.03em",
                }}
              >
                {vaccine.schedule}
              </span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accent}33, transparent)`,
          }}
        />

        {/* Detail line — staggered entrance */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            transform: `translateY(${detailY}px)`,
            opacity: detailOpacity,
          }}
        >
          {/* Quote mark accent */}
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 48,
              color: `${accent}55`,
              lineHeight: 1,
              marginTop: -6,
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            ›
          </div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
              fontWeight: 400,
              fontSize: 28,
              color: TEAL_SOFT,
              lineHeight: 1.4,
              letterSpacing: 0.2,
            }}
          >
            {vaccine.detail}
          </div>
        </div>

        {/* Bottom tag row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 4,
            opacity: detailOpacity,
          }}
        >
          {/* Mini cross mark */}
          <div style={{ position: "relative", width: 22, height: 22, flexShrink: 0 }}>
            <div
              style={{
                position: "absolute",
                top: "38%",
                left: 0,
                right: 0,
                height: "24%",
                background: accent,
                borderRadius: 2,
                opacity: 0.7,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "38%",
                top: 0,
                bottom: 0,
                width: "24%",
                background: accent,
                borderRadius: 2,
                opacity: 0.7,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
              fontSize: 19,
              color: MUTED,
              letterSpacing: "0.04em",
            }}
          >
            {CLINIC_NAME}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Panel wrapper — owns its own Sequence local frame counter ────────────────
const PanelSequence: React.FC<{
  vaccine: VaccineEntry;
  from: number;
  duration: number;
}> = ({ vaccine, from, duration }) => {
  const frame = useCurrentFrame();
  // localFrame is frame - from, clamped to [0, duration)
  const localFrame = Math.max(0, Math.min(frame - from, duration - 1));

  if (frame < from || frame >= from + duration) return null;

  return (
    <VaccinePanel
      vaccine={vaccine}
      localFrame={localFrame}
      globalFrame={frame}
    />
  );
};

// ─── Panel counter indicator (1 / 3 etc.) ────────────────────────────────────
const PanelDots: React.FC<{ frame: number }> = ({ frame }) => {
  // Which panel is active?
  const activeIndex =
    frame < 90 ? 0 :
    frame < 160 ? 1 : 2;

  const opacity = interpolate(frame, [20, 34], [0, 1], clamp) *
                  interpolate(frame, [208, 218], [1, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 260,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 12,
        opacity,
      }}
    >
      {VACCINES.map((v, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={i}
            style={{
              width: isActive ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: isActive ? v.accent : `${MUTED}44`,
              transition: "width 0.15s",
              boxShadow: isActive ? `0 0 8px ${v.accent}` : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

// ─── Final CTA block ──────────────────────────────────────────────────────────
const CTAFrame: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - 210);

  const prog = spring({ frame: localFrame, fps, config: SP });
  const scale = interpolate(prog, [0, 1], [0.88, 1]);
  const opacity = interpolate(prog, [0, 0.22], [0, 1]);

  // Button pulse
  const pulse = 1 + Math.sin(((frame - 215) * 0.14) % (Math.PI * 2)) * 0.03;

  if (frame < 210) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        opacity,
        transform: `scale(${scale})`,
        padding: "0 56px",
      }}
    >
      {/* Cross icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${TEAL}2a 0%, transparent 70%)`,
          border: `2px solid ${TEAL}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 32px 10px ${TEAL}33`,
        }}
      >
        {/* Cross bars */}
        <div style={{ position: "relative", width: 36, height: 36 }}>
          <div
            style={{
              position: "absolute",
              top: "38%",
              left: 0,
              right: 0,
              height: "24%",
              background: TEAL,
              borderRadius: 3,
              boxShadow: `0 0 10px ${TEAL}88`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "38%",
              top: 0,
              bottom: 0,
              width: "24%",
              background: TEAL,
              borderRadius: 3,
              boxShadow: `0 0 10px ${TEAL}88`,
            }}
          />
        </div>
      </div>

      {/* Headline */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 800,
          fontSize: 52,
          color: WHITE,
          textAlign: "center",
          lineHeight: 1.15,
          letterSpacing: -1,
          textShadow: `0 2px 24px ${TEAL}44`,
        }}
      >
        Book your vaccination at
      </div>

      {/* Clinic name in teal */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 900,
          fontSize: 44,
          color: TEAL,
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: -0.5,
          textShadow: `0 0 32px ${TEAL}66`,
        }}
      >
        {CLINIC_NAME}
      </div>

      {/* Teal separator */}
      <div
        style={{
          width: 80,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${TEAL}, transparent)`,
          borderRadius: 1,
        }}
      />

      {/* CTA button */}
      <div
        style={{
          width: "100%",
          background: `linear-gradient(135deg, ${TEAL} 0%, #0d9d91 100%)`,
          borderRadius: 24,
          paddingTop: 32,
          paddingBottom: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          boxShadow: `0 0 ${44 * pulse}px ${TEAL}55, 0 18px 44px rgba(18,181,168,0.28)`,
          transform: `scale(${pulse})`,
        }}
      >
        {/* Calendar icon */}
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="4" stroke={WHITE} strokeWidth="2" />
          <rect x="3" y="4" width="18" height="6" rx="4" fill="rgba(255,255,255,0.2)" />
          <line x1="8" y1="2" x2="8" y2="6" stroke={WHITE} strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="2" x2="16" y2="6" stroke={WHITE} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 13h2v2H8zM13 13h2v2h-2z" fill={WHITE} />
        </svg>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 32,
            fontWeight: 700,
            color: WHITE,
            letterSpacing: "0.01em",
          }}
        >
          {CTA_LABEL}
        </span>
      </div>
    </div>
  );
};

// ─── Helper: compute current accent for background glow ──────────────────────
function getActiveAccent(frame: number): { accent: string; opacity: number } {
  // Panel 1: frames 20–90 → TEAL
  // Panel 2: frames 70–140 → CORAL (cross-fade with panel 1 exit)
  // Panel 3: frames 140–210 → OK (green)
  // CTA: frames 210+ → TEAL
  if (frame >= 210) return { accent: TEAL, opacity: 0.9 };
  if (frame >= 140) return { accent: OK, opacity: 0.85 };
  if (frame >= 70) {
    // Cross-fade TEAL → CORAL over frames 70–84
    const t = interpolate(frame, [70, 84], [0, 1], clamp);
    // Blend: we just use CORAL when active; background component receives a single color
    return { accent: t > 0.5 ? CORAL : TEAL, opacity: 0.85 };
  }
  return { accent: TEAL, opacity: 0.85 };
}

// ─── Main composition ─────────────────────────────────────────────────────────
export const VaccineInfo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp);
  const fadeOut = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], clamp);

  const { accent, opacity: accentOpacity } = getActiveAccent(frame);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity: fadeIn * fadeOut,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {/* Layer 0: Background with animated accent glow */}
      <Background frame={frame} activeAccent={accent} accentOpacity={accentOpacity} />

      {/* Layer 1: Persistent title bar */}
      <Sequence from={0} durationInFrames={210}>
        <TitleBar frame={frame} />
      </Sequence>

      {/* Layer 2: Panel 1 — Flu Vaccine (frames 20–90) */}
      <PanelSequence vaccine={VACCINES[0]} from={20} duration={70} />

      {/* Layer 3: Panel 2 — COVID-19 Booster (frames 70–140) */}
      <PanelSequence vaccine={VACCINES[1]} from={70} duration={70} />

      {/* Layer 4: Panel 3 — Hepatitis B (frames 140–210) */}
      <PanelSequence vaccine={VACCINES[2]} from={140} duration={70} />

      {/* Layer 5: Panel progress dots */}
      <PanelDots frame={frame} />

      {/* Layer 6: CTA frame (frames 210–240) */}
      <CTAFrame frame={frame} />

      {/* Edge vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 62%, rgba(0,0,0,0.38) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="VaccineInfo"
    component={VaccineInfo}
    durationInFrames={DURATION_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
