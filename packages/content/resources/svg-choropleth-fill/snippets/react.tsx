import { useState } from "react";

export function SvgChoroplethFill() {
  const [items, setItems] = useState(["Alpha", "Beta", "Gamma"]);
  return (
    <section className="demo">
      <h2>SVG Choropleth Fill</h2>
      <p>Vanilla behavior maps cleanly to Pointer Events and DOM state.</p>
      <div className="stack">
        {items.map((item, index) => (
          <button
            className="item"
            key={item}
            onClick={() => setItems([...items.slice(0, index), ...items.slice(index + 1), item])}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
