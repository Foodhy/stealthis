(function () {
  "use strict";

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 3200);
  }

  /* ---------- sticky topbar ---------- */
  var topbar = document.getElementById("topbar");
  function onScroll() {
    if (!topbar) return;
    topbar.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("navtoggle");
  var mobileNav = document.getElementById("mobilenav");
  function setNav(open) {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setNav(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            // gentle stagger for a sophisticated, unhurried reveal
            window.setTimeout(function () {
              el.classList.add("is-in");
            }, Math.min(i * 90, 360));
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- hero stat count-up ---------- */
  var counters = Array.prototype.slice.call(
    document.querySelectorAll(".hero__stats strong[data-count]")
  );
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (prefersReduced) {
      el.textContent = target.toLocaleString();
      return;
    }
    var start = null;
    var dur = 1600;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      cio.observe(el);
    });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- save / atlas (wishlist) ---------- */
  var saved = [];
  document.querySelectorAll(".dcard__save").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var card = btn.closest(".dcard");
      var place = card
        ? card.getAttribute("data-place") || "this place"
        : "this place";
      var nowSaved = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(nowSaved));
      btn.classList.remove("pulse");
      // force reflow so the pulse animation can replay
      void btn.offsetWidth;
      btn.classList.add("pulse");
      if (nowSaved) {
        if (saved.indexOf(place) === -1) saved.push(place);
        toast(place + " added to your atlas");
      } else {
        saved = saved.filter(function (p) {
          return p !== place;
        });
        toast(place + " removed from your atlas");
      }
    });
  });

  /* ---------- destination card -> opens a discreet enquiry ---------- */
  document.querySelectorAll(".dcard").forEach(function (card) {
    function open() {
      var place = card.getAttribute("data-place");
      var select = document.getElementById("f-dest");
      if (select) {
        // match the option whose text contains the place name
        var match = Array.prototype.find.call(select.options, function (o) {
          return o.text.indexOf(place) !== -1;
        });
        if (match) select.value = match.value;
      }
      var target = document.getElementById("contact");
      if (target)
        target.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
      toast("Beginning an enquiry for " + place);
    }
    card.addEventListener("click", function (e) {
      if (e.target.closest(".dcard__save")) return;
      open();
    });
    card.addEventListener("keydown", function (e) {
      if (e.target.closest(".dcard__save")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  /* ---------- concierge readout ---------- */
  var conItems = Array.prototype.slice.call(
    document.querySelectorAll(".conlist li[data-detail]")
  );
  var conReadout = document.getElementById("conReadout");
  function selectCon(li) {
    conItems.forEach(function (other) {
      other.classList.toggle("is-active", other === li);
    });
    if (!conReadout) return;
    var detail = li.getAttribute("data-detail") || "";
    conReadout.classList.add("fade");
    window.setTimeout(
      function () {
        conReadout.textContent = detail;
        conReadout.classList.remove("fade");
      },
      prefersReduced ? 0 : 220
    );
  }
  conItems.forEach(function (li) {
    li.setAttribute("tabindex", "0");
    li.setAttribute("role", "button");
    li.addEventListener("click", function () {
      selectCon(li);
    });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectCon(li);
      }
    });
  });

  /* ---------- enquiry form ---------- */
  var form = document.getElementById("enquiry");
  if (form) {
    var fields = {
      name: {
        el: document.getElementById("f-name"),
        msg: "Please share the name we should address you by.",
        valid: function (v) {
          return v.trim().length >= 2;
        },
      },
      email: {
        el: document.getElementById("f-email"),
        msg: "A valid email lets your concierge reply.",
        valid: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
        },
      },
    };

    function showError(key, show) {
      var f = fields[key];
      if (!f || !f.el) return;
      var wrap = f.el.closest(".field");
      var err = form.querySelector('.field__err[data-for="' + key + '"]');
      if (wrap) wrap.classList.toggle("is-invalid", show);
      if (err) err.textContent = show ? f.msg : "";
      f.el.setAttribute("aria-invalid", String(show));
    }

    Object.keys(fields).forEach(function (key) {
      var el = fields[key].el;
      if (!el) return;
      el.addEventListener("input", function () {
        if (el.closest(".field").classList.contains("is-invalid")) {
          showError(key, !fields[key].valid(el.value));
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(fields).forEach(function (key) {
        var f = fields[key];
        if (!f.el) return;
        var ok = f.valid(f.el.value);
        showError(key, !ok);
        if (!ok && !firstBad) firstBad = f.el;
      });
      if (firstBad) {
        firstBad.focus();
        toast("A detail or two is still needed");
        return;
      }
      var name = fields.name.el.value.trim().split(/\s+/)[0];
      form.reset();
      toast(
        "Thank you, " + name + ". Your concierge replies within the hour."
      );
    });
  }
})();
