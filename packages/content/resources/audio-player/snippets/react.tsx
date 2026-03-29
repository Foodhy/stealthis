import { useRef, useState } from "react";

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

const PLAYLIST = [
  { title: "Midnight Drive", artist: "Lo-fi Collective", duration: "3:42", color: "#bc8cff" },
  { title: "Rain & Coffee", artist: "Chill Vibes", duration: "4:15", color: "#58a6ff" },
  { title: "Golden Hour", artist: "Ambient Works", duration: "5:01", color: "#f1e05a" },
  { title: "Deep Focus", artist: "Study Beats", duration: "6:28", color: "#7ee787" },
];

// Free CC0 sample
const SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export default function AudioPlayerRC() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const track = PLAYLIST[trackIdx];
  const pct = duration ? (currentTime / duration) * 100 : 0;

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function goTo(idx: number) {
    setTrackIdx(idx);
    setCurrentTime(0);
    setPlaying(false);
  }

  function prev() {
    goTo((trackIdx - 1 + PLAYLIST.length) % PLAYLIST.length);
  }
  function next() {
    goTo((trackIdx + 1) % PLAYLIST.length);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
        {/* Album art area */}
        <div
          className="h-40 flex items-center justify-center"
          style={{ background: `${track.color}18` }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
            style={{
              background: track.color,
              transform: playing ? "rotate(5deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
            }}
          >
            🎵
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <p className="text-[#e6edf3] font-bold text-base">{track.title}</p>
            <p className="text-[#8b949e] text-sm">{track.artist}</p>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <audio
              ref={audioRef}
              src={SRC}
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
              onEnded={next}
              volume={volume}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
              }}
              className="w-full h-1 accent-[#58a6ff] cursor-pointer mb-1"
            />
            <div className="flex justify-between text-[11px] text-[#484f58] tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{track.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <button
              onClick={prev}
              className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
              style={{ background: track.color }}
            >
              {playing ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d1117">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d1117">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
            <button
              onClick={next}
              className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <span className="text-xs">🔈</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (audioRef.current) audioRef.current.volume = Number(e.target.value);
              }}
              className="flex-1 h-1 accent-[#8b949e] cursor-pointer"
            />
            <span className="text-xs">🔊</span>
          </div>
        </div>

        {/* Playlist */}
        <div className="border-t border-[#30363d] divide-y divide-[#21262d]">
          {PLAYLIST.map((t, i) => (
            <button
              key={t.title}
              onClick={() => goTo(i)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/[0.03] ${i === trackIdx ? "bg-white/[0.04]" : ""}`}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: `${t.color}30` }}
              >
                {i === trackIdx && playing ? (
                  "▶"
                ) : (
                  <span className="text-[#484f58] text-xs">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm truncate ${i === trackIdx ? "text-[#e6edf3] font-semibold" : "text-[#8b949e]"}`}
                >
                  {t.title}
                </p>
                <p className="text-xs text-[#484f58] truncate">{t.artist}</p>
              </div>
              <span className="text-xs text-[#484f58] tabular-nums">{t.duration}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
