import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const LINE_COLOR = "#6366f1";
const STAGGER_FRAMES = 48;
const EVENTS = [
  { year: "2022", title: "Founded", description: "Company started in a garage" },
  { year: "2023", title: "Launch", description: "v1.0 shipped to 100 users" },
  { year: "2024", title: "Scale", description: "1 million users milestone" },
  { year: "2025", title: "Global", description: "Expanded to 10 countries" },
];

export const AnimatedTimeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const CENTER_Y = height / 2;
  const PADDING_X = 140;
  const spacing = (width - PADDING_X * 2) / (EVENTS.length - 1);
  const nodeXs = EVENTS.map((_, i) => PADDING_X + i * spacing);

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const axisProgress = interpolate(frame, [5, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 900,
          height: 400,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse, ${LINE_COLOR}12 0%, transparent 70%)`,
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 36,
            color: "#ffffff",
          }}
        >
          Our Journey
        </div>
        <div
          style={{
            width: 40,
            height: 3,
            backgroundColor: LINE_COLOR,
            borderRadius: 2,
            margin: "10px auto 0",
          }}
        />
      </div>

      {/* SVG lines and dots */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Main axis */}
        <line
          x1={PADDING_X}
          y1={CENTER_Y}
          x2={PADDING_X + (width - PADDING_X * 2) * axisProgress}
          y2={CENTER_Y}
          stroke={LINE_COLOR}
          strokeWidth={2}
          opacity={0.3}
        />

        {EVENTS.map((event, i) => {
          const delay = i * STAGGER_FRAMES;
          const f = Math.max(0, frame - delay);
          const dotScale = spring({
            frame: f,
            fps,
            from: 0,
            to: 1,
            config: { damping: 8, stiffness: 220, mass: 0.5 },
          });
          const contentOpacity = interpolate(f, [10, 28], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isAbove = i % 2 === 0;
          const x = nodeXs[i];

          return (
            <g key={event.year}>
              {i < EVENTS.length - 1 &&
                (() => {
                  const lineDelay = (i + 1) * STAGGER_FRAMES - STAGGER_FRAMES / 2;
                  const lf = Math.max(0, frame - lineDelay);
                  const lineProgress = interpolate(lf, [0, STAGGER_FRAMES / 2], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.out(Easing.quad),
                  });
                  const drawnX = x + (nodeXs[i + 1] - x) * lineProgress;
                  return (
                    <line
                      x1={x}
                      y1={CENTER_Y}
                      x2={drawnX}
                      y2={CENTER_Y}
                      stroke={LINE_COLOR}
                      strokeWidth={2}
                      opacity={0.4}
                    />
                  );
                })()}
              <line
                x1={x}
                y1={CENTER_Y}
                x2={x}
                y2={CENTER_Y + (isAbove ? -40 : 40)}
                stroke={LINE_COLOR}
                strokeWidth={1.5}
                opacity={contentOpacity as unknown as number}
              />
              <circle
                cx={x}
                cy={CENTER_Y}
                r={12 * dotScale}
                fill={LINE_COLOR}
                style={{ filter: `drop-shadow(0 0 8px ${LINE_COLOR})` }}
              />
              <circle cx={x} cy={CENTER_Y} r={5 * dotScale} fill="#ffffff" />
            </g>
          );
        })}
      </svg>

      {/* HTML labels */}
      {EVENTS.map((event, i) => {
        const delay = i * STAGGER_FRAMES + 10;
        const f = Math.max(0, frame - delay);
        const opacity = interpolate(f, [0, 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isAbove = i % 2 === 0;
        const x = nodeXs[i];
        const topPx = isAbove ? CENTER_Y - 180 : CENTER_Y + 70;
        const translateY = spring({
          frame: f,
          fps,
          from: isAbove ? -12 : 12,
          to: 0,
          config: { damping: 14, stiffness: 80 },
        });

        return (
          <div
            key={event.year}
            style={{
              position: "absolute",
              left: x - 70,
              top: topPx,
              width: 140,
              textAlign: "center",
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: LINE_COLOR,
                marginBottom: 4,
              }}
            >
              {event.year}
            </div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: "#ffffff",
                marginBottom: 4,
              }}
            >
              {event.title}
            </div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.4,
              }}
            >
              {event.description}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
