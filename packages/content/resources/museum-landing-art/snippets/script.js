(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2600);
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- search (stub) ---------- */
  var searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      toast("Collection search is offline in this demo.");
    });
  }

  /* ---------- exhibition filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var exhCards = Array.prototype.slice.call(document.querySelectorAll(".exh"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      var filter = chip.getAttribute("data-filter");
      exhCards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-state") === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- exhibition detail modal ---------- */
  var details = {
    northern: {
      kicker: "On view · Gallery II",
      title: "Light & Pigment: The Northern Tradition",
      body: "Sixty works trace how painters of the Lowlands and Baltic coast learned to render daylight itself — from candle-lit interiors to the silver flatness of a sea fog. Includes loans from four private collections shown publicly for the first time."
    },
    marchetti: {
      kicker: "On view · Gallery V",
      title: "Marchetti: A Life in Red",
      body: "Forty canvases by Hélène Marchetti (1849–1921), reunited for the first time since her studio sale. The retrospective follows her restless use of vermilion across portraiture, still life, and the late atelier scenes."
    },
    gold: {
      kicker: "Opens 03 Oct · Gallery I",
      title: "Gold Ground: Devotion in the Trecento",
      body: "Gilded panels and altarpieces from fourteenth-century Italy, displayed together for the first time in a generation. A rare chance to see how light, gold leaf, and tempera conspired to make the sacred visible."
    },
    quiet: {
      kicker: "Opens 14 Nov · Gallery III",
      title: "The Quiet Room: Interiors 1850–1920",
      body: "An exhibition about stillness — thresholds, half-open windows, and the patient light of empty rooms. Seventy works survey domestic space as a subject worthy of devotion."
    }
  };

  var modal = document.getElementById("modal");
  var modalClose = document.getElementById("modalClose");
  var lastFocus = null;

  function openModal(key) {
    var d = details[key];
    if (!d || !modal) return;
    document.getElementById("modalKicker").textContent = d.kicker;
    document.getElementById("modalTitle").textContent = d.title;
    document.getElementById("modalBody").textContent = d.body;
    lastFocus = document.activeElement;
    modal.hidden = false;
    modalClose.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll("[data-detail]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.getAttribute("data-detail"));
    });
  });
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    document.getElementById("modalCta").addEventListener("click", closeModal);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  /* ---------- save / favourite works ---------- */
  var savedCount = 0;
  var savedNote = document.getElementById("savedNote");
  document.querySelectorAll(".save").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      btn.textContent = on ? "♡" : "♥";
      savedCount += on ? -1 : 1;
      if (savedCount < 0) savedCount = 0;
      if (savedNote) {
        savedNote.textContent = savedCount === 0
          ? ""
          : savedCount + (savedCount === 1 ? " work saved to your tour." : " works saved to your tour.");
      }
      toast(on ? "Removed from your tour." : "Saved to your tour.");
    });
  });

  /* ---------- ticket reservation ---------- */
  var ticketBtns = Array.prototype.slice.call(document.querySelectorAll(".ticket"));
  var qtyNum = document.getElementById("qtyNum");
  var qtyMinus = document.getElementById("qtyMinus");
  var qtyPlus = document.getElementById("qtyPlus");
  var totalEl = document.getElementById("ticketTotal");
  var checkoutBtn = document.getElementById("checkoutBtn");

  var state = { price: 0, name: null, qty: 1 };

  function renderTotal() {
    if (totalEl) totalEl.textContent = "$" + state.price * state.qty;
    if (qtyNum) qtyNum.textContent = String(state.qty);
  }

  ticketBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      ticketBtns.forEach(function (b) { b.classList.remove("is-selected"); });
      btn.classList.add("is-selected");
      state.price = parseInt(btn.getAttribute("data-price"), 10);
      state.name = btn.getAttribute("data-name");
      renderTotal();
    });
  });

  if (qtyMinus) qtyMinus.addEventListener("click", function () {
    state.qty = Math.max(1, state.qty - 1);
    renderTotal();
  });
  if (qtyPlus) qtyPlus.addEventListener("click", function () {
    state.qty = Math.min(12, state.qty + 1);
    renderTotal();
  });

  if (checkoutBtn) checkoutBtn.addEventListener("click", function () {
    if (!state.name) {
      toast("Please choose a ticket type first.");
      return;
    }
    toast(state.qty + " × " + state.name + " reserved — $" + state.price * state.qty + " held.");
  });

  /* ---------- membership ctas ---------- */
  document.querySelectorAll("[data-cta^='join-']").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tier = btn.getAttribute("data-cta").replace("join-", "");
      toast("Joining as " + tier.charAt(0).toUpperCase() + tier.slice(1) + " — welcome.");
    });
  });

  /* ---------- newsletter ---------- */
  var newsForm = document.getElementById("newsForm");
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("newsEmail");
      toast("Subscribed — the next dispatch is on its way.");
      if (email) email.value = "";
    });
  }

  /* ---------- generic ctas ---------- */
  ["header-tickets", "hero-tickets", "browse-all"].forEach(function (id) {
    var el = document.querySelector("[data-cta='" + id + "']");
    if (el && id === "browse-all") {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        toast("The full catalogue is offline in this demo.");
      });
    }
  });

  renderTotal();
})();
