const search = document.getElementById('ksSearch');
const empty = document.getElementById('ksEmpty');
const emptyTerm = document.getElementById('ksEmptyTerm');

search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  let anyVisible = false;

  document.querySelectorAll('.ks-group').forEach(group => {
    let groupHasMatch = false;
    group.querySelectorAll('.ks-item').forEach(item => {
      const desc = item.querySelector('.ks-desc');
      const text = desc.textContent.toLowerCase();
      const match = !q || text.includes(q);
      item.classList.toggle('hidden', !match);
      if (match) {
        groupHasMatch = true;
        if (q) {
          // Highlight match
          const idx = text.indexOf(q);
          const raw = desc.textContent;
          desc.innerHTML = raw.slice(0, idx) + `<mark>${raw.slice(idx, idx + q.length)}</mark>` + raw.slice(idx + q.length);
        } else {
          desc.textContent = desc.textContent;
        }
      }
    });
    group.classList.toggle('hidden', !groupHasMatch);
    if (groupHasMatch) anyVisible = true;
  });

  empty.hidden = anyVisible;
  emptyTerm.textContent = q;
});
