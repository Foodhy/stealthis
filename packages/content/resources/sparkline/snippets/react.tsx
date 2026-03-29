const W = 120,
  H = 36;

const ROWS = [
  {
    label: "Revenue",
    values: [3200, 2900, 3800, 4100, 3700, 4500, 4900, 4200, 5100, 4700, 5300, 5800],
    color: "#818cf8",
    suffix: "k",
  },
  {
    label: "Active Users",
    values: [810, 770, 840, 920, 880, 960, 1010, 980, 1050, 990, 1080, 1120],
    color: "#34d399",
    suffix: "",
  },
  {
    label: "Conversion",
    values: [2.1, 2.4, 2.2, 2.8, 2.6, 3.1, 2.9, 3.3, 3.0, 3.5, 3.2, 3.8],
    color: "#f59e0b",
    suffix: "%",
  },
  {
    label: "Bounce Rate",
    values: [54, 58, 52, 49, 55, 47, 50, 46, 48, 45, 43, 41],
    color: "#f87171",
    suffix: "%",
  },
  {
    label: "Avg. Session",
    values: [2.1, 2.3, 2.0, 2.4, 2.2, 2.6, 2.5, 2.8, 2.7, 3.0, 2.9, 3.2],
    color: "#a78bfa",
    suffix: "m",
  },
];

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values),
    max = Math.max(...values);
  const xOf = (i: number) => (i / (values.length - 1)) * W;
  const yOf = (v: number) => H - 2 - ((v - min) / (max - min || 1)) * (H - 6);
  const pts = values.map((v, i): [number, number] => [xOf(i), yOf(v)]);
  const ptsStr = pts.map((p) => p.join(",")).join(" ");
  const areaD = `M${pts[0][0]},${H} ${ptsStr} L${pts[pts.length - 1][0]},${H} Z`;
  const id = `sg${color.replace("#", "")}`;
  const last = pts[pts.length - 1];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${id})`} />
      <polyline
        points={ptsStr}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={3} fill={color} stroke="#0f1117" strokeWidth={1.5} />
    </svg>
  );
}

export default function SparklineRC() {
  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[600px] bg-[#0d1117] rounded-xl border border-[#21262d] overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] px-4 py-2 border-b border-[#21262d] text-[11px] text-[#484f58] font-semibold uppercase tracking-wider">
          <span>Metric</span>
          <span className="text-right pr-6">Trend</span>
          <span className="text-right pr-4">Current</span>
          <span className="text-right">Change</span>
        </div>
        {ROWS.map((row) => {
          const cur = row.values[row.values.length - 1];
          const prev = row.values[row.values.length - 2];
          const delta = (((cur - prev) / prev) * 100).toFixed(1);
          const isUp = +delta > 0;
          const fmt = (v: number) => (v % 1 === 0 ? v : v.toFixed(1)) + row.suffix;
          return (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 border-b border-[#21262d] last:border-0 hover:bg-[#161b22] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: row.color }}
                />
                <span className="text-[#8b949e] text-[13px]">{row.label}</span>
              </div>
              <div className="pr-6">
                <Sparkline values={row.values} color={row.color} />
              </div>
              <div className="text-[#e6edf3] font-semibold text-[14px] pr-4">{fmt(cur)}</div>
              <div
                className={`text-[12px] font-semibold text-right ${isUp ? "text-[#34d399]" : "text-[#f87171]"}`}
              >
                {isUp ? "▲" : "▼"}
                {Math.abs(+delta)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
