// ── Channel data ─────────────────────────────────────────────────────────────
const CHANNELS = [
  {
    id: "booking",
    name: "Booking.com",
    type: "OTA · Preferred Partner",
    logoChar: "B",
    logoBg: "linear-gradient(135deg,#003580,#0069b4)",
    logoColor: "#fff",
    connected: true,
    lastSync: "2026-06-09 07:42",
    roomsMapped: 7,
    totalRooms: 7,
    parity: "ok",
    pending: 0,
  },
  {
    id: "expedia",
    name: "Expedia",
    type: "OTA · Elite Partner",
    logoChar: "E",
    logoBg: "linear-gradient(135deg,#fca011,#e08000)",
    logoColor: "#fff",
    connected: true,
    lastSync: "2026-06-09 07:38",
    roomsMapped: 6,
    totalRooms: 7,
    parity: "warn",
    pending: 3,
  },
  {
    id: "airbnb",
    name: "Airbnb",
    type: "Vacation Rental",
    logoChar: "A",
    logoBg: "linear-gradient(135deg,#ff5a5f,#c0392b)",
    logoColor: "#fff",
    connected: true,
    lastSync: "2026-06-09 06:55",
    roomsMapped: 4,
    totalRooms: 7,
    parity: "ok",
    pending: 1,
  },
  {
    id: "direct",
    name: "Direct (Website)",
    type: "Owned Channel",
    logoChar: "Æ",
    logoBg: "linear-gradient(135deg,#1a2b4a,#0f1d36)",
    logoColor: "#c9a649",
    connected: true,
    lastSync: "2026-06-09 08:01",
    roomsMapped: 7,
    totalRooms: 7,
    parity: "ok",
    pending: 0,
  },
  {
    id: "google",
    name: "Google Hotel Ads",
    type: "Meta-search",
    logoChar: "G",
    logoBg: "linear-gradient(135deg,#4285f4,#1a66d2)",
    logoColor: "#fff",
    connected: false,
    lastSync: "2026-06-08 22:10",
    roomsMapped: 5,
    totalRooms: 7,
    parity: "ok",
    pending: 0,
  },
];

// ── State ────────────────────────────────────────────────────────────────────
// channels is a shallow mutable copy so we can update lastSync / parity etc.
const state = CHANNELS.map((c) => ({ ...c }));
let syncingIds = new Set();

// ── Toast helper ─────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Summary bar ──────────────────────────────────────────────────────────────
function updateSummary() {
  const connected = state.filter((c) => c.connected).length;
  const warnings = state.filter((c) => c.parity === "warn").length;
  const synced = state.filter((c) => c.connected && !syncingIds.has(c.id)).length;
  document.getElementById("sumConnected").textContent = connected;
  document.getElementById("sumSynced").textContent = synced;
  document.getElementById("sumWarnings").textContent = warnings;

  const hpDot = document.getElementById("hpDot");
  const hpLabel = document.getElementById("hpLabel");
  if (warnings > 0) {
    hpDot.className = "hp-dot warn";
    hpLabel.textContent = `${warnings} warning${warnings !== 1 ? "s" : ""}`;
  } else if (connected === state.length) {
    hpDot.className = "hp-dot ok";
    hpLabel.textContent = "All channels healthy";
  } else {
    hpDot.className = "hp-dot warn";
    hpLabel.textContent = `${state.length - connected} disconnected`;
  }
}

// ── Format last sync time ─────────────────────────────────────────────────────
function fmtSync(ts) {
  if (!ts) return "Never";
  const [datePart, timePart] = ts.split(" ");
  const today = "2026-06-09";
  if (datePart === today) return `Today ${timePart}`;
  const yesterday = "2026-06-08";
  if (datePart === yesterday) return `Yesterday ${timePart}`;
  return ts;
}

// ── Render a single card ──────────────────────────────────────────────────────
function renderCard(ch) {
  const syncing = syncingIds.has(ch.id);
  const statusLabel = syncing ? "Syncing…" : !ch.connected ? "Disconnected" : "Connected";
  const statusClass = syncing ? "syncing" : !ch.connected ? "disconnected" : "connected";

  const parityHTML =
    ch.parity === "warn" && ch.connected
      ? `<div class="ch-parity-warn">
         ⚠ Rate parity mismatch — rates out of sync with Booking.com
         <button class="resolve-btn" data-id="${ch.id}">Resolve</button>
       </div>`
      : "";

  const pendingClass = ch.pending > 0 ? "pending" : "none";
  const pendingLabel = ch.pending > 0 ? `${ch.pending} pending` : "None";

  const parityValClass = ch.parity === "ok" ? "ok" : "warn";
  const parityValLabel = ch.parity === "ok" ? "✓ Parity OK" : "⚠ Mismatch";

  return `<article class="ch-card${!ch.connected ? " is-disconnected" : ""}" data-id="${ch.id}">
    <div class="ch-header">
      <div class="ch-logo" style="background:${ch.logoBg};color:${ch.logoColor}">${ch.logoChar}</div>
      <div class="ch-title-block">
        <div class="ch-name">${ch.name}</div>
        <div class="ch-type">${ch.type}</div>
      </div>
      <span class="ch-status-badge ${statusClass}">${statusLabel}</span>
    </div>

    <div class="ch-stats">
      <div class="ch-stat">
        <span class="ch-stat-label">Rooms mapped</span>
        <span class="ch-stat-val">${ch.roomsMapped}/${ch.totalRooms}</span>
      </div>
      <div class="ch-stat">
        <span class="ch-stat-label">Rate parity</span>
        <span class="ch-stat-val ${parityValClass}">${parityValLabel}</span>
      </div>
      <div class="ch-stat">
        <span class="ch-stat-label">Pending</span>
        <span class="ch-stat-val ${pendingClass}">${pendingLabel}</span>
      </div>
    </div>

    <div class="ch-sync-row">
      <span class="sync-icon${syncing ? " spinning" : ""}">⟳</span>
      <span>Last sync:</span>
      <span class="sync-time">${fmtSync(ch.lastSync)}</span>
    </div>

    ${parityHTML}

    <div class="ch-footer">
      <button class="ch-btn sync-btn" data-id="${ch.id}"${!ch.connected || syncing ? " disabled" : ""}>
        ${syncing ? "Syncing…" : "Sync now"}
      </button>
      <button class="ch-btn toggle-btn${ch.connected ? "" : " primary"}" data-id="${ch.id}">
        ${ch.connected ? "Disconnect" : "Connect"}
      </button>
    </div>
  </article>`;
}

// ── Render all cards ──────────────────────────────────────────────────────────
function renderAll() {
  document.getElementById("cardsGrid").innerHTML = state.map(renderCard).join("");
  bindCardEvents();
  updateSummary();
}

// ── Bind card events ──────────────────────────────────────────────────────────
function bindCardEvents() {
  // Sync now buttons
  document.querySelectorAll(".sync-btn").forEach((btn) => {
    btn.addEventListener("click", () => syncChannel(btn.dataset.id));
  });

  // Connect/disconnect toggles
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ch = state.find((c) => c.id === btn.dataset.id);
      if (!ch) return;
      ch.connected = !ch.connected;
      renderAll();
      showToast(`${ch.name} ${ch.connected ? "connected" : "disconnected"}`);
    });
  });

  // Resolve parity
  document.querySelectorAll(".resolve-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ch = state.find((c) => c.id === btn.dataset.id);
      if (!ch) return;
      ch.parity = "ok";
      ch.pending = 0;
      renderAll();
      showToast(`Rate parity resolved for ${ch.name}`);
    });
  });
}

// ── Sync single channel ───────────────────────────────────────────────────────
function syncChannel(id, delay = 0) {
  const ch = state.find((c) => c.id === id);
  if (!ch || !ch.connected || syncingIds.has(id)) return Promise.resolve();

  syncingIds.add(id);
  renderAll();

  return new Promise((resolve) => {
    setTimeout(
      () => {
        // build a "now" timestamp from fixed mock date context
        const now = new Date("2026-06-09T00:00:00");
        const rand = Math.floor(Math.random() * 3600000); // random within an hour
        const ts = new Date(now.getTime() + rand + delay * 1000);
        const hhmm = ts.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        ch.lastSync = `2026-06-09 ${hhmm}`;
        ch.pending = 0;
        syncingIds.delete(id);
        renderAll();
        resolve();
      },
      1600 + delay * 200
    );
  });
}

// ── Sync all ──────────────────────────────────────────────────────────────────
document.getElementById("syncAllBtn").addEventListener("click", async () => {
  const btn = document.getElementById("syncAllBtn");
  btn.disabled = true;
  showToast("Syncing all connected channels…");

  const connected = state.filter((c) => c.connected);
  for (let i = 0; i < connected.length; i++) {
    syncChannel(connected[i].id, i);
  }

  // wait for all to finish
  const longestDelay = 1600 + (connected.length - 1) * 200 + 200;
  setTimeout(() => {
    btn.disabled = false;
    showToast("All channels synced successfully");
  }, longestDelay);
});

// ── Clock ────────────────────────────────────────────────────────────────────
function tick() {
  const now = new Date();
  const hhmm = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const wk = now.toLocaleDateString("en-GB", { weekday: "short" });
  document.getElementById("clock").textContent = `${hhmm} · ${wk}`;
}
tick();
setInterval(tick, 1000);

// ── Boot ─────────────────────────────────────────────────────────────────────
renderAll();
