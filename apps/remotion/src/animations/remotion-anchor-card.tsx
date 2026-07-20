import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Customizable constants ────────────────────────────────────────────────
const ANCHOR_NAME = "ELENA HAYES";
const ANCHOR_TITLE = "CHIEF POLITICAL CORRESPONDENT";
const ANCHOR_LOCATION = "WASHINGTON D.C.";
const ANCHOR_ESTABLISHED = "EST. 2014";
const ANCHOR_SUBTITLE =
  "Covering the White House and Capitol Hill for NNX News";
const NETWORK = "NNX";
const NETWORK_FULL = "NNX News Network";

const ACCENT_RED = "#e8001e";
const DARK_RED = "#8b0010";
const BG = "#0a0e1a";
const CARD_BG = "#151b26";
const CARD_BORDER = "#1e2736";
const WHITE = "#ffffff";
const OFF_WHITE = "rgba(255,255,255,0.88)";
const MUTED = "rgba(255,255,255,0.52)";
const FAINT = "rgba(255,255,255,0.18)";
const GRID_LINE = "rgba(255,255,255,0.035)";

// ─── Scene boundaries ──────────────────────────────────────────────────────
// Scene 1:  0 –  30  — Red horizontal line sweeps in; NNX logo fades top-left
// Scene 2: 30 –  90  — Anchor card springs up from bottom-left
// Scene 3: 90 – 130  — Subtitle text fades in below card
// Scene 4: 130 – 150 — Card slides back down; red line wipes out to right

// ─── Helper: clamp interpolate options ─────────────────────────────────────
const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ─── Sub-component: Background Grid ───────────────────────────────────────
const BackgroundGrid: React.FC = () => (
  <>
    {Array.from({ length: 14 }).map((_, i) => (
      <div
        key={`col-${i}`}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${(i / 14) * 100}%`,
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
          top: `${(i / 8) * 100}%`,
          height: 1,
          backgroundColor: GRID_LINE,
        }}
      />
    ))}
  </>
);

// ─── Sub-component: Vignette ───────────────────────────────────────────────
const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0,0,0,0.7) 100%)",
      pointerEvents: "none",
    }}
  />
);

// ─── Sub-component: Ambient glow (bottom-left red) ────────────────────────
const AmbientGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [30, 55], [0, 1], CLAMP);
  const outroOpacity = interpolate(frame, [130, 148], [1, 0], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 8% 80%, rgba(232,0,30,0.1) 0%, transparent 50%)`,
        opacity: opacity * outroOpacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Sub-component: NNX Logo (top-left) ───────────────────────────────────
const NetworkLogo: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Scene 1: fade in at frame 8
  const opacity = interpolate(frame, [8, 24], [0, 1], CLAMP);
  // Scene 4: fade out
  const outroOpacity = interpolate(frame, [130, 145], [1, 0], CLAMP);
  const combined = opacity * outroOpacity;

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        left: 52,
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: combined,
      }}
    >
      {/* Red badge circle */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          backgroundColor: ACCENT_RED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 18px rgba(232,0,30,0.45)`,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 18,
            color: WHITE,
            letterSpacing: 1,
          }}
        >
          {NETWORK}
        </span>
      </div>

      {/* Network name text */}
      <div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: WHITE,
            letterSpacing: 2.5,
            textTransform: "uppercase",
          }}
        >
          {NETWORK_FULL}
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 11,
            color: MUTED,
            letterSpacing: 1.5,
            marginTop: 3,
            textTransform: "uppercase",
          }}
        >
          Live Coverage
        </div>
      </div>
    </div>
  );
};

// ─── Sub-component: Scene 1 — Red horizontal sweep line ──────────────────
const RedSweepLine: React.FC<{ frame: number }> = ({ frame }) => {
  // 40% of 720 = 288px from top
  const LINE_Y = 288;
  const LINE_THICKNESS = 3;

  // Sweep in from left (frames 0 → 22)
  const scaleXIn = interpolate(frame, [0, 22], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

  // Outro: sweep out to right (frames 130 → 148)
  // We do this by shifting translateX right while keeping scaleX=1
  const outroX = interpolate(frame, [130, 148], [0, 1280], {
    ...CLAMP,
    easing: Easing.in(Easing.cubic),
  });

  const isOutro = frame >= 130;

  return (
    <div
      style={{
        position: "absolute",
        top: LINE_Y - LINE_THICKNESS / 2,
        left: 0,
        width: "100%",
        height: LINE_THICKNESS,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Glow behind the line */}
      <div
        style={{
          position: "absolute",
          top: -6,
          left: 0,
          right: 0,
          height: LINE_THICKNESS + 12,
          background: `linear-gradient(90deg, transparent, rgba(232,0,30,0.25) 20%, rgba(232,0,30,0.25) 80%, transparent)`,
          transform: isOutro
            ? `translateX(${outroX}px)`
            : `scaleX(${scaleXIn})`,
          transformOrigin: "left center",
        }}
      />

      {/* Main line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: LINE_THICKNESS,
          background: `linear-gradient(90deg, ${DARK_RED} 0%, ${ACCENT_RED} 15%, ${WHITE} 50%, ${ACCENT_RED} 85%, ${DARK_RED} 100%)`,
          boxShadow: `0 0 12px ${ACCENT_RED}, 0 0 24px rgba(232,0,30,0.4)`,
          transform: isOutro
            ? `translateX(${outroX}px)`
            : `scaleX(${scaleXIn})`,
          transformOrigin: "left center",
        }}
      />
    </div>
  );
};

// ─── Sub-component: Pin icon (SVG) ────────────────────────────────────────
const PinIcon: React.FC = () => (
  <svg
    width="12"
    height="14"
    viewBox="0 0 12 14"
    fill="none"
    style={{ flexShrink: 0, marginTop: 1 }}
  >
    <path
      d="M6 0C3.79 0 2 1.79 2 4c0 3 4 9 4 9s4-6 4-9c0-2.21-1.79-4-4-4zm0 5.5C5.17 5.5 4.5 4.83 4.5 4S5.17 2.5 6 2.5 7.5 3.17 7.5 4 6.83 5.5 6 5.5z"
      fill={ACCENT_RED}
    />
  </svg>
);

// ─── Sub-component: Scene 2 — Anchor Card ─────────────────────────────────
const AnchorCard: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const SCENE_START = 30;
  const f = Math.max(0, frame - SCENE_START);

  // Spring up from bottom
  const springProgress = spring({
    frame: f,
    fps,
    config: { damping: 20, stiffness: 160 },
  });
  const translateY = interpolate(springProgress, [0, 1], [240, 0]);

  // Card opacity
  const opacity = interpolate(f, [0, 12], [0, 1], CLAMP);

  // Outro: slide back down (frames 130 → 148)
  const outroY = interpolate(frame, [130, 148], [0, 280], {
    ...CLAMP,
    easing: Easing.in(Easing.cubic),
  });
  const outroOpacity = interpolate(frame, [128, 140], [1, 0], CLAMP);

  const isOutro = frame >= 130;
  const finalY = isOutro ? outroY : translateY;
  const finalOpacity = isOutro ? outroOpacity : opacity;

  // Internal element delays (relative to card appearing)
  const nameDelay = 8;
  const titleDelay = 16;
  const badgeDelay = 24;

  const nameOpacity = interpolate(Math.max(0, f - nameDelay), [0, 14], [0, 1], CLAMP);
  const nameX = interpolate(Math.max(0, f - nameDelay), [0, 14], [16, 0], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

  const titleOpacity = interpolate(Math.max(0, f - titleDelay), [0, 14], [0, 1], CLAMP);
  const titleX = interpolate(Math.max(0, f - titleDelay), [0, 14], [12, 0], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

  const badgeOpacity = interpolate(Math.max(0, f - badgeDelay), [0, 16], [0, 1], CLAMP);

  // Red accent strip height animation (scales from 0 to full height)
  const accentScaleY = interpolate(f, [0, 18], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 52,
        bottom: 120,
        width: 520,
        height: 200,
        opacity: finalOpacity,
        transform: `translateY(${finalY}px)`,
      }}
    >
      {/* Card background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 2,
          boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)`,
          overflow: "hidden",
        }}
      >
        {/* Subtle top gradient sheen */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Red left accent strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor: ACCENT_RED,
          boxShadow: `0 0 16px rgba(232,0,30,0.6), 2px 0 12px rgba(232,0,30,0.25)`,
          transformOrigin: "top center",
          transform: `scaleY(${accentScaleY})`,
          borderRadius: "1px 0 0 1px",
        }}
      />

      {/* Card content (offset to the right of accent strip) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 22,
          right: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 20,
          paddingRight: 24,
          gap: 0,
        }}
      >
        {/* Anchor name */}
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 38,
            color: WHITE,
            letterSpacing: -0.5,
            lineHeight: 1.08,
            opacity: nameOpacity,
            transform: `translateX(${nameX}px)`,
            whiteSpace: "nowrap",
          }}
        >
          {ANCHOR_NAME}
        </div>

        {/* Divider */}
        <div
          style={{
            width: interpolate(
              Math.max(0, f - titleDelay),
              [0, 20],
              [0, 260],
              CLAMP
            ),
            height: 1,
            backgroundColor: ACCENT_RED,
            opacity: 0.6,
            marginTop: 10,
            marginBottom: 10,
          }}
        />

        {/* Anchor title */}
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: MUTED,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            opacity: titleOpacity,
            transform: `translateX(${titleX}px)`,
          }}
        >
          {ANCHOR_TITLE}
        </div>

        {/* Badges row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 14,
            opacity: badgeOpacity,
          }}
        >
          {/* Location badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              backgroundColor: "rgba(232,0,30,0.12)",
              border: `1px solid rgba(232,0,30,0.3)`,
              borderRadius: 3,
              paddingLeft: 9,
              paddingRight: 9,
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            <PinIcon />
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                color: OFF_WHITE,
                letterSpacing: 1.8,
                textTransform: "uppercase",
              }}
            >
              {ANCHOR_LOCATION}
            </span>
          </div>

          {/* Separator dot */}
          <div
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              backgroundColor: FAINT,
            }}
          />

          {/* Established badge */}
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: 12,
              color: MUTED,
              letterSpacing: 1,
            }}
          >
            {ANCHOR_ESTABLISHED}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-component: Scene 3 — Subtitle text ───────────────────────────────
const SubtitleText: React.FC<{ frame: number }> = ({ frame }) => {
  const SCENE_START = 90;
  const f = Math.max(0, frame - SCENE_START);

  const opacity = interpolate(f, [0, 18], [0, 1], CLAMP);
  const translateY = interpolate(f, [0, 18], [14, 0], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

  // Outro fade
  const outroOpacity = interpolate(frame, [128, 140], [1, 0], CLAMP);

  // Animated underline that draws in
  const underlineWidth = interpolate(f, [10, 40], [0, 360], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        left: 52,
        bottom: 68,
        maxWidth: 620,
        opacity: opacity * outroOpacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          color: OFF_WHITE,
          letterSpacing: 0.4,
          lineHeight: 1.5,
        }}
      >
        {ANCHOR_SUBTITLE}
      </div>
      {/* Thin red underline animates in */}
      <div
        style={{
          marginTop: 8,
          width: underlineWidth,
          height: 1.5,
          background: `linear-gradient(90deg, ${ACCENT_RED}, transparent)`,
          borderRadius: 1,
        }}
      />
    </div>
  );
};

// ─── Sub-component: Broadcast timestamp (top-right) ───────────────────────
const BroadcastTimestamp: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [10, 28], [0, 1], CLAMP);
  const outroOpacity = interpolate(frame, [130, 145], [1, 0], CLAMP);

  // Simple "live" blink on the dot — toggles every 18 frames
  const blinkCycle = Math.floor(frame / 18) % 2;
  const dotOpacity = blinkCycle === 0 ? 1 : 0.25;

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
        opacity: opacity * outroOpacity,
      }}
    >
      {/* LIVE pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          backgroundColor: "rgba(232,0,30,0.15)",
          border: `1px solid rgba(232,0,30,0.4)`,
          borderRadius: 3,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 5,
          paddingBottom: 5,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: ACCENT_RED,
            opacity: dotOpacity,
            boxShadow: `0 0 8px ${ACCENT_RED}`,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 12,
            color: WHITE,
            letterSpacing: 3,
          }}
        >
          LIVE
        </span>
      </div>

      {/* Broadcast time */}
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 300,
          fontSize: 11,
          color: MUTED,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        Washington, D.C. Bureau
      </div>
    </div>
  );
};

// ─── Sub-component: Decorative corner bracket (top-left) ──────────────────
const CornerBracket: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [2, 18], [0, 0.35], CLAMP);
  const outroOpacity = interpolate(frame, [130, 148], [1, 0], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        top: 26,
        right: 48,
        width: 30,
        height: 30,
        opacity: opacity * outroOpacity,
        display: "none", // hidden — reserved space
      }}
    />
  );
};

// ─── Sub-component: Bottom thin accent line (always visible) ──────────────
const BottomAccentLine: React.FC<{ frame: number }> = ({ frame }) => {
  const scaleX = interpolate(frame, [4, 28], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

  const outroScaleX = interpolate(frame, [130, 148], [1, 0], {
    ...CLAMP,
    easing: Easing.in(Easing.cubic),
  });

  const isOutro = frame >= 130;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${ACCENT_RED} 0%, ${DARK_RED} 30%, transparent 80%)`,
        transformOrigin: "left center",
        transform: `scaleX(${isOutro ? outroScaleX : scaleX})`,
      }}
    />
  );
};

// ─── Sub-component: Horizontal scan line overlay ───────────────────────────
const ScanLineOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.035) 3px, rgba(0,0,0,0.035) 4px)",
      pointerEvents: "none",
    }}
  />
);

// ─── Main composition component ────────────────────────────────────────────
export function AnchorIntroCard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      {/* ── Background layers ── */}
      <BackgroundGrid />
      <AmbientGlow frame={frame} />
      <Vignette />
      <ScanLineOverlay />

      {/* ── Bottom accent line ── */}
      <BottomAccentLine frame={frame} />

      {/* ── Scene 1: Red horizontal sweep line (0–30) ── */}
      <RedSweepLine frame={frame} />

      {/* ── Scene 1: NNX logo top-left fades in (frame 8+) ── */}
      <NetworkLogo frame={frame} fps={fps} />

      {/* ── Scene 1: Broadcast timestamp / LIVE badge top-right ── */}
      <BroadcastTimestamp frame={frame} />

      {/* ── Scene 2: Anchor card springs up from bottom-left (30–90) ── */}
      <AnchorCard frame={frame} fps={fps} />

      {/* ── Scene 3: Subtitle text fades in below card (90–130) ── */}
      <SubtitleText frame={frame} />

      {/* ── Reserved corner bracket ── */}
      <CornerBracket frame={frame} />
    </AbsoluteFill>
  );
}
