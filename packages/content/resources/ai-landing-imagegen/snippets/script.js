/* ============================================================
   Prismeo — landing page interactions (vanilla JS)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add("is-stuck");
    else nav.classList.remove("is-stuck");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  function closeMenu() {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeMenu();
  });

  /* ---------- generic CTA toasts ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () {
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- hero prompt bar ---------- */
  var promptForm = document.getElementById("hero-prompt");
  var promptInput = document.getElementById("promptInput");
  if (promptForm) {
    promptForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = promptInput.value.trim();
      toast(v ? "Rendering: “" + v.slice(0, 40) + "” …" : "Type a prompt to begin ✨");
    });
  }
  document.querySelectorAll("#promptHint .chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      promptInput.value = chip.textContent;
      promptInput.focus();
      toast("Loaded a starter prompt ✨");
    });
  });

  /* ---------- placeholder rotating hero prompt (typewriter) ---------- */
  var samples = [
    "a holographic koi swimming through neon rain…",
    "iridescent cathedral carved from liquid chrome…",
    "a desert bloom under aurora light…",
    "retro-future transit poster, risograph print…"
  ];
  var si = 0, ci = 0, deleting = false;
  function typeLoop() {
    if (document.activeElement === promptInput) { setTimeout(typeLoop, 900); return; }
    var word = samples[si];
    if (!deleting) {
      promptInput.placeholder = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; return setTimeout(typeLoop, 1800); }
    } else {
      promptInput.placeholder = word.slice(0, --ci);
      if (ci === 0) { deleting = false; si = (si + 1) % samples.length; }
    }
    setTimeout(typeLoop, deleting ? 32 : 58);
  }
  if (promptInput) setTimeout(typeLoop, 1200);

  /* ---------- style picker tabs ---------- */
  var STYLES = {
    holo: {
      label: ["aurora portrait", "chrome bloom", "prism city", "liquid sky", "neon koi", "glass orchid", "spectral wave", "iris nebula"],
      grads: [
        "conic-gradient(from 120deg,#ff3bd4,#8b5cff,#2ff3d6,#ffd166,#ff3bd4)",
        "linear-gradient(150deg,#ff3bd4,#8b5cff 70%)",
        "linear-gradient(150deg,#2ff3d6,#8b5cff)",
        "radial-gradient(120% 120% at 20% 10%,#ffd166,#ff3bd4 60%,#8b5cff)"
      ]
    },
    oil: {
      label: ["harvest field", "still life", "stormy port", "garden path", "fruit bowl", "river bend", "old town", "haystacks"],
      grads: [
        "linear-gradient(150deg,#b86b2e,#e0a458 60%,#6b4a2a)",
        "linear-gradient(150deg,#3b6b4a,#88a25a)",
        "linear-gradient(150deg,#7a4a2a,#c98b4a)",
        "radial-gradient(120% 120% at 30% 20%,#e8c071,#9a5b2e 70%)"
      ]
    },
    cyber: {
      label: ["rain alley", "megacity", "neon market", "drone view", "back street", "skybridge", "arcade", "tunnel run"],
      grads: [
        "linear-gradient(150deg,#ff2e97,#3b0f6b 70%)",
        "linear-gradient(150deg,#00e0ff,#7a00ff)",
        "linear-gradient(150deg,#ff006e,#0a0a3c)",
        "radial-gradient(120% 120% at 70% 10%,#00ffd5,#ff2e97 60%,#1a0033)"
      ]
    },
    blueprint: {
      label: ["engine bay", "floor plan", "turbine", "exploded view", "chassis", "circuit", "gearbox", "frame"],
      grads: [
        "linear-gradient(150deg,#0a2a52,#0e3e7a)",
        "repeating-linear-gradient(0deg,#0c3168 0 18px,#0e3a7a 18px 19px)",
        "linear-gradient(150deg,#08305f,#1259a8)",
        "repeating-linear-gradient(45deg,#0b2e5c 0 14px,#103a72 14px 16px)"
      ]
    },
    claymation: {
      label: ["round bot", "tiny house", "sleepy cat", "mushroom", "balloon", "snail", "lil ghost", "donut"],
      grads: [
        "linear-gradient(150deg,#ff9bd2,#ffd1a3)",
        "linear-gradient(150deg,#a7e0c8,#ffe5a3)",
        "linear-gradient(150deg,#c4b5fd,#fbcfe8)",
        "radial-gradient(120% 120% at 30% 25%,#ffe0a3,#ff9bd2 70%)"
      ]
    }
  };

  var grid = document.getElementById("styleGrid");
  var tabs = Array.prototype.slice.call(document.querySelectorAll("#styleTabs .tab"));

  function renderStyle(key) {
    var set = STYLES[key];
    if (!set || !grid) return;
    grid.innerHTML = "";
    for (var i = 0; i < 8; i++) {
      var card = document.createElement("div");
      card.className = "style-card";
      card.style.animationDelay = (i * 0.04) + "s";
      card.style.background = set.grads[i % set.grads.length];
      var tag = document.createElement("span");
      tag.textContent = set.label[i % set.label.length];
      card.appendChild(tag);
      grid.appendChild(card);
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderStyle(tab.getAttribute("data-style"));
    });
  });
  // keyboard arrow navigation on tabs
  document.getElementById("styleTabs").addEventListener("keydown", function (e) {
    var idx = tabs.indexOf(document.activeElement);
    if (idx < 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      var next = e.key === "ArrowRight" ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    }
  });
  renderStyle("holo");

  /* ---------- before/after slider ---------- */
  var range = document.getElementById("baRange");
  var before = document.getElementById("baBefore");
  var handle = document.getElementById("baHandle");
  if (range) {
    function syncBA() {
      var v = range.value;
      before.style.width = v + "%";
      handle.style.left = v + "%";
    }
    range.addEventListener("input", syncBA);
    syncBA();
  }

  /* ---------- pricing billing toggle ---------- */
  var billSwitch = document.getElementById("billSwitch");
  var billToggle = document.getElementById("billingToggle");
  var amounts = document.querySelectorAll(".plan__price .amount");
  if (billSwitch) {
    billSwitch.addEventListener("click", function () {
      var annual = billSwitch.getAttribute("aria-checked") !== "true";
      billSwitch.setAttribute("aria-checked", annual ? "true" : "false");
      billToggle.querySelectorAll(".toggle__label").forEach(function (l) {
        l.classList.toggle("is-active", l.getAttribute("data-bill") === (annual ? "annual" : "monthly"));
      });
      amounts.forEach(function (a) {
        var val = annual ? a.getAttribute("data-annual") : a.getAttribute("data-monthly");
        a.textContent = "$" + val;
      });
    });
  }

  /* ---------- CTA email form ---------- */
  var ctaForm = document.getElementById("ctaForm");
  if (ctaForm) {
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      toast("You're on the list ✨ We'll be in touch.");
      ctaForm.reset();
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
