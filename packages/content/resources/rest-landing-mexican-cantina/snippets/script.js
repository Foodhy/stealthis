// Default reservation date to upcoming Saturday
const di = document.querySelector('input[name="d"]');
if (di) {
  const t = new Date();
  const day = t.getDay();
  const delta = (6 - day + 7) % 7 || 7;
  t.setDate(t.getDate() + delta);
  di.value = t.toISOString().slice(0, 10);
}

const form = document.getElementById("form");
const ok = document.getElementById("ok");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  ok.hidden = false;
  const btn = form.querySelector("button");
  btn.disabled = true;
  setTimeout(() => {
    ok.hidden = true;
    btn.disabled = false;
  }, 3000);
});
