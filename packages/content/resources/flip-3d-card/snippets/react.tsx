export function Flip3dCard() {
  return (
    <button className="flip" type="button" aria-label="Flip card">
      <span className="flip__inner">
        <span className="flip__face flip__face--front">
          <span className="flip__kicker">Hover or focus</span>
          <strong>Nova Deck</strong>
        </span>
        <span className="flip__face flip__face--back">
          <span className="flip__kicker">Back</span>
          <strong>12 prints · foil stock</strong>
        </span>
      </span>
    </button>
  );
}
