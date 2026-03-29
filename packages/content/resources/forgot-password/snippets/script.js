const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const form = document.getElementById("forgotForm");
const emailEl = document.getElementById("email");
const sendBtn = document.getElementById("sendBtn");
const sentEmailEl = document.getElementById("sentEmail");
const resendBtn = document.getElementById("resendBtn");
const changeEmail = document.getElementById("changeEmail");
const dot1 = document.getElementById("dot1");
const dot2 = document.getElementById("dot2");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailEl.value.trim();
  const errEl = document.getElementById("email-error");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = "Enter a valid email address.";
    errEl.hidden = false;
    emailEl.classList.add("invalid");
    return;
  }
  errEl.hidden = true;
  emailEl.classList.remove("invalid");

  sendBtn.disabled = true;
  sendBtn.querySelector(".btn-text").hidden = true;
  sendBtn.querySelector(".btn-spinner").hidden = false;
  await new Promise((r) => setTimeout(r, 1200));

  // Show step 2
  sentEmailEl.textContent = email;
  step1.hidden = true;
  step2.hidden = false;
  dot1.classList.remove("active");
  dot2.classList.add("active");
  startCountdown(60);
});

function startCountdown(secs) {
  let remaining = secs;
  const countEl = document.getElementById("countdown");
  resendBtn.disabled = true;

  const timer = setInterval(() => {
    remaining--;
    countEl.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(timer);
      resendBtn.disabled = false;
      resendBtn.textContent = "Resend email";
    }
  }, 1000);
}

resendBtn?.addEventListener("click", () => {
  resendBtn.textContent = "Resent!";
  resendBtn.disabled = true;
  setTimeout(() => startCountdown(60), 1000);
});

changeEmail?.addEventListener("click", () => {
  step2.hidden = true;
  step1.hidden = false;
  dot2.classList.remove("active");
  dot1.classList.add("active");
  sendBtn.disabled = false;
  sendBtn.querySelector(".btn-text").hidden = false;
  sendBtn.querySelector(".btn-spinner").hidden = true;
  emailEl.focus();
});
