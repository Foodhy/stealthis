(function () {
  'use strict';

  var timeline = document.getElementById('timeline');
  var entries = Array.prototype.slice.call(timeline.querySelectorAll('.entry'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var fromDate = document.getElementById('fromDate');
  var toDate = document.getElementById('toDate');
  var clearDates = document.getElementById('clearDates');
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');
  var printBtn = document.getElementById('printBtn');
  var downloadBtn = document.getElementById('downloadBtn');

  var activeType = 'all';

  /* ---- expand / collapse ---- */
  entries.forEach(function (entry) {
    var head = entry.querySelector('.entry-head');
    var body = entry.querySelector('.entry-body');
    head.addEventListener('click', function () {
      var open = entry.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(open));
      body.hidden = !open;
    });
  });

  /* ---- filtering ---- */
  function inRange(dateStr) {
    if (fromDate.value && dateStr < fromDate.value) return false;
    if (toDate.value && dateStr > toDate.value) return false;
    return true;
  }

  function applyFilters() {
    var shown = 0;
    entries.forEach(function (entry) {
      var type = entry.getAttribute('data-type');
      var date = entry.getAttribute('data-date');
      var typeOk = activeType === 'all' || activeType === type;
      var dateOk = inRange(date);
      var visible = typeOk && dateOk;
      entry.hidden = !visible;
      if (visible) shown++;
    });
    countEl.textContent = 'Showing ' + shown + ' of ' + entries.length + ' records';
    emptyEl.hidden = shown !== 0;
    timeline.hidden = shown === 0;
    return shown;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      activeType = chip.getAttribute('data-type');
      applyFilters();
    });
  });

  fromDate.addEventListener('change', applyFilters);
  toDate.addEventListener('change', applyFilters);

  clearDates.addEventListener('click', function () {
    fromDate.value = '';
    toDate.value = '';
    applyFilters();
  });

  /* ---- print ---- */
  printBtn.addEventListener('click', function () {
    window.print();
  });

  /* ---- download visible records as text ---- */
  downloadBtn.addEventListener('click', function () {
    var lines = ['MEDICAL RECORDS — Biscuit (Golden Retriever)', '='.repeat(48), ''];
    entries.forEach(function (entry) {
      if (entry.hidden) return;
      var dateBlock = entry.querySelector('.entry-date');
      var date = dateBlock.textContent.replace(/\s+/g, ' ').trim();
      var title = entry.querySelector('.entry-title').textContent.trim();
      var meta = entry.querySelector('.entry-meta').textContent.trim();
      lines.push(date + '  —  ' + title);
      lines.push('  ' + meta);
      var rows = entry.querySelectorAll('.kv div');
      rows.forEach(function (row) {
        var dt = row.querySelector('dt').textContent.trim();
        var dd = row.querySelector('dd').textContent.trim();
        lines.push('  ' + dt + ': ' + dd);
      });
      var notes = entry.querySelector('.notes');
      if (notes) lines.push('  Notes: ' + notes.textContent.trim());
      lines.push('');
    });

    var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'biscuit-medical-records.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  applyFilters();
})();
