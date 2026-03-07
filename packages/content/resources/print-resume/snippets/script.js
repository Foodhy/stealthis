(function () {
  const printBtn = document.querySelector('.print-btn');
  if (!printBtn) return;

  const dlBtn = document.createElement('button');
  dlBtn.textContent = '\u2B07 Download HTML';
  dlBtn.className = 'print-btn';
  dlBtn.style.cssText = 'background:#fff;color:#4f46e5;border:1.5px solid #c7d2fe;margin-left:8px;';
  printBtn.after(dlBtn);

  dlBtn.addEventListener('click', function () {
    const styles = Array.from(document.querySelectorAll('style'))
      .map(function (s) { return s.textContent; })
      .join('\n');

    const bodyClone = document.body.cloneNode(true);
    bodyClone.querySelector('.screen-bar')?.remove();

    const html = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<meta charset="UTF-8">',
      '<title>Resume - Alex Rivera</title>',
      '<style>',
      styles,
      '.screen-bar{display:none!important;}',
      '</style>',
      '</head>',
      '<body>',
      bodyClone.innerHTML.trim(),
      '</body>',
      '</html>',
    ].join('\n');

    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resume-alex-rivera.html';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
      // browser default print
    }
  });
}());
