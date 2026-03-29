const DATA = {
  id: 42,
  name: "Jane Smith",
  email: "jane@example.com",
  active: true,
  score: 98.6,
  role: null,
  address: {
    street: "123 Main St",
    city: "New York",
    zip: "10001",
    country: "US",
  },
  tags: ["admin", "early-adopter", "pro"],
  permissions: {
    read: true,
    write: true,
    delete: false,
    admin: false,
  },
  lastLogin: "2026-03-06T14:22:00Z",
  metadata: {
    createdAt: "2024-01-15",
    updatedAt: "2026-03-06",
    version: 3,
  },
};

let searchTerm = "";

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(text) {
  if (!searchTerm) return escHtml(text);
  const safe = escHtml(text);
  const idx = safe.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (idx === -1) return safe;
  return (
    safe.slice(0, idx) +
    `<mark style="background:#e3b341;color:#0d1117;border-radius:2px">${safe.slice(idx, idx + searchTerm.length)}</mark>` +
    safe.slice(idx + searchTerm.length)
  );
}

function matchesSearch(key, value) {
  if (!searchTerm) return true;
  const q = searchTerm.toLowerCase();
  if (String(key).toLowerCase().includes(q)) return true;
  if (typeof value !== "object" || value === null) {
    if (String(value).toLowerCase().includes(q)) return true;
  }
  return false;
}

function buildNode(key, value, depth, isLast) {
  const node = document.createElement("div");
  node.className = "jv-node";

  const isObj = value !== null && typeof value === "object";
  const isArr = Array.isArray(value);
  const entries = isObj ? (isArr ? value.map((v, i) => [i, v]) : Object.entries(value)) : null;
  const isEmpty = isObj && entries.length === 0;
  const comma = isLast ? "" : '<span class="jv-comma">,</span>';
  const matched = matchesSearch(key, value);

  const row = document.createElement("div");
  row.className = "jv-row" + (matched && searchTerm ? " jv-highlight" : "");

  if (isObj && !isEmpty) {
    const openBracket = isArr ? "[" : "{";
    const closeBracket = isArr ? "]" : "}";

    // Build with DOM methods to preserve event listeners
    const indentEl = document.createElement("span");
    indentEl.className = "jv-indent";
    indentEl.style.width = depth * 20 + "px";

    const toggle = document.createElement("span");
    toggle.className = "jv-toggle open";
    toggle.textContent = "▶";

    row.appendChild(indentEl);
    row.appendChild(toggle);
    row.appendChild(document.createTextNode("\u00a0"));

    if (key !== null) {
      const keyEl = document.createElement("span");
      keyEl.className = "jv-key";
      keyEl.innerHTML = `"${highlight(key)}"`;
      const colonEl = document.createElement("span");
      colonEl.className = "jv-colon";
      colonEl.textContent = ":";
      row.appendChild(keyEl);
      row.appendChild(colonEl);
      row.appendChild(document.createTextNode("\u00a0"));
    }

    const bracketEl = document.createElement("span");
    bracketEl.className = "jv-bracket";
    bracketEl.textContent = openBracket;
    row.appendChild(bracketEl);

    const collapsedEl = document.createElement("span");
    collapsedEl.className = "jv-collapsed";
    collapsedEl.hidden = true;
    collapsedEl.innerHTML = `&nbsp;…&nbsp;${entries.length} ${isArr ? "items" : "keys"}&nbsp;`;
    row.appendChild(collapsedEl);

    const children = document.createElement("div");
    children.className = "jv-children";
    entries.forEach(([k, v], i) => {
      children.appendChild(buildNode(k, v, depth + 1, i === entries.length - 1));
    });

    const closeRow = document.createElement("div");
    closeRow.className = "jv-row";
    closeRow.innerHTML = `<span class="jv-indent" style="width:${depth * 20}px"></span><span class="jv-toggle-space"></span>&nbsp;<span class="jv-bracket">${closeBracket}</span>${comma}`;

    // Entire row is clickable
    row.style.cursor = "pointer";
    row.addEventListener("click", () => {
      const open = children.classList.toggle("hidden");
      toggle.classList.toggle("open", !open);
      collapsedEl.hidden = !open;
      closeRow.hidden = open;
    });

    node.appendChild(row);
    node.appendChild(children);
    node.appendChild(closeRow);
  } else {
    let valHtml;
    if (isEmpty) {
      valHtml = `<span class="jv-bracket">${isArr ? "[]" : "{}"}</span>`;
    } else if (value === null) {
      valHtml = `<span class="jv-val-null">null</span>`;
    } else if (typeof value === "string") {
      valHtml = `<span class="jv-val-str">"${highlight(value)}"</span>`;
    } else if (typeof value === "number") {
      valHtml = `<span class="jv-val-num">${value}</span>`;
    } else if (typeof value === "boolean") {
      valHtml = `<span class="jv-val-bool">${value}</span>`;
    } else {
      valHtml = escHtml(String(value));
    }

    const keyStr =
      key !== null
        ? `<span class="jv-key">"${highlight(key)}"</span><span class="jv-colon">:</span>`
        : "";
    row.innerHTML = `<span class="jv-indent" style="width:${depth * 20}px"></span><span class="jv-toggle-space"></span>&nbsp;${keyStr}${valHtml}${comma}`;
    node.appendChild(row);
  }

  return node;
}

function render() {
  const tree = document.getElementById("jvTree");
  tree.innerHTML = "";
  tree.appendChild(buildNode(null, DATA, 0, true));
}

document.getElementById("expandAll").addEventListener("click", () => {
  document.querySelectorAll(".jv-children").forEach((c) => {
    c.classList.remove("hidden");
    const nodeRow = c.previousElementSibling;
    if (nodeRow) {
      nodeRow.querySelector(".jv-toggle")?.classList.add("open");
      nodeRow.querySelector(".jv-collapsed")?.setAttribute("hidden", "");
    }
  });
  document.querySelectorAll(".jv-row[hidden]").forEach((r) => r.removeAttribute("hidden"));
});

document.getElementById("collapseAll").addEventListener("click", () => {
  document.querySelectorAll(".jv-children").forEach((c) => {
    if (c.closest(".jv-node")?.parentElement?.id !== "jvTree") {
      c.classList.add("hidden");
      const nodeRow = c.previousElementSibling;
      if (nodeRow) {
        nodeRow.querySelector(".jv-toggle")?.classList.remove("open");
        const collapsed = nodeRow.querySelector(".jv-collapsed");
        if (collapsed) collapsed.hidden = false;
        const nextSibling = c.nextElementSibling;
        if (nextSibling) nextSibling.hidden = true;
      }
    }
  });
});

let searchTimeout;
document.getElementById("jvSearch").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchTerm = e.target.value.trim();
    render();
  }, 200);
});

render();
