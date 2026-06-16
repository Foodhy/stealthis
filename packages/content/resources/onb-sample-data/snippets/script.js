(function () {
  "use strict";

  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");
  var banner = document.getElementById("banner");
  var emptyState = document.getElementById("empty-state");
  var skeleton = document.getElementById("skeleton");
  var rowsEl = document.getElementById("rows");
  var rowsBadge = document.getElementById("rows-badge");
  var clearBtn = document.getElementById("clear-btn");
  var choices = document.getElementById("choices");
  var toastEl = document.getElementById("toast");

  var variantBtns = Array.prototype.slice.call(
    document.querySelectorAll(".seg-btn[data-variant]")
  );
  var cardBtns = Array.prototype.slice.call(
    document.querySelectorAll(".seg-btn[data-cards]")
  );

  // ----- Fictional sample dataset -----
  var DEMO = [
    { deal: "Q3 Platform Upgrade", company: "Northwind Bakeries", owner: "Priya Nandakumar", stage: "proposal", value: 48000, hue: 248 },
    { deal: "Annual Renewal — Pro", company: "Halcyon Devices", owner: "Marcus Tilden", stage: "won", value: 31500, hue: 168 },
    { deal: "Pilot: Field Sync", company: "Cedar & Vale Logistics", owner: "Aisha Okonkwo", stage: "qualified", value: 12200, hue: 22 },
    { deal: "Seat Expansion (+40)", company: "Brightloom Studio", owner: "Devon Park", stage: "lead", value: 9800, hue: 320 },
    { deal: "Migration & Onboarding", company: "Tess Maritime", owner: "Priya Nandakumar", stage: "proposal", value: 27400, hue: 248 },
    { deal: "Security Add-on", company: "Quillstone Legal", owner: "Marcus Tilden", stage: "qualified", value: 15600, hue: 168 },
    { deal: "Replacement Tooling", company: "Oakmere Foundry", owner: "Aisha Okonkwo", stage: "lost", value: 22000, hue: 22 },
    { deal: "New Region Rollout", company: "Solane Health Group", owner: "Devon Park", stage: "lead", value: 64500, hue: 320 }
  ];

  var STAGE = {
    lead: { label: "Lead", cls: "chip-lead" },
    qualified: { label: "Qualified", cls: "chip-qual" },
    proposal: { label: "Proposal", cls: "chip-prop" },
    won: { label: "Won", cls: "chip-won" },
    lost: { label: "Lost", cls: "chip-lost" }
  };

  var state = {
    variant: "modal", // "modal" | "banner"
    cards: "thumb", // "thumb" | "text"
    populated: false,
    loading: false
  };
  var skeletonTimer = null;
  var lastFocus = null;

  // ----- Toast helper -----
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  function fmt(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function initials(name) {
    return name
      .split(" ")
      .map(function (p) {
        return p.charAt(0);
      })
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ----- Build a populated row -----
  function rowMarkup(d, i) {
    var s = STAGE[d.stage];
    return (
      '<div class="row" role="row" style="animation-delay:' + i * 45 + 'ms">' +
      '<div class="deal-cell" role="cell">' +
      '<span class="deal-dot" style="background:hsl(' + d.hue + ' 78% 60%)"></span>' +
      '<span class="deal-name">' + escapeHtml(d.deal) + "</span>" +
      "</div>" +
      '<div class="cell-muted cell-company" role="cell">' + escapeHtml(d.company) + "</div>" +
      '<div class="owner-cell cell-owner" role="cell">' +
      '<span class="avatar" style="background:hsl(' + d.hue + ' 64% 52%)">' + initials(d.owner) + "</span>" +
      '<span class="cell-muted">' + escapeHtml(d.owner) + "</span>" +
      "</div>" +
      '<div class="cell-stage" role="cell"><span class="chip ' + s.cls + '">' + s.label + "</span></div>" +
      '<div class="value-cell num" role="cell">' + fmt(d.value) + "</div>" +
      "</div>"
    );
  }

  function updateBadge() {
    var n = state.populated ? DEMO.length : 0;
    rowsBadge.textContent = n + (n === 1 ? " deal" : " deals");
  }

  // ----- State transitions -----
  function showEmpty() {
    state.populated = false;
    state.loading = false;
    if (skeletonTimer) {
      clearTimeout(skeletonTimer);
      skeletonTimer = null;
    }
    skeleton.hidden = true;
    rowsEl.innerHTML = "";
    emptyState.hidden = false;
    clearBtn.hidden = true;
    updateBadge();
  }

  function populate() {
    state.populated = true;
    state.loading = false;
    skeleton.hidden = true;
    emptyState.hidden = true;
    rowsEl.innerHTML = DEMO.map(rowMarkup).join("");
    clearBtn.hidden = false;
    updateBadge();
  }

  function loadDemo() {
    if (state.loading || state.populated) return;
    closePrompt();
    // brief skeleton, then populated state
    state.loading = true;
    emptyState.hidden = true;
    rowsEl.innerHTML = "";
    skeleton.hidden = false;
    if (skeletonTimer) clearTimeout(skeletonTimer);
    skeletonTimer = setTimeout(function () {
      populate();
      toast("Loaded 8 example deals — explore away");
    }, 950);
  }

  function startScratch() {
    closePrompt();
    // workspace stays empty; nothing else to do
  }

  function clearDemo() {
    showEmpty();
    toast("Demo data cleared");
    // bring the prompt back so it can be re-tried
    openPrompt();
  }

  // ----- Prompt (modal or banner) -----
  function openPrompt() {
    if (state.populated) return;
    if (state.variant === "modal") {
      lastFocus = document.activeElement;
      overlay.hidden = false;
      banner.hidden = true;
      // focus first choice for keyboard users
      var first = modal.querySelector(".choice");
      if (first) first.focus();
    } else {
      banner.hidden = false;
      overlay.hidden = true;
    }
  }

  function closePrompt() {
    overlay.hidden = true;
    banner.hidden = true;
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
      lastFocus = null;
    }
  }

  // Re-render the prompt for the current variant if it's currently meant to be open
  function refreshPrompt() {
    var promptOpen = !overlay.hidden || !banner.hidden;
    if (state.populated) {
      overlay.hidden = true;
      banner.hidden = true;
      return;
    }
    if (promptOpen) {
      openPrompt();
    }
  }

  // ----- Action delegation (works in modal + banner) -----
  function handleAction(action) {
    if (action === "load-demo") loadDemo();
    else if (action === "scratch") startScratch();
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (el) {
      e.preventDefault();
      handleAction(el.getAttribute("data-action"));
    }
  });

  clearBtn.addEventListener("click", clearDemo);

  // Esc closes the modal overlay (treated as "start from scratch")
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) {
      e.preventDefault();
      startScratch();
    }
  });

  // Focus trap inside the modal
  overlay.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || overlay.hidden) return;
    var focusables = modal.querySelectorAll(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // ----- Variant switchers -----
  function setActive(btns, attr, val) {
    btns.forEach(function (b) {
      var on = b.getAttribute(attr) === val;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  variantBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      state.variant = b.getAttribute("data-variant");
      setActive(variantBtns, "data-variant", state.variant);
      refreshPrompt();
    });
  });

  cardBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      state.cards = b.getAttribute("data-cards");
      setActive(cardBtns, "data-cards", state.cards);
      choices.classList.toggle("cards-text", state.cards === "text");
    });
  });

  // ----- Init -----
  showEmpty();
  openPrompt();
})();
