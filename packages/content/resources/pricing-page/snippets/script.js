const toggle = document.getElementById("billingToggle");
const prices = document.querySelectorAll(".price[data-monthly]");
let isAnnual = false;

toggle.addEventListener("click", () => {
  isAnnual = !isAnnual;
  toggle.setAttribute("aria-pressed", String(isAnnual));

  prices.forEach((el) => {
    const monthly = Number(el.dataset.monthly);
    const annual = Number(el.dataset.annual);
    const value = isAnnual ? annual : monthly;
    el.textContent = value === 0 ? "$0" : `$${value}`;
  });
});
