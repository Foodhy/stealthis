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
    }, 2600);
  }

  /* Wire any element with data-toast */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) toast(t.getAttribute("data-toast"));
  });

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Live badge: pulse + drifting viewer count ---------- */
  var badge = document.getElementById("live-badge");
  var viewers = document.getElementById("live-viewers");
  if (badge) badge.classList.add("is-live");
  if (viewers) {
    var count = 4218;
    setInterval(function () {
      count += Math.floor(Math.random() * 61) - 26; // drift up/down
      if (count < 3600) count = 3600 + Math.floor(Math.random() * 40);
      viewers.textContent = count.toLocaleString("en-US");
    }, 2400);
  }

  /* Hero attempt counter easter egg */
  var play = document.getElementById("stream-play");
  var attempt = document.getElementById("attempt-count");
  if (play && attempt) {
    play.addEventListener("click", function () {
      var n = parseInt(attempt.textContent, 10) + 1;
      attempt.textContent = n;
      toast("Boss attempt #" + n + " — copium engaged. Stream loading…");
    });
  }

  /* ---------- Schedule tabs ---------- */
  var SCHEDULE = {
    mon: [
      { time: "6:00 PM", title: "Ranked grind", note: "Climbing to Masters, no excuses", tag: "Competitive" },
      { time: "9:00 PM", title: "Viewer co-op", note: "Squad up with Co-Op members", tag: "Members" }
    ],
    tue: [
      { time: "7:00 PM", title: "Blind horror night", note: "New release, lights off, chat screaming", tag: "Horror" }
    ],
    wed: [
      { time: "5:30 PM", title: "Roguelike runs", note: "One more run (a lie)", tag: "Roguelike" },
      { time: "10:00 PM", title: "Late-night chill", note: "Cozy indie + Q&A", tag: "Just Chatting" }
    ],
    thu: [
      { time: "6:00 PM", title: "Speedrun practice", note: "Splits, resets, and rage", tag: "Speedrun" }
    ],
    fri: [
      { time: "8:00 PM", title: "Fan Friday", note: "Polls pick the game, chat picks my pain", tag: "Variety" },
      { time: "11:00 PM", title: "Subathon stretch", note: "Goes til the timer dies", tag: "Special" }
    ],
    sat: [
      { time: "2:00 PM", title: "Marathon stream", note: "6+ hours, snacks encouraged", tag: "Marathon" }
    ],
    sun: [] // day off
  };

  var panel = document.getElementById("day-panel");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".day-tab"));

  function renderDay(day) {
    if (!panel) return;
    var slots = SCHEDULE[day] || [];
    if (!slots.length) {
      panel.innerHTML =
        '<div class="day-empty"><span aria-hidden="true">😴</span>Day off — recovering HP. Catch the VODs in the clips section!</div>';
      return;
    }
    panel.innerHTML = slots
      .map(function (s) {
        return (
          '<div class="slot">' +
          '<div class="slot-time">' + s.time + "</div>" +
          '<div class="slot-title">' + s.title + "<small>" + s.note + "</small></div>" +
          '<div class="slot-tag">' + s.tag + "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderDay(tab.getAttribute("data-day"));
    });
  });

  // default to today (fallback Mon)
  var dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var todayKey = dayKeys[new Date().getDay()];
  var todayTab = tabs.filter(function (t) { return t.getAttribute("data-day") === todayKey; })[0] || tabs[0];
  if (todayTab) {
    tabs.forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
    todayTab.classList.add("is-active");
    todayTab.setAttribute("aria-selected", "true");
    renderDay(todayTab.getAttribute("data-day"));
  }

  /* ---------- Clip lightbox ---------- */
  var CLIPS = [
    { title: "1 HP clutch in ranked finals", meta: "184K views · clipped by @pixel_remy" },
    { title: "Jumpscare ruins my whole life", meta: "921K views · clipped by @toastedmage" },
    { title: "Speedrun WR, live on stream", meta: "1.4M views · clipped by @gg_harlow" },
    { title: "Chat picks my entire loadout", meta: "67K views · clipped by @byte_sized" },
    { title: "200 IQ play I'll never repeat", meta: "302K views · clipped by @noscope_jin" },
    { title: "The rage that started it all", meta: "2.1M views · the origin clip" }
  ];
  var lb = document.getElementById("lightbox");
  var lbTitle = document.getElementById("lightbox-title");
  var lbMeta = document.getElementById("lightbox-meta");
  var lbClose = document.getElementById("lightbox-close");
  var lastFocused = null;

  function openClip(i) {
    var c = CLIPS[i];
    if (!c || !lb) return;
    lastFocused = document.activeElement;
    lbTitle.textContent = c.title;
    lbMeta.textContent = c.meta;
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("show"); });
    lbClose.focus();
    document.body.style.overflow = "hidden";
  }
  function closeClip() {
    if (!lb) return;
    lb.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(function () { lb.hidden = true; }, 250);
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".clip").forEach(function (clip) {
    function go() { openClip(parseInt(clip.getAttribute("data-clip"), 10)); }
    clip.addEventListener("click", go);
    clip.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeClip);
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeClip(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lb && !lb.hidden) closeClip();
  });

  /* ---------- Newsletter ---------- */
  var form = document.getElementById("newsletter");
  var emailIn = document.getElementById("news-email");
  var status = document.getElementById("news-status");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (emailIn.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        status.textContent = "Hmm, that email looks invalid — try again.";
        status.className = "news-status err";
        emailIn.focus();
        return;
      }
      status.textContent = "You're in! Stream alerts incoming. GLHF 🎮";
      status.className = "news-status ok";
      emailIn.value = "";
      toast("Subscribed — see you in the next stream!");
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
})();
