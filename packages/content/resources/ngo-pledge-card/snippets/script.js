(function () {
  "use strict";

  /* ---- Fictional sponsorship data ---- */
  var CARDS = [
    {
      id: "amara",
      name: "Amara",
      meta: "Age 8 · Kenya",
      tag: "Education",
      ph: "ph-a",
      photoCap: "Amara, walking 4km to her village school",
      story: "Amara dreams of becoming a teacher, but her school of 60 children shares just one classroom and a handful of books.",
      amount: 25,
      raised: 34,
      goal: 50,
      detail: "Your monthly gift covers Amara's school fees, uniform, two daily meals and a place in the after-school reading club.",
      facts: [
        ["📚", "Funds tuition, books & a uniform for the full year"],
        ["🍲", "Two nutritious meals every school day"],
        ["✉️", "Twice-yearly letters & a progress report from Amara"]
      ],
      donors: "Joined by Priya N., Marcus T. and 32 others"
    },
    {
      id: "river-school",
      name: "Riverside School",
      meta: "Community · Bangladesh",
      tag: "Clean Water",
      ph: "ph-b",
      photoCap: "Children gathering at the new well in Riverside",
      story: "A village school of 240 students relies on a river that floods each monsoon. A solar well would give them safe water all year.",
      amount: 40,
      raised: 188,
      goal: 240,
      detail: "Sponsoring Riverside funds a solar-powered well, hygiene training and yearly water testing for the whole school community.",
      facts: [
        ["💧", "Shares the cost of a solar-powered village well"],
        ["🧼", "Hand-washing stations & hygiene workshops"],
        ["🔬", "Quarterly water-quality testing & maintenance"]
      ],
      donors: "Powered by 188 monthly sponsors"
    },
    {
      id: "diego",
      name: "Diego",
      meta: "Age 11 · Guatemala",
      tag: "Health",
      ph: "ph-c",
      photoCap: "Diego at his first checkup in the mobile clinic",
      story: "Diego loves football but lives three hours from the nearest clinic. A monthly sponsor keeps the mobile health van on the road.",
      amount: 30,
      raised: 41,
      goal: 60,
      detail: "Your pledge funds Diego's vaccinations, regular checkups and the fuel that keeps the mobile clinic reaching his mountain village.",
      facts: [
        ["🩺", "Vaccinations & twice-yearly medical checkups"],
        ["🚐", "Keeps the mobile clinic visiting his village"],
        ["🦷", "Dental care & a vitamin program"]
      ],
      donors: "Joined by Lena O., the Okafor family +39"
    },
    {
      id: "maya-grove",
      name: "Maya's Grove",
      meta: "Family farm · Peru",
      tag: "Livelihood",
      ph: "ph-d",
      photoCap: "Maya tending the new fruit-tree seedlings",
      story: "Maya supports four children by farming. A small grove of fruit trees would triple her family's income within two seasons.",
      amount: 35,
      raised: 12,
      goal: 80,
      detail: "Sponsoring Maya's Grove plants fruit trees, funds farming tools and pays for a season of agronomy coaching for her cooperative.",
      facts: [
        ["🌳", "Plants & cares for income-generating fruit trees"],
        ["🧑‍🌾", "Hands-on agronomy coaching each season"],
        ["📈", "Connects the co-op to fair-trade buyers"]
      ],
      donors: "Be one of the first 12 sponsors"
    }
  ];

  var fmt = function (n) { return "$" + n.toLocaleString("en-US"); };
  var selected = Object.create(null);

  /* ---- Toast helper ---- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind === "warn" ? " warn" : "");
    el.innerHTML = '<span class="dot"></span><span></span>';
    el.lastChild.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .35s, transform .35s";
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      setTimeout(function () { el.remove(); }, 380);
    }, 2600);
  }

  /* ---- Render cards ---- */
  var grid = document.getElementById("cards");

  function buildCard(c) {
    var pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
    var card = document.createElement("article");
    card.className = "card";
    card.dataset.id = c.id;

    var facts = c.facts.map(function (f) {
      return '<li><span class="ico">' + f[0] + "</span><span>" + f[1] + "</span></li>";
    }).join("");

    card.innerHTML =
      '<div class="card-inner">' +
        '<div class="face front">' +
          '<div class="photo ' + c.ph + '">' +
            '<span class="tag">' + c.tag + "</span>" +
            '<button class="flip-btn" type="button" aria-label="Read ' + c.name + "'s story" title="More details">↻</button>" +
            '<span class="photo-cap">' + c.photoCap + "</span>" +
          "</div>" +
          '<div class="body">' +
            '<div class="who"><h3>' + c.name + '</h3><span class="meta">' + c.meta + "</span></div>" +
            '<p class="story">' + c.story + "</p>" +
            '<div class="therm-row"><span><b class="raisedLabel">' + c.raised + "</b> of " + c.goal + " sponsors</span><span>" + pct + "%</span></div>" +
            '<div class="therm"><span class="therm-fill" style="width:0"></span></div>' +
            '<div class="price-row">' +
              '<span class="price"><b>' + fmt(c.amount) + "</b><span>/month</span></span>" +
            "</div>" +
            '<button class="btn btn-accent sponsor-btn" type="button">Sponsor ' + c.name + "</button>" +
          "</div>" +
        "</div>" +
        '<div class="face back">' +
          '<div class="photo ' + c.ph + '" style="height:120px">' +
            '<button class="flip-btn" type="button" aria-label="Back to ' + c.name + ' card" title="Back">↺</button>' +
            '<span class="photo-cap">' + c.tag + " · " + c.meta + "</span>" +
          "</div>" +
          '<div class="body">' +
            "<h3>About " + c.name + "</h3>" +
            '<p class="detail">' + c.detail + "</p>" +
            '<ul class="facts">' + facts + "</ul>" +
            '<p class="donors">' + c.donors + "</p>" +
          "</div>" +
        "</div>" +
      "</div>";

    /* flip toggles */
    card.querySelectorAll(".flip-btn").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        card.classList.toggle("flipped");
      });
    });

    /* sponsor toggle */
    var btn = card.querySelector(".sponsor-btn");
    btn.addEventListener("click", function () {
      if (selected[c.id]) {
        delete selected[c.id];
        card.classList.remove("sponsored");
        btn.textContent = "Sponsor " + c.name;
        toast("Removed " + c.name + " from your pledge", "warn");
        bumpRaised(card, -1);
      } else {
        selected[c.id] = c.amount;
        card.classList.add("sponsored");
        btn.textContent = "Sponsoring " + c.name;
        toast("You're sponsoring " + c.name + " — " + fmt(c.amount) + "/month 💚");
        bumpRaised(card, 1);
      }
      updatePledge();
    });

    /* animate thermometer in */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        card.querySelector(".therm-fill").style.width = pct + "%";
      });
    });

    return card;
  }

  function bumpRaised(card, delta) {
    var label = card.querySelector(".raisedLabel");
    var n = parseInt(label.textContent, 10) + delta;
    label.textContent = n;
    var c = CARDS.filter(function (x) { return x.id === card.dataset.id; })[0];
    var pct = Math.min(100, Math.round((n / c.goal) * 100));
    card.querySelector(".therm-fill").style.width = pct + "%";
    card.querySelector(".therm-row").lastElementChild.textContent = pct + "%";
  }

  CARDS.forEach(function (c) { grid.appendChild(buildCard(c)); });

  /* ---- Pledge bar ---- */
  var totalEl = document.getElementById("pledgeTotal");
  var noteEl = document.getElementById("pledgeNote");
  var checkout = document.getElementById("checkoutBtn");

  function updatePledge() {
    var ids = Object.keys(selected);
    var total = ids.reduce(function (s, id) { return s + selected[id]; }, 0);
    totalEl.textContent = fmt(total);
    if (ids.length === 0) {
      noteEl.textContent = "No sponsorships selected yet — choose a card to begin.";
      checkout.disabled = true;
    } else {
      var names = ids.map(function (id) {
        return CARDS.filter(function (c) { return c.id === id; })[0].name;
      });
      noteEl.textContent = "Sponsoring " + names.join(", ") + " · " + fmt(total) + " every month.";
      checkout.disabled = false;
    }
  }

  checkout.addEventListener("click", function () {
    var count = Object.keys(selected).length;
    var total = Object.keys(selected).reduce(function (s, id) { return s + selected[id]; }, 0);
    toast("Thank you! " + count + " sponsorship" + (count > 1 ? "s" : "") + " confirmed — " + fmt(total) + "/month 🎉");
  });

  /* ---- Count-up impact numbers ---- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null, dur = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { io.observe(el); });
  } else {
    counters.forEach(countUp);
  }
})();
