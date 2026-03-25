(function () {
  "use strict";

  var thumbnail = document.getElementById("video-thumbnail");
  var playButton = document.getElementById("play-button");
  var modal = document.getElementById("video-modal");
  var backdrop = document.getElementById("modal-backdrop");
  var closeButton = document.getElementById("modal-close");
  var video = document.getElementById("hero-video");

  if (!thumbnail || !modal || !video) return;

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    video.play().catch(function () {
      // Auto-play may be blocked by browser
    });
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    video.pause();
  }

  // Open on thumbnail or play button click
  thumbnail.addEventListener("click", openModal);

  // Close on backdrop click
  backdrop.addEventListener("click", closeModal);

  // Close on close button click
  closeButton.addEventListener("click", closeModal);

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
})();
