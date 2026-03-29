const podAudio = document.getElementById('pod-audio');
const podPlayBtn = document.getElementById('pod-play-pause');
const podProgress = document.getElementById('pod-progress');
const podCurrentTime = document.getElementById('pod-current');
const podTotalTime = document.getElementById('pod-total');
const podSpeed = document.getElementById('pod-speed');
const skipBackBtn = document.getElementById('skip-back');
const skipForwardBtn = document.getElementById('skip-forward');
const podMuteBtn = document.getElementById('pod-mute');

function togglePodPlay() {
  if (podAudio.paused) {
    podAudio.play();
    podPlayBtn.innerText = '⏸';
  } else {
    podAudio.pause();
    podPlayBtn.innerText = '▶';
  }
}

function updatePodProgress() {
  const percent = (podAudio.currentTime / podAudio.duration) * 100;
  podProgress.value = percent || 0;
  podCurrentTime.innerText = formatDuration(podAudio.currentTime);
}

function formatDuration(time) {
  const h = Math.floor(time / 3600);
  const m = Math.floor((time % 3600) / 60);
  const s = Math.floor(time % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function seekPod() {
  podAudio.currentTime = (podProgress.value / 100) * podAudio.duration;
}

skipBackBtn.addEventListener('click', () => {
    podAudio.currentTime = Math.max(0, podAudio.currentTime - 15);
});

skipForwardBtn.addEventListener('click', () => {
    podAudio.currentTime = Math.min(podAudio.duration, podAudio.currentTime + 30);
});

podSpeed.addEventListener('change', () => {
    podAudio.playbackRate = parseFloat(podSpeed.value);
});

podMuteBtn.addEventListener('click', () => {
    podAudio.muted = !podAudio.muted;
    podMuteBtn.innerText = podAudio.muted ? '🔇' : '🔊';
});

podPlayBtn.addEventListener('click', togglePodPlay);
podAudio.addEventListener('timeupdate', updatePodProgress);
podAudio.addEventListener('loadedmetadata', () => {
    podTotalTime.innerText = formatDuration(podAudio.duration);
});
podProgress.addEventListener('input', seekPod);
