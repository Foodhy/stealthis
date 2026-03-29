import React, { useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { remotionCompositions } from "@remotion-app/compositions";
import { remotionCodeById } from "@lib/remotion-code";

interface Props {
  slug: string;
}

export default function RemotionPreview({ slug }: Props) {
  const compositions = useMemo(
    () => remotionCompositions.filter((c) => c.resourceSlug === slug),
    [slug]
  );

  const [selectedId, setSelectedId] = useState(compositions[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

  const current = useMemo(
    () => compositions.find((c) => c.id === selectedId) ?? compositions[0],
    [compositions, selectedId]
  );

  const codeEntry = current
    ? remotionCodeById[current.id as keyof typeof remotionCodeById]
    : undefined;

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
      <div style={{ color: "#94a3b8", fontSize: 14, padding: "12px 0" }}>
        No Remotion compositions available for this resource.
      </div>
    );
  }

  // Portrait compositions (9:16 etc) need a fixed height so the Player can resolve its size
  const isPortrait = current.height > current.width;

  // For portrait: fix height at 520px and compute width from aspect ratio
  // For landscape: fix width to 100% and use aspect-ratio CSS to set height
  const PORTRAIT_HEIGHT = 520;
  const portraitWidth = Math.round(PORTRAIT_HEIGHT * (current.width / current.height));

  const containerStyle: React.CSSProperties = isPortrait
    ? {
        width: portraitWidth,
        height: PORTRAIT_HEIGHT,
        margin: "0 auto",
        borderRadius: 12,
        overflow: "hidden",
        background: "#0f172a",
        flexShrink: 0,
      }
    : {
        width: "100%",
        // CSS aspect-ratio is more reliable than the padding-top trick for @remotion/player
        aspectRatio: `${current.width} / ${current.height}`,
        borderRadius: 12,
        overflow: "hidden",
        background: "#0f172a",
      };

  // Player fills the container via normal flow (no position:absolute needed)
  const playerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "block",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Composition selector — only shown when multiple exist for this slug */}
      {compositions.length > 1 && (
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            color: "#94a3b8",
            fontSize: 12,
          }}
        >
          Composition
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              background: "rgba(15,23,42,0.9)",
              color: "#e2e8f0",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 10,
              padding: "8px 10px",
              fontSize: 14,
            }}
          >
            {compositions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Player */}
      <div style={containerStyle}>
        <Player
          component={current.component}
          durationInFrames={current.durationInFrames}
          fps={current.fps}
          compositionWidth={current.width}
          compositionHeight={current.height}
          autoPlay
          loop
          controls
          style={playerStyle}
        />
      </div>

      {/* Composition info badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          `${current.width}×${current.height}`,
          `${current.fps} fps`,
          `${(current.durationInFrames / current.fps).toFixed(1)}s`,
        ].map((label) => (
          <span
            key={label}
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              padding: "3px 8px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#64748b",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Inline code — only for animation-via-remotion (multi-composition reference) */}
      {codeEntry && compositions.length > 1 && (
        <div className="rounded-xl border border-white/8 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
            <span className="font-mono">{codeEntry.file}</span>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            >
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
          <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg bg-slate-900/70 p-4 text-xs text-slate-200">
            <code>{codeEntry.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
