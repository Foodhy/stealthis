/* ============================================================
   Sparkleton — Educational / EdTech Landing
   Vanilla JS interactions: mobile nav, toasts, subject switcher
   with live lesson list, weekly progress stars + rocket,
   billing toggle, email capture, dyslexia-friendly font toggle.
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Toast helper ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  // any element with data-toast fires a toast
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-toast]");
    if (t) {
      if (t.tagName === "A" && (t.getAttribute("href") || "").startsWith("#")) {
        // allow anchor scroll AND toast for demo links that are just "#"
        if (t.getAttribute("href") === "#") e.preventDefault();
      }
      toast(t.getAttribute("data-toast"));
    }
    const sc = e.target.closest("[data-scroll]");
    if (sc) {
      const target = $(sc.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  /* ---------- Mobile nav ---------- */
  const navToggle = $(".nav-toggle");
  const mobileNav = $("#mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("open");
      mobileNav.hidden = !open;
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mobileNav.addEventListener("click", (e) => {
      if (e.target.closest("a, .btn")) {
        mobileNav.classList.remove("open");
        mobileNav.hidden = true;
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* ---------- Subject switcher with live lesson list ---------- */
  const SUBJECTS = {
    reading: {
      name: "Reading",
      color: "#ff5a8a",
      title: "Today in Reading",
      lessons: [
        { emoji: "🔤", text: "Sound out the 'sh' sound", meta: "5 min" },
        { emoji: "📚", text: "Read along: The Sleepy Snail", meta: "8 min" },
        { emoji: "🧩", text: "Match rhyming word pairs", meta: "Game" },
      ],
    },
    math: {
      name: "Math",
      color: "#3aa0ff",
      title: "Today in Math",
      lessons: [
        { emoji: "🔢", text: "Count fireflies to 30", meta: "4 min" },
        { emoji: "➕", text: "Add the apples in the basket", meta: "6 min" },
        { emoji: "🍕", text: "Share the pizza into halves", meta: "Game" },
      ],
    },
    science: {
      name: "Science",
      color: "#2bb673",
      title: "Today in Science",
      lessons: [
        { emoji: "🐝", text: "Why do bees buzz?", meta: "5 min" },
        { emoji: "🌧️", text: "Where does rain come from?", meta: "7 min" },
        { emoji: "🪐", text: "Spot the planets puzzle", meta: "Game" },
      ],
    },
  };

  const subjectCards = $$(".subject-card");
  const lessonBadge = $("#lesson-badge");
  const lessonTitle = $("#lesson-title");
  const lessonList = $("#lesson-list");

  function renderSubject(key) {
    const s = SUBJECTS[key];
    if (!s || !lessonList) return;
    if (lessonBadge) {
      lessonBadge.textContent = s.name;
      lessonBadge.style.background = s.color;
    }
    if (lessonTitle) lessonTitle.textContent = s.title;
    lessonList.innerHTML = "";
    s.lessons.forEach((l, i) => {
      const li = document.createElement("li");
      li.style.setProperty("--accent", s.color);
      li.style.animationDelay = i * 80 + "ms";
      li.innerHTML =
        '<span class="l-emoji" aria-hidden="true"></span>' +
        '<span class="l-text"></span>' +
        '<span class="l-meta"></span>';
      li.querySelector(".l-emoji").textContent = l.emoji;
      li.querySelector(".l-text").textContent = l.text;
      li.querySelector(".l-meta").textContent = l.meta;
      lessonList.appendChild(li);
    });
  }

  subjectCards.forEach((card) => {
    card.addEventListener("click", () => {
      subjectCards.forEach((c) => {
        c.classList.remove("is-on");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("is-on");
      card.setAttribute("aria-pressed", "true");
      renderSubject(card.dataset.subject);
    });
  });
  // initial render
  renderSubject("reading");

  /* ---------- Weekly progress: stars + rocket ---------- */
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const starsWrap = $("#track-stars");
  const trackFill = $("#track-fill");
  const trackRocket = $("#track-rocket");
  const progressPct = $("#progress-pct");
  const streakCount = $("#streak-count");
  const doneState = new Array(DAYS.length).fill(false);
  // pre-complete the streak (Mon–Fri) to match the "5-day streak" copy
  for (let i = 0; i < 5; i++) doneState[i] = true;

  function refreshProgress(animate) {
    const done = doneState.filter(Boolean).length;
    const pct = Math.round((done / DAYS.length) * 100);
    if (trackFill) trackFill.style.width = pct + "%";
    if (trackRocket) trackRocket.style.left = pct + "%";
    if (progressPct) progressPct.textContent = pct + "%";
    if (streakCount) {
      // streak = leading run of completed days from Monday
      let streak = 0;
      for (let i = 0; i < doneState.length && doneState[i]; i++) streak++;
      streakCount.textContent = streak;
    }
    if (animate && pct === 100) toast("Whole week done — you're a superstar! 🌟");
  }

  if (starsWrap) {
    DAYS.forEach((day, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "star-btn" + (doneState[i] ? " is-done" : "");
      btn.textContent = "⭐";
      btn.setAttribute("aria-pressed", String(doneState[i]));
      btn.setAttribute("aria-label", day + (doneState[i] ? " — lesson done" : " — mark lesson done"));
      btn.addEventListener("click", () => {
        doneState[i] = !doneState[i];
        btn.classList.toggle("is-done", doneState[i]);
        btn.setAttribute("aria-pressed", String(doneState[i]));
        btn.setAttribute("aria-label", day + (doneState[i] ? " — lesson done" : " — mark lesson done"));
        refreshProgress(true);
      });
      starsWrap.appendChild(btn);
    });
    refreshProgress(false);
  }

  /* ---------- Pricing: billing toggle ---------- */
  const billBtns = $$(".bill-btn");
  const amts = $$(".price-tag .amt");
  const pers = $$(".price-tag .per");
  billBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.bill; // monthly | yearly
      billBtns.forEach((b) => {
        b.classList.toggle("is-on", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      amts.forEach((a) => {
        a.textContent = mode === "yearly" ? a.dataset.year : a.dataset.month;
      });
      pers.forEach((p) => {
        p.textContent = mode === "yearly" ? "/ month, billed yearly" : "/ month";
      });
    });
  });

  /* ---------- CTA email capture ---------- */
  const ctaForm = $("#cta-form");
  if (ctaForm) {
    const input = $("#cta-email");
    const msg = $("#cta-msg");
    ctaForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (input.value || "").trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        msg.textContent = "Oops — please enter a valid email. 🙂";
        msg.style.color = "#fff3a8";
        input.focus();
        return;
      }
      msg.textContent = "You're in! Check your inbox for the first lesson. 🎉";
      msg.style.color = "#fff";
      input.value = "";
      toast("Free trial started — let's learn! 🎉");
    });
  }

  /* ---------- Dyslexia-friendly / easy-read toggle ---------- */
  const dx = $("#dyslexia-toggle");
  if (dx) {
    dx.addEventListener("click", () => {
      const on = document.body.classList.toggle("easy-read");
      dx.setAttribute("aria-pressed", String(on));
      toast(on ? "Easy-read font on 📖" : "Easy-read font off");
    });
  }

  /* ---------- Active-section highlight in nav ---------- */
  const navLinks = $$(".main-nav a[href^='#']");
  const sections = navLinks
    .map((a) => $(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const id = "#" + en.target.id;
            navLinks.forEach((a) =>
              a.style.setProperty(
                "background",
                a.getAttribute("href") === id ? "#fff" : ""
              )
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }
})();
