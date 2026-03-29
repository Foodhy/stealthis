import {
  StyleForgeDraftSchema,
  StyleForgeProviderSchema,
  StyleForgeSelectionSchema,
  type StyleForgeProvider,
} from "@stealthis/schema/styleforge";
import { z } from "zod";

const LLMRequestSchema = z.object({
  provider: StyleForgeProviderSchema.default("none"),
  model: z.string().default(""),
  apiKey: z.string().optional(),
});

const DraftRequestSchema = z.object({
  selection: StyleForgeSelectionSchema,
  llm: LLMRequestSchema.default({ provider: "none", model: "" }),
});

const FinalizeRequestSchema = z.object({
  selection: StyleForgeSelectionSchema,
  draft: StyleForgeDraftSchema,
});

export interface StyleForgeLLMPayload {
  provider: StyleForgeProvider;
  model: string;
  apiKey?: string;
}

export async function parseJsonRequestBody(request: Request): Promise<unknown> {
  const raw = await request.text();
  if (!raw.trim()) {
    throw new Error("Request body is empty.");
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON body: ${reason}`);
  }
}

export function parseDraftBody(body: unknown): {
  selection: z.infer<typeof StyleForgeSelectionSchema>;
  llm: StyleForgeLLMPayload;
} {
  const parsed = DraftRequestSchema.parse(body);

  return {
    selection: parsed.selection,
    llm: {
      provider: parsed.llm.provider,
      model: parsed.llm.model,
      apiKey: parsed.llm.apiKey,
    },
  };
}

export function parseFinalizeBody(body: unknown): {
  selection: z.infer<typeof StyleForgeSelectionSchema>;
  draft: z.infer<typeof StyleForgeDraftSchema>;
} {
  return FinalizeRequestSchema.parse(body);
}

export function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export function jsonError(error: unknown, status = 400): Response {
  const message = error instanceof Error ? error.message : String(error);
  return jsonResponse({ error: message }, status);
}
