(function () {
  "use strict";

  var DATA = [
    {
      name: "Elena Marchetti",
      project: "Cirrus Loft",
      room: "Living Room",
      rating: 5,
      color: "#b08968",
      quote:
        "They read the light in our loft before they read the brief. Every material feels chosen, not sourced. Six months in, guests still stop at the doorway before they say a word.",
    },
    {
      name: "Theo Brandt",
      project: "Fen Cottage Kitchen",
      room: "Kitchen",
      rating: 5,
      color: "#5c4433",
      quote:
        "We wanted warmth without clutter, and they gave us a room that cooks as well as it looks. The oak island has become the place everyone drifts back to.",
    },
    {
      name: "Priya Raman",
      project: "Slate & Linen Suite",
      room: "Bedroom",
      rating: 4,
      color: "#9caf88",
      quote:
        "Calm was the whole assignment, and they delivered it in texture. Waking up here feels like the softest possible start to the day, every single morning.",
    },
    {
      name: "Marcus Adeyemi",
      project: "Harbour View Study",
      room: "Home Office",
      rating: 5,
      color: "#8c6a4f",
      quote:
        "My study used to be an afterthought at the end of the hall. Now it is the reason I look forward to focused work. Nothing shouts, yet everything has intent.",
    },
    {
      name: "Sofia Lindqvist",
      project: "Terracotta Terrace",
      room: "Outdoor",
      rating: 5,
      color: "#b08968",
      quote:
        "They turned a bare balcony into the room we use most. The palette pulls the outside in, and the evenings out here have quietly rearranged our whole summer.",
    },
  ];

  var stage = document.querySelector("[data-stage]");
  var dotsWrap = document.querySelector("[data-dots]");
  var rail = document.querySelector("[data-rail]");
  var toastEl = document.querySelector("[data-toast]");
  var prevBtn = document.querySelector("[data-prev]");
  var nextBtn = document.querySelector("[data-next]");

  var current = 0;
  var timer = null;
  var DELAY = 6000;
  var toastTimer = null;

  function initials(name) {
    return name
      .split(" ")
      .map(function (w) { return w.charAt(0); })
      .slice(0, 2)
      .join("");
  }

  function starSvg(on) {
    return (
      '<span class="' + (on ? "" : "is-off") + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.9 6.2 20.5l1.1-6.5L2.5 9.4l6.6-1z"/></svg>' +
      "</span>"
    );
  }

  function buildSlides() {
    DATA.forEach(function (t, i) {
      var slide = document.createElement("article");
      slide.className = "slide";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", i + 1 + " of " + DATA.length);
      if (i === 0) slide.classList.add("is-active");

      var stars = "";
      for (var s = 0; s < 5; s++) stars += starSvg(s < t.rating);

      slide.innerHTML =
        '<div class="slide__badges">' +
          '<span class="badge">' + t.project + "</span>" +
          '<span class="badge badge--room">' + t.room + "</span>" +
        "</div>" +
        '<blockquote class="quote">' + t.quote + "</blockquote>" +
        '<div class="rating" aria-label="Rated ' + t.rating + ' out of 5">' + stars + "</div>" +
        '<div class="attrib">' +
          '<span class="avatar" style="background:' + t.color + '">' + initials(t.name) + "</span>" +
          "<span>" +
            '<span class="attrib__name">' + t.name + "</span>" +
            '<span class="attrib__meta"><em>' + t.room + "</em> · " + t.project + "</span>" +
          "</span>" +
        "</div>";

      stage.appendChild(slide);
    });
  }

  function buildDots() {
    DATA.forEach(function (t, i) {
      var d = document.createElement("button");
      d.className = "dot" + (i === 0 ? " is-active" : "");
      d.type = "button";
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", "Testimonial from " + t.name);
      d.setAttribute("aria-selected", i === 0 ? "true" : "false");
      d.addEventListener("click", function () { go(i, true); });
      dotsWrap.appendChild(d);
    });
  }

  function buildRail() {
    DATA.forEach(function (t, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.className = "rail__btn" + (i === 0 ? " is-active" : "");
      b.type = "button";
      b.innerHTML =
        '<span class="rail__name">' + t.name + "</span>" +
        '<span class="rail__proj">' + t.project + "</span>";
      b.addEventListener("click", function () {
        go(i, true);
        toast("Reading " + t.name.split(" ")[0] + "’s review");
      });
      li.appendChild(b);
      rail.appendChild(li);
    });
  }

  function go(index, userAction) {
    var len = DATA.length;
    current = (index + len) % len;

    var slides = stage.querySelectorAll(".slide");
    slides.forEach(function (s, i) { s.classList.toggle("is-active", i === current); });

    dotsWrap.querySelectorAll(".dot").forEach(function (d, i) {
      var on = i === current;
      d.classList.toggle("is-active", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
    });

    rail.querySelectorAll(".rail__btn").forEach(function (b, i) {
      b.classList.toggle("is-active", i === current);
    });

    if (userAction) restart();
  }

  function next(user) { go(current + 1, user); }
  function prev(user) { go(current - 1, user); }

  function start() {
    stop();
    timer = setInterval(function () { next(false); }, DELAY);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function restart() { start(); }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* wiring */
  buildSlides();
  buildDots();
  buildRail();

  prevBtn.addEventListener("click", function () { prev(true); });
  nextBtn.addEventListener("click", function () { next(true); });

  // pause on hover / focus
  var carousel = document.querySelector(".carousel");
  ["mouseenter", "focusin"].forEach(function (ev) {
    carousel.addEventListener(ev, stop);
  });
  ["mouseleave", "focusout"].forEach(function (ev) {
    carousel.addEventListener(ev, start);
  });

  // keyboard arrows
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { prev(true); }
    else if (e.key === "ArrowRight") { next(true); }
  });

  // swipe
  var startX = 0, tracking = false;
  stage.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX; tracking = true;
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (!tracking) return;
    tracking = false;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) { dx < 0 ? next(true) : prev(true); }
  });

  start();
})();
