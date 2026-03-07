// Diff data: each item is [type, leftNum, rightNum, text]
// type: 'ctx' | 'add' | 'del' | 'hunk'
const DIFF = [
  ['hunk', null, null, '@@ -1,12 +1,16 @@'],
  ['ctx',  1,  1, 'import { SignJWT, jwtVerify } from "jose";'],
  ['ctx',  2,  2, 'import { cookies } from "next/headers";'],
  ['ctx',  3,  3, ''],
  ['del',  4, null, 'const SECRET = process.env.SECRET;'],
  ['add', null,  4, 'const SECRET = new TextEncoder().encode('],
  ['add', null,  5, '  process.env.SECRET ?? ""'],
  ['add', null,  6, ');'],
  ['ctx',  5,  7, ''],
  ['del',  6, null, 'export async function createToken(payload) {'],
  ['add', null,  8, 'export async function createToken('],
  ['add', null,  9, '  payload: Record<string, unknown>'],
  ['add', null, 10, ') {'],
  ['ctx',  7, 11, '  return new SignJWT(payload)'],
  ['ctx',  8, 12, '    .setProtectedHeader({ alg: "HS256" })'],
  ['ctx',  9, 13, '    .setExpirationTime("7d")'],
  ['del', 10, null, '    .sign(Buffer.from(SECRET));'],
  ['add', null, 14, '    .sign(SECRET);'],
  ['ctx', 11, 15, '}'],
  ['ctx', 12, 16, ''],
];

function makeLine(type, num, text) {
  const sigMap = { add: '+', del: '-', ctx: ' ', hunk: '@@' };
  const line = document.createElement('div');
  line.className = 'diff-line' + (type !== 'ctx' ? ` diff-line--${type}` : '');
  line.innerHTML = `
    <span class="diff-line-num">${num ?? ''}</span>
    <span class="diff-line-sig">${sigMap[type] ?? ''}</span>
    <span class="diff-line-text">${escHtml(text)}</span>
  `;
  return line;
}

function makeEmpty() {
  const line = document.createElement('div');
  line.className = 'diff-line diff-line--empty';
  line.innerHTML = `<span class="diff-line-num"></span><span class="diff-line-sig"></span><span class="diff-line-text">~</span>`;
  return line;
}

function escHtml(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderSplit() {
  const left = document.getElementById('leftPane');
  const right = document.getElementById('rightPane');
  left.innerHTML = ''; right.innerHTML = '';

  for (const [type, ln, rn, text] of DIFF) {
    if (type === 'hunk') {
      left.appendChild(makeLine('hunk', '...', text));
      right.appendChild(makeLine('hunk', '...', text));
    } else if (type === 'del') {
      left.appendChild(makeLine('del', ln, text));
      right.appendChild(makeEmpty());
    } else if (type === 'add') {
      left.appendChild(makeEmpty());
      right.appendChild(makeLine('add', rn, text));
    } else {
      left.appendChild(makeLine('ctx', ln, text));
      right.appendChild(makeLine('ctx', rn, text));
    }
  }
}

function renderUnified() {
  const pane = document.getElementById('unifiedPane');
  pane.innerHTML = '';
  for (const [type, ln, rn, text] of DIFF) {
    pane.appendChild(makeLine(type, type === 'del' ? ln : (rn ?? ln), text));
  }
}

// View toggle
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const v = btn.dataset.view;
    document.getElementById('splitView').hidden = v !== 'split';
    document.getElementById('unifiedView').hidden = v !== 'unified';
  });
});

renderSplit();
renderUnified();
