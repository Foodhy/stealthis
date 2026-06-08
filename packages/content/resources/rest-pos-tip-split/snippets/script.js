const subEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const sliderEl = document.getElementById("slider");
const sliderVal = document.getElementById("sliderVal");
const partyEl = document.getElementById("party");
const tipBtns = document.querySelectorAll("[data-tip]");
const roundBtns = document.querySelectorAll("[data-round]");
const stepBtns = document.querySelectorAll("[data-step]");
const basisBtns = document.querySelectorAll('input[name="basis"]');

const dSubtotal = document.getElementById("dSubtotal");
const dTax = document.getElementById("dTax");
const dTip = document.getElementById("dTip");
const dTotal = document.getElementById("dTotal");
const dEach = document.getElementById("dEach");
const tTipLabel = document.getElementById("tTipLabel");
const note = document.getElementById("note");

let tip = 18;
let party = 2;
let round = 0;
let basis = "pre";

function money(v) {
  return `$${v.toFixed(2)}`;
}

function refresh() {
  const sub = Math.max(0, Number(subEl.value) || 0);
  const taxRate = Math.max(0, Number(taxEl.value) || 0) / 100;
  const tax = sub * taxRate;
  const tipBase = basis === "post" ? sub + tax : sub;
  const tipAmt = tipBase * (tip / 100);
  const total = sub + tax + tipAmt;
  dSubtotal.textContent = money(sub);
  dTax.textContent = money(tax);
  dTip.textContent = money(tipAmt);
  dTotal.textContent = money(total);
  tTipLabel.textContent = `Tip (${basis === "post" ? "post-tax" : "pre-tax"})`;

  let each = total / party;
  let extra = 0;
  if (round > 0) {
    const rounded = Math.ceil(each / round) * round;
    extra = (rounded - each) * party;
    each = rounded;
  }
  dEach.textContent = money(each);

  note.textContent =
    round > 0 && extra > 0
      ? `Rounded up · the table leaves ${money(extra)} extra ($${(extra).toFixed(2)} total above the bill).`
      : tip === 0
        ? "No tip — server keeps gratuity only if pooled. Consider 15%+ in the US."
        : "";
}

tipBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    tipBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
    tip = Number(btn.dataset.tip);
    sliderEl.value = tip;
    sliderVal.textContent = tip;
    refresh();
  })
);
sliderEl.addEventListener("input", (e) => {
  tip = Number(e.target.value);
  sliderVal.textContent = tip;
  tipBtns.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.tip) === tip));
  refresh();
});
roundBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    roundBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
    round = Number(btn.dataset.round);
    refresh();
  })
);
stepBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    party = Math.max(1, Math.min(10, party + Number(btn.dataset.step)));
    partyEl.textContent = party;
    document.querySelector('[data-step="-1"]').disabled = party <= 1;
    document.querySelector('[data-step="1"]').disabled = party >= 10;
    refresh();
  })
);
basisBtns.forEach((rb) =>
  rb.addEventListener("change", () => {
    basis = rb.value;
    refresh();
  })
);
[subEl, taxEl].forEach((el) => el.addEventListener("input", refresh));

refresh();
