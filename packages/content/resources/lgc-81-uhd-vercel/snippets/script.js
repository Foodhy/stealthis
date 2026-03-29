gsap.registerPlugin(ScrollTrigger);

// --- Hero entrance ---
const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

heroTl
  .to(".hero-badge", { opacity: 1, duration: 0.8, delay: 0.3 })
  .to(".hero-line", {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.12,
  }, "-=0.4")
  .to(".hero-desc", { opacity: 1, duration: 0.8 }, "-=0.5")
  .to(".hero-cta", { opacity: 1, duration: 0.6 }, "-=0.4")
  .to(".terminal", { opacity: 1, y: 0, duration: 0.8 }, "-=0.3");

// --- Terminal typing ---
const CMD = "npx vercel deploy --prod";
const cmdEl = document.getElementById("t-cmd-1");
const output1 = document.getElementById("t-output-1");
const output2 = document.getElementById("t-output-2");
const cursor = document.querySelector(".t-cursor");

let charIndex = 0;

function typeCmd() {
  if (charIndex < CMD.length) {
    cmdEl.textContent += CMD[charIndex];
    charIndex++;
    setTimeout(typeCmd, 40 + Math.random() * 30);
  } else {
    cursor.style.display = "none";
    setTimeout(() => {
      output1.hidden = false;
      gsap.from(output1, { opacity: 0, x: -5, duration: 0.3 });
    }, 400);
    setTimeout(() => {
      output2.hidden = false;
      gsap.from(output2, { opacity: 0, x: -5, duration: 0.3 });
    }, 1600);
  }
}

setTimeout(typeCmd, 2000);

// --- Reveal on scroll (for non-bento elements) ---
gsap.utils.toArray(".reveal").forEach((el) => {
  gsap.fromTo(el,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    }
  );
});

// --- Metric count-up ---
document.querySelectorAll(".metric-value").forEach((el) => {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;

  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.to({ val: 0 }, {
        val: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: function () {
          el.textContent = Math.round(this.targets()[0].val);
        },
      });
    },
  });
});

// --- Bento stagger (no .reveal class — dedicated animation) ---
const bentoGrid = document.querySelector(".bento-grid");
if (bentoGrid) {
  gsap.fromTo(".bento-card",
    { opacity: 0, y: 30, scale: 0.97 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: bentoGrid,
        start: "top 82%",
        toggleActions: "play none none none",
      },
    }
  );
}

// --- Framework logos stagger ---
const fwLogos = document.querySelector(".framework-logos");
if (fwLogos) {
  gsap.fromTo(".fw-logo",
    { opacity: 0, y: 15 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: fwLogos,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    }
  );
}

// --- Edge dots pulse ---
gsap.utils.toArray(".edge-dot").forEach((dot, i) => {
  gsap.to(dot, {
    r: 7,
    opacity: 0.6,
    duration: 1.2,
    delay: i * 0.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
});
