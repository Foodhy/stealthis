// This component is mostly CSS-driven, but you can control visibility via JS
function setTyping(isTyping) {
  const container = document.querySelector('.typing-container');
  if (container) {
    container.style.display = isTyping ? 'flex' : 'none';
  }
}

// Example usage:
// setTyping(true);
// setTimeout(() => setTyping(false), 5000);
