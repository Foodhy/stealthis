const DEMO_FILES = [
  { name: "report_q1_2026.pdf", size: "4.2 MB", icon: "📄" },
  { name: "hero_image.png", size: "2.8 MB", icon: "🖼" },
  { name: "data_export.xlsx", size: "1.1 MB", icon: "📊" },
  { name: "presentation.pptx", size: "8.6 MB", icon: "📋" },
  { name: "source_archive.zip", size: "22.4 MB", icon: "🗜" },
];

let items = [];
let demoIdx = 0;

function renderItems() {
  const list = document.getElementById("upList");
  const footer = document.getElementById("upFooter");
  const summary = document.getElementById("upSummary");

  list.innerHTML = "";

  if (items.length === 0) {
    footer.hidden = true;
    return;
  }
  footer.hidden = false;

  const done = items.filter((i) => i.status === "done").length;
  const err = items.filter((i) => i.status === "error").length;
  summary.textContent = `${done} of ${items.length} complete${err ? ` · ${err} failed` : ""}`;

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "up-item";
    div.id = `up-item-${item.id}`;

    const pctStr =
      item.status === "done" ? "100%" : item.status === "error" ? "Failed" : `${item.pct}%`;
    const fillCls =
      item.status === "done"
        ? "up-bar-fill--done"
        : item.status === "error"
          ? "up-bar-fill--error"
          : "";
    const statusCls =
      item.status === "done"
        ? "up-item-status--done"
        : item.status === "error"
          ? "up-item-status--error"
          : "";
    const statusText =
      item.status === "done"
        ? "✓ Complete"
        : item.status === "error"
          ? "✕ Failed"
          : item.status === "pending"
            ? "Waiting…"
            : "Uploading…";

    div.innerHTML = `
      <div class="up-item-icon">${item.icon}</div>
      <div class="up-item-body">
        <div class="up-item-name">${item.name}</div>
        <div class="up-bar-wrap">
          <div class="up-bar-fill ${fillCls}" style="width:${item.status === "done" ? 100 : item.pct}%"></div>
        </div>
        <div class="up-item-meta">
          <span class="up-item-status ${statusCls}">${statusText}</span>
          <span class="up-item-pct">${item.size} · ${pctStr}</span>
        </div>
      </div>
      <button class="up-item-remove" data-id="${item.id}" title="Remove">✕</button>
    `;
    list.appendChild(div);
  });
}

function startUpload(item) {
  item.status = "uploading";
  item.pct = 0;
  renderItems();

  const speed = 8 + Math.random() * 14;
  const interval = setInterval(() => {
    item.pct = Math.min(item.pct + speed * (0.8 + Math.random() * 0.4), 99);
    renderItems();

    if (item.pct >= 99) {
      clearInterval(interval);
      setTimeout(
        () => {
          item.status = Math.random() > 0.15 ? "done" : "error";
          item.pct = 100;
          renderItems();
        },
        300 + Math.random() * 400
      );
    }
  }, 120);
}

document.getElementById("upSimBtn").addEventListener("click", () => {
  const f = DEMO_FILES[demoIdx % DEMO_FILES.length];
  demoIdx++;
  const item = { id: Date.now(), ...f, pct: 0, status: "pending" };
  items.push(item);
  renderItems();
  setTimeout(() => startUpload(item), 400);
});

document.getElementById("upUploadAllBtn").addEventListener("click", () => {
  const pending = items.filter((i) => i.status === "pending" || i.status === "error");
  pending.forEach((item, i) => {
    setTimeout(() => startUpload(item), i * 300);
  });
});

document.getElementById("upClearBtn").addEventListener("click", () => {
  items = items.filter((i) => i.status === "uploading");
  renderItems();
});

document.getElementById("upList").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-id]");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  items = items.filter((i) => i.id !== id);
  renderItems();
});
