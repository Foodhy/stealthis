(() => {
  const STORAGE_KEY = "text-spacing-prefs";

  const content = document.getElementById("text-content");
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");

  const sliders = {
    letterSpacing: {
      input: document.getElementById("letter-spacing"),
      output: document.getElementById("letter-spacing-output"),
      prop: "--text-letter-spacing",
      unit: "em",
      wcagMin: 0.12,
      default: 0,
    },
    wordSpacing: {
      input: document.getElementById("word-spacing"),
      output: document.getElementById("word-spacing-output"),
      prop: "--text-word-spacing",
      unit: "em",
      wcagMin: 0.16,
      default: 0,
    },
    lineHeight: {
      input: document.getElementById("line-height"),
      output: document.getElementById("line-height-output"),
      prop: "--text-line-height",
      unit: "",
      wcagMin: 1.5,
      default: 1.5,
    },
    paragraphSpacing: {
      input: document.getElementById("paragraph-spacing"),
      output: document.getElementById("paragraph-spacing-output"),
      prop: "--text-paragraph-spacing",
      unit: "em",
      wcagMin: 2.0,
      default: 0,
    },
  };

  function updateDisplay() {
    let passingCount = 0;
    const total = Object.keys(sliders).length;

    for (const key of Object.keys(sliders)) {
      const s = sliders[key];
      const val = parseFloat(s.input.value);
      const display = s.unit ? val.toFixed(2) + s.unit : val.toFixed(1);
      s.output.textContent = display;
      content.style.setProperty(s.prop, val + s.unit);

      if (val >= s.wcagMin) passingCount++;
    }

    // Update status
    statusDot.classList.remove("passing", "partial");
    if (passingCount === total) {
      statusDot.classList.add("passing");
      statusText.textContent = "Meets WCAG 1.4.12";
    } else if (passingCount > 0) {
      statusDot.classList.add("partial");
      statusText.textContent = `${passingCount}/${total} criteria met`;
    } else {
      statusText.textContent = "Default spacing";
    }

    savePrefs();
  }

  function savePrefs() {
    const prefs = {};
    for (const key of Object.keys(sliders)) {
      prefs[key] = parseFloat(sliders[key].input.value);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }

  function loadPrefs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const prefs = JSON.parse(saved);
      for (const key of Object.keys(prefs)) {
        if (sliders[key]) {
          sliders[key].input.value = prefs[key];
        }
      }
    } catch {
      // ignore
    }
  }

  function applyWCAG() {
    for (const key of Object.keys(sliders)) {
      sliders[key].input.value = sliders[key].wcagMin;
    }
    updateDisplay();
  }

  function resetAll() {
    for (const key of Object.keys(sliders)) {
      sliders[key].input.value = sliders[key].default;
    }
    updateDisplay();
  }

  // Bind events
  for (const key of Object.keys(sliders)) {
    sliders[key].input.addEventListener("input", updateDisplay);
  }

  document.getElementById("btn-wcag").addEventListener("click", applyWCAG);
  document.getElementById("btn-reset").addEventListener("click", resetAll);

  // Initialize
  loadPrefs();
  updateDisplay();
})();
