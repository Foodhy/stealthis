/* ========================================
   Cocktail Builder — Script
   Phase 27 Restaurant Theme
   ======================================== */

'use strict';

// ── Data ─────────────────────────────────────────────────────────────────────

const SPIRITS = {
  gin:     { emoji: '🫙', color: '#a8d8b9', flavors: { sweet: 2, sour: 3, bitter: 4, strong: 4, fresh: 5 } },
  rum:     { emoji: '🍹', color: '#d4956a', flavors: { sweet: 5, sour: 2, bitter: 1, strong: 4, fresh: 2 } },
  tequila: { emoji: '🌵', color: '#f0c060', flavors: { sweet: 3, sour: 4, bitter: 2, strong: 5, fresh: 3 } },
  vodka:   { emoji: '🧊', color: '#b8d4e8', flavors: { sweet: 1, sour: 2, bitter: 1, strong: 4, fresh: 3 } },
  whiskey: { emoji: '🥃', color: '#c8843a', flavors: { sweet: 4, sour: 1, bitter: 4, strong: 5, fresh: 1 } },
  mezcal:  { emoji: '💨', color: '#8fad91', flavors: { sweet: 2, sour: 2, bitter: 5, strong: 5, fresh: 2 } },
};

const MIXER_LABELS = {
  'lime':          'Lime juice',
  'lemon':         'Lemon juice',
  'simple-syrup':  'Simple syrup',
  'agave':         'Agave syrup',
  'tonic':         'Tonic',
  'soda':          'Soda',
  'dry-vermouth':  'Dry vermouth',
  'sweet-vermouth':'Sweet vermouth',
  'ginger-beer':   'Ginger beer',
  'bitters':       'Bitters',
  'coconut':       'Coconut cream',
  'pineapple':     'Pineapple juice',
};

// Cocktail name resolution: spirit + up to 2 key mixers → name
// Entries checked top-to-bottom; first match wins.
const COCKTAIL_RULES = [
  // Gin combos
  { spirit: 'gin',     mixers: ['lime', 'tonic'],           name: 'Casa Tónica',         tagline: 'Crisp & botanical' },
  { spirit: 'gin',     mixers: ['dry-vermouth'],            name: 'Martini Casa',         tagline: 'Elegant & dry' },
  { spirit: 'gin',     mixers: ['lemon', 'simple-syrup'],   name: 'Tom Collins Verde',    tagline: 'Bright & refreshing' },
  { spirit: 'gin',     mixers: ['lime', 'ginger-beer'],     name: 'Buck del Jardín',      tagline: 'Spicy & herbal' },
  // Rum combos
  { spirit: 'rum',     mixers: ['coconut', 'pineapple'],    name: 'Colada del Mar',       tagline: 'Tropical & creamy' },
  { spirit: 'rum',     mixers: ['lime', 'simple-syrup'],    name: 'Daiquiri Suave',       tagline: 'Balanced & citrusy' },
  { spirit: 'rum',     mixers: ['lime', 'soda'],            name: 'Mojito Fresco',        tagline: 'Light & invigorating' },
  { spirit: 'rum',     mixers: ['ginger-beer', 'lime'],     name: 'Mule Caribeño',        tagline: 'Zesty & tropical' },
  // Tequila combos
  { spirit: 'tequila', mixers: ['lime', 'agave'],           name: 'Margarita Huerta',     tagline: 'Classic & vibrant' },
  { spirit: 'tequila', mixers: ['lime', 'simple-syrup'],    name: 'Margarita Clásica',    tagline: 'Tart & lively' },
  { spirit: 'tequila', mixers: ['ginger-beer'],             name: 'Burro Mexicano',       tagline: 'Bold & spicy' },
  { spirit: 'tequila', mixers: ['pineapple', 'coconut'],    name: 'Playa Escondida',      tagline: 'Tropical & sweet' },
  // Vodka combos
  { spirit: 'vodka',   mixers: ['lemon', 'soda'],           name: 'Spritz Blanco',        tagline: 'Light & effervescent' },
  { spirit: 'vodka',   mixers: ['lime', 'ginger-beer'],     name: 'Moscow Mule Rosa',     tagline: 'Crisp & spicy' },
  { spirit: 'vodka',   mixers: ['pineapple', 'coconut'],    name: 'Tropical Blanco',      tagline: 'Sweet & fruity' },
  { spirit: 'vodka',   mixers: ['lemon', 'simple-syrup'],   name: 'Lemon Drop Suave',     tagline: 'Tart & sweet' },
  // Whiskey combos
  { spirit: 'whiskey', mixers: ['bitters', 'simple-syrup'], name: 'Old Fashioned Suave',  tagline: 'Rich & complex' },
  { spirit: 'whiskey', mixers: ['sweet-vermouth', 'bitters'],name: 'Manhattan Reserve',   tagline: 'Bold & sophisticated' },
  { spirit: 'whiskey', mixers: ['lemon', 'simple-syrup'],   name: 'Whiskey Sour Artisan', tagline: 'Balanced & bright' },
  { spirit: 'whiskey', mixers: ['ginger-beer'],             name: 'Kentucky Mule',        tagline: 'Warm & spicy' },
  // Mezcal combos
  { spirit: 'mezcal',  mixers: ['lime', 'agave'],           name: 'Mezcal Sour',          tagline: 'Smoky & tangy' },
  { spirit: 'mezcal',  mixers: ['sweet-vermouth'],          name: 'Oaxacan Negroni',      tagline: 'Smoky & bitter' },
  { spirit: 'mezcal',  mixers: ['pineapple', 'lime'],       name: 'Tepache Ahumado',      tagline: 'Tropical & smoky' },
  { spirit: 'mezcal',  mixers: ['ginger-beer', 'lime'],     name: 'Burro Ahumado',        tagline: 'Fiery & complex' },
];

// Radar axes in order (maps to pentagon points)
const FLAVOR_KEYS = ['sweet', 'sour', 'bitter', 'strong', 'fresh'];

// Pentagon: 5 outer points, radius 80, center 100,100
// Angles start at top (-90°) and go clockwise
const RADAR_CENTER = { x: 100, y: 100 };
const RADAR_R = 80;
const PENTAGON_ANGLES = FLAVOR_KEYS.map((_, i) => ((-Math.PI / 2) + (2 * Math.PI * i) / 5));

// ── State ─────────────────────────────────────────────────────────────────────

let state = {
  spirit:  null,   // string key
  mixers:  [],     // array of string keys (max 3)
  garnish: 'none', // string key
};

// ── DOM refs ──────────────────────────────────────────────────────────────────

const spiritsGrid  = document.getElementById('spirits-grid');
const mixersGrid   = document.getElementById('mixers-grid');
const garnishGrid  = document.getElementById('garnish-grid');
const mixerCount   = document.getElementById('mixer-count');
const cocktailName = document.getElementById('cocktail-name');
const cocktailTag  = document.getElementById('cocktail-tagline');
const recipeSteps  = document.getElementById('recipe-steps');
const priceValue   = document.getElementById('price-value');
const ctaBtn       = document.getElementById('cta-btn');
const radarPoly    = document.getElementById('radar-poly');
const glassLiquid  = document.getElementById('glass-liquid');

// ── Utilities ─────────────────────────────────────────────────────────────────

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Convert a flavor score (0-5) to an SVG point on the radar.
 * axis: 0=Sweet (top), 1=Sour (right), 2=Bitter (bottom-right), 3=Strong (bottom-left), 4=Fresh (left)
 */
function flavorToPoint(score, axisIndex) {
  const t = clamp(score, 0, 5) / 5;
  const angle = PENTAGON_ANGLES[axisIndex];
  const r = t * RADAR_R;
  return {
    x: RADAR_CENTER.x + r * Math.cos(angle),
    y: RADAR_CENTER.y + r * Math.sin(angle),
  };
}

function pointsAttr(pts) {
  return pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

// ── Cocktail resolution ───────────────────────────────────────────────────────

function resolveCocktail() {
  if (!state.spirit) return null;

  const spritDef = SPIRITS[state.spirit];
  const mixers = state.mixers;

  // Check rules: spirit must match, and all rule.mixers must be present in state.mixers
  for (const rule of COCKTAIL_RULES) {
    if (rule.spirit !== state.spirit) continue;
    const allPresent = rule.mixers.every(m => mixers.includes(m));
    if (allPresent) return rule;
  }

  // Fallback
  const spiritLabel = state.spirit.charAt(0).toUpperCase() + state.spirit.slice(1);
  return {
    name: `${spiritLabel} Especial`,
    tagline: 'Your custom creation',
  };
}

/**
 * Blend spirit base flavors with mixer modifiers.
 */
function computeFlavors() {
  if (!state.spirit) return { sweet: 0, sour: 0, bitter: 0, strong: 0, fresh: 0 };

  const base = { ...SPIRITS[state.spirit].flavors };

  const MIXER_MODS = {
    'lime':           { sour: +1.5, fresh: +1 },
    'lemon':          { sour: +1.5, fresh: +0.5 },
    'simple-syrup':   { sweet: +2 },
    'agave':          { sweet: +1.5 },
    'tonic':          { bitter: +1, fresh: +0.5 },
    'soda':           { fresh: +1 },
    'dry-vermouth':   { bitter: +1, sour: +0.5 },
    'sweet-vermouth': { sweet: +1, bitter: +0.5 },
    'ginger-beer':    { sour: +0.5, fresh: +1.5, strong: +0.5 },
    'bitters':        { bitter: +2 },
    'coconut':        { sweet: +2, fresh: +0.5 },
    'pineapple':      { sweet: +1.5, sour: +0.5, fresh: +1 },
  };

  const result = { ...base };
  for (const m of state.mixers) {
    const mod = MIXER_MODS[m] || {};
    for (const [k, v] of Object.entries(mod)) {
      result[k] = (result[k] || 0) + v;
    }
  }

  // Clamp all to 0-5
  for (const k of FLAVOR_KEYS) {
    result[k] = clamp(result[k] || 0, 0, 5);
  }
  return result;
}

/**
 * Generate recipe steps based on current state.
 */
function buildRecipe() {
  if (!state.spirit) return [];

  const spiritLabel = SPIRITS[state.spirit].emoji + ' ' + (state.spirit.charAt(0).toUpperCase() + state.spirit.slice(1));
  const mixerCount = state.mixers.length;
  const steps = [];

  steps.push('Add ice to a cocktail shaker or glass.');
  steps.push(`Pour 2 oz ${spiritLabel} over the ice.`);

  if (mixerCount > 0) {
    const mixerNames = state.mixers.slice(0, 3).map(m => MIXER_LABELS[m] || m).join(', ');
    steps.push(`Add ${mixerNames} and stir well.`);
  } else {
    steps.push('Stir gently to chill.');
  }

  if (state.garnish !== 'none') {
    const garnishLabels = {
      'lime-wheel': 'lime wheel',
      'orange-twist': 'orange twist',
      'cherry': 'cherry',
      'mint': 'mint sprig',
      'salt-rim': 'salt rim',
    };
    steps.push(`Finish with a ${garnishLabels[state.garnish] || state.garnish} and serve.`);
  } else {
    steps.push('Strain into a chilled glass and serve immediately.');
  }

  return steps;
}

/**
 * Compute price: base $10 + $1 per mixer, capped at $18.
 */
function computePrice() {
  if (!state.spirit) return null;
  const base = 10;
  const perMixer = state.mixers.length;
  const low = clamp(base + perMixer, 10, 18);
  const high = clamp(low + 4, 12, 22);
  return `$${low} – $${high}`;
}

// ── Render ─────────────────────────────────────────────────────────────────────

function renderRadar(flavors) {
  const points = FLAVOR_KEYS.map((k, i) => flavorToPoint(flavors[k], i));
  radarPoly.setAttribute('points', pointsAttr(points));
}

function renderResult() {
  const cocktail = resolveCocktail();
  const flavors = computeFlavors();
  const steps = buildRecipe();
  const price = computePrice();

  // Name & tagline
  if (cocktail) {
    cocktailName.textContent = cocktail.name;
    cocktailTag.textContent = cocktail.tagline || '';
  } else {
    cocktailName.textContent = '—';
    cocktailTag.textContent = 'Select a spirit to begin';
  }

  // Glass liquid color
  if (state.spirit) {
    glassLiquid.setAttribute('fill', SPIRITS[state.spirit].color);
    glassLiquid.setAttribute('opacity', '0.55');
  } else {
    glassLiquid.setAttribute('fill', '#a8d8b9');
    glassLiquid.setAttribute('opacity', '0.2');
  }

  // Radar
  renderRadar(flavors);

  // Recipe steps
  if (steps.length) {
    recipeSteps.innerHTML = steps.map(s => `<li class="recipe-step">${s}</li>`).join('');
  } else {
    recipeSteps.innerHTML = '<li class="recipe-step muted">Select your ingredients to see the recipe</li>';
  }

  // Price
  priceValue.textContent = price || '—';

  // CTA
  ctaBtn.disabled = !state.spirit;
}

// ── Event handlers ────────────────────────────────────────────────────────────

// Spirit cards
spiritsGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.spirit-card');
  if (!card) return;
  const spirit = card.dataset.spirit;

  // Toggle off if already selected
  if (state.spirit === spirit) {
    state.spirit = null;
  } else {
    state.spirit = spirit;
  }

  // Update UI
  document.querySelectorAll('.spirit-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.spirit === state.spirit);
  });

  renderResult();
});

// Mixer chips
mixersGrid.addEventListener('click', (e) => {
  const chip = e.target.closest('.mixer-chip');
  if (!chip || chip.classList.contains('disabled')) return;
  const mixer = chip.dataset.mixer;

  if (state.mixers.includes(mixer)) {
    // Deselect
    state.mixers = state.mixers.filter(m => m !== mixer);
    chip.classList.remove('selected');
  } else if (state.mixers.length < 3) {
    // Select
    state.mixers.push(mixer);
    chip.classList.add('selected');
  }

  // Update disabled state for unselected chips
  const count = state.mixers.length;
  document.querySelectorAll('.mixer-chip').forEach(c => {
    const isSelected = state.mixers.includes(c.dataset.mixer);
    c.classList.toggle('disabled', count >= 3 && !isSelected);
  });

  mixerCount.textContent = `${count} / 3 selected`;
  renderResult();
});

// Garnish chips
garnishGrid.addEventListener('click', (e) => {
  const chip = e.target.closest('.garnish-chip');
  if (!chip) return;
  state.garnish = chip.dataset.garnish;

  document.querySelectorAll('.garnish-chip').forEach(c => {
    c.classList.toggle('selected', c.dataset.garnish === state.garnish);
  });

  renderResult();
});

// CTA Button
ctaBtn.addEventListener('click', () => {
  if (!state.spirit || ctaBtn.disabled) return;
  const cocktail = resolveCocktail();
  const name = cocktail ? cocktail.name : 'your cocktail';

  ctaBtn.textContent = 'Added!';
  ctaBtn.classList.add('added');

  setTimeout(() => {
    ctaBtn.textContent = 'Add to order';
    ctaBtn.classList.remove('added');
  }, 2000);
});

// ── Init ───────────────────────────────────────────────────────────────────────

// Set garnish "None" as default selected
const defaultGarnish = document.querySelector('.garnish-chip[data-garnish="none"]');
if (defaultGarnish) defaultGarnish.classList.add('selected');

// Initial render (empty state)
renderResult();
