(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("toast--show");
    }, 2600);
  }

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------- countdown ---------- */
  var target = new Date("2026-08-14T16:00:00").getTime();
  var cdNodes = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    mins: document.querySelector('[data-cd="mins"]'),
    secs: document.querySelector('[data-cd="secs"]')
  };
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var diff = target - Date.now();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    if (cdNodes.days) cdNodes.days.textContent = pad(d);
    if (cdNodes.hours) cdNodes.hours.textContent = pad(h);
    if (cdNodes.mins) cdNodes.mins.textContent = pad(m);
    if (cdNodes.secs) cdNodes.secs.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- lineup tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = {
    fri: document.getElementById("panel-fri"),
    sat: document.getElementById("panel-sat"),
    sun: document.getElementById("panel-sun")
  };
  function activate(day) {
    tabs.forEach(function (t) {
      var on = t.dataset.day === day;
      t.classList.toggle("tab--on", on);
      t.setAttribute("aria-selected", String(on));
    });
    Object.keys(panels).forEach(function (k) {
      if (!panels[k]) return;
      var on = k === day;
      panels[k].hidden = !on;
      panels[k].classList.toggle("panel--on", on);
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { activate(t.dataset.day); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var dir = e.key === "ArrowRight" ? 1 : -1;
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      activate(next.dataset.day);
    });
  });

  /* ---------- pass buttons ---------- */
  document.querySelectorAll(".pass__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Added " + btn.dataset.pass + " to your cart");
    });
  });

  /* ---------- newsletter ---------- */
  var subForm = document.getElementById("subForm");
  if (subForm) {
    subForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = subForm.querySelector("input");
      toast("You're on the list — see you in the desert!");
      if (input) input.value = "";
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
