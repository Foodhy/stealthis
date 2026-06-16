(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  /* ---------- Save collection toggle ---------- */
  var saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    var labelEl = saveBtn.querySelector(".btn__label");
    var iconEl = saveBtn.querySelector(".btn__icon");
    saveBtn.addEventListener("click", function () {
      var saved = saveBtn.classList.toggle("is-saved");
      saveBtn.setAttribute("aria-pressed", saved ? "true" : "false");
      if (labelEl) labelEl.textContent = saved ? "Saved" : "Save collection";
      if (iconEl) iconEl.textContent = saved ? "✅" : "🔖";
      toast(saved ? "Added to your cookbook shelf" : "Removed from your shelf");
    });
  }

  /* ---------- Grid / List view switch ---------- */
  var book = document.querySelector(".book");
  var viewGrid = document.getElementById("viewGrid");
  var viewList = document.getElementById("viewList");

  function setView(view) {
    if (!book) return;
    book.setAttribute("data-view", view);
    var gridActive = view === "grid";
    viewGrid.classList.toggle("is-active", gridActive);
    viewList.classList.toggle("is-active", !gridActive);
    viewGrid.setAttribute("aria-pressed", gridActive ? "true" : "false");
    viewList.setAttribute("aria-pressed", !gridActive ? "true" : "false");
  }
  if (viewGrid && viewList) {
    viewGrid.addEventListener("click", function () {
      setView("grid");
    });
    viewList.addEventListener("click", function () {
      setView("list");
    });
  }

  /* ---------- Chapter jump-nav + scrollspy ---------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".chapnav__link")
  );
  var sections = links
    .map(function (l) {
      return document.querySelector(l.getAttribute("href"));
    })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (l) {
      l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      observer.observe(s);
    });
  }

  /* Smooth-scroll active state on click (immediate feedback) */
  links.forEach(function (l) {
    l.addEventListener("click", function () {
      setActive(l.getAttribute("href").slice(1));
    });
  });

  /* ---------- Card "open recipe" affordance ---------- */
  var cards = document.querySelectorAll(".card");
  cards.forEach(function (card) {
    function open() {
      var title = card.querySelector(".card__title");
      toast("Opening “" + (title ? title.textContent : "recipe") + "”…");
    }
    card.addEventListener("click", open);
    card.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        open();
      }
    });
  });
})();
