function whenLibsReady(run) {
  const wait = () => {
    if (!window.gsap || !window.ScrollTrigger) {
      requestAnimationFrame(wait);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    run();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wait);
  } else {
    wait();
  }
}

function wireLenis(reduced) {
  if (reduced || typeof Lenis === "undefined") return;
  const lenis = new Lenis({ autoRaf: false, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
  });
}

whenLibsReady(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fill = document.querySelector("[data-fill]");
  const stepEls = document.querySelectorAll("[data-step]");
  const chapters = document.querySelectorAll("[data-chapter]");
  const chaptersWrap = document.querySelector(".chapters");

  function setActive(index) {
    stepEls.forEach((el, i) => el.classList.toggle("is-active", i === index));
    chapters.forEach((el, i) => el.classList.toggle("is-active", i === index));
  }

  wireLenis(reduced);

  if (reduced) {
    gsap.set(fill, { width: "100%" });
    chapters.forEach((c) => c.classList.add("is-active"));
    setActive(chapters.length - 1);
    return;
  }

  chapters.forEach((chapter, i) => {
    ScrollTrigger.create({
      trigger: chapter,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: () => setActive(i),
      onEnterBack: () => setActive(i),
    });
  });

  ScrollTrigger.create({
    trigger: chaptersWrap,
    start: "top 35%",
    end: "bottom 65%",
    scrub: 0.35,
    onUpdate: (self) => {
      gsap.set(fill, { width: `${self.progress * 100}%` });
    },
  });

  setActive(0);
  ScrollTrigger.refresh();
});
