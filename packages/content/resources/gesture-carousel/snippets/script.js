const track = document.getElementById("carouselTrack");
const dotsContainer = document.getElementById("dots");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const slides = track.querySelectorAll(".slide");
const total = slides.length;

let current = 0;
let startX = 0;
let startTime = 0;
let deltaX = 0;
let dragging = false;

// Build dots
slides.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.className = `dot${i === 0 ? " active" : ""}`;
  dot.setAttribute("role", "tab");
  dot.setAttribute("aria-label", `Slide ${i + 1}`);
  dot.addEventListener("click", () => goTo(i));
  dotsContainer.appendChild(dot);
});

function updateDots(index) {
  dotsContainer.querySelectorAll(".dot").forEach((d, i) => {
    d.classList.toggle("active", i === index);
  });
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === total - 1;
}

function goTo(index) {
  if (index < 0 || index >= total) return;
  current = index;
  track.style.transform = `translateX(-${current * 100}%)`;
  updateDots(current);
}

prevBtn.addEventListener("click", () => goTo(current - 1));
nextBtn.addEventListener("click", () => goTo(current + 1));

// Touch / mouse drag
const carousel = document.getElementById("carousel");

function onDragStart(x) {
  startX = x;
  startTime = Date.now();
  deltaX = 0;
  dragging = true;
  track.classList.add("dragging");
}

function onDragMove(x) {
  if (!dragging) return;
  deltaX = x - startX;
  const offset = -(current * 100) + (deltaX / carousel.offsetWidth) * 100;
  track.style.transform = `translateX(${offset}%)`;
}

function onDragEnd() {
  if (!dragging) return;
  dragging = false;
  track.classList.remove("dragging");

  const velocity = Math.abs(deltaX) / (Date.now() - startTime); // px/ms
  const threshold = carousel.offsetWidth * 0.25;

  if (deltaX < -threshold || (velocity > 0.4 && deltaX < 0)) {
    goTo(current + 1);
  } else if (deltaX > threshold || (velocity > 0.4 && deltaX > 0)) {
    goTo(current - 1);
  } else {
    goTo(current);
  }

  deltaX = 0;
}

// Touch events
carousel.addEventListener("touchstart", (e) => onDragStart(e.touches[0].clientX), {
  passive: true,
});
carousel.addEventListener("touchmove", (e) => onDragMove(e.touches[0].clientX), { passive: true });
carousel.addEventListener("touchend", onDragEnd);

// Pointer events (mouse)
carousel.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "touch") return;
  carousel.setPointerCapture(e.pointerId);
  onDragStart(e.clientX);
});
carousel.addEventListener("pointermove", (e) => {
  if (e.pointerType === "touch") return;
  onDragMove(e.clientX);
});
carousel.addEventListener("pointerup", (e) => {
  if (e.pointerType === "touch") return;
  onDragEnd();
});

// Keyboard
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") goTo(current - 1);
  if (e.key === "ArrowRight") goTo(current + 1);
});

// Init
updateDots(0);
