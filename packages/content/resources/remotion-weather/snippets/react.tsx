import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Constants (customize these) ───────────────────────────────────────────────
const CITY = "SAN FRANCISCO BAY AREA";
const CHANNEL = "NNX WEATHER";
const CURRENT = {
  temp: "68°F",
  condition: "Partly Cloudy",
  wind: "12 mph NW",
  humidity: "74%",
  feelsLike: "65°F",
  uvIndex: "3 Moderate",
};
const DAYS: Array<{ day: string; icon: string; high: number; low: number; desc: string }> = [
  { day: "MON", icon: "☀️",  high: 72, low: 54, desc: "Sunny" },
  { day: "TUE", icon: "🌤️", high: 68, low: 52, desc: "Mostly Clear" },
  { day: "WED", icon: "⛅", high: 63, low: 50, desc: "Partly Cloudy" },
  { day: "THU", icon: "🌧️", high: 57, low: 48, desc: "Showers" },
  { day: "FRI", icon: "🌩️", high: 54, low: 46, desc: "Thunderstorms" },
];

// ── Color palette ─────────────────────────────────────────────────────────────
const BG_NAVY = "#0a0e2a";
const ACCENT_CYAN = "#00d4ff";
const ACCENT_GOLD = "#f5c842";
const TEXT_WHITE = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.55)";
const TEXT_DIM = "rgba(255,255,255,0.30)";
const CARD_BG = "rgba(255,255,255,0.055)";
const CARD_BORDER = "rgba(255,255,255,0.10)";
const FONT_SANS = "'Inter', system-ui, -apple-system, sans-serif";
const FONT_MONO = "'ui-monospace', 'Cascadia Code', monospace";

// ── Scene boundaries (frames) ─────────────────────────────────────────────────
const SCENE1_START = 0;    // Header + current conditions
const SCENE2_START = 50;   // 5-day cards stagger in
const SCENE3_START = 180;  // Footer + pulse

// ── Background ────────────────────────────────────────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const cloudDrift1 = interpolate(frame, [0, 240], [0, 60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cloudDrift2 = interpolate(frame, [0, 240], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Base dark navy */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: BG_NAVY,
        }}
      />
      {/* Ambient radial gradient — top centre blue glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,80,180,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Soft cyan glow bottom left */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 40% at 10% 100%, rgba(0,212,255,0.10) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Drifting cloud blobs (CSS radial gradients simulating diffuse clouds) */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: -80,
          width: 500,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(200,210,240,0.06) 0%, transparent 70%)",
          transform: `translateX(${cloudDrift1}px)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 0,
          width: 420,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(180,200,240,0.05) 0%, transparent 70%)",
          transform: `translateX(${cloudDrift2}px)`,
          pointerEvents: "none",
        }}
      />
      {/* Subtle horizontal scan-line texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />
    </>
  );
};

// ── Location Pin SVG ─────────────────────────────────────────────────────────
const LocationPin: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: "block" }}
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill={color}
      opacity={0.9}
    />
    <circle cx="12" cy="9" r="2.5" fill={BG_NAVY} />
  </svg>
);

// ── Header (Scene 1: frames 0–50) ─────────────────────────────────────────────
const Header: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - SCENE1_START);

  const headerY = spring({
    frame: f,
    fps,
    from: -40,
    to: 0,
    config: { damping: 18, stiffness: 110 },
  });
  const headerOpacity = interpolate(f, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dividerWidth = interpolate(f, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Live blink
  const blink = Math.floor(frame / 18) % 2 === 0;

  return (
    <div
      style={{
        opacity: headerOpacity,
        transform: `translateY(${headerY}px)`,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        {/* Channel logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Logo mark — circle + 'W' */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${ACCENT_CYAN} 0%, #0080b4 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 18px rgba(0,212,255,0.4)`,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: FONT_SANS,
                fontWeight: 900,
                fontSize: 18,
                color: BG_NAVY,
                letterSpacing: "-1px",
                lineHeight: 1,
              }}
            >
              W
            </span>
          </div>
          <div>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontWeight: 800,
                fontSize: 22,
                color: TEXT_WHITE,
                letterSpacing: "-0.5px",
                lineHeight: 1,
              }}
            >
              {CHANNEL}
            </div>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontWeight: 400,
                fontSize: 11,
                color: TEXT_DIM,
                letterSpacing: "2px",
                marginTop: 3,
                textTransform: "uppercase",
              }}
            >
              Broadcast Forecast
            </div>
          </div>
        </div>

        {/* Location + LIVE badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LocationPin size={16} color={ACCENT_CYAN} />
            <span
              style={{
                fontFamily: FONT_SANS,
                fontWeight: 600,
                fontSize: 13,
                color: ACCENT_CYAN,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {CITY}
            </span>
          </div>
          {/* LIVE badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(229,57,53,0.18)",
              border: "1px solid rgba(229,57,53,0.40)",
              borderRadius: 6,
              padding: "4px 10px",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#e53935",
                boxShadow: "0 0 6px #e53935",
                opacity: blink ? 1 : 0.35,
              }}
            />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 11,
                color: "#e53935",
                letterSpacing: "2px",
              }}
            >
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Cyan divider line that draws in */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${ACCENT_CYAN} 0%, rgba(0,212,255,0.3) 100%)`,
          borderRadius: 1,
          transformOrigin: "left",
          transform: `scaleX(${dividerWidth})`,
          boxShadow: `0 0 12px rgba(0,212,255,0.5)`,
          marginBottom: 0,
        }}
      />
    </div>
  );
};

// ── Current Conditions Card (Scene 1: frames 12–50) ───────────────────────────
const StatPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      background: "rgba(0,212,255,0.08)",
      border: `1px solid rgba(0,212,255,0.20)`,
      borderRadius: 8,
      padding: "6px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 90,
    }}
  >
    <div
      style={{
        fontFamily: FONT_SANS,
        fontWeight: 500,
        fontSize: 10,
        color: TEXT_DIM,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 13,
        color: TEXT_WHITE,
        letterSpacing: "0.3px",
      }}
    >
      {value}
    </div>
  </div>
);

const CurrentConditions: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delay = 12;
  const f = Math.max(0, frame - delay);

  const cardScale = spring({
    frame: f,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 16, stiffness: 120 },
  });
  const cardOpacity = interpolate(f, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Temp digit count-up (cool-looking even with a string temp — animate scale)
  const tempScale = spring({
    frame: f,
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 14, stiffness: 90 },
  });

  const conditionOpacity = interpolate(f, [18, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const conditionX = spring({
    frame: Math.max(0, f - 18),
    fps,
    from: 20,
    to: 0,
    config: { damping: 18, stiffness: 130 },
  });

  const pillsOpacity = interpolate(f, [28, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 16,
        padding: "22px 28px",
        display: "flex",
        alignItems: "center",
        gap: 32,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top-left accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${ACCENT_CYAN} 0%, transparent 60%)`,
          borderRadius: "16px 16px 0 0",
          boxShadow: `0 0 10px rgba(0,212,255,0.4)`,
        }}
      />

      {/* Large weather emoji + temperature */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: 64,
            lineHeight: 1,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
            transform: `scale(${tempScale})`,
            display: "block",
          }}
        >
          ⛅
        </div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 900,
            fontSize: 68,
            color: TEXT_WHITE,
            letterSpacing: "-3px",
            lineHeight: 1,
            transform: `scale(${tempScale})`,
            textShadow: "0 2px 24px rgba(0,212,255,0.25)",
          }}
        >
          {CURRENT.temp}
        </div>
      </div>

      {/* Vertical divider */}
      <div
        style={{
          width: 1,
          alignSelf: "stretch",
          background: CARD_BORDER,
          flexShrink: 0,
        }}
      />

      {/* Condition text + stat pills */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            opacity: conditionOpacity,
            transform: `translateX(${conditionX}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: 28,
              color: ACCENT_CYAN,
              letterSpacing: "-0.5px",
              marginBottom: 4,
              textShadow: `0 0 20px rgba(0,212,255,0.4)`,
            }}
          >
            {CURRENT.condition}
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 400,
              fontSize: 13,
              color: TEXT_DIM,
              letterSpacing: "1px",
              marginBottom: 16,
              textTransform: "uppercase",
            }}
          >
            Current Conditions
          </div>
        </div>

        <div
          style={{
            opacity: pillsOpacity,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <StatPill label="Wind" value={CURRENT.wind} />
          <StatPill label="Humidity" value={CURRENT.humidity} />
          <StatPill label="Feels Like" value={CURRENT.feelsLike} />
          <StatPill label="UV Index" value={CURRENT.uvIndex} />
        </div>
      </div>
    </div>
  );
};

// ── Day Card (Scene 2: 50–180, staggered 15 frames each) ─────────────────────
interface DayCardProps {
  day: typeof DAYS[number];
  frame: number;
  fps: number;
  index: number;
  /** Frame at which the Scene 3 global pulse starts */
  pulseStart: number;
}

const DayCard: React.FC<DayCardProps> = ({ day, frame, fps, index, pulseStart }) => {
  const delay = SCENE2_START + index * 15;
  const f = Math.max(0, frame - delay);

  // Spring up from below
  const cardY = spring({
    frame: f,
    fps,
    from: 60,
    to: 0,
    config: { damping: 15, stiffness: 100 },
  });
  const cardOpacity = interpolate(f, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene 3 pulse — all cards scale up together gently
  const pulseF = Math.max(0, frame - pulseStart);
  const pulseProgress = interpolate(pulseF, [0, 30, 50], [1, 1.03, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sine),
  });

  const isWarm = day.high >= 65;
  const accentColor = isWarm ? ACCENT_GOLD : ACCENT_CYAN;

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardY}px) scale(${pulseProgress})`,
        flex: 1,
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 14,
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accentColor,
          borderRadius: "14px 14px 0 0",
          boxShadow: `0 0 8px ${accentColor}`,
        }}
      />

      {/* Day name */}
      <div
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 700,
          fontSize: 14,
          color: TEXT_DIM,
          letterSpacing: "2.5px",
          textTransform: "uppercase",
        }}
      >
        {day.day}
      </div>

      {/* Weather icon */}
      <div
        style={{
          fontSize: 44,
          lineHeight: 1,
          filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.5))",
          userSelect: "none",
        }}
      >
        {day.icon}
      </div>

      {/* Condition label */}
      <div
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 500,
          fontSize: 11,
          color: TEXT_MUTED,
          letterSpacing: "0.5px",
          textAlign: "center",
          lineHeight: 1.3,
          minHeight: 28,
        }}
      >
        {day.desc}
      </div>

      {/* Temp high/low */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 800,
            fontSize: 24,
            color: TEXT_WHITE,
            letterSpacing: "-0.5px",
          }}
        >
          {day.high}°
        </span>
        <span
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 500,
            fontSize: 16,
            color: TEXT_MUTED,
            letterSpacing: "-0.3px",
          }}
        >
          {day.low}°
        </span>
      </div>

      {/* Temp range bar */}
      <div
        style={{
          width: "100%",
          height: 3,
          borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((day.high - 40) / 50) * 100}%`,
            background: `linear-gradient(90deg, rgba(0,212,255,0.5) 0%, ${accentColor} 100%)`,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};

// ── 5-Day Grid (Scene 2) ─────────────────────────────────────────────────────
const FiveDayGrid: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sectionOpacity = interpolate(frame, [SCENE2_START, SCENE2_START + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity: sectionOpacity }}>
      {/* Section label */}
      <div
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 600,
          fontSize: 11,
          color: TEXT_DIM,
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        5-Day Forecast
      </div>

      {/* Card row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {DAYS.map((day, i) => (
          <DayCard
            key={day.day}
            day={day}
            frame={frame}
            fps={fps}
            index={i}
            pulseStart={SCENE3_START}
          />
        ))}
      </div>
    </div>
  );
};

// ── Footer / Scene 3 (frames 180–240) ────────────────────────────────────────
const Footer: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - SCENE3_START);

  const opacity = interpolate(f, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = spring({
    frame: f,
    fps,
    from: 14,
    to: 0,
    config: { damping: 20, stiffness: 140 },
  });

  // Animated cyan underline draw
  const lineWidth = interpolate(f, [10, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 14,
        borderTop: `1px solid ${CARD_BORDER}`,
        position: "relative",
      }}
    >
      {/* Animated cyan border-top overlay */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: 0,
          height: 1,
          background: ACCENT_CYAN,
          boxShadow: `0 0 8px rgba(0,212,255,0.6)`,
          width: `${lineWidth * 100}%`,
          borderRadius: 1,
        }}
      />

      <div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 500,
            fontSize: 14,
            color: TEXT_MUTED,
            letterSpacing: "0.3px",
          }}
        >
          Extended forecast — powered by{" "}
          <span style={{ color: ACCENT_CYAN, fontWeight: 700 }}>{CHANNEL}</span>
        </div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 400,
            fontSize: 10,
            color: TEXT_DIM,
            letterSpacing: "1px",
            marginTop: 4,
            textTransform: "uppercase",
          }}
        >
          All data is fictional · For broadcast demonstration only
        </div>
      </div>

      {/* Weather alert icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(245,200,66,0.10)",
          border: "1px solid rgba(245,200,66,0.28)",
          borderRadius: 8,
          padding: "6px 14px",
        }}
      >
        <span style={{ fontSize: 16 }}>⚠️</span>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 700,
            fontSize: 11,
            color: ACCENT_GOLD,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          High Wind Advisory
        </div>
      </div>
    </div>
  );
};

// ── Temperature bar at top right — decorative ambient HUD ─────────────────────
const AmbientHUD: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const f2 = Math.max(0, frame - 20);
  const scaleY = spring({
    frame: f2,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 100 },
  });

  // Sunrise / sunset info
  const infoOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-end",
      }}
    >
      {/* Vertical temp range bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 600,
            fontSize: 11,
            color: TEXT_DIM,
            letterSpacing: "0.5px",
            textAlign: "right",
          }}
        >
          <div>72°</div>
          <div style={{ marginTop: 40, color: TEXT_DIM }}>54°</div>
        </div>
        <div
          style={{
            width: 6,
            height: 70,
            borderRadius: 3,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${scaleY * 55}%`,
              background: `linear-gradient(0deg, ${ACCENT_CYAN} 0%, ${ACCENT_GOLD} 100%)`,
              borderRadius: 3,
              boxShadow: `0 0 6px ${ACCENT_CYAN}`,
            }}
          />
        </div>
      </div>

      {/* Sunrise / sunset */}
      <div
        style={{
          opacity: infoOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_DIM }}>6:08 AM</span>
          <span style={{ fontSize: 14 }}>🌅</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_DIM }}>7:54 PM</span>
          <span style={{ fontSize: 14 }}>🌇</span>
        </div>
      </div>
    </div>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────
export default function WeatherForecast() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Background layers */}
      <Background frame={frame} />

      {/* Main content panel */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 56,
          right: 56,
          bottom: 36,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Scene 1: Header */}
        <Header frame={frame} fps={fps} />

        {/* Scene 1: Current conditions + ambient HUD side by side */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          <div style={{ flex: 1 }}>
            <CurrentConditions frame={frame} fps={fps} />
          </div>
          {/* Ambient HUD column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 8px",
            }}
          >
            <AmbientHUD frame={frame} fps={fps} />
          </div>
        </div>

        {/* Scene 2: 5-day forecast grid */}
        <div style={{ flex: 1 }}>
          <FiveDayGrid frame={frame} fps={fps} />
        </div>

        {/* Scene 3: Footer */}
        <Footer frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
}
