(function () {
  'use strict';

  /* ── State ── */
  const fileSystem = {
    'My Files': {
      type: 'folder',
      children: {
        'Documents': {
          type: 'folder',
          children: {
            'Projects': { type: 'folder', children: {} },
            'Reports': { type: 'folder', children: {} }
          }
        },
        'Images': { type: 'folder', children: {} },
        'Videos': { type: 'folder', children: {} }
      }
    },
    'Shared with me': { type: 'folder', children: {} },
    'Starred': { type: 'folder', children: {} },
    'Trash': { type: 'folder', children: {} }
  };

  let currentPath = ['My Files', 'Documents'];
  let currentView = 'grid';
  let selectedItems = new Set();
  let contextTarget = null;
  let lastClickedIndex = -1;

  /* ── DOM refs ── */
  const content = document.getElementById('fm-content');
  const contextMenu = document.getElementById('fm-context-menu');
  const uploadOverlay = document.getElementById('fm-upload-overlay');
  const fileInput = document.getElementById('fm-file-input');
  const renameModal = document.getElementById('fm-rename-modal');
  const renameInput = document.getElementById('fm-rename-input');
  const selectAllCheck = document.querySelector('.fm-select-all-check');
  const itemCountEl = document.querySelector('.fm-item-count');
  const sortSelect = document.getElementById('fm-sort-select');
  const breadcrumbEl = document.querySelector('.fm-breadcrumb');
  const sidebar = document.querySelector('.fm-sidebar');
  const sidebarToggle = document.querySelector('.fm-sidebar-toggle');

  /* ── View Toggle ── */
  document.querySelectorAll('.fm-view-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.fm-view-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentView = btn.dataset.view;
      content.classList.remove('fm-grid', 'fm-list');
      content.classList.add(currentView === 'grid' ? 'fm-grid' : 'fm-list');
    });
  });

  /* ── Sidebar Toggle (Mobile) ── */
  sidebarToggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });

  /* ── Folder Tree ── */
  document.querySelectorAll('.fm-tree-item').forEach(function (item) {
    var row = item.querySelector(':scope > .fm-tree-row');
    var arrow = row.querySelector('.fm-tree-arrow');
    var children = item.querySelector(':scope > .fm-tree-list');

    row.addEventListener('click', function (e) {
      e.stopPropagation();

      // Toggle expand/collapse if has children
      if (arrow && children) {
        if (e.target.closest('.fm-tree-arrow')) {
          arrow.classList.toggle('expanded');
          item.classList.toggle('collapsed');
          return;
        }
        // Clicking the row also expands
        if (item.classList.contains('collapsed')) {
          arrow.classList.add('expanded');
          item.classList.remove('collapsed');
        }
      }

      // Navigate to folder
      var path = item.dataset.path;
      if (path) {
        currentPath = path.split('/');
        updateBreadcrumb();
        updateTreeActive(path);
        sidebar.classList.remove('open');
      }
    });
  });

  function updateTreeActive(path) {
    document.querySelectorAll('.fm-tree-row').forEach(function (r) { r.classList.remove('active'); });
    var target = document.querySelector('.fm-tree-item[data-path="' + path + '"] > .fm-tree-row');
    if (target) target.classList.add('active');
  }

  /* ── Breadcrumb ── */
  function updateBreadcrumb() {
    breadcrumbEl.innerHTML = '';
    currentPath.forEach(function (segment, i) {
      if (i > 0) {
        var sep = document.createElement('span');
        sep.className = 'fm-breadcrumb-sep';
        sep.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4,2 8,6 4,10"/></svg>';
        breadcrumbEl.appendChild(sep);
      }
      var isLast = i === currentPath.length - 1;
      var el = document.createElement(isLast ? 'span' : 'button');
      el.className = 'fm-breadcrumb-item' + (isLast ? ' current' : '');
      el.textContent = segment;
      if (!isLast) {
        el.dataset.path = currentPath.slice(0, i + 1).join('/');
        el.addEventListener('click', function () {
          currentPath = this.dataset.path.split('/');
          updateBreadcrumb();
          updateTreeActive(currentPath.join('/'));
        });
      }
      breadcrumbEl.appendChild(el);
    });
  }

  /* ── Selection ── */
  function getItems() {
    return Array.from(content.querySelectorAll('.fm-item'));
  }

  content.addEventListener('click', function (e) {
    var item = e.target.closest('.fm-item');
    if (!item) return;

    // Ignore checkbox direct clicks — handled below
    if (e.target.tagName === 'INPUT') return;

    var items = getItems();
    var index = items.indexOf(item);

    if (e.shiftKey && lastClickedIndex >= 0) {
      var start = Math.min(lastClickedIndex, index);
      var end = Math.max(lastClickedIndex, index);
      for (var i = start; i <= end; i++) {
        selectItem(items[i], true);
      }
    } else if (e.ctrlKey || e.metaKey) {
      toggleSelect(item);
    } else {
      clearSelection();
      selectItem(item, true);
    }
    lastClickedIndex = index;
    syncSelectAll();
  });

  content.addEventListener('change', function (e) {
    if (e.target.type === 'checkbox') {
      var item = e.target.closest('.fm-item');
      if (item) {
        selectItem(item, e.target.checked);
        syncSelectAll();
      }
    }
  });

  selectAllCheck.addEventListener('change', function () {
    var items = getItems();
    var checked = selectAllCheck.checked;
    items.forEach(function (item) { selectItem(item, checked); });
  });

  function selectItem(item, selected) {
    var name = item.dataset.name;
    var check = item.querySelector('input[type="checkbox"]');
    if (selected) {
      item.classList.add('selected');
      selectedItems.add(name);
      if (check) check.checked = true;
    } else {
      item.classList.remove('selected');
      selectedItems.delete(name);
      if (check) check.checked = false;
    }
  }

  function toggleSelect(item) {
    selectItem(item, !item.classList.contains('selected'));
  }

  function clearSelection() {
    getItems().forEach(function (item) { selectItem(item, false); });
    selectedItems.clear();
  }

  function syncSelectAll() {
    var items = getItems();
    var allChecked = items.length > 0 && items.every(function (i) { return i.classList.contains('selected'); });
    selectAllCheck.checked = allChecked;
    selectAllCheck.indeterminate = !allChecked && selectedItems.size > 0;
    itemCountEl.textContent = selectedItems.size > 0
      ? selectedItems.size + ' selected'
      : items.length + ' items';
  }

  /* ── Double-click folder ── */
  content.addEventListener('dblclick', function (e) {
    var item = e.target.closest('.fm-item');
    if (!item || item.dataset.type !== 'folder') return;
    currentPath.push(item.dataset.name);
    updateBreadcrumb();
    updateTreeActive(currentPath.join('/'));
  });

  /* ── Context Menu ── */
  content.addEventListener('contextmenu', function (e) {
    var item = e.target.closest('.fm-item');
    if (!item) return;
    e.preventDefault();
    contextTarget = item;

    // Position
    var x = e.clientX;
    var y = e.clientY;
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.add('visible');

    // Adjust if off-screen
    requestAnimationFrame(function () {
      var rect = contextMenu.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        contextMenu.style.left = (x - rect.width) + 'px';
      }
      if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = (y - rect.height) + 'px';
      }
    });
  });

  document.addEventListener('click', function () {
    contextMenu.classList.remove('visible');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      contextMenu.classList.remove('visible');
      renameModal.classList.remove('visible');
    }
  });

  contextMenu.addEventListener('click', function (e) {
    var btn = e.target.closest('.fm-context-item');
    if (!btn || !contextTarget) return;
    var action = btn.dataset.action;

    switch (action) {
      case 'open':
        if (contextTarget.dataset.type === 'folder') {
          currentPath.push(contextTarget.dataset.name);
          updateBreadcrumb();
          updateTreeActive(currentPath.join('/'));
        }
        break;

      case 'rename':
        renameInput.value = contextTarget.dataset.name;
        renameModal.classList.add('visible');
        setTimeout(function () {
          renameInput.focus();
          var dotIndex = renameInput.value.lastIndexOf('.');
          renameInput.setSelectionRange(0, dotIndex > 0 ? dotIndex : renameInput.value.length);
        }, 50);
        break;

      case 'delete':
        if (confirm('Delete "' + contextTarget.dataset.name + '"?')) {
          contextTarget.classList.add('removing');
          var target = contextTarget;
          setTimeout(function () {
            target.remove();
            syncSelectAll();
          }, 250);
        }
        break;

      case 'download':
        // Simulate download
        var link = document.createElement('a');
        link.href = '#';
        link.download = contextTarget.dataset.name;
        break;

      case 'copy':
      case 'move':
        // Visual feedback only
        break;
    }
    contextMenu.classList.remove('visible');
  });

  /* ── Rename Modal ── */
  renameModal.querySelector('.fm-modal-cancel').addEventListener('click', function () {
    renameModal.classList.remove('visible');
  });

  renameModal.querySelector('.fm-modal-confirm').addEventListener('click', doRename);
  renameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doRename();
  });

  function doRename() {
    var newName = renameInput.value.trim();
    if (!newName || !contextTarget) return;
    contextTarget.dataset.name = newName;
    contextTarget.querySelector('.fm-item-name').textContent = newName;
    renameModal.classList.remove('visible');
  }

  renameModal.addEventListener('click', function (e) {
    if (e.target === renameModal) renameModal.classList.remove('visible');
  });

  /* ── Upload Drag & Drop ── */
  var dragCounter = 0;

  document.addEventListener('dragenter', function (e) {
    e.preventDefault();
    dragCounter++;
    if (dragCounter === 1) uploadOverlay.classList.add('visible');
  });

  document.addEventListener('dragleave', function (e) {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      uploadOverlay.classList.remove('visible');
    }
  });

  document.addEventListener('dragover', function (e) {
    e.preventDefault();
  });

  document.addEventListener('drop', function (e) {
    e.preventDefault();
    dragCounter = 0;
    uploadOverlay.classList.remove('visible');
    // Files would be in e.dataTransfer.files
  });

  /* ── Upload Button ── */
  document.querySelector('.fm-upload-btn').addEventListener('click', function () {
    fileInput.click();
  });

  fileInput.addEventListener('change', function () {
    // Files added — no-op for demo
    fileInput.value = '';
  });

  /* ── New Folder ── */
  document.querySelector('.fm-new-folder-btn').addEventListener('click', function () {
    var name = prompt('New folder name:');
    if (!name || !name.trim()) return;
    name = name.trim();

    var html = '<div class="fm-item-check"><input type="checkbox" /></div>' +
      '<div class="fm-item-icon fm-icon-folder">' +
      '<svg width="48" height="48" viewBox="0 0 48 48" fill="#3b82f6"><path d="M4 12h16l4-4h20v32H4z"/></svg>' +
      '</div>' +
      '<div class="fm-item-info">' +
      '<span class="fm-item-name">' + name + '</span>' +
      '<span class="fm-item-meta">0 items</span>' +
      '</div>' +
      '<span class="fm-item-size">\u2014</span>' +
      '<span class="fm-item-date">Just now</span>' +
      '<span class="fm-item-type-col">Folder</span>';

    var el = document.createElement('div');
    el.className = 'fm-item';
    el.dataset.name = name;
    el.dataset.type = 'folder';
    el.dataset.size = '0';
    el.dataset.date = new Date().toISOString().slice(0, 10);
    el.dataset.items = '0 items';
    el.innerHTML = html;

    // Insert before first non-folder or at end
    var items = getItems();
    var firstFile = items.find(function (i) { return i.dataset.type !== 'folder'; });
    if (firstFile) {
      content.insertBefore(el, firstFile);
    } else {
      content.appendChild(el);
    }
    syncSelectAll();
  });

  /* ── Sort ── */
  sortSelect.addEventListener('change', function () {
    var key = sortSelect.value;
    var items = getItems();
    var folders = items.filter(function (i) { return i.dataset.type === 'folder'; });
    var files = items.filter(function (i) { return i.dataset.type !== 'folder'; });

    var comparator;
    switch (key) {
      case 'name':
        comparator = function (a, b) { return a.dataset.name.localeCompare(b.dataset.name); };
        break;
      case 'size':
        comparator = function (a, b) { return parseInt(a.dataset.size || '0') - parseInt(b.dataset.size || '0'); };
        break;
      case 'date':
        comparator = function (a, b) { return (b.dataset.date || '').localeCompare(a.dataset.date || ''); };
        break;
      case 'type':
        comparator = function (a, b) { return (a.dataset.type || '').localeCompare(b.dataset.type || ''); };
        break;
      default:
        comparator = function () { return 0; };
    }

    folders.sort(comparator);
    files.sort(comparator);

    folders.concat(files).forEach(function (item) {
      content.appendChild(item);
    });
  });

  /* ── Search ── */
  document.querySelector('.fm-search-input').addEventListener('input', function (e) {
    var query = e.target.value.toLowerCase();
    getItems().forEach(function (item) {
      var name = (item.dataset.name || '').toLowerCase();
      item.style.display = name.includes(query) ? '' : 'none';
    });
  });
})();
