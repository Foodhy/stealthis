(function () {
  "use strict";

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
    }, 3200);
  }

  /* ---------- listing tab switch (active / sold) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = {
    active: document.querySelector('[data-panel="active"]'),
    sold: document.querySelector('[data-panel="sold"]'),
  };

  function selectTab(name) {
    tabs.forEach(function (tab) {
      var on = tab.dataset.tab === name;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    Object.keys(panels).forEach(function (key) {
      var panel = panels[key];
      if (!panel) return;
      var on = key === name;
      panel.classList.toggle("is-hidden", !on);
      if (on) {
        panel.removeAttribute("hidden");
        // re-trigger the rise animation on the newly shown cards
        panel.querySelectorAll(".card").forEach(function (card, i) {
          card.style.animation = "none";
          // force reflow
          void card.offsetWidth;
          card.style.animation = "";
          card.style.animationDelay = i * 0.05 + "s";
        });
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  tabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () {
      selectTab(tab.dataset.tab);
    });
    tab.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var next = e.key === "ArrowRight" ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      selectTab(tabs[next].dataset.tab);
    });
  });

  /* ---------- tour request buttons ---------- */
  document.querySelectorAll("[data-tour]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Tour requested for " + btn.dataset.tour + " — Marguerite will be in touch.");
    });
  });

  /* ---------- share ---------- */
  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var data = {
        title: "Marguerite Alcott — Halford & Vane",
        text: "Marguerite Alcott, Principal Broker on the Marisol coast.",
        url: location.href,
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(
          function () { toast("Profile link copied to clipboard."); },
          function () { toast("Couldn't copy — please copy the URL manually."); }
        );
      } else {
        toast("Sharing isn't supported in this browser.");
      }
    });
  }

  /* ---------- reviews carousel ---------- */
  var track = document.getElementById("revTrack");
  var prevBtn = document.getElementById("revPrev");
  var nextBtn = document.getElementById("revNext");
  var dotsWrap = document.getElementById("revDots");

  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll("[data-rev]"));
    var index = 0;
    var auto = null;

    // build dots
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Review " + (i + 1));
      b.addEventListener("click", function () { go(i, true); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function render() {
      track.style.transform = "translateX(" + -index * 100 + "%)";
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === index);
        d.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    }
    function go(i, userInitiated) {
      index = (i + slides.length) % slides.length;
      render();
      if (userInitiated) restartAuto();
    }
    function startAuto() {
      auto = setInterval(function () { go(index + 1, false); }, 6000);
    }
    function restartAuto() {
      clearInterval(auto);
      startAuto();
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { go(index + 1, true); });
    if (prevBtn) prevBtn.addEventListener("click", function () { go(index - 1, true); });

    // pause on hover / focus
    var carousel = track.closest(".reviews");
    if (carousel) {
      carousel.addEventListener("mouseenter", function () { clearInterval(auto); });
      carousel.addEventListener("mouseleave", startAuto);
      carousel.addEventListener("focusin", function () { clearInterval(auto); });
      carousel.addEventListener("focusout", startAuto);
    }

    // keyboard
    track.parentElement.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1, true); }
    });

    render();
    startAuto();
  }

  /* ---------- count-up stats ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if (counters.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { io.observe(el); });
  }
  function animateCount(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var dur = 1100;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        var firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        toast("Please complete the highlighted fields.");
        return;
      }
      var name = (form.elements.name.value || "").trim().split(" ")[0] || "there";
      form.reset();
      toast("Thanks, " + name + " — your message is on its way to Marguerite.");
    });
  }
})();
