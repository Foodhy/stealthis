// Ellipsis expand button
const ellipsisBtn = document.getElementById('bc-ellipsis-btn');
const collapsed   = document.getElementById('bc-collapsed');

ellipsisBtn?.addEventListener('click', () => {
  document.querySelectorAll('.bc-item--hidden').forEach(el => el.classList.add('revealed'));
  collapsed?.classList.add('hidden');
});

// JSON-LD BreadcrumbList structured data
function injectBreadcrumbSchema(navEl) {
  const links = navEl.querySelectorAll('[data-href]');
  const current = navEl.querySelector('[aria-current="page"]');
  const items = [];

  links.forEach((link, i) => {
    items.push({
      '@type': 'ListItem',
      position: i + 1,
      name: link.textContent.trim() || 'Home',
      item: window.location.origin + link.dataset.href
    });
  });

  if (current) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: current.textContent.trim()
    });
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  });
  document.head.appendChild(script);
}

document.querySelectorAll('[aria-label="Breadcrumb"]').forEach(injectBreadcrumbSchema);
