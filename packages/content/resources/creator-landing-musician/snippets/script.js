(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2800);
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) {
      if (t.tagName === "A") e.preventDefault();
      toast(t.getAttribute("data-toast"));
    }
  });

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- sticky nav shadow ---------- */
  var navBar = document.querySelector(".nav");
  function onScroll() {
    if (navBar) navBar.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- mock player ---------- */
  var mini = document.getElementById("miniPlayer");
  var miniPlay = document.getElementById("miniPlay");
  var miniTitle = document.getElementById("miniTitle");
  var miniProgress = document.getElementById("miniProgress");
  var miniClose = document.getElementById("miniClose");
  var heroPlay = document.getElementById("heroPlay");
  var heroEq = document.getElementById("heroEq");
  var trackBtns = Array.prototype.slice.call(document.querySelectorAll(".track__play"));

  var state = { playing: false, current: null, pct: 0, timer: null };

  function setPressed(btn, val) {
    if (btn) btn.setAttribute("aria-pressed", String(val));
  }

  function clearTrackHighlights() {
    document.querySelectorAll(".track.is-playing").forEach(function (li) {
      li.classList.remove("is-playing");
      setPressed(li.querySelector(".track__play"), false);
    });
    setPressed(heroPlay, false);
    if (heroEq) heroEq.classList.remove("is-on");
  }

  function tick() {
    if (!state.playing) return;
    state.pct += 0.6;
    if (state.pct >= 100) state.pct = 0;
    if (miniProgress) miniProgress.style.width = state.pct + "%";
  }

  function startTimer() {
    stopTimer();
    state.timer = setInterval(tick, 120);
  }
  function stopTimer() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
  }

  function play(title, sourceBtn) {
    var sameTrack = state.current === title;
    clearTrackHighlights();
    state.current = title;
    state.playing = true;
    if (!sameTrack) state.pct = 0;

    if (miniTitle) miniTitle.textContent = title;
    if (mini) mini.hidden = false;
    setPressed(miniPlay, true);
    startTimer();

    if (sourceBtn === heroPlay) {
      setPressed(heroPlay, true);
      if (heroEq) heroEq.classList.add("is-on");
    } else {
      var li = sourceBtn ? sourceBtn.closest(".track") : null;
      if (li) { li.classList.add("is-playing"); setPressed(li.querySelector(".track__play"), true); }
    }
  }

  function pause() {
    state.playing = false;
    stopTimer();
    setPressed(miniPlay, false);
    document.querySelectorAll(".track.is-playing .track__play").forEach(function (b) { setPressed(b, false); });
    setPressed(heroPlay, false);
    if (heroEq) heroEq.classList.remove("is-on");
  }

  function resume() {
    if (!state.current) return;
    state.playing = true;
    setPressed(miniPlay, true);
    startTimer();
    var active = document.querySelector('.track[data-track="' + cssEscape(state.current) + '"]');
    if (active) { active.classList.add("is-playing"); setPressed(active.querySelector(".track__play"), true); }
    else if (heroPlay) { setPressed(heroPlay, true); if (heroEq) heroEq.classList.add("is-on"); }
  }

  function cssEscape(s) { return String(s).replace(/"/g, '\\"'); }

  function toggleTrack(title, btn) {
    if (state.current === title && state.playing) {
      pause();
    } else if (state.current === title && !state.playing) {
      resume();
    } else {
      play(title, btn);
    }
  }

  if (heroPlay) {
    heroPlay.addEventListener("click", function () { toggleTrack("Midnight Voltage", heroPlay); });
  }

  trackBtns.forEach(function (btn) {
    var li = btn.closest(".track");
    var title = li ? li.getAttribute("data-track") : "Track";
    btn.addEventListener("click", function () { toggleTrack(title, btn); });
  });

  if (miniPlay) {
    miniPlay.addEventListener("click", function () {
      if (state.playing) pause(); else resume();
    });
  }
  if (miniClose) {
    miniClose.addEventListener("click", function () {
      pause();
      state.current = null;
      state.pct = 0;
      clearTrackHighlights();
      if (mini) mini.hidden = true;
    });
  }

  /* ---------- video "lightbox" mock ---------- */
  document.querySelectorAll(".video").forEach(function (v) {
    v.addEventListener("click", function () {
      toast("▶ Playing “" + v.getAttribute("data-title") + "” — " + v.getAttribute("data-meta"));
    });
  });

  /* ---------- newsletter ---------- */
  var form = document.getElementById("newsForm");
  var err = document.getElementById("newsErr");
  var input = document.getElementById("email");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        if (err) err.hidden = false;
        input.focus();
        return;
      }
      if (err) err.hidden = true;
      input.value = "";
      toast("You're on the list — watch your inbox for the next drop.");
    });
    input.addEventListener("input", function () { if (err) err.hidden = true; });
  }
})();
