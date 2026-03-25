import { useState, useRef, useEffect } from "react";

interface VideoTextProps {
  text?: string;
  videoSrc?: string;
}

export default function VideoText({
  text = "STEAL\nTHIS",
  videoSrc,
}: VideoTextProps) {
  const [useFallback, setUseFallback] = useState(!videoSrc);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => setUseFallback(true));
    }
  }, [videoSrc]);

  const lines = text.split("\n");

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      {/* Media layer */}
      {useFallback ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(135deg, #a78bfa 0%, #ec4899 25%, #f59e0b 50%, #10b981 75%, #3b82f6 100%)",
            backgroundSize: "400% 400%",
            animation: "videoTextGradient 8s ease infinite",
          }}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setUseFallback(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />
      )}

      {/* Text overlay */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          mixBlendMode: "screen",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(4rem, 15vw, 12rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: "#fff",
            textAlign: "center",
            textTransform: "uppercase",
            lineHeight: 0.9,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {lines.map((line, i) => (
            <span key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </h1>
      </div>

      {/* Subtle scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />

      <style>{`
        @keyframes videoTextGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
