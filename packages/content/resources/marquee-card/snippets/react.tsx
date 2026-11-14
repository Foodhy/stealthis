const TICKER = "Live drop · Limited foil · Ships Friday · ";

export function MarqueeCard() {
  return (
    <article className="marquee-card">
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          <p className="marquee__group">{TICKER}</p>
          <p className="marquee__group">{TICKER}</p>
        </div>
      </div>
      <div className="marquee-card__body">
        <h2>Night Market</h2>
        <p>Hover the card to pause the ticker.</p>
      </div>
    </article>
  );
}
