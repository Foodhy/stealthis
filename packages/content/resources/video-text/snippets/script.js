/**
 * Video Text
 * Sets up the video element behind the text overlay.
 * Falls back to an animated gradient if the video cannot load.
 */
(function () {
  const container = document.querySelector(".video-text-container");
  if (!container) return;

  const videoSrc = container.dataset.videoSrc || "";
  const mediaSlot = container.querySelector(".video-text-media");
  if (!mediaSlot) return;

  if (videoSrc) {
    const video = document.createElement("video");
    video.src = videoSrc;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");

    video.addEventListener("error", () => {
      // Replace with gradient fallback on error
      video.remove();
      addGradientFallback(mediaSlot);
    });

    mediaSlot.appendChild(video);
  } else {
    addGradientFallback(mediaSlot);
  }

  function addGradientFallback(slot) {
    const div = document.createElement("div");
    div.classList.add("video-text-gradient");
    slot.appendChild(div);
  }
})();
