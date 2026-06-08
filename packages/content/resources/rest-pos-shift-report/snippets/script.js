const dateEl = document.getElementById("rDate");
const runEl = document.getElementById("rRun");
const typeEl = document.getElementById("rType");
const shiftEl = document.getElementById("rShift");
const fmt = (n) => String(n).padStart(2, "0");
const d = new Date();
dateEl.textContent = `${d.getFullYear()}-${fmt(d.getMonth() + 1)}-${fmt(d.getDate())}`;
runEl.textContent = `${fmt(d.getHours())}:${fmt(d.getMinutes())}`;

document.querySelectorAll(".seg-btn").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("is-active", x === b));
    if (b.dataset.r === "x") {
      typeEl.textContent = "X · INTERIM";
      shiftEl.textContent = "19:00 – running";
    } else {
      typeEl.textContent = "Z · CLOSE";
      shiftEl.textContent = "19:00 – 23:42";
    }
  })
);

document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});
