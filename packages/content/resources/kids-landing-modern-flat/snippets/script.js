(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* Wire every element that carries a data-toast attribute */
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var href = el.getAttribute("href");
      if (href && href.charAt(0) === "#" && href.length > 1) return; // let in-page anchors scroll
      if (href === "#" || el.tagName === "BUTTON") e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------- Stories: data-driven, filterable grid ---------- */
  var STORIES = [
    { title: "Luna & the Sleepy Moon", author: "by R. Okafor", emoji: "🌙", age: "3+", rating: 5, mood: "cozy", bg: "linear-gradient(160deg,#dfe7ff,#bcd0ff)", tag: "New" },
    { title: "Bramble the Brave Cub", author: "by M. Diaz", emoji: "🐻", age: "5+", rating: 5, mood: "brave", bg: "linear-gradient(160deg,#ffe6cf,#ffc79a)", tag: "Top 10" },
    { title: "The Giggling Goblin", author: "by P. Lindqvist", emoji: "👹", age: "4+", rating: 4, mood: "silly", bg: "linear-gradient(160deg,#d8f6dc,#a9e9b3)", tag: "" },
    { title: "Pip Counts the Stars", author: "by A. Mensah", emoji: "⭐", age: "2+", rating: 5, mood: "curious", bg: "linear-gradient(160deg,#fff0c2,#ffe07a)", tag: "" },
    { title: "Captain Marshmallow", author: "by J. Ueno", emoji: "🚀", age: "5+", rating: 4, mood: "brave", bg: "linear-gradient(160deg,#ffd9e5,#ffb3cf)", tag: "New" },
    { title: "Whiskers Won't Nap", author: "by S. Patel", emoji: "🐱", age: "3+", rating: 5, mood: "cozy", bg: "linear-gradient(160deg,#e6ddff,#c9b6ff)", tag: "" },
    { title: "Snorty the Bubble Pig", author: "by L. Romero", emoji: "🐷", age: "4+", rating: 4, mood: "silly", bg: "linear-gradient(160deg,#ffe0ec,#ffc0d8)", tag: "" },
    { title: "Why Is the Sky Blue?", author: "by D. Kowalski", emoji: "🔭", age: "6+", rating: 5, mood: "curious", bg: "linear-gradient(160deg,#d4f0f4,#a9e3ea)", tag: "Top 10" }
  ];

  var grid = document.getElementById("story-grid");
  var emptyMsg = document.getElementById("story-empty");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var activeMood = "all";

  function stars(n) {
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }

  function render(mood) {
    if (!grid) return;
    grid.innerHTML = "";
    var list = STORIES.filter(function (s) {
      return mood === "all" || s.mood === mood;
    });
    if (emptyMsg) emptyMsg.hidden = list.length !== 0;

    list.forEach(function (s, i) {
      var li = document.createElement("li");
      var card = document.createElement("button");
      card.type = "button";
      card.className = "story-card";
      card.style.animationDelay = i * 45 + "ms";
      card.setAttribute(
        "aria-label",
        s.title + ", " + s.author + ", ages " + s.age + ", rated " + s.rating + " of 5 stars"
      );
      card.innerHTML =
        '<div class="story-cover" style="background:' + s.bg + '">' +
          (s.tag ? '<span class="badge">' + s.tag + "</span>" : "") +
          '<span aria-hidden="true">' + s.emoji + "</span>" +
          '<span class="age">' + s.age + "</span>" +
        "</div>" +
        '<div class="story-meta">' +
          "<h3>" + s.title + "</h3>" +
          "<p>" + s.author + "</p>" +
          '<p class="stars" aria-hidden="true">' + stars(s.rating) + "</p>" +
        "</div>";
      card.addEventListener("click", function () {
        toast('Opening "' + s.title + '" — read-along is just a demo. 📖');
      });
      li.appendChild(card);
      grid.appendChild(li);
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-on");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-on");
      chip.setAttribute("aria-pressed", "true");
      activeMood = chip.getAttribute("data-mood");
      render(activeMood);
    });
  });

  render(activeMood);

  /* ---------- Newsletter form ---------- */
  var form = document.getElementById("news-form");
  var msg = document.getElementById("news-msg");
  var input = document.getElementById("news-email");
  if (form && msg && input) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = input.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        msg.textContent = "Oops — please pop in a valid email. 📨";
        msg.classList.add("err");
        input.focus();
        return;
      }
      msg.classList.remove("err");
      msg.textContent = "Yay! A free story is on its way to " + val + " 🎉";
      input.value = "";
      toast("Subscribed! Check your inbox for a story. 💛");
    });
  }
})();
