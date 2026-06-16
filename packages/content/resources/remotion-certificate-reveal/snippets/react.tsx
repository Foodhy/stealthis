import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from "remotion";

// ─── Customizable constants ────────────────────────────────────────────────
const RECIPIENT_NAME = "Alexandra M. Harrison";
const AWARD_TITLE = "Certificate of Excellence";
const AWARD_SUBTITLE = "in Advanced Software Engineering";
const ISSUER = "International Academy of Technology";
const AWARD_DATE = "June 13, 2026";
const SIGNATORY_LEFT = "Dr. James Whitfield";
const SIGNATORY_LEFT_TITLE = "Dean of Engineering";
const SIGNATORY_RIGHT = "Prof. Sarah Chen";
const SIGNATORY_RIGHT_TITLE = "Program Director";
const DURATION_FRAMES = 150;

// Gold / Navy / Cream palette
const GOLD = "#C9A94B";
const GOLD_LIGHT = "#E8D07A";
const GOLD_DARK = "#A07830";
const GOLD_BRIGHT = "#F5D87A";
const NAVY = "#0D1B3E";
const NAVY_MID = "#162447";
const NAVY_LIGHT = "#1F3469";
const CREAM = "#FEFAE8";
const CREAM_WARM = "#F8F0D0";
const WHITE = "#FFFFFF";
const PARCHMENT = "#F5EDD8";
const DEEP_GOLD = "#8B6914";

// Star polygon points helper
function starPoints(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number
): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

// ─── Background ─────────────────────────────────────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: bgOpacity,
        background: `radial-gradient(ellipse at 50% 50%, ${NAVY_MID} 0%, ${NAVY} 55%, #07102A 100%)`,
      }}
    >
      {/* Subtle corner glow orbs */}
      {[
        { x: "0%", y: "0%", size: 340, opacity: 0.18 },
        { x: "100%", y: "100%", size: 300, opacity: 0.15 },
        { x: "100%", y: "0%", size: 260, opacity: 0.12 },
        { x: "0%", y: "100%", size: 280, opacity: 0.13 },
      ].map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${GOLD}44 0%, transparent 70%)`,
            opacity: orb.opacity,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Floating gold dust particles */}
      {DUST_PARTICLES.map((p, i) => {
        const floatY =
          Math.sin(((frame + p.phase * 4) * 0.035 * p.speed) % (Math.PI * 2)) *
          14;
        const floatX =
          Math.cos(
            ((frame + p.phase * 3) * 0.022 * p.speed) % (Math.PI * 2)
          ) * 8;
        const pOpacity = interpolate(frame, [10, 35], [0, p.maxOpacity], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.xPct}%`,
              top: `${p.yPct}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: GOLD_LIGHT,
              opacity: pOpacity,
              transform: `translate(${floatX}px, ${floatY}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const DUST_PARTICLES: {
  xPct: number;
  yPct: number;
  size: number;
  speed: number;
  phase: number;
  maxOpacity: number;
}[] = [
  { xPct: 4, yPct: 18, size: 3, speed: 1.0, phase: 0, maxOpacity: 0.4 },
  { xPct: 9, yPct: 72, size: 2, speed: 1.3, phase: 7, maxOpacity: 0.3 },
  { xPct: 18, yPct: 42, size: 4, speed: 0.8, phase: 2, maxOpacity: 0.35 },
  { xPct: 27, yPct: 88, size: 2, speed: 1.1, phase: 14, maxOpacity: 0.25 },
  { xPct: 35, yPct: 12, size: 3, speed: 0.9, phase: 4, maxOpacity: 0.4 },
  { xPct: 50, yPct: 92, size: 2, speed: 1.4, phase: 11, maxOpacity: 0.3 },
  { xPct: 64, yPct: 8, size: 3, speed: 1.0, phase: 19, maxOpacity: 0.35 },
  { xPct: 72, yPct: 58, size: 4, speed: 0.7, phase: 6, maxOpacity: 0.45 },
  { xPct: 81, yPct: 30, size: 2, speed: 1.2, phase: 9, maxOpacity: 0.3 },
  { xPct: 91, yPct: 78, size: 3, speed: 0.85, phase: 16, maxOpacity: 0.35 },
  { xPct: 96, yPct: 22, size: 2, speed: 1.1, phase: 3, maxOpacity: 0.3 },
  { xPct: 14, yPct: 55, size: 3, speed: 1.05, phase: 21, maxOpacity: 0.4 },
  { xPct: 46, yPct: 80, size: 2, speed: 1.15, phase: 10, maxOpacity: 0.28 },
  { xPct: 59, yPct: 38, size: 3, speed: 0.9, phase: 24, maxOpacity: 0.38 },
  { xPct: 79, yPct: 68, size: 4, speed: 1.2, phase: 5, maxOpacity: 0.32 },
];

// ─── Corner Star Ornaments ───────────────────────────────────────────────────
const CornerStar: React.FC<{
  frame: number;
  x: number;
  y: number;
  delay: number;
  flip?: boolean;
}> = ({ frame, x, y, delay, flip = false }) => {
  const { fps } = useVideoConfig();
  const sc = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 14, stiffness: 130, mass: 1 },
  });
  const scaleVal = interpolate(sc, [0, 1], [0, 1]);
  const rotate = flip ? 45 : 0;

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scaleVal}) rotate(${rotate})`}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      {/* Large star */}
      <polygon
        points={starPoints(0, 0, 22, 10, 6)}
        fill={GOLD}
        opacity={0.9}
      />
      {/* Inner bright star */}
      <polygon
        points={starPoints(0, 0, 11, 5, 6)}
        fill={GOLD_BRIGHT}
        opacity={0.95}
      />
      {/* Tiny center dot */}
      <circle cx={0} cy={0} r={3} fill={WHITE} opacity={0.9} />
    </g>
  );
};

// ─── Certificate Border (SVG traced lines) ───────────────────────────────────
const CertificateBorder: React.FC<{
  frame: number;
  width: number;
  height: number;
}> = ({ frame, width, height }) => {
  // Outer border perimeter
  const outerPerimeter = 2 * (width + height);
  const traceProgress = interpolate(frame, [8, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const outerDashOffset = outerPerimeter * (1 - traceProgress);

  // Inner border (slightly smaller)
  const pad = 12;
  const inW = width - pad * 2;
  const inH = height - pad * 2;
  const innerPerimeter = 2 * (inW + inH);
  const innerTrace = interpolate(frame, [18, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const innerDashOffset = innerPerimeter * (1 - innerTrace);

  // Decorative line opacity
  const decoOpacity = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
    >
      <defs>
        <filter id="goldGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer rect border */}
      <rect
        x={2}
        y={2}
        width={width - 4}
        height={height - 4}
        fill="none"
        stroke={GOLD}
        strokeWidth={3}
        strokeDasharray={outerPerimeter}
        strokeDashoffset={outerDashOffset}
        filter="url(#goldGlow)"
        rx={4}
        ry={4}
      />

      {/* Inner rect border */}
      <rect
        x={pad + 2}
        y={pad + 2}
        width={inW - 4}
        height={inH - 4}
        fill="none"
        stroke={GOLD_DARK}
        strokeWidth={1.5}
        strokeDasharray={innerPerimeter}
        strokeDashoffset={innerDashOffset}
        rx={2}
        ry={2}
      />

      {/* Corner flourish diamonds */}
      {[
        [22, 22],
        [width - 22, 22],
        [22, height - 22],
        [width - 22, height - 22],
      ].map(([cx, cy], i) => (
        <polygon
          key={i}
          points={`${cx},${cy - 8} ${cx + 8},${cy} ${cx},${cy + 8} ${cx - 8},${cy}`}
          fill={GOLD}
          opacity={decoOpacity * 0.9}
        />
      ))}

      {/* Top center ornament line group */}
      <g opacity={decoOpacity}>
        <line
          x1={width / 2 - 90}
          y1={30}
          x2={width / 2 - 22}
          y2={30}
          stroke={GOLD}
          strokeWidth={1.5}
        />
        <line
          x1={width / 2 + 22}
          y1={30}
          x2={width / 2 + 90}
          y2={30}
          stroke={GOLD}
          strokeWidth={1.5}
        />
        <circle cx={width / 2} cy={30} r={5} fill={GOLD} opacity={0.9} />
        <circle cx={width / 2 - 95} cy={30} r={3} fill={GOLD} opacity={0.7} />
        <circle cx={width / 2 + 95} cy={30} r={3} fill={GOLD} opacity={0.7} />
      </g>

      {/* Bottom center ornament */}
      <g opacity={decoOpacity}>
        <line
          x1={width / 2 - 110}
          y1={height - 30}
          x2={width / 2 - 25}
          y2={height - 30}
          stroke={GOLD}
          strokeWidth={1.5}
        />
        <line
          x1={width / 2 + 25}
          y1={height - 30}
          x2={width / 2 + 110}
          y2={height - 30}
          stroke={GOLD}
          strokeWidth={1.5}
        />
        <polygon
          points={starPoints(width / 2, height - 30, 7, 3, 4)}
          fill={GOLD}
          opacity={0.9}
        />
      </g>

      {/* Corner Stars (SVG subcomponent) */}
      <CornerStar frame={frame} x={22} y={22} delay={60} />
      <CornerStar frame={frame} x={width - 22} y={22} delay={65} flip />
      <CornerStar frame={frame} x={22} y={height - 22} delay={70} />
      <CornerStar
        frame={frame}
        x={width - 22}
        y={height - 22}
        delay={75}
        flip
      />
    </svg>
  );
};

// ─── Seal Component ──────────────────────────────────────────────────────────
const Seal: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const sc = spring({
    frame: Math.max(0, frame - 90),
    fps,
    config: { damping: 11, stiffness: 160, mass: 1 },
  });
  const scaleVal = interpolate(sc, [0, 1], [0, 1]);

  // Gentle pulse after entry
  const pulse =
    1 +
    Math.sin(
      Math.max(0, frame - 105) * 0.12
    ) *
      0.018;
  const finalScale = scaleVal * pulse;

  const rotateRing = frame * 0.35;

  const sealOpacity = interpolate(frame, [90, 108], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 68,
        right: 72,
        width: 110,
        height: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: sealOpacity,
        transform: `scale(${finalScale})`,
        transformOrigin: "center center",
      }}
    >
      <svg width={110} height={110} viewBox="-55 -55 110 110">
        <defs>
          <filter id="sealGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="sealFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={GOLD_BRIGHT} />
            <stop offset="55%" stopColor={GOLD} />
            <stop offset="100%" stopColor={GOLD_DARK} />
          </radialGradient>
        </defs>

        {/* Outer serrated ring (rotates slowly) */}
        <g transform={`rotate(${rotateRing})`}>
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i / 36) * Math.PI * 2;
            const r1 = 48;
            const r2 = 42;
            return (
              <line
                key={i}
                x1={Math.cos(angle) * r2}
                y1={Math.sin(angle) * r2}
                x2={Math.cos(angle) * r1}
                y2={Math.sin(angle) * r1}
                stroke={GOLD}
                strokeWidth={2.5}
                opacity={0.85}
              />
            );
          })}
        </g>

        {/* Background circle */}
        <circle cx={0} cy={0} r={40} fill="url(#sealFill)" filter="url(#sealGlow)" />

        {/* Inner ring */}
        <circle cx={0} cy={0} r={40} fill="none" stroke={GOLD_DARK} strokeWidth={2} opacity={0.6} />
        <circle cx={0} cy={0} r={34} fill="none" stroke={WHITE} strokeWidth={0.8} opacity={0.5} />

        {/* Central star emblem */}
        <polygon
          points={starPoints(0, 0, 18, 8, 5)}
          fill={NAVY}
          opacity={0.92}
        />
        <polygon
          points={starPoints(0, 0, 14, 6, 5)}
          fill={GOLD_BRIGHT}
          opacity={0.95}
        />
        <circle cx={0} cy={0} r={4} fill={WHITE} opacity={0.9} />

        {/* "CERTIFIED" text arc (approximate with positioned letters) */}
        {["C", "E", "R", "T", "I", "F", "I", "E", "D"].map((letter, i) => {
          const totalLetters = 9;
          const angleSpan = Math.PI * 0.9;
          const startAngle = -Math.PI / 2 - angleSpan / 2;
          const angle = startAngle + (i / (totalLetters - 1)) * angleSpan;
          const r = 28;
          return (
            <text
              key={i}
              x={Math.cos(angle) * r}
              y={Math.sin(angle) * r}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={5.5}
              fontWeight="bold"
              fill={NAVY}
              fontFamily="system-ui, -apple-system, sans-serif"
              transform={`rotate(${(angle * 180) / Math.PI + 90}, ${Math.cos(angle) * r}, ${Math.sin(angle) * r})`}
            >
              {letter}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Typewriter Name ─────────────────────────────────────────────────────────
const TypewriterName: React.FC<{ frame: number }> = ({ frame }) => {
  // Name starts typing at frame 65, finishes by frame 105
  const charsToShow = Math.floor(
    interpolate(frame, [65, 108], [0, RECIPIENT_NAME.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const displayName = RECIPIENT_NAME.substring(0, charsToShow);

  // Cursor blink
  const showCursor =
    charsToShow < RECIPIENT_NAME.length
      ? Math.floor(frame * 0.25) % 2 === 0
      : false;

  const nameOpacity = interpolate(frame, [63, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: nameOpacity,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 56,
        position: "relative",
      }}
    >
      <span
        style={{
          fontFamily:
            "Georgia, 'Times New Roman', serif",
          fontSize: 40,
          color: NAVY,
          fontWeight: "700",
          letterSpacing: 1.5,
          textShadow: `0 1px 3px rgba(0,0,0,0.12)`,
        }}
      >
        {displayName}
        {showCursor && (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: 38,
              background: GOLD,
              marginLeft: 3,
              verticalAlign: "middle",
            }}
          />
        )}
      </span>
    </div>
  );
};

// ─── Divider Line ────────────────────────────────────────────────────────────
const DividerLine: React.FC<{
  frame: number;
  delay: number;
  width?: number;
  color?: string;
}> = ({ frame, delay, width = 420, color = GOLD }) => {
  const lineScale = interpolate(frame, [delay, delay + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  return (
    <div
      style={{
        width: width * lineScale,
        height: 1.5,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        margin: "0 auto",
      }}
    />
  );
};

// ─── Signatories ─────────────────────────────────────────────────────────────
const Signatories: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [115, 135], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [115, 135], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const signatureStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  };

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-end",
        width: "100%",
        padding: "0 40px",
      }}
    >
      {/* Left signatory */}
      <div style={signatureStyle}>
        <div
          style={{
            fontFamily: "'Palatino Linotype', Georgia, serif",
            fontSize: 18,
            color: NAVY,
            fontStyle: "italic",
            letterSpacing: 0.5,
          }}
        >
          {SIGNATORY_LEFT}
        </div>
        <div
          style={{
            width: 160,
            height: 1,
            background: GOLD_DARK,
            opacity: 0.7,
          }}
        />
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 11,
            color: "#5A5040",
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {SIGNATORY_LEFT_TITLE}
        </div>
      </div>

      {/* Center date */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <svg width={16} height={16} viewBox="-8 -8 16 16" style={{ marginBottom: 2 }}>
          <polygon points={starPoints(0, 0, 7, 3, 4)} fill={GOLD} opacity={0.85} />
        </svg>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 12,
            color: GOLD_DARK,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Date Issued
        </div>
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 15,
            color: NAVY,
            fontWeight: "600",
            letterSpacing: 0.5,
          }}
        >
          {AWARD_DATE}
        </div>
      </div>

      {/* Right signatory */}
      <div style={signatureStyle}>
        <div
          style={{
            fontFamily: "'Palatino Linotype', Georgia, serif",
            fontSize: 18,
            color: NAVY,
            fontStyle: "italic",
            letterSpacing: 0.5,
          }}
        >
          {SIGNATORY_RIGHT}
        </div>
        <div
          style={{
            width: 160,
            height: 1,
            background: GOLD_DARK,
            opacity: 0.7,
          }}
        />
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 11,
            color: "#5A5040",
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {SIGNATORY_RIGHT_TITLE}
        </div>
      </div>
    </div>
  );
};

// ─── Ribbon Banners ──────────────────────────────────────────────────────────
const RibbonBanner: React.FC<{
  frame: number;
  side: "left" | "right";
  delay: number;
}> = ({ frame, side, delay }) => {
  const { fps } = useVideoConfig();

  const sc = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 16, stiffness: 100, mass: 1 },
  });

  const x = interpolate(sc, [0, 1], [side === "left" ? -80 : 80, 0]);
  const opacity = interpolate(sc, [0, 0.3], [0, 1]);

  const isLeft = side === "left";

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        [isLeft ? "left" : "right"]: -14,
        transform: `translateY(-50%) translateX(${x}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {[0, 1, 2].map((i) => {
        const floatOffset =
          Math.sin(((frame + i * 12) * 0.04) % (Math.PI * 2)) * 5;
        return (
          <svg
            key={i}
            width={28}
            height={52}
            viewBox="0 0 28 52"
            style={{ transform: `translateY(${floatOffset}px)` }}
          >
            <defs>
              <linearGradient
                id={`ribbon${side}${i}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor={isLeft ? GOLD : GOLD_DARK}
                />
                <stop offset="50%" stopColor={GOLD_BRIGHT} />
                <stop
                  offset="100%"
                  stopColor={isLeft ? GOLD_DARK : GOLD}
                />
              </linearGradient>
            </defs>
            {/* Ribbon body */}
            <rect
              x={2}
              y={0}
              width={24}
              height={42}
              rx={3}
              fill={`url(#ribbon${side}${i})`}
              opacity={0.88}
            />
            {/* Ribbon notch at bottom */}
            <polygon
              points="2,42 14,52 26,42"
              fill={`url(#ribbon${side}${i})`}
              opacity={0.88}
            />
            {/* Highlight stripe */}
            <rect
              x={6}
              y={5}
              width={5}
              height={30}
              rx={2}
              fill={WHITE}
              opacity={0.25}
            />
          </svg>
        );
      })}
    </div>
  );
};

// ─── Main Certificate ────────────────────────────────────────────────────────
const CertificateDocument: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Main certificate scale + fade spring
  const entrySc = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 1 },
  });
  const certScale = interpolate(entrySc, [0, 1], [0.72, 1]);
  const certOpacity = interpolate(entrySc, [0, 0.25], [0, 1]);

  // Global fade out at end
  const fadeOut = interpolate(frame, [140, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const certW = 820;
  const certH = 580;

  // Award title slide in
  const titleOpacity = interpolate(frame, [28, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [28, 50], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Subtitle / presented-to line
  const subOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Award subtitle (below name)
  const awardSubOpacity = interpolate(frame, [108, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Issuer line
  const issuerOpacity = interpolate(frame, [122, 138], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: certOpacity * fadeOut,
      }}
    >
      {/* Certificate document */}
      <div
        style={{
          position: "relative",
          width: certW,
          height: certH,
          transform: `scale(${certScale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Parchment background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 6,
            background: `linear-gradient(160deg, ${CREAM} 0%, ${PARCHMENT} 45%, ${CREAM_WARM} 100%)`,
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.55), 0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        />

        {/* Watermark background seal */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 260,
            height: 260,
            borderRadius: "50%",
            border: `2px solid ${GOLD}`,
            opacity: 0.06,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: `1px solid ${GOLD}`,
            opacity: 0.04,
          }}
        />

        {/* Animated SVG border */}
        <CertificateBorder frame={frame} width={certW} height={certH} />

        {/* Ribbon ornaments */}
        <RibbonBanner frame={frame} side="left" delay={72} />
        <RibbonBanner frame={frame} side="right" delay={78} />

        {/* Content layout */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "52px 80px 52px",
            gap: 0,
          }}
        >
          {/* Award title */}
          <div
            style={{
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 11,
                letterSpacing: 5,
                color: GOLD_DARK,
                textTransform: "uppercase",
                fontWeight: "600",
              }}
            >
              {ISSUER}
            </div>
            <div style={{ height: 10 }} />
            <div
              style={{
                fontFamily:
                  "Georgia, 'Palatino Linotype', 'Times New Roman', serif",
                fontSize: 38,
                color: NAVY,
                fontWeight: "700",
                letterSpacing: 2,
                textAlign: "center",
                lineHeight: 1.15,
              }}
            >
              {AWARD_TITLE}
            </div>
          </div>

          <div style={{ height: 12 }} />
          <DividerLine frame={frame} delay={42} width={460} />
          <div style={{ height: 10 }} />

          {/* "This is presented to" line */}
          <div
            style={{
              opacity: subOpacity,
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 13,
              letterSpacing: 3.5,
              color: "#7A6A50",
              textTransform: "uppercase",
              fontWeight: "500",
            }}
          >
            This Certificate is Proudly Presented to
          </div>

          <div style={{ height: 10 }} />

          {/* Typewriter name */}
          <TypewriterName frame={frame} />

          <div style={{ height: 6 }} />
          <DividerLine frame={frame} delay={100} width={360} color={GOLD_DARK} />
          <div style={{ height: 10 }} />

          {/* Award subtitle */}
          <div
            style={{
              opacity: awardSubOpacity,
              fontFamily: "Georgia, serif",
              fontSize: 17,
              color: NAVY_LIGHT,
              fontStyle: "italic",
              letterSpacing: 0.5,
              textAlign: "center",
            }}
          >
            {AWARD_SUBTITLE}
          </div>

          <div style={{ height: 8 }} />

          {/* Issuer */}
          <div
            style={{
              opacity: issuerOpacity,
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 12,
              letterSpacing: 2.5,
              color: "#9A8A6A",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            for outstanding achievement and dedication to the field
          </div>

          <div style={{ flex: 1 }} />

          {/* Signatories */}
          <Signatories frame={frame} />
        </div>

        {/* Seal */}
        <Seal frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Shimmer Overlay ─────────────────────────────────────────────────────────
const ShimmerOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  // A single diagonal light sweep across the certificate at frame ~105
  const sweepProgress = interpolate(frame, [100, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const sweepX = interpolate(sweepProgress, [0, 1], [-200, 1480]);
  const sweepOpacity = interpolate(
    sweepProgress,
    [0, 0.15, 0.85, 1],
    [0, 0.35, 0.35, 0]
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: sweepX,
          width: 160,
          height: "100%",
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,${sweepOpacity}), transparent)`,
          transform: "skewX(-18deg)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const RemotionCertificateReveal: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#07102A" }}>
      <Background frame={frame} />
      <CertificateDocument frame={frame} />
      <ShimmerOverlay frame={frame} />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ───────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-certificate-reveal"
    component={RemotionCertificateReveal}
    durationInFrames={DURATION_FRAMES}
    fps={30}
    width={1280}
    height={720}
  />
);
