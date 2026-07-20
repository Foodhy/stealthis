// Long-press context menu — Pointer Events, pointer capture, move cancellation,
// keyboard fallback and full roving-focus menu semantics. Zero dependencies.

const HOLD_MS = 500;
const MOVE_TOLERANCE = 10; // px of slop before the hold is cancelled

const cards = document.getElementById("cards");
const menu = document.getElementById("menu");
const menuLabel = document.getElementById("menuLabel");
const status = document.getElementById("status");
const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));

let timer = null;
let holdCard = null;
let origin = { x: 0, y: 0 };
let activePointer = null;
let opener = null;
let suppressClick = false;

const say = (msg) => { status.textContent = msg; };

/* ---------------------------------------------------------------- hold ---- */

function cancelHold(reason) {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  if (holdCard) {
    if (activePointer !== null && holdCard.hasPointerCapture(activePointer)) {
      holdCard.releasePointerCapture(activePointer);
    }
    holdCard.removeAttribute("data-holding");
    holdCard = null;
  }
  activePointer = null;
  if (reason) say(reason);
}

cards.addEventListener("pointerdown", (event) => {
  const card = event.target.closest(".card");
  if (!card || event.button !== 0) return;

  closeMenu({ restoreFocus: false });
  cancelHold();

  holdCard = card;
  activePointer = event.pointerId;
  origin = { x: event.clientX, y: event.clientY };
  card.setPointerCapture(event.pointerId);
  card.setAttribute("data-holding", "");
  say("Holding…");

  timer = setTimeout(() => {
    timer = null;
    const target = holdCard;
    // Release capture so the menu can receive its own pointer events.
    if (target && activePointer !== null && target.hasPointerCapture(activePointer)) {
      target.releasePointerCapture(activePointer);
    }
    if (target) target.removeAttribute("data-holding");
    holdCard = null;
    activePointer = null;
    suppressClick = true; // the upcoming click is the tail of the hold
    openMenu(target, origin.x, origin.y);
  }, HOLD_MS);
});

cards.addEventListener("pointermove", (event) => {
  if (!holdCard || event.pointerId !== activePointer) return;
  const dx = event.clientX - origin.x;
  const dy = event.clientY - origin.y;
  if (Math.hypot(dx, dy) > MOVE_TOLERANCE) {
    cancelHold("Cancelled — pointer moved past the 10px threshold.");
  }
});

for (const type of ["pointerup", "pointercancel"]) {
  cards.addEventListener(type, (event) => {
    if (!holdCard || event.pointerId !== activePointer) return;
    cancelHold("Cancelled — released before 500ms.");
  });
}

// Swallow the click that ends a successful long press, and the native menu.
cards.addEventListener("click", (event) => {
  if (suppressClick) {
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }
});
cards.addEventListener("contextmenu", (event) => {
  const card = event.target.closest(".card");
  if (!card) return;
  event.preventDefault();
  openMenu(card, event.clientX, event.clientY);
});

/* ---------------------------------------------------------------- menu ---- */

function openMenu(card, x, y) {
  if (!card) return;
  opener = card;
  menuLabel.textContent = card.dataset.name;
  card.setAttribute("aria-expanded", "true");

  menu.hidden = false;
  menu.style.left = "0px";
  menu.style.top = "0px";

  // Flip/clamp inside the viewport.
  const rect = menu.getBoundingClientRect();
  const left = Math.max(8, Math.min(x, window.innerWidth - rect.width - 8));
  const top = y + rect.height + 8 > window.innerHeight
    ? Math.max(8, y - rect.height)
    : y;
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;

  items[0].focus();
  say(`Menu open for ${card.dataset.name}.`);
}

function closeMenu({ restoreFocus = true } = {}) {
  if (menu.hidden) return;
  menu.hidden = true;
  if (opener) {
    opener.setAttribute("aria-expanded", "false");
    if (restoreFocus) opener.focus();
  }
  opener = null;
}

menu.addEventListener("click", (event) => {
  const item = event.target.closest("[role=menuitem]");
  if (!item) return;
  const name = menuLabel.textContent;
  closeMenu();
  say(`${item.dataset.action} → ${name}`);
});

menu.addEventListener("keydown", (event) => {
  const index = items.indexOf(document.activeElement);
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      items[(index + 1) % items.length].focus();
      break;
    case "ArrowUp":
      event.preventDefault();
      items[(index - 1 + items.length) % items.length].focus();
      break;
    case "Home":
      event.preventDefault();
      items[0].focus();
      break;
    case "End":
      event.preventDefault();
      items[items.length - 1].focus();
      break;
    case "Escape":
      event.preventDefault();
      closeMenu();
      say("Menu dismissed.");
      break;
    case "Tab":
      closeMenu();
      break;
  }
});

/* --------------------------------------------------- keyboard fallback ---- */

cards.addEventListener("keydown", (event) => {
  const card = event.target.closest(".card");
  if (!card) return;
  const isMenuKey =
    event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey);
  if (event.key === "Enter" || event.key === " " || isMenuKey) {
    event.preventDefault();
    const rect = card.getBoundingClientRect();
    openMenu(card, rect.left + 16, rect.bottom - 8);
  }
});

/* -------------------------------------------------------- dismissal ------- */

document.addEventListener("pointerdown", (event) => {
  if (!menu.hidden && !menu.contains(event.target)) closeMenu({ restoreFocus: false });
}, true);

window.addEventListener("blur", () => closeMenu({ restoreFocus: false }));
window.addEventListener("resize", () => closeMenu({ restoreFocus: false }));
window.addEventListener("scroll", () => closeMenu({ restoreFocus: false }), true);
