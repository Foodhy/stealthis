const dateEl = document.getElementById("rDate");
const d = new Date();
const fmt = (n) => String(n).padStart(2, "0");
dateEl.textContent = `${d.getFullYear()}-${fmt(d.getMonth() + 1)}-${fmt(d.getDate())} ${fmt(d.getHours())}:${fmt(d.getMinutes())}`;

document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});

document.getElementById("dup").addEventListener("click", () => {
  const wrap = document.querySelector(".page");
  const second = document.querySelector(".receipt").cloneNode(true);
  second.style.opacity = "0.85";
  wrap.appendChild(second);
});
