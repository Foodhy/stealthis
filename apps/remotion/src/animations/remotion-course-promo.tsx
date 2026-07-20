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
const ACCENT = "#f59e0b";       // amber-400
const ACCENT_DARK = "#b45309";  // amber-700
const ACCENT_GLOW = "#f59e0b30";
const ACCENT_LIGHT = "#fcd34d"; // amber-300
const BG = "#09090f";
const CARD_BG = "#111118";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.45)";
const TEXT_DIM = "rgba(255,255,255,0.25)";

// ── Fictional course data ────────────────────────────────────────────────────
const COURSE_TITLE = "Full-Stack TypeScript";
const COURSE_SUBTITLE = "Mastery";
const COURSE_TAGLINE = "From beginner to production engineer — in one course.";
const INSTRUCTOR = "Sarah Chen";
const INSTRUCTOR_ROLE = "Staff Eng · Vercel";
const INSTRUCTOR_INITIALS = "SC";
const STAT_LESSONS = 48;
const STAT_HOURS = 24;
const STAT_STUDENTS = 12400;
const RATING = "4.9";
const REVIEW_COUNT = "2,341";
const PRICE_ORIGINAL = "$149";

// ── Grid overlay background ──────────────────────────────────────────────────
const GridBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const pulseA = 0.9 + Math.sin((frame / 40) * Math.PI) * 0.1;
  const pulseB = 0.88 + Math.sin((frame / 55) * Math.PI + 1.2) * 0.12;

  return (
    <>
      {/* Dot-grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />
      {/* Main amber glow — top-left */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: -80,
          width: 640,
          height: 480,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${ACCENT}18 0%, ${ACCENT}08 45%, transparent 70%)`,
          transform: `scale(${pulseA})`,
          pointerEvents: "none",
        }}
      />
      {/* Secondary indigo glow — bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -80,
          width: 500,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, #6366f118 0%, transparent 65%)`,
          transform: `scale(${pulseB})`,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── Scene 1: Hero title ──────────────────────────────────────────────────────
const HeroTitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleY = spring({
    frame,
    fps,
    from: -60,
    to: 0,
    config: { damping: 16, stiffness: 120, mass: 1.0 },
  });
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleDelay = Math.max(0, frame - 12);
  const subtitleOpacity = interpolate(subtitleDelay, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = spring({
    frame: subtitleDelay,
    fps,
    from: 20,
    to: 0,
    config: { damping: 14, stiffness: 100 },
  });

  const taglineDelay = Math.max(0, frame - 22);
  const taglineOpacity = interpolate(taglineDelay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Badge pop-in
  const badgeDelay = Math.max(0, frame - 6);
  const badgeScale = spring({
    frame: badgeDelay,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 220, mass: 0.45 },
  });
  const badgeOpacity = interpolate(badgeDelay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: 72,
        paddingRight: 72,
      }}
    >
      {/* "NEW COURSE" badge */}
      <div
        style={{
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
          transformOrigin: "left center",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: `${ACCENT}18`,
            border: `1.5px solid ${ACCENT}60`,
            borderRadius: 50,
            padding: "9px 20px",
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: ACCENT_LIGHT,
              boxShadow: `0 0 8px ${ACCENT_LIGHT}`,
            }}
          />
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: ACCENT_LIGHT,
              letterSpacing: 2.5,
              textTransform: "uppercase" as const,
            }}
          >
            New Course — 2026
          </span>
        </div>
      </div>

      {/* Main title line 1 */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 84,
            color: TEXT_PRIMARY,
            letterSpacing: -3.5,
            lineHeight: 0.95,
          }}
        >
          {COURSE_TITLE}
        </div>
      </div>

      {/* Main title line 2 — accent color */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          marginTop: 4,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 84,
            color: ACCENT,
            letterSpacing: -3.5,
            lineHeight: 1.0,
            textShadow: `0 0 60px ${ACCENT}50`,
          }}
        >
          {COURSE_SUBTITLE}
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          marginTop: 28,
        }}
      >
        <p
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 22,
            color: TEXT_MUTED,
            letterSpacing: 0.1,
            margin: 0,
          }}
        >
          {COURSE_TAGLINE}
        </p>
      </div>
    </div>
  );
};

// ── Scene 2: Stats row ────────────────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  value: number;
  suffix: string;
  label: string;
  targetValue: number;
  startFrame: number;
  frame: number;
  fps: number;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  suffix,
  label,
  targetValue,
  startFrame,
  frame,
  fps,
  index,
}) => {
  const delay = startFrame + index * 10;
  const localFrame = Math.max(0, frame - delay);

  const cardScale = spring({
    frame: localFrame,
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 11, stiffness: 180, mass: 0.5 },
  });
  const cardOpacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Count-up animation: runs over 50 frames after card appears
  const countProgress = interpolate(localFrame, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const displayValue = Math.round(countProgress * targetValue);
  const formatted =
    targetValue >= 1000
      ? displayValue.toLocaleString("en-US")
      : String(displayValue);

  return (
    <div
      style={{
        flex: 1,
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
      }}
    >
      <div
        style={{
          backgroundColor: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 16,
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, ${ACCENT}80, ${ACCENT}20, transparent)`,
          }}
        />
        {/* Icon */}
        <div
          style={{
            fontSize: 36,
            lineHeight: 1,
            filter: "drop-shadow(0 0 8px rgba(245,158,11,0.4))",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        {/* Value + label */}
        <div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: 40,
              color: TEXT_PRIMARY,
              letterSpacing: -1.5,
              lineHeight: 1,
            }}
          >
            {formatted}
            <span
              style={{
                fontWeight: 600,
                fontSize: 22,
                color: ACCENT,
                marginLeft: 3,
              }}
            >
              {suffix}
            </span>
          </div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 500,
              fontSize: 15,
              color: TEXT_MUTED,
              marginTop: 5,
              letterSpacing: 0.3,
            }}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsRow: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const stats: Array<{
    icon: string;
    targetValue: number;
    suffix: string;
    label: string;
  }> = [
    { icon: "📹", targetValue: STAT_LESSONS, suffix: "", label: "Video Lessons" },
    { icon: "🕐", targetValue: STAT_HOURS, suffix: "hrs", label: "Total Content" },
    { icon: "👥", targetValue: STAT_STUDENTS, suffix: "+", label: "Students Enrolled" },
  ];

  // Section label slides down
  const labelDelay = Math.max(0, frame);
  const labelOpacity = interpolate(labelDelay, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelY = spring({
    frame: labelDelay,
    fps,
    from: -20,
    to: 0,
    config: { damping: 14, stiffness: 130 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: 64,
        paddingRight: 64,
        gap: 32,
      }}
    >
      {/* Section label */}
      <div
        style={{
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: ACCENT,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
          }}
        >
          What's included
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 20 }}>
        {stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            value={stat.targetValue}
            suffix={stat.suffix}
            label={stat.label}
            targetValue={stat.targetValue}
            startFrame={0}
            frame={frame}
            fps={fps}
            index={i}
          />
        ))}
      </div>
    </div>
  );
};

// ── Scene 3: Course card ──────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: string; count: string }> = ({ rating, count }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    {/* 5 stars (filled/partial) */}
    <div style={{ display: "flex", gap: 3 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          style={{
            fontSize: 18,
            color: ACCENT,
            textShadow: `0 0 6px ${ACCENT}80`,
          }}
        >
          ★
        </span>
      ))}
    </div>
    <span
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 700,
        fontSize: 18,
        color: TEXT_PRIMARY,
        letterSpacing: -0.3,
      }}
    >
      {rating}
    </span>
    <span
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        color: TEXT_MUTED,
      }}
    >
      ({count} reviews)
    </span>
  </div>
);

const CourseCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const cardX = spring({
    frame,
    fps,
    from: 120,
    to: 0,
    config: { damping: 18, stiffness: 120, mass: 1.1 },
  });
  const cardOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Price badge animate-in
  const priceDelay = Math.max(0, frame - 18);
  const priceScale = spring({
    frame: priceDelay,
    fps,
    from: 0,
    to: 1,
    config: { damping: 9, stiffness: 240, mass: 0.4 },
  });

  // Instructor line slides in from bottom
  const instrDelay = Math.max(0, frame - 24);
  const instrOpacity = interpolate(instrDelay, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const instrY = spring({
    frame: instrDelay,
    fps,
    from: 16,
    to: 0,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        right: 64,
        top: "50%",
        transform: `translateX(${cardX}px) translateY(-50%)`,
        opacity: cardOpacity,
        width: 380,
      }}
    >
      <div
        style={{
          backgroundColor: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: `0 20px 64px rgba(0,0,0,0.7), 0 0 0 1px ${ACCENT}15`,
        }}
      >
        {/* Thumbnail placeholder */}
        <div
          style={{
            width: "100%",
            height: 196,
            background: `linear-gradient(135deg, #1c1510 0%, #2d1f08 40%, #1a1006 100%)`,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Grid lines in thumbnail */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(245,158,11,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.08) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Glow center */}
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 140,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${ACCENT}30 0%, transparent 70%)`,
            }}
          />
          {/* Play button icon */}
          <div
            style={{
              position: "relative",
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: ACCENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 32px ${ACCENT}60`,
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: "18px solid #09090f",
                marginLeft: 4,
              }}
            />
          </div>
          {/* Course label overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 14,
              backgroundColor: "rgba(0,0,0,0.65)",
              borderRadius: 6,
              padding: "5px 10px",
            }}
          >
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 600,
                fontSize: 12,
                color: "rgba(255,255,255,0.8)",
                letterSpacing: 0.3,
              }}
            >
              Preview · 3 min
            </span>
          </div>
          {/* Bestseller badge */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 14,
              backgroundColor: ACCENT,
              borderRadius: 4,
              padding: "4px 10px",
            }}
          >
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                color: "#09090f",
                letterSpacing: 0.8,
                textTransform: "uppercase" as const,
              }}
            >
              Bestseller
            </span>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "24px 24px 28px" }}>
          {/* Course title */}
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: TEXT_PRIMARY,
              letterSpacing: -0.5,
              lineHeight: 1.25,
              marginBottom: 12,
            }}
          >
            Full-Stack TypeScript Mastery
          </div>

          {/* Rating */}
          <div style={{ marginBottom: 16 }}>
            <StarRating rating={RATING} count={REVIEW_COUNT} />
          </div>

          {/* Instructor */}
          <div
            style={{
              opacity: instrOpacity,
              transform: `translateY(${instrY}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
                border: `1.5px solid ${ACCENT_LIGHT}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#09090f",
                }}
              >
                {INSTRUCTOR_INITIALS}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: TEXT_PRIMARY,
                }}
              >
                {INSTRUCTOR}
              </div>
              <div
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  color: TEXT_MUTED,
                }}
              >
                {INSTRUCTOR_ROLE}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              backgroundColor: "rgba(255,255,255,0.06)",
              marginBottom: 20,
            }}
          />

          {/* Price */}
          <div
            style={{
              transform: `scale(${priceScale})`,
              transformOrigin: "left center",
              display: "flex",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 800,
                fontSize: 32,
                color: ACCENT,
                letterSpacing: -0.5,
                textShadow: `0 0 24px ${ACCENT}60`,
              }}
            >
              FREE
            </span>
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 500,
                fontSize: 18,
                color: TEXT_DIM,
                textDecoration: "line-through",
              }}
            >
              {PRICE_ORIGINAL}
            </span>
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#4ade80",
                backgroundColor: "#052e1680",
                border: "1px solid #4ade8030",
                borderRadius: 4,
                padding: "2px 8px",
              }}
            >
              100% OFF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Left-side text when card is shown
const CourseCardLeft: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleDelay = Math.max(0, frame - 4);
  const titleOpacity = interpolate(titleDelay, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleX = spring({
    frame: titleDelay,
    fps,
    from: -50,
    to: 0,
    config: { damping: 16, stiffness: 110 },
  });

  const featureDelay = Math.max(0, frame - 20);
  const featureOpacity = interpolate(featureDelay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const features = [
    "TypeScript from zero to advanced",
    "Node.js, Next.js & tRPC",
    "Prisma ORM + PostgreSQL",
    "Deploy to Vercel & Railway",
    "Real projects + code reviews",
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        top: "50%",
        transform: "translateY(-50%)",
        width: 500,
      }}
    >
      {/* eyebrow */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            color: ACCENT,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
          }}
        >
          Course details
        </span>
      </div>

      {/* Heading */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 44,
            color: TEXT_PRIMARY,
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          Everything you need
          <br />
          <span style={{ color: ACCENT }}>to ship real apps.</span>
        </div>
      </div>

      {/* Feature list */}
      <div
        style={{
          opacity: featureOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 13,
        }}
      >
        {features.map((feat) => (
          <div
            key={feat}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: `${ACCENT}20`,
                border: `1.5px solid ${ACCENT}60`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 11, color: ACCENT }}>✓</span>
            </div>
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 500,
                fontSize: 16,
                color: "rgba(255,255,255,0.75)",
              }}
            >
              {feat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Scene 4: CTA banner ───────────────────────────────────────────────────────
const CTABanner: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const bannerScale = spring({
    frame,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 14, stiffness: 140, mass: 0.8 },
  });
  const bannerOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing border glow
  const glowIntensity = 0.5 + Math.sin((frame / 18) * Math.PI) * 0.5;
  const buttonScale = 1 + Math.sin((frame / 22) * Math.PI) * 0.018;

  // Shimmer sweep on CTA button
  const shimmerFrame = frame % 60;
  const shimmerX = interpolate(shimmerFrame, [0, 60], [-80, 360], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline fade-in
  const taglineDelay = Math.max(0, frame - 20);
  const taglineOpacity = interpolate(taglineDelay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
      }}
    >
      {/* Eyebrow label */}
      <div
        style={{
          opacity: bannerOpacity,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: ACCENT,
            letterSpacing: 3.5,
            textTransform: "uppercase" as const,
          }}
        >
          Limited time offer
        </span>
      </div>

      {/* Main heading */}
      <div
        style={{
          opacity: bannerOpacity,
          transform: `scale(${bannerScale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: TEXT_PRIMARY,
            letterSpacing: -3,
            lineHeight: 1.0,
            textAlign: "center",
          }}
        >
          Start Learning
          <br />
          <span
            style={{
              color: ACCENT,
              textShadow: `0 0 60px ${ACCENT}60`,
            }}
          >
            Today — Enroll Free
          </span>
        </div>
      </div>

      {/* CTA button with pulsing border */}
      <div
        style={{
          opacity: bannerOpacity,
          position: "relative",
        }}
      >
        {/* Outer pulsing glow ring */}
        <div
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: 24,
            border: `2px solid ${ACCENT}`,
            opacity: glowIntensity * 0.5,
            filter: `blur(6px)`,
            pointerEvents: "none",
          }}
        />
        {/* Inner glow ring */}
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: 20,
            border: `1.5px solid ${ACCENT}`,
            opacity: glowIntensity * 0.7,
            pointerEvents: "none",
          }}
        />

        {/* Button itself */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
            borderRadius: 16,
            padding: "22px 56px",
            transform: `scale(${buttonScale})`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: `0 12px 48px ${ACCENT}50, 0 4px 12px rgba(0,0,0,0.5)`,
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: 24,
              color: "#09090f",
              letterSpacing: -0.2,
              whiteSpace: "nowrap" as const,
            }}
          >
            Enroll Now — It's Free
          </span>
          <span style={{ fontSize: 22, color: "#09090f" }}>→</span>

          {/* Shimmer sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: shimmerX,
              width: 80,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              transform: "skewX(-20deg)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Tagline below button */}
      <div style={{ opacity: taglineOpacity, textAlign: "center" }}>
        <p
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 16,
            color: TEXT_MUTED,
            margin: 0,
          }}
        >
          No credit card required · Instant access · Lifetime updates
        </p>
      </div>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export const CoursePromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out at the very end
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Cross-fade transitions between scenes
  // Scene 1: 0–40f, Scene 2: 30–100f, Scene 3: 80–150f, Scene 4: 140–210f
  const scene1Opacity = interpolate(frame, [0, 6, 34, 42], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene2Opacity = interpolate(frame, [28, 38, 94, 104], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene3Opacity = interpolate(frame, [78, 88, 144, 154], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene4Opacity = interpolate(frame, [138, 148, durationInFrames - 20, durationInFrames - 12], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        overflow: "hidden",
        opacity: globalOpacity,
      }}
    >
      {/* Always-on background */}
      <GridBackground frame={frame} />

      {/* Scene 1 — Hero title (0-42f) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: scene1Opacity,
          pointerEvents: scene1Opacity > 0 ? "auto" : "none",
        }}
      >
        <Sequence from={0} durationInFrames={45}>
          <HeroTitle frame={frame} fps={fps} />
        </Sequence>
      </div>

      {/* Scene 2 — Stats row (28-104f) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: scene2Opacity,
          pointerEvents: scene2Opacity > 0 ? "auto" : "none",
        }}
      >
        <Sequence from={28} durationInFrames={78}>
          <StatsRow frame={Math.max(0, frame - 28)} fps={fps} />
        </Sequence>
      </div>

      {/* Scene 3 — Course card (78-154f) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: scene3Opacity,
          pointerEvents: scene3Opacity > 0 ? "auto" : "none",
        }}
      >
        <Sequence from={78} durationInFrames={78}>
          <CourseCardLeft frame={Math.max(0, frame - 78)} fps={fps} />
          <CourseCard frame={Math.max(0, frame - 78)} fps={fps} />
        </Sequence>
      </div>

      {/* Scene 4 — CTA banner (138-210f) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: scene4Opacity,
          pointerEvents: scene4Opacity > 0 ? "auto" : "none",
        }}
      >
        <Sequence from={138} durationInFrames={72}>
          <CTABanner frame={Math.max(0, frame - 138)} fps={fps} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="CoursePromo"
    component={CoursePromo}
    durationInFrames={210}
    fps={30}
    width={1280}
    height={720}
  />
);
