import { useState, useMemo } from "react";

const COLORS = ["#1e2130", "#2a3a5c", "#3b5998", "#6366f1", "#a5b4fc"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function level(v: number) {
  if (v === 0) return 0;
  if (v < 2) return 1;
  if (v < 5) return 2;
  if (v < 9) return 3;
  return 4;
}

type Tooltip = { text: string; x: number; y: number } | null;

export default function ChartHeatmapRC() {
  const [tooltip, setTooltip] = useState<Tooltip>(null);

  const { weeks } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setFullYear(start.getFullYear() - 1);
    start.setDate(start.getDate() - start.getDay());
    const weeks: { date: Date; val: number }[][] = [];
    const d = new Date(start);
    while (d <= today) {
      const week: { date: Date; val: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const val = d <= today ? Math.floor(Math.pow(Math.random(), 1.5) * 15) : -1;
        week.push({ date: new Date(d), val });
        d.setDate(d.getDate() + 1);
      }
      weeks.push(week);
    }
    return { weeks };
  }, []);

  const CELL = 12,
    GAP = 2,
    STEP = CELL + GAP;
  const LEFT_PAD = 28,
    TOP_PAD = 18;

  const W = weeks.length * STEP + LEFT_PAD;
  const H = 7 * STEP + TOP_PAD + 8;

  // Month label positions
  const monthLabels: { month: number; wi: number }[] = [];
  let prevMonth = -1;
  weeks.forEach((week, wi) => {
    const m = week[0].date.getMonth();
    if (m !== prevMonth) {
      prevMonth = m;
      monthLabels.push({ month: m, wi });
    }
  });

  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div className="w-full max-w-[900px] mx-auto overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W }}>
          {/* Day labels */}
          {DAY_LABELS.map(
            (lbl, i) =>
              lbl && (
                <text
                  key={i}
                  x={LEFT_PAD - 4}
                  y={TOP_PAD + i * STEP + CELL - 1}
                  textAnchor="end"
                  fill="#484f58"
                  fontSize={9}
                >
                  {lbl}
                </text>
              )
          )}
          {/* Month labels */}
          {monthLabels.map(({ month, wi }) => (
            <text key={month} x={LEFT_PAD + wi * STEP} y={TOP_PAD - 5} fill="#484f58" fontSize={9}>
              {MONTHS[month]}
            </text>
          ))}
          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (day.val < 0) return null;
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={LEFT_PAD + wi * STEP}
                  y={TOP_PAD + di * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={COLORS[level(day.val)]}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    const fmt = day.date.toLocaleDateString("en", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    setTooltip({
                      text: `${fmt} — ${day.val} contribution${day.val !== 1 ? "s" : ""}`,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseMove={(e) =>
                    setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          )}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px] text-[#484f58]">Less</span>
          {COLORS.map((c, i) => (
            <span key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-[10px] text-[#484f58]">More</span>
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed pointer-events-none bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] shadow-lg z-50"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <span className="text-[#e6edf3]">{tooltip.text}</span>
        </div>
      )}
    </div>
  );
}
