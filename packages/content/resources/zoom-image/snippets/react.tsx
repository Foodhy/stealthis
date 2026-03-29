import { useState, useRef, useCallback } from "react";

const IMAGES = [
  { label: "Code snippet", colors: ["#0d1117", "#161b22", "#21262d"], accent: "#58a6ff" },
  { label: "UI design", colors: ["#1a0533", "#2d1b69", "#553c9a"], accent: "#bc8cff" },
  { label: "Data chart", colors: ["#021d1a", "#033028", "#065f46"], accent: "#7ee787" },
];

function MockImage({ img }: { img: (typeof IMAGES)[0] }) {
  return (
    <div className="w-full h-full flex flex-col gap-2 p-4" style={{ background: img.colors[0] }}>
      <div className="flex gap-1.5 mb-1">
        {["#f85149", "#f1e05a", "#7ee787"].map((c) => (
          <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
        ))}
      </div>
      {[90, 70, 80, 60, 85].map((w, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full"
          style={{
            width: `${w}%`,
            background: i % 2 === 0 ? img.accent : img.colors[2],
            opacity: 0.7,
          }}
        />
      ))}
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-6 rounded"
            style={{ background: img.colors[1], border: `1px solid ${img.accent}30` }}
          />
        ))}
      </div>
    </div>
  );
}

function ZoomCard({ img }: { img: (typeof IMAGES)[0] }) {
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const LENS = 80; // lens diameter px
  const ZOOM = 2.5;

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const lensX = mouse
    ? Math.min(Math.max(mouse.x - LENS / 2, 0), (containerRef.current?.offsetWidth ?? 300) - LENS)
    : 0;
  const lensY = mouse
    ? Math.min(Math.max(mouse.y - LENS / 2, 0), (containerRef.current?.offsetHeight ?? 200) - LENS)
    : 0;

  return (
    <div>
      <p className="text-[#8b949e] text-xs mb-1.5">{img.label}</p>
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden border border-[#30363d] cursor-crosshair"
        style={{ height: 140 }}
        onMouseMove={onMove}
        onMouseLeave={() => setMouse(null)}
      >
        <MockImage img={img} />

        {mouse && (
          <>
            {/* Lens highlight */}
            <div
              className="absolute rounded-full border-2 border-white/50 pointer-events-none z-10"
              style={{
                width: LENS,
                height: LENS,
                left: lensX,
                top: lensY,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
              }}
            />
            {/* Zoomed preview */}
            <div
              className="absolute bottom-2 right-2 rounded-lg border-2 border-white/20 overflow-hidden z-20 shadow-xl pointer-events-none"
              style={{ width: 100, height: 100 }}
            >
              <div
                style={{
                  width: `${(containerRef.current?.offsetWidth ?? 300) * ZOOM}px`,
                  height: `${(containerRef.current?.offsetHeight ?? 140) * ZOOM}px`,
                  transform: `translate(-${mouse.x * ZOOM - 50}px, -${mouse.y * ZOOM - 50}px)`,
                }}
              >
                <div
                  style={{
                    width: containerRef.current?.offsetWidth,
                    height: containerRef.current?.offsetHeight,
                    transform: `scale(${ZOOM})`,
                    transformOrigin: "top left",
                  }}
                >
                  <MockImage img={img} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ZoomImageRC() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h2 className="text-[#e6edf3] font-bold text-lg mb-4">Zoom / Magnifier</h2>
        {IMAGES.map((img) => (
          <ZoomCard key={img.label} img={img} />
        ))}
        <p className="text-[11px] text-center text-[#484f58]">Hover over an image to magnify</p>
      </div>
    </div>
  );
}
