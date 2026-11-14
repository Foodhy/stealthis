import { type PointerEvent, useRef } from "react";

export function HolographicTiltCard() {
  const ref = useRef<HTMLElement>(null);

  function onMove(event: PointerEvent<HTMLElement>) {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--px", `${px * 100}%`);
    card.style.setProperty("--py", `${py * 100}%`);
    card.style.setProperty("--ry", `${(px - 0.5) * 28}deg`);
    card.style.setProperty("--rx", `${(0.5 - py) * 28}deg`);
  }

  function reset() {
    const card = ref.current;
    if (!card) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--px", "50%");
    card.style.setProperty("--py", "40%");
  }

  return (
    <article ref={ref} onPointerMove={onMove} onPointerLeave={reset} className="holo-card">
      <div className="holo-card__foil" aria-hidden="true" />
      <div className="holo-card__body">
        <p className="holo-card__kicker">Rare · 001</p>
        <h2>Aurora Shard</h2>
        <p>Tilt the card. The foil tracks the pointer.</p>
      </div>
    </article>
  );
}
