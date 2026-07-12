(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- Photo gallery ---------- */
  var slidesWrap = document.getElementById("slides");
  var slides = slidesWrap ? Array.prototype.slice.call(slidesWrap.querySelectorAll(".slide")) : [];
  var dotsWrap = document.getElementById("dots");
  var counter = document.getElementById("counter");
  var index = 0;

  // build progress dots
  slides.forEach(function () {
    var i = document.createElement("i");
    dotsWrap.appendChild(i);
  });
  var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll("i"));

  function render() {
    slides.forEach(function (s, i) { s.classList.toggle("is-active", i === index); });
    dots.forEach(function (d, i) { d.classList.toggle("is-active", i === index); });
    if (counter) counter.textContent = (index + 1) + " / " + slides.length;
  }

  function go(dir) {
    var n = index + dir;
    if (n < 0) n = 0;
    if (n > slides.length - 1) n = slides.length - 1;
    index = n;
    render();
  }

  var tapPrev = document.getElementById("tapPrev");
  var tapNext = document.getElementById("tapNext");
  if (tapPrev) tapPrev.addEventListener("click", function () { go(-1); });
  if (tapNext) tapNext.addEventListener("click", function () { go(1); });

  // keyboard arrows
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  });

  // swipe support
  var startX = null;
  if (slidesWrap) {
    slidesWrap.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    slidesWrap.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      startX = null;
    });
  }

  render();

  /* ---------- Interests toggle ---------- */
  var interests = document.getElementById("interests");
  if (interests) {
    interests.addEventListener("click", function (e) {
      var pill = e.target.closest(".pill");
      if (!pill) return;
      pill.classList.toggle("is-on");
      var label = pill.textContent.trim();
      toast(pill.classList.contains("is-on")
        ? "You also like " + label
        : "Removed " + label);
    });
  }

  /* ---------- Floating actions ---------- */
  function pop(btn) {
    btn.classList.remove("pop");
    // force reflow to restart animation
    void btn.offsetWidth;
    btn.classList.add("pop");
  }

  var likeBtn = document.getElementById("likeBtn");
  var passBtn = document.getElementById("passBtn");
  var starBtn = document.getElementById("starBtn");

  if (likeBtn) likeBtn.addEventListener("click", function () {
    pop(likeBtn);
    toast("💜 You liked Priya");
  });
  if (starBtn) starBtn.addEventListener("click", function () {
    pop(starBtn);
    toast("⭐ Super like sent — Priya will see it first");
  });
  if (passBtn) passBtn.addEventListener("click", function () {
    pop(passBtn);
    toast("Passed — on to the next");
  });

  /* ---------- Report sheet ---------- */
  var sheet = document.getElementById("sheet");
  var backdrop = document.getElementById("sheetBackdrop");
  var kebab = document.getElementById("kebab");
  var reportLink = document.getElementById("reportLink");
  var cancelBtn = document.getElementById("sheetCancel");
  var lastFocus = null;

  function openSheet() {
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    sheet.hidden = false;
    // next frame so the transition runs
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { sheet.classList.add("is-open"); });
    });
    var first = sheet.querySelector(".sheet__item");
    if (first) first.focus();
    document.addEventListener("keydown", onEsc);
  }

  function closeSheet() {
    sheet.classList.remove("is-open");
    backdrop.hidden = true;
    document.removeEventListener("keydown", onEsc);
    setTimeout(function () { sheet.hidden = true; }, 340);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onEsc(e) {
    if (e.key === "Escape") closeSheet();
  }

  if (kebab) kebab.addEventListener("click", openSheet);
  if (reportLink) reportLink.addEventListener("click", openSheet);
  if (backdrop) backdrop.addEventListener("click", closeSheet);
  if (cancelBtn) cancelBtn.addEventListener("click", closeSheet);

  sheet.querySelectorAll(".sheet__item").forEach(function (item) {
    item.addEventListener("click", function () {
      var reason = item.getAttribute("data-report") || "Reported";
      closeSheet();
      setTimeout(function () {
        toast(reason.indexOf("Block") === 0 ? "⛔ " + reason : "Thanks — report sent");
      }, 260);
    });
  });
})();
