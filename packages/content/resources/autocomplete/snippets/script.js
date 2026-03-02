var ITEMS = [
  'Apple', 'Apricot', 'Avocado',
  'Banana', 'Blueberry', 'Broccoli',
  'Carrot', 'Cherry', 'Cucumber',
  'Grape', 'Kiwi', 'Lemon',
  'Mango', 'Orange', 'Papaya',
  'Peach', 'Pear', 'Pineapple',
  'Raspberry', 'Strawberry', 'Tomato', 'Watermelon'
];

var input   = document.getElementById('ac-input');
var listbox = document.getElementById('ac-listbox');
var clearBtn = document.querySelector('.ac-clear');
var activeIdx = -1;

function escape(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text, query) {
  if (!query) return text;
  var re = new RegExp('(' + escape(query) + ')', 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

function open(items, query) {
  listbox.innerHTML = '';
  activeIdx = -1;

  if (items.length === 0) {
    var empty = document.createElement('li');
    empty.className = 'ac-no-results';
    empty.textContent = 'No results found';
    listbox.appendChild(empty);
  } else {
    items.forEach(function (item, i) {
      var li = document.createElement('li');
      li.className = 'ac-option';
      li.id = 'ac-opt-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.innerHTML = highlight(item, query);
      li.dataset.value = item;
      li.addEventListener('mousedown', function (e) {
        e.preventDefault();
        select(item);
      });
      listbox.appendChild(li);
    });
  }

  listbox.hidden = false;
  input.setAttribute('aria-expanded', 'true');
}

function close() {
  listbox.hidden = true;
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-activedescendant', '');
  activeIdx = -1;
}

function select(value) {
  input.value = value;
  clearBtn.hidden = false;
  close();
}

function setActive(idx) {
  var options = listbox.querySelectorAll('.ac-option');
  options.forEach(function (o) { o.setAttribute('aria-selected', 'false'); });
  if (idx < 0 || idx >= options.length) {
    activeIdx = -1;
    input.setAttribute('aria-activedescendant', '');
    return;
  }
  activeIdx = idx;
  var active = options[idx];
  active.setAttribute('aria-selected', 'true');
  input.setAttribute('aria-activedescendant', active.id);
  active.scrollIntoView({ block: 'nearest' });
}

input.addEventListener('input', function () {
  var q = input.value.trim();
  clearBtn.hidden = q.length === 0;
  if (!q) { close(); return; }
  var filtered = ITEMS.filter(function (item) {
    return item.toLowerCase().includes(q.toLowerCase());
  });
  open(filtered, q);
});

input.addEventListener('keydown', function (e) {
  var options = listbox.querySelectorAll('.ac-option');
  if (listbox.hidden) {
    if (e.key === 'ArrowDown') { e.preventDefault(); input.dispatchEvent(new Event('input')); }
    return;
  }
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setActive(Math.min(activeIdx + 1, options.length - 1));
      break;
    case 'ArrowUp':
      e.preventDefault();
      setActive(Math.max(activeIdx - 1, 0));
      break;
    case 'Enter':
      e.preventDefault();
      if (activeIdx >= 0 && options[activeIdx]) {
        select(options[activeIdx].dataset.value);
      }
      break;
    case 'Escape':
      input.value = '';
      clearBtn.hidden = true;
      close();
      break;
    case 'Tab':
      close();
      break;
  }
});

input.addEventListener('blur', function () {
  // small delay so mousedown on option fires first
  setTimeout(close, 150);
});

clearBtn.addEventListener('click', function () {
  input.value = '';
  clearBtn.hidden = true;
  input.focus();
  close();
});
