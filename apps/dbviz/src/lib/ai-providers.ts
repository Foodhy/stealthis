// ─── Multi-provider AI client ────────────────────────────────────────────────
// Supports Ollama (local), OpenAI, Claude (Anthropic), and Gemini (Google).
// All providers normalize to the same ChatMessage / ChatOptions interface.

export type AiProvider = "ollama" | "openai" | "claude" | "gemini";

export type AiProviderConfig = {
  provider: AiProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiModel = {
  id: string;
  name: string;
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
    label: "Ollama (local)",
  },
  openai: {
    baseUrl: "https://api.openai.com",
    keyUrl: "https://platform.openai.com/api-keys",
    label: "OpenAI",
  },
  claude: {
    baseUrl: "https://api.anthropic.com",
    keyUrl: "https://console.anthropic.com/settings/keys",
    label: "Claude (Anthropic)",
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com",
    keyUrl: "https://aistudio.google.com/apikey",
    label: "Gemini (Google)",
  },
};

// ─── List models ─────────────────────────────────────────────────────────────

export async function listModels(
  config: Pick<AiProviderConfig, "provider" | "baseUrl" | "apiKey">
): Promise<AiModel[]> {
  switch (config.provider) {
    case "ollama":
      return listOllamaModels(config.baseUrl);
    case "openai":
      return listOpenAiModels(config.baseUrl, config.apiKey);
    case "claude":
      return listClaudeModels();
    case "gemini":
      return listGeminiModels(config.baseUrl, config.apiKey);
  }
}

async function listOllamaModels(baseUrl: string): Promise<AiModel[]> {
  const res = await fetch(`${baseUrl}/api/tags`);
  if (!res.ok) throw new Error(`Ollama not available (${res.status}). Make sure it's running.`);
  const data = (await res.json()) as { models: Array<{ name: string; size: number }> };
  return (data.models ?? []).map((m) => ({
    id: m.name,
    name: `${m.name} (${(m.size / 1e9).toFixed(1)}G)`,
  }));
}

async function listOpenAiModels(baseUrl: string, apiKey: string): Promise<AiModel[]> {
  const res = await fetch(`${baseUrl}/v1/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`OpenAI error (${res.status}). Check your API key.`);
  const data = (await res.json()) as { data: Array<{ id: string }> };
  const chatModels = (data.data ?? [])
    .filter((m) => m.id.startsWith("gpt-"))
    .sort((a, b) => a.id.localeCompare(b.id));
  return chatModels.map((m) => ({ id: m.id, name: m.id }));
}

function listClaudeModels(): Promise<AiModel[]> {
  // Anthropic doesn't have a public list-models endpoint usable from browser.
  // Return known models.
  return Promise.resolve([
    { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" },
    { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
    { id: "claude-opus-4-6", name: "Claude Opus 4.6" },
  ]);
}

async function listGeminiModels(baseUrl: string, apiKey: string): Promise<AiModel[]> {
  const res = await fetch(`${baseUrl}/v1beta/models?key=${apiKey}`);
  if (!res.ok) throw new Error(`Gemini error (${res.status}). Check your API key.`);
  const data = (await res.json()) as { models: Array<{ name: string; displayName: string }> };
  return (data.models ?? [])
    .filter((m) => m.name.includes("gemini"))
    .map((m) => ({ id: m.name.replace("models/", ""), name: m.displayName }));
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export async function chat({ config, messages, signal, onToken }: ChatOptions): Promise<string> {
  switch (config.provider) {
    case "ollama":
      return ollamaChat(config, messages, signal, onToken);
    case "openai":
      return openaiChat(config, messages, signal, onToken);
    case "claude":
      return claudeChat(config, messages, signal, onToken);
    case "gemini":
      return geminiChat(config, messages, signal, onToken);
  }
}

// ─── Ollama ──────────────────────────────────────────────────────────────────

async function ollamaChat(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  onToken?: (t: string) => void
): Promise<string> {
  const res = await fetch(`${config.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: config.model, messages, stream: true }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama error (${res.status}): ${text || "No response"}`);
  }
  return readNDJsonStream(res, (parsed) => parsed.message?.content ?? "", onToken);
}

// ─── OpenAI ──────────────────────────────────────────────────────────────────

async function openaiChat(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  onToken?: (t: string) => void
): Promise<string> {
  const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ model: config.model, messages, stream: true }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI error (${res.status}): ${text || "No response"}`);
  }
  return readSSEStream(res, onToken);
}

// ─── Claude (Anthropic) ─────────────────────────────────────────────────────

async function claudeChat(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  onToken?: (t: string) => void
): Promise<string> {
  // Anthropic uses a different format: system is separate, messages are user/assistant only
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

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
      max_tokens: 4096,
      system: systemMsg?.content ?? "",
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
  // Gemini uses a different format
  const systemMsg = messages.find((m) => m.role === "system");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const res = await fetch(
    `${config.baseUrl}/v1beta/models/${config.model}:streamGenerateContent?alt=sse&key=${config.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
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

type NdJsonExtractor = (parsed: Record<string, unknown>) => string;

async function readNDJsonStream(
  response: Response,
  extractor: NdJsonExtractor,
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
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        const token = extractor(parsed);
        if (token) {
          full += token;
          onToken?.(token);
        }
      } catch {
        /* skip */
      }
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
        const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
        const token = parsed.choices?.[0]?.delta?.content ?? "";
        if (token) {
          full += token;
          onToken?.(token);
        }
      } catch {
        /* skip */
      }
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
        const parsed = JSON.parse(data) as { type?: string; delta?: { text?: string } };
        if (parsed.type === "content_block_delta") {
          const token = parsed.delta?.text ?? "";
          if (token) {
            full += token;
            onToken?.(token);
          }
        }
      } catch {
        /* skip */
      }
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
        const parsed = JSON.parse(data) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const token = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (token) {
          full += token;
          onToken?.(token);
        }
      } catch {
        /* skip */
      }
    }
  }
  return full;
}
