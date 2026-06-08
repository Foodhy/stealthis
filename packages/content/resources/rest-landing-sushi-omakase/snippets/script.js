const COURSES = [
  { jp: "先付", en: "Amuse" },
  { jp: "汁物", en: "Soup" },
  { jp: "刺身", en: "Sashimi" },
  { jp: "椀盛", en: "Wanmono" },
  { jp: "焼物", en: "Yakimono" },
  { jp: "強肴", en: "Shiizakana", feat: true },
  { jp: "握り", en: "Nigiri 1" },
  { jp: "握り", en: "Nigiri 2" },
  { jp: "握り", en: "Nigiri 3" },
  { jp: "巻物", en: "Maki" },
  { jp: "玉子", en: "Tamago" },
  { jp: "椀", en: "Miso" },
  { jp: "甘味", en: "Dessert" },
];

const list = document.getElementById("courseList");
list.innerHTML = COURSES.map(
  (c, i) => `
  <li class="course ${c.feat ? "is-feat" : ""}">
    <span class="course-no">— ${String(i + 1).padStart(2, "0")}</span>
    <span class="course-jp">${c.jp}</span>
    <span class="course-en">${c.en}</span>
  </li>`
).join("");

// "Seats remaining tonight" — tick down occasionally so the demo feels alive
const seatText = document.getElementById("seatText");
let remaining = 3;
function paint() {
  if (remaining <= 0) seatText.textContent = "Tonight is fully booked · joining the waitlist?";
  else if (remaining === 1) seatText.textContent = "1 seat remaining tonight";
  else seatText.textContent = `${remaining} seats remaining tonight`;
}
paint();
setInterval(() => {
  remaining = Math.max(0, remaining - (Math.random() < 0.3 ? 1 : 0));
  paint();
  if (remaining === 0) {
    setTimeout(() => {
      remaining = 4;
      paint();
    }, 4000);
  }
}, 5200);

// Date default
const di = document.querySelector('input[name="d"]');
if (di) {
  const t = new Date();
  t.setDate(t.getDate() + 3);
  di.value = t.toISOString().slice(0, 10);
}

// Form
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
  }, 2800);
});
