const LEAD_DAYS = {
  "long-table": 7,
  buyout: 21,
  catering: 30,
};

const PRICE = {
  "long-table": 78,
  buyout: 140,
  catering: 95,
};

const pkg = document.getElementById("pkg");
const guests = document.getElementById("guests");
const date = document.getElementById("date");
const hint = document.getElementById("hint");
const form = document.getElementById("form");
const ok = document.getElementById("ok");

function isoPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function readableDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function updateHint() {
  const lead = LEAD_DAYS[pkg.value] || 7;
  const earliest = isoPlus(lead);
  if (!date.value || date.value < earliest) date.value = earliest;
  date.min = isoPlus(0);
  const estimate = (PRICE[pkg.value] || 0) * Math.max(1, Number(guests.value) || 0);
  hint.innerHTML = `Earliest available <b>${readableDate(earliest)}</b> · est. <b>$${estimate.toLocaleString()}</b>`;
}

pkg.addEventListener("change", updateHint);
guests.addEventListener("input", updateHint);
date.addEventListener("change", updateHint);

document.querySelectorAll("[data-pick]").forEach((btn) =>
  btn.addEventListener("click", () => {
    pkg.value = btn.dataset.pick;
    updateHint();
    document.getElementById("form").scrollIntoView({ behavior: "smooth", block: "start" });
  })
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  ok.hidden = false;
  form.querySelector("button").disabled = true;
  setTimeout(() => {
    ok.hidden = true;
    form.querySelector("button").disabled = false;
  }, 3500);
});

updateHint();
