import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BG = "#1c1917";               // deep warm stone
const AMBER = "#f59e0b";            // primary accent
const AMBER_LIGHT = "#fcd34d";      // lighter amber for glows
const AMBER_DARK = "#b45309";       // dark amber for shadows
const CREAM = "#fef3c7";            // card background
const CREAM_DARK = "#fde68a";       // card secondary
const STONE_700 = "#44403c";        // card text dark
const STONE_500 = "#78716c";        // card text muted
const WHITE = "#ffffff";

const COUPON_CODE = "SAVE20";
const DISCOUNT_TEXT = "20% OFF";
const EXPIRY_TEXT = "Valid until Jun 30";
const STORE_NAME = "StyleShop";
const TAGLINE = "on your next purchase";

// Spring config presets
const CARD_SPRING   = { damping: 12, stiffness: 160, mass: 0.9 };
const BOUNCE_SPRING = { damping: 9,  stiffness: 220, mass: 0.7 };
const SOFT_SPRING   = { damping: 22, stiffness: 80 };
const CONFETTI_SPRING = { damping: 14, stiffness: 120, mass: 0.6 };

// Confetti dot definitions: [angle(deg), distance, color, size]
const CONFETTI_DOTS: Array<[number, number, string, number]> = [
  [20,  210, AMBER,       10],
  [55,  190, "#ef4444",   8 ],
  [90,  220, AMBER_LIGHT, 12],
  [130, 200, "#10b981",   9 ],
  [160, 215, AMBER,       7 ],
  [200, 190, "#6366f1",   11],
  [240, 210, AMBER_LIGHT, 8 ],
  [275, 195, "#ef4444",   10],
  [310, 205, AMBER,       9 ],
  [340, 215, "#10b981",   8 ],
  [38,  165, "#6366f1",   6 ],
  [105, 175, AMBER,       7 ],
  [185, 170, AMBER_LIGHT, 6 ],
  [255, 160, "#ef4444",   7 ],
];

// ─── BACKGROUND LAYER ────────────────────────────────────────────────────────
const Background: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const glowOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Slowly breathing scale for the glow ellipse
  const breathe = interpolate(
    Math.sin((frame / 45) * Math.PI),
    [-1, 1],
    [0.92, 1.08],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      {/* Central warm glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 900,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${AMBER}22 0%, ${AMBER}0a 40%, transparent 70%)`,
          transform: `translate(-50%, -50%) scale(${breathe})`,
          opacity: glowOpacity,
        }}
      />
      {/* Corner warmth top-right */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${AMBER}11 0%, transparent 65%)`,
          opacity: glowOpacity * 0.7,
        }}
      />
      {/* Corner warmth bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${AMBER}0d 0%, transparent 65%)`,
          opacity: glowOpacity * 0.6,
        }}
      />
    </>
  );
};

// ─── SCISSORS ICON ───────────────────────────────────────────────────────────
// Scissors built from two circles + two diagonal lines — no SVG imports.
const Scissors: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const DELAY  = 9;
  const END    = 27;
  const f      = Math.max(0, frame - DELAY);

  // Travel across the perforation line: left-beyond-card → right-beyond-card
  const progress = interpolate(frame, [DELAY, END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Card is 560px wide, centered at 640. Scissors travel from 80px to 1200px.
  const scissorX = interpolate(progress, [0, 1], [80, 1200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Snap opacity: visible during travel, gone before
  const opacity = interpolate(frame, [DELAY - 2, DELAY + 2, END - 2, END + 4], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slight wiggle on X axis gives snip feel
  const wiggle = interpolate(
    Math.sin((frame / 3) * Math.PI),
    [-1, 1],
    [-1.5, 1.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const S = 28; // scissor size scale

  return (
    <div
      style={{
        position: "absolute",
        // Scissors ride on the perforation line: 360 - 18 = top of card is 360, plus ~24px top padding
        top: 337,
        left: scissorX - S,
        opacity,
        transform: `translateY(${wiggle}px)`,
        width: S * 2,
        height: S * 2,
        pointerEvents: "none",
      }}
    >
      {/* Scissor pivot dot */}
      <div
        style={{
          position: "absolute",
          top: S - 5,
          left: S - 5,
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: STONE_700,
        }}
      />
      {/* Upper blade circle */}
      <div
        style={{
          position: "absolute",
          top: S - 18,
          left: S - 4,
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `3px solid ${STONE_700}`,
          backgroundColor: "transparent",
        }}
      />
      {/* Lower blade circle */}
      <div
        style={{
          position: "absolute",
          top: S - 2,
          left: S - 4,
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `3px solid ${STONE_700}`,
          backgroundColor: "transparent",
        }}
      />
      {/* Upper blade line */}
      <div
        style={{
          position: "absolute",
          top: S - 10,
          left: 0,
          width: S - 4,
          height: 3,
          borderRadius: 2,
          backgroundColor: STONE_700,
          transformOrigin: "right center",
          transform: "rotate(-12deg)",
        }}
      />
      {/* Lower blade line */}
      <div
        style={{
          position: "absolute",
          top: S + 8,
          left: 0,
          width: S - 4,
          height: 3,
          borderRadius: 2,
          backgroundColor: STONE_700,
          transformOrigin: "right center",
          transform: "rotate(12deg)",
        }}
      />
    </div>
  );
};

// ─── PERFORATION LINE ────────────────────────────────────────────────────────
// Dashed line at top of coupon. Uses a repeating background gradient trick.
const PerforationLine: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const DELAY = 5;
  const f = Math.max(0, frame - DELAY);
  const opacity = spring({ frame: f, fps, from: 0, to: 1, config: SOFT_SPRING });

  // The cut progress: track the scissors' X position (left=80, right=1200, card width=560, starts at 360-280=80 card-relative)
  const scissorProgress = interpolate(frame, [9, 27], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const cutWidth = scissorProgress * 560; // px of card width that has been "cut"

  return (
    <div
      style={{
        position: "absolute",
        top: 360,
        left: "50%",
        transform: "translateX(-50%)",
        width: 560,
        height: 1,
        opacity,
        pointerEvents: "none",
      }}
    >
      {/* Full dashed line */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(90deg, ${AMBER_DARK} 0px, ${AMBER_DARK} 8px, transparent 8px, transparent 16px)`,
        }}
      />
      {/* "Cut" overlay in lighter amber to show cut progress */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: cutWidth,
          height: 1,
          backgroundImage: `repeating-linear-gradient(90deg, ${AMBER_LIGHT} 0px, ${AMBER_LIGHT} 8px, transparent 8px, transparent 16px)`,
        }}
      />
    </div>
  );
};

// ─── TYPEWRITER CODE ─────────────────────────────────────────────────────────
const TypewriterCode: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const DELAY = 15;
  const f = Math.max(0, frame - DELAY);

  // Reveal one char every 3 frames
  const charsToShow = Math.min(COUPON_CODE.length, Math.floor(f / 3));
  const displayedCode = COUPON_CODE.slice(0, charsToShow);

  // Blink cursor: 1 every 8 frames
  const cursorVisible = charsToShow < COUPON_CODE.length
    ? true
    : Math.floor(frame / 8) % 2 === 0;

  const blockOpacity = interpolate(f, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const labelScale = spring({ frame: f, fps, from: 0.85, to: 1, config: SOFT_SPRING });

  return (
    <div
      style={{
        position: "absolute",
        top: 434,
        left: "50%",
        transform: `translateX(-50%) scale(${labelScale})`,
        opacity: blockOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.3em",
          color: STONE_500,
          textTransform: "uppercase",
        }}
      >
        Your code
      </div>

      {/* Code chip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          backgroundColor: STONE_700,
          borderRadius: 10,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
          minWidth: 180,
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontWeight: 800,
            fontSize: 36,
            letterSpacing: "0.18em",
            color: CREAM,
            lineHeight: 1,
          }}
        >
          {displayedCode}
        </span>
        {/* Blinking cursor */}
        {cursorVisible && charsToShow <= COUPON_CODE.length && (
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: 36,
              backgroundColor: AMBER,
              marginLeft: 3,
              borderRadius: 1,
              verticalAlign: "middle",
            }}
          />
        )}
      </div>
    </div>
  );
};

// ─── DISCOUNT BADGE ("20% OFF") ───────────────────────────────────────────────
const DiscountBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const DELAY = 24;
  const f = Math.max(0, frame - DELAY);

  const scale = spring({ frame: f, fps, from: 0, to: 1, config: BOUNCE_SPRING });
  const opacity = interpolate(f, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle continuous rotation shimmer
  const shimmerAngle = interpolate(
    Math.sin((frame / 20) * Math.PI),
    [-1, 1],
    [-3, 3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 382,
        left: "50%",
        transform: `translateX(-50%) scale(${scale}) rotate(${shimmerAngle}deg)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Main discount text */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 88,
          lineHeight: 1,
          color: AMBER,
          textShadow: `0 0 40px ${AMBER}88, 0 4px 20px rgba(0,0,0,0.4), 0 0 80px ${AMBER}44`,
          letterSpacing: "-0.02em",
        }}
      >
        {DISCOUNT_TEXT}
      </div>
      {/* Tagline below */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 16,
          color: STONE_500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {TAGLINE}
      </div>
    </div>
  );
};

// ─── CONFETTI DOT ────────────────────────────────────────────────────────────
const ConfettiDot: React.FC<{
  angle: number;
  distance: number;
  color: string;
  size: number;
  frame: number;
  fps: number;
}> = ({ angle, distance, color, size, frame, fps }) => {
  const DELAY = 36;
  const f = Math.max(0, frame - DELAY);

  const progress = spring({ frame: f, fps, from: 0, to: 1, config: CONFETTI_SPRING });

  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * distance * progress;
  const y = Math.sin(rad) * distance * progress;

  const opacity = interpolate(f, [0, 5, 50, 60], [0, 1, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Spin as they fly out
  const rotation = interpolate(f, [0, 60], [0, angle * 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Alternate between circle and square
  const isSquare = angle % 70 < 35;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: isSquare ? 2 : "50%",
        transform: `translate(${x - size / 2}px, ${y - size / 2}px) rotate(${rotation}deg)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── COUPON CARD ─────────────────────────────────────────────────────────────
const CouponCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({ frame, fps, from: 0, to: 1, config: CARD_SPRING });
  const opacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const CARD_W = 560;
  const CARD_H = 340;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: CARD_W,
        height: CARD_H,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      {/* Outer glow halo */}
      <div
        style={{
          position: "absolute",
          inset: -12,
          borderRadius: 28,
          background: `radial-gradient(ellipse at center, ${AMBER}22 0%, transparent 70%)`,
          filter: "blur(12px)",
        }}
      />

      {/* Card shadow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4), 0 0 0 2px ${AMBER}33`,
        }}
      />

      {/* Card face */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          backgroundColor: CREAM,
          overflow: "hidden",
          border: `2px dashed ${AMBER_DARK}`,
        }}
      >
        {/* Top stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 80,
            background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 28,
            paddingRight: 28,
          }}
        >
          {/* Store name */}
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: "-0.01em",
              color: WHITE,
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {STORE_NAME}
          </div>
          {/* Tag icon (a small rectangle with a circle hole) */}
          <div
            style={{
              width: 44,
              height: 30,
              borderRadius: 6,
              backgroundColor: "rgba(255,255,255,0.25)",
              border: "2px solid rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.8)",
              }}
            />
          </div>
        </div>

        {/* Bottom left notch (half-circle cutout illusion) */}
        <div
          style={{
            position: "absolute",
            top: 55,
            left: -18,
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: BG,
            border: `2px dashed ${AMBER_DARK}`,
          }}
        />
        {/* Bottom right notch */}
        <div
          style={{
            position: "absolute",
            top: 55,
            right: -18,
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: BG,
            border: `2px dashed ${AMBER_DARK}`,
          }}
        />

        {/* Inner warm tint on lower portion */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: `linear-gradient(180deg, transparent 0%, ${CREAM_DARK}55 100%)`,
          }}
        />

        {/* Subtle pattern dots */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 20 + i * 14,
              right: 24 + ((i * 37) % 60),
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: `${AMBER}55`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── EXPIRY TEXT ─────────────────────────────────────────────────────────────
const ExpiryText: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const DELAY = 50;
  const f = Math.max(0, frame - DELAY);

  const opacity = spring({ frame: f, fps, from: 0, to: 1, config: SOFT_SPRING });
  const translateY = spring({ frame: f, fps, from: 12, to: 0, config: SOFT_SPRING });

  return (
    <div
      style={{
        position: "absolute",
        top: 556,
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Left dash */}
      <div
        style={{
          width: 28,
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${AMBER_DARK})`,
          borderRadius: 1,
        }}
      />
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: "0.1em",
          color: STONE_500,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {EXPIRY_TEXT}
      </div>
      {/* Right dash */}
      <div
        style={{
          width: 28,
          height: 1.5,
          background: `linear-gradient(90deg, ${AMBER_DARK}, transparent)`,
          borderRadius: 1,
        }}
      />
    </div>
  );
};

// ─── STORE BADGE (top label above card) ──────────────────────────────────────
const StoreBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const DELAY = 4;
  const f = Math.max(0, frame - DELAY);

  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = spring({ frame: f, fps, from: -16, to: 0, config: SOFT_SPRING });

  return (
    <div
      style={{
        position: "absolute",
        top: 166,
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Amber dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: AMBER,
          boxShadow: `0 0 10px ${AMBER}aa`,
        }}
      />
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.28em",
          color: AMBER,
          textTransform: "uppercase",
          textShadow: `0 0 14px ${AMBER}77`,
        }}
      >
        Exclusive Offer
      </div>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: AMBER,
          boxShadow: `0 0 10px ${AMBER}aa`,
        }}
      />
    </div>
  );
};

// ─── MAIN COMPOSITION ────────────────────────────────────────────────────────
export const CouponReveal: React.FC = () => {
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
      {/* Layer 0: Ambient background glow */}
      <Background frame={frame} fps={fps} />

      {/* Layer 1: Store badge pill (above card) */}
      <StoreBadge frame={frame} fps={fps} />

      {/* Layer 2: Coupon card body */}
      <CouponCard frame={frame} fps={fps} />

      {/* Layer 3: Perforation dashed line */}
      <PerforationLine frame={frame} fps={fps} />

      {/* Layer 4: Scissors cutting across the perforation */}
      <Scissors frame={frame} fps={fps} />

      {/* Layer 5: Discount badge "20% OFF" */}
      <DiscountBadge frame={frame} fps={fps} />

      {/* Layer 6: Typewriter coupon code */}
      <TypewriterCode frame={frame} fps={fps} />

      {/* Layer 7: Confetti burst */}
      {CONFETTI_DOTS.map(([angle, distance, color, size], i) => (
        <ConfettiDot
          key={i}
          angle={angle}
          distance={distance}
          color={color}
          size={size}
          frame={frame}
          fps={fps}
        />
      ))}

      {/* Layer 8: Expiry text */}
      <ExpiryText frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT ───────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CouponReveal"
      component={CouponReveal}
      durationInFrames={90}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
