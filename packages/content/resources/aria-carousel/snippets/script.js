(() => {
  const track = document.getElementById("carousel-track");
  const slides = Array.from(track.children);
  const dots = Array.from(document.querySelectorAll(".carousel-dot"));
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const playPauseBtn = document.getElementById("playpause-btn");
  const liveRegion = document.getElementById("carousel-live");
  const carousel = document.querySelector(".carousel");

  const TOTAL = slides.length;
  const INTERVAL = 5000;
  let currentIndex = 0;
  let isPlaying = true;
  let autoplayTimer = null;

  function goToSlide(index) {
    currentIndex = ((index % TOTAL) + TOTAL) % TOTAL;

    // Move track
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.toggle("carousel-slide--active", i === currentIndex);
    });

    // Update dots
    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle("carousel-dot--active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    // Announce to screen readers
    announce(`Slide ${currentIndex + 1} of ${TOTAL}`);
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function announce(text) {
    liveRegion.textContent = "";
    // Force the live region to re-announce by clearing then setting
    requestAnimationFrame(() => {
      liveRegion.textContent = text;
    });
  }

  // Auto-play
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, INTERVAL);
    isPlaying = true;
    updatePlayPauseUI();
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    isPlaying = false;
    updatePlayPauseUI();
  }

  function toggleAutoplay() {
    if (isPlaying) {
      stopAutoplay();
      announce("Auto-play paused");
    } else {
      startAutoplay();
      announce("Auto-play resumed");
    }
  }

  function updatePlayPauseUI() {
    const pauseIcon = playPauseBtn.querySelector(".icon-pause");
    const playIcon = playPauseBtn.querySelector(".icon-play");
    const text = playPauseBtn.querySelector(".playpause-text");

    if (isPlaying) {
      pauseIcon.hidden = false;
      playIcon.hidden = true;
      text.textContent = "Pause";
      playPauseBtn.setAttribute("aria-label", "Pause auto-play");
      playPauseBtn.removeAttribute("data-playing");
    } else {
      pauseIcon.hidden = true;
      playIcon.hidden = false;
      text.textContent = "Play";
      playPauseBtn.setAttribute("aria-label", "Start auto-play");
      playPauseBtn.setAttribute("data-playing", "false");
    }
  }

  // Event listeners
  prevBtn.addEventListener("click", () => {
    prevSlide();
    if (isPlaying) startAutoplay(); // Reset timer
  });

  nextBtn.addEventListener("click", () => {
    nextSlide();
    if (isPlaying) startAutoplay();
  });

  playPauseBtn.addEventListener("click", toggleAutoplay);

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.dataset.slide, 10);
      goToSlide(index);
      if (isPlaying) startAutoplay();
    });
  });

  // Keyboard: arrows for prev/next
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
      if (isPlaying) startAutoplay();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
      if (isPlaying) startAutoplay();
    }
  });

  // Pause on hover and focus within
  carousel.addEventListener("mouseenter", () => {
    if (isPlaying) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  });

  carousel.addEventListener("mouseleave", () => {
    if (isPlaying && !autoplayTimer) {
      autoplayTimer = setInterval(nextSlide, INTERVAL);
    }
  });

  carousel.addEventListener("focusin", () => {
    if (isPlaying) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  });

  carousel.addEventListener("focusout", (e) => {
    if (isPlaying && !carousel.contains(e.relatedTarget)) {
      autoplayTimer = setInterval(nextSlide, INTERVAL);
    }
  });

  // Start
  startAutoplay();
})();
