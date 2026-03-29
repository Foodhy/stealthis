const container = document.getElementById("tabsContainer");
const tablist = document.getElementById("tablist");
const indicator = document.getElementById("tabIndicator");
const orientToggle = document.getElementById("orientToggle");
let orient = "vertical";

// Activate a tab
function activateTab(tab) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = document.querySelectorAll('[role="tabpanel"]');

  tabs.forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
    t.tabIndex = -1;
  });
  panels.forEach((p) => {
    p.classList.remove("active");
    p.hidden = true;
  });

  tab.classList.add("active");
  tab.setAttribute("aria-selected", "true");
  tab.tabIndex = 0;

  const panel = document.getElementById(tab.getAttribute("aria-controls"));
  if (panel) {
    panel.classList.add("active");
    panel.hidden = false;
  }

  moveIndicator(tab);
}

// Move indicator to active tab
function moveIndicator(tab) {
  if (!tab) return;
  const tRect = tab.getBoundingClientRect();
  const wRect = tablist.parentElement.getBoundingClientRect();

  if (orient === "vertical") {
    indicator.style.top = tRect.top - wRect.top + tablist.parentElement.scrollTop + "px";
    indicator.style.height = tRect.height + "px";
    indicator.style.left = "";
    indicator.style.width = "3px";
  } else {
    indicator.style.left = tRect.left - wRect.left + tablist.scrollLeft + "px";
    indicator.style.width = tRect.width + "px";
    indicator.style.top = "";
    indicator.style.height = "2px";
  }
}

// Click
tablist.addEventListener("click", (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (tab) activateTab(tab);
});

// Keyboard
tablist.addEventListener("keydown", (e) => {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const idx = tabs.indexOf(document.activeElement);
  let next;

  if (orient === "vertical") {
    if (e.key === "ArrowDown") next = tabs[(idx + 1) % tabs.length];
    if (e.key === "ArrowUp") next = tabs[(idx - 1 + tabs.length) % tabs.length];
  } else {
    if (e.key === "ArrowRight") next = tabs[(idx + 1) % tabs.length];
    if (e.key === "ArrowLeft") next = tabs[(idx - 1 + tabs.length) % tabs.length];
  }
  if (e.key === "Home") next = tabs[0];
  if (e.key === "End") next = tabs[tabs.length - 1];

  if (next) {
    e.preventDefault();
    next.focus();
    activateTab(next);
  }
});

// Orientation toggle
orientToggle?.addEventListener("click", () => {
  orient = orient === "vertical" ? "horizontal" : "vertical";
  container.dataset.orient = orient;
  orientToggle.textContent = orient === "vertical" ? "Switch to Horizontal" : "Switch to Vertical";
  // Reposition indicator after layout shift
  requestAnimationFrame(() => {
    const active = tablist.querySelector(".active");
    if (active) moveIndicator(active);
  });
});

// Init
const firstTab = tablist.querySelector('[role="tab"]');
if (firstTab) activateTab(firstTab);

// Reposition on resize
window.addEventListener("resize", () => {
  const active = tablist.querySelector(".active");
  if (active) moveIndicator(active);
});
