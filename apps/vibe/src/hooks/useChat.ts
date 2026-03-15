import { useCallback, useRef } from "react";
import { useWorkspace } from "../lib/workspace-context";
import {
  chat,
  type AiProviderConfig,
  type ChatMessage as AiChatMessage,
  type ImagePart,
  type TextPart,
} from "../lib/ai-providers";
import { parseFilesFromResponse } from "../lib/parse-files";
import { planSystemPrompt, executeSystemPrompt } from "../lib/prompts";
import type { ChatImage } from "../lib/types";

let nextId = 0;
function msgId() {
  return `msg-${++nextId}-${Date.now()}`;
}

async function writeFileToDisk(
  projectPath: string,
  filePath: string,
  content: string,
) {
  try {
    await fetch("/api/write-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectPath, filePath, content }),
    });
  } catch {
    // silent — file is still in-memory state
  }
}

function saveChat(projectId: string, messages: { id: string; role: string; content: string }[]) {
  if (!projectId) return;
  fetch(`/api/projects?action=chat&id=${encodeURIComponent(projectId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  }).catch(() => {});
}

function saveProjectMeta(projectId: string) {
  if (!projectId) return;
  fetch(`/api/projects?id=${encodeURIComponent(projectId)}`)
    .then((r) => r.json())
    .then((data: any) => {
      if (!data.project) return;
      return fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data.project, updatedAt: new Date().toISOString() }),
      });
    })
    .catch(() => {});
}

/** Read the provider config that WorkbenchHeader exposes on window */
function getAiConfig(): AiProviderConfig {
  const cfg = (window as any).__vibeAiConfig;
  if (cfg?.provider && cfg?.model) return cfg as AiProviderConfig;
  return { provider: "ollama", baseUrl: "http://localhost:11434", apiKey: "", model: "" };
}

/** Convert workspace ChatImage[] to ai-providers ImagePart[] */
function imagesToParts(images?: ChatImage[]): ImagePart[] {
  if (!images || images.length === 0) return [];
  return images.map((img) => ({ type: "image", mimeType: img.mimeType, data: img.data }));
}

export function useChat() {
  const { state, dispatch } = useWorkspace();
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string, images?: ChatImage[]) => {
      const trimmed = text.trim();
      const config = getAiConfig();
      if (!trimmed || !config.model || state.loading) return;

      const userMsg = { id: msgId(), role: "user" as const, content: trimmed, images };
      const assistantMsg = { id: msgId(), role: "assistant" as const, content: "" };

      dispatch({ type: "ADD_MESSAGE", payload: userMsg });
      dispatch({ type: "ADD_MESSAGE", payload: assistantMsg });
      dispatch({ type: "SET_LOADING", payload: true });

      const systemPrompt =
        state.mode === "plan"
          ? planSystemPrompt(state.config)
          : executeSystemPrompt(state.config);

      // Build AI message history
      const aiMessages: AiChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...state.messages.map((m) => {
          const imgParts = imagesToParts(m.images);
          if (imgParts.length > 0) {
            const parts: (TextPart | ImagePart)[] = [
              { type: "text", text: m.content },
              ...imgParts,
            ];
            return { role: m.role as "user" | "assistant", content: parts };
          }
          return { role: m.role as "user" | "assistant", content: m.content };
        }),
      ];

      // Add current user message
      const currentImgParts = imagesToParts(images);
      if (currentImgParts.length > 0) {
        aiMessages.push({
          role: "user",
          content: [{ type: "text", text: trimmed }, ...currentImgParts],
        });
      } else {
        aiMessages.push({ role: "user", content: trimmed });
      }

      const controller = new AbortController();
      abortRef.current = controller;

      let fullResponse = "";

      try {
        await chat({
          config,
          messages: aiMessages,
          signal: controller.signal,
          onToken: (token: string) => {
            fullResponse += token;
            dispatch({ type: "APPEND_TO_LAST_ASSISTANT", payload: token });
          },
        });

        // In execute mode, parse file blocks, add to workspace, and write to disk
        if (state.mode === "execute") {
          const parsed = parseFilesFromResponse(fullResponse);
          for (const file of parsed) {
            dispatch({
              type: "UPSERT_FILE",
              payload: { path: file.path, content: file.content, dirty: false },
            });
            if (state.projectPath) {
              await writeFileToDisk(state.projectPath, file.path, file.content);
            }
          }
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          dispatch({
            type: "UPDATE_LAST_ASSISTANT",
            payload: `Error: ${err?.message ?? "Unknown error"}`,
          });
        }
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
        abortRef.current = null;

        // Auto-save chat and project meta
        const allMessages = [
          ...state.messages,
          userMsg,
          { ...assistantMsg, content: fullResponse },
        ];
        saveChat(state.projectId, allMessages);
        saveProjectMeta(state.projectId);
      }
    },
    [state.loading, state.messages, state.mode, state.config, state.projectPath, state.projectId, dispatch],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: "SET_LOADING", payload: false });
  }, [dispatch]);

  return { send, stop, msgId };
}
