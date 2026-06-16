(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2600);
  }

  /* ---------- invert / theme toggle ---------- */
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var on = document.documentElement.toggleAttribute("data-invert");
      themeBtn.setAttribute("aria-pressed", on ? "true" : "false");
      toast(on ? "Inverted — dark gallery mode" : "Back to white walls");
    });
  }

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var mnav = document.getElementById("mnav");
  if (burger && mnav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", open ? "false" : "true");
      mnav.hidden = open;
    });
    mnav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        burger.setAttribute("aria-expanded", "false");
        mnav.hidden = true;
      }
    });
  }

  /* ---------- duplicate marquee for seamless loop ---------- */
  var marquee = document.getElementById("marquee");
  if (marquee) {
    marquee.innerHTML += marquee.innerHTML;
  }

  /* ---------- exhibition filters ---------- */
  var chips = document.querySelectorAll(".filters .chip");
  var shows = Array.prototype.slice.call(document.querySelectorAll(".show"));
  var emptyShows = document.getElementById("emptyShows");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      var f = chip.getAttribute("data-filter");
      var visible = 0;
      shows.forEach(function (s) {
        var match = f === "all" || s.getAttribute("data-cat") === f;
        s.style.display = match ? "" : "none";
        if (match) visible++;
      });
      if (emptyShows) emptyShows.hidden = visible !== 0;
    });
  });

  /* ---------- save work ---------- */
  var saveWork = document.getElementById("saveWork");
  if (saveWork) {
    var saved = false;
    saveWork.addEventListener("click", function () {
      saved = !saved;
      saveWork.textContent = saved ? "Saved ✓" : "Save to your visit";
      toast(saved ? "Untitled (Field) added to your visit" : "Removed from your visit");
    });
  }

  /* ---------- ticket steppers ---------- */
  var totalEl = document.getElementById("ticketTotal");
  function recalc() {
    var total = 0;
    document.querySelectorAll(".stepper").forEach(function (st) {
      var price = parseInt(st.getAttribute("data-price"), 10) || 0;
      var n = parseInt(st.querySelector("[data-count]").textContent, 10) || 0;
      total += price * n;
    });
    if (totalEl) totalEl.textContent = "$" + total;
  }
  document.querySelectorAll(".stepper").forEach(function (st) {
    var out = st.querySelector("[data-count]");
    st.querySelectorAll(".step").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = parseInt(btn.getAttribute("data-dir"), 10);
        var n = parseInt(out.textContent, 10) || 0;
        n = Math.max(0, Math.min(20, n + dir));
        out.textContent = n;
        recalc();
      });
    });
  });

  /* ---------- ticket checkout ---------- */
  var tickets = document.getElementById("tickets");
  if (tickets) {
    tickets.addEventListener("submit", function (e) {
      e.preventDefault();
      var count = 0;
      document.querySelectorAll(".stepper [data-count]").forEach(function (o) {
        count += parseInt(o.textContent, 10) || 0;
      });
      if (count === 0) {
        toast("Add at least one ticket first");
        return;
      }
      toast(count + " ticket" + (count > 1 ? "s" : "") + " — held for 15 minutes");
    });
  }

  /* ---------- newsletter ---------- */
  var signup = document.getElementById("signup");
  if (signup) {
    var email = document.getElementById("email");
    var err = document.getElementById("signupErr");
    signup.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = (email.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!ok) {
        err.textContent = "Enter a valid email address.";
        err.hidden = false;
        email.focus();
        return;
      }
      err.hidden = true;
      signup.reset();
      toast("You're on the list. See you at the opening.");
    });
    email.addEventListener("input", function () {
      if (!err.hidden) err.hidden = true;
    });
  }

  /* ---------- scroll-spy nav ---------- */
  var navLinks = document.querySelectorAll(".nav a");
  var sections = document.querySelectorAll("main section[id]");
  if (navLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
