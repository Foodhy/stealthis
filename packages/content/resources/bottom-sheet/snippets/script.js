const backdrop = document.getElementById("backdrop");
let activeSheet = null;

function openSheet(id) {
  const sheet = document.getElementById(`sheet-${id}`);
  if (!sheet) return;
  activeSheet = sheet;
  backdrop.classList.add("visible");
  sheet.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeSheet() {
  if (!activeSheet) return;
  activeSheet.classList.remove("open");
  activeSheet.style.transform = "";
  backdrop.classList.remove("visible");
  document.body.style.overflow = "";
  activeSheet = null;
}

// Open buttons
document.querySelectorAll(".open-btn").forEach((btn) => {
  btn.addEventListener("click", () => openSheet(btn.dataset.sheet));
});

// Backdrop closes sheet
backdrop.addEventListener("click", closeSheet);

// Close buttons inside sheets
document.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", closeSheet);
});

// Drag-to-dismiss on each sheet handle
document.querySelectorAll(".bottom-sheet").forEach((sheet) => {
  const handle = sheet.querySelector(".sheet-handle");
  let startY = 0;
  let currentY = 0;
  let dragging = false;

  function onTouchStart(e) {
    startY = e.touches[0].clientY;
    dragging = true;
    sheet.classList.add("dragging");
  }

  function onTouchMove(e) {
    if (!dragging) return;
    currentY = e.touches[0].clientY - startY;
    if (currentY < 0) currentY = 0;
    sheet.style.transform = `translateY(${currentY}px)`;
  }

  function onTouchEnd() {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove("dragging");

    if (currentY > 120) {
      closeSheet();
    } else {
      sheet.style.transform = "";
    }

    currentY = 0;
  }

  handle.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchend", onTouchEnd);
});
