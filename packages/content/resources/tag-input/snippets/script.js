document.querySelectorAll('.tag-input').forEach(function (container) {
  var textInput   = container.querySelector('.tag-text-input');
  var hiddenInput = container.parentElement.querySelector('.tag-hidden-value');

  // Click on container focuses the text input
  container.addEventListener('click', function (e) {
    if (e.target === container) textInput.focus();
  });

  function syncHidden() {
    if (!hiddenInput) return;
    var tags = Array.from(container.querySelectorAll('.tag')).map(function (t) {
      return t.childNodes[0].textContent.trim();
    });
    hiddenInput.value = tags.join(',');
  }

  function makeTag(text) {
    var value = text.trim().replace(/,/g, '');
    if (!value) return;
    // prevent duplicates
    var existing = Array.from(container.querySelectorAll('.tag')).map(function (t) {
      return t.childNodes[0].textContent.trim().toLowerCase();
    });
    if (existing.indexOf(value.toLowerCase()) !== -1) return;

    var tag = document.createElement('span');
    tag.className = 'tag';
    tag.tabIndex = 0;
    tag.setAttribute('aria-label', 'Remove ' + value);
    tag.appendChild(document.createTextNode(value));

    var btn = document.createElement('button');
    btn.className = 'tag-remove';
    btn.tabIndex = -1;
    btn.setAttribute('aria-label', 'Remove ' + value);
    btn.textContent = '×';
    btn.addEventListener('click', function () { removeTag(tag); });

    tag.appendChild(btn);

    // keyboard removal when tag is focused
    tag.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        var prev = tag.previousElementSibling;
        removeTag(tag);
        if (prev && prev.classList.contains('tag')) prev.focus();
        else textInput.focus();
      }
    });

    container.insertBefore(tag, textInput);
    syncHidden();
  }

  function removeTag(tag) {
    tag.remove();
    syncHidden();
  }

  textInput.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ',') && textInput.value.trim()) {
      e.preventDefault();
      makeTag(textInput.value);
      textInput.value = '';
    }
    // remove last tag on backspace when input is empty
    if (e.key === 'Backspace' && textInput.value === '') {
      var tags = container.querySelectorAll('.tag');
      if (tags.length) tags[tags.length - 1].focus();
    }
  });

  // also handle comma typed inside value
  textInput.addEventListener('input', function () {
    if (textInput.value.includes(',')) {
      textInput.value.split(',').forEach(function (part) { makeTag(part); });
      textInput.value = '';
    }
  });

  // Wire up existing remove buttons (pre-populated tags)
  container.querySelectorAll('.tag').forEach(function (tag) {
    var btn = tag.querySelector('.tag-remove');
    if (btn) {
      btn.addEventListener('click', function () { removeTag(tag); });
    }
    tag.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        var prev = tag.previousElementSibling;
        removeTag(tag);
        if (prev && prev.classList.contains('tag')) prev.focus();
        else textInput.focus();
      }
    });
  });
});
