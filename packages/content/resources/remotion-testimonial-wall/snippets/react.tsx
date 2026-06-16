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

// ─── Design tokens ─────────────────────────────────────────────────────────────
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

// ─── Testimonial data ──────────────────────────────────────────────────────────
interface Testimonial {
  initials: string;
  avatarBg: string;
  name: string;
  role: string;
  company: string;
  stars: number;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    initials: "SM",
    avatarBg: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
    name: "Sofia Martinez",
    role: "Head of Growth",
    company: "Launchpad",
    stars: 5,
    quote:
      "Flowbase cut our onboarding time in half. The analytics alone paid for the subscription within the first month.",
  },
  {
    initials: "JK",
    avatarBg: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`,
    name: "James Kim",
    role: "CTO",
    company: "Veritas Cloud",
    stars: 5,
    quote:
      "The API is incredibly clean. We integrated Flowbase into our stack in two days — no friction, no surprises.",
  },
  {
    initials: "AL",
    avatarBg: `linear-gradient(135deg, ${SUCCESS}, #059669)`,
    name: "Amara Levi",
    role: "Product Manager",
    company: "Nexus AI",
    stars: 5,
    quote:
      "Real-time collaboration changed how our team works. Stakeholders actually stay in the loop now — love it.",
  },
  {
    initials: "RT",
    avatarBg: `linear-gradient(135deg, ${WARNING}, #d97706)`,
    name: "Raj Tanaka",
    role: "Founder & CEO",
    company: "Orbita",
    stars: 5,
    quote:
      "Switched from three separate tools to Flowbase. Saved us $800/month and everyone's on the same page.",
  },
  {
    initials: "CE",
    avatarBg: `linear-gradient(135deg, #ec4899, #be185d)`,
    name: "Clara Eriksson",
    role: "Director of Engineering",
    company: "Stackwise",
    stars: 5,
    quote:
      "Deployment pipelines, monitoring, and alerting — all inside Flowbase. It's the nerve center of our infra.",
  },
  {
    initials: "DO",
    avatarBg: `linear-gradient(135deg, #f97316, #ea580c)`,
    name: "David Osei",
    role: "VP of Sales",
    company: "Meridian SaaS",
    stars: 5,
    quote:
      "Our reps close 30% faster using Flowbase's deal-room feature. Pipeline visibility has never been this good.",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function Stars({ count, size = 14 }: { count: number; size?: number }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: size,
            color: i < count ? WARNING : "rgba(248,250,252,0.2)",
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Testimonial Card ──────────────────────────────────────────────────────────
function TestimonialCard({
  t,
  delay,
  highlight,
}: {
  t: Testimonial;
  delay: number;
  highlight: number; // 0 = none, 0–1 = glow intensity
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // entrance spring
  const entranceProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
    durationInFrames: 40,
  });

  const scale = interpolate(entranceProgress, [0, 1], [0.6, 1]);
  const opacity = interpolate(entranceProgress, [0, 0.4, 1], [0, 1, 1]);

  // highlight pulse: scale pulses slightly
  const highlightScale = interpolate(highlight, [0, 1], [1, 1.035]);
  const glowOpacity = interpolate(highlight, [0, 1], [0, 1]);

  const finalScale = scale * highlightScale;

  return (
    <div
      style={{
        transform: `scale(${finalScale})`,
        opacity,
        position: "relative",
        borderRadius: 16,
        background: CARD,
        border: `1px solid rgba(99,102,241,${interpolate(highlight, [0, 1], [0.12, 0.55])})`,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: `0 0 ${interpolate(highlight, [0, 1], [0, 32])}px rgba(99,102,241,${glowOpacity * 0.45}), 0 4px 24px rgba(0,0,0,0.4)`,
        transition: "none",
        overflow: "hidden",
      }}
    >
      {/* Glow top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 2,
          borderRadius: 999,
          background: `linear-gradient(90deg, transparent, rgba(99,102,241,${glowOpacity * 0.9}), transparent)`,
        }}
      />

      {/* Avatar + Name row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: t.avatarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 700,
            color: TEXT,
            fontFamily: "system-ui, -apple-system, sans-serif",
            flexShrink: 0,
            boxShadow: `0 0 ${interpolate(highlight, [0, 1], [0, 12])}px rgba(99,102,241,0.5)`,
          }}
        >
          {t.initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: TEXT,
              fontFamily: "system-ui, -apple-system, sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: TEXT_MUTED,
              fontFamily: "system-ui, -apple-system, sans-serif",
              marginTop: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t.role} · {t.company}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Stars count={t.stars} size={13} />
        </div>
      </div>

      {/* Quote */}
      <div
        style={{
          fontSize: 12.5,
          color: interpolate(highlight, [0, 1], [0.55, 1]) > 0.55
            ? `rgba(248,250,252,${interpolate(highlight, [0, 1], [0.75, 1])})`
            : TEXT_MUTED,
          fontFamily: "system-ui, -apple-system, sans-serif",
          lineHeight: 1.6,
          fontStyle: "italic",
        }}
      >
        "{t.quote}"
      </div>
    </div>
  );
}

// ─── Counting number ───────────────────────────────────────────────────────────
function CountUp({
  from,
  to,
  progress,
  decimals = 0,
}: {
  from: number;
  to: number;
  progress: number;
  decimals?: number;
}) {
  const value = interpolate(progress, [0, 1], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <>{value.toFixed(decimals)}</>;
}

// ─── Main composition ──────────────────────────────────────────────────────────
// Timeline (30 fps, 360 frames = 12 s):
//   0–30   : Header fades in
//   10–180 : Cards stagger in (every ~28 frames)
//   185–300: Highlight sweep (each card gets ~18 frames spotlight)
//   290–360: Rating count-up + CTA
//   345–360: Global fade-out
const CARD_DELAYS = [10, 28, 46, 64, 82, 100]; // entrance start frames

// Highlight windows: [start, peak, end] inside absolute frame space
// Each card highlighted for 18 frames, starting at frame 185
const HIGHLIGHT_WINDOWS: [number, number, number][] = [
  [185, 192, 203],
  [203, 210, 221],
  [221, 228, 239],
  [239, 246, 257],
  [257, 264, 275],
  [275, 282, 293],
];

export function TestimonialWall() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade out last 15 frames
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Header entrance
  const headerProgress = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
    durationInFrames: 30,
  });
  const headerY = interpolate(headerProgress, [0, 1], [-30, 0]);
  const headerOpacity = interpolate(headerProgress, [0, 0.3, 1], [0, 1, 1]);

  // Rating section entrance
  const ratingProgress = spring({
    frame: frame - 290,
    fps,
    config: { damping: 14, stiffness: 90 },
    durationInFrames: 40,
  });
  const ratingOpacity = interpolate(ratingProgress, [0, 0.4, 1], [0, 1, 1]);
  const ratingY = interpolate(ratingProgress, [0, 1], [24, 0]);

  // Count-up progress (frames 295–345)
  const countProgress = interpolate(frame, [295, 345], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Compute highlight intensity per card
  function getHighlight(cardIndex: number): number {
    const [start, peak, end] = HIGHLIGHT_WINDOWS[cardIndex];
    if (frame < start || frame > end) return 0;
    if (frame <= peak) {
      return interpolate(frame, [start, peak], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });
    }
    return interpolate(frame, [peak, end], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    });
  }

  return (
    <AbsoluteFill
      style={{
        background: BG,
        opacity: globalOpacity,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Ambient radial gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 38,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
        }}
      >
        {/* Logo pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.28)",
            borderRadius: 999,
            padding: "5px 14px",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: BRAND,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Flowbase
          </span>
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          Trusted by{" "}
          <span
            style={{
              background: `linear-gradient(90deg, ${BRAND}, ${BRAND_2})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            thousands
          </span>{" "}
          of teams worldwide
        </div>
      </div>

      {/* Card grid — 2 rows × 3 columns */}
      <div
        style={{
          position: "absolute",
          top: 148,
          left: 52,
          right: 52,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: 18,
          height: 356,
        }}
      >
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard
            key={t.name}
            t={t}
            delay={CARD_DELAYS[i]}
            highlight={getHighlight(i)}
          />
        ))}
      </div>

      {/* Rating footer */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity: ratingOpacity,
          transform: `translateY(${ratingY}px)`,
        }}
      >
        {/* Stars row */}
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ fontSize: 22, color: WARNING }}>
              ★
            </span>
          ))}
        </div>

        {/* Big score */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background: `linear-gradient(90deg, ${TEXT}, rgba(248,250,252,0.85))`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <CountUp from={4.0} to={4.9} progress={countProgress} decimals={1} />
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: TEXT_MUTED,
              letterSpacing: "-0.01em",
            }}
          >
            / 5
          </span>
        </div>

        {/* Sub-label */}
        <div
          style={{
            fontSize: 13,
            color: TEXT_MUTED,
            letterSpacing: "0.01em",
          }}
        >
          from{" "}
          <span style={{ color: TEXT, fontWeight: 600 }}>
            <CountUp from={1800} to={2400} progress={countProgress} decimals={0} />+
          </span>{" "}
          verified reviews
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Remotion root ─────────────────────────────────────────────────────────────
export function RemotionRoot() {
  return (
    <Composition
      id="TestimonialWall"
      component={TestimonialWall}
      durationInFrames={360}
      fps={30}
      width={1280}
      height={720}
    />
  );
}
