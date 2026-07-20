/**
 * Editor Toolbar — dependency-free contenteditable formatting toolbar.
 *
 * - One dispatcher drives buttons + keyboard shortcuts.
 * - Inline state (bold/italic/underline/code) is derived from the caret's
 *   ancestor chain, so button pressed-state is always truthful.
 * - History is a real snapshot stack (HTML + caret offset), not execCommand's
 *   opaque stack; execCommand is only used as the fast path for the three
 *   styles browsers still implement well, with a manual Range-based fallback.
 * - Toolbar is a roving-tabindex composite widget (single tab stop, arrows move).
 */
(() => {
  const surface = document.getElementById("surface");
  const toolbar = document.querySelector(".toolbar");
  const countEl = document.getElementById("count");
  const liveEl = document.getElementById("live");
  if (!surface || !toolbar) return;

  const buttons = Array.from(toolbar.querySelectorAll(".tbtn"));
  const byCmd = (c) => buttons.find((b) => b.dataset.cmd === c);
  const TAGS = { bold: "STRONG", italic: "EM", underline: "U", code: "CODE" };

  /* ---------------- history ---------------- */

  const undoStack = [];
  const redoStack = [];
  let composing = false;

  const caretOffset = () => {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount || !surface.contains(sel.anchorNode)) return null;
    const r = sel.getRangeAt(0).cloneRange();
    r.selectNodeContents(surface);
    r.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
    return r.toString().length;
  };

  const restoreCaret = (offset) => {
    if (offset == null) return;
    const walker = document.createTreeWalker(surface, NodeFilter.SHOW_TEXT);
    let seen = 0;
    let node;
    while ((node = walker.nextNode())) {
      const len = node.nodeValue.length;
      if (seen + len >= offset) {
        const range = document.createRange();
        range.setStart(node, offset - seen);
        range.collapse(true);
        const sel = document.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      seen += len;
    }
  };

  const snapshot = () => ({ html: surface.innerHTML, caret: caretOffset() });

  function pushHistory() {
    const last = undoStack[undoStack.length - 1];
    if (last && last.html === surface.innerHTML) return;
    undoStack.push(snapshot());
    if (undoStack.length > 120) undoStack.shift();
    redoStack.length = 0;
    syncHistoryButtons();
  }

  function travel(from, to) {
    if (!from.length) return;
    to.push(snapshot());
    const state = from.pop();
    surface.innerHTML = state.html;
    restoreCaret(state.caret);
    surface.focus();
    syncHistoryButtons();
    refresh();
  }

  function syncHistoryButtons() {
    byCmd("undo").disabled = undoStack.length === 0;
    byCmd("redo").disabled = redoStack.length === 0;
  }

  /* ---------------- inline formatting ---------------- */

  function activeTags() {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount) return new Set();
    let node = sel.anchorNode;
    if (!node || !surface.contains(node)) return new Set();
    const tags = new Set();
    while (node && node !== surface) {
      if (node.nodeType === 1) tags.add(node.tagName);
      node = node.parentNode;
    }
    return tags;
  }

  const isActive = (cmd) => activeTags().has(TAGS[cmd]);

  /** Wrap the current non-collapsed range in `tag`, or unwrap if already inside. */
  function toggleWrap(tag) {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount || !surface.contains(sel.anchorNode)) return;
    const range = sel.getRangeAt(0);

    // unwrap: find the nearest matching ancestor and lift its children out
    let host = sel.anchorNode;
    while (host && host !== surface && !(host.nodeType === 1 && host.tagName === tag)) {
      host = host.parentNode;
    }
    if (host && host !== surface) {
      const parent = host.parentNode;
      const frag = document.createDocumentFragment();
      while (host.firstChild) frag.appendChild(host.firstChild);
      const first = frag.firstChild;
      const last = frag.lastChild;
      parent.replaceChild(frag, host);
      if (first && last) {
        const r = document.createRange();
        r.setStartBefore(first);
        r.setEndAfter(last);
        sel.removeAllRanges();
        sel.addRange(r);
      }
      return;
    }

    if (range.collapsed) return;
    const el = document.createElement(tag);
    try {
      el.appendChild(range.extractContents());
      range.insertNode(el);
    } catch {
      return;
    }
    const r = document.createRange();
    r.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(r);
  }

  function exec(cmd) {
    if (cmd === "undo") return travel(undoStack, redoStack);
    if (cmd === "redo") return travel(redoStack, undoStack);

    surface.focus();
    pushHistory();

    if (cmd === "code") {
      toggleWrap("CODE");
    } else {
      // fast path; fall back to manual wrapping where execCommand is missing
      let ok = false;
      try {
        ok = document.execCommand(cmd, false, null);
      } catch {
        ok = false;
      }
      if (!ok) toggleWrap(TAGS[cmd]);
    }

    announce(`${cmd} ${isActive(cmd) ? "on" : "off"}`);
    refresh();
  }

  /* ---------------- ui sync ---------------- */

  function refresh() {
    const tags = activeTags();
    for (const btn of buttons) {
      const cmd = btn.dataset.cmd;
      if (!TAGS[cmd]) continue;
      btn.setAttribute("aria-pressed", String(tags.has(TAGS[cmd])));
    }
    const words = surface.textContent.trim().split(/\s+/).filter(Boolean).length;
    countEl.textContent = `${words} word${words === 1 ? "" : "s"}`;
  }

  let announceTimer;
  function announce(msg) {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { liveEl.textContent = msg; }, 60);
  }

  /* ---------------- events ---------------- */

  toolbar.addEventListener("mousedown", (e) => {
    // keep the selection alive when a button is pressed
    if (e.target.closest(".tbtn")) e.preventDefault();
  });

  toolbar.addEventListener("click", (e) => {
    const btn = e.target.closest(".tbtn");
    if (btn && !btn.disabled) exec(btn.dataset.cmd);
  });

  // roving tabindex
  buttons.forEach((b, i) => b.setAttribute("tabindex", i === 0 ? "0" : "-1"));
  toolbar.addEventListener("keydown", (e) => {
    const idx = buttons.indexOf(document.activeElement);
    if (idx === -1) return;
    const map = { ArrowRight: 1, ArrowLeft: -1 };
    let next = null;
    if (e.key in map) next = (idx + map[e.key] + buttons.length) % buttons.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = buttons.length - 1;
    if (next === null) return;
    e.preventDefault();
    buttons[idx].setAttribute("tabindex", "-1");
    buttons[next].setAttribute("tabindex", "0");
    buttons[next].focus();
  });

  surface.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    const shortcuts = { b: "bold", i: "italic", u: "underline", e: "code" };
    if (k === "z") {
      e.preventDefault();
      exec(e.shiftKey ? "redo" : "undo");
    } else if (k === "y") {
      e.preventDefault();
      exec("redo");
    } else if (shortcuts[k]) {
      e.preventDefault();
      exec(shortcuts[k]);
    }
  });

  surface.addEventListener("compositionstart", () => { composing = true; });
  surface.addEventListener("compositionend", () => { composing = false; pushHistory(); });

  let typingTimer;
  surface.addEventListener("input", () => {
    if (composing) return;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(pushHistory, 400);
    refresh();
  });

  // paste as plain text — contenteditable HTML is untrusted
  surface.addEventListener("paste", (e) => {
    e.preventDefault();
    pushHistory();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    refresh();
  });

  document.addEventListener("selectionchange", () => {
    if (surface.contains(document.getSelection()?.anchorNode)) refresh();
  });

  syncHistoryButtons();
  refresh();
})();
