const units = {
  length: {
    meters: 1,
    kilometers: 1000,
    centimeters: 0.01,
    millimeters: 0.001,
    miles: 1609.34,
    feet: 0.3048,
    inches: 0.0254,
  },
  weight: {
    kilograms: 1,
    grams: 0.001,
    milligrams: 0.000001,
    pounds: 0.453592,
    ounces: 0.0283495,
  },
  temperature: {
    celsius: "C",
    fahrenheit: "F",
    kelvin: "K",
  },
};

let currentCategory = "length";

const fromValEl = document.getElementById("unit-from-val");
const toValEl = document.getElementById("unit-to-val");
const fromTypeEl = document.getElementById("unit-from-type");
const toTypeEl = document.getElementById("unit-to-type");
const tabs = document.querySelectorAll(".unit-tab");

function populateSelects() {
  const categoryUnits = units[currentCategory];
  fromTypeEl.innerHTML = "";
  toTypeEl.innerHTML = "";

  Object.keys(categoryUnits).forEach((unit) => {
    const opt1 = new Option(unit.charAt(0).toUpperCase() + unit.slice(1), unit);
    const opt2 = new Option(unit.charAt(0).toUpperCase() + unit.slice(1), unit);
    fromTypeEl.add(opt1);
    toTypeEl.add(opt2);
  });

  if (toTypeEl.options.length > 1) {
    toTypeEl.selectedIndex = 1;
  }
}

function convert() {
  const value = parseFloat(fromValEl.value) || 0;
  const fromUnit = fromTypeEl.value;
  const toUnit = toTypeEl.value;

  if (currentCategory === "temperature") {
    toValEl.value = convertTemperature(value, fromUnit, toUnit);
  } else {
    const categoryUnits = units[currentCategory];
    const valueInBase = value * categoryUnits[fromUnit];
    const result = valueInBase / categoryUnits[toUnit];
    toValEl.value = parseFloat(result.toFixed(6));
  }
}

function convertTemperature(value, from, to) {
  let celsius;
  if (from === "celsius") celsius = value;
  else if (from === "fahrenheit") celsius = ((value - 32) * 5) / 9;
  else if (from === "kelvin") celsius = value - 273.15;

  let result;
  if (to === "celsius") result = celsius;
  else if (to === "fahrenheit") result = (celsius * 9) / 5 + 32;
  else if (to === "kelvin") result = celsius + 273.15;

  return parseFloat(result.toFixed(2));
}

// Event Listeners
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    populateSelects();
    convert();
  });
});

[fromValEl, fromTypeEl, toTypeEl].forEach((el) => {
  el.addEventListener("input", convert);
});

// Init
populateSelects();
convert();
