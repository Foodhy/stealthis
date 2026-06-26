(function () {
  'use strict';

  var PROJECTS = [
    {
      id: 'cedar-hollow',
      name: 'Cedar Hollow Residence',
      type: 'Custom Home',
      category: 'residential',
      location: 'Bainbridge Island, WA',
      year: 2024,
      tall: true,
      grad: 'linear-gradient(135deg, #3a4a5c, #1b222b)',
      scope: 'New build, 4,200 sq ft',
      value: '$1.9M',
      duration: '14 months',
      desc: 'A timber-and-glass waterfront home with exposed Douglas fir beams, radiant-floor heating and a cantilevered deck overlooking Puget Sound.'
    },
    {
      id: 'harbor-point',
      name: 'Harbor Point Office Tower',
      type: 'Commercial',
      category: 'commercial',
      location: 'Tacoma, WA',
      year: 2023,
      tall: false,
      grad: 'linear-gradient(135deg, #2b3440, #4a5562)',
      scope: 'Ground-up, 7 storeys',
      value: '$24.6M',
      duration: '26 months',
      desc: 'A Class-A office tower with steel-frame construction, a curtain-wall facade and two levels of underground structured parking.'
    },
    {
      id: 'maple-street',
      name: 'Maple Street Brownstone',
      type: 'Gut Renovation',
      category: 'renovation',
      location: 'Portland, OR',
      year: 2024,
      tall: false,
      grad: 'linear-gradient(135deg, #7a5c3a, #3d2f1e)',
      scope: 'Full interior rebuild',
      value: '$640K',
      duration: '9 months',
      desc: 'A 1912 brownstone taken back to the studs — new electrical, plumbing and structural reinforcement while preserving the original brick and millwork.'
    },
    {
      id: 'ridgeline',
      name: 'Ridgeline Townhomes',
      type: 'Multi-Family',
      category: 'residential',
      location: 'Bellevue, WA',
      year: 2022,
      tall: true,
      grad: 'linear-gradient(135deg, #4a5562, #2b3440)',
      scope: '12 units, 3 buildings',
      value: '$8.3M',
      duration: '18 months',
      desc: 'A cluster of modern townhomes with rooftop terraces, shared courtyards and pre-wired EV charging in every garage.'
    },
    {
      id: 'foundry-market',
      name: 'The Foundry Market Hall',
      type: 'Adaptive Reuse',
      category: 'commercial',
      location: 'Spokane, WA',
      year: 2023,
      tall: false,
      grad: 'linear-gradient(135deg, #e8642a, #8a3414)',
      scope: 'Warehouse conversion',
      value: '$5.1M',
      duration: '15 months',
      desc: 'A 1940s iron foundry reborn as a food hall — new mezzanine, kitchen infrastructure for 18 vendors and seismic retrofit of the masonry shell.'
    },
    {
      id: 'lakeside-kitchen',
      name: 'Lakeside Kitchen Remodel',
      type: 'Renovation',
      category: 'renovation',
      location: 'Coeur d’Alene, ID',
      year: 2025,
      tall: false,
      grad: 'linear-gradient(135deg, #5c6b5a, #2e3a2c)',
      scope: 'Kitchen + great room',
      value: '$185K',
      duration: '4 months',
      desc: 'Wall removal to open a galley kitchen into the great room, with a new structural beam, quartz island and floor-to-ceiling pantry.'
    },
    {
      id: 'summit-clinic',
      name: 'Summit Medical Clinic',
      type: 'Commercial',
      category: 'commercial',
      location: 'Eugene, OR',
      year: 2024,
      tall: true,
      grad: 'linear-gradient(135deg, #3a5c5c, #1e3434)',
      scope: 'Tenant build-out',
      value: '$3.7M',
      duration: '11 months',
      desc: 'A two-floor outpatient clinic fit-out with lead-lined imaging rooms, medical-gas lines and a glass-walled reception atrium.'
    },
    {
      id: 'orchard-farmhouse',
      name: 'Orchard Lane Farmhouse',
      type: 'Custom Home',
      category: 'residential',
      location: 'Hood River, OR',
      year: 2025,
      tall: false,
      grad: 'linear-gradient(135deg, #6b5c3a, #3a3020)',
      scope: 'New build, 3,100 sq ft',
      value: '$1.3M',
      duration: '12 months',
      desc: 'A modern farmhouse with board-and-batten siding, a wraparound porch and a detached three-bay workshop on a five-acre orchard.'
    }
  ];

  var grid = document.getElementById('grid');
  var count = document.getElementById('count');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var lightbox = document.getElementById('lightbox');
  var lbClose = document.getElementById('lbClose');
  var lastFocused = null;
  var activeFilter = 'all';

  function spanFor(p) {
    // approximate masonry row span: 19 base rows, 8 extra for tall cards
    return p.tall ? 27 : 19;
  }

  function render(filter) {
    grid.innerHTML = '';
    var shown = PROJECTS.filter(function (p) {
      return filter === 'all' || p.category === filter;
    });

    if (!shown.length) {
      var empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'No projects in this category yet.';
      grid.appendChild(empty);
    }

    shown.forEach(function (p) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'card' + (p.tall ? ' card--tall' : '');
      card.style.gridRowEnd = 'span ' + spanFor(p);
      card.setAttribute('aria-label', p.name + ', ' + p.type + ', ' + p.location + ', ' + p.year);
      card.innerHTML =
        '<span class="card__media" style="background:' + p.grad + '">' +
        '<span class="card__type">' + p.type + '</span>' +
        '<span class="card__placeholder">' + p.name + '</span>' +
        '</span>' +
        '<span class="card__body">' +
        '<span class="card__title" style="display:block">' + p.name + '</span>' +
        '<span class="card__meta">' + p.location +
        ' <span class="card__dot">&bull;</span> ' +
        '<span class="card__year">' + p.year + '</span></span>' +
        '</span>';
      card.addEventListener('click', function () {
        openLightbox(p);
      });
      grid.appendChild(card);
    });

    var n = shown.length;
    count.textContent = n + (n === 1 ? ' project' : ' projects');
  }

  function setFilter(filter, btn) {
    activeFilter = filter;
    chips.forEach(function (c) {
      var on = c === btn;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    render(filter);
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      setFilter(c.getAttribute('data-filter'), c);
    });
  });

  // ---------- Lightbox ----------
  function openLightbox(p) {
    lastFocused = document.activeElement;
    document.getElementById('lbHero').style.background = p.grad;
    document.getElementById('lbType').textContent = p.type;
    document.getElementById('lbLabel').textContent = p.name;
    document.getElementById('lb-title').textContent = p.name;
    document.getElementById('lbMeta').textContent = p.location + '  ·  Completed ' + p.year;
    document.getElementById('lbDesc').textContent = p.desc;

    var specs = document.getElementById('lbSpecs');
    specs.innerHTML =
      '<div><dt>Scope</dt><dd>' + p.scope + '</dd></div>' +
      '<div><dt>Contract Value</dt><dd>' + p.value + '</dd></div>' +
      '<div><dt>Duration</dt><dd>' + p.duration + '</dd></div>' +
      '<div><dt>Category</dt><dd style="text-transform:capitalize">' + p.category + '</dd></div>';

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  lightbox.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) {
      closeLightbox();
    }
  });

  render('all');
})();
