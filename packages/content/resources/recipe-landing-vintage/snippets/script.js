/* ============================================================
   Aunt Marigold's Kitchen — Vintage / Retro Recipes landing
   Vanilla JS: flippable index cards, tip rotator, scroll-reveal,
   signup validation, retro toast. No external libraries.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = null;
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    // force reflow so the transition re-triggers
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---------- Recipe data (fictional, illustrative) ---------- */
  var RECIPES = [
    {
      name: "Avocado Tuna Bake",
      cat: "Casserole",
      emoji: "🥑",
      time: "45 min",
      serves: "Serves 6",
      cardNo: "014",
      ingredients: [
        "2 ripe avocados, mashed",
        "2 cans albacore tuna, drained",
        "1½ cups egg noodles, cooked",
        "¾ cup cheddar, grated",
        "1 sleeve buttery crackers, crushed"
      ],
      steps: "Fold it all together, crown with cracker crumbs and bake at 350°F until golden & bubbling."
    },
    {
      name: "Lime Jell-O Tower",
      cat: "Molded Salad",
      emoji: "🍋",
      time: "4 hr chill",
      serves: "Serves 8",
      cardNo: "031",
      ingredients: [
        "2 boxes lime gelatin",
        "1 cup small-curd cottage cheese",
        "1 can crushed pineapple",
        "½ cup chopped pecans",
        "1 cup whipped topping"
      ],
      steps: "Layer in a ring mold, chill 4 hours, then unmold onto a paper doily. Show-stopper!"
    },
    {
      name: "Swiss Fondue Pot",
      cat: "Party Sharing",
      emoji: "🧀",
      time: "25 min",
      serves: "Serves 4",
      cardNo: "008",
      ingredients: [
        "8 oz Gruyère, shredded",
        "8 oz Emmental, shredded",
        "1 cup dry white wine",
        "1 clove garlic, halved",
        "splash of kirsch + nutmeg"
      ],
      steps: "Rub the pot with garlic, melt low and slow, then dunk crusty bread cubes. Don’t lose your bread!"
    },
    {
      name: "Pineapple Upside-Down Cake",
      cat: "Jiffy Dessert",
      emoji: "🍍",
      time: "1 hr",
      serves: "Serves 10",
      cardNo: "002",
      ingredients: [
        "7 pineapple rings + cherries",
        "½ cup brown sugar",
        "½ cup butter",
        "1½ cups flour",
        "2 eggs + 1 cup sugar"
      ],
      steps: "Caramel in the pan, batter on top, bake, then flip warm onto a platter for the big reveal."
    },
    {
      name: "Deviled Ham Spread",
      cat: "Cocktail Nibble",
      emoji: "🥖",
      time: "15 min",
      serves: "Serves 12",
      cardNo: "047",
      ingredients: [
        "1 cup minced cooked ham",
        "3 tbsp mayonnaise",
        "1 tsp yellow mustard",
        "2 tbsp sweet pickle relish",
        "a dash of paprika"
      ],
      steps: "Mash smooth, mound into a little crock and serve with rye toast points."
    },
    {
      name: "Garden Pea Casserole",
      cat: "Supper Side",
      emoji: "🫛",
      time: "35 min",
      serves: "Serves 6",
      cardNo: "022",
      ingredients: [
        "3 cups green peas",
        "1 can cream of mushroom",
        "1 small onion, diced",
        "1 cup French-fried onions",
        "½ cup diced pimientos"
      ],
      steps: "Stir together, top with crispy onions and bake at 350°F for 25 minutes till crackly."
    }
  ];

  /* ---------- Build the flippable index cards ---------- */
  function buildCards() {
    var wrap = document.getElementById("cardbox");
    if (!wrap) return;

    RECIPES.forEach(function (r, i) {
      var li = r.ingredients
        .map(function (x) {
          return "<li>" + esc(x) + "</li>";
        })
        .join("");

      var card = document.createElement("button");
      card.className = "card reveal";
      card.type = "button";
      card.setAttribute("aria-pressed", "false");
      card.setAttribute(
        "aria-label",
        "Flip recipe card for " + r.name + " to read the recipe"
      );
      card.innerHTML =
        '<div class="card__inner">' +
        // FRONT
        '<div class="card__face card__front">' +
        '<span class="card__tape" aria-hidden="true"></span>' +
        '<div class="card__photo" data-photo="' +
        i +
        '"><span class="emoji" aria-hidden="true">' +
        r.emoji +
        "</span></div>" +
        '<div class="card__body">' +
        '<span class="card__cat">' +
        esc(r.cat) +
        "</span>" +
        '<h3 class="card__name">' +
        esc(r.name) +
        "</h3>" +
        '<div class="card__meta"><span>⏱ ' +
        esc(r.time) +
        "</span><span>" +
        esc(r.serves) +
        "</span></div>" +
        "</div>" +
        '<span class="card__flip-hint">Flip <span aria-hidden="true">↻</span></span>' +
        "</div>" +
        // BACK
        '<div class="card__face card__back">' +
        '<div class="card__inner-back">' +
        "<h4>" +
        esc(r.name) +
        "</h4>" +
        '<p class="recipe-cat">Card No. ' +
        esc(r.cardNo) +
        " · " +
        esc(r.cat) +
        "</p>" +
        "<ul>" +
        li +
        "</ul>" +
        '<p class="steps">' +
        esc(r.steps) +
        "</p>" +
        '<div class="card__meta"><span>⏱ ' +
        esc(r.time) +
        "</span><span>" +
        esc(r.serves) +
        "</span></div>" +
        "</div>" +
        "</div>" +
        "</div>";

      card.addEventListener("click", function () {
        var flipped = card.classList.toggle("is-flipped");
        card.setAttribute("aria-pressed", flipped ? "true" : "false");
        if (flipped) toast("📝 " + r.name + " — here’s the recipe!");
      });

      wrap.appendChild(card);
    });

    // observe the freshly-built cards for reveal
    observeReveal(wrap.querySelectorAll(".reveal"));
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  }

  /* ---------- Tip of the day rotator ---------- */
  var TIPS = [
    "A pat of butter rubbed under the lid keeps your fondue from boiling over — works like a charm, dearie!",
    "Chill your mixing bowl before whipping cream and it’ll fluff up twice as fast.",
    "Add a pinch of baking soda to the pot and your green beans stay bright and groovy.",
    "Stale bread? A damp tea towel and a warm oven brings it right back to life.",
    "Rub a cut lemon on your cutting board to chase away yesterday’s onion smell.",
    "Save your pickle brine — it makes the zippiest potato salad in the neighborhood.",
    "A spoonful of cold coffee deepens the color of any beef gravy. Far out!"
  ];
  function initTip() {
    var el = document.getElementById("tipText");
    var btn = document.getElementById("nextTip");
    if (!el || !btn) return;
    var i = 0;
    btn.addEventListener("click", function () {
      i = (i + 1) % TIPS.length;
      el.textContent = TIPS[i];
      toast("💡 Fresh tip served up!");
    });
  }

  /* ---------- Signup form ---------- */
  function initSignup() {
    var form = document.getElementById("signupForm");
    if (!form) return;
    var input = document.getElementById("email");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!ok) {
        input.setAttribute("aria-invalid", "true");
        input.focus();
        toast("📬 Pop in a real email, sugar.");
        return;
      }
      input.removeAttribute("aria-invalid");
      input.value = "";
      toast("🍋 You’re on the list — see you Sunday!");
    });
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid")) input.removeAttribute("aria-invalid");
    });
  }

  /* ---------- Scroll reveal ---------- */
  var io = null;
  function observeReveal(nodes) {
    if (!nodes || !nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) {
        n.classList.add("is-in");
      });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("is-in");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
    }
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  /* ---------- Smooth-scroll for in-page anchors (with toast on CTA) ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function () {
        var msg = a.getAttribute("data-toast");
        if (msg) toast(msg);
      });
    });
  }

  /* ---------- Boot ---------- */
  function init() {
    buildCards();
    initTip();
    initSignup();
    initAnchors();
    observeReveal(document.querySelectorAll(".reveal"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
