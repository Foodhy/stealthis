(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- toast helper ---------- */
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

  /* ---------- 1. hero pop-up reveal ---------- */
  var heroPaper = document.querySelector(".hero__paper");
  function popHero() {
    if (!heroPaper) return;
    heroPaper.classList.remove("is-popped");
    // force reflow so the animation can replay
    // eslint-disable-next-line no-unused-expressions
    void heroPaper.offsetWidth;
    heroPaper.classList.add("is-popped");
  }

  var popAllBtn = document.getElementById("popAllBtn");
  if (popAllBtn) {
    popAllBtn.addEventListener("click", function () {
      popHero();
      sparkleBurst(popAllBtn);
      toast("✨ Whirlwood pops up!");
    });
  }

  /* ---------- 2. IntersectionObserver: reveal pages + auto-pop hero ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });

    // pop the hero the first time it is on screen
    var heroIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            popHero();
            heroIO.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    if (heroPaper) heroIO.observe(heroPaper);
  } else {
    // no IO / reduced motion: show everything immediately
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
    if (heroPaper) heroPaper.classList.add("is-popped");
  }

  /* ---------- 3. hero parallax on pointer ---------- */
  var heroLayers = document.querySelectorAll("#heroScene .layer[data-depth]");
  if (heroPaper && !reduceMotion) {
    heroPaper.addEventListener("pointermove", function (e) {
      var rect = heroPaper.getBoundingClientRect();
      var cx = (e.clientX - rect.left) / rect.width - 0.5;
      var cy = (e.clientY - rect.top) / rect.height - 0.5;
      heroLayers.forEach(function (layer) {
        var depth = parseFloat(layer.getAttribute("data-depth")) || 0;
        var f = depth / 18;
        layer.style.transform =
          "translate(" + cx * f + "px," + cy * f * 0.6 + "px)";
      });
    });
    heroPaper.addEventListener("pointerleave", function () {
      heroLayers.forEach(function (l) {
        l.style.transform = "";
      });
    });
  }

  /* ---------- 4. tilt stage (pointer + keyboard) ---------- */
  var stage = document.getElementById("tiltStage");
  var tlayers = stage ? stage.querySelectorAll(".tlayer[data-depth]") : [];
  var tiltX = 0; // -1..1
  function applyTilt() {
    if (reduceMotion) return;
    if (stage) {
      stage.style.transform = "rotateY(" + tiltX * 6 + "deg)";
    }
    tlayers.forEach(function (l) {
      var depth = parseFloat(l.getAttribute("data-depth")) || 0;
      l.style.transform = "translateX(" + tiltX * depth * 0.55 + "px)";
    });
  }
  if (stage && !reduceMotion) {
    stage.style.transition = "transform 0.12s ease-out";
    stage.addEventListener("pointermove", function (e) {
      var rect = stage.getBoundingClientRect();
      tiltX = (e.clientX - rect.left) / rect.width - 0.5;
      applyTilt();
    });
    stage.addEventListener("pointerleave", function () {
      tiltX = 0;
      applyTilt();
    });
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        tiltX = Math.max(-0.5, tiltX - 0.12);
        applyTilt();
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        tiltX = Math.min(0.5, tiltX + 0.12);
        applyTilt();
        e.preventDefault();
      }
    });
  }

  /* ---------- 5. CTA card springs into view + form ---------- */
  var ctaCard = document.getElementById("ctaCard");
  if (ctaCard && "IntersectionObserver" in window && !reduceMotion) {
    var ctaIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            ctaCard.classList.add("spring");
            ctaIO.disconnect();
          }
        });
      },
      { threshold: 0.45 }
    );
    ctaIO.observe(ctaCard);
  }

  var form = document.getElementById("ctaForm");
  var email = document.getElementById("email");
  if (form && email) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = email.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!ok) {
        email.setAttribute("aria-invalid", "true");
        email.focus();
        toast("Pop in a valid email so we can write back 💌");
        return;
      }
      email.removeAttribute("aria-invalid");
      email.value = "";
      if (ctaCard && !reduceMotion) {
        ctaCard.classList.remove("spring");
        void ctaCard.offsetWidth;
        ctaCard.classList.add("spring");
      }
      sparkleBurst(form.querySelector("button"));
      toast("📚 Pre-order saved! Whirlwood is on its way.");
    });
    email.addEventListener("input", function () {
      if (email.getAttribute("aria-invalid")) {
        email.removeAttribute("aria-invalid");
      }
    });
  }

  /* ---------- 6. easy-read toggle ---------- */
  var readToggle = document.getElementById("readToggle");
  if (readToggle) {
    readToggle.addEventListener("click", function () {
      var on = document.body.classList.toggle("easy-read");
      readToggle.setAttribute("aria-pressed", on ? "true" : "false");
      toast(on ? "Easy-read font on 🔤" : "Easy-read font off");
    });
  }

  /* ---------- 7. back to top ---------- */
  var topBtn = document.getElementById("topBtn");
  if (topBtn) {
    topBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  }

  /* ---------- sparkle burst helper ---------- */
  function sparkleBurst(originEl) {
    if (reduceMotion || !originEl) return;
    var rect = originEl.getBoundingClientRect();
    var ox = rect.left + rect.width / 2;
    var oy = rect.top + rect.height / 2;
    var colors = ["#ff8a3d", "#5ec5d6", "#ffd23f", "#ff6f9c", "#7bd389"];
    for (var i = 0; i < 14; i++) {
      var s = document.createElement("span");
      s.className = "spark";
      var angle = (Math.PI * 2 * i) / 14;
      var dist = 60 + Math.random() * 50;
      s.style.left = ox + "px";
      s.style.top = oy + "px";
      s.style.background = colors[i % colors.length];
      s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      document.body.appendChild(s);
      (function (node) {
        setTimeout(function () {
          node.remove();
        }, 750);
      })(s);
    }
  }
})();
