(function () {
  "use strict";

  /* ---------------- data ---------------- */
  // Inline-SVG animals (no external images). Each pairs with a home.
  const ANIMALS = [
    {
      id: "bee",
      name: "Buzzy",
      kind: "Bee",
      home: "hive",
      svg:
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<ellipse cx="32" cy="36" rx="16" ry="14" fill="#ffd23f" stroke="#2c2350" stroke-width="3"/>' +
        '<path d="M22 28h20M20 36h24M22 44h20" stroke="#2c2350" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="22" cy="22" rx="9" ry="6" fill="#dff6fb" stroke="#2c2350" stroke-width="2.5"/>' +
        '<ellipse cx="42" cy="22" rx="9" ry="6" fill="#dff6fb" stroke="#2c2350" stroke-width="2.5"/>' +
        '<circle cx="28" cy="33" r="2.4" fill="#2c2350"/><circle cx="36" cy="33" r="2.4" fill="#2c2350"/>' +
        "</svg>"
    },
    {
      id: "fish",
      name: "Bubbles",
      kind: "Fish",
      home: "pond",
      svg:
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<path d="M46 32 60 22v20z" fill="#5ec5d6" stroke="#2c2350" stroke-width="3" stroke-linejoin="round"/>' +
        '<ellipse cx="28" cy="32" rx="20" ry="13" fill="#5ec5d6" stroke="#2c2350" stroke-width="3"/>' +
        '<circle cx="20" cy="29" r="3" fill="#fff" stroke="#2c2350" stroke-width="2"/>' +
        '<circle cx="20" cy="29" r="1.4" fill="#2c2350"/>' +
        '<path d="M30 26q6 6 0 12" fill="none" stroke="#2c2350" stroke-width="2.5"/>' +
        "</svg>"
    },
    {
      id: "owl",
      name: "Hoot",
      kind: "Owl",
      home: "tree",
      svg:
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<path d="M18 20q14-12 28 0v22a14 14 0 0 1-28 0z" fill="#c79a6b" stroke="#2c2350" stroke-width="3"/>' +
        '<circle cx="26" cy="30" r="7" fill="#fff" stroke="#2c2350" stroke-width="2.5"/>' +
        '<circle cx="38" cy="30" r="7" fill="#fff" stroke="#2c2350" stroke-width="2.5"/>' +
        '<circle cx="26" cy="30" r="3" fill="#2c2350"/><circle cx="38" cy="30" r="3" fill="#2c2350"/>' +
        '<path d="M29 37l3 4 3-4z" fill="#ff8a3d" stroke="#2c2350" stroke-width="2"/>' +
        "</svg>"
    },
    {
      id: "frog",
      name: "Hops",
      kind: "Frog",
      home: "lilypad",
      svg:
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<ellipse cx="32" cy="40" rx="18" ry="14" fill="#7bd389" stroke="#2c2350" stroke-width="3"/>' +
        '<circle cx="22" cy="22" r="8" fill="#7bd389" stroke="#2c2350" stroke-width="3"/>' +
        '<circle cx="42" cy="22" r="8" fill="#7bd389" stroke="#2c2350" stroke-width="3"/>' +
        '<circle cx="22" cy="21" r="3" fill="#2c2350"/><circle cx="42" cy="21" r="3" fill="#2c2350"/>' +
        '<path d="M24 44q8 6 16 0" fill="none" stroke="#2c2350" stroke-width="3" stroke-linecap="round"/>' +
        "</svg>"
    },
    {
      id: "bunny",
      name: "Thistle",
      kind: "Bunny",
      home: "burrow",
      svg:
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<ellipse cx="25" cy="20" rx="5" ry="12" fill="#ffe1ec" stroke="#2c2350" stroke-width="3"/>' +
        '<ellipse cx="39" cy="20" rx="5" ry="12" fill="#ffe1ec" stroke="#2c2350" stroke-width="3"/>' +
        '<circle cx="32" cy="40" r="16" fill="#fff" stroke="#2c2350" stroke-width="3"/>' +
        '<circle cx="26" cy="38" r="2.6" fill="#2c2350"/><circle cx="38" cy="38" r="2.6" fill="#2c2350"/>' +
        '<path d="M30 45l2 2 2-2z" fill="#ff6f9c" stroke="#2c2350" stroke-width="1.6"/>' +
        "</svg>"
    }
  ];

  const HOME_ART = {
    hive:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 14h28v6H10zM8 22h32v6H8zM10 30h28v6H10zM12 38h24v4H12z" fill="#ffd23f" stroke="#2c2350" stroke-width="2.4"/><circle cx="24" cy="33" r="3" fill="#2c2350"/></svg>',
    pond:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="30" rx="18" ry="11" fill="#5ec5d6" stroke="#2c2350" stroke-width="2.6"/><path d="M14 28q4 3 8 0t8 0" fill="none" stroke="#2c2350" stroke-width="2.2" stroke-linecap="round"/></svg>',
    tree:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="18" r="13" fill="#7bd389" stroke="#2c2350" stroke-width="2.6"/><rect x="20" y="28" width="8" height="14" rx="2" fill="#c79a6b" stroke="#2c2350" stroke-width="2.4"/></svg>',
    lilypad:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 12a12 12 0 1 1-3 23.7L24 24z" fill="#7bd389" stroke="#2c2350" stroke-width="2.6"/><circle cx="20" cy="14" r="3.5" fill="#ff6f9c" stroke="#2c2350" stroke-width="2"/></svg>',
    burrow:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 38h36v4H6z" fill="#c79a6b" stroke="#2c2350" stroke-width="2.4"/><path d="M16 38a8 8 0 0 1 16 0z" fill="#2c2350"/></svg>'
  };

  const HOMES = [
    { id: "hive", name: "The Hive", sub: "Sweet & golden" },
    { id: "pond", name: "The Pond", sub: "Cool & splashy" },
    { id: "tree", name: "The Tall Tree", sub: "High & leafy" },
    { id: "lilypad", name: "The Lily Pad", sub: "Floaty & green" },
    { id: "burrow", name: "The Burrow", sub: "Cozy & snug" }
  ];

  /* ---------------- helpers ---------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const friendStack = $("#friendStack");
  const homeStack = $("#homeStack");
  const scoreNum = $("#scoreNum");
  const scoreTotal = $("#scoreTotal");
  const scoreWrap = $(".score");
  const liveRegion = $("#liveRegion");
  const toastEl = $("#toast");
  const celebrate = $("#celebrate");

  let matched = 0;
  let armed = null; // keyboard / tap pickup: the currently selected friend el
  let toastTimer = null;

  function announce(msg) {
    liveRegion.textContent = "";
    // force re-read
    requestAnimationFrame(() => {
      liveRegion.textContent = msg;
    });
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  /* ---------------- build the board ---------------- */
  function build() {
    matched = 0;
    armed = null;
    friendStack.innerHTML = "";
    homeStack.innerHTML = "";
    scoreTotal.textContent = String(ANIMALS.length);
    updateScore(0);

    shuffle(ANIMALS).forEach((a) => friendStack.appendChild(makeFriend(a)));
    shuffle(HOMES).forEach((h) => homeStack.appendChild(makeHome(h)));
  }

  function makeFriend(a) {
    const li = document.createElement("li");
    li.className = "friend";
    li.dataset.home = a.home;
    li.dataset.id = a.id;
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute(
      "aria-label",
      a.name + " the " + a.kind + ". Press Enter to pick up."
    );
    li.innerHTML =
      '<span class="avatar">' + a.svg + "</span>" +
      '<span class="friend-text"><span class="friend-name">' +
      a.name +
      '</span><span class="friend-sub">' +
      a.kind +
      "</span></span>";
    return li;
  }

  function makeHome(h) {
    const li = document.createElement("li");
    li.className = "home";
    li.dataset.home = h.id;
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", h.name + ". Empty. Drop a friend here.");
    li.innerHTML =
      '<span class="home-icon">' + (HOME_ART[h.id] || "") + "</span>" +
      '<span class="home-text"><span class="home-name">' +
      h.name +
      '</span><span class="home-sub">' +
      h.sub +
      "</span></span>";
    return li;
  }

  function updateScore(n) {
    matched = n;
    scoreNum.textContent = String(n);
    scoreWrap.classList.remove("bump");
    void scoreWrap.offsetWidth;
    scoreWrap.classList.add("bump");
  }

  /* ---------------- match resolution ---------------- */
  function isFilled(home) {
    return home.classList.contains("filled");
  }

  function attemptMatch(friend, home) {
    if (!friend || !home || isFilled(home)) return false;

    if (friend.dataset.home === home.dataset.home) {
      acceptMatch(friend, home);
      return true;
    }
    rejectMatch(friend, home);
    return false;
  }

  function acceptMatch(friend, home) {
    const name = $(".friend-name", friend).textContent;
    const avatarSvg = $(".avatar", friend).innerHTML;

    home.classList.add("filled", "pop");
    home.classList.remove("over", "droppable", "armed-target");
    home.setAttribute(
      "aria-label",
      home.querySelector(".home-name").textContent + ". Home for " + name + ". Matched."
    );

    // nest a mini avatar + star inside the home
    const nest = document.createElement("span");
    nest.className = "nested";
    nest.innerHTML =
      '<span class="mini">' + avatarSvg + '</span><span class="star">⭐</span>';
    home.appendChild(nest);
    setTimeout(() => home.classList.remove("pop"), 520);

    friend.classList.add("done");
    friend.classList.remove("armed", "dragging");
    friend.removeAttribute("tabindex");
    friend.setAttribute("aria-label", name + " is home! Matched.");

    updateScore(matched + 1);
    announce(name + " found their home. " + matched + " of " + ANIMALS.length + " matched.");
    toast("Yay! " + name + " is home 🎉");

    if (matched === ANIMALS.length) {
      setTimeout(showCelebration, 650);
    }
  }

  function rejectMatch(friend, home) {
    friend.classList.remove("shake");
    void friend.offsetWidth;
    friend.classList.add("shake");
    home.classList.remove("over", "armed-target");
    setTimeout(() => friend.classList.remove("shake"), 460);
    announce("Not quite — try another home.");
    toast("Hmm, that's not the right home. Try again!");
  }

  /* ---------------- pointer drag & drop ---------------- */
  let drag = null;

  function onPointerDown(e) {
    const friend = e.target.closest(".friend");
    if (!friend || friend.classList.contains("done")) return;
    // only primary button / touch
    if (e.button !== undefined && e.button !== 0) return;

    clearArmed();
    e.preventDefault();

    const rect = friend.getBoundingClientRect();
    const ghost = friend.cloneNode(true);
    ghost.classList.add("friend-ghost");
    ghost.classList.remove("dragging", "armed", "shake");
    ghost.style.setProperty("--ghost-w", rect.width + "px");
    document.body.appendChild(ghost);

    drag = {
      friend,
      ghost,
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      pointerId: e.pointerId,
      moved: false,
      lastHome: null
    };

    friend.classList.add("dragging");
    moveGhost(e.clientX, e.clientY);
    highlightTargets(true);

    friend.setPointerCapture && friend.setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  function moveGhost(x, y) {
    drag.ghost.style.left = x - drag.offX + "px";
    drag.ghost.style.top = y - drag.offY + "px";
  }

  function homeUnderPoint(x, y) {
    drag.ghost.style.visibility = "hidden";
    const el = document.elementFromPoint(x, y);
    drag.ghost.style.visibility = "";
    const home = el && el.closest ? el.closest(".home") : null;
    if (home && !isFilled(home)) return home;
    return null;
  }

  function onPointerMove(e) {
    if (!drag) return;
    drag.moved = true;
    moveGhost(e.clientX, e.clientY);

    const home = homeUnderPoint(e.clientX, e.clientY);
    if (home !== drag.lastHome) {
      if (drag.lastHome) drag.lastHome.classList.remove("over");
      if (home) home.classList.add("over");
      drag.lastHome = home;
    }
  }

  function onPointerUp(e) {
    if (!drag) return;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);

    const { friend, ghost } = drag;
    const home = drag.lastHome || homeUnderPoint(e.clientX, e.clientY);

    ghost.remove();
    friend.classList.remove("dragging");
    highlightTargets(false);
    if (home) home.classList.remove("over");

    const d = drag;
    drag = null;

    if (home && d.moved) {
      attemptMatch(friend, home);
    } else if (!d.moved) {
      // treat as a tap → arm for keyboard-style placement
      armFriend(friend);
    }
  }

  function highlightTargets(on) {
    homeStack.querySelectorAll(".home").forEach((h) => {
      if (isFilled(h)) return;
      h.classList.toggle("droppable", on);
    });
  }

  /* ---------------- keyboard / tap fallback ---------------- */
  function armFriend(friend) {
    if (friend.classList.contains("done")) return;
    clearArmed();
    armed = friend;
    friend.classList.add("armed");
    homeStack.querySelectorAll(".home").forEach((h) => {
      if (!isFilled(h)) h.classList.add("armed-target");
    });
    const name = $(".friend-name", friend).textContent;
    announce(name + " picked up. Now choose a home.");
    toast("Picked up " + name + " — now tap a home!");
  }

  function clearArmed() {
    if (armed) armed.classList.remove("armed");
    armed = null;
    homeStack.querySelectorAll(".home").forEach((h) =>
      h.classList.remove("armed-target")
    );
  }

  function placeOnHome(home) {
    if (!armed) {
      announce("Pick up a friend first.");
      toast("Tap a friend first 🐾");
      return;
    }
    const friend = armed;
    const ok = attemptMatch(friend, home);
    clearArmed();
    if (!ok && !isFilled(home)) {
      // wrong target: keep the friend available, re-arm nothing
    }
  }

  function onFriendKey(e) {
    const friend = e.target.closest(".friend");
    if (!friend) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (armed === friend) {
        clearArmed();
        announce("Put down.");
      } else {
        armFriend(friend);
      }
    } else if (e.key === "Escape") {
      clearArmed();
    }
  }

  function onHomeKey(e) {
    const home = e.target.closest(".home");
    if (!home || isFilled(home)) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      placeOnHome(home);
    }
  }

  /* ---------------- celebration ---------------- */
  function showCelebration() {
    spawnConfetti();
    celebrate.hidden = false;
    announce("All matched! You found a home for every friend.");
    const btn = $("#playAgainBtn");
    btn && btn.focus();
  }

  function hideCelebration() {
    celebrate.hidden = true;
    $("#confetti").innerHTML = "";
  }

  function spawnConfetti() {
    const wrap = $("#confetti");
    wrap.innerHTML = "";
    const colors = ["#ff8a3d", "#5ec5d6", "#ffd23f", "#ff6f9c", "#7bd389"];
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      p.style.animationDelay = Math.random() * 0.5 + "s";
      p.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      wrap.appendChild(p);
    }
  }

  /* ---------------- wiring ---------------- */
  friendStack.addEventListener("pointerdown", onPointerDown);
  friendStack.addEventListener("keydown", onFriendKey);

  homeStack.addEventListener("keydown", onHomeKey);
  // click/tap a home (works for mouse + as fallback if pointerup missed)
  homeStack.addEventListener("click", (e) => {
    const home = e.target.closest(".home");
    if (home && armed) placeOnHome(home);
  });

  // tap a friend with mouse click (in case pointer events flagged moved oddly)
  friendStack.addEventListener("click", (e) => {
    const friend = e.target.closest(".friend");
    if (!friend || friend.classList.contains("done")) return;
    // pointerdown already handled tap-arm for touch; guard double-arm
    if (drag) return;
  });

  $("#resetBtn").addEventListener("click", () => {
    hideCelebration();
    build();
    toast("Fresh round — let's play! 🌟");
    announce("New round started. Match every friend to their home.");
  });

  $("#playAgainBtn").addEventListener("click", () => {
    hideCelebration();
    build();
    const first = friendStack.querySelector(".friend");
    first && first.focus();
  });

  // dyslexia-friendly / easy-read toggle
  const dysToggle = $("#dysToggle");
  dysToggle.addEventListener("click", () => {
    const on = dysToggle.getAttribute("aria-pressed") === "true";
    dysToggle.setAttribute("aria-pressed", String(!on));
    document.body.classList.toggle("easy-read", !on);
    toast(!on ? "Easy-read font on 📖" : "Easy-read font off");
  });

  // close celebration on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !celebrate.hidden) hideCelebration();
  });

  build();
})();
