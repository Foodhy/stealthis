// Default reservation date to tomorrow
const dateInput = document.querySelector('input[name="date"]');
if (dateInput) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  dateInput.value = t.toISOString().slice(0, 10);
}

// Reserve form: faux submit + confirmation pill
const form = document.getElementById("reserveForm");
const confirmEl = document.getElementById("reserveConfirm");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  confirmEl.hidden = false;
  const btn = form.querySelector("button");
  const originalText = btn.textContent;
  btn.textContent = "Reserved ✓";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
    confirmEl.hidden = true;
  }, 3000);
});

// Sticky nav: shadow on scroll
const nav = document.getElementById("nav");
const onScroll = () => {
  if (window.scrollY > 8) nav.style.boxShadow = "0 2px 14px rgba(44, 26, 14, 0.08)";
  else nav.style.boxShadow = "";
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
