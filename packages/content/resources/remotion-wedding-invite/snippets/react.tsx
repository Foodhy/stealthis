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

// ── Palette & constants ───────────────────────────────────────────────────────
const CREAM = "#fdf6ee";
const IVORY = "#f9f0e3";
const DUSTY_ROSE = "#c9877a";
const DUSTY_ROSE_LIGHT = "#e8b4ac";
const DUSTY_ROSE_DEEP = "#a05f55";
const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e8d08a";
const GOLD_DEEP = "#9a6f22";
const SAGE = "#8aad8a";
const SAGE_LIGHT = "#b3c9b3";
const TEXT_DARK = "#3d2b1f";
const TEXT_MID = "#7a5c4a";
const TEXT_LIGHT = "#b09480";

const BRIDE_NAME = "Isabella";
const GROOM_NAME = "Sebastian";
const WEDDING_DATE = "September 14, 2026";
const WEDDING_DAY = "Saturday";
const VENUE_NAME = "Villa Rosa Gardens";
const VENUE_CITY = "Tuscany, Italy";
const CEREMONY_TIME = "4:30 in the afternoon";
const INVITE_LINE = "Together with their families";
const REQUEST_LINE = "request the honour of your presence";

// ── Utility: clamp interpolate ────────────────────────────────────────────────
function interp(
  frame: number,
  input: [number, number],
  output: [number, number],
  easing?: (t: number) => number
) {
  return interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

// ── Background: parchment texture + soft vignette ────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const reveal = interp(frame, [0, 40], [0, 1], Easing.out(Easing.quad));

  return (
    <>
      {/* Base parchment */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(170deg, ${CREAM} 0%, ${IVORY} 40%, #f5ead8 80%, #f0e2cc 100%)`,
          opacity: reveal,
        }}
      />
      {/* Subtle grain overlay via repeating diagonal lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            47deg,
            transparent 0px,
            transparent 18px,
            rgba(160, 120, 80, 0.018) 18px,
            rgba(160, 120, 80, 0.018) 19px
          )`,
          opacity: reveal,
        }}
      />
      {/* Warm center glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 55% at 50% 48%, rgba(255,240,210,0.55) 0%, transparent 80%)`,
          opacity: reveal,
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(120,80,40,0.18) 100%)`,
          opacity: reveal,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── Decorative border that traces itself around the frame ─────────────────────
const TracingBorder: React.FC<{ frame: number }> = ({ frame }) => {
  // Border traces from 0% → 100% over frames 10-70
  const progress = interp(frame, [10, 70], [0, 1], Easing.inOut(Easing.cubic));
  const opacity = interp(frame, [8, 20], [0, 1]);

  // The border is four SVG lines: top, right, bottom, left
  // Total perimeter = 2*(1080+1920) = 6000 but we work in fractional units
  // We'll use a single SVG rect with strokeDasharray trick
  const W = 1080;
  const H = 1920;
  const INSET = 48;
  const rectW = W - INSET * 2;
  const rectH = H - INSET * 2;
  const perimeter = 2 * (rectW + rectH);
  const dashOffset = perimeter * (1 - progress);

  // Inner decorative border (slightly tighter)
  const INSET2 = 62;
  const rect2W = W - INSET2 * 2;
  const rect2H = H - INSET2 * 2;
  const perimeter2 = 2 * (rect2W + rect2H);
  const dash2Offset = perimeter2 * (1 - progress);

  return (
    <svg
      style={{ position: "absolute", inset: 0, opacity }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      {/* Outer gold border */}
      <rect
        x={INSET}
        y={INSET}
        width={rectW}
        height={rectH}
        rx={6}
        ry={6}
        fill="none"
        stroke={GOLD}
        strokeWidth={2.2}
        strokeDasharray={perimeter}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
      {/* Inner rose border (slightly delayed) */}
      <rect
        x={INSET2}
        y={INSET2}
        width={rect2W}
        height={rect2H}
        rx={4}
        ry={4}
        fill="none"
        stroke={DUSTY_ROSE_LIGHT}
        strokeWidth={1.1}
        strokeDasharray={perimeter2}
        strokeDashoffset={dash2Offset}
        strokeLinecap="round"
        opacity={0.7}
      />
      {/* Corner diamond ornaments - appear after border is drawn */}
      {progress > 0.85 &&
        [
          [INSET, INSET],
          [W - INSET, INSET],
          [W - INSET, H - INSET],
          [INSET, H - INSET],
        ].map(([cx, cy], i) => {
          const cornerOpacity = interp(frame, [75 + i * 3, 88 + i * 3], [0, 1]);
          return (
            <g key={i} opacity={cornerOpacity}>
              <polygon
                points={`${cx},${cy - 9} ${cx + 6},${cy} ${cx},${cy + 9} ${cx - 6},${cy}`}
                fill={GOLD}
                opacity={0.85}
              />
              <polygon
                points={`${cx},${cy - 6} ${cx + 4},${cy} ${cx},${cy + 6} ${cx - 4},${cy}`}
                fill={GOLD_LIGHT}
                opacity={0.6}
              />
            </g>
          );
        })}
    </svg>
  );
};

// ── SVG floral branch drawing in from sides ───────────────────────────────────
const FloralLeft: React.FC<{ frame: number }> = ({ frame }) => {
  const drawProgress = interp(
    frame,
    [15, 90],
    [0, 1],
    Easing.inOut(Easing.cubic)
  );
  const opacity = interp(frame, [12, 28], [0, 1]);
  const translateX = spring({
    frame: Math.max(0, frame - 10),
    fps: 30,
    from: -40,
    to: 0,
    config: { damping: 18, stiffness: 80 },
  });

  // Main stem path (SVG path length ~ 420)
  const stemLength = 420;
  const stemDash = stemLength * (1 - drawProgress);

  // Leaves appear progressively
  const leaf1 = interp(frame, [40, 60], [0, 1], Easing.out(Easing.back(1.5)));
  const leaf2 = interp(frame, [52, 72], [0, 1], Easing.out(Easing.back(1.4)));
  const leaf3 = interp(frame, [60, 80], [0, 1], Easing.out(Easing.back(1.3)));
  const leaf4 = interp(frame, [70, 90], [0, 1], Easing.out(Easing.back(1.4)));
  const bloom1 = interp(frame, [65, 85], [0, 1], Easing.out(Easing.back(2)));
  const bloom2 = interp(frame, [78, 98], [0, 1], Easing.out(Easing.back(1.8)));

  return (
    <svg
      style={{
        position: "absolute",
        left: 40,
        top: 180,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
      width={260}
      height={680}
      viewBox="0 0 260 680"
    >
      {/* Main curving stem */}
      <path
        d="M 210 680 C 200 580 160 500 140 420 C 120 340 90 290 70 200 C 55 130 40 80 20 10"
        fill="none"
        stroke={SAGE}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={stemLength}
        strokeDashoffset={stemDash}
      />
      {/* Secondary stem branch */}
      <path
        d="M 140 420 C 165 390 190 360 220 330"
        fill="none"
        stroke={SAGE}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeDasharray="160"
        strokeDashoffset={160 * (1 - interp(frame, [50, 80], [0, 1]))}
      />
      {/* Leaf 1 - large lower left */}
      <g
        transform={`translate(155, 510) rotate(-30) scale(${leaf1})`}
        style={{ transformOrigin: "0 0" }}
      >
        <ellipse cx={0} cy={0} rx={28} ry={12} fill={SAGE} opacity={0.55} />
        <ellipse cx={0} cy={0} rx={26} ry={10} fill={SAGE_LIGHT} opacity={0.4} />
        <line x1={-25} y1={0} x2={22} y2={0} stroke={SAGE} strokeWidth={0.8} opacity={0.6} />
      </g>
      {/* Leaf 2 - mid */}
      <g
        transform={`translate(105, 380) rotate(25) scale(${leaf2})`}
        style={{ transformOrigin: "0 0" }}
      >
        <ellipse cx={0} cy={0} rx={22} ry={9} fill={SAGE} opacity={0.5} />
        <ellipse cx={0} cy={0} rx={20} ry={7} fill={SAGE_LIGHT} opacity={0.35} />
      </g>
      {/* Leaf 3 - upper */}
      <g
        transform={`translate(65, 250) rotate(-20) scale(${leaf3})`}
        style={{ transformOrigin: "0 0" }}
      >
        <ellipse cx={0} cy={0} rx={24} ry={10} fill={SAGE} opacity={0.5} />
        <ellipse cx={0} cy={0} rx={22} ry={8} fill={SAGE_LIGHT} opacity={0.35} />
        <line x1={-20} y1={0} x2={18} y2={0} stroke={SAGE} strokeWidth={0.8} opacity={0.5} />
      </g>
      {/* Leaf 4 - top */}
      <g
        transform={`translate(35, 130) rotate(15) scale(${leaf4})`}
        style={{ transformOrigin: "0 0" }}
      >
        <ellipse cx={0} cy={0} rx={18} ry={7} fill={SAGE} opacity={0.45} />
      </g>
      {/* Bloom 1 - rose flower lower */}
      <g transform={`translate(175, 470) scale(${bloom1})`} style={{ transformOrigin: "0 0" }}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <ellipse
            key={i}
            cx={Math.cos((angle * Math.PI) / 180) * 14}
            cy={Math.sin((angle * Math.PI) / 180) * 14}
            rx={10}
            ry={6}
            fill={DUSTY_ROSE_LIGHT}
            opacity={0.65}
            transform={`rotate(${angle}, ${Math.cos((angle * Math.PI) / 180) * 14}, ${Math.sin((angle * Math.PI) / 180) * 14})`}
          />
        ))}
        <circle cx={0} cy={0} r={7} fill={DUSTY_ROSE} opacity={0.8} />
        <circle cx={0} cy={0} r={4} fill={GOLD_LIGHT} opacity={0.7} />
      </g>
      {/* Bloom 2 - smaller upper */}
      <g transform={`translate(50, 195) scale(${bloom2})`} style={{ transformOrigin: "0 0" }}>
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <ellipse
            key={i}
            cx={Math.cos((angle * Math.PI) / 180) * 10}
            cy={Math.sin((angle * Math.PI) / 180) * 10}
            rx={7}
            ry={4.5}
            fill={DUSTY_ROSE_LIGHT}
            opacity={0.55}
            transform={`rotate(${angle}, ${Math.cos((angle * Math.PI) / 180) * 10}, ${Math.sin((angle * Math.PI) / 180) * 10})`}
          />
        ))}
        <circle cx={0} cy={0} r={5} fill={DUSTY_ROSE} opacity={0.75} />
        <circle cx={0} cy={0} r={2.5} fill={GOLD_LIGHT} opacity={0.65} />
      </g>
      {/* Small buds along stem */}
      {[
        { x: 130, y: 445, r: 4 },
        { x: 80, y: 310, r: 3.5 },
        { x: 55, y: 165, r: 3 },
        { x: 200, y: 340, r: 3.5 },
      ].map((bud, i) => {
        const budOp = interp(frame, [45 + i * 8, 62 + i * 8], [0, 1]);
        return (
          <g key={i} opacity={budOp}>
            <ellipse
              cx={bud.x}
              cy={bud.y}
              rx={bud.r * 1.2}
              ry={bud.r * 0.7}
              fill={DUSTY_ROSE}
              opacity={0.5}
            />
            <circle cx={bud.x} cy={bud.y} r={bud.r * 0.5} fill={GOLD} opacity={0.4} />
          </g>
        );
      })}
    </svg>
  );
};

const FloralRight: React.FC<{ frame: number }> = ({ frame }) => {
  const drawProgress = interp(
    frame,
    [20, 95],
    [0, 1],
    Easing.inOut(Easing.cubic)
  );
  const opacity = interp(frame, [17, 32], [0, 1]);
  const translateX = spring({
    frame: Math.max(0, frame - 15),
    fps: 30,
    from: 40,
    to: 0,
    config: { damping: 18, stiffness: 80 },
  });

  const stemLength = 440;
  const stemDash = stemLength * (1 - drawProgress);

  const leaf1 = interp(frame, [45, 65], [0, 1], Easing.out(Easing.back(1.5)));
  const leaf2 = interp(frame, [55, 75], [0, 1], Easing.out(Easing.back(1.4)));
  const leaf3 = interp(frame, [65, 85], [0, 1], Easing.out(Easing.back(1.3)));
  const bloom1 = interp(frame, [70, 92], [0, 1], Easing.out(Easing.back(1.9)));
  const bloom2 = interp(frame, [85, 108], [0, 1], Easing.out(Easing.back(1.7)));

  return (
    <svg
      style={{
        position: "absolute",
        right: 40,
        top: 200,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
      width={260}
      height={680}
      viewBox="0 0 260 680"
    >
      {/* Mirror of left stem */}
      <path
        d="M 50 680 C 60 580 100 500 120 420 C 140 340 170 290 190 200 C 205 130 220 80 240 10"
        fill="none"
        stroke={SAGE}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={stemLength}
        strokeDashoffset={stemDash}
      />
      {/* Secondary branch */}
      <path
        d="M 120 420 C 95 390 70 360 40 330"
        fill="none"
        stroke={SAGE}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeDasharray="160"
        strokeDashoffset={160 * (1 - interp(frame, [55, 85], [0, 1]))}
      />
      {/* Leaves */}
      <g
        transform={`translate(105, 510) rotate(30) scale(${leaf1})`}
        style={{ transformOrigin: "0 0" }}
      >
        <ellipse cx={0} cy={0} rx={28} ry={12} fill={SAGE} opacity={0.55} />
        <ellipse cx={0} cy={0} rx={26} ry={10} fill={SAGE_LIGHT} opacity={0.4} />
        <line x1={-25} y1={0} x2={22} y2={0} stroke={SAGE} strokeWidth={0.8} opacity={0.6} />
      </g>
      <g
        transform={`translate(155, 375) rotate(-25) scale(${leaf2})`}
        style={{ transformOrigin: "0 0" }}
      >
        <ellipse cx={0} cy={0} rx={24} ry={10} fill={SAGE} opacity={0.5} />
        <ellipse cx={0} cy={0} rx={22} ry={8} fill={SAGE_LIGHT} opacity={0.35} />
      </g>
      <g
        transform={`translate(195, 240) rotate(18) scale(${leaf3})`}
        style={{ transformOrigin: "0 0" }}
      >
        <ellipse cx={0} cy={0} rx={22} ry={9} fill={SAGE} opacity={0.5} />
        <ellipse cx={0} cy={0} rx={20} ry={7} fill={SAGE_LIGHT} opacity={0.35} />
      </g>
      {/* Blooms */}
      <g transform={`translate(90, 470) scale(${bloom1})`} style={{ transformOrigin: "0 0" }}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <ellipse
            key={i}
            cx={Math.cos((angle * Math.PI) / 180) * 15}
            cy={Math.sin((angle * Math.PI) / 180) * 15}
            rx={11}
            ry={6.5}
            fill={DUSTY_ROSE_LIGHT}
            opacity={0.65}
            transform={`rotate(${angle + 15}, ${Math.cos((angle * Math.PI) / 180) * 15}, ${Math.sin((angle * Math.PI) / 180) * 15})`}
          />
        ))}
        <circle cx={0} cy={0} r={7.5} fill={DUSTY_ROSE} opacity={0.8} />
        <circle cx={0} cy={0} r={4} fill={GOLD_LIGHT} opacity={0.7} />
      </g>
      <g transform={`translate(210, 195) scale(${bloom2})`} style={{ transformOrigin: "0 0" }}>
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <ellipse
            key={i}
            cx={Math.cos((angle * Math.PI) / 180) * 10}
            cy={Math.sin((angle * Math.PI) / 180) * 10}
            rx={7}
            ry={4}
            fill={DUSTY_ROSE_LIGHT}
            opacity={0.55}
            transform={`rotate(${angle + 10}, ${Math.cos((angle * Math.PI) / 180) * 10}, ${Math.sin((angle * Math.PI) / 180) * 10})`}
          />
        ))}
        <circle cx={0} cy={0} r={5} fill={DUSTY_ROSE} opacity={0.75} />
        <circle cx={0} cy={0} r={2.5} fill={GOLD_LIGHT} opacity={0.65} />
      </g>
      {/* Buds */}
      {[
        { x: 130, y: 440, r: 4 },
        { x: 175, y: 305, r: 3.5 },
        { x: 55, y: 340, r: 3 },
      ].map((bud, i) => {
        const budOp = interp(frame, [48 + i * 8, 65 + i * 8], [0, 1]);
        return (
          <g key={i} opacity={budOp}>
            <ellipse
              cx={bud.x}
              cy={bud.y}
              rx={bud.r * 1.2}
              ry={bud.r * 0.7}
              fill={DUSTY_ROSE}
              opacity={0.5}
            />
            <circle cx={bud.x} cy={bud.y} r={bud.r * 0.5} fill={GOLD} opacity={0.4} />
          </g>
        );
      })}
    </svg>
  );
};

// ── Top floral crown (center top) ─────────────────────────────────────────────
const FloralCrown: React.FC<{ frame: number }> = ({ frame }) => {
  const drawProgress = interp(frame, [25, 80], [0, 1], Easing.inOut(Easing.cubic));
  const opacity = interp(frame, [22, 40], [0, 1]);

  const centerArcLength = 600;
  const arcDash = centerArcLength * (1 - drawProgress);

  const bloom = (delay: number) =>
    interp(frame, [delay, delay + 22], [0, 1], Easing.out(Easing.back(2)));

  return (
    <svg
      style={{
        position: "absolute",
        top: 88,
        left: "50%",
        transform: "translateX(-50%)",
        opacity,
      }}
      width={600}
      height={200}
      viewBox="0 0 600 200"
    >
      {/* Horizontal vine arc */}
      <path
        d="M 30 140 C 80 100 150 80 200 90 C 250 100 280 85 300 80 C 320 75 350 95 400 90 C 450 85 520 100 570 140"
        fill="none"
        stroke={SAGE}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeDasharray={centerArcLength}
        strokeDashoffset={arcDash}
      />
      {/* Shorter inner arc */}
      <path
        d="M 100 145 C 150 118 220 108 300 104 C 380 100 450 112 500 140"
        fill="none"
        stroke={SAGE_LIGHT}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeDasharray="420"
        strokeDashoffset={420 * (1 - interp(frame, [30, 85], [0, 1]))}
        opacity={0.6}
      />
      {/* Central large bloom */}
      <g transform={`translate(300, 72) scale(${bloom(62)})`} style={{ transformOrigin: "0 0" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <ellipse
            key={i}
            cx={Math.cos((angle * Math.PI) / 180) * 18}
            cy={Math.sin((angle * Math.PI) / 180) * 18}
            rx={14}
            ry={7}
            fill={i % 2 === 0 ? DUSTY_ROSE_LIGHT : "#f2c8c2"}
            opacity={0.7}
            transform={`rotate(${angle}, ${Math.cos((angle * Math.PI) / 180) * 18}, ${Math.sin((angle * Math.PI) / 180) * 18})`}
          />
        ))}
        <circle cx={0} cy={0} r={9} fill={DUSTY_ROSE} opacity={0.85} />
        <circle cx={0} cy={0} r={5} fill={GOLD} opacity={0.75} />
      </g>
      {/* Side blooms */}
      {[
        { x: 165, y: 82, scale: bloom(68), petals: 5, size: 11 },
        { x: 435, y: 82, scale: bloom(72), petals: 5, size: 11 },
        { x: 80, y: 118, scale: bloom(75), petals: 5, size: 8 },
        { x: 520, y: 118, scale: bloom(78), petals: 5, size: 8 },
      ].map((b, idx) => (
        <g
          key={idx}
          transform={`translate(${b.x}, ${b.y}) scale(${b.scale})`}
          style={{ transformOrigin: "0 0" }}
        >
          {Array.from({ length: b.petals }).map((_, i) => {
            const angle = (i / b.petals) * 360;
            return (
              <ellipse
                key={i}
                cx={Math.cos((angle * Math.PI) / 180) * b.size}
                cy={Math.sin((angle * Math.PI) / 180) * b.size}
                rx={b.size * 0.85}
                ry={b.size * 0.45}
                fill={DUSTY_ROSE_LIGHT}
                opacity={0.6}
                transform={`rotate(${angle}, ${Math.cos((angle * Math.PI) / 180) * b.size}, ${Math.sin((angle * Math.PI) / 180) * b.size})`}
              />
            );
          })}
          <circle cx={0} cy={0} r={b.size * 0.45} fill={DUSTY_ROSE} opacity={0.8} />
          <circle cx={0} cy={0} r={b.size * 0.22} fill={GOLD_LIGHT} opacity={0.7} />
        </g>
      ))}
      {/* Scattered leaves along vine */}
      {[
        { x: 130, y: 105, rot: 30, rx: 16, ry: 6 },
        { x: 240, y: 90, rot: -20, rx: 14, ry: 5.5 },
        { x: 360, y: 90, rot: 22, rx: 14, ry: 5.5 },
        { x: 470, y: 105, rot: -28, rx: 16, ry: 6 },
      ].map((l, i) => {
        const leafOp = interp(frame, [40 + i * 6, 58 + i * 6], [0, 1]);
        return (
          <ellipse
            key={i}
            cx={l.x}
            cy={l.y}
            rx={l.rx}
            ry={l.ry}
            fill={SAGE}
            opacity={leafOp * 0.55}
            transform={`rotate(${l.rot}, ${l.x}, ${l.y})`}
          />
        );
      })}
    </svg>
  );
};

// ── Gold divider ornament ─────────────────────────────────────────────────────
const GoldDivider: React.FC<{ frame: number; startFrame: number; y?: number }> = ({
  frame,
  startFrame,
  y = 0,
}) => {
  const progress = interp(
    frame,
    [startFrame, startFrame + 30],
    [0, 1],
    Easing.out(Easing.cubic)
  );
  const opacity = interp(frame, [startFrame, startFrame + 12], [0, 1]);
  const lineLength = 280;
  const lineDash = lineLength * (1 - progress);

  return (
    <svg
      style={{ position: "absolute", left: "50%", top: y, transform: "translateX(-50%)", opacity }}
      width={600}
      height={30}
      viewBox="0 0 600 30"
    >
      {/* Left line */}
      <line
        x1={300}
        y1={15}
        x2={300 - lineLength * progress}
        y2={15}
        stroke={GOLD}
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.7}
      />
      {/* Right line */}
      <line
        x1={300}
        y1={15}
        x2={300 + lineLength * progress}
        y2={15}
        stroke={GOLD}
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.7}
      />
      {/* Center diamond */}
      <g opacity={progress}>
        <polygon
          points="300,6 308,15 300,24 292,15"
          fill={GOLD}
          opacity={0.8}
        />
        <polygon
          points="300,10 305,15 300,20 295,15"
          fill={GOLD_LIGHT}
          opacity={0.6}
        />
      </g>
      {/* Side decorations */}
      <g opacity={interp(frame, [startFrame + 20, startFrame + 35], [0, 1])}>
        <circle cx={300 - lineLength + 8} cy={15} r={3} fill={GOLD} opacity={0.6} />
        <circle cx={300 + lineLength - 8} cy={15} r={3} fill={GOLD} opacity={0.6} />
        <circle cx={300 - lineLength * 0.5} cy={15} r={2} fill={GOLD} opacity={0.45} />
        <circle cx={300 + lineLength * 0.5} cy={15} r={2} fill={GOLD} opacity={0.45} />
      </g>
    </svg>
  );
};

// ── Typography: announcement line ─────────────────────────────────────────────
const AnnouncementLine: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interp(frame, [40, 62], [0, 1], Easing.out(Easing.quad));
  const translateY = spring({
    frame: Math.max(0, frame - 40),
    fps: 30,
    from: 16,
    to: 0,
    config: { damping: 18, stiffness: 100 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 310,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 28,
          fontWeight: 400,
          color: TEXT_MID,
          letterSpacing: 3.5,
          textTransform: "uppercase",
        }}
      >
        {INVITE_LINE}
      </div>
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 26,
          fontWeight: 400,
          color: TEXT_LIGHT,
          letterSpacing: 2,
          marginTop: 6,
          fontStyle: "italic",
        }}
      >
        {REQUEST_LINE}
      </div>
    </div>
  );
};

// ── Main names ────────────────────────────────────────────────────────────────
const CoupleNames: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const brideDelay = 72;
  const groomDelay = 100;
  const ampersandDelay = 90;

  const brideOpacity = interp(frame, [brideDelay, brideDelay + 20], [0, 1]);
  const groomOpacity = interp(frame, [groomDelay, groomDelay + 20], [0, 1]);
  const ampOpacity = interp(frame, [ampersandDelay, ampersandDelay + 18], [0, 1]);
  const ampScale = spring({
    frame: Math.max(0, frame - ampersandDelay),
    fps,
    from: 0.4,
    to: 1,
    config: { damping: 11, stiffness: 120 },
  });

  const brideTranslate = spring({
    frame: Math.max(0, frame - brideDelay),
    fps,
    from: -30,
    to: 0,
    config: { damping: 16, stiffness: 90 },
  });
  const groomTranslate = spring({
    frame: Math.max(0, frame - groomDelay),
    fps,
    from: 30,
    to: 0,
    config: { damping: 16, stiffness: 90 },
  });

  // Subtle shimmer on names
  const shimmer = interp(
    frame,
    [90, 130, 150],
    [0, 0.12, 0],
    Easing.inOut(Easing.sin)
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 760,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Bride name */}
      <div
        style={{
          opacity: brideOpacity,
          transform: `translateX(${brideTranslate}px)`,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 118,
          fontWeight: 400,
          fontStyle: "italic",
          color: TEXT_DARK,
          letterSpacing: -1,
          lineHeight: 1.05,
          textShadow: shimmer > 0
            ? `0 0 ${shimmer * 100}px ${GOLD}88`
            : "none",
        }}
      >
        {BRIDE_NAME}
      </div>

      {/* Ampersand */}
      <div
        style={{
          opacity: ampOpacity,
          transform: `scale(${ampScale})`,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 86,
          fontWeight: 400,
          fontStyle: "italic",
          color: DUSTY_ROSE,
          lineHeight: 0.9,
          margin: "4px 0",
        }}
      >
        &amp;
      </div>

      {/* Groom name */}
      <div
        style={{
          opacity: groomOpacity,
          transform: `translateX(${groomTranslate}px)`,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 118,
          fontWeight: 400,
          fontStyle: "italic",
          color: TEXT_DARK,
          letterSpacing: -1,
          lineHeight: 1.05,
          textShadow: shimmer > 0
            ? `0 0 ${shimmer * 100}px ${GOLD}88`
            : "none",
        }}
      >
        {GROOM_NAME}
      </div>
    </div>
  );
};

// ── Date & venue block ────────────────────────────────────────────────────────
const DateVenueBlock: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const blockDelay = 118;
  const blockOpacity = interp(frame, [blockDelay, blockDelay + 22], [0, 1]);
  const blockTranslate = spring({
    frame: Math.max(0, frame - blockDelay),
    fps,
    from: 20,
    to: 0,
    config: { damping: 16, stiffness: 90 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 1240,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        opacity: blockOpacity,
        transform: `translateY(${blockTranslate}px)`,
      }}
    >
      {/* Day of week */}
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 22,
          fontWeight: 400,
          color: TEXT_LIGHT,
          letterSpacing: 6,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {WEDDING_DAY}
      </div>
      {/* Date */}
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 44,
          fontWeight: 400,
          color: TEXT_DARK,
          letterSpacing: 1.5,
          lineHeight: 1.1,
        }}
      >
        {WEDDING_DATE}
      </div>
      {/* Time */}
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 24,
          fontWeight: 400,
          fontStyle: "italic",
          color: TEXT_MID,
          letterSpacing: 1,
          marginTop: 8,
        }}
      >
        {CEREMONY_TIME}
      </div>
    </div>
  );
};

const VenueBlock: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const blockDelay = 130;
  const blockOpacity = interp(frame, [blockDelay, blockDelay + 22], [0, 1]);
  const blockTranslate = spring({
    frame: Math.max(0, frame - blockDelay),
    fps,
    from: 20,
    to: 0,
    config: { damping: 16, stiffness: 90 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 1440,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: blockOpacity,
        transform: `translateY(${blockTranslate}px)`,
      }}
    >
      {/* Venue name */}
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 38,
          fontWeight: 400,
          color: TEXT_DARK,
          letterSpacing: 0.5,
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        {VENUE_NAME}
      </div>
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 26,
          fontWeight: 400,
          fontStyle: "italic",
          color: TEXT_MID,
          letterSpacing: 2,
          marginTop: 6,
        }}
      >
        {VENUE_CITY}
      </div>
    </div>
  );
};

// ── Rose petal confetti ────────────────────────────────────────────────────────
type PetalData = {
  id: number;
  startX: number;
  startY: number;
  size: number;
  speed: number;
  sway: number;
  swayFreq: number;
  rotSpeed: number;
  delay: number;
  color: string;
};

const PETAL_COUNT = 38;

const seededRandom = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

const PETALS: PetalData[] = Array.from({ length: PETAL_COUNT }, (_, i) => {
  const r1 = seededRandom(i * 7);
  const r2 = seededRandom(i * 7 + 1);
  const r3 = seededRandom(i * 7 + 2);
  const r4 = seededRandom(i * 7 + 3);
  const r5 = seededRandom(i * 7 + 4);
  const r6 = seededRandom(i * 7 + 5);
  const colors = [DUSTY_ROSE_LIGHT, DUSTY_ROSE, "#f2c8c2", "#e8d0c8", GOLD_LIGHT, "#fce4e0"];
  return {
    id: i,
    startX: r1 * 1080,
    startY: -20 - r2 * 80,
    size: 14 + r3 * 22,
    speed: 180 + r4 * 280,
    sway: 40 + r5 * 80,
    swayFreq: 0.8 + r6 * 1.4,
    rotSpeed: 60 + seededRandom(i * 7 + 6) * 200,
    delay: 140 + Math.floor(seededRandom(i * 13) * 30),
    color: colors[Math.floor(seededRandom(i * 11) * colors.length)],
  };
});

const RosePetalConfetti: React.FC<{ frame: number }> = ({ frame }) => {
  const containerOpacity = interp(frame, [138, 150], [0, 1]);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: containerOpacity, pointerEvents: "none" }}>
      {PETALS.map((petal) => {
        const localFrame = frame - petal.delay;
        if (localFrame <= 0) return null;

        const fallT = localFrame / 30; // seconds
        const fallDist = fallT * (petal.speed / 6);
        const y = petal.startY + fallDist;
        const x =
          petal.startX +
          Math.sin(fallT * petal.swayFreq * Math.PI) * petal.sway;
        const rotation = fallT * petal.rotSpeed;
        const opacity = Math.min(1, localFrame / 12) * (1 - Math.max(0, (y - 1800) / 200));

        if (y > 2000 || opacity <= 0) return null;

        return (
          <div
            key={petal.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: petal.size,
              height: petal.size * 0.65,
              background: petal.color,
              borderRadius: "50% 30% 50% 30%",
              transform: `rotate(${rotation}deg)`,
              opacity: opacity * 0.75,
              boxShadow: `0 1px 4px rgba(120,60,50,0.12)`,
            }}
          />
        );
      })}
    </div>
  );
};

// ── Bottom footer text ────────────────────────────────────────────────────────
const FooterText: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interp(frame, [140, 158], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 110,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 20,
          fontWeight: 400,
          fontStyle: "italic",
          color: TEXT_LIGHT,
          letterSpacing: 2,
        }}
      >
        Reception to follow
      </div>
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 16,
          fontWeight: 400,
          color: TEXT_LIGHT,
          letterSpacing: 3,
          marginTop: 6,
          opacity: 0.7,
          textTransform: "uppercase",
        }}
      >
        Black tie preferred
      </div>
    </div>
  );
};

// ── Main composition component ────────────────────────────────────────────────
export const RemotionWeddingInvite: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out in the last 15 frames
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle "breathing" scale on the whole composition
  const breathe = interpolate(
    frame,
    [0, 90, 180],
    [1, 1.008, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CREAM,
        opacity: globalOpacity,
        overflow: "hidden",
        transform: `scale(${breathe})`,
      }}
    >
      {/* Layer 1: Parchment background */}
      <Background frame={frame} />

      {/* Layer 2: Decorative tracing border */}
      <TracingBorder frame={frame} />

      {/* Layer 3: Floral botanicals */}
      <FloralLeft frame={frame} />
      <FloralRight frame={frame} />
      <FloralCrown frame={frame} />

      {/* Layer 4: Announcement copy */}
      <AnnouncementLine frame={frame} />

      {/* Layer 5: Gold divider top */}
      <Sequence from={60}>
        <GoldDivider frame={frame} startFrame={60} y={714} />
      </Sequence>

      {/* Layer 6: Couple names */}
      <CoupleNames frame={frame} fps={fps} />

      {/* Layer 7: Gold divider middle */}
      <Sequence from={112}>
        <GoldDivider frame={frame} startFrame={112} y={1198} />
      </Sequence>

      {/* Layer 8: Date + venue */}
      <DateVenueBlock frame={frame} fps={fps} />
      <VenueBlock frame={frame} fps={fps} />

      {/* Layer 9: Gold divider bottom */}
      <Sequence from={140}>
        <GoldDivider frame={frame} startFrame={140} y={1580} />
      </Sequence>

      {/* Layer 10: Footer */}
      <FooterText frame={frame} />

      {/* Layer 11: Rose petal confetti */}
      <RosePetalConfetti frame={frame} />
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionWeddingInvite"
    component={RemotionWeddingInvite}
    durationInFrames={180}
    fps={30}
    width={1080}
    height={1920}
  />
);
