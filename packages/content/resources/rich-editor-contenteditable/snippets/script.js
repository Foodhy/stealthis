/* Contenteditable Preview — sanitized paste, formatting state, live counters. */
(() => {
  const MAX = 280;

  const editor = document.querySelector("#editor");
  const preview = document.querySelector("#preview");
  const counter = document.querySelector("#char-count");
  const charsEl = counter.querySelector("[data-chars]");
  const wordsEl = counter.querySelector("[data-words]");
  const maxEl = counter.querySelector("[data-max]");
  const bar = document.querySelector(".bar");
  const fill = bar.querySelector("[data-fill]");
  const buttons = [...document.querySelectorAll(".tb[data-cmd]")];

  maxEl.textContent = String(MAX);

  /* ---- sanitizer: allow-list of tags, zero attributes ---------------- */
  const ALLOWED = new Set(["B", "STRONG", "I", "EM", "U", "P", "BR", "UL", "OL", "LI", "DIV", "SPAN"]);

  function sanitizeFragment(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const doomed = [];
    while (walker.nextNode()) doomed.push(walker.currentNode);

    for (const el of doomed) {
      const tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "IFRAME" || tag === "OBJECT") {
        el.remove();
        continue;
      }
      // strip every attribute (kills on*, style, href/javascript:, srcset…)
      for (const attr of [...el.attributes]) el.removeAttribute(attr.name);
      if (!ALLOWED.has(tag)) {
        // unwrap: keep the text, drop the element
        el.replaceWith(...el.childNodes);
      }
    }
    return root;
  }

  function sanitizeHtml(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    return sanitizeFragment(tpl.content);
  }

  /* ---- plain-text extraction (block-aware) --------------------------- */
  function toPlainText(node) {
    let out = "";
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        out += child.nodeValue.replace(/\s+/g, " ");
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const tag = child.tagName;
      if (tag === "BR") { out += "\n"; return; }
      const inner = toPlainText(child);
      if (tag === "LI") out += "• " + inner.trim() + "\n";
      else if (tag === "P" || tag === "DIV" || tag === "UL" || tag === "OL") out += inner.replace(/\n?$/, "\n");
      else out += inner;
    });
    return out;
  }

  /* ---- render -------------------------------------------------------- */
  function update() {
    const text = toPlainText(editor).replace(/\n{3,}/g, "\n\n").trim();
    preview.textContent = text;

    const chars = [...text].length;
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    charsEl.textContent = String(chars);
    wordsEl.textContent = String(words);

    const pct = Math.min(100, (chars / MAX) * 100);
    fill.style.width = pct + "%";

    const over = chars > MAX;
    counter.classList.toggle("over", over);
    bar.classList.toggle("over", over);
    editor.classList.toggle("over", over);
  }

  /* ---- toolbar state -------------------------------------------------- */
  function syncToolbar() {
    for (const btn of buttons) {
      let active = false;
      try { active = document.queryCommandState(btn.dataset.cmd); } catch { /* unsupported */ }
      btn.setAttribute("aria-pressed", String(active));
    }
  }

  function run(cmd) {
    editor.focus();
    document.execCommand(cmd, false, null);
    syncToolbar();
    update();
  }

  buttons.forEach((btn) => {
    // mousedown so the editor keeps its selection
    btn.addEventListener("mousedown", (e) => { e.preventDefault(); run(btn.dataset.cmd); });
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); run(btn.dataset.cmd); }
    });
  });

  document.querySelector("#clear-editor").addEventListener("click", () => {
    editor.innerHTML = "<p><br></p>";
    editor.focus();
    update();
    syncToolbar();
  });

  /* ---- paste: sanitize before insertion -------------------------------- */
  editor.addEventListener("paste", (e) => {
    e.preventDefault();
    const dt = e.clipboardData;
    const html = dt.getData("text/html");
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    let node;
    if (html) {
      node = sanitizeHtml(html);
    } else {
      node = document.createDocumentFragment();
      const lines = dt.getData("text/plain").split(/\r?\n/);
      lines.forEach((line, i) => {
        if (i) node.appendChild(document.createElement("br"));
        node.appendChild(document.createTextNode(line));
      });
    }
    const last = node.lastChild;
    range.insertNode(node);
    if (last) { range.setStartAfter(last); range.collapse(true); sel.removeAllRanges(); sel.addRange(range); }
    update();
  });

  /* ---- drop is another injection vector -------------------------------- */
  editor.addEventListener("drop", (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    if (text) document.execCommand("insertText", false, text);
    update();
  });

  /* ---- keyboard shortcuts + live sync ---------------------------------- */
  editor.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const map = { b: "bold", i: "italic", u: "underline" };
    const cmd = map[e.key.toLowerCase()];
    if (cmd) { e.preventDefault(); run(cmd); }
  });

  editor.addEventListener("input", update);
  editor.addEventListener("keyup", syncToolbar);
  editor.addEventListener("mouseup", syncToolbar);
  document.addEventListener("selectionchange", () => {
    if (editor.contains(document.getSelection()?.anchorNode || null)) syncToolbar();
  });

  // sanitize whatever markup shipped in the initial HTML too
  const initial = sanitizeHtml(editor.innerHTML);
  editor.replaceChildren(initial);

  update();
  syncToolbar();
})();
