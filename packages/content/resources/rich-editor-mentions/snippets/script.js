// Mention autocomplete on a contenteditable surface.
// Detects an "@query" token immediately before the caret, filters a local
// directory, renders a roving-selection listbox, and replaces the token with a
// non-editable chip on commit. Vanilla only.

const PEOPLE = [
  { id: "ada", name: "Ada Lovelace", handle: "ada", role: "Engineering" },
  { id: "grace", name: "Grace Hopper", handle: "grace", role: "Compilers" },
  { id: "linus", name: "Linus Berg", handle: "linus", role: "Infrastructure" },
  { id: "maya", name: "Maya Okafor", handle: "maya", role: "Design" },
  { id: "raj", name: "Raj Patel", handle: "raj", role: "Product" },
  { id: "sofia", name: "Sofia Marin", handle: "sofia", role: "Data" },
  { id: "yuki", name: "Yuki Tanaka", handle: "yuki", role: "Support" },
  { id: "noor", name: "Noor Haddad", handle: "noor", role: "Security" },
];

const editor = document.getElementById("editor");
const menu = document.getElementById("mention-list");
const status = document.getElementById("mention-status");
const countEl = document.getElementById("mention-count");
const namesEl = document.getElementById("mention-names");

let matches = [];
let active = 0;
let open = false;
let token = null; // { node, start, end, query }

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const initials = (name) =>
  name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

/** Find an "@query" token ending exactly at the caret, if any. */
function readToken() {
  const sel = window.getSelection();
  if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return null;
  const node = sel.anchorNode;
  if (!node || node.nodeType !== Node.TEXT_NODE || !editor.contains(node)) return null;

  const end = sel.anchorOffset;
  const text = node.data.slice(0, end);
  const m = /(^|[\s (])@([\w.\-]{0,20})$/.exec(text);
  if (!m) return null;

  return { node, start: end - m[2].length - 1, end, query: m[2] };
}

function filter(query) {
  const q = query.toLowerCase();
  return PEOPLE.filter(
    (p) => p.handle.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
  ).slice(0, 6);
}

function highlight(name, query) {
  const safe = escapeHtml(name);
  if (!query) return safe;
  const i = name.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return safe;
  return (
    escapeHtml(name.slice(0, i)) +
    "<mark>" +
    escapeHtml(name.slice(i, i + query.length)) +
    "</mark>" +
    escapeHtml(name.slice(i + query.length))
  );
}

function positionMenu() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  const host = editor.getBoundingClientRect();
  const parent = menu.offsetParent.getBoundingClientRect();
  const top = (rect.bottom || host.bottom) - parent.top + 6;
  const left = Math.min(
    Math.max((rect.left || host.left) - parent.left, 0),
    Math.max(host.width - menu.offsetWidth, 0)
  );
  menu.style.top = top + "px";
  menu.style.left = left + "px";
}

function render() {
  if (!matches.length) {
    menu.innerHTML = '<li class="menu__empty">No teammate found</li>';
  } else {
    menu.innerHTML = matches
      .map(
        (p, i) =>
          `<li class="menu__item" role="option" id="mention-opt-${p.id}" data-index="${i}"` +
          ` aria-selected="${i === active}">` +
          `<span class="menu__avatar" aria-hidden="true">${initials(p.name)}</span>` +
          `<span class="menu__text"><span class="menu__name">${highlight(p.name, token ? token.query : "")}</span>` +
          `<span class="menu__role">@${p.handle} · ${escapeHtml(p.role)}</span></span></li>`
      )
      .join("");
  }
  const opt = menu.querySelector('[aria-selected="true"]');
  editor.setAttribute("aria-activedescendant", opt ? opt.id : "");
  if (opt) opt.scrollIntoView({ block: "nearest" });
}

function openMenu() {
  open = true;
  menu.hidden = false;
  editor.setAttribute("aria-expanded", "true");
  render();
  positionMenu();
  status.textContent = matches.length
    ? `${matches.length} teammates available. ${matches[active].name} selected.`
    : "No teammate found";
}

function closeMenu() {
  open = false;
  token = null;
  menu.hidden = true;
  menu.innerHTML = "";
  editor.setAttribute("aria-expanded", "false");
  editor.removeAttribute("aria-activedescendant");
}

function move(delta) {
  if (!matches.length) return;
  active = (active + delta + matches.length) % matches.length;
  render();
  status.textContent = matches[active].name;
}

function commit(person) {
  if (!token || !person) return;
  const { node, start, end } = token;
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  range.deleteContents();

  const chip = document.createElement("span");
  chip.className = "mention";
  chip.contentEditable = "false";
  chip.dataset.userId = person.id;
  chip.textContent = "@" + person.handle;

  const tail = document.createTextNode(" ");
  range.insertNode(tail);
  range.insertNode(chip);

  const sel = window.getSelection();
  const after = document.createRange();
  after.setStart(tail, 1);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);

  closeMenu();
  editor.focus();
  syncSummary();
  status.textContent = `${person.name} mentioned`;
}

function syncSummary() {
  const chips = [...editor.querySelectorAll(".mention")];
  countEl.textContent = String(chips.length);
  namesEl.textContent = chips.length ? chips.map((c) => c.textContent).join(", ") : "none";
}

function refresh() {
  const next = readToken();
  if (!next) {
    if (open) closeMenu();
    return;
  }
  const sameQuery = token && token.query === next.query;
  token = next;
  matches = filter(next.query);
  if (!sameQuery) active = 0;
  if (active >= matches.length) active = 0;
  openMenu();
}

editor.addEventListener("input", () => {
  syncSummary();
  refresh();
});

editor.addEventListener("keydown", (event) => {
  if (!open) return;
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      move(1);
      break;
    case "ArrowUp":
      event.preventDefault();
      move(-1);
      break;
    case "Home":
      event.preventDefault();
      active = 0;
      render();
      break;
    case "End":
      event.preventDefault();
      active = Math.max(matches.length - 1, 0);
      render();
      break;
    case "Enter":
    case "Tab":
      if (matches.length) {
        event.preventDefault();
        commit(matches[active]);
      }
      break;
    case "Escape":
      event.preventDefault();
      closeMenu();
      break;
    default:
      break;
  }
});

// Caret moves without an input event (arrow keys, clicks) also re-evaluate.
document.addEventListener("selectionchange", () => {
  if (document.activeElement !== editor) return;
  if (open) refresh();
});

editor.addEventListener("blur", () => {
  // Allow the pointerdown handler on the menu to run first.
  setTimeout(() => {
    if (document.activeElement !== editor) closeMenu();
  }, 0);
});

menu.addEventListener("pointerdown", (event) => {
  const item = event.target.closest(".menu__item");
  if (!item) return;
  event.preventDefault(); // keep caret/selection intact
  commit(matches[Number(item.dataset.index)]);
});

menu.addEventListener("pointermove", (event) => {
  const item = event.target.closest(".menu__item");
  if (!item) return;
  const i = Number(item.dataset.index);
  if (i !== active) {
    active = i;
    render();
  }
});

// Paste as plain text so the editor value stays predictable.
editor.addEventListener("paste", (event) => {
  event.preventDefault();
  const text = (event.clipboardData || window.clipboardData).getData("text/plain");
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  syncSummary();
  refresh();
});

window.addEventListener("resize", () => {
  if (open) positionMenu();
});

syncSummary();
