import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const HEADLINE = "Ready to level up?";
const SUBTEXT = "Join 10,000+ developers already inside.";
const BUTTON_LABEL = "Get Started Free";
const BRAND_COLOR = "#6366f1";

export const CTAAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineTX = spring({
    frame,
    fps,
    from: -60,
    to: 0,
    config: { damping: 16, stiffness: 120 },
  });
  const headlineOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subOpacity = interpolate(Math.max(0, frame - 15), [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const btnScale = spring({
    frame: Math.max(0, frame - 30),
    fps,
    from: 0,
    to: 1,
    config: { damping: 11, stiffness: 180, mass: 0.6 },
  });

  const shimmerX = interpolate((frame - 60) % 60, [0, 60], [-200, 420], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showShimmer = frame > 60;

  const arrowOpacity = interpolate(Math.max(0, frame - 45), [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bounce = frame > 60 ? Math.sin(((frame - 60) / 18) * Math.PI) * 8 : 0;

  const globalOpacity = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: globalOpacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${BRAND_COLOR}20 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          opacity: headlineOpacity,
          transform: `translateX(${headlineTX}px)`,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 64,
          color: "#ffffff",
          letterSpacing: -2,
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        {HEADLINE}
      </div>

      <div
        style={{
          opacity: subOpacity,
          fontFamily: "system-ui, sans-serif",
          fontSize: 24,
          color: "rgba(255,255,255,0.55)",
          textAlign: "center",
          marginTop: 16,
        }}
      >
        {SUBTEXT}
      </div>

      <div
        style={{
          marginTop: 40,
          transform: `scale(${btnScale})`,
          position: "relative",
          overflow: "hidden",
          borderRadius: 50,
        }}
      >
        <div
          style={{
            backgroundColor: BRAND_COLOR,
            borderRadius: 50,
            padding: "20px 52px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "#ffffff",
            }}
          >
            {BUTTON_LABEL}
          </div>
          <div style={{ fontSize: 22, color: "#ffffff" }}>→</div>
          {showShimmer && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: shimmerX,
                width: 80,
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                transform: "skewX(-15deg)",
              }}
            />
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          opacity: arrowOpacity,
          transform: `translateX(${bounce}px)`,
          fontSize: 32,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        ›
      </div>
    </AbsoluteFill>
  );
};
