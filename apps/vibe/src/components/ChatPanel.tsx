import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWorkspace } from "../lib/workspace-context";
import { useChat } from "../hooks/useChat";
import { renderMarkdown } from "../lib/markdown";
import { loadProviderConfig, isVisionModel } from "../lib/ai-providers";
import type { ChatImage } from "../lib/types";

type ShellBlock = { type: "shell"; commands: string[] };
type HtmlBlock = { type: "html"; html: string };
type ContentBlock = ShellBlock | HtmlBlock;

/** Split rendered markdown to extract shell code blocks with run buttons */
function splitShellBlocks(rawContent: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const shellRegex = /```(?:bash|sh|shell|zsh)\n([\s\S]*?)```/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = shellRegex.exec(rawContent)) !== null) {
    if (match.index > lastIdx) {
      const before = rawContent.slice(lastIdx, match.index);
      blocks.push({ type: "html", html: renderMarkdown(before) });
    }
    const cmds = match[1]
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    if (cmds.length > 0) {
      blocks.push({ type: "shell", commands: cmds });
    }
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < rawContent.length) {
    const rest = rawContent.slice(lastIdx);
    blocks.push({ type: "html", html: renderMarkdown(rest) });
  }

  if (blocks.length === 0) {
    blocks.push({ type: "html", html: renderMarkdown(rawContent) });
  }

  return blocks;
}

function CommandLine({ command }: { command: string }) {
  const { state, dispatch } = useWorkspace();
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");

  const run = useCallback(async () => {
    setStatus("running");
    dispatch({ type: "TERMINAL_SET_VISIBLE", payload: true });
    dispatch({
      type: "TERMINAL_ADD_LINE",
      payload: { type: "stdin", text: `$ ${command}` },
    });
    dispatch({ type: "TERMINAL_SET_RUNNING", payload: true });

    try {
      const res = await fetch("/api/shell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          cwd: state.terminalCwd || state.projectPath || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        dispatch({
          type: "TERMINAL_ADD_LINE",
          payload: { type: "stderr", text: `Error: ${text}` },
        });
        setStatus("done");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setStatus("done"); return; }
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw) as any;
            if (parsed.type === "stdout") {
              dispatch({ type: "TERMINAL_ADD_LINE", payload: { type: "stdout", text: parsed.data } });
            } else if (parsed.type === "stderr") {
              dispatch({ type: "TERMINAL_ADD_LINE", payload: { type: "stderr", text: parsed.data } });
            } else if (parsed.type === "cwd") {
              dispatch({ type: "TERMINAL_SET_CWD", payload: parsed.data });
            } else if (parsed.type === "exit" && parsed.code !== 0) {
              dispatch({ type: "TERMINAL_ADD_LINE", payload: { type: "info", text: `Process exited with code ${parsed.code}` } });
            }
          } catch {}
        }
      }
    } catch (err: any) {
      dispatch({
        type: "TERMINAL_ADD_LINE",
        payload: { type: "stderr", text: `Failed: ${err?.message ?? "Unknown error"}` },
      });
    } finally {
      dispatch({ type: "TERMINAL_SET_RUNNING", payload: false });
      setStatus("done");
    }
  }, [command, state.terminalCwd, state.projectPath, dispatch]);

  return (
    <div className="flex items-center gap-2 rounded border border-white/8 bg-slate-950 px-2.5 py-1.5">
      <code className="flex-1 font-mono text-[11px] text-vibe-300">$ {command}</code>
      <button
        onClick={run}
        disabled={status === "running"}
        className="shrink-0 rounded bg-vibe-600/30 px-2 py-0.5 text-[10px] font-medium text-vibe-300 transition-colors hover:bg-vibe-600/50 disabled:opacity-40"
      >
        {status === "running" ? "..." : status === "done" ? "Re-run" : "Run"}
      </button>
    </div>
  );
}

function AssistantMessage({ content }: { content: string }) {
  const blocks = useMemo(() => splitShellBlocks(content), [content]);

  return (
    <>
      {blocks.map((block, i) =>
        block.type === "shell" ? (
          <div key={i} className="my-2 flex flex-col gap-1">
            {block.commands.map((cmd, j) => (
              <CommandLine key={j} command={cmd} />
            ))}
          </div>
        ) : (
          <div
            key={i}
            className="chat-markdown"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        ),
      )}
    </>
  );
}

/** Image thumbnail in the input area */
function ImageThumb({ image, onRemove }: { image: ChatImage; onRemove: () => void }) {
  return (
    <div className="group relative inline-block">
      <img
        src={`data:${image.mimeType};base64,${image.data}`}
        alt="Attached"
        className="h-12 w-12 rounded border border-white/8 object-cover"
      />
      <button
        onClick={onRemove}
        className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] text-white group-hover:flex"
      >
        x
      </button>
    </div>
  );
}

/** Image thumbnails shown in user messages */
function MessageImages({ images }: { images: ChatImage[] }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {images.map((img, i) => (
        <img
          key={i}
          src={`data:${img.mimeType};base64,${img.data}`}
          alt="Attached"
          className="h-16 w-16 rounded border border-white/10 object-cover"
        />
      ))}
    </div>
  );
}

export default function ChatPanel() {
  const { state } = useWorkspace();
  const { send, stop } = useChat();
  const [input, setInput] = useState("");
  const [images, setImages] = useState<ChatImage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if current model supports vision
  const hasVision = useMemo(() => {
    const cfg = loadProviderConfig();
    return isVisionModel(cfg.model);
  }, []);

  const hasModel = useMemo(() => {
    const cfg = loadProviderConfig();
    return !!cfg.model;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // Handle Ctrl+V paste for images
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (!hasVision) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            setImages((prev) => [...prev, { mimeType: item.type, data: base64 }]);
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [hasVision],
  );

  // Handle file input for images
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          setImages((prev) => [...prev, { mimeType: file.type, data: base64 }]);
        };
        reader.readAsDataURL(file);
      }
      e.target.value = "";
    },
    [],
  );

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!hasVision) return;
      e.preventDefault();
      const files = e.dataTransfer.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          setImages((prev) => [...prev, { mimeType: file.type, data: base64 }]);
        };
        reader.readAsDataURL(file);
      }
    },
    [hasVision],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() && images.length === 0) return;
    send(input, images.length > 0 ? images : undefined);
    setInput("");
    setImages([]);
  };

  return (
    <div
      className="flex h-full flex-col"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Provider error */}
      {state.providerError && (
        <div className="mx-3 mt-2 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {state.providerError}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {state.messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-xs text-slate-500">
              {state.mode === "plan"
                ? "Describe your project idea to start planning."
                : "Ask the AI to generate code for your project."}
            </p>
          </div>
        )}

        {state.messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 ${msg.role === "user" ? "flex justify-end" : ""}`}
          >
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-vibe-600/20 text-slate-200"
                  : "bg-white/6 text-slate-300"
              }`}
            >
              {msg.role === "assistant" && msg.content ? (
                <AssistantMessage content={msg.content} />
              ) : (
                <pre className="whitespace-pre-wrap font-[inherit]">
                  {msg.content}
                </pre>
              )}
              {msg.role === "user" && msg.images && msg.images.length > 0 && (
                <MessageImages images={msg.images} />
              )}
              {msg.role === "assistant" && !msg.content && state.loading && (
                <span className="inline-block animate-pulse text-slate-500">
                  Thinking...
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/8 px-3 py-2">
        {/* Image previews */}
        {images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {images.map((img, i) => (
              <ImageThumb
                key={i}
                image={img}
                onRemove={() => setImages((prev) => prev.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attach image button */}
          {hasVision && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 rounded-lg border border-white/8 px-2 py-2 text-xs text-slate-400 transition-colors hover:text-slate-200"
                title="Attach image (or Ctrl+V to paste)"
              >
                +img
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              hasModel
                ? state.mode === "plan"
                  ? "Describe what you want to build..."
                  : "Ask for code generation..."
                : "Select a provider and model to start..."
            }
            disabled={!hasModel}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-white/8 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-vibe-500/50"
          />
          {state.loading ? (
            <button
              onClick={stop}
              className="rounded-lg bg-red-600/80 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-500"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={(!input.trim() && images.length === 0) || !hasModel}
              className="rounded-lg bg-vibe-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-vibe-500 disabled:opacity-40"
            >
              Send
            </button>
          )}
        </div>

        {hasVision && (
          <p className="mt-1 text-[9px] text-slate-600">
            Ctrl+V to paste images, or drag & drop
          </p>
        )}
      </div>
    </div>
  );
}
