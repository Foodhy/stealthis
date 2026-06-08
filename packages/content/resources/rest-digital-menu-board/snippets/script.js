const ROTATE_MS = 9000;
const panels = document.querySelectorAll(".panel");
const dots = document.querySelectorAll(".dot-pip");
const pickName = document.getElementById("pickName");

const PICKS = ["Ribeye 14oz", "Carnitas bowl", "Tarta de queso quemada"];

let i = 0;
function rotate() {
  panels.forEach((p, idx) => p.classList.toggle("is-active", idx === i));
  dots.forEach((d, idx) => d.classList.toggle("is-on", idx === i));
  pickName.textContent = PICKS[i];
  i = (i + 1) % panels.length;
}
rotate();
setInterval(rotate, ROTATE_MS);

// Clock + faux order number ticker
const clock = document.getElementById("clock");
const orderNo = document.getElementById("orderNo");
function tick() {
  const d = new Date();
  clock.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
tick();
setInterval(tick, 15000);

let order = 184;
setInterval(() => {
  order = (order % 999) + 1;
  orderNo.textContent = String(order).padStart(4, "0");
}, 7800);
