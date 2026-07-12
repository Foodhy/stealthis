(function () {
  "use strict";

  /* ---------- Data ---------- */
  var STOCK = [
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=70"
  ];

  // 6 photo slots; null = empty
  var photos = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=70",
    null, null, null, null, null
  ];

  var INTERESTS = [
    { id: "ceramics", label: "Ceramics", emoji: "🏺" },
    { id: "hiking", label: "Hiking", emoji: "🥾" },
    { id: "sourdough", label: "Sourdough", emoji: "🍞" },
    { id: "vinyl", label: "Vinyl", emoji: "🎶" },
    { id: "coffee", label: "Specialty coffee", emoji: "☕" },
    { id: "climbing", label: "Bouldering", emoji: "🧗" },
    { id: "film", label: "Film photography", emoji: "📷" },
    { id: "travel", label: "Slow travel", emoji: "🌍" },
    { id: "cats", label: "Cats", emoji: "🐈" },
    { id: "gaming", label: "Co-op games", emoji: "🎮" },
    { id: "wine", label: "Natural wine", emoji: "🍷" },
    { id: "yoga", label: "Yoga", emoji: "🧘" }
  ];
  var selectedInterests = ["ceramics", "coffee"];
  var MAX_INTERESTS = 6;

  var PROMPT_BANK = [
    "My most irrational fear is…",
    "The way to win me over is…",
    "A shower thought I recently had…",
    "Two truths and a lie…",
    "My simple pleasures are…",
    "I geek out about…",
    "We'll get along if…",
    "The last thing I saved to my camera roll…",
    "My love language is…",
    "Green flags I look for…"
  ];
  // prompt: {q, a}
  var prompts = [
    { q: "I geek out about…", a: "The exact water temperature for a V60 pour-over. It's a problem." }
  ];
  var MAX_PROMPTS = 3;

  /* ---------- Elements ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var photoGrid = $("photoGrid");
  var chipsWrap = $("chips");
  var promptsWrap = $("prompts");
  var bio = $("bio");
  var toastEl = $("toast");

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- Photos: render + drag reorder ---------- */
  var dragFrom = null;

  function renderPhotos() {
    photoGrid.innerHTML = "";
    photos.forEach(function (src, i) {
      var cell = document.createElement("div");
      cell.className = "photo " + (src ? "filled" : "empty");
      cell.setAttribute("data-index", i);

      if (src) {
        cell.setAttribute("draggable", "true");
        cell.setAttribute("aria-label", "Photo " + (i + 1) + ", drag to reorder");
        cell.innerHTML =
          '<img src="' + src + '" alt="Profile photo ' + (i + 1) + '" />' +
          (i === 0 ? '<span class="main-badge">MAIN</span>' : "") +
          '<button class="remove" type="button" aria-label="Remove photo ' + (i + 1) + '">&times;</button>';
      } else {
        cell.setAttribute("role", "button");
        cell.setAttribute("tabindex", "0");
        cell.setAttribute("aria-label", "Add a photo");
        cell.innerHTML = '<span class="plus-lg">+</span>';
      }
      photoGrid.appendChild(cell);
    });
    updatePhotoCount();
  }

  function firstEmptyIndex() {
    for (var i = 0; i < photos.length; i++) { if (!photos[i]) return i; }
    return -1;
  }

  function updatePhotoCount() {
    var n = photos.filter(Boolean).length;
    $("photoCount").textContent = n + " / 6";
  }

  // Delegated events on the grid
  photoGrid.addEventListener("click", function (e) {
    var cell = e.target.closest(".photo");
    if (!cell) return;
    var idx = +cell.getAttribute("data-index");

    if (e.target.closest(".remove")) {
      photos[idx] = null;
      compactPhotos();
      renderPhotos();
      recompute();
      toast("Photo removed");
      return;
    }
    if (cell.classList.contains("empty")) {
      addPhoto(idx);
    }
  });

  photoGrid.addEventListener("keydown", function (e) {
    var cell = e.target.closest(".photo.empty");
    if (cell && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      addPhoto(+cell.getAttribute("data-index"));
    }
  });

  function addPhoto(idx) {
    // pick a stock image not already used
    var used = photos.filter(Boolean);
    var pick = STOCK.find(function (s) { return used.indexOf(s) === -1; }) || STOCK[0];
    photos[idx] = pick;
    renderPhotos();
    recompute();
    toast("Photo added — drag to reorder");
  }

  function compactPhotos() {
    var filled = photos.filter(Boolean);
    while (filled.length < 6) filled.push(null);
    photos = filled;
  }

  // Drag & drop reorder (HTML5)
  photoGrid.addEventListener("dragstart", function (e) {
    var cell = e.target.closest(".photo.filled");
    if (!cell) { e.preventDefault(); return; }
    dragFrom = +cell.getAttribute("data-index");
    cell.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(dragFrom)); } catch (err) {}
  });

  photoGrid.addEventListener("dragend", function () {
    dragFrom = null;
    Array.prototype.forEach.call(photoGrid.children, function (c) {
      c.classList.remove("dragging", "drop-target");
    });
  });

  photoGrid.addEventListener("dragover", function (e) {
    var cell = e.target.closest(".photo");
    if (dragFrom === null || !cell) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    Array.prototype.forEach.call(photoGrid.children, function (c) { c.classList.remove("drop-target"); });
    if (+cell.getAttribute("data-index") !== dragFrom) cell.classList.add("drop-target");
  });

  photoGrid.addEventListener("drop", function (e) {
    var cell = e.target.closest(".photo");
    if (dragFrom === null || !cell) return;
    e.preventDefault();
    var to = +cell.getAttribute("data-index");
    if (to === dragFrom) return;

    var moved = photos.splice(dragFrom, 1)[0];
    photos.splice(to, 0, moved);
    compactPhotos();
    renderPhotos();
    recompute();
    toast(to === 0 ? "New main photo set" : "Photos reordered");
  });

  /* ---------- Bio counter ---------- */
  bio.value = "Frontend dev by day, ceramics disaster by weekend. Currently training a sourdough starter named Kevin and losing.";
  function updateBio() {
    var len = bio.value.length;
    var max = +bio.getAttribute("maxlength");
    var el = $("bioCount");
    el.textContent = len + " / " + max;
    el.classList.toggle("warn", len > max - 40);
  }
  bio.addEventListener("input", function () { updateBio(); recompute(); });

  /* ---------- Interest chips ---------- */
  function renderChips() {
    chipsWrap.innerHTML = "";
    var atMax = selectedInterests.length >= MAX_INTERESTS;
    INTERESTS.forEach(function (it) {
      var on = selectedInterests.indexOf(it.id) !== -1;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (on ? " on" : "") + (!on && atMax ? " disabled" : "");
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("data-id", it.id);
      btn.innerHTML = '<span class="emoji" aria-hidden="true">' + it.emoji + "</span>" + it.label;
      chipsWrap.appendChild(btn);
    });
    $("chipCount").textContent = selectedInterests.length + " / " + MAX_INTERESTS;
  }

  chipsWrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    var pos = selectedInterests.indexOf(id);
    if (pos !== -1) {
      selectedInterests.splice(pos, 1);
    } else {
      if (selectedInterests.length >= MAX_INTERESTS) {
        toast("You can pick up to " + MAX_INTERESTS + " interests");
        return;
      }
      selectedInterests.push(id);
    }
    renderChips();
    recompute();
  });

  /* ---------- Prompts ---------- */
  function renderPrompts() {
    promptsWrap.innerHTML = "";
    prompts.forEach(function (p, i) {
      var card = document.createElement("div");
      card.className = "prompt-card";
      card.innerHTML =
        '<div class="prompt-q">' +
          '<span class="q-text" role="button" tabindex="0" data-change="' + i + '">' + p.q + "</span>" +
          '<button class="prompt-remove" type="button" data-remove="' + i + '" aria-label="Remove prompt">&times;</button>' +
        "</div>" +
        '<textarea class="prompt-answer" data-answer="' + i + '" rows="1" maxlength="180" ' +
          'placeholder="Tap to write your answer…">' + escapeHtml(p.a) + "</textarea>";
      promptsWrap.appendChild(card);
      autoGrow(card.querySelector(".prompt-answer"));
    });
    $("promptCount").textContent = prompts.length + " / " + MAX_PROMPTS;
    $("addPrompt").disabled = prompts.length >= MAX_PROMPTS;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function autoGrow(ta) {
    ta.style.height = "auto";
    ta.style.height = (ta.scrollHeight) + "px";
  }

  promptsWrap.addEventListener("input", function (e) {
    if (e.target.matches(".prompt-answer")) {
      var i = +e.target.getAttribute("data-answer");
      prompts[i].a = e.target.value;
      autoGrow(e.target);
      recompute();
    }
  });

  promptsWrap.addEventListener("click", function (e) {
    var rm = e.target.closest("[data-remove]");
    if (rm) {
      prompts.splice(+rm.getAttribute("data-remove"), 1);
      renderPrompts();
      recompute();
      toast("Prompt removed");
      return;
    }
    var ch = e.target.closest("[data-change]");
    if (ch) openSheet(+ch.getAttribute("data-change"));
  });

  promptsWrap.addEventListener("keydown", function (e) {
    var ch = e.target.closest("[data-change]");
    if (ch && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openSheet(+ch.getAttribute("data-change"));
    }
  });

  $("addPrompt").addEventListener("click", function () {
    if (prompts.length >= MAX_PROMPTS) return;
    openSheet(-1); // -1 = add new
  });

  /* ---------- Prompt picker sheet ---------- */
  var sheet = $("sheet"), scrim = $("sheetScrim"), sheetList = $("sheetList");
  var editingIndex = null;

  function openSheet(index) {
    editingIndex = index;
    var usedQs = prompts.map(function (p) { return p.q; });
    sheetList.innerHTML = "";
    PROMPT_BANK.forEach(function (q) {
      var used = usedQs.indexOf(q) !== -1 && !(index >= 0 && prompts[index].q === q);
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sheet-item" + (used ? " used" : "");
      b.textContent = q;
      b.setAttribute("data-q", q);
      sheetList.appendChild(b);
    });
    scrim.hidden = false;
    sheet.hidden = false;
    document.addEventListener("keydown", onSheetKey);
  }

  function closeSheet() {
    sheet.hidden = true;
    scrim.hidden = true;
    editingIndex = null;
    document.removeEventListener("keydown", onSheetKey);
  }
  function onSheetKey(e) { if (e.key === "Escape") closeSheet(); }

  sheetList.addEventListener("click", function (e) {
    var item = e.target.closest(".sheet-item");
    if (!item) return;
    var q = item.getAttribute("data-q");
    if (editingIndex === -1) {
      prompts.push({ q: q, a: "" });
      toast("Prompt added — write your answer");
    } else {
      prompts[editingIndex].q = q;
      toast("Prompt swapped");
    }
    closeSheet();
    renderPrompts();
    recompute();
  });

  scrim.addEventListener("click", closeSheet);
  $("sheetClose").addEventListener("click", closeSheet);

  /* ---------- Completeness meter ---------- */
  function recompute() {
    var parts = [];
    // photos: 30 pts, scaled 1..4+
    var pc = photos.filter(Boolean).length;
    parts.push(Math.min(pc / 4, 1) * 30);
    // bio: 25 pts (needs ~60 chars to max)
    parts.push(Math.min(bio.value.trim().length / 60, 1) * 25);
    // interests: 20 pts (needs 4)
    parts.push(Math.min(selectedInterests.length / 4, 1) * 20);
    // prompts: 25 pts (needs 3 answered)
    var answered = prompts.filter(function (p) { return p.a.trim().length > 4; }).length;
    parts.push(Math.min(answered / 3, 1) * 25);

    var pct = Math.round(parts.reduce(function (a, b) { return a + b; }, 0));
    if (pct > 100) pct = 100;

    $("meterPct").textContent = pct + "%";
    $("meterFill").style.width = pct + "%";
    var bar = $("meterBar");
    bar.setAttribute("aria-valuenow", String(pct));

    var hint;
    if (pct >= 100) hint = "Looking great — your profile is complete! ✨";
    else if (pct >= 75) hint = "Almost there — add one more thing to shine.";
    else if (pct >= 45) hint = "Nice start. More photos and prompts get more matches.";
    else hint = "Add a few more details to stand out.";
    $("meterHint").textContent = hint;
  }

  /* ---------- Save / discard ---------- */
  var pristine;
  function snapshot() {
    return JSON.stringify({
      photos: photos, bio: bio.value,
      interests: selectedInterests, prompts: prompts
    });
  }

  $("saveBtn").addEventListener("click", function () {
    pristine = snapshot();
    toast("Profile saved 💜");
  });

  $("discardBtn").addEventListener("click", function () {
    if (snapshot() === pristine) { toast("No changes to discard"); return; }
    var s = JSON.parse(pristine);
    photos = s.photos.slice();
    bio.value = s.bio;
    selectedInterests = s.interests.slice();
    prompts = s.prompts.map(function (p) { return { q: p.q, a: p.a }; });
    renderAll();
    toast("Changes discarded");
  });

  document.querySelector(".preview-btn").addEventListener("click", function () {
    toast("Preview mode — this is how others see you");
  });

  /* ---------- Init ---------- */
  function renderAll() {
    renderPhotos();
    renderChips();
    renderPrompts();
    updateBio();
    recompute();
  }
  renderAll();
  pristine = snapshot();
})();
