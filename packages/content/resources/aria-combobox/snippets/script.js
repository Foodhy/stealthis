(() => {
  const countries = [
    { name: "Argentina", flag: "\uD83C\uDDE6\uD83C\uDDF7" },
    { name: "Australia", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
    { name: "Brazil", flag: "\uD83C\uDDE7\uD83C\uDDF7" },
    { name: "Canada", flag: "\uD83C\uDDE8\uD83C\uDDE6" },
    { name: "China", flag: "\uD83C\uDDE8\uD83C\uDDF3" },
    { name: "Denmark", flag: "\uD83C\uDDE9\uD83C\uDDF0" },
    { name: "Egypt", flag: "\uD83C\uDDEA\uD83C\uDDEC" },
    { name: "France", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
    { name: "Germany", flag: "\uD83C\uDDE9\uD83C\uDDEA" },
    { name: "India", flag: "\uD83C\uDDEE\uD83C\uDDF3" },
    { name: "Italy", flag: "\uD83C\uDDEE\uD83C\uDDF9" },
    { name: "Japan", flag: "\uD83C\uDDEF\uD83C\uDDF5" },
    { name: "Kenya", flag: "\uD83C\uDDF0\uD83C\uDDEA" },
    { name: "Mexico", flag: "\uD83C\uDDF2\uD83C\uDDFD" },
    { name: "Netherlands", flag: "\uD83C\uDDF3\uD83C\uDDF1" },
    { name: "Norway", flag: "\uD83C\uDDF3\uD83C\uDDF4" },
    { name: "Portugal", flag: "\uD83C\uDDF5\uD83C\uDDF9" },
    { name: "South Korea", flag: "\uD83C\uDDF0\uD83C\uDDF7" },
    { name: "Spain", flag: "\uD83C\uDDEA\uD83C\uDDF8" },
    { name: "Sweden", flag: "\uD83C\uDDF8\uD83C\uDDEA" },
    { name: "United Kingdom", flag: "\uD83C\uDDEC\uD83C\uDDE7" },
    { name: "United States", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  ];

  const input = document.getElementById("country-input");
  const listbox = document.getElementById("country-listbox");
  const combobox = document.querySelector('[role="combobox"]');
  const clearBtn = document.getElementById("clear-input");
  const statusEl = document.getElementById("combobox-status");
  const selectedValue = document.getElementById("selected-value");

  let activeIndex = -1;
  let filteredCountries = [...countries];
  let isOpen = false;

  function renderOptions(filter = "") {
    const query = filter.toLowerCase().trim();
    filteredCountries = query
      ? countries.filter((c) => c.name.toLowerCase().includes(query))
      : [...countries];

    listbox.innerHTML = "";
    activeIndex = -1;

    if (filteredCountries.length === 0) {
      listbox.innerHTML = '<li class="combobox-no-results">No countries found</li>';
      updateStatus("No results");
      return;
    }

    filteredCountries.forEach((country, i) => {
      const li = document.createElement("li");
      li.id = `option-${i}`;
      li.className = "combobox-option";
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      li.innerHTML = `<span class="combobox-option-flag" aria-hidden="true">${country.flag}</span>${country.name}`;

      li.addEventListener("click", () => selectOption(i));
      li.addEventListener("mouseenter", () => {
        setActiveOption(i, false);
      });

      listbox.appendChild(li);
    });

    const count = filteredCountries.length;
    updateStatus(
      count === 1
        ? "1 result available"
        : `${count} results available. Use Up and Down arrows to navigate.`
    );
  }

  function updateStatus(text) {
    statusEl.textContent = text;
  }

  function openListbox() {
    if (isOpen) return;
    isOpen = true;
    listbox.hidden = false;
    combobox.setAttribute("aria-expanded", "true");
    renderOptions(input.value);
  }

  function closeListbox() {
    if (!isOpen) return;
    isOpen = false;
    listbox.hidden = true;
    combobox.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-activedescendant", "");
    activeIndex = -1;
    updateStatus("");
  }

  function setActiveOption(index, scroll = true) {
    // Remove active from previous
    const options = listbox.querySelectorAll('[role="option"]');
    options.forEach((opt) => opt.classList.remove("combobox-option--active"));

    if (index < 0 || index >= filteredCountries.length) {
      activeIndex = -1;
      input.setAttribute("aria-activedescendant", "");
      return;
    }

    activeIndex = index;
    const activeEl = options[index];
    activeEl.classList.add("combobox-option--active");
    input.setAttribute("aria-activedescendant", activeEl.id);

    if (scroll) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }

  function selectOption(index) {
    const country = filteredCountries[index];
    if (!country) return;

    input.value = country.name;
    selectedValue.textContent = `${country.flag} ${country.name}`;
    clearBtn.hidden = false;

    // Mark as selected
    const options = listbox.querySelectorAll('[role="option"]');
    options.forEach((opt) => opt.setAttribute("aria-selected", "false"));
    if (options[index]) {
      options[index].setAttribute("aria-selected", "true");
    }

    closeListbox();
    updateStatus(`${country.name} selected`);
  }

  // Input events
  input.addEventListener("input", () => {
    clearBtn.hidden = !input.value;
    if (!isOpen) openListbox();
    renderOptions(input.value);
  });

  input.addEventListener("focus", () => {
    openListbox();
  });

  input.addEventListener("keydown", (e) => {
    const optionCount = filteredCountries.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          openListbox();
        } else {
          setActiveOption(activeIndex < optionCount - 1 ? activeIndex + 1 : 0);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          openListbox();
        } else {
          setActiveOption(activeIndex > 0 ? activeIndex - 1 : optionCount - 1);
        }
        break;

      case "Home":
        if (isOpen && optionCount > 0) {
          e.preventDefault();
          setActiveOption(0);
        }
        break;

      case "End":
        if (isOpen && optionCount > 0) {
          e.preventDefault();
          setActiveOption(optionCount - 1);
        }
        break;

      case "Enter":
        e.preventDefault();
        if (isOpen && activeIndex >= 0) {
          selectOption(activeIndex);
        }
        break;

      case "Escape":
        if (isOpen) {
          e.preventDefault();
          closeListbox();
        }
        break;
    }
  });

  // Clear button
  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.hidden = true;
    selectedValue.textContent = "None";
    input.focus();
    renderOptions("");
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".combobox-wrapper")) {
      closeListbox();
    }
  });

  // Initialize
  renderOptions("");
})();
