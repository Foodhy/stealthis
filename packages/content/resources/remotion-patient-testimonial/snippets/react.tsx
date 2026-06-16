import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

// ─── Config constants ────────────────────────────────────────────────────────

const CLINIC_NAME = "Greenfield Medical";
const DOCTOR_NAME = "Dr. Reyes";
const PATIENT_NAME = "Sarah M.";
const PATIENT_SINCE = "Patient since 2021";
const PATIENT_INITIALS = "SM";
const STAR_COUNT = 5;

const QUOTE_WORDS = [
  "Dr.", "Reyes", "was", "incredibly", "patient", "and", "thorough.",
  "I", "finally", "got", "answers", "after", "years", "of", "uncertainty.",
  "Highly", "recommend", "Greenfield", "Medical.",
];

// Timing (frames)
const CARD_FADE_DURATION = 15;
const STARS_START = 20;
const STARS_STAGGER = 8;
const QUOTE_START = 50;
const WORDS_STAGGER = 4;
const AVATAR_START = 140;

// Colors
const BG = "#0a1a18";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const WHITE = "#ffffff";
const MUTED = "#6b9e99";

// Spring config
const SPRING_CFG = { damping: 14, stiffness: 120 };

// Font stack
const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

// ─── Sub-components ──────────────────────────────────────────────────────────

function Background() {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 20%, #0f2e2a 0%, ${BG} 100%)`,
      }}
    />
  );
}

function GlowAccent() {
  return (
    <div
      style={{
        position: "absolute",
        top: 260,
        left: "50%",
        transform: "translateX(-50%)",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${TEAL}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
}

function ClinicBadge({ frame }: { frame: number }) {
  const opacity = interpolate(frame, [0, CARD_FADE_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, CARD_FADE_DURATION], [-12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: `${TEAL}22`,
          border: `1.5px solid ${TEAL}55`,
          borderRadius: 40,
          paddingLeft: 18,
          paddingRight: 22,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: TEAL,
            boxShadow: `0 0 8px ${TEAL}`,
          }}
        />
        <span
          style={{
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 600,
            color: TEAL_SOFT,
            letterSpacing: 1,
          }}
        >
          {CLINIC_NAME}
        </span>
      </div>
    </div>
  );
}

function CardContainer({ frame, children }: { frame: number; children: React.ReactNode }) {
  const opacity = interpolate(frame, [0, CARD_FADE_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, CARD_FADE_DURATION], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 240,
        left: 60,
        right: 60,
        opacity,
        transform: `scale(${scale})`,
        background: `linear-gradient(160deg, #122421 0%, #0d1f1d 100%)`,
        borderRadius: 36,
        border: `1.5px solid ${TEAL}33`,
        padding: 56,
        boxShadow: `0 8px 60px #00000055, 0 0 0 1px ${TEAL}11`,
      }}
    >
      {children}
    </div>
  );
}

function StarRating({ frame }: { frame: number }) {
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        marginBottom: 40,
      }}
    >
      {Array.from({ length: STAR_COUNT }).map((_, i) => {
        const startFrame = STARS_START + i * STARS_STAGGER;
        const sc = spring({
          frame: frame - startFrame,
          fps,
          config: SPRING_CFG,
        });
        const scale = interpolate(sc, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center",
            }}
          >
            <StarIcon filled color={TEAL} size={52} />
          </div>
        );
      })}
    </div>
  );
}

function StarIcon({ filled, color, size }: { filled: boolean; color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg
      width={40}
      height={32}
      viewBox="0 0 40 32"
      fill="none"
      style={{ marginBottom: 20, opacity: 0.35 }}
    >
      <path
        d="M0 20C0 26.627 5.373 32 12 32C18.627 32 24 26.627 24 20C24 13.373 18.627 8 12 8C11.338 8 10.69 8.06 10.062 8.174C11.3 5.744 13.436 3.72 16 2.694V0C7.163 1.38 0 9.898 0 20ZM16 20C16 26.627 21.373 32 28 32C34.627 32 40 26.627 40 20C40 13.373 34.627 8 28 8C27.338 8 26.69 8.06 26.062 8.174C27.3 5.744 29.436 3.72 32 2.694V0C23.163 1.38 16 9.898 16 20Z"
        fill={TEAL}
      />
    </svg>
  );
}

function QuoteText({ frame }: { frame: number }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <QuoteIcon />
      <div
        style={{
          fontFamily: FONT,
          fontSize: 38,
          fontWeight: 400,
          lineHeight: 1.55,
          color: WHITE,
          letterSpacing: 0.2,
        }}
      >
        {QUOTE_WORDS.map((word, i) => {
          const wordStart = QUOTE_START + i * WORDS_STAGGER;
          const opacity = interpolate(
            frame,
            [wordStart, wordStart + 10],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const translateY = interpolate(
            frame,
            [wordStart, wordStart + 10],
            [8, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Highlight clinic name and doctor name
          const isHighlighted =
            word === "Dr." ||
            word === "Reyes" ||
            word === "Greenfield" ||
            word === "Medical.";

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity,
                transform: `translateY(${translateY}px)`,
                color: isHighlighted ? TEAL : WHITE,
                fontWeight: isHighlighted ? 600 : 400,
                marginRight: 8,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${TEAL}44, transparent)`,
        marginBottom: 48,
      }}
    />
  );
}

function PatientInfo({ frame }: { frame: number }) {
  const { fps } = useVideoConfig();

  const sc = spring({
    frame: frame - AVATAR_START,
    fps,
    config: SPRING_CFG,
  });

  const translateX = interpolate(sc, [0, 1], [-80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(sc, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        transform: `translateX(${translateX}px)`,
        opacity,
      }}
    >
      <AvatarCircle initials={PATIENT_INITIALS} />
      <div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 36,
            fontWeight: 700,
            color: WHITE,
            letterSpacing: 0.3,
            marginBottom: 4,
          }}
        >
          {PATIENT_NAME}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 400,
            color: MUTED,
            letterSpacing: 0.2,
          }}
        >
          {PATIENT_SINCE}
        </div>
      </div>
      <VerifiedBadge frame={frame} />
    </div>
  );
}

function AvatarCircle({ initials }: { initials: string }) {
  return (
    <div
      style={{
        width: 88,
        height: 88,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${TEAL} 0%, #0d8f84 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 0 0 3px ${TEAL}44, 0 0 20px ${TEAL}33`,
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 30,
          fontWeight: 700,
          color: WHITE,
          letterSpacing: 1,
        }}
      >
        {initials}
      </span>
    </div>
  );
}

function VerifiedBadge({ frame }: { frame: number }) {
  const opacity = interpolate(frame, [AVATAR_START + 10, AVATAR_START + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        marginLeft: "auto",
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: `${TEAL}22`,
          border: `1.5px solid ${TEAL}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            stroke={TEAL}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        style={{
          fontFamily: FONT,
          fontSize: 18,
          color: TEAL,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        Verified
      </span>
    </div>
  );
}

function BottomLabel({ frame }: { frame: number }) {
  const opacity = interpolate(frame, [AVATAR_START + 20, AVATAR_START + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 22,
          color: MUTED,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        Real Patients. Real Stories.
      </span>
    </div>
  );
}

// ─── Main composition component ──────────────────────────────────────────────

export function PatientTestimonial() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background />
      <GlowAccent />
      <ClinicBadge frame={frame} />
      <CardContainer frame={frame}>
        <StarRating frame={frame} />
        <QuoteText frame={frame} />
        <Divider />
        <PatientInfo frame={frame} />
      </CardContainer>
      <BottomLabel frame={frame} />
    </AbsoluteFill>
  );
}

// ─── Remotion root ───────────────────────────────────────────────────────────

export function RemotionRoot() {
  return (
    <Composition
      id="PatientTestimonial"
      component={PatientTestimonial}
      durationInFrames={210}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{}}
    />
  );
}
