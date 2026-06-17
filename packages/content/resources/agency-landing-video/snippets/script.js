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
    }, 3200);
  }

  /* ---------- apply data-hue to media gradients ---------- */
  document.querySelectorAll("[data-hue]").forEach(function (el) {
    el.style.setProperty("--hue", el.getAttribute("data-hue"));
  });

  /* ---------- sticky nav + mobile menu ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  window.addEventListener(
    "scroll",
    function () {
      nav.classList.toggle("is-stuck", window.scrollY > 20);
    },
    { passive: true }
  );

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (navLinks) {
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14 }
  );
  document.querySelectorAll(".reveal").forEach(function (el, i) {
    el.style.transitionDelay = (i % 6) * 60 + "ms";
    io.observe(el);
  });

  /* ---------- count-up stats ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var start = performance.now();
    var dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var statObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          countUp(e.target);
          statObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-count]").forEach(function (el) {
    statObs.observe(el);
  });

  /* ---------- testimonials carousel ---------- */
  var quotes = Array.prototype.slice.call(
    document.querySelectorAll("#quotes .quote")
  );
  var dots = Array.prototype.slice.call(
    document.querySelectorAll("#quoteDots button")
  );
  var qi = 0;
  var qTimer;
  function showQuote(n) {
    qi = (n + quotes.length) % quotes.length;
    quotes.forEach(function (q, i) {
      q.classList.toggle("is-active", i === qi);
    });
    dots.forEach(function (d, i) {
      d.classList.toggle("is-active", i === qi);
    });
  }
  function autoQuote() {
    clearInterval(qTimer);
    qTimer = setInterval(function () {
      showQuote(qi + 1);
    }, 5200);
  }
  dots.forEach(function (d, i) {
    d.addEventListener("click", function () {
      showQuote(i);
      autoQuote();
    });
  });
  if (quotes.length) autoQuote();

  /* ---------- card play -> toast ---------- */
  document.querySelectorAll("#workGrid .card").forEach(function (card) {
    card.addEventListener("click", function () {
      var title = card.querySelector("h3");
      openModal();
      toast("Loading reel — " + (title ? title.textContent : "clip"));
    });
  });

  /* ---------- reel modal ---------- */
  var modal = document.getElementById("reelModal");
  var playReel = document.getElementById("playReel");
  function openModal() {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
  if (playReel) playReel.addEventListener("click", openModal);
  if (modal) {
    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  /* ---------- form validation ---------- */
  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  function handleForm(form, successMsg) {
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("input[required]").forEach(function (input) {
        var bad =
          input.type === "email"
            ? !validEmail(input.value)
            : input.value.trim().length < 2;
        input.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) {
        toast("Please check the highlighted fields.");
        return;
      }
      form.reset();
      toast(successMsg);
    });
    form.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("input", function () {
        input.classList.remove("invalid");
      });
    });
  }
  handleForm(
    document.getElementById("ctaForm"),
    "Booked — we'll reach out within one business day."
  );
  handleForm(
    document.getElementById("newsForm"),
    "You're on the list for reel updates."
  );

  /* ---------- year (footer is static but keep current) ---------- */
})();
