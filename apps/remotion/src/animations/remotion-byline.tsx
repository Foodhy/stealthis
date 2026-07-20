import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Customizable constants ────────────────────────────────────────────────
const NETWORK_NAME = "NNX";
const NETWORK_TAGLINE = "NNX Digital";

const CREDITS = [
  { role: "REPORTER", name: "Marcus Webb", detail: "NNX Washington Bureau" },
  { role: "PHOTOGRAPHER", name: "© NNX / Sarah Kim", detail: "Visual Correspondent" },
  {
    role: "PRODUCTION",
    name: "NNX DIGITAL",
    producers: [
      { label: "PRODUCED BY", value: "NNX Digital" },
      { label: "DIRECTED BY", value: "Carlos Reyes" },
      { label: "EDITED BY", value: "Priya Sharma" },
    ],
  },
];

const ACCENT_RED = "#e8001e";
const ACCENT_GOLD = "#f5c842";
const BG = "#0d1117";
const WHITE = "#ffffff";
const OFF_WHITE = "rgba(255,255,255,0.85)";
const MUTED = "rgba(255,255,255,0.50)";
const SUBTLE = "rgba(255,255,255,0.18)";
const GRID_LINE = "rgba(255,255,255,0.04)";
const SCRIM_DARK = "rgba(0,0,0,0.72)";
const BAND_BG = "rgba(10,12,20,0.96)";

const FONT = "Inter, system-ui, -apple-system, sans-serif";

// ─── Scene boundaries ──────────────────────────────────────────────────────
// Scene 1:   0 – 40  Reporter byline — bottom-left, red pill badge, spring-in/hold/spring-out
// Scene 2:  40 – 80  Photographer credit — top-right corner overlay, scrim, fade in/hold/fade out
// Scene 3:  80 – 120 Full production strip — bottom band, letter-by-letter fade, network logo right

// ─── Utility ───────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ─── Background ─────────────────────────────────────────────────────────────
const BackgroundGrid: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 900px 500px at 50% 60%, rgba(232,0,30,0.06) 0%, transparent 70%), ${BG}`,
      }}
    />
    {Array.from({ length: 13 }).map((_, i) => (
      <div
        key={`col-${i}`}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${(i / 12) * 100}%`,
          width: 1,
          backgroundColor: GRID_LINE,
        }}
      />
    ))}
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={`row-${i}`}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${(i / 7) * 100}%`,
          height: 1,
          backgroundColor: GRID_LINE,
        }}
      />
    ))}
  </>
);

// Placeholder "on-air" talking head area — blurred dark vignette center
const TalentArea: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse 700px 600px at 50% 45%, rgba(30,38,60,0.55) 0%, transparent 80%)",
    }}
  />
);

// ─── Scene 1: Reporter Byline ────────────────────────────────────────────────
interface Scene1Props {
  frame: number;
  fps: number;
}

const RedPillBadge: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: ACCENT_RED,
      borderRadius: 3,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 4,
      paddingBottom: 4,
      marginBottom: 8,
    }}
  >
    <span
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: 2,
        color: WHITE,
        textTransform: "uppercase" as const,
      }}
    >
      {label}
    </span>
  </div>
);

const Scene1ReporterByline: React.FC<Scene1Props> = ({ frame, fps }) => {
  // Slide in: frames 0–12
  const slideIn = spring({
    frame: clamp(frame, 0, 12),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // Slide out: frames 28–40
  const slideOutProgress = interpolate(frame, [28, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  const translateX = interpolate(slideIn, [0, 1], [-420, 0]) - slideOutProgress * 420;
  const opacity = interpolate(slideIn, [0, 1], [0, 1]) * (1 - slideOutProgress * 0.4);

  const reporter = CREDITS[0];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 56,
        transform: `translateX(${translateX}px)`,
        opacity,
      }}
    >
      {/* Dark scrim behind the byline block */}
      <div
        style={{
          position: "absolute",
          inset: "-12px -20px -12px -20px",
          backgroundColor: SCRIM_DARK,
          borderRadius: 4,
          borderLeft: `4px solid ${ACCENT_RED}`,
        }}
      />
      <div style={{ position: "relative" }}>
        <RedPillBadge label={reporter.role} />
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 32,
            color: WHITE,
            lineHeight: 1.1,
            letterSpacing: 0.3,
            whiteSpace: "nowrap" as const,
          }}
        >
          {reporter.name}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 15,
            color: MUTED,
            marginTop: 5,
            letterSpacing: 0.5,
          }}
        >
          {reporter.detail}
        </div>
      </div>
    </div>
  );
};

// ─── Scene 2: Photographer Credit (top-right) ────────────────────────────────
interface Scene2Props {
  frame: number;
}

const Scene2PhotographerCredit: React.FC<Scene2Props> = ({ frame }) => {
  // Active window: 40–80
  const localFrame = frame - 40;

  // Fade in: local 0–10
  const fadeIn = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Fade out: local 28–40
  const fadeOut = interpolate(localFrame, [28, 40], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const opacity = Math.min(fadeIn, fadeOut);

  // Subtle float-down: slides from -8px to 0 on fade-in
  const translateY = interpolate(fadeIn, [0, 1], [-10, 0]);

  const photographer = CREDITS[1];

  if (frame < 40 || frame > 80) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 52,
        right: 52,
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "flex-end",
      }}
    >
      {/* scrim card */}
      <div
        style={{
          backgroundColor: SCRIM_DARK,
          borderRadius: 4,
          padding: "12px 18px",
          borderTop: `2px solid ${SUBTLE}`,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 11,
            color: MUTED,
            letterSpacing: 2,
            textTransform: "uppercase" as const,
            marginBottom: 5,
            textAlign: "right" as const,
          }}
        >
          Photo
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 18,
            color: WHITE,
            letterSpacing: 0.2,
            whiteSpace: "nowrap" as const,
            textAlign: "right" as const,
          }}
        >
          {photographer.name}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 12,
            color: MUTED,
            marginTop: 3,
            letterSpacing: 0.4,
            textAlign: "right" as const,
          }}
        >
          {photographer.detail}
        </div>
      </div>

      {/* decorative corner accent */}
      <div
        style={{
          width: 28,
          height: 2,
          backgroundColor: ACCENT_GOLD,
          marginTop: 6,
          alignSelf: "flex-end",
          opacity: opacity,
        }}
      />
    </div>
  );
};

// ─── Scene 3: Full Production Credit Strip ────────────────────────────────────
interface Scene3Props {
  frame: number;
  fps: number;
}

interface CreditEntry {
  label: string;
  value: string;
}

// Each character in a credit item fades in sequentially
const LetterFadeText: React.FC<{
  text: string;
  startFrame: number;
  frame: number;
  speed?: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, frame, speed = 1.2, style = {} }) => {
  return (
    <span style={{ display: "inline-flex", ...style }}>
      {text.split("").map((char, i) => {
        const charFrame = startFrame + i * speed;
        const alpha = interpolate(frame, [charFrame, charFrame + 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span key={i} style={{ opacity: alpha, whiteSpace: "pre" as const }}>
            {char}
          </span>
        );
      })}
    </span>
  );
};

// Network logo mark — circle + letters
const NetworkLogo: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      opacity,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        backgroundColor: ACCENT_RED,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 16,
          color: WHITE,
          letterSpacing: -1,
        }}
      >
        {NETWORK_NAME}
      </span>
    </div>
    <div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 13,
          color: WHITE,
          letterSpacing: 1.5,
        }}
      >
        {NETWORK_TAGLINE.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 400,
          fontSize: 10,
          color: MUTED,
          letterSpacing: 1,
          marginTop: 2,
        }}
      >
        BROADCAST SERVICES
      </div>
    </div>
  </div>
);

const Scene3ProductionStrip: React.FC<Scene3Props> = ({ frame, fps }) => {
  // Active window: 80–120
  const localFrame = frame - 80;

  // Band slides up from below: spring on localFrame 0–18
  const bandSlide = spring({
    frame: clamp(localFrame, 0, 18),
    fps,
    config: { damping: 24, stiffness: 140 },
  });
  const bandY = interpolate(bandSlide, [0, 1], [90, 0]);

  // Band fades out at very end: local 36–40
  const bandFadeOut = interpolate(localFrame, [36, 40], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Logo springs in after band: localFrame 14 onwards
  const logoSpring = spring({
    frame: clamp(localFrame - 14, 0, 20),
    fps,
    config: { damping: 22, stiffness: 160 },
  });
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]) * bandFadeOut;

  // Separator line scales in: localFrame 8–20
  const lineScale = interpolate(localFrame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Credits start appearing at localFrame 10
  const production = CREDITS[2];
  const producers: CreditEntry[] = (production.producers as CreditEntry[]) ?? [];

  if (frame < 80) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        transform: `translateY(${bandY}px)`,
        opacity: bandFadeOut,
      }}
    >
      {/* Main dark band */}
      <div
        style={{
          backgroundColor: BAND_BG,
          borderTop: `1px solid rgba(255,255,255,0.10)`,
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 56,
          paddingRight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 82,
          position: "relative",
        }}
      >
        {/* Red accent line at top of band */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: 3,
            width: `${lineScale * 100}%`,
            backgroundColor: ACCENT_RED,
          }}
        />

        {/* Credit items left-to-right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            flex: 1,
          }}
        >
          {producers.map((item, idx) => {
            // Stagger start frames: first credit at local 10, each subsequent +18
            const creditStart = 10 + idx * 18;

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontWeight: 400,
                      fontSize: 10,
                      color: MUTED,
                      letterSpacing: 2,
                      textTransform: "uppercase" as const,
                      marginBottom: 4,
                    }}
                  >
                    <LetterFadeText
                      text={item.label}
                      startFrame={creditStart}
                      frame={localFrame}
                      speed={0.8}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: 17,
                      color: WHITE,
                      letterSpacing: 0.4,
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    <LetterFadeText
                      text={item.value}
                      startFrame={creditStart + 5}
                      frame={localFrame}
                      speed={1.0}
                    />
                  </div>
                </div>

                {/* Divider dot between items */}
                {idx < producers.length - 1 && (
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor: ACCENT_RED,
                      marginLeft: 28,
                      marginRight: 28,
                      flexShrink: 0,
                      opacity: interpolate(localFrame, [creditStart + 14, creditStart + 20], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Vertical separator */}
        <div
          style={{
            width: 1,
            height: 44,
            backgroundColor: SUBTLE,
            marginLeft: 32,
            marginRight: 32,
            flexShrink: 0,
            opacity: lineScale,
          }}
        />

        {/* Network logo on far right */}
        <NetworkLogo opacity={logoOpacity} />
      </div>
    </div>
  );
};

// ─── Ambient scan line overlay ───────────────────────────────────────────────
const ScanLines: React.FC<{ frame: number }> = ({ frame }) => {
  // Slowly scrolling subtle scan line
  const offset = (frame * 2) % 60;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `repeating-linear-gradient(
          to bottom,
          transparent,
          transparent 3px,
          rgba(0,0,0,0.07) 3px,
          rgba(0,0,0,0.07) 4px
        )`,
        backgroundPositionY: `${offset}px`,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Timecode / Broadcast HUD ────────────────────────────────────────────────
const BroadcastHUD: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const totalSeconds = frame / fps;
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  const centis = Math.floor((totalSeconds % 1) * 100)
    .toString()
    .padStart(2, "0");

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 20,
        fontFamily: "monospace",
        fontSize: 11,
        color: SUBTLE,
        letterSpacing: 1.5,
        userSelect: "none",
      }}
    >
      {`TC ${mins}:${secs}:${centis}`}
    </div>
  );
};

// ─── Scene 1 background vignette hint ───────────────────────────────────────
const BottomGradientHint: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 220,
      background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
      opacity,
      pointerEvents: "none",
    }}
  />
);

// ─── Main composition ────────────────────────────────────────────────────────
export default function BylineCreditAnimation() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gradient at bottom for scenes 1–2 context
  const bottomVigOpacity = interpolate(frame, [76, 84], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Global opacity for entire comp (fade in at 0–3, always full after)
  const globalOpacity = interpolate(frame, [0, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: FONT,
        overflow: "hidden",
        opacity: globalOpacity,
      }}
    >
      {/* Layer 1: Background canvas */}
      <BackgroundGrid />
      <TalentArea />
      <ScanLines frame={frame} />

      {/* Bottom-of-screen vignette (helps legibility for S1 & S2) */}
      <BottomGradientHint opacity={bottomVigOpacity} />

      {/* Scene 1: Reporter Byline (frames 0–40) */}
      {frame <= 42 && <Scene1ReporterByline frame={frame} fps={fps} />}

      {/* Scene 2: Photographer Credit (frames 40–80) */}
      {frame >= 38 && frame <= 82 && <Scene2PhotographerCredit frame={frame} />}

      {/* Scene 3: Full production credit strip (frames 80–120) */}
      {frame >= 78 && <Scene3ProductionStrip frame={frame} fps={fps} />}

      {/* HUD overlay: timecode (always visible, very subtle) */}
      <BroadcastHUD frame={frame} fps={fps} />
    </AbsoluteFill>
  );
}
