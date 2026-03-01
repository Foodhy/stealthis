(function () {
  "use strict";

  const container = document.getElementById("toast-container");

  const ICONS = {
    success: "✓",
    error:   "✕",
    warning: "⚠",
    info:    "ℹ",
  };

  const TITLES = {
    success: "Success",
    error:   "Error",
    warning: "Warning",
    info:    "Info",
  };

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {"success"|"error"|"warning"|"info"} type
   * @param {number} duration  Auto-dismiss delay in ms (default 4000)
   */
  function showToast(message, type = "info", duration = 4000) {
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    toast.innerHTML = `
      <span class="toast__icon" aria-hidden="true">${ICONS[type]}</span>
      <div class="toast__body">
        <span class="toast__title">${TITLES[type]}</span>
        <span class="toast__msg">${message}</span>
      </div>
      <button class="toast__close" aria-label="Dismiss notification">✕</button>
    `;

    container.appendChild(toast);

    // Auto-dismiss
    const timer = setTimeout(() => dismiss(toast), duration);

    // Manual dismiss
    toast.querySelector(".toast__close").addEventListener("click", () => {
      clearTimeout(timer);
      dismiss(toast);
    });
  }

  function dismiss(toast) {
    toast.classList.add("out");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }

  // Expose globally so onclick attributes work
  window.showToast = showToast;
})();
