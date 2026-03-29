const TREE = {
  name: 'my-app',
  type: 'folder',
  open: true,
  children: [
    { name: 'src', type: 'folder', open: true, children: [
      { name: 'components', type: 'folder', open: true, children: [
        { name: 'Button.tsx', type: 'file' },
        { name: 'Card.tsx', type: 'file' },
        { name: 'Modal.tsx', type: 'file' },
      ]},
      { name: 'pages', type: 'folder', open: false, children: [
        { name: 'index.tsx', type: 'file' },
        { name: 'about.tsx', type: 'file' },
        { name: 'api', type: 'folder', open: false, children: [
          { name: 'auth.ts', type: 'file' },
          { name: 'users.ts', type: 'file' },
        ]},
      ]},
      { name: 'styles', type: 'folder', open: false, children: [
        { name: 'globals.css', type: 'file' },
        { name: 'components.css', type: 'file' },
      ]},
      { name: 'lib', type: 'folder', open: false, children: [
        { name: 'utils.ts', type: 'file' },
        { name: 'api.ts', type: 'file' },
      ]},
    ]},
    { name: 'public', type: 'folder', open: false, children: [
      { name: 'logo.svg', type: 'file' },
      { name: 'favicon.ico', type: 'file' },
    ]},
    { name: 'package.json', type: 'file' },
    { name: 'tsconfig.json', type: 'file' },
    { name: 'README.md', type: 'file' },
  ]
};

const ICONS = {
  folder: '📁', folderOpen: '📂',
  tsx: '⚛', ts: '🔷', js: '🟨', css: '🎨', md: '📝', json: '📋', svg: '🖼', ico: '🖼', default: '📄'
};

function getExt(name) { return name.split('.').pop().toLowerCase(); }
function getIcon(node) {
  if (node.type === 'folder') return node.open ? ICONS.folderOpen : ICONS.folder;
  const ext = getExt(node.name);
  return ICONS[ext] || ICONS.default;
}

let activeNode = null;

function buildNode(node, depth = 0) {
  const wrap = document.createElement('div');

  const row = document.createElement('div');
  row.className = 'ft-item';

  const indent = document.createElement('span');
  indent.className = 'ft-indent';
  indent.style.width = (depth * 16) + 'px';

  let toggleEl;
  if (node.type === 'folder' && node.children?.length) {
    toggleEl = document.createElement('span');
    toggleEl.className = 'ft-toggle' + (node.open ? ' open' : '');
    toggleEl.textContent = '▶';
  } else {
    toggleEl = document.createElement('span');
    toggleEl.className = 'ft-toggle-space';
  }

  const icon = document.createElement('span');
  icon.className = 'ft-icon';
  icon.textContent = getIcon(node);

  const name = document.createElement('span');
  name.className = 'ft-name';
  if (node.type === 'file') {
    const ext = getExt(node.name);
    name.classList.add(`ext-${ext}`);
  }
  name.textContent = node.name;

  row.appendChild(indent);
  row.appendChild(toggleEl);
  row.appendChild(icon);
  row.appendChild(name);
  wrap.appendChild(row);

  let childrenEl = null;
  if (node.type === 'folder' && node.children) {
    childrenEl = document.createElement('div');
    childrenEl.className = 'ft-children' + (node.open ? '' : ' collapsed');
    node.children.forEach(child => childrenEl.appendChild(buildNode(child, depth + 1)));
    wrap.appendChild(childrenEl);
  }

  row.addEventListener('click', () => {
    if (activeNode) activeNode.classList.remove('active');
    row.classList.add('active');
    activeNode = row;

    if (node.type === 'folder' && childrenEl) {
      node.open = !node.open;
      toggleEl.classList.toggle('open', node.open);
      childrenEl.classList.toggle('collapsed', !node.open);
      icon.textContent = getIcon(node);
    }
  });

  row.addEventListener('contextmenu', e => {
    e.preventDefault();
    showCtx(e.clientX, e.clientY);
  });

  return wrap;
}

function showCtx(x, y) {
  const menu = document.getElementById('ctxMenu');
  menu.hidden = false;
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
}

document.addEventListener('click', () => { document.getElementById('ctxMenu').hidden = true; });

function setAllOpen(node, open) {
  if (node.type === 'folder') { node.open = open; if (node.children) node.children.forEach(c => setAllOpen(c, open)); }
}

document.getElementById('expandAllBtn').addEventListener('click', () => {
  setAllOpen(TREE, true);
  document.getElementById('ftTree').innerHTML = '';
  document.getElementById('ftTree').appendChild(buildNode(TREE));
});

document.getElementById('collapseAllBtn').addEventListener('click', () => {
  setAllOpen(TREE, false);
  TREE.open = true;
  document.getElementById('ftTree').innerHTML = '';
  document.getElementById('ftTree').appendChild(buildNode(TREE));
});

document.getElementById('ftTree').appendChild(buildNode(TREE));
