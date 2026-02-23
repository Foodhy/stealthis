export default function HeroCTASection() {
  return (
    <section className="relative min-h-screen grid place-items-center overflow-hidden bg-[#030712] px-8">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[700px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,.18) 0%, rgba(56,189,248,.10) 40%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative text-center max-w-[700px]">
        <p className="inline-flex items-center text-[0.8125rem] font-semibold tracking-widest uppercase text-indigo-400 px-4 py-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/8 mb-6">
          Open Source
        </p>

        <h1
          className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-[1.05] tracking-tighter mb-6"
          style={{
            background: "linear-gradient(135deg,#f1f5f9 25%,#818cf8 60%,#38bdf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Build faster.
          <br />
          Ship better.
        </h1>

        <p className="text-lg text-slate-400 leading-relaxed mb-10">
          A collection of ready-to-use components, animations, and patterns. Free to copy, forever.
        </p>

        <div className="flex items-center justify-center gap-3.5 flex-wrap">
          <a
            href="https://stealthis.dev/library"
            className="inline-flex items-center px-7 py-3 rounded-xl text-[0.9375rem] font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg,#6366f1,#38bdf8)",
              boxShadow: "0 0 28px rgba(99,102,241,.45)",
            }}
          >
            Get Started →
          </a>
          <a
            href="https://github.com/Foodhy/stealthis"
            className="inline-flex items-center px-7 py-3 rounded-xl text-[0.9375rem] font-semibold text-slate-400 border border-white/12 bg-white/6 hover:bg-white/10 hover:text-slate-100 transition-all"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
