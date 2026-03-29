import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const NAME = "Jane Doe";
const TITLE_TEXT = "Senior Product Designer";
const ACCENT_COLOR = "#6366f1";
const HOLD_END = 105;
const DURATION = 120;

export const LowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    from: -340,
    to: 0,
    config: { damping: 20, stiffness: 160 },
  });
  const slideOut =
    frame >= HOLD_END
      ? spring({
          frame: frame - HOLD_END,
          fps,
          from: 0,
          to: -340,
          config: { damping: 20, stiffness: 160 },
        })
      : 0;
  const translateX = frame < HOLD_END ? slideIn : slideOut;

  const barScaleX =
    frame < HOLD_END
      ? interpolate(frame, [5, 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        })
      : interpolate(frame, [HOLD_END, DURATION], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const textOpacity = interpolate(frame, [12, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 60,
          transform: `translateX(${translateX}px)`,
        }}
      >
        <div
          style={{
            width: 280,
            height: 4,
            backgroundColor: ACCENT_COLOR,
            borderRadius: 2,
            transformOrigin: "left center",
            transform: `scaleX(${barScaleX})`,
            marginBottom: 10,
          }}
        />
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.82)",
            padding: "14px 24px 16px",
            borderLeft: `4px solid ${ACCENT_COLOR}`,
            opacity: textOpacity,
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 28,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            {NAME}
          </div>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 15,
              color: "rgba(255,255,255,0.65)",
              marginTop: 4,
            }}
          >
            {TITLE_TEXT}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
