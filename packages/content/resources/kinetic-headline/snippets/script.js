const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const headline = document.querySelector("[data-split]");

function splitText(el) {
  const text = el.textContent.trim();
  el.textContent = "";
  text.split(/\s+/).forEach((word, wi) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";
    word.split("").forEach((ch) => {
      const charSpan = document.createElement("span");
      charSpan.className = "char";
      charSpan.textContent = ch;
      wordSpan.append(charSpan);
    });
    el.append(wordSpan);
    if (wi < text.split(/\s+/).length - 1) {
      el.append(document.createTextNode(" "));
    }
  });
}

splitText(headline);
const chars = headline.querySelectorAll(".char");

gsap.registerPlugin(ScrollTrigger);

if (reduced) {
  gsap.set(chars, { y: 0, opacity: 1 });
} else {
  gsap.to(chars, {
    y: 0,
    opacity: 1,
    duration: 0.65,
    stagger: 0.03,
    ease: "power3.out",
    scrollTrigger: {
      trigger: headline,
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
}
