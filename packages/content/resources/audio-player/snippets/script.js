const songs = [
  {
    name: "Sunset Dreams",
    artist: "Lo-Fi Beats",
    src: "https://www.bensound.com/bensound-music/bensound-asmile.mp3",
    art: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
  },
  {
    name: "Neon Nights",
    artist: "Synthwave Pro",
    src: "https://www.bensound.com/bensound-music/bensound-energy.mp3",
    art: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=400&fit=crop",
  },
  {
    name: "Mountain High",
    artist: "Acoustic Folk",
    src: "https://www.bensound.com/bensound-music/bensound-adventure.mp3",
    art: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop",
  },
];

let songIndex = 0;
const audio = document.getElementById("main-audio");
const playBtn = document.getElementById("audio-play-pause");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const progress = document.getElementById("audio-progress");
const volume = document.getElementById("audio-volume");
const trackName = document.getElementById("track-name");
const trackArtist = document.getElementById("track-artist");
const trackArt = document.getElementById("track-art");
const playlist = document.getElementById("playlist");
const currTimeEl = document.querySelector(".curr-time");
const totalTimeEl = document.querySelector(".total-time");

function loadSong(song) {
  trackName.innerText = song.name;
  trackArtist.innerText = song.artist;
  trackArt.src = song.art;
  audio.src = song.src;
  updatePlaylistUI();
}

function updatePlaylistUI() {
  playlist.querySelectorAll("li").forEach((li, index) => {
    li.className = index === songIndex ? "active" : "";
  });
}

function playSong() {
  audio.play();
  playBtn.innerText = "⏸";
}

function pauseSong() {
  audio.pause();
  playBtn.innerText = "▶";
}

function togglePlay() {
  if (audio.paused) playSong();
  else pauseSong();
}

function prevSong() {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songs[songIndex]);
  playSong();
}

function nextSong() {
  songIndex = (songIndex + 1) % songs.length;
  loadSong(songs[songIndex]);
  playSong();
}

function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.value = progressPercent;

  currTimeEl.innerText = formatTime(currentTime);
  if (duration) totalTimeEl.innerText = formatTime(duration);
}

function formatTime(time) {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function setProgress() {
  audio.currentTime = (progress.value / 100) * audio.duration;
}

// Build Playlist
songs.forEach((song, index) => {
  const li = document.createElement("li");
  li.innerText = `${song.name} - ${song.artist}`;
  li.addEventListener("click", () => {
    songIndex = index;
    loadSong(songs[songIndex]);
    playSong();
  });
  playlist.appendChild(li);
});

// Event Listeners
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);
audio.addEventListener("timeupdate", updateProgress);
progress.addEventListener("input", setProgress);
volume.addEventListener("input", () => (audio.volume = volume.value));
audio.addEventListener("ended", nextSong);

// Init
loadSong(songs[songIndex]);
