// Animate the checkmark on load — CSS handles it via stroke-dashoffset animations
// This script triggers the confetti burst effect on load (optional enhancement)

function confetti() {
  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];
  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      width: ${4 + Math.random() * 6}px;
      height: ${4 + Math.random() * 6}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      left: ${20 + Math.random() * 60}%;
      top: -10px;
      pointer-events: none;
      z-index: 9999;
      transition: transform ${0.8 + Math.random() * 0.8}s ease, opacity ${0.8 + Math.random() * 0.4}s ease;
      opacity: 1;
    `;
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dot.style.transform = `translateY(${200 + Math.random() * 400}px) rotate(${Math.random() * 720}deg)`;
        dot.style.opacity = '0';
      });
    });
    setTimeout(() => dot.remove(), 1600);
  }
}

setTimeout(confetti, 600);
