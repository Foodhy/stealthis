const tabs = document.querySelectorAll(".tab");
const track = document.getElementById("panelsTrack");
const indicator = document.querySelector(".tab-indicator");

let currentIndex = 0;
let startX = 0;
let deltaX = 0;
let dragging = false;

function updateIndicator(index) {
  const tab = tabs[index];
  indicator.style.left = `${tab.offsetLeft}px`;
  indicator.style.width = `${tab.offsetWidth}px`;
}

function goTo(index) {
  if (index < 0 || index >= tabs.length) return;
  currentIndex = index;
  track.style.transform = `translateX(-${index * 100}%)`;

  tabs.forEach((t, i) => {
    t.classList.toggle("active", i === index);
    t.setAttribute("aria-selected", String(i === index));
  });

  updateIndicator(index);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => goTo(Number(tab.dataset.index)));
});

// Touch swipe support
track.addEventListener(
  "touchstart",
  (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
    track.classList.add("dragging");
  },
  { passive: true }
);

track.addEventListener(
  "touchmove",
  (e) => {
    if (!dragging) return;
    deltaX = e.touches[0].clientX - startX;
    const offset = -(currentIndex * 100) + (deltaX / track.offsetWidth) * 100;
    track.style.transform = `translateX(${offset}%)`;
  },
  { passive: true }
);

track.addEventListener("touchend", () => {
  dragging = false;
  track.classList.remove("dragging");

  const threshold = track.offsetWidth * 0.25;
  if (deltaX < -threshold) goTo(currentIndex + 1);
  else if (deltaX > threshold) goTo(currentIndex - 1);
  else goTo(currentIndex);

  deltaX = 0;
});

// Init
updateIndicator(0);
window.addEventListener("resize", () => updateIndicator(currentIndex));
