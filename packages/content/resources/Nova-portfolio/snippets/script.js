// Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  direction: "vertical",
  gestureDirection: "vertical",
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 2,
});

// Animation loop
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Update ScrollTrigger on scroll
lenis.on("scroll", ScrollTrigger.update);

// Proxy scroll events to GSAP
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Three.js Background Setup
let scene;
let camera;
let renderer;
let particles;

function initThree() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Renderer
  const canvas = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Create particles (stars)
  const particleCount = 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const pinkColor = new THREE.Color(0xffb6c1);
  const whiteColor = new THREE.Color(0xffffff);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;

    const color = Math.random() > 0.7 ? pinkColor : whiteColor;
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Create smoke/glow effect
  const smokeGeometry = new THREE.PlaneGeometry(10, 10);
  const smokeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff69b4,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
  });

  const smokeCount = 5;
  for (let i = 0; i < smokeCount; i++) {
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());
    smoke.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8 - 2, -2);
    smoke.rotation.z = Math.random() * Math.PI;
    smoke.scale.set(Math.random() * 2 + 1, Math.random() * 3 + 2, 1);
    scene.add(smoke);
  }

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate particles
  if (particles) {
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;
  }

  renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

// Initialize Three.js
initThree();

// GSAP Animations
const sections = gsap.utils.toArray(".section");
for (const [index, section] of sections.entries()) {
  if (index > 0) {
    gsap.from(section, {
      opacity: 0,
      y: 100,
      duration: 1,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "top 20%",
        scrub: 1,
      },
    });
  }
}

// Animate main title
gsap.from(".main-title", {
  opacity: 0,
  scale: 0.8,
  duration: 1.5,
  ease: "power3.out",
});

// Animate subtitle
gsap.from(".subtitle", {
  opacity: 0,
  x: -50,
  duration: 1,
  delay: 0.5,
  ease: "power3.out",
});

// Animate buttons
gsap.from(".btn", {
  opacity: 0,
  y: 30,
  duration: 0.8,
  delay: 1,
  stagger: 0.2,
  ease: "power3.out",
});

// Animate content items
const contentItems = gsap.utils.toArray(".content-item, .project-card");
for (const [index, item] of contentItems.entries()) {
  gsap.from(item, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    scrollTrigger: {
      trigger: item,
      start: "top 85%",
      toggleActions: "play none none none",
    },
    delay: index * 0.1,
  });
}

// Animate skill bars
const skillBars = gsap.utils.toArray(".skill-progress");
for (const bar of skillBars) {
  const progress = bar.getAttribute("data-progress");
  gsap.to(bar, {
    width: `${progress}%`,
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
      trigger: bar,
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });
}

// Button interactions
for (const btn of document.querySelectorAll(".btn")) {
  btn.addEventListener("click", (_e) => {
    if (btn.classList.contains("btn-docs")) {
      // Scroll to about section or external link
      lenis.scrollTo("#about", { duration: 1.5 });
    } else if (btn.classList.contains("btn-showcase")) {
      // Scroll to projects section
      lenis.scrollTo("#projects", { duration: 1.5 });
    }
  });
}

// Card Expansion Animation
const projectCards = document.querySelectorAll(".project-card");
const body = document.body;

for (const card of projectCards) {
  const expandedContent = card.querySelector(".card-expanded");
  const closeBtn = card.querySelector(".close-card");
  const cardContent = card.querySelector(
    ".project-title, .project-description, .project-tags, .project-number"
  );

  // Open card animation
  card.addEventListener("click", (e) => {
    // Don't trigger if clicking on expanded content or close button
    if (e.target.closest(".card-expanded") || e.target.closest(".close-card")) return;

    // Don't open if already open
    if (expandedContent.classList.contains("active")) return;

    // Prevent scroll
    lenis.stop();
    body.classList.add("card-open");
    card.classList.add("active");
    expandedContent.classList.add("active");

    // Get card position
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    // Get the expanded content element (not the overlay)
    const expandedContentBox = expandedContent.querySelector(".expanded-content");

    // Set initial transform origin
    if (expandedContentBox) {
      expandedContentBox.style.transformOrigin = `${cardCenterX}px ${cardCenterY}px`;
    }

    // Animate overlay background
    gsap.fromTo(
      expandedContent,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      }
    );

    // Animate expanded content box
    if (expandedContentBox) {
      gsap.fromTo(
        expandedContentBox,
        {
          opacity: 0,
          scale: 0.3,
          rotation: -5,
          y: 50,
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
        }
      );
    }

    // Animate expanded content
    const expandedNumber = expandedContent.querySelector(".expanded-number");
    const expandedTitle = expandedContent.querySelector(".expanded-title");
    const expandedDescription = expandedContent.querySelector(".expanded-description");
    const expandedFeatures = expandedContent.querySelector(".expanded-features");
    const expandedLinks = expandedContent.querySelector(".expanded-links");

    gsap.fromTo(
      expandedNumber,
      {
        scale: 0,
        rotation: -180,
        opacity: 0,
      },
      {
        scale: 1,
        rotation: 0,
        opacity: 0.2,
        duration: 1,
        ease: "back.out(1.7)",
        delay: 0.2,
      }
    );

    gsap.fromTo(
      expandedTitle,
      {
        y: 50,
        opacity: 0,
        scale: 0.8,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.4,
      }
    );

    gsap.fromTo(
      expandedDescription,
      {
        y: 30,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.6,
      }
    );

    gsap.fromTo(
      expandedFeatures,
      {
        x: -50,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.8,
      }
    );

    gsap.fromTo(
      expandedLinks,
      {
        y: 30,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        delay: 1,
      }
    );

    // Animate close hint
    const expandedCloseHint = expandedContent.querySelector(".expanded-close-hint");
    if (expandedCloseHint) {
      gsap.fromTo(
        expandedCloseHint,
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          delay: 1.2,
        }
      );
    }

    // Animate close button
    gsap.fromTo(
      closeBtn,
      {
        scale: 0,
        rotation: -180,
        opacity: 0,
      },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 0.5,
      }
    );
  });

  // Close card animation
  function closeCard() {
    const expandedNumber = expandedContent.querySelector(".expanded-number");
    const expandedTitle = expandedContent.querySelector(".expanded-title");
    const expandedDescription = expandedContent.querySelector(".expanded-description");
    const expandedFeatures = expandedContent.querySelector(".expanded-features");
    const expandedLinks = expandedContent.querySelector(".expanded-links");

    // Animate close button
    gsap.to(closeBtn, {
      scale: 0,
      rotation: 180,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    });

    // Animate content out
    const expandedCloseHint = expandedContent.querySelector(".expanded-close-hint");
    gsap.to(
      [
        expandedNumber,
        expandedTitle,
        expandedDescription,
        expandedFeatures,
        expandedLinks,
        expandedCloseHint,
      ],
      {
        y: -30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        stagger: 0.05,
      }
    );

    // Animate expanded content box out
    const expandedContentBox = expandedContent.querySelector(".expanded-content");
    if (expandedContentBox) {
      gsap.to(expandedContentBox, {
        opacity: 0,
        scale: 0.3,
        rotation: 5,
        y: -50,
        duration: 0.8,
        ease: "power3.in",
      });
    }

    // Animate overlay out
    gsap.to(expandedContent, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
      delay: 0.3,
      onComplete: () => {
        expandedContent.classList.remove("active");
        card.classList.remove("active");
        body.classList.remove("card-open");
        lenis.start();

        // Reset transforms
        const expandedCloseHint = expandedContent.querySelector(".expanded-close-hint");
        gsap.set(
          [
            expandedNumber,
            expandedTitle,
            expandedDescription,
            expandedFeatures,
            expandedLinks,
            expandedCloseHint,
            closeBtn,
            expandedContentBox,
          ],
          {
            clearProps: "all",
          }
        );
      },
    });
  }

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeCard();
  });

  // Close on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && expandedContent.classList.contains("active")) {
      closeCard();
    }
  });

  // Close on background click (only if clicking the overlay itself, not the content)
  expandedContent.addEventListener("click", (e) => {
    if (e.target === expandedContent || e.target.classList.contains("card-expanded")) {
      closeCard();
    }
  });
}

// Smooth scroll on page load
window.addEventListener("load", () => {
  gsap.to(window, { duration: 0, scrollTo: 0 });
});

// Navbar functionality
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav-link");

let lastScrollY = 0;
let scrollTimeout;

// Animate navbar on page load
window.addEventListener("load", () => {
  setTimeout(() => {
    navbar.classList.add("visible");
  }, 300);
});

// Mobile menu toggle
navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  navToggle.classList.toggle("active");
});

// Close mobile menu when clicking on a link
for (const link of navLinks) {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
  });
}

// Smooth scroll for nav links
for (const link of navLinks) {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href");
    if (targetId.startsWith("#")) {
      lenis.scrollTo(targetId, { duration: 1.5, offset: -80 });
    }
  });
}

// Update active nav link on scroll
function updateActiveNavLink() {
  const sections = document.querySelectorAll(".section, .hero");
  const scrollPos = window.scrollY + 150;

  for (const section of sections) {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      for (const link of navLinks) {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      }
    }
  }
}

// Navbar scroll effect with hide/show on scroll direction
function handleNavbarScroll() {
  const currentScrollY = window.scrollY;

  // Add scrolled class for styling
  if (currentScrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  // Hide/show navbar based on scroll direction
  if (currentScrollY > 100) {
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      // Scrolling down - hide navbar
      navbar.classList.remove("visible");
      navbar.classList.add("hidden");
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up - show navbar
      navbar.classList.remove("hidden");
      navbar.classList.add("visible");
    }
  } else {
    // Always show at top
    navbar.classList.remove("hidden");
    navbar.classList.add("visible");
  }

  lastScrollY = currentScrollY;
  updateActiveNavLink();

  // Clear timeout and set new one
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    // Show navbar after scrolling stops
    if (currentScrollY > 100) {
      navbar.classList.remove("hidden");
      navbar.classList.add("visible");
    }
  }, 150);
}

// Listen to scroll events
lenis.on("scroll", () => {
  handleNavbarScroll();
});

// Initial check
handleNavbarScroll();
