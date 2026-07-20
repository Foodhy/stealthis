import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Palette ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0a0f",
  surface: "#12121a",
  surface2: "#1e1e2e",
  accent: "#a855f7",
  accent2: "#06b6d4",
  accent3: "#ec4899",
  gold: "#f59e0b",
  green: "#10b981",
  text: "#f1f5f9",
  muted: "#94a3b8",
} as const;

// ── Audio simulation helpers ──────────────────────────────────────────────────
/**
 * Produces a 0..1 audio level for a given channel and frame.
 * Stacks 4 sine waves at different frequencies / phases for an organic,
 * music-like envelope. Phase offset differentiates L vs R channels.
 */
function channelLevel(frame: number, phaseOffset: number): number {
  const w1 = Math.sin(frame * 0.14 + phaseOffset) * 0.30;
  const w2 = Math.sin(frame * 0.31 + phaseOffset * 1.7 + 1.1) * 0.22;
  const w3 = Math.sin(frame * 0.07 + phaseOffset * 0.4 + 2.3) * 0.28;
  const w4 = Math.sin(frame * 0.58 + phaseOffset * 2.1 + 0.7) * 0.12;
  // raw in -0.92..+0.92; normalize to 0..1 then clamp
  const raw = (w1 + w2 + w3 + w4 + 0.92) / 1.84;
  return Math.min(1, Math.max(0, raw));
}

/**
 * Spectrum-analyzer style: per-band level for the needle meter background fill.
 * Returns 0..1 for bandIndex out of totalBands.
 */
function spectrumBand(
  bandIndex: number,
  totalBands: number,
  frame: number,
  phaseOffset: number
): number {
  const norm = bandIndex / totalBands;
  const centerBoost = Math.exp(-Math.pow(norm - 0.35, 2) * 8);
  const w1 = Math.sin(frame * 0.18 + bandIndex * 0.42 + phaseOffset) * 0.35;
  const w2 = Math.sin(frame * 0.37 + bandIndex * 0.81 + phaseOffset + 1.5) * 0.25;
  const w3 = Math.sin(frame * 0.09 + bandIndex * 0.23 + phaseOffset + 3.1) * 0.20;
  const raw = (w1 + w2 + w3 + centerBoost * 0.45 + 0.80) / 1.60;
  return Math.min(1, Math.max(0, raw));
}

// ── dB scale ──────────────────────────────────────────────────────────────────
// Maps a normalized 0..1 level to a dB string and color zone
function levelToDb(norm: number): number {
  // Map 0..1 → -20..+3 dB (typical VU range)
  return -20 + norm * 23;
}

function segmentColor(segNorm: number): string {
  if (segNorm < 0.70) return C.green;          // green zone
  if (segNorm < 0.85) return "#f59e0b";         // yellow zone
  return "#ef4444";                             // red zone
}

// ── Peak-hold hook ────────────────────────────────────────────────────────────
// Returns the peak-hold position (0..1) for a given channel level history.
// We can't use useState in a render-time hook (Remotion renders every frame fresh),
// so we pre-compute the peak deterministically by scanning backward 45 frames.
function peakHold(
  frame: number,
  phaseOffset: number,
  holdFrames = 45
): number {
  let peak = 0;
  const startFrame = Math.max(0, frame - holdFrames);
  for (let f = startFrame; f <= frame; f++) {
    const lvl = channelLevel(f, phaseOffset);
    if (lvl > peak) peak = lvl;
  }
  // After reaching peak, drift it downward over holdFrames
  const peakFrame = (() => {
    let pf = 0;
    let pk = 0;
    for (let f = startFrame; f <= frame; f++) {
      const lvl = channelLevel(f, phaseOffset);
      if (lvl > pk) { pk = lvl; pf = f; }
    }
    return pf;
  })();
  const elapsed = frame - peakFrame;
  const fallOff = Math.max(0, 1 - elapsed / holdFrames);
  return peak * (fallOff * 0.6 + 0.4); // partial gravity fall
}

// ── Grid texture overlay ──────────────────────────────────────────────────────
function GridOverlay({ width, height }: { width: number; height: number }) {
  const lines: React.ReactNode[] = [];
  const step = 60;
  for (let x = 0; x <= width; x += step) {
    lines.push(
      <line key={`v${x}`} x1={x} y1={0} x2={x} y2={height}
        stroke="rgba(255,255,255,0.025)" strokeWidth={1} />
    );
  }
  for (let y = 0; y <= height; y += step) {
    lines.push(
      <line key={`h${y}`} x1={0} y1={y} x2={width} y2={y}
        stroke="rgba(255,255,255,0.025)" strokeWidth={1} />
    );
  }
  return (
    <svg style={{ position: "absolute", inset: 0 }} width={width} height={height}>
      {lines}
    </svg>
  );
}

// ── LED VU Bar ────────────────────────────────────────────────────────────────
const SEGMENT_COUNT = 32;
const SEG_GAP = 3; // px gap between segments

interface LedVuBarProps {
  level: number;      // 0..1 current level
  peak: number;       // 0..1 peak-hold position
  barWidth: number;
  barHeight: number;
  entrance: number;   // spring 0..1 entrance scale
}

function LedVuBar({ level, peak, barWidth, barHeight, entrance }: LedVuBarProps) {
  const segHeight = (barHeight - SEG_GAP * (SEGMENT_COUNT - 1)) / SEGMENT_COUNT;
  const litCount = Math.round(level * SEGMENT_COUNT);
  const peakSeg = Math.round(peak * SEGMENT_COUNT);

  return (
    <div
      style={{
        width: barWidth,
        height: barHeight,
        display: "flex",
        flexDirection: "column-reverse",
        gap: SEG_GAP,
        transform: `scaleY(${entrance})`,
        transformOrigin: "bottom center",
      }}
    >
      {Array.from({ length: SEGMENT_COUNT }, (_, i) => {
        const segNorm = (i + 1) / SEGMENT_COUNT;
        const isLit = i < litCount;
        const isPeak = i === peakSeg - 1 && peakSeg > litCount;
        const color = segmentColor(segNorm);
        const opacity = isLit ? 1 : isPeak ? 0.95 : 0.10;
        const glow = isLit
          ? `0 0 ${segNorm > 0.85 ? 14 : segNorm > 0.70 ? 8 : 6}px ${color}cc`
          : isPeak
          ? `0 0 16px #ffffffcc, 0 0 8px ${color}`
          : "none";

        return (
          <div
            key={i}
            style={{
              width: "100%",
              height: segHeight,
              borderRadius: 2,
              backgroundColor: isLit
                ? color
                : isPeak
                ? "#ffffff"
                : `${color}22`,
              opacity,
              boxShadow: glow,
              transition: "background-color 0.02s",
            }}
          />
        );
      })}
    </div>
  );
}

// ── dB Scale Ruler ────────────────────────────────────────────────────────────
const DB_LABELS = ["+3", "0", "-3", "-6", "-10", "-20"];
// positions as fractions from top (1 = top, 0 = bottom) matching 0..1 level
const DB_POSITIONS: Record<string, number> = {
  "+3": 1.0,
  "0": 0.87,
  "-3": 0.74,
  "-6": 0.61,
  "-10": 0.43,
  "-20": 0.13,
};

function DbScale({ height, side = "right" }: { height: number; side?: "left" | "right" }) {
  return (
    <div style={{ position: "relative", height, width: 44 }}>
      {DB_LABELS.map((label) => {
        const top = (1 - DB_POSITIONS[label]) * height;
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              top,
              [side === "right" ? "left" : "right"]: 0,
              transform: "translateY(-50%)",
              fontSize: 13,
              fontFamily: "'Courier New', monospace",
              color: label === "+3" || label === "0" ? "#ef4444" : label === "-3" ? "#f59e0b" : C.muted,
              fontWeight: 600,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

// ── Analog Needle Meter ───────────────────────────────────────────────────────
interface NeedleMeterProps {
  level: number;   // 0..1
  label: string;
  width: number;
  height: number;
  entrance: number; // spring 0..1
}

function NeedleMeter({ level, label, width, height, entrance }: NeedleMeterProps) {
  const cx = width / 2;
  const cy = height * 0.88;
  const radius = width * 0.42;

  // Arc from -135° to -45° (left to right swing, 90° total)
  const startAngle = -145;
  const endAngle = -35;
  const needleAngle = startAngle + (endAngle - startAngle) * level;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLength = radius * 0.88;
  const nx = cx + Math.cos(needleRad) * needleLength;
  const ny = cy + Math.sin(needleRad) * needleLength;

  // Arc path helpers
  function arcPath(r: number, start: number, end: number): string {
    const s = ((start * Math.PI) / 180);
    const e = ((end * Math.PI) / 180);
    const x1 = cx + Math.cos(s) * r;
    const y1 = cy + Math.sin(s) * r;
    const x2 = cx + Math.cos(e) * r;
    const y2 = cy + Math.sin(e) * r;
    const large = Math.abs(end - start) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  // Tick marks on the arc
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const norm = i / 10;
    const angle = startAngle + (endAngle - startAngle) * norm;
    const rad = (angle * Math.PI) / 180;
    const isMajor = i % 2 === 0;
    const innerR = radius - (isMajor ? 20 : 12);
    const outerR = radius + 4;
    const tickColor =
      norm > 0.87 ? "#ef4444" : norm > 0.70 ? "#f59e0b" : C.muted;
    return (
      <line
        key={i}
        x1={cx + Math.cos(rad) * innerR}
        y1={cy + Math.sin(rad) * innerR}
        x2={cx + Math.cos(rad) * outerR}
        y2={cy + Math.sin(rad) * outerR}
        stroke={tickColor}
        strokeWidth={isMajor ? 2.5 : 1.5}
        strokeLinecap="round"
      />
    );
  });

  // Zone coloring along the arc
  const greenEnd = startAngle + (endAngle - startAngle) * 0.70;
  const yellowEnd = startAngle + (endAngle - startAngle) * 0.85;

  const currentDb = levelToDb(level);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        background: `linear-gradient(180deg, #1a1a2e 0%, ${C.surface} 100%)`,
        borderRadius: 16,
        border: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: `0 0 40px rgba(168,85,247,0.12), inset 0 1px 0 rgba(255,255,255,0.06)`,
        overflow: "hidden",
        transform: `scale(${entrance})`,
        transformOrigin: "center bottom",
      }}
    >
      {/* Subtle radial bg glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 50% 100%, rgba(168,85,247,0.07) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Outer arc track */}
        <path d={arcPath(radius + 6, startAngle, endAngle)}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={14} strokeLinecap="round" />

        {/* Green zone */}
        <path d={arcPath(radius + 6, startAngle, greenEnd)}
          fill="none" stroke={`${C.green}55`} strokeWidth={14} strokeLinecap="round" />
        {/* Yellow zone */}
        <path d={arcPath(radius + 6, greenEnd, yellowEnd)}
          fill="none" stroke="#f59e0b55" strokeWidth={14} strokeLinecap="round" />
        {/* Red zone */}
        <path d={arcPath(radius + 6, yellowEnd, endAngle)}
          fill="none" stroke="#ef444455" strokeWidth={14} strokeLinecap="round" />

        {/* Active fill arc up to current level */}
        <path
          d={arcPath(radius + 6, startAngle, needleAngle)}
          fill="none"
          stroke={
            level > 0.87 ? "#ef4444" : level > 0.70 ? "#f59e0b" : C.green
          }
          strokeWidth={14}
          strokeLinecap="round"
          opacity={0.75}
        />

        {/* Tick marks */}
        {ticks}

        {/* Needle shadow/glow */}
        <line
          x1={cx} y1={cy}
          x2={nx} y2={ny}
          stroke={level > 0.87 ? "#ef444460" : "#a855f760"}
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={nx} y2={ny}
          stroke={level > 0.87 ? "#ff6b6b" : "#f1f5f9"}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Pivot circle */}
        <circle cx={cx} cy={cy} r={9} fill={C.surface2} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={4} fill={level > 0.87 ? "#ef4444" : C.accent} />
      </svg>

      {/* dB readout */}
      <div style={{
        position: "absolute",
        bottom: 18,
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 22,
          fontWeight: 700,
          color: level > 0.87 ? "#ff6b6b" : level > 0.70 ? "#f59e0b" : C.green,
          letterSpacing: "0.05em",
          textShadow: `0 0 12px ${level > 0.87 ? "#ef4444" : level > 0.70 ? "#f59e0b" : C.green}`,
        }}>
          {currentDb >= 0 ? "+" : ""}{currentDb.toFixed(1)} dB
        </div>
        <div style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: C.muted,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginTop: 2,
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ── Stereo LED VU Panel ───────────────────────────────────────────────────────
interface StereoVuPanelProps {
  levelL: number;
  levelR: number;
  peakL: number;
  peakR: number;
  barWidth: number;
  barHeight: number;
  entrance: number;
}

function StereoVuPanel({
  levelL, levelR, peakL, peakR,
  barWidth, barHeight, entrance,
}: StereoVuPanelProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      background: `linear-gradient(180deg, #1a1a2e 0%, ${C.surface} 100%)`,
      borderRadius: 16,
      border: `1px solid rgba(255,255,255,0.08)`,
      boxShadow: `0 0 60px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.06)`,
      padding: "24px 28px 20px",
      gap: 16,
    }}>
      {/* Panel header */}
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 11,
        color: C.muted,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        textAlign: "center",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: 12,
      }}>
        STEREO LEVEL METER · DIGITAL
      </div>

      {/* Bars row */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        justifyContent: "center",
      }}>
        {/* L label */}
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 14,
          fontWeight: 700,
          color: C.accent2,
          letterSpacing: "0.15em",
          paddingBottom: 4,
          width: 20,
          textAlign: "center",
        }}>L</div>

        {/* Left bar + scale */}
        <LedVuBar
          level={levelL}
          peak={peakL}
          barWidth={barWidth}
          barHeight={barHeight}
          entrance={entrance}
        />

        {/* dB scale in the middle */}
        <DbScale height={barHeight} side="right" />

        {/* Right bar */}
        <LedVuBar
          level={levelR}
          peak={peakR}
          barWidth={barWidth}
          barHeight={barHeight}
          entrance={entrance}
        />

        {/* R label */}
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 14,
          fontWeight: 700,
          color: C.accent3,
          letterSpacing: "0.15em",
          paddingBottom: 4,
          width: 20,
          textAlign: "center",
        }}>R</div>
      </div>

      {/* Level readout row */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 8,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        {[
          { ch: "L", level: levelL, color: C.accent2 },
          { ch: "R", level: levelR, color: C.accent3 },
        ].map(({ ch, level, color }) => {
          const db = levelToDb(level);
          return (
            <div key={ch} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: level > 0.87 ? "#ff6b6b" : color,
                textShadow: `0 0 10px ${level > 0.87 ? "#ef4444" : color}`,
              }}>
                {db >= 0 ? "+" : ""}{db.toFixed(1)} dB
              </div>
              <div style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                color: C.muted,
                letterSpacing: "0.2em",
              }}>{ch} CH</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Spectrum Mini-bar (decorative footer strip) ────────────────────────────────
function SpectrumStrip({ frame, width }: { frame: number; width: number }) {
  const bands = 48;
  const bandW = Math.floor((width - 80) / bands) - 2;
  const maxH = 40;

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 2,
      height: maxH + 8,
      paddingBottom: 4,
    }}>
      {Array.from({ length: bands }, (_, i) => {
        const lvl = spectrumBand(i, bands, frame, 0);
        const h = Math.max(4, lvl * maxH);
        const color = i < bands * 0.5 ? C.accent : C.accent2;
        return (
          <div key={i} style={{
            width: bandW,
            height: h,
            borderRadius: 2,
            background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
            boxShadow: `0 0 4px ${color}66`,
          }} />
        );
      })}
    </div>
  );
}

// ── Main composition ──────────────────────────────────────────────────────────
export function VuMeterAnimation() {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Entrance springs
  const titleEntrance = spring({ frame, fps, config: { damping: 18, stiffness: 80 }, durationInFrames: 25 });
  const panelEntrance = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 16, stiffness: 70 }, durationInFrames: 30 });
  const needleEntrance = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 20, stiffness: 90 }, durationInFrames: 25 });

  // Per-channel audio simulation
  const levelL = channelLevel(frame, 0.0);
  const levelR = channelLevel(frame, 1.37); // different phase offset

  // Needle uses spring() for physical settle behavior
  // We feed a target and spring toward it over ~4 frames
  const targetL = channelLevel(frame, 0.0);
  const needleLevelL = spring({
    frame,
    fps,
    from: channelLevel(Math.max(0, frame - 4), 0.0),
    to: targetL,
    config: { damping: 22, stiffness: 200 },
    durationInFrames: 8,
  });

  const targetR = channelLevel(frame, 1.37);
  const needleLevelR = spring({
    frame,
    fps,
    from: channelLevel(Math.max(0, frame - 4), 1.37),
    to: targetR,
    config: { damping: 22, stiffness: 200 },
    durationInFrames: 8,
  });

  // Peak hold
  const peakL = peakHold(frame, 0.0);
  const peakR = peakHold(frame, 1.37);

  // Title opacity / slide
  const titleSlide = interpolate(titleEntrance, [0, 1], [30, 0]);
  const titleOpacity = interpolate(titleEntrance, [0, 1], [0, 1], { easing: Easing.out(Easing.ease) });

  // Progress through clip (for status bar)
  const progress = frame / durationInFrames;

  // Breathing glow intensity
  const glowPulse = 0.5 + 0.5 * Math.sin(frame * 0.12);

  // Layout constants
  const panelW = 340;
  const panelH = 520;
  const needleW = 380;
  const needleH = 240;
  const barW = 52;
  const barH = 400;
  const contentTop = 120;

  // Center X for groups
  const totalW = needleW * 2 + 60 + panelW + 80; // two needles + gap + panel + margin
  const startX = (width - totalW) / 2;
  const needleLX = startX;
  const needleRX = startX + needleW + 60;
  const panelX = needleRX + needleW + 80;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      {/* Grid texture */}
      <GridOverlay width={width} height={height} />

      {/* Background radial glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 70% 50% at 50% 60%, rgba(168,85,247,${0.07 + glowPulse * 0.04}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* ── Title bar ── */}
      <div style={{
        position: "absolute",
        top: 36,
        left: "50%",
        transform: `translateX(-50%) translateY(${titleSlide}px)`,
        opacity: titleOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 52,
          fontWeight: 900,
          color: C.text,
          letterSpacing: "0.35em",
          textShadow: `0 0 30px rgba(168,85,247,0.5), 0 0 60px rgba(168,85,247,0.2)`,
        }}>
          VU METER
        </div>
        <div style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          color: C.muted,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}>
          Studio Reference · Analog + Digital
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{
        position: "absolute",
        top: contentTop,
        left: 0,
        right: 0,
        bottom: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}>

        {/* ── Top row: two analog needle meters ── */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          gap: 32,
          alignItems: "flex-end",
        }}>
          <NeedleMeter
            level={needleLevelL}
            label="L CHANNEL"
            width={needleW}
            height={needleH}
            entrance={needleEntrance}
          />
          <NeedleMeter
            level={needleLevelR}
            label="R CHANNEL"
            width={needleW}
            height={needleH}
            entrance={needleEntrance}
          />
        </div>

        {/* Divider label */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          opacity: interpolate(panelEntrance, [0, 1], [0, 1]),
        }}>
          <div style={{ width: 200, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1))" }} />
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            color: C.muted,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}>DIGITAL LED</div>
          <div style={{ width: 200, height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.1), transparent)" }} />
        </div>

        {/* ── Bottom row: stereo LED VU panel ── */}
        <div style={{ opacity: interpolate(panelEntrance, [0, 1], [0, 1]) }}>
          <StereoVuPanel
            levelL={levelL}
            levelR={levelR}
            peakL={peakL}
            peakR={peakR}
            barWidth={barW}
            barHeight={barH * 0.65}
            entrance={panelEntrance}
          />
        </div>

      </div>

      {/* ── Footer spectrum strip + status ── */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: `linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.95) 100%)`,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 48,
        paddingRight: 48,
      }}>
        {/* Spectrum strip */}
        <SpectrumStrip frame={frame} width={width * 0.55} />

        {/* Status pill */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          background: C.surface2,
          borderRadius: 999,
          padding: "8px 20px",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          {/* Pulsing dot */}
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: C.green,
            boxShadow: `0 0 ${8 + glowPulse * 8}px ${C.green}`,
          }} />
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
            color: C.text,
            letterSpacing: "0.15em",
          }}>
            MONITORING
          </div>
          {/* Progress */}
          <div style={{
            width: 80,
            height: 3,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.08)",
            overflow: "hidden",
            marginLeft: 8,
          }}>
            <div style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #a855f7, #06b6d4)",
              borderRadius: 2,
            }} />
          </div>
        </div>
      </div>

      {/* ── Corner accent brackets ── */}
      {[
        { top: 16, left: 16 },
        { top: 16, right: 16 },
        { bottom: 16, left: 16 },
        { bottom: 16, right: 16 },
      ].map((pos, i) => {
        const opacity = interpolate(frame, [i * 5, i * 5 + 20], [0, 0.4], { extrapolateRight: "clamp" });
        const isRight = "right" in pos;
        const isBottom = "bottom" in pos;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: 32,
              height: 32,
              borderTop: isBottom ? "none" : `2px solid rgba(168,85,247,0.5)`,
              borderBottom: isBottom ? `2px solid rgba(168,85,247,0.5)` : "none",
              borderLeft: isRight ? "none" : `2px solid rgba(168,85,247,0.5)`,
              borderRight: isRight ? `2px solid rgba(168,85,247,0.5)` : "none",
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// ── Composition config ────────────────────────────────────────────────────────
export const compositionConfig = {
  id: "remotion-vu-meter",
  component: VuMeterAnimation,
  durationInFrames: 150,
  fps: 30,
  width: 1920,
  height: 1080,
};
