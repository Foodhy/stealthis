// ── Helpers ──
const $ = (id) => document.getElementById(id);
const toast = $("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}
const fmt = (n) =>
  `€${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Live clock ──
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  $("clockTime").textContent = `${hh}:${mm}:${ss}`;
}
function updateDate() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const day = days[now.getDay()];
  const d = String(now.getDate()).padStart(2, "0");
  const mon = now.toLocaleString("en-GB", { month: "short" });
  $("clockDate").textContent = `${day} ${d} ${mon} ${now.getFullYear()}`;
}
function updateGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  $("greeting").textContent = `${g}, Mr. Fontaine`;
}
updateClock();
updateDate();
updateGreeting();
setInterval(updateClock, 1000);

// ── Screen navigation ──
const screenHome = $("screenHome");
const panelMap = {
  roomService: "panelRoomService",
  housekeeping: "panelHousekeeping",
  spa: "panelSpa",
  tv: "panelTv",
  climate: "panelClimate",
  concierge: "panelConcierge",
  checkout: "panelCheckout",
};

function openPanel(key) {
  screenHome.hidden = true;
  Object.values(panelMap).forEach((id) => $(`${id}`) && ($(`${id}`).hidden = true));
  const el = $(panelMap[key]);
  if (el) el.hidden = false;
}

function goHome() {
  Object.values(panelMap).forEach((id) => {
    const el = $(id);
    if (el) el.hidden = true;
  });
  screenHome.hidden = false;
}

// ── Tile click → open panel ──
document
  .querySelectorAll(".tile[data-panel]")
  .forEach((tile) => tile.addEventListener("click", () => openPanel(tile.dataset.panel)));

// ── Back buttons ──
document
  .querySelectorAll(".back-btn[data-home]")
  .forEach((b) => b.addEventListener("click", goHome));

// ── Simple-tile toast buttons ──
document
  .querySelectorAll(".simple-tile[data-toast]")
  .forEach((b) => b.addEventListener("click", () => showToast(b.dataset.toast)));

// ── Checkout panel buttons ──
document
  .querySelectorAll(
    "#panelCheckout .primary-btn[data-toast], #panelCheckout .ghost-btn[data-toast]"
  )
  .forEach((b) =>
    b.addEventListener("click", () => {
      showToast(b.dataset.toast);
      if (b.classList.contains("primary-btn")) setTimeout(goHome, 2400);
    })
  );

// ── Room service order builder ──
const ORDER_PRICES = { b1: 14, b2: 18, b3: 9, d1: 28, d2: 32, d3: 12 };
const orderQty = { b1: 0, b2: 0, b3: 0, d1: 0, d2: 0, d3: 0 };

function calcOrderTotal() {
  return Object.entries(orderQty).reduce(
    (sum, [id, qty]) => sum + (ORDER_PRICES[id] || 0) * qty,
    0
  );
}
function updateOrderUI() {
  const total = calcOrderTotal();
  $("orderTotal").textContent = fmt(total);
  const count = Object.values(orderQty).reduce((a, b) => a + b, 0);
  $("orderNote").textContent =
    count > 0 ? `${count} item${count > 1 ? "s" : ""} selected` : "No items selected";
  $("sendOrderBtn").disabled = total === 0;
  // Highlight qty values
  Object.entries(orderQty).forEach(([id, qty]) => {
    const el = $(`qty-${id}`);
    if (el) {
      el.textContent = qty;
      el.style.color = qty > 0 ? "var(--gold-light)" : "";
    }
  });
}

document.querySelectorAll(".menu-item").forEach((item) => {
  const id = item.dataset.id;
  item.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = parseInt(btn.dataset.delta, 10);
      orderQty[id] = Math.max(0, Math.min(9, (orderQty[id] || 0) + delta));
      updateOrderUI();
    });
  });
});

$("sendOrderBtn").addEventListener("click", () => {
  const count = Object.values(orderQty).reduce((a, b) => a + b, 0);
  const total = calcOrderTotal();
  showToast(`Order sent to kitchen · ${count} item${count !== 1 ? "s" : ""} · ${fmt(total)}`);
  // Reset order
  Object.keys(orderQty).forEach((k) => (orderQty[k] = 0));
  updateOrderUI();
  setTimeout(goHome, 2500);
});

// ── Climate panel ──
let tempC = 22;
const ECO_MIN = 19;
const ECO_MAX = 26;

function updateTemp() {
  $("tempVal").textContent = tempC;
  $("tempDown").disabled = tempC <= ECO_MIN;
  $("tempUp").disabled = tempC >= ECO_MAX;
}

$("tempDown").addEventListener("click", () => {
  if (tempC > ECO_MIN) {
    tempC--;
    updateTemp();
    showToast(`Temperature set to ${tempC} °C`);
  }
});
$("tempUp").addEventListener("click", () => {
  if (tempC < ECO_MAX) {
    tempC++;
    updateTemp();
    showToast(`Temperature set to ${tempC} °C`);
  }
});

document.querySelectorAll(".light-toggle").forEach((toggle) => {
  toggle.addEventListener("change", () => {
    const zone = toggle.dataset.zone;
    const state = toggle.checked ? "on" : "off";
    showToast(`${zone.charAt(0).toUpperCase() + zone.slice(1)} light ${state}`);
  });
});

const dndCheck = $("dndCheck");
const dndText = $("dndText");
dndCheck.addEventListener("change", () => {
  dndText.textContent = dndCheck.checked ? "On — Door hanger active" : "Off";
  showToast(dndCheck.checked ? "Do Not Disturb activated" : "Do Not Disturb deactivated");
});

// ── Init ──
updateOrderUI();
updateTemp();
