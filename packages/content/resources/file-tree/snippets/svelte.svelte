<script>
const TREE = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
        children: [
          { id: "button", name: "Button.tsx", type: "tsx" },
          { id: "input", name: "Input.tsx", type: "tsx", modified: true },
          { id: "modal", name: "Modal.tsx", type: "tsx" },
          { id: "nav", name: "Navbar.tsx", type: "tsx" },
        ],
      },
      {
        id: "hooks",
        name: "hooks",
        type: "folder",
        children: [
          { id: "useauth", name: "useAuth.ts", type: "ts" },
          { id: "usefetch", name: "useFetch.ts", type: "ts", untracked: true },
        ],
      },
      {
        id: "lib",
        name: "lib",
        type: "folder",
        children: [
          { id: "utils", name: "utils.ts", type: "ts" },
          { id: "api", name: "api.ts", type: "ts", modified: true },
        ],
      },
      { id: "apptsx", name: "App.tsx", type: "tsx" },
      { id: "maintsx", name: "main.tsx", type: "tsx" },
    ],
  },
  {
    id: "public",
    name: "public",
    type: "folder",
    children: [
      { id: "indexhtml", name: "index.html", type: "md" },
      { id: "favicon", name: "favicon.svg", type: "env" },
    ],
  },
  { id: "pkgjson", name: "package.json", type: "json" },
  { id: "tsconfigjson", name: "tsconfig.json", type: "json" },
  { id: "tailwindcfg", name: "tailwind.config.js", type: "js" },
  { id: "envlocal", name: ".env.local", type: "env", untracked: true },
  { id: "gitignore", name: ".gitignore", type: "git" },
  { id: "readme", name: "README.md", type: "md", modified: true },
];

const TYPE_ICON = {
  folder: { color: "#e3b341", label: "" },
  ts: { color: "#3178c6", label: "TS" },
  tsx: { color: "#61dafb", label: "TSX" },
  js: { color: "#f7df1e", label: "JS" },
  jsx: { color: "#61dafb", label: "JSX" },
  json: { color: "#ffca28", label: "{}" },
  css: { color: "#264de4", label: "CS" },
  md: { color: "#ffffff", label: "MD" },
  env: { color: "#7ee787", label: "EN" },
  git: { color: "#f05032", label: "GI" },
  lock: { color: "#8b949e", label: "LK" },
};

function getInitialExpanded(nodes, max = 1, depth = 0) {
  if (depth >= max) return [];
  const ids = [];
  for (const n of nodes) {
    if (n.type === "folder") {
      ids.push(n.id);
      if (n.children) ids.push(...getInitialExpanded(n.children, max, depth + 1));
    }
  }
  return ids;
}

let activeId = "apptsx";
let expandedIds = new Set(getInitialExpanded(TREE));

function toggle(id) {
  const next = new Set(expandedIds);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedIds = next;
}

function handleClick(node) {
  if (node.type === "folder") toggle(node.id);
  activeId = node.id;
}

function expandAll() {
  const all = [];
  function collect(nodes) {
    for (const n of nodes) {
      if (n.type === "folder") {
        all.push(n.id);
        if (n.children) collect(n.children);
      }
    }
  }
  collect(TREE);
  expandedIds = new Set(all);
}

function collapseAll() {
  expandedIds = new Set();
}

function flattenTree(nodes, depth) {
  const rows = [];
  for (const node of nodes) {
    const isFolder = node.type === "folder";
    const isOpen = isFolder && expandedIds.has(node.id);
    rows.push({ node, depth, isFolder, isOpen });
    if (isFolder && isOpen && node.children) {
      rows.push(...flattenTree(node.children, depth + 1));
    }
  }
  return rows;
}

$: flatList = flattenTree(TREE, 0);
$: activePath = activeId ? "/" + activeId.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`) : "";
</script>

<div class="file-tree-wrapper">
  <div class="file-tree-panel">
    <div class="file-tree-card">
      <div class="file-tree-header">
        <span class="header-label">Explorer</span>
        <div class="header-actions">
          <button on:click={expandAll} title="Expand all" class="action-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
          <button on:click={collapseAll} title="Collapse all" class="action-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
              <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="file-tree-body">
        {#each flatList as row (row.node.id)}
          <div
            class="tree-row"
            class:active={activeId === row.node.id}
            style="padding-left: {row.depth * 16 + 8}px"
            on:click={() => handleClick(row.node)}
            role="button"
            tabindex="0"
            on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(row.node); }}
          >
            {#if row.isFolder}
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5"
                class="chevron" class:open={row.isOpen}
              >
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            {:else}
              <span class="chevron-spacer"></span>
            {/if}

            {#if row.isFolder}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#e3b341" stroke="none" opacity="0.9">
                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
              </svg>
            {:else}
              <span
                class="file-badge"
                style="color: {TYPE_ICON[row.node.type].color}; background: {TYPE_ICON[row.node.type].color}22; border: 1px solid {TYPE_ICON[row.node.type].color}44;"
              >
                {TYPE_ICON[row.node.type].label}
              </span>
            {/if}

            <span class="node-name" class:modified={row.node.modified}>{row.node.name}</span>

            {#if row.node.modified}
              <span class="git-mod">M</span>
            {/if}
            {#if row.node.untracked}
              <span class="git-untracked">U</span>
            {/if}
          </div>
        {/each}
      </div>

      {#if activeId}
        <div class="file-tree-footer">
          <p class="footer-path">{activePath}</p>
        </div>
      {/if}
    </div>

    <div class="legend">
      <span class="legend-item"><span class="git-mod-inline">M</span> Modified</span>
      <span class="legend-item"><span class="git-untracked-inline">U</span> Untracked</span>
    </div>
  </div>
</div>

<style>
  .file-tree-wrapper {
    min-height: 100vh;
    background: #0d1117;
    padding: 1.5rem;
    display: flex;
    justify-content: center;
  }
  .file-tree-panel { width: 100%; max-width: 360px; }
  .file-tree-card {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 0.75rem;
    overflow: hidden;
  }
  .file-tree-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: #21262d;
    border-bottom: 1px solid #30363d;
  }
  .header-label {
    font-size: 11px;
    font-weight: 700;
    color: #8b949e;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .header-actions { display: flex; gap: 4px; }
  .action-btn {
    padding: 4px;
    border-radius: 4px;
    color: #484f58;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;
  }
  .action-btn:hover { color: #e6edf3; }
  .file-tree-body { padding: 6px 4px; }
  .tree-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    color: #8b949e;
    transition: background 0.12s, color 0.12s;
    font-size: 12px;
  }
  .tree-row:hover { color: #e6edf3; background: rgba(255,255,255,0.03); }
  .tree-row.active { background: #21262d; color: #e6edf3; }
  .chevron {
    flex-shrink: 0;
    color: #484f58;
    transition: transform 0.15s;
  }
  .chevron.open { transform: rotate(90deg); }
  .chevron-spacer { width: 10px; flex-shrink: 0; }
  .file-badge {
    font-size: 8px;
    font-weight: 700;
    border-radius: 3px;
    padding: 0 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 14px;
    line-height: 1;
  }
  .node-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .node-name.modified { color: #e3b341; }
  .git-mod { font-size: 9px; font-weight: 700; color: #e3b341; margin-left: auto; }
  .git-untracked { font-size: 9px; font-weight: 700; color: #4ade80; margin-left: auto; }
  .file-tree-footer {
    padding: 0.5rem 0.75rem;
    border-top: 1px solid #30363d;
    background: #0d1117;
  }
  .footer-path { font-size: 10px; color: #484f58; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .legend { display: flex; gap: 12px; margin-top: 8px; font-size: 10px; color: #484f58; }
  .legend-item { display: flex; align-items: center; gap: 4px; }
  .git-mod-inline { color: #e3b341; font-weight: 700; }
  .git-untracked-inline { color: #4ade80; font-weight: 700; }
</style>
