const textArea = document.getElementById("text-input");
const wordCountEl = document.getElementById("word-count");
const charCountEl = document.getElementById("char-count");
const sentenceCountEl = document.getElementById("sentence-count");
const readingTimeEl = document.getElementById("reading-time");
const clearBtn = document.getElementById("clear-text");
const copyBtn = document.getElementById("copy-text");

function updateStats() {
  const text = textArea.value.trim();

  // Word Count
  const words = text ? text.split(/\s+/).length : 0;
  wordCountEl.textContent = words;

  // Char Count
  charCountEl.textContent = textArea.value.length;

  // Sentence Count
  const sentences = text ? text.split(/[.!?]+/).length - 1 : 0;
  sentenceCountEl.textContent = Math.max(0, sentences);

  // Reading Time (Avg 200 words per minute)
  const readingTime = Math.ceil(words / 200);
  readingTimeEl.textContent = `~${readingTime}m`;
}

textArea.addEventListener("input", updateStats);

clearBtn.addEventListener("click", () => {
  textArea.value = "";
  updateStats();
});

copyBtn.addEventListener("click", () => {
  textArea.select();
  document.execCommand("copy");

  const originalText = copyBtn.textContent;
  copyBtn.textContent = "Copied!";
  setTimeout(() => {
    copyBtn.textContent = originalText;
  }, 2000);
});

// Init
updateStats();
