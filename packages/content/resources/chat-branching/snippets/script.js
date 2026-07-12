// ---------------------------------------------------------------------------
// Chat Branching Tree
// A conversation stored as a TREE. The transcript renders only the currently
// active path. Regenerating an assistant turn appends a sibling; editing a user
// message forks a new branch; the SVG minimap visualizes and navigates it all.
// ---------------------------------------------------------------------------

(() => {
  "use strict";

  /* ---------------- tree model ---------------- */
  let seq = 0;
  const nid = () => "n" + ++seq;

  // Virtual root so the very first user message can also fork into siblings.
  const forest = { id: "root", children: [], active: 0, parent: null };

  function makeNode(role, text, parent) {
    const node = { id: nid(), role, text, parent, children: [], active: 0 };
    parent.children.push(node);
    parent.active = parent.children.length - 1;
    return node;
  }

  /* ---------------- canned generation ---------------- */
  // Assistant replies vary by `variant` so regenerations are visibly different.
  const REPLIES = [
    (t) => [
      `Optimistic UI means you update the interface **before** the server confirms — you assume the request for "${clip(t)}" succeeds and roll back only if it fails.`,
      `- Apply the change to local state immediately\n- Fire the network request in the background\n- On error, revert and surface a toast`,
      `It trades a tiny correctness risk for a big responsiveness win.`,
    ],
    (t) => [
      `Here's a tighter take. For "${clip(t)}", keep a snapshot of the previous state, mutate optimistically, then reconcile:`,
      "```js\nsetItems(next);          // optimistic\ntry { await save(next); }\ncatch { setItems(prev); } // rollback\n```",
      `The key is that \`prev\` is captured *synchronously* so rollback is exact.`,
    ],
    (t) => [
      `Another angle: think of it as a two-phase commit in the UI. "${clip(t)}" gets a pending flag, so you can grey it out while the write is in flight.`,
      `- Phase 1 — render pending state\n- Phase 2 — settle to confirmed or error`,
      `Libraries like React Query expose this via \`onMutate\` / \`onError\` / \`onSettled\`.`,
    ],
  ];

  const FOLLOWUPS = [
    (t) => [
      `Sure. A minimal like button with rollback:`,
      "```jsx\nfunction Like({ liked, onToggle }) {\n  const [on, setOn] = useState(liked);\n  return <button onClick={() => {\n    const prev = on;\n    setOn(!on);            // optimistic\n    onToggle(!on).catch(() => setOn(prev));\n  }}>{on ? '♥' : '♡'}</button>;\n}",
      `That's the whole pattern in one component.`,
    ],
    (t) => [
      `Here's the same idea with a reducer so multiple optimistic edits stack cleanly:`,
      "```js\nfunction reducer(s, a) {\n  if (a.type === 'toggle') return { ...s, on: !s.on, pending: true };\n  if (a.type === 'ok')     return { ...s, pending: false };\n  if (a.type === 'fail')   return { ...s, on: a.prev, pending: false };\n}",
      `Dispatch \`toggle\` up front, then \`ok\`/\`fail\` when the promise settles.`,
    ],
  ];

  const GENERIC = [
    (t) => [
      `Good question. On "${clip(t)}" — the short version is: model the happy path in the UI first, then treat the server as a *confirmation* rather than a *gate*.`,
      `- Predict the outcome locally\n- Keep the pre-change state for rollback\n- Only block on the network when correctness truly demands it`,
      `Want me to expand any of those points?`,
    ],
    (t) => [
      `Let me reframe "${clip(t)}". Instead of asking "did it save?", ask "can I show the result now and reconcile later?" — that mindset unlocks most snappy interactions.`,
      "```txt\noptimistic → pending → (confirmed | reverted)\n```",
      `Every fast app you like is quietly doing this.`,
    ],
    (t) => [
      `Here's a fresh angle on "${clip(t)}": batch your optimistic updates so the UI never flickers between intermediate states.`,
      `- Queue mutations\n- Flush on the next frame with \`requestAnimationFrame\`\n- Reconcile the whole batch against the server response`,
    ],
  ];

  function clip(s) {
    s = (s || "").trim().replace(/[.?!\s]+$/, "");
    return s.length > 48 ? s.slice(0, 45) + "…" : s;
  }

  let genCount = 0;
  function generate(userText, depth, variant) {
    // Pick a bank based on how deep in the conversation we are, then a variant.
    let bank;
    if (depth <= 0) bank = REPLIES;
    else if (depth === 1) bank = FOLLOWUPS;
    else bank = GENERIC;
    const paras = bank[variant % bank.length](userText);
    return paras.join("\n\n");
  }

  /* ---------------- markdown-lite renderer ---------------- */
  function esc(s) {
    return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function renderMarkdown(text) {
    const blocks = text.split(/\n\n+/);
    let html = "";
    for (const block of blocks) {
      const fence = block.match(/^```(?:\w+)?\n([\s\S]*?)\n?```$/);
      if (fence) {
        html += `<pre><code>${esc(fence[1])}</code></pre>`;
        continue;
      }
      const lines = block.split("\n");
      if (lines.every((l) => /^-\s+/.test(l))) {
        html += "<ul>" + lines.map((l) => `<li>${inline(l.replace(/^-\s+/, ""))}</li>`).join("") + "</ul>";
      } else {
        html += `<p>${inline(block)}</p>`;
      }
    }
    return html;
  }

  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  /* ---------------- active path ---------------- */
  function activePath() {
    const path = [];
    let parent = forest;
    while (parent.children.length) {
      const clamped = Math.min(parent.active, parent.children.length - 1);
      parent.active = clamped;
      const node = parent.children[clamped];
      path.push(node);
      parent = node;
    }
    return path;
  }

  // Redirect the active path so it passes through `node`.
  function focusNode(node) {
    let n = node;
    while (n.parent) {
      n.parent.active = n.parent.children.indexOf(n);
      n = n.parent;
    }
    render();
  }

  /* ---------------- DOM refs ---------------- */
  const thread = document.getElementById("thread");
  const mapCanvas = document.getElementById("mapCanvas");
  const composer = document.getElementById("composer");
  const composerInput = document.getElementById("composerInput");
  const statTurns = document.getElementById("statTurns");
  const statBranches = document.getElementById("statBranches");
  const statNodes = document.getElementById("statNodes");
  const resetBtn = document.getElementById("resetBtn");

  const ICONS = {
    regen:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>',
    edit:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  };

  /* ---------------- transcript render ---------------- */
  let editingId = null;

  function render() {
    const path = activePath();
    thread.innerHTML = "";

    path.forEach((node, i) => {
      const parent = node.parent;
      const siblings = parent.children;
      const el = document.createElement("article");
      el.className = "turn turn--" + node.role;
      el.dataset.id = node.id;

      const avatar = document.createElement("div");
      avatar.className = "turn__avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = node.role === "user" ? "You" : "AI";

      const body = document.createElement("div");
      body.className = "turn__body";

      const meta = document.createElement("div");
      meta.className = "turn__meta";
      const role = document.createElement("span");
      role.className = "turn__role";
      role.textContent = node.role === "user" ? "You" : "Assistant";
      meta.appendChild(role);
      if (siblings.length > 1) {
        const tag = document.createElement("span");
        tag.className = "turn__tag";
        tag.textContent = node.role === "user" ? "forked" : "regenerated";
        meta.appendChild(tag);
      }
      body.appendChild(meta);

      if (editingId === node.id) {
        body.appendChild(buildEditor(node));
      } else {
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.innerHTML = renderMarkdown(node.text);
        body.appendChild(bubble);
        body.appendChild(buildActions(node, siblings));
      }

      el.appendChild(avatar);
      el.appendChild(body);
      thread.appendChild(el);
    });

    renderMap(path);
    updateStats();
    thread.scrollTop = thread.scrollHeight;
  }

  function buildActions(node, siblings) {
    const wrap = document.createElement("div");
    wrap.className = "turn__actions";

    // Pager across siblings (versions of this turn).
    if (siblings.length > 1) {
      const idx = siblings.indexOf(node);
      const pager = document.createElement("div");
      pager.className = "pager";
      pager.setAttribute("role", "group");
      pager.setAttribute("aria-label", "Switch between versions of this turn");

      const prev = document.createElement("button");
      prev.type = "button";
      prev.innerHTML = "‹";
      prev.setAttribute("aria-label", "Previous version");
      prev.disabled = idx === 0;
      prev.addEventListener("click", () => {
        node.parent.active = idx - 1;
        render();
      });

      const count = document.createElement("span");
      count.className = "pager__count";
      count.textContent = `${idx + 1} / ${siblings.length}`;

      const next = document.createElement("button");
      next.type = "button";
      next.innerHTML = "›";
      next.setAttribute("aria-label", "Next version");
      next.disabled = idx === siblings.length - 1;
      next.addEventListener("click", () => {
        node.parent.active = idx + 1;
        render();
      });

      pager.append(prev, count, next);
      wrap.appendChild(pager);
    }

    if (node.role === "assistant") {
      const regen = document.createElement("button");
      regen.type = "button";
      regen.className = "iconbtn iconbtn--regen";
      regen.innerHTML = ICONS.regen + "<span>Regenerate</span>";
      regen.addEventListener("click", () => regenerate(node));
      wrap.appendChild(regen);
    } else {
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "iconbtn";
      edit.innerHTML = ICONS.edit + "<span>Edit &amp; fork</span>";
      edit.addEventListener("click", () => {
        editingId = node.id;
        render();
        const ta = thread.querySelector("textarea");
        if (ta) {
          ta.focus();
          ta.setSelectionRange(ta.value.length, ta.value.length);
        }
      });
      wrap.appendChild(edit);
    }

    return wrap;
  }

  function buildEditor(node) {
    const editor = document.createElement("div");
    editor.className = "editor";

    const ta = document.createElement("textarea");
    ta.value = node.text;
    ta.setAttribute("aria-label", "Edit message and fork a new branch");

    const row = document.createElement("div");
    row.className = "editor__row";

    const save = document.createElement("button");
    save.type = "button";
    save.className = "btn btn--primary btn--sm";
    save.textContent = "Fork branch";
    save.addEventListener("click", () => commitEdit(node, ta.value));

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "btn btn--ghost btn--sm";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => {
      editingId = null;
      render();
    });

    const hint = document.createElement("span");
    hint.className = "editor__hint";
    hint.innerHTML = "⌘⏎ to fork · Esc to cancel";

    ta.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        editingId = null;
        render();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        commitEdit(node, ta.value);
      }
    });

    row.append(save, cancel, hint);
    editor.append(ta, row);
    return editor;
  }

  /* ---------------- mutations ---------------- */
  function depthOf(node) {
    // number of user turns that precede this one on its chain
    let d = -1,
      n = node;
    while (n && n.parent) {
      if (n.role === "user") d++;
      n = n.parent;
    }
    return d;
  }

  function regenerate(assistantNode) {
    const parent = assistantNode.parent; // a user node (or forest for edge cases)
    const userText = parent.role === "user" ? parent.text : "the topic";
    const variant = parent.children.length; // next variant
    const fresh = makeNode("assistant", generate(userText, depthOf(parent) - 0, variant), parent);
    parent.active = parent.children.indexOf(fresh);
    genCount++;
    render();
  }

  function commitEdit(userNode, newText) {
    newText = newText.trim();
    editingId = null;
    if (!newText) {
      render();
      return;
    }
    const parent = userNode.parent;
    const forked = makeNode("user", newText, parent);
    parent.active = parent.children.indexOf(forked);
    // draft a fresh assistant reply on the new branch
    makeNode("assistant", generate(newText, depthOf(forked), 0), forked);
    render();
  }

  function sendMessage(text) {
    text = text.trim();
    if (!text) return;
    const path = activePath();
    const leaf = path[path.length - 1] || forest;
    const userNode = makeNode("user", text, leaf);
    makeNode("assistant", generate(text, depthOf(userNode), 0), userNode);
    render();
  }

  /* ---------------- minimap (inline SVG tree) ---------------- */
  function renderMap(path) {
    const activeIds = new Set(path.map((n) => n.id));
    const currentId = path.length ? path[path.length - 1].id : null;

    // layout: x by depth, y by DFS leaf order
    let leaf = 0;
    const COL = 46;
    const ROW = 34;
    const PAD = 18;

    function layout(node, depth) {
      node._x = PAD + depth * COL;
      if (node.children.length === 0) {
        node._y = PAD + leaf * ROW;
        leaf++;
      } else {
        node.children.forEach((c) => layout(c, depth + 1));
        node._y = (node.children[0]._y + node.children[node.children.length - 1]._y) / 2;
      }
    }
    forest.children.forEach((n) => layout(n, 0));

    const nodes = [];
    let maxX = 0;
    (function collect(n) {
      nodes.push(n);
      maxX = Math.max(maxX, n._x);
      n.children.forEach(collect);
    })({ children: forest.children, _x: 0, _y: 0 });

    const w = maxX + PAD;
    const h = PAD + leaf * ROW;

    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("role", "tree");
    svg.setAttribute("aria-label", "Conversation branch tree");

    // gradient for active edges
    const defs = document.createElementNS(svgns, "defs");
    defs.innerHTML =
      '<linearGradient id="activeGrad" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>';
    svg.appendChild(defs);

    // edges
    forest.children.forEach(function drawEdges(node) {
      node.children.forEach((child) => {
        const p = document.createElementNS(svgns, "path");
        const mx = (node._x + child._x) / 2;
        p.setAttribute("d", `M${node._x},${node._y} C${mx},${node._y} ${mx},${child._y} ${child._x},${child._y}`);
        const on = activeIds.has(node.id) && activeIds.has(child.id);
        p.setAttribute("class", "map__edge" + (on ? " map__edge--active" : ""));
        svg.appendChild(p);
        drawEdges(child);
      });
    });

    // nodes
    nodes.forEach((node) => {
      if (!node.id) return; // skip synthetic root wrapper
      const g = document.createElementNS(svgns, "g");
      const onPath = activeIds.has(node.id);
      g.setAttribute(
        "class",
        "map__node" + (node.id === currentId ? " map__node--current" : "")
      );
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "treeitem");
      g.setAttribute(
        "aria-label",
        `${node.role} turn${onPath ? ", on active path" : ""}. ${clip(node.text)}`
      );

      const c = document.createElementNS(svgns, "circle");
      c.setAttribute("cx", node._x);
      c.setAttribute("cy", node._y);
      c.setAttribute("r", node.id === currentId ? 8 : 6);
      const cls = onPath ? (node.role === "user" ? "node-user" : "node-asst") : "node-dim";
      c.setAttribute("class", cls);
      g.appendChild(c);

      const title = document.createElementNS(svgns, "title");
      title.textContent = `${node.role}: ${clip(node.text)}`;
      g.appendChild(title);

      const activate = () => focusNode(node);
      g.addEventListener("click", activate);
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
      svg.appendChild(g);
    });

    mapCanvas.innerHTML = "";
    mapCanvas.appendChild(svg);
  }

  /* ---------------- stats ---------------- */
  function updateStats() {
    let nodeCount = 0;
    let branchPoints = 0;
    (function walk(n) {
      n.children.forEach((c) => {
        nodeCount++;
        walk(c);
      });
      if (n.children.length > 1) branchPoints += n.children.length - 1;
    })(forest);
    statTurns.textContent = activePath().length;
    statBranches.textContent = branchPoints;
    statNodes.textContent = nodeCount;
  }

  /* ---------------- seed conversation ---------------- */
  function seed() {
    forest.children.length = 0;
    forest.active = 0;
    seq = 0;
    editingId = null;

    const u1 = makeNode("user", "How does optimistic UI updating work in React?", forest);
    makeNode("assistant", generate(u1.text, 0, 0), u1); // version 1
    makeNode("assistant", generate(u1.text, 0, 1), u1); // version 2 (a sibling)
    u1.active = 0;
    const a1 = u1.children[0];

    const u2 = makeNode("user", "Nice — can you show a minimal example?", a1);
    makeNode("assistant", generate(u2.text, 1, 0), u2);
  }

  /* ---------------- events ---------------- */
  composer.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(composerInput.value);
    composerInput.value = "";
    composerInput.focus();
  });

  resetBtn.addEventListener("click", () => {
    seed();
    render();
  });

  seed();
  render();
})();
