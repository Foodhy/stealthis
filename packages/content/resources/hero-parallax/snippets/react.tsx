import { useEffect, useRef } from "react";

interface ParallaxLayerProps {
  speed: number;
  children: React.ReactNode;
  className?: string;
}

function ParallaxLayer({ speed, children, className = "" }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (speed === 0) return;

    let ticking = false;

    const update = () => {
      if (ref.current) {
        ref.current.style.transform = `translateY(${window.scrollY * speed}px)`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`absolute inset-[-20%] will-change-transform ${className}`}>
      {children}
    </div>
  );
}

export default function HeroParallax() {
  return (
    <div className="bg-gray-950 text-slate-100 font-sans">
      {/* Hero */}
      <section className="relative h-screen overflow-hidden grid place-items-center">
        {/* Stars layer */}
        <ParallaxLayer speed={0.2}>
          <div
            className="w-full h-full opacity-60"
            style={{
              backgroundImage: `
                radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 100%),
                radial-gradient(1px 1px at 60% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
                radial-gradient(2px 2px at 40% 75%, rgba(255,255,255,0.5) 0%, transparent 100%),
                radial-gradient(1px 1px at 90% 25%, rgba(255,255,255,0.7) 0%, transparent 100%)
              `,
              backgroundSize: "500px 400px",
            }}
          />
        </ParallaxLayer>

        {/* Orbs layer */}
        <ParallaxLayer speed={0.5}>
          <div
            className="absolute w-[500px] h-[400px] top-[10%] left-[5%] rounded-full"
            style={{ background: "rgba(56,189,248,0.2)", filter: "blur(80px)" }}
          />
          <div
            className="absolute w-[450px] h-[380px] bottom-[15%] right-[5%] rounded-full"
            style={{ background: "rgba(168,85,247,0.2)", filter: "blur(80px)" }}
          />
        </ParallaxLayer>

        {/* Content */}
        <div className="relative z-10 text-center px-8 flex flex-col items-center gap-5 max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.12em] uppercase text-sky-400">
            Open Source
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Build beautiful
            <br />
            web experiences
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-md">
            Reusable web resources — animations, pages, components, and patterns. All open source.
          </p>
          <div className="flex gap-4 flex-wrap justify-center mt-2">
            <a
              href="#"
              className="px-7 py-3 rounded-2xl bg-sky-500 text-white font-semibold text-base hover:bg-sky-400 transition-colors shadow-[0_0_24px_rgba(14,165,233,0.4)]"
            >
              Browse Library
            </a>
            <a
              href="#"
              className="px-7 py-3 rounded-2xl bg-white/6 border border-white/10 text-slate-300 font-semibold text-base hover:bg-white/10 transition-colors"
            >
              View Docs
            </a>
          </div>
        </div>
      </section>

      <div className="min-h-[60vh] grid place-items-center text-slate-600 text-lg">
        Scroll up to see the parallax effect ↑
      </div>
    </div>
  );
}
