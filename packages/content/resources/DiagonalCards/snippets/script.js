const cards = Array.from(document.querySelectorAll(".card"));
const fill = document.querySelector(".meter .fill");
const intervalMs = 4100;
let active = 0;

function setupWipes() {
  cards.forEach((card) => {
    const wipe = card.querySelector(".wipe");
    wipe.style.backgroundImage = `url('${wipe.dataset.image}')`;
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

  const currentWipe = current.querySelector(".wipe");
  const nextWipe = next.querySelector(".wipe");

  const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "power2.inOut" } });

  tl.set(nextWipe, {
    clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
  })
    .to(currentWipe, {
      clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
    })
    .to(
      nextWipe,
      {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      },
      "<"
    );
}

function animateMeter() {
  gsap.fromTo(
    fill,
    { width: "0%" },
    { width: "100%", duration: intervalMs / 1000, ease: "none" }
  );
}

setupWipes();
setActive(active);
animateMeter();
setInterval(() => {
  transition();
  animateMeter();
}, intervalMs);

