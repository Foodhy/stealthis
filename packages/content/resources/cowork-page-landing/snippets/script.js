// Foundry Works — coworking landing interactions (vanilla JS)
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  const toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    const el = document.createElement("div");
    el.className = "toast";
    const dot = document.createElement("span");
    dot.className = "tdot";
    if (kind === "warn") dot.style.background = "var(--warn)";
    if (kind === "err") dot.style.background = "var(--danger)";
    el.append(dot, document.createTextNode(msg));
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 3200);
  }

  /* ---------- mobile nav ---------- */
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");
  function closeNav() {
    hamburger.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  }
  hamburger.addEventListener("click", () => {
    const open = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", String(!open));
    mobileNav.hidden = open;
  });
  mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- tour form ---------- */
  const form = document.getElementById("tourForm");
  const note = document.getElementById("formNote");
  const dateInput = document.getElementById("tDate");
  // default the date to tomorrow, min = today
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  dateInput.min = iso(today);
  const tomorrow = new Date(today.getTime() + 86400000);
  dateInput.value = iso(tomorrow);

  function setError(input, on) {
    input.classList.toggle("invalid", on);
    input.setAttribute("aria-invalid", on ? "true" : "false");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name;
    const email = form.email;
    let ok = true;

    if (!name.value.trim()) { setError(name, true); ok = false; } else setError(name, false);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailOk) { setError(email, true); ok = false; } else setError(email, false);
    if (!dateInput.value) { setError(dateInput, true); ok = false; } else setError(dateInput, false);

    if (!ok) {
      note.textContent = "Please check the highlighted fields.";
      note.className = "form-note err";
      return;
    }

    const when = new Date(dateInput.value + "T00:00:00").toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric",
    });
    const first = name.value.trim().split(/\s+/)[0];
    note.textContent = "Tour booked — see you " + when + "!";
    note.className = "form-note ok";
    toast("Thanks " + first + "! We'll confirm your tour by email.");
    form.reset();
    dateInput.min = iso(today);
    dateInput.value = iso(tomorrow);
  });

  // clear error styling as the member types
  form.querySelectorAll("input").forEach((inp) =>
    inp.addEventListener("input", () => setError(inp, false))
  );

  /* ---------- newsletter ---------- */
  const newsForm = document.getElementById("newsForm");
  const newsNote = document.getElementById("newsNote");
  newsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("news");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      newsNote.textContent = "Enter a valid email to subscribe.";
      newsNote.style.color = "var(--danger)";
      input.focus();
      return;
    }
    newsNote.textContent = "You're on the list. Welcome!";
    newsNote.style.color = "var(--ok)";
    toast("Subscribed to the Foundry monthly note.");
    newsForm.reset();
  });

  /* ---------- gallery lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lbPhoto = document.getElementById("lbPhoto");
  const lbTitle = document.getElementById("lbTitle");
  const lbDesc = document.getElementById("lbDesc");
  const lbClose = document.getElementById("lbClose");
  let lastFocused = null;

  function openLightbox(card) {
    lastFocused = card;
    lbTitle.textContent = card.dataset.title;
    lbDesc.textContent = card.dataset.desc;
    // mirror the card's gradient class onto the lightbox photo
    lbPhoto.className = "lb-photo";
    card.classList.forEach((c) => { if (c.startsWith("ph-")) lbPhoto.classList.add(c); });
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".gcard").forEach((card) =>
    card.addEventListener("click", () => openLightbox(card))
  );
  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });

  /* ---------- scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- live "desks free" ticker on the hero badge ---------- */
  const badge = document.querySelector(".hero-badge strong");
  const badgeTime = document.querySelector(".hero-badge small");
  if (badge) {
    let free = 18;
    setInterval(() => {
      free += Math.random() > 0.5 ? 1 : -1;
      free = Math.max(11, Math.min(24, free));
      badge.textContent = free + " desks free";
      badgeTime.textContent = "updated just now";
    }, 5000);
  }
})();
