import { useState, useRef, useEffect } from "react";

const OPTIONS = [
  { label: "Copy link", icon: "🔗", action: "copy" },
  { label: "Twitter / X", icon: "✦", action: "twitter" },
  { label: "LinkedIn", icon: "in", action: "linkedin" },
  { label: "Facebook", icon: "f", action: "facebook" },
  { label: "WhatsApp", icon: "✉", action: "whatsapp" },
];

export default function ShareButtonRC() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOption(action: string) {
    if (action === "copy") {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center gap-8 p-6">
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            open
              ? "bg-[#58a6ff] text-[#0d1117]"
              : "bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:border-[#8b949e]/40"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>

        {open && (
          <div className="absolute top-full mt-2 right-0 w-44 bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-xl z-10">
            {OPTIONS.map(({ label, icon, action }) => (
              <button
                key={action}
                onClick={() => handleOption(action)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#e6edf3] hover:bg-[#21262d] transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-[#30363d] rounded text-[#8b949e]">
                  {icon}
                </span>
                {action === "copy" && copied ? "Copied!" : label}
              </button>
            ))}
          </div>
        )}
      </div>

      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#238636] text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
