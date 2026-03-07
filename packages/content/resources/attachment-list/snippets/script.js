const FILE_ICONS = {
  pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
  png: '🖼', jpg: '🖼', gif: '🖼', webp: '🖼', svg: '🖼',
  zip: '🗜', tar: '🗜', gz: '🗜',
  mp4: '🎬', mov: '🎬', mp3: '🎵',
  default: '📎',
};

const FILE_CLS = {
  pdf: 'pdf', doc: 'doc', docx: 'doc', xls: 'xls', xlsx: 'xls',
  png: 'img', jpg: 'img', gif: 'img', webp: 'img', svg: 'img',
  zip: 'zip', tar: 'zip', gz: 'zip',
  mp4: 'mp4', mov: 'mp4',
};

let files = [
  { id: 1, name: 'contract_signed.pdf',     size: '1.2 MB' },
  { id: 2, name: 'meeting_notes.docx',      size: '48 KB' },
  { id: 3, name: 'budget_q1.xlsx',          size: '324 KB' },
  { id: 4, name: 'hero_banner.png',         size: '2.4 MB' },
  { id: 5, name: 'source_code.zip',         size: '18.6 MB' },
  { id: 6, name: 'demo_recording.mp4',      size: '94.2 MB' },
];

const DEMO_NAMES = ['design_mockup.png', 'api_spec.pdf', 'data_export.csv', 'readme.md'];
let demoIdx = 0;

function getExt(name) { return name.split('.').pop().toLowerCase(); }

function renderList() {
  const list = document.getElementById('attList');
  const count = document.getElementById('attCount');
  count.textContent = `${files.length} file${files.length !== 1 ? 's' : ''}`;

  if (files.length === 0) {
    list.innerHTML = '<div class="att-empty">No attachments yet</div>';
    return;
  }

  list.innerHTML = '';
  files.forEach((f, idx) => {
    const ext = getExt(f.name);
    const icon = FILE_ICONS[ext] || FILE_ICONS.default;
    const cls = FILE_CLS[ext] || 'default';

    const item = document.createElement('div');
    item.className = 'att-item';
    item.innerHTML = `
      <div class="att-icon att-icon--${cls}">${icon}</div>
      <div class="att-info">
        <div class="att-name">${f.name}</div>
        <div class="att-size">${f.size}</div>
      </div>
      <div class="att-actions">
        <button class="att-action-btn" title="Download" data-id="${f.id}">⬇</button>
        <button class="att-action-btn att-action-btn--del" title="Remove" data-id="${f.id}" data-action="remove">✕</button>
      </div>
    `;

    if (idx < files.length - 1) {
      const div = document.createElement('div');
      div.className = 'att-divider';
      list.appendChild(item);
      list.appendChild(div);
    } else {
      list.appendChild(item);
    }
  });
}

document.getElementById('attList').addEventListener('click', e => {
  const btn = e.target.closest('[data-action="remove"]');
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  files = files.filter(f => f.id !== id);
  renderList();
});

document.getElementById('attAddBtn').addEventListener('click', () => {
  const name = DEMO_NAMES[demoIdx % DEMO_NAMES.length];
  demoIdx++;
  const sizes = ['12 KB', '450 KB', '2.1 MB', '88 KB'];
  files.push({ id: Date.now(), name, size: sizes[demoIdx % sizes.length] });
  renderList();
});

renderList();
