import { remotionCodeById } from "@lib/remotion-code";
import {
  COMPOSITION_FPS,
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
  remotionCompositions,
} from "@remotion-app/compositions";
import { Player } from "@remotion/player";
import type React from "react";
import { useMemo, useState } from "react";

const playerWrapper: React.CSSProperties = {
  position: "relative",
  width: "100%",
  paddingTop: "56.25%",
  borderRadius: 16,
  overflow: "hidden",
  background: "#0f172a",
};

const playerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

export default function RemotionPreview() {
  const [selectedId, setSelectedId] = useState(remotionCompositions[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

  const current = useMemo(
    () => remotionCompositions.find((composition) => composition.id === selectedId),
    [selectedId]
  );
  const codeEntry = remotionCodeById[selectedId as keyof typeof remotionCodeById];

  const copyCode = async () => {
    if (!codeEntry?.code) return;
    try {
      await navigator.clipboard.writeText(codeEntry.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!current) {
    return (
      <div style={{ color: "#94a3b8", fontSize: 14 }}>No Remotion compositions available.</div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label
        style={{ display: "flex", flexDirection: "column", gap: 8, color: "#94a3b8", fontSize: 12 }}
      >
        Composition
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          style={{
            background: "rgba(15,23,42,0.9)",
            color: "#e2e8f0",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 10,
            padding: "8px 10px",
            fontSize: 14,
          }}
        >
          {remotionCompositions.map((composition) => (
            <option key={composition.id} value={composition.id}>
              {composition.title}
            </option>
          ))}
        </select>
      </label>

      <div style={playerWrapper}>
        <Player
          component={current.component}
          durationInFrames={current.durationInFrames}
          fps={COMPOSITION_FPS}
          compositionWidth={COMPOSITION_WIDTH}
          compositionHeight={COMPOSITION_HEIGHT}
          controls
          style={playerStyle}
        />
      </div>

      <div className="rounded-xl border border-white/8 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
          <span className="font-mono">{codeEntry?.file ?? "Composition code"}</span>
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
        <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg bg-slate-900/70 p-4 text-xs text-slate-200">
          <code>{codeEntry?.code ?? "// Code not available"}</code>
        </pre>
      </div>
    </div>
  );
}
