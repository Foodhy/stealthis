// Minimal regex tokenizer
function tokenize(code, lang) {
  const rules = [
    { cls: 'tok-cmt',  re: /\/\/[^\n]*/g },
    { cls: 'tok-str',  re: /(['"`])(?:(?!\1)[^\\]|\\.)*\1/g },
    { cls: 'tok-kw',   re: /\b(async|await|function|return|const|let|var|if|else|throw|new|import|export|interface|type|extends|implements|class|for|of|in)\b/g },
    { cls: 'tok-type', re: /\b(Promise|Error|string|number|boolean|void|null|undefined|User)\b/g },
    { cls: 'tok-fn',   re: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g },
    { cls: 'tok-num',  re: /\b\d+(\.\d+)?\b/g },
  ];

  // Escape HTML first
  let safe = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const tokens = [];
  for (const { cls, re } of rules) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(safe)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, cls, text: m[0] });
    }
  }

  // Sort and remove overlaps (keep first)
  tokens.sort((a, b) => a.start - b.start);
  const used = tokens.filter((t, i) => i === 0 || t.start >= tokens[i - 1].end);

  // Reconstruct
  let result = '';
  let cursor = 0;
  for (const { start, end, cls, text } of used) {
    result += safe.slice(cursor, start);
    result += `<span class="${cls}">${text}</span>`;
    cursor = end;
  }
  result += safe.slice(cursor);
  return result;
}

function renderBlock(block) {
  const codeEl = block.querySelector('.code-body');
  const raw = codeEl.dataset.raw || '';
  const highlight = new Set((codeEl.dataset.highlight || '').split(',').map(n => parseInt(n)).filter(Boolean));
  const lang = block.dataset.language || '';
  const showLines = block.classList.contains('code-block--lines') || highlight.size > 0;
  const highlighted = tokenize(raw, lang);
  const lines = highlighted.split('\n');

  if (showLines) {
    block.querySelector('.code-pre').style.padding = '8px 0';
    codeEl.innerHTML = lines.map((line, i) => {
      const num = i + 1;
      const isHL = highlight.has(num);
      return `<span class="code-line${isHL ? ' code-line--highlight' : ''}">` +
        `<span class="code-line-num">${num}</span>` +
        `<span class="code-line-text">${line}</span>` +
        `</span>`;
    }).join('\n');
  } else {
    codeEl.innerHTML = highlighted;
  }
}

// Copy button
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const block = btn.closest('.code-block');
    const raw = block.querySelector('.code-body').dataset.raw || '';
    navigator.clipboard.writeText(raw).then(() => {
      btn.classList.add('copied');
      btn.querySelector('.copy-label').textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.querySelector('.copy-label').textContent = 'Copy';
      }, 2000);
    });
  });
});

document.querySelectorAll('.code-block').forEach(renderBlock);
