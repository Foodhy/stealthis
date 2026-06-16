import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Config ─────────────────────────────────────────────────────────────────
const BG_COLOR = "#0a0a0f";
const CHART_TITLE = "Revenue by Product Line";
const CHART_SUBTITLE = "Fiscal Year 2025  ·  Total $4.82M";
const STAGGER = 15; // frames between each segment reveal
const DONUT_OUTER_R = 210;
const DONUT_INNER_R = 110;
const SVG_SIZE = 500;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;

// ── Data ──────────────────────────────────────────────────────────────────
interface SliceDatum {
  label: string;
  value: number; // dollars in thousands
  color: string;
}

const DATA: SliceDatum[] = [
  { label: "CloudCore",    value: 1380, color: "#6366f1" },
  { label: "DataBridge",   value:  960, color: "#06b6d4" },
  { label: "EdgeSync",     value:  740, color: "#10b981" },
  { label: "VaultAPI",     value:  620, color: "#f59e0b" },
  { label: "NovaSuite",    value:  720, color: "#8b5cf6" },
  { label: "StreamKit",    value:  400, color: "#ef4444" },
];

const TOTAL = DATA.reduce((s, d) => s + d.value, 0);

// Precompute start/end angles (in degrees, 0 = top, clockwise)
interface SliceAngles {
  startDeg: number;
  endDeg: number;
  midDeg: number;
  pct: number;
}

const sliceAngles: SliceAngles[] = (() => {
  let cursor = -90; // start at 12-o'clock
  return DATA.map((d) => {
    const sweep = (d.value / TOTAL) * 360;
    const startDeg = cursor;
    const endDeg = cursor + sweep;
    const midDeg = cursor + sweep / 2;
    cursor = endDeg;
    return { startDeg, endDeg, midDeg, pct: d.value / TOTAL };
  });
})();

// ── Helpers ───────────────────────────────────────────────────────────────
const toRad = (deg: number) => (deg * Math.PI) / 180;

const polarToXY = (cx: number, cy: number, r: number, deg: number) => ({
  x: cx + r * Math.cos(toRad(deg)),
  y: cy + r * Math.sin(toRad(deg)),
});

/** SVG arc path for a donut slice, drawn from startDeg to startDeg + sweepDeg */
const arcPath = (
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startDeg: number,
  sweepDeg: number
): string => {
  if (sweepDeg <= 0) return "";
  const clampedSweep = Math.min(sweepDeg, 359.9999);
  const endDeg = startDeg + clampedSweep;
  const largeArc = clampedSweep > 180 ? 1 : 0;

  const o1 = polarToXY(cx, cy, outerR, startDeg);
  const o2 = polarToXY(cx, cy, outerR, endDeg);
  const i1 = polarToXY(cx, cy, innerR, endDeg);
  const i2 = polarToXY(cx, cy, innerR, startDeg);

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
};

// ── Segment component ─────────────────────────────────────────────────────
interface SegmentProps {
  datum: SliceDatum;
  angles: SliceAngles;
  index: number;
  frame: number;
  fps: number;
}

const Segment: React.FC<SegmentProps> = ({ datum, angles, index, frame, fps }) => {
  const delay = 20 + index * STAGGER;
  const f = Math.max(0, frame - delay);

  // Spring-driven sweep from 0 → full slice angle
  const fullSweep = angles.endDeg - angles.startDeg;

  const progress = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 120, mass: 0.6 },
  });

  const sweepDeg = progress * fullSweep;

  // Percentage label appears after segment is mostly drawn
  const labelDelay = delay + 18;
  const labelOpacity = interpolate(frame, [labelDelay, labelDelay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const labelScale = interpolate(frame, [labelDelay, labelDelay + 12], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });

  // Position percentage label at midpoint, slightly outside ring
  const labelR = DONUT_OUTER_R + 30;
  const labelPos = polarToXY(CX, CY, labelR, angles.midDeg);

  const pctText = `${Math.round(angles.pct * 100)}%`;

  return (
    <g>
      {/* Glow behind slice */}
      <path
        d={arcPath(CX, CY, DONUT_OUTER_R + 8, DONUT_INNER_R - 8, angles.startDeg, sweepDeg)}
        fill={datum.color}
        opacity={0.18}
        filter="url(#sliceGlow)"
      />

      {/* Main donut slice */}
      <path
        d={arcPath(CX, CY, DONUT_OUTER_R, DONUT_INNER_R, angles.startDeg, sweepDeg)}
        fill={datum.color}
        opacity={0.95}
      />

      {/* Percentage label */}
      {sweepDeg > 10 && (
        <text
          x={labelPos.x}
          y={labelPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={datum.color}
          fontSize={15}
          fontWeight={700}
          fontFamily="system-ui, -apple-system, sans-serif"
          opacity={labelOpacity}
          style={{ transform: `scale(${labelScale})`, transformOrigin: `${labelPos.x}px ${labelPos.y}px` }}
        >
          {pctText}
        </text>
      )}
    </g>
  );
};

// ── Center label (counting total) ────────────────────────────────────────
interface CenterLabelProps {
  frame: number;
  fps: number;
}

const CenterLabel: React.FC<CenterLabelProps> = ({ frame, fps }) => {
  // Appears when first segment starts, counts up over the reveal window
  const startFrame = 20;
  const endFrame = 20 + DATA.length * STAGGER + 30;
  const f = Math.max(0, frame - startFrame);

  const countProgress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const displayValue = (countProgress * TOTAL) / 1000; // in millions
  const opacity = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 130 },
  });

  return (
    <g opacity={opacity}>
      <text
        x={CX}
        y={CY - 14}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={36}
        fontWeight={700}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ${displayValue.toFixed(2)}M
      </text>
      <text
        x={CX}
        y={CY + 18}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.45)"
        fontSize={13}
        fontWeight={500}
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing={1}
      >
        TOTAL REVENUE
      </text>
    </g>
  );
};

// ── Legend ─────────────────────────────────────────────────────────────────
interface LegendProps {
  frame: number;
  fps: number;
}

const Legend: React.FC<LegendProps> = ({ frame, fps }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 18,
        paddingLeft: 32,
      }}
    >
      {DATA.map((d, i) => {
        const delay = 30 + i * STAGGER;
        const f = Math.max(0, frame - delay);

        const slideX = interpolate(f, [0, 20], [-28, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const opacity = interpolate(f, [0, 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const valueOpacity = interpolate(frame, [delay + 20, delay + 35], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const pctDisplay = `${Math.round((d.value / TOTAL) * 100)}%`;
        const valDisplay = `$${(d.value / 1000).toFixed(2)}M`;

        return (
          <div
            key={d.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity,
              transform: `translateX(${slideX}px)`,
            }}
          >
            {/* Color dot */}
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: d.color,
                flexShrink: 0,
                boxShadow: `0 0 8px ${d.color}`,
              }}
            />

            {/* Name */}
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: "rgba(255,255,255,0.9)",
                minWidth: 100,
              }}
            >
              {d.label}
            </span>

            {/* Value + pct */}
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: d.color,
                opacity: valueOpacity,
                letterSpacing: 0.5,
              }}
            >
              {valDisplay} · {pctDisplay}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────────
export const PieReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title fade-in
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 18], [-12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Subtitle
  const subtitleOpacity = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR, overflow: "hidden" }}>

      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "38%",
          width: 680,
          height: 680,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "72%",
          width: 400,
          height: 400,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 64,
          right: 64,
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 30,
            color: "#ffffff",
            letterSpacing: -0.5,
          }}
        >
          {CHART_TITLE}
        </div>
        <div
          style={{
            opacity: subtitleOpacity,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "rgba(255,255,255,0.40)",
            marginTop: 4,
            letterSpacing: 0.3,
          }}
        >
          {CHART_SUBTITLE}
        </div>
      </div>

      {/* Body: chart + legend side by side */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          bottom: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Donut SVG */}
        <svg
          width={SVG_SIZE}
          height={SVG_SIZE}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          style={{ flexShrink: 0 }}
        >
          <defs>
            <filter id="sliceGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track ring (subtle) */}
          <circle
            cx={CX}
            cy={CY}
            r={(DONUT_OUTER_R + DONUT_INNER_R) / 2}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={DONUT_OUTER_R - DONUT_INNER_R}
          />

          {/* Segments */}
          {DATA.map((d, i) => (
            <Segment
              key={d.label}
              datum={d}
              angles={sliceAngles[i]}
              index={i}
              frame={frame}
              fps={fps}
            />
          ))}

          {/* Center label */}
          <CenterLabel frame={frame} fps={fps} />
        </svg>

        {/* Legend */}
        <Legend frame={frame} fps={fps} />
      </div>

      {/* Bottom divider line */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 64,
          right: 64,
          height: 1,
          background: "rgba(255,255,255,0.06)",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="PieReveal"
    component={PieReveal}
    durationInFrames={150}
    fps={30}
    width={1280}
    height={720}
  />
);
