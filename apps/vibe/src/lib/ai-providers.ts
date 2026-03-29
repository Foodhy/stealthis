// ─── Multi-provider AI client (ported from dbviz, with vision support) ───────

export type AiProvider = "ollama" | "openai" | "openai-codex" | "claude" | "gemini";

export type AiProviderConfig = {
  provider: AiProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type AiModel = {
  id: string;
  name: string;
  vision: boolean;
};

// Message content can be text or multimodal (text + images)
export type ImagePart = { type: "image"; mimeType: string; data: string }; // base64
export type TextPart = { type: "text"; text: string };
export type MessageContent = string | (TextPart | ImagePart)[];

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: MessageContent;
};

export type ChatOptions = {
  config: AiProviderConfig;
  messages: ChatMessage[];
  signal?: AbortSignal;
  onToken?: (token: string) => void;
};

// ─── Provider defaults ───────────────────────────────────────────────────────

export const PROVIDER_DEFAULTS: Record<
  AiProvider,
  { baseUrl: string; keyUrl: string; label: string }
> = {
  ollama: {
    baseUrl: "http://localhost:11434",
    keyUrl: "",
    label: "Ollama",
  },
  openai: {
    baseUrl: "https://api.openai.com",
    keyUrl: "https://platform.openai.com/api-keys",
    label: "OpenAI",
  },
  "openai-codex": {
    baseUrl: "https://api.openai.com",
    keyUrl: "",
    label: "ChatGPT",
  },
  claude: {
    baseUrl: "https://api.anthropic.com",
    keyUrl: "https://console.anthropic.com/settings/keys",
    label: "Claude",
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com",
    keyUrl: "https://aistudio.google.com/apikey",
    label: "Gemini",
  },
};

// ─── Vision-capable model detection ─────────────────────────────────────────

const VISION_PATTERNS = [
  // Ollama vision models
  /vision/i,
  /llava/i,
  /moondream/i,
  /bakllava/i,
  /cogvlm/i,
  // OpenAI
  /gpt-4o/i,
  /gpt-4-turbo/i,
  /gpt-4-vision/i,
  /gpt-5/i,
  /o1/i,
  /o3/i,
  /o4/i,
  // Claude — all Claude 3+ support vision
  /claude-3/i,
  /claude-sonnet/i,
  /claude-opus/i,
  /claude-haiku/i,
  // Gemini — all support vision
  /gemini/i,
];

export function isVisionModel(modelId: string): boolean {
  return VISION_PATTERNS.some((p) => p.test(modelId));
}

// ─── List models ─────────────────────────────────────────────────────────────

export async function listModels(
  config: Pick<AiProviderConfig, "provider" | "baseUrl" | "apiKey">
): Promise<AiModel[]> {
  switch (config.provider) {
    case "ollama":
      return listOllamaModels(config.baseUrl);
    case "openai":
      return listOpenAiModels(config.baseUrl, config.apiKey);
    case "openai-codex":
      return listCodexModels();
    case "claude":
      return listClaudeModels();
    case "gemini":
      return listGeminiModels(config.baseUrl, config.apiKey);
  }
}

async function listOllamaModels(baseUrl: string): Promise<AiModel[]> {
  const res = await fetch(`${baseUrl}/api/tags`);
  if (!res.ok) throw new Error(`Ollama not available (${res.status})`);
  const data = (await res.json()) as { models: { name: string; size: number }[] };
  return (data.models ?? []).map((m) => ({
    id: m.name,
    name: `${m.name} (${(m.size / 1e9).toFixed(1)}G)`,
    vision: isVisionModel(m.name),
  }));
}

async function listOpenAiModels(baseUrl: string, apiKey: string): Promise<AiModel[]> {
  if (!apiKey) {
    return [
      { id: "gpt-4o", name: "GPT-4o", vision: true },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", vision: true },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", vision: true },
      { id: "o4-mini", name: "o4-mini", vision: true },
    ];
  }
  const res = await fetch(`${baseUrl}/v1/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`OpenAI error (${res.status})`);
  const data = (await res.json()) as { data: { id: string }[] };
  return (data.data ?? [])
    .filter((m) => m.id.startsWith("gpt-") || m.id.startsWith("o"))
    .filter((m) => !m.id.includes("instruct") && !m.id.includes("realtime"))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((m) => ({ id: m.id, name: m.id, vision: isVisionModel(m.id) }));
}

function listClaudeModels(): Promise<AiModel[]> {
  return Promise.resolve([
    { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", vision: true },
    { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", vision: true },
    { id: "claude-opus-4-6", name: "Claude Opus 4.6", vision: true },
  ]);
}

function listCodexModels(): Promise<AiModel[]> {
  return Promise.resolve([
    { id: "gpt-5.4", name: "GPT-5.4", vision: true },
    { id: "gpt-5.3-codex", name: "GPT-5.3-Codex", vision: true },
    { id: "gpt-5.2-codex", name: "GPT-5.2-Codex", vision: true },
    { id: "gpt-5.2", name: "GPT-5.2", vision: true },
    { id: "gpt-5.1-codex-max", name: "GPT-5.1-Codex-Max", vision: true },
    { id: "gpt-5.1-codex-mini", name: "GPT-5.1-Codex-Mini", vision: true },
  ]);
}

async function listGeminiModels(baseUrl: string, apiKey: string): Promise<AiModel[]> {
  if (!apiKey) {
    return [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", vision: true },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", vision: true },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", vision: true },
    ];
  }
  const res = await fetch(`${baseUrl}/v1beta/models?key=${apiKey}`);
  if (!res.ok) throw new Error(`Gemini error (${res.status})`);
  const data = (await res.json()) as { models: { name: string; displayName: string }[] };
  return (data.models ?? [])
    .filter((m) => m.name.includes("gemini"))
    .map((m) => ({
      id: m.name.replace("models/", ""),
      name: m.displayName,
      vision: true,
    }));
}

// ─── Chat (with vision support) ─────────────────────────────────────────────

export async function chat({ config, messages, signal, onToken }: ChatOptions): Promise<string> {
  switch (config.provider) {
    case "ollama":
      return ollamaChat(config, messages, signal, onToken);
    case "openai":
      return openaiChat(config, messages, signal, onToken);
    case "openai-codex":
      return openaiCodexChat(config, messages, signal, onToken);
    case "claude":
      return claudeChat(config, messages, signal, onToken);
    case "gemini":
      return geminiChat(config, messages, signal, onToken);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTextContent(content: MessageContent): string {
  if (typeof content === "string") return content;
  return content
    .filter((p): p is TextPart => p.type === "text")
    .map((p) => p.text)
    .join("\n");
}

function getImageParts(content: MessageContent): ImagePart[] {
  if (typeof content === "string") return [];
  return content.filter((p): p is ImagePart => p.type === "image");
}

// ─── Ollama ──────────────────────────────────────────────────────────────────

async function ollamaChat(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  onToken?: (t: string) => void
): Promise<string> {
  const ollamaMessages = messages.map((m) => {
    const images = getImageParts(m.content);
    const msg: Record<string, unknown> = {
      role: m.role,
      content: getTextContent(m.content),
    };
    if (images.length > 0) {
      msg.images = images.map((img) => img.data); // Ollama expects raw base64
    }
    return msg;
  });

  const res = await fetch(`${config.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: config.model, messages: ollamaMessages, stream: true }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama error (${res.status}): ${text || "No response"}`);
  }
  return readNDJsonStream(res, (p) => (p as any).message?.content ?? "", onToken);
}

// ─── OpenAI ──────────────────────────────────────────────────────────────────

async function openaiChat(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  onToken?: (t: string) => void
): Promise<string> {
  const openaiMessages = messages.map((m) => {
    const images = getImageParts(m.content);
    if (images.length > 0) {
      const parts: unknown[] = [{ type: "text", text: getTextContent(m.content) }];
      for (const img of images) {
        parts.push({
          type: "image_url",
          image_url: { url: `data:${img.mimeType};base64,${img.data}` },
        });
      }
      return { role: m.role, content: parts };
    }
    return { role: m.role, content: getTextContent(m.content) };
  });

  const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ model: config.model, messages: openaiMessages, stream: true }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI error (${res.status}): ${text || "No response"}`);
  }
  return readSSEStream(res, onToken);
}

// ─── OpenAI Codex (via codex CLI subprocess) ────────────────────────────────

async function openaiCodexChat(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  onToken?: (t: string) => void
): Promise<string> {
  // Convert multimodal messages to plain text for the CLI
  const plainMessages = messages.map((m) => ({
    role: m.role,
    content: getTextContent(m.content),
  }));

  const res = await fetch("/api/codex-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: config.model, messages: plainMessages }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Codex error (${res.status}): ${text || "No response"}`);
  }
  return readCodexSSEStream(res, onToken);
}

// ─── Claude ──────────────────────────────────────────────────────────────────

async function claudeChat(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  onToken?: (t: string) => void
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => {
      const images = getImageParts(m.content);
      if (images.length > 0) {
        const content: unknown[] = [];
        for (const img of images) {
          content.push({
            type: "image",
            source: { type: "base64", media_type: img.mimeType, data: img.data },
          });
        }
        content.push({ type: "text", text: getTextContent(m.content) });
        return { role: m.role, content };
      }
      return { role: m.role, content: getTextContent(m.content) };
    });

  const res = await fetch(`${config.baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 8192,
      system: systemMsg ? getTextContent(systemMsg.content) : "",
      messages: chatMessages,
      stream: true,
    }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Claude error (${res.status}): ${text || "No response"}`);
  }
  return readClaudeSSEStream(res, onToken);
}

// ─── Gemini ──────────────────────────────────────────────────────────────────

async function geminiChat(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  onToken?: (t: string) => void
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => {
      const images = getImageParts(m.content);
      const parts: unknown[] = [];
      if (images.length > 0) {
        for (const img of images) {
          parts.push({ inline_data: { mime_type: img.mimeType, data: img.data } });
        }
      }
      parts.push({ text: getTextContent(m.content) });
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts,
      };
    });

  const res = await fetch(
    `${config.baseUrl}/v1beta/models/${config.model}:streamGenerateContent?alt=sse&key=${config.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMsg
          ? { parts: [{ text: getTextContent(systemMsg.content) }] }
          : undefined,
      }),
      signal,
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini error (${res.status}): ${text || "No response"}`);
  }
  return readGeminiSSEStream(res, onToken);
}

// ─── Stream readers ──────────────────────────────────────────────────────────

async function readNDJsonStream(
  response: Response,
  extractor: (parsed: Record<string, unknown>) => string,
  onToken?: (t: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        const token = extractor(parsed);
        if (token) {
          full += token;
          onToken?.(token);
        }
      } catch {}
    }
  }
  return full;
}

async function readSSEStream(response: Response, onToken?: (t: string) => void): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") break;
      try {
        const parsed = JSON.parse(data);
        const token = parsed.choices?.[0]?.delta?.content ?? "";
        if (token) {
          full += token;
          onToken?.(token);
        }
      } catch {}
    }
  }
  return full;
}

async function readClaudeSSEStream(
  response: Response,
  onToken?: (t: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "content_block_delta") {
          const token = parsed.delta?.text ?? "";
          if (token) {
            full += token;
            onToken?.(token);
          }
        }
      } catch {}
    }
  }
  return full;
}

async function readGeminiSSEStream(
  response: Response,
  onToken?: (t: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      try {
        const parsed = JSON.parse(data);
        const token = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (token) {
          full += token;
          onToken?.(token);
        }
      } catch {}
    }
  }
  return full;
}

async function readCodexSSEStream(
  response: Response,
  onToken?: (t: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") break;
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);
        const token = parsed.token ?? "";
        if (token) {
          full += token;
          onToken?.(token);
        }
      } catch (e) {
        if (e instanceof Error && e.message !== data) throw e;
      }
    }
  }
  return full;
}

// ─── LocalStorage persistence ────────────────────────────────────────────────

const STORAGE_KEY = "vibe-ai-provider";

export type StoredProviderConfig = {
  provider: AiProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
};

export function loadProviderConfig(): StoredProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredProviderConfig;
  } catch {}
  return { provider: "ollama", baseUrl: PROVIDER_DEFAULTS.ollama.baseUrl, apiKey: "", model: "" };
}

export function saveProviderConfig(config: StoredProviderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}
