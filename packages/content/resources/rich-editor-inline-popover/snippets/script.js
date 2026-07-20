/**
 * Inline code / link selection popover.
 * No execCommand, no dependencies: all formatting is Range surgery on the
 * contenteditable DOM, with the selection restored afterwards.
 */
(() => {
  const editor = document.getElementById("editor");
  const pop = document.getElementById("popover");
  const status = document.getElementById("status");
  const actions = pop.querySelector('[data-panel="actions"]');
  const linkForm = pop.querySelector('[data-panel="link"]');
  const urlInput = pop.querySelector("#link-url");
  const codeBtn = pop.querySelector('[data-act="code"]');
  const linkBtn = pop.querySelector('[data-act="link"]');

  /** Range saved while focus moves into the popover (which collapses the selection). */
  let saved = null;

  /* ---------- selection helpers ---------- */

  const sel = () => window.getSelection();

  function activeRange() {
    const s = sel();
    if (!s || s.rangeCount === 0) return null;
    const r = s.getRangeAt(0);
    if (r.collapsed) return null;
    if (!editor.contains(r.commonAncestorContainer)) return null;
    return r;
  }

  function restore(range) {
    const s = sel();
    s.removeAllRanges();
    s.addRange(range);
  }

  /** Nearest ancestor matching `sel` that is still inside the editor. */
  function closestIn(node, selector) {
    let el = node && node.nodeType === 1 ? node : node && node.parentElement;
    while (el && el !== editor) {
      if (el.matches(selector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  /** True when the whole range sits inside an element matching `selector`. */
  function rangeInside(range, selector) {
    const a = closestIn(range.startContainer, selector);
    return a && a === closestIn(range.endContainer, selector) ? a : null;
  }

  /* ---------- formatting ---------- */

  /** Replace `el` with its own children, keeping the text flow intact. */
  function unwrap(el) {
    const parent = el.parentNode;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
    parent.normalize();
  }

  /** Remove any nested code/anchor wrappers from an extracted fragment. */
  function stripInline(fragment) {
    fragment.querySelectorAll("code, a").forEach((n) => {
      const p = n.parentNode;
      while (n.firstChild) p.insertBefore(n.firstChild, n);
      p.removeChild(n);
    });
    return fragment;
  }

  /**
   * Wrap the current range in `tag`. Returns the created element.
   * Existing inline wrappers inside the range are flattened first so we never
   * produce <code><a><code>… nesting.
   */
  function wrapRange(range, tag, attrs) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
    el.appendChild(stripInline(range.extractContents()));
    range.insertNode(el);
    editor.normalize();

    const after = document.createRange();
    after.selectNodeContents(el);
    restore(after);
    return el;
  }

  function toggleCode(range) {
    const existing = rangeInside(range, "code");
    if (existing) {
      const r = document.createRange();
      r.selectNodeContents(existing);
      unwrap(existing);
      restore(r);
      report("Removed inline code.");
      return;
    }
    wrapRange(range, "code");
    report("Wrapped selection in <code>.");
  }

  function normalizeUrl(raw) {
    const value = raw.trim();
    if (!value) return null;
    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
    let url;
    try {
      url = new URL(candidate);
    } catch {
      return null;
    }
    // Never allow javascript:/data: to reach the DOM.
    return /^https?:$/.test(url.protocol) ? url.href : null;
  }

  function applyLink(range, raw) {
    const href = normalizeUrl(raw);
    if (!href) {
      urlInput.setCustomValidity("Enter a valid http(s) URL");
      urlInput.reportValidity();
      return false;
    }
    urlInput.setCustomValidity("");
    const existing = rangeInside(range, "a");
    if (existing) unwrapKeepingRange(existing);
    wrapRange(activeRange() || range, "a", {
      href,
      rel: "noreferrer noopener",
      target: "_blank",
    });
    report(`Linked to ${href}`);
    return true;
  }

  function unwrapKeepingRange(el) {
    const r = document.createRange();
    r.selectNodeContents(el);
    unwrap(el);
    restore(r);
  }

  function clearFormatting(range) {
    const anchor = rangeInside(range, "a");
    const code = rangeInside(range, "code");
    if (anchor) unwrapKeepingRange(anchor);
    if (code) unwrapKeepingRange(code);
    if (!anchor && !code) {
      // Partial selection spanning several wrappers: flatten the extracted slice.
      const span = wrapRange(range, "span");
      unwrapKeepingRange(span);
    }
    report("Cleared inline formatting.");
  }

  /* ---------- popover placement ---------- */

  const GAP = 10;

  function place(range) {
    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) return hide();

    pop.hidden = false;
    const box = pop.getBoundingClientRect();
    const sx = window.scrollX;
    const sy = window.scrollY;

    let top = rect.top + sy - box.height - GAP;
    let placement = "above";
    if (rect.top - box.height - GAP < 0) {
      top = rect.bottom + sy + GAP;
      placement = "below";
    }

    let left = rect.left + sx + rect.width / 2 - box.width / 2;
    const min = sx + 8;
    const max = sx + document.documentElement.clientWidth - box.width - 8;
    const centered = left;
    left = Math.max(min, Math.min(max, left));

    pop.dataset.placement = placement;
    pop.style.top = `${Math.round(top)}px`;
    pop.style.left = `${Math.round(left)}px`;
    // Keep the arrow pointing at the selection even after clamping.
    const arrow = pop.querySelector(".arrow");
    arrow.style.left = `${Math.round(Math.max(8, Math.min(box.width - 17, box.width / 2 + (centered - left) - 5)))}px`;
  }

  function syncState(range) {
    codeBtn.setAttribute("aria-pressed", String(!!rangeInside(range, "code")));
    linkBtn.setAttribute("aria-pressed", String(!!rangeInside(range, "a")));
  }

  function showActions() {
    linkForm.hidden = true;
    actions.hidden = false;
  }

  function show(range) {
    saved = range.cloneRange();
    showActions();
    place(range);
    syncState(range);
    report(`Selected ${range.toString().length} chars.`);
  }

  function hide() {
    pop.hidden = true;
    showActions();
    urlInput.value = "";
    saved = null;
  }

  function report(msg) {
    status.textContent = msg;
  }

  /* ---------- events ---------- */

  document.addEventListener("selectionchange", () => {
    if (pop.contains(document.activeElement)) return; // editing the URL field
    const r = activeRange();
    if (r) show(r);
    else if (!pop.hidden) {
      hide();
      report("No selection.");
    }
  });

  pop.addEventListener("mousedown", (e) => {
    // Don't let the toolbar steal (and collapse) the selection.
    if (e.target !== urlInput) e.preventDefault();
  });

  actions.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn || !saved) return;
    const range = saved.cloneRange();
    restore(range);

    if (btn.dataset.act === "code") {
      toggleCode(range);
    } else if (btn.dataset.act === "link") {
      const existing = rangeInside(range, "a");
      if (existing) {
        unwrapKeepingRange(existing);
        report("Removed link.");
      } else {
        actions.hidden = true;
        linkForm.hidden = false;
        urlInput.value = "";
        place(range);
        urlInput.focus();
        return;
      }
    } else if (btn.dataset.act === "clear") {
      clearFormatting(range);
    }

    const r = activeRange();
    if (r) show(r);
    else hide();
  });

  linkForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!saved) return;
    const range = saved.cloneRange();
    restore(range);
    if (applyLink(range, urlInput.value)) {
      hide();
      editor.focus();
    }
  });

  linkForm.addEventListener("click", (e) => {
    if (e.target.closest('[data-act="cancel"]')) {
      const range = saved && saved.cloneRange();
      showActions();
      if (range) {
        restore(range);
        place(range);
      } else hide();
    }
  });

  urlInput.addEventListener("input", () => urlInput.setCustomValidity(""));

  editor.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    const range = activeRange();
    if (!range) return;
    if (key === "e") {
      e.preventDefault();
      toggleCode(range);
      const r = activeRange();
      if (r) show(r);
    } else if (key === "k") {
      e.preventDefault();
      show(range);
      actions.hidden = true;
      linkForm.hidden = false;
      place(range);
      urlInput.focus();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || pop.hidden) return;
    if (!linkForm.hidden && saved) {
      const range = saved.cloneRange();
      showActions();
      restore(range);
      place(range);
      editor.focus();
    } else {
      hide();
      report("Dismissed.");
    }
  });

  const reposition = () => {
    const r = activeRange();
    if (r && !pop.hidden) place(r);
  };
  window.addEventListener("scroll", reposition, true);
  window.addEventListener("resize", reposition);

  document.addEventListener("mousedown", (e) => {
    if (!pop.contains(e.target) && !editor.contains(e.target)) hide();
  });
})();
