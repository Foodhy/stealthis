import { useState } from "react";

type TurnType =
  | "straight"
  | "left"
  | "right"
  | "slight-left"
  | "slight-right"
  | "arrive"
  | "depart";

interface Step {
  id: number;
  turn: TurnType;
  instruction: string;
  street: string;
  distance: string;
  duration: string;
}

interface Route {
  origin: string;
  destination: string;
  totalDistance: string;
  totalDuration: string;
  steps: Step[];
}

const ROUTE: Route = {
  origin: "1 Hacker Way, Menlo Park",
  destination: "Ferry Building, San Francisco",
  totalDistance: "28.4 mi",
  totalDuration: "38 min",
  steps: [
    {
      id: 1,
      turn: "depart",
      instruction: "Head north",
      street: "Hacker Way",
      distance: "0.2 mi",
      duration: "1 min",
    },
    {
      id: 2,
      turn: "right",
      instruction: "Turn right",
      street: "Willow Rd",
      distance: "0.8 mi",
      duration: "2 min",
    },
    {
      id: 3,
      turn: "slight-left",
      instruction: "Slight left",
      street: "US-101 N",
      distance: "14.2 mi",
      duration: "16 min",
    },
    {
      id: 4,
      turn: "left",
      instruction: "Take exit 430B",
      street: "I-80 E",
      distance: "5.4 mi",
      duration: "8 min",
    },
    {
      id: 5,
      turn: "straight",
      instruction: "Continue on",
      street: "Bay Bridge",
      distance: "4.5 mi",
      duration: "6 min",
    },
    {
      id: 6,
      turn: "right",
      instruction: "Turn right",
      street: "Fremont St",
      distance: "0.9 mi",
      duration: "3 min",
    },
    {
      id: 7,
      turn: "slight-right",
      instruction: "Slight right",
      street: "The Embarcadero",
      distance: "2.1 mi",
      duration: "4 min",
    },
    {
      id: 8,
      turn: "arrive",
      instruction: "Arrive at",
      street: "Ferry Building",
      distance: "",
      duration: "",
    },
  ],
};

function TurnIcon({ type, active }: { type: TurnType; active: boolean }) {
  const color = active ? "white" : "#8b949e";
  const icons: Record<TurnType, JSX.Element> = {
    straight: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="6 11 12 5 18 11" />
      </svg>
    ),
    left: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <polyline points="15 18 9 12 15 6" />
        <line x1="9" y1="12" x2="9" y2="20" />
        <line x1="9" y1="20" x2="16" y2="20" />
      </svg>
    ),
    right: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <polyline points="9 18 15 12 9 6" />
        <line x1="15" y1="12" x2="15" y2="20" />
        <line x1="15" y1="20" x2="8" y2="20" />
      </svg>
    ),
    "slight-left": (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M12 19V5M12 5L7 10" />
      </svg>
    ),
    "slight-right": (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M12 19V5M12 5L17 10" />
      </svg>
    ),
    depart: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke="none">
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
      </svg>
    ),
    arrive: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" fill={color} stroke="none" />
      </svg>
    ),
  };
  return icons[type];
}

export default function DirectionsCardRC() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [mode, setMode] = useState<"driving" | "walking" | "cycling">("driving");

  const modes = [
    {
      id: "driving" as const,
      label: "Drive",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" />
          <circle cx="7.5" cy="17.5" r="2.5" />
          <circle cx="16.5" cy="17.5" r="2.5" />
        </svg>
      ),
    },
    {
      id: "walking" as const,
      label: "Walk",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="5" r="2" />
          <path d="M5 22l2-8 4 2 4-2 2 8" />
          <path d="M8 14l-2 8M16 14l2 8" />
        </svg>
      ),
    },
    {
      id: "cycling" as const,
      label: "Bike",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h3" />
        </svg>
      ),
    },
  ];

  const durations = { driving: "38 min", walking: "6 h 20 min", cycling: "2 h 10 min" };

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[440px] space-y-3">
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-[#21262d] border-b border-[#30363d] space-y-3">
            {/* Mode tabs */}
            <div className="flex gap-1 bg-[#161b22] rounded-xl p-1">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                    mode === m.id
                      ? "bg-[#58a6ff] text-white"
                      : "text-[#8b949e] hover:text-[#e6edf3]"
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            {/* Route info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400 border-2 border-green-400" />
                  <div className="w-px h-4 bg-[#30363d]" />
                  <div className="w-2 h-2 rounded-full bg-[#58a6ff]" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[11px] text-[#8b949e] truncate">{ROUTE.origin}</p>
                  <p className="text-[11px] text-[#e6edf3] font-semibold truncate">
                    {ROUTE.destination}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-4">
                <span className="text-[13px] font-bold text-[#e6edf3]">{durations[mode]}</span>
                <span className="text-[12px] text-[#8b949e]">({ROUTE.totalDistance})</span>
                <span className="ml-auto text-[10px] text-green-400 font-semibold">
                  Fastest route
                </span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="max-h-[360px] overflow-y-auto">
            {ROUTE.steps.map((step, i) => {
              const isActive = activeStep === step.id;
              const isLast = i === ROUTE.steps.length - 1;
              return (
                <div
                  key={step.id}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[#21262d] last:border-0 ${
                    isActive ? "bg-[#58a6ff]/[0.08]" : "hover:bg-white/[0.02]"
                  }`}
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                >
                  {/* Icon + line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        step.turn === "arrive"
                          ? "bg-[#58a6ff]/20 border border-[#58a6ff]/40"
                          : step.turn === "depart"
                            ? "bg-green-500/20 border border-green-500/30"
                            : isActive
                              ? "bg-[#58a6ff]/20 border border-[#58a6ff]/40"
                              : "bg-[#21262d] border border-[#30363d]"
                      }`}
                    >
                      <TurnIcon
                        type={step.turn}
                        active={isActive || step.turn === "arrive" || step.turn === "depart"}
                      />
                    </div>
                    {!isLast && (
                      <div
                        className="w-px mt-1 flex-1 min-h-[8px]"
                        style={{
                          background: isActive ? "#58a6ff44" : "#21262d",
                          animation: isActive ? "flow 1s linear infinite" : undefined,
                        }}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p
                      className={`text-[12px] font-semibold ${isActive ? "text-[#e6edf3]" : "text-[#8b949e]"}`}
                    >
                      {step.instruction}{" "}
                      <span
                        className={`font-bold ${isActive ? "text-[#58a6ff]" : "text-[#e6edf3]"}`}
                      >
                        {step.street}
                      </span>
                    </p>
                    {(step.distance || step.duration) && (
                      <p className="text-[10px] text-[#484f58] mt-0.5">
                        {step.distance}
                        {step.distance && step.duration && " · "}
                        {step.duration}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#21262d] border-t border-[#30363d]">
            <div className="text-[12px]">
              <span className="font-bold text-[#e6edf3]">{ROUTE.totalDistance}</span>
              <span className="text-[#8b949e] ml-2">{durations[mode]}</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#58a6ff] rounded-lg text-[12px] font-bold text-white hover:bg-[#79b8ff] transition-colors">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              Start
            </button>
          </div>
        </div>

        <style>{`
          @keyframes flow {
            0% { background: #21262d }
            50% { background: #58a6ff44 }
            100% { background: #21262d }
          }
        `}</style>
      </div>
    </div>
  );
}
