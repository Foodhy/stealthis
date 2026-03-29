function toast(msg, duration = 2000) {
  const t = document.getElementById("feedbackToast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.hidden = true;
  }, duration);
}

document.getElementById("copyBtn").addEventListener("click", () => {
  const text = document.querySelector(".arc-body").innerText;
  navigator.clipboard.writeText(text);
  const btn = document.getElementById("copyBtn");
  const label = document.getElementById("copyLabel");
  btn.classList.add("copied");
  label.textContent = "Copied!";
  setTimeout(() => {
    btn.classList.remove("copied");
    label.textContent = "Copy";
  }, 2000);
});

document.getElementById("thumbUpBtn").addEventListener("click", function () {
  this.classList.toggle("active-up");
  document.getElementById("thumbDownBtn").classList.remove("active-down");
  if (this.classList.contains("active-up")) toast("👍 Feedback recorded — thanks!");
});

document.getElementById("thumbDownBtn").addEventListener("click", function () {
  this.classList.toggle("active-down");
  document.getElementById("thumbUpBtn").classList.remove("active-up");
  if (this.classList.contains("active-down")) toast("👎 Feedback noted — we'll improve!");
});

document.getElementById("regenBtn").addEventListener("click", function () {
  this.style.animation = "spin 0.5s linear";
  setTimeout(() => {
    this.style.animation = "";
  }, 500);
  toast("⟳ Regenerating…");
});
