(function () {
  "use strict";

  // Registry data — realistic but clearly fictional gifts.
  var GIFTS = [
    {
      id: "linen-set",
      name: "Belgian Linen Bedding",
      desc: "Stonewashed king set in warm oat",
      category: "Home",
      price: 220,
      claimed: false,
      img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#f4ece4,#e8b7b0)",
    },
    {
      id: "dutch-oven",
      name: "Enameled Dutch Oven",
      desc: "7-qt cast iron for slow Sundays",
      category: "Kitchen",
      price: 165,
      claimed: false,
      img: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#e8b7b0,#c98a86)",
    },
    {
      id: "espresso",
      name: "Stovetop Espresso Maker",
      desc: "Polished six-cup Italian moka",
      category: "Kitchen",
      price: 58,
      claimed: true,
      img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#f4ece4,#c9a24b)",
    },
    {
      id: "flatware",
      name: "Matte Gold Flatware",
      desc: "20-piece service, brushed finish",
      category: "Dining",
      price: 140,
      claimed: false,
      img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#c9a24b,#a8862f)",
    },
    {
      id: "coupe-glasses",
      name: "Crystal Coupe Glasses",
      desc: "Set of six for the first toast",
      category: "Dining",
      price: 96,
      claimed: false,
      img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#fbeeec,#e8b7b0)",
    },
    {
      id: "throw",
      name: "Alpaca Wool Throw",
      desc: "Handwoven blush herringbone",
      category: "Home",
      price: 118,
      claimed: false,
      img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#e8b7b0,#f4ece4)",
    },
    {
      id: "knife-block",
      name: "Japanese Knife Trio",
      desc: "Chef, paring &amp; santoku, steel",
      category: "Kitchen",
      price: 189,
      claimed: false,
      img: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#c98a86,#a8862f)",
    },
    {
      id: "vase",
      name: "Hand-thrown Stoneware Vase",
      desc: "Blush glaze from a Sonoma studio",
      category: "Home",
      price: 72,
      claimed: true,
      img: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#fbeeec,#c98a86)",
    },
    {
      id: "stand-mixer",
      name: "Tilt-Head Stand Mixer",
      desc: "5-qt in soft almond cream",
      category: "Kitchen",
      price: 380,
      claimed: false,
      img: "https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#f4ece4,#e8b7b0)",
    },
    {
      id: "candle-set",
      name: "Beeswax Taper Candles",
      desc: "Two dozen ivory dinner tapers",
      category: "Home",
      price: 44,
      claimed: false,
      img: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#f4ece4,#c9a24b)",
    },
    {
      id: "picnic",
      name: "Weekend Picnic Basket",
      desc: "Wicker set for coastal escapes",
      category: "Outdoor",
      price: 130,
      claimed: false,
      img: "https://images.unsplash.com/photo-1526401281623-3d888e7c1cf6?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#e8b7b0,#c9a24b)",
    },
    {
      id: "honeymoon",
      name: "Honeymoon Fund",
      desc: "A night in the Amalfi Coast",
      category: "Experience",
      price: 250,
      claimed: false,
      img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=640&q=70",
      grad: "linear-gradient(135deg,#c98a86,#c9a24b)",
    },
  ];

  var STATE = { availableOnly: false };

  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var reservedCountEl = document.getElementById("reservedCount");
  var totalCountEl = document.getElementById("totalCount");
  var progressFill = document.getElementById("progressFill");
  var availableStat = document.getElementById("availableStat");
  var availableOnly = document.getElementById("availableOnly");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  function visibleGifts() {
    return STATE.availableOnly
      ? GIFTS.filter(function (g) {
          return !g.claimed;
        })
      : GIFTS;
  }

  function updateSummary() {
    var reserved = GIFTS.filter(function (g) {
      return g.claimed;
    }).length;
    var total = GIFTS.length;
    var available = total - reserved;

    reservedCountEl.textContent = reserved;
    totalCountEl.textContent = total;
    progressFill.style.width = (reserved / total) * 100 + "%";

    availableStat.textContent = STATE.availableOnly
      ? available + (available === 1 ? " gift still available" : " gifts still available")
      : "All gifts (" + available + " available)";
  }

  function buildCard(g) {
    var li = document.createElement("li");
    li.className = "card" + (g.claimed ? " is-claimed" : "");
    li.dataset.id = g.id;

    var media = document.createElement("div");
    media.className = "card__media";
    media.style.backgroundImage =
      'url("' + g.img + '"), ' + g.grad;

    var badge = document.createElement("span");
    badge.className = "card__badge";
    badge.textContent = g.claimed ? "Reserved" : g.category;
    media.appendChild(badge);

    var body = document.createElement("div");
    body.className = "card__body";

    var name = document.createElement("h3");
    name.className = "card__name";
    name.innerHTML = g.name;

    var desc = document.createElement("p");
    desc.className = "card__desc";
    desc.innerHTML = g.desc;

    var foot = document.createElement("div");
    foot.className = "card__foot";

    var price = document.createElement("span");
    price.className = "card__price";
    price.textContent = money(g.price);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "reserve" + (g.claimed ? " is-claimed" : "");
    btn.textContent = g.claimed ? "Reserved" : "Reserve";
    btn.setAttribute(
      "aria-label",
      (g.claimed ? "Cancel reservation for " : "Reserve ") + g.name.replace(/&amp;/g, "and")
    );
    btn.setAttribute("aria-pressed", g.claimed ? "true" : "false");
    btn.addEventListener("click", function () {
      toggle(g.id);
    });

    foot.appendChild(price);
    foot.appendChild(btn);
    body.appendChild(name);
    body.appendChild(desc);
    body.appendChild(foot);
    li.appendChild(media);
    li.appendChild(body);
    return li;
  }

  function render() {
    var items = visibleGifts();
    grid.innerHTML = "";

    if (items.length === 0) {
      empty.hidden = false;
    } else {
      empty.hidden = true;
      var frag = document.createDocumentFragment();
      items.forEach(function (g) {
        frag.appendChild(buildCard(g));
      });
      grid.appendChild(frag);
    }
    updateSummary();
  }

  function toggle(id) {
    var g = GIFTS.find(function (x) {
      return x.id === id;
    });
    if (!g) return;
    g.claimed = !g.claimed;

    var plain = g.name.replace(/&amp;/g, "and");
    if (g.claimed) {
      toast("Thank you! You reserved the " + plain + ".");
    } else {
      toast("Reservation released for the " + plain + ".");
    }
    render();
  }

  availableOnly.addEventListener("change", function () {
    STATE.availableOnly = availableOnly.checked;
    render();
  });

  render();
})();
