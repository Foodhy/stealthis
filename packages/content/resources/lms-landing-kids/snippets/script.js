(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------- Mobile nav ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navlinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Sticky nav shadow ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Mascot eyes follow cursor ---------- */
  const mascot = document.getElementById("mascot");
  const pupils = document.querySelectorAll(".eye i");
  if (mascot && pupils.length) {
    window.addEventListener(
      "mousemove",
      (e) => {
        const r = mascot.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = Math.max(-5, Math.min(5, (e.clientX - cx) / 40));
        const dy = Math.max(-4, Math.min(4, (e.clientY - cy) / 40));
        pupils.forEach((p) => (p.style.transform = `translate(${dx}px, ${dy}px)`));
      },
      { passive: true }
    );
    const greetings = ["Hi friend! 👋", "Let's learn! 🦊", "You're awesome! ⭐", "Ready to play? 🎈"];
    let gi = 0;
    mascot.addEventListener("click", () => {
      toast(greetings[gi++ % greetings.length]);
      mascot.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.12) rotate(-6deg)" }, { transform: "scale(1)" }],
        { duration: 450, easing: "cubic-bezier(.34,1.7,.5,1)" }
      );
    });
  }

  /* ---------- Subject cards ---------- */
  document.querySelectorAll(".subject").forEach((card) => {
    card.addEventListener("click", () => {
      const name = card.dataset.name;
      const lessons = card.dataset.lessons;
      const fact = card.dataset.fact;
      card.classList.remove("pop");
      void card.offsetWidth; // restart animation
      card.classList.add("pop");
      toast(`${name} — ${lessons} lessons. ${fact}`);
    });
  });

  /* ---------- Age picker ---------- */
  document.querySelectorAll(".pick-age").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".age");
      const group = card ? card.querySelector("h3").textContent.trim() : "this path";
      toast(`Yay! ${group} path picked — scroll down to start free 🎉`);
      const trial = document.getElementById("trial");
      if (trial) trial.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  /* ---------- "Watch the fun" ---------- */
  const playBtn = document.getElementById("playBtn");
  if (playBtn) playBtn.addEventListener("click", () => toast("🎬 Demo video is just for show in this fictional UI!"));

  /* ---------- Trial form ---------- */
  const form = document.getElementById("trialForm");
  const email = document.getElementById("email");
  if (form && email) {
    const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = email.value.trim();
      if (!valid(v)) {
        email.classList.add("err");
        email.focus();
        toast("Oops! Please enter a valid email 📧");
        return;
      }
      email.classList.remove("err");
      toast(`🎉 Welcome aboard! Your 7-day free trial is ready, ${v.split("@")[0]}!`);
      form.reset();
      celebrate();
    });
    email.addEventListener("input", () => email.classList.remove("err"));
  }

  /* ---------- Confetti burst ---------- */
  function celebrate() {
    const emojis = ["⭐", "🎈", "🎉", "🦊", "💛", "🚀", "🎨"];
    for (let i = 0; i < 26; i++) {
      const s = document.createElement("span");
      s.textContent = emojis[(Math.random() * emojis.length) | 0];
      s.style.cssText =
        "position:fixed;left:" +
        (40 + Math.random() * 20) +
        "%;top:55%;font-size:" +
        (16 + Math.random() * 18) +
        "px;pointer-events:none;z-index:120;will-change:transform,opacity;";
      document.body.appendChild(s);
      const dx = (Math.random() - 0.5) * 520;
      const dy = -160 - Math.random() * 320;
      s.animate(
        [
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${(Math.random() - 0.5) * 720}deg)`, opacity: 0 },
        ],
        { duration: 1100 + Math.random() * 700, easing: "cubic-bezier(.2,.6,.3,1)" }
      ).onfinish = () => s.remove();
    }
  }
})();
