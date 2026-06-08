(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  const toastEl = document.querySelector("[data-toast]");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 3200);
  }

  /* ---------- Sticky topbar shadow ---------- */
  const topbar = document.querySelector(".topbar");
  const onScroll = () => {
    if (!topbar) return;
    topbar.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Smooth scroll for data-scroll buttons ---------- */
  document.querySelectorAll("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Featured estate switcher ---------- */
  const heroData = [
    {
      title: "Estates composed<br /><em>for a quieter life.</em>",
      lede: "A discreet portfolio of architecturally significant residences across coast, canyon and old-world capitals — represented by invitation.",
    },
    {
      title: "A mountain house,<br /><em>carved into light.</em>",
      lede: "Eight bedrooms above the Highlands, glass to the tree line, and thirty-five private acres an hour from the slopes.",
    },
    {
      title: "Lake water,<br /><em>framed in stone.</em>",
      lede: "A restored lakeside villa on Como — terraced gardens, a private dock, and frescoes returned to their original hand.",
    },
  ];
  const heroPhoto = document.querySelector("[data-hero-photo]");
  const heroTitle = document.querySelector(".hero__title");
  const heroLede = document.querySelector(".hero__lede");
  const switches = Array.from(document.querySelectorAll(".hswitch"));

  function setHero(idx) {
    const data = heroData[idx];
    if (!data) return;
    switches.forEach((s, i) => {
      const active = i === idx;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (heroPhoto) {
      heroPhoto.style.opacity = "0";
      setTimeout(() => {
        heroPhoto.setAttribute("data-variant", String(idx));
        heroPhoto.style.opacity = "1";
      }, 260);
    }
    if (heroTitle) heroTitle.innerHTML = data.title;
    if (heroLede) heroLede.textContent = data.lede;
  }
  if (heroPhoto) heroPhoto.setAttribute("data-variant", "0");
  switches.forEach((s, i) => {
    s.addEventListener("click", () => setHero(i));
  });

  // auto-rotate hero, pause on interaction
  let autoIdx = 0;
  let autoTimer = setInterval(rotate, 6500);
  function rotate() {
    autoIdx = (autoIdx + 1) % heroData.length;
    setHero(autoIdx);
  }
  switches.forEach((s, i) => {
    s.addEventListener("click", () => {
      autoIdx = i;
      clearInterval(autoTimer);
      autoTimer = setInterval(rotate, 9000);
    });
  });

  /* ---------- Listing filters ---------- */
  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll(".card"));
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const filter = chip.getAttribute("data-filter");
      let shown = 0;
      cards.forEach((card) => {
        const match = filter === "all" || card.getAttribute("data-kind") === filter;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      toast(
        shown +
          (shown === 1 ? " residence" : " residences") +
          (filter === "all" ? " in the collection" : " · " + chip.textContent.trim())
      );
    });
  });

  /* ---------- Card activation (keyboard + click) ---------- */
  cards.forEach((card) => {
    const open = () => {
      const title = card.querySelector(".card__title");
      toast("Requesting details — " + (title ? title.textContent : "residence"));
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  /* ---------- Inquiry bar ---------- */
  const inquiry = document.querySelector("[data-inquiry]");
  if (inquiry) {
    inquiry.addEventListener("submit", (e) => {
      e.preventDefault();
      const loc = inquiry.querySelector("#loc").value;
      const kind = inquiry.querySelector("#kind").value;
      toast("Portfolio en route — " + kind + " · " + loc);
    });
  }

  /* ---------- CTA form ---------- */
  const ctaForm = document.querySelector("[data-cta]");
  if (ctaForm) {
    ctaForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (ctaForm.querySelector('[name="name"]').value || "").trim();
      const first = name.split(" ")[0] || "there";
      toast("Thank you, " + first + " — an advisor will be in touch within one business day.");
      ctaForm.reset();
    });
  }
})();
