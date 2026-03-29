import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const TITLE = "Global Presence";
const SUBTITLE = "Active in 6 locations worldwide";
const PINS = [
  { x: 22, y: 35, city: "New York", users: "2.4K", delay: 20 },
  { x: 48, y: 30, city: "London", users: "1.8K", delay: 30 },
  { x: 55, y: 38, city: "Berlin", users: "950", delay: 40 },
  { x: 72, y: 42, city: "Tokyo", users: "3.1K", delay: 50 },
  { x: 62, y: 58, city: "Mumbai", users: "1.2K", delay: 60 },
  { x: 80, y: 65, city: "Sydney", users: "780", delay: 70 },
];
const ACCENT = "#06b6d4";

const Pin: React.FC<{ pin: (typeof PINS)[number]; frame: number; fps: number }> = ({
  pin,
  frame,
  fps,
}) => {
  const f = Math.max(0, frame - pin.delay);
  const drop = spring({ frame: f, fps, from: -30, to: 0, config: { damping: 10, stiffness: 200 } });
  const opacity = interpolate(f, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 10, stiffness: 180 } });

  // Ripple
  const rippleScale = interpolate(f, [5, 30], [0.5, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rippleOpacity = interpolate(f, [5, 30], [0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Label
  const labelOpacity = interpolate(f, [10, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${pin.x}%`,
        top: `${pin.y}%`,
        transform: `translate(-50%, -50%) translateY(${drop}px)`,
        opacity,
      }}
    >
      {/* Ripple */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `2px solid ${ACCENT}`,
          transform: `translate(-50%, -50%) scale(${rippleScale})`,
          opacity: rippleOpacity,
        }}
      />
      {/* Pin dot */}
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          backgroundColor: ACCENT,
          boxShadow: `0 0 16px ${ACCENT}80`,
          transform: `scale(${scale})`,
        }}
      />
      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          opacity: labelOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "#ffffff",
          }}
        >
          {pin.city}
        </span>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 12,
            color: ACCENT,
          }}
        >
          {pin.users} users
        </span>
      </div>
    </div>
  );
};

export const MapPins: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({ frame, fps, from: -15, to: 0, config: { damping: 14, stiffness: 80 } });

  // Grid lines fade in
  const gridOpacity = interpolate(frame, [5, 25], [0, 0.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,${gridOpacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${gridOpacity}) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Map area outline */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 60,
          right: 60,
          bottom: 60,
          border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Connection lines between pins */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {PINS.slice(0, -1).map((pin, i) => {
            const next = PINS[i + 1];
            const lineOpacity = interpolate(
              Math.max(0, frame - (next.delay + 10)),
              [0, 15],
              [0, 0.12],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <line
                key={i}
                x1={`${pin.x}%`}
                y1={`${pin.y}%`}
                x2={`${next.x}%`}
                y2={`${next.y}%`}
                stroke={ACCENT}
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={lineOpacity}
              />
            );
          })}
        </svg>

        {PINS.map((pin, i) => (
          <Pin key={i} pin={pin} frame={frame} fps={fps} />
        ))}
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 36,
            color: "#ffffff",
            letterSpacing: -1,
          }}
        >
          {TITLE}
        </span>
        <div style={{ marginTop: 6 }}>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {SUBTITLE}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
