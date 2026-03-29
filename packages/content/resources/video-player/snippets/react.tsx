import { useRef, useState, useCallback } from "react";

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function VideoPlayerRC() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use a free sample video
  const SRC = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  function showCtrl() {
    setShowControls(true);
    if (hideRef.current) clearTimeout(hideRef.current);
    if (playing) hideRef.current = setTimeout(() => setShowControls(false), 2500);
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
      setShowControls(true);
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
  }

  function changeVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setMuted(val === 0);
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function toggleFS() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden group"
        onMouseMove={showCtrl}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={SRC}
          className="w-full aspect-video object-cover"
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
          onEnded={() => {
            setPlaying(false);
            setShowControls(true);
          }}
          muted={muted}
        />

        {/* Play overlay */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        )}

        {/* Controls */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-3 transition-opacity duration-300"
          style={{
            opacity: showControls ? 1 : 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Seek bar */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={seek}
            className="w-full h-1 mb-2 accent-[#58a6ff] cursor-pointer"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-[#58a6ff] transition-colors"
            >
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
            <button
              onClick={toggleMute}
              className="text-white hover:text-[#58a6ff] transition-colors text-xs"
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={changeVolume}
              className="w-16 h-1 accent-[#58a6ff] cursor-pointer"
            />
            <span className="text-white text-xs tabular-nums ml-auto">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button
              onClick={toggleFS}
              className="text-white hover:text-[#58a6ff] text-xs transition-colors"
            >
              ⛶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
