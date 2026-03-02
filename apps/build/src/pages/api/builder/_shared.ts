import {
  BuilderProjectSchema,
  type BuilderProjectV1,
  type BuilderProvider,
} from "../../../lib/builder/contracts";

export interface ParsedBuilderPayload {
  project: BuilderProjectV1;
  llm: {
    provider: BuilderProvider;
    model: string;
    apiKey?: string;
  };
}

function asBuilderProvider(value: unknown): BuilderProvider {
  if (value === "openai" || value === "anthropic" || value === "google" || value === "none") {
    return value;
  }

  return "none";
}

export function parsePayloadFromBody(body: unknown): ParsedBuilderPayload {
  const typedBody = body as {
    project?: unknown;
    llm?: {
      provider?: unknown;
      model?: unknown;
      apiKey?: unknown;
    };
  };

  const project = BuilderProjectSchema.parse(typedBody.project);

  return {
    project,
    llm: {
      provider: asBuilderProvider(typedBody.llm?.provider),
      model: typeof typedBody.llm?.model === "string" ? typedBody.llm.model : "",
      apiKey: typeof typedBody.llm?.apiKey === "string" ? typedBody.llm.apiKey : undefined,
    },
  };
}

export async function parsePayload(request: Request): Promise<ParsedBuilderPayload> {
  const body = (await request.json()) as unknown;
  return parsePayloadFromBody(body);
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
