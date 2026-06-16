(function () {
  "use strict";

  var STORAGE_KEY = "stealthis.stickerBoard.v1";
  var TOTAL_SLOTS = 12;
  var CHEST_GOAL = 6; // stickers per reward chest

  /* ---------- sticker artwork (inline SVG, no external assets) ---------- */
  // Each sticker is a small self-contained SVG drawing.
  var STICKERS = {
    star: {
      label: "gold star",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Gold star sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#ffd23f" stroke-width="3"/>' +
        '<path d="M32 12l5.6 11.4 12.6 1.8-9.1 8.9 2.1 12.5L32 41.2l-11.2 6 2.1-12.5-9.1-8.9 12.6-1.8z" fill="#ffd23f" stroke="#ff8a3d" stroke-width="2" stroke-linejoin="round"/>' +
        '</svg>',
    },
    heart: {
      label: "happy heart",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Heart sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#ff6f9c" stroke-width="3"/>' +
        '<path d="M32 48C18 38 14 30 14 24a9 9 0 0 1 18-2 9 9 0 0 1 18 2c0 6-4 14-18 24z" fill="#ff6f9c"/>' +
        '<circle cx="26" cy="26" r="3" fill="#fff" opacity="0.8"/>' +
        "</svg>",
    },
    rocket: {
      label: "zooming rocket",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Rocket sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#5ec5d6" stroke-width="3"/>' +
        '<path d="M32 12c8 4 12 12 12 22l-6 5h-12l-6-5c0-10 4-18 12-22z" fill="#a98cff"/>' +
        '<circle cx="32" cy="28" r="4.5" fill="#fff"/>' +
        '<path d="M26 39l-5 8 6-2zM38 39l5 8-6-2z" fill="#ff8a3d"/>' +
        '<path d="M28 45h8l-4 8z" fill="#ffd23f"/>' +
        "</svg>",
    },
    rainbow: {
      label: "bright rainbow",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Rainbow sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#7bd389" stroke-width="3"/>' +
        '<path d="M14 44a18 18 0 0 1 36 0" fill="none" stroke="#ff6f9c" stroke-width="5"/>' +
        '<path d="M19 44a13 13 0 0 1 26 0" fill="none" stroke="#ffd23f" stroke-width="5"/>' +
        '<path d="M24 44a8 8 0 0 1 16 0" fill="none" stroke="#5ec5d6" stroke-width="5"/>' +
        '<circle cx="16" cy="44" r="4" fill="#fff" stroke="#5ec5d6" stroke-width="2"/>' +
        '<circle cx="48" cy="44" r="4" fill="#fff" stroke="#5ec5d6" stroke-width="2"/>' +
        "</svg>",
    },
    butterfly: {
      label: "fluttering butterfly",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Butterfly sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#a98cff" stroke-width="3"/>' +
        '<ellipse cx="22" cy="26" rx="9" ry="11" fill="#ff6f9c"/>' +
        '<ellipse cx="42" cy="26" rx="9" ry="11" fill="#5ec5d6"/>' +
        '<ellipse cx="23" cy="40" rx="7" ry="8" fill="#ffd23f"/>' +
        '<ellipse cx="41" cy="40" rx="7" ry="8" fill="#7bd389"/>' +
        '<rect x="30.5" y="20" width="3" height="26" rx="1.5" fill="#2c2350"/>' +
        '<path d="M32 20c-2-4-6-5-9-4M32 20c2-4 6-5 9-4" stroke="#2c2350" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        "</svg>",
    },
    sun: {
      label: "smiling sun",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Sun sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#ff8a3d" stroke-width="3"/>' +
        '<g stroke="#ff8a3d" stroke-width="3" stroke-linecap="round">' +
        '<path d="M32 8v6M32 50v6M8 32h6M50 32h6M15 15l4 4M45 45l4 4M49 15l-4 4M19 45l-4 4"/></g>' +
        '<circle cx="32" cy="32" r="14" fill="#ffd23f"/>' +
        '<circle cx="27" cy="30" r="2" fill="#2c2350"/>' +
        '<circle cx="37" cy="30" r="2" fill="#2c2350"/>' +
        '<path d="M27 36q5 5 10 0" stroke="#2c2350" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        "</svg>",
    },
    crown: {
      label: "shiny crown",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Crown sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#ffd23f" stroke-width="3"/>' +
        '<path d="M16 42l-2-18 11 8 7-12 7 12 11-8-2 18z" fill="#ffd23f" stroke="#ff8a3d" stroke-width="2" stroke-linejoin="round"/>' +
        '<rect x="16" y="42" width="32" height="6" rx="2" fill="#ff8a3d"/>' +
        '<circle cx="23" cy="32" r="2.4" fill="#ff6f9c"/>' +
        '<circle cx="32" cy="30" r="2.4" fill="#5ec5d6"/>' +
        '<circle cx="41" cy="32" r="2.4" fill="#7bd389"/>' +
        "</svg>",
    },
    flower: {
      label: "cheerful flower",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Flower sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#ff6f9c" stroke-width="3"/>' +
        '<g fill="#ff6f9c">' +
        '<circle cx="32" cy="18" r="8"/><circle cx="32" cy="46" r="8"/>' +
        '<circle cx="18" cy="32" r="8"/><circle cx="46" cy="32" r="8"/></g>' +
        '<circle cx="32" cy="32" r="9" fill="#ffd23f"/>' +
        "</svg>",
    },
    moon: {
      label: "sleepy moon",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Moon sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#a98cff" stroke-width="3"/>' +
        '<path d="M40 18a16 16 0 1 0 0 28 13 13 0 0 1 0-28z" fill="#a98cff"/>' +
        '<circle cx="46" cy="22" r="2" fill="#ffd23f"/>' +
        '<circle cx="50" cy="34" r="1.6" fill="#ffd23f"/>' +
        '<circle cx="44" cy="44" r="1.6" fill="#ffd23f"/>' +
        "</svg>",
    },
    cloud: {
      label: "puffy cloud",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Cloud sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#5ec5d6" stroke-width="3"/>' +
        '<path d="M22 42a8 8 0 0 1 0-16 11 11 0 0 1 21 2 7 7 0 0 1-1 14z" fill="#5ec5d6"/>' +
        '<circle cx="26" cy="34" r="2.2" fill="#fff"/>' +
        '<circle cx="34" cy="34" r="2.2" fill="#fff"/>' +
        '<path d="M27 39q5 4 10 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        "</svg>",
    },
    fish: {
      label: "bubbly fish",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Fish sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#7bd389" stroke-width="3"/>' +
        '<path d="M14 32c6-10 26-10 32 0-6 10-26 10-32 0z" fill="#5ec5d6"/>' +
        '<path d="M46 32l8-8v16z" fill="#7bd389"/>' +
        '<circle cx="24" cy="30" r="2.6" fill="#fff"/>' +
        '<circle cx="24" cy="30" r="1.2" fill="#2c2350"/>' +
        '<circle cx="50" cy="22" r="2" fill="#5ec5d6"/>' +
        "</svg>",
    },
    gift: {
      label: "wrapped gift",
      svg:
        '<svg viewBox="0 0 64 64" role="img" aria-label="Gift sticker">' +
        '<circle cx="32" cy="32" r="30" fill="#fff" stroke="#ff8a3d" stroke-width="3"/>' +
        '<rect x="16" y="28" width="32" height="22" rx="3" fill="#ff6f9c"/>' +
        '<rect x="16" y="22" width="32" height="8" rx="3" fill="#ff8a3d"/>' +
        '<rect x="29" y="22" width="6" height="28" fill="#ffd23f"/>' +
        '<path d="M32 22c-4-8-12-4-7 0M32 22c4-8 12-4 7 0" fill="#ffd23f"/>' +
        "</svg>",
    },
  };

  // The golden reward sticker is special and only earned by unlocking a chest.
  var GOLD_STICKER = {
    label: "golden trophy",
    svg:
      '<svg viewBox="0 0 64 64" role="img" aria-label="Golden trophy sticker">' +
      '<circle cx="32" cy="32" r="30" fill="#fff7df" stroke="#ff8a3d" stroke-width="3"/>' +
      '<path d="M20 14h24v8a12 12 0 0 1-24 0z" fill="#ffd23f" stroke="#ff8a3d" stroke-width="2"/>' +
      '<path d="M20 16h-6a8 8 0 0 0 8 8M44 16h6a8 8 0 0 1-8 8" fill="none" stroke="#ff8a3d" stroke-width="3"/>' +
      '<rect x="29" y="34" width="6" height="8" fill="#ff8a3d"/>' +
      '<rect x="22" y="42" width="20" height="6" rx="2" fill="#ff8a3d"/>' +
      '<path d="M32 17l1.6 3.4 3.4.5-2.6 2.4.7 3.5L32 25.5 28.9 27l.7-3.5-2.6-2.4 3.4-.5z" fill="#fff"/>' +
      "</svg>",
  };

  /* ---------- tasks ---------- */
  // id is stable so progress persists; sticker is the artwork popped when done.
  var TASKS = [
    { id: "teeth", emoji: "🪥", label: "Brush my teeth", sticker: "star" },
    { id: "bed", emoji: "🛏️", label: "Make my bed", sticker: "cloud" },
    { id: "read", emoji: "📖", label: "Read a story", sticker: "moon" },
    { id: "veggies", emoji: "🥦", label: "Eat my veggies", sticker: "flower" },
    { id: "tidy", emoji: "🧸", label: "Tidy my toys", sticker: "heart" },
    { id: "kind", emoji: "🤝", label: "Be kind to a friend", sticker: "rainbow" },
    { id: "water", emoji: "🪴", label: "Water the plant", sticker: "butterfly" },
    { id: "exercise", emoji: "🤸", label: "Wiggle and stretch", sticker: "rocket" },
  ];

  /* ---------- state ---------- */
  var state = loadState();

  function freshState() {
    return {
      done: {}, // taskId -> true
      board: [], // array of sticker keys, in order earned
      chestsUnlocked: 0,
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return freshState();
      return {
        done: parsed.done && typeof parsed.done === "object" ? parsed.done : {},
        board: Array.isArray(parsed.board) ? parsed.board : [],
        chestsUnlocked:
          typeof parsed.chestsUnlocked === "number" ? parsed.chestsUnlocked : 0,
      };
    } catch (e) {
      return freshState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage may be unavailable (private mode); demo still works in-memory */
    }
  }

  /* ---------- DOM ---------- */
  var $ = function (sel) {
    return document.querySelector(sel);
  };

  var boardEl = $("#board");
  var tasklistEl = $("#tasklist");
  var earnedCountEl = $("#earned-count");
  var slotTotalEl = $("#slot-total");
  var chestFillEl = $("#chest-fill");
  var chestPctEl = $("#chest-pct");
  var chestBarEl = $("#chest-bar");
  var chestHintEl = $("#chest-hint");
  var chestIconEl = $("#chest-icon");
  var footEl = $("#tasks-foot");
  var fxLayer = $("#fx-layer");
  var celebrateEl = $("#celebrate");
  var celebrateText = $("#celebrate-text");
  var celebrateClose = $("#celebrate-close");
  var toastEl = $("#toast");

  slotTotalEl.textContent = String(TOTAL_SLOTS);
  chestBarEl.setAttribute("aria-valuemax", String(CHEST_GOAL));

  /* ---------- toast helper ---------- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- build the empty board ---------- */
  function buildBoard() {
    boardEl.innerHTML = "";
    for (var i = 0; i < TOTAL_SLOTS; i++) {
      var li = document.createElement("li");
      li.className = "slot";
      li.setAttribute("data-index", String(i));
      li.setAttribute("role", "listitem");
      var ghost = document.createElement("span");
      ghost.className = "slot__ghost";
      ghost.textContent = "⭐";
      ghost.setAttribute("aria-hidden", "true");
      li.appendChild(ghost);
      boardEl.appendChild(li);
    }
  }

  function stickerData(key) {
    if (key === "gold") return GOLD_STICKER;
    return STICKERS[key] || STICKERS.star;
  }

  // Render a sticker into a slot. animate=true plays the bounce/pop.
  function fillSlot(index, key, animate) {
    var slot = boardEl.children[index];
    if (!slot) return;
    var data = stickerData(key);
    slot.classList.add("is-filled");
    if (key === "gold") slot.classList.add("is-gold");
    slot.setAttribute("aria-label", "Earned " + data.label + " sticker");

    var wrap = slot.querySelector(".slot__sticker");
    if (!wrap) {
      wrap = document.createElement("span");
      wrap.className = "slot__sticker";
      slot.appendChild(wrap);
    }
    wrap.innerHTML = data.svg;

    if (animate && !prefersReducedMotion) {
      slot.classList.remove("just-popped");
      // force reflow so the animation can replay
      void slot.offsetWidth;
      slot.classList.add("just-popped");
    }
  }

  // paint every already-earned sticker (on load) without animating
  function renderEarnedStickers() {
    for (var i = 0; i < state.board.length && i < TOTAL_SLOTS; i++) {
      fillSlot(i, state.board[i], false);
    }
  }

  /* ---------- task list ---------- */
  function buildTasks() {
    tasklistEl.innerHTML = "";
    TASKS.forEach(function (task) {
      var li = document.createElement("li");
      li.className = "task";
      li.setAttribute("data-id", task.id);
      if (state.done[task.id]) li.classList.add("is-done");

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "task__btn";
      btn.setAttribute("aria-pressed", state.done[task.id] ? "true" : "false");

      var check = document.createElement("span");
      check.className = "task__check";
      check.setAttribute("aria-hidden", "true");
      check.textContent = "✓";

      var emoji = document.createElement("span");
      emoji.className = "task__emoji";
      emoji.setAttribute("aria-hidden", "true");
      emoji.textContent = task.emoji;

      var label = document.createElement("span");
      label.className = "task__label";
      label.textContent = task.label;

      var reward = document.createElement("span");
      reward.className = "task__reward";
      reward.textContent = "+1 ⭐";

      btn.appendChild(check);
      btn.appendChild(emoji);
      btn.appendChild(label);
      btn.appendChild(reward);
      li.appendChild(btn);
      tasklistEl.appendChild(li);

      btn.addEventListener("click", function () {
        onTaskClick(task, li, btn, emoji);
      });
    });
  }

  function onTaskClick(task, li, btn, emojiEl) {
    if (state.done[task.id]) {
      // un-check: remove the last matching sticker for this task
      uncompleteTask(task, li, btn);
      return;
    }
    if (state.board.length >= TOTAL_SLOTS) {
      toast("Your board is full! Press Start over for a new one. 🎉");
      return;
    }

    state.done[task.id] = true;
    li.classList.add("is-done");
    btn.setAttribute("aria-pressed", "true");

    var index = state.board.length;
    state.board.push(task.sticker);
    saveState();

    flySticker(emojiEl, index, task.sticker);
    updateProgress();
    footEl.textContent = "Great job! You earned a " + stickerData(task.sticker).label + ". ⭐";
  }

  function uncompleteTask(task, li, btn) {
    // find the most recent board sticker matching this task's sticker key
    var idx = -1;
    for (var i = state.board.length - 1; i >= 0; i--) {
      if (state.board[i] === task.sticker) {
        idx = i;
        break;
      }
    }
    state.done[task.id] = false;
    li.classList.remove("is-done");
    btn.setAttribute("aria-pressed", "false");

    if (idx !== -1) state.board.splice(idx, 1);
    saveState();

    // rebuild the board cleanly so indices stay correct
    buildBoard();
    renderEarnedStickers();
    updateProgress();
    footEl.textContent = "Took a sticker back. You can earn it again any time!";
  }

  /* ---------- flying sticker animation ---------- */
  function flySticker(fromEl, slotIndex, key) {
    var targetSlot = boardEl.children[slotIndex];
    if (prefersReducedMotion || !fromEl || !targetSlot) {
      fillSlot(slotIndex, key, true);
      afterFill(slotIndex);
      return;
    }

    var from = fromEl.getBoundingClientRect();
    var to = targetSlot.getBoundingClientRect();

    var flyer = document.createElement("div");
    flyer.className = "flyer";
    flyer.innerHTML = stickerData(key).svg;
    flyer.style.left = from.left + from.width / 2 - 32 + "px";
    flyer.style.top = from.top + from.height / 2 - 32 + "px";
    fxLayer.appendChild(flyer);

    var dx = to.left + to.width / 2 - (from.left + from.width / 2);
    var dy = to.top + to.height / 2 - (from.top + from.height / 2);

    var anim = flyer.animate(
      [
        { transform: "translate(0,0) scale(0.7) rotate(-15deg)", opacity: 0.9 },
        { transform: "translate(" + dx * 0.5 + "px," + (dy * 0.5 - 40) + "px) scale(1.3) rotate(10deg)", opacity: 1, offset: 0.6 },
        { transform: "translate(" + dx + "px," + dy + "px) scale(0.8) rotate(0deg)", opacity: 1 },
      ],
      { duration: 620, easing: "cubic-bezier(0.3,1.1,0.4,1)", fill: "forwards" }
    );

    anim.onfinish = function () {
      flyer.remove();
      fillSlot(slotIndex, key, true);
      afterFill(slotIndex);
    };
    // safety fallback if Web Animations API is unavailable
    if (!flyer.animate) {
      flyer.remove();
      fillSlot(slotIndex, key, true);
      afterFill(slotIndex);
    }
  }

  function afterFill(slotIndex) {
    // count how many stickers earned so far toward a fresh chest
    var earnedTotal = state.board.length;
    var chestsEarned = Math.floor(earnedTotal / CHEST_GOAL);
    if (chestsEarned > state.chestsUnlocked) {
      state.chestsUnlocked = chestsEarned;
      saveState();
      unlockChest();
    }
  }

  /* ---------- progress to next chest ---------- */
  function updateProgress() {
    var earned = state.board.length;
    earnedCountEl.textContent = String(earned);

    var into = earned % CHEST_GOAL;
    // when the board total is a clean multiple, the bar should read full just before reset
    var shownInto = into === 0 && earned > 0 ? CHEST_GOAL : into;
    var pct = Math.round((shownInto / CHEST_GOAL) * 100);

    chestFillEl.style.width = pct + "%";
    chestPctEl.textContent = pct + "%";
    chestBarEl.setAttribute("aria-valuenow", String(shownInto));

    var remaining = CHEST_GOAL - shownInto;
    if (earned >= TOTAL_SLOTS) {
      chestHintEl.textContent = "Board complete — amazing!";
      chestIconEl.textContent = "🏆";
      chestIconEl.classList.remove("is-ready");
    } else if (remaining <= 0) {
      chestHintEl.textContent = "Chest ready to open!";
      chestIconEl.textContent = "🎉";
      chestIconEl.classList.add("is-ready");
    } else {
      chestHintEl.textContent =
        "Earn " + remaining + (remaining === 1 ? " sticker" : " stickers") + " to unlock";
      chestIconEl.textContent = "🎁";
      chestIconEl.classList.remove("is-ready");
    }
  }

  /* ---------- chest unlock + celebration ---------- */
  function unlockChest() {
    confettiBurst();
    // award a special golden sticker if there's room
    if (state.board.length < TOTAL_SLOTS) {
      var goldIndex = state.board.length;
      state.board.push("gold");
      saveState();
      fillSlot(goldIndex, "gold", true);
    }
    updateProgress();

    var unlocked = state.chestsUnlocked;
    celebrateText.textContent =
      "You filled reward chest #" +
      unlocked +
      "! Here is a shiny golden trophy sticker for your board. Keep collecting!";
    openCelebrate();
  }

  function openCelebrate() {
    celebrateEl.hidden = false;
    celebrateClose.focus();
    document.addEventListener("keydown", onCelebrateKey);
  }

  function closeCelebrate() {
    celebrateEl.hidden = true;
    document.removeEventListener("keydown", onCelebrateKey);
    toast("Chest claimed! 🌟");
  }

  function onCelebrateKey(e) {
    if (e.key === "Escape") closeCelebrate();
    // simple focus trap: keep focus on the close button
    if (e.key === "Tab") {
      e.preventDefault();
      celebrateClose.focus();
    }
  }

  celebrateClose.addEventListener("click", closeCelebrate);
  celebrateEl.addEventListener("click", function (e) {
    if (e.target === celebrateEl) closeCelebrate();
  });

  /* ---------- confetti ---------- */
  function confettiBurst() {
    if (prefersReducedMotion) return;
    var colors = ["#ff8a3d", "#5ec5d6", "#ffd23f", "#ff6f9c", "#7bd389", "#a98cff"];
    var count = 70;
    for (var i = 0; i < count; i++) {
      var c = document.createElement("span");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 2.4 + Math.random() * 1.8 + "s";
      c.style.animationDelay = Math.random() * 0.4 + "s";
      c.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      if (Math.random() > 0.5) c.style.borderRadius = "50%";
      fxLayer.appendChild(c);
      (function (node) {
        setTimeout(function () {
          node.remove();
        }, 4600);
      })(c);
    }
  }

  /* ---------- easy-read toggle ---------- */
  var fontToggle = $("#font-toggle");
  fontToggle.addEventListener("click", function () {
    var on = document.body.classList.toggle("easy-read");
    fontToggle.setAttribute("aria-pressed", on ? "true" : "false");
    toast(on ? "Easy-read font on 🔤" : "Easy-read font off");
  });

  /* ---------- reset ---------- */
  var resetBtn = $("#reset-board");
  resetBtn.addEventListener("click", function () {
    state = freshState();
    saveState();
    buildBoard();
    buildTasks();
    updateProgress();
    footEl.textContent = "Fresh board! Finish a task to earn your first sticker.";
    toast("New empty board ready! ✨");
  });

  /* ---------- init ---------- */
  function init() {
    buildBoard();
    renderEarnedStickers();
    buildTasks();
    updateProgress();
    if (state.board.length > 0) {
      footEl.textContent =
        "Welcome back! You have " +
        state.board.length +
        (state.board.length === 1 ? " sticker" : " stickers") +
        " so far. Keep going!";
    }
  }

  init();
})();
