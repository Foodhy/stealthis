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

// ── Config ────────────────────────────────────────────────────────────────────
const WEBINAR_TITLE = "Mastering Modern React in 2026";
const HOST_NAME = "Sarah Chen";
const HOST_ROLE = "Senior Engineer · Vercel";
const HOST_INITIALS = "SC";
const DATE_TIME = "Tue Jun 18  /  3:00 PM EST";
const BUTTON_LABEL = "Save Your Spot";
const VIEWER_COUNT = 1247;
const BRAND_COLOR = "#0d9488";        // teal-600
const BRAND_GLOW = "#0d948840";       // teal with alpha
const BRAND_LIGHT = "#2dd4bf";        // teal-400 highlight
const BG_COLOR = "#0f172a";           // slate-900
const CARD_COLOR = "#1e293b";         // slate-800
const BADGE_BG = "#134e4a";          // dark teal badge bg
const BADGE_BORDER = "#0d9488";

// ── Background glow layer ─────────────────────────────────────────────────────
const BackgroundGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = Math.sin((frame / 30) * Math.PI * 0.6) * 0.12 + 0.88;
  return (
    <>
      {/* Main center glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 900,
          height: 600,
          borderRadius: "50%",
          transform: `translate(-50%, -50%) scale(${pulse})`,
          background: `radial-gradient(ellipse at center, ${BRAND_COLOR}18 0%, ${BRAND_COLOR}08 45%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* Top-left accent glow behind badge */}
      <div
        style={{
          position: "absolute",
          top: -60,
          left: -60,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND_COLOR}22 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      {/* Bottom-right subtle glow */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: `radial-gradient(circle, #6366f112 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── FREE WEBINAR badge ────────────────────────────────────────────────────────
const WebinarBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
  });
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse glow ring
  const pulseScale = 1 + Math.sin((frame / 20) * Math.PI) * 0.06;
  const pulseOpacity = 0.4 + Math.sin((frame / 20) * Math.PI) * 0.3;

  return (
    <div
      style={{
        position: "absolute",
        top: 52,
        left: 64,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
      }}
    >
      {/* Pulsing glow ring behind badge */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 180,
          height: 50,
          borderRadius: 50,
          transform: `translate(-50%, -50%) scale(${pulseScale})`,
          background: BRAND_GLOW,
          opacity: pulseOpacity,
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: BADGE_BG,
          border: `1.5px solid ${BADGE_BORDER}`,
          borderRadius: 50,
          padding: "10px 20px",
        }}
      >
        {/* Live dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: BRAND_LIGHT,
            boxShadow: `0 0 6px ${BRAND_LIGHT}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 13,
            color: BRAND_LIGHT,
            letterSpacing: 2.5,
            textTransform: "uppercase" as const,
          }}
        >
          Free Webinar
        </span>
      </div>
    </div>
  );
};

// ── Webinar title ─────────────────────────────────────────────────────────────
const WebinarTitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 10);
  const translateX = spring({
    frame: delayed,
    fps,
    from: -80,
    to: 0,
    config: { damping: 18, stiffness: 130, mass: 0.9 },
  });
  const opacity = interpolate(delayed, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Split title into two lines for layout
  const line1 = "Mastering Modern React";
  const line2 = "in 2026";

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 64,
        right: 64,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 68,
          color: "#ffffff",
          letterSpacing: -2.5,
          lineHeight: 1.05,
          textShadow: "0 4px 32px rgba(0,0,0,0.6)",
        }}
      >
        <div>{line1}</div>
        <div style={{ color: BRAND_LIGHT }}>{line2}</div>
      </div>
    </div>
  );
};

// ── Host info block ───────────────────────────────────────────────────────────
const HostInfo: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 25);
  const translateY = spring({
    frame: delayed,
    fps,
    from: 24,
    to: 0,
    config: { damping: 14, stiffness: 100 },
  });
  const opacity = interpolate(delayed, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 430,
        left: 64,
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Avatar circle */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #0f766e 100%)`,
          border: `2px solid ${BRAND_LIGHT}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 0 16px ${BRAND_COLOR}60`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#ffffff",
            letterSpacing: 0.5,
          }}
        >
          {HOST_INITIALS}
        </span>
      </div>

      {/* Name + role */}
      <div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#ffffff",
            letterSpacing: -0.3,
          }}
        >
          {HOST_NAME}
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 15,
            color: "rgba(255,255,255,0.48)",
            marginTop: 2,
            letterSpacing: 0.2,
          }}
        >
          {HOST_ROLE}
        </div>
      </div>
    </div>
  );
};

// ── Date/time chip ────────────────────────────────────────────────────────────
const DateTimeChip: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 40);
  const translateX = spring({
    frame: delayed,
    fps,
    from: 120,
    to: 0,
    config: { damping: 15, stiffness: 140 },
  });
  const opacity = interpolate(delayed, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 52,
        right: 64,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: CARD_COLOR,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "12px 22px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Calendar icon placeholder */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            border: `1.5px solid ${BRAND_COLOR}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 8,
              height: 1,
              backgroundColor: BRAND_COLOR,
              marginTop: 3,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: 0.4,
            whiteSpace: "nowrap" as const,
          }}
        >
          {DATE_TIME}
        </span>
      </div>
    </div>
  );
};

// ── Save Your Spot button ─────────────────────────────────────────────────────
const SaveSpotButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 45);
  const scale = spring({
    frame: delayed,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 200, mass: 0.55 },
  });
  const opacity = interpolate(delayed, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shimmer sweep — loops every 60 frames after button appears
  const shimmerProgress = delayed > 20 ? ((frame - 65) % 70) / 70 : -0.5;
  const shimmerX = interpolate(shimmerProgress, [0, 1], [-60, 320], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: 64,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "left bottom",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 14,
          background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #0f766e 100%)`,
          padding: "18px 36px",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          boxShadow: `0 8px 32px ${BRAND_COLOR}50, 0 2px 8px rgba(0,0,0,0.4)`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#ffffff",
            letterSpacing: 0.2,
          }}
        >
          {BUTTON_LABEL}
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 20,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          →
        </span>

        {/* Shimmer sweep */}
        {delayed > 20 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: shimmerX,
              width: 60,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
              transform: "skewX(-18deg)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
};

// ── Live viewer counter ───────────────────────────────────────────────────────
const ViewerCounter: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 50);
  const opacity = interpolate(delayed, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = spring({
    frame: delayed,
    fps,
    from: 16,
    to: 0,
    config: { damping: 14, stiffness: 120 },
  });

  // Animate count from 0 to VIEWER_COUNT over 60 frames
  const countProgress = interpolate(delayed, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const currentCount = Math.floor(countProgress * VIEWER_COUNT);
  const formatted = currentCount.toLocaleString("en-US");

  return (
    <div
      style={{
        position: "absolute",
        bottom: 108,
        right: 64,
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Pulsing dot */}
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          backgroundColor: "#f87171",
          boxShadow: "0 0 8px #f87171",
          flexShrink: 0,
        }}
      />
      <div>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "#ffffff",
            letterSpacing: -0.5,
          }}
        >
          {formatted}
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            marginLeft: 8,
            letterSpacing: 0.3,
          }}
        >
          watching
        </span>
      </div>
    </div>
  );
};

// ── Divider line ──────────────────────────────────────────────────────────────
const DividerLine: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 30);
  const scaleX = spring({
    frame: delayed,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 100 },
  });
  const opacity = interpolate(delayed, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 410,
        left: 64,
        width: 600,
        height: 1,
        opacity,
        transform: `scaleX(${scaleX})`,
        transformOrigin: "left center",
        background: `linear-gradient(90deg, ${BRAND_COLOR}80 0%, transparent 100%)`,
      }}
    />
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export const WebinarPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        overflow: "hidden",
        opacity: globalOpacity,
      }}
    >
      {/* Layer 0 — background glows */}
      <BackgroundGlow frame={frame} />

      {/* Layer 1 — badge */}
      <WebinarBadge frame={frame} fps={fps} />

      {/* Layer 2 — date/time chip */}
      <DateTimeChip frame={frame} fps={fps} />

      {/* Layer 3 — main title */}
      <WebinarTitle frame={frame} fps={fps} />

      {/* Layer 4 — divider */}
      <DividerLine frame={frame} fps={fps} />

      {/* Layer 5 — host info */}
      <HostInfo frame={frame} fps={fps} />

      {/* Layer 6 — CTA button */}
      <SaveSpotButton frame={frame} fps={fps} />

      {/* Layer 7 — viewer counter */}
      <ViewerCounter frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="WebinarPromo"
    component={WebinarPromo}
    durationInFrames={120}
    fps={30}
    width={1280}
    height={720}
  />
);
