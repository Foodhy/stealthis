<script>
let audioEl;
let epIdx = 0;
let playing = false;
let currentTime = 0;
let duration = 0;
let speed = 1;
let speedIdx = 1;

const EPISODES = [
  {
    id: 1,
    title: "Building Scalable APIs",
    episode: "EP 42",
    duration: "58:22",
    date: "Mar 4, 2026",
  },
  {
    id: 2,
    title: "The Future of AI Development",
    episode: "EP 41",
    duration: "1:12:14",
    date: "Feb 25, 2026",
  },
  {
    id: 3,
    title: "CSS Architecture at Scale",
    episode: "EP 40",
    duration: "45:51",
    date: "Feb 18, 2026",
  },
];

const SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

$: ep = EPISODES[epIdx];
$: pct = duration ? (currentTime / duration) * 100 : 0;

function formatTime(s) {
  if (!isFinite(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function togglePlay() {
  if (!audioEl) return;
  if (audioEl.paused) {
    audioEl.play();
    playing = true;
  } else {
    audioEl.pause();
    playing = false;
  }
}

function skip(secs) {
  if (!audioEl) return;
  audioEl.currentTime = Math.max(0, Math.min(audioEl.duration, audioEl.currentTime + secs));
}

function cycleSpeed() {
  const next = (speedIdx + 1) % SPEEDS.length;
  speedIdx = next;
  speed = SPEEDS[next];
  if (audioEl) audioEl.playbackRate = SPEEDS[next];
}

function playEp(idx) {
  epIdx = idx;
  currentTime = 0;
  playing = false;
}

function onTimeUpdate() {
  currentTime = audioEl?.currentTime ?? 0;
}

function onLoadedMetadata() {
  duration = audioEl?.duration ?? 0;
}

function onEnded() {
  playing = false;
}

function onSeek(e) {
  if (audioEl) audioEl.currentTime = Number(e.target.value);
}
</script>

<div class="min-h-screen bg-[#0d1117] flex justify-center p-6">
  <div class="w-full max-w-sm">
    <!-- Current episode player -->
    <div class="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 mb-4">
      <div class="flex items-start gap-4 mb-5">
        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#bc8cff] to-[#58a6ff] flex items-center justify-center text-2xl flex-shrink-0">
          🎙️
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[10px] text-[#bc8cff] font-semibold uppercase tracking-wider mb-0.5">{ep.episode}</p>
          <p class="text-[#e6edf3] font-bold text-sm leading-snug">{ep.title}</p>
          <p class="text-[#484f58] text-xs mt-0.5">Dev.Talks · {ep.date}</p>
        </div>
      </div>

      <audio
        bind:this={audioEl}
        src={SRC}
        on:timeupdate={onTimeUpdate}
        on:loadedmetadata={onLoadedMetadata}
        on:ended={onEnded}
      />

      <!-- Seek -->
      <input
        type="range" min={0} max={duration || 100} step={1} value={currentTime}
        on:input={onSeek}
        class="w-full h-1 accent-[#bc8cff] cursor-pointer mb-1"
      />
      <div class="flex justify-between text-[11px] text-[#484f58] tabular-nums mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-center gap-4">
        <button on:click={cycleSpeed} class="text-xs font-bold text-[#8b949e] hover:text-[#e6edf3] bg-[#21262d] rounded-lg px-2 py-1 min-w-[40px] text-center transition-colors">
          {speed}×
        </button>
        <button on:click={() => skip(-15)} class="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm font-bold">-15</button>
        <button on:click={togglePlay} class="w-12 h-12 rounded-full bg-gradient-to-br from-[#bc8cff] to-[#58a6ff] flex items-center justify-center shadow-lg">
          {#if playing}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          {:else}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {/if}
        </button>
        <button on:click={() => skip(30)} class="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm font-bold">+30</button>
        <button class="text-[#8b949e] hover:text-[#e6edf3] text-xs transition-colors">🔖</button>
      </div>
    </div>

    <!-- Episode list -->
    <div class="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#21262d]">
      {#each EPISODES as e, i}
        <button on:click={() => playEp(i)} class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors {i === epIdx ? 'bg-white/[0.04]' : ''}">
          <div class="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0 {i === epIdx ? 'border-[#bc8cff] text-[#bc8cff]' : 'border-[#484f58] text-[#484f58]'}">
            {i === epIdx && playing ? "▶" : i + 1}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm truncate {i === epIdx ? 'text-[#e6edf3] font-semibold' : 'text-[#8b949e]'}">{e.title}</p>
            <p class="text-xs text-[#484f58]">{e.date}</p>
          </div>
          <span class="text-xs text-[#484f58] tabular-nums">{e.duration}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
