// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Hero Entrance
const tl = gsap.timeline({ 
    defaults: { ease: "power4.out" },
    onComplete: () => {
        // Optional: Trigger something after entrance
    }
});

tl.to(".hero-title", {
  opacity: 1,
  scale: 1,
  filter: "blur(0px)",
  duration: 2.5,
  delay: 0.5
})
.to(".hero-subtitle", {
  opacity: 1,
  y: -20,
  duration: 1.5,
}, "-=2")
.to(".scroll-indicator", {
  opacity: 1,
  y: 0,
  duration: 1,
}, "-=1");

// Parallax for Background Blobs
gsap.to(".blob-1", {
  y: 200,
  x: 100,
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
  }
});

gsap.to(".blob-2", {
  y: -300,
  x: -150,
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
  }
});

// Generic Reveal Animation for elements with .reveal class
const revealElements = gsap.utils.toArray(".reveal");
revealElements.forEach((el) => {
  gsap.fromTo(el, 
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse",
      }
    }
  );
});

// Device Showcase Parallax / Tilt
const deviceCard = document.querySelector(".device-card");
if (deviceCard) {
  gsap.to(deviceCard, {
    y: -50,
    rotateX: 5,
    scrollTrigger: {
      trigger: ".intro-section",
      start: "top center",
      end: "bottom center",
      scrub: true,
    }
  });

  // Mouse tilt effect
  window.addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = deviceCard.getBoundingClientRect();
    
    const x = (clientX - (left + width / 2)) / (width / 2);
    const y = (clientY - (top + height / 2)) / (height / 2);
    
    gsap.to(deviceCard, {
      rotateY: x * 10,
      rotateX: -y * 10,
      duration: 0.8,
      ease: "power2.out"
    });
  });
}

// Staggered reveal for feature boxes
const featureGrid = document.querySelector(".feature-grid");
if (featureGrid) {
    gsap.from(".feature-box", {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
            trigger: featureGrid,
            start: "top 80%",
        }
    });
}

// Hero Title zoom on scroll
gsap.to(".hero-title", {
  scale: 1.5,
  opacity: 0,
  filter: "blur(20px)",
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "bottom top",
    scrub: true,
  }
});

