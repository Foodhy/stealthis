(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var host = document.getElementById("toastHost");
  function toast(msg) {
    if (!host) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = msg;
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("in"); });
    setTimeout(function () {
      el.classList.remove("in");
      setTimeout(function () { el.remove(); }, 280);
    }, 3200);
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  function closeNav() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    mobileNav.hidden = true;
  }
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Agenda tabs ---------- */
  var tablist = document.querySelector(".tablist");
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll(".tab"));
    function selectTab(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { selectTab(tab); });
      tab.addEventListener("keydown", function (e) {
        var next;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); selectTab(next); next.focus(); }
      });
    });
  }

  /* ---------- Countdown to early-bird deadline ---------- */
  var cdGrid = document.getElementById("cdGrid");
  if (cdGrid) {
    // Deadline: 21 days from first load (stable per page view).
    var deadline = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
    deadline.setHours(23, 59, 59, 0);
    var cells = {
      days: cdGrid.querySelector('[data-unit="days"]'),
      hours: cdGrid.querySelector('[data-unit="hours"]'),
      minutes: cdGrid.querySelector('[data-unit="minutes"]'),
      seconds: cdGrid.querySelector('[data-unit="seconds"]')
    };
    function pad(n) { return String(n).padStart(2, "0"); }
    function tick() {
      var diff = deadline - Date.now();
      if (diff <= 0) {
        cells.days.textContent = cells.hours.textContent = cells.minutes.textContent = cells.seconds.textContent = "00";
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      cells.days.textContent = pad(Math.floor(s / 86400));
      cells.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      cells.minutes.textContent = pad(Math.floor((s % 3600) / 60));
      cells.seconds.textContent = pad(s % 60);
    }
    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Pricing buttons ---------- */
  document.querySelectorAll(".price-card .btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".price-card");
      var name = card ? card.querySelector("h3").textContent : "pass";
      var select = document.getElementById("regTier");
      if (select) {
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].value.toLowerCase() === name.split(" ")[0].toLowerCase()) {
            select.selectedIndex = i;
            break;
          }
        }
      }
      toast(name + " pass selected — finish below to reserve.");
    });
  });

  /* ---------- Register form ---------- */
  var form = document.getElementById("registerForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("regEmail");
      var tier = document.getElementById("regTier");
      var value = (email.value || "").trim();
      if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        email.focus();
        toast("Enter a valid work email to reserve.");
        return;
      }
      toast("Seat reserved · " + tier.value + " · confirmation sent to " + value);
      form.reset();
      tier.value = "Conference";
    });
  }
})();
