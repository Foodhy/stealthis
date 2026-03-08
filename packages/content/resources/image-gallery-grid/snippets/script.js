const IMAGES = [
  { id: 1, src: 'https://picsum.photos/seed/forest1/600/800', category: 'nature', caption: 'Forest Path' },
  { id: 2, src: 'https://picsum.photos/seed/arch1/700/500', category: 'architecture', caption: 'Urban Lines' },
  { id: 3, src: 'https://picsum.photos/seed/abstract1/500/600', category: 'abstract', caption: 'Color Flow' },
  { id: 4, src: 'https://picsum.photos/seed/mountain1/600/400', category: 'nature', caption: 'Mountain View' },
  { id: 5, src: 'https://picsum.photos/seed/building1/500/700', category: 'architecture', caption: 'Glass Tower' },
  { id: 6, src: 'https://picsum.photos/seed/geo1/600/600', category: 'abstract', caption: 'Geometry' },
  { id: 7, src: 'https://picsum.photos/seed/lake1/700/450', category: 'nature', caption: 'Still Lake' },
  { id: 8, src: 'https://picsum.photos/seed/bridge1/600/400', category: 'architecture', caption: 'Steel Bridge' },
  { id: 9, src: 'https://picsum.photos/seed/pattern1/400/600', category: 'abstract', caption: 'Pattern Study' },
  { id: 10, src: 'https://picsum.photos/seed/canyon1/700/500', category: 'nature', caption: 'Canyon Walls' },
  { id: 11, src: 'https://picsum.photos/seed/skyline1/800/500', category: 'architecture', caption: 'City Skyline' },
  { id: 12, src: 'https://picsum.photos/seed/texture1/500/500', category: 'abstract', caption: 'Texture' },
];

let activeFilter = 'all';
let lightboxIndex = 0;
let visibleImages = [...IMAGES];

function getVisibleIndex(img) {
  let idx = visibleImages.indexOf(img);
  if (idx >= 0) return idx;
  return visibleImages.findIndex((i) => i.id === img.id);
}

function buildGrid() {
  const grid = document.getElementById('galleryGrid');
  const countEl = document.getElementById('galleryCount');
  if (!grid || !countEl) return;

  grid.innerHTML = '';
  visibleImages = IMAGES.filter((img) => activeFilter === 'all' || img.category === activeFilter);
  countEl.textContent = `${visibleImages.length} photos`;

  IMAGES.forEach((img) => {
    const item = document.createElement('div');
    item.className = 'gallery-item' + (activeFilter !== 'all' && img.category !== activeFilter ? ' hidden' : '');
    item.dataset.id = img.id;

    const el = document.createElement('img');
    el.src = img.src;
    el.alt = img.caption;
    el.loading = 'lazy';

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    const cap = document.createElement('span');
    cap.className = 'gallery-caption';
    cap.textContent = img.caption;
    overlay.appendChild(cap);

    item.appendChild(el);
    item.appendChild(overlay);
    item.addEventListener('click', () => {
      const idx = getVisibleIndex(img);
      if (idx >= 0) openLightbox(idx);
    });
    grid.appendChild(item);
  });
}

function openLightbox(index) {
  if (index < 0 || index >= visibleImages.length) return;
  lightboxIndex = index;
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.hidden = false;
  updateLightbox();
}

function updateLightbox() {
  const img = visibleImages[lightboxIndex];
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbCounter = document.getElementById('lbCounter');
  if (!img || !lbImg) return;
  lbImg.src = img.src;
  lbImg.alt = img.caption;
  lbImg.loading = 'eager';
  if (lbCaption) lbCaption.textContent = img.caption;
  if (lbCounter) lbCounter.textContent = `${lightboxIndex + 1} / ${visibleImages.length}`;
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.hidden = true;
}

function init() {
  const lb = document.getElementById('lightbox');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const galleryFilters = document.getElementById('galleryFilters');

  if (lbClose) {
    lbClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeLightbox();
    });
  }

  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLightbox();
    });
  }

  if (lbPrev) {
    lbPrev.addEventListener('click', () => {
      lightboxIndex = (lightboxIndex - 1 + visibleImages.length) % visibleImages.length;
      updateLightbox();
    });
  }

  if (lbNext) {
    lbNext.addEventListener('click', () => {
      lightboxIndex = (lightboxIndex + 1) % visibleImages.length;
      updateLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (lb?.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      lightboxIndex = (lightboxIndex - 1 + visibleImages.length) % visibleImages.length;
      updateLightbox();
    }
    if (e.key === 'ArrowRight') {
      lightboxIndex = (lightboxIndex + 1) % visibleImages.length;
      updateLightbox();
    }
  });

  if (galleryFilters) {
    galleryFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.gf-btn');
      if (!btn) return;
      document.querySelectorAll('.gf-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      buildGrid();
    });
  }

  buildGrid();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
