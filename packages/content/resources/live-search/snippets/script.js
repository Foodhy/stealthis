// Sample Data
const data = [
  { title: "Accordion Spring", category: "UI Components" },
  { title: "Digital Clock", category: "Widgets" },
  { title: "Video Player", category: "Media" },
  { title: "Like Button", category: "Social" },
  { title: "Stock Ticker", category: "Real-time" },
  { title: "Quiz Widget", category: "Interactive" },
  { title: "Memory Card Game", category: "Games" },
  { title: "Currency Converter", category: "Utilities" },
];

const input = document.getElementById("live-search-input");
const resultsList = document.getElementById("search-results-list");
const resultsCount = document.getElementById("results-count");
const clearBtn = document.getElementById("clear-search");
const spinner = document.getElementById("search-spinner");
const noResults = document.getElementById("no-results");
const queryDisplay = document.getElementById("search-query-display");

// Debounce Function
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

function performSearch(query) {
  spinner.style.display = "none";

  if (!query) {
    resultsList.innerHTML = "";
    resultsCount.textContent = "Enter a search term...";
    clearBtn.style.display = "none";
    noResults.style.display = "none";
    return;
  }

  clearBtn.style.display = "block";
  const filtered = data.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  displayResults(filtered, query);
}

function displayResults(results, query) {
  resultsList.innerHTML = "";

  if (results.length === 0) {
    noResults.style.display = "block";
    queryDisplay.textContent = query;
    resultsCount.textContent = "0 Results Found";
    return;
  }

  noResults.style.display = "none";
  resultsCount.textContent = `${results.length} Results Found`;

  results.forEach((item) => {
    const li = document.createElement("li");
    li.className = "result-item";
    li.innerHTML = `
      <span class="result-category">${item.category}</span>
      <span class="result-title">${item.title}</span>
    `;
    resultsList.appendChild(li);
  });
}

// Event Listeners
const debouncedSearch = debounce((e) => {
  performSearch(e.target.value.trim());
}, 300);

input.addEventListener("input", (e) => {
  if (e.target.value.trim()) {
    spinner.style.display = "block";
  }
  debouncedSearch(e);
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  performSearch("");
  input.focus();
});

// Initial state
performSearch("");
