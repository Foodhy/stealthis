(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (el.tagName === "A") e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Phone screen scroll loop ---------- */
  var track = document.getElementById("readerTrack");
  if (track && !reduceMotion) {
    var offset = 0;
    var maxScroll = 0;
    function measure() {
      var viewport = track.parentElement ? track.parentElement.clientHeight : 0;
      maxScroll = Math.max(0, track.scrollHeight - viewport + 40);
    }
    measure();
    window.addEventListener("resize", measure);

    var dir = 1;
    var paused = false;
    var speed = 0.45; // px per frame

    function loop() {
      if (!paused && maxScroll > 0) {
        offset += dir * speed;
        if (offset >= maxScroll) {
          offset = maxScroll;
          dir = -1;
        } else if (offset <= 0) {
          offset = 0;
          dir = 1;
        }
        track.style.transform = "translateY(" + -offset + "px)";
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var phone = track.closest(".phone");
    if (phone) {
      phone.addEventListener("mouseenter", function () { paused = true; });
      phone.addEventListener("mouseleave", function () { paused = false; });
    }
  }

  /* ---------- Trending scroller (build + drag + auto) ---------- */
  var TITLES = [
    { t: "Neon Ronin", g: "Action · Sci-fi", emoji: "⚔️", rating: "4.9", reads: "8.2M", badge: "HOT", c: "#ffe1e5" },
    { t: "Iron Vanguard", g: "Mecha · Drama", emoji: "🤖", rating: "4.8", reads: "5.1M", badge: "", c: "#e1f3ff" },
    { t: "Petal & Thorn", g: "Romance", emoji: "🌸", rating: "4.9", reads: "6.7M", badge: "NEW", c: "#ffe6f0" },
    { t: "Hollow Crown", g: "Fantasy", emoji: "👑", rating: "4.7", reads: "3.9M", badge: "", c: "#fff3d6" },
    { t: "Static Heart", g: "Slice of life", emoji: "💚", rating: "4.8", reads: "4.4M", badge: "", c: "#e6fbef" },
    { t: "Graveyard Shift", g: "Horror", emoji: "👻", rating: "4.6", reads: "2.8M", badge: "", c: "#e7e8f5" },
    { t: "Sugar Riot", g: "Comedy", emoji: "🍭", rating: "4.9", reads: "7.0M", badge: "HOT", c: "#fff0e1" },
    { t: "Tidecaller", g: "Adventure", emoji: "🌊", rating: "4.7", reads: "3.1M", badge: "", c: "#dff5ff" }
  ];

  var trackEl = document.getElementById("scrollerTrack");
  if (trackEl) {
    TITLES.forEach(function (item, i) {
      var card = document.createElement("article");
      card.className = "card";
      card.innerHTML =
        '<div class="card__cover" style="background-color:' + item.c + '">' +
          '<span class="card__rank">#' + (i + 1) + "</span>" +
          (item.badge ? '<span class="card__badge">' + item.badge + "</span>" : "") +
          '<span class="card__emoji">' + item.emoji + "</span>" +
        "</div>" +
        '<div class="card__body">' +
          '<h3 class="card__title">' + item.t + "</h3>" +
          '<p class="card__genre">' + item.g + "</p>" +
          '<div class="card__meta">' +
            '<span class="card__rating"><span class="star">★</span> ' + item.rating + "</span>" +
            '<span class="card__reads">' + item.reads + " reads</span>" +
          "</div>" +
        "</div>";
      card.addEventListener("click", function () {
        if (dragged) return;
        toast("Opening “" + item.t + "” — demo only.");
      });
      trackEl.appendChild(card);
    });
  }

  var scroller = document.getElementById("scroller");
  var dragged = false;
  if (scroller) {
    var isDown = false;
    var startX = 0;
    var startScroll = 0;

    scroller.addEventListener("pointerdown", function (e) {
      isDown = true;
      dragged = false;
      startX = e.clientX;
      startScroll = scroller.scrollLeft;
      scroller.classList.add("is-drag");
      scroller.setPointerCapture(e.pointerId);
      autoPaused = true;
    });
    scroller.addEventListener("pointermove", function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) dragged = true;
      scroller.scrollLeft = startScroll - dx;
    });
    function endDrag(e) {
      if (!isDown) return;
      isDown = false;
      scroller.classList.remove("is-drag");
      try { scroller.releasePointerCapture(e.pointerId); } catch (err) {}
      setTimeout(function () { dragged = false; }, 50);
      // resume auto-scroll after a pause
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { autoPaused = false; }, 2500);
    }
    scroller.addEventListener("pointerup", endDrag);
    scroller.addEventListener("pointercancel", endDrag);

    // Pause auto on hover / wheel interaction
    scroller.addEventListener("mouseenter", function () { autoPaused = true; });
    scroller.addEventListener("mouseleave", function () {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { autoPaused = false; }, 1200);
    });
    scroller.addEventListener("wheel", function () {
      autoPaused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { autoPaused = false; }, 1800);
    }, { passive: true });

    // Keyboard
    scroller.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { scroller.scrollLeft += 210; e.preventDefault(); }
      if (e.key === "ArrowLeft") { scroller.scrollLeft -= 210; e.preventDefault(); }
    });

    // Auto-cruise
    var autoPaused = false;
    var resumeTimer = null;
    var autoDir = 1;
    if (!reduceMotion) {
      setInterval(function () {
        if (autoPaused) return;
        var max = scroller.scrollWidth - scroller.clientWidth;
        if (max <= 0) return;
        scroller.scrollLeft += autoDir * 0.6;
        if (scroller.scrollLeft >= max - 1) autoDir = -1;
        else if (scroller.scrollLeft <= 0) autoDir = 1;
      }, 16);
    }
  }

  /* ---------- Genre chips ---------- */
  var GENRES = [
    { name: "Romance", emoji: "💕", count: "2.1k" },
    { name: "Action", emoji: "⚔️", count: "1.8k" },
    { name: "Fantasy", emoji: "🐉", count: "1.5k" },
    { name: "Comedy", emoji: "😂", count: "980" },
    { name: "Horror", emoji: "👻", count: "640" },
    { name: "Sci-fi", emoji: "🚀", count: "720" },
    { name: "Drama", emoji: "🎭", count: "1.1k" },
    { name: "Slice of life", emoji: "☕", count: "830" },
    { name: "Thriller", emoji: "🔪", count: "510" }
  ];

  var chips = document.getElementById("chips");
  if (chips) {
    GENRES.forEach(function (g, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (i === 0 ? " is-active" : "");
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      btn.innerHTML =
        '<span class="emoji" aria-hidden="true">' + g.emoji + "</span>" +
        "<span>" + g.name + "</span>" +
        '<span class="count">' + g.count + "</span>";
      btn.addEventListener("click", function () {
        chips.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        toast(g.name + " — " + g.count + " series. (demo)");
      });
      chips.appendChild(btn);
    });
  }
})();
