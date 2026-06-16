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
    }, 2600);
  }

  /* ---------- live issue date ---------- */
  var dateEl = document.getElementById("issueDate");
  if (dateEl) {
    var d = new Date();
    dateEl.textContent = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /* ---------- generative dendrite cover figure ---------- */
  var dendrite = document.getElementById("dendrite");
  if (dendrite) {
    var paths = "";
    function branch(x, y, angle, len, depth) {
      if (depth <= 0 || len < 4) return;
      var x2 = x + Math.cos(angle) * len;
      var y2 = y + Math.sin(angle) * len;
      paths +=
        '<path d="M' +
        x.toFixed(1) +
        " " +
        y.toFixed(1) +
        " L" +
        x2.toFixed(1) +
        " " +
        y2.toFixed(1) +
        '" stroke-width="' +
        (depth * 0.35).toFixed(2) +
        '"/>';
      var spread = 0.55 + Math.random() * 0.25;
      branch(x2, y2, angle - spread, len * 0.74, depth - 1);
      branch(x2, y2, angle + spread, len * 0.74, depth - 1);
      if (Math.random() > 0.4) branch(x2, y2, angle, len * 0.82, depth - 1);
    }
    // a few seed crystals fanning out
    branch(148, 118, -Math.PI / 2, 44, 7);
    branch(148, 118, -Math.PI / 2 - 1.1, 32, 6);
    branch(148, 118, -Math.PI / 2 + 1.1, 32, 6);
    branch(148, 118, Math.PI / 2.4, 26, 5);
    dendrite.innerHTML = paths;
  }

  /* ---------- animated metric counters ---------- */
  var metrics = Array.prototype.slice.call(
    document.querySelectorAll(".metric__value[data-count]")
  );
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var start = performance.now();
    var dur = 1100;
    function frame(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent =
        decimals > 0
          ? val.toFixed(decimals)
          : Math.round(val).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (metrics.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              animateCount(e.target);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      metrics.forEach(function (m) {
        io.observe(m);
      });
    } else {
      metrics.forEach(animateCount);
    }
  }

  /* ---------- article subject filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(
    document.querySelectorAll("#articleList .card")
  );
  var emptyState = document.getElementById("emptyState");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", active ? "true" : "false");
      });
      var shown = 0;
      cards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-subject") === filter;
        card.style.display = match ? "" : "none";
        if (match) shown++;
      });
      if (emptyState) emptyState.hidden = shown !== 0;
    });
  });

  /* ---------- search ---------- */
  var searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = document.getElementById("searchInput").value.trim();
      if (!q) {
        toast("Type a query to search the archive.");
        return;
      }
      var hits = cards.filter(function (c) {
        return c.textContent.toLowerCase().indexOf(q.toLowerCase()) !== -1;
      }).length;
      toast(hits + ' result' + (hits === 1 ? "" : "s") + ' for "' + q + '"');
    });
  }

  /* ---------- cite / pdf / submit actions ---------- */
  document.querySelectorAll("[data-cite]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cite = btn.getAttribute("data-cite");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cite).then(
          function () {
            toast("Citation copied to clipboard");
          },
          function () {
            toast("Citation: " + cite.slice(0, 40) + "…");
          }
        );
      } else {
        toast("Citation ready — copy manually");
      }
    });
  });

  document.querySelectorAll("[data-pdf]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Preparing PDF (demo — no file)…");
    });
  });

  document.querySelectorAll("[data-submit]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Submission portal is a demo placeholder.");
    });
  });

  /* ---------- newsletter validation ---------- */
  var nlForm = document.getElementById("nlForm");
  if (nlForm) {
    var nlEmail = document.getElementById("nlEmail");
    var nlError = document.getElementById("nlError");
    nlForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = nlEmail.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        nlError.hidden = false;
        nlEmail.focus();
        return;
      }
      nlError.hidden = true;
      nlForm.reset();
      toast("Subscribed — confirmation sent to " + val);
    });
    nlEmail.addEventListener("input", function () {
      if (!nlError.hidden) nlError.hidden = true;
    });
  }

  /* ---------- scrollspy on nav ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav__link")
  );
  var sections = navLinks
    .map(function (l) {
      var id = l.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            navLinks.forEach(function (l) {
              var match = l.getAttribute("href") === "#" + en.target.id;
              l.classList.toggle("is-active", match);
              if (match) l.setAttribute("aria-current", "page");
              else l.removeAttribute("aria-current");
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
})();
