const cards = Array.from(document.querySelectorAll(".card"));
const fill = document.querySelector(".meter .fill");
const intervalMs = 3800;
let active = 0;

function setupHalves() {
  cards.forEach((card) => {
    const halves = card.querySelectorAll(".half");
    halves.forEach((half) => {
      half.style.backgroundImage = `url('${half.dataset.image}')`;
    });
  });
}

function setActive(index) {
  cards.forEach((card, i) => {
    card.classList.toggle("is-active", i === index);
    card.style.zIndex = `${cards.length - i}`;
  });
}

function transition() {
  const current = cards[active];
  active = (active + 1) % cards.length;
  const next = cards[active];

  setActive(active);

  const currentLeft = current.querySelector(".half.left");
  const currentRight = current.querySelector(".half.right");
  const nextLeft = next.querySelector(".half.left");
  const nextRight = next.querySelector(".half.right");

  const tl = gsap.timeline({ defaults: { duration: 0.7, ease: "power2.inOut" } });

  tl.set(nextLeft, { xPercent: -100 })
    .set(nextRight, { xPercent: 100 })
    .to(currentLeft, { xPercent: -120 })
    .to(currentRight, { xPercent: 120 }, "<")
    .to(nextLeft, { xPercent: 0 }, "<")
    .to(nextRight, { xPercent: 0 }, "<");
}

function animateMeter() {
  gsap.fromTo(
    fill,
    { width: "0%" },
    { width: "100%", duration: intervalMs / 1000, ease: "none" }
  );
}

setupHalves();
setActive(active);
animateMeter();
setInterval(() => {
  transition();
  animateMeter();
}, intervalMs);
