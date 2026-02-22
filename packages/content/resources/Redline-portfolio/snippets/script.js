const data = {
  projects: [
    {
      title: "Crimson Grid",
      desc: "Minimal admin UI with redline accents and rapid navigation.",
      tag: "UI"
    },
    {
      title: "Shadow Runner",
      desc: "Landing system for a stealth game brand rollout.",
      tag: "Brand"
    },
    {
      title: "Night Signal",
      desc: "Realtime dashboard tuned for low-light control rooms.",
      tag: "Data"
    },
    {
      title: "Blacksite",
      desc: "Secure onboarding flow with multi-step verification.",
      tag: "Product"
    }
  ],
  capabilities: [
    "High-contrast UI systems",
    "Motion timing and easing",
    "Brand systems for dark interfaces",
    "Interactive dashboards"
  ],
  stack: ["Figma", "GSAP", "Lenis", "Three.js", "TypeScript", "WebGL"],
  stats: [
    { value: "18", label: "Launches completed" },
    { value: "7", label: "Active retainers" },
    { value: "96%", label: "On-time delivery" }
  ],
  contacts: [
    { label: "Email", value: "redline@studio.com" },
    { label: "LinkedIn", value: "/redline" },
    { label: "GitHub", value: "@redline" }
  ]
};

const projectGrid = document.getElementById("project-grid");
const capabilityList = document.getElementById("capabilities");
const stackGrid = document.getElementById("stack");
const statsGrid = document.getElementById("stats");
const contactGrid = document.getElementById("contact-cards");

if (projectGrid) {
  projectGrid.innerHTML = data.projects
    .map(
      (project) => `
        <article class="card">
          <span>${project.tag}</span>
          <h3>${project.title}</h3>
          <p>${project.desc}</p>
        </article>
      `
    )
    .join("");
}

if (capabilityList) {
  capabilityList.innerHTML = data.capabilities
    .map((item) => `<li>${item}</li>`)
    .join("");
}

if (stackGrid) {
  stackGrid.innerHTML = data.stack.map((item) => `<span>${item}</span>`).join("");
}

if (statsGrid) {
  statsGrid.innerHTML = data.stats
    .map(
      (stat) => `
        <div>
          <h2>${stat.value}</h2>
          <p>${stat.label}</p>
        </div>
      `
    )
    .join("");
}

if (contactGrid) {
  contactGrid.innerHTML = data.contacts
    .map(
      (contact) => `
        <article class="contact-card">
          <h4>${contact.label}</h4>
          <p>${contact.value}</p>
        </article>
      `
    )
    .join("");
}

const lenis = window.Lenis
  ? new Lenis({
      smoothWheel: true,
      smoothTouch: false
    })
  : null;

function raf(time) {
  if (lenis) lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.from(".hero", {
  opacity: 0,
  y: 40,
  duration: 1,
  ease: "power3.out"
});

gsap.utils.toArray(".card, .list li, .pill-grid span, .stats div").forEach((item, index) => {
  gsap.from(item, {
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: index * 0.04,
    ease: "power2.out"
  });
});

const toggle = document.getElementById("dark-toggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    const isActive = toggle.classList.toggle("active");
    document.body.classList.toggle("dark-armed", isActive);
    toggle.setAttribute("aria-pressed", String(isActive));
  });
}
