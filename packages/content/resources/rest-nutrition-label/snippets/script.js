/* ── Dish data ───────────────────────────────────────────── */
const DISHES = [
  {
    name: 'Grilled Salmon Fillet',
    cal: 420,
    protein: 46,
    carbs: 8,
    fat: 22,
    satfat: 5,
    sodium: 390,
    fiber: 1,
    sugar: 2,
    cholesterol: 115,
    vitamins: { vitd: 16.4, calcium: 28, iron: 1.8 },
    allergens: ['fish', 'soy', 'sesame']
  },
  {
    name: 'Truffle Pasta Carbonara',
    cal: 680,
    protein: 24,
    carbs: 78,
    fat: 29,
    satfat: 12,
    sodium: 720,
    fiber: 3,
    sugar: 4,
    cholesterol: 185,
    vitamins: { vitd: 1.2, calcium: 142, iron: 2.9 },
    allergens: ['gluten', 'eggs', 'dairy', 'sulphites']
  },
  {
    name: 'Wagyu Beef Burger',
    cal: 820,
    protein: 52,
    carbs: 48,
    fat: 44,
    satfat: 18,
    sodium: 980,
    fiber: 2,
    sugar: 8,
    cholesterol: 220,
    vitamins: { vitd: 0.8, calcium: 210, iron: 5.4 },
    allergens: ['gluten', 'dairy', 'mustard', 'eggs']
  },
  {
    name: 'Garden Harvest Bowl',
    cal: 340,
    protein: 14,
    carbs: 52,
    fat: 10,
    satfat: 1.5,
    sodium: 310,
    fiber: 9,
    sugar: 11,
    cholesterol: 0,
    vitamins: { vitd: 0.4, calcium: 96, iron: 4.2 },
    allergens: ['tree nuts', 'sesame']
  }
];

/* ── Allergen emoji map ──────────────────────────────────── */
const ALLERGEN_EMOJI = {
  'gluten':     '🌾',
  'dairy':      '🧀',
  'eggs':       '🥚',
  'fish':       '🐟',
  'soy':        '🫘',
  'tree nuts':  '🌰',
  'sesame':     '🌿',
  'mustard':    '🌼',
  'sulphites':  '🍷'
};

/* ── State ───────────────────────────────────────────────── */
let currentDish = DISHES[0];
let servings = 1;

/* ── DOM refs ────────────────────────────────────────────── */
const dishSelect      = document.getElementById('dish-select');
const btnMinus        = document.getElementById('btn-minus');
const btnPlus         = document.getElementById('btn-plus');
const servingDisplay  = document.getElementById('serving-display');
const calDisplay      = document.getElementById('cal-display');
const calSub          = document.getElementById('cal-sub');
const barProtein      = document.getElementById('bar-protein');
const barCarbs        = document.getElementById('bar-carbs');
const barFat          = document.getElementById('bar-fat');
const gramsProtein    = document.getElementById('grams-protein');
const gramsCarbs      = document.getElementById('grams-carbs');
const gramsFat        = document.getElementById('grams-fat');
const allergenChips   = document.getElementById('allergen-chips');

const ntFat     = document.getElementById('nt-fat');
const ntSatFat  = document.getElementById('nt-satfat');
const ntChol    = document.getElementById('nt-chol');
const ntSodium  = document.getElementById('nt-sodium');
const ntCarbs   = document.getElementById('nt-carbs');
const ntFiber   = document.getElementById('nt-fiber');
const ntSugar   = document.getElementById('nt-sugar');
const ntProtein = document.getElementById('nt-protein');
const ntVitD    = document.getElementById('nt-vitd');
const ntCalcium = document.getElementById('nt-calcium');
const ntIron    = document.getElementById('nt-iron');

/* ── Helpers ─────────────────────────────────────────────── */
function scale(val) {
  return Math.round(val * servings * 10) / 10;
}

function scaleInt(val) {
  return Math.round(val * servings);
}

/* ── Render ──────────────────────────────────────────────── */
function render() {
  const d = currentDish;

  /* Serving display */
  servingDisplay.textContent = servings;
  btnMinus.disabled = servings <= 1;
  btnPlus.disabled  = servings >= 4;
  btnMinus.style.opacity = servings <= 1 ? '0.35' : '1';
  btnPlus.style.opacity  = servings >= 4 ? '0.35' : '1';

  /* Calories */
  calDisplay.textContent = scaleInt(d.cal);
  calSub.textContent = servings === 1
    ? `per 1 serving (${d.name})`
    : `for ${servings} servings (${d.name})`;

  /* Macro bars — percentages relative to total macro grams */
  const totalMacroG = d.protein + d.carbs + d.fat;
  const pctProtein  = totalMacroG > 0 ? (d.protein / totalMacroG) * 100 : 0;
  const pctCarbs    = totalMacroG > 0 ? (d.carbs   / totalMacroG) * 100 : 0;
  const pctFat      = totalMacroG > 0 ? (d.fat     / totalMacroG) * 100 : 0;

  barProtein.style.width = pctProtein.toFixed(1) + '%';
  barCarbs.style.width   = pctCarbs.toFixed(1)   + '%';
  barFat.style.width     = pctFat.toFixed(1)     + '%';

  gramsProtein.textContent = scale(d.protein) + 'g';
  gramsCarbs.textContent   = scale(d.carbs)   + 'g';
  gramsFat.textContent     = scale(d.fat)     + 'g';

  /* Nutrient table */
  ntFat.textContent     = scale(d.fat)     + 'g';
  ntSatFat.textContent  = scale(d.satfat)  + 'g';
  ntChol.textContent    = scaleInt(d.cholesterol) + 'mg';
  ntSodium.textContent  = scaleInt(d.sodium)      + 'mg';
  ntCarbs.textContent   = scale(d.carbs)   + 'g';
  ntFiber.textContent   = scale(d.fiber)   + 'g';
  ntSugar.textContent   = scale(d.sugar)   + 'g';
  ntProtein.textContent = scale(d.protein) + 'g';

  ntVitD.textContent    = (Math.round(d.vitamins.vitd * servings * 10) / 10) + 'mcg';
  ntCalcium.textContent = scaleInt(d.vitamins.calcium) + 'mg';
  ntIron.textContent    = (Math.round(d.vitamins.iron * servings * 10) / 10) + 'mg';

  /* Allergen chips */
  if (d.allergens.length === 0) {
    allergenChips.innerHTML = '<span class="allergen-none">None declared</span>';
  } else {
    allergenChips.innerHTML = d.allergens.map(a => {
      const emoji = ALLERGEN_EMOJI[a] || '⚠️';
      const label = a.charAt(0).toUpperCase() + a.slice(1);
      return `<span class="allergen-chip">${emoji} ${label}</span>`;
    }).join('');
  }
}

/* ── Event listeners ─────────────────────────────────────── */
dishSelect.addEventListener('change', () => {
  currentDish = DISHES[+dishSelect.value];
  servings = 1;
  render();
});

btnMinus.addEventListener('click', () => {
  if (servings > 1) { servings--; render(); }
});

btnPlus.addEventListener('click', () => {
  if (servings < 4) { servings++; render(); }
});

/* ── Initial render ──────────────────────────────────────── */
render();
