(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Toast helper ---------- */
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

  /* ---------- Reading progress + top bar ---------- */
  var progressBar = document.getElementById("progressBar");
  var progressWrap = document.querySelector(".progress");
  var topbar = document.getElementById("topbar");
  var cover = document.getElementById("cover");
  var ticking = false;

  function onScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docH =
      document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? Math.min(1, Math.max(0, scrollTop / docH)) : 0;

    if (progressBar) progressBar.style.width = (pct * 100).toFixed(2) + "%";
    if (progressWrap)
      progressWrap.setAttribute("aria-valuenow", Math.round(pct * 100));

    // Reveal slim top bar once cover is mostly scrolled past
    var coverH = cover ? cover.offsetHeight : window.innerHeight;
    if (topbar) {
      if (scrollTop > coverH * 0.65) topbar.classList.add("is-visible");
      else topbar.classList.remove("is-visible");
    }

    // Parallax
    if (!prefersReduced) applyParallax(scrollTop);
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }

  /* ---------- Parallax ---------- */
  var parallaxEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-parallax]")
  );

  function applyParallax(scrollTop) {
    var vh = window.innerHeight;
    for (var i = 0; i < parallaxEls.length; i++) {
      var el = parallaxEls[i];
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
      var rect = el.getBoundingClientRect();
      // Distance of element center from viewport center
      var center = rect.top + rect.height / 2;
      var offset = (center - vh / 2) * speed * -1;
      el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);

  /* ---------- Active-chapter tracking ---------- */
  var railLinks = Array.prototype.slice.call(
    document.querySelectorAll(".rail__link")
  );
  var chapters = Array.prototype.slice.call(
    document.querySelectorAll(".chapter[data-chapter]")
  );
  var linkById = {};
  railLinks.forEach(function (l) {
    linkById[l.getAttribute("data-chapter")] = l;
  });

  function setActive(id) {
    railLinks.forEach(function (l) {
      l.classList.toggle(
        "is-active",
        l.getAttribute("data-chapter") === id
      );
    });
  }

  if ("IntersectionObserver" in window && chapters.length) {
    var visible = {};
    var chapterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          visible[e.target.id] = e.isIntersecting
            ? e.intersectionRatio
            : 0;
        });
        // pick the chapter with highest visibility
        var best = null;
        var bestRatio = 0;
        chapters.forEach(function (c) {
          var r = visible[c.id] || 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = c.id;
          }
        });
        if (best) setActive(best);
      },
      {
        rootMargin: "-30% 0px -45% 0px",
        threshold: [0, 0.2, 0.5, 0.8, 1],
      }
    );
    chapters.forEach(function (c) {
      chapterObserver.observe(c);
    });
  } else if (chapters.length) {
    setActive(chapters[0].id);
  }

  // Smooth-scroll + immediate highlight on rail click
  railLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setActive(link.getAttribute("data-chapter"));
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = [].slice.call(
    document.querySelectorAll(".fig, .grid2, .pullbreak, .chapter__head")
  );
  revealTargets.forEach(function (el) {
    el.setAttribute("data-reveal", "");
  });

  if ("IntersectionObserver" in window && !prefersReduced) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- Share ---------- */
  function share() {
    var data = {
      title: document.title,
      text: "The Last Lamp Lighter of Vellmark — The Meridian Review",
      url: location.href,
    };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(location.href)
        .then(function () {
          toast("Link copied to clipboard");
        })
        .catch(function () {
          toast("Share this story");
        });
    } else {
      toast("Share this story");
    }
  }
  ["shareTop", "shareBottom"].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener("click", share);
  });

  var toTopBtn = document.getElementById("toTop");
  if (toTopBtn) {
    toTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReduced ? "auto" : "smooth",
      });
    });
  }

  // Initial paint
  requestTick();
})();
