(function () {
  "use strict";

  var grid = document.getElementById("grid");
  var countBadge = document.getElementById("countBadge");
  var paywall = document.getElementById("paywall");
  var paywallCount = document.getElementById("paywallCount");
  var upgradeBtn = document.getElementById("upgradeBtn");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  // --- Data: realistic but clearly fictional admirers ---
  var people = [
    { name: "Mara", age: 27, dist: "2 km away", compat: 94, locked: false,
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=60&auto=format&fit=crop" },
    { name: "Priya", age: 25, dist: "5 km away", compat: 88, locked: false,
      photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=60&auto=format&fit=crop" },
    { name: "Ivy", age: 29, dist: "1 km away", compat: 91, locked: true,
      photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=60&auto=format&fit=crop" },
    { name: "Noor", age: 24, dist: "3 km away", compat: 82, locked: true,
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=60&auto=format&fit=crop" },
    { name: "Sena", age: 31, dist: "8 km away", compat: 77, locked: true,
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=60&auto=format&fit=crop" },
    { name: "Elle", age: 26, dist: "4 km away", compat: 85, locked: true,
      photo: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=60&auto=format&fit=crop" },
    { name: "Tavi", age: 28, dist: "6 km away", compat: 79, locked: true,
      photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=60&auto=format&fit=crop" },
    { name: "Juno", age: 23, dist: "2 km away", compat: 90, locked: true,
      photo: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&q=60&auto=format&fit=crop" }
  ];

  var premium = false;

  var svg = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.8 5.5 5 5.1c2-.2 3.4 1 4 2 .6-1 2-2.2 4-2 3.2.4 4.6 3.8 3 6.7C19.5 16.1 12 21 12 21z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>'
  };

  function toast(msg, love) {
    toastEl.textContent = msg;
    toastEl.classList.toggle("toast--love", !!love);
    toastEl.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("toast--show");
    }, 2400);
  }

  function likesLeft() {
    return people.filter(function (p) { return !p.removed; }).length;
  }

  function updateCount() {
    var n = likesLeft();
    countBadge.textContent = n + (n === 1 ? " admirer" : " admirers");
    var hidden = people.filter(function (p) { return p.locked && !p.removed; }).length;
    if (premium || hidden === 0) {
      paywallCount.textContent = "You have seen everyone";
    } else {
      paywallCount.textContent = "+" + hidden + " more likes you";
    }
  }

  function buildRevealed(p, i) {
    var card = document.createElement("article");
    card.className = "card card--revealed";
    card.style.animationDelay = (i * 55) + "ms";
    card.innerHTML =
      '<div class="card__photo" style="background-image:url(' + p.photo + ')"></div>' +
      '<div class="card__scrim"></div>' +
      '<div class="compat"><b>' + p.compat + '%</b> match</div>' +
      '<div class="card__meta">' +
        '<div class="card__name">' + p.name + ' <span>' + p.age + '</span></div>' +
        '<div class="card__sub">' + svg.pin + p.dist + '</div>' +
      '</div>' +
      '<div class="card__actions">' +
        '<button class="act act--pass" type="button" aria-label="Pass on ' + p.name + '">' + svg.close + '</button>' +
        '<button class="act act--like" type="button" aria-label="Like ' + p.name + ' back">' + svg.heart + '</button>' +
      '</div>';

    card.querySelector(".act--like").addEventListener("click", function () {
      likeBack(card, p);
    });
    card.querySelector(".act--pass").addEventListener("click", function () {
      passOn(card, p);
    });
    return card;
  }

  function buildLocked(p, i) {
    var card = document.createElement("article");
    card.className = "card card--locked";
    card.style.animationDelay = (i * 55) + "ms";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Locked profile — upgrade to reveal");
    card.innerHTML =
      '<div class="card__photo" style="background-image:url(' + p.photo + ')"></div>' +
      '<div class="card__blur"></div>' +
      '<span class="lock-chip">' + svg.lock + '</span>' +
      '<span class="fake-name"></span>';

    function open() { openPaywall("Upgrade to reveal " + p.name + " and everyone else."); }
    card.addEventListener("click", open);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
    return card;
  }

  function render() {
    grid.innerHTML = "";
    people.forEach(function (p, i) {
      if (p.removed) return;
      if (p.locked && !premium) {
        grid.appendChild(buildLocked(p, i));
      } else {
        grid.appendChild(buildRevealed(p, i));
      }
    });
    updateCount();
  }

  function heartBurst(card) {
    var b = document.createElement("div");
    b.className = "burst";
    b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.8 5.5 5 5.1c2-.2 3.4 1 4 2 .6-1 2-2.2 4-2 3.2.4 4.6 3.8 3 6.7C19.5 16.1 12 21 12 21z"/></svg>';
    card.appendChild(b);
    setTimeout(function () { b.remove(); }, 720);
  }

  function likeBack(card, p) {
    if (p.matched) { toast("Already matched with " + p.name + " 💜", true); return; }
    p.matched = true;
    heartBurst(card);
    card.classList.add("card--matched");
    var tag = document.createElement("span");
    tag.className = "matched-tag";
    tag.textContent = "Matched";
    card.appendChild(tag);
    var likeBtn = card.querySelector(".act--like");
    if (likeBtn) { likeBtn.disabled = true; likeBtn.style.color = "#16a34a"; }
    toast("It's a match with " + p.name + "! 🎉", true);
  }

  function passOn(card, p) {
    p.removed = true;
    card.classList.add("card--gone");
    setTimeout(function () {
      card.remove();
      updateCount();
    }, 360);
    toast("Passed on " + p.name);
  }

  function openPaywall(msg) {
    toast(msg || "Upgrade to see everyone who likes you.");
    paywall.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }],
      { duration: 420, easing: "cubic-bezier(0.34,1.56,0.64,1)" }
    );
    paywall.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function unlockAll() {
    if (premium) { openPaywall("You already have Gold — enjoy!"); return; }
    premium = true;
    var locked = people.filter(function (p) { return p.locked; });
    people.forEach(function (p) { p.locked = false; });
    render();

    // stagger the reveal of the newly unlocked cards
    var cards = grid.querySelectorAll(".card--revealed");
    cards.forEach(function (c, i) {
      c.style.animation = "none";
      // force reflow then re-run entry animation with delay
      void c.offsetWidth;
      c.style.animation = "cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both";
      c.style.animationDelay = (i * 70) + "ms";
    });

    upgradeBtn.textContent = "Premium active ✓";
    paywall.classList.add("paywall--done");
    document.getElementById("paywallCount").textContent = "You have seen everyone";
    toast("Gold unlocked — " + locked.length + " new profiles revealed! ✨", true);
  }

  upgradeBtn.addEventListener("click", unlockAll);

  render();
})();
