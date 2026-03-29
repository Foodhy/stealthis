import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkspace } from "../lib/workspace-context";
import { parseAnsi } from "../lib/ansi";

function AnsiLine({ text, className }: { text: string; className: string }) {
  const spans = parseAnsi(text);
  // If all spans have empty styles, render plain
  const isPlain = spans.every((s) => Object.keys(s.style).length === 0);
  if (isPlain) {
    return <div className={`whitespace-pre-wrap break-all leading-5 ${className}`}>{text}</div>;
  }
  return (
    <div className={`whitespace-pre-wrap break-all leading-5 ${className}`}>
      {spans.map((span, i) => (
        <span key={i} style={span.style}>
          {span.text}
        </span>
      ))}
    </div>
  );
}

export default function TerminalPanel() {
  const { state, dispatch } = useWorkspace();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.terminalLines]);

  // Focus input when terminal becomes visible
  useEffect(() => {
    if (state.terminalVisible) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [state.terminalVisible]);

  const killProcess = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    dispatch({ type: "TERMINAL_SET_RUNNING", payload: false });
    dispatch({
      type: "TERMINAL_ADD_LINE",
      payload: { type: "info", text: "^C Process killed" },
    });
  }, [dispatch]);

  const runCommand = useCallback(
    async (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      // If running, Ctrl+C should kill — not start a new command
      if (state.terminalRunning) {
        killProcess();
        return;
      }

      setHistory((h) => [...h, trimmed]);
      setHistoryIdx(-1);

      dispatch({
        type: "TERMINAL_ADD_LINE",
        payload: { type: "stdin", text: `$ ${trimmed}` },
      });
      dispatch({ type: "TERMINAL_SET_RUNNING", payload: true });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/shell", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command: trimmed,
            cwd: state.terminalCwd || state.projectPath || undefined,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          dispatch({
            type: "TERMINAL_ADD_LINE",
            payload: { type: "stderr", text: `Error: ${text}` },
          });
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE lines
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (!raw) continue;
            try {
              const parsed = JSON.parse(raw) as
                | { type: "stdout" | "stderr"; data: string }
                | { type: "exit"; code: number }
                | { type: "cwd"; data: string };

              if (parsed.type === "stdout") {
                dispatch({
                  type: "TERMINAL_ADD_LINE",
                  payload: { type: "stdout", text: parsed.data },
                });
              } else if (parsed.type === "stderr") {
                dispatch({
                  type: "TERMINAL_ADD_LINE",
                  payload: { type: "stderr", text: parsed.data },
                });
              } else if (parsed.type === "cwd") {
                dispatch({ type: "TERMINAL_SET_CWD", payload: parsed.data });
              } else if (parsed.type === "exit" && parsed.code !== 0) {
                dispatch({
                  type: "TERMINAL_ADD_LINE",
                  payload: {
                    type: "info",
                    text: `Process exited with code ${parsed.code}`,
                  },
                });
              }
            } catch {
              // skip malformed
            }
          }
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          dispatch({
            type: "TERMINAL_ADD_LINE",
            payload: {
              type: "stderr",
              text: `Failed: ${err?.message ?? "Unknown error"}`,
            },
          });
        }
      } finally {
        dispatch({ type: "TERMINAL_SET_RUNNING", payload: false });
        abortRef.current = null;
      }
    },
    [state.terminalRunning, state.terminalCwd, state.projectPath, dispatch, killProcess]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (state.terminalRunning) return;
      runCommand(input);
      setInput("");
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      killProcess();
    } else if (e.key === "ArrowUp" && !state.terminalRunning) {
      e.preventDefault();
      if (history.length > 0) {
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "ArrowDown" && !state.terminalRunning) {
      e.preventDefault();
      if (historyIdx >= 0) {
        const idx = historyIdx + 1;
        if (idx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(idx);
          setInput(history[idx]);
        }
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      dispatch({ type: "TERMINAL_CLEAR" });
    }
  };

  const lineColor = (type: string) => {
    switch (type) {
      case "stdin":
        return "text-vibe-400";
      case "stderr":
        return "text-red-400";
      case "info":
        return "text-slate-500 italic";
      default:
        return "text-slate-300";
    }
  };

  const cwd = state.terminalCwd ? state.terminalCwd.split("/").slice(-2).join("/") : "~";

  return (
    <div className="flex h-full flex-col bg-slate-950 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-3 py-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Terminal
          </span>
          {state.terminalRunning && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-vibe-400" />
              <span className="text-[10px] text-vibe-400">Running</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {state.terminalRunning && (
            <button
              onClick={killProcess}
              className="rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400 transition-colors hover:bg-red-500/20"
              title="Kill process (Ctrl+C)"
            >
              Kill
            </button>
          )}
          <button
            onClick={() => dispatch({ type: "TERMINAL_CLEAR" })}
            className="rounded px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-white/6 hover:text-slate-300"
          >
            Clear
          </button>
          <button
            onClick={() => dispatch({ type: "TERMINAL_SET_VISIBLE", payload: false })}
            className="rounded px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-white/6 hover:text-slate-300"
          >
            Hide
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto px-3 py-2" onClick={() => inputRef.current?.focus()}>
        {state.terminalLines.map((line, i) => (
          <AnsiLine key={i} text={line.text} className={lineColor(line.type)} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center border-t border-white/6 px-3 py-1.5">
        <span className="mr-2 shrink-0 text-slate-500">{cwd} $</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-slate-200 outline-none placeholder-slate-600"
          placeholder={state.terminalRunning ? "Ctrl+C to kill..." : "Enter command..."}
          autoFocus
        />
        {state.terminalRunning && (
          <button
            onClick={killProcess}
            className="ml-2 shrink-0 text-[10px] text-red-400 hover:text-red-300"
            title="Ctrl+C"
          >
            ^C
          </button>
        )}
      </div>
    </div>
  );
}
