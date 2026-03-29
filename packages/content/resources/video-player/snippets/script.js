const video = document.getElementById("video");
const playPauseBtn = document.getElementById("play-pause");
const playIcon = playPauseBtn.querySelector(".play-icon");
const pauseIcon = playPauseBtn.querySelector(".pause-icon");
const progressFilled = document.getElementById("progress-filled");
const progressContainer = document.querySelector(".progress-container");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const muteBtn = document.getElementById("mute-btn");
const volumeSlider = document.getElementById("volume-slider");
const speedSelect = document.getElementById("playback-speed");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const videoContainer = document.getElementById("video-container");

function togglePlay() {
  if (video.paused) {
    video.play();
    playIcon.style.display = "none";
    pauseIcon.style.display = "inline";
  } else {
    video.pause();
    playIcon.style.display = "inline";
    pauseIcon.style.display = "none";
  }
}

function updateProgress() {
  const percent = (video.currentTime / video.duration) * 100;
  progressFilled.style.width = `${percent}%`;
  currentTimeEl.textContent = formatTime(video.currentTime);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function scrub(e) {
  const scrubTime = (e.offsetX / progressContainer.offsetWidth) * video.duration;
  video.currentTime = scrubTime;
}

function toggleMute() {
  video.muted = !video.muted;
  muteBtn.querySelector("span").textContent = video.muted ? "🔇" : "🔊";
  if (video.muted) {
    volumeSlider.value = 0;
  } else {
    volumeSlider.value = video.volume;
  }
}

function handleVolume() {
  video.volume = volumeSlider.value;
  video.muted = video.volume === 0;
  muteBtn.querySelector("span").textContent = video.muted ? "🔇" : "🔊";
}

function handleSpeed() {
  video.playbackRate = speedSelect.value;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Event Listeners
playPauseBtn.addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);
video.addEventListener("timeupdate", updateProgress);
video.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(video.duration);
});

let mousedown = false;
progressContainer.addEventListener("click", scrub);
progressContainer.addEventListener("mousemove", (e) => mousedown && scrub(e));
progressContainer.addEventListener("mousedown", () => (mousedown = true));
progressContainer.addEventListener("mouseup", () => (mousedown = false));

muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", handleVolume);
speedSelect.addEventListener("change", handleSpeed);
fullscreenBtn.addEventListener("click", toggleFullscreen);

// Hide title overlay on play
video.onplay = () => {
  playIcon.style.display = "none";
  pauseIcon.style.display = "inline";
};
video.onpause = () => {
  playIcon.style.display = "inline";
  pauseIcon.style.display = "none";
};
