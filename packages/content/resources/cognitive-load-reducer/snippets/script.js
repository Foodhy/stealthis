(() => {
  const STORAGE_KEY = "simplified-mode";
  const toggleBtn = document.getElementById("simplify-toggle");
  const marquee = document.getElementById("marquee");
  const carouselSlides = document.querySelectorAll(".carousel__slide");
  const carouselDots = document.querySelectorAll(".carousel__dot");

  let carouselInterval = null;
  let currentSlide = 0;

  // ----- Carousel auto-rotation -----
  function showSlide(index) {
    carouselSlides.forEach((slide, i) => {
      slide.classList.toggle("carousel__slide--active", i === index);
      // Apply gradient background
      if (slide.dataset.gradient) {
        slide.style.background = slide.dataset.gradient;
      }
    });
    carouselDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
    currentSlide = index;
  }

  function nextSlide() {
    showSlide((currentSlide + 1) % carouselSlides.length);
  }

  function startCarousel() {
    if (carouselInterval) return;
    carouselInterval = setInterval(nextSlide, 4000);
  }

  function stopCarousel() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  carouselDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(parseInt(dot.dataset.index, 10));
      stopCarousel();
      if (!document.body.classList.contains("simplified")) {
        startCarousel();
      }
    });
  });

  // Initialize carousel
  showSlide(0);

  // ----- Simplified mode -----
  function applyMode(simplified) {
    document.body.classList.toggle("simplified", simplified);
    toggleBtn.setAttribute("aria-pressed", String(simplified));
    toggleBtn.querySelector(".simplify-btn__text").textContent = simplified
      ? "Standard"
      : "Simplify";

    if (simplified) {
      stopCarousel();
      // Show all slides as static cards in simplified mode
      carouselSlides.forEach((slide) => {
        slide.classList.add("carousel__slide--active");
      });
    } else {
      showSlide(0);
      startCarousel();
    }
  }

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReduced.matches) {
    applyMode(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  prefersReduced.addEventListener("change", (e) => {
    if (e.matches) {
      applyMode(true);
      localStorage.setItem(STORAGE_KEY, "true");
    }
  });

  // Restore saved preference
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "true") {
    applyMode(true);
  } else if (!prefersReduced.matches) {
    startCarousel();
  }

  // Toggle
  toggleBtn.addEventListener("click", () => {
    const next = !document.body.classList.contains("simplified");
    applyMode(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  });
})();
