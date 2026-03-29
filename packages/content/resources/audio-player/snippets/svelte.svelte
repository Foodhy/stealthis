<script>
const PLAYLIST = [
  { title: "Midnight Drive", artist: "Lo-fi Collective", duration: "3:42", color: "#bc8cff" },
  { title: "Rain & Coffee", artist: "Chill Vibes", duration: "4:15", color: "#58a6ff" },
  { title: "Golden Hour", artist: "Ambient Works", duration: "5:01", color: "#f1e05a" },
  { title: "Deep Focus", artist: "Study Beats", duration: "6:28", color: "#7ee787" },
];
const SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

let audioEl;
let trackIdx = 0;
let playing = false;
let currentTime = 0;
let duration = 0;
let volume = 0.8;

$: track = PLAYLIST[trackIdx];
$: pct = duration ? (currentTime / duration) * 100 : 0;

function formatTime(s) {
  if (!isFinite(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
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
function goTo(idx) {
  trackIdx = idx;
  currentTime = 0;
  playing = false;
}
function prev() {
  goTo((trackIdx - 1 + PLAYLIST.length) % PLAYLIST.length);
}
function next() {
  goTo((trackIdx + 1) % PLAYLIST.length);
}
function onSeek(e) {
  if (audioEl) audioEl.currentTime = Number(e.target.value);
}
function onVol(e) {
  volume = Number(e.target.value);
  if (audioEl) audioEl.volume = volume;
}
</script>

<div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
  <div class="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
    <div class="h-40 flex items-center justify-center" style="background:{track.color}18">
      <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg" style="background:{track.color};transform:{playing ? 'rotate(5deg)' : 'rotate(0deg)'};transition:transform 0.3s">🎵</div>
    </div>
    <div class="p-5">
      <div class="mb-4">
        <p class="text-[#e6edf3] font-bold text-base">{track.title}</p>
        <p class="text-[#8b949e] text-sm">{track.artist}</p>
      </div>
      <div class="mb-4">
        <audio bind:this={audioEl} src={SRC} on:timeupdate={() => currentTime = audioEl?.currentTime ?? 0} on:loadedmetadata={() => duration = audioEl?.duration ?? 0} on:ended={next}></audio>
        <input type="range" min="0" max={duration || 100} step="0.1" value={currentTime} on:input={onSeek} class="w-full h-1 accent-[#58a6ff] cursor-pointer mb-1"/>
        <div class="flex justify-between text-[11px] text-[#484f58] tabular-nums">
          <span>{formatTime(currentTime)}</span><span>{track.duration}</span>
        </div>
      </div>
      <div class="flex items-center justify-center gap-6 mb-4">
        <button on:click={prev} class="text-[#8b949e] hover:text-[#e6edf3] transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/></svg>
        </button>
        <button on:click={togglePlay} class="w-12 h-12 rounded-full flex items-center justify-center transition-all" style="background:{track.color}">
          {#if playing}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d1117"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          {:else}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d1117"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {/if}
        </button>
        <button on:click={next} class="text-[#8b949e] hover:text-[#e6edf3] transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"/></svg>
        </button>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs">🔈</span>
        <input type="range" min="0" max="1" step="0.05" value={volume} on:input={onVol} class="flex-1 h-1 accent-[#8b949e] cursor-pointer"/>
        <span class="text-xs">🔊</span>
      </div>
    </div>
    <div class="border-t border-[#30363d] divide-y divide-[#21262d]">
      {#each PLAYLIST as t, i}
        <button on:click={() => goTo(i)} class="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/[0.03] {i === trackIdx ? 'bg-white/[0.04]' : ''}">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style="background:{t.color}30">
            {#if i === trackIdx && playing}▶{:else}<span class="text-[#484f58] text-xs">{i + 1}</span>{/if}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm truncate {i === trackIdx ? 'text-[#e6edf3] font-semibold' : 'text-[#8b949e]'}">{t.title}</p>
            <p class="text-xs text-[#484f58] truncate">{t.artist}</p>
          </div>
          <span class="text-xs text-[#484f58] tabular-nums">{t.duration}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
