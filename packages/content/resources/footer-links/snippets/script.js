const form = document.getElementById("newsletterForm");
const input = document.getElementById("newsletterEmail");
const btn = form?.querySelector(".newsletter-btn");
const msg = document.getElementById("newsletterMsg");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = input.value;

  if (!isValidEmail(email)) {
    showMsg("Please enter a valid email address.", true);
    input.focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = "Subscribing…";

  // Simulate API call
  await new Promise((r) => setTimeout(r, 1000));

  showMsg("✓ You're subscribed! Check your inbox.", false);
  input.value = "";
  btn.textContent = "Subscribe";
  btn.disabled = false;

  // Reset message after 4 s
  setTimeout(() => {
    msg.hidden = true;
  }, 4000);
});

function showMsg(text, isError) {
  msg.textContent = text;
  msg.className = "newsletter-msg" + (isError ? " error" : "");
  msg.hidden = false;
}
