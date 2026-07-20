import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Loop,
  Easing,
} from "remotion";

// ─── Constants ──────────────────────────────────────────────────────────────

const LOOP_FRAMES = 90; // 3 seconds at 30fps

const TRACK_TITLE = "Midnight Drift";
const ARTIST_NAME = "Neon Echo";

// Blob definitions: [colorStop1, colorStop2, baseX, baseY, radius, driftAmpX, driftAmpY, freqX, freqY, phaseX, phaseY, pulseAmp, pulseFreq, pulsePhase]
const BLOBS = [
  {
    c1: "#a855f7",
    c2: "#7c3aed",
    baseX: 0.35,
    baseY: 0.38,
    radius: 480,
    driftAmpX: 60,
    driftAmpY: 45,
    freqX: 0.031,
    freqY: 0.023,
    phaseX: 0,
    phaseY: 1.1,
    pulseAmp: 40,
    pulseFreq: 0.027,
    pulsePhase: 0,
    opacity: 0.52,
  },
  {
    c1: "#ec4899",
    c2: "#be185d",
    baseX: 0.68,
    baseY: 0.55,
    radius: 420,
    driftAmpX: 50,
    driftAmpY: 55,
    freqX: 0.021,
    freqY: 0.035,
    phaseX: 2.1,
    phaseY: 0.7,
    pulseAmp: 35,
    pulseFreq: 0.041,
    pulsePhase: 1.2,
    opacity: 0.45,
  },
  {
    c1: "#06b6d4",
    c2: "#0284c7",
    baseX: 0.52,
    baseY: 0.65,
    radius: 380,
    driftAmpX: 70,
    driftAmpY: 40,
    freqX: 0.039,
    freqY: 0.019,
    phaseX: 3.9,
    phaseY: 2.3,
    pulseAmp: 30,
    pulseFreq: 0.033,
    pulsePhase: 2.4,
    opacity: 0.38,
  },
  {
    c1: "#6366f1",
    c2: "#4338ca",
    baseX: 0.22,
    baseY: 0.62,
    radius: 340,
    driftAmpX: 55,
    driftAmpY: 60,
    freqX: 0.017,
    freqY: 0.043,
    phaseX: 5.5,
    phaseY: 4.1,
    pulseAmp: 25,
    pulseFreq: 0.037,
    pulsePhase: 3.8,
    opacity: 0.42,
  },
];

// Waveform line configs
const WAVE_LINES = [
  { yBase: 0.48, amp1: 28, freq1: 0.11, phase1: 0, amp2: 14, freq2: 0.23, phase2: 1.1, color: "#a855f7", glow: "rgba(168,85,247,0.55)", strokeWidth: 2.5, opacity: 0.85 },
  { yBase: 0.52, amp1: 20, freq1: 0.09, phase1: 2.2, amp2: 10, freq2: 0.19, phase2: 2.8, color: "#ec4899", glow: "rgba(236,72,153,0.45)", strokeWidth: 2, opacity: 0.72 },
  { yBase: 0.50, amp1: 36, freq1: 0.07, phase1: 4.4, amp2: 18, freq2: 0.31, phase2: 0.5, color: "#06b6d4", glow: "rgba(6,182,212,0.40)", strokeWidth: 1.5, opacity: 0.58 },
  { yBase: 0.495, amp1: 12, freq1: 0.15, phase1: 1.7, amp2: 8, freq2: 0.27, phase2: 3.9, color: "#f1f5f9", glow: "rgba(241,245,249,0.25)", strokeWidth: 1.2, opacity: 0.35 },
];

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Seamless oscillation — uses loopFrame (0..LOOP_FRAMES-1) so frame 89→0 is seamless */
function osc(loopFrame: number, freq: number, phase: number): number {
  return Math.sin(loopFrame * freq * (Math.PI * 2) + phase);
}

/** Build an SVG polyline path string for a waveform row */
function buildWavePath(
  loopFrame: number,
  width: number,
  height: number,
  cfg: (typeof WAVE_LINES)[0]
): string {
  const steps = 200;
  const t = loopFrame / LOOP_FRAMES; // 0..1, seamless
  const points: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const xNorm = i / steps; // 0..1 along width

    // Two sine components layered
    const y1 = cfg.amp1 * Math.sin(xNorm * Math.PI * 2 * 3 + t * Math.PI * 2 * cfg.freq1 * LOOP_FRAMES * 0.01 + cfg.phase1);
    const y2 = cfg.amp2 * Math.sin(xNorm * Math.PI * 2 * 7 + t * Math.PI * 2 * cfg.freq2 * LOOP_FRAMES * 0.01 + cfg.phase2);
    const y = cfg.yBase * height + y1 + y2;

    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return `M${points.join(" L")}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const GlowBlob: React.FC<{
  blob: (typeof BLOBS)[0];
  loopFrame: number;
  width: number;
  height: number;
}> = ({ blob, loopFrame, width, height }) => {
  const cx = blob.baseX * width + blob.driftAmpX * osc(loopFrame, blob.freqX, blob.phaseX);
  const cy = blob.baseY * height + blob.driftAmpY * osc(loopFrame, blob.freqY, blob.phaseY);
  const r = blob.radius + blob.pulseAmp * osc(loopFrame, blob.pulseFreq, blob.pulsePhase);

  // Unique gradient ID per blob
  const gradId = `blob-grad-${blob.c1.replace("#", "")}`;

  return (
    <g>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={blob.c1} stopOpacity={blob.opacity} />
          <stop offset="60%" stopColor={blob.c2} stopOpacity={blob.opacity * 0.55} />
          <stop offset="100%" stopColor={blob.c2} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse
        cx={cx}
        cy={cy}
        rx={r}
        ry={r * 0.82}
        fill={`url(#${gradId})`}
      />
    </g>
  );
};

const WaveformLines: React.FC<{
  loopFrame: number;
  width: number;
  height: number;
}> = ({ loopFrame, width, height }) => {
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        {WAVE_LINES.map((wl, i) => (
          <filter key={i} id={`wave-glow-${i}`} x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {WAVE_LINES.map((wl, i) => {
        const d = buildWavePath(loopFrame, width, height, wl);
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={wl.color}
            strokeWidth={wl.strokeWidth}
            opacity={wl.opacity}
            filter={`url(#wave-glow-${i})`}
          />
        );
      })}
    </svg>
  );
};

const AlbumArtCorner: React.FC<{
  loopFrame: number;
}> = ({ loopFrame }) => {
  // Subtle pulse on album art
  const artScale = 1 + 0.012 * Math.sin(loopFrame * 0.07 * Math.PI * 2);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 64,
        left: 72,
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      {/* Album art */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 10,
          background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #06b6d4 100%)",
          boxShadow: "0 0 28px rgba(168,85,247,0.55), 0 0 60px rgba(236,72,153,0.25)",
          transform: `scale(${artScale})`,
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Vinyl grooves overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 10,
            background:
              "repeating-conic-gradient(rgba(255,255,255,0.04) 0deg, transparent 1deg, transparent 5deg, rgba(255,255,255,0.02) 6deg)",
          }}
        />
        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.6)",
            transform: "translate(-50%, -50%)",
            boxShadow: "inset 0 0 4px rgba(255,255,255,0.2)",
          }}
        />
      </div>

      {/* Track info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#f1f5f9",
            letterSpacing: -0.3,
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          }}
        >
          {TRACK_TITLE}
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "rgba(148,163,184,0.9)",
            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
          }}
        >
          {ARTIST_NAME}
        </span>

        {/* Mini playback dots */}
        <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
          {Array.from({ length: 16 }).map((_, i) => {
            const barH = 4 + 8 * Math.abs(Math.sin(loopFrame * 0.13 * Math.PI * 2 + i * 0.55));
            return (
              <div
                key={i}
                style={{
                  width: 3,
                  height: barH,
                  borderRadius: 2,
                  background: "linear-gradient(180deg, #a855f7, #ec4899)",
                  opacity: 0.7 + 0.3 * Math.abs(Math.sin(loopFrame * 0.09 + i)),
                  alignSelf: "flex-end",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const SpotifyCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Seamless loop frame
  const loopFrame = frame % LOOP_FRAMES;

  // Vignette pulsing ever so slightly
  const vignetteOpacity = 0.72 + 0.04 * Math.sin(loopFrame * 0.043 * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0f",
        overflow: "hidden",
      }}
    >
      {/* ── Blob background (SVG layer) ────────────────────────────────────── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Global blur for the blob layer */}
        <defs>
          <filter id="blob-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="48" />
          </filter>
        </defs>
        <g filter="url(#blob-blur)">
          {BLOBS.map((blob, i) => (
            <GlowBlob key={i} blob={blob} loopFrame={loopFrame} width={width} height={height} />
          ))}
        </g>
      </svg>

      {/* ── Background noise/grain texture (subtle) ────────────────────────── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, opacity: 0.03, mixBlendMode: "screen" }}
      >
        <defs>
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="4"
              seed={loopFrame * 3}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" />
          </filter>
        </defs>
        <rect width={width} height={height} filter="url(#grain)" />
      </svg>

      {/* ── Vignette overlay ───────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)",
          opacity: vignetteOpacity,
        }}
      />

      {/* ── Waveform lines ─────────────────────────────────────────────────── */}
      <WaveformLines loopFrame={loopFrame} width={width} height={height} />

      {/* ── Center glow dot ────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#ffffff",
          transform: "translate(-50%, -50%)",
          boxShadow: `0 0 ${20 + 10 * Math.abs(Math.sin(loopFrame * 0.06 * Math.PI * 2))}px rgba(255,255,255,0.8), 0 0 60px rgba(168,85,247,0.5)`,
        }}
      />

      {/* ── Album art & track info (bottom-left) ──────────────────────────── */}
      <AlbumArtCorner loopFrame={loopFrame} />

      {/* ── Subtle top gradient fade for vertical crop ─────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 180,
          background: "linear-gradient(180deg, rgba(10,10,15,0.4) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 180,
          background: "linear-gradient(0deg, rgba(10,10,15,0.6) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Remotion Root (Composition wrapper) ─────────────────────────────────────

export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-spotify-canvas"
    component={SpotifyCanvas}
    durationInFrames={90}
    fps={30}
    width={1920}
    height={1080}
  />
);

// ─── compositionConfig (for catalog / programmatic use) ──────────────────────

export const compositionConfig = {
  id: "remotion-spotify-canvas",
  component: SpotifyCanvas,
  durationInFrames: 90,
  fps: 30,
  width: 1920,
  height: 1080,
};
