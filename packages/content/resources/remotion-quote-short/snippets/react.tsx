import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const CONFIG = {
  quote: "Code is like humor. When you have to explain it, it's bad.",
  author: "— Cory House",
  footer: "@codeinsights · stealthis.dev",
  bgColor: "#0a0e1a",
  accentColor: "#7c3aed",
  accentColorLight: "#a78bfa",
  textColor: "#ffffff",
  footerColor: "rgba(255,255,255,0.45)",
  quoteMarkOpacity: 0.07,
  // Timings (frames)
  quoteMarkInFrame: 0,
  firstWordFrame: 10,
  wordStagger: 5,
  accentLineFrame: 100,
  authorFrame: 120,
  footerFrame: 180,
  holdStart: 300, // freeze all motion near end
};
// ───────────────────────────────────────────────────────────────────────────────

export const QuoteShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const words = CONFIG.quote.split(" ");

  // ── Background radial glow ──────────────────────────────────────────────────
  const glowOpacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // ── Giant decorative quote mark ─────────────────────────────────────────────
  const quoteMarkOpacity = interpolate(
    frame,
    [CONFIG.quoteMarkInFrame, CONFIG.quoteMarkInFrame + 20],
    [0, CONFIG.quoteMarkOpacity],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const quoteMarkScale = spring({
    frame: Math.max(0, frame - CONFIG.quoteMarkInFrame),
    fps,
    from: 0.4,
    to: 1,
    config: { damping: 16, stiffness: 70 },
  });

  // ── Accent line ─────────────────────────────────────────────────────────────
  const accentLineProgress = spring({
    frame: Math.max(0, frame - CONFIG.accentLineFrame),
    fps,
    from: 0,
    to: 1,
    config: { damping: 22, stiffness: 55 },
  });
  const accentLineWidth = accentLineProgress * 320;

  // ── Author attribution ───────────────────────────────────────────────────────
  const authorProgress = Math.max(0, frame - CONFIG.authorFrame);
  const authorOpacity = interpolate(authorProgress, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const authorY = spring({
    frame: authorProgress,
    fps,
    from: 40,
    to: 0,
    config: { damping: 18, stiffness: 80 },
  });

  // ── Branded footer ───────────────────────────────────────────────────────────
  const footerProgress = Math.max(0, frame - CONFIG.footerFrame);
  const footerOpacity = interpolate(footerProgress, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const footerY = spring({
    frame: footerProgress,
    fps,
    from: 20,
    to: 0,
    config: { damping: 18, stiffness: 90 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CONFIG.bgColor,
        width,
        height,
        overflow: "hidden",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Background radial glow — purple pulse */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CONFIG.accentColor}28 0%, transparent 70%)`,
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Secondary soft glow bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CONFIG.accentColorLight}18 0%, transparent 70%)`,
          opacity: glowOpacity * 0.6,
          pointerEvents: "none",
        }}
      />

      {/* Decorative giant quote mark */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 60,
          opacity: quoteMarkOpacity,
          transform: `scale(${quoteMarkScale})`,
          transformOrigin: "top left",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 380,
            color: CONFIG.textColor,
            lineHeight: 1,
            display: "block",
          }}
        >
          &ldquo;
        </span>
      </div>

      {/* Center content column */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 80px",
        }}
      >
        {/* Quote text — word by word spring reveal */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0 14px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {words.map((word, i) => {
            const delay = CONFIG.firstWordFrame + i * CONFIG.wordStagger;
            const wordProgress = Math.max(0, frame - delay);
            const wordOpacity = interpolate(wordProgress, [0, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const wordY = spring({
              frame: wordProgress,
              fps,
              from: 28,
              to: 0,
              config: { damping: 16, stiffness: 110 },
            });
            return (
              <span
                key={i}
                style={{
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: 700,
                  fontStyle: "italic",
                  fontSize: 72,
                  lineHeight: 1.25,
                  color: CONFIG.textColor,
                  display: "inline-block",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Gradient accent line */}
        <div
          style={{
            width: accentLineWidth,
            height: 4,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${CONFIG.accentColor}, ${CONFIG.accentColorLight})`,
            marginTop: 52,
            marginBottom: 40,
            alignSelf: "center",
          }}
        />

        {/* Author attribution */}
        <div
          style={{
            opacity: authorOpacity,
            transform: `translateY(${authorY}px)`,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 42,
              color: CONFIG.accentColorLight,
              letterSpacing: "0.02em",
            }}
          >
            {CONFIG.author}
          </span>
        </div>
      </div>

      {/* Branded footer */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: footerOpacity,
          transform: `translateY(${footerY}px)`,
        }}
      >
        {/* Footer pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: "rgba(255,255,255,0.06)",
            border: `1px solid rgba(167,139,250,0.2)`,
            borderRadius: 100,
            paddingTop: 14,
            paddingBottom: 14,
            paddingLeft: 36,
            paddingRight: 36,
          }}
        >
          {/* Dot accent */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${CONFIG.accentColor}, ${CONFIG.accentColorLight})`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 500,
              fontSize: 30,
              color: CONFIG.footerColor,
              letterSpacing: "0.03em",
            }}
          >
            {CONFIG.footer}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="QuoteShort"
      component={QuoteShort}
      durationInFrames={360}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
