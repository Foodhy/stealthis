import { useRef } from "react";

interface GlassCardProps {
  icon?: string;
  title: string;
  body: string;
  tags?: string[];
  cta?: string;
  onCtaClick?: () => void;
}

export function GlassCard({
  icon = "✦",
  title,
  body,
  tags = [],
  cta = "Steal This →",
  onCtaClick,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const rotateX = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (card) card.style.transform = "";
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="
        w-full max-w-sm p-10 rounded-3xl flex flex-col gap-4
        text-slate-100
        border border-white/10
        shadow-[0_4px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]
      "
      // Tailwind doesn't support backdrop-filter class by default in all setups,
      // so we use inline style for the glass effect
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px) saturate(1.6)",
        WebkitBackdropFilter: "blur(16px) saturate(1.6)",
        transition: "transform 0.1s ease",
      }}
    >
      <span className="text-3xl text-sky-400">{icon}</span>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="text-slate-400 text-sm leading-relaxed">{body}</p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-3 py-1 rounded-full bg-white/8 border border-white/10 text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {cta && (
        <button
          type="button"
          onClick={onCtaClick}
          className="mt-2 self-start text-sm font-semibold px-5 py-2.5 rounded-xl
            bg-sky-400/10 border border-sky-400/40 text-sky-400
            hover:bg-sky-400/20 hover:border-sky-400/60
            transition-colors duration-200 active:scale-95"
        >
          {cta}
        </button>
      )}
    </div>
  );
}

// Demo usage
export default function GlassCardDemo() {
  return (
    <div
      className="min-h-screen grid place-items-center"
      style={{
        background:
          "radial-gradient(ellipse 600px 400px at 20% 30%, rgba(56,189,248,0.25) 0%, transparent 70%), radial-gradient(ellipse 500px 350px at 80% 70%, rgba(168,85,247,0.25) 0%, transparent 70%), #0f172a",
      }}
    >
      <GlassCard
        title="Glassmorphism"
        body="A frosted-glass card effect using CSS backdrop-filter, subtle borders, and layered transparency."
        tags={["CSS", "backdrop-filter", "UI"]}
        onCtaClick={() => navigator.clipboard.writeText("GlassCard snippet copied!")}
      />
    </div>
  );
}
