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

  /* ---------- Countdown to conference start ---------- */
  // 16 March 2027, 08:00 local time
  var target = new Date(2027, 2, 16, 8, 0, 0).getTime();
  var fields = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    mins: document.querySelector('[data-cd="mins"]'),
    secs: document.querySelector('[data-cd="secs"]'),
  };

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      if (fields.days) fields.days.textContent = "00";
      if (fields.hours) fields.hours.textContent = "00";
      if (fields.mins) fields.mins.textContent = "00";
      if (fields.secs) fields.secs.textContent = "00";
      clearInterval(cdInterval);
      return;
    }
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (fields.days) fields.days.textContent = pad(d);
    if (fields.hours) fields.hours.textContent = pad(h);
    if (fields.mins) fields.mins.textContent = pad(m);
    if (fields.secs) fields.secs.textContent = pad(sec);
  }
  tick();
  var cdInterval = setInterval(tick, 1000);

  /* ---------- Tabbed program ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = {
    "tab-d1": document.getElementById("panel-d1"),
    "tab-d2": document.getElementById("panel-d2"),
    "tab-d3": document.getElementById("panel-d3"),
  };

  function activateTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = panels[t.id];
      if (panel) {
        panel.classList.toggle("is-active", on);
        if (on) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      }
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      activateTab(tab);
    });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        activateTab(next);
        next.focus();
      }
    });
  });

  /* ---------- Pricing tier selection ---------- */
  document.querySelectorAll("[data-tier]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tier = btn.getAttribute("data-tier");
      toast("✓ " + tier + " pass selected — redirecting to registration…");
    });
  });

  /* ---------- Final CTA ---------- */
  var cta = document.getElementById("cta-register");
  if (cta) {
    cta.addEventListener("click", function () {
      toast("Registration opens in a new tab (demo)");
    });
  }

  /* ---------- Scroll-spy on nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  var sections = navLinks
    .map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (a) {
              a.style.color = a.getAttribute("href") === "#" + entry.target.id ? "var(--accent)" : "";
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(
      ".speaker-card, .price-card, .timeline li, .stat-strip li"
    );
    revealEls.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });
    var reveal = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "none";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      reveal.observe(el);
    });
  }
})();
