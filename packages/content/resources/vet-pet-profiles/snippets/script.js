(function () {
  "use strict";

  var pets = [
    {
      name: "Biscuit",
      emoji: "🐶",
      species: "Dog",
      breed: "Golden Retriever",
      age: "4 yrs",
      weight: "29.4 kg",
      chip: "956 000 102 884 731",
      appt: "Jul 3, 2026 · 10:30",
      clinic: "Pawthway — Riverside",
      vax: "All current · next booster Mar 2027",
      status: "ok",
    },
    {
      name: "Mochi",
      emoji: "🐱",
      species: "Cat",
      breed: "British Shorthair",
      age: "2 yrs",
      weight: "4.8 kg",
      chip: "956 000 102 771 502",
      appt: "Jun 28, 2026 · 16:00",
      clinic: "Pawthway — Riverside",
      vax: "Rabies due in 9 days",
      status: "due",
    },
    {
      name: "Pepper",
      emoji: "🐰",
      species: "Rabbit",
      breed: "Holland Lop",
      age: "1 yr",
      weight: "1.6 kg",
      chip: "—",
      appt: "Sep 12, 2026 · 09:15",
      clinic: "Pawthway — Oak Street",
      vax: "Myxomatosis current",
      status: "ok",
    },
    {
      name: "Captain",
      emoji: "🐦",
      species: "Bird",
      breed: "African Grey Parrot",
      age: "11 yrs",
      weight: "0.42 kg",
      chip: "—",
      appt: "No upcoming visit",
      clinic: "Pawthway — Oak Street",
      vax: "Annual check overdue",
      status: "due",
    },
    {
      name: "Luna",
      emoji: "🐕",
      species: "Dog",
      breed: "Border Collie",
      age: "6 yrs",
      weight: "18.2 kg",
      chip: "956 000 102 339 410",
      appt: "Aug 1, 2026 · 14:45",
      clinic: "Pawthway — Riverside",
      vax: "All current · next booster Aug 2026",
      status: "ok",
    },
    {
      name: "Tofu",
      emoji: "🐢",
      species: "Tortoise",
      breed: "Hermann's Tortoise",
      age: "8 yrs",
      weight: "1.1 kg",
      chip: "—",
      appt: "Jul 19, 2026 · 11:00",
      clinic: "Pawthway — Oak Street",
      vax: "Wellness exam due soon",
      status: "due",
    },
  ];

  var grid = document.getElementById("grid");
  var addCard = document.getElementById("add-pet");
  var search = document.getElementById("search");
  var count = document.getElementById("count");
  var empty = document.getElementById("empty");
  var emptyTerm = document.getElementById("empty-term");

  var overlay = document.getElementById("overlay");
  var quickview = document.getElementById("quickview");
  var qvClose = document.getElementById("qv-close");
  var lastFocused = null;

  function badge(status) {
    return status === "ok"
      ? '<span class="badge ok">Up to date</span>'
      : '<span class="badge due">Due soon</span>';
  }

  function render(term) {
    // Remove previously rendered pet cards (keep the add card).
    var existing = grid.querySelectorAll(".pet-card");
    existing.forEach(function (n) {
      n.remove();
    });

    var q = (term || "").trim().toLowerCase();
    var shown = 0;

    pets.forEach(function (pet, i) {
      var hay = (pet.name + " " + pet.species + " " + pet.breed).toLowerCase();
      if (q && hay.indexOf(q) === -1) return;
      shown++;

      var card = document.createElement("button");
      card.type = "button";
      card.className = "card pet-card";
      card.setAttribute("data-index", String(i));
      card.setAttribute("aria-label", "View " + pet.name + " profile");
      card.innerHTML =
        '<div class="pet-top">' +
        '<span class="pet-avatar" aria-hidden="true">' +
        pet.emoji +
        "</span>" +
        "<div>" +
        '<div class="pet-name">' +
        pet.name +
        "</div>" +
        '<div class="pet-breed">' +
        pet.species +
        " · " +
        pet.breed +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="pet-meta">' +
        "<span>Age <b>" +
        pet.age +
        "</b></span>" +
        "<span>Next <b>" +
        pet.appt +
        "</b></span>" +
        "</div>" +
        badge(pet.status);

      card.addEventListener("click", function () {
        openQuickView(pet, card);
      });
      grid.appendChild(card);
    });

    var total = pets.length;
    count.textContent = q
      ? shown + " of " + total + " pets match"
      : total + " pets in your family";

    if (q && shown === 0) {
      empty.hidden = false;
      emptyTerm.textContent = term;
      addCard.style.display = "none";
    } else {
      empty.hidden = true;
      addCard.style.display = "";
    }
  }

  function openQuickView(pet, trigger) {
    lastFocused = trigger || document.activeElement;
    document.getElementById("qv-avatar").textContent = pet.emoji;
    document.getElementById("qv-name").textContent = pet.name;
    document.getElementById("qv-breed").textContent = pet.species + " · " + pet.breed;
    document.getElementById("qv-age").textContent = pet.age;
    document.getElementById("qv-weight").textContent = pet.weight;
    document.getElementById("qv-chip").textContent = pet.chip;
    document.getElementById("qv-appt").textContent = pet.appt;
    document.getElementById("qv-clinic").textContent = pet.clinic;
    document.getElementById("qv-vax").textContent = pet.vax;

    var b = document.getElementById("qv-badge");
    b.className = "badge " + pet.status;
    b.textContent = pet.status === "ok" ? "Up to date" : "Due soon";

    overlay.hidden = false;
    quickview.hidden = false;
    qvClose.focus();
    document.addEventListener("keydown", onKey);
  }

  function closeQuickView() {
    overlay.hidden = true;
    quickview.hidden = true;
    document.removeEventListener("keydown", onKey);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function onKey(e) {
    if (e.key === "Escape") closeQuickView();
  }

  overlay.addEventListener("click", closeQuickView);
  qvClose.addEventListener("click", closeQuickView);

  addCard.addEventListener("click", function () {
    addCard.classList.add("nudge");
    count.textContent = "Demo only — connect a form to add a new pet profile.";
    setTimeout(function () {
      render(search.value);
    }, 1800);
  });

  var t;
  search.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () {
      render(search.value);
    }, 90);
  });

  render("");
})();
