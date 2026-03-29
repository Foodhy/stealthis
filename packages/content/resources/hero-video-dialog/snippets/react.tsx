import { useState, useRef, useEffect, useCallback } from "react";

interface HeroVideoDialogProps {
  videoSrc?: string;
  thumbnailSrc?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}

export default function HeroVideoDialog({
  videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  thumbnailSrc,
  title = "Experience the Future",
  subtitle = "Watch our latest product showcase and see what's possible.",
  badge = "New Release",
}: HeroVideoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    videoRef.current?.pause();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      videoRef.current?.play().catch(() => {});
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) close();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <div
        style={{
          width: "min(700px, 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2.5rem",
        }}
      >
        {/* Hero text */}
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          {badge && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#a78bfa",
                background: "rgba(167,139,250,0.1)",
                padding: "0.25rem 0.75rem",
                borderRadius: 999,
                border: "1px solid rgba(167,139,250,0.2)",
              }}
            >
              {badge}
            </span>
          )}
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#f8fafc", lineHeight: 1.1 }}>
            {title}
          </h1>
          <p style={{ fontSize: "1rem", color: "#94a3b8", maxWidth: 440, lineHeight: 1.6 }}>
            {subtitle}
          </p>
        </div>

        {/* Thumbnail */}
        <div
          onClick={open}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: "1rem",
            overflow: "hidden",
            cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.08)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.01)";
            e.currentTarget.style.boxShadow = "0 20px 60px rgba(99,102,241,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt="Video thumbnail"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)",
              }}
            />
          )}

          {/* Play button */}
          <button
            aria-label="Play video"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#fff",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              zIndex: 2,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "2rem",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>

          {/* Backdrop */}
          <div
            onClick={close}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              width: "min(900px, 100%)",
              zIndex: 1,
              animation: "scaleIn 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <button
              onClick={close}
              aria-label="Close video"
              style={{
                position: "absolute",
                top: "-2.5rem",
                right: 0,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "0.5rem",
                color: "#f1f5f9",
                cursor: "pointer",
                padding: "0.35rem",
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div
              style={{
                borderRadius: "0.875rem",
                overflow: "hidden",
                background: "#000",
                boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
              }}
            >
              <video
                ref={videoRef}
                controls
                preload="metadata"
                style={{ width: "100%", display: "block", borderRadius: "0.75rem" }}
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
