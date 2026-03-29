const STORAGE_KEY = "acme_banner_dismissed";
const banner = document.getElementById("banner");
const bannerClose = document.getElementById("bannerClose");
const resetBtn = document.getElementById("resetBtn");

// Restore dismissed state on load
if (localStorage.getItem(STORAGE_KEY) === "true") {
  banner.classList.add("dismissed");
}

bannerClose.addEventListener("click", () => {
  banner.classList.add("dismissed");
  localStorage.setItem(STORAGE_KEY, "true");
});

resetBtn.addEventListener("click", () => {
  banner.classList.remove("dismissed");
  localStorage.removeItem(STORAGE_KEY);
});
