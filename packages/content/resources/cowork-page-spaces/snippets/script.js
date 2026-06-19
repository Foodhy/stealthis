(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- space filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var emptyMsg = document.getElementById("emptyMsg");

  function applyFilter(type) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = type === "all" || card.getAttribute("data-type") === type;
      card.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- gallery lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbPhoto = document.getElementById("lbPhoto");
  var lbTag = document.getElementById("lbTag");
  var lbCount = document.getElementById("lbCount");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var gallery = [];
  var gIndex = 0;
  var lastFocus = null;

  function renderSlide() {
    var item = gallery[gIndex];
    if (!item) return;
    lbPhoto.className = "lb__photo " + item.cls;
    lbTag.textContent = item.tag;
    lbCount.textContent = (gIndex + 1) + " / " + gallery.length;
  }
  function openGallery(data, trigger) {
    if (!data || !data.length) return;
    gallery = data;
    gIndex = 0;
    lastFocus = trigger || document.activeElement;
    renderSlide();
    lb.hidden = false;
    lbClose.focus();
    document.body.style.overflow = "hidden";
  }
  function closeGallery() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function step(dir) {
    gIndex = (gIndex + dir + gallery.length) % gallery.length;
    renderSlide();
  }

  document.querySelectorAll(".gal").forEach(function (galEl) {
    var trigger = galEl.querySelector(".card__zoom");
    var open = function () {
      var data;
      try { data = JSON.parse(galEl.getAttribute("data-gallery") || "[]"); }
      catch (err) { data = []; }
      openGallery(data, trigger);
    };
    if (trigger) trigger.addEventListener("click", open);
    galEl.addEventListener("click", function (e) {
      if (e.target.closest(".card__zoom")) return;
      if (e.target.closest(".card__photo")) open();
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeGallery);
  if (lbPrev) lbPrev.addEventListener("click", function () { step(-1); });
  if (lbNext) lbNext.addEventListener("click", function () { step(1); });
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeGallery(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeGallery();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });

  /* ---------- amenity tooltips ---------- */
  var tip = document.getElementById("tip");
  var tipItems = Array.prototype.slice.call(document.querySelectorAll(".amen li[data-tip]"));
  function showTip(el) {
    var msg = el.getAttribute("data-tip");
    if (!msg) return;
    tip.textContent = msg;
    tip.hidden = false;
    var r = el.getBoundingClientRect();
    tip.style.left = (r.left + r.width / 2) + "px";
    tip.style.top = (r.top) + "px";
    requestAnimationFrame(function () { tip.classList.add("show"); });
  }
  function hideTip() {
    tip.classList.remove("show");
    setTimeout(function () { if (!tip.classList.contains("show")) tip.hidden = true; }, 160);
  }
  tipItems.forEach(function (el) {
    el.setAttribute("tabindex", "0");
    el.addEventListener("mouseenter", function () { showTip(el); });
    el.addEventListener("mouseleave", hideTip);
    el.addEventListener("focus", function () { showTip(el); });
    el.addEventListener("blur", hideTip);
  });

  /* ---------- virtual tour teaser ---------- */
  var tourPlay = document.getElementById("tourPlay");
  if (tourPlay) {
    var label = tourPlay.querySelector(".tour__playlabel");
    var tri = tourPlay.querySelector(".tour__tri");
    var playing = false;
    var tick = 0;
    var tourTimer;
    var stops = ["Main floor", "Studios", "Lounge & café", "Rooftop deck"];
    tourPlay.addEventListener("click", function () {
      playing = !playing;
      tourPlay.classList.toggle("is-playing", playing);
      if (playing) {
        tri.textContent = "❚❚";
        toast("Tour playing — fictional 360° loop");
        tourTimer = setInterval(function () {
          tick = (tick + 1) % stops.length;
          label.textContent = "Now: " + stops[tick];
        }, 1600);
      } else {
        tri.textContent = "▶";
        clearInterval(tourTimer);
        label.textContent = "Virtual tour · 2:14";
      }
    });
  }

  /* ---------- book form + CTAs ---------- */
  var bookForm = document.getElementById("bookForm");
  var bookName = document.getElementById("bookName");
  var bookSpace = document.getElementById("bookSpace");

  document.querySelectorAll("[data-book]").forEach(function (el) {
    el.addEventListener("click", function () {
      var space = el.getAttribute("data-book");
      if (bookSpace) {
        for (var i = 0; i < bookSpace.options.length; i++) {
          if (bookSpace.options[i].value === space || bookSpace.options[i].text === space) {
            bookSpace.selectedIndex = i; break;
          }
        }
      }
      setTimeout(function () { if (bookName) bookName.focus(); }, 450);
    });
  });

  if (bookForm) {
    bookForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (bookName.value || "").trim();
      if (name.length < 2) {
        bookName.classList.add("invalid");
        bookName.focus();
        toast("Add your name so we know who's coming");
        return;
      }
      bookName.classList.remove("invalid");
      var space = bookSpace ? bookSpace.value : "the studio";
      toast("Thanks " + name.split(" ")[0] + " — tour request for " + space + " sent");
      bookForm.reset();
    });
    bookName.addEventListener("input", function () { bookName.classList.remove("invalid"); });
  }
})();
