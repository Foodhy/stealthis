const DISHES = [
  {
    id: "burrata",
    section: "Entradas",
    name: "Burrata huerta",
    price: 16,
    kind: "Heirloom tomato · garden basil",
  },
  {
    id: "pulpo",
    section: "Entradas",
    name: "Pulpo a la brasa",
    price: 19,
    kind: "Charred octopus · paprika potato",
  },
  {
    id: "ribeye",
    section: "Principales",
    name: "Ribeye 14oz",
    price: 48,
    kind: "Dry-aged 28 days · marrow butter",
  },
  {
    id: "branzino",
    section: "Principales",
    name: "Branzino entero",
    price: 38,
    kind: "Whole sea bass · fennel",
  },
  {
    id: "risotto",
    section: "Principales",
    name: "Risotto hongos",
    price: 26,
    kind: "Wild mushroom · parmesan",
  },
  {
    id: "pappardelle",
    section: "Pasta",
    name: "Pappardelle ragú",
    price: 24,
    kind: "Lamb shoulder · gremolata",
  },
  {
    id: "tarta",
    section: "Postres",
    name: "Tarta de queso quemada",
    price: 11,
    kind: "Burnt cheesecake · caramel",
  },
  {
    id: "olive",
    section: "Postres",
    name: "Olive oil cake",
    price: 10,
    kind: "Citrus · crème fraîche",
  },
];

const PAIRINGS = {
  burrata: [
    {
      name: "Albariño Pazo Señorans",
      region: "Rías Baixas · Albariño · 2023",
      color: "white",
      conf: 3,
      glass: 11,
      bottle: 48,
      notes:
        "Saline, lemon-zest acidity to cut the cream of the burrata. The natural minerality reads almost like crushed shell.",
      why: "Burrata's richness needs acid to stay light — Albariño's salty edge is the classic move.",
    },
    {
      name: "Vermut casa",
      region: "Madrid · House · on tap",
      color: "rose",
      conf: 2,
      glass: 9,
      bottle: 0,
      notes: "Aromatic, slightly bitter herbs lift the basil. Pour with ice and an orange peel.",
      why: "If you want something more aperitif than wine — vermut is built for tomato dishes.",
    },
    {
      name: "Rosé d'Anjou natural",
      region: "Loire · Cabernet Franc · 2022",
      color: "rose",
      conf: 2,
      glass: 13,
      bottle: 56,
      notes:
        "Light strawberry, a little CO2 spritz, very low intervention. Works because it isn't sweet.",
      why: "Rosé pairs by colour with summer tomato — the natural style stays bright.",
    },
  ],
  pulpo: [
    {
      name: "Mencía Adega Algueira",
      region: "Ribeira Sacra · Mencía · 2022",
      color: "red",
      conf: 3,
      glass: 12,
      bottle: 54,
      notes: "Smoky, herbal, light tannin — mirrors the paprika and char on the octopus.",
      why: "Galician red with grilled Galician seafood — regional pairing, hard to miss.",
    },
    {
      name: "Manzanilla en rama",
      region: "Sanlúcar · Palomino · NV",
      color: "white",
      conf: 3,
      glass: 10,
      bottle: 38,
      notes: "Briny, almond, bone-dry. Drinks like the sea looks.",
      why: "The classic sherry pairing for grilled seafood — bypasses the paprika problem.",
    },
    {
      name: "Godello Valdesil",
      region: "Valdeorras · Godello · 2023",
      color: "white",
      conf: 2,
      glass: 13,
      bottle: 56,
      notes: "Stone fruit, gentle texture. Less sharp than Albariño, more weight.",
      why: "When you want a white but the dish has a meatier handle than fish would.",
    },
  ],
  ribeye: [
    {
      name: "Mencía 'Ácrata'",
      region: "Bierzo · Mencía · 2020",
      color: "red",
      conf: 3,
      glass: 16,
      bottle: 78,
      notes: "Bramble fruit, cracked pepper, fine-grain tannin. Built to stand up to dry-age fat.",
      why: "Old-vine Mencía has the tannin of a Bordeaux without the heaviness — perfect for a ribeye.",
    },
    {
      name: "Ribera del Duero 'Pago de los Capellanes'",
      region: "Castilla y León · Tempranillo · 2019",
      color: "red",
      conf: 3,
      glass: 22,
      bottle: 110,
      notes: "Black cherry, leather, gentle oak. Plush mid-palate, long finish.",
      why: "Classic Spanish steak wine — the oak gives the bone-marrow butter a place to land.",
    },
    {
      name: "Châteauneuf-du-Pape",
      region: "S. Rhône · GSM blend · 2018",
      color: "red",
      conf: 2,
      glass: 24,
      bottle: 124,
      notes: "Garrigue, ripe plum, savoury heat. A bigger pour for a richer eat.",
      why: "When the cut is dry-aged 28+ days, a wine with herb notes lifts the funk.",
    },
  ],
  branzino: [
    {
      name: "Albariño Pazo Señorans",
      region: "Rías Baixas · Albariño · 2023",
      color: "white",
      conf: 3,
      glass: 11,
      bottle: 48,
      notes: "Bright lemon, salty finish. Pulls the preserved-lemon up.",
      why: "When the fish is whole and roasted, you need acid and salt — Albariño checks both.",
    },
    {
      name: "Vermentino di Sardegna",
      region: "Sardegna · Vermentino · 2022",
      color: "white",
      conf: 2,
      glass: 13,
      bottle: 56,
      notes: "Herbal, almond, slight bitter twist. The fennel loves this.",
      why: "Vermentino was bred for sea-bass — the bitterness echoes the fennel.",
    },
    {
      name: "Manzanilla en rama",
      region: "Sanlúcar · Palomino · NV",
      color: "white",
      conf: 3,
      glass: 10,
      bottle: 38,
      notes: "Saline, walnut, dry. Same logic as oysters and white burgundy.",
      why: "Sherry under-promises and over-delivers with whole roasted fish.",
    },
  ],
  risotto: [
    {
      name: "Nebbiolo d'Alba",
      region: "Piemonte · Nebbiolo · 2021",
      color: "red",
      conf: 3,
      glass: 14,
      bottle: 64,
      notes: "Rose, tar, high acid. Surprisingly light tannins for the body.",
      why: "Mushroom and Nebbiolo is one of the oldest pairings in the book — earth + earth.",
    },
    {
      name: "Côtes du Jura · Chardonnay",
      region: "Jura · Chardonnay · 2021",
      color: "white",
      conf: 2,
      glass: 16,
      bottle: 78,
      notes: "Nutty, slightly oxidative, walnut. Reads almost like dry sherry.",
      why: "If you don't want red, this Jura white drinks like a Burgundy with a sense of humour.",
    },
    {
      name: "Trousseau natural",
      region: "Jura · Trousseau · 2022",
      color: "rose",
      conf: 2,
      glass: 15,
      bottle: 68,
      notes: "Light red, cherry, almost rosé in body. Chill it slightly.",
      why: "Wild mushroom + chilled light red is one of those 'why does this work' pairings.",
    },
  ],
  pappardelle: [
    {
      name: "Chianti Classico Riserva",
      region: "Toscana · Sangiovese · 2019",
      color: "red",
      conf: 3,
      glass: 14,
      bottle: 64,
      notes: "Cherry, dried herb, gripping acidity. Cuts the lamb fat clean.",
      why: "Slow-cooked lamb ragú is the Sangiovese of pasta — they were made for each other.",
    },
    {
      name: "Rioja Reserva",
      region: "Rioja · Tempranillo · 2017",
      color: "red",
      conf: 2,
      glass: 13,
      bottle: 58,
      notes: "Vanilla oak, plum, leather. Comforting without being heavy.",
      why: "A safe second choice that pleases most diners at the table.",
    },
    {
      name: "Cesanese del Piglio",
      region: "Lazio · Cesanese · 2021",
      color: "red",
      conf: 2,
      glass: 12,
      bottle: 54,
      notes: "Spicy, brambly, a little wild. Native Lazio grape — drink it with Roman food.",
      why: "If the table likes 'Italian wine, off the beaten path' — this is the play.",
    },
  ],
  tarta: [
    {
      name: "PX Don PX 'Convento'",
      region: "Montilla-Moriles · PX · 2008",
      color: "red",
      conf: 3,
      glass: 9,
      bottle: 0,
      notes: "Raisin, espresso, dark caramel. Sweeter than the dessert.",
      why: "Burnt cheesecake's caramelised top wants something with equal weight — PX overpowers gracefully.",
    },
    {
      name: "Moscato d'Asti",
      region: "Piemonte · Moscato · 2023",
      color: "spark",
      conf: 2,
      glass: 10,
      bottle: 38,
      notes: "Lightly sparkling, peach, low alcohol. Reset between bites.",
      why: "If PX feels like too much, Moscato gives palate cleansing with sweet support.",
    },
    {
      name: "Tokaji 5 puttonyos",
      region: "Hungary · Furmint · 2017",
      color: "white",
      conf: 2,
      glass: 14,
      bottle: 78,
      notes: "Honey, apricot, balancing acidity. A more refined dessert match.",
      why: "When you want elegance with the cheesecake instead of comfort — Tokaji walks the line.",
    },
  ],
  olive: [
    {
      name: "Moscato d'Asti",
      region: "Piemonte · Moscato · 2023",
      color: "spark",
      conf: 3,
      glass: 10,
      bottle: 38,
      notes: "Peach blossom, light fizz, gentle sweetness — same energy as the cake.",
      why: "Citrus oil cake calls for something effervescent that won't bury the orange.",
    },
    {
      name: "Recioto della Valpolicella",
      region: "Veneto · Corvina · 2018",
      color: "red",
      conf: 2,
      glass: 14,
      bottle: 78,
      notes: "Cherry preserve, light raisin sweetness. A red for dessert.",
      why: "Veneto's traditional dessert red — pairs better with cake than people expect.",
    },
    {
      name: "Sherry · Cream",
      region: "Jerez · Palomino/PX · NV",
      color: "white",
      conf: 2,
      glass: 8,
      bottle: 32,
      notes: "Sweet, nutty, low alcohol. Spanish dessert classic.",
      why: "If the rest of the table is having coffee, this gives the cake-eater something.",
    },
  ],
};

const dishList = document.getElementById("dishList");
const dishTitle = document.getElementById("dishTitle");
const dishMeta = document.getElementById("dishMeta");
const pairs = document.getElementById("pairings");
const toast = document.getElementById("toast");

let activeId = "ribeye";

function renderDishes() {
  let lastSection = "";
  dishList.innerHTML = DISHES.map((d) => {
    const sec =
      d.section !== lastSection ? `<li class="d-section" data-section>${d.section}</li>` : "";
    lastSection = d.section;
    return `${sec}<li class="${d.id === activeId ? "is-active" : ""}" data-id="${d.id}">
      <span>${d.name}</span>
      <span class="d-price">$${d.price}</span>
    </li>`;
  }).join("");
}

function renderPairings() {
  const d = DISHES.find((x) => x.id === activeId);
  if (!d) return;
  dishTitle.textContent = d.name;
  dishMeta.textContent = `${d.section} · ${d.kind}`;
  const ps = PAIRINGS[d.id] || [];
  pairs.innerHTML = ps
    .map(
      (p, i) => `<li class="pair" data-i="${i}">
      <div class="bottle ${p.color}">
        <span class="label">${p.name.split(" ")[0]}</span>
      </div>
      <div class="p-body">
        <div class="p-top">
          <div>
            <p class="p-name">${p.name}</p>
            <p class="p-region">${p.region}</p>
            <p class="p-conf">
              <span class="p-pip">
                <span class="${p.conf >= 1 ? "on" : ""}"></span>
                <span class="${p.conf >= 2 ? "on" : ""}"></span>
                <span class="${p.conf >= 3 ? "on" : ""}"></span>
              </span>
              <span>${["weak", "good", "strong"][p.conf - 1] || "good"} match</span>
            </p>
          </div>
          <div class="p-price">
            <span class="p-glass">$${p.glass}<small> / glass</small></span>
            ${p.bottle > 0 ? `<small>bottle · $${p.bottle}</small>` : `<small>by the glass only</small>`}
          </div>
        </div>
        <p class="p-notes">${p.notes}</p>
        <div class="p-actions">
          <button class="p-add" data-action="add" data-name="${p.name}">Add a glass</button>
          <button class="p-why" data-action="why" data-i="${i}">Why this match?</button>
        </div>
        <p class="p-why-body" data-why="${i}" hidden>${p.why}</p>
      </div>
    </li>`
    )
    .join("");
}

dishList.addEventListener("click", (e) => {
  const li = e.target.closest("[data-id]");
  if (!li || li.matches("[data-section]")) return;
  activeId = li.dataset.id;
  renderDishes();
  renderPairings();
});

pairs.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  if (btn.dataset.action === "add") {
    showToast(`Added · ${btn.dataset.name} · glass`);
  }
  if (btn.dataset.action === "why") {
    const i = btn.dataset.i;
    const body = pairs.querySelector(`[data-why="${i}"]`);
    if (body) body.hidden = !body.hidden;
    btn.textContent = body && !body.hidden ? "Hide reasoning" : "Why this match?";
  }
});

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2400);
}

renderDishes();
renderPairings();
