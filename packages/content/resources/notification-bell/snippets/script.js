let notifications = [
  {
    id: 1,
    avatar: "SK",
    color: "#0ea5e9",
    text: "<strong>Sarah Kim</strong> commented on your resource",
    time: "2 min ago",
    read: false,
    group: "Today",
  },
  {
    id: 2,
    avatar: "⚡",
    color: "#818cf8",
    text: "New component <strong>Sidebar Admin</strong> released",
    time: "1 hour ago",
    read: false,
    group: "Today",
  },
  {
    id: 3,
    avatar: "MR",
    color: "#8b5cf6",
    text: "<strong>Marcus Reed</strong> starred your snippet",
    time: "3 hours ago",
    read: false,
    group: "Today",
  },
  {
    id: 4,
    avatar: "🚀",
    color: "#f59e0b",
    text: "Phase 8 components are now live in the library",
    time: "Yesterday",
    read: true,
    group: "Earlier",
  },
  {
    id: 5,
    avatar: "JL",
    color: "#34d399",
    text: "<strong>Julia Lee</strong> started following you",
    time: "2 days ago",
    read: true,
    group: "Earlier",
  },
];

let removedItem = null,
  undoTimer = null;
const bellBtn = document.getElementById("bellBtn");
const bellBadge = document.getElementById("bellBadge");
const panel = document.getElementById("notifPanel");
const list = document.getElementById("notifList");
const empty = document.getElementById("notifEmpty");
const markAll = document.getElementById("markAllBtn");

function unreadCount() {
  return notifications.filter((n) => !n.read).length;
}

function render() {
  list.innerHTML = "";
  const groups = ["Today", "Earlier"];
  let anyVisible = false;

  groups.forEach((group) => {
    const items = notifications.filter((n) => n.group === group);
    if (!items.length) return;
    anyVisible = true;

    const label = document.createElement("div");
    label.className = "notif-group-label";
    label.textContent = group;
    list.appendChild(label);

    items.forEach((n) => {
      const el = document.createElement("div");
      el.className = "notif-item" + (n.read ? "" : " unread");
      el.dataset.id = n.id;
      el.innerHTML = `
        <div class="notif-dot"></div>
        <div class="notif-avatar" style="background:${n.color}">${n.avatar}</div>
        <div class="notif-body">
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        <button class="notif-del" aria-label="Remove notification">×</button>
      `;
      // Mark read on click
      el.addEventListener("click", (e) => {
        if (e.target.classList.contains("notif-del")) return;
        n.read = true;
        render();
      });
      // Delete
      el.querySelector(".notif-del").addEventListener("click", (e) => {
        e.stopPropagation();
        removeNotif(n.id);
      });
      list.appendChild(el);
    });
  });

  const count = unreadCount();
  bellBadge.textContent = count || "";
  empty.hidden = anyVisible;
  list.hidden = !anyVisible;
}

function removeNotif(id) {
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx === -1) return;
  removedItem = { ...notifications[idx], idx };
  notifications.splice(idx, 1);
  render();

  // Undo toast
  clearTimeout(undoTimer);
  const toast = document.getElementById("undoToast");
  toast.hidden = false;
  undoTimer = setTimeout(() => {
    toast.hidden = true;
    removedItem = null;
  }, 3500);
}

document.getElementById("undoBtn")?.addEventListener("click", () => {
  if (!removedItem) return;
  notifications.splice(removedItem.idx, 0, { ...removedItem });
  removedItem = null;
  clearTimeout(undoTimer);
  document.getElementById("undoToast").hidden = true;
  render();
});

// Mark all
markAll?.addEventListener("click", () => {
  notifications.forEach((n) => (n.read = true));
  render();
});

// Toggle panel
bellBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  const open = panel.hidden;
  panel.hidden = !open;
  bellBtn.setAttribute("aria-expanded", String(open));
});

// Close outside
document.addEventListener("click", (e) => {
  if (!document.getElementById("notifWrap").contains(e.target)) {
    panel.hidden = true;
    bellBtn.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    panel.hidden = true;
    bellBtn.setAttribute("aria-expanded", "false");
  }
});

render();
