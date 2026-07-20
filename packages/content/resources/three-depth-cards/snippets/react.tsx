import { useEffect, useRef, useState } from "react";

export function ThreeDepthCards() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl");
    if (gl) {
      gl.clearColor(0.06, 0.1, 0.22, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }, []);
  return (
    <section className="demo">
      <h2>Depth Cards</h2>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: 260, background: "#080d18" }}
        onPointerMove={() => setActive(true)}
      />
      <button onClick={() => setActive((v) => !v)}>{active ? "Active" : "Activate"}</button>
    </section>
  );
}
