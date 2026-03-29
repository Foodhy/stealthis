import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/native/button";
import { Input } from "@/components/native/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/native/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/native/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "@/components/icons";
import { useI18n } from "@/i18n";
import { PromptVariable } from "@/services/valuesService";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type Provider = "ollama" | "openai" | "chatgpt" | "claude" | "gemini";

const STORAGE_KEY = "pd_agent_tester_config";

const PROVIDERS: {
  id: Provider;
  label: string;
  baseUrl: string;
  keyUrl: string;
  needsKey: boolean;
}[] = [
  { id: "ollama", label: "Ollama", baseUrl: "http://localhost:11434", keyUrl: "", needsKey: false },
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    keyUrl: "platform.openai.com/api-keys",
    needsKey: true,
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    baseUrl: "https://api.openai.com/v1",
    keyUrl: "platform.openai.com/api-keys",
    needsKey: true,
  },
  {
    id: "claude",
    label: "Claude",
    baseUrl: "https://api.anthropic.com",
    keyUrl: "console.anthropic.com/settings/keys",
    needsKey: true,
  },
  {
    id: "gemini",
    label: "Gemini",
    baseUrl: "https://generativelanguage.googleapis.com",
    keyUrl: "aistudio.google.com/apikey",
    needsKey: true,
  },
];

const STATIC_MODELS: Record<string, string[]> = {
  chatgpt: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o3-mini"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o3-mini"],
  claude: ["claude-sonnet-4-6", "claude-haiku-4-5-20251001", "claude-opus-4-6"],
  gemini: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
};

interface SavedConfig {
  provider: Provider;
  baseUrl: string;
  apiKey: string;
  model: string;
}

const loadConfig = (): SavedConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { provider: "ollama", baseUrl: "http://localhost:11434", apiKey: "", model: "" };
};
const saveConfig = (c: SavedConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
};

interface AgentTesterProps {
  isOpen: boolean;
  onClose: () => void;
  systemTemplate: string;
  variables: PromptVariable[];
}

export const AgentTester: React.FC<AgentTesterProps> = ({
  isOpen,
  onClose,
  systemTemplate,
  variables,
}) => {
  const { toast } = useToast();
  const { t } = useI18n();

  const detectedVariables = React.useMemo(() => {
    const regex = /\{\{(.*?)\}\}/g;
    const seen = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = regex.exec(systemTemplate)) !== null) {
      const key = (match[1] || "").trim();
      if (key) seen.add(key);
    }
    return Array.from(seen);
  }, [systemTemplate]);

  const [config, setConfig] = React.useState<SavedConfig>(loadConfig);
  const [ollamaModels, setOllamaModels] = React.useState<string[]>([]);
  const [showSettings, setShowSettings] = React.useState(false);
  const [messageInput, setMessageInput] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [variableValues, setVariableValues] = React.useState<Record<string, string>>({});
  const abortRef = React.useRef<AbortController | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const updateConfig = (patch: Partial<SavedConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      saveConfig(next);
      return next;
    });
  };

  const providerMeta = PROVIDERS.find((p) => p.id === config.provider) || PROVIDERS[0];
  const isConfigured = config.provider === "ollama" || (config.apiKey && config.model);

  const resolvedSystemPrompt = React.useMemo(() => {
    return detectedVariables.reduce((acc, key) => {
      const value = variableValues[key] ?? "";
      return acc.replace(
        new RegExp(`\\{\\{${key.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, "\\$&")}\\}\\}`, "g"),
        value
      );
    }, systemTemplate);
  }, [detectedVariables, variableValues, systemTemplate]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const loadOllamaModels = React.useCallback(async () => {
    try {
      const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/api/tags`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const list: string[] = Array.isArray(data?.models)
        ? data.models.map((m: any) => m.model || m.name).filter(Boolean)
        : [];
      setOllamaModels(list);
      if (!config.model && list.length) updateConfig({ model: list[0] });
    } catch (err: any) {
      toast({
        title: "Ollama",
        description: err?.message || "Cannot connect",
        variant: "destructive",
      });
    }
  }, [config.model, config.baseUrl, toast]);

  React.useEffect(() => {
    if (isOpen && config.provider === "ollama") loadOllamaModels();
  }, [isOpen, config.provider, loadOllamaModels]);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSending(false);
  };

  const getModelList = (): string[] => {
    if (config.provider === "ollama") return ollamaModels;
    return STATIC_MODELS[config.provider] || [];
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    const currentModel = config.model.trim();
    if (!currentModel) {
      toast({ title: "Error", description: "Select a model first", variant: "destructive" });
      return;
    }
    if (providerMeta.needsKey && !config.apiKey) {
      setShowSettings(true);
      return;
    }

    const nextMessages: ChatMessage[] = [
      { role: "system", content: resolvedSystemPrompt },
      ...messages,
      { role: "user", content: messageInput },
    ];
    setMessages((prev) => [...prev, { role: "user", content: messageInput }]);
    setMessageInput("");
    setIsSending(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let reply = "";
      if (config.provider === "ollama") {
        const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model: currentModel,
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
            stream: false,
          }),
        });
        if (!res.ok) throw new Error("Ollama error");
        const data = await res.json();
        reply = data?.message?.content || data?.response || "";
      } else if (config.provider === "claude") {
        const systemMsg = nextMessages.find((m) => m.role === "system");
        const chatMsgs = nextMessages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content }));
        const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/v1/messages`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: currentModel,
            max_tokens: 4096,
            system: systemMsg?.content || "",
            messages: chatMsgs,
          }),
        });
        const data = await res.json().catch(() => undefined);
        if (!res.ok) throw new Error(data?.error?.message || "Claude error");
        reply = data?.content?.[0]?.text || "";
      } else if (config.provider === "gemini") {
        const systemMsg = nextMessages.find((m) => m.role === "system");
        const contents = nextMessages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));
        const res = await fetch(
          `${config.baseUrl.replace(/\/$/, "")}/v1beta/models/${currentModel}:generateContent?key=${config.apiKey}`,
          {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
            }),
          }
        );
        const data = await res.json().catch(() => undefined);
        if (!res.ok) throw new Error(data?.error?.message || "Gemini error");
        reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        const url = `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;
        const res = await fetch(url, {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
          body: JSON.stringify({
            model: currentModel,
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
            temperature: 1,
          }),
        });
        const data = await res.json().catch(() => undefined);
        if (!res.ok) throw new Error(data?.error?.message || "API error");
        reply = data?.choices?.[0]?.message?.content || "";
      }
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setMessages((prev) => [...prev, { role: "assistant", content: "(stopped)" }]);
      } else {
        toast({
          title: "Error",
          description: err?.message || "Failed to send",
          variant: "destructive",
        });
      }
    } finally {
      setIsSending(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isSending) sendMessage();
    }
  };

  const modelList = getModelList();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Override DialogContent completely to avoid default padding/gap */}
      <div className="relative z-50 w-[92vw] max-w-5xl h-[82vh] flex flex-col border bg-background shadow-lg rounded-lg overflow-hidden">
        {/* Header — compact single row */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-border shrink-0 bg-card/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{t("agentTester.title")}</span>
            <div className="h-3.5 w-px bg-border" />
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1 rounded bg-background/50 px-2 py-0.5 text-[11px] hover:bg-accent transition-colors"
            >
              <span className="font-medium">{providerMeta.label}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground truncate max-w-[120px]">
                {config.model || "no model"}
              </span>
            </button>
            {isConfigured ? (
              <span className="text-[10px] text-green-400">Connected</span>
            ) : (
              <button
                onClick={() => setShowSettings(true)}
                className="text-[10px] text-amber-400 hover:underline"
              >
                Configure
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(true)}
              className="p-1 rounded hover:bg-accent transition-colors"
              title="Settings"
            >
              <svg
                className="h-3.5 w-3.5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button
              onClick={() => {
                setMessages([]);
                setMessageInput("");
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-accent transition-colors"
            >
              {t("agentTester.reset")}
            </button>
            <button
              onClick={() => onClose(false)}
              className="ml-1 p-1 rounded hover:bg-accent transition-colors"
              title="Close"
            >
              <svg
                className="h-3.5 w-3.5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat + variables */}
        <div className="flex flex-1 min-h-0">
          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            <ScrollArea className="flex-1">
              <div className="px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                    {t("agentTester.startConversation")}
                  </div>
                )}
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-2xl px-3 py-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t("agentTester.agentResponding")}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="px-3 py-2 border-t border-border shrink-0">
              <div className="flex items-end gap-2">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("agentTester.messagePlaceholder")}
                  className="flex-1 min-h-[36px] max-h-[80px] resize-none text-sm"
                  rows={1}
                />
                {isSending ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStop}
                    className="h-8 px-3 gap-1 text-xs shrink-0"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    Stop
                  </Button>
                ) : (
                  <Button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    size="sm"
                    className="h-8 px-3 gap-1 text-xs shrink-0"
                  >
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    {t("agentTester.send")}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Variables sidebar */}
          {detectedVariables.length > 0 && (
            <div className="w-52 border-l border-border shrink-0 flex flex-col">
              <div className="px-3 py-1.5 border-b border-border/50 text-[11px] font-medium">
                {t("agentTester.variablesTitle")}
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {detectedVariables.map((name) => (
                    <div key={name} className="space-y-0.5">
                      <label className="text-[10px] font-medium text-muted-foreground">{`{{${name}}}`}</label>
                      <Input
                        className="h-7 text-xs"
                        value={variableValues[name] ?? ""}
                        onChange={(e) =>
                          setVariableValues((prev) => ({ ...prev, [name]: e.target.value }))
                        }
                        placeholder={name}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Settings modal overlay */}
        {showSettings && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/50"
            onClick={() => setShowSettings(false)}
          >
            <div
              className="w-full max-w-sm rounded-xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <h2 className="text-sm font-medium">Provider Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 p-4">
                {/* Provider tabs */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                    Provider
                  </label>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          const models = STATIC_MODELS[p.id];
                          updateConfig({
                            provider: p.id,
                            baseUrl: p.baseUrl,
                            model: models ? models[0] : "",
                            apiKey: p.needsKey ? config.apiKey : "",
                          });
                          if (p.id === "ollama") setTimeout(() => loadOllamaModels(), 100);
                        }}
                        className={`flex-1 px-1.5 py-1.5 text-[11px] font-medium transition-colors ${config.provider === p.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Base URL */}
                {config.provider !== "chatgpt" && (
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                      Base URL
                    </label>
                    <input
                      value={config.baseUrl}
                      onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                      placeholder={providerMeta.baseUrl}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                    />
                  </div>
                )}

                {/* API Key */}
                {providerMeta.needsKey && (
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                      API Key
                    </label>
                    <input
                      value={config.apiKey}
                      onChange={(e) => updateConfig({ apiKey: e.target.value })}
                      placeholder={
                        config.provider === "claude"
                          ? "sk-ant-..."
                          : config.provider === "gemini"
                            ? "AI..."
                            : "sk-..."
                      }
                      type="password"
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                    />
                    {providerMeta.keyUrl && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Get your key at{" "}
                        <span className="text-foreground/70">{providerMeta.keyUrl}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Model selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Model</label>
                    {config.provider === "ollama" && (
                      <button
                        onClick={loadOllamaModels}
                        className="text-[10px] text-primary hover:underline"
                      >
                        Refresh models
                      </button>
                    )}
                  </div>
                  {modelList.length > 0 ? (
                    <Select value={config.model} onValueChange={(v) => updateConfig({ model: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {modelList.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <input
                      value={config.model}
                      onChange={(e) => updateConfig({ model: e.target.value })}
                      placeholder="model name"
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                    />
                  )}
                </div>

                {config.provider === "ollama" && (
                  <p className="text-[10px] text-muted-foreground">
                    Ollama runs locally — no API key needed.
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Settings are stored in localStorage.
                </p>
              </div>

              <div className="flex items-center justify-end border-t border-border px-4 py-2.5">
                <Button size="sm" className="h-7 text-xs" onClick={() => setShowSettings(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default AgentTester;
