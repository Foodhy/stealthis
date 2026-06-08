(function () {
  "use strict";

  /* ---- Toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2800);
  }

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var open = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close after tapping a link
    primaryNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Hero club search ---- */
  var heroSearch = document.getElementById("heroSearch");
  var heroZip = document.getElementById("heroZip");
  var locInput = document.getElementById("locInput");
  if (heroSearch) {
    heroSearch.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = (heroZip && heroZip.value.trim()) || "";
      var locations = document.getElementById("locations");
      if (locInput) locInput.value = q;
      filterLocations(q);
      if (locations) locations.scrollIntoView({ behavior: "smooth" });
      toast(q ? "Showing clubs near “" + q + "”" : "Showing all clubs near you");
    });
  }

  /* ---- Locations filter ---- */
  var cards = Array.prototype.slice.call(document.querySelectorAll(".loc-card"));
  var locEmpty = document.getElementById("locEmpty");

  function filterLocations(query) {
    var q = query.trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var hay = (card.getAttribute("data-loc") || "") + " " + card.textContent.toLowerCase();
      var match = q === "" || hay.indexOf(q) !== -1;
      card.style.display = match ? "" : "none";
      if (match) visible++;
    });
    if (locEmpty) locEmpty.hidden = visible !== 0;
  }

  if (locInput) {
    locInput.addEventListener("input", function () {
      filterLocations(locInput.value);
    });
  }

  /* ---- Plan selection ---- */
  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var plan = btn.getAttribute("data-plan");
      var price = btn.getAttribute("data-price");
      toast(plan + " plan selected — " + price + ". First month free!");
    });
  });

  /* ---- FAQ accordion ---- */
  var faqList = document.getElementById("faqList");
  if (faqList) {
    var questions = Array.prototype.slice.call(faqList.querySelectorAll(".faq-q"));
    questions.forEach(function (q) {
      var answer = q.nextElementSibling;
      q.addEventListener("click", function () {
        var isOpen = q.getAttribute("aria-expanded") === "true";
        // Close all others (single-open accordion)
        questions.forEach(function (other) {
          if (other !== q) {
            other.setAttribute("aria-expanded", "false");
            other.nextElementSibling.style.maxHeight = null;
          }
        });
        if (isOpen) {
          q.setAttribute("aria-expanded", "false");
          answer.style.maxHeight = null;
        } else {
          q.setAttribute("aria-expanded", "true");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  }
})();
