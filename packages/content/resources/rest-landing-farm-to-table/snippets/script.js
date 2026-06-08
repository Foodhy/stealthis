const HARVEST = [
  { icon: "🍅", name: "Heirloom tomato", kg: "14.2 kg" },
  { icon: "🥬", name: "Lacinato kale", kg: "8.6 kg" },
  { icon: "🌿", name: "Garden basil", kg: "2.1 kg" },
  { icon: "🥕", name: "Purple carrot", kg: "11.8 kg" },
  { icon: "🌽", name: "Sweetcorn", kg: "26 ears" },
  { icon: "🌶️", name: "Padrón pepper", kg: "3.4 kg" },
  { icon: "🧄", name: "Hardneck garlic", kg: "1.9 kg" },
  { icon: "🥒", name: "Cucumber", kg: "9.0 kg" },
  { icon: "🌻", name: "Sunflower seed", kg: "0.8 kg" },
  { icon: "🍯", name: "Wild honey", kg: "1.2 kg" },
];

const grid = document.getElementById("harvestGrid");
grid.innerHTML = HARVEST.map(
  (h) => `
  <article class="h-item">
    <span class="h-icon">${h.icon}</span>
    <div>
      <p class="h-name">${h.name}</p>
      <p class="h-kg">${h.kg}</p>
    </div>
  </article>`
).join("");

function nowStr() {
  const d = new Date();
  d.setHours(d.getHours() - 1); // "an hour ago, by the field"
  d.setMinutes(34);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} this morning`;
}
document.getElementById("updated").textContent = nowStr();

// Default date to next Thursday
const di = document.querySelector('input[name="d"]');
if (di) {
  const t = new Date();
  const day = t.getDay();
  const delta = (4 - day + 7) % 7 || 7;
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
