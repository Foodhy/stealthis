import { useCallback, useEffect, useRef, useState } from "react";
import { type AiProviderConfig, type ChatMessage, chat as providerChat } from "../lib/ai-providers";
import { useTranslations, type Locale } from "../i18n";
import { renderMarkdown } from "../lib/markdown";

const HELP_SYSTEM_PROMPT = `You are the DbViz Help Assistant — a bilingual (English/Spanish) guide for the DbViz platform.
Respond in the same language the user writes in. If they write in Spanish, answer in Spanish. If in English, answer in English.

## What is DbViz?
DbViz is an AI-powered database schema designer and SQL workbench that runs entirely in the browser using PGlite (PostgreSQL in WebAssembly). Users can design database schemas, generate SQL, run queries, and visualize their database — all without a server.

## Features you should explain:

### Left Panel — AI Chat
- **Ask mode**: Ask questions about database design, SQL, or get advice. The AI answers without generating schema.
- **Plan mode**: Describe what you want to build. The AI asks clarifying questions, then creates a plan before generating.
- **Execute mode**: The AI directly generates/modifies the schema SQL based on your prompt.
- **Architecture mode**: Generates a complete schema from a description (tables, relationships, constraints).
- Users can describe their project (e.g., "a Stripe-like billing system") and the AI designs the full schema.

### Right Panel — Workspace Tabs
- **Diagram**: Visual ER diagram of the schema (auto-generated from SQL using Mermaid). Interactive, zoomable.
- **Schema**: The SQL DDL (CREATE TABLE statements). Editable with syntax highlighting. This is the source of truth.
- **Seed**: INSERT statements to populate tables with sample data. Editable.
- **Queries**: SQL queries to test against the schema. Editable.
- **Migrations**: Shows migration history — what changed between schema versions.
- **Results**: Query execution results displayed as tables.

### Header Bar
- **AI indicator**: Shows the active AI model and connection status.
- **Settings**: Configure AI provider (Ollama local, OpenAI, Claude, Gemini). Set API key, base URL, and model.
- **Export / Export all**: Download individual tabs or all artifacts as files.
- **Examples dropdown**: Load pre-built database schemas (e-commerce, blog, SaaS, etc.) to learn from.

### Bottom Bar — SQL Console
- Type SQL queries directly and press Run.
- Results appear in the Results tab.
- The database runs in-browser via PGlite — no server needed.

### Workflow
1. Open Settings → choose a provider → add API key → Load Models → select a model.
2. Use the AI chat to describe your database needs.
3. The AI generates schema SQL in the Schema tab.
4. Click "Run" to apply the schema to the in-browser PostgreSQL.
5. Use Seed tab for test data, Queries tab for testing.
6. View the ER diagram in the Diagram tab.

## Common Questions
- "How do I connect?" → Open Settings (top right), choose a provider, enter API key, click Load Models.
- "Where is my data stored?" → Everything runs in the browser. API keys are in localStorage. No data is sent to any server except the AI provider.
- "Can I export my schema?" → Yes, use Export or Export All buttons in the workspace header.
- "How do I run SQL?" → Type in the SQL console at the bottom and click Run. Or put queries in the Queries tab.
- "Can I use it without AI?" → Yes! You can manually edit the Schema, Seed, and Queries tabs and run SQL directly.`;

type HelpMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

let helpMsgId = 0;

export default function HelpChat({
  aiConfig,
  locale,
}: {
  aiConfig: AiProviderConfig;
  locale: Locale;
}) {
  const t = useTranslations(locale);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!aiConfig.model || !aiConfig.apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: ++helpMsgId,
          role: "assistant",
          content: t("help.configureFirst"),
        },
      ]);
      return;
    }

    const userMsg: HelpMessage = {
      id: ++helpMsgId,
      role: "user",
      content: text,
    };
    const assistantMsg: HelpMessage = {
      id: ++helpMsgId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setLoading(true);

    const history: ChatMessage[] = [
      { role: "system", content: HELP_SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: text },
    ];

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await providerChat({
        config: aiConfig,
        messages: history,
        signal: controller.signal,
        onToken(token) {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") {
              copy[copy.length - 1] = {
                ...last,
                content: last.content + token,
              };
            }
            return copy;
          });
        },
      });
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = {
              ...last,
              content: `Error: ${err?.message ?? "Unknown error"}`,
            };
          }
          return copy;
        });
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, loading, messages, aiConfig]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-violet-500"
        title={t("help.title")}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[480px] w-[380px] flex-col rounded-xl border border-white/[0.08] bg-slate-900 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{t("help.title")}</h3>
          <p className="text-[10px] text-slate-500">{t("help.subtitle")}</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          {t("help.close")}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <div className="space-y-3 py-4">
            <p className="text-center text-xs text-slate-500">{t("help.emptyHint")}</p>
            <div className="space-y-1.5">
              {[t("help.q1"), t("help.q2"), t("help.q3"), t("help.q4")].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => {
                      setInput(q);
                    }, 0);
                  }}
                  className="block w-full rounded-lg border border-white/[0.06] px-3 py-2 text-left text-[11px] text-slate-400 transition-colors hover:border-violet-500/30 hover:text-slate-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2.5 ${msg.role === "user" ? "flex justify-end" : ""}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-violet-500/15 text-slate-200"
                  : "bg-white/[0.06] text-slate-300"
              }`}
            >
              {msg.role === "assistant" && msg.content ? (
                <div
                  className="chat-markdown"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(msg.content),
                  }}
                />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.role === "assistant" && !msg.content && loading && (
                <span className="inline-block animate-pulse text-slate-500">...</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] px-3 py-2.5">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("help.placeholder")}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-white/[0.08] bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500/50"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
          >
            {loading ? "..." : t("help.send")}
          </button>
        </div>
      </div>
    </div>
  );
}
