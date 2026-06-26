(function () {
  'use strict';

  var form = document.getElementById('claim-form');
  if (!form) return;

  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var backBtn = document.getElementById('back');
  var nextBtn = document.getElementById('next');
  var submitBtn = document.getElementById('submit');
  var confirmEl = document.getElementById('confirm');
  var restartBtn = document.getElementById('restart');

  var TOTAL = panels.length;
  var current = 1;
  var files = [];

  /* ---------- step navigation ---------- */
  function render() {
    panels.forEach(function (p) {
      p.classList.toggle('is-current', Number(p.dataset.panel) === current);
    });
    steps.forEach(function (s) {
      var n = Number(s.dataset.step);
      s.classList.toggle('is-active', n === current);
      s.classList.toggle('is-done', n < current);
    });
    backBtn.hidden = current === 1;
    nextBtn.hidden = current === TOTAL;
    submitBtn.hidden = current !== TOTAL;
    if (current === TOTAL) buildReview();
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function goTo(step) {
    current = Math.min(Math.max(step, 1), TOTAL);
    render();
  }

  /* ---------- validation ---------- */
  function showError(name, show) {
    var el = document.querySelector('[data-error="' + name + '"]');
    if (el) el.hidden = !show;
  }

  function validateStep(step) {
    var ok = true;
    if (step === 1) {
      var policy = form.querySelector('input[name="policy"]:checked');
      var incident = form.querySelector('input[name="incident"]:checked');
      showError('policy', !policy); if (!policy) ok = false;
      showError('incident', !incident); if (!incident) ok = false;
    } else if (step === 2) {
      var date = form.date, loc = form.location, desc = form.description;
      [['date', date.value.trim() !== ''],
       ['location', loc.value.trim() !== ''],
       ['description', desc.value.trim().length >= 20]
      ].forEach(function (pair) {
        var valid = pair[1];
        var input = form[pair[0]];
        input.classList.toggle('invalid', !valid);
        showError(pair[0], !valid);
        if (!valid) ok = false;
      });
    } else if (step === 4) {
      var attest = document.getElementById('attest');
      showError('attest', !attest.checked);
      if (!attest.checked) ok = false;
    }
    return ok;
  }

  nextBtn.addEventListener('click', function () {
    if (validateStep(current)) goTo(current + 1);
  });
  backBtn.addEventListener('click', function () { goTo(current - 1); });

  /* live clear of errors */
  ['date', 'location', 'description'].forEach(function (n) {
    var el = form[n];
    if (el) el.addEventListener('input', function () {
      el.classList.remove('invalid');
      showError(n, false);
    });
  });
  form.querySelectorAll('input[name="policy"],input[name="incident"]').forEach(function (r) {
    r.addEventListener('change', function () { showError(r.name, false); });
  });

  /* ---------- description counter ---------- */
  var desc = form.description;
  var counter = document.querySelector('[data-counter="description"]');
  if (desc && counter) {
    desc.addEventListener('input', function () {
      counter.textContent = desc.value.trim().length;
    });
  }

  /* ---------- police report toggle ---------- */
  var police = document.getElementById('police');
  var reportNo = document.getElementById('report-no');
  if (police && reportNo) {
    police.addEventListener('change', function () {
      reportNo.hidden = !police.checked;
      if (police.checked) reportNo.focus();
    });
  }

  /* ---------- dropzone ---------- */
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('file-input');
  var fileList = document.getElementById('file-list');
  var filesCount = document.getElementById('files-count');

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function renderFiles() {
    fileList.innerHTML = '';
    files.forEach(function (f, i) {
      var li = document.createElement('li');
      li.className = 'file-item';

      var thumb = document.createElement('span');
      thumb.className = 'file-thumb';
      if (f.type && f.type.indexOf('image/') === 0) {
        var img = document.createElement('img');
        img.alt = '';
        img.src = URL.createObjectURL(f);
        thumb.appendChild(img);
      } else {
        thumb.textContent = 'PDF';
      }

      var meta = document.createElement('div');
      meta.className = 'file-meta';
      var nm = document.createElement('div');
      nm.className = 'file-name';
      nm.textContent = f.name;
      var sz = document.createElement('div');
      sz.className = 'file-size';
      sz.textContent = formatSize(f.size);
      meta.appendChild(nm); meta.appendChild(sz);

      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'file-remove';
      rm.setAttribute('aria-label', 'Remove ' + f.name);
      rm.innerHTML = '&times;';
      rm.addEventListener('click', function () {
        files.splice(i, 1);
        renderFiles();
      });

      li.appendChild(thumb); li.appendChild(meta); li.appendChild(rm);
      fileList.appendChild(li);
    });
    filesCount.textContent = files.length === 0
      ? 'No files added yet.'
      : files.length + (files.length === 1 ? ' file added.' : ' files added.');
  }

  function addFiles(list) {
    Array.prototype.forEach.call(list, function (f) {
      if (f.size > 10 * 1048576) return;
      files.push(f);
    });
    renderFiles();
  }

  if (dropzone) {
    dropzone.addEventListener('click', function () { fileInput.click(); });
    dropzone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });
    fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add('is-drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.remove('is-drag'); });
    });
    dropzone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }

  /* ---------- review ---------- */
  function buildReview() {
    var review = document.getElementById('review');
    review.innerHTML = '';
    var policy = (form.querySelector('input[name="policy"]:checked') || {}).value || '—';
    var incident = (form.querySelector('input[name="incident"]:checked') || {}).value || '—';
    var dateVal = form.date.value || '—';
    var timeVal = form.time.value || '';
    var rows = [
      ['Policy', policy, 1],
      ['Incident type', incident, 1],
      ['Date / time', dateVal + (timeVal ? ' · ' + timeVal : ''), 2],
      ['Location', form.location.value || '—', 2],
      ['Description', form.description.value || '—', 2],
      ['Evidence', files.length + (files.length === 1 ? ' file' : ' files'), 3]
    ];
    if (police && police.checked) {
      rows.splice(5, 0, ['Police report', '#' + (reportNo.value || 'on file'), 2]);
    }
    rows.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'review-row';
      var k = document.createElement('dt');
      k.className = 'review-k';
      k.textContent = r[0];
      var wrap = document.createElement('dd');
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      var v = document.createElement('span');
      v.className = 'review-v';
      v.textContent = r[1];
      var edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'review-edit';
      edit.textContent = 'Edit';
      edit.addEventListener('click', function () { goTo(r[2]); });
      wrap.appendChild(v); wrap.appendChild(edit);
      row.appendChild(k); row.appendChild(wrap);
      review.appendChild(row);
    });
  }

  /* ---------- submit ---------- */
  function genClaimNo() {
    var yr = new Date().getFullYear();
    var n = Math.floor(100000 + Math.random() * 900000);
    return 'NW-CLM-' + yr + '-' + n;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(4)) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    setTimeout(function () {
      form.hidden = true;
      document.getElementById('steps').hidden = true;
      document.getElementById('claim-number').textContent = genClaimNo();
      confirmEl.hidden = false;
      confirmEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1100);
  });

  restartBtn.addEventListener('click', function () {
    form.reset();
    files = [];
    renderFiles();
    if (counter) counter.textContent = '0';
    if (reportNo) reportNo.hidden = true;
    form.querySelectorAll('.invalid').forEach(function (el) { el.classList.remove('invalid'); });
    document.querySelectorAll('.field-error').forEach(function (el) { el.hidden = true; });
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit claim';
    form.hidden = false;
    document.getElementById('steps').hidden = false;
    confirmEl.hidden = true;
    goTo(1);
  });

  /* init */
  render();
})();
