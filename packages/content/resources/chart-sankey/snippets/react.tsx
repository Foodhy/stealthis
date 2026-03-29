import { useState } from "react";

/* Simplified Sankey — Google revenue flow (no D3, pure SVG) */
type SNode = {
  id: number;
  name: string;
  color: string;
  val: string;
  change?: string;
  logo?: string;
  x: number;
  y: number;
  h: number;
};
type SLink = { source: number; target: number; value: number; color: string };

const RAW_NODES = [
  { name: "Search ads", color: "#4285F4", val: "$48.5B", change: "+14%", logo: "🔍" },
  { name: "YouTube", color: "#FF0000", val: "$8.7B", change: "+13%", logo: "📺" },
  { name: "AdMob", color: "#FBBC05", val: "$7.4B", change: "-5%", logo: "📱" },
  { name: "Google Play", color: "#34A853", val: "$9.3B", change: "+14%", logo: "▶️" },
  { name: "Google Cloud", color: "#4285F4", val: "$10.3B", change: "+29%", logo: "☁️" },
  { name: "Other", color: "#64748b", val: "$0.5B", logo: "+" },
  { name: "Ad Revenue", color: "#4285F4", val: "$64.6B", change: "+11%" },
  { name: "Revenue", color: "#4285F4", val: "$84.7B", change: "+14%" },
  { name: "Gross Profit", color: "#34A853", val: "$49.2B", change: "58% margin" },
  { name: "Cost of Rev", color: "#EA4335", val: "$35.5B" },
  { name: "Op. Profit", color: "#34A853", val: "$27.4B", change: "32% margin" },
  { name: "Op. Expenses", color: "#EA4335", val: "$21.8B" },
  { name: "Net Profit", color: "#34A853", val: "$23.6B", change: "28% margin" },
  { name: "Tax", color: "#EA4335", val: "$3.9B" },
  { name: "Other P/L", color: "#64748b", val: "$0.1B" },
  { name: "R&D", color: "#EA4335", val: "$11.9B" },
  { name: "S&M", color: "#EA4335", val: "$6.8B" },
  { name: "G&A", color: "#EA4335", val: "$3.1B" },
];
const RAW_LINKS = [
  { s: 0, t: 6, v: 48.5 },
  { s: 1, t: 6, v: 8.7 },
  { s: 2, t: 6, v: 7.4 },
  { s: 6, t: 7, v: 64.6 },
  { s: 3, t: 7, v: 9.3 },
  { s: 4, t: 7, v: 10.3 },
  { s: 5, t: 7, v: 0.5 },
  { s: 7, t: 8, v: 49.2 },
  { s: 7, t: 9, v: 35.5 },
  { s: 8, t: 10, v: 27.4 },
  { s: 8, t: 11, v: 21.8 },
  { s: 10, t: 12, v: 23.6 },
  { s: 10, t: 13, v: 3.7 },
  { s: 10, t: 14, v: 0.1 },
  { s: 11, t: 15, v: 11.9 },
  { s: 11, t: 16, v: 6.8 },
  { s: 11, t: 17, v: 3.1 },
];

// Manual column layout
const COLS = [
  [0, 1, 2, 3, 4, 5], // col 0: sources
  [6], // col 1: ad revenue
  [7], // col 2: total revenue
  [8, 9], // col 3: gross profit / cost
  [10, 11], // col 4: op profit / op expenses
  [12, 13, 14, 15, 16, 17], // col 5: net profit + breakdowns
];

function buildLayout(W: number, H: number) {
  const NW = 14;
  const colX = COLS.map((_, ci) => 60 + (ci / (COLS.length - 1)) * (W - 120));
  const nodes: SNode[] = [];
  const PAD = 10;

  COLS.forEach((col, ci) => {
    const totalVal = col.reduce((sum, ni) => {
      const incoming = RAW_LINKS.filter((l) => l.t === ni).reduce((a, l) => a + l.v, 0);
      const outgoing = RAW_LINKS.filter((l) => l.s === ni).reduce((a, l) => a + l.v, 0);
      return sum + (incoming || outgoing || 1);
    }, 0);
    const availH = H - PAD * (col.length - 1);
    let cy = 0;
    col.forEach((ni) => {
      const incoming = RAW_LINKS.filter((l) => l.t === ni).reduce((a, l) => a + l.v, 0);
      const outgoing = RAW_LINKS.filter((l) => l.s === ni).reduce((a, l) => a + l.v, 0);
      const val = incoming || outgoing || 1;
      const nh = Math.max(20, (val / totalVal) * availH);
      nodes[ni] = { ...RAW_NODES[ni], id: ni, x: colX[ci], y: cy, h: nh };
      cy += nh + PAD;
    });
  });

  const links: SLink[] = RAW_LINKS.map((l) => ({
    source: l.s,
    target: l.t,
    value: l.v,
    color: nodes[l.s]?.color || "#818cf8",
  }));
  return { nodes, links, NW };
}

export default function ChartSankeyRC() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 700,
    H = 500;
  const { nodes, links, NW } = buildLayout(W, H);

  // Source/target offsets for links
  const srcOffset: Record<number, number> = {};
  const tgtOffset: Record<number, number> = {};
  nodes.forEach((n) => {
    srcOffset[n.id] = 0;
    tgtOffset[n.id] = 0;
  });

  const renderedLinks = links
    .map((l) => {
      const src = nodes[l.source],
        tgt = nodes[l.target];
      if (!src || !tgt) return null;
      const totalOut = links
        .filter((ll) => ll.source === l.source)
        .reduce((a, ll) => a + ll.value, 0);
      const totalIn = links
        .filter((ll) => ll.target === l.target)
        .reduce((a, ll) => a + ll.value, 0);
      const lh = Math.max(2, (l.value / (totalOut || 1)) * src.h);
      const lh2 = Math.max(2, (l.value / (totalIn || 1)) * tgt.h);
      const sy = src.y + srcOffset[l.source] + lh / 2;
      const ty = tgt.y + tgtOffset[l.target] + lh2 / 2;
      srcOffset[l.source] = (srcOffset[l.source] || 0) + lh;
      tgtOffset[l.target] = (tgtOffset[l.target] || 0) + lh2;
      const sx = src.x + NW,
        tx = tgt.x;
      const cx = (sx + tx) / 2;
      return {
        path: `M${sx},${sy - lh / 2} C${cx},${sy - lh / 2} ${cx},${ty - lh2 / 2} ${tx},${ty - lh2 / 2} L${tx},${ty + lh2 / 2} C${cx},${ty + lh2 / 2} ${cx},${sy + lh / 2} ${sx},${sy + lh / 2} Z`,
        color: l.color,
        key: `${l.source}-${l.target}`,
        label: `${nodes[l.source].name} → ${nodes[l.target].name}: $${l.value}B`,
      };
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0d1117] p-4 overflow-x-auto">
      <div style={{ minWidth: W }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* Links */}
          {renderedLinks.map(
            (l) =>
              l && (
                <path
                  key={l.key}
                  d={l.path}
                  fill={l.color}
                  fillOpacity={hovered === null ? 0.18 : 0.08}
                  style={{ cursor: "pointer", transition: "fill-opacity 0.15s" }}
                  onMouseEnter={(e) => {
                    setTooltip({ text: l.label, x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) =>
                    setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              )
          )}
          {/* Nodes */}
          {nodes.map(
            (n, i) =>
              n && (
                <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                  <rect
                    x={n.x}
                    y={n.y}
                    width={NW}
                    height={n.h}
                    rx={3}
                    fill={n.color}
                    opacity={hovered === null || hovered === i ? 1 : 0.5}
                    style={{ transition: "opacity 0.15s" }}
                  />
                  <text
                    x={n.x > W / 2 ? n.x - 6 : n.x + NW + 6}
                    y={n.y + n.h / 2 - 4}
                    textAnchor={n.x > W / 2 ? "end" : "start"}
                    fill="#e6edf3"
                    fontSize={9}
                    fontWeight={600}
                  >
                    {n.name}
                  </text>
                  <text
                    x={n.x > W / 2 ? n.x - 6 : n.x + NW + 6}
                    y={n.y + n.h / 2 + 7}
                    textAnchor={n.x > W / 2 ? "end" : "start"}
                    fill={n.color}
                    fontSize={10}
                    fontWeight={700}
                  >
                    {n.val}
                  </text>
                  {n.change && (
                    <text
                      x={n.x > W / 2 ? n.x - 6 : n.x + NW + 6}
                      y={n.y + n.h / 2 + 19}
                      textAnchor={n.x > W / 2 ? "end" : "start"}
                      fill="#484f58"
                      fontSize={9}
                    >
                      {n.change}
                    </text>
                  )}
                </g>
              )
          )}
        </svg>
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
