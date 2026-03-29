const container = document.getElementById("comparison-slider");
const beforeImg = container.querySelector(".image-before");
const beforeImgContent = beforeImg.querySelector("img");
const handle = container.querySelector(".slider-handle");

let isResizing = false;

function setPosition(x) {
  const containerRect = container.getBoundingClientRect();
  let pos = ((x - containerRect.left) / containerRect.width) * 100;

  // Bounds
  pos = Math.max(0, Math.min(100, pos));

  beforeImg.style.width = `${pos}%`;
  handle.style.left = `${pos}%`;

  // Keep the inner image full container width to avoid scaling
  beforeImgContent.style.width = `${containerRect.width}px`;
}

function startResizing() {
  isResizing = true;
}

function stopResizing() {
  isResizing = false;
}

function handleResize(e) {
  if (!isResizing) return;
  const x = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  setPosition(x);
}

// Event Listeners
handle.addEventListener("mousedown", startResizing);
window.addEventListener("mouseup", stopResizing);
window.addEventListener("mousemove", handleResize);

handle.addEventListener("touchstart", startResizing);
window.addEventListener("touchend", stopResizing);
window.addEventListener("touchmove", handleResize);

// Update inner image width on window resize
window.addEventListener("resize", () => {
  beforeImgContent.style.width = `${container.offsetWidth}px`;
});

// Initial Position
setPosition(container.getBoundingClientRect().left + container.offsetWidth / 2);
