/**
 * Slash-command menu for a contenteditable editor.
 * - Detects a "/query" token immediately before the caret (text node only).
 * - Anchors a listbox at the caret, filters commands, supports full keyboard nav.
 * - Inserting replaces the "/query" token with a real block element.
 */
(() => {
  const editor = document.getElementById("slash-editor");
  const menu = document.getElementById("slash-menu");
  const list = document.getElementById("slash-list");
  const empty = document.getElementById("slash-empty");
  const status = document.getElementById("slash-status");
  if (!editor || !menu) return;

  const COMMANDS = [
    { id: "h2", icon: "H2", label: "Heading", desc: "Section title", keywords: "heading title h2", build: () => block("h2", "Heading") },
    { id: "h3", icon: "H3", label: "Subheading", desc: "Smaller title", keywords: "subheading h3", build: () => block("h3", "Subheading") },
    { id: "p", icon: "¶", label: "Text", desc: "Plain paragraph", keywords: "text paragraph body", build: () => block("p", "Text") },
    { id: "ul", icon: "•", label: "Bulleted list", desc: "Unordered items", keywords: "bullet list unordered ul", build: () => listBlock("ul") },
    { id: "ol", icon: "1.", label: "Numbered list", desc: "Ordered items", keywords: "numbered ordered list ol", build: () => listBlock("ol") },
    { id: "todo", icon: "☑", label: "To-do", desc: "Checkbox item", keywords: "todo task checkbox", build: todoBlock },
    { id: "quote", icon: "❝", label: "Quote", desc: "Blockquote", keywords: "quote blockquote citation", build: () => block("blockquote", "Quote") },
    { id: "code", icon: "{}", label: "Code block", desc: "Monospaced snippet", keywords: "code pre snippet", build: codeBlock },
    { id: "hr", icon: "—", label: "Divider", desc: "Horizontal rule", keywords: "divider rule separator hr", build: () => document.createElement("hr") },
  ];

  function block(tag, text) {
    const el = document.createElement(tag);
    el.textContent = text;
    return el;
  }
  function listBlock(tag) {
    const el = document.createElement(tag);
    const li = document.createElement("li");
    li.textContent = "List item";
    el.appendChild(li);
    return el;
  }
  function todoBlock() {
    const p = document.createElement("p");
    p.className = "todo";
    p.textContent = "☐ To-do item";
    return p;
  }
  function codeBlock() {
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = "const editor = document.querySelector('#slash-editor');";
    pre.appendChild(code);
    return pre;
  }

  let open = false;
  let matches = [];
  let active = 0;
  let token = null; // { node, start, end, query }

  /** Read the "/query" token immediately before the caret, or null. */
  function readToken() {
    const sel = window.getSelection();
    if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return null;
    const node = sel.anchorNode;
    if (!node || node.nodeType !== Node.TEXT_NODE || !editor.contains(node)) return null;

    const offset = sel.anchorOffset;
    const before = node.data.slice(0, offset);
    const slash = before.lastIndexOf("/");
    if (slash === -1) return null;
    // The slash must start a word and the query must not contain whitespace.
    const prev = slash === 0 ? " " : before[slash - 1];
    if (!/\s| /.test(prev) && slash !== 0) return null;
    const query = before.slice(slash + 1);
    if (/[\s ]/.test(query)) return null;
    return { node, start: slash, end: offset, query };
  }

  function filter(query) {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS.slice();
    return COMMANDS.filter((c) => (c.label + " " + c.keywords).toLowerCase().includes(q));
  }

  function render() {
    list.textContent = "";
    matches.forEach((cmd, i) => {
      const li = document.createElement("li");
      li.className = "item";
      li.id = "slash-opt-" + cmd.id;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === active));
      li.innerHTML =
        '<span class="item__icon" aria-hidden="true"></span>' +
        '<span><span class="item__label"></span><span class="item__desc"></span></span>';
      li.querySelector(".item__icon").textContent = cmd.icon;
      li.querySelector(".item__label").textContent = cmd.label;
      li.querySelector(".item__desc").textContent = cmd.desc;
      li.addEventListener("mousemove", () => {
        if (active === i) return;
        active = i;
        render();
      });
      li.addEventListener("mousedown", (e) => {
        e.preventDefault(); // keep the caret
        insert(cmd);
      });
      list.appendChild(li);
    });
    empty.hidden = matches.length > 0;
    const current = matches[active];
    editor.setAttribute("aria-activedescendant", current ? "slash-opt-" + current.id : "");
    const el = list.children[active];
    if (el) el.scrollIntoView({ block: "nearest" });
  }

  function position() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);
    let rect = range.getBoundingClientRect();
    if (!rect || (!rect.width && !rect.height)) {
      // Collapsed range in an empty spot: measure with a temporary marker.
      const marker = document.createElement("span");
      marker.textContent = "​";
      range.insertNode(marker);
      rect = marker.getBoundingClientRect();
      marker.remove();
    }
    const host = editor.parentElement.getBoundingClientRect();
    const width = 272;
    let left = rect.left - host.left;
    left = Math.max(0, Math.min(left, host.width - width));
    let top = rect.bottom - host.top + 8;
    // Flip above if there is not enough room below the viewport.
    if (rect.bottom + 250 > window.innerHeight) top = rect.top - host.top - 250;
    menu.style.left = left + "px";
    menu.style.top = Math.max(0, top) + "px";
  }

  function show() {
    if (!open) {
      open = true;
      menu.hidden = false;
      editor.setAttribute("aria-expanded", "true");
    }
    render();
    position();
    status.textContent = matches.length
      ? matches.length + " block" + (matches.length === 1 ? "" : "s") + " available."
      : "No matching block.";
  }

  function close(reason) {
    if (!open) return;
    open = false;
    menu.hidden = true;
    editor.setAttribute("aria-expanded", "false");
    editor.setAttribute("aria-activedescendant", "");
    token = null;
    status.textContent = reason || "Menu closed.";
  }

  function insert(cmd) {
    if (!token) return close();
    const { node, start, end } = token;
    // Remove the "/query" text.
    node.deleteData(start, end - start);

    const el = cmd.build();
    const host = node.parentElement.closest("#slash-editor > *") || node.parentElement;
    if (host && host.parentElement === editor) {
      host.insertAdjacentElement("afterend", el);
      if (!host.textContent.trim()) host.remove();
    } else {
      editor.appendChild(el);
    }

    // Put the caret at the end of the inserted block's text.
    const target = el.querySelector("li, code") || el;
    const range = document.createRange();
    if (target.firstChild) range.setStart(target.firstChild, target.firstChild.length ?? 0);
    else range.selectNodeContents(target);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    editor.focus();

    close("Inserted " + cmd.label + ".");
  }

  function sync() {
    token = readToken();
    if (!token) return close();
    const next = filter(token.query);
    const prevId = matches[active] && matches[active].id;
    matches = next;
    if (!matches.length) {
      active = 0;
      show();
      return;
    }
    const keep = matches.findIndex((c) => c.id === prevId);
    active = keep >= 0 ? keep : 0;
    show();
  }

  editor.addEventListener("input", sync);
  editor.addEventListener("click", () => { if (open) sync(); });
  editor.addEventListener("blur", () => close());

  editor.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); close("Dismissed."); return; }
    if (!matches.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      active = (active + 1) % matches.length;
      render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active = (active - 1 + matches.length) % matches.length;
      render();
    } else if (e.key === "Home") {
      e.preventDefault(); active = 0; render();
    } else if (e.key === "End") {
      e.preventDefault(); active = matches.length - 1; render();
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insert(matches[active]);
    }
  });

  // Keyboard-only affordance: arrow keys / typing update the token after selection moves.
  document.addEventListener("selectionchange", () => {
    if (open && document.activeElement === editor) {
      const t = readToken();
      if (!t) close();
    }
  });

  window.addEventListener("resize", () => { if (open) position(); });
})();
