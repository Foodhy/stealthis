const DEFAULT_BASE_URL = "http://localhost:11434";

export type OllamaModel = {
  name: string;
  size: number;
  modified_at: string;
};

export type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OllamaGenerateOptions = {
  model: string;
  prompt: string;
  baseUrl?: string;
  signal?: AbortSignal;
  onToken?: (token: string) => void;
};

export type OllamaChatOptions = {
  model: string;
  messages: OllamaChatMessage[];
  baseUrl?: string;
  signal?: AbortSignal;
  onToken?: (token: string) => void;
};

export async function listModels(baseUrl = DEFAULT_BASE_URL): Promise<OllamaModel[]> {
  const response = await fetch(`${baseUrl}/api/tags`);
  if (!response.ok) {
    throw new Error(`Ollama not available (${response.status}). Make sure it's running.`);
  }
  const data = (await response.json()) as { models: OllamaModel[] };
  return data.models ?? [];
}

export async function generate({
  model,
  prompt,
  baseUrl = DEFAULT_BASE_URL,
  signal,
  onToken,
}: OllamaGenerateOptions): Promise<string> {
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: true }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Ollama error (${response.status}): ${text || "No response"}`);
  }

  return readStream(response, onToken);
}

export async function chat({
  model,
  messages,
  baseUrl = DEFAULT_BASE_URL,
  signal,
  onToken,
}: OllamaChatOptions): Promise<string> {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Ollama error (${response.status}): ${text || "No response"}`);
  }

  return readStream(response, onToken);
}

async function readStream(response: Response, onToken?: (token: string) => void): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream from Ollama");

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
        const parsed = JSON.parse(trimmed) as {
          response?: string;
          message?: { content?: string };
          done?: boolean;
        };
        const token = parsed.response ?? parsed.message?.content ?? "";
        if (token) {
          full += token;
          onToken?.(token);
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  return full;
}
