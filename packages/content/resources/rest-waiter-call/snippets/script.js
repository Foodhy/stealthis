const ACTIONS = {
  water: { label: "Water", verb: "Topping up your water" },
  bread: { label: "More bread", verb: "Bringing more bread" },
  menu: { label: "Menu", verb: "Bringing a menu" },
  allergy: { label: "Allergy question", verb: "Your server is on their way" },
  bill: { label: "Bill", verb: "Bringing your bill" },
  photo: { label: "Photo", verb: "Coming for a quick photo" },
};

const grid = document.getElementById("grid");
const status = document.getElementById("status");
const statusText = status.querySelector(".status-text");
const noteEl = document.getElementById("note");
const stateEl = document.getElementById("state");
const stateLabel = document.getElementById("stateLabel");
const stateMeta = document.getElementById("stateMeta");
const cancelBtn = document.getElementById("cancel");
const lastEl = document.getElementById("last");

let activeId = null;
let phase = null;
let timer = null;
let sentAt = null;

function setStatus(s, text) {
  status.dataset.s = s;
  statusText.textContent = text;
}

function send(id) {
  if (activeId) return;
  activeId = id;
  sentAt = Date.now();
  phase = "sent";
  const note = noteEl.value.trim();
  stateEl.hidden = false;
  stateLabel.textContent = `${ACTIONS[id].label}${note ? ` · "${note}"` : ""}`;
  stateMeta.textContent = "Sent · waiting for server";
  setStatus("sent", "Sent · waiting");
  // Mark button active, disable others
  document.querySelectorAll(".action").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.id === id);
    b.disabled = b.dataset.id !== id;
  });
  // Schedule progression
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (phase !== "sent") return;
    phase = "ontheway";
    setStatus("ontheway", "On the way");
    stateMeta.textContent = ACTIONS[id].verb;
    timer = setTimeout(() => {
      if (phase !== "ontheway") return;
      phase = "done";
      setStatus("done", "Done · enjoy");
      stateMeta.textContent = `${ACTIONS[id].verb} · completed`;
      lastEl.innerHTML = `Last call · <b>${ACTIONS[id].label}</b> · just now`;
      timer = setTimeout(() => reset(true), 3500);
    }, 3000);
  }, 2200);
}

function reset(keepLast) {
  clearTimeout(timer);
  activeId = null;
  phase = null;
  stateEl.hidden = true;
  setStatus("", "Idle · tap a request");
  document.querySelectorAll(".action").forEach((b) => {
    b.classList.remove("is-active");
    b.disabled = false;
  });
  noteEl.value = "";
}

grid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-id]");
  if (!btn || btn.disabled) return;
  send(btn.dataset.id);
});

cancelBtn.addEventListener("click", () => {
  if (phase === "sent") {
    setStatus("", "Cancelled · idle");
    setTimeout(() => reset(true), 800);
  } else {
    reset(true);
  }
});

setStatus("", "Idle · tap a request");
