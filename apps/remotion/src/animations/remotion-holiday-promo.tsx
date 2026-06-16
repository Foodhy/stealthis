import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from "remotion";

// ─── Customizable constants ──────────────────────────────────────────────────
const HEADLINE = "Happy Holidays";
const OFFER_LINE1 = "25% off everything";
const OFFER_LINE2 = "Use code HOLIDAY25";
const PROMO_CODE = "HOLIDAY25";
const DURATION_FRAMES = 150;

// Palette
const BG = "#111827";
const GREEN_DARK = "#14532d";
const GREEN = "#166534";
const GREEN_LIGHT = "#16a34a";
const GOLD = "#fbbf24";
const GOLD_LIGHT = "#fde68a";
const WHITE = "#ffffff";
const RED_RIBBON = "#dc2626";

// Snowflake data: [x%, speed_multiplier, size, opacity, phase_offset]
const SNOWFLAKES: [number, number, number, number, number][] = [
  [8, 1.0, 18, 0.7, 0],
  [22, 0.7, 12, 0.5, 15],
  [38, 1.3, 22, 0.8, 5],
  [55, 0.85, 14, 0.6, 25],
  [70, 1.15, 20, 0.75, 10],
  [84, 0.65, 16, 0.55, 35],
  [93, 1.05, 10, 0.45, 20],
];

// ─── Snowflake particle ───────────────────────────────────────────────────────
const Snowflake: React.FC<{
  x: number;
  speedMult: number;
  size: number;
  baseOpacity: number;
  phaseOffset: number;
  frame: number;
}> = ({ x, speedMult, size, baseOpacity, phaseOffset, frame }) => {
  const f = Math.max(0, frame - phaseOffset);

  // Drift Y: start above top (-80px), drift to 820px over the full duration
  const yPos = interpolate(f, [0, DURATION_FRAMES * speedMult], [-80, 820], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle horizontal sway using a sine-like pattern via interpolate
  const swayPhase = (f * 0.04 * speedMult) % (Math.PI * 2);
  const swaySegments = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  const swayValues = [0, 12, 0, -12, 0, 12, 0, -12, 0];
  const swayX = interpolate(
    swayPhase,
    swaySegments,
    swayValues,
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const fadeIn = interpolate(f, [0, 12], [0, baseOpacity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: 0,
        transform: `translate(${swayX}px, ${yPos}px)`,
        opacity: fadeIn,
        pointerEvents: "none",
      }}
    >
      {/* Snowflake using unicode + layered divs */}
      <div
        style={{
          width: size,
          height: size,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Horizontal bar */}
        <div
          style={{
            position: "absolute",
            width: size,
            height: size * 0.1,
            backgroundColor: WHITE,
            borderRadius: 2,
          }}
        />
        {/* Vertical bar */}
        <div
          style={{
            position: "absolute",
            width: size * 0.1,
            height: size,
            backgroundColor: WHITE,
            borderRadius: 2,
          }}
        />
        {/* Diagonal 45° */}
        <div
          style={{
            position: "absolute",
            width: size,
            height: size * 0.1,
            backgroundColor: WHITE,
            borderRadius: 2,
            transform: "rotate(45deg)",
          }}
        />
        {/* Diagonal 135° */}
        <div
          style={{
            position: "absolute",
            width: size,
            height: size * 0.1,
            backgroundColor: WHITE,
            borderRadius: 2,
            transform: "rotate(-45deg)",
          }}
        />
        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: "50%",
            backgroundColor: GOLD_LIGHT,
          }}
        />
      </div>
    </div>
  );
};

// ─── Background glows ─────────────────────────────────────────────────────────
const BackgroundScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const glowScale = spring({
    frame,
    fps,
    from: 0.4,
    to: 1,
    config: { damping: 30, stiffness: 60 },
  });

  const glowOpacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Secondary glow pulses gently
  const pulse = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.6, 1.0, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      {/* Deep green radial bloom — center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 1100,
          height: 600,
          transform: `translate(-50%, -50%) scale(${glowScale})`,
          background: `radial-gradient(ellipse at center, ${GREEN}55 0%, ${GREEN_DARK}22 45%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />
      {/* Gold accent glow — upper center */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          width: 600,
          height: 300,
          transform: `translate(-50%, -50%) scale(${glowScale * pulse})`,
          background: `radial-gradient(ellipse at center, ${GOLD}30 0%, transparent 65%)`,
          opacity: glowOpacity * 0.8,
        }}
      />
      {/* Bottom vignette */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 180,
          background: `linear-gradient(to top, ${BG} 0%, transparent 100%)`,
        }}
      />
      {/* Top vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          background: `linear-gradient(to bottom, ${BG} 0%, transparent 100%)`,
        }}
      />
    </>
  );
};

// ─── Headline type-on ─────────────────────────────────────────────────────────
const Headline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const chars = HEADLINE.split("");
  const CHAR_DELAY = 3; // frames between each character appearing
  const START_FRAME = 15;

  const containerY = spring({
    frame: Math.max(0, frame - START_FRAME),
    fps,
    from: 40,
    to: 0,
    config: { damping: 18, stiffness: 80 },
  });

  const containerOpacity = interpolate(frame, [START_FRAME, START_FRAME + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow grows as more characters appear
  const charsVisible = Math.floor((frame - START_FRAME) / CHAR_DELAY);
  const glowIntensity = interpolate(
    charsVisible,
    [0, chars.length],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transform: `translateY(${containerY}px)`,
        opacity: containerOpacity,
      }}
    >
      {/* Decorative top line */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 8,
        }}
      >
        <div style={{ width: 60, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: GOLD,
            boxShadow: `0 0 8px ${GOLD}`,
          }}
        />
        <div style={{ width: 60, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
      </div>

      {/* Headline characters */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          filter: `drop-shadow(0 0 ${40 * glowIntensity}px ${GOLD}60)`,
        }}
      >
        {chars.map((char, i) => {
          const charFrame = Math.max(0, frame - START_FRAME - i * CHAR_DELAY);
          const charOpacity = interpolate(charFrame, [0, 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const charY = interpolate(charFrame, [0, 10], [-16, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(2)),
          });
          const charScale = interpolate(charFrame, [0, 8], [0.6, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <span
              key={i}
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 800,
                fontSize: char === " " ? 24 : 80,
                color: WHITE,
                letterSpacing: -1,
                opacity: charOpacity,
                transform: `translateY(${charY}px) scale(${charScale})`,
                display: "inline-block",
                textShadow: `0 0 30px ${GOLD}80`,
                width: char === " " ? 22 : "auto",
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Subtitle badge */}
      {(() => {
        const badgeOpacity = interpolate(frame, [START_FRAME + chars.length * CHAR_DELAY, START_FRAME + chars.length * CHAR_DELAY + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            style={{
              marginTop: 4,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 999,
              border: `1px solid ${GOLD}55`,
              background: `${GOLD}15`,
              opacity: badgeOpacity,
            }}
          >
            <span
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 16,
                color: GOLD_LIGHT,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Season's Greetings
            </span>
          </div>
        );
      })()}
    </div>
  );
};

// ─── Gift Box ─────────────────────────────────────────────────────────────────
const GiftBox: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ENTER_FRAME = 45;
  const LID_OPEN_FRAME = 75;

  // Box entrance spring
  const boxY = spring({
    frame: Math.max(0, frame - ENTER_FRAME),
    fps,
    from: 80,
    to: 0,
    config: { damping: 14, stiffness: 90 },
  });
  const boxScale = spring({
    frame: Math.max(0, frame - ENTER_FRAME),
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 14, stiffness: 90 },
  });
  const boxOpacity = interpolate(frame, [ENTER_FRAME, ENTER_FRAME + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Lid springs open
  const lidY = spring({
    frame: Math.max(0, frame - LID_OPEN_FRAME),
    fps,
    from: 0,
    to: -54,
    config: { damping: 8, stiffness: 120 },
  });
  const lidRotate = spring({
    frame: Math.max(0, frame - LID_OPEN_FRAME),
    fps,
    from: 0,
    to: -18,
    config: { damping: 8, stiffness: 120 },
  });

  // Sparkle burst when lid opens
  const sparkleOpacity = interpolate(
    Math.max(0, frame - LID_OPEN_FRAME),
    [0, 5, 15, 25],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const sparkleScale = spring({
    frame: Math.max(0, frame - LID_OPEN_FRAME),
    fps,
    from: 0.3,
    to: 1.8,
    config: { damping: 6, stiffness: 200 },
  });

  // Gentle float after entrance
  const floatY = interpolate(
    frame % 90,
    [0, 45, 90],
    [0, -6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) }
  );

  const BOX_W = 140;
  const BOX_H = 110;
  const LID_H = 36;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) translateY(${boxY + floatY + 80}px) scale(${boxScale})`,
        opacity: boxOpacity,
      }}
    >
      {/* Shadow */}
      <div
        style={{
          position: "absolute",
          bottom: -14,
          left: "50%",
          transform: "translateX(-50%)",
          width: BOX_W * 0.9,
          height: 14,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          filter: "blur(8px)",
        }}
      />

      {/* Sparkle burst */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: `translate(-50%, -50%) scale(${sparkleScale})`,
          opacity: sparkleOpacity,
          width: 120,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <div
            key={angle}
            style={{
              position: "absolute",
              width: 2,
              height: 30,
              backgroundColor: GOLD,
              borderRadius: 2,
              transform: `rotate(${angle}deg) translateY(-20px)`,
              transformOrigin: "center bottom",
              boxShadow: `0 0 6px ${GOLD}`,
            }}
          />
        ))}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: GOLD_LIGHT,
            boxShadow: `0 0 16px ${GOLD_LIGHT}`,
          }}
        />
      </div>

      {/* Lid */}
      <div
        style={{
          position: "absolute",
          top: -(LID_H - 4),
          left: -8,
          width: BOX_W + 16,
          height: LID_H,
          backgroundColor: GREEN,
          borderRadius: "6px 6px 0 0",
          border: `2px solid ${GREEN_LIGHT}`,
          transform: `translateY(${lidY}px) rotate(${lidRotate}deg)`,
          transformOrigin: "right center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 -4px 20px ${GREEN}80`,
          zIndex: 10,
        }}
      >
        {/* Ribbon on lid */}
        <div
          style={{
            width: 16,
            height: "100%",
            backgroundColor: RED_RIBBON,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Box body */}
      <div
        style={{
          width: BOX_W,
          height: BOX_H,
          backgroundColor: GREEN_DARK,
          border: `2px solid ${GREEN_LIGHT}40`,
          borderRadius: "0 0 8px 8px",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 ${GREEN_LIGHT}20`,
        }}
      >
        {/* Vertical ribbon stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 16,
            backgroundColor: RED_RIBBON,
            opacity: 0.9,
          }}
        />
        {/* Horizontal ribbon stripe */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "30%",
            height: 16,
            backgroundColor: RED_RIBBON,
            opacity: 0.9,
          }}
        />
        {/* Star pattern overlay */}
        {[
          { x: 20, y: 20 }, { x: 110, y: 20 },
          { x: 20, y: 75 }, { x: 110, y: 75 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: 8,
              height: 8,
              backgroundColor: GOLD,
              opacity: 0.5,
              borderRadius: 1,
              transform: "rotate(45deg)",
            }}
          />
        ))}
      </div>

      {/* Bow on top center */}
      <div
        style={{
          position: "absolute",
          top: -(LID_H - 4) + lidY,
          left: "50%",
          transform: `translateX(-50%) rotate(${lidRotate}deg)`,
          transformOrigin: "right center",
          display: "flex",
          gap: 2,
          zIndex: 11,
        }}
      >
        {/* Left loop */}
        <div
          style={{
            width: 24,
            height: 18,
            border: `3px solid ${GOLD}`,
            borderRadius: "50% 0 0 50%",
            borderRight: "none",
            transform: "rotate(-20deg)",
            boxShadow: `0 0 8px ${GOLD}80`,
          }}
        />
        {/* Center knot */}
        <div
          style={{
            width: 10,
            height: 10,
            backgroundColor: GOLD,
            borderRadius: "50%",
            alignSelf: "center",
            boxShadow: `0 0 10px ${GOLD}`,
          }}
        />
        {/* Right loop */}
        <div
          style={{
            width: 24,
            height: 18,
            border: `3px solid ${GOLD}`,
            borderRadius: "0 50% 50% 0",
            borderLeft: "none",
            transform: "rotate(20deg)",
            boxShadow: `0 0 8px ${GOLD}80`,
          }}
        />
      </div>
    </div>
  );
};

// ─── Offer text ───────────────────────────────────────────────────────────────
const OfferText: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const LINE1_FRAME = 105;
  const LINE2_FRAME = 118;
  const CODE_FRAME = 128;

  const makeLine = (startFrame: number) => {
    const f = Math.max(0, frame - startFrame);
    const opacity = interpolate(f, [0, 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const y = spring({ frame: f, fps, from: 24, to: 0, config: { damping: 18, stiffness: 100 } });
    return { opacity, y };
  };

  const line1 = makeLine(LINE1_FRAME);
  const line2 = makeLine(LINE2_FRAME);
  const codeAnim = makeLine(CODE_FRAME);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Offer line 1 */}
      <div
        style={{
          opacity: line1.opacity,
          transform: `translateY(${line1.y}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 38,
            color: WHITE,
            letterSpacing: -0.5,
            textShadow: `0 0 20px ${WHITE}40`,
          }}
        >
          {OFFER_LINE1}
        </span>
      </div>

      {/* Offer line 2 */}
      <div
        style={{
          opacity: line2.opacity,
          transform: `translateY(${line2.y}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 20,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: 0.5,
          }}
        >
          {OFFER_LINE2}
        </span>
      </div>

      {/* Promo code badge */}
      <div
        style={{
          opacity: codeAnim.opacity,
          transform: `translateY(${codeAnim.y}px)`,
          marginTop: 6,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 40, height: 1, backgroundColor: `${GOLD}80` }} />
        <div
          style={{
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 8,
            paddingBottom: 8,
            borderRadius: 8,
            backgroundColor: GOLD,
            boxShadow: `0 0 24px ${GOLD}60, 0 4px 12px rgba(0,0,0,0.4)`,
          }}
        >
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontWeight: 800,
              fontSize: 20,
              color: "#1c1917",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {PROMO_CODE}
          </span>
        </div>
        <div style={{ width: 40, height: 1, backgroundColor: `${GOLD}80` }} />
      </div>
    </div>
  );
};

// ─── Side decorations ─────────────────────────────────────────────────────────
const SideDecorations: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const leftScale = spring({
    frame: Math.max(0, frame - 20),
    fps,
    from: 0,
    to: 1,
    config: { damping: 16, stiffness: 70 },
  });
  const rightScale = spring({
    frame: Math.max(0, frame - 30),
    fps,
    from: 0,
    to: 1,
    config: { damping: 16, stiffness: 70 },
  });

  const renderHollySprig = (side: "left" | "right", scale: number) => {
    const flip = side === "right" ? "scaleX(-1)" : "";
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          [side]: 60,
          transform: `translateY(-50%) ${flip} scale(${scale})`,
          transformOrigin: side === "left" ? "left center" : "right center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: 0.8,
        }}
      >
        {/* Holly leaves */}
        {[[-14, -10], [14, -10], [-10, 10], [10, 10]].map(([lx, ly], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 40 + lx,
              top: 40 + ly,
              width: 28,
              height: 16,
              backgroundColor: GREEN_LIGHT,
              borderRadius: "50%",
              transform: `rotate(${lx > 0 ? 20 : -20}deg)`,
              boxShadow: `0 0 6px ${GREEN_LIGHT}80`,
            }}
          />
        ))}
        {/* Berries */}
        {[[-6, -2], [0, -6], [6, -2]].map(([bx, by], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 40 + bx + 8,
              top: 38 + by,
              width: 10,
              height: 10,
              backgroundColor: RED_RIBBON,
              borderRadius: "50%",
              boxShadow: `0 0 6px ${RED_RIBBON}80`,
            }}
          />
        ))}
        {/* Stem */}
        <div
          style={{
            position: "absolute",
            left: 46,
            top: 30,
            width: 2,
            height: 30,
            backgroundColor: GREEN_DARK,
            borderRadius: 2,
          }}
        />
      </div>
    );
  };

  return (
    <>
      {renderHollySprig("left", leftScale)}
      {renderHollySprig("right", rightScale)}

      {/* Corner ornaments */}
      {[
        { top: 30, left: 30 },
        { top: 30, right: 30 },
        { bottom: 30, left: 30 },
        { bottom: 30, right: 30 },
      ].map((pos, i) => {
        const delay = 5 + i * 8;
        const ornScale = spring({
          frame: Math.max(0, frame - delay),
          fps,
          from: 0,
          to: 1,
          config: { damping: 14, stiffness: 120 },
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              transform: `scale(${ornScale})`,
              transformOrigin: "center",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: `2px solid ${GOLD}60`,
                boxShadow: `0 0 10px ${GOLD}40`,
              }}
            />
          </div>
        );
      })}
    </>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const HolidayPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out in last 20 frames
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: globalOpacity }}>
      {/* Layer 0: Background glows */}
      <BackgroundScene frame={frame} fps={fps} />

      {/* Layer 1: Snowflakes */}
      {SNOWFLAKES.map(([x, speed, size, opacity, phase], i) => (
        <Snowflake
          key={i}
          x={x}
          speedMult={speed}
          size={size}
          baseOpacity={opacity}
          phaseOffset={phase}
          frame={frame}
        />
      ))}

      {/* Layer 2: Side decorations */}
      <SideDecorations frame={frame} fps={fps} />

      {/* Layer 3: Headline */}
      <Headline frame={frame} fps={fps} />

      {/* Layer 4: Gift box (center) */}
      <GiftBox frame={frame} fps={fps} />

      {/* Layer 5: Offer text */}
      <OfferText frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// ─── Remotion root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="HolidayPromo"
    component={HolidayPromo}
    durationInFrames={150}
    fps={30}
    width={1280}
    height={720}
  />
);
