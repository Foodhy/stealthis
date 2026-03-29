(function () {
  "use strict";

  const list = document.getElementById("item-list");
  const emptyState = document.getElementById("empty-state");
  const btnAdd = document.getElementById("btn-add");
  const btnClear = document.getElementById("btn-clear");

  const icons = ["✦", "◆", "●", "▲", "★", "◉", "⬟", "⬡"];
  const colors = [
    "rgba(109,40,217,0.25)",
    "rgba(59,130,246,0.25)",
    "rgba(16,185,129,0.25)",
    "rgba(245,158,11,0.25)",
    "rgba(239,68,68,0.25)",
    "rgba(236,72,153,0.25)",
    "rgba(14,165,233,0.25)",
    "rgba(168,85,247,0.25)",
  ];
  const borderColors = [
    "rgba(109,40,217,0.5)",
    "rgba(59,130,246,0.5)",
    "rgba(16,185,129,0.5)",
    "rgba(245,158,11,0.5)",
    "rgba(239,68,68,0.5)",
    "rgba(236,72,153,0.5)",
    "rgba(14,165,233,0.5)",
    "rgba(168,85,247,0.5)",
  ];
  const names = [
    "Design tokens updated",
    "New component merged",
    "Build pipeline passed",
    "Sprint review scheduled",
    "Pull request approved",
    "Test coverage improved",
    "Deployment complete",
    "Security audit passed",
    "Performance optimized",
    "Documentation updated",
    "API endpoint added",
    "Database migrated",
  ];

  let counter = 0;

  function updateEmpty() {
    const hasItems = list.querySelectorAll(".item:not(.exiting)").length > 0;
    emptyState.style.display = hasItems ? "none" : "block";
  }

  function addItem() {
    const i = counter % icons.length;
    counter++;
    const id = Date.now();
    const name = names[Math.floor(Math.random() * names.length)];
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const li = document.createElement("li");
    li.className = "item";
    li.dataset.id = id;
    li.innerHTML = `
      <div class="item-icon" style="background:${colors[i]};border:1px solid ${borderColors[i]};color:${borderColors[i].replace("0.5", "1")}">
        ${icons[i]}
      </div>
      <div class="item-content">
        <div class="item-name">${name}</div>
        <div class="item-time">${now}</div>
      </div>
      <button class="btn-remove" title="Remove">&times;</button>
    `;

    list.prepend(li);
    updateEmpty();
  }

  function removeItem(li) {
    li.classList.add("exiting");
    li.addEventListener(
      "animationend",
      () => {
        li.remove();
        updateEmpty();
      },
      { once: true }
    );
  }

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remove");
    if (!btn) return;
    const li = btn.closest(".item");
    if (li) removeItem(li);
  });

  btnAdd.addEventListener("click", addItem);

  btnClear.addEventListener("click", () => {
    const items = list.querySelectorAll(".item:not(.exiting)");
    items.forEach((li, i) => {
      setTimeout(() => removeItem(li), i * 50);
    });
  });

  // Start with a few items
  for (let i = 0; i < 3; i++) {
    setTimeout(() => addItem(), i * 120);
  }
})();
