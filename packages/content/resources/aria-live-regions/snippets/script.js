(() => {
  const politeRegion = document.getElementById("polite-region");
  const assertiveRegion = document.getElementById("assertive-region");
  const statusRegion = document.getElementById("status-region");
  const logEntries = document.getElementById("log-entries");

  const notifications = [
    "Alice commented on your pull request.",
    "Deployment to production completed successfully.",
    "New team member Bob joined the project.",
    "Your report export is ready for download.",
    "Sprint review meeting starts in 15 minutes.",
    "3 new commits pushed to the main branch.",
    "Security scan passed with no vulnerabilities.",
    "Your subscription has been renewed.",
  ];

  const errors = [
    "Payment failed: card declined. Update your billing information.",
    "Session expired. You will be signed out in 30 seconds.",
    "Critical: database connection lost. Retrying...",
    "API rate limit exceeded. Please wait before retrying.",
  ];

  const items = [
    "Dashboard",
    "Analytics",
    "Reports",
    "Settings",
    "Users",
    "Billing",
    "Integrations",
    "Notifications",
    "Security",
    "Team",
    "Projects",
    "API Keys",
  ];

  let notifIndex = 0;
  let errorIndex = 0;

  function addToLog(type, message) {
    const emptyMsg = logEntries.querySelector(".log-empty");
    if (emptyMsg) emptyMsg.remove();

    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `
      <span class="log-tag log-tag--${type}">${type}</span>
      <span class="log-message">${message}</span>
    `;
    logEntries.prepend(entry);
  }

  // Polite: Add Notification
  document.getElementById("add-notification").addEventListener("click", () => {
    const msg = notifications[notifIndex % notifications.length];
    notifIndex++;

    const item = document.createElement("div");
    item.className = "notification-item";

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    item.innerHTML = `
      <span class="notification-dot" aria-hidden="true"></span>
      <div>
        <div class="notification-text">${msg}</div>
        <div class="notification-time">${time}</div>
      </div>
    `;
    politeRegion.prepend(item);
    addToLog("polite", msg);
  });

  // Clear polite
  document.getElementById("clear-polite").addEventListener("click", () => {
    politeRegion.innerHTML = "";
  });

  // Assertive: Trigger Error
  document.getElementById("trigger-error").addEventListener("click", () => {
    const msg = errors[errorIndex % errors.length];
    errorIndex++;

    assertiveRegion.innerHTML = `
      <div class="error-alert">
        <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span class="error-text">${msg}</span>
      </div>
    `;
    addToLog("assertive", msg);
  });

  // Clear assertive
  document.getElementById("clear-assertive").addEventListener("click", () => {
    assertiveRegion.innerHTML = "";
  });

  // Status: Search filter
  document.getElementById("search-input").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = query ? items.filter((i) => i.toLowerCase().includes(query)) : items;

    const count = filtered.length;
    const msg = count === 1 ? "1 result found" : `${count} results found`;

    statusRegion.innerHTML = `<span class="status-text">${msg}</span>`;
    addToLog("status", msg);
  });

  // Clear log
  document.getElementById("clear-log").addEventListener("click", () => {
    logEntries.innerHTML =
      '<div class="log-empty">No announcements yet. Trigger an action above.</div>';
  });
})();
