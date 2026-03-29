import { useState } from "react";

type DiffType = "ctx" | "add" | "del" | "hunk";
type DiffEntry = [DiffType, number | null, number | null, string];

const DIFF: DiffEntry[] = [
  ["hunk", null, null, "@@ -1,12 +1,16 @@"],
  ["ctx", 1, 1, 'import { SignJWT, jwtVerify } from "jose";'],
  ["ctx", 2, 2, 'import { cookies } from "next/headers";'],
  ["ctx", 3, 3, ""],
  ["del", 4, null, "const SECRET = process.env.SECRET;"],
  ["add", null, 4, "const SECRET = new TextEncoder().encode("],
  ["add", null, 5, '  process.env.SECRET ?? ""'],
  ["add", null, 6, ");"],
  ["ctx", 5, 7, ""],
  ["del", 6, null, "export async function createToken(payload) {"],
  ["add", null, 8, "export async function createToken("],
  ["add", null, 9, "  payload: Record<string, unknown>"],
  ["add", null, 10, ") {"],
  ["ctx", 7, 11, "  return new SignJWT(payload)"],
  ["ctx", 8, 12, '    .setProtectedHeader({ alg: "HS256" })'],
  ["ctx", 9, 13, '    .setExpirationTime("7d")'],
  ["del", 10, null, "    .sign(Buffer.from(SECRET));"],
  ["add", null, 14, "    .sign(SECRET);"],
  ["ctx", 11, 15, "}"],
  ["ctx", 12, 16, ""],
];

function esc(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function DiffLine({ type, num, text }: { type: DiffType; num: number | null; text: string }) {
  const sigMap: Record<DiffType, string> = { add: "+", del: "-", ctx: " ", hunk: "@@" };
  const bgCls =
    type === "add"
      ? "bg-green-400/10"
      : type === "del"
        ? "bg-red-400/10"
        : type === "hunk"
          ? "bg-blue-400/[0.06]"
          : "";
  const sigCls =
    type === "add"
      ? "text-green-400"
      : type === "del"
        ? "text-red-400"
        : type === "hunk"
          ? "text-blue-400 italic"
          : "text-transparent";

  return (
    <div className={`flex items-stretch min-h-[22px] hover:bg-white/[0.02] ${bgCls}`}>
      <span className="min-w-[44px] px-2 text-right text-[11px] text-[#4a555f] border-r border-[#21262d] flex items-center justify-end flex-shrink-0 select-none">
        {num ?? ""}
      </span>
      <span
        className={`w-5 text-center text-[12px] flex items-center justify-center flex-shrink-0 ${sigCls}`}
      >
        {sigMap[type]}
      </span>
      <span
        className={`flex-1 py-0.5 pr-3 pl-1 text-[12.5px] font-mono whitespace-pre text-[#e6edf3] ${type === "hunk" ? "text-blue-400 italic" : ""}`}
        dangerouslySetInnerHTML={{ __html: esc(text) }}
      />
    </div>
  );
}

function EmptyLine() {
  return (
    <div className="flex min-h-[22px] bg-[#0d1117]">
      <span className="min-w-[44px] border-r border-[#21262d]" />
      <span className="w-5" />
      <span className="flex-1 py-0.5 pr-3 pl-1 text-[12.5px] font-mono text-transparent">~</span>
    </div>
  );
}

export default function DiffViewerRC() {
  const [view, setView] = useState<"split" | "unified">("split");

  const leftLines: React.ReactNode[] = [];
  const rightLines: React.ReactNode[] = [];
  const unifiedLines: React.ReactNode[] = [];

  for (const [type, ln, rn, text] of DIFF) {
    if (type === "hunk") {
      leftLines.push(<DiffLine key={`l-h-${ln}`} type="hunk" num={null} text={text} />);
      rightLines.push(<DiffLine key={`r-h-${rn}`} type="hunk" num={null} text={text} />);
      unifiedLines.push(<DiffLine key={`u-h`} type="hunk" num={null} text={text} />);
    } else if (type === "del") {
      leftLines.push(<DiffLine key={`l-${ln}`} type="del" num={ln} text={text} />);
      rightLines.push(<EmptyLine key={`r-e-${ln}`} />);
      unifiedLines.push(<DiffLine key={`u-d-${ln}`} type="del" num={ln} text={text} />);
    } else if (type === "add") {
      leftLines.push(<EmptyLine key={`l-e-${rn}`} />);
      rightLines.push(<DiffLine key={`r-${rn}`} type="add" num={rn} text={text} />);
      unifiedLines.push(<DiffLine key={`u-a-${rn}`} type="add" num={rn} text={text} />);
    } else {
      leftLines.push(<DiffLine key={`l-c-${ln}`} type="ctx" num={ln} text={text} />);
      rightLines.push(<DiffLine key={`r-c-${rn}`} type="ctx" num={rn} text={text} />);
      unifiedLines.push(<DiffLine key={`u-c-${ln}`} type="ctx" num={ln} text={text} />);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[920px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#21262d] rounded-t-xl border border-[#30363d] border-b-0">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-[#e6edf3] font-mono">
              src/utils/auth.ts
            </span>
            <span className="text-[12px] font-bold text-green-400">+8</span>
            <span className="text-[12px] font-bold text-red-400">-4</span>
          </div>
          <div className="flex bg-[#30363d] rounded-lg p-0.5 gap-0.5">
            {(["split", "unified"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-[12px] font-semibold px-3 py-1 rounded-md transition-colors capitalize ${
                  view === v ? "bg-[#484f58] text-[#e6edf3]" : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Diff area */}
        <div className="border border-[#30363d] rounded-b-xl overflow-hidden bg-[#0d1117]">
          {view === "split" ? (
            <div className="flex">
              <div className="flex-1 min-w-0 overflow-x-auto border-r border-[#21262d]">
                <div className="px-0 py-1.5 text-[11px] font-bold text-[#8b949e] uppercase tracking-wide bg-[#161b22] border-b border-[#21262d] pl-4">
                  Before
                </div>
                <div className="font-mono text-[12.5px] leading-[1.6]">{leftLines}</div>
              </div>
              <div className="flex-1 min-w-0 overflow-x-auto">
                <div className="px-0 py-1.5 text-[11px] font-bold text-[#8b949e] uppercase tracking-wide bg-[#161b22] border-b border-[#21262d] pl-4">
                  After
                </div>
                <div className="font-mono text-[12.5px] leading-[1.6]">{rightLines}</div>
              </div>
            </div>
          ) : (
            <div className="font-mono text-[12.5px] leading-[1.6]">{unifiedLines}</div>
          )}
        </div>
      </div>
    </div>
  );
}
