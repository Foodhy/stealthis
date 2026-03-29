const exchangeRates = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 150.12, AUD: 1.53, CAD: 1.35, USD: 1 },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 163.45, AUD: 1.66, CAD: 1.47, EUR: 1 },
  GBP: { USD: 1.27, EUR: 1.16, JPY: 189.65, AUD: 1.93, CAD: 1.71, GBP: 1 },
  JPY: { USD: 0.0067, EUR: 0.0061, GBP: 0.0053, AUD: 0.01, CAD: 0.009, JPY: 1 },
  AUD: { USD: 0.65, EUR: 0.6, GBP: 0.52, JPY: 98.12, CAD: 0.88, AUD: 1 },
  CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 111.23, AUD: 1.13, CAD: 1 },
};

const amountEl = document.getElementById("base-amount");
const fromCurrencyEl = document.getElementById("from-currency");
const toCurrencyEl = document.getElementById("to-currency");
const swapBtn = document.getElementById("swap-btn");
const resultTextEl = document.getElementById("result-text");
const rateInfoEl = document.getElementById("rate-info");

function convert() {
  const amount = parseFloat(amountEl.value) || 0;
  const from = fromCurrencyEl.value;
  const to = toCurrencyEl.value;

  const rate = exchangeRates[from][to];
  const convertedAmount = (amount * rate).toFixed(2);

  resultTextEl.textContent = `${amount.toFixed(2)} ${from} = ${convertedAmount} ${to}`;
  rateInfoEl.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
}

function swap() {
  const temp = fromCurrencyEl.value;
  fromCurrencyEl.value = toCurrencyEl.value;
  toCurrencyEl.value = temp;
  convert();
}

// Event Listeners
[amountEl, fromCurrencyEl, toCurrencyEl].forEach((el) => {
  el.addEventListener("input", convert);
});

swapBtn.addEventListener("click", swap);

// Initial conversion
convert();
