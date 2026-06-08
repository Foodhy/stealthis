// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Tab switching ────────────────────────────────────────────────────────────
const tabs = document.querySelectorAll(".tab");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
      document.getElementById(t.getAttribute("aria-controls")).hidden = !active;
    });
  });
});

// ── Update upcoming count from live DOM state ────────────────────────────────
function refreshUpcomingCount() {
  const open = document.querySelectorAll('#panel-upcoming .card[data-state="upcoming"]').length;
  document.getElementById("count-upcoming").textContent = open;
}

// ── Card actions ─────────────────────────────────────────────────────────────
function cancelCard(card) {
  card.dataset.state = "cancelled";
  card.classList.add("is-cancelled");
  card.querySelector(".badge").className = "badge cancelled";
  card.querySelector(".badge").textContent = "Cancelled";
  card.querySelector(".confirm").remove();
  refreshUpcomingCount();
  showToast("Appointment cancelled — a confirmation has been sent.");
}

function askConfirm(card) {
  if (card.querySelector(".confirm")) return;
  const actions = card.querySelector(".actions");
  actions.remove();
  const box = document.createElement("div");
  box.className = "confirm";
  box.innerHTML =
    "<p>Cancel this appointment?</p>" +
    '<div class="confirm-actions">' +
    '<button class="btn ghost" data-action="keep">Keep it</button>' +
    '<button class="btn solid-danger" data-action="confirm">Yes, cancel</button>' +
    "</div>";
  card.appendChild(box);
}

function keepCard(card) {
  card.querySelector(".confirm").remove();
  const actions = document.createElement("div");
  actions.className = "actions";
  actions.innerHTML =
    '<button class="btn ghost" data-action="reschedule">Reschedule</button>' +
    '<button class="btn danger" data-action="cancel">Cancel</button>';
  card.appendChild(actions);
}

document.querySelector(".appts").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn || btn.classList.contains("tab")) return;
  const card = btn.closest(".card");
  const action = btn.dataset.action;
  if (action === "cancel") askConfirm(card);
  else if (action === "confirm") cancelCard(card);
  else if (action === "keep") keepCard(card);
  else if (action === "reschedule") showToast("Reschedule: pick a new slot from the calendar.");
  else if (action === "summary") showToast("Opening your visit summary…");
});
